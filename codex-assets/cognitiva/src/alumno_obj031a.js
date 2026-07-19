/* AUTOGENERADO OFFLINE: fusion de taller031a.js + alumno_obj031a.js */
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

const TEXT_ITEMS = [
  {
    id_item: "cmp_001",
    titulo: "El coche de Ana",
    lineas: [
      "Ana tiene un coche rojo.",
      "Cada mañana va al colegio con su hermano.",
      "Después del cole, aparca el coche en casa."
    ],
    pregunta: "¿De que color es el coche de Ana?",
    opciones: ["Rojo", "Verde", "Azul"],
    respuesta_correcta: "Rojo",
    frase_clave: "Ana tiene un coche rojo."
  },
  {
    id_item: "cmp_002",
    titulo: "El perro de Luis",
    lineas: [
      "Luis tiene un perro pequeño que se llama Nico.",
      "Nico duerme en una cama azul junto a la ventana.",
      "Por la tarde, Luis juega a la pelota con Nico."
    ],
    pregunta: "¿Como se llama el perro de Luis?",
    opciones: ["Toby", "Nico", "Lolo"],
    respuesta_correcta: "Nico",
    frase_clave: "Luis tiene un perro pequeño que se llama Nico."
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
      ? { type: "success", message: "Respuesta correcta" }
      : { type: "error", message: "Revisa el texto" };
  }

  getSessionSummary() {
    const times = this.metrics.eventos.map((e) => e.responseMs);
    const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    return { ...this.metrics, tiempo_respuesta_promedio_ms: avg };
  }
}

function generateRound(optionsCount = 3) {
  const item = pickOne(TEXT_ITEMS);
  const options = shuffle(item.opciones).slice(0, optionsCount).map((text, idx) => ({
    id: `opt_${idx + 1}`,
    text,
    isCorrect: text === item.respuesta_correcta,
    eliminated: false
  }));

  return {
    item,
    question: item.pregunta,
    keySentence: item.frase_clave,
    options,
    highlightEnabled: false,
    eliminatedCount: 0
  };
}

function createTaller031aController(motor, config = {}) {
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
    state.round.highlightEnabled = true;
  }

  function clickOption(optionId) {
    const option = state.round.options.find((o) => o.id === optionId);
    if (!option || option.eliminated) return { ignore: true };

    state.attemptsInRound += 1;
    const responseMs = Date.now() - state.startMs;

    motor.registerAttempt({
      tallerId: "pri_1_obj_031a",
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
      round: state.round,
      supportApplied: state.attemptsInRound === 1,
      session: motor.getSessionSummary()
    };
  }

  return {
    nextRound,
    clickOption,
    getSessionSummary: () => motor.getSessionSummary()
  };
}


const ui={title:document.getElementById('titleEl'),text:document.getElementById('textEl'),question:document.getElementById('questionEl'),options:document.getElementById('optionsEl'),dot:document.getElementById('feedbackDot')};
const profileId=new URLSearchParams(window.location.search).get('alumno')||('anonimo_'+Date.now());
const motor=new MotorGestion(profileId);if(typeof motor.startSession==='function')motor.startSession();
const controller=createTaller031aController(motor,{optionsCount:3});let round=controller.nextRound();
function dot(k){ui.dot.className='dot';if(k)ui.dot.classList.add(k);} 
function renderText(item,h,key){ui.title.textContent=item.titulo;ui.text.innerHTML='';item.lineas.forEach(l=>{const p=document.createElement('p');p.className='text-line';p.textContent=l;if(h&&l===key)p.classList.add('highlight');ui.text.appendChild(p);});}
function render(r){renderText(r.item,r.highlightEnabled,r.keySentence);ui.question.textContent=r.question;ui.options.innerHTML='';r.options.forEach(opt=>{const b=document.createElement('button');b.className='opt-btn';b.type='button';b.textContent=opt.text;if(opt.eliminated){b.classList.add('eliminated');b.disabled=true;}b.addEventListener('click',()=>{const res=controller.clickOption(opt.id);if(res.ignore)return;console.log(res.feedback.message,res.session);if(res.correct){b.classList.add('correct');dot('ok');setTimeout(()=>{round=controller.nextRound();render(round);dot(null);},900);}else{b.classList.add('error');dot('err');setTimeout(()=>b.classList.remove('error'),260);round=res.round;render(round);}});ui.options.appendChild(b);});}
render(round);window.cognitivaObj031a={controller,motor,getSummary:()=>controller.getSessionSummary()};

const id_taller = "obj031a";
function persistSession(){
  localStorage.setItem(
    `cognitiva_sesion_${profileId}_${id_taller}`,
    JSON.stringify({ ...motor.getSessionSummary(), ts: new Date().toISOString() })
  );
}
window.addEventListener("pagehide", persistSession);
window.addEventListener("beforeunload", persistSession);
setInterval(persistSession, 2000);
