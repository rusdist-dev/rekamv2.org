/* ------------------------------------------------------------------
   Procedural equirectangular scenes — forest, reef and city

   Everything here paints into a 2:1 canvas laid out the way real 360°
   footage is: x spans 360° of longitude, y spans +90° (zenith) at the
   top to -90° (nadir) at the bottom, with the horizon on the centre row.
   Wrapped at the seam so the sphere has no visible join.

   Each scene supplies three shells — a backdrop, a drifting middle layer
   and a transparent foreground — plus a particle sprite. `getScene(name)`
   returns that set; see the registry at the foot of this file.
   ------------------------------------------------------------------ */

// Deterministic RNG — the same forest every load.
function mulberry32(seed) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Draws an element up to three times so shapes straddling x=0 are whole.
function wrapped(width, x, draw) {
  const margin = 420;
  draw(x);
  if (x < margin) draw(x + width);
  if (x > width - margin) draw(x - width);
}

function mix(a, b, t) {
  const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
  const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

/* ---------------------------- tree shapes ---------------------------- */

function conifer(ctx, x, baseY, h, w, color) {
  const tiers = 5;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, baseY - h);
  for (let i = 1; i <= tiers; i++) {
    const t = i / tiers;
    const y = baseY - h + h * t;
    const half = (w / 2) * t;
    ctx.lineTo(x + half, y - h * 0.07);
    ctx.lineTo(x + half * 0.6, y);
  }
  ctx.lineTo(x + w * 0.05, baseY);
  ctx.lineTo(x - w * 0.05, baseY);
  for (let i = tiers; i >= 1; i--) {
    const t = i / tiers;
    const y = baseY - h + h * t;
    const half = (w / 2) * t;
    ctx.lineTo(x - half * 0.6, y);
    ctx.lineTo(x - half, y - h * 0.07);
  }
  ctx.closePath();
  ctx.fill();
}

function broadleaf(ctx, x, baseY, h, w, color, rnd) {
  ctx.fillStyle = color;
  ctx.fillRect(x - w * 0.04, baseY - h * 0.6, w * 0.08, h * 0.6);
  const r = w * 0.5;
  const cy = baseY - h * 0.72;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + rnd();
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(a) * r * 0.5,
      cy + Math.sin(a) * r * 0.34,
      r * (0.42 + rnd() * 0.2),
      r * (0.34 + rnd() * 0.16),
      0, 0, Math.PI * 2
    );
    ctx.fill();
  }
}

// A trunk close enough that it runs from below the horizon up past the
// zenith band — this is what sells the sense of standing among the trees.
function nearTrunk(ctx, x, topY, bottomY, w, rnd) {
  const lean = (rnd() - 0.5) * 60;
  const half = w / 2;

  ctx.fillStyle = '#10140c';
  ctx.beginPath();
  ctx.moveTo(x - half * 0.55 + lean, topY);
  ctx.quadraticCurveTo(x - half * 0.8 + lean * 0.4, (topY + bottomY) / 2, x - half, bottomY - w * 0.6);
  ctx.quadraticCurveTo(x - half * 1.6, bottomY, x - half * 2.2, bottomY);   // root flare
  ctx.lineTo(x + half * 2.2, bottomY);
  ctx.quadraticCurveTo(x + half * 1.6, bottomY, x + half, bottomY - w * 0.6);
  ctx.quadraticCurveTo(x + half * 0.8 + lean * 0.4, (topY + bottomY) / 2, x + half * 0.55 + lean, topY);
  ctx.closePath();
  ctx.fill();

  // Bark: vertical streaks, plus a rim of light down one side.
  ctx.save();
  ctx.clip();
  for (let i = 0; i < 14; i++) {
    const sx = x - half + rnd() * w;
    ctx.strokeStyle = rnd() > 0.5 ? 'rgba(70, 78, 54, 0.28)' : 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = 1 + rnd() * 3;
    ctx.beginPath();
    ctx.moveTo(sx + lean, topY);
    ctx.quadraticCurveTo(sx + lean * 0.4 + (rnd() - 0.5) * 20, (topY + bottomY) / 2, sx, bottomY);
    ctx.stroke();
  }
  const rim = ctx.createLinearGradient(x - half, 0, x + half, 0);
  rim.addColorStop(0, 'rgba(0, 0, 0, 0)');
  rim.addColorStop(0.82, 'rgba(0, 0, 0, 0)');
  rim.addColorStop(1, 'rgba(196, 214, 176, 0.22)');
  ctx.fillStyle = rim;
  ctx.fillRect(x - half, topY, w, bottomY - topY);
  ctx.restore();
}

/* ------------------------- the panorama itself ------------------------ */

// Shared 2048x1024 drawing space; the output canvas is scaled up from it
// so resolution can change without retuning every constant below.
const W = 2048;
const H = 1024;
const HORIZON = H * 0.5;
const SUN_X = W * 0.63;
const SUN_Y = HORIZON - 150;

function equirectCanvas(pixelWidth) {
  const canvas = document.createElement('canvas');
  canvas.width = pixelWidth;
  canvas.height = pixelWidth / 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(pixelWidth / W, pixelWidth / W);
  return { canvas, ctx };
}

/* The outermost shell: sky, sun, and the shafts coming off it. Opaque —
   the forest layer in front of it is what carries the transparency. */
function paintSkyForest(pixelWidth) {
  const { canvas, ctx } = equirectCanvas(pixelWidth);

  const sky = ctx.createLinearGradient(0, 0, 0, HORIZON + 8);
  sky.addColorStop(0.00, '#081521');
  sky.addColorStop(0.32, '#153446');
  sky.addColorStop(0.60, '#33646b');
  sky.addColorStop(0.84, '#7d9a8b');
  sky.addColorStop(1.00, '#b3ac89');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, HORIZON + 8);

  ctx.fillStyle = '#070b05';
  ctx.fillRect(0, HORIZON, W, H - HORIZON);

  /* Sun and a tight bloom — a wide one turns the whole sky milky. */
  const R = 210;
  wrapped(W, SUN_X, (x) => {
    const g = ctx.createRadialGradient(x, SUN_Y, 4, x, SUN_Y, R);
    g.addColorStop(0.00, 'rgba(255, 250, 228, 0.95)');
    g.addColorStop(0.07, 'rgba(255, 234, 180, 0.30)');
    g.addColorStop(0.30, 'rgba(255, 226, 160, 0.07)');
    g.addColorStop(1.00, 'rgba(255, 226, 160, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - R, SUN_Y - R, R * 2, R * 2);
  });

  /* Light shafts. Kept faint and blurred: additive polygons read as hard
     white wedges otherwise. */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.filter = 'blur(26px)';
  for (let i = 0; i < 5; i++) {
    const spread = (i - 2) * 78;
    wrapped(W, SUN_X, (x) => {
      const shaft = ctx.createLinearGradient(x, SUN_Y, x + spread * 2.2, HORIZON + 90);
      shaft.addColorStop(0.0, 'rgba(255, 240, 198, 0.10)');
      shaft.addColorStop(0.6, 'rgba(255, 240, 198, 0.04)');
      shaft.addColorStop(1.0, 'rgba(255, 240, 198, 0)');
      ctx.fillStyle = shaft;
      ctx.beginPath();
      ctx.moveTo(x - 10, SUN_Y - 30);
      ctx.lineTo(x + 10, SUN_Y - 30);
      ctx.lineTo(x + spread * 2.2 + 96, HORIZON + 90);
      ctx.lineTo(x + spread * 2.2 - 96, HORIZON + 90);
      ctx.closePath();
      ctx.fill();
    });
  }
  ctx.restore();

  return canvas;
}

/* The forest itself, on the innermost shell. Everything above the horizon
   is drawn onto transparent pixels, so sky and clouds show through the
   gaps in the canopy instead of being painted over. */
function paintForestScene(pixelWidth) {
  const { canvas, ctx } = equirectCanvas(pixelWidth);
  const rnd = mulberry32(20260802);
  const horizon = HORIZON;

  /* Forest floor — darkest straight down at the nadir. */
  const floor = ctx.createLinearGradient(0, horizon, 0, H);
  floor.addColorStop(0.00, '#4a5334');
  floor.addColorStop(0.18, '#31401f');
  floor.addColorStop(0.55, '#1a2413');
  floor.addColorStop(1.00, '#080c06');
  ctx.fillStyle = floor;
  ctx.fillRect(0, horizon, W, H - horizon);

  /* Ground lines radiating from the viewer become verticals in an
     equirectangular frame — cheap, and it reads as real perspective.
     They stop short of the bottom row: run them all the way down and they
     converge on the nadir as a starburst. */
  for (let i = 0; i < 170; i++) {
    const x = rnd() * W;
    const top = horizon + 20 + rnd() * 120;
    const bottom = H - 300 - rnd() * 120;
    const dark = rnd() > 0.45;
    const tint = dark ? '0, 0, 0' : '126, 138, 86';
    const g = ctx.createLinearGradient(0, top, 0, bottom);
    g.addColorStop(0.00, `rgba(${tint}, 0)`);
    g.addColorStop(0.60, `rgba(${tint}, ${dark ? 0.3 : 0.16})`);
    g.addColorStop(1.00, `rgba(${tint}, 0)`);
    ctx.strokeStyle = g;
    ctx.lineWidth = 2 + rnd() * 9;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x + (rnd() - 0.5) * 22, bottom);
    ctx.stroke();
  }

  /* Leaf litter — patches grow toward the nadir, where a given object
     covers far more of the frame. */
  for (let i = 0; i < 520; i++) {
    const y = horizon + Math.pow(rnd(), 0.6) * (H - horizon);
    const depth = (y - horizon) / (H - horizon);
    const size = 3 + depth * 26 * (0.4 + rnd());
    ctx.fillStyle = rnd() > 0.55
      ? `rgba(96, 104, 58, ${0.10 + rnd() * 0.22})`
      : `rgba(20, 26, 14, ${0.16 + rnd() * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(rnd() * W, y, size, size * 0.55, rnd() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  /* Treeline, far to near. Distant bands wash out toward the haze. */
  const bands = [
    { count: 170, min: 26,  max: 74,  base: '#35513c', haze: 0.42, y: horizon + 2 },
    { count: 110, min: 70,  max: 160, base: '#22351d', haze: 0.16, y: horizon + 10 },
    { count: 58,  min: 150, max: 320, base: '#141e11', haze: 0.04, y: horizon + 26 },
  ];

  function drawBand(band) {
    for (let i = 0; i < band.count; i++) {
      const x = rnd() * W;
      const h = band.min + rnd() * (band.max - band.min);
      const w = h * (0.34 + rnd() * 0.22);
      const color = mix(band.base, '#b6c8bb', band.haze * (0.6 + rnd() * 0.6));
      const draw = rnd() > 0.42
        ? (px) => conifer(ctx, px, band.y, h, w, color)
        : (px) => broadleaf(ctx, px, band.y, h, w, color, rnd);
      wrapped(W, x, draw);
    }
  }

  /* Looking level, you are looking through hundreds of metres of trunks —
     almost no open sky gets through. Without this the gaps between the
     far trees show bright horizon sky and the treeline reads as a cutout. */
  const deep = ctx.createLinearGradient(0, horizon - 160, 0, horizon);
  deep.addColorStop(0.00, 'rgba(23, 36, 23, 0)');
  deep.addColorStop(0.50, 'rgba(21, 33, 21, 0.72)');
  deep.addColorStop(1.00, 'rgba(18, 28, 18, 0.96)');
  ctx.fillStyle = deep;
  ctx.fillRect(0, horizon - 160, W, 160);

  drawBand(bands[0]);

  /* A thin band of ground mist, laid over the far treeline only so the
     nearer trees stay crisp in front of it. */
  const mist = ctx.createLinearGradient(0, horizon - 64, 0, horizon + 54);
  mist.addColorStop(0.00, 'rgba(222, 232, 226, 0)');
  mist.addColorStop(0.52, 'rgba(214, 226, 219, 0.17)');
  mist.addColorStop(1.00, 'rgba(222, 232, 226, 0)');
  ctx.fillStyle = mist;
  ctx.fillRect(0, horizon - 64, W, 118);

  drawBand(bands[1]);

  /* Mid-ground trunks — the depth cue between the treeline and the
     trunks you could touch. Drawn between bands so the nearest trees
     still overlap them. */
  for (let i = 0; i < 24; i++) {
    const x = rnd() * W;
    const w = 10 + rnd() * 18;
    const topY = 290 + rnd() * 140;
    const bottomY = horizon + 46 + rnd() * 70;
    wrapped(W, x, (px) => {
      ctx.fillStyle = `rgba(${18 + rnd() * 12 | 0}, ${24 + rnd() * 14 | 0}, ${15 + rnd() * 10 | 0}, 0.92)`;
      ctx.beginPath();
      ctx.moveTo(px - w * 0.36, topY);
      ctx.lineTo(px + w * 0.36, topY);
      ctx.lineTo(px + w * 0.6, bottomY);
      ctx.lineTo(px - w * 0.6, bottomY);
      ctx.closePath();
      ctx.fill();
    });
  }

  drawBand(bands[2]);

  /* Undergrowth along the horizon, hiding where every trunk meets the floor. */
  for (let i = 0; i < 170; i++) {
    const x = rnd() * W;
    const r = 14 + rnd() * 52;
    ctx.fillStyle = `rgba(${16 + rnd() * 26 | 0}, ${34 + rnd() * 34 | 0}, ${14 + rnd() * 20 | 0}, ${0.6 + rnd() * 0.4})`;
    wrapped(W, x, (px) => {
      ctx.beginPath();
      ctx.ellipse(px, horizon + 26 + rnd() * 58, r, r * (0.4 + rnd() * 0.35), 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* Trunks within arm's reach. */
  const nearTrunks = [];
  for (let i = 0; i < 9; i++) {
    const x = ((i + rnd() * 0.7) / 9) * W;
    const w = 34 + rnd() * 46;
    const topY = 120 + rnd() * 130;
    const bottomY = 830 + rnd() * 150;
    nearTrunks.push({ x, w, topY });
    wrapped(W, x, (px) => nearTrunk(ctx, px, topY, bottomY, w, rnd));
  }

  /* Canopy overhead. Straight up is nearly solid leaf; it opens into gaps
     of sky as it comes down toward the horizon. */
  const cap = ctx.createLinearGradient(0, 0, 0, 210);
  cap.addColorStop(0, 'rgba(11, 22, 10, 0.92)');
  cap.addColorStop(1, 'rgba(11, 22, 10, 0)');
  ctx.fillStyle = cap;
  ctx.fillRect(0, 0, W, 210);

  for (let i = 0; i < 460; i++) {
    const y = Math.pow(rnd(), 1.6) * 440;
    const density = 1 - y / 470;
    if (rnd() > 0.18 + density * 0.82) continue;
    const r = 50 + rnd() * 170;
    ctx.fillStyle = `rgba(${12 + rnd() * 22 | 0}, ${26 + rnd() * 38 | 0}, ${10 + rnd() * 20 | 0}, ${0.5 + rnd() * 0.5})`;
    wrapped(W, rnd() * W, (px) => {
      ctx.beginPath();
      ctx.ellipse(px, y, r, r * (0.5 + rnd() * 0.4), rnd() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* Foliage where each near trunk meets the canopy, so they connect. */
  for (const trunk of nearTrunks) {
    wrapped(W, trunk.x, (px) => {
      for (let i = 0; i < 16; i++) {
        const r = 60 + rnd() * 130;
        ctx.fillStyle = `rgba(${14 + rnd() * 20 | 0}, ${30 + rnd() * 34 | 0}, ${12 + rnd() * 18 | 0}, ${0.5 + rnd() * 0.4})`;
        ctx.beginPath();
        ctx.ellipse(px + (rnd() - 0.5) * 380, trunk.topY - 40 + (rnd() - 0.5) * 260, r, r * 0.62, rnd() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  /* Pole caps. The top and bottom rows of an equirectangular image each
     collapse to a single point on the sphere, so any detail up there gets
     smeared into radial spokes. Flooding both poles with a flat colour
     leaves nothing to smear — dense leaf overhead, shadow underfoot. */
  const zenith = ctx.createLinearGradient(0, 0, 0, 300);
  zenith.addColorStop(0.00, 'rgba(9, 18, 9, 1)');
  zenith.addColorStop(0.33, 'rgba(9, 18, 9, 1)');
  zenith.addColorStop(0.58, 'rgba(9, 18, 9, 0.72)');
  zenith.addColorStop(1.00, 'rgba(9, 18, 9, 0)');
  ctx.fillStyle = zenith;
  ctx.fillRect(0, 0, W, 300);

  const nadir = ctx.createLinearGradient(0, H - 330, 0, H);
  nadir.addColorStop(0.00, 'rgba(6, 10, 5, 0)');
  nadir.addColorStop(0.50, 'rgba(6, 10, 5, 0.85)');
  nadir.addColorStop(0.64, 'rgba(6, 10, 5, 1)');
  nadir.addColorStop(1.00, 'rgba(6, 10, 5, 1)');
  ctx.fillStyle = nadir;
  ctx.fillRect(0, H - 330, W, 330);

  return canvas;
}

/* --------------------------- animated layers -------------------------- */

// Painted on its own sphere and rotated slowly, which drifts the clouds
// without re-uploading a texture every frame.
function paintCloudsForest(pixelWidth) {
  const { canvas, ctx } = equirectCanvas(pixelWidth);
  const rnd = mulberry32(77213);

  // Confined to the upper sky. Anything reaching down toward the horizon
  // sits in front of the treeline and reads as fog.
  for (let i = 0; i < 20; i++) {
    const cx = rnd() * W;
    const cy = 40 + Math.pow(rnd(), 1.3) * 280;
    const scale = 50 + rnd() * 120;
    const alpha = 0.08 + rnd() * 0.18;
    wrapped(W, cx, (x) => {
      for (let p = 0; p < 6; p++) {
        const px = x + (rnd() - 0.5) * scale * 2.4;
        const py = cy + (rnd() - 0.5) * scale * 0.5;
        const r = scale * (0.5 + rnd() * 0.7);
        const g = ctx.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, `rgba(255, 253, 246, ${alpha})`);
        g.addColorStop(1, 'rgba(255, 253, 246, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(px - r, py - r, r * 2, r * 2);
      }
    });
  }

  return canvas;
}

// Soft warm dot used as the firefly point sprite.
function paintFirefly(size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0.0, 'rgba(255, 250, 210, 1)');
  g.addColorStop(0.25, 'rgba(240, 226, 140, 0.7)');
  g.addColorStop(1.0, 'rgba(200, 190, 90, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

/* ==================================================================
   OCEAN — a reef seen from mid-water: bright surface overhead, coral
   heads along the horizon, sand below, fish schooling in the middle.
   ================================================================== */

function paintSkyOcean(pixelWidth) {
  const { canvas, ctx } = equirectCanvas(pixelWidth);

  // Looking up is the sunlit surface; looking down runs to deep blue.
  const water = ctx.createLinearGradient(0, 0, 0, H);
  water.addColorStop(0.00, '#bfe9f2');
  water.addColorStop(0.14, '#69c2dc');
  water.addColorStop(0.34, '#1f83b4');
  water.addColorStop(0.52, '#0d5b8c');
  water.addColorStop(0.74, '#073f68');
  water.addColorStop(1.00, '#04263f');
  ctx.fillStyle = water;
  ctx.fillRect(0, 0, W, H);

  // The sun seen through the surface, plus its shafts raking down.
  const R = 190;
  wrapped(W, SUN_X, (x) => {
    const g = ctx.createRadialGradient(x, 60, 4, x, 60, R);
    g.addColorStop(0.00, 'rgba(244, 253, 255, 0.85)');
    g.addColorStop(0.14, 'rgba(196, 238, 252, 0.32)');
    g.addColorStop(1.00, 'rgba(176, 226, 248, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - R, 60 - R, R * 2, R * 2);
  });

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.filter = 'blur(30px)';
  for (let i = 0; i < 9; i++) {
    const spread = (i - 4) * 96;
    wrapped(W, SUN_X, (x) => {
      const shaft = ctx.createLinearGradient(x, 40, x + spread * 1.6, HORIZON + 60);
      shaft.addColorStop(0.0, 'rgba(214, 246, 255, 0.13)');
      shaft.addColorStop(1.0, 'rgba(214, 246, 255, 0)');
      ctx.fillStyle = shaft;
      ctx.beginPath();
      ctx.moveTo(x - 16, 20);
      ctx.lineTo(x + 16, 20);
      ctx.lineTo(x + spread * 1.6 + 88, HORIZON + 60);
      ctx.lineTo(x + spread * 1.6 - 88, HORIZON + 60);
      ctx.closePath();
      ctx.fill();
    });
  }
  ctx.restore();

  return canvas;
}

/* Suspended particulate on its own shell; rotating it makes the water
   feel alive without touching the reef behind it. */
function paintCloudsOcean(pixelWidth) {
  const { canvas, ctx } = equirectCanvas(pixelWidth);
  const rnd = mulberry32(5150);

  for (let i = 0; i < 900; i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    const r = 1.5 + rnd() * 4;
    ctx.fillStyle = `rgba(226, 246, 255, ${0.10 + rnd() * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.5 + rnd() * 0.6), rnd() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvas;
}

// A single coral head: a clump of lobes with a lighter crown.
function coralHead(ctx, x, baseY, h, w, hue, rnd) {
  const lobes = 5 + Math.floor(rnd() * 5);
  for (let i = 0; i < lobes; i++) {
    const t = i / lobes;
    const cx = x + (rnd() - 0.5) * w;
    const cy = baseY - h * (0.25 + t * 0.7) + (rnd() - 0.5) * h * 0.15;
    const r = w * (0.22 + rnd() * 0.22);
    ctx.fillStyle = hue(0.55 + rnd() * 0.45);
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * (0.7 + rnd() * 0.5), rnd() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = hue(0.3);
  ctx.beginPath();
  ctx.ellipse(x, baseY - h * 0.08, w * 0.55, h * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
}

// Sea fans read as reef even at a glance, and they break up the silhouette.
function seaFan(ctx, x, baseY, h, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 13; i++) {
    const a = -Math.PI / 2 + (i / 12 - 0.5) * 1.5;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.quadraticCurveTo(x + Math.cos(a) * h * 0.35, baseY - h * 0.55,
                         x + Math.cos(a) * h * 0.62, baseY - h * (0.75 + Math.random() * 0.2));
    ctx.stroke();
  }
}

function paintOceanScene(pixelWidth) {
  const { canvas, ctx } = equirectCanvas(pixelWidth);
  const rnd = mulberry32(90210);
  const horizon = HORIZON;

  /* Sea floor — pale sand directly below, hazing into blue at distance. */
  const floor = ctx.createLinearGradient(0, horizon, 0, H);
  floor.addColorStop(0.00, 'rgba(120, 158, 168, 0.55)');
  floor.addColorStop(0.22, 'rgba(158, 182, 176, 0.9)');
  floor.addColorStop(0.55, '#b9bda2');
  floor.addColorStop(1.00, '#cfcbab');
  ctx.fillStyle = floor;
  ctx.fillRect(0, horizon, W, H - horizon);

  // Ripple marks in the sand, stopping short of the nadir so they do not
  // converge into a starburst at the pole.
  for (let i = 0; i < 90; i++) {
    const y = horizon + 60 + rnd() * 300;
    ctx.strokeStyle = `rgba(120, 130, 110, ${0.05 + rnd() * 0.12})`;
    ctx.lineWidth = 3 + rnd() * 10;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= W; x += 64) ctx.lineTo(x, y + Math.sin(x / 190 + i) * 12);
    ctx.stroke();
  }

  /* Everything below the horizon is seen through metres of water. */
  const veil = ctx.createLinearGradient(0, horizon, 0, H);
  veil.addColorStop(0.00, 'rgba(16, 92, 138, 0.72)');
  veil.addColorStop(0.35, 'rgba(16, 92, 138, 0.42)');
  veil.addColorStop(1.00, 'rgba(16, 92, 138, 0.2)');
  ctx.fillStyle = veil;
  ctx.fillRect(0, horizon, W, H - horizon);

  /* Distance haze: the far reef fades into the water column. */
  const haze = ctx.createLinearGradient(0, horizon - 130, 0, horizon + 90);
  haze.addColorStop(0, 'rgba(28, 118, 160, 0)');
  haze.addColorStop(0.5, 'rgba(28, 118, 160, 0.55)');
  haze.addColorStop(1, 'rgba(28, 118, 160, 0)');

  const bands = [
    { count: 110, min: 18, max: 42, fade: 0.78, y: horizon + 6 },
    { count: 60, min: 40, max: 85, fade: 0.55, y: horizon + 28 },
    { count: 30, min: 75, max: 140, fade: 0.34, y: horizon + 64 },
  ];
  // Muted rather than tropical-postcard: saturated coral at this scale
  // reads as abstract blobs instead of a reef.
  const palette = [
    [198, 112, 92], [196, 156, 96], [136, 100, 136], [92, 140, 128], [186, 134, 142],
  ];

  bands.forEach((band, bi) => {
    if (bi === 1) { ctx.fillStyle = haze; ctx.fillRect(0, horizon - 130, W, 220); }
    for (let i = 0; i < band.count; i++) {
      const x = rnd() * W;
      const h = band.min + rnd() * (band.max - band.min);
      const w = h * (0.7 + rnd() * 0.5);
      const base = palette[Math.floor(rnd() * palette.length)];
      const hue = (a) => {
        const m = band.fade;                       // blend toward the water
        const r = Math.round(base[0] * (1 - m) + 26 * m);
        const g = Math.round(base[1] * (1 - m) + 104 * m);
        const b = Math.round(base[2] * (1 - m) + 150 * m);
        return `rgba(${r}, ${g}, ${b}, ${a})`;
      };
      wrapped(W, x, (px) => {
        if (rnd() > 0.75) seaFan(ctx, px, band.y, h * 1.2, hue(0.5));
        else coralHead(ctx, px, band.y, h, w, hue, rnd);
      });
    }
  });

  /* Schooling fish — small lozenges all facing the same way per shoal. */
  for (let s = 0; s < 6; s++) {
    const cx = rnd() * W;
    const cy = horizon - 150 + rnd() * 210;
    const spread = 110 + rnd() * 190;
    const tilt = (rnd() - 0.5) * 0.5;
    const count = 40 + Math.floor(rnd() * 60);
    wrapped(W, cx, (px) => {
      for (let i = 0; i < count; i++) {
        const fx = px + (rnd() - 0.5) * spread * 2;
        const fy = cy + (rnd() - 0.5) * spread * 0.55;
        const len = 4 + rnd() * 5;
        ctx.fillStyle = `rgba(${198 + rnd() * 40 | 0}, ${214 + rnd() * 32 | 0}, ${196 + rnd() * 44 | 0}, ${0.35 + rnd() * 0.4})`;
        ctx.save();
        ctx.translate(fx, fy);
        ctx.rotate(tilt + (rnd() - 0.5) * 0.2);
        ctx.beginPath();
        ctx.ellipse(0, 0, len, len * 0.34, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();                              // tail
        ctx.moveTo(-len, 0);
        ctx.lineTo(-len - len * 0.5, -len * 0.28);
        ctx.lineTo(-len - len * 0.5, len * 0.28);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    });
  }

  /* Pole caps. The top and bottom rows collapse to a point on the sphere,
     so flat colour there leaves nothing to smear into spokes. */
  const zenith = ctx.createLinearGradient(0, 0, 0, 260);
  zenith.addColorStop(0.00, 'rgba(150, 218, 236, 0.95)');
  zenith.addColorStop(0.35, 'rgba(150, 218, 236, 0.5)');
  zenith.addColorStop(1.00, 'rgba(150, 218, 236, 0)');
  ctx.fillStyle = zenith;
  ctx.fillRect(0, 0, W, 260);

  const nadir = ctx.createLinearGradient(0, H - 300, 0, H);
  nadir.addColorStop(0.00, 'rgba(150, 166, 156, 0)');
  nadir.addColorStop(0.55, 'rgba(150, 166, 156, 0.85)');
  nadir.addColorStop(0.75, 'rgba(150, 166, 156, 1)');
  nadir.addColorStop(1.00, 'rgba(150, 166, 156, 1)');
  ctx.fillStyle = nadir;
  ctx.fillRect(0, H - 300, W, 300);

  return canvas;
}

function paintBubble(size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size * 0.42, size * 0.4, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
  g.addColorStop(0.35, 'rgba(198, 238, 255, 0.35)');
  g.addColorStop(1.0, 'rgba(160, 220, 255, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

/* ==================================================================
   URBAN — a green city: planted towers, rooftop gardens, a tree-lined
   street underfoot and a working daytime sky.
   ================================================================== */

function paintSkyUrban(pixelWidth) {
  const { canvas, ctx } = equirectCanvas(pixelWidth);

  const sky = ctx.createLinearGradient(0, 0, 0, HORIZON + 8);
  sky.addColorStop(0.00, '#2a6ea8');
  sky.addColorStop(0.38, '#6ba8ce');
  sky.addColorStop(0.72, '#b6d6e2');
  sky.addColorStop(1.00, '#e8e2cf');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, HORIZON + 8);

  ctx.fillStyle = '#20301f';
  ctx.fillRect(0, HORIZON, W, H - HORIZON);

  const R = 230;
  wrapped(W, SUN_X, (x) => {
    const g = ctx.createRadialGradient(x, SUN_Y, 5, x, SUN_Y, R);
    g.addColorStop(0.00, 'rgba(255, 252, 232, 0.95)');
    g.addColorStop(0.08, 'rgba(255, 240, 190, 0.35)');
    g.addColorStop(1.00, 'rgba(255, 236, 176, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - R, SUN_Y - R, R * 2, R * 2);
  });

  return canvas;
}

function paintCloudsUrban(pixelWidth) {
  const { canvas, ctx } = equirectCanvas(pixelWidth);
  const rnd = mulberry32(31415);

  for (let i = 0; i < 22; i++) {
    const cx = rnd() * W;
    const cy = 50 + Math.pow(rnd(), 1.2) * 300;
    const scale = 60 + rnd() * 130;
    const alpha = 0.1 + rnd() * 0.24;
    wrapped(W, cx, (x) => {
      for (let p = 0; p < 7; p++) {
        const px = x + (rnd() - 0.5) * scale * 2.6;
        const py = cy + (rnd() - 0.5) * scale * 0.45;
        const r = scale * (0.5 + rnd() * 0.7);
        const g = ctx.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, `rgba(255, 255, 252, ${alpha})`);
        g.addColorStop(1, 'rgba(255, 255, 252, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(px - r, py - r, r * 2, r * 2);
      }
    });
  }
  return canvas;
}

// A tower with planted setbacks — the visual shorthand for the programme.
function greenTower(ctx, x, baseY, h, w, shade, rnd) {
  ctx.fillStyle = shade;
  ctx.fillRect(x - w / 2, baseY - h, w, h);

  // windows
  const cols = Math.max(2, Math.floor(w / 16));
  const rows = Math.max(3, Math.floor(h / 26));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rnd() > 0.72) continue;
      ctx.fillStyle = `rgba(226, 236, 226, ${0.1 + rnd() * 0.3})`;
      ctx.fillRect(x - w / 2 + 5 + c * (w / cols), baseY - h + 12 + r * (h / rows), (w / cols) * 0.52, (h / rows) * 0.42);
    }
  }

  // planted terraces spilling over the edges
  const bands = 2 + Math.floor(rnd() * 4);
  for (let i = 0; i < bands; i++) {
    const by = baseY - h + (h / (bands + 1)) * (i + 1);
    ctx.fillStyle = `rgba(${44 + rnd() * 30 | 0}, ${96 + rnd() * 40 | 0}, ${52 + rnd() * 26 | 0}, 0.95)`;
    ctx.fillRect(x - w / 2 - 3, by, w + 6, 7);
    for (let k = 0; k < w / 7; k++) {
      const lx = x - w / 2 + rnd() * w;
      const r = 4 + rnd() * 8;
      ctx.beginPath();
      ctx.ellipse(lx, by + 4 + rnd() * 5, r, r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // roof garden
  ctx.fillStyle = 'rgba(52, 108, 58, 0.95)';
  ctx.fillRect(x - w / 2 - 2, baseY - h - 6, w + 4, 8);
}

function paintUrbanScene(pixelWidth) {
  const { canvas, ctx } = equirectCanvas(pixelWidth);
  const rnd = mulberry32(60601);
  const horizon = HORIZON;

  /* Street level. */
  const ground = ctx.createLinearGradient(0, horizon, 0, H);
  ground.addColorStop(0.00, '#7d8a6c');
  ground.addColorStop(0.20, '#63704f');
  ground.addColorStop(0.55, '#4a553b');
  ground.addColorStop(1.00, '#39422e');
  ctx.fillStyle = ground;
  ctx.fillRect(0, horizon, W, H - horizon);

  // paving bands, fading out before the nadir
  for (let i = 0; i < 120; i++) {
    const x = rnd() * W;
    const top = horizon + 30 + rnd() * 120;
    const bottom = H - 300 - rnd() * 120;
    const g = ctx.createLinearGradient(0, top, 0, bottom);
    g.addColorStop(0, 'rgba(0, 0, 0, 0)');
    g.addColorStop(0.6, `rgba(0, 0, 0, ${0.1 + rnd() * 0.16})`);
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 3 + rnd() * 10;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x + (rnd() - 0.5) * 24, bottom);
    ctx.stroke();
  }

  /* Skyline, far to near. */
  const skyline = [
    { count: 70, min: 60, max: 150, w: [26, 60], shade: 'rgba(128, 150, 160, 0.85)', y: horizon + 4 },
    { count: 40, min: 130, max: 280, w: [34, 78], shade: 'rgba(84, 104, 112, 0.95)', y: horizon + 16 },
    { count: 20, min: 240, max: 430, w: [48, 104], shade: 'rgba(48, 62, 62, 1)', y: horizon + 40 },
  ];
  for (const band of skyline) {
    for (let i = 0; i < band.count; i++) {
      const x = rnd() * W;
      const h = band.min + rnd() * (band.max - band.min);
      const w = band.w[0] + rnd() * (band.w[1] - band.w[0]);
      wrapped(W, x, (px) => greenTower(ctx, px, band.y, h, w, band.shade, rnd));
    }
  }

  /* Street trees along the horizon, hiding where the towers meet the ground. */
  for (let i = 0; i < 150; i++) {
    const x = rnd() * W;
    const r = 18 + rnd() * 46;
    ctx.fillStyle = `rgba(${28 + rnd() * 26 | 0}, ${72 + rnd() * 40 | 0}, ${34 + rnd() * 24 | 0}, ${0.75 + rnd() * 0.25})`;
    wrapped(W, x, (px) => {
      ctx.beginPath();
      ctx.ellipse(px, horizon + 40 + rnd() * 60, r, r * (0.6 + rnd() * 0.35), 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* A light fringe of street-tree foliage at the very top, framing the sky
     rather than closing it over — this is a city, not a forest. */
  for (let i = 0; i < 90; i++) {
    const y = Math.pow(rnd(), 3.0) * 210;
    if (rnd() > 0.42) continue;
    const r = 55 + rnd() * 120;
    ctx.fillStyle = `rgba(${24 + rnd() * 24 | 0}, ${62 + rnd() * 36 | 0}, ${28 + rnd() * 20 | 0}, ${0.3 + rnd() * 0.35})`;
    wrapped(W, rnd() * W, (px) => {
      ctx.beginPath();
      ctx.ellipse(px, y, r, r * 0.6, rnd() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* Pole caps. */
  // Straight up is open sky, so the cap only needs to be flat, not dark.
  const zenith = ctx.createLinearGradient(0, 0, 0, 170);
  zenith.addColorStop(0.00, 'rgba(58, 126, 176, 0.96)');
  zenith.addColorStop(0.34, 'rgba(58, 126, 176, 0.6)');
  zenith.addColorStop(1.00, 'rgba(58, 126, 176, 0)');
  ctx.fillStyle = zenith;
  ctx.fillRect(0, 0, W, 170);

  const nadir = ctx.createLinearGradient(0, H - 320, 0, H);
  nadir.addColorStop(0.00, 'rgba(52, 60, 42, 0)');
  nadir.addColorStop(0.55, 'rgba(52, 60, 42, 0.9)');
  nadir.addColorStop(0.75, 'rgba(52, 60, 42, 1)');
  nadir.addColorStop(1.00, 'rgba(52, 60, 42, 1)');
  ctx.fillStyle = nadir;
  ctx.fillRect(0, H - 320, W, 320);

  return canvas;
}


/* ==================================================================
   Hatched coastline — an engraving, not a photograph

   The three scenes above are painted in flat colour. This one is built
   the way the reference footage is drawn: ink line-work on cream paper,
   where every tone comes from how densely the strokes are packed rather
   than from a fill. That is also why it survives being a procedural
   scene at all — hatching is cheap to synthesise and reads as
   deliberate, where a synthetic photograph would only read as fake.

   Longitude is laid out so the SEAM FALLS IN OPEN WATER: the sea spans
   x≈1740→2048→0→480. Water is the one surface with no landmark to
   misalign, so the join has nothing to give it away.
   ================================================================== */

const PAPER = '#f2ecdd';
const INK = '#2b3446';

// Parallel strokes with a little wobble, which is what stops hatching
// from looking like a printed screen.
function hatch(ctx, x0, y0, x1, y1, step, alpha, rnd, wobble = 2.5) {
  ctx.lineWidth = 1;
  for (let y = y0; y < y1; y += step) {
    ctx.strokeStyle = `rgba(43, 52, 70, ${alpha * (0.55 + rnd() * 0.45)})`;
    ctx.beginPath();
    ctx.moveTo(x0, y + (rnd() - 0.5) * wobble);
    const mid = (x0 + x1) / 2;
    ctx.quadraticCurveTo(mid, y + (rnd() - 0.5) * wobble * 2, x1, y + (rnd() - 0.5) * wobble);
    ctx.stroke();
  }
}

// A scribbled clump — the unit that tropical canopy is built from here.
function inkClump(ctx, cx, cy, rx, ry, strokes, alpha, rnd) {
  for (let i = 0; i < strokes; i++) {
    const a = rnd() * Math.PI * 2;
    const r = Math.pow(rnd(), 0.6);
    const px = cx + Math.cos(a) * rx * r;
    const py = cy + Math.sin(a) * ry * r;
    ctx.strokeStyle = `rgba(43, 52, 70, ${alpha * (0.35 + rnd() * 0.65)})`;
    ctx.lineWidth = 0.8 + rnd() * 1.4;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + (rnd() - 0.5) * rx * 0.5, py - ry * (0.2 + rnd() * 0.5));
    ctx.stroke();
  }
}

// Ridge line with hatched shading on its far flank.
function ridge(ctx, x0, x1, baseY, height, rnd, alpha) {
  const pts = [];
  const steps = 26;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const bump = Math.sin(t * Math.PI * (1.5 + rnd() * 0.4)) * height
               + Math.sin(t * Math.PI * 7) * height * 0.12;
    pts.push([x0 + (x1 - x0) * t, baseY - Math.max(0, bump)]);
  }
  ctx.strokeStyle = `rgba(43, 52, 70, ${alpha})`;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (const [px, py] of pts) ctx.lineTo(px, py);
  ctx.stroke();
  // shade beneath the crest
  for (const [px, py] of pts) {
    if (rnd() > 0.55) continue;
    ctx.strokeStyle = `rgba(43, 52, 70, ${alpha * 0.5})`;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(px, py + 2);
    ctx.lineTo(px + (rnd() - 0.5) * 14, py + 6 + rnd() * (baseY - py) * 0.55);
    ctx.stroke();
  }
}

function paintSkyCoast(pixelWidth) {
  const { canvas, ctx } = equirectCanvas(pixelWidth);
  const rnd = mulberry32(90210);

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  // Sky: horizontal hatching that thins toward the horizon, so the paper
  // itself reads as the light near the skyline.
  for (let y = 0; y < HORIZON - 40; y += 5) {
    const t = 1 - y / (HORIZON - 40);           // 1 at the top
    if (rnd() > 0.25 + t * 0.7) continue;
    ctx.strokeStyle = `rgba(43, 52, 70, ${0.05 + t * 0.16})`;
    ctx.lineWidth = 0.8 + rnd() * 0.9;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= W; x += 128) ctx.lineTo(x, y + Math.sin(x * 0.004 + y) * 1.6);
    ctx.stroke();
  }

  // Sea below the horizon, denser as it recedes upward to the skyline.
  for (let y = HORIZON; y < H; y += 4) {
    const t = 1 - (y - HORIZON) / (H - HORIZON);
    ctx.strokeStyle = `rgba(43, 52, 70, ${0.06 + t * 0.14})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= W; x += 96) ctx.lineTo(x, y + Math.sin(x * 0.01 + y * 0.3) * 2);
    ctx.stroke();
  }

  return canvas;
}

function paintCloudsCoast(pixelWidth) {
  const { canvas, ctx } = equirectCanvas(pixelWidth);
  const rnd = mulberry32(1729);
  // Long thin cloud banks, drawn as stacked strokes rather than soft blobs.
  for (let i = 0; i < 26; i++) {
    const cx = rnd() * W;
    const cy = 90 + Math.pow(rnd(), 1.3) * 300;
    const len = 180 + rnd() * 520;
    const rows = 3 + Math.floor(rnd() * 6);
    wrapped(W, cx, (x) => {
      for (let r = 0; r < rows; r++) {
        ctx.strokeStyle = `rgba(43, 52, 70, ${0.05 + rnd() * 0.1})`;
        ctx.lineWidth = 0.9 + rnd() * 1.2;
        const y = cy + r * (3 + rnd() * 3);
        const half = (len / 2) * (1 - r / (rows + 2));
        ctx.beginPath();
        ctx.moveTo(x - half, y);
        ctx.quadraticCurveTo(x, y - 3 - rnd() * 4, x + half, y);
        ctx.stroke();
      }
    });
  }
  return canvas;
}

// A distant boat: hull plus sail, a few strokes only.
function boat(ctx, x, y, s, rnd) {
  ctx.strokeStyle = 'rgba(43, 52, 70, 0.75)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(x - s, y);
  ctx.quadraticCurveTo(x, y + s * 0.5, x + s, y);
  ctx.stroke();
  if (rnd() > 0.4) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - s * 1.7);
    ctx.lineTo(x + s * 0.8, y - s * 0.2);
    ctx.closePath();
    ctx.stroke();
  }
  // wake
  ctx.strokeStyle = 'rgba(43, 52, 70, 0.3)';
  ctx.beginPath();
  ctx.moveTo(x - s * 3.5, y + s * 0.7);
  ctx.lineTo(x + s * 3.5, y + s * 0.7);
  ctx.stroke();
}

function paintCoastScene(pixelWidth) {
  const { canvas, ctx } = equirectCanvas(pixelWidth);
  const rnd = mulberry32(51413);
  const hz = HORIZON;
  ctx.lineCap = 'round';

  /* ---- distant mountains, right around behind the land ---- */
  ridge(ctx, 560, 1300, hz + 4, 96, rnd, 0.5);
  ridge(ctx, 1080, 1700, hz + 2, 66, rnd, 0.38);

  /* ---- open water either side of the seam, with shipping ---- */
  const seaSpans = [[-320, 480], [1740, 2380]];
  for (const [a, b] of seaSpans) {
    for (let i = 0; i < 26; i++) {
      const x = a + rnd() * (b - a);
      const y = hz + 30 + Math.pow(rnd(), 1.8) * 300;
      const s = 4 + (y - hz) * 0.035;
      wrapped(W, ((x % W) + W) % W, (px) => boat(ctx, px, y, s, rnd));
    }
    // swell lines
    for (let i = 0; i < 90; i++) {
      const y = hz + 16 + Math.pow(rnd(), 1.5) * 420;
      const x = a + rnd() * (b - a);
      const len = 60 + rnd() * 220;
      ctx.strokeStyle = `rgba(43, 52, 70, ${0.12 + rnd() * 0.2})`;
      ctx.lineWidth = 0.9 + rnd() * 1.1;
      wrapped(W, ((x % W) + W) % W, (px) => {
        ctx.beginPath();
        ctx.moveTo(px - len / 2, y);
        ctx.quadraticCurveTo(px, y + 2 + rnd() * 3, px + len / 2, y);
        ctx.stroke();
      });
    }
  }

  /* ---- the shoreline: a bright band of paper left unhatched ---- */
  ctx.strokeStyle = 'rgba(43, 52, 70, 0.55)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (let x = 440; x <= 1700; x += 24) {
    const t = (x - 440) / 1260;
    const y = hz + 60 + Math.sin(t * Math.PI * 1.4) * 150 + Math.sin(t * 22) * 6;
    if (x === 440) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  /* ---- forested hills, x 560..1240 ---- */
  for (let i = 0; i < 520; i++) {
    const x = 540 + rnd() * 720;
    // nearer clumps sit lower down the frame and are drawn larger
    const depth = Math.pow(rnd(), 0.65);
    const y = hz + 40 + depth * 430;
    const r = 12 + depth * 52;
    wrapped(W, x, (px) => inkClump(ctx, px, y, r, r * 0.62, 8 + (depth * 14) | 0, 0.5, rnd));
  }

  /* ---- the river, cutting through the forest as unhatched paper ---- */
  ctx.save();
  ctx.strokeStyle = PAPER;
  ctx.lineWidth = 26;
  ctx.beginPath();
  for (let t = 0; t <= 1; t += 0.04) {
    const x = 980 + Math.sin(t * 3.1) * 130;
    const y = hz + 30 + t * 470;
    if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(43, 52, 70, 0.4)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();

  /* ---- the city, x 1240..1700 ---- */
  const blocks = [];
  for (let i = 0; i < 66; i++) {
    const depth = Math.pow(rnd(), 0.7);
    blocks.push({
      x: 1230 + rnd() * 500,
      base: hz + 26 + depth * 300,
      h: 40 + depth * 250 + rnd() * 90,
      w: 16 + depth * 46,
      depth,
    });
  }
  blocks.sort((a, b) => a.depth - b.depth);
  for (const b of blocks) {
    wrapped(W, b.x, (px) => {
      // knock the paper back out first so towers read in front of the canopy
      ctx.fillStyle = PAPER;
      ctx.fillRect(px - b.w / 2, b.base - b.h, b.w, b.h);
      ctx.strokeStyle = `rgba(43, 52, 70, ${0.5 + b.depth * 0.4})`;
      ctx.lineWidth = 1.1;
      ctx.strokeRect(px - b.w / 2, b.base - b.h, b.w, b.h);
      // storey lines — the hatching that gives a tower its tone
      const rows = Math.max(3, (b.h / 11) | 0);
      for (let r = 1; r < rows; r++) {
        if (rnd() > 0.8) continue;
        const y = b.base - b.h + (b.h / rows) * r;
        ctx.strokeStyle = `rgba(43, 52, 70, ${0.16 + rnd() * 0.24})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(px - b.w / 2 + 1.5, y);
        ctx.lineTo(px + b.w / 2 - 1.5, y);
        ctx.stroke();
      }
      // one shaded flank
      hatch(ctx, px + b.w * 0.12, b.base - b.h + 2, px + b.w / 2 - 1, b.base - 2,
            3.5, 0.22, rnd, 1);
    });
  }

  /* ---- foreground canopy along the bottom, tying the view to a vantage ---- */
  for (let i = 0; i < 240; i++) {
    const x = rnd() * W;
    const y = H - 230 + rnd() * 150;
    const r = 60 + rnd() * 130;
    wrapped(W, x, (px) => inkClump(ctx, px, y, r, r * 0.5, 22, 0.55, rnd));
  }

  /* ---- pole caps ----
     Flat tone at both poles. Every row at the very top and bottom collapses
     to a single point on the sphere, so anything with structure there tears
     into a starburst; a flat cap is the only thing that survives. */
  const zen = ctx.createLinearGradient(0, 0, 0, 190);
  zen.addColorStop(0.00, PAPER);
  zen.addColorStop(0.55, 'rgba(242, 236, 221, 0.85)');
  zen.addColorStop(1.00, 'rgba(242, 236, 221, 0)');
  ctx.fillStyle = zen;
  ctx.fillRect(0, 0, W, 190);

  const nad = ctx.createLinearGradient(0, H - 240, 0, H);
  nad.addColorStop(0.00, 'rgba(58, 68, 86, 0)');
  nad.addColorStop(0.55, 'rgba(58, 68, 86, 0.92)');
  nad.addColorStop(1.00, 'rgba(58, 68, 86, 1)');
  ctx.fillStyle = nad;
  ctx.fillRect(0, H - 240, W, 240);

  return canvas;
}

// Birds, to match the reference — a chevron rather than a glowing dot.
function paintBird(size = 64) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.strokeStyle = 'rgba(30, 38, 52, 0.9)';
  ctx.lineWidth = size * 0.07;
  ctx.lineCap = 'round';
  const m = size / 2;
  ctx.beginPath();
  ctx.moveTo(size * 0.16, m + size * 0.06);
  ctx.quadraticCurveTo(size * 0.34, m - size * 0.13, m, m);
  ctx.quadraticCurveTo(size * 0.66, m - size * 0.13, size * 0.84, m + size * 0.06);
  ctx.stroke();
  return c;
}

/* ------------------------------------------------------------------
   Scene registry
   ------------------------------------------------------------------ */

const SCENES = {
  coast: {
    sky: paintSkyCoast,
    scene: paintCoastScene,
    drift: paintCloudsCoast,
    driftOpacity: 0.5,
    driftSpeed: 0.004,
    particle: paintBird,
    particleCount: 26,
    particleSize: 12,
    particleTint: [1, 1, 1],
    loading: 'Menyiapkan panorama pesisir…',
  },
  forest: {
    sky: paintSkyForest,
    scene: paintForestScene,
    drift: paintCloudsForest,
    driftOpacity: 0.8,
    driftSpeed: 0.006,
    particle: paintFirefly,
    particleCount: 90,
    particleSize: 5,
    particleTint: [1, 1, 0.75],
    loading: 'Menyiapkan panorama hutan…',
  },
  ocean: {
    sky: paintSkyOcean,
    scene: paintOceanScene,
    drift: paintCloudsOcean,
    driftOpacity: 0.55,
    driftSpeed: 0.012,
    particle: paintBubble,
    particleCount: 150,
    particleSize: 4,
    particleTint: [0.85, 0.96, 1],
    loading: 'Menyiapkan panorama bawah laut…',
  },
  urban: {
    sky: paintSkyUrban,
    scene: paintUrbanScene,
    drift: paintCloudsUrban,
    driftOpacity: 0.75,
    driftSpeed: 0.005,
    particle: paintFirefly,
    particleCount: 60,
    particleSize: 4,
    particleTint: [1, 0.96, 0.8],
    loading: 'Menyiapkan panorama kota…',
  },
};

export function getScene(name) {
  return SCENES[name] || SCENES.forest;
}
