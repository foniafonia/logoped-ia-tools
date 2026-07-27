import { chromium } from 'playwright';
import path from 'path';
const f='file://'+path.resolve('dist-single/index.html');
const errs=[];
const b=await chromium.launch({args:['--use-gl=swiftshader','--no-sandbox']});
const p=await b.newPage({viewport:{width:960,height:600}});
p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
p.on('pageerror',e=>errs.push('PE:'+e.message));
try{
  await p.goto(f,{waitUntil:'load',timeout:30000});
  await p.waitForTimeout(1500); await p.mouse.click(480,300); await p.waitForTimeout(1500);
  await p.evaluate(()=>window.__finDelTramo&&window.__finDelTramo()); await p.waitForTimeout(800);
  const hasGo=await p.evaluate(()=>!!document.querySelector('#goBtn'));
  if(hasGo)await p.click('#goBtn');
  await p.waitForTimeout(2000);
  const up=await p.evaluate(()=>!!window.__runnerReady);
  const probs=up?await p.evaluate(()=>window.__dryRunAll()):['runner no arrancó'];
  console.log('goBtn',hasGo,'runnerReady',up,'dryRunProblemas',probs.length);
  probs.slice(0,8).forEach(x=>console.log('  ',x));
}catch(e){errs.push('S:'+e.message);}
console.log('CONSOLE_ERR',errs.length); errs.slice(0,8).forEach(e=>console.log(' ',e));
await b.close(); console.log('SFDONE');
