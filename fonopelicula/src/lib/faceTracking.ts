/**
 * Carga de MediaPipe Face Landmarker (usada por PraxiasGame), mismo patrón
 * que handTracking.ts. Assets vendorizados en public/mediapipe + public/models.
 */

const BUNDLE_URL = '/mediapipe/vision_bundle.mjs';
const WASM_ROOT = '/mediapipe';
const MODEL_URL = '/models/face_landmarker.task';

export interface FacePoint {
  x: number;
  y: number;
  z: number;
}

export type FaceLandmarkerLike = {
  detectForVideo: (video: HTMLVideoElement, ts: number) => {
    faceLandmarks: FacePoint[][];
  };
  close: () => void;
};

export async function loadFaceLandmarker(): Promise<FaceLandmarkerLike> {
  const mod = (await import(/* @vite-ignore */ BUNDLE_URL)) as {
    FilesetResolver: { forVisionTasks: (root: string) => Promise<unknown> };
    FaceLandmarker: {
      createFromOptions: (vision: unknown, opts: unknown) => Promise<FaceLandmarkerLike>;
    };
  };
  const vision = await mod.FilesetResolver.forVisionTasks(WASM_ROOT);
  return mod.FaceLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URL },
    runningMode: 'VIDEO',
    numFaces: 1,
    outputFaceBlendshapes: false,
  });
}

export async function startFaceCamera(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
    audio: false,
  });
}
