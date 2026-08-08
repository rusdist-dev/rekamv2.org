import * as THREE from 'three';
import { getScene } from './pano-scenes.js';

/* ------------------------------------------------------------------
   360° panorama hero

   A <video> element painted straight into the page shows the raw
   equirectangular frame — stretched poles, bent horizon. Instead the
   video is used as a texture on a sphere whose geometry is flipped
   inside-out, with the camera sitting at the centre. That undoes the
   equirectangular projection, so the footage reads correctly in every
   direction while the DOM overlay stays flat on top of the canvas.

   With no footage present the sphere gets a procedural scene painted in
   the same equirectangular layout, chosen with data-scene on #stage
   ("forest" | "ocean" | "urban"). Each scene is transparent where the
   backdrop should show and sits inside two more shells — an opaque sky
   and a slowly rotating drift layer — so the backdrop moves through the
   gaps instead of being flattened into one image. Particles drift nearer
   still.
   ------------------------------------------------------------------ */

const SPHERE_RADIUS = 500;
// Clamped well short of the poles. Equirectangular detail collapses to a
// point there, and a capped pole filling the frame is nothing to look at.
const MIN_LAT = -72;
const MAX_LAT = 72;
const DRAG_SPEED = 0.13;        // degrees per pixel at the default fov
const INERTIA_DECAY = 0.93;
const IDLE_DELAY = 4000;        // ms of no input before the drift resumes
const DRIFT_SPEED = 0.6;        // degrees per second, once fully faded in
const DRIFT_FADE = 3000;        // ms to reach that speed, so it never snaps on

const stage = document.getElementById('stage');
const video = document.getElementById('pano-video');
const loader = document.getElementById('loader');
const loaderText = document.getElementById('loader-text');
const hint = document.getElementById('hint');
const playBtn = document.getElementById('btn-play');
const soundBtn = document.getElementById('btn-sound');
const recenterBtn = document.getElementById('btn-recenter');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Which procedural scene to paint when there is no footage. Named `look`
// so it cannot collide with the THREE.Scene below.
const look = getScene(stage.dataset.scene);
loaderText.textContent = look.loading;

/* ------------------------------------------------------------------
   Renderer / scene
   ------------------------------------------------------------------ */

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
} catch (err) {
  fail('This browser could not start WebGL, so the 360° view is unavailable.');
  throw err;
}

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(74, stage.clientWidth / stage.clientHeight, 0.1, 1100);
camera.position.set(0, 0, 0);

// A sphere seen from the inside: negating one axis flips the winding so
// the inward faces are the ones that get drawn, and un-mirrors the video.
const geometry = new THREE.SphereGeometry(SPHERE_RADIUS, 64, 40);
geometry.scale(-1, 1, 1);

const material = new THREE.MeshBasicMaterial({ map: null });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

/* ------------------------------------------------------------------
   Texture: video if there is any, procedural scene otherwise
   ------------------------------------------------------------------ */

let usingVideo = false;
let sky = null;
let clouds = null;
let fireflies = null;

// Builds one more inside-out shell around the camera.
function shell(radius, texture, opts = {}) {
  const geo = new THREE.SphereGeometry(radius, 48, 32);
  geo.scale(-1, 1, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: texture, ...opts }));
  scene.add(mesh);
  return mesh;
}

function attachVideoTexture() {
  const texture = new THREE.VideoTexture(video);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  // Equirectangular frames wrap seamlessly left-to-right but not vertically.
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  material.map = texture;
  material.needsUpdate = true;
  usingVideo = true;
  reveal();
}

// Painted at 2:1 so it lands on the sphere with the same geometry as real
// equirectangular footage — a place you stand in, not a stretched frame.
function attachSceneTexture(message) {
  const texture = new THREE.CanvasTexture(look.scene(4096));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  material.map = texture;
  // Above the horizon the scene layer is mostly holes; the shells behind
  // it supply the sky. Depth writes off so the ordering stays back-to-front.
  material.transparent = true;
  material.depthWrite = false;
  material.needsUpdate = true;
  usingVideo = false;

  // Furthest out first, so each is behind the last.
  sky = shell(SPHERE_RADIUS + 40, new THREE.CanvasTexture(look.sky(2048)));
  clouds = shell(SPHERE_RADIUS + 20, new THREE.CanvasTexture(look.drift(2048)), {
    transparent: true,
    depthWrite: false,
    opacity: look.driftOpacity,
  });
  addParticles();

  // Nothing to play or mute without footage.
  playBtn.hidden = true;
  soundBtn.hidden = true;
  reveal(message);
}

// Points rather than texture animation, so they stay crisp and cost
// nothing but a small buffer update each frame.
function addParticles() {
  const count = look.particleCount;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    // Kept well off the camera — anything closer renders as a fat blob
    // rather than a point of light.
    const radius = 180 + Math.random() * 240;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = -110 + Math.random() * 190;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
    seeds[i * 3] = Math.random() * Math.PI * 2;       // phase
    seeds[i * 3 + 1] = 0.3 + Math.random() * 0.9;     // speed
    seeds[i * 3 + 2] = 8 + Math.random() * 26;        // travel
    // Mid-brightness, so they still look right if reduced motion stops
    // the twinkle from ever running.
    const [tr, tg, tb] = look.particleTint;
    colors[i * 3] = 0.45 * tr;
    colors[i * 3 + 1] = 0.45 * tg;
    colors[i * 3 + 2] = 0.45 * tb;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const sprite = new THREE.CanvasTexture(look.particle(64));
  sprite.colorSpace = THREE.SRGBColorSpace;

  fireflies = new THREE.Points(geo, new THREE.PointsMaterial({
    size: look.particleSize,
    map: sprite,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  }));
  fireflies.userData = { seeds, home: positions.slice() };
  scene.add(fireflies);
}

function animateScene(elapsed) {
  if (clouds) clouds.rotation.y = elapsed * look.driftSpeed;

  if (fireflies) {
    const { seeds, home } = fireflies.userData;
    const pos = fireflies.geometry.attributes.position;
    const col = fireflies.geometry.attributes.color;
    for (let i = 0; i < pos.count; i++) {
      const phase = seeds[i * 3];
      const speed = seeds[i * 3 + 1];
      const travel = seeds[i * 3 + 2];
      const t = elapsed * speed + phase;
      pos.array[i * 3]     = home[i * 3]     + Math.sin(t) * travel;
      pos.array[i * 3 + 1] = home[i * 3 + 1] + Math.sin(t * 0.7 + 1.3) * travel * 0.6;
      pos.array[i * 3 + 2] = home[i * 3 + 2] + Math.cos(t * 0.85) * travel;
      // Additive blending turns brightness into a twinkle.
      const glow = 0.12 + 0.5 * Math.pow(0.5 + 0.5 * Math.sin(t * 1.9 + phase), 2);
      const [tr, tg, tb] = look.particleTint;
      col.array[i * 3] = glow * tr;
      col.array[i * 3 + 1] = glow * tg;
      col.array[i * 3 + 2] = glow * tb;
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
  }
}

function reveal(message) {
  if (message) {
    loaderText.textContent = message;
    window.setTimeout(() => { loader.hidden = true; }, 1600);
  } else {
    loader.hidden = true;
  }
}

function fail(message) {
  loader.querySelector('.hero__spinner')?.remove();
  loaderText.textContent = message;
}

/* ------------------------------------------------------------------
   Video lifecycle
   ------------------------------------------------------------------ */

let settled = false;

function useVideo() {
  if (settled) return;
  settled = true;
  window.clearTimeout(loadTimeout);
  attachVideoTexture();
}

function useScene(message) {
  if (settled) return;
  settled = true;
  window.clearTimeout(loadTimeout);
  attachSceneTexture(message);
}

// Name the file this page actually asked for. Hardcoding one path reported
// "assets/pano.mp4" missing on a page whose source was pano-urban.mp4, which
// sends anyone debugging it to the wrong place.
const firstSource = video.querySelector('source');
const NO_FOOTAGE = `Tidak ada footage di ${firstSource ? firstSource.getAttribute('src') : 'video hero'}`
  + ' — menampilkan panorama prosedural.';

video.addEventListener('loadeddata', useVideo, { once: true });

// With <source> children the media element itself often stays silent — the
// error lands on each <source> instead. Only give up once every one fails.
const sources = video.querySelectorAll('source');
let failedSources = 0;
sources.forEach((source) => {
  source.addEventListener('error', () => {
    if (++failedSources === sources.length) useScene(NO_FOOTAGE);
  }, { once: true });
});

video.addEventListener('error', () => {
  useScene('Video 360° tidak dapat dibaca — menampilkan panorama prosedural.');
}, { once: true });

/* Decide whether to fetch the footage at all.
   The markup carries preload="none", so nothing has been requested yet and this
   is a real choice rather than a cancellation — on a metered or slow connection
   the procedural panorama costs zero bytes and is the better answer. Chromium
   and most Android browsers expose this; Safari and Firefox do not, and there
   the video simply loads as before. */
function connectionSaysNo() {
  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!c) return false;
  if (c.saveData) return 'Mode hemat data aktif — menampilkan panorama prosedural.';
  if (['slow-2g', '2g', '3g'].includes(c.effectiveType)) {
    return `Koneksi ${c.effectiveType} — menampilkan panorama prosedural agar halaman tetap ringan.`;
  }
  return false;
}

/* A hero with no <source> and no src is procedural BY DESIGN, not broken.
   Nothing else here notices that case: networkState reads EMPTY (0) rather than
   NO_SOURCE (3), and with no <source> children there is nothing to raise an
   error. So the 8-second timeout fired instead and told the visitor the video
   was slow — blaming the network for a file that was never requested, after
   holding the spinner up for eight seconds. Checked first, and with no message,
   because nothing failed. */
const wantsVideo = video.querySelector('source') || video.getAttribute('src');

const skip = connectionSaysNo();
let loadTimeout = 0;

if (!wantsVideo) {
  useScene();
} else if (skip) {
  useScene(skip);
} else {
  // Backstop for a network that stalls without ever erroring.
  loadTimeout = window.setTimeout(() => {
    useScene('Video 360° terlalu lama dimuat — menampilkan panorama prosedural.');
  }, 8000);

  // This module is deferred, so with a preloading source the video may have
  // resolved before any of the listeners above were attached. Catch up on
  // whatever already happened, then ask for the bytes.
  if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
    useScene(NO_FOOTAGE);
  } else if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    useVideo();
  } else {
    video.load();
  }
}

if (skip) {
  // Nothing was fetched, so there is nothing to play.
  setPlayButton(false);
} else if (prefersReducedMotion) {
  // Respect the setting: load a frame for the texture, but do not start playback.
  video.addEventListener('loadeddata', () => setPlayButton(false), { once: true });
} else {
  video.play().then(() => setPlayButton(true)).catch(() => setPlayButton(false));
}

/* ------------------------------------------------------------------
   Look controls — yaw/pitch driven by pointer drag, with inertia
   ------------------------------------------------------------------ */

let lon = 0;                 // yaw, degrees
let lat = 0;                 // pitch, degrees
let velocityLon = 0;
let velocityLat = 0;
let dragging = false;
let pointerId = null;
let lastX = 0;
let lastY = 0;
let lastInteraction = performance.now();
let hintDismissed = false;

const target = new THREE.Vector3();

stage.addEventListener('pointerdown', (event) => {
  if (!event.isPrimary) return;
  dragging = true;
  pointerId = event.pointerId;
  lastX = event.clientX;
  lastY = event.clientY;
  velocityLon = 0;
  velocityLat = 0;
  stage.setPointerCapture(pointerId);
  markInteraction();
});

stage.addEventListener('pointermove', (event) => {
  if (!dragging || event.pointerId !== pointerId) return;

  // Scale with fov so the drag feels the same if you change the zoom.
  const scale = DRAG_SPEED * (camera.fov / 74);
  const dLon = -(event.clientX - lastX) * scale;
  const dLat = (event.clientY - lastY) * scale;

  lon += dLon;
  lat = THREE.MathUtils.clamp(lat + dLat, MIN_LAT, MAX_LAT);
  velocityLon = dLon;
  velocityLat = dLat;

  lastX = event.clientX;
  lastY = event.clientY;
  markInteraction();
  dismissHint();
});

function endDrag(event) {
  if (event.pointerId !== pointerId) return;
  dragging = false;
  pointerId = null;
  markInteraction();
}

stage.addEventListener('pointerup', endDrag);
stage.addEventListener('pointercancel', endDrag);

// Keyboard access to the same two axes.
stage.tabIndex = 0;
stage.setAttribute('role', 'application');
stage.setAttribute('aria-label', '360 degree video. Use the arrow keys to look around.');
stage.addEventListener('keydown', (event) => {
  const step = event.shiftKey ? 12 : 4;
  switch (event.key) {
    case 'ArrowLeft':  lon -= step; break;
    case 'ArrowRight': lon += step; break;
    case 'ArrowUp':    lat = THREE.MathUtils.clamp(lat + step, MIN_LAT, MAX_LAT); break;
    case 'ArrowDown':  lat = THREE.MathUtils.clamp(lat - step, MIN_LAT, MAX_LAT); break;
    default: return;
  }
  event.preventDefault();
  markInteraction();
  dismissHint();
});

function markInteraction() {
  lastInteraction = performance.now();
}

function dismissHint() {
  if (hintDismissed) return;
  hintDismissed = true;
  hint.hidden = true;
}

/* ------------------------------------------------------------------
   Controls
   ------------------------------------------------------------------ */

// The visible label is hidden on narrow viewports, so aria-label has to
// move with it or the control loses its name.
function setControl(button, pressed, icon, label) {
  button.setAttribute('aria-pressed', String(pressed));
  button.setAttribute('aria-label', label);
  button.querySelector('.ctrl__icon').dataset.icon = icon;
  button.querySelector('.ctrl__label').textContent = label;
}

function setPlayButton(playing) {
  setControl(playBtn, playing, playing ? 'pause' : 'play', playing ? 'Pause' : 'Play');
}

function setSoundButton(on) {
  setControl(soundBtn, on, on ? 'sound' : 'muted', on ? 'Mute' : 'Unmute');
}

playBtn.addEventListener('click', () => {
  if (video.paused) {
    video.play().then(() => setPlayButton(true)).catch(() => setPlayButton(false));
  } else {
    video.pause();
    setPlayButton(false);
  }
});

// Unmuting only works off a user gesture, which this click provides.
soundBtn.addEventListener('click', () => {
  video.muted = !video.muted;
  setSoundButton(!video.muted);
  if (!video.muted && video.paused) {
    video.play().then(() => setPlayButton(true)).catch(() => {});
  }
});

let recentering = null;
recenterBtn.addEventListener('click', () => {
  recentering = { fromLon: lon, fromLat: lat, start: performance.now(), duration: 650 };
  velocityLon = 0;
  velocityLat = 0;
  markInteraction();
});

/* ------------------------------------------------------------------
   Resize
   ------------------------------------------------------------------ */

// Fires once on observe, which is what performs the initial sizing —
// setSize also writes the canvas's inline CSS size, so it must be driven
// from here rather than from a one-off call before layout has settled.
const resizeObserver = new ResizeObserver(() => {
  const { clientWidth: w, clientHeight: h } = stage;
  if (!w || !h) return;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
});
resizeObserver.observe(stage);

/* ------------------------------------------------------------------
   Render loop — paused whenever the hero is off-screen or the tab is hidden
   ------------------------------------------------------------------ */

let visible = true;
let frame = null;
let lastFrameTime = performance.now();
let elapsed = 0;              // seconds of animation, excluding paused time

new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  if (visible) start(); else stop();
}, { threshold: 0.01 }).observe(document.getElementById('hero'));

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stop(); else if (visible) start();
});

function start() {
  if (frame !== null) return;
  lastFrameTime = performance.now();
  frame = requestAnimationFrame(tick);
}

function stop() {
  if (frame === null) return;
  cancelAnimationFrame(frame);
  frame = null;
}

function tick(now) {
  frame = requestAnimationFrame(tick);
  const delta = Math.min((now - lastFrameTime) / 1000, 0.1);
  lastFrameTime = now;
  elapsed += delta;

  if (!prefersReducedMotion) animateScene(elapsed);

  if (recentering) {
    const t = Math.min((now - recentering.start) / recentering.duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    lon = recentering.fromLon * (1 - eased);
    lat = recentering.fromLat * (1 - eased);
    if (t === 1) recentering = null;
  } else if (!dragging) {
    // Glide out of the last drag…
    if (Math.abs(velocityLon) > 0.001 || Math.abs(velocityLat) > 0.001) {
      lon += velocityLon;
      lat = THREE.MathUtils.clamp(lat + velocityLat, MIN_LAT, MAX_LAT);
      velocityLon *= INERTIA_DECAY;
      velocityLat *= INERTIA_DECAY;
    } else if (!prefersReducedMotion) {
      /* …then drift slowly so the hero stays alive while untouched.
         Eased in rather than switched on: going from zero to full speed in a
         single frame is a step change in velocity, and on a dense line drawing
         where every stroke moves at once that reads as a jolt. Smoothstep also
         means the drift leaves and rejoins standstill with zero acceleration,
         so there is no visible kick at either end. */
      const idleFor = now - lastInteraction - IDLE_DELAY;
      if (idleFor > 0) {
        const t = Math.min(idleFor / DRIFT_FADE, 1);
        const ramp = t * t * (3 - 2 * t);
        lon += DRIFT_SPEED * ramp * delta;
      }
    }
  }

  // Spherical -> cartesian for the look direction.
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon);
  target.setFromSphericalCoords(1, phi, theta);
  camera.lookAt(target);

  renderer.render(scene, camera);
}

start();
