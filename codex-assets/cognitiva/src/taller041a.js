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

const INFER_ITEMS = [
  {
    id_item: "inf_001",
    titulo: "Llegada de Maria",
    lineas: [
      "Maria llego a casa empapada y tiritando de frio.",
      "Dejo su paraguas goteando en la entrada.",
      "Se fue directa a cambiarse de ropa."
    ],
    pregunta: "¿Que tiempo hacia en la calle?",
    opciones: ["Hacia mucho sol", "Estaba lloviendo", "Estaba nevando"],
    respuesta_correcta: "Estaba lloviendo",
    pistas: ["empapada", "paraguas goteando"]
  },
  {
    id_item: "inf_002",
    titulo: "La cocina de Pablo",
    lineas: [
      "Pablo salio corriendo de la cocina con las manos enrojecidas.",
      "La olla seguia echando vapor sobre el fuego.",
      "Su madre le puso crema fria en los dedos."
    ],
    pregunta: "¿Que le pudo pasar a Pablo?",
    opciones: ["Se quemo con algo caliente", "Se mojo con lluvia", "Se pincho con una espina"],
    respuesta_correcta: "Se quemo con algo caliente",
    pistas: ["manos enrojecidas", "olla echando vapor", "crema fria"]
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
      ? { type: "success", message: "Inferencia correcta" }
      : { type: "error", message: "Piensa en las pistas del texto" };
  }

  getSessionSummary() {
    const times = this.metrics.eventos.map((e) => e.responseMs);
    const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    return { ...this.metrics, tiempo_respuesta_promedio_ms: avg };
  }
}

function generateRound(optionsCount = 3) {
  const item = pickOne(INFER_ITEMS);
  const options = shuffle(item.opciones).slice(0, optionsCount).map((text, idx) => ({
    id: `opt_${idx + 1}`,
    text,
    isCorrect: text === item.respuesta_correcta,
    eliminated: false
  }));

  return {
    item,
    question: item.pregunta,
    options,
    hintsHighlighted: false,
    eliminatedCount: 0
  };
}

function createTaller041aController(motor, config = {}) {
  const state = {
    optionsCount: config.optionsCount || 3,
    round: null,
    startMs: 0,
    attemptsInRound: 0
  };

  function nextRound() {
    state.round = generateRound(state.optionsCount);
    state.startMs = Date.now();
    state.attemptsInRound = 0;
    return state.round;
  }

  function applyFirstErrorSupport() {
    const wrongVisible = state.round.options.filter((o) => !o.isCorrect && !o.eliminated);
    if (wrongVisible.length > 0) {
      wrongVisible[0].eliminated = true;
      state.round.eliminatedCount += 1;
    }
    state.round.hintsHighlighted = true;
  }

  function clickOption(optionId) {
    const option = state.round.options.find((o) => o.id === optionId);
    if (!option || option.eliminated) return { ignore: true };

    state.attemptsInRound += 1;
    const responseMs = Date.now() - state.startMs;

    motor.registerAttempt({
      tallerId: "pri_2_obj_041a",
      itemId: state.round.item.id_item,
      question: state.round.question,
      selected: option.text,
      correctAnswer: state.round.item.respuesta_correcta,
      correct: option.isCorrect,
      responseMs,
      attemptInRound: state.attemptsInRound,
      ts: new Date().toISOString()
    });

    const feedback = motor.immediateFeedback(option.isCorrect);

    if (option.isCorrect) {
      return {
        correct: true,
        feedback,
        completed: true,
        round: state.round,
        session: motor.getSessionSummary()
      };
    }

    if (state.attemptsInRound === 1) {
      applyFirstErrorSupport();
    }

    return {
      correct: false,
      feedback,
      completed: false,
      supportApplied: state.attemptsInRound === 1,
      round: state.round,
      session: motor.getSessionSummary()
    };
  }

  return {
    nextRound,
    clickOption,
    getSessionSummary: () => motor.getSessionSummary()
  };
}

