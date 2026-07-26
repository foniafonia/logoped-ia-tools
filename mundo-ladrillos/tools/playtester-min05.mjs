// JUGADOR SINTÉTICO / QA de niño para el tramo 5–10 (ver coordinacion/playtester.md).
// Juega las 8 escenas guiándose por __probe()/__walk()/__interact(). Mide
// completado, tiempo, atascos, alarma (sigilo) y capturas de lo que falla.
//
// IMPORTANTE: el bucle de juego corre DENTRO del navegador (una sola llamada
// evaluate por escena). Hacerlo por pasos con evaluate() individuales mete
// ~200ms de round-trip por tick y AHOGA al caminante (parece que no llega
// cuando en realidad sí llegaría). Esta versión es la fiable — reutilízala.
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
const OUT='/tmp/claude-0/-home-user-logoped-ia-tools/9b311647-96dd-5275-8cdc-1259d5c8ea31/scratchpad/';
const BASE='http://127.0.0.1:5178/src/scenes/min05/preview/index.html';
const b = await chromium.launch({ headless:true, args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--use-angle=swiftshader','--no-sandbox'] });
const p = await b.newPage({ viewport:{width:900,height:520}, isMobile:true, hasTouch:true });
const errs=[]; p.on('pageerror',e=>errs.push('PE:'+e.message.slice(0,120))); p.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text().slice(0,120))});
await p.goto(`${BASE}?scene=9&shot=1`,{waitUntil:'load',timeout:30000});
await p.waitForFunction(()=>window.__READY__&&window.__SCENE_READY__,{timeout:20000});

const log=[];
for (const n of [9,10,11,12,13,14,15,16]) {
  // Un niño "Eli ~8": anda hacia el objetivo, pulsa E cuando hay acción, y si se
  // queda clavado prueba a saltar / rodear un poco. Máx ~18s reales por escena.
  const r = await p.evaluate(async (n) => {
    window.__loadNumero(n);
    await new Promise(res=>setTimeout(res,400));
    const t0=performance.now();
    let done=false, maxAlarm=0, ePressed=0, sideTicks=0, lastProg=-1, flat=0;
    for (let i=0;i<800 && (performance.now()-t0)<18000;i++){
      const pr=window.__probe();
      maxAlarm=Math.max(maxAlarm, pr.alarm||0);
      if (pr.done){ done=true; break; }
      // pulsa E si hay acción anunciada O si ya estamos MUY cerca del objetivo
      const nearGoal = (pr.progress||0) > 0.82;
      if (pr.prompt || nearGoal){ window.__interact(); ePressed++; }
      // camina DIRECTO al objetivo; si el progreso se estanca, un sidestep breve
      // (time-boxed) para despegarse de una esquina, luego sigue directo.
      if (pr.goal){
        let [gx,gz]=pr.goal;
        if (flat>10){ // atascado de verdad: sidestep perpendicular corto + salto
          const perp = (sideTicks++ % 24 < 12) ? 1 : -1;
          gx += perp*3; window.__jump && window.__jump();
        }
        window.__walk(gx,gz,0.9);
      }
      // estancamiento del progreso
      const prog = pr.progress||0;
      if (prog <= lastProg+0.002) flat++; else flat=0;
      lastProg = prog;
      await new Promise(res=>setTimeout(res,25));
    }
    const pr=window.__probe();
    return { titulo:pr.titulo, done, seg:Math.round((performance.now()-t0)/100)/10,
      gems: pr.gems?`${pr.gems.got}/${pr.gems.total}`:'-', maxAlarma:+maxAlarm.toFixed(2),
      E:ePressed, atascado: flat>200, prog:+(pr.progress||0).toFixed(2), pos:pr.pos };
  }, n);
  if (!r.done) await p.screenshot({ path: `${OUT}pt-FAIL-${n}.png` });
  log.push({ escena:n, ...r });
}
writeFileSync(`${OUT}pt-min05.json`, JSON.stringify({log,errores:errs},null,2));
for (const r of log) console.log(`E${r.escena} ${r.done?'✅':'❌'} ${r.seg}s prog:${r.prog} gem:${r.gems} alarma:${r.maxAlarma} E:${r.E}${r.atascado?' ATASCADO':''} · ${r.titulo}`);
console.log('errores consola:', errs.length, errs.slice(0,6).join(' | '));
await b.close();
