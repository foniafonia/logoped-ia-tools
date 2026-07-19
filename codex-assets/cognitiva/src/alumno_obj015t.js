/* AUTOGENERADO OFFLINE: fusion de taller015t.js + alumno_obj015t.js */
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



const ui={repeatBtn:document.getElementById("repeatBtn"),optionsZone:document.getElementById("optionsZone"),face:document.getElementById("face"),pulse:document.getElementById("pulse")};
function speak(text){if(!window.speechSynthesis)return;const u=new SpeechSynthesisUtterance(text);u.lang="es-ES";u.rate=.65;u.pitch=1;window.speechSynthesis.cancel();window.speechSynthesis.speak(u);}
function fx(kind){ui.pulse.className="pulse";void ui.pulse.offsetWidth;if(kind==="ok"){ui.face.textContent="◕‿◕";ui.pulse.classList.add("ok");}else{ui.face.textContent="•ᴖ•";ui.pulse.classList.add("err");}setTimeout(()=>ui.face.textContent="•ᴗ•",420);}

const profileId = new URLSearchParams(window.location.search).get("alumno") || ("anonimo_" + Date.now());
const motor = new MotorGestion(profileId);
if (typeof motor.startSession === "function") motor.startSession();
const controller=createTaller015tController(motor,{optionsCount:3});
let round=controller.nextRound();

function renderRound(r){
  ui.optionsZone.innerHTML="";
  r.options.forEach(opt=>{
    const btn=document.createElement("button");
    btn.className="syllable-btn";btn.type="button";btn.textContent=opt.syllable;
    btn.addEventListener("click",()=>{
      const result=controller.clickOption(opt.id);if(result.ignore)return;
      console.log(result.feedback.message,result.session);
      if(result.correct){btn.classList.add("correct");fx("ok");setTimeout(()=>{round=controller.nextRound();renderRound(round);speak(round.targetSyllable);},700);} 
      else {
        btn.classList.add("error");fx("err");setTimeout(()=>btn.classList.remove("error"),260);
        if(result.treatment?.showSolution){const correctBtn=[...ui.optionsZone.querySelectorAll("button")].find(b=>b.textContent===round.targetSyllable);if(correctBtn){correctBtn.classList.add("correct");setTimeout(()=>correctBtn.classList.remove("correct"),380);}}
        if(result.treatment?.replayAudio){setTimeout(()=>speak(result.replaySyllable),230);}      
      }
    });
    ui.optionsZone.appendChild(btn);
  });
}

ui.repeatBtn.addEventListener("click",()=>speak(controller.replayModelAudio()));
renderRound(round);
speak(round.targetSyllable);

window.cognitivaObj015t={controller,motor,getSummary:()=>controller.getSessionSummary()};

const id_taller = "obj015t";
function persistSession(){
  localStorage.setItem(
    `cognitiva_sesion_${profileId}_${id_taller}`,
    JSON.stringify({ ...motor.getSessionSummary(), ts: new Date().toISOString() })
  );
}
window.addEventListener("pagehide", persistSession);
window.addEventListener("beforeunload", persistSession);
setInterval(persistSession, 2000);
