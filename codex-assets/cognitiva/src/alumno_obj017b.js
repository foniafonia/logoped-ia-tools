/* AUTOGENERADO OFFLINE: fusion de taller017b.js + alumno_obj017b.js */
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

const LEXICON_ITEMS = [
  {
    id_item: "lex_sapo",
    palabra_objetivo: "SAPO",
    audio_text: "sapo",
    imagen_url: null,
    imagen_placeholder: "🐸",
    distractor_similitud_inicio: "SALA",
    distractor_contraste: "PATO"
  },
  {
    id_item: "lex_oso",
    palabra_objetivo: "OSO",
    audio_text: "oso",
    imagen_url: null,
    imagen_placeholder: "🐻",
    distractor_similitud_inicio: "OLA",
    distractor_contraste: "MESA"
  },
  {
    id_item: "lex_sopa",
    palabra_objetivo: "SOPA",
    audio_text: "sopa",
    imagen_url: null,
    imagen_placeholder: "🥣",
    distractor_similitud_inicio: "SOFA",
    distractor_contraste: "PATO"
  }
];

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
  const item = pickOne(LEXICON_ITEMS);
  const options = [
    item.palabra_objetivo,
    item.distractor_similitud_inicio,
    item.distractor_contraste
  ];

  const sliced = options.slice(0, optionsCount);
  const shuffled = shuffle(sliced).map((word, idx) => ({
    id: `opt_${idx + 1}`,
    word,
    isCorrect: word === item.palabra_objetivo
  }));

  return {
    item,
    targetWord: item.palabra_objetivo,
    audioText: item.audio_text,
    options: shuffled
  };
}

function createTaller017bController(motor, config = {}) {
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
    return state.round?.audioText || "sapo";
  }

  function clickOption(optionId) {
    const option = state.round.options.find((o) => o.id === optionId);
    if (!option) return { ignore: true };

    const responseMs = Date.now() - state.startMs;
    motor.registerAttempt({
      tallerId: "inf_2_obj_017b",
      itemId: state.round.item.id_item,
      targetWord: state.round.targetWord,
      selectedWord: option.word,
      correct: option.isCorrect,
      responseMs,
      ts: new Date().toISOString()
    });

    const feedback = motor.immediateFeedback(option.isCorrect);

    if (option.isCorrect) {
      state.consecutiveErrors = 0;
      state.optionsCount = 3;
      return { correct: true, feedback, completed: true, session: motor.getSessionSummary() };
    }

    state.consecutiveErrors += 1;
    const treatment = motor.errorTreatment(state);
    state.optionsCount = Math.max(2, treatment.reduceDistractorsTo + 1);

    return {
      correct: false,
      feedback,
      treatment,
      replayWord: replayModelAudio(),
      session: motor.getSessionSummary()
    };
  }

  return { nextRound, replayModelAudio, clickOption, getSessionSummary: () => motor.getSessionSummary() };
}

function getPackItemLexicoS() {
  return {
    id_taller: "inf_2_obj_017b",
    codigo: "2º INFANTIL obj.017b",
    nombre: "Léxico visual palabras con S en sílaba directa en mayúscula",
    tipo: "lexico_visual",
    config: { optionsCount: 3 }
  };
}


const ui={imageEl:document.getElementById('imageEl'),emojiEl:document.getElementById('emojiEl'),repeatBtn:document.getElementById('repeatBtn'),optionsZone:document.getElementById('optionsZone'),face:document.getElementById('face'),pulse:document.getElementById('pulse')};
const profileId=new URLSearchParams(window.location.search).get('alumno')||('anonimo_'+Date.now());
const motor=new MotorGestion(profileId);if(typeof motor.startSession==='function')motor.startSession();
const controller=createTaller017bController(motor,{optionsCount:3});let round=controller.nextRound();
function speak(t){if(!window.speechSynthesis)return;const u=new SpeechSynthesisUtterance(t);u.lang='es-ES';u.rate=.68;u.pitch=1;window.speechSynthesis.cancel();window.speechSynthesis.speak(u);} 
function fx(k){ui.pulse.className='pulse';void ui.pulse.offsetWidth;if(k==='ok'){ui.face.textContent='◕‿◕';ui.pulse.classList.add('ok');}else{ui.face.textContent='•ᴖ•';ui.pulse.classList.add('err');}setTimeout(()=>ui.face.textContent='•ᴗ•',420);} 
function semantic(i){if(i.imagen_url){ui.imageEl.src=i.imagen_url;ui.imageEl.classList.remove('hidden');ui.emojiEl.classList.add('hidden');}else{ui.emojiEl.textContent=i.imagen_placeholder||'🖼️';ui.emojiEl.classList.remove('hidden');ui.imageEl.classList.add('hidden');}}
function render(r){semantic(r.item);ui.optionsZone.innerHTML='';r.options.forEach(opt=>{const b=document.createElement('button');b.className='word-btn';b.type='button';b.textContent=opt.word;b.addEventListener('click',()=>{const res=controller.clickOption(opt.id);if(res.ignore)return;console.log(res.feedback.message,res.session);if(res.correct){b.classList.add('correct');fx('ok');setTimeout(()=>{round=controller.nextRound();render(round);speak(round.audioText);},800);}else{b.classList.add('error');fx('err');setTimeout(()=>b.classList.remove('error'),260);if(res.treatment?.replayAudio)setTimeout(()=>speak(res.replayWord),240);}});ui.optionsZone.appendChild(b);});}
ui.repeatBtn.addEventListener('click',()=>speak(controller.replayModelAudio()));render(round);speak(round.audioText);window.cognitivaObj017b={controller,motor,getSummary:()=>controller.getSessionSummary()};

const id_taller = "obj017b";
function persistSession(){
  localStorage.setItem(
    `cognitiva_sesion_${profileId}_${id_taller}`,
    JSON.stringify({ ...motor.getSessionSummary(), ts: new Date().toISOString() })
  );
}
window.addEventListener("pagehide", persistSession);
window.addEventListener("beforeunload", persistSession);
setInterval(persistSession, 2000);
