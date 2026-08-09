/* Types for pano-scenes.js, which is carried over from the old site BYTE FOR
 * BYTE and must stay that way.
 *
 * It is 1243 lines of pure canvas painting: four equirectangular scenes plus
 * their skies, drift layers and particle sprites, all deterministic through a
 * seeded mulberry32. It touches no framework, no window, no events — only
 * document.createElement('canvas'). Rewriting it would be risk with no return,
 * so it is imported unchanged and described from the outside here. */

export type SceneName = 'coast' | 'forest' | 'ocean' | 'urban';

export type PanoScene = {
  /** Opaque backdrop shell. */
  sky: (size: number) => HTMLCanvasElement;
  /** The scene itself, transparent where the backdrop should show through. */
  scene: (size: number) => HTMLCanvasElement;
  /** Slowly rotating middle layer. */
  drift: (size: number) => HTMLCanvasElement;
  driftOpacity: number;
  driftSpeed: number;
  /** Sprite for the particle system. */
  particle: (size: number) => HTMLCanvasElement;
  particleCount: number;
  particleSize: number;
  /** Linear RGB multiplier, 0-1 per channel. */
  particleTint: [number, number, number];
  /** Loader copy while the textures are being painted. */
  loading: string;
};

/** Unknown names fall back to the forest scene. */
export function getScene(name: string | undefined): PanoScene;
