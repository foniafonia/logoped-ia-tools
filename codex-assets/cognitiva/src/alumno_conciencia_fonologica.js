/* AUTOGENERADO OFFLINE: fusion de taller_conciencia_fonologica.js + alumno_conciencia_fonologica_obj008a.js */
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

const ITEMS = [
  {
    id_item: "cf_001",
    palabra: "TOMATE",
    audio_text: "tomate",
    silabas_original: ["TO", "MA", "TE"],
    silabas_objetivo_inverso: ["TE", "MA", "TO"]
  },
  {
    id_item: "cf_002",
    palabra: "CAMISA",
    audio_text: "camisa",
    silabas_original: ["CA", "MI", "SA"],
    silabas_objetivo_inverso: ["SA", "MI", "CA"]
  },
  {
    id_item: "cf_003",
    palabra: "PELOTA",
    audio_text: "pelota",
    silabas_original: ["PE", "LO", "TA"],
    silabas_objetivo_inverso: ["TA", "LO", "PE"]
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
      ? { type: "success", message: "Secuencia correcta" }
      : { type: "error", message: "Secuencia incorrecta" };
  }

  getSessionSummary() {
    const times = this.metrics.eventos.map((e) => e.responseMs);
    const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    return { ...this.metrics, tiempo_respuesta_promedio_ms: avg };
  }
}

function makeRound() {
  const item = pickOne(ITEMS);
  const options = shuffle(item.silabas_original).map((syl, idx) => ({
    id: `s_${idx + 1}`,
    syllable: syl
  }));

  return {
    item,
    options,
    built: [],
    expectedInverse: item.silabas_objetivo_inverso,
    stepIndex: 0,
    startMs: Date.now(),
    completed: false
  };
}

function createTallerConcienciaFonologicaController(motor) {
  const state = { round: null };

  function nextRound() {
    state.round = makeRound();
    return state.round;
  }

  function replayWordAudio() {
    return state.round?.item.audio_text || "tomate";
  }

  function expectedStartSyllable() {
    return state.round?.expectedInverse[0] || "TE";
  }

  function clickSyllable(syllableId) {
    const option = state.round.options.find((o) => o.id === syllableId);
    if (!option) return { ignore: true };

    const expected = state.round.expectedInverse[state.round.stepIndex];
    const correct = option.syllable === expected;
    const responseMs = Date.now() - state.round.startMs;

    motor.registerAttempt({
      tallerId: "pri_3_obj_008a",
      itemId: state.round.item.id_item,
      palabra: state.round.item.palabra,
      expected,
      selected: option.syllable,
      correct,
      stepIndex: state.round.stepIndex,
      responseMs,
      ts: new Date().toISOString()
    });

    const feedback = motor.immediateFeedback(correct);

    if (!correct) {
      state.round.built = [];
      state.round.stepIndex = 0;
      return {
        correct: false,
        feedback,
        action: "reset",
        hintStart: expectedStartSyllable(),
        round: state.round,
        session: motor.getSessionSummary()
      };
    }

    state.round.built.push(option.syllable);
    state.round.stepIndex += 1;
    const completed = state.round.stepIndex >= state.round.expectedInverse.length;
    state.round.completed = completed;

    return {
      correct: true,
      feedback,
      completed,
      builtWordInverse: state.round.built.join(""),
      round: state.round,
      session: motor.getSessionSummary()
    };
  }

  return {
    nextRound,
    clickSyllable,
    replayWordAudio,
    expectedStartSyllable,
    getSessionSummary: () => motor.getSessionSummary()
  };
}


const ui={wordLabel:document.getElementById('wordLabel'),replayBtn:document.getElementById('replayBtn'),buildBox:document.getElementById('buildBox'),optionsZone:document.getElementById('optionsZone'),dot:document.getElementById('dot')};
const profileId=new URLSearchParams(window.location.search).get('alumno')||('anonimo_'+Date.now());
const motor=new MotorGestion(profileId);if(typeof motor.startSession==='function')motor.startSession();
const controller=createTallerConcienciaFonologicaController(motor);let round=controller.nextRound();
function speak(t){if(!window.speechSynthesis)return;const u=new SpeechSynthesisUtterance(t);u.lang='es-ES';u.rate=.72;u.pitch=1;window.speechSynthesis.cancel();window.speechSynthesis.speak(u);} function dot(k){ui.dot.className='dot';if(k)ui.dot.classList.add(k);} 
function build(){ui.buildBox.innerHTML='';for(let i=0;i<round.expectedInverse.length;i++){if(i<round.built.length){const c=document.createElement('div');c.className='chip';c.textContent=round.built[i];ui.buildBox.appendChild(c);}else{const s=document.createElement('div');s.className='slot';s.textContent='...';ui.buildBox.appendChild(s);}}}
function opts(){ui.optionsZone.innerHTML='';round.options.forEach(o=>{const b=document.createElement('button');b.className='syl-btn';b.type='button';b.textContent=o.syllable;if(round.built.includes(o.syllable)){b.classList.add('used');b.disabled=true;}b.addEventListener('click',()=>{const res=controller.clickSyllable(o.id);if(res.ignore)return;console.log(res.feedback.message,res.session);if(res.correct){dot('ok');round=res.round;build();opts();if(res.completed)setTimeout(()=>{round=controller.nextRound();render();speak(round.item.audio_text);dot(null);},1000);}else{dot('err');ui.buildBox.classList.add('shake');ui.optionsZone.classList.add('shake');setTimeout(()=>{ui.buildBox.classList.remove('shake');ui.optionsZone.classList.remove('shake');},280);round=res.round;build();opts();speak(`Empieza por ${res.hintStart}`);}});ui.optionsZone.appendChild(b);});}
function render(){ui.wordLabel.textContent=`Escucha "${round.item.palabra}" y construye al revés`;build();opts();}
ui.replayBtn.addEventListener('click',()=>speak(controller.replayWordAudio()));render();speak(round.item.audio_text);window.cognitivaConcienciaFonologica={controller,motor,getSummary:()=>controller.getSessionSummary()};

const id_taller = "obj008a";
function persistSession(){
  localStorage.setItem(
    `cognitiva_sesion_${profileId}_${id_taller}`,
    JSON.stringify({ ...motor.getSessionSummary(), ts: new Date().toISOString() })
  );
}
window.addEventListener("pagehide", persistSession);
window.addEventListener("beforeunload", persistSession);
setInterval(persistSession, 2000);
