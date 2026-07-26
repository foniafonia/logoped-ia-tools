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
    let done=false, maxAlarm=0, ePressed=0, stuck=0, lastD=1e9, wobble=0;
    let px=null, pz=null;
    for (let i=0;i<600 && (performance.now()-t0)<18000;i++){
      const pr=window.__probe();
      maxAlarm=Math.max(maxAlarm, pr.alarm||0);
      if (pr.done){ done=true; break; }
      // acción disponible → pulsar E
      if (pr.prompt){ window.__interact(); ePressed++; }
      // caminar hacia el objetivo (con pequeño rodeo si está atascado)
      if (pr.goal){
        let [gx,gz]=pr.goal;
        if (stuck>6){ // rodea: mete un desvío lateral y salta
          const a=(wobble++ *0.9); gx += Math.cos(a)*4; gz += Math.sin(a)*4;
          window.__jump && window.__jump();
        }
        window.__walk(gx,gz,0.9);
      }
      // ¿atascado? distancia al objetivo no baja
      const d = pr.progress!=null ? (1-pr.progress) : 0;
      if (d>=lastD-0.001) stuck++; else stuck=0;
      lastD=d;
      px=pr.pos[0]; pz=pr.pos[1];
      await new Promise(res=>setTimeout(res,25));
    }
    const pr=window.__probe();
    return { titulo:pr.titulo, done, seg:Math.round((performance.now()-t0)/100)/10,
      gems: pr.gems?`${pr.gems.got}/${pr.gems.total}`:'-', maxAlarma:+maxAlarm.toFixed(2),
      E:ePressed, atascado: stuck>60, prog:+(pr.progress||0).toFixed(2), pos:pr.pos };
  }, n);
  if (!r.done) await p.screenshot({ path: `${OUT}pt-FAIL-${n}.png` });
  log.push({ escena:n, ...r });
}
writeFileSync(`${OUT}pt-min05.json`, JSON.stringify({log,errores:errs},null,2));
for (const r of log) console.log(`E${r.escena} ${r.done?'✅':'❌'} ${r.seg}s prog:${r.prog} gem:${r.gems} alarma:${r.maxAlarma} E:${r.E}${r.atascado?' ATASCADO':''} · ${r.titulo}`);
console.log('errores consola:', errs.length, errs.slice(0,6).join(' | '));
await b.close();
