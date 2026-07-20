const BUILD_ID = 'air-writing-v1';
const TASKS_VISION_PATH = '/vendor/tasks-vision';

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
];

const SETS = [
  { id: 'vowels', label: 'Vocales', items: ['A', 'E', 'I', 'O', 'U'] },
  { id: 'consonants', label: 'Consonantes', items: ['M', 'P', 'L', 'S', 'T', 'N', 'D', 'R', 'F', 'B', 'K', 'Z'] },
  { id: 'syllables', label: 'Silabas', items: ['PA', 'PE', 'PI', 'PO', 'PU', 'MA', 'ME', 'MI', 'MO', 'MU', 'LA', 'LE', 'LI', 'LO', 'LU', 'SA', 'SE', 'SI', 'SO', 'SU'] },
];

const TUNING = {
  grabDistance: 118,
  pinchDistance: 72,
  pinchRaw: .095,
  grabStableMs: 220,
  lostHandMs: 680,
  smoothing: .38,
  brushSize: 34,
  hitRadius: 42,
  sampleStep: 7,
  scoreEveryMs: 160,
  cameraWidth: 640,
  cameraHeight: 480,
};

const stage = document.querySelector('#stage');
const templateCanvas = document.querySelector('#templateCanvas');
const drawCanvas = document.querySelector('#drawCanvas');
const handsCanvas = document.querySelector('#handsCanvas');
const templateCtx = templateCanvas.getContext('2d', { willReadFrequently: true });
const drawCtx = drawCanvas.getContext('2d');
const handsCtx = handsCanvas.getContext('2d');
const video = document.querySelector('#camera');
const marker = document.querySelector('#marker');
const cursor = document.querySelector('#cursor');

const ui = {
  cameraButton: document.querySelector('#cameraButton'),
  modeButton: document.querySelector('#modeButton'),
  nextButton: document.querySelector('#nextButton'),
  clearButton: document.querySelector('#clearButton'),
  modeLabel: document.querySelector('#modeLabel'),
  targetText: document.querySelector('#targetText'),
  coverageLabel: document.querySelector('#coverageLabel'),
  coverageBar: document.querySelector('#coverageBar'),
  cameraCard: document.querySelector('#cameraCard'),
  gestureLabel: document.querySelector('#gestureLabel'),
  cameraStatus: document.querySelector('#cameraStatus'),
  debugLine: document.querySelector('#debugLine'),
  feedback: document.querySelector('#feedback'),
};

const state = {
  modeIndex: 0,
  itemIndex: 0,
  handLandmarker: null,
  cameraReady: false,
  sendingFrames: false,
  frames: 0,
  handsSeen: 0,
  handSeenAt: 0,
  markerGrabbed: false,
  grabCandidateAt: 0,
  markerPoint: { x: 130, y: 520 },
  pointer: null,
  smoothedPointer: null,
  drawing: false,
  lastDrawPoint: null,
  targetSamples: [],
  strokes: [],
  coverage: 0,
  lastScoreAt: 0,
  touchDrawing: false,
};

function init() {
  bindEvents();
  resizeCanvases();
  setMode(0, 0);
  resetMarkerHome();
  requestAnimationFrame(tick);
  window.addEventListener('resize', () => {
    resizeCanvases();
    renderTemplate();
    redrawStrokes();
    resetMarkerHome(false);
  });
}

function bindEvents() {
  ui.cameraButton.addEventListener('click', startCamera);
  ui.modeButton.addEventListener('click', cycleMode);
  ui.nextButton.addEventListener('click', nextItem);
  ui.clearButton.addEventListener('click', clearDrawing);
  stage.addEventListener('pointerdown', startTouchDraw);
  stage.addEventListener('pointermove', moveTouchDraw);
  window.addEventListener('pointerup', stopTouchDraw);
}

function resizeCanvases() {
  const rect = stage.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  for (const canvas of [templateCanvas, drawCanvas, handsCanvas]) {
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }
  templateCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  handsCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawCtx.lineCap = 'round';
  drawCtx.lineJoin = 'round';
}

function setMode(modeIndex, itemIndex) {
  state.modeIndex = modeIndex;
  state.itemIndex = itemIndex;
  const mode = currentMode();
  const target = currentTarget();
  ui.modeButton.textContent = mode.label;
  ui.modeLabel.textContent = mode.label.toUpperCase();
  ui.targetText.textContent = target;
  clearDrawing();
  renderTemplate();
  setFeedback(`Ahora escribe ${target}`, '');
}

function currentMode() {
  return SETS[state.modeIndex];
}

function currentTarget() {
  return currentMode().items[state.itemIndex];
}

function cycleMode() {
  setMode((state.modeIndex + 1) % SETS.length, 0);
}

function nextItem() {
  const mode = currentMode();
  setMode(state.modeIndex, (state.itemIndex + 1) % mode.items.length);
}

function renderTemplate() {
  const rect = stage.getBoundingClientRect();
  templateCtx.clearRect(0, 0, rect.width, rect.height);
  const target = currentTarget();
  const isLong = target.length > 1;
  const fontSize = Math.min(rect.width * (isLong ? .35 : .47), rect.height * .54, isLong ? 260 : 360);
  const y = rect.height * (isLong ? .52 : .56);

  templateCtx.save();
  templateCtx.textAlign = 'center';
  templateCtx.textBaseline = 'middle';
  templateCtx.lineWidth = Math.max(18, fontSize * .055);
  templateCtx.strokeStyle = 'rgba(37, 99, 235, .26)';
  templateCtx.fillStyle = 'rgba(37, 99, 235, .08)';
  templateCtx.font = `1000 ${fontSize}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  templateCtx.strokeText(target, rect.width / 2, y);
  templateCtx.fillText(target, rect.width / 2, y);
  templateCtx.restore();

  state.targetSamples = sampleTemplate(rect);
  updateCoverage(true);
}

function sampleTemplate(rect) {
  const dpr = window.devicePixelRatio || 1;
  const image = templateCtx.getImageData(0, 0, Math.round(rect.width * dpr), Math.round(rect.height * dpr));
  const samples = [];
  const step = Math.max(5, Math.round(TUNING.sampleStep * dpr));
  for (let y = 0; y < image.height; y += step) {
    for (let x = 0; x < image.width; x += step) {
      const alpha = image.data[(y * image.width + x) * 4 + 3];
      if (alpha > 26) samples.push({ x: x / dpr, y: y / dpr });
    }
  }
  return samples;
}

function clearDrawing() {
  const rect = stage.getBoundingClientRect();
  drawCtx.clearRect(0, 0, rect.width, rect.height);
  state.strokes = [];
  state.lastDrawPoint = null;
  state.coverage = 0;
  updateCoverage(true);
}

async function startCamera() {
  ui.cameraButton.disabled = true;
  ui.cameraStatus.textContent = 'Solicitando permiso de camara...';
  try {
    await startRawCamera();
    state.cameraReady = true;
    ui.cameraStatus.textContent = 'Camara activa. Cargando detector de mano...';
    await startHandLandmarker();
  } catch (error) {
    ui.cameraButton.disabled = false;
    ui.gestureLabel.textContent = 'Camara no disponible';
    ui.cameraStatus.textContent = compactError(error);
    setFeedback('Puedes usar el dedo mientras revisamos la camara', 'warn');
  }
}

async function startRawCamera() {
  if (video.srcObject) {
    await video.play();
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Este navegador no expone getUserMedia.');
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: 'user',
      width: { ideal: TUNING.cameraWidth },
      height: { ideal: TUNING.cameraHeight },
    },
  });
  video.srcObject = stream;
  await video.play();
}

async function startHandLandmarker() {
  const { FilesetResolver, HandLandmarker } = await import(`${TASKS_VISION_PATH}/vision_bundle.mjs`);
  const vision = await FilesetResolver.forVisionTasks(TASKS_VISION_PATH);
  state.handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `${TASKS_VISION_PATH}/hand_landmarker.task`,
      delegate: 'CPU',
    },
    runningMode: 'VIDEO',
    numHands: 1,
    minHandDetectionConfidence: .35,
    minHandPresenceConfidence: .35,
    minTrackingConfidence: .35,
  });
  ui.cameraCard.classList.add('active');
  ui.gestureLabel.textContent = 'Detector listo';
  ui.cameraStatus.textContent = 'Haz pinza indice-pulgar para agarrar y pintar.';
  setFeedback('Agarra el rotulador con pinza', '');
  pumpFrames();
}

function pumpFrames() {
  if (state.sendingFrames) return;
  state.sendingFrames = true;
  const send = () => {
    if (!state.handLandmarker || !video.srcObject) {
      state.sendingFrames = false;
      return;
    }
    if (video.readyState >= 2) {
      const results = state.handLandmarker.detectForVideo(video, performance.now());
      state.frames += 1;
      handleHandResults(results);
    }
    requestAnimationFrame(send);
  };
  requestAnimationFrame(send);
}

function handleHandResults(results) {
  const hands = results.landmarks || [];
  if (!hands.length) {
    handleNoHand();
    return;
  }

  state.handSeenAt = performance.now();
  state.handsSeen += 1;
  const raw = hands[0];
  const mapped = raw.map(landmarkToStagePoint);
  const indexTip = mapped[8];
  const thumbTip = mapped[4];
  const pointer = smoothPoint(indexTip);
  const pinchPx = distance(indexTip, thumbTip);
  const pinchRaw = rawDistance(raw[8], raw[4]);
  const isPinching = pinchPx <= TUNING.pinchDistance || pinchRaw <= TUNING.pinchRaw;

  state.pointer = pointer;
  drawHand(mapped, pointer, isPinching);
  updateCursor(pointer, isPinching);
  processMarker(pointer, isPinching);
  ui.debugLine.textContent = `v=${BUILD_ID} frames=${state.frames} pinch=${Math.round(pinchPx)} cobertura=${Math.round(state.coverage)}%`;
}

function handleNoHand() {
  clearHands();
  state.pointer = null;
  state.smoothedPointer = null;
  updateCursor(null, false);
  if (state.markerGrabbed && performance.now() - state.handSeenAt > TUNING.lostHandMs) {
    state.drawing = false;
    state.lastDrawPoint = null;
    setFeedback('Buscando la mano otra vez', 'warn');
  }
  ui.gestureLabel.textContent = state.cameraReady ? 'Buscando mano' : 'Sin camara';
}

function processMarker(pointer, isPinching) {
  const now = performance.now();
  const markerDistance = distance(pointer, state.markerPoint);

  if (!state.markerGrabbed) {
    marker.classList.toggle('candidate', markerDistance <= TUNING.grabDistance);
    if (markerDistance <= TUNING.grabDistance && isPinching) {
      if (!state.grabCandidateAt) state.grabCandidateAt = now;
      if (now - state.grabCandidateAt >= TUNING.grabStableMs) grabMarker(pointer);
    } else {
      state.grabCandidateAt = 0;
    }
    ui.gestureLabel.textContent = isPinching ? 'Pinza' : 'Mano detectada';
    return;
  }

  state.markerPoint = pointer;
  setMarkerPosition(pointer);
  marker.classList.add('grabbed');
  ui.gestureLabel.textContent = isPinching ? 'Pintando' : 'Rotulador agarrado';

  if (isPinching) {
    state.drawing = true;
    drawAt(pointer);
    setFeedback('Pintando en el aire', '');
  } else {
    state.drawing = false;
    state.lastDrawPoint = null;
    setFeedback('Cierra la pinza para pintar', '');
  }
}

function grabMarker(point) {
  state.markerGrabbed = true;
  state.markerPoint = point;
  state.grabCandidateAt = 0;
  setMarkerPosition(point);
  marker.classList.remove('candidate');
  marker.classList.add('grabbed');
  setFeedback('Rotulador agarrado. Mantén pinza para pintar', 'good');
}

function drawAt(point) {
  const rect = stage.getBoundingClientRect();
  const p = {
    x: clamp(point.x, 0, rect.width),
    y: clamp(point.y, 0, rect.height),
  };

  drawCtx.strokeStyle = '#172033';
  drawCtx.lineWidth = TUNING.brushSize;
  drawCtx.lineCap = 'round';
  drawCtx.lineJoin = 'round';
  drawCtx.shadowColor = 'rgba(37, 99, 235, .22)';
  drawCtx.shadowBlur = 12;

  if (!state.lastDrawPoint) {
    drawCtx.beginPath();
    drawCtx.arc(p.x, p.y, TUNING.brushSize / 2, 0, Math.PI * 2);
    drawCtx.fillStyle = '#172033';
    drawCtx.fill();
    state.strokes.push({ x1: p.x, y1: p.y, x2: p.x, y2: p.y });
  } else {
    drawCtx.beginPath();
    drawCtx.moveTo(state.lastDrawPoint.x, state.lastDrawPoint.y);
    drawCtx.lineTo(p.x, p.y);
    drawCtx.stroke();
    state.strokes.push({ x1: state.lastDrawPoint.x, y1: state.lastDrawPoint.y, x2: p.x, y2: p.y });
  }
  state.lastDrawPoint = p;

  const now = performance.now();
  if (now - state.lastScoreAt >= TUNING.scoreEveryMs) {
    updateCoverage();
    state.lastScoreAt = now;
  }
}

function updateCoverage(force = false) {
  if (!state.targetSamples.length) {
    state.coverage = 0;
  } else if (force || state.strokes.length) {
    const sampleCount = Math.min(900, state.targetSamples.length);
    const step = Math.max(1, Math.floor(state.targetSamples.length / sampleCount));
    let covered = 0;
    let total = 0;
    for (let i = 0; i < state.targetSamples.length; i += step) {
      total += 1;
      if (isSampleCovered(state.targetSamples[i])) covered += 1;
    }
    state.coverage = total ? Math.round((covered / total) * 100) : 0;
  }

  ui.coverageLabel.textContent = `${state.coverage}%`;
  ui.coverageBar.style.width = `${state.coverage}%`;
  if (state.coverage >= 72) {
    setFeedback('Muy bien. Letra cubierta', 'good');
  }
}

function isSampleCovered(sample) {
  const radius = TUNING.hitRadius;
  const radiusSq = radius * radius;
  for (let i = state.strokes.length - 1; i >= 0; i -= 1) {
    const segment = state.strokes[i];
    if (pointSegmentDistanceSq(sample, segment) <= radiusSq) return true;
  }
  return false;
}

function redrawStrokes() {
  const previous = [...state.strokes];
  const rect = stage.getBoundingClientRect();
  drawCtx.clearRect(0, 0, rect.width, rect.height);
  state.strokes = [];
  state.lastDrawPoint = null;
  for (const segment of previous) {
    drawCtx.strokeStyle = '#172033';
    drawCtx.lineWidth = TUNING.brushSize;
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';
    drawCtx.beginPath();
    drawCtx.moveTo(segment.x1, segment.y1);
    drawCtx.lineTo(segment.x2, segment.y2);
    drawCtx.stroke();
    state.strokes.push(segment);
  }
  updateCoverage(true);
}

function startTouchDraw(event) {
  if (event.target.closest('button')) return;
  state.touchDrawing = true;
  const point = eventToStagePoint(event);
  state.markerGrabbed = true;
  state.markerPoint = point;
  setMarkerPosition(point);
  marker.classList.add('grabbed');
  updateCursor(point, true);
  drawAt(point);
}

function moveTouchDraw(event) {
  if (!state.touchDrawing) return;
  const point = eventToStagePoint(event);
  state.markerPoint = point;
  setMarkerPosition(point);
  updateCursor(point, true);
  drawAt(point);
}

function stopTouchDraw() {
  if (!state.touchDrawing) return;
  state.touchDrawing = false;
  state.lastDrawPoint = null;
  updateCursor(state.markerPoint, false);
}

function eventToStagePoint(event) {
  const rect = stage.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function landmarkToStagePoint(point) {
  const rect = stage.getBoundingClientRect();
  return {
    x: (1 - point.x) * rect.width,
    y: point.y * rect.height,
  };
}

function smoothPoint(point) {
  if (!state.smoothedPointer) {
    state.smoothedPointer = { ...point };
    return state.smoothedPointer;
  }
  state.smoothedPointer = {
    x: state.smoothedPointer.x + (point.x - state.smoothedPointer.x) * TUNING.smoothing,
    y: state.smoothedPointer.y + (point.y - state.smoothedPointer.y) * TUNING.smoothing,
  };
  return state.smoothedPointer;
}

function drawHand(points, pointer, isPinching) {
  clearHands();
  handsCtx.save();
  handsCtx.lineWidth = 4;
  handsCtx.strokeStyle = isPinching ? 'rgba(22, 163, 74, .88)' : 'rgba(37, 99, 235, .72)';
  for (const [a, b] of HAND_CONNECTIONS) {
    handsCtx.beginPath();
    handsCtx.moveTo(points[a].x, points[a].y);
    handsCtx.lineTo(points[b].x, points[b].y);
    handsCtx.stroke();
  }
  points.forEach((point, index) => {
    handsCtx.beginPath();
    handsCtx.fillStyle = index === 8 || index === 4 ? '#16a34a' : '#2563eb';
    handsCtx.arc(point.x, point.y, index === 8 ? 9 : 5, 0, Math.PI * 2);
    handsCtx.fill();
  });
  handsCtx.beginPath();
  handsCtx.strokeStyle = 'rgba(22, 163, 74, .95)';
  handsCtx.lineWidth = 5;
  handsCtx.arc(pointer.x, pointer.y, 24, 0, Math.PI * 2);
  handsCtx.stroke();
  handsCtx.restore();
}

function clearHands() {
  const rect = stage.getBoundingClientRect();
  handsCtx.clearRect(0, 0, rect.width, rect.height);
}

function updateCursor(point, active) {
  if (!point) {
    cursor.style.left = '-100px';
    cursor.style.top = '-100px';
    cursor.classList.remove('drawing');
    return;
  }
  cursor.style.left = `${point.x}px`;
  cursor.style.top = `${point.y}px`;
  cursor.classList.toggle('drawing', Boolean(active));
}

function resetMarkerHome(keepGrab = true) {
  const rect = stage.getBoundingClientRect();
  if (!keepGrab) state.markerGrabbed = false;
  if (!state.markerGrabbed) {
    state.markerPoint = { x: rect.width * .16, y: rect.height - 82 };
    setMarkerPosition(state.markerPoint);
    marker.classList.remove('grabbed', 'candidate');
  }
}

function setMarkerPosition(point) {
  marker.style.left = `${point.x}px`;
  marker.style.top = `${point.y}px`;
  marker.style.bottom = 'auto';
}

function tick() {
  if (!state.pointer && state.cameraReady && performance.now() - state.handSeenAt > 900) {
    ui.debugLine.textContent = `v=${BUILD_ID} buscando mano frames=${state.frames}`;
  }
  requestAnimationFrame(tick);
}

function setFeedback(text, kind) {
  ui.feedback.textContent = text;
  ui.feedback.classList.toggle('good', kind === 'good');
  ui.feedback.classList.toggle('warn', kind === 'warn');
}

function pointSegmentDistanceSq(point, segment) {
  const vx = segment.x2 - segment.x1;
  const vy = segment.y2 - segment.y1;
  const wx = point.x - segment.x1;
  const wy = point.y - segment.y1;
  const lenSq = vx * vx + vy * vy;
  const t = lenSq ? clamp((wx * vx + wy * vy) / lenSq, 0, 1) : 0;
  const x = segment.x1 + vx * t;
  const y = segment.y1 + vy * t;
  const dx = point.x - x;
  const dy = point.y - y;
  return dx * dx + dy * dy;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function rawDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function compactError(error) {
  const message = error?.message || String(error);
  return message.length > 120 ? `${message.slice(0, 117)}...` : message;
}

init();
