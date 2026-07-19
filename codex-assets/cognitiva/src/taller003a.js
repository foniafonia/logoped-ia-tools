const NON_SIMILAR_PHONEMES = {
  a: ["s", "p", "m", "t", "k", "f"],
  e: ["s", "p", "m", "t", "k", "f"],
  o: ["s", "p", "m", "t", "k", "f"],
  i: ["m", "p", "t", "k", "f", "s"],
  u: ["m", "p", "t", "k", "f", "s"],
  p: ["a", "e", "i", "o", "u", "m"],
  s: ["a", "e", "i", "o", "u", "m"],
  m: ["a", "e", "i", "o", "u", "s"]
};

function pickRandom(arr, count) {
  const pool = [...arr];
  const out = [];
  while (pool.length && out.length < count) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

class MotorGestion {
  constructor(profileId, config = {}) {
    this.profileId = profileId;
    this.config = {
      sessionMs: config.sessionMs ?? 15 * 60 * 1000,
      defaultExposureMs: config.defaultExposureMs ?? 1000,
      minExposureMs: config.minExposureMs ?? 700,
      maxExposureMs: config.maxExposureMs ?? 1800
    };
    this.sessionStart = null;
    this.metrics = { aciertos: 0, errores: 0, intentos: 0, eventos: [] };
    this.currentExposureMs = this.config.defaultExposureMs;
  }

  startSession() {
    this.sessionStart = Date.now();
  }

  registerAttempt(event) {
    this.metrics.intentos += 1;
    if (event.correct) {
      this.metrics.aciertos += 1;
      this.currentExposureMs = Math.max(this.config.minExposureMs, this.currentExposureMs - 100);
    } else {
      this.metrics.errores += 1;
      this.currentExposureMs = Math.min(this.config.maxExposureMs, this.currentExposureMs + 150);
    }
    this.metrics.eventos.push(event);
  }

  immediateFeedback(correct) {
    return correct
      ? { type: "success", message: "Muy bien. ¡Acertaste!" }
      : { type: "error", message: "No es correcta. Vamos a intentarlo de nuevo." };
  }

  errorTreatment(state) {
    if (state.consecutiveErrors === 1) {
      return { reduceDistractorsTo: Math.max(1, state.optionsCount - 1), showSolution: false };
    }
    return { reduceDistractorsTo: 1, showSolution: true };
  }

  getSessionSummary() {
    const times = this.metrics.eventos.map((e) => e.responseMs);
    const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    return {
      profileId: this.profileId,
      aciertos: this.metrics.aciertos,
      errores: this.metrics.errores,
      intentos: this.metrics.intentos,
      tiempo_respuesta_promedio_ms: avg,
      eventos: this.metrics.eventos
    };
  }
}

function generateRound({ modelPhoneme, optionsCount = 3 }) {
  const distractorPool = NON_SIMILAR_PHONEMES[modelPhoneme] || NON_SIMILAR_PHONEMES.a;
  const distractors = pickRandom(distractorPool, Math.max(1, optionsCount - 1));
  const options = shuffle([modelPhoneme, ...distractors]).map((phoneme, idx) => ({
    id: `opt_${idx + 1}`,
    phoneme,
    isCorrect: phoneme === modelPhoneme
  }));
  return { modelPhoneme, options };
}

function createTaller003aController(motor, config = {}) {
  const state = {
    modelPhoneme: config.modelPhoneme || "a",
    optionsCount: config.optionsCount || 3,
    consecutiveErrors: 0,
    round: null,
    startMs: 0
  };

  function nextRound() {
    state.round = generateRound(state);
    state.startMs = Date.now();
    return state.round;
  }

  function replayModelAudio() {
    return state.modelPhoneme;
  }

  function clickOption(optionId) {
    const option = state.round.options.find((o) => o.id === optionId);
    if (!option) return { ignore: true };

    const responseMs = Date.now() - state.startMs;
    const event = {
      tallerId: "inf_1_obj_003a",
      modelPhoneme: state.modelPhoneme,
      selectedPhoneme: option.phoneme,
      correct: option.isCorrect,
      responseMs,
      ts: new Date().toISOString()
    };

    motor.registerAttempt(event);
    const feedback = motor.immediateFeedback(option.isCorrect);

    if (option.isCorrect) {
      state.consecutiveErrors = 0;
      return { correct: true, feedback, completed: true, session: motor.getSessionSummary(), option };
    }

    state.consecutiveErrors += 1;
    const treatment = motor.errorTreatment(state);
    state.optionsCount = Math.max(2, treatment.reduceDistractorsTo + 1);

    return {
      correct: false,
      feedback,
      completed: false,
      treatment,
      replayPhoneme: replayModelAudio(),
      session: motor.getSessionSummary(),
      option
    };
  }

  return { nextRound, clickOption, replayModelAudio, getSessionSummary: () => motor.getSessionSummary() };
}

