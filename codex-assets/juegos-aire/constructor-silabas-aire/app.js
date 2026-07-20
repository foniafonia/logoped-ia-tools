const MEDIAPIPE_PATH = '/vendor/mediapipe/';
const TASKS_VISION_PATH = '/vendor/tasks-vision';
const BUILD_ID = 'tasks-vision-facepointer-v20';
const INDEX_TIP = 8;
const FACE_MODEL_PATH = `${TASKS_VISION_PATH}/face_landmarker.task`;
const GAZE_DWELL_MS = 1350;
const GAZE_STABLE_PX = 128;
const GAZE_FACE_INTERVAL_MS = 82;
const GAZE_STORAGE_KEY = 'constructor-silabas-gaze-calibration-v20';
const GAZE_HEAD_COMPENSATION = {
  yaw: .05,
  pitch: .06,
  rollX: .04,
  rollY: .04,
};
const GAZE_HEAD_ASSIST = {
  yaw: .58,
  pitch: .72,
};
const FACE_POINTS = {
  rightEye: { corners: [33, 133], upper: 159, lower: 145, iris: [468, 469, 470, 471, 472] },
  leftEye: { corners: [362, 263], upper: 386, lower: 374, iris: [473, 474, 475, 476, 477] },
};
const CALIBRATION_STEPS = [
  { id: 'center', label: 'centro', x: .5, y: .5 },
  { id: 'topLeft', label: 'arriba izquierda', x: .12, y: .12 },
  { id: 'top', label: 'arriba', x: .5, y: .1 },
  { id: 'topRight', label: 'arriba derecha', x: .88, y: .12 },
  { id: 'left', label: 'izquierda', x: .1, y: .5 },
  { id: 'right', label: 'derecha', x: .9, y: .5 },
  { id: 'bottomLeft', label: 'abajo izquierda', x: .12, y: .88 },
  { id: 'down', label: 'abajo', x: .5, y: .9 },
  { id: 'bottomRight', label: 'abajo derecha', x: .88, y: .88 },
];
const CALIBRATION_VERTICAL_STEPS = [
  { id: 'top', label: 'arriba', x: .5, y: .1 },
  { id: 'center', label: 'centro', x: .5, y: .5 },
  { id: 'down', label: 'abajo', x: .5, y: .9 },
];
const CALIBRATION_HORIZONTAL_STEPS = [
  { id: 'left', label: 'izquierda', x: .1, y: .5 },
  { id: 'center', label: 'centro', x: .5, y: .5 },
  { id: 'right', label: 'derecha', x: .9, y: .5 },
];

const leftSyllables = ['CA', 'MA', 'PA', 'ME', 'BO', 'SO', 'LU', 'TA', 'PI', 'RA'];
const rightSyllables = ['SA', 'PA', 'LA', 'CA', 'NA', 'ZA', 'SO', 'MA', 'TO', 'RA'];
const targets = [
  { word: 'CASA', left: 'CA', right: 'SA', hint: 'Une CA + SA' },
  { word: 'MAPA', left: 'MA', right: 'PA', hint: 'Une MA + PA' },
  { word: 'PALA', left: 'PA', right: 'LA', hint: 'Une PA + LA' },
  { word: 'MESA', left: 'ME', right: 'SA', hint: 'Une ME + SA' },
  { word: 'BOCA', left: 'BO', right: 'CA', hint: 'Une BO + CA' },
  { word: 'SOPA', left: 'SO', right: 'PA', hint: 'Une SO + PA' },
  { word: 'LUNA', left: 'LU', right: 'NA', hint: 'Une LU + NA' },
  { word: 'TAZA', left: 'TA', right: 'ZA', hint: 'Une TA + ZA' },
  { word: 'PISO', left: 'PI', right: 'SO', hint: 'Une PI + SO' },
  { word: 'RAMA', left: 'RA', right: 'MA', hint: 'Une RA + MA' },
];

const stage = document.querySelector('.stage');
const video = document.querySelector('#camera');
const handsCanvas = document.querySelector('#handsLayer');
const handsCtx = handsCanvas.getContext('2d');
const leftWheel = document.querySelector('#leftWheel');
const rightWheel = document.querySelector('#rightWheel');
const airCursor = document.querySelector('#airCursor');
const gazeCursor = document.querySelector('#gazeCursor');
const calibrationTarget = document.querySelector('#calibrationTarget');

const ui = {
  score: document.querySelector('#score'),
  streak: document.querySelector('#streak'),
  attempts: document.querySelector('#attempts'),
  targetWord: document.querySelector('#targetWord'),
  targetHint: document.querySelector('#targetHint'),
  leftSlot: document.querySelector('#leftSlot'),
  rightSlot: document.querySelector('#rightSlot'),
  resultWord: document.querySelector('#resultWord'),
  feedback: document.querySelector('#feedback'),
  cameraStatus: document.querySelector('#cameraStatus'),
  cameraButton: document.querySelector('#cameraButton'),
  nextButton: document.querySelector('#nextButton'),
  readButton: document.querySelector('#readButton'),
  clearButton: document.querySelector('#clearButton'),
  levelButton: document.querySelector('#levelButton'),
  controlModeButton: document.querySelector('#controlModeButton'),
  handModeButton: document.querySelector('#handModeButton'),
  gazeCalibrateButton: document.querySelector('#gazeCalibrateButton'),
  gazeCalibrateVerticalButton: document.querySelector('#gazeCalibrateVerticalButton'),
  gazeCalibrateHorizontalButton: document.querySelector('#gazeCalibrateHorizontalButton'),
  handDebug: document.querySelector('#handDebug'),
};

const state = {
  targetIndex: 0,
  score: 0,
  streak: 0,
  attempts: 0,
  left: '',
  right: '',
  supportMode: false,
  controlMode: 'hand',
  handMode: 'one',
  cameraReady: false,
  sendingFrame: false,
  tasksVision: null,
  handLandmarker: null,
  faceLandmarker: null,
  handEngine: 'none',
  faceEngine: 'none',
  mediaPipeErrors: 0,
  framesSent: 0,
  resultsSeen: 0,
  handsSeen: 0,
  hoverId: '',
  hoverStartedAt: 0,
  selectedElement: null,
  previewElements: {
    left: null,
    right: null,
  },
  previews: {
    left: null,
    right: null,
  },
  fix: {
    left: { targetId: '', startedAt: 0, lastPoint: null, selectedAt: 0 },
    right: { targetId: '', startedAt: 0, lastPoint: null, selectedAt: 0 },
  },
  wand: {
    targetId: '',
    startedAt: 0,
    lastPoint: null,
    smoothPoint: null,
    selectedAt: 0,
    element: null,
  },
  gaze: {
    raw: null,
    smooth: null,
    calibrated: false,
    params: null,
    lastFaceRunAt: 0,
    lastGoodPoint: null,
    lowConfidenceFrames: 0,
    element: null,
    targetId: '',
    startedAt: 0,
    lastPoint: null,
    selectedAt: 0,
    faceSeenAt: 0,
    calibration: {
      active: false,
      mode: 'full',
      index: 0,
      startedAt: 0,
      samples: [],
      points: {},
      repeats: {},
      steps: CALIBRATION_STEPS,
    },
  },
  handSeenAt: 0,
  lastAirSelectionAt: 0,
  lastCameraFeedbackAt: 0,
  visibleLandmarks: 0,
  mappingMode: 'mirror',
};

function init() {
  buildWheel(leftWheel, leftSyllables, 'left');
  buildWheel(rightWheel, rightSyllables, 'right');
  bindEvents();
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  loadStoredGazeCalibration();
  setTarget(0);

  if (isFilePage()) {
    ui.cameraStatus.textContent = `${BUILD_ID}. Abre esta app con localhost o Vercel; file:// no carga bien MediaPipe Tasks.`;
    setHandDebug('Abre http://localhost:4179 o Vercel. No uses index.html directo.', '');
    return;
  }

  if (window.Hands) {
    ui.cameraStatus.textContent = `${BUILD_ID}. Pulsa Activar camara.`;
  } else {
    ui.cameraStatus.textContent = `${BUILD_ID}. MediaPipe legacy no ha cargado; Tasks Vision se cargara al activar camara.`;
  }
}

function buildWheel(container, syllables, side) {
  const radius = 39;
  syllables.forEach((syllable, index) => {
    const angle = -90 + (360 / syllables.length) * index;
    const x = 50 + Math.cos((angle * Math.PI) / 180) * radius;
    const y = 50 + Math.sin((angle * Math.PI) / 180) * radius;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'syllable-btn';
    button.textContent = syllable;
    button.dataset.side = side;
    button.dataset.syllable = syllable;
    button.dataset.id = `${side}-${index}-${syllable}`;
    button.style.left = `${x}%`;
    button.style.top = `${y}%`;
    button.addEventListener('click', () => selectSyllable(side, syllable, button));
    container.appendChild(button);
  });
}

function bindEvents() {
  ui.cameraButton.addEventListener('click', startCamera);
  ui.nextButton.addEventListener('click', nextTarget);
  ui.readButton.addEventListener('click', readCurrent);
  ui.clearButton.addEventListener('click', clearWord);
  ui.levelButton.addEventListener('click', toggleSupportMode);
  ui.controlModeButton.addEventListener('click', toggleControlMode);
  ui.handModeButton.addEventListener('click', toggleHandMode);
  ui.gazeCalibrateButton.addEventListener('click', () => startGazeCalibration('full'));
  ui.gazeCalibrateVerticalButton.addEventListener('click', () => startGazeCalibration('vertical'));
  ui.gazeCalibrateHorizontalButton.addEventListener('click', () => startGazeCalibration('horizontal'));
  ui.leftSlot.addEventListener('click', () => clearSide('left'));
  ui.rightSlot.addEventListener('click', () => clearSide('right'));

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Backspace') clearWord();
    if (event.key === 'Enter') readCurrent();
    if (event.key.toLowerCase() === 'n') nextTarget();
  });
}

function resizeCanvas() {
  const rect = stage.getBoundingClientRect();
  handsCanvas.width = Math.max(1, Math.floor(rect.width));
  handsCanvas.height = Math.max(1, Math.floor(rect.height));
}

function setTarget(index) {
  state.targetIndex = index % targets.length;
  const target = currentTarget();
  ui.targetWord.textContent = target.word;
  ui.targetHint.textContent = state.supportMode ? target.hint : 'Escucha, mira y construye';
  clearWord();
  markHints();
}

function currentTarget() {
  return targets[state.targetIndex];
}

function nextTarget() {
  setTarget(state.targetIndex + 1);
  setFeedback('Nueva palabra preparada.', '');
}

function clearWord() {
  state.left = '';
  state.right = '';
  resetFixState();
  resetWandFix();
  resetGazeFix();
  document.querySelectorAll('.syllable-btn.selected').forEach((el) => el.classList.remove('selected'));
  renderWord();
}

function clearSide(side) {
  state[side] = '';
  document.querySelectorAll(`.syllable-btn[data-side="${side}"].selected`).forEach((el) => el.classList.remove('selected'));
  renderWord();
}

function selectSyllable(side, syllable, element) {
  state[side] = syllable;
  document.querySelectorAll(`.syllable-btn[data-side="${side}"].selected`).forEach((el) => el.classList.remove('selected'));
  element.classList.add('selected');
  setFeedback(`${side === 'left' ? 'Primera' : 'Segunda'} silaba: ${syllable}`, '');
  speakShort(syllable);
  renderWord();
  if (state.left && state.right) validateWord();
}

function renderWord() {
  ui.leftSlot.textContent = state.left || '--';
  ui.rightSlot.textContent = state.right || '--';
  ui.leftSlot.classList.toggle('filled', Boolean(state.left));
  ui.rightSlot.classList.toggle('filled', Boolean(state.right));
  const built = `${state.left}${state.right}`;
  ui.resultWord.textContent = built || 'Toca dos silabas';
}

function validateWord() {
  state.attempts += 1;
  const target = currentTarget();
  const built = `${state.left}${state.right}`;

  if (built === target.word) {
    state.score += 1;
    state.streak += 1;
    setFeedback(`Correcto: ${target.left} + ${target.right} = ${target.word}`, 'ok');
    speakShort(target.word);
    setTimeout(() => setTarget(state.targetIndex + 1), 1100);
  } else {
    state.streak = 0;
    setFeedback(`Ahora has formado ${built}. Busca ${target.word}.`, 'bad');
    speakShort(built);
  }

  updateStats();
}

function updateStats() {
  ui.score.textContent = state.score;
  ui.streak.textContent = state.streak;
  ui.attempts.textContent = state.attempts;
}

function setFeedback(text, kind) {
  ui.feedback.textContent = text;
  ui.feedback.classList.toggle('ok', kind === 'ok');
  ui.feedback.classList.toggle('bad', kind === 'bad');
}

function toggleSupportMode() {
  state.supportMode = !state.supportMode;
  ui.levelButton.setAttribute('aria-pressed', String(state.supportMode));
  ui.targetHint.textContent = state.supportMode ? currentTarget().hint : 'Escucha, mira y construye';
  markHints();
}

function toggleControlMode() {
  const order = ['hand', 'eyes', 'face', 'mixed'];
  const next = order[(order.indexOf(state.controlMode) + 1) % order.length];
  setControlMode(next);
}

function setControlMode(mode) {
  state.controlMode = mode;
  const labels = {
    hand: 'Modo mano',
    eyes: 'Modo ojos',
    face: 'Modo cara',
    mixed: 'Modo mixto',
  };
  ui.controlModeButton.textContent = labels[mode];
  ui.controlModeButton.setAttribute('aria-pressed', String(mode !== 'hand'));
  resetWandFix();
  resetFixState();
  resetGazeFix();
  clearHandPreviews();
  clearAirHover();
  setFeedback({
    hand: 'Modo mano: usa la varita o dos manos.',
    eyes: 'Modo ojos: mira una sílaba y mantén.',
    face: 'Modo cara: apunta moviendo cara/cuello y mantén.',
    mixed: 'Modo mixto: mirada y mano pueden ayudar a seleccionar.',
  }[mode], '');
}

function toggleHandMode() {
  state.handMode = state.handMode === 'one' ? 'two' : 'one';
  ui.handModeButton.textContent = state.handMode === 'one' ? '1 mano' : '2 manos';
  ui.handModeButton.setAttribute('aria-pressed', String(state.handMode === 'two'));
  resetWandFix();
  resetFixState();
  clearHandPreviews();
  clearAirHover();
  setFeedback(state.handMode === 'one'
    ? 'Modo 1 mano: apunta con la varita y mantén.'
    : 'Modo 2 manos: cada mano apunta a una rueda.', '');
}

function markHints() {
  document.querySelectorAll('.syllable-btn.hint').forEach((el) => el.classList.remove('hint'));
  if (!state.supportMode) return;
  const target = currentTarget();
  document.querySelectorAll(`.syllable-btn[data-side="left"][data-syllable="${target.left}"]`).forEach((el) => el.classList.add('hint'));
  document.querySelectorAll(`.syllable-btn[data-side="right"][data-syllable="${target.right}"]`).forEach((el) => el.classList.add('hint'));
}

function readCurrent() {
  const built = `${state.left}${state.right}`;
  speakShort(built || currentTarget().word);
}

function speakShort(text) {
  if (!text || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = .84;
  utterance.pitch = 1.05;
  speechSynthesis.speak(utterance);
}

async function startCamera() {
  ui.cameraButton.disabled = true;
  ui.cameraStatus.textContent = 'Solicitando permiso de camara...';

  if (isFilePage()) {
    ui.cameraButton.disabled = false;
    setHandDebug('No arranco camara en file://. Usa localhost o Vercel para MediaPipe Tasks.', '');
    ui.cameraStatus.textContent = 'Abre la app desde http://localhost:4179 o desde Vercel. El archivo local rompe el detector.';
    return;
  }

  try {
    await startRawCamera();
    state.cameraReady = true;
    ui.cameraStatus.textContent = 'Camara activa. Cargando detectores Tasks Vision...';

    const handReady = await tryStartTasksHandLandmarker();
    await tryStartFaceLandmarker();

    if (handReady || state.faceLandmarker) {
      ui.cameraStatus.textContent = `Tasks activos. Mano: ${handReady ? 'ok' : 'no'} · ojos: ${state.faceLandmarker ? 'ok' : 'no'}.`;
      pumpTasksFrames();
      return;
    }

    if (window.Hands) {
      await startLegacyHands();
      return;
    }

    ui.cameraButton.disabled = false;
    setHandDebug('Detector no disponible. Fallback tactil activo.', '');
    ui.cameraStatus.textContent = 'No se pudo cargar ningun detector de mano.';
  } catch (error) {
    ui.cameraButton.disabled = false;
    state.mediaPipeErrors += 1;
    const message = cameraErrorMessage(error);
    setHandDebug(message, '');
    ui.cameraStatus.textContent = message;
  }
}

function isFilePage() {
  return window.location.protocol === 'file:';
}

async function startRawCamera() {
  if (video.srcObject) {
    await video.play();
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Este navegador no expone getUserMedia para leer la camara.');
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: 'user',
      width: { ideal: 640 },
      height: { ideal: 480 },
    },
  });
  video.srcObject = stream;
  await video.play();
}

async function loadTasksVision() {
  if (state.tasksVision) return state.tasksVision;
  const { FilesetResolver, HandLandmarker, FaceLandmarker } = await import(`${TASKS_VISION_PATH}/vision_bundle.mjs`);
  const vision = await FilesetResolver.forVisionTasks(TASKS_VISION_PATH);
  state.tasksVision = { vision, HandLandmarker, FaceLandmarker };
  return state.tasksVision;
}

async function tryStartTasksHandLandmarker() {
  try {
    const { vision, HandLandmarker } = await loadTasksVision();
    state.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `${TASKS_VISION_PATH}/hand_landmarker.task`,
        delegate: 'CPU',
      },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: .35,
      minHandPresenceConfidence: .35,
      minTrackingConfidence: .35,
    });

    state.handEngine = 'tasks';
    ui.cameraStatus.textContent = 'HandLandmarker activo. Cargando FaceLandmarker...';
    setHandDebug('Tasks Vision: buscando mano', 'active');
    return true;
  } catch (error) {
    state.mediaPipeErrors += 1;
    state.handEngine = 'tasks-error';
    setHandDebug(`Tasks fallo: ${compactError(error)}`, '');
    ui.cameraStatus.textContent = `Tasks fallo. Probando detector antiguo: ${compactError(error)}`;
    return false;
  }
}

async function tryStartFaceLandmarker() {
  try {
    const { vision, FaceLandmarker } = await loadTasksVision();
    state.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: FACE_MODEL_PATH,
        delegate: 'CPU',
      },
      runningMode: 'VIDEO',
      numFaces: 1,
      minFaceDetectionConfidence: .45,
      minFacePresenceConfidence: .45,
      minTrackingConfidence: .45,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });

    state.faceEngine = 'tasks-face';
    return true;
  } catch (error) {
    state.mediaPipeErrors += 1;
    state.faceEngine = 'face-error';
    setHandDebug(`FaceLandmarker no disponible: ${compactError(error)}`, '');
    return false;
  }
}

function pumpTasksFrames() {
  if (state.sendingFrame) return;
  state.sendingFrame = true;

  const send = () => {
    if ((!state.handLandmarker && !state.faceLandmarker) || !video.srcObject) {
      state.sendingFrame = false;
      return;
    }

    if (video.readyState >= 2) {
      try {
        const now = performance.now();
        handsCtx.clearRect(0, 0, handsCanvas.width, handsCanvas.height);
        state.framesSent += 1;

        if (state.handLandmarker && state.controlMode !== 'eyes') {
          const handResults = state.handLandmarker.detectForVideo(video, now);
          handleTaskResults(handResults);
        } else {
          clearHandTrackingIfStale();
        }

        const shouldRunFace =
          state.faceLandmarker &&
          (state.controlMode !== 'hand' || state.gaze.calibration.active) &&
          now - state.gaze.lastFaceRunAt >= GAZE_FACE_INTERVAL_MS;

        if (shouldRunFace) {
          state.gaze.lastFaceRunAt = now;
          const faceResults = state.faceLandmarker.detectForVideo(video, now);
          handleFaceResults(faceResults);
        } else {
          if (state.controlMode === 'hand' && !state.gaze.calibration.active) hideGazeCursor();
        }
      } catch (error) {
        state.mediaPipeErrors += 1;
        state.sendingFrame = false;
        state.handEngine = 'tasks-runtime-error';
        setHandDebug(`Tasks runtime fallo: ${compactError(error)}`, '');
        ui.cameraStatus.textContent = 'HandLandmarker fallo en ejecucion. Probando detector antiguo.';
        startLegacyHands();
        return;
      }
    }

    requestAnimationFrame(send);
  };

  requestAnimationFrame(send);
}

function handleTaskResults(results) {
  state.resultsSeen += 1;

  const hands = results.landmarks || [];
  if (!hands.length) {
    clearHandTrackingIfStale();
    return;
  }

  state.handsSeen += hands.length;
  handleDetectedHands(hands);
}

function clearHandTrackingIfStale() {
  if (performance.now() - state.handSeenAt <= 500) return;
  airCursor.hidden = true;
  clearAirHover();
  clearHandPreviews();
  resetWandFix();
  if (state.controlMode === 'hand') setHandDebug(debugPrefix('sin mano'), '');
}

function locateMediaPipeFile(file) {
  if (file === 'hands_solution_simd_wasm_bin.js') return `${MEDIAPIPE_PATH}hands_solution_wasm_bin.js`;
  if (file === 'hands_solution_simd_wasm_bin.wasm') return `${MEDIAPIPE_PATH}hands_solution_wasm_bin.wasm`;
  return `${MEDIAPIPE_PATH}${file}`;
}

async function startLegacyHands() {
  if (!window.Hands) {
    ui.cameraStatus.textContent = 'Detector antiguo no disponible. Fallback tactil activo.';
    return;
  }

  const hands = new Hands({
    locateFile: locateMediaPipeFile,
  });

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 0,
    minDetectionConfidence: .5,
    minTrackingConfidence: .5,
    selfieMode: true,
  });

  hands.onResults(onHandResults);
  state.handEngine = 'legacy';
  state.sendingFrame = false;
  ui.cameraStatus.textContent = 'Detector antiguo activo como fallback.';
  setHandDebug('MediaPipe legacy: buscando mano', 'active');
  pumpCameraFrames(hands);
}

function pumpCameraFrames(hands) {
  if (state.sendingFrame) return;
  state.sendingFrame = true;

  const send = async () => {
    if (!video.srcObject) {
      state.sendingFrame = false;
      return;
    }
    if (video.readyState >= 2) {
      try {
        await hands.send({ image: video });
        state.framesSent += 1;
      } catch (error) {
        state.mediaPipeErrors += 1;
        state.sendingFrame = false;
        state.handEngine = 'legacy-error';
        setHandDebug(`Legacy fallo: ${compactError(error)}`, '');
        ui.cameraStatus.textContent = 'El detector antiguo fallo. Fallback tactil activo.';
        return;
      }
    }
    requestAnimationFrame(send);
  };

  requestAnimationFrame(send);
}

function onHandResults(results) {
  state.resultsSeen += 1;
  resizeCanvas();
  handsCtx.clearRect(0, 0, handsCanvas.width, handsCanvas.height);

  if (!results.multiHandLandmarks?.length) {
    if (performance.now() - state.handSeenAt > 500) {
      airCursor.hidden = true;
      clearAirHover();
      clearHandPreviews();
      resetWandFix();
      setHandDebug(debugPrefix('sin mano'), '');
    }
    return;
  }

  state.handsSeen += results.multiHandLandmarks.length;
  handleDetectedHands(results.multiHandLandmarks);
}

function handleDetectedHands(hands) {
  if (state.handMode === 'two') {
    handleMultipleNormalizedLandmarks(hands.slice(0, 2));
    return;
  }

  handleNormalizedLandmarks(hands[0]);
}

function handleMultipleNormalizedLandmarks(hands) {
  state.handSeenAt = performance.now();
  state.visibleLandmarks = hands.reduce((total, hand) => total + hand.length, 0);
  const mappedHands = hands.map((landmarks) => chooseMappedPoints(landmarks));

  mappedHands.forEach((mapped) => drawHandLandmarks(mapped));
  const cursor = mappedHands[0]?.[8];
  if (cursor) moveAirCursor(cursor.x, cursor.y);

  processBimanualSelection(mappedHands);
}

function handleNormalizedLandmarks(landmarks) {
  state.handSeenAt = performance.now();
  state.visibleLandmarks = landmarks.length;
  const mappedPoints = chooseMappedPoints(landmarks);
  drawWandLandmarks(mappedPoints);
  processWandSelection(mappedPoints);
}

function drawWandLandmarks(mapped) {
  const base = mapped[5] || mapped[0];
  const mid = mapped[6];
  const nearTip = mapped[7];
  const tip = mapped[8];
  const wand = getWandPoint(mapped);
  if (!base || !tip || !wand) return;

  handsCtx.save();
  handsCtx.lineCap = 'round';
  handsCtx.lineJoin = 'round';
  drawCartoonHand(mapped, INDEX_TIP);

  handsCtx.strokeStyle = 'rgba(255, 255, 255, .95)';
  handsCtx.lineWidth = 14;
  handsCtx.beginPath();
  handsCtx.moveTo(base.x, base.y);
  if (mid) handsCtx.lineTo(mid.x, mid.y);
  if (nearTip) handsCtx.lineTo(nearTip.x, nearTip.y);
  handsCtx.lineTo(tip.x, tip.y);
  handsCtx.lineTo(wand.x, wand.y);
  handsCtx.stroke();

  handsCtx.strokeStyle = 'rgba(14, 116, 144, .95)';
  handsCtx.lineWidth = 7;
  handsCtx.beginPath();
  handsCtx.moveTo(base.x, base.y);
  if (mid) handsCtx.lineTo(mid.x, mid.y);
  if (nearTip) handsCtx.lineTo(nearTip.x, nearTip.y);
  handsCtx.lineTo(tip.x, tip.y);
  handsCtx.lineTo(wand.x, wand.y);
  handsCtx.stroke();

  handsCtx.fillStyle = '#f4c542';
  handsCtx.strokeStyle = '#ffffff';
  handsCtx.lineWidth = 5;
  [base, mid, nearTip, tip].filter(Boolean).forEach((point, index) => {
    handsCtx.beginPath();
    handsCtx.arc(point.x, point.y, index === 3 ? 11 : 7, 0, Math.PI * 2);
    handsCtx.fill();
    handsCtx.stroke();
  });

  handsCtx.fillStyle = '#16a34a';
  handsCtx.beginPath();
  handsCtx.arc(wand.x, wand.y, 15, 0, Math.PI * 2);
  handsCtx.fill();
  handsCtx.stroke();

  handsCtx.strokeStyle = 'rgba(22, 163, 74, .42)';
  handsCtx.lineWidth = 5;
  handsCtx.beginPath();
  handsCtx.arc(wand.x, wand.y, 52, 0, Math.PI * 2);
  handsCtx.stroke();
  handsCtx.restore();
}

function drawHandLandmarks(mapped) {
  handsCtx.save();
  handsCtx.lineCap = 'round';
  handsCtx.lineJoin = 'round';
  drawCartoonHand(mapped, INDEX_TIP);

  const connections = window.HAND_CONNECTIONS || [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12],
    [0, 13], [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20],
    [5, 9], [9, 13], [13, 17],
  ];

  handsCtx.lineWidth = 8;
  handsCtx.strokeStyle = 'rgba(255, 255, 255, .88)';
  connections.forEach(([from, to]) => {
    const a = mapped[from];
    const b = mapped[to];
    handsCtx.beginPath();
    handsCtx.moveTo(a.x, a.y);
    handsCtx.lineTo(b.x, b.y);
    handsCtx.stroke();
  });

  handsCtx.lineWidth = 4;
  handsCtx.strokeStyle = 'rgba(14, 116, 144, .9)';
  connections.forEach(([from, to]) => {
    const a = mapped[from];
    const b = mapped[to];
    handsCtx.beginPath();
    handsCtx.moveTo(a.x, a.y);
    handsCtx.lineTo(b.x, b.y);
    handsCtx.stroke();
  });

  mapped.forEach((point, index) => {
    const isIndexTip = index === 8;
    handsCtx.fillStyle = isIndexTip ? '#f4c542' : '#0e7490';
    handsCtx.strokeStyle = '#ffffff';
    handsCtx.lineWidth = isIndexTip ? 5 : 3;
    handsCtx.beginPath();
    handsCtx.arc(point.x, point.y, isIndexTip ? 10 : 6, 0, Math.PI * 2);
    handsCtx.fill();
    handsCtx.stroke();
  });

  const indexTip = mapped[8];
  if (indexTip) {
    handsCtx.strokeStyle = 'rgba(255, 255, 255, .95)';
    handsCtx.lineWidth = 8;
    handsCtx.beginPath();
    handsCtx.arc(indexTip.x, indexTip.y, 28, 0, Math.PI * 2);
    handsCtx.stroke();
    handsCtx.strokeStyle = 'rgba(244, 197, 66, .95)';
    handsCtx.lineWidth = 4;
    handsCtx.beginPath();
    handsCtx.arc(indexTip.x, indexTip.y, 28, 0, Math.PI * 2);
    handsCtx.stroke();
  }

  handsCtx.restore();
}

function drawCartoonHand(mapped, activeIndex) {
  const palmPoints = [mapped[0], mapped[5], mapped[9], mapped[13], mapped[17]].filter(Boolean);
  if (palmPoints.length < 3) return;

  const palmCenter = averagePoint(palmPoints);
  const palmRadius = Math.max(34, Math.hypot((mapped[5]?.x || palmCenter.x) - (mapped[17]?.x || palmCenter.x), (mapped[5]?.y || palmCenter.y) - (mapped[17]?.y || palmCenter.y)) * .62);
  const fingers = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 16],
    [17, 18, 19, 20],
  ];

  handsCtx.save();
  handsCtx.lineCap = 'round';
  handsCtx.lineJoin = 'round';

  handsCtx.fillStyle = 'rgba(255, 255, 255, .58)';
  handsCtx.strokeStyle = 'rgba(14, 116, 144, .55)';
  handsCtx.lineWidth = 5;
  handsCtx.beginPath();
  handsCtx.arc(palmCenter.x, palmCenter.y, palmRadius, 0, Math.PI * 2);
  handsCtx.fill();
  handsCtx.stroke();

  fingers.forEach((indexes) => {
    const isActiveFinger = indexes.includes(activeIndex);
    const points = indexes.map((index) => mapped[index]).filter(Boolean);
    if (points.length < 2) return;

    handsCtx.strokeStyle = 'rgba(255, 255, 255, .82)';
    handsCtx.lineWidth = isActiveFinger ? 22 : 16;
    handsCtx.beginPath();
    handsCtx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => handsCtx.lineTo(point.x, point.y));
    handsCtx.stroke();

    handsCtx.strokeStyle = isActiveFinger ? 'rgba(244, 197, 66, .92)' : 'rgba(14, 116, 144, .46)';
    handsCtx.lineWidth = isActiveFinger ? 10 : 6;
    handsCtx.beginPath();
    handsCtx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => handsCtx.lineTo(point.x, point.y));
    handsCtx.stroke();
  });

  mapped.forEach((point, index) => {
    if (!point) return;
    const isActive = index === activeIndex;
    handsCtx.fillStyle = isActive ? '#16a34a' : 'rgba(14, 116, 144, .92)';
    handsCtx.strokeStyle = '#ffffff';
    handsCtx.lineWidth = isActive ? 5 : 3;
    handsCtx.beginPath();
    handsCtx.arc(point.x, point.y, isActive ? 12 : 5, 0, Math.PI * 2);
    handsCtx.fill();
    handsCtx.stroke();
  });

  handsCtx.restore();
}

function averagePoint(points) {
  const total = points.reduce((sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }), { x: 0, y: 0 });
  return {
    x: total.x / points.length,
    y: total.y / points.length,
  };
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function trimmedMean(values, trimRatio = .18) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const trim = Math.floor(sorted.length * trimRatio);
  const trimmed = sorted.slice(trim, Math.max(trim + 1, sorted.length - trim));
  return average(trimmed);
}

function chooseMappedPoints(landmarks) {
  const mode = { id: 'mirror', mirrorX: true, flipY: false };
  state.mappingMode = mode.id;
  return landmarks.map((point) => landmarkToStagePoint(point, mode));
}

function landmarkToStagePoint(point, mode) {
  const normalizedX = mode.mirrorX ? 1 - point.x : point.x;
  const normalizedY = mode.flipY ? 1 - point.y : point.y;

  return {
    x: clamp(normalizedX * handsCanvas.width, 0, handsCanvas.width),
    y: clamp(normalizedY * handsCanvas.height, 0, handsCanvas.height),
    z: point.z || 0,
  };
}

function moveAirCursor(x, y) {
  airCursor.hidden = false;
  airCursor.style.left = `${x}px`;
  airCursor.style.top = `${y}px`;
}

function handleFaceResults(results) {
  const landmarks = results.faceLandmarks?.[0] || null;
  if (!landmarks) {
    if (performance.now() - state.gaze.faceSeenAt > 650) {
      hideGazeCursor();
      resetGazeFix();
      if (state.controlMode !== 'hand') setHandDebug(debugPrefix('rostro no detectado'), '');
    }
    return;
  }

  state.gaze.faceSeenAt = performance.now();
  const mapped = landmarks.map((point) => landmarkToStagePoint(point, { mirrorX: true, flipY: false }));
  const gazeMeasure = estimateRelativeGaze(mapped);
  drawFaceOverlay(mapped, gazeMeasure);

  if (!gazeMeasure) {
    hideGazeCursor();
    return;
  }

  if (gazeMeasure.quality < .2 && !state.gaze.calibration.active) {
    state.gaze.lowConfidenceFrames += 1;
    if (state.gaze.lastGoodPoint && state.gaze.lowConfidenceFrames < 8 && state.controlMode !== 'hand') {
      moveGazeCursor(state.gaze.lastGoodPoint.x, state.gaze.lastGoodPoint.y);
    } else {
      hideGazeCursor();
      resetGazeFix({ keepPointer: true });
    }
    setHandDebug(debugPrefix('mirada inestable: centra cara y ojos'), '');
    return;
  }

  state.gaze.lowConfidenceFrames = 0;

  updateGazeCalibration(gazeMeasure);

  if (state.gaze.calibration.active) {
    hideGazeCursor();
    resetGazeFix({ keepPointer: true });
    return;
  }

  if (state.controlMode === 'hand' && !state.gaze.calibration.active) return;

  const gazePoint = gazeMeasureToStagePoint(gazeMeasure);
  const smoothPoint = smoothGazePoint(gazePoint);
  state.gaze.lastGoodPoint = smoothPoint;
  moveGazeCursor(smoothPoint.x, smoothPoint.y);
  processGazeSelection(smoothPoint);
}

function estimateRelativeGaze(mapped) {
  const right = eyeMeasure(mapped, FACE_POINTS.rightEye);
  const left = eyeMeasure(mapped, FACE_POINTS.leftEye);
  const eyes = [right, left].filter(Boolean);
  if (!eyes.length) return null;
  const pose = estimateHeadPose(mapped, left, right);
  if (!pose) return null;

  const rawX = average(eyes.map((eye) => eye.x));
  const rawY = average(eyes.map((eye) => eye.y));
  const eyeQuality = average(eyes.map((eye) => eye.quality));
  const posePenalty = Math.min(.45, Math.abs(pose.yaw) * .18 + Math.abs(pose.pitch) * .12 + Math.abs(pose.roll) * .7);
  return {
    x: rawX,
    y: rawY,
    rawX,
    rawY,
    pose,
    quality: clamp(eyeQuality - posePenalty, 0, 1),
    iris: eyes.map((eye) => eye.iris),
    eyes,
  };
}

function eyeMeasure(mapped, config) {
  const irisPoints = config.iris.map((index) => mapped[index]).filter(Boolean);
  const cornerPoints = config.corners.map((index) => mapped[index]).filter(Boolean);
  const upper = mapped[config.upper];
  const lower = mapped[config.lower];
  if (irisPoints.length < 2 || cornerPoints.length < 2 || !upper || !lower) return null;

  const iris = averagePoint(irisPoints);
  const minX = Math.min(cornerPoints[0].x, cornerPoints[1].x);
  const maxX = Math.max(cornerPoints[0].x, cornerPoints[1].x);
  const minY = Math.min(upper.y, lower.y);
  const maxY = Math.max(upper.y, lower.y);
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  const x = clamp((iris.x - minX) / width, 0, 1);
  const y = clamp((iris.y - minY) / height, 0, 1);
  const centered = 1 - Math.min(.55, Math.abs(x - .5) + Math.abs(y - .5));

  return {
    x,
    y,
    iris,
    corners: cornerPoints,
    upper,
    lower,
    width,
    height,
    quality: clamp((width / Math.max(26, height * 3.2)) * .55 + centered * .45, 0, 1),
  };
}

function gazeMeasureToStagePoint(measure) {
  const params = state.gaze.params;
  const feature = controlPointerFeature(measure, params?.centerPose || measure.pose, params?.controlMode || state.controlMode);
  if (!params) {
    return {
      x: clamp(handsCanvas.width * (.5 + (feature.x - .5) * 2.4), 0, handsCanvas.width),
      y: clamp(handsCanvas.height * (.5 + (feature.y - .5) * 2.1), 0, handsCanvas.height),
    };
  }

  const point = interpolateCalibratedPoint(feature, params.samples);
  return {
    x: clamp(point.x * handsCanvas.width, 0, handsCanvas.width),
    y: clamp(point.y * handsCanvas.height, 0, handsCanvas.height),
  };
}

function estimateHeadPose(mapped, leftEye, rightEye) {
  const nose = mapped[1] || mapped[4];
  const mouth = mapped[13] || mapped[14] || mapped[0];
  const chin = mapped[152] || mouth;
  if (!nose || !mouth || !leftEye?.corners || !rightEye?.corners) return null;

  const leftCenter = averagePoint(leftEye.corners);
  const rightCenter = averagePoint(rightEye.corners);
  const eyeCenter = averagePoint([leftCenter, rightCenter]);
  const eyeDistance = Math.max(1, Math.hypot(leftCenter.x - rightCenter.x, leftCenter.y - rightCenter.y));
  const mouthDistance = Math.max(1, Math.hypot(mouth.x - eyeCenter.x, mouth.y - eyeCenter.y));
  const roll = Math.atan2(rightCenter.y - leftCenter.y, rightCenter.x - leftCenter.x);

  return {
    yaw: (nose.x - eyeCenter.x) / eyeDistance,
    pitch: ((nose.y - eyeCenter.y) / mouthDistance) - .42,
    roll,
    faceScale: eyeDistance,
    chinPitch: (chin.y - eyeCenter.y) / eyeDistance,
  };
}

function compensatedGazeFeature(measure, centerPose) {
  const pose = measure.pose || centerPose;
  const yawDelta = pose.yaw - centerPose.yaw;
  const pitchDelta = pose.pitch - centerPose.pitch;
  const rollDelta = pose.roll - centerPose.roll;
  return {
    x: clamp(
      measure.rawX -
        yawDelta * GAZE_HEAD_COMPENSATION.yaw -
        rollDelta * GAZE_HEAD_COMPENSATION.rollX +
        yawDelta * GAZE_HEAD_ASSIST.yaw,
      0,
      1
    ),
    y: clamp(
      measure.rawY -
        pitchDelta * GAZE_HEAD_COMPENSATION.pitch -
        rollDelta * GAZE_HEAD_COMPENSATION.rollY +
        pitchDelta * GAZE_HEAD_ASSIST.pitch,
      0,
      1
    ),
  };
}

function headPointerFeature(measure, centerPose) {
  const pose = measure.pose || centerPose;
  const yawDelta = pose.yaw - centerPose.yaw;
  const pitchDelta = pose.pitch - centerPose.pitch;
  const rollDelta = pose.roll - centerPose.roll;
  return {
    x: clamp(.5 + yawDelta * 1.85 - rollDelta * .12, 0, 1),
    y: clamp(.5 + pitchDelta * 1.65 + rollDelta * .06, 0, 1),
  };
}

function controlPointerFeature(measure, centerPose, mode) {
  const eye = compensatedGazeFeature(measure, centerPose);
  const head = headPointerFeature(measure, centerPose);

  if (mode === 'face') return head;
  if (mode === 'mixed') {
    return {
      x: eye.x * .45 + head.x * .55,
      y: eye.y * .45 + head.y * .55,
    };
  }

  return {
    x: eye.x * .42 + head.x * .58,
    y: eye.y * .42 + head.y * .58,
  };
}

function interpolateCalibratedPoint(feature, samples) {
  if (!samples?.length) return { x: .5, y: .5 };
  const weighted = samples
    .map((sample) => {
      const distance = Math.hypot(feature.x - sample.gx, feature.y - sample.gy);
      return { sample, distance, weight: 1 / Math.max(.0008, distance * distance) };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  if (weighted[0]?.distance < .006) {
    return { x: weighted[0].sample.targetX, y: weighted[0].sample.targetY };
  }

  const totalWeight = weighted.reduce((total, item) => total + item.weight, 0);
  const point = weighted.reduce((sum, item) => ({
    x: sum.x + item.sample.targetX * item.weight,
    y: sum.y + item.sample.targetY * item.weight,
  }), { x: 0, y: 0 });

  const x = point.x / totalWeight;
  const y = point.y / totalWeight;
  const center = samples.find((sample) => sample.id === 'center');
  if (center && Math.hypot(feature.x - center.gx, feature.y - center.gy) < .018) {
    return { x: .5 + (x - .5) * .35, y: .5 + (y - .5) * .35 };
  }

  return { x: softClip(x), y: softClip(y) };
}

function softClip(value) {
  if (value < .06) return .06 + (value - .06) * .35;
  if (value > .94) return .94 + (value - .94) * .35;
  return value;
}

function smoothGazePoint(point) {
  const previous = state.gaze.smooth;
  if (!previous) {
    state.gaze.smooth = point;
    return point;
  }

  const jump = Math.hypot(point.x - previous.x, point.y - previous.y);
  const alpha = jump > 260 ? .38 : .20;
  const smooth = {
    x: previous.x + (point.x - previous.x) * alpha,
    y: previous.y + (point.y - previous.y) * alpha,
  };
  state.gaze.smooth = smooth;
  return smooth;
}

function moveGazeCursor(x, y) {
  gazeCursor.hidden = false;
  gazeCursor.style.left = `${x}px`;
  gazeCursor.style.top = `${y}px`;
}

function hideGazeCursor() {
  gazeCursor.hidden = true;
  gazeCursor.classList.remove('locking');
}

function processGazeSelection(point) {
  const candidate = nearestSyllableCandidateFromGaze(point);
  updateGazePreview(candidate?.button || null);

  if (!candidate?.button) {
    resetGazeFix({ keepPointer: true });
    setFeedback('Mira una sílaba grande para seleccionarla.', '');
    return;
  }

  const fixed = updateGazeFix(candidate);
  const syllable = candidate.button.dataset.syllable;
  gazeCursor.classList.add('locking');

  if (fixed) {
    setFeedback(`Mirada fijó ${syllable}`, 'ok');
    return;
  }

  setFeedback(`Mirando ${syllable}. Mantén la mirada o sal para cancelar.`, '');
}

function nearestSyllableCandidateFromGaze(point) {
  let nearest = null;
  let nearestDistance = Infinity;

  document.querySelectorAll('.syllable-btn').forEach((button) => {
    const box = buttonBoxInStage(button);
    const distance = Math.hypot(point.x - box.cx, point.y - box.cy);
    const hitRadius = Math.max(130, Math.min(box.width, box.height) * 1.48);

    if (distance <= hitRadius && distance < nearestDistance) {
      nearest = { button, distance, hitRadius, point };
      nearestDistance = distance;
    }
  });

  return nearest;
}

function updateGazePreview(button) {
  const old = state.gaze.element;
  if (old && old !== button) {
    old.classList.remove('gaze-target', 'fixed-pulse');
    setFixProgress(old, 0);
  }

  state.gaze.element = button;
  if (button) button.classList.add('gaze-target');
}

function updateGazeFix(candidate) {
  const tracker = state.gaze;
  const id = candidate.button.dataset.id;
  const now = performance.now();
  const point = candidate.point;
  const previousPoint = tracker.lastPoint;
  const movement = previousPoint ? Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y) : 0;

  if (tracker.targetId !== id || movement > GAZE_STABLE_PX) {
    tracker.targetId = id;
    tracker.startedAt = now;
    tracker.lastPoint = point;
    setFixProgress(candidate.button, 0);
    return false;
  }

  tracker.lastPoint = point;
  const progress = clamp((now - tracker.startedAt) / GAZE_DWELL_MS, 0, 1);
  setFixProgress(candidate.button, progress);

  const side = candidate.button.dataset.side;
  const alreadySelected = state[side] === candidate.button.dataset.syllable && candidate.button.classList.contains('selected');
  const cooledDown = now - tracker.selectedAt > 1200;

  if (progress >= 1 && !alreadySelected && cooledDown) {
    tracker.selectedAt = now;
    candidate.button.classList.add('fixed-pulse');
    window.setTimeout(() => candidate.button.classList.remove('fixed-pulse'), 320);
    selectSyllable(side, candidate.button.dataset.syllable, candidate.button);
    return true;
  }

  return false;
}

function resetGazeFix(options = {}) {
  const button = state.gaze.element;
  if (button) {
    button.classList.remove('gaze-target', 'fixed-pulse');
    setFixProgress(button, 0);
  }
  state.gaze.targetId = '';
  state.gaze.startedAt = 0;
  state.gaze.lastPoint = null;
  if (!options.keepPointer) state.gaze.smooth = null;
  state.gaze.element = null;
  gazeCursor.classList.remove('locking');
}

function drawFaceOverlay(mapped, gazeMeasure) {
  const faceIndexes = [33, 133, 159, 145, 362, 263, 386, 374, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477];
  handsCtx.save();
  handsCtx.lineWidth = 3;
  handsCtx.strokeStyle = 'rgba(124, 58, 237, .65)';
  handsCtx.fillStyle = 'rgba(124, 58, 237, .92)';

  faceIndexes.forEach((index) => {
    const point = mapped[index];
    if (!point) return;
    handsCtx.beginPath();
    handsCtx.arc(point.x, point.y, index >= 468 ? 5 : 3, 0, Math.PI * 2);
    handsCtx.fill();
  });

  if (gazeMeasure?.iris) {
    gazeMeasure.iris.forEach((point) => {
      handsCtx.beginPath();
      handsCtx.arc(point.x, point.y, 12, 0, Math.PI * 2);
      handsCtx.stroke();
    });
  }

  handsCtx.restore();
}

function startGazeCalibration(mode = 'full') {
  const calibrationControlMode = state.controlMode === 'face' ? 'face' : 'eyes';
  setControlMode(calibrationControlMode);
  state.gaze.calibration.active = true;
  state.gaze.calibration.mode = mode;
  state.gaze.calibration.controlMode = calibrationControlMode;
  state.gaze.calibration.index = 0;
  state.gaze.calibration.startedAt = performance.now();
  state.gaze.calibration.samples = [];
  state.gaze.calibration.repeats = {};
  state.gaze.calibration.steps =
    mode === 'vertical' ? CALIBRATION_VERTICAL_STEPS :
    mode === 'horizontal' ? CALIBRATION_HORIZONTAL_STEPS :
    CALIBRATION_STEPS;
  state.gaze.calibration.points = mode === 'full' ? {} : { ...(state.gaze.params?.points || {}) };
  if (mode === 'full') state.gaze.params = null;
  state.gaze.calibrated = false;
  showCalibrationStep();
}

function showCalibrationStep() {
  const step = state.gaze.calibration.steps[state.gaze.calibration.index];
  if (!step) {
    finishGazeCalibration();
    return;
  }
  calibrationTarget.hidden = false;
  calibrationTarget.style.left = `${step.x * 100}%`;
  calibrationTarget.style.top = `${step.y * 100}%`;
  state.gaze.calibration.startedAt = performance.now();
  state.gaze.calibration.samples = [];
  const action = state.gaze.calibration.controlMode === 'face' ? 'apunta con la cara hacia' : 'mira';
  setFeedback(`Calibración: ${action} ${step.label} y quédate quieto.`, '');
}

function updateGazeCalibration(measure) {
  const calibration = state.gaze.calibration;
  if (!calibration.active) return;

  const elapsed = performance.now() - calibration.startedAt;
  if (elapsed < 520) return;

  calibration.samples.push({
    x: measure.rawX,
    y: measure.rawY,
    quality: measure.quality,
    pose: measure.pose,
  });
  if (elapsed < 1800) return;

  const step = calibration.steps[calibration.index];
  const robust = robustCalibrationPoint(calibration.samples);
  const repeatCount = calibration.repeats[step.id] || 0;

  if (!robust || robust.quality < .42) {
    if (repeatCount < 1) {
      calibration.repeats[step.id] = repeatCount + 1;
      setFeedback(`Punto ${step.label} salió inestable. Repetimos.`, 'bad');
      showCalibrationStep();
      return;
    }
  }

  calibration.points[step.id] = {
    id: step.id,
    x: robust.x,
    y: robust.y,
    pose: robust.pose,
    quality: robust.quality,
    targetX: step.x,
    targetY: step.y,
  };
  calibration.index += 1;
  showCalibrationStep();
}

function finishGazeCalibration() {
  const points = state.gaze.calibration.points;
  calibrationTarget.hidden = true;
  state.gaze.calibration.active = false;

  if (!points.center || !points.left || !points.right || !points.top || !points.down) {
    setFeedback('Calibración incompleta. Prueba otra vez con la cara centrada.', 'bad');
    return;
  }

  const centerPose = points.center.pose;
  const calibrationControlMode = state.gaze.calibration.controlMode || 'eyes';
  const samples = Object.values(points).map((point) => ({
    id: point.id,
    gx: controlPointerFeature({ rawX: point.x, rawY: point.y, pose: point.pose }, centerPose, calibrationControlMode).x,
    gy: controlPointerFeature({ rawX: point.x, rawY: point.y, pose: point.pose }, centerPose, calibrationControlMode).y,
    targetX: point.targetX,
    targetY: point.targetY,
    quality: point.quality,
  }));
  const quality = calibrationQuality(samples);

  state.gaze.params = {
    version: 20,
    controlMode: calibrationControlMode,
    points,
    samples,
    centerPose,
    quality,
    savedAt: Date.now(),
  };
  state.gaze.calibrated = true;
  state.gaze.smooth = null;
  saveGazeCalibration();
  setFeedback(`Calibración de ojos lista. Calidad ${Math.round(quality * 100)}%.`, quality > .5 ? 'ok' : 'bad');
}

function robustCalibrationPoint(samples) {
  const good = samples.filter((sample) => sample.quality >= .25 && sample.pose);
  if (good.length < 8) return null;

  const medianX = median(good.map((sample) => sample.x));
  const medianY = median(good.map((sample) => sample.y));
  const distances = good.map((sample) => Math.hypot(sample.x - medianX, sample.y - medianY));
  const mad = median(distances) || .006;
  const filtered = good.filter((sample, index) => distances[index] <= Math.max(.022, mad * 2.7));
  const finalSamples = filtered.length >= 6 ? filtered : good;
  const pose = {
    yaw: trimmedMean(finalSamples.map((sample) => sample.pose.yaw)),
    pitch: trimmedMean(finalSamples.map((sample) => sample.pose.pitch)),
    roll: trimmedMean(finalSamples.map((sample) => sample.pose.roll)),
    faceScale: trimmedMean(finalSamples.map((sample) => sample.pose.faceScale)),
    chinPitch: trimmedMean(finalSamples.map((sample) => sample.pose.chinPitch)),
  };
  const dispersion = average(finalSamples.map((sample) => Math.hypot(sample.x - medianX, sample.y - medianY)));

  return {
    x: trimmedMean(finalSamples.map((sample) => sample.x)),
    y: trimmedMean(finalSamples.map((sample) => sample.y)),
    pose,
    quality: clamp(average(finalSamples.map((sample) => sample.quality)) - dispersion * 5, 0, 1),
  };
}

function calibrationQuality(samples) {
  const center = samples.find((sample) => sample.id === 'center');
  const left = samples.find((sample) => sample.id === 'left');
  const right = samples.find((sample) => sample.id === 'right');
  const top = samples.find((sample) => sample.id === 'top');
  const down = samples.find((sample) => sample.id === 'down');
  if (!center || !left || !right || !top || !down) return 0;

  const horizontalSpread = Math.hypot(left.gx - right.gx, left.gy - right.gy);
  const verticalSpread = Math.hypot(top.gx - down.gx, top.gy - down.gy);
  const centerBalance = 1 - Math.min(1, Math.hypot(center.targetX - .5, center.targetY - .5) * 3);
  return clamp(horizontalSpread * 3.6 + verticalSpread * 3.6 + centerBalance * .15, 0, 1);
}

function saveGazeCalibration() {
  try {
    window.localStorage.setItem(GAZE_STORAGE_KEY, JSON.stringify(state.gaze.params));
  } catch {
    // localStorage can be unavailable in private browsing.
  }
}

function loadStoredGazeCalibration() {
  try {
    const raw = window.localStorage.getItem(GAZE_STORAGE_KEY);
    if (!raw) return;
    const params = JSON.parse(raw);
    if (!params?.samples?.length || !params.centerPose) return;
    state.gaze.params = params;
    state.gaze.calibrated = true;
  } catch {
    state.gaze.params = null;
    state.gaze.calibrated = false;
  }
}

function processWandSelection(mappedPoints) {
  clearAirHover();
  clearHandPreviews();
  const wand = getWandPoint(mappedPoints);
  if (!wand) return;

  moveAirCursor(wand.x, wand.y);
  const candidate = nearestSyllableCandidateFromPointer(wand);
  updateWandPreview(candidate?.button || null);

  if (!candidate?.button) {
    resetWandFix({ keepPointer: true });
    setHandDebug(debugPrefix('varita: apunta a una sílaba'), 'active');
    setFeedback('Apunta con la varita a una sílaba.', '');
    return;
  }

  const fixed = updateWandFix(candidate);
  const sideLabel = candidate.button.dataset.side === 'left' ? 'primera' : 'segunda';
  const syllable = candidate.button.dataset.syllable;

  if (fixed) {
    setHandDebug(debugPrefix(`varita fijó ${sideLabel} sílaba ${syllable}`), 'locking');
    setFeedback(`Fijada ${sideLabel} sílaba: ${syllable}`, 'ok');
    return;
  }

  setHandDebug(debugPrefix(`varita sobre ${syllable} · mantén 1 segundo para fijar`), 'locking');
  setFeedback(`Varita sobre ${syllable}. Mantén 1 segundo para fijar o sal para cancelar.`, '');
}

function getWandPoint(mappedPoints) {
  const base = mappedPoints[6] || mappedPoints[5] || mappedPoints[0];
  const tip = mappedPoints[8];
  if (!base || !tip) return null;

  const dx = tip.x - base.x;
  const dy = tip.y - base.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const extension = 18;
  const raw = {
    x: clamp(tip.x + (dx / length) * extension, 0, handsCanvas.width),
    y: clamp(tip.y + (dy / length) * extension, 0, handsCanvas.height),
    z: tip.z,
  };
  const previous = state.wand.smoothPoint;
  if (!previous) {
    state.wand.smoothPoint = raw;
    return raw;
  }

  const jump = Math.hypot(raw.x - previous.x, raw.y - previous.y);
  const alpha = jump > 190 ? 1 : .58;
  const smooth = {
    x: previous.x + (raw.x - previous.x) * alpha,
    y: previous.y + (raw.y - previous.y) * alpha,
    z: raw.z,
  };
  state.wand.smoothPoint = smooth;
  return smooth;
}

function nearestSyllableCandidateFromPointer(point) {
  let nearest = null;
  let nearestDistance = Infinity;

  document.querySelectorAll('.syllable-btn').forEach((button) => {
    const box = buttonBoxInStage(button);
    const distance = Math.hypot(point.x - box.cx, point.y - box.cy);
    const hitRadius = Math.max(86, Math.min(box.width, box.height) * 1.05);

    if (distance <= hitRadius && distance < nearestDistance) {
      nearest = { button, distance, hitRadius, point };
      nearestDistance = distance;
    }
  });

  return nearest;
}

function updateWandPreview(button) {
  const old = state.wand.element;
  if (old && old !== button) {
    old.classList.remove('wand-target', 'fixed-pulse');
    setFixProgress(old, 0);
  }

  state.wand.element = button;
  if (button) button.classList.add('wand-target');
}

function updateWandFix(candidate) {
  const tracker = state.wand;
  const id = candidate.button.dataset.id;
  const now = performance.now();
  const point = candidate.point;
  const previousPoint = tracker.lastPoint;
  const movement = previousPoint ? Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y) : 0;
  const stableMovementPx = 88;
  const requiredMs = 1120;

  if (tracker.targetId !== id || movement > stableMovementPx) {
    tracker.targetId = id;
    tracker.startedAt = now;
    tracker.lastPoint = point;
    setFixProgress(candidate.button, 0);
    return false;
  }

  tracker.lastPoint = point;
  const progress = clamp((now - tracker.startedAt) / requiredMs, 0, 1);
  setFixProgress(candidate.button, progress);

  const side = candidate.button.dataset.side;
  const alreadySelected = state[side] === candidate.button.dataset.syllable && candidate.button.classList.contains('selected');
  const cooledDown = now - tracker.selectedAt > 900;

  if (progress >= 1 && !alreadySelected && cooledDown) {
    tracker.selectedAt = now;
    candidate.button.classList.add('fixed-pulse');
    window.setTimeout(() => candidate.button.classList.remove('fixed-pulse'), 320);
    selectSyllable(side, candidate.button.dataset.syllable, candidate.button);
    return true;
  }

  return false;
}

function resetWandFix(options = {}) {
  const button = state.wand.element;
  if (button) {
    button.classList.remove('wand-target', 'fixed-pulse');
    setFixProgress(button, 0);
  }
  state.wand.targetId = '';
  state.wand.startedAt = 0;
  state.wand.lastPoint = null;
  if (!options.keepPointer) state.wand.smoothPoint = null;
  state.wand.element = null;
}

function processAirSelection(x, y, mappedPoints = []) {
  const stageRect = stage.getBoundingClientRect();
  const viewportX = stageRect.left + x;
  const viewportY = stageRect.top + y;
  const element = document.elementFromPoint(viewportX, viewportY);
  const button =
    element?.closest?.('.syllable-btn') ||
    nearestSyllableButtonFromPoint(x, y) ||
    nearestSyllableButtonFromHand(mappedPoints);

  if (!button) {
    clearAirHover();
    setHandDebug(debugPrefix(`fuera | mapa ${state.mappingMode}`), 'active');
    setCameraFeedback('Dedo detectado, fuera de una silaba.');
    return;
  }

  const id = button.dataset.id;
  if (id !== state.hoverId) {
    clearAirHover();
    state.hoverId = id;
    state.hoverStartedAt = performance.now();
    state.selectedElement = button;
    button.classList.add('air-hover');
    airCursor.classList.add('locking');
    setHandDebug(debugPrefix(`sobre ${button.dataset.syllable} | mapa ${state.mappingMode}`), 'locking');
    setFeedback(`Mantén el dedo sobre ${button.dataset.syllable}`, '');
    return;
  }

  setHandDebug(debugPrefix(`sobre ${button.dataset.syllable} | mapa ${state.mappingMode}`), 'locking');
  const dwellMs = 430;
  if (performance.now() - state.hoverStartedAt >= dwellMs && performance.now() - state.lastAirSelectionAt > 700) {
    selectSyllable(button.dataset.side, button.dataset.syllable, button);
    state.lastAirSelectionAt = performance.now();
    state.hoverStartedAt = performance.now() + 450;
  }
}

function processBimanualSelection(mappedHands) {
  clearAirHover();
  const leftCandidate = bestCandidateForSide(mappedHands, 'left');
  const rightCandidate = bestCandidateForSide(mappedHands, 'right');

  updateHandPreview('left', leftCandidate?.button || null);
  updateHandPreview('right', rightCandidate?.button || null);

  const leftText = leftCandidate?.button?.dataset.syllable || '--';
  const rightText = rightCandidate?.button?.dataset.syllable || '--';
  const hasBoth = Boolean(leftCandidate?.button && rightCandidate?.button);
  const leftFixed = updateFixSelection('left', leftCandidate);
  const rightFixed = updateFixSelection('right', rightCandidate);

  if (!hasBoth) {
    setHandDebug(debugPrefix(`fijar: izquierda ${leftText} · derecha ${rightText} · apunta cada mano a su rueda`), 'active');
    setFeedback(`Izquierda ${leftText} · derecha ${rightText}. Mantén el índice quieto sobre una sílaba.`, '');
    return;
  }

  const built = `${leftText}${rightText}`;

  if (leftFixed || rightFixed) {
    setHandDebug(debugPrefix(`fijado ${leftFixed ? leftText : '--'} · ${rightFixed ? rightText : '--'} · ${state.left || '--'}+${state.right || '--'}`), 'locking');
    setFeedback(`Fijado: ${state.left || '--'} + ${state.right || '--'}`, 'ok');
    return;
  }

  setHandDebug(debugPrefix(`señalando ${leftText}+${rightText}=${built} · mantén quieto para fijar`), 'locking');
  setFeedback(`${leftText} + ${rightText} = ${built}. Mantén el índice quieto para fijar.`, '');
}

function bestCandidateForSide(mappedHands, side) {
  let best = null;
  mappedHands.forEach((mapped, handIndex) => {
    const candidate = nearestSyllableCandidateFromHand(mapped, side);
    if (!candidate) return;
    if (!best || candidate.distance < best.distance) {
      best = { ...candidate, handIndex };
    }
  });
  return best;
}

function nearestSyllableCandidateFromHand(mappedPoints, side) {
  const probeIndexes = [INDEX_TIP];
  const probes = probeIndexes.map((index) => ({ point: mappedPoints[index], index })).filter((probe) => probe.point);
  let nearest = null;
  let nearestDistance = Infinity;

  document.querySelectorAll(`.syllable-btn[data-side="${side}"]`).forEach((button) => {
    const box = buttonBoxInStage(button);
    const hitRadius = Math.max(box.width, box.height) * 1.55;

    probes.forEach(({ point, index }) => {
      const distance = Math.hypot(point.x - box.cx, point.y - box.cy);
      if (distance <= hitRadius && distance < nearestDistance) {
        nearest = { button, distance, hitRadius, point, probeIndex: index };
        nearestDistance = distance;
      }
    });
  });

  return nearest;
}

function updateFixSelection(side, candidate) {
  const tracker = state.fix[side];

  if (!candidate?.button) {
    resetFixSide(side);
    return false;
  }

  const id = candidate.button.dataset.id;
  const now = performance.now();
  const point = candidate.point;
  const previousPoint = tracker.lastPoint;
  const movement = previousPoint ? Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y) : 0;
  const stableMovementPx = 42;
  const requiredMs = 720;

  if (tracker.targetId !== id || movement > stableMovementPx) {
    tracker.targetId = id;
    tracker.startedAt = now;
    tracker.lastPoint = point;
    setFixProgress(candidate.button, 0);
    return false;
  }

  tracker.lastPoint = point;
  const progress = clamp((now - tracker.startedAt) / requiredMs, 0, 1);
  setFixProgress(candidate.button, progress);

  const alreadySelected = state[side] === candidate.button.dataset.syllable && candidate.button.classList.contains('selected');
  const cooledDown = now - tracker.selectedAt > 1200;
  if (progress >= 1 && !alreadySelected && cooledDown) {
    tracker.selectedAt = now;
    candidate.button.classList.add('fixed-pulse');
    window.setTimeout(() => candidate.button.classList.remove('fixed-pulse'), 320);
    selectSyllable(side, candidate.button.dataset.syllable, candidate.button);
    return true;
  }

  return false;
}

function updateHandPreview(side, button) {
  const old = state.previewElements[side];
  if (old && old !== button) {
    old.classList.remove(`hand-preview-${side}`, 'fix-ready', 'fixed-pulse');
    setFixProgress(old, 0);
  }

  state.previewElements[side] = button;
  state.previews[side] = button?.dataset.syllable || null;

  if (button) {
    button.classList.add(`hand-preview-${side}`, 'fix-ready');
  }
}

function clearHandPreviews() {
  ['left', 'right'].forEach((side) => updateHandPreview(side, null));
}

function resetFixSide(side) {
  const tracker = state.fix[side];
  tracker.targetId = '';
  tracker.startedAt = 0;
  tracker.lastPoint = null;
  const button = state.previewElements[side];
  if (button) setFixProgress(button, 0);
}

function resetFixState() {
  ['left', 'right'].forEach(resetFixSide);
  document.querySelectorAll('.syllable-btn').forEach((button) => setFixProgress(button, 0));
}

function setFixProgress(button, progress) {
  button.style.setProperty('--fix-progress', `${Math.round(progress * 360)}deg`);
}

function nearestSyllableButtonFromPoint(stageX, stageY) {
  const buttons = [...document.querySelectorAll('.syllable-btn')];
  let nearest = null;
  let nearestDistance = Infinity;

  buttons.forEach((button) => {
    const box = buttonBoxInStage(button);
    const distance = Math.hypot(stageX - box.cx, stageY - box.cy);
    const hitRadius = Math.max(box.width, box.height) * 1.22;
    if (distance <= hitRadius && distance < nearestDistance) {
      nearest = button;
      nearestDistance = distance;
    }
  });

  return nearest;
}

function nearestSyllableButtonFromHand(mappedPoints) {
  const probeIndexes = [INDEX_TIP];
  const probes = probeIndexes.map((index) => mappedPoints[index]).filter(Boolean);
  let nearest = null;
  let nearestDistance = Infinity;

  document.querySelectorAll('.syllable-btn').forEach((button) => {
    const box = buttonBoxInStage(button);
    const hitRadius = Math.max(box.width, box.height) * 1.38;

    probes.forEach((point) => {
      const distance = Math.hypot(point.x - box.cx, point.y - box.cy);
      if (distance <= hitRadius && distance < nearestDistance) {
        nearest = button;
        nearestDistance = distance;
      }
    });
  });

  return nearest;
}

function buttonBoxInStage(button) {
  const stageRect = stage.getBoundingClientRect();
  const rect = button.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
    left: rect.left - stageRect.left,
    top: rect.top - stageRect.top,
    cx: rect.left - stageRect.left + rect.width / 2,
    cy: rect.top - stageRect.top + rect.height / 2,
  };
}

function setCameraFeedback(text) {
  const now = performance.now();
  if (now - state.lastCameraFeedbackAt < 450) return;
  state.lastCameraFeedbackAt = now;
  setFeedback(text, '');
}

function setHandDebug(text, mode) {
  ui.handDebug.textContent = text;
  ui.handDebug.classList.toggle('active', mode === 'active');
  ui.handDebug.classList.toggle('locking', mode === 'locking');
}

function debugPrefix(status) {
  return `${BUILD_ID} · ${state.handEngine} · frames ${state.framesSent} · resultados ${state.resultsSeen} · mano ${state.handsSeen} · ${status}`;
}

function compactError(error) {
  const text = String(error?.message || error || 'fallo desconocido');
  return text.length > 92 ? `${text.slice(0, 92)}...` : text;
}

function cameraErrorMessage(error) {
  const name = String(error?.name || '');
  const text = String(error?.message || error || '').toLowerCase();

  if (name === 'NotAllowedError' || text.includes('permission denied') || text.includes('denied')) {
    return 'Permiso de camara denegado. Permite la camara en el navegador y recarga la pagina.';
  }

  if (name === 'NotFoundError' || text.includes('not found') || text.includes('requested device not found')) {
    return 'No encuentro ninguna camara disponible. Revisa que otra app no la este usando.';
  }

  if (name === 'NotReadableError' || text.includes('could not start') || text.includes('in use')) {
    return 'La camara esta ocupada o bloqueada por el sistema. Cierra otras apps de camara y recarga.';
  }

  return `Camara bloqueada o no disponible: ${compactError(error)}`;
}

function clearAirHover() {
  if (state.selectedElement) state.selectedElement.classList.remove('air-hover');
  state.hoverId = '';
  state.hoverStartedAt = 0;
  state.selectedElement = null;
  airCursor.classList.remove('locking');
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

init();
