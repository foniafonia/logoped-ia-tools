function tokenize(text) {
  return text.split(/\s+/).map((raw, idx) => {
    const clean = raw.toLowerCase().replace(/[^a-záéíóúüñ]/gi, "");
    return { id: `w_${idx + 1}`, raw, clean, found: false };
  });
}

class MotorGestion {
  constructor(profileId) {
    this.profileId = profileId;
    this.metrics = {
      aciertos: 0,
      errores: 0,
      intentos: 0,
      tiempo_total_ms: 0,
      penalizacion_total_ms: 0,
      eventos: []
    };
  }

  registerAttempt(event) {
    this.metrics.intentos += 1;
    if (event.correct) this.metrics.aciertos += 1;
    else this.metrics.errores += 1;
    this.metrics.eventos.push(event);
  }

  addPenalty(ms) {
    this.metrics.penalizacion_total_ms += ms;
  }

  closeSession(totalMs) {
    this.metrics.tiempo_total_ms = totalMs;
  }

  getSessionSummary() {
    return { ...this.metrics };
  }
}

const EFF_ITEMS = [
  {
    id_item: "ef_001",
    palabra_modelo: "castillo",
    texto: "El castillo está en la colina y desde allí se ve el rio. Marta dibujo un castillo pequeño en su cuaderno. En la excursion, el guia hablo del castillo antiguo y de sus torres. Al final, todos compraron una postal del castillo y volvieron contentos al autobus.",
    ocurrencias_objetivo: 4
  }
];

function createTallerEficienciaLectoraController(motor, config = {}) {
  const state = {
    modelMs: config.modelMs || 2500,
    penaltyMs: config.penaltyMs || 3000,
    idleHintMs: config.idleHintMs || 7000,
    round: null,
    startedAt: 0,
    pausedPenaltyMs: 0,
    lastCorrectAt: 0
  };

  function nextRound() {
    const item = EFF_ITEMS[0];
    const words = tokenize(item.texto);
    state.round = {
      item,
      words,
      model: item.palabra_modelo.toLowerCase(),
      targetsTotal: item.ocurrencias_objetivo,
      targetsFound: 0,
      finished: false
    };
    state.startedAt = 0;
    state.pausedPenaltyMs = 0;
    state.lastCorrectAt = 0;
    return state.round;
  }

  function startSearchTimer() {
    state.startedAt = Date.now();
    state.lastCorrectAt = state.startedAt;
  }

  function getElapsedMs() {
    if (!state.startedAt) return 0;
    return Date.now() - state.startedAt + state.pausedPenaltyMs;
  }

  function clickWord(wordId) {
    const word = state.round.words.find((w) => w.id === wordId);
    if (!word || word.found || state.round.finished) return { ignore: true };

    const correct = word.clean === state.round.model;
    motor.registerAttempt({
      tallerId: "pri_3_obj_003a_004a",
      itemId: state.round.item.id_item,
      selected: word.raw,
      selectedClean: word.clean,
      expected: state.round.model,
      correct,
      elapsedMs: getElapsedMs(),
      ts: new Date().toISOString()
    });

    if (correct) {
      word.found = true;
      state.round.targetsFound += 1;
      state.lastCorrectAt = Date.now();
      const completed = state.round.targetsFound >= state.round.targetsTotal;
      if (completed) {
        state.round.finished = true;
        motor.closeSession(getElapsedMs());
      }
      return {
        correct: true,
        completed,
        found: state.round.targetsFound,
        total: state.round.targetsTotal,
        elapsedMs: getElapsedMs(),
        session: motor.getSessionSummary()
      };
    }

    state.pausedPenaltyMs += state.penaltyMs;
    motor.addPenalty(state.penaltyMs);
    return {
      correct: false,
      penaltyMs: state.penaltyMs,
      elapsedMs: getElapsedMs(),
      session: motor.getSessionSummary()
    };
  }

  function shouldHintNow() {
    if (state.round.finished || !state.startedAt) return false;
    return Date.now() - state.lastCorrectAt >= state.idleHintMs;
  }

  function getHintTargetId() {
    const target = state.round.words.find((w) => !w.found && w.clean === state.round.model);
    return target ? target.id : null;
  }

  return {
    nextRound,
    startSearchTimer,
    clickWord,
    getElapsedMs,
    shouldHintNow,
    getHintTargetId,
    getSessionSummary: () => motor.getSessionSummary(),
    getModelMs: () => state.modelMs,
    getRound: () => state.round
  };
}

