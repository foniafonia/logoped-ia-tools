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
  constructor(profileId) {
    this.profileId = profileId;
    this.sessionStart = null;
    this.globalEvents = [];
    this.byTaller = {};
  }

  startSession() {
    this.sessionStart = Date.now();
  }

  registerAttempt(event) {
    this.globalEvents.push(event);
    if (!this.byTaller[event.tallerId]) {
      this.byTaller[event.tallerId] = { aciertos: 0, errores: 0, intentos: 0, tiempos: [] };
    }
    const bucket = this.byTaller[event.tallerId];
    bucket.intentos += 1;
    if (event.correct) bucket.aciertos += 1;
    else bucket.errores += 1;
    bucket.tiempos.push(event.responseMs);
  }

  buildInformeSesionAlumno(sequence) {
    const talleres = sequence.map((t) => {
      const m = this.byTaller[t.id_taller] || { aciertos: 0, errores: 0, intentos: 0, tiempos: [] };
      const avg = m.tiempos.length ? Math.round(m.tiempos.reduce((a, b) => a + b, 0) / m.tiempos.length) : 0;
      return {
        id_taller: t.id_taller,
        codigo: t.codigo,
        vocal: t.targetLetter,
        aciertos: m.aciertos,
        errores: m.errores,
        intentos: m.intentos,
        tiempo_promedio_ms: avg
      };
    });

    const totals = talleres.reduce(
      (acc, t) => {
        acc.aciertos += t.aciertos;
        acc.errores += t.errores;
        acc.intentos += t.intentos;
        return acc;
      },
      { aciertos: 0, errores: 0, intentos: 0 }
    );

    return {
      tipo: "Informe de Sesion del Alumno",
      profileId: this.profileId,
      fecha_iso: new Date().toISOString(),
      duracion_ms: this.sessionStart ? Date.now() - this.sessionStart : 0,
      resumen_total: totals,
      detalle_por_vocal: talleres,
      eventos: this.globalEvents
    };
  }
}

const TALLERES_VOCALES = [
  {
    id_taller: "inf_1_obj_006a_007a_012a",
    codigo: "1º INFANTIL obj.006a-007a-012a",
    nombre: "Asociación fonema-grafema 'a' en mayúscula",
    targetLetter: "A",
    targetPhoneme: "a",
    distractors: ["O", "I", "M", "P", "T", "L"]
  },
  {
    id_taller: "inf_1_obj_006c_007c_012c",
    codigo: "1º INFANTIL obj.006c-007c-012c",
    nombre: "Asociación fonema-grafema 'e' en mayúscula",
    targetLetter: "E",
    targetPhoneme: "e",
    distractors: ["M", "T", "U", "V", "X", "O"]
  },
  {
    id_taller: "inf_1_obj_006e_007e_012e",
    codigo: "1º INFANTIL obj.006e-007e-012e",
    nombre: "Asociación fonema-grafema 'i' en mayúscula",
    targetLetter: "I",
    targetPhoneme: "i",
    distractors: ["M", "O", "P", "U", "X", "C"]
  },
  {
    id_taller: "inf_1_obj_006g_007g_012g",
    codigo: "1º INFANTIL obj.006g-007g-012g",
    nombre: "Asociación fonema-grafema 'o' en mayúscula",
    targetLetter: "O",
    targetPhoneme: "o",
    distractors: ["I", "L", "T", "V", "X", "M"]
  },
  {
    id_taller: "inf_1_obj_006i_007i_012i",
    codigo: "1º INFANTIL obj.006i-007i-012i",
    nombre: "Asociación fonema-grafema 'u' en mayúscula",
    targetLetter: "U",
    targetPhoneme: "u",
    distractors: ["I", "L", "T", "X", "M", "P"]
  }
];

function createRound(taller, optionsCount = 3) {
  const distractors = pickRandom(taller.distractors, Math.max(1, optionsCount - 1));
  const options = shuffle([taller.targetLetter, ...distractors]).map((letter, idx) => ({
    id: `opt_${idx + 1}`,
    letter,
    isCorrect: letter === taller.targetLetter
  }));
  return { taller, options, startedAt: Date.now() };
}

function createCuadernoTutorController(motor, talleres = TALLERES_VOCALES, optionsCount = 3) {
  const state = {
    index: 0,
    optionsCount,
    consecutiveErrors: 0,
    currentRound: null,
    finished: false,
    finalReport: null
  };

  function getCurrentTaller() {
    return talleres[state.index];
  }

  function startOrNextRound() {
    if (state.index >= talleres.length) {
      state.finished = true;
      state.finalReport = motor.buildInformeSesionAlumno(talleres);
      return null;
    }
    state.currentRound = createRound(getCurrentTaller(), state.optionsCount);
    return state.currentRound;
  }

  function replayModelAudio() {
    return getCurrentTaller().targetPhoneme;
  }

  function clickOption(optionId) {
    const round = state.currentRound;
    const option = round.options.find((o) => o.id === optionId);
    if (!option) return { ignore: true };

    const responseMs = Date.now() - round.startedAt;
    const taller = getCurrentTaller();

    motor.registerAttempt({
      tallerId: taller.id_taller,
      codigo: taller.codigo,
      targetLetter: taller.targetLetter,
      selectedLetter: option.letter,
      correct: option.isCorrect,
      responseMs,
      ts: new Date().toISOString()
    });

    if (option.isCorrect) {
      state.consecutiveErrors = 0;
      state.optionsCount = 3;
      state.index += 1;
      const nextRound = startOrNextRound();
      return {
        correct: true,
        completedVocal: taller.targetLetter,
        nextRound,
        finished: state.finished,
        finalReport: state.finalReport
      };
    }

    state.consecutiveErrors += 1;
    const showSolution = state.consecutiveErrors >= 2;
    state.optionsCount = Math.max(2, state.optionsCount - 1);
    state.currentRound = createRound(getCurrentTaller(), state.optionsCount);

    return {
      correct: false,
      replayAudio: true,
      showSolution,
      nextRound: state.currentRound,
      finished: false
    };
  }

  return {
    startOrNextRound,
    replayModelAudio,
    clickOption,
    isFinished: () => state.finished,
    getFinalReport: () => state.finalReport,
    getSequence: () => talleres
  };
}

module.exports = {
  MotorGestion,
  TALLERES_VOCALES,
  createCuadernoTutorController,
  getPackItemSilabasS: () => ({
    id_taller: "inf_2_obj_015j",
    codigo: "2º INFANTIL obj.015j",
    nombre: "Adquisición de sílabas directas con fonema S en mayúscula",
    tipo: "silaba_directa_S",
    config: { optionsCount: 3 }
  }),
  getPackItemConsonantesNivel2: () => ([
    { id_taller: "inf_2_obj_015j", codigo: "2º INFANTIL obj.015j", nombre: "Sílabas directas S", tipo: "silaba_directa", consonante: "S", config: { optionsCount: 3 } },
    { id_taller: "inf_2_obj_015k", codigo: "2º INFANTIL obj.015k", nombre: "Sílabas directas M", tipo: "silaba_directa", consonante: "M", config: { optionsCount: 3 } },
    { id_taller: "inf_2_obj_015l", codigo: "2º INFANTIL obj.015l", nombre: "Sílabas directas L", tipo: "silaba_directa", consonante: "L", config: { optionsCount: 3 } },
    { id_taller: "inf_2_obj_015m", codigo: "2º INFANTIL obj.015m", nombre: "Sílabas directas P", tipo: "silaba_directa", consonante: "P", config: { optionsCount: 3 } },
    { id_taller: "inf_2_obj_015n", codigo: "2º INFANTIL obj.015n", nombre: "Sílabas directas D", tipo: "silaba_directa", consonante: "D", config: { optionsCount: 3 } },
    { id_taller: "inf_2_obj_015ñ", codigo: "2º INFANTIL obj.015ñ", nombre: "Sílabas directas N", tipo: "silaba_directa", consonante: "N", config: { optionsCount: 3 } },
    { id_taller: "inf_2_obj_015o", codigo: "2º INFANTIL obj.015o", nombre: "Sílabas directas T", tipo: "silaba_directa", consonante: "T", config: { optionsCount: 3 } },
    { id_taller: "inf_2_obj_015p", codigo: "2º INFANTIL obj.015p", nombre: "Sílabas directas F", tipo: "silaba_directa", consonante: "F", config: { optionsCount: 3 } },
    { id_taller: "inf_2_obj_015q", codigo: "2º INFANTIL obj.015q", nombre: "Sílabas directas Ñ", tipo: "silaba_directa", consonante: "Ñ", config: { optionsCount: 3 } },
    { id_taller: "inf_2_obj_015t", codigo: "2º INFANTIL obj.015t", nombre: "Sílabas inversas S", tipo: "silaba_inversa", consonante: "S", config: { optionsCount: 3 } }
  ]),
  getPackItemLexicoNivel2: () => ({
    id_taller: "inf_2_obj_017b",
    codigo: "2º INFANTIL obj.017b",
    nombre: "Léxico visual palabras con S en sílaba directa en mayúscula",
    tipo: "lexico_visual",
    config: { optionsCount: 3 }
  })
};
