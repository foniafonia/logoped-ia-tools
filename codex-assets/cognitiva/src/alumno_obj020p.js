/* AUTOGENERADO OFFLINE: fusion de taller020p.js + alumno_obj020p.js */
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

const FRASE_ITEMS = [
  {
    id_item: "fr_001",
    frase_objetivo: ["EL", "SAPO", "SALTA"],
    texto: "EL SAPO SALTA",
    audio_text: "El sapo salta",
    imagen_url: null,
    imagen_placeholder: "🐸"
  },
  {
    id_item: "fr_002",
    frase_objetivo: ["LA", "MESA", "ROTA"],
    texto: "LA MESA ROTA",
    audio_text: "La mesa rota",
    imagen_url: null,
    imagen_placeholder: "🪑"
  },
  {
    id_item: "fr_003",
    frase_objetivo: ["EL", "PATO", "NADA"],
    texto: "EL PATO NADA",
    audio_text: "El pato nada",
    imagen_url: null,
    imagen_placeholder: "🦆"
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
      ? { type: "success", message: "Muy bien. ¡Frase correcta!" }
      : { type: "error", message: "Esa palabra no toca ahora." };
  }

  getSessionSummary() {
    const times = this.metrics.eventos.map((e) => e.responseMs);
    const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    return { ...this.metrics, tiempo_respuesta_promedio_ms: avg };
  }
}

function generateRound() {
  const item = pickOne(FRASE_ITEMS);
  const opciones = shuffle(item.frase_objetivo).map((word, idx) => ({
    id: `w_${idx + 1}`,
    word,
    used: false
  }));
  return {
    item,
    targetOrder: item.frase_objetivo,
    options: opciones,
    built: []
  };
}

function createTaller020pController(motor) {
  const state = {
    round: null,
    startMs: 0,
    nextExpectedIndex: 0
  };

  function nextRound() {
    state.round = generateRound();
    state.startMs = Date.now();
    state.nextExpectedIndex = 0;
    return state.round;
  }

  function replayFullSentence() {
    return state.round?.item.audio_text || "El sapo salta";
  }

  function getExpectedWord() {
    return state.round?.targetOrder[state.nextExpectedIndex] || "";
  }

  function clickWord(optionId) {
    const option = state.round.options.find((o) => o.id === optionId);
    if (!option || option.used) return { ignore: true };

    const expected = getExpectedWord();
    const responseMs = Date.now() - state.startMs;
    const isCorrect = option.word === expected;

    motor.registerAttempt({
      tallerId: "inf_3_obj_020p",
      itemId: state.round.item.id_item,
      selectedWord: option.word,
      correct: isCorrect,
      responseMs,
      stepIndex: state.nextExpectedIndex,
      ts: new Date().toISOString()
    });

    const feedback = motor.immediateFeedback(isCorrect);

    if (!isCorrect) {
      return {
        correct: false,
        feedback,
        expectedWord: expected,
        action: "shake",
        session: motor.getSessionSummary()
      };
    }

    option.used = true;
    state.round.built.push(option.word);
    state.nextExpectedIndex += 1;

    const completed = state.nextExpectedIndex >= state.round.targetOrder.length;
    return {
      correct: true,
      feedback,
      placedWord: option.word,
      completed,
      session: motor.getSessionSummary()
    };
  }

  return {
    nextRound,
    replayFullSentence,
    clickWord,
    getExpectedWord,
    getSessionSummary: () => motor.getSessionSummary()
  };
}



const ui={imageEl:document.getElementById("imageEl"),emojiEl:document.getElementById("emojiEl"),repeatBtn:document.getElementById("repeatBtn"),buildZone:document.getElementById("buildZone"),optionsZone:document.getElementById("optionsZone"),face:document.getElementById("face"),pulse:document.getElementById("pulse")};

function speak(text){if(!window.speechSynthesis)return;const u=new SpeechSynthesisUtterance(text);u.lang="es-ES";u.rate=.68;u.pitch=1;window.speechSynthesis.cancel();window.speechSynthesis.speak(u);}
function fx(kind){ui.pulse.className="pulse";void ui.pulse.offsetWidth;if(kind==="ok"){ui.face.textContent="◕‿◕";ui.pulse.classList.add("ok");}else{ui.face.textContent="•ᴖ•";ui.pulse.classList.add("err");}setTimeout(()=>ui.face.textContent="•ᴗ•",420);}

const profileId = new URLSearchParams(window.location.search).get("alumno") || ("anonimo_" + Date.now());
const id_taller = "obj020p";
const motor = new MotorGestion(profileId);
if (typeof motor.startSession === "function") motor.startSession();
const controller=createTaller020pController(motor);
let round=controller.nextRound();

function persistSession(){
  localStorage.setItem(
    `cognitiva_sesion_${profileId}_${id_taller}`,
    JSON.stringify({ ...motor.getSessionSummary(), ts: new Date().toISOString() })
  );
}

function renderSemantic(item){
  if(item.imagen_url){ui.imageEl.src=item.imagen_url;ui.imageEl.classList.remove("hidden");ui.emojiEl.classList.add("hidden");}
  else{ui.emojiEl.textContent=item.imagen_placeholder||"🖼️";ui.emojiEl.classList.remove("hidden");ui.imageEl.classList.add("hidden");}
}

function renderBuildZone(targetLength,built){
  ui.buildZone.innerHTML="";
  for(let i=0;i<targetLength;i+=1){
    if(i<built.length){const chip=document.createElement("div");chip.className="build-word";chip.textContent=built[i];ui.buildZone.appendChild(chip);} 
    else {const slot=document.createElement("div");slot.className="slot";slot.textContent="...";ui.buildZone.appendChild(slot);}    
  }
}

function renderRound(r){
  renderSemantic(r.item);
  renderBuildZone(r.targetOrder.length,r.built);
  ui.optionsZone.innerHTML="";

  r.options.forEach(opt=>{
    const currentRound = round;
    const btn=document.createElement("button");
    btn.className="word-btn";btn.type="button";btn.textContent=opt.word;
    if(opt.used){btn.classList.add("used");btn.disabled=true;}

    btn.addEventListener("click",()=>{
      const result=controller.clickWord(opt.id);if(result.ignore)return;
      console.log(result.feedback.message,result.session);

      if(result.correct){
        btn.classList.add("used");btn.disabled=true;
        renderBuildZone(currentRound.targetOrder.length,currentRound.built);
        if(result.completed){
          persistSession();
          fx("ok");
          setTimeout(()=>{round=controller.nextRound();renderRound(round);speak(round.item.audio_text);},900);
        }
      } else {
        btn.classList.add("shake");
        fx("err");
        setTimeout(()=>btn.classList.remove("shake"),300);
        speak(result.expectedWord);
        persistSession();
      }
    });

    ui.optionsZone.appendChild(btn);
  });
}

ui.repeatBtn.addEventListener("click",()=>speak(controller.replayFullSentence()));
renderRound(round);
speak(round.item.audio_text);

window.cognitivaObj020p={controller,motor,getSummary:()=>controller.getSessionSummary()};
window.addEventListener("pagehide", persistSession);
window.addEventListener("beforeunload", persistSession);
setInterval(persistSession, 2000);
