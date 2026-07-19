function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const ORTO_ITEMS = [
  {
    id_item: "bv_001",
    texto_base: "El a_ion volaba muy _ajo.",
    huecos: [
      { indice: 0, respuesta: "V", palabra: "avion", pista: "Recuerda, avion se escribe con V." },
      { indice: 1, respuesta: "B", palabra: "bajo", pista: "Recuerda, bajo se escribe con B." }
    ]
  },
  {
    id_item: "bv_002",
    texto_base: "El _arco es de color _erde.",
    huecos: [
      { indice: 0, respuesta: "B", palabra: "barco", pista: "Recuerda, barco se escribe con B." },
      { indice: 1, respuesta: "V", palabra: "verde", pista: "Recuerda, verde se escribe con V." }
    ]
  },
  {
    id_item: "bv_003",
    texto_base: "La _aca _ebe agua fresca.",
    huecos: [
      { indice: 0, respuesta: "V", palabra: "vaca", pista: "Recuerda, vaca se escribe con V." },
      { indice: 1, respuesta: "B", palabra: "bebe", pista: "Recuerda, bebe se escribe con B." }
    ]
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
      ? { type: "success", message: "Correcto" }
      : { type: "error", message: "Letra incorrecta" };
  }

  getSessionSummary() {
    const times = this.metrics.eventos.map((e) => e.responseMs);
    const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    return { ...this.metrics, tiempo_respuesta_promedio_ms: avg };
  }
}

function makeRound() {
  const item = pickOne(ORTO_ITEMS);
  const slots = item.huecos.map((h, idx) => ({
    slotId: `slot_${idx + 1}`,
    indice: h.indice,
    respuesta: h.respuesta,
    palabra: h.palabra,
    pista: h.pista,
    value: "",
    solved: false
  }));

  return {
    item,
    slots,
    selectedSlotId: null,
    completed: false,
    startMs: Date.now()
  };
}

function createTallerOrtografiaController(motor) {
  const state = { round: null };

  function nextRound() {
    state.round = makeRound();
    return state.round;
  }

  function selectSlot(slotId) {
    const slot = state.round.slots.find((s) => s.slotId === slotId);
    if (!slot || slot.solved) return { ignore: true };
    state.round.selectedSlotId = slotId;
    return { selectedSlotId: slotId };
  }

  function inputLetter(letter) {
    const slot = state.round.slots.find((s) => s.slotId === state.round.selectedSlotId);
    if (!slot || slot.solved) return { ignore: true };

    slot.value = letter;
    const correct = letter === slot.respuesta;
    const responseMs = Date.now() - state.round.startMs;

    motor.registerAttempt({
      tallerId: "pri_ort_bv_cloze_001",
      itemId: state.round.item.id_item,
      slotId: slot.slotId,
      palabra: slot.palabra,
      expected: slot.respuesta,
      selected: letter,
      correct,
      responseMs,
      ts: new Date().toISOString()
    });

    const feedback = motor.immediateFeedback(correct);

    if (correct) {
      slot.solved = true;
      slot.value = letter;
      const completed = state.round.slots.every((s) => s.solved);
      state.round.completed = completed;
      return {
        correct: true,
        feedback,
        slotId: slot.slotId,
        completed,
        round: state.round,
        session: motor.getSessionSummary()
      };
    }

    return {
      correct: false,
      feedback,
      slotId: slot.slotId,
      wrongLetter: letter,
      clearAfterMs: 900,
      hintSpeech: slot.pista,
      round: state.round,
      session: motor.getSessionSummary()
    };
  }

  function clearSlot(slotId) {
    const slot = state.round.slots.find((s) => s.slotId === slotId);
    if (!slot || slot.solved) return;
    slot.value = "";
  }

  return {
    nextRound,
    selectSlot,
    inputLetter,
    clearSlot,
    getSessionSummary: () => motor.getSessionSummary()
  };
}

