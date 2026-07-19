/* AUTOGENERADO OFFLINE: fusion de taller001a.js + alumno_obj001a.js */
const NON_SIMILAR_LETTERS = {
  a: ["t", "m", "n", "l", "k", "v", "x", "r"],
  e: ["t", "m", "n", "l", "k", "v", "x", "r"],
  o: ["t", "m", "n", "l", "k", "v", "x", "r"],
  b: ["a", "e", "o", "m", "n", "t", "x", "v"],
  d: ["a", "e", "o", "m", "n", "t", "x", "v"],
  p: ["a", "e", "o", "m", "n", "t", "x", "v"],
  q: ["a", "e", "o", "m", "n", "t", "x", "v"],
  m: ["a", "e", "o", "b", "d", "p", "q", "k"],
  n: ["a", "e", "o", "b", "d", "p", "q", "k"],
  t: ["a", "e", "o", "b", "d", "p", "q", "k"]
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

  isSessionExpired() {
    if (!this.sessionStart) return false;
    return Date.now() - this.sessionStart >= this.config.sessionMs;
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
      return { reduceDistractorsTo: Math.max(2, state.optionsCount - 2), showSolution: false };
    }
    return { reduceDistractorsTo: Math.max(1, state.optionsCount - 3), showSolution: true };
  }

  getSessionSummary() {
    const responseTimes = this.metrics.eventos.map((e) => e.responseMs);
    const avg = responseTimes.length
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;
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

function generateRound({ modelLetter, optionsCount = 6, correctCount = 2 }) {
  const distractorPool = NON_SIMILAR_LETTERS[modelLetter] || NON_SIMILAR_LETTERS.a;
  const distractorCount = Math.max(1, optionsCount - correctCount);
  const distractors = pickRandom(distractorPool, distractorCount);
  const corrects = Array.from({ length: correctCount }, () => modelLetter);
  const options = shuffle([...corrects, ...distractors]).map((letter, idx) => ({
    id: `opt_${idx + 1}`,
    letter,
    isCorrect: letter === modelLetter
  }));
  return { modelLetter, options };
}

function createTaller001aController(motor, config = {}) {
  const state = {
    modelLetter: config.modelLetter || "a",
    optionsCount: config.optionsCount || 6,
    correctCount: config.correctCount || 2,
    consecutiveErrors: 0,
    round: null,
    targetHits: 0,
    startMs: 0
  };

  function nextRound() {
    state.round = generateRound(state);
    state.targetHits = state.round.options.filter((o) => o.isCorrect).length;
    state.startMs = Date.now();
    return state.round;
  }

  function clickOption(optionId) {
    const option = state.round.options.find((o) => o.id === optionId);
    if (!option) return { error: "Opción no encontrada" };

    const responseMs = Date.now() - state.startMs;
    const event = {
      tallerId: "inf_1_obj_001a",
      modelLetter: state.modelLetter,
      selectedLetter: option.letter,
      correct: option.isCorrect,
      responseMs,
      ts: new Date().toISOString()
    };

    motor.registerAttempt(event);
    const feedback = motor.immediateFeedback(option.isCorrect);

    if (option.isCorrect) {
      state.targetHits -= 1;
      state.consecutiveErrors = 0;
      const completed = state.targetHits <= 0;
      return { feedback, correct: true, completed, session: motor.getSessionSummary() };
    }

    state.consecutiveErrors += 1;
    const treatment = motor.errorTreatment(state);
    state.optionsCount = Math.max(3, treatment.reduceDistractorsTo + state.correctCount);

    return {
      feedback,
      correct: false,
      treatment,
      completed: false,
      session: motor.getSessionSummary()
    };
  }

  return { nextRound, clickOption, getSessionSummary: () => motor.getSessionSummary() };
}


const ui={modelLetter:document.getElementById("modelLetter"),optionsZone:document.getElementById("optionsZone"),face:document.getElementById("face"),pulse:document.getElementById("pulse")};
const profileId=new URLSearchParams(window.location.search).get("alumno")||("anonimo_"+Date.now());
const motor=new MotorGestion(profileId);if(typeof motor.startSession==="function")motor.startSession();
const controller=createTaller001aController(motor,{modelLetter:"a",optionsCount:6,correctCount:2});let round=controller.nextRound();
function fx(k){ui.pulse.className="pulse";void ui.pulse.offsetWidth;if(k==="ok"){ui.face.textContent="◕‿◕";ui.pulse.classList.add("ok");}else{ui.face.textContent="•ᴖ•";ui.pulse.classList.add("err");}setTimeout(()=>{ui.face.textContent="•ᴗ•";ui.face.className="face neutral";},420);} 
function render(r){ui.modelLetter.textContent=r.modelLetter;ui.optionsZone.innerHTML="";r.options.forEach(opt=>{const b=document.createElement("button");b.className="letter-btn";b.type="button";b.textContent=opt.letter;b.addEventListener("click",()=>{const res=controller.clickOption(opt.id);if(res.ignore)return;console.log(res.feedback.message,res.session);if(res.correct){b.classList.add("correct-hit");b.disabled=true;fx("ok");if(res.completed)setTimeout(()=>{round=controller.nextRound();render(round);},700);}else{b.classList.add("soft-error");fx("err");setTimeout(()=>b.classList.remove("soft-error"),260);}});ui.optionsZone.appendChild(b);});}
render(round);window.cognitivaObj001a={controller,motor,getSummary:()=>controller.getSessionSummary()};

const id_taller = "obj001a";
function persistSession(){
  localStorage.setItem(
    `cognitiva_sesion_${profileId}_${id_taller}`,
    JSON.stringify({ ...motor.getSessionSummary(), ts: new Date().toISOString() })
  );
}
window.addEventListener("pagehide", persistSession);
window.addEventListener("beforeunload", persistSession);
setInterval(persistSession, 2000);
