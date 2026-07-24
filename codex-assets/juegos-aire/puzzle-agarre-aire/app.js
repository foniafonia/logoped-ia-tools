const TASKS_VISION_PATH = '/vendor/tasks-vision';
const MEDIAPIPE_PATH = '/vendor/mediapipe/';
const BUILD_ID = 'puzzle-grab-v6';
const GRAB_TUNING = {
  candidateRadius: 190,
  grabRadius: 185,
  slotRadius: 255,
  wrongSlotRadius: 190,
  angleTolerance: 46,
  magnetRadius: 285,
  magnetStrength: .34,
  rotationStepDegrees: 90,
  rotationStepHysteresis: .62,
  lostHandReleaseMs: 900,
  releaseGuardMs: 260,
  gripSmooth: .46,
  releaseFramesNeeded: 2,
};

const HAND_CONNECTIONS_SIMPLE = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
];

const stage = document.querySelector('#stage');
const piecesLayer = document.querySelector('#pieces');
const slotsLayer = document.querySelector('#slots');
const handsCanvas = document.querySelector('#handsLayer');
const handsCtx = handsCanvas.getContext('2d');
const video = document.querySelector('#camera');
const fingerCursor = document.querySelector('#fingerCursor');

const ui = {
  cameraButton: document.querySelector('#cameraButton'),
  resetButton: document.querySelector('#resetButton'),
  cameraCard: document.querySelector('#cameraCard'),
  gestureLabel: document.querySelector('#gestureLabel'),
  cameraStatus: document.querySelector('#cameraStatus'),
  debugLine: document.querySelector('#debugLine'),
  feedback: document.querySelector('#feedback'),
  modeTabs: [...document.querySelectorAll('.mode-tab')],
  helpToggle: document.querySelector('#helpToggle'),
};

const puzzleModes = {
  letters: { id: 'letters', type: 'letters', label: 'letras', cols: 4, rows: 1, maxPiece: 142, letters: ['A', 'E', 'I', 'O'] },
  2: { id: '2', type: 'image', label: '2 piezas', cols: 2, rows: 1, maxPiece: 210 },
  4: { id: '4', type: 'image', label: '4 piezas', cols: 2, rows: 2, maxPiece: 185 },
  8: { id: '8', type: 'image', label: '8 piezas', cols: 4, rows: 2, maxPiece: 142 },
};

const state = {
  status: 'idle',
  cameraReady: false,
  sendingFrame: false,
  handLandmarker: null,
  handEngine: 'none',
  mediaPipeErrors: 0,
  framesSent: 0,
  resultsSeen: 0,
  handsSeen: 0,
  handSeenAt: 0,
  gestureCandidate: 'none',
  stableGesture: 'none',
  stableFrames: 0,
  hoverPieceId: '',
  hoverSlotId: '',
  grabbedPieceId: '',
  grabbedFrom: null,
  placedCount: 0,
  mappingMode: 'mirror',
  releaseGuardUntil: 0,
  smoothedGripPoint: null,
  grabbedOffset: null,
  releaseFrames: 0,
  modeId: '2',
  helpVisual: true,
  handAngle: 0,
  grabbedHandAngle: 0,
  grabbedRotation: 0,
  grabbedRotationStep: 0,
  pieces: new Map(),
};

function init() {
  buildPuzzle();
  resizeStage();
  bindEvents();
  setFeedback('Acerca la mano a una pieza', '');
  updateDebug();
  window.addEventListener('resize', resizeStage);
}

function buildPuzzle() {
  const mode = currentMode();
  stage.classList.toggle('letters-mode', mode.type === 'letters');
  stage.classList.toggle('no-help', !state.helpVisual);
  piecesLayer.innerHTML = '';
  slotsLayer.innerHTML = '';
  state.pieces.clear();
  state.placedCount = 0;
  state.smoothedGripPoint = null;
  state.grabbedOffset = null;
  state.releaseFrames = 0;

  for (let row = 0; row < mode.rows; row += 1) {
    for (let col = 0; col < mode.cols; col += 1) {
      const index = row * mode.cols + col;
      const item = {
        id: `${mode.id}-${index}`,
        label: mode.type === 'letters' ? mode.letters[index] : String(index + 1),
        row,
        col,
      };

    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.dataset.id = item.id;
      slot.setAttribute('aria-label', `Hueco ${item.label}`);
    slotsLayer.appendChild(slot);

    const piece = document.createElement('button');
    piece.type = 'button';
    piece.className = 'piece';
    piece.dataset.id = item.id;
      if (mode.type === 'letters') piece.textContent = item.label;
      piece.setAttribute('aria-label', `Pieza ${item.label}`);
    piece.addEventListener('pointerdown', (event) => startTouchDrag(event, item.id));
      piece.addEventListener('dblclick', (event) => {
        event.preventDefault();
        rotatePieceByStep(item.id);
      });
    piecesLayer.appendChild(piece);

      const targetRotation = 0;
      const rotation = mode.type === 'letters' ? 0 : initialRotationFor(index);
    state.pieces.set(item.id, {
      ...item,
      element: piece,
      slotElement: slot,
      x: 0,
      y: 0,
        rotation,
        targetRotation,
      placed: false,
      moved: false,
    });
    }
  }

  updateModeTabs();
}

function bindEvents() {
  ui.cameraButton.addEventListener('click', startCamera);
  ui.resetButton.addEventListener('click', () => {
    resetPuzzle();
    setFeedback('Acerca la mano a una pieza', '');
  });
  for (const tab of ui.modeTabs) {
    tab.addEventListener('click', () => setMode(tab.dataset.mode));
  }
  ui.helpToggle.addEventListener('click', toggleHelpVisual);
}

function resizeStage() {
  const rect = stage.getBoundingClientRect();
  const mode = currentMode();
  const layout = getPuzzleLayout(rect, mode);
  const dpr = window.devicePixelRatio || 1;
  handsCanvas.width = Math.max(1, Math.round(rect.width * dpr));
  handsCanvas.height = Math.max(1, Math.round(rect.height * dpr));
  handsCanvas.style.width = `${rect.width}px`;
  handsCanvas.style.height = `${rect.height}px`;
  handsCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  stage.style.setProperty('--piece-size', `${layout.pieceSize}px`);
  stage.style.setProperty('--image-cols', mode.cols);
  stage.style.setProperty('--image-rows', mode.rows);

  for (const piece of state.pieces.values()) {
    const slotPoint = getSlotPoint(piece, layout);
    piece.slotElement.style.left = `${slotPoint.x}px`;
    piece.slotElement.style.top = `${slotPoint.y}px`;
    applyImageCrop(piece, layout);

    if (!piece.moved && !piece.placed && piece.id !== state.grabbedPieceId) {
      const originPoint = getOriginPoint(piece, layout);
      piece.x = originPoint.x;
      piece.y = originPoint.y;
    }

    if (piece.placed) {
      piece.x = slotPoint.x;
      piece.y = slotPoint.y;
    }

    setPiecePosition(piece, piece.x, piece.y);
  }
}

function resetPuzzle() {
  const mode = currentMode();
  state.status = 'idle';
  state.hoverPieceId = '';
  state.hoverSlotId = '';
  state.grabbedPieceId = '';
  state.grabbedFrom = null;
  state.grabbedOffset = null;
  state.releaseFrames = 0;
  state.placedCount = 0;

  let index = 0;
  for (const piece of state.pieces.values()) {
    piece.placed = false;
    piece.moved = false;
    piece.rotation = mode.type === 'letters' ? 0 : initialRotationFor(index);
    piece.element.classList.remove('candidate', 'grabbed', 'placed', 'wrong');
    piece.slotElement.classList.remove('active', 'correct', 'wrong');
    index += 1;
  }

  resizeStage();
  updateStateClasses();
}

function setMode(modeId) {
  if (!puzzleModes[modeId] || modeId === state.modeId) return;
  state.modeId = modeId;
  state.status = 'idle';
  state.hoverPieceId = '';
  state.hoverSlotId = '';
  state.grabbedPieceId = '';
  state.grabbedFrom = null;
  state.grabbedOffset = null;
  state.releaseFrames = 0;
  buildPuzzle();
  resizeStage();
  setFeedback(currentMode().type === 'letters' ? 'Letras: agarra y coloca cada vocal' : `Puzzle real de ${currentMode().label}`, '');
  updateDebug();
}

function currentMode() {
  return puzzleModes[state.modeId] || puzzleModes[2];
}

function updateModeTabs() {
  for (const tab of ui.modeTabs) {
    const active = tab.dataset.mode === state.modeId;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
  }
  ui.helpToggle.classList.toggle('active', state.helpVisual);
  ui.helpToggle.textContent = state.helpVisual ? 'Ayuda visual' : 'Sin ayuda';
}

function toggleHelpVisual() {
  state.helpVisual = !state.helpVisual;
  stage.classList.toggle('no-help', !state.helpVisual);
  updateModeTabs();
  resizeStage();
  setFeedback(state.helpVisual ? 'Ayuda visual activada' : 'Sin plantilla debajo', '');
}

function initialRotationFor(index) {
  return [90, 270, 180, 90, 270, 180, 90, 270][index % 8];
}

function rotatePieceByStep(id) {
  const piece = getPiece(id);
  if (!piece || piece.placed || currentMode().type === 'letters') return;
  piece.rotation = normalizeDeg((piece.rotation || 0) + 90);
  setPiecePosition(piece, piece.x, piece.y);
  const nearSlot = nearestSlot({ x: piece.x, y: piece.y }, GRAB_TUNING.slotRadius);
  const angleOk = angleDistanceDeg(piece.rotation || 0, piece.targetRotation || 0) <= GRAB_TUNING.angleTolerance;
  if (nearSlot?.id === piece.id && angleOk) {
    placePiece(piece);
    return;
  }
  setFeedback(nearSlot?.id === piece.id ? 'Gira una vez mas si no encaja' : 'Ficha girada 90 grados', '');
}

async function startCamera() {
  ui.cameraButton.disabled = true;
  ui.cameraStatus.textContent = 'Solicitando permiso de camara...';

  try {
    await startRawCamera();
    state.cameraReady = true;
    ui.cameraStatus.textContent = 'Camara activa. Cargando HandLandmarker...';

    if (await tryStartTasksHandLandmarker()) return;

    if (window.Hands) {
      await startLegacyHands();
      return;
    }

    activateTouchFallback('No se pudo cargar detector de mano. Usa tactil como fallback.');
  } catch (error) {
    state.mediaPipeErrors += 1;
    ui.cameraButton.disabled = false;
    activateTouchFallback(compactError(error));
  }
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

async function tryStartTasksHandLandmarker() {
  try {
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

    state.handEngine = 'tasks';
    ui.cameraCard.classList.add('active');
    ui.gestureLabel.textContent = 'Tasks Vision listo';
    ui.cameraStatus.textContent = 'Enseña la mano abierta. Cierra el puno para agarrar.';
    pumpTasksFrames();
    return true;
  } catch (error) {
    state.mediaPipeErrors += 1;
    state.handEngine = 'tasks-error';
    ui.gestureLabel.textContent = 'Tasks fallo';
    ui.cameraStatus.textContent = `Probando fallback: ${compactError(error)}`;
    updateDebug();
    return false;
  }
}

function pumpTasksFrames() {
  if (state.sendingFrame) return;
  state.sendingFrame = true;

  const send = () => {
    if (!state.handLandmarker || !video.srcObject) {
      state.sendingFrame = false;
      return;
    }

    if (video.readyState >= 2) {
      try {
        const results = state.handLandmarker.detectForVideo(video, performance.now());
        state.framesSent += 1;
        handleTaskResults(results);
      } catch (error) {
        state.mediaPipeErrors += 1;
        state.sendingFrame = false;
        state.handEngine = 'tasks-runtime-error';
        ui.cameraStatus.textContent = 'HandLandmarker fallo en ejecucion. Probando MediaPipe legacy.';
        startLegacyHands().catch(() => activateTouchFallback(compactError(error)));
        return;
      }
    }

    requestAnimationFrame(send);
  };

  requestAnimationFrame(send);
}

function handleTaskResults(results) {
  state.resultsSeen += 1;
  const landmarks = results.landmarks?.[0];
  if (!landmarks?.length) {
    handleNoHand();
    return;
  }
  handleNormalizedLandmarks(landmarks);
}

function locateMediaPipeFile(file) {
  if (file === 'hands_solution_simd_wasm_bin.js') return `${MEDIAPIPE_PATH}hands_solution_wasm_bin.js`;
  if (file === 'hands_solution_simd_wasm_bin.wasm') return `${MEDIAPIPE_PATH}hands_solution_wasm_bin.wasm`;
  return `${MEDIAPIPE_PATH}${file}`;
}

async function startLegacyHands() {
  if (!window.Hands) {
    activateTouchFallback('MediaPipe legacy no esta disponible. Fallback tactil activo.');
    return;
  }

  const hands = new Hands({ locateFile: locateMediaPipeFile });
  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0,
    minDetectionConfidence: .5,
    minTrackingConfidence: .5,
    selfieMode: true,
  });
  hands.onResults(onLegacyResults);

  state.handEngine = 'legacy';
  state.sendingFrame = false;
  ui.cameraCard.classList.add('active');
  ui.gestureLabel.textContent = 'MediaPipe legacy';
  ui.cameraStatus.textContent = 'Fallback legacy activo. Cierra el puno para agarrar.';
  pumpLegacyFrames(hands);
}

function pumpLegacyFrames(hands) {
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
        activateTouchFallback(compactError(error));
        return;
      }
    }
    requestAnimationFrame(send);
  };

  requestAnimationFrame(send);
}

function onLegacyResults(results) {
  state.resultsSeen += 1;
  const landmarks = results.multiHandLandmarks?.[0];
  if (!landmarks?.length) {
    handleNoHand();
    return;
  }
  handleNormalizedLandmarks(landmarks);
}

function handleNormalizedLandmarks(landmarks) {
  state.handSeenAt = performance.now();
  state.handsSeen += 1;
  ui.cameraCard.classList.add('active');

  const mapped = landmarks.map((point) => landmarkToStagePoint(point));
  const palm = getPalmCenter(mapped);
  const gripPoint = smoothGripPoint(getFingerGripPoint(mapped));
  const handAngle = getHandAngle(mapped);
  const grip = classifyGrip(landmarks);
  const stableGrip = stabilizeGrip(grip.name, Boolean(state.grabbedPieceId));
  state.handAngle = handAngle;

  drawHandLandmarks(mapped, palm, grip, gripPoint);
  updateFingerCursor(gripPoint, stableGrip === 'fist' || grip.name === 'fist');
  processGrabInteraction(gripPoint, stableGrip, grip, mapped, handAngle);
  updateDebug();
}

function handleNoHand() {
  clearHandLayer();
  fingerCursor.hidden = true;
  ui.cameraCard.classList.remove('active');
  state.gestureCandidate = 'none';
  state.stableGesture = 'none';
  state.stableFrames = 0;

  if (state.grabbedPieceId && performance.now() - state.handSeenAt > GRAB_TUNING.lostHandReleaseMs) {
    releasePiece(null, true);
  }

  if (performance.now() - state.handSeenAt > 320) {
    setFeedback('Acerca la mano', '');
    ui.gestureLabel.textContent = state.handEngine === 'none' ? 'Sin camara' : 'Buscando mano';
  }
  updateDebug();
}

function processGrabInteraction(gripPoint, stableGrip, grip, mapped, handAngle) {
  const now = performance.now();
  const grabbed = getGrabbedPiece();
  ui.gestureLabel.textContent = grip.label;

  if (grabbed) {
    const offset = state.grabbedOffset || { x: 0, y: 0 };
    grabbed.x = gripPoint.x + offset.x;
    grabbed.y = gripPoint.y + offset.y;
    if (currentMode().type === 'image') {
      const delta = radToDeg(shortestAngleRad(handAngle, state.grabbedHandAngle));
      state.grabbedRotationStep = getStableRotationStep(delta, state.grabbedRotationStep);
      grabbed.rotation = normalizeDeg(state.grabbedRotation + state.grabbedRotationStep * GRAB_TUNING.rotationStepDegrees);
    }
    grabbed.moved = true;

    const pieceCenter = { x: grabbed.x, y: grabbed.y };
    const nearSlot = nearestSlot(pieceCenter, GRAB_TUNING.slotRadius);
    if (nearSlot?.id === grabbed.id) {
      const slotPoint = getSlotPoint(grabbed, getPuzzleLayout(stage.getBoundingClientRect(), currentMode()));
      const distance = Math.hypot(slotPoint.x - grabbed.x, slotPoint.y - grabbed.y);
      if (distance < GRAB_TUNING.magnetRadius) {
        grabbed.x += (slotPoint.x - grabbed.x) * GRAB_TUNING.magnetStrength;
        grabbed.y += (slotPoint.y - grabbed.y) * GRAB_TUNING.magnetStrength;
        pieceCenter.x = grabbed.x;
        pieceCenter.y = grabbed.y;
      }
    }
    setPiecePosition(grabbed, grabbed.x, grabbed.y);

    state.hoverSlotId = nearSlot?.id || '';
    state.status = nearSlot ? 'hoverSlot' : 'dragging';

    state.releaseFrames = hasReleaseIntent(grip) ? state.releaseFrames + 1 : 0;
    if (state.releaseFrames >= GRAB_TUNING.releaseFramesNeeded && now > state.releaseGuardUntil) {
      releasePiece(pieceCenter, false);
      return;
    }

    const angleOk = currentMode().type === 'letters' || angleDistanceDeg(grabbed.rotation || 0, grabbed.targetRotation || 0) <= GRAB_TUNING.angleTolerance;
    setFeedback(nearSlot?.id === grabbed.id
      ? angleOk ? 'Abre los dedos para encajar' : 'Gira la mano hasta que encaje'
      : nearSlot ? 'Ese hueco no es' : 'Lleva al hueco', '');
    updateStateClasses();
    return;
  }

  state.hoverSlotId = '';
  state.releaseFrames = 0;
  const candidate = nearestLoosePiece(gripPoint, GRAB_TUNING.candidateRadius)
    || nearestLoosePieceNearHand(mapped, GRAB_TUNING.candidateRadius);
  const wantsGrab = grip.name === 'fist' || (stableGrip === 'fist' && state.gestureCandidate === 'fist');

  if (!wantsGrab) {
    state.hoverPieceId = candidate?.id || '';
    state.status = candidate ? 'hoverPiece' : 'idle';
    setFeedback(candidate ? 'Cierra para agarrar' : 'Acerca la mano', '');
    updateStateClasses();
    return;
  }

  if (wantsGrab) {
    const grabCandidate = getPiece(state.hoverPieceId)
      || candidate
      || nearestLoosePieceNearHand(mapped, GRAB_TUNING.grabRadius)
      || nearestLoosePiece(gripPoint, GRAB_TUNING.grabRadius);
    if (grabCandidate) {
      grabPiece(grabCandidate, gripPoint);
      return;
    }
    state.status = 'idle';
    setFeedback('Abre la mano cerca de una pieza', '');
    updateStateClasses();
    return;
  }

  setFeedback('Abre la mano sobre una pieza', '');
  updateStateClasses();
}

function grabPiece(piece, gripPoint) {
  state.grabbedPieceId = piece.id;
  state.grabbedFrom = { x: piece.x, y: piece.y };
  state.grabbedOffset = { x: piece.x - gripPoint.x, y: piece.y - gripPoint.y };
  state.grabbedHandAngle = state.handAngle;
  state.grabbedRotation = piece.rotation || 0;
  state.grabbedRotationStep = 0;
  state.releaseFrames = 0;
  state.hoverPieceId = '';
  state.releaseGuardUntil = performance.now() + GRAB_TUNING.releaseGuardMs;
  state.status = 'grabbed';
  piece.moved = true;
  setFeedback('Lleva al hueco', '');
  updateStateClasses();
}

function releasePiece(palm, lostHand) {
  const piece = getGrabbedPiece();
  if (!piece) return;

  const releasePoint = palm || { x: piece.x, y: piece.y };
  const slot = nearestSlot(releasePoint, GRAB_TUNING.slotRadius);
  const sameSlot = slot?.id === piece.id;
  const angleOk = currentMode().type === 'letters' || angleDistanceDeg(piece.rotation || 0, piece.targetRotation || 0) <= GRAB_TUNING.angleTolerance;
  const correct = sameSlot && angleOk;
  const wrongSlot = slot && !correct && distanceToSlot(releasePoint, slot) < GRAB_TUNING.wrongSlotRadius;

  piece.element.classList.remove('grabbed');
  state.grabbedPieceId = '';
  state.hoverSlotId = '';
  state.grabbedOffset = null;
  state.releaseFrames = 0;

  if (correct) {
    placePiece(piece);
  } else if (sameSlot && !angleOk) {
    const point = getSlotPoint(piece, getPuzzleLayout(stage.getBoundingClientRect(), currentMode()));
    piece.x = point.x;
    piece.y = point.y;
    piece.moved = true;
    piece.element.classList.add('wrong');
    setPiecePosition(piece, piece.x, piece.y);
    setFeedback('Está en su sitio: solo falta girarla', 'warn');
    setTimeout(() => piece.element.classList.remove('wrong'), 320);
    state.status = 'idle';
  } else if (wrongSlot || lostHand) {
    const back = state.grabbedFrom || getOriginPoint(piece, getPuzzleLayout(stage.getBoundingClientRect(), currentMode()));
    piece.x = back.x;
    piece.y = back.y;
    piece.moved = true;
    piece.element.classList.add('wrong');
    setPiecePosition(piece, piece.x, piece.y);
    setFeedback(wrongSlot ? 'Ese no es su hueco' : 'Se perdio la mano', 'warn');
    setTimeout(() => piece.element.classList.remove('wrong'), 320);
    state.status = 'idle';
  } else {
    piece.x = releasePoint.x;
    piece.y = releasePoint.y;
    piece.moved = true;
    setPiecePosition(piece, piece.x, piece.y);
    setFeedback('Suelta. Puedes volver a agarrarla', '');
    state.status = 'idle';
  }

  state.grabbedFrom = null;
  state.releaseFrames = 0;
  updateStateClasses();
  updateDebug();
}

function placePiece(piece) {
  const point = getSlotPoint(piece, getPuzzleLayout(stage.getBoundingClientRect(), currentMode()));
  piece.x = point.x;
  piece.y = point.y;
  piece.rotation = piece.targetRotation || 0;
  piece.placed = true;
  piece.moved = true;
  piece.element.classList.add('placed');
  piece.slotElement.classList.add('correct');
  setPiecePosition(piece, piece.x, piece.y);
  state.placedCount += 1;
  state.status = 'placed';
  setFeedback(state.placedCount === currentMode().cols * currentMode().rows ? 'Puzzle completado' : 'Encajado', 'ok');
}

function classifyGrip(points) {
  const palmSize = Math.max(distance2d(points[0], points[9]), .001);
  const fingerChecks = [
    isFingerOpen(points, 5, 6, 8, palmSize),
    isFingerOpen(points, 9, 10, 12, palmSize),
    isFingerOpen(points, 13, 14, 16, palmSize),
    isFingerOpen(points, 17, 18, 20, palmSize),
  ];
  const openFingerCount = fingerChecks.filter(Boolean).length;
  const tips = [8, 12, 16, 20];
  const avgTipToWrist = average(tips.map((index) => distance2d(points[index], points[0]))) / palmSize;
  const avgTipToPalm = average(tips.map((index) => distance2d(points[index], points[9]))) / palmSize;

  let name = 'other';
  if (openFingerCount >= 3 && avgTipToWrist > 2.05 && avgTipToPalm > 1.55) name = 'open';
  if (openFingerCount <= 2 && (avgTipToPalm < 2.05 || avgTipToWrist < 2.35)) name = 'fist';

  return {
    name,
    openFingerCount,
    avgTipToWrist,
    avgTipToPalm,
    label: name === 'open' ? 'Mano abierta' : name === 'fist' ? 'Puno cerrado' : 'Mano detectada',
  };
}

function isFingerOpen(points, mcp, pip, tip, palmSize) {
  const tipToMcp = distance2d(points[tip], points[mcp]);
  const pipToMcp = distance2d(points[pip], points[mcp]);
  const tipToWrist = distance2d(points[tip], points[0]);
  const pipToWrist = distance2d(points[pip], points[0]);
  return tipToMcp > pipToMcp * 1.45 && tipToWrist > pipToWrist + palmSize * .1;
}

function stabilizeGrip(grip, isHolding) {
  if (grip !== state.gestureCandidate) {
    state.gestureCandidate = grip;
    state.stableFrames = 1;
  } else {
    state.stableFrames += 1;
  }

  const needed = grip === 'fist' ? 2 : isHolding && grip === 'open' ? 4 : 2;
  if (state.stableFrames >= needed) state.stableGesture = grip;

  if (isHolding && grip === 'other') {
    return state.stableGesture === 'open' ? 'other' : 'fist';
  }

  return state.stableGesture;
}

function hasReleaseIntent(grip) {
  return grip.name === 'open'
    || grip.openFingerCount >= 3
    || grip.avgTipToPalm > 2.05
    || grip.avgTipToWrist > 2.42;
}

function getPalmCenter(mapped) {
  const indices = [0, 5, 9, 13, 17];
  const points = indices.map((index) => mapped[index]).filter(Boolean);
  return {
    x: average(points.map((point) => point.x)),
    y: average(points.map((point) => point.y)),
  };
}

function getFingerGripPoint(mapped) {
  const indices = [4, 8, 12, 16, 20];
  const points = indices.map((index) => mapped[index]).filter(Boolean);
  return {
    x: average(points.map((point) => point.x)),
    y: average(points.map((point) => point.y)),
  };
}

function getHandAngle(mapped) {
  const wrist = mapped[0];
  const middleBase = mapped[9] || mapped[5];
  if (!wrist || !middleBase) return state.handAngle || 0;
  return Math.atan2(middleBase.y - wrist.y, middleBase.x - wrist.x);
}

function smoothGripPoint(point) {
  if (!state.smoothedGripPoint) {
    state.smoothedGripPoint = point;
    return point;
  }

  state.smoothedGripPoint = {
    x: state.smoothedGripPoint.x + (point.x - state.smoothedGripPoint.x) * GRAB_TUNING.gripSmooth,
    y: state.smoothedGripPoint.y + (point.y - state.smoothedGripPoint.y) * GRAB_TUNING.gripSmooth,
  };
  return state.smoothedGripPoint;
}

function shortestAngleRad(a, b) {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

function getStableRotationStep(deltaDeg, currentStep) {
  const stepSize = GRAB_TUNING.rotationStepDegrees;
  const threshold = stepSize * GRAB_TUNING.rotationStepHysteresis;
  let step = currentStep || 0;

  while (deltaDeg > step * stepSize + threshold) step += 1;
  while (deltaDeg < step * stepSize - threshold) step -= 1;

  return clamp(step, -4, 4);
}

function radToDeg(value) {
  return value * 180 / Math.PI;
}

function normalizeDeg(value) {
  return ((value % 360) + 360) % 360;
}

function angleDistanceDeg(a, b) {
  const diff = Math.abs(normalizeDeg(a) - normalizeDeg(b));
  return Math.min(diff, 360 - diff);
}

function drawHandLandmarks(mapped, palm, grip, gripPoint) {
  clearHandLayer();
  handsCtx.save();
  handsCtx.lineCap = 'round';
  handsCtx.lineJoin = 'round';

  handsCtx.lineWidth = 8;
  handsCtx.strokeStyle = 'rgba(255, 255, 255, .9)';
  for (const [from, to] of HAND_CONNECTIONS_SIMPLE) drawConnection(mapped[from], mapped[to]);

  handsCtx.lineWidth = 4;
  handsCtx.strokeStyle = grip.name === 'fist' ? 'rgba(22, 163, 74, .95)' : 'rgba(37, 99, 235, .95)';
  for (const [from, to] of HAND_CONNECTIONS_SIMPLE) drawConnection(mapped[from], mapped[to]);

  for (const [index, point] of mapped.entries()) {
    const palmPoint = [0, 5, 9, 13, 17].includes(index);
    handsCtx.fillStyle = palmPoint ? '#f6c944' : '#ffffff';
    handsCtx.strokeStyle = grip.name === 'fist' ? '#16a34a' : '#2563eb';
    handsCtx.lineWidth = palmPoint ? 4 : 3;
    handsCtx.beginPath();
    handsCtx.arc(point.x, point.y, palmPoint ? 8 : 5.5, 0, Math.PI * 2);
    handsCtx.fill();
    handsCtx.stroke();
  }

  drawFingerGrip(mapped, gripPoint, grip);
  handsCtx.restore();
}

function drawFingerGrip(mapped, gripPoint, grip) {
  const tips = [4, 8, 12, 16, 20].map((index) => mapped[index]).filter(Boolean);
  const closed = grip.name === 'fist';

  handsCtx.lineWidth = closed ? 7 : 4;
  handsCtx.strokeStyle = closed ? 'rgba(22, 163, 74, .92)' : 'rgba(37, 99, 235, .45)';
  for (const tip of tips) {
    handsCtx.beginPath();
    handsCtx.moveTo(tip.x, tip.y);
    handsCtx.lineTo(gripPoint.x, gripPoint.y);
    handsCtx.stroke();
  }

  handsCtx.fillStyle = closed ? 'rgba(22, 163, 74, .18)' : 'rgba(37, 99, 235, .1)';
  handsCtx.strokeStyle = closed ? 'rgba(22, 163, 74, .96)' : 'rgba(37, 99, 235, .72)';
  handsCtx.lineWidth = closed ? 6 : 4;
  handsCtx.beginPath();
  handsCtx.ellipse(gripPoint.x, gripPoint.y, closed ? 52 : 64, closed ? 40 : 48, 0, 0, Math.PI * 2);
  handsCtx.fill();
  handsCtx.stroke();
}

function drawConnection(a, b) {
  if (!a || !b) return;
  handsCtx.beginPath();
  handsCtx.moveTo(a.x, a.y);
  handsCtx.lineTo(b.x, b.y);
  handsCtx.stroke();
}

function clearHandLayer() {
  const rect = stage.getBoundingClientRect();
  handsCtx.clearRect(0, 0, rect.width, rect.height);
}

function updateFingerCursor(point, closed) {
  fingerCursor.hidden = false;
  fingerCursor.classList.toggle('closed', closed);
  fingerCursor.style.left = `${point.x}px`;
  fingerCursor.style.top = `${point.y}px`;
}

function updateStateClasses() {
  for (const piece of state.pieces.values()) {
    piece.element.classList.toggle('candidate', piece.id === state.hoverPieceId);
    piece.element.classList.toggle('grabbed', piece.id === state.grabbedPieceId);
    piece.element.classList.toggle('placed', piece.placed);
    piece.slotElement.classList.toggle('active', piece.id === state.hoverSlotId);
    piece.slotElement.classList.toggle('wrong', state.hoverSlotId === piece.id && state.grabbedPieceId && state.grabbedPieceId !== piece.id);
  }
}

function nearestLoosePiece(point, maxDistance) {
  let best = null;
  let bestDistance = Infinity;
  for (const piece of state.pieces.values()) {
    if (piece.placed) continue;
    const distance = Math.hypot(piece.x - point.x, piece.y - point.y);
    if (distance < maxDistance && distance < bestDistance) {
      best = piece;
      bestDistance = distance;
    }
  }
  return best;
}

function nearestLoosePieceNearHand(mapped, maxDistance) {
  const probeIndices = [4, 8, 12, 16, 20, 5, 9, 13, 17];
  const probes = probeIndices.map((index) => mapped[index]).filter(Boolean);
  let best = null;
  let bestDistance = Infinity;

  for (const piece of state.pieces.values()) {
    if (piece.placed) continue;
    for (const point of probes) {
      const distance = Math.hypot(piece.x - point.x, piece.y - point.y);
      if (distance < maxDistance && distance < bestDistance) {
        best = piece;
        bestDistance = distance;
      }
    }
  }

  return best;
}

function nearestSlot(point, maxDistance) {
  let best = null;
  let bestDistance = Infinity;
  const layout = getPuzzleLayout(stage.getBoundingClientRect(), currentMode());
  for (const piece of state.pieces.values()) {
    const slot = getSlotPoint(piece, layout);
    const distance = Math.hypot(slot.x - point.x, slot.y - point.y);
    if (distance < maxDistance && distance < bestDistance) {
      best = piece;
      bestDistance = distance;
    }
  }
  return best;
}

function distanceToSlot(point, piece) {
  const slot = getSlotPoint(piece, getPuzzleLayout(stage.getBoundingClientRect(), currentMode()));
  return Math.hypot(slot.x - point.x, slot.y - point.y);
}

function getPiece(id) {
  return id ? state.pieces.get(id) : null;
}

function getGrabbedPiece() {
  return getPiece(state.grabbedPieceId);
}

function setPiecePosition(piece, x, y) {
  piece.element.style.left = `${x}px`;
  piece.element.style.top = `${y}px`;
  const scale = piece.id === state.grabbedPieceId ? 1.06 : 1;
  piece.element.style.transform = `translate(-50%, -50%) rotate(${piece.rotation || 0}deg) scale(${scale})`;
}

function pctToStage(point) {
  const rect = stage.getBoundingClientRect();
  return { x: point.x * rect.width, y: point.y * rect.height };
}

function getPuzzleLayout(rect, mode) {
  const compact = rect.width < 720;
  const boardMaxW = compact ? rect.width * .82 : rect.width * .44;
  const boardMaxH = compact ? rect.height * .34 : rect.height * .56;
  const pieceSize = Math.floor(clamp(
    Math.min(boardMaxW / mode.cols, boardMaxH / mode.rows, mode.maxPiece),
    compact ? 66 : 92,
    mode.maxPiece,
  ));
  const boardW = pieceSize * mode.cols;
  const boardH = pieceSize * mode.rows;

  return {
    pieceSize,
    boardW,
    boardH,
    boardLeft: compact ? (rect.width - boardW) / 2 : rect.width * .68 - boardW / 2,
    boardTop: compact ? rect.height * .12 : rect.height * .22,
    trayLeft: compact ? (rect.width - Math.min(rect.width * .88, boardW + pieceSize * .9)) / 2 : rect.width * .08,
    trayTop: compact ? rect.height * .54 : rect.height * .2,
    compact,
  };
}

function getSlotPoint(piece, layout) {
  return {
    x: layout.boardLeft + piece.col * layout.pieceSize + layout.pieceSize / 2,
    y: layout.boardTop + piece.row * layout.pieceSize + layout.pieceSize / 2,
  };
}

function getOriginPoint(piece, layout) {
  const mode = currentMode();
  const order = shuffledOriginOrder(mode.cols * mode.rows);
  const originIndex = order[piece.row * mode.cols + piece.col] || 0;
  const trayCols = Math.min(mode.cols, 4);
  const gap = layout.pieceSize * (layout.compact ? .18 : .24);
  const row = Math.floor(originIndex / trayCols);
  const col = originIndex % trayCols;

  return {
    x: layout.trayLeft + col * (layout.pieceSize + gap) + layout.pieceSize / 2,
    y: layout.trayTop + row * (layout.pieceSize + gap) + layout.pieceSize / 2,
  };
}

function shuffledOriginOrder(count) {
  const presets = {
    2: [1, 0],
    4: [2, 0, 3, 1],
    8: [5, 1, 7, 3, 0, 6, 2, 4],
  };
  return presets[count] || [...Array(count).keys()].reverse();
}

function applyImageCrop(piece, layout) {
  const size = layout.pieceSize;
  const mode = currentMode();
  const pad = getShapePad(size);
  const outer = size + pad * 2;
  const pieceImage = mode.type === 'letters'
    ? makeLetterPieceSvg(piece, size, pad, false)
    : makeJigsawPieceSvg(piece, mode, size, pad, false);
  const slotImage = mode.type === 'letters'
    ? makeLetterPieceSvg(piece, size, pad, true)
    : makeJigsawPieceSvg(piece, mode, size, pad, true);

  piece.element.style.width = `${outer}px`;
  piece.element.style.height = `${outer}px`;
  piece.element.style.backgroundImage = `url("${pieceImage}")`;
  piece.element.style.backgroundSize = '100% 100%';
  piece.element.style.backgroundPosition = 'center';

  piece.slotElement.style.width = `${outer}px`;
  piece.slotElement.style.height = `${outer}px`;
  piece.slotElement.style.backgroundImage = `url("${slotImage}")`;
  piece.slotElement.style.backgroundSize = '100% 100%';
  piece.slotElement.style.backgroundPosition = 'center';
}

function getShapePad(size) {
  return Math.round(size * .18);
}

function makeJigsawPieceSvg(piece, mode, size, pad, ghost) {
  const outer = size + pad * 2;
  const path = makePiecePath(piece, mode, size, pad);
  const boardW = mode.cols * size;
  const boardH = mode.rows * size;
  const opacity = ghost ? '.32' : '1';
  const stroke = ghost ? 'rgba(18,32,51,.45)' : 'rgba(255,255,255,.95)';
  const body = makePuzzleSceneBody();
  const showGhostImage = !ghost || state.helpVisual;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${outer} ${outer}">
      <defs>
        <clipPath id="clip"><path d="${path}"/></clipPath>
      </defs>
      <rect width="${outer}" height="${outer}" fill="transparent"/>
      ${ghost && !state.helpVisual ? `<path d="${path}" fill="rgba(255,255,255,.34)"/>` : ''}
      ${showGhostImage ? `<g clip-path="url(#clip)" opacity="${opacity}">
        <g transform="translate(${pad - piece.col * size} ${pad - piece.row * size}) scale(${boardW / 800} ${boardH / 400})">
          ${body}
        </g>
      </g>` : ''}
      <path d="${path}" fill="none" stroke="${stroke}" stroke-width="${Math.max(3, size * .035)}" stroke-linejoin="round"/>
      <path d="${path}" fill="none" stroke="rgba(18,32,51,.22)" stroke-width="${Math.max(1.5, size * .014)}" stroke-linejoin="round"/>
    </svg>`;
  return svgData(svg);
}

function makeLetterPieceSvg(piece, size, pad, ghost) {
  const outer = size + pad * 2;
  const mode = currentMode();
  const path = makePiecePath(piece, mode, size, pad);
  const colors = ['#f59e0b', '#0ea5e9', '#ec4899', '#22c55e'];
  const fill = ghost ? '#ffffff' : colors[(piece.row * mode.cols + piece.col) % colors.length];
  const opacity = ghost ? '.28' : '1';
  const textFill = ghost ? 'rgba(18,32,51,.5)' : '#ffffff';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${outer} ${outer}">
      <path d="${path}" fill="${fill}" opacity="${opacity}" stroke="rgba(18,32,51,.38)" stroke-width="${Math.max(3, size * .035)}" stroke-linejoin="round"/>
      <text x="${outer / 2}" y="${outer / 2 + size * .18}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size * .72}" font-weight="900" fill="${textFill}">${piece.label}</text>
    </svg>`;
  return svgData(svg);
}

function makePiecePath(piece, mode, size, pad) {
  const top = piece.row === 0 ? 0 : -edgeSign('h', piece.row - 1, piece.col);
  const right = piece.col === mode.cols - 1 ? 0 : edgeSign('v', piece.row, piece.col);
  const bottom = piece.row === mode.rows - 1 ? 0 : edgeSign('h', piece.row, piece.col);
  const left = piece.col === 0 ? 0 : -edgeSign('v', piece.row, piece.col - 1);
  const x = pad;
  const y = pad;
  const s = size;
  return [
    `M ${x} ${y}`,
    edgeTop(x, y, s, top),
    edgeRight(x + s, y, s, right),
    edgeBottom(x + s, y + s, s, bottom),
    edgeLeft(x, y + s, s, left),
    'Z',
  ].join(' ');
}

function edgeSign(axis, row, col) {
  return ((row + col + (axis === 'v' ? 1 : 0)) % 2 === 0) ? 1 : -1;
}

function edgeTop(x, y, s, sign) {
  if (!sign) return `L ${x + s} ${y}`;
  const d = sign * s * .2;
  return `L ${x + s * .34} ${y} C ${x + s * .36} ${y - d} ${x + s * .46} ${y - d} ${x + s * .5} ${y - d} C ${x + s * .54} ${y - d} ${x + s * .64} ${y - d} ${x + s * .66} ${y} L ${x + s} ${y}`;
}

function edgeRight(x, y, s, sign) {
  if (!sign) return `L ${x} ${y + s}`;
  const d = sign * s * .2;
  return `L ${x} ${y + s * .34} C ${x + d} ${y + s * .36} ${x + d} ${y + s * .46} ${x + d} ${y + s * .5} C ${x + d} ${y + s * .54} ${x + d} ${y + s * .64} ${x} ${y + s * .66} L ${x} ${y + s}`;
}

function edgeBottom(x, y, s, sign) {
  if (!sign) return `L ${x - s} ${y}`;
  const d = sign * s * .2;
  return `L ${x - s * .34} ${y} C ${x - s * .36} ${y + d} ${x - s * .46} ${y + d} ${x - s * .5} ${y + d} C ${x - s * .54} ${y + d} ${x - s * .64} ${y + d} ${x - s * .66} ${y} L ${x - s} ${y}`;
}

function edgeLeft(x, y, s, sign) {
  if (!sign) return `L ${x} ${y - s}`;
  const d = sign * s * .2;
  return `L ${x} ${y - s * .34} C ${x - d} ${y - s * .36} ${x - d} ${y - s * .46} ${x - d} ${y - s * .5} C ${x - d} ${y - s * .54} ${x - d} ${y - s * .64} ${x} ${y - s * .66} L ${x} ${y - s}`;
}

function svgData(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`;
}

function landmarkToStagePoint(point) {
  const rect = stage.getBoundingClientRect();
  const mirrorX = state.mappingMode === 'mirror';
  return {
    x: clamp((mirrorX ? 1 - point.x : point.x) * rect.width, 0, rect.width),
    y: clamp(point.y * rect.height, 0, rect.height),
    z: point.z || 0,
  };
}

function startTouchDrag(event, id) {
  const piece = getPiece(id);
  if (!piece || piece.placed) return;
  event.preventDefault();
  if (piece.element.setPointerCapture) {
    piece.element.setPointerCapture(event.pointerId);
  }
  state.grabbedPieceId = id;
  state.grabbedFrom = { x: piece.x, y: piece.y };
  state.status = 'dragging';
  updateStateClasses();
  setFeedback('Fallback tactil: lleva al hueco y suelta', '');

  const move = (moveEvent) => {
    const point = pointerToStage(moveEvent);
    piece.x = point.x;
    piece.y = point.y;
    piece.moved = true;
    setPiecePosition(piece, piece.x, piece.y);
    const slot = nearestSlot(point, GRAB_TUNING.slotRadius);
    state.hoverSlotId = slot?.id || '';
    updateStateClasses();
  };

  const up = (upEvent) => {
    if (piece.element.releasePointerCapture && piece.element.hasPointerCapture?.(event.pointerId)) {
      piece.element.releasePointerCapture(event.pointerId);
    }
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerup', up);
    document.removeEventListener('pointercancel', up);
    releasePiece(pointerToStage(upEvent), false);
  };

  document.addEventListener('pointermove', move);
  document.addEventListener('pointerup', up);
  document.addEventListener('pointercancel', up);
}

function pointerToStage(event) {
  const rect = stage.getBoundingClientRect();
  return {
    x: clamp(event.clientX - rect.left, 0, rect.width),
    y: clamp(event.clientY - rect.top, 0, rect.height),
  };
}

function activateTouchFallback(message) {
  state.handEngine = 'touch';
  ui.cameraCard.classList.add('fallback');
  ui.gestureLabel.textContent = 'Fallback tactil';
  ui.cameraStatus.textContent = message;
  setFeedback('Puedes arrastrar con el dedo mientras revisas la camara', '');
  updateDebug();
}

function setFeedback(text, tone) {
  ui.feedback.textContent = text;
  ui.feedback.classList.toggle('ok', tone === 'ok');
  ui.feedback.classList.toggle('warn', tone === 'warn');
}

function updateDebug() {
  ui.debugLine.textContent = `frames ${state.framesSent} · mano ${state.handsSeen} · estado ${state.status} · ${state.handEngine || 'none'} · ${BUILD_ID}`;
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function distance2d(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function compactError(error) {
  return String(error?.message || error || 'Error desconocido').slice(0, 160);
}

function makePuzzleSceneBody() {
  return `
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#bfdbfe"/>
          <stop offset="1" stop-color="#fef3c7"/>
        </linearGradient>
        <linearGradient id="elephant" x1="0" x2="1">
          <stop offset="0" stop-color="#94a3b8"/>
          <stop offset="1" stop-color="#64748b"/>
        </linearGradient>
      </defs>
      <rect width="800" height="400" fill="url(#sky)"/>
      <rect y="295" width="800" height="105" fill="#86efac"/>
      <path d="M0 328 C130 300 235 330 340 300 C475 262 600 314 800 280 L800 400 L0 400Z" fill="#22c55e" opacity=".9"/>
      <circle cx="675" cy="72" r="44" fill="#fde047"/>
      <g opacity=".9" fill="#fff">
        <ellipse cx="145" cy="82" rx="46" ry="18"/>
        <ellipse cx="185" cy="78" rx="58" ry="24"/>
        <ellipse cx="238" cy="88" rx="38" ry="15"/>
      </g>
      <ellipse cx="405" cy="246" rx="186" ry="92" fill="url(#elephant)"/>
      <circle cx="258" cy="213" r="78" fill="#94a3b8"/>
      <ellipse cx="204" cy="226" rx="48" ry="70" fill="#cbd5e1"/>
      <ellipse cx="293" cy="226" rx="52" ry="74" fill="#cbd5e1"/>
      <path d="M218 246 C189 268 191 327 230 337 C264 345 274 310 246 292 C229 281 228 264 250 250" fill="none" stroke="#64748b" stroke-width="30" stroke-linecap="round"/>
      <circle cx="235" cy="198" r="8" fill="#0f172a"/>
      <path d="M313 218 C345 204 371 204 402 218" fill="none" stroke="#475569" stroke-width="10" stroke-linecap="round" opacity=".7"/>
      <path d="M560 232 C640 188 666 250 591 272" fill="none" stroke="#64748b" stroke-width="28" stroke-linecap="round"/>
      <rect x="292" y="300" width="34" height="72" rx="16" fill="#64748b"/>
      <rect x="390" y="305" width="34" height="70" rx="16" fill="#64748b"/>
      <rect x="495" y="297" width="34" height="76" rx="16" fill="#64748b"/>
      <path d="M191 268 C173 268 161 260 155 248" fill="none" stroke="#f8fafc" stroke-width="12" stroke-linecap="round"/>
      <g fill="#f97316">
        <circle cx="126" cy="338" r="8"/>
        <circle cx="675" cy="310" r="8"/>
        <circle cx="715" cy="332" r="7"/>
      </g>`;
}

init();
