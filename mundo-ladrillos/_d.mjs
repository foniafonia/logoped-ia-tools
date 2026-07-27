import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const root=path.resolve('dist'); const PORT=4197;
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
  let guard=0;
  while(guard++<40){
    const pr=await p.evaluate(()=>window.__probe());
    process.stdout.write(`[${pr.indice}/${pr.total}] E${pr.numero} tipo=${pr.tipo}\n`);
    if(pr.indice>=pr.total-1)break;
    const before=pr.indice;
    await p.evaluate(()=>window.__jump_next());
    // esperar hasta que avance el índice (máx 6s)
    let adv=false;
    for(let w=0;w<24;w++){await p.waitForTimeout(280);const q=await p.evaluate(()=>window.__probe().indice);if(q>before){adv=true;break;}}
    if(!adv){process.stdout.write(`STALL en indice ${before} (E${pr.numero})\n`);break;}
  }
}catch(e){errs.push('S:'+e.message);}
console.log('ERR',errs.length); errs.slice(0,8).forEach(e=>console.log(' ',e));
await b.close(); srv.close(); console.log('DDONE');
