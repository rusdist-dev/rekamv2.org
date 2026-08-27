import * as THREE from 'three';
import { getScene, type PanoScene, type SceneName } from './pano-scenes';

/* ------------------------------------------------------------------
   360-degree panorama hero engine

   Ported from the old site's hero-360.js. The rendering, drag inertia,
   idle drift, connection-aware video loading and visibility gating are
   the original's, kept because they are tuned and work; only the shape
   changed, from a module that reached into the document by id to a class
   that owns one container.

   Deliberately NOT React Three Fiber. Rewriting 560 lines of working
   behaviour to be idiomatic would be risk without return.

   A <video> painted straight into the page shows the raw equirectangular
   frame — stretched poles, bent horizon. Instead it becomes a texture on a
   sphere whose geometry is flipped inside-out with the camera at the centre,
   which undoes the projection so the footage reads correctly in every
   direction while the DOM overlay stays flat on top.

   With no footage the sphere gets a procedural scene painted in the same
   layout. It is transparent where the backdrop should show and sits inside
   two more shells — an opaque sky and a slowly rotating drift layer — so the
   backdrop moves through the gaps instead of being flattened into one image.
   ------------------------------------------------------------------ */

const SPHERE_RADIUS = 500;
// Clamped well short of the poles. Equirectangular detail collapses to a point
// there, and a capped pole filling the frame is nothing to look at.
const MIN_LAT = -72;
const MAX_LAT = 72;
const DRAG_SPEED = 0.13; // degrees per pixel at the default fov
const INERTIA_DECAY = 0.93;
const IDLE_DELAY = 4000; // ms of no input before the drift resumes
const DRIFT_SPEED = 0.6; // degrees per second, once fully faded in
const DRIFT_FADE = 3000; // ms to reach that speed, so it never snaps on
const LOAD_TIMEOUT = 8000;

/* Every string the engine can put on screen, supplied by the caller.
 *
 * These used to be Indonesian literals in here, which made the engine
 * untranslatable without editing it. Passing them in keeps the engine a
 * rendering concern and puts the copy where the rest of the copy lives — see
 * dictionary.ts, which also explains why the per-scene loader lines could not
 * simply be translated inside pano-scenes.js. */
export type PanoStrings = {
  /** Shown while the texture is being decided, per scene. */
  loading: string;
  webglUnsupported: string;
  saveData: string;
  slowConnection: (effectiveType: string) => string;
  /** src is the file the page actually asked for, not a hardcoded guess. */
  noFootage: (src: string) => string;
};

export type Pano360Options = {
  scene: SceneName;
  /** Optional: when absent or sourceless, the procedural scene is used. */
  video?: HTMLVideoElement | null;
  /** Optional: a static equirectangular image used in place of the procedural
   *  scene whenever there is no usable video. Takes priority over `scene`'s
   *  canvas painter, but the scene's particle sprites still play over it. */
  image?: string;
  /** Camera field of view in degrees. Wider pulls the view back so less of the
   *  source image fills the frame. Defaults to 74. */
  fov?: number;
  strings: PanoStrings;
  /** Loader copy. null hides the loader. */
  onStatus: (text: string | null) => void;
  /** False once it is settled that there is no footage, so play/mute can go. */
  onVideoUsable: (usable: boolean) => void;
  /** First drag or arrow key, so the "drag to look around" hint can retire. */
  onFirstInteraction: () => void;
};

export class Pano360 {
  private stage: HTMLElement;
  private opts: Pano360Options;
  private look: PanoScene;
  private reduced: boolean;

  private renderer!: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera!: THREE.PerspectiveCamera;
  private material!: THREE.MeshBasicMaterial;
  private shells: THREE.Mesh[] = [];
  private fireflies: THREE.Points | null = null;
  private clouds: THREE.Mesh | null = null;

  private lon = 0;
  private lat = 0;
  private velocityLon = 0;
  private velocityLat = 0;
  private dragging = false;
  private pointerId: number | null = null;
  private lastX = 0;
  private lastY = 0;
  private lastInteraction = performance.now();
  private interacted = false;
  private recentering: { fromLon: number; fromLat: number; start: number; duration: number } | null = null;

  private frame: number | null = null;
  private lastFrameTime = performance.now();
  private elapsed = 0;
  private visible = true;
  private settled = false;
  private loadTimeout = 0;
  private dead = false;

  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private target = new THREE.Vector3();
  private disposables: { dispose(): void }[] = [];
  private cleanups: (() => void)[] = [];

  constructor(stage: HTMLElement, opts: Pano360Options) {
    this.stage = stage;
    this.opts = opts;
    this.look = getScene(opts.scene);
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    opts.onStatus(opts.strings.loading);

    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch (err) {
      opts.onStatus(opts.strings.webglUnsupported);
      throw err;
    }

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    stage.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      opts.fov ?? 74,
      stage.clientWidth / stage.clientHeight || 1,
      0.1,
      1100
    );
    this.camera.position.set(0, 0, 0);

    // A sphere seen from the inside: negating one axis flips the winding so the
    // inward faces are the ones drawn, and un-mirrors the video.
    const geometry = new THREE.SphereGeometry(SPHERE_RADIUS, 64, 40);
    geometry.scale(-1, 1, 1);
    this.disposables.push(geometry);

    this.material = new THREE.MeshBasicMaterial({ map: null });
    this.disposables.push(this.material);
    this.scene.add(new THREE.Mesh(geometry, this.material));

    this.bindLook();
    this.bindVideo();
    this.observe();
    this.start();
  }

  /* ---- texture: video if there is any, procedural otherwise ---- */

  private shell(radius: number, texture: THREE.Texture, opts: THREE.MeshBasicMaterialParameters = {}) {
    const geo = new THREE.SphereGeometry(radius, 48, 32);
    geo.scale(-1, 1, 1);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    const mat = new THREE.MeshBasicMaterial({ map: texture, ...opts });
    const mesh = new THREE.Mesh(geo, mat);
    this.scene.add(mesh);
    this.shells.push(mesh);
    this.disposables.push(geo, mat, texture);
    return mesh;
  }

  private attachVideoTexture(video: HTMLVideoElement) {
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    // Equirectangular frames wrap seamlessly left-to-right but not vertically.
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.disposables.push(texture);

    this.material.map = texture;
    this.material.needsUpdate = true;
    this.opts.onVideoUsable(true);
    this.reveal();
  }

  // Painted at 2:1 so it lands on the sphere with the same geometry as real
  // footage — a place you stand in, not a stretched frame.
  private attachSceneTexture(message?: string) {
    const texture = new THREE.CanvasTexture(this.look.scene(4096));
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.disposables.push(texture);

    this.material.map = texture;
    // Above the horizon the scene layer is mostly holes; the shells behind it
    // supply the sky. Depth writes off so ordering stays back-to-front.
    this.material.transparent = true;
    this.material.depthWrite = false;
    this.material.needsUpdate = true;

    // Furthest out first, so each is behind the last.
    this.shell(SPHERE_RADIUS + 40, new THREE.CanvasTexture(this.look.sky(2048)));
    this.clouds = this.shell(SPHERE_RADIUS + 20, new THREE.CanvasTexture(this.look.drift(2048)), {
      transparent: true,
      depthWrite: false,
      opacity: this.look.driftOpacity,
    });
    this.addParticles();

    // Nothing to play or mute without footage.
    this.opts.onVideoUsable(false);
    this.reveal(message);
  }

  // A static image standing in for the procedural scene — same sphere, same
  // particle sprites, just a photo/illustration instead of painted canvas.
  private attachImageTexture(src: string, message?: string) {
    new THREE.TextureLoader().load(
      src,
      (texture) => {
        if (this.dead) return;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        this.disposables.push(texture);

        this.material.map = texture;
        this.material.transparent = false;
        this.material.depthWrite = true;
        this.material.needsUpdate = true;

        this.addParticles();
        this.opts.onVideoUsable(false);
        this.reveal(message);
      },
      undefined,
      () => {
        if (this.dead) return;
        this.attachSceneTexture(message);
      }
    );
  }

  // Points rather than texture animation, so they stay crisp and cost nothing
  // but a small buffer update each frame.
  private addParticles() {
    const count = this.look.particleCount;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 3);
    const [tr, tg, tb] = this.look.particleTint;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      // Kept well off the camera — anything closer renders as a fat blob
      // rather than a point of light.
      const radius = 180 + Math.random() * 240;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = -110 + Math.random() * 190;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      seeds[i * 3] = Math.random() * Math.PI * 2; // phase
      seeds[i * 3 + 1] = 0.3 + Math.random() * 0.9; // speed
      seeds[i * 3 + 2] = 8 + Math.random() * 26; // travel
      // Mid-brightness, so they still look right if reduced motion stops the
      // twinkle from ever running.
      colors[i * 3] = 0.45 * tr;
      colors[i * 3 + 1] = 0.45 * tg;
      colors[i * 3 + 2] = 0.45 * tb;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const sprite = new THREE.CanvasTexture(this.look.particle(64));
    sprite.colorSpace = THREE.SRGBColorSpace;

    const mat = new THREE.PointsMaterial({
      size: this.look.particleSize,
      map: sprite,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    this.fireflies = new THREE.Points(geo, mat);
    this.fireflies.userData = { seeds, home: positions.slice() };
    this.scene.add(this.fireflies);
    this.disposables.push(geo, mat, sprite);
  }

  private animateScene(elapsed: number) {
    if (this.clouds) this.clouds.rotation.y = elapsed * this.look.driftSpeed;
    if (!this.fireflies) return;

    const { seeds, home } = this.fireflies.userData as { seeds: Float32Array; home: Float32Array };
    const pos = this.fireflies.geometry.attributes.position as THREE.BufferAttribute;
    const col = this.fireflies.geometry.attributes.color as THREE.BufferAttribute;
    const [tr, tg, tb] = this.look.particleTint;

    for (let i = 0; i < pos.count; i++) {
      const phase = seeds[i * 3];
      const speed = seeds[i * 3 + 1];
      const travel = seeds[i * 3 + 2];
      const t = elapsed * speed + phase;
      (pos.array as Float32Array)[i * 3] = home[i * 3] + Math.sin(t) * travel;
      (pos.array as Float32Array)[i * 3 + 1] = home[i * 3 + 1] + Math.sin(t * 0.7 + 1.3) * travel * 0.6;
      (pos.array as Float32Array)[i * 3 + 2] = home[i * 3 + 2] + Math.cos(t * 0.85) * travel;
      // Additive blending turns brightness into a twinkle.
      const glow = 0.12 + 0.5 * Math.pow(0.5 + 0.5 * Math.sin(t * 1.9 + phase), 2);
      (col.array as Float32Array)[i * 3] = glow * tr;
      (col.array as Float32Array)[i * 3 + 1] = glow * tg;
      (col.array as Float32Array)[i * 3 + 2] = glow * tb;
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
  }

  private reveal(message?: string) {
    if (message) {
      this.opts.onStatus(message);
      const id = window.setTimeout(() => this.opts.onStatus(null), 1600);
      this.cleanups.push(() => window.clearTimeout(id));
    } else {
      this.opts.onStatus(null);
    }
  }

  /* ---- video lifecycle ---- */

  private useVideo(video: HTMLVideoElement) {
    if (this.settled) return;
    this.settled = true;
    window.clearTimeout(this.loadTimeout);
    this.attachVideoTexture(video);
  }

  private useScene(message?: string) {
    if (this.settled) return;
    this.settled = true;
    window.clearTimeout(this.loadTimeout);
    this.attachSceneTexture(message);
  }

  private useImage(src: string, message?: string) {
    if (this.settled) return;
    this.settled = true;
    window.clearTimeout(this.loadTimeout);
    this.attachImageTexture(src, message);
  }

  /** Whatever stands in for footage: the static image if one was given, the
   *  procedural scene otherwise. */
  private useFallback(message?: string) {
    if (this.opts.image) this.useImage(this.opts.image, message);
    else this.useScene(message);
  }

  /* Decide whether to fetch footage at all. The markup carries preload="none",
     so nothing has been requested yet and this is a real choice rather than a
     cancellation — on a metered or slow connection the procedural panorama
     costs zero bytes and is the better answer. Chromium and most Android
     browsers expose this; Safari and Firefox do not, and there the video simply
     loads as before. */
  private connectionSaysNo(): string | false {
    type NetInfo = { saveData?: boolean; effectiveType?: string };
    const nav = navigator as Navigator & {
      connection?: NetInfo;
      mozConnection?: NetInfo;
      webkitConnection?: NetInfo;
    };
    const c = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (!c) return false;
    if (c.saveData) return this.opts.strings.saveData;
    if (['slow-2g', '2g', '3g'].includes(c.effectiveType ?? '')) {
      return this.opts.strings.slowConnection(c.effectiveType ?? '');
    }
    return false;
  }

  private bindVideo() {
    const video = this.opts.video;

    /* A hero with no <source> and no src is procedural BY DESIGN, not broken.
       Nothing else notices that case: networkState reads EMPTY (0) rather than
       NO_SOURCE (3), and with no <source> children there is nothing to raise an
       error — so the timeout used to fire and blame the network for a file that
       was never requested, after holding the spinner up for eight seconds.
       Checked first, and with no message, because nothing failed. */
    if (!video || !(video.querySelector('source') || video.getAttribute('src'))) {
      this.useFallback();
      return;
    }

    // Name the file this page actually asked for. Hardcoding one path reported
    // the wrong filename and sent anyone debugging it to the wrong place.
    const firstSource = video.querySelector('source');
    const noFootage = this.opts.strings.noFootage(
      firstSource?.getAttribute('src') ?? 'video hero'
    );

    const onLoaded = () => this.useVideo(video);
    video.addEventListener('loadeddata', onLoaded, { once: true });
    this.cleanups.push(() => video.removeEventListener('loadeddata', onLoaded));

    // With <source> children the media element itself often stays silent — the
    // error lands on each <source> instead. Only give up once every one fails.
    const sources = [...video.querySelectorAll('source')];
    let failed = 0;
    for (const source of sources) {
      const onErr = () => {
        if (++failed === sources.length) this.useFallback(noFootage);
      };
      source.addEventListener('error', onErr, { once: true });
      this.cleanups.push(() => source.removeEventListener('error', onErr));
    }

    const onVideoError = () =>
      this.useFallback('Video 360° tidak dapat dibaca — menampilkan panorama prosedural.');
    video.addEventListener('error', onVideoError, { once: true });
    this.cleanups.push(() => video.removeEventListener('error', onVideoError));

    const skip = this.connectionSaysNo();
    if (skip) {
      this.useFallback(skip);
      return;
    }

    // Backstop for a network that stalls without ever erroring.
    this.loadTimeout = window.setTimeout(() => {
      this.useFallback('Video 360° terlalu lama dimuat — menampilkan panorama prosedural.');
    }, LOAD_TIMEOUT);

    if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      this.useFallback(noFootage);
    } else if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      this.useVideo(video);
    } else {
      video.load();
    }
  }

  /* ---- look controls: yaw/pitch by pointer drag, with inertia ---- */

  private markInteraction() {
    this.lastInteraction = performance.now();
  }

  private firstInteraction() {
    if (this.interacted) return;
    this.interacted = true;
    this.opts.onFirstInteraction();
  }

  private bindLook() {
    const stage = this.stage;

    const onDown = (event: PointerEvent) => {
      if (!event.isPrimary) return;
      this.dragging = true;
      this.pointerId = event.pointerId;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
      this.velocityLon = 0;
      this.velocityLat = 0;
      stage.setPointerCapture(event.pointerId);
      this.markInteraction();
    };

    const onMove = (event: PointerEvent) => {
      if (!this.dragging || event.pointerId !== this.pointerId) return;
      // Scale with fov so the drag feels the same if the zoom changes.
      const scale = DRAG_SPEED * (this.camera.fov / 74);
      const dLon = -(event.clientX - this.lastX) * scale;
      const dLat = (event.clientY - this.lastY) * scale;

      this.lon += dLon;
      this.lat = THREE.MathUtils.clamp(this.lat + dLat, MIN_LAT, MAX_LAT);
      this.velocityLon = dLon;
      this.velocityLat = dLat;

      this.lastX = event.clientX;
      this.lastY = event.clientY;
      this.markInteraction();
      this.firstInteraction();
    };

    const endDrag = (event: PointerEvent) => {
      if (event.pointerId !== this.pointerId) return;
      this.dragging = false;
      this.pointerId = null;
      this.markInteraction();
    };

    // Keyboard access to the same two axes.
    const onKey = (event: KeyboardEvent) => {
      const step = event.shiftKey ? 12 : 4;
      switch (event.key) {
        case 'ArrowLeft':
          this.lon -= step;
          break;
        case 'ArrowRight':
          this.lon += step;
          break;
        case 'ArrowUp':
          this.lat = THREE.MathUtils.clamp(this.lat + step, MIN_LAT, MAX_LAT);
          break;
        case 'ArrowDown':
          this.lat = THREE.MathUtils.clamp(this.lat - step, MIN_LAT, MAX_LAT);
          break;
        default:
          return;
      }
      event.preventDefault();
      this.markInteraction();
      this.firstInteraction();
    };

    stage.addEventListener('pointerdown', onDown);
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('keydown', onKey);

    this.cleanups.push(() => {
      stage.removeEventListener('pointerdown', onDown);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerup', endDrag);
      stage.removeEventListener('pointercancel', endDrag);
      stage.removeEventListener('keydown', onKey);
    });
  }

  /** Ease the view back to dead centre. */
  recenter() {
    this.recentering = { fromLon: this.lon, fromLat: this.lat, start: performance.now(), duration: 650 };
    this.velocityLon = 0;
    this.velocityLat = 0;
    this.markInteraction();
  }

  /* ---- sizing and visibility ---- */

  private observe() {
    // Fires once on observe, which performs the initial sizing — setSize also
    // writes the canvas's inline CSS size, so it must be driven from here
    // rather than a one-off call before layout has settled.
    this.resizeObserver = new ResizeObserver(() => {
      const { clientWidth: w, clientHeight: h } = this.stage;
      if (!w || !h) return;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setSize(w, h);
    });
    this.resizeObserver.observe(this.stage);

    // Render only while the hero is actually on screen.
    this.intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        this.visible = entry.isIntersecting;
        if (this.visible) this.start();
        else this.stop();
      },
      { threshold: 0.01 }
    );
    this.intersectionObserver.observe(this.stage);

    const onVisibility = () => {
      if (document.hidden) this.stop();
      else if (this.visible) this.start();
    };
    document.addEventListener('visibilitychange', onVisibility);
    this.cleanups.push(() => document.removeEventListener('visibilitychange', onVisibility));
  }

  private start() {
    if (this.frame !== null || this.dead) return;
    this.lastFrameTime = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private stop() {
    if (this.frame === null) return;
    cancelAnimationFrame(this.frame);
    this.frame = null;
  }

  private tick = (now: number) => {
    if (this.dead) return;
    this.frame = requestAnimationFrame(this.tick);
    const delta = Math.min((now - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = now;
    this.elapsed += delta;

    if (!this.reduced) this.animateScene(this.elapsed);

    if (this.recentering) {
      const t = Math.min((now - this.recentering.start) / this.recentering.duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      this.lon = this.recentering.fromLon * (1 - eased);
      this.lat = this.recentering.fromLat * (1 - eased);
      if (t === 1) this.recentering = null;
    } else if (!this.dragging) {
      // Glide out of the last drag…
      if (Math.abs(this.velocityLon) > 0.001 || Math.abs(this.velocityLat) > 0.001) {
        this.lon += this.velocityLon;
        this.lat = THREE.MathUtils.clamp(this.lat + this.velocityLat, MIN_LAT, MAX_LAT);
        this.velocityLon *= INERTIA_DECAY;
        this.velocityLat *= INERTIA_DECAY;
      } else if (!this.reduced) {
        /* …then drift slowly so the hero stays alive while untouched. Eased in
           rather than switched on: going from zero to full speed in a single
           frame is a step change in velocity, and on a dense line drawing where
           every stroke moves at once that reads as a jolt. Smoothstep also means
           the drift leaves and rejoins standstill with zero acceleration, so
           there is no visible kick at either end. */
        const idleFor = now - this.lastInteraction - IDLE_DELAY;
        if (idleFor > 0) {
          const t = Math.min(idleFor / DRIFT_FADE, 1);
          const ramp = t * t * (3 - 2 * t);
          this.lon += DRIFT_SPEED * ramp * delta;
        }
      }
    }

    // Spherical -> cartesian for the look direction.
    const phi = THREE.MathUtils.degToRad(90 - this.lat);
    const theta = THREE.MathUtils.degToRad(this.lon);
    this.target.setFromSphericalCoords(1, phi, theta);
    this.camera.lookAt(this.target);

    this.renderer.render(this.scene, this.camera);
  };

  /* ---- teardown ----
     The original had none, and did not need one: it ran on static pages that
     never unmounted. Under client-side routing that would leak a WebGL context,
     two observers, a visibilitychange listener and a rAF loop on every
     navigation — and browsers cap live WebGL contexts, so the hero would simply
     stop rendering after a handful of page changes. */
  destroy() {
    if (this.dead) return;
    this.dead = true;

    this.stop();
    window.clearTimeout(this.loadTimeout);

    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    for (const off of this.cleanups) off();
    this.cleanups = [];

    for (const d of this.disposables) d.dispose();
    this.disposables = [];

    this.renderer.dispose();
    // Ask the driver to drop the context now rather than at GC time.
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }
}
