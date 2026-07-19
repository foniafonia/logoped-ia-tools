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

const ITEMS = [
  {
    id_item: "cf_001",
    palabra: "TOMATE",
    audio_text: "tomate",
    silabas_original: ["TO", "MA", "TE"],
    silabas_objetivo_inverso: ["TE", "MA", "TO"]
  },
  {
    id_item: "cf_002",
    palabra: "CAMISA",
    audio_text: "camisa",
    silabas_original: ["CA", "MI", "SA"],
    silabas_objetivo_inverso: ["SA", "MI", "CA"]
  },
  {
    id_item: "cf_003",
    palabra: "PELOTA",
    audio_text: "pelota",
    silabas_original: ["PE", "LO", "TA"],
    silabas_objetivo_inverso: ["TA", "LO", "PE"]
  }
];

class MotorGestion {
  constructor(profileId) {
    this.profileId = profileId;
    this.metrics = { aciertos: 0, errores: 0, intentos: 0, eventos: [] };
  }

  registerAttempt(event) {
    this.metrics.intentos += 1;
    if (event.correct) this.metrics.aciertos += 1;
    else this.metrics.errores += 1;
    this.metrics.eventos.push(event);
  }

  immediateFeedback(correct) {
    return correct
      ? { type: "success", message: "Secuencia correcta" }
      : { type: "error", message: "Secuencia incorrecta" };
  }

  getSessionSummary() {
    const times = this.metrics.eventos.map((e) => e.responseMs);
    const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    return { ...this.metrics, tiempo_respuesta_promedio_ms: avg };
  }
}

function makeRound() {
  const item = pickOne(ITEMS);
  const options = shuffle(item.silabas_original).map((syl, idx) => ({
    id: `s_${idx + 1}`,
    syllable: syl
  }));

  return {
    item,
    options,
    built: [],
    expectedInverse: item.silabas_objetivo_inverso,
    stepIndex: 0,
    startMs: Date.now(),
    completed: false
  };
}

function createTallerConcienciaFonologicaController(motor) {
  const state = { round: null };

  function nextRound() {
    state.round = makeRound();
    return state.round;
  }

  function replayWordAudio() {
    return state.round?.item.audio_text || "tomate";
  }

  function expectedStartSyllable() {
    return state.round?.expectedInverse[0] || "TE";
  }

  function clickSyllable(syllableId) {
    const option = state.round.options.find((o) => o.id === syllableId);
    if (!option) return { ignore: true };

    const expected = state.round.expectedInverse[state.round.stepIndex];
    const correct = option.syllable === expected;
    const responseMs = Date.now() - state.round.startMs;

    motor.registerAttempt({
      tallerId: "pri_3_obj_008a",
      itemId: state.round.item.id_item,
      palabra: state.round.item.palabra,
      expected,
      selected: option.syllable,
      correct,
      stepIndex: state.round.stepIndex,
      responseMs,
      ts: new Date().toISOString()
    });

    const feedback = motor.immediateFeedback(correct);

    if (!correct) {
      state.round.built = [];
      state.round.stepIndex = 0;
      return {
        correct: false,
        feedback,
        action: "reset",
        hintStart: expectedStartSyllable(),
        round: state.round,
        session: motor.getSessionSummary()
      };
    }

    state.round.built.push(option.syllable);
    state.round.stepIndex += 1;
    const completed = state.round.stepIndex >= state.round.expectedInverse.length;
    state.round.completed = completed;

    return {
      correct: true,
      feedback,
      completed,
      builtWordInverse: state.round.built.join(""),
      round: state.round,
      session: motor.getSessionSummary()
    };
  }

  return {
    nextRound,
    clickSyllable,
    replayWordAudio,
    expectedStartSyllable,
    getSessionSummary: () => motor.getSessionSummary()
  };
}

