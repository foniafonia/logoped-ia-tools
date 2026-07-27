import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const root=path.resolve('dist'); const PORT=4198;
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json'};
const srv=http.createServer((q,r)=>{let f=path.join(root,q.url==='/'?'index.html':decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();}else{r.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});r.end(d);}});});
await new Promise(r=>srv.listen(PORT,r));
const errs=[];
const b=await chromium.launch({args:['--use-gl=swiftshader','--no-sandbox']});
const p=await b.newPage({viewport:{width:960,height:600}});
p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
p.on('pageerror',e=>errs.push('PE:'+e.message));
try{
  await p.goto(`http://localhost:${PORT}/`,{waitUntil:'load',timeout:30000});
  await p.waitForTimeout(1200); await p.mouse.click(480,300); await p.waitForTimeout(1200);
  await p.evaluate(()=>window.__finDelTramo&&window.__finDelTramo()); await p.waitForTimeout(700);
  await p.click('#goBtn'); await p.waitForTimeout(1800);
  const up=await p.evaluate(()=>!!window.__runnerReady);
  const probs=await p.evaluate(()=>window.__dryRunAll());
  console.log('runnerReady',up);
  console.log('DRYRUN problemas:',probs.length); probs.forEach(x=>console.log('  ',x));
}catch(e){errs.push('S:'+e.message);}
console.log('CONSOLE_ERR',errs.length); errs.slice(0,10).forEach(e=>console.log(' ',e));
await b.close(); srv.close(); console.log('DRYDONE');
