/* AUTOGENERADO OFFLINE: fusion de taller015j.js + alumno_obj015j.js */
const VOWELS = ["A", "E", "I", "O", "U"];
const TARGET_SYLLABLES = ["SA", "SE", "SI", "SO", "SU"];
const CONTRAST_CONSONANTS = ["M", "P", "T", "L"];

function pickRandom(arr, count) {
  const pool = [...arr];
  const out = [];
  while (pool.length && out.length < count) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

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
      return { reduceDistractorsTo: Math.max(1, state.optionsCount - 1), replayAudio: true, showSolution: false };
    }
    return { reduceDistractorsTo: 1, replayAudio: true, showSolution: true };
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

function buildDistractors(target) {
  const targetVowel = target.slice(1);
  const vowelDistractorVowels = VOWELS.filter((v) => v !== targetVowel);
  const vowelDistractor = `S${pickOne(vowelDistractorVowels)}`;

  const contrastConsonant = pickOne(CONTRAST_CONSONANTS);
  const contrastDistractor = `${contrastConsonant}${pickOne(VOWELS)}`;

  return [vowelDistractor, contrastDistractor];
}

function generateRound(optionsCount = 3) {
  const target = pickOne(TARGET_SYLLABLES);
  const baseDistractors = buildDistractors(target);

  let extraDistractors = [];
  if (optionsCount > 3) {
    const pool = TARGET_SYLLABLES.filter((s) => s !== target && !baseDistractors.includes(s));
    extraDistractors = pickRandom(pool, optionsCount - 3);
  }

  const options = shuffle([target, ...baseDistractors, ...extraDistractors]).map((syllable, idx) => ({
    id: `opt_${idx + 1}`,
    syllable,
    isCorrect: syllable === target
  }));

  return { targetSyllable: target, options };
}

function createTaller015jController(motor, config = {}) {
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
    return state.round?.targetSyllable || "SA";
  }

  function clickOption(optionId) {
    const option = state.round.options.find((o) => o.id === optionId);
    if (!option) return { ignore: true };

    const responseMs = Date.now() - state.startMs;
    const event = {
      tallerId: "inf_2_obj_015j",
      modelSyllable: state.round.targetSyllable,
      selectedSyllable: option.syllable,
      correct: option.isCorrect,
      responseMs,
      ts: new Date().toISOString()
    };

    motor.registerAttempt(event);
    const feedback = motor.immediateFeedback(option.isCorrect);

    if (option.isCorrect) {
      state.consecutiveErrors = 0;
      state.optionsCount = 3;
      return { correct: true, completed: true, feedback, session: motor.getSessionSummary(), option };
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
      session: motor.getSessionSummary(),
      option
    };
  }

  return {
    nextRound,
    replayModelAudio,
    clickOption,
    getSessionSummary: () => motor.getSessionSummary()
  };
}

function getCuadernoPackItemForS() {
  return {
    id_taller: "inf_2_obj_015j",
    codigo: "2º INFANTIL obj.015j",
    nombre: "Adquisición de sílabas directas con fonema S en mayúscula",
    tipo: "silaba_directa_S",
    config: { optionsCount: 3 }
  };
}


const ui={repeatBtn:document.getElementById("repeatBtn"),optionsZone:document.getElementById("optionsZone"),face:document.getElementById("face"),pulse:document.getElementById("pulse")};
const profileId=new URLSearchParams(window.location.search).get("alumno")||("anonimo_"+Date.now());
const motor=new MotorGestion(profileId);if(typeof motor.startSession==="function")motor.startSession();
const controller=createTaller015jController(motor,{optionsCount:3});let round=controller.nextRound();
function speak(t){if(!window.speechSynthesis)return;const u=new SpeechSynthesisUtterance(t);u.lang='es-ES';u.rate=.65;u.pitch=1;window.speechSynthesis.cancel();window.speechSynthesis.speak(u);} 
function fx(k){ui.pulse.className='pulse';void ui.pulse.offsetWidth;if(k==='ok'){ui.face.textContent='◕‿◕';ui.pulse.classList.add('ok');}else{ui.face.textContent='•ᴖ•';ui.pulse.classList.add('err');}setTimeout(()=>ui.face.textContent='•ᴗ•',420);} 
function render(r){ui.optionsZone.innerHTML='';r.options.forEach(opt=>{const b=document.createElement('button');b.className='syllable-btn';b.type='button';b.textContent=opt.syllable;b.addEventListener('click',()=>{const res=controller.clickOption(opt.id);if(res.ignore)return;console.log(res.feedback.message,res.session);if(res.correct){b.classList.add('correct');fx('ok');setTimeout(()=>{round=controller.nextRound();render(round);speak(round.targetSyllable);},700);}else{b.classList.add('error');fx('err');setTimeout(()=>b.classList.remove('error'),260);if(res.treatment?.replayAudio)setTimeout(()=>speak(res.replaySyllable),230);}});ui.optionsZone.appendChild(b);});}
ui.repeatBtn.addEventListener('click',()=>speak(controller.replayModelAudio()));render(round);speak(round.targetSyllable);window.cognitivaObj015j={controller,motor,getSummary:()=>controller.getSessionSummary()};

const id_taller = "obj015j";
function persistSession(){
  localStorage.setItem(
    `cognitiva_sesion_${profileId}_${id_taller}`,
    JSON.stringify({ ...motor.getSessionSummary(), ts: new Date().toISOString() })
  );
}
window.addEventListener("pagehide", persistSession);
window.addEventListener("beforeunload", persistSession);
setInterval(persistSession, 2000);
