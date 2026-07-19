function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const STORY = {
  id_historia: "hist_001",
  titulo: "De semilla a flor",
  vinetas: [
    { id: "v1", orden_correcto: 1, emoji: "🌱", descripcion: "Sembrar la semilla" },
    { id: "v2", orden_correcto: 2, emoji: "💧", descripcion: "Regar la planta" },
    { id: "v3", orden_correcto: 3, emoji: "🌸", descripcion: "Recoger la flor" }
  ],
  nexos: ["Al principio,", "Después,", "Finalmente,"]
};

class MotorGestion {
  constructor(profileId) {
    this.profileId = profileId;
    this.metrics = {
      aciertos: 0,
      errores: 0,
      intentos: 0,
      tiempo_planificacion_ms: 0,
      tiempo_ejecucion_ms: 0,
      eventos: []
    };
  }

  registerAttempt(event) {
    this.metrics.intentos += 1;
    if (event.correct) this.metrics.aciertos += 1;
    else this.metrics.errores += 1;
    this.metrics.eventos.push(event);
  }

  setPlanningTime(ms) {
    this.metrics.tiempo_planificacion_ms = ms;
  }

  setExecutionTime(ms) {
    this.metrics.tiempo_ejecucion_ms = ms;
  }

  getSessionSummary() {
    return { ...this.metrics };
  }
}

function createTallerEscrituraProductivaController(motor) {
  const state = {
    phase: 1,
    story: null,
    shuffled: [],
    selectedOrder: [],
    selectedNexos: ["", "", ""],
    texts: ["", "", ""],
    planningStartMs: 0,
    executionStartMs: 0
  };

  function nextRound() {
    state.phase = 1;
    state.story = STORY;
    state.shuffled = shuffle(STORY.vinetas);
    state.selectedOrder = [];
    state.selectedNexos = ["", "", ""];
    state.texts = ["", "", ""];
    state.planningStartMs = Date.now();
    state.executionStartMs = 0;
    return {
      phase: state.phase,
      story: state.story,
      shuffled: state.shuffled,
      selectedOrder: state.selectedOrder,
      nexos: state.story.nexos
    };
  }

  function selectVignette(vignetteId) {
    if (state.phase !== 1) return { ignore: true };
    const already = state.selectedOrder.find((v) => v.id === vignetteId);
    if (already) return { ignore: true };

    const v = state.shuffled.find((x) => x.id === vignetteId);
    if (!v) return { ignore: true };

    state.selectedOrder.push(v);
    const complete = state.selectedOrder.length === state.story.vinetas.length;

    if (!complete) {
      return { correct: true, phase: 1, complete: false, selectedOrder: state.selectedOrder };
    }

    const logical = state.selectedOrder.every((vignette, idx) => vignette.orden_correcto === idx + 1);
    motor.registerAttempt({
      tallerId: "pri_2_3_escritura_productiva_001",
      phase: 1,
      selectedIds: state.selectedOrder.map((x) => x.id),
      correct: logical,
      ts: new Date().toISOString()
    });

    if (!logical) {
      state.selectedOrder = [];
      return { correct: false, phase: 1, action: "reset_order" };
    }

    const planningMs = Date.now() - state.planningStartMs;
    motor.setPlanningTime(planningMs);
    state.phase = 2;
    state.executionStartMs = Date.now();

    return {
      correct: true,
      phase: 2,
      planningMs,
      ordered: state.selectedOrder,
      nexos: state.story.nexos,
      texts: state.texts,
      selectedNexos: state.selectedNexos
    };
  }

  function assignNexo(slotIndex, nexo) {
    if (state.phase !== 2) return { ignore: true };
    state.selectedNexos[slotIndex] = nexo;
    return { selectedNexos: state.selectedNexos };
  }

  function updateText(slotIndex, text) {
    if (state.phase !== 2) return { ignore: true };
    state.texts[slotIndex] = text;
    return { texts: state.texts };
  }

  function submitPhase2() {
    if (state.phase !== 2) return { ignore: true };

    const nexosOk = state.selectedNexos.every((n) => n && n.length > 0);
    const textOk = state.texts.every((t) => t.trim().length > 0);
    const correct = nexosOk && textOk;

    motor.registerAttempt({
      tallerId: "pri_2_3_escritura_productiva_001",
      phase: 2,
      selectedNexos: state.selectedNexos,
      texts: state.texts,
      correct,
      ts: new Date().toISOString()
    });

    if (!correct) {
      return { correct: false, phase: 2, message: "Completa todos los nexos y frases." };
    }

    const executionMs = Date.now() - state.executionStartMs;
    motor.setExecutionTime(executionMs);

    return {
      correct: true,
      phase: 2,
      completed: true,
      executionMs,
      session: motor.getSessionSummary()
    };
  }

  return {
    nextRound,
    selectVignette,
    assignNexo,
    updateText,
    submitPhase2,
    getSessionSummary: () => motor.getSessionSummary()
  };
}

