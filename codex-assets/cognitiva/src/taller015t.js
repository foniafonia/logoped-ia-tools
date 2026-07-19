const VOWELS = ["A", "E", "I", "O", "U"];
const TARGET_INVERSE = ["AS", "ES", "IS", "OS", "US"];

function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
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
      defaultExposureMs: config.defaultExposureMs ?? 1000,
      minExposureMs: config.minExposureMs ?? 700,
      maxExposureMs: config.maxExposureMs ?? 1800
    };
    this.metrics = { aciertos: 0, errores: 0, intentos: 0, eventos: [] };
    this.currentExposureMs = this.config.defaultExposureMs;
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
      return { reduceDistractorsTo: Math.max(1, state.optionsCount - 1), replayAudio: true, showSolution: false };
    }
    return { reduceDistractorsTo: 1, replayAudio: true, showSolution: true };
  }

  getSessionSummary() {
    const times = this.metrics.eventos.map((e) => e.responseMs);
    const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    return { ...this.metrics, tiempo_respuesta_promedio_ms: avg };
  }
}

function generateRound(optionsCount = 3) {
  const target = pickOne(TARGET_INVERSE);
  const targetVowel = target[0];
  const otherVowel = pickOne(VOWELS.filter((v) => v !== targetVowel));
  const inverseDistractor = `${otherVowel}S`;
  const contrastConsonant = pickOne(["M", "P", "T", "L"]);
  const contrastDistractor = `${contrastConsonant}${pickOne(VOWELS)}`;

  const options = shuffle([target, inverseDistractor, contrastDistractor]).slice(0, optionsCount).map((syllable, idx) => ({
    id: `opt_${idx + 1}`,
    syllable,
    isCorrect: syllable === target
  }));

  return { targetSyllable: target, options };
}

function createTaller015tController(motor, config = {}) {
  const state = {
    optionsCount: config.optionsCount || 3,
    consecutiveErrors: 0,
    round: null,
    startMs: 0
  };

  function nextRound() {
    state.round = generateRound(state.optionsCount);
    state.startMs = Date.now();
    return state.round;
  }

  function replayModelAudio() {
    return state.round?.targetSyllable || "AS";
  }

  function clickOption(optionId) {
    const option = state.round.options.find((o) => o.id === optionId);
    if (!option) return { ignore: true };

    const responseMs = Date.now() - state.startMs;
    motor.registerAttempt({
      tallerId: "inf_2_obj_015t",
      modelSyllable: state.round.targetSyllable,
      selectedSyllable: option.syllable,
      correct: option.isCorrect,
      responseMs,
      ts: new Date().toISOString()
    });

    const feedback = motor.immediateFeedback(option.isCorrect);

    if (option.isCorrect) {
      state.consecutiveErrors = 0;
      state.optionsCount = 3;
      return { correct: true, completed: true, feedback, session: motor.getSessionSummary() };
    }

    state.consecutiveErrors += 1;
    const treatment = motor.errorTreatment(state);
    state.optionsCount = Math.max(2, treatment.reduceDistractorsTo + 1);

    return {
      correct: false,
      completed: false,
      feedback,
      treatment,
      replaySyllable: replayModelAudio(),
      session: motor.getSessionSummary()
    };
  }

  return { nextRound, replayModelAudio, clickOption, getSessionSummary: () => motor.getSessionSummary() };
}

