import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'] }).catch(()=>chromium.launch());
const p = await b.newPage({ viewport:{width:900,height:900} });
await p.goto('file:///home/user/logoped-ia-tools/mundo-ladrillos/dist-yeho/yehoshua-demo.html',{waitUntil:'load',timeout:20000});
await p.waitForFunction(()=>window.__ready===true,{timeout:15000});
await p.evaluate(()=>{ const h=document.getElementById('hud'); if(h) h.style.display='none'; const t=document.getElementById('tag'); if(t) t.style.display='none'; });
await p.evaluate(()=>{ if(window.__floor) window.__floor.visible=false; });
 await p.keyboard.press('w');           // quieto, brazos en reposo
await p.waitForTimeout(600);
await p.screenshot({path: process.argv[2] || 'mine-clean.png'});
await b.close(); console.log('ok');
