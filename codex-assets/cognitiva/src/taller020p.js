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

const FRASE_ITEMS = [
  {
    id_item: "fr_001",
    frase_objetivo: ["EL", "SAPO", "SALTA"],
    texto: "EL SAPO SALTA",
    audio_text: "El sapo salta",
    imagen_url: null,
    imagen_placeholder: "🐸"
  },
  {
    id_item: "fr_002",
    frase_objetivo: ["LA", "MESA", "ROTA"],
    texto: "LA MESA ROTA",
    audio_text: "La mesa rota",
    imagen_url: null,
    imagen_placeholder: "🪑"
  },
  {
    id_item: "fr_003",
    frase_objetivo: ["EL", "PATO", "NADA"],
    texto: "EL PATO NADA",
    audio_text: "El pato nada",
    imagen_url: null,
    imagen_placeholder: "🦆"
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
      ? { type: "success", message: "Muy bien. ¡Frase correcta!" }
      : { type: "error", message: "Esa palabra no toca ahora." };
  }

  getSessionSummary() {
    const times = this.metrics.eventos.map((e) => e.responseMs);
    const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    return { ...this.metrics, tiempo_respuesta_promedio_ms: avg };
  }
}

function generateRound() {
  const item = pickOne(FRASE_ITEMS);
  const opciones = shuffle(item.frase_objetivo).map((word, idx) => ({
    id: `w_${idx + 1}`,
    word,
    used: false
  }));
  return {
    item,
    targetOrder: item.frase_objetivo,
    options: opciones,
    built: []
  };
}

function createTaller020pController(motor) {
  const state = {
    round: null,
    startMs: 0,
    nextExpectedIndex: 0
  };

  function nextRound() {
    state.round = generateRound();
    state.startMs = Date.now();
    state.nextExpectedIndex = 0;
    return state.round;
  }

  function replayFullSentence() {
    return state.round?.item.audio_text || "El sapo salta";
  }

  function getExpectedWord() {
    return state.round?.targetOrder[state.nextExpectedIndex] || "";
  }

  function clickWord(optionId) {
    const option = state.round.options.find((o) => o.id === optionId);
    if (!option || option.used) return { ignore: true };

    const expected = getExpectedWord();
    const responseMs = Date.now() - state.startMs;
    const isCorrect = option.word === expected;

    motor.registerAttempt({
      tallerId: "inf_3_obj_020p",
      itemId: state.round.item.id_item,
      selectedWord: option.word,
      correct: isCorrect,
      responseMs,
      stepIndex: state.nextExpectedIndex,
      ts: new Date().toISOString()
    });

    const feedback = motor.immediateFeedback(isCorrect);

    if (!isCorrect) {
      return {
        correct: false,
        feedback,
        expectedWord: expected,
        action: "shake",
        session: motor.getSessionSummary()
      };
    }

    option.used = true;
    state.round.built.push(option.word);
    state.nextExpectedIndex += 1;

    const completed = state.nextExpectedIndex >= state.round.targetOrder.length;
    return {
      correct: true,
      feedback,
      placedWord: option.word,
      completed,
      session: motor.getSessionSummary()
    };
  }

  return {
    nextRound,
    replayFullSentence,
    clickWord,
    getExpectedWord,
    getSessionSummary: () => motor.getSessionSummary()
  };
}

