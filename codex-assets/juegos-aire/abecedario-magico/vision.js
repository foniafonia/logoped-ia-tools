import { detectFaceGesture, detectHandsGesture, StableGestureDetector, SwipeGestureDetector } from './gesture-detector.js';

const TASKS_PATH = './vendor/tasks-vision';
const FRAME_INTERVAL_MS = 90;

export class VisionController {
  constructor({ video, canvas, onUpdate, onStatus }) {
    this.video = video;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onUpdate = onUpdate;
    this.onStatus = onStatus;
    this.mode = 'manual';
    this.stream = null;
    this.fileset = null;
    this.handLandmarker = null;
    this.faceLandmarker = null;
    this.running = false;
    this.lastRunAt = 0;
    this.lastFpsAt = 0;
    this.frames = 0;
    this.fps = 0;
    this.stable = new StableGestureDetector();
    this.swipe = new SwipeGestureDetector();
  }

  async start(mode) {
    this.mode = mode;
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Este navegador no ofrece getUserMedia.');
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 960 },
        height: { ideal: 720 },
      },
      audio: false,
    });
    this.video.srcObject = this.stream;
    await this.video.play();
    await this.loadModels(mode);
    this.running = true;
    this.onStatus?.('Camara activa');
    requestAnimationFrame((time) => this.loop(time));
  }

  stop() {
    this.running = false;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.clear();
    this.stable.reset();
    this.swipe.reset();
  }

  async loadModels(mode) {
    if (!this.fileset) {
      const vision = await import(`${TASKS_PATH}/vision_bundle.mjs`);
      this.FilesetResolver = vision.FilesetResolver;
      this.HandLandmarker = vision.HandLandmarker;
      this.FaceLandmarker = vision.FaceLandmarker;
      this.fileset = await this.FilesetResolver.forVisionTasks(TASKS_PATH);
    }

    if ((mode === 'hands' || mode === 'mixed') && !this.handLandmarker) {
      this.handLandmarker = await this.HandLandmarker.createFromOptions(this.fileset, {
        baseOptions: {
          modelAssetPath: `${TASKS_PATH}/hand_landmarker.task`,
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.35,
        minHandPresenceConfidence: 0.35,
        minTrackingConfidence: 0.35,
      });
    }

    if ((mode === 'face' || mode === 'mixed') && !this.faceLandmarker) {
      this.faceLandmarker = await this.FaceLandmarker.createFromOptions(this.fileset, {
        baseOptions: {
          modelAssetPath: `${TASKS_PATH}/face_landmarker.task`,
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        minFaceDetectionConfidence: 0.4,
        minFacePresenceConfidence: 0.4,
        minTrackingConfidence: 0.4,
      });
    }
  }

  loop(time) {
    if (!this.running) return;
    requestAnimationFrame((next) => this.loop(next));

    if (time - this.lastRunAt < FRAME_INTERVAL_MS) return;
    this.lastRunAt = time;
    this.frames += 1;
    if (time - this.lastFpsAt >= 1000) {
      this.fps = this.frames;
      this.frames = 0;
      this.lastFpsAt = time;
    }

    this.resizeCanvas();
    let best = { gesture: 'none', confidence: 0, marker: null };
    let handResult = null;
    let faceResult = null;

    try {
      if ((this.mode === 'hands' || this.mode === 'mixed') && this.handLandmarker) {
        handResult = this.handLandmarker.detectForVideo(this.video, performance.now());
        const handGesture = detectHandsGesture(handResult);
        const swipe = this.swipe.update(handGesture.swipeMarker, time);
        best = {
          gesture: swipe.gesture,
          confidence: handGesture.confidence,
          marker: handGesture.marker,
          deltaX: swipe.dx,
          deltaY: swipe.dy,
        };
      }
      if ((this.mode === 'face' || this.mode === 'mixed') && this.faceLandmarker) {
        faceResult = this.faceLandmarker.detectForVideo(this.video, performance.now());
        const faceGesture = detectFaceGesture(faceResult);
        if (faceGesture.confidence > best.confidence || best.gesture === 'none') best = faceGesture;
      }
    } catch (error) {
      this.onStatus?.(`Vision pausada: ${error.message}`);
    }

    const stable = this.stable.update(best.gesture, time);
    this.draw(handResult, faceResult, stable);
    this.onUpdate?.({
      gesture: stable.stable,
      rawGesture: stable.raw,
      stability: stable.progress,
      confidence: best.confidence,
      fps: this.fps,
      marker: best.marker || null,
    });
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width * window.devicePixelRatio));
    const height = Math.max(1, Math.round(rect.height * window.devicePixelRatio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  draw(handResult, faceResult, stable) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.scale(w, h);
    ctx.translate(1, 0);
    ctx.scale(-1, 1);
    ctx.lineWidth = 0.006;
    ctx.strokeStyle = 'rgba(11, 95, 122, .95)';
    ctx.fillStyle = 'rgba(12, 128, 92, .95)';

    (handResult?.landmarks || []).forEach((hand) => {
      hand.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 0.012, 0, Math.PI * 2);
        ctx.fill();
      });
      drawLine(ctx, hand, [0, 5, 9, 13, 17, 0]);
      drawLine(ctx, hand, [0, 1, 2, 3, 4]);
      drawLine(ctx, hand, [5, 6, 7, 8]);
      drawLine(ctx, hand, [9, 10, 11, 12]);
      drawLine(ctx, hand, [13, 14, 15, 16]);
      drawLine(ctx, hand, [17, 18, 19, 20]);
    });

    const face = faceResult?.faceLandmarks?.[0];
    if (face) {
      ctx.strokeStyle = 'rgba(118, 64, 191, .95)';
      [1, 4, 33, 263, 10, 152].forEach((index) => {
        const point = face[index];
        if (!point) return;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 0.01, 0, Math.PI * 2);
        ctx.stroke();
      });
    }
    const marker = detectHandsGesture(handResult).marker;
    if (marker) {
      const radius = 0.05;
      ctx.fillStyle = 'rgba(255, 212, 90, .28)';
      ctx.strokeStyle = 'rgba(255, 255, 255, .95)';
      ctx.lineWidth = 0.008;
      ctx.beginPath();
      ctx.arc(marker.x, marker.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = 'rgba(9, 107, 122, .96)';
      ctx.lineWidth = 0.01;
      ctx.beginPath();
      ctx.moveTo(marker.x - 0.1, marker.y);
      ctx.lineTo(marker.x + 0.1, marker.y);
      ctx.stroke();
    }

    ctx.restore();

    ctx.fillStyle = stable.stable === 'none' ? 'rgba(194, 65, 75, .9)' : 'rgba(12, 128, 92, .92)';
    ctx.fillRect(0, h - 8, w * stable.progress, 8);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

function drawLine(ctx, points, indexes) {
  ctx.beginPath();
  indexes.forEach((index, i) => {
    const point = points[index];
    if (!point) return;
    if (i === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();
}
