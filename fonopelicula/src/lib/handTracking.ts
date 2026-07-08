/**
 * Carga compartida de MediaPipe Hands (usada por AirPaintGame y HandCatchGame).
 * Assets vendorizados en public/mediapipe + public/models, sin CDN.
 */

const BUNDLE_URL = '/mediapipe/vision_bundle.mjs';
const WASM_ROOT = '/mediapipe';
const MODEL_URL = '/models/hand_landmarker.task';

export interface HandPoint {
  x: number;
  y: number;
  z: number;
}

export type HandLandmarkerLike = {
  detectForVideo: (video: HTMLVideoElement, ts: number) => {
    landmarks: HandPoint[][];
  };
  close: () => void;
};

export async function loadHandLandmarker(numHands: 1 | 2 = 1): Promise<HandLandmarkerLike> {
  const mod = (await import(/* @vite-ignore */ BUNDLE_URL)) as {
    FilesetResolver: { forVisionTasks: (root: string) => Promise<unknown> };
    HandLandmarker: {
      createFromOptions: (vision: unknown, opts: unknown) => Promise<HandLandmarkerLike>;
    };
  };
  const vision = await mod.FilesetResolver.forVisionTasks(WASM_ROOT);
  return mod.HandLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URL },
    runningMode: 'VIDEO',
    numHands,
  });
}

export async function startHandCamera(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
    audio: false,
  });
}
