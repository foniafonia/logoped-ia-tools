const TALLERES_VOCALES = [
  { id_taller: "inf_1_obj_006a_007a_012a", codigo: "1º INFANTIL obj.006a-007a-012a", targetLetter: "A", targetPhoneme: "a", distractors: ["O", "I", "M", "P", "T", "L"] },
  { id_taller: "inf_1_obj_006c_007c_012c", codigo: "1º INFANTIL obj.006c-007c-012c", targetLetter: "E", targetPhoneme: "e", distractors: ["M", "T", "U", "V", "X", "O"] },
  { id_taller: "inf_1_obj_006e_007e_012e", codigo: "1º INFANTIL obj.006e-007e-012e", targetLetter: "I", targetPhoneme: "i", distractors: ["M", "O", "P", "U", "X", "C"] },
  { id_taller: "inf_1_obj_006g_007g_012g", codigo: "1º INFANTIL obj.006g-007g-012g", targetLetter: "O", targetPhoneme: "o", distractors: ["I", "L", "T", "V", "X", "M"] },
  { id_taller: "inf_1_obj_006i_007i_012i", codigo: "1º INFANTIL obj.006i-007i-012i", targetLetter: "U", targetPhoneme: "u", distractors: ["I", "L", "T", "X", "M", "P"] }
];

function pickRandom(arr, count){const p=[...arr],o=[];while(p.length&&o.length<count){const i=Math.floor(Math.random()*p.length);o.push(p.splice(i,1)[0]);}return o;}
function shuffle(arr){const c=[...arr];for(let i=c.length-1;i>0;i-=1){const j=Math.floor(Math.random()*(i+1));[c[i],c[j]]=[c[j],c[i]];}return c;}

class MotorGestion {
  constructor(profileId){this.profileId=profileId;this.startAt=Date.now();this.events=[];this.byTaller={};}
  registerAttempt(e){this.events.push(e);if(!this.byTaller[e.tallerId])this.byTaller[e.tallerId]={aciertos:0,errores:0,intentos:0,tiempos:[]};const b=this.byTaller[e.tallerId];b.intentos+=1;e.correct?b.aciertos+=1:b.errores+=1;b.tiempos.push(e.responseMs);}
  informe(sequence){
    const detalle=sequence.map(t=>{const m=this.byTaller[t.id_taller]||{aciertos:0,errores:0,intentos:0,tiempos:[]};const avg=m.tiempos.length?Math.round(m.tiempos.reduce((a,b)=>a+b,0)/m.tiempos.length):0;return{id_taller:t.id_taller,codigo:t.codigo,vocal:t.targetLetter,aciertos:m.aciertos,errores:m.errores,intentos:m.intentos,tiempo_promedio_ms:avg};});
    const resumen=detalle.reduce((a,d)=>({aciertos:a.aciertos+d.aciertos,errores:a.errores+d.errores,intentos:a.intentos+d.intentos}),{aciertos:0,errores:0,intentos:0});
    return {tipo:"Informe de Sesion del Alumno",profileId:this.profileId,fecha_iso:new Date().toISOString(),duracion_ms:Date.now()-this.startAt,resumen_total:resumen,detalle_por_vocal:detalle,eventos:this.events};
  }
}

function createController(motor){
  const s={idx:0,opts:3,errors:0,round:null,final:null};
  const current=()=>TALLERES_VOCALES[s.idx];
  const mkRound=()=>{const t=current();const ds=pickRandom(t.distractors,Math.max(1,s.opts-1));s.round={taller:t,startedAt:Date.now(),options:shuffle([t.targetLetter,...ds]).map((l,i)=>({id:`opt_${i+1}`,letter:l,isCorrect:l===t.targetLetter}))};return s.round;};
  const start=()=>s.idx>=TALLERES_VOCALES.length?null:mkRound();
  const replay=()=>current().targetPhoneme;
  const click=(id)=>{const o=s.round.options.find(x=>x.id===id);if(!o)return{ignore:true};const t=current();motor.registerAttempt({tallerId:t.id_taller,codigo:t.codigo,targetLetter:t.targetLetter,selectedLetter:o.letter,correct:o.isCorrect,responseMs:Date.now()-s.round.startedAt,ts:new Date().toISOString()});if(o.isCorrect){s.errors=0;s.opts=3;s.idx+=1;if(s.idx>=TALLERES_VOCALES.length){s.final=motor.informe(TALLERES_VOCALES);return{correct:true,finished:true,report:s.final};}return{correct:true,finished:false,next:mkRound()};}s.errors+=1;s.opts=Math.max(2,s.opts-1);const showSolution=s.errors>=2;return{correct:false,finished:false,showSolution,replayAudio:true,next:mkRound()};};
  return {start,replay,click,currentIndex:()=>s.idx,sequenceSize:()=>TALLERES_VOCALES.length,getReport:()=>s.final};
}

const ui={step:document.getElementById("stepPill"),repeat:document.getElementById("repeatBtn"),options:document.getElementById("optionsZone"),face:document.getElementById("face"),pulse:document.getElementById("pulse"),finalBox:document.getElementById("finalBox"),report:document.getElementById("reportOut")};
const motor=new MotorGestion("alu_demo_001");
const ctrl=createController(motor);
let round=ctrl.start();

function speak(p){if(!window.speechSynthesis)return;const u=new SpeechSynthesisUtterance(p);u.lang="es-ES";u.rate=.65;u.pitch=1.05;window.speechSynthesis.cancel();window.speechSynthesis.speak(u);}
function fx(kind){ui.pulse.className="pulse";void ui.pulse.offsetWidth;if(kind==="ok"){ui.face.textContent="◕‿◕";ui.pulse.classList.add("ok");}else{ui.face.textContent="•ᴖ•";ui.pulse.classList.add("err");}setTimeout(()=>ui.face.textContent="•ᴗ•",420);}
function draw(r){ui.step.textContent=`Vocal ${ctrl.currentIndex()+1} de ${ctrl.sequenceSize()}`;ui.options.innerHTML="";r.options.forEach(opt=>{const b=document.createElement("button");b.className="letter-btn";b.type="button";b.textContent=opt.letter;b.addEventListener("click",()=>{const res=ctrl.click(opt.id);if(res.ignore)return;if(res.correct){b.classList.add("correct");fx("ok");if(res.finished){ui.finalBox.classList.remove("hidden");ui.report.textContent=JSON.stringify(res.report,null,2);window.informeSesionAlumno=res.report;console.log("Informe de Sesion del Alumno",res.report);return;}setTimeout(()=>{round=res.next;draw(round);speak(ctrl.replay());},700);}else{b.classList.add("error");fx("err");setTimeout(()=>b.classList.remove("error"),240);if(res.showSolution){const cb=[...ui.options.querySelectorAll("button")].find(x=>x.textContent===r.taller.targetLetter);if(cb){cb.classList.add("correct");setTimeout(()=>cb.classList.remove("correct"),380);}}round=res.next;setTimeout(()=>{draw(round);if(res.replayAudio)speak(ctrl.replay());},380);}});ui.options.appendChild(b);});}

ui.repeat.addEventListener("click",()=>speak(ctrl.replay()));
draw(round);
speak(ctrl.replay());
