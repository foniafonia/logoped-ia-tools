const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const handsCanvas = document.querySelector('#hands');
const handsCtx = handsCanvas.getContext('2d');
const video = document.querySelector('#camera');

const ui = {
  score: document.querySelector('#score'),
  meters: document.querySelector('#meters'),
  timer: document.querySelector('#timer'),
  gestureLabel: document.querySelector('#gestureLabel'),
  cameraStatus: document.querySelector('#cameraStatus'),
  cameraDebug: document.querySelector('#cameraDebug'),
  gestureMeter: document.querySelector('#gestureMeter'),
  targetSound: document.querySelector('#targetSound'),
  targetSyllable: document.querySelector('#targetSyllable'),
  promptText: document.querySelector('#promptText'),
  startOverlay: document.querySelector('#startOverlay'),
  playButton: document.querySelector('#playButton'),
  cameraButton: document.querySelector('#cameraButton'),
  jumpButton: document.querySelector('#jumpButton'),
  shootButton: document.querySelector('#shootButton'),
  resetButton: document.querySelector('#resetButton'),
};

const W = canvas.width;
const H = canvas.height;
const groundY = 500;
const syllableSets = [
  { sound: '/r/ suave', prompt: 'Recoge RA · RE · RI y di la sílaba en voz alta.', good: ['RA', 'RE', 'RI'], bad: ['LA', 'SE', 'PA'] },
  { sound: '/s/', prompt: 'Recoge SA · SE · SI manteniendo soplo suave.', good: ['SA', 'SE', 'SI'], bad: ['TA', 'FA', 'MA'] },
  { sound: '/p/', prompt: 'Recoge PA · PE · PI con cierre de labios claro.', good: ['PA', 'PE', 'PI'], bad: ['KA', 'LA', 'RO'] },
];
const ALL_TARGET_SYLLABLES = syllableSets.flatMap((set) => set.good);
const MEDIAPIPE_PATH = '/vendor/mediapipe/';
const TASKS_VISION_PATH = '/vendor/tasks-vision';
const SIMPLE_MOTION_SIZE = { width: 80, height: 60 };
const HAND_CONNECTIONS_SIMPLE = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
];

const state = {
  running: false,
  lastTime: 0,
  elapsed: 0,
  score: 0,
  meters: 0,
  speed: 320,
  targetIndex: 0,
  targetSyllable: 'PA',
  cameraReady: false,
  sendingFrame: false,
  simpleInput: false,
  mediaPipeErrors: 0,
  handLandmarker: null,
  handEngine: 'none',
  framesSent: 0,
  resultsSeen: 0,
  handsSeen: 0,
  actionsSent: 0,
  lastDebugAt: 0,
  motionCanvas: document.createElement('canvas'),
  previousMotionFrame: null,
  lastMotionActionAt: 0,
  touchTimer: 0,
  touchShot: false,
  lastGesture: 'none',
  gestureCandidate: 'none',
  gestureFrames: 0,
  lastActionGesture: 'none',
  lastChargeAt: 0,
  gestureCooldown: 0,
  spawnCooldown: 0,
  collectibleCooldown: 0,
  particles: [],
  obstacles: [],
  collectibles: [],
  shots: [],
  hero: {
    x: 168,
    y: groundY,
    vy: 0,
    radius: 38,
    grounded: true,
    charge: 0,
    blink: 0,
  },
};

function resetGame() {
  state.running = false;
  state.lastTime = 0;
  state.elapsed = 0;
  state.score = 0;
  state.meters = 0;
  state.speed = 320;
  state.targetIndex = 0;
  state.gestureCooldown = 0;
  state.mediaPipeErrors = 0;
  state.handEngine = state.handLandmarker ? state.handEngine : 'none';
  state.framesSent = 0;
  state.resultsSeen = 0;
  state.handsSeen = 0;
  state.actionsSent = 0;
  state.lastDebugAt = 0;
  state.previousMotionFrame = null;
  state.lastMotionActionAt = 0;
  state.touchShot = false;
  state.gestureCandidate = 'none';
  state.gestureFrames = 0;
  state.lastActionGesture = 'none';
  state.lastChargeAt = 0;
  state.spawnCooldown = 0;
  state.collectibleCooldown = 0;
  state.particles = [];
  state.obstacles = [];
  state.collectibles = [];
  state.shots = [];
  Object.assign(state.hero, { y: groundY, vy: 0, grounded: true, charge: 0, blink: 0 });
  ui.startOverlay.classList.remove('hidden');
  setTherapyGoal();
  updateHud();
  drawScene(0);
}

function startGame() {
  if (state.running) return;
  state.running = true;
  ui.startOverlay.classList.add('hidden');
  state.lastTime = performance.now();
  requestAnimationFrame(loop);
}

function setTherapyGoal() {
  const set = getCurrentSyllableSet();
  ui.targetSound.textContent = set.sound;
  ui.promptText.textContent = `Dispara ${state.targetSyllable} con dos dedos. Recoge las demás sílabas saltando.`;
}

function getCurrentSyllableSet() {
  const index = syllableSets.findIndex((set) => set.good.includes(state.targetSyllable));
  state.targetIndex = index >= 0 ? index : 0;
  return syllableSets[state.targetIndex];
}

function setTargetSyllable(value) {
  if (!ALL_TARGET_SYLLABLES.includes(value)) return;
  state.targetSyllable = value;
  setTherapyGoal();
  burst(260, 120, '#7dd3fc', 16);
}

function updateHud() {
  const remaining = Math.max(0, 60 - Math.floor(state.elapsed));
  ui.score.textContent = state.score;
  ui.meters.textContent = `${Math.floor(state.meters)} m`;
  ui.timer.textContent = `00:${String(remaining).padStart(2, '0')}`;
}

function loop(now) {
  if (!state.running) return;
  const dt = Math.min((now - state.lastTime) / 1000, 0.033);
  state.lastTime = now;
  update(dt);
  drawScene(dt);
  requestAnimationFrame(loop);
}

function update(dt) {
  state.elapsed += dt;
  state.meters += dt * state.speed * 0.022;
  state.speed = Math.min(520, 320 + state.elapsed * 4);
  state.gestureCooldown = Math.max(0, state.gestureCooldown - dt);

  updateHero(dt);
  updateSpawns(dt);
  updateEntities(dt);
  updateHud();

  if (state.elapsed >= 60) {
    state.running = false;
    ui.startOverlay.classList.remove('hidden');
    ui.startOverlay.querySelector('p').textContent = `Sesión terminada: ${state.score} puntos y ${Math.floor(state.meters)} metros.`;
  }
}

function updateHero(dt) {
  const hero = state.hero;
  hero.vy += 1650 * dt;
  hero.y += hero.vy * dt;
  hero.blink = Math.max(0, hero.blink - dt);

  if (hero.y >= groundY) {
    hero.y = groundY;
    hero.vy = 0;
    hero.grounded = true;
  }
}

function updateSpawns(dt) {
  state.spawnCooldown -= dt;
  state.collectibleCooldown -= dt;

  if (state.spawnCooldown <= 0) {
    state.obstacles.push({
      x: W + 40,
      y: groundY - 50,
      w: 40 + Math.random() * 34,
      h: 72 + Math.random() * 30,
      hit: false,
    });
    state.spawnCooldown = 1.8 + Math.random() * 1.2;
  }

  if (state.collectibleCooldown <= 0) {
    const set = getCurrentSyllableSet();
    const isGood = Math.random() > 0.28;
    const bank = isGood ? set.good : set.bad;
    const text = isGood && Math.random() > .45
      ? state.targetSyllable
      : bank[Math.floor(Math.random() * bank.length)];
    state.collectibles.push({
      x: W + 30,
      y: 210 + Math.random() * 145,
      r: 36,
      text,
      good: isGood,
      target: text === state.targetSyllable,
      wobble: Math.random() * 10,
    });
    state.collectibleCooldown = .8 + Math.random() * .7;
  }
}

function updateEntities(dt) {
  const move = state.speed * dt;

  for (const obstacle of state.obstacles) obstacle.x -= move;
  for (const item of state.collectibles) {
    item.x -= move;
    item.wobble += dt * 6;
  }
  for (const shot of state.shots) {
    shot.x += 680 * dt;
    shot.life -= dt;
  }
  for (const particle of state.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 360 * dt;
    particle.life -= dt;
  }

  const heroBox = heroBounds();

  for (const obstacle of state.obstacles) {
    if (!obstacle.hit && intersects(heroBox, obstacle)) {
      obstacle.hit = true;
      state.score = Math.max(0, state.score - 8);
      state.hero.blink = .45;
      burst(state.hero.x, state.hero.y - 30, '#ff637d', 12);
    }
  }

  for (const item of state.collectibles) {
    const y = collectibleY(item);
    if (!item.collected && distance(state.hero.x, state.hero.y - 42, item.x, y) < state.hero.radius + item.r) {
      item.collected = true;
      if (item.text === state.targetSyllable) {
        state.score = Math.max(0, state.score - 1);
        burst(item.x, y, '#94a3b8', 8);
        setGesture('Dispara esa sílaba', `${item.text} se trabaja con dos dedos.`);
      } else {
        state.score += item.good ? 12 : -5;
        burst(item.x, y, item.good ? '#ffcf4a' : '#ff637d', item.good ? 14 : 8);
        if (item.good) speakShort(item.text);
      }
    }
  }

  for (const shot of state.shots) {
    for (const item of state.collectibles) {
      const y = collectibleY(item);
      if (shot.life > 0 && !item.collected && distance(shot.x, shot.y, item.x, y) < shot.r + item.r) {
        shot.life = 0;
        if (item.text === state.targetSyllable) {
          item.collected = true;
          state.score += 18;
          burst(item.x, y, '#7dd3fc', 22);
          speakShort(item.text);
          setGesture('Diana silábica', `${item.text} disparada.`);
        } else {
          burst(shot.x, shot.y, '#94a3b8', 7);
          setGesture('No era la diana', `Dispara solo ${state.targetSyllable}.`);
        }
      }
    }

    for (const obstacle of state.obstacles) {
      if (shot.life > 0 && !obstacle.hit && pointInRect(shot.x, shot.y, obstacle)) {
        obstacle.hit = true;
        shot.life = 0;
        state.score += 10;
        burst(obstacle.x + obstacle.w / 2, obstacle.y, '#7dd3fc', 18);
      }
    }
  }

  state.obstacles = state.obstacles.filter((o) => o.x > -120 && !o.hit);
  state.collectibles = state.collectibles.filter((i) => i.x > -80 && !i.collected);
  state.shots = state.shots.filter((s) => s.life > 0 && s.x < W + 80);
  state.particles = state.particles.filter((p) => p.life > 0);
}

function jump() {
  if (!state.running) startGame();
  if (!state.hero.grounded) return;
  const boost = state.hero.charge > 0 ? Math.min(210, state.hero.charge) : 0;
  state.hero.vy = -760 - boost;
  state.hero.grounded = false;
  state.hero.charge = 0;
}

function chargeJump() {
  state.hero.charge = Math.min(260, state.hero.charge + 90);
}

function shoot() {
  if (!state.running) startGame();
  if (state.shots.length > 2) return;
  state.shots.push({ x: state.hero.x + 42, y: state.hero.y - 68, r: 15, life: 1.2 });
  burst(state.hero.x + 48, state.hero.y - 70, '#7dd3fc', 5);
}

function drawScene(dt) {
  drawSky();
  drawMoon();
  drawMountains();
  drawGround();
  drawCollectibles();
  drawObstacles();
  drawShots();
  drawHero(dt);
  drawParticles();
}

function drawSky() {
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, '#060a1f');
  grd.addColorStop(.52, '#17114a');
  grd.addColorStop(1, '#102a3c');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255,255,255,.78)';
  for (let i = 0; i < 70; i += 1) {
    const x = (i * 173 + state.meters * -7) % W;
    const y = 28 + ((i * 47) % 260);
    ctx.globalAlpha = .35 + (i % 4) * .12;
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
}

function drawMoon() {
  ctx.save();
  ctx.translate(860, 135);
  const glow = ctx.createRadialGradient(0, 0, 12, 0, 0, 82);
  glow.addColorStop(0, 'rgba(255,242,177,.8)');
  glow.addColorStop(1, 'rgba(255,242,177,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 82, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff1aa';
  ctx.beginPath();
  ctx.arc(0, 0, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMountains() {
  drawRidge('#18195b', 220, .12, 0);
  drawRidge('#111b45', 300, .24, 120);
  drawTrees();
}

function drawRidge(color, base, speed, offset) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = -80; x <= W + 120; x += 160) {
    const px = x - ((state.meters * speed + offset) % 160);
    ctx.lineTo(px + 80, base - ((x / 160) % 2) * 38);
    ctx.lineTo(px + 160, groundY);
  }
  ctx.lineTo(W, groundY);
  ctx.closePath();
  ctx.fill();
}

function drawTrees() {
  for (let i = 0; i < 14; i += 1) {
    const x = ((i * 180) - (state.meters * 2.4 % 180));
    const y = groundY - 78 - (i % 3) * 12;
    ctx.fillStyle = '#10253b';
    ctx.fillRect(x + 18, y + 36, 12, 50);
    ctx.fillStyle = '#0f3a38';
    ctx.beginPath();
    ctx.moveTo(x + 24, y);
    ctx.lineTo(x - 14, y + 58);
    ctx.lineTo(x + 62, y + 58);
    ctx.closePath();
    ctx.fill();
  }
}

function drawGround() {
  ctx.fillStyle = '#3bd96f';
  ctx.fillRect(0, groundY + 1, W, 10);
  ctx.fillStyle = '#573d2f';
  ctx.fillRect(0, groundY + 11, W, H - groundY);

  ctx.fillStyle = 'rgba(255,255,255,.45)';
  for (let i = 0; i < 150; i += 1) {
    const x = (i * 67 - state.meters * 9) % W;
    const y = groundY + 28 + ((i * 31) % 95);
    ctx.beginPath();
    ctx.arc(x, y, 2 + (i % 4), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHero() {
  const hero = state.hero;
  ctx.save();
  ctx.translate(hero.x, hero.y - 42);
  if (hero.blink > 0) ctx.globalAlpha = .55;

  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.beginPath();
  ctx.ellipse(0, 48, 42, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  drawTongueCharacter(hero.charge);
  ctx.restore();
}

function drawTongueCharacter(charge) {
  ctx.fillStyle = '#ff7f96';
  ctx.strokeStyle = '#8c2440';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-26, -42);
  ctx.bezierCurveTo(30, -66, 58, -24, 44, 20);
  ctx.bezierCurveTo(35, 52, -18, 56, -36, 24);
  ctx.bezierCurveTo(-54, -8, -50, -30, -26, -42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(140,36,64,.48)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(5, -34);
  ctx.bezierCurveTo(20, -8, 14, 24, -5, 42);
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-14, -20, 12, 0, Math.PI * 2);
  ctx.arc(22, -18, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#172033';
  ctx.beginPath();
  ctx.arc(-10, -19, 5, 0, Math.PI * 2);
  ctx.arc(26, -17, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#7c1830';
  ctx.beginPath();
  ctx.arc(9, 10, 12, 0, Math.PI);
  ctx.fill();

  ctx.fillStyle = '#53d6ff';
  ctx.font = '800 15px system-ui';
  ctx.fillText('LA', -58, -30);
  ctx.fillText('RA', 40, -48);

  if (charge > 0) {
    ctx.strokeStyle = '#ffcf4a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(4, -2, 55 + charge / 18, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawObstacles() {
  for (const obstacle of state.obstacles) {
    ctx.fillStyle = '#4f6f8f';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
    ctx.fillStyle = '#9ee9ff';
    ctx.fillRect(obstacle.x + 7, obstacle.y + 12, obstacle.w - 14, 18);
    ctx.fillStyle = '#172033';
    ctx.font = '900 18px system-ui';
    ctx.fillText('TR', obstacle.x + 8, obstacle.y + 48);
  }
}

function collectibleY(item) {
  return item.y + Math.sin(item.wobble) * 8;
}

function drawCollectibles() {
  for (const item of state.collectibles) {
    const y = collectibleY(item);
    const isTarget = item.text === state.targetSyllable;

    if (isTarget) {
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(item.x, y, item.r + 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = item.good ? '#ffcf4a' : '#cbd5e1';
    star(ctx, item.x, y, item.r, item.r * .46, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(23,32,51,.28)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '950 30px system-ui';
    ctx.lineWidth = 7;
    ctx.strokeStyle = 'rgba(255,255,255,.86)';
    ctx.strokeText(item.text, item.x, y + 1);
    ctx.fillStyle = '#172033';
    ctx.fillText(item.text, item.x, y + 1);

    if (isTarget) {
      ctx.fillStyle = '#e0f7ff';
      ctx.font = '900 12px system-ui';
      ctx.strokeStyle = 'rgba(23,32,51,.8)';
      ctx.lineWidth = 3;
      ctx.strokeText('DISPARA', item.x, y + item.r + 18);
      ctx.fillText('DISPARA', item.x, y + item.r + 18);
    }

    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
  }
}

function drawShots() {
  for (const shot of state.shots) {
    const glow = ctx.createRadialGradient(shot.x, shot.y, 4, shot.x, shot.y, 26);
    glow.addColorStop(0, 'rgba(125,211,252,.95)');
    glow.addColorStop(1, 'rgba(125,211,252,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(shot.x, shot.y, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e0f7ff';
    ctx.beginPath();
    ctx.arc(shot.x, shot.y, shot.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawParticles() {
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const s = 80 + Math.random() * 220;
    state.particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 80,
      size: 3 + Math.random() * 5,
      life: .45 + Math.random() * .5,
      color,
    });
  }
}

function star(context, x, y, outer, inner, points) {
  context.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 ? inner : outer;
    const a = (Math.PI / points) * i - Math.PI / 2;
    context.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  context.closePath();
}

function heroBounds() {
  return { x: state.hero.x - 28, y: state.hero.y - 86, w: 56, h: 78 };
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function distance(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

function speakShort(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = .9;
  speechSynthesis.speak(utterance);
}

function locateMediaPipeFile(file) {
  if (file === 'hands_solution_simd_wasm_bin.js') return `${MEDIAPIPE_PATH}hands_solution_wasm_bin.js`;
  if (file === 'hands_solution_simd_wasm_bin.wasm') return `${MEDIAPIPE_PATH}hands_solution_wasm_bin.wasm`;
  return `${MEDIAPIPE_PATH}${file}`;
}

async function startCamera() {
  ui.cameraButton.disabled = true;
  ui.cameraStatus.textContent = 'Solicitando permiso de cámara...';

  try {
    await startRawCamera();
    state.cameraReady = true;
    ui.cameraStatus.textContent = 'Cámara activa. Cargando detector de mano moderno...';

    if (await tryStartTasksHandLandmarker()) return;

    if (isIOSDevice()) {
      ui.gestureLabel.textContent = 'Modo móvil simple';
      ui.cameraStatus.textContent = 'El detector de mano no arrancó en este iPhone. Usa toque: 1 dedo salta, 2 dedos dispara.';
      activateSimpleInput();
      return;
    }

    if (window.Hands && window.Camera) {
      await startLegacyHands();
      return;
    }

    activateSimpleInput();
  } catch (error) {
    ui.cameraButton.disabled = false;
    ui.gestureLabel.textContent = 'Cámara bloqueada';
    ui.cameraStatus.textContent = compactError(error);
  }
}

async function startLegacyHands() {
  const hands = new Hands({
    locateFile: locateMediaPipeFile,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0,
    minDetectionConfidence: .5,
    minTrackingConfidence: .5,
    selfieMode: true,
  });

  hands.onResults(onHandResults);

  state.handEngine = 'legacy';
  pumpCameraFrames(hands);
  ui.gestureLabel.textContent = 'MediaPipe legacy';
  ui.cameraStatus.textContent = 'Detector antiguo activo. Si falla, cambia a modo simple.';
}

async function startRawCamera() {
  if (video.srcObject) {
    await video.play();
    return;
  }

  if (navigator.mediaDevices?.getUserMedia) {
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
    return;
  }

  throw new Error('Este navegador no expone getUserMedia para leer la cámara.');
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
    ui.gestureLabel.textContent = 'HandLandmarker listo';
    ui.cameraStatus.textContent = 'Detector moderno activo. Deberías ver puntos amarillos cuando enseñas la mano.';
    pumpTasksFrames();
    return true;
  } catch (error) {
    state.mediaPipeErrors += 1;
    state.handEngine = 'tasks-error';
    ui.gestureLabel.textContent = 'Tasks falló';
    ui.cameraStatus.textContent = compactError(error);
    updateCameraDebug(true);
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
        ui.gestureLabel.textContent = 'Tasks error';
        ui.cameraStatus.textContent = compactError(error);
        activateSimpleInput(error);
        updateCameraDebug(true);
        return;
      }
    }

    requestAnimationFrame(send);
  };

  requestAnimationFrame(send);
}

function handleTaskResults(results) {
  state.resultsSeen += 1;
  drawCameraFrame();

  const landmarks = results.landmarks?.[0];
  if (landmarks?.length) {
    state.handsSeen += 1;
    document.querySelector('.gesture-panel')?.classList.add('active');
    drawHandLandmarks(landmarks);
    handleGesture(classifyGesture(landmarks));
  } else {
    document.querySelector('.gesture-panel')?.classList.remove('active');
    state.gestureCandidate = 'none';
    state.gestureFrames = 0;
    state.lastActionGesture = 'none';
    setGesture('Buscando mano', 'Cámara activa y detector moderno funcionando, pero aún no ve mano.');
  }

  updateCameraDebug();
}

function drawCameraFrame() {
  handsCtx.clearRect(0, 0, handsCanvas.width, handsCanvas.height);
  handsCtx.save();
  handsCtx.scale(-1, 1);
  handsCtx.drawImage(video, -handsCanvas.width, 0, handsCanvas.width, handsCanvas.height);
  handsCtx.restore();
}

function drawHandLandmarks(landmarks) {
  handsCtx.save();
  handsCtx.lineWidth = 2;
  handsCtx.strokeStyle = '#7dd3fc';
  handsCtx.fillStyle = '#ffcf4a';

  for (const [from, to] of HAND_CONNECTIONS_SIMPLE) {
    const a = landmarks[from];
    const b = landmarks[to];
    handsCtx.beginPath();
    handsCtx.moveTo((1 - a.x) * handsCanvas.width, a.y * handsCanvas.height);
    handsCtx.lineTo((1 - b.x) * handsCanvas.width, b.y * handsCanvas.height);
    handsCtx.stroke();
  }

  for (const point of landmarks) {
    handsCtx.beginPath();
    handsCtx.arc((1 - point.x) * handsCanvas.width, point.y * handsCanvas.height, 3.2, 0, Math.PI * 2);
    handsCtx.fill();
  }

  handsCtx.restore();
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
        updateCameraDebug();
      } catch (error) {
        state.mediaPipeErrors += 1;
        ui.gestureLabel.textContent = 'Modo móvil simple';
        ui.cameraStatus.textContent = 'MediaPipe falló en este iPhone. Usa toque: 1 dedo salta, 2 dedos dispara.';
        activateSimpleInput(error);
        updateCameraDebug();
        return;
      }
    }
    requestAnimationFrame(send);
  };

  requestAnimationFrame(send);
}

function activateSimpleInput(error) {
  state.simpleInput = true;
  state.sendingFrame = false;
  document.querySelector('.gesture-panel')?.classList.add('fallback');
  if (error) console.warn('MediaPipe fallback:', error);
  startSimpleMotionLoop();
}

function startSimpleMotionLoop() {
  const motionCtx = state.motionCanvas.getContext('2d', { willReadFrequently: true });
  state.motionCanvas.width = SIMPLE_MOTION_SIZE.width;
  state.motionCanvas.height = SIMPLE_MOTION_SIZE.height;

  const tick = () => {
    if (!state.simpleInput || !video.srcObject) return;

    if (video.readyState >= 2) {
      motionCtx.drawImage(video, 0, 0, SIMPLE_MOTION_SIZE.width, SIMPLE_MOTION_SIZE.height);
      const data = motionCtx.getImageData(0, 0, SIMPLE_MOTION_SIZE.width, SIMPLE_MOTION_SIZE.height).data;
      const current = new Uint8Array(SIMPLE_MOTION_SIZE.width * SIMPLE_MOTION_SIZE.height);
      let diff = 0;
      let weight = 0;
      let weightY = 0;

      for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
        const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
        current[p] = lum;
        if (state.previousMotionFrame) {
          const delta = Math.abs(lum - state.previousMotionFrame[p]);
          diff += delta;
          if (delta > 28) {
            const y = Math.floor(p / SIMPLE_MOTION_SIZE.width);
            weightY += y * delta;
            weight += delta;
          }
        }
      }

      state.previousMotionFrame = current;
      const motion = diff / current.length;
      const centerY = weight ? weightY / weight : SIMPLE_MOTION_SIZE.height;
      const now = performance.now();

      if (motion > 18 && centerY < SIMPLE_MOTION_SIZE.height * .58 && now - state.lastMotionActionAt > 850) {
        jump();
        state.actionsSent += 1;
        state.lastMotionActionAt = now;
        setGesture('Movimiento detectado', 'Salto por movimiento de cámara.');
        updateCameraDebug(true);
      } else if (now - state.lastDebugAt > 260) {
        ui.cameraStatus.textContent = `Modo simple activo. Movimiento ${Math.round(motion)}. Toca el juego para control preciso.`;
        updateCameraDebug(true);
      }
    }

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function onHandResults(results) {
  state.resultsSeen += 1;
  handsCtx.clearRect(0, 0, handsCanvas.width, handsCanvas.height);
  handsCtx.save();
  handsCtx.scale(-1, 1);
  handsCtx.drawImage(results.image, -handsCanvas.width, 0, handsCanvas.width, handsCanvas.height);
  handsCtx.restore();

  if (results.multiHandLandmarks?.length) {
    state.handsSeen += 1;
    document.querySelector('.gesture-panel')?.classList.add('active');
    const landmarks = results.multiHandLandmarks[0];
    if (window.drawConnectors && window.HAND_CONNECTIONS) {
      drawConnectors(handsCtx, landmarks, HAND_CONNECTIONS, { color: '#7dd3fc', lineWidth: 2 });
      drawLandmarks(handsCtx, landmarks, { color: '#ffcf4a', lineWidth: 1, radius: 2 });
    }
    const gesture = classifyGesture(landmarks);
    handleGesture(gesture);
  } else {
    document.querySelector('.gesture-panel')?.classList.remove('active');
    state.gestureCandidate = 'none';
    state.gestureFrames = 0;
    state.lastActionGesture = 'none';
    setGesture('Buscando mano', 'Veo cámara, pero MediaPipe no detecta la mano.');
  }
  updateCameraDebug();
}

function classifyGesture(points) {
  const palm = Math.max(distance2d(points[0], points[9]), .001);
  const fingers = [
    isFingerOpen(points, 5, 6, 8, palm),
    isFingerOpen(points, 9, 10, 12, palm),
    isFingerOpen(points, 13, 14, 16, palm),
    isFingerOpen(points, 17, 18, 20, palm),
  ];
  const openCount = fingers.filter(Boolean).length;
  const ringAndPinkyFolded = !fingers[2] && !fingers[3];

  if (fingers[0] && fingers[1] && ringAndPinkyFolded) return 'two';
  if (openCount >= 3) return 'open';
  if (openCount <= 1) return 'fist';
  return 'other';
}

function isFingerOpen(points, mcp, pip, tip, palm) {
  const tipToMcp = distance2d(points[tip], points[mcp]);
  const pipToMcp = distance2d(points[pip], points[mcp]);
  const tipToWrist = distance2d(points[tip], points[0]);
  const pipToWrist = distance2d(points[pip], points[0]);
  return tipToMcp > pipToMcp * 1.55 && tipToWrist > pipToWrist + palm * .12;
}

function isCompactFist(points, palm) {
  const tips = [8, 12, 16, 20];
  const avgTipToWrist = tips.reduce((sum, index) => sum + distance2d(points[index], points[0]), 0) / tips.length;
  const avgTipToPalm = tips.reduce((sum, index) => sum + distance2d(points[index], points[9]), 0) / tips.length;
  return avgTipToWrist < palm * 2.45 || avgTipToPalm < palm * 1.25;
}

function distance2d(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function handleGesture(gesture) {
  if (gesture !== state.gestureCandidate) {
    state.gestureCandidate = gesture;
    state.gestureFrames = 1;
  } else {
    state.gestureFrames += 1;
  }

  const requiredFrames = gesture === 'fist' ? 2 : 3;
  const progress = Math.min(100, Math.round((state.gestureFrames / requiredFrames) * 100));
  ui.gestureMeter.style.setProperty('--gesture-progress', `${progress}%`);
  if (state.gestureFrames < requiredFrames) {
    setGesture('Mano detectada', `Gesto ${gestureLabel(gesture)} estabilizando ${state.gestureFrames}/${requiredFrames}.`);
    return;
  }

  state.lastGesture = gesture;

  if (gesture === 'fist') {
    const now = performance.now();
    if (now - state.lastChargeAt > 180) {
      chargeJump();
      state.lastChargeAt = now;
      state.actionsSent += 1;
      burst(state.hero.x, state.hero.y - 110, '#ffcf4a', 4);
    }
    state.lastActionGesture = 'none';
    setGesture('✊ Puño', 'Salto cargado.');
    return;
  }

  if (gesture === 'other') {
    state.lastActionGesture = 'none';
    setGesture('Gesto detectado', 'Palma completa, dos dedos claros o puño cerrado.');
    return;
  }

  if (state.gestureCooldown > 0) return;
  if (gesture === state.lastActionGesture) return;

  if (gesture === 'open') {
    jump();
    state.gestureCooldown = .55;
    state.lastActionGesture = gesture;
    state.actionsSent += 1;
    setGesture('✋ Mano abierta', 'Salto.');
  } else if (gesture === 'two') {
    shoot();
    state.gestureCooldown = .45;
    state.lastActionGesture = gesture;
    state.actionsSent += 1;
    setGesture('✌️ Dos dedos', 'Burbuja sonora.');
  }
  updateCameraDebug();
}

function setGesture(label, status) {
  ui.gestureLabel.textContent = label;
  ui.cameraStatus.textContent = status;
}

function gestureLabel(gesture) {
  if (gesture === 'fist') return 'puño';
  if (gesture === 'open') return 'mano abierta';
  if (gesture === 'two') return 'dos dedos';
  return 'no claro';
}

function updateCameraDebug(force = false) {
  const now = performance.now();
  if (!force && now - state.lastDebugAt < 120) return;
  state.lastDebugAt = now;
  ui.cameraDebug.textContent = `${state.handEngine} · frames ${state.framesSent} · resultados ${state.resultsSeen} · mano ${state.handsSeen} · acción ${state.actionsSent} · error ${state.mediaPipeErrors}`;
}

function compactError(error) {
  const text = String(error?.message || error || 'fallo desconocido');
  return text.length > 92 ? `${text.slice(0, 92)}...` : text;
}

function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

ui.playButton.addEventListener('click', startGame);
ui.cameraButton.addEventListener('click', startCamera);
ui.jumpButton.addEventListener('click', jump);
ui.shootButton.addEventListener('click', shoot);
ui.resetButton.addEventListener('click', resetGame);
ui.targetSyllable.addEventListener('change', (event) => setTargetSyllable(event.target.value));

canvas.addEventListener('touchstart', (event) => {
  event.preventDefault();
  if (!state.running) startGame();
  state.touchShot = event.touches.length >= 2;

  if (state.touchShot) {
    shoot();
    state.actionsSent += 1;
    setGesture('Toque 2 dedos', 'Burbuja sonora.');
    updateCameraDebug(true);
    return;
  }

  chargeJump();
  state.touchTimer = window.setTimeout(() => {
    chargeJump();
    setGesture('Toque mantenido', 'Salto cargado.');
    updateCameraDebug(true);
  }, 280);
}, { passive: false });

canvas.addEventListener('touchend', (event) => {
  event.preventDefault();
  window.clearTimeout(state.touchTimer);
  if (state.touchShot) {
    state.touchShot = false;
    return;
  }
  jump();
  state.actionsSent += 1;
  setGesture('Toque 1 dedo', 'Salto.');
  updateCameraDebug(true);
}, { passive: false });

window.addEventListener('load', () => {
  if (window.Hands && window.Camera) {
    ui.gestureLabel.textContent = 'MediaPipe listo';
    ui.cameraStatus.textContent = 'Pulsa Activar cámara cuando quieras jugar con gestos.';
  }
});

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    jump();
  }
  if (event.key.toLowerCase() === 'f') shoot();
  if (event.key.toLowerCase() === 'c') chargeJump();
});

resetGame();
