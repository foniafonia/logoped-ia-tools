import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const root=path.resolve('dist'); const PORT=4195;
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json'};
const srv=http.createServer((req,res)=>{let f=path.join(root,req.url==='/'?'index.html':decodeURIComponent(req.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);res.end();}else{res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});res.end(d);}});});
await new Promise(r=>srv.listen(PORT,r));
const errs=[];
const b=await chromium.launch({args:['--use-gl=swiftshader','--no-sandbox']});
const p=await b.newPage({viewport:{width:960,height:600}});
p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
p.on('pageerror',e=>errs.push('PE:'+e.message));
let vis=[],up=false;
try{
  await p.goto(`http://localhost:${PORT}/`,{waitUntil:'load',timeout:30000});
  await p.waitForTimeout(1200); await p.mouse.click(480,300); await p.waitForTimeout(1200);
  await p.evaluate(()=>window.__finDelTramo&&window.__finDelTramo()); await p.waitForTimeout(700);
  await p.click('#goBtn'); await p.waitForTimeout(1500);
  up=await p.evaluate(()=>!!window.__runnerReady);
  for(let i=0;i<40;i++){
    const pr=await p.evaluate(()=>window.__probe?window.__probe():null); if(!pr)break;
    vis.push(pr.numero);
    const more=await p.evaluate(()=>{const q=window.__probe();if(q.indice>=q.total-1)return false;window.__jump_next();return true;});
    await p.waitForTimeout(160); if(!more)break;
  }
}catch(e){errs.push('S:'+e.message);}
console.log('READY',up,'N',vis.length,'FIRST',vis[0],'LAST',vis[vis.length-1],'ERR',errs.length);
errs.slice(0,10).forEach(e=>console.log(' ',e));
await b.close(); srv.close();
console.log('QDONE');
