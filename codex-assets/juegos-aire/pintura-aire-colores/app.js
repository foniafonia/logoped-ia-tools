const TASKS_VISION_PATH = '/vendor/tasks-vision';
const BUILD_ID = 'paint-throw-v2';

const HAND_CONNECTIONS_SIMPLE = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
];

const TUNING = {
  candidateRadius: 190,
  grabRadius: 170,
  gripSmooth: .48,
  releaseGuardMs: 180,
  historyMs: 320,
  throwThreshold: .38,
  projectileMinSpeed: 420,
  projectileMaxSpeed: 980,
  projectileScale: .88,
  gravity: 260,
  hitPadding: 88,
  lostHandReleaseMs: 780,
};

const COLORS = {
  rojo: { hex: '#ef4444', label: 'ROJO' },
  amarillo: { hex: '#facc15', label: 'AMARILLO' },
  azul: { hex: '#2563eb', label: 'AZUL' },
  verde: { hex: '#22c55e', label: 'VERDE' },
  morado: { hex: '#8b5cf6', label: 'MORADO' },
  naranja: { hex: '#f97316', label: 'NARANJA' },
};

const ALL_OBJECTS = [
  { id: 'apple', color: 'rojo', name: 'manzana', type: 'apple' },
  { id: 'banana', color: 'amarillo', name: 'platano', type: 'banana' },
  { id: 'cloud', color: 'azul', name: 'nube azul', type: 'cloud' },
  { id: 'frog', color: 'verde', name: 'rana', type: 'frog' },
  { id: 'grapes', color: 'morado', name: 'uva', type: 'grapes' },
  { id: 'carrot', color: 'naranja', name: 'zanahoria', type: 'carrot' },
];

const ROUNDS = ['rojo', 'amarillo', 'azul', 'verde', 'morado', 'naranja'];

const stage = document.querySelector('#stage');
const objectsLayer = document.querySelector('#objectsLayer');
const splatsLayer = document.querySelector('#splatsLayer');
const trailLayer = document.querySelector('#trailLayer');
const handsCanvas = document.querySelector('#handsLayer');
const handsCtx = handsCanvas.getContext('2d');
const paintBall = document.querySelector('#paintBall');
const video = document.querySelector('#camera');

const ui = {
  cameraButton: document.querySelector('#cameraButton'),
  resetButton: document.querySelector('#resetButton'),
  cameraCard: document.querySelector('#cameraCard'),
  gestureLabel: document.querySelector('#gestureLabel'),
  cameraStatus: document.querySelector('#cameraStatus'),
  debugLine: document.querySelector('#debugLine'),
  feedback: document.querySelector('#feedback'),
  targetPrompt: document.querySelector('#targetPrompt'),
  roundBadge: document.querySelector('#roundBadge'),
};

const state = {
  status: 'idle',
  cameraReady: false,
  sendingFrame: false,
  handLandmarker: null,
  handEngine: 'none',
  mediaPipeErrors: 0,
  framesSent: 0,
  handsSeen: 0,
  handSeenAt: 0,
  gestureCandidate: 'none',
  stableGesture: 'none',
  stableFrames: 0,
  smoothedGripPoint: null,
  handHistory: [],
  activeHandIndex: -1,
  roundIndex: 0,
  objects: [],
  paint: { x: 120, y: 440, homeX: 120, homeY: 440, r: 46, grabbed: false, spawnRatio: .5 },
  projectile: null,
  lastFrameAt: 0,
  releaseGuardUntil: 0,
  mappingMode: 'mirror',
  touchHistory: [],
};

function init() {
  bindEvents();
  resizeStage();
  startRound(0);
  requestAnimationFrame(tick);
  window.addEventListener('resize', () => {
    resizeStage();
    layoutRound();
  });
}

function bindEvents() {
  ui.cameraButton.addEventListener('click', startCamera);
  ui.resetButton.addEventListener('click', resetGame);
  paintBall.addEventListener('pointerdown', startTouchPaint);
}

function resetGame() {
  state.roundIndex = 0;
  state.status = 'idle';
  state.projectile = null;
  state.handHistory = [];
  clearProjectiles();
  startRound(0);
  setFeedback('Agarra la pintura', '');
}

function resizeStage() {
  const rect = stage.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  handsCanvas.width = Math.max(1, Math.round(rect.width * dpr));
  handsCanvas.height = Math.max(1, Math.round(rect.height * dpr));
  handsCanvas.style.width = `${rect.width}px`;
  handsCanvas.style.height = `${rect.height}px`;
  handsCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function startRound(index) {
  state.roundIndex = index % ROUNDS.length;
  state.status = 'idle';
  state.projectile = null;
  state.paint.grabbed = false;
  state.paint.spawnRatio = getPaintSpawnRatio();
  clearProjectiles();

  const targetColor = currentColor();
  const colorInfo = COLORS[targetColor];
  ui.targetPrompt.textContent = `Pinta algo ${colorInfo.label}`;
  ui.roundBadge.textContent = `Color ${state.roundIndex + 1} de ${ROUNDS.length}`;
  paintBall.style.setProperty('--paint-color', colorInfo.hex);

  state.objects = pickRoundObjects(targetColor).map((item) => ({ ...item, splatted: false }));
  renderObjects();
  layoutRound();
  resetPaintHome();
  setFeedback('Agarra la pintura', '');
  updateDebug();
}

function currentColor() {
  return ROUNDS[state.roundIndex];
}

function pickRoundObjects(targetColor) {
  const correct = ALL_OBJECTS.find((item) => item.color === targetColor);
  const distractor = ALL_OBJECTS
    .filter((item) => item.color !== targetColor)
    .sort((a, b) => seededSort(a.id, b.id, state.roundIndex))
    .at(0);
  return [correct, distractor].sort((a, b) => seededSort(a.id, b.id, state.roundIndex + 7));
}

function seededSort(a, b, seed) {
  return scoreSeed(a, seed) - scoreSeed(b, seed);
}

function scoreSeed(text, seed) {
  let total = seed * 97;
  for (let i = 0; i < text.length; i += 1) total += text.charCodeAt(i) * (i + 3);
  return Math.sin(total) * 10000;
}

function renderObjects() {
  objectsLayer.innerHTML = '';
  splatsLayer.innerHTML = '';

  for (const item of state.objects) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'object-card';
    button.dataset.id = item.id;
    button.setAttribute('aria-label', item.name);

    const art = document.createElement('span');
    art.className = 'object-art';
    art.style.backgroundImage = `url("${makeObjectSvg(item.type)}")`;

    const label = document.createElement('span');
    label.className = 'object-label';
    label.textContent = item.name;

    button.append(art, label);
    objectsLayer.appendChild(button);
    item.element = button;
  }
}

function layoutRound() {
  const rect = stage.getBoundingClientRect();
  const compact = rect.width < 760;
  const size = Math.round(clamp(Math.min(rect.width * (compact ? .28 : .2), rect.height * .25), compact ? 102 : 170, compact ? 128 : 240));
  const yTop = compact ? rect.height * .24 : rect.height * .22;

  state.paint.r = compact ? 46 : 62;
  const margin = state.paint.r + (compact ? 8 : 12);
  state.paint.homeX = margin + state.paint.spawnRatio * Math.max(1, rect.width - margin * 2);
  state.paint.homeY = compact ? rect.height * .74 : rect.height * .76;

  orderObjectsForPaintSide(state.paint.homeX < rect.width / 2);
  const positions = compact
    ? [
      { x: rect.width * .22, y: yTop },
      { x: rect.width * .78, y: yTop },
    ]
    : [
      { x: rect.width * .18, y: yTop },
      { x: rect.width * .82, y: yTop },
    ];

  state.objects.forEach((item, index) => {
    const point = positions[index];
    item.x = point.x;
    item.y = point.y;
    item.size = size;
    item.element.style.left = `${point.x}px`;
    item.element.style.top = `${point.y}px`;
    item.element.style.setProperty('--object-size', `${size}px`);
  });

  paintBall.style.setProperty('--ball-size', `${state.paint.r * 2}px`);
  if (!state.paint.grabbed && !state.projectile) resetPaintHome();
}

function getPaintSpawnRatio() {
  const edge = Math.random() < .62;
  if (!edge) return .22 + Math.random() * .56;
  return Math.random() < .5 ? Math.random() * .18 : .82 + Math.random() * .18;
}

function orderObjectsForPaintSide(correctOnLeft) {
  const correct = state.objects.find((item) => item.color === currentColor());
  const wrong = state.objects.find((item) => item.color !== currentColor());
  if (!correct || !wrong) return;
  state.objects = correctOnLeft ? [correct, wrong] : [wrong, correct];
}

function resetPaintHome() {
  state.paint.x = state.paint.homeX;
  state.paint.y = state.paint.homeY;
  setPaintPosition();
  paintBall.hidden = false;
  paintBall.classList.remove('grabbed', 'candidate');
}

function setPaintPosition() {
  paintBall.style.left = `${state.paint.x}px`;
  paintBall.style.top = `${state.paint.y}px`;
}

async function startCamera() {
  ui.cameraButton.disabled = true;
  ui.cameraStatus.textContent = 'Solicitando permiso de camara...';

  try {
    await startRawCamera();
    state.cameraReady = true;
    ui.cameraStatus.textContent = 'Camara activa. Cargando HandLandmarker...';

    if (await tryStartTasksHandLandmarker()) return;
    activateTouchFallback('No se pudo cargar el detector de mano. Usa tactil mientras revisamos.');
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
      numHands: 2,
      minHandDetectionConfidence: .35,
      minHandPresenceConfidence: .35,
      minTrackingConfidence: .35,
    });

    state.handEngine = 'tasks';
    ui.cameraCard.classList.add('active');
    ui.gestureLabel.textContent = 'Tasks Vision listo';
    ui.cameraStatus.textContent = 'Mano abierta cerca de pintura. Cierra dedos para agarrar.';
    pumpTasksFrames();
    return true;
  } catch (error) {
    state.mediaPipeErrors += 1;
    state.handEngine = 'tasks-error';
    ui.gestureLabel.textContent = 'Tasks fallo';
    ui.cameraStatus.textContent = compactError(error);
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
        activateTouchFallback(compactError(error));
        return;
      }
    }

    requestAnimationFrame(send);
  };

  requestAnimationFrame(send);
}

function handleTaskResults(results) {
  const hands = results.landmarks || [];
  if (!hands.length) {
    handleNoHand();
    return;
  }
  handleDetectedHands(hands);
}

function handleDetectedHands(hands) {
  state.handSeenAt = performance.now();
  state.handsSeen += hands.length;
  ui.cameraCard.classList.add('active');

  const candidates = hands.map((landmarks, index) => {
    const mapped = landmarks.map((point) => landmarkToStagePoint(point));
    const gripPoint = getFingerGripPoint(mapped);
    const grip = classifyGrip(landmarks);
    const distanceToPaint = Math.hypot(gripPoint.x - state.paint.x, gripPoint.y - state.paint.y);
    return { index, landmarks, mapped, gripPoint, palm: getPalmCenter(mapped), grip, distanceToPaint };
  });
  const selected = chooseActiveHand(candidates);
  if (!selected) {
    handleNoHand();
    return;
  }

  if (state.activeHandIndex !== selected.index) {
    state.smoothedGripPoint = null;
    state.handHistory = [];
    state.gestureCandidate = 'none';
    state.stableGesture = 'none';
    state.stableFrames = 0;
  }
  state.activeHandIndex = selected.index;
  const gripPoint = smoothGripPoint(selected.gripPoint);
  const grip = selected.grip;
  const stableGrip = stabilizeGrip(grip.name, state.paint.grabbed);

  pushHandHistory(gripPoint);
  drawHandLandmarks(selected.mapped, selected.palm, grip, gripPoint);
  processPaintGesture(gripPoint, stableGrip, grip, selected.mapped);
  updateDebug();
}

function chooseActiveHand(candidates) {
  if (!candidates.length) return null;
  if (state.paint.grabbed) {
    return candidates.sort((a, b) => a.distanceToPaint - b.distanceToPaint)[0];
  }

  const nearPaint = candidates
    .filter((hand) => hand.distanceToPaint <= TUNING.candidateRadius || nearestPointNearPaint(hand.mapped, TUNING.candidateRadius))
    .sort((a, b) => {
      const fistBias = (b.grip.name === 'fist' ? 80 : 0) - (a.grip.name === 'fist' ? 80 : 0);
      return fistBias || a.distanceToPaint - b.distanceToPaint;
    });
  return nearPaint[0] || candidates.sort((a, b) => a.distanceToPaint - b.distanceToPaint)[0];
}

function handleNoHand() {
  clearHandLayer();
    state.gestureCandidate = 'none';
  state.stableGesture = 'none';
  state.stableFrames = 0;
  state.handHistory = [];
  state.activeHandIndex = -1;

  if (state.paint.grabbed && performance.now() - state.handSeenAt > TUNING.lostHandReleaseMs) {
    dropPaintNear(state.paint.x, state.paint.y, 'Se perdio la mano');
  }

  if (performance.now() - state.handSeenAt > 320) {
    ui.gestureLabel.textContent = state.handEngine === 'none' ? 'Sin camara' : 'Buscando mano';
  }
  updateDebug();
}

function processPaintGesture(gripPoint, stableGrip, grip, mapped) {
  const now = performance.now();
  const speed = getRecentVelocity().speed;
  ui.gestureLabel.textContent = grip.label;

  if (state.projectile) {
    setFeedback('Mira la pintura volar', '');
    return;
  }

  if (state.paint.grabbed) {
    state.paint.x = gripPoint.x;
    state.paint.y = gripPoint.y;
    setPaintPosition();
    state.status = speed > TUNING.throwThreshold * .55 ? 'chargingThrow' : 'grabbedPaint';
    paintBall.classList.add('grabbed');

    if (hasReleaseIntent(grip) && now > state.releaseGuardUntil) {
      const velocity = getRecentVelocity();
      if (velocity.speed >= TUNING.throwThreshold) {
        launchPaint(velocity);
      } else {
        dropPaintNear(gripPoint.x, gripPoint.y, 'Abre con mas impulso para lanzar');
      }
      return;
    }

    setFeedback(speed > TUNING.throwThreshold * .55 ? 'Lanza' : 'Mueve el brazo y abre', '');
    return;
  }

  const nearPaint = isNearPaint(gripPoint) || nearestPointNearPaint(mapped, TUNING.candidateRadius);
  const wantsGrab = grip.name === 'fist' || stableGrip === 'fist';

  if (nearPaint && !wantsGrab) {
    state.status = 'hoverPaint';
    paintBall.classList.add('candidate');
    setFeedback('Cierra la mano', '');
    return;
  }

  paintBall.classList.remove('candidate');

  if (nearPaint && wantsGrab) {
    grabPaint(gripPoint);
    return;
  }

  state.status = 'idle';
  setFeedback('Agarra la pintura', '');
}

function grabPaint(point) {
  state.paint.grabbed = true;
  state.paint.x = point.x;
  state.paint.y = point.y;
  state.releaseGuardUntil = performance.now() + TUNING.releaseGuardMs;
  state.status = 'grabbedPaint';
  paintBall.classList.add('grabbed');
  setPaintPosition();
  setFeedback('Mueve y lanza', '');
  popSound(340, .035, 'triangle');
}

function dropPaintNear(x, y, message) {
  state.paint.grabbed = false;
  state.paint.x = clamp(x, state.paint.r + 8, stage.clientWidth - state.paint.r - 8);
  state.paint.y = clamp(y, state.paint.r + 8, stage.clientHeight - state.paint.r - 8);
  state.status = 'hoverPaint';
  paintBall.classList.remove('grabbed');
  setPaintPosition();
  setFeedback(message, 'warn');
}

function launchPaint(velocity) {
  const color = COLORS[currentColor()].hex;
  const speed = clamp(velocity.speed * 1000 * TUNING.projectileScale, TUNING.projectileMinSpeed, TUNING.projectileMaxSpeed);
  const aimed = getAssistedThrowVector(velocity);
  const nx = aimed.vx / Math.max(.001, aimed.speed);
  const ny = aimed.vy / Math.max(.001, aimed.speed);

  state.paint.grabbed = false;
  paintBall.hidden = true;
  paintBall.classList.remove('grabbed', 'candidate');

  const element = document.createElement('div');
  element.className = 'projectile';
  element.style.setProperty('--paint-color', color);
  element.style.setProperty('--ball-size', `${Math.round(state.paint.r * 1.02)}px`);
  stage.appendChild(element);

  state.projectile = {
    x: state.paint.x,
    y: state.paint.y,
    vx: nx * speed,
    vy: ny * speed,
    r: state.paint.r * .58,
    color,
    element,
    lastTrailAt: 0,
    angle: Math.atan2(ny, nx),
  };
  state.status = 'throwing';
  setFeedback('Pintura en camino', '');
  addThrowStreak(state.paint.x, state.paint.y, nx, ny, color);
  popSound(520, .04, 'sine');
}

function getAssistedThrowVector(velocity) {
  const target = nearestObjectToVector(state.paint, velocity);
  const rawSpeed = Math.max(.001, velocity.speed);
  let vx = velocity.vx / rawSpeed;
  let vy = velocity.vy / rawSpeed;

  if (target) {
    const tx = target.x - state.paint.x;
    const ty = target.y - state.paint.y;
    const targetLen = Math.max(1, Math.hypot(tx, ty));
    const blend = velocity.vy < .08 ? .42 : .22;
    vx = vx * (1 - blend) + (tx / targetLen) * blend;
    vy = vy * (1 - blend) + (ty / targetLen) * blend;
  }

  const len = Math.max(.001, Math.hypot(vx, vy));
  return { vx: vx / len, vy: vy / len, speed: 1 };
}

function nearestObjectToVector(origin, velocity) {
  if (!state.objects.length || velocity.speed <= 0) return null;
  let best = null;
  let bestScore = Infinity;
  const vx = velocity.vx / velocity.speed;
  const vy = velocity.vy / velocity.speed;

  for (const item of state.objects) {
    const dx = item.x - origin.x;
    const dy = item.y - origin.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const dot = (dx / distance) * vx + (dy / distance) * vy;
    const score = distance * (dot > 0 ? 1 - dot * .55 : 1.45);
    if (score < bestScore) {
      best = item;
      bestScore = score;
    }
  }
  return best;
}

function tick(now) {
  const dt = Math.min(.034, Math.max(.001, ((now || performance.now()) - (state.lastFrameAt || now || performance.now())) / 1000));
  state.lastFrameAt = now || performance.now();

  if (state.projectile) updateProjectile(dt, state.lastFrameAt);
  requestAnimationFrame(tick);
}

function updateProjectile(dt, now) {
  const projectile = state.projectile;
  projectile.vy += TUNING.gravity * dt;
  projectile.x += projectile.vx * dt;
  projectile.y += projectile.vy * dt;
  projectile.element.style.left = `${projectile.x}px`;
  projectile.element.style.top = `${projectile.y}px`;
  projectile.element.style.setProperty('--flight-angle', `${Math.atan2(projectile.vy, projectile.vx)}rad`);

  if (now - projectile.lastTrailAt > 26) {
    projectile.lastTrailAt = now;
    addTrail(projectile.x, projectile.y, projectile.color);
  }

  const hit = findHitObject(projectile.x, projectile.y);
  if (hit) {
    handlePaintHit(hit, projectile.x, projectile.y);
    return;
  }

  const rect = stage.getBoundingClientRect();
  if (projectile.x < -120 || projectile.x > rect.width + 120 || projectile.y < -120 || projectile.y > rect.height + 160) {
    endProjectile();
    resetPaintHome();
    state.status = 'idle';
    setFeedback('Prueba otra vez', 'warn');
  }
}

function findHitObject(x, y) {
  for (const item of state.objects) {
    const half = item.size * .5 + TUNING.hitPadding;
    const dx = Math.abs(x - item.x);
    const dy = Math.abs(y - item.y);
    if (dx <= half && dy <= half) return item;
  }
  return null;
}

function handlePaintHit(item, x, y) {
  const correct = item.color === currentColor();
  addSplat(x, y, COLORS[currentColor()].hex, correct ? 190 : 96, item);
  item.element.classList.add(correct ? 'hit-correct' : 'hit-wrong');
  setTimeout(() => item.element.classList.remove('hit-correct', 'hit-wrong'), 520);
  endProjectile();
  popSound(correct ? 220 : 130, correct ? .08 : .045, correct ? 'square' : 'sawtooth');

  if (correct) {
    state.status = 'splatCorrect';
    item.splatted = true;
    setFeedback(`Bien! Es ${COLORS[currentColor()].label.toLowerCase()}`, 'ok');
    setTimeout(() => {
      state.status = 'nextRound';
      startRound(state.roundIndex + 1);
    }, 1350);
  } else {
    state.status = 'splatWrong';
    setFeedback(`Busca algo ${COLORS[currentColor()].label.toLowerCase()}`, 'warn');
    setTimeout(() => {
      state.paint.spawnRatio = getPaintSpawnRatio();
      layoutRound();
      resetPaintHome();
      state.status = 'idle';
      setFeedback('Agarra la pintura', '');
    }, 800);
  }
}

function endProjectile() {
  if (state.projectile?.element) state.projectile.element.remove();
  state.projectile = null;
}

function clearProjectiles() {
  endProjectile();
  trailLayer.innerHTML = '';
  document.querySelectorAll('.projectile').forEach((node) => node.remove());
}

function addTrail(x, y, color) {
  const dot = document.createElement('span');
  dot.className = 'trail-dot';
  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;
  dot.style.setProperty('--paint-color', color);
  dot.style.width = `${Math.round(28 + Math.random() * 24)}px`;
  dot.style.height = `${Math.round(18 + Math.random() * 18)}px`;
  trailLayer.appendChild(dot);
  setTimeout(() => dot.remove(), 620);
}

function addThrowStreak(x, y, nx, ny, color) {
  const streak = document.createElement('span');
  streak.className = 'throw-streak';
  streak.style.left = `${x}px`;
  streak.style.top = `${y}px`;
  streak.style.setProperty('--paint-color', color);
  streak.style.setProperty('--streak-angle', `${Math.atan2(ny, nx)}rad`);
  trailLayer.appendChild(streak);
  setTimeout(() => streak.remove(), 520);
}

function addSplat(x, y, color, size, item) {
  const splat = document.createElement('div');
  splat.className = 'splat';
  splat.style.left = `${x}px`;
  splat.style.top = `${y}px`;
  splat.style.setProperty('--splat-size', `${size}px`);
  splat.style.setProperty('--splat-rot', `${Math.round((Math.random() * 60) - 30)}deg`);
  splat.innerHTML = makeSplatSvg(color);
  splatsLayer.appendChild(splat);

  if (item) {
    const driftX = clamp(x - item.x, -item.size * .32, item.size * .32);
    const driftY = clamp(y - item.y, -item.size * .32, item.size * .32);
    splat.style.left = `${item.x + driftX}px`;
    splat.style.top = `${item.y + driftY}px`;
  }
}

function makeSplatSvg(color) {
  return `
    <svg viewBox="-70 -70 140 140" aria-hidden="true">
      <path d="M-45,-7 C-62,-23 -36,-36 -19,-31 C-10,-61 20,-59 25,-29 C54,-42 68,-16 44,3 C68,26 43,49 18,34 C8,68 -24,61 -21,30 C-53,43 -72,17 -45,-7 Z" fill="${color}"/>
      <circle cx="-51" cy="-42" r="10" fill="${color}"/>
      <circle cx="48" cy="-36" r="8" fill="${color}"/>
      <circle cx="55" cy="39" r="11" fill="${color}"/>
      <circle cx="-43" cy="45" r="7" fill="${color}"/>
      <circle cx="4" cy="-51" r="6" fill="rgba(255,255,255,.35)"/>
      <path d="M-24,-20 C-5,-34 23,-24 32,-3 C15,4 -4,8 -32,3 Z" fill="rgba(255,255,255,.22)"/>
    </svg>`;
}

function startTouchPaint(event) {
  if (state.projectile) return;
  event.preventDefault();
  paintBall.setPointerCapture?.(event.pointerId);
  state.touchHistory = [];
  state.paint.grabbed = true;
  paintBall.classList.add('grabbed');
  state.status = 'grabbedPaint';
  moveTouchPaint(event);
  setFeedback('Arrastra y suelta', '');

  const move = (moveEvent) => moveTouchPaint(moveEvent);
  const up = (upEvent) => {
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerup', up);
    document.removeEventListener('pointercancel', up);
    paintBall.releasePointerCapture?.(event.pointerId);
    moveTouchPaint(upEvent);
    const velocity = getVelocityFromHistory(state.touchHistory);
    if (velocity.speed >= TUNING.throwThreshold) {
      launchPaint(velocity);
    } else {
      dropPaintNear(state.paint.x, state.paint.y, 'Suelta con mas impulso');
    }
  };

  document.addEventListener('pointermove', move);
  document.addEventListener('pointerup', up);
  document.addEventListener('pointercancel', up);
}

function moveTouchPaint(event) {
  const point = pointerToStage(event);
  state.paint.x = point.x;
  state.paint.y = point.y;
  setPaintPosition();
  pushToHistory(state.touchHistory, point, performance.now());
}

function pointerToStage(event) {
  const rect = stage.getBoundingClientRect();
  return {
    x: clamp(event.clientX - rect.left, 0, rect.width),
    y: clamp(event.clientY - rect.top, 0, rect.height),
  };
}

function isNearPaint(point) {
  return Math.hypot(point.x - state.paint.x, point.y - state.paint.y) <= TUNING.candidateRadius;
}

function nearestPointNearPaint(mapped, maxDistance) {
  const probeIndices = [4, 8, 12, 16, 20, 5, 9, 13, 17];
  return probeIndices
    .map((index) => mapped[index])
    .filter(Boolean)
    .some((point) => Math.hypot(point.x - state.paint.x, point.y - state.paint.y) <= maxDistance);
}

function pushHandHistory(point) {
  pushToHistory(state.handHistory, point, performance.now());
}

function pushToHistory(history, point, now) {
  history.push({ x: point.x, y: point.y, t: now });
  while (history.length > 10 || (history[0] && now - history[0].t > TUNING.historyMs)) {
    history.shift();
  }
}

function getRecentVelocity() {
  return getVelocityFromHistory(state.handHistory);
}

function getVelocityFromHistory(history) {
  if (history.length < 2) return { vx: 0, vy: 0, speed: 0 };
  const last = history[history.length - 1];
  let first = history[0];
  for (let i = history.length - 2; i >= 0; i -= 1) {
    if (last.t - history[i].t >= 60) {
      first = history[i];
      break;
    }
  }
  const dt = Math.max(16, last.t - first.t);
  const vx = (last.x - first.x) / dt;
  const vy = (last.y - first.y) / dt;
  return { vx, vy, speed: Math.hypot(vx, vy) };
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

  const needed = grip === 'fist' ? 2 : isHolding && grip === 'open' ? 2 : 2;
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

function smoothGripPoint(point) {
  if (!state.smoothedGripPoint) {
    state.smoothedGripPoint = point;
    return point;
  }

  state.smoothedGripPoint = {
    x: state.smoothedGripPoint.x + (point.x - state.smoothedGripPoint.x) * TUNING.gripSmooth,
    y: state.smoothedGripPoint.y + (point.y - state.smoothedGripPoint.y) * TUNING.gripSmooth,
  };
  return state.smoothedGripPoint;
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
    handsCtx.fillStyle = palmPoint ? '#facc15' : '#ffffff';
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
  handsCtx.strokeStyle = closed ? 'rgba(22, 163, 74, .92)' : 'rgba(37, 99, 235, .42)';
  for (const tip of tips) {
    handsCtx.beginPath();
    handsCtx.moveTo(tip.x, tip.y);
    handsCtx.lineTo(gripPoint.x, gripPoint.y);
    handsCtx.stroke();
  }

  handsCtx.fillStyle = closed ? 'rgba(22, 163, 74, .2)' : 'rgba(37, 99, 235, .1)';
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

function landmarkToStagePoint(point) {
  const rect = stage.getBoundingClientRect();
  const mirrorX = state.mappingMode === 'mirror';
  return {
    x: clamp((mirrorX ? 1 - point.x : point.x) * rect.width, 0, rect.width),
    y: clamp(point.y * rect.height, 0, rect.height),
    z: point.z || 0,
  };
}

function activateTouchFallback(message) {
  state.handEngine = 'touch';
  ui.cameraButton.disabled = false;
  ui.cameraCard.classList.add('fallback');
  ui.gestureLabel.textContent = 'Fallback tactil';
  ui.cameraStatus.textContent = message;
  setFeedback('Arrastra la bola y suelta para lanzar', '');
  updateDebug();
}

function setFeedback(text, tone) {
  ui.feedback.textContent = text;
  ui.feedback.classList.toggle('ok', tone === 'ok');
  ui.feedback.classList.toggle('warn', tone === 'warn');
}

function updateDebug() {
  ui.debugLine.textContent = `frames ${state.framesSent} · manos ${state.handsSeen} · activa ${state.activeHandIndex + 1 || '-'} · estado ${state.status} · ${state.handEngine} · ${BUILD_ID}`;
}

function popSound(freq, duration, type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.07, ctx.currentTime + .01);
    gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration + .02);
    setTimeout(() => ctx.close(), 240);
  } catch {
    // Audio is optional.
  }
}

function makeObjectSvg(type) {
  const svgs = {
    apple: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <path d="M104 46 C118 25 146 25 158 34 C143 45 122 48 104 46Z" fill="#22c55e"/>
        <path d="M98 55 C65 33 25 59 27 103 C29 151 58 178 92 161 C99 158 105 158 112 162 C146 181 177 148 175 101 C173 58 132 34 104 57 C102 58 100 58 98 55Z" fill="#ef4444"/>
        <path d="M88 43 C91 29 100 21 112 17" fill="none" stroke="#7c2d12" stroke-width="12" stroke-linecap="round"/>
        <path d="M61 73 C48 88 45 113 54 133" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round" opacity=".45"/>
      </svg>`,
    banana: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <path d="M35 73 C65 133 126 157 168 103 C157 167 79 184 28 91Z" fill="#facc15"/>
        <path d="M35 73 C66 117 122 142 168 103" fill="none" stroke="#fde68a" stroke-width="22" stroke-linecap="round"/>
        <path d="M24 83 L42 64" stroke="#7c2d12" stroke-width="12" stroke-linecap="round"/>
        <path d="M160 105 L181 96" stroke="#7c2d12" stroke-width="10" stroke-linecap="round"/>
      </svg>`,
    cloud: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <path d="M52 128 C28 128 19 103 35 87 C43 78 55 76 66 81 C74 58 96 45 120 55 C138 62 148 77 151 94 C169 94 184 108 181 126 C178 143 164 151 145 151 L57 151 C43 151 34 142 34 132 C34 130 43 128 52 128Z" fill="#2563eb"/>
        <path d="M58 102 C71 83 96 82 107 98 C119 85 145 93 148 115" fill="none" stroke="#bfdbfe" stroke-width="16" stroke-linecap="round" opacity=".72"/>
        <path d="M61 152 C70 169 86 169 94 152 M113 152 C122 169 138 169 146 152" fill="none" stroke="#60a5fa" stroke-width="9" stroke-linecap="round"/>
      </svg>`,
    frog: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <ellipse cx="100" cy="107" rx="69" ry="55" fill="#22c55e"/>
        <circle cx="61" cy="65" r="28" fill="#22c55e"/>
        <circle cx="139" cy="65" r="28" fill="#22c55e"/>
        <circle cx="61" cy="64" r="12" fill="#fff"/>
        <circle cx="139" cy="64" r="12" fill="#fff"/>
        <circle cx="64" cy="66" r="6" fill="#111827"/>
        <circle cx="136" cy="66" r="6" fill="#111827"/>
        <path d="M67 119 C82 137 119 137 134 119" fill="none" stroke="#166534" stroke-width="9" stroke-linecap="round"/>
        <circle cx="48" cy="106" r="9" fill="#86efac"/>
        <circle cx="152" cy="106" r="9" fill="#86efac"/>
      </svg>`,
    grapes: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <path d="M105 43 C121 27 143 27 158 38 C142 47 124 50 105 43Z" fill="#22c55e"/>
        <path d="M92 55 C94 42 102 34 114 27" fill="none" stroke="#7c2d12" stroke-width="10" stroke-linecap="round"/>
        <g fill="#8b5cf6">
          <circle cx="83" cy="75" r="25"/>
          <circle cx="117" cy="75" r="25"/>
          <circle cx="66" cy="112" r="25"/>
          <circle cx="100" cy="112" r="25"/>
          <circle cx="134" cy="112" r="25"/>
          <circle cx="84" cy="148" r="24"/>
          <circle cx="119" cy="148" r="24"/>
        </g>
        <g fill="#c4b5fd" opacity=".48">
          <circle cx="76" cy="68" r="7"/>
          <circle cx="110" cy="104" r="7"/>
          <circle cx="126" cy="139" r="7"/>
        </g>
      </svg>`,
    carrot: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <path d="M101 48 C116 82 134 125 106 174 C65 135 65 91 101 48Z" fill="#f97316"/>
        <path d="M99 48 C82 29 76 18 76 18 C97 21 107 35 105 50Z" fill="#22c55e"/>
        <path d="M105 51 C113 26 130 17 130 17 C135 41 123 55 105 51Z" fill="#16a34a"/>
        <path d="M105 91 L82 99 M116 122 L91 132" stroke="#fdba74" stroke-width="8" stroke-linecap="round"/>
      </svg>`,
  };
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent((svgs[type] || svgs.apple).replace(/\s+/g, ' ').trim())}`;
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

init();
