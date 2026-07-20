import { ALPHABET, SPEED_MS, codeForLetter, createSequence, getPhaseLetters, movementLabel } from './alphabet-game.js';
import { VisionController } from './vision.js';

const els = {
  home: document.querySelector('#homeScreen'),
  play: document.querySelector('#playScreen'),
  summary: document.querySelector('#summaryScreen'),
  form: document.querySelector('#setupForm'),
  mode: document.querySelector('#modeSelect'),
  phase: document.querySelector('#phaseSelect'),
  difficulty: document.querySelector('#difficultySelect'),
  speed: document.querySelector('#speedSelect'),
  sound: document.querySelector('#soundToggle'),
  accessibleJump: document.querySelector('#accessibleJumpToggle'),
  debugToggle: document.querySelector('#debugToggle'),
  phaseLabel: document.querySelector('#phaseLabel'),
  hits: document.querySelector('#hitsStat'),
  errors: document.querySelector('#errorsStat'),
  repeats: document.querySelector('#repeatsStat'),
  progress: document.querySelector('#progressStat'),
  grid: document.querySelector('#alphabetGrid'),
  meter: document.querySelector('#meterBar'),
  letter: document.querySelector('#currentLetter'),
  code: document.querySelector('#currentCode'),
  movement: document.querySelector('#currentMovement'),
  feedback: document.querySelector('#feedback'),
  cueLeft: document.querySelector('#cueLeft'),
  cueUp: document.querySelector('#cueUp'),
  cueRight: document.querySelector('#cueRight'),
  repeat: document.querySelector('#repeatButton'),
  pause: document.querySelector('#pauseButton'),
  restart: document.querySelector('#restartButton'),
  regenerate: document.querySelector('#regenerateButton'),
  cameraButton: document.querySelector('#cameraButton'),
  debugPanel: document.querySelector('#debugPanel'),
  video: document.querySelector('#camera'),
  overlay: document.querySelector('#overlay'),
  cameraStatus: document.querySelector('#cameraStatus'),
  debugMode: document.querySelector('#debugMode'),
  debugGesture: document.querySelector('#debugGesture'),
  debugConfidence: document.querySelector('#debugConfidence'),
  debugFps: document.querySelector('#debugFps'),
  summaryPhase: document.querySelector('#summaryPhase'),
  summaryHits: document.querySelector('#summaryHits'),
  summaryErrors: document.querySelector('#summaryErrors'),
  summaryTime: document.querySelector('#summaryTime'),
  nextPhase: document.querySelector('#nextPhaseButton'),
  backHome: document.querySelector('#backHomeButton'),
};

const state = {
  mode: 'hands',
  phase: 1,
  difficulty: 'medium',
  speedMs: SPEED_MS.medium,
  sequence: createSequence('medium'),
  letters: [...ALPHABET],
  index: 0,
  hits: 0,
  errors: 0,
  repeats: 0,
  paused: false,
  startedAt: 0,
  tickStartedAt: 0,
  lastAcceptedAt: 0,
  lastErrorAt: 0,
  timeoutMarked: false,
  sound: true,
  accessibleJump: true,
  audio: null,
  lastSpokenAt: 0,
};

const vision = new VisionController({
  video: els.video,
  canvas: els.overlay,
  onStatus: (message) => {
    els.cameraStatus.textContent = message;
  },
  onUpdate: handleVisionUpdate,
});

bindEvents();
applyMobileDefaults();
renderAlphabet();

function bindEvents() {
  els.form.addEventListener('submit', (event) => {
    event.preventDefault();
    startSession();
  });
  els.repeat.addEventListener('click', repeatCurrent);
  els.pause.addEventListener('click', togglePause);
  els.restart.addEventListener('click', restartPhase);
  els.regenerate.addEventListener('click', regenerateTable);
  els.cameraButton.addEventListener('click', startCamera);
  els.nextPhase.addEventListener('click', nextPhase);
  els.backHome.addEventListener('click', backHome);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !state.paused) togglePause();
  });
}

function startSession() {
  state.mode = 'hands';
  state.phase = Number(els.phase.value);
  state.difficulty = els.difficulty.value;
  state.speedMs = SPEED_MS[els.speed.value] || SPEED_MS.medium;
  state.sound = els.sound.checked;
  state.accessibleJump = els.accessibleJump.checked;
  state.letters = getPhaseLetters(state.phase);
  state.index = 0;
  state.hits = 0;
  state.errors = 0;
  state.repeats = 0;
  state.paused = false;
  state.startedAt = Date.now();
  state.tickStartedAt = performance.now();
  els.home.hidden = true;
  els.summary.hidden = true;
  els.play.hidden = false;
  els.debugPanel.hidden = false;
  els.phaseLabel.textContent = phaseName();
  els.pause.textContent = 'Pausa';
  els.feedback.textContent = 'Coloca la mano delante de la camara y desliza el dedo a izquierda o derecha.';
  els.debugMode.textContent = state.mode;
  renderAlphabet();
  renderCurrent();
  startTicker();
  startCamera();
}

function renderAlphabet() {
  els.grid.innerHTML = '';
  ALPHABET.forEach((letter) => {
    const cell = document.createElement('div');
    cell.className = 'letter-cell';
    cell.dataset.letter = letter;
    cell.innerHTML = `<strong>${letter}</strong><span>${codeForLetter(letter, state.sequence)}</span>`;
    els.grid.appendChild(cell);
  });
}

function renderCurrent() {
  const letter = state.letters[state.index];
  const code = codeForLetter(letter, state.sequence);
  els.letter.textContent = letter;
  els.code.textContent = symbolForCode(code);
  els.movement.textContent = `${code}: ${movementLabel(code, state.phase, state.accessibleJump)}`;
  els.hits.textContent = state.hits;
  els.errors.textContent = state.errors;
  els.progress.textContent = `${Math.min(state.index + 1, state.letters.length)}/${state.letters.length}`;
  els.cueLeft.classList.toggle('active', code === 'I');
  els.cueUp.classList.toggle('active', code === 'A');
  els.cueRight.classList.toggle('active', code === 'D');
  const completedLetters = new Set(state.letters.slice(0, state.index));
  document.querySelectorAll('.letter-cell').forEach((cell) => {
    cell.classList.toggle('active', cell.dataset.letter === letter);
    cell.classList.toggle('done', completedLetters.has(cell.dataset.letter));
  });
  state.tickStartedAt = performance.now();
  state.timeoutMarked = false;
}

function startTicker() {
  requestAnimationFrame(function tick(now) {
    if (els.play.hidden) return;
    if (!state.paused) {
      const progress = Math.min(1, (now - state.tickStartedAt) / state.speedMs);
      els.meter.style.transform = `scaleX(${progress})`;
      if (progress >= 1) {
        state.tickStartedAt = now;
        if (!state.timeoutMarked) markError('timeout');
      }
    }
    requestAnimationFrame(tick);
  });
}

function acceptCurrent(source) {
  if (state.paused) return;
  const now = performance.now();
  if (now - state.lastAcceptedAt < 650) return;
  state.lastAcceptedAt = now;
  state.hits += 1;
  playRewardSound();
  speakFeedback('Correcto');
  els.feedback.textContent = source === 'camera' ? 'Correcto. Seguimos.' : 'Marcado como correcto.';
  if (state.index >= state.letters.length - 1) {
    showSummary();
    return;
  }
  state.index += 1;
  renderCurrent();
}

function markError(source) {
  if (state.paused) return;
  const now = performance.now();
  if (now - state.lastAcceptedAt < 420 && source !== 'timeout') return;
  if (now - state.lastErrorAt < 1000 && source !== 'timeout') return;
  if (source === 'timeout' && state.timeoutMarked) return;
  state.lastErrorAt = now;
  state.timeoutMarked = true;
  state.errors += 1;
  els.errors.textContent = state.errors;
  playErrorSound();
  if (source !== 'timeout') speakFeedback('Incorrecto');
  els.feedback.textContent = source === 'timeout' ? 'Sin respuesta. Repite esta letra.' : 'Error marcado. Repite esta letra.';
}

function repeatCurrent() {
  state.repeats += 1;
  els.feedback.textContent = 'Repetimos desde esta letra.';
  renderCurrent();
}

function togglePause() {
  state.paused = !state.paused;
  els.pause.textContent = state.paused ? 'Continuar' : 'Pausa';
  els.feedback.textContent = state.paused ? 'Pausa activa.' : 'Seguimos.';
  state.tickStartedAt = performance.now();
}

function restartPhase() {
  state.index = 0;
  state.hits = 0;
  state.errors = 0;
  state.repeats = 0;
  state.startedAt = Date.now();
  els.feedback.textContent = 'Fase reiniciada.';
  renderCurrent();
}

function regenerateTable() {
  state.sequence = createSequence(state.difficulty, state.sequence);
  els.feedback.textContent = 'Tabla regenerada.';
  renderAlphabet();
  renderCurrent();
}

async function startCamera() {
  els.debugMode.textContent = state.mode;
  els.cameraStatus.textContent = 'Cargando camara y modelos...';
  els.debugPanel.hidden = false;
  try {
    resumeAudio();
    await vision.start(state.mode);
    els.cameraButton.textContent = 'Camara activa';
    els.feedback.textContent = 'Camara activa. Desliza el dedo a izquierda o derecha.';
    speakFeedback('Camara activa');
  } catch (error) {
    els.cameraStatus.textContent = 'Camara no disponible';
    els.feedback.textContent = `La camara no ha arrancado: ${error.message}`;
  }
}

function handleVisionUpdate(data) {
  els.debugGesture.textContent = data.gesture === 'none' ? data.rawGesture : data.gesture;
  els.debugConfidence.textContent = data.confidence.toFixed(2);
  els.debugFps.textContent = String(data.fps);
  if (data.marker) {
    els.cameraStatus.textContent = 'Dedo detectado';
  } else {
    els.cameraStatus.textContent = 'Buscando dedo...';
  }
  if (state.paused || els.play.hidden) return;

  const expected = codeForLetter(state.letters[state.index], state.sequence);
  if (data.gesture === expected) {
    acceptCurrent('camera');
  } else if (data.gesture !== 'none') {
    markError('camera');
    els.feedback.textContent = `Veo ${symbolForCode(data.gesture)}. Toca ${symbolForCode(expected)}.`;
  }
}

function showSummary() {
  els.play.hidden = true;
  els.summary.hidden = false;
  els.summaryPhase.textContent = `${phaseName()} completada`;
  els.summaryHits.textContent = state.hits;
  els.summaryErrors.textContent = state.errors;
  els.summaryTime.textContent = formatTime(Math.round((Date.now() - state.startedAt) / 1000));
  els.nextPhase.hidden = state.phase >= 3;
}

function nextPhase() {
  if (state.phase >= 3) return;
  state.phase += 1;
  els.phase.value = String(state.phase);
  state.letters = getPhaseLetters(state.phase);
  state.index = 0;
  state.hits = 0;
  state.errors = 0;
  state.repeats = 0;
  state.startedAt = Date.now();
  els.summary.hidden = true;
  els.play.hidden = false;
  els.phaseLabel.textContent = phaseName();
  els.feedback.textContent = 'Nueva fase preparada.';
  renderCurrent();
}

function backHome() {
  vision.stop();
  els.summary.hidden = true;
  els.play.hidden = true;
  els.home.hidden = false;
}

function phaseName() {
  if (state.phase === 2) return 'Fase 2: Z a A';
  if (state.phase === 3) return 'Fase 3: brazos y piernas';
  return 'Fase 1: A a Z';
}

function getAudio() {
  if (!state.sound) return;
  try {
    state.audio ||= new AudioContext();
    return state.audio;
  } catch {
    state.sound = false;
    return null;
  }
}

function resumeAudio() {
  const audio = getAudio();
  if (!audio) return;
  if (audio.state === 'suspended') {
    audio.resume().catch(() => {});
  }
}

function playRewardSound() {
  const audio = getAudio();
  if (!audio) return;
  [523, 659, 784, 1046].forEach((frequency, index) => {
    const osc = state.audio.createOscillator();
    const gain = state.audio.createGain();
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.001, audio.currentTime + index * 0.055);
    gain.gain.exponentialRampToValueAtTime(0.08, audio.currentTime + index * 0.055 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + index * 0.055 + 0.12);
    osc.connect(gain).connect(state.audio.destination);
    osc.start(audio.currentTime + index * 0.055);
    osc.stop(audio.currentTime + index * 0.055 + 0.13);
  });
}

function playErrorSound() {
  const audio = getAudio();
  if (!audio) return;
  [220, 196, 164, 130].forEach((frequency, index) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = index % 2 ? 'square' : 'sawtooth';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.001, audio.currentTime + index * 0.075);
    gain.gain.exponentialRampToValueAtTime(0.06, audio.currentTime + index * 0.075 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + index * 0.075 + 0.16);
    osc.connect(gain).connect(audio.destination);
    osc.start(audio.currentTime + index * 0.075);
    osc.stop(audio.currentTime + index * 0.075 + 0.17);
  });
}

function speakFeedback(text) {
  if (!state.sound || !('speechSynthesis' in window)) return;
  const now = performance.now();
  if (now - state.lastSpokenAt < 300) return;
  state.lastSpokenAt = now;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1;
    utterance.pitch = text === 'Correcto' ? 1.15 : 0.92;
    window.speechSynthesis.speak(utterance);
  } catch {}
}

function symbolForCode(code) {
  if (code === 'I') return '←';
  if (code === 'D') return '→';
  return '↑';
}

function applyMobileDefaults() {
  els.mode.value = 'hands';
  const coarse = window.matchMedia?.('(pointer: coarse)')?.matches;
  if (!coarse) return;
  els.difficulty.value = 'easy';
  els.speed.value = 'slow';
  els.debugToggle.checked = true;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${rest}`;
}
