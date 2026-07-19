/* AUTOGENERADO OFFLINE: fusion de taller_lenguaje_abstracto.js + alumno_lenguaje_abstracto.js */
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
    id_item: "abs_001",
    frase: "Tirar la toalla",
    opciones: [
      { id: "a", texto: "Rendirse ante una situacion dificil", tipo: "correcta" },
      { id: "b", texto: "Lanzar una toalla al suelo al terminar de ducharse", tipo: "literal" },
      { id: "c", texto: "Estar muy cansado por no dormir", tipo: "abstracta_incorrecta" }
    ]
  },
  {
    id_item: "abs_002",
    frase: "Estar en las nubes",
    opciones: [
      { id: "a", texto: "Estar distraido y no prestar atencion", tipo: "correcta" },
      { id: "b", texto: "Volar por encima de una nube", tipo: "literal" },
      { id: "c", texto: "Tener miedo a las tormentas", tipo: "abstracta_incorrecta" }
    ]
  },
  {
    id_item: "abs_003",
    frase: "Romper el hielo",
    opciones: [
      { id: "a", texto: "Iniciar una conversacion para quitar la tension", tipo: "correcta" },
      { id: "b", texto: "Partir un bloque de hielo con la mano", tipo: "literal" },
      { id: "c", texto: "Enfadarse con un amigo por una discusion", tipo: "abstracta_incorrecta" }
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

  getSessionSummary() {
    const times = this.metrics.eventos.map((e) => e.responseMs);
    const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    return { ...this.metrics, tiempo_respuesta_promedio_ms: avg };
  }
}

function createTallerLenguajeAbstractoController(motor) {
  const state = { round: null, roundStartMs: 0, attemptsInRound: 0 };

  function nextRound() {
    const item = pickOne(ITEMS);
    state.round = { item, options: shuffle(item.opciones), completed: false, literalHintShown: false };
    state.roundStartMs = Date.now();
    state.attemptsInRound = 0;
    return state.round;
  }

  function selectOption(optionId) {
    const opt = state.round.options.find((o) => o.id === optionId);
    if (!opt || state.round.completed) return { ignore: true };

    state.attemptsInRound += 1;
    const correct = opt.tipo === "correcta";
    const responseMs = Date.now() - state.roundStartMs;

    motor.registerAttempt({
      tallerId: "pri_6_lenguaje_abstracto_001",
      itemId: state.round.item.id_item,
      frase: state.round.item.frase,
      selected: opt.texto,
      selectedType: opt.tipo,
      correct,
      attemptInRound: state.attemptsInRound,
      responseMs,
      ts: new Date().toISOString()
    });

    if (correct) {
      state.round.completed = true;
      return { correct: true, completed: true, session: motor.getSessionSummary() };
    }

    const literalTrap = opt.tipo === "literal";
    if (literalTrap) state.round.literalHintShown = true;

    return {
      correct: false,
      completed: false,
      literalTrap,
      showLiteralHelp: literalTrap,
      allowSecondAttempt: true,
      session: motor.getSessionSummary()
    };
  }

  return { nextRound, selectOption, getSessionSummary: () => motor.getSessionSummary() };
}


const ui={frase:document.getElementById('frase'),options:document.getElementById('options'),popup:document.getElementById('helpPopup'),dot:document.getElementById('dot')};
const profileId=new URLSearchParams(window.location.search).get('alumno')||('anonimo_'+Date.now());
const motor=new MotorGestion(profileId);if(typeof motor.startSession==='function')motor.startSession();
const controller=createTallerLenguajeAbstractoController(motor);let round=controller.nextRound();
const dot=(k)=>{ui.dot.className='dot';if(k)ui.dot.classList.add(k);};
function render(){ui.popup.classList.add('hidden');ui.frase.textContent=round.item.frase;ui.options.innerHTML='';round.options.forEach(o=>{const b=document.createElement('button');b.className='opt-btn';b.type='button';b.textContent=o.texto;b.addEventListener('click',()=>{const r=controller.selectOption(o.id);if(r.ignore)return;console.log(r.session);if(r.correct){b.classList.add('correct');dot('ok');setTimeout(()=>{round=controller.nextRound();render();dot(null);},1000);}else{b.classList.add('error','shake');dot('err');setTimeout(()=>b.classList.remove('shake'),280);if(r.showLiteralHelp)ui.popup.classList.remove('hidden');}});ui.options.appendChild(b);});}
render();window.cognitivaLenguajeAbstracto={controller,motor,getSummary:()=>controller.getSessionSummary()};

const id_taller = "lenguaje";
function persistSession(){
  localStorage.setItem(
    `cognitiva_sesion_${profileId}_${id_taller}`,
    JSON.stringify({ ...motor.getSessionSummary(), ts: new Date().toISOString() })
  );
}
window.addEventListener("pagehide", persistSession);
window.addEventListener("beforeunload", persistSession);
setInterval(persistSession, 2000);
