#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🍯 PANEL COLMENA EN VIVO — Mundo Ladrillos
Colmena de hexágonos: cada celda es un hilo/agente. Pulsa una celda y ves la
CONVERSACIÓN con el cerebro (qué te dijo el hilo y cómo se le contestó), en vivo.

USO (en una carpeta con el repo clonado):
    python3 tools/panel-agentes.py
    -> abre http://localhost:8787

Solo Python 3, sin dependencias. Refresca datos cada pocos segundos sin recargar la página.
"""
import http.server, socketserver, subprocess, threading, time, json, os, sys, re

PORT = int(os.environ.get("PANEL_PORT", "8787"))
FETCH_EVERY = int(os.environ.get("PANEL_FETCH", "8"))
REPO = os.environ.get("PANEL_REPO", os.getcwd())

# id, rama, nombre, rol, emoji, aliases-para-"▶ PARA X", fichero-coord
AGENTS = [
    ("cerebro", "segundo-cerebro-playtester-71kljp", "Segundo Cerebro", "Coordina + playtester", "🧠", ["CEREBRO"], "segundo-cerebro.md"),
    ("lead", "pelicula-videojuego-primera-persona-kst6ip", "LEAD", "Campamento 0–5 + base", "🫡", ["LEAD"], "lead.md"),
    ("min05", "min-05-10-jordan-spies-3kd08o", "5–10", "Los dos espías / Jordán", "🕵️", ["5–10", "5-10", "MIN05", "MIN 05"], "min05-10.md"),
    ("min10", "min-10-15-rajav-jordan", "10–15", "La posada de Rahab", "🏠", ["10–15", "10-15", "MIN10"], "min10-15.md"),
    ("min15", "min-15-20-jerico-shofar", "15–20", "Cordón rojo y huida", "🧗", ["15–20", "15-20", "MIN15"], "min15-20.md"),
    ("muneco", "munecos-ifepfa", "Muñequero", "Personajes y biblioteca", "🎭", ["MUÑEQUERO", "MUNEQUERO"], "munequero.md"),
    ("integ", "juego-completo-integrador-h6eyug", "Integrador", "Cose el juego completo", "🧩", ["INTEGRADOR"], "integrador.md"),
]
CEREBRO_BRANCH = "segundo-cerebro-playtester-71kljp"

def git(*a, timeout=30):
    try:
        return subprocess.run(["git", "-C", REPO, *a], capture_output=True, text=True, timeout=timeout).stdout
    except Exception:
        return ""

def rel(ts):
    if not ts: return "—"
    d = int(time.time()) - int(ts)
    if d < 60: return f"hace {d}s"
    if d < 3600: return f"hace {d//60} min"
    if d < 86400: return f"hace {d//3600} h"
    return f"hace {d//86400} d"

def status(ts):
    if not ts: return ("gray", "sin datos")
    d = int(time.time()) - int(ts)
    if d < 15*60: return ("green", "ACTIVO")
    if d < 45*60: return ("amber", "EN PAUSA")
    return ("gray", "DORMIDO")

def md_sections(text):
    """Divide un markdown en (titulo, cuerpo) por cabeceras que empiezan con #."""
    out, cur_t, cur_b = [], None, []
    for ln in text.splitlines():
        if re.match(r'^#{1,4}\s', ln):
            if cur_t is not None:
                out.append((cur_t, "\n".join(cur_b).strip()))
            cur_t = re.sub(r'^#+\s*', '', ln).strip()
            cur_b = []
        else:
            cur_b.append(ln)
    if cur_t is not None:
        out.append((cur_t, "\n".join(cur_b).strip()))
    return out

def snippet(s, n=700):
    s = re.sub(r'\n{3,}', '\n\n', s).strip()
    return s if len(s) <= n else s[:n].rsplit(' ', 1)[0] + "…"

STATE = {"json": '{"agents":[],"feed":[],"updated":""}'}

def collect():
    git("fetch", "--all", "-q", timeout=45)
    now = time.strftime("%H:%M:%S")
    # tablón del cerebro (sus respuestas ▶ PARA X)
    cerebro_md = git("show", f"origin/claude/{CEREBRO_BRANCH}:mundo-ladrillos/coordinacion/segundo-cerebro.md")
    cerebro_secs = md_sections(cerebro_md)
    agents, feed = [], []
    for aid, branch, name, role, emo, aliases, coord in AGENTS:
        ref = f"origin/claude/{branch}"
        head = git("log", "-1", "--format=%ct\x1f%s", ref).strip()
        ts, msg = ("", "(sin commits)")
        if "\x1f" in head: ts, msg = head.split("\x1f", 1)
        cnt = (git("rev-list", "--count", "--since=12.hours.ago", ref).strip() or "0")
        color, lbl = status(ts)
        # RESPUESTAS del cerebro a este hilo (secciones "▶ PARA <alias>")
        answered = []
        for t, b in cerebro_secs:
            up = t.upper()
            if "PARA" in up and any(al.upper() in up for al in aliases) and aid != "cerebro":
                answered.append({"t": t, "b": snippet(b)})
        # LO QUE DIJO el hilo (secciones de su coord con CEREBRO/DUDA/RESPUESTA)
        said = []
        coord_md = git("show", f"{ref}:mundo-ladrillos/coordinacion/{coord}")
        for t, b in md_sections(coord_md):
            up = t.upper()
            if any(k in up for k in ("CEREBRO", "DUDA", "RESPUESTA A CEREBRO", "PARA CEREBRO", "INPUT AL CEREBRO")):
                said.append({"t": t, "b": snippet(b)})
        said = said[-6:]; answered = answered[-6:]
        agents.append({"id": aid, "emoji": emo, "name": name, "role": role, "color": color,
                       "label": lbl, "ago": rel(ts), "last": msg[:110], "commits": cnt,
                       "said": said, "answered": answered})
        for c in git("log", "-6", "--format=%ct\x1f%s", ref).splitlines():
            if "\x1f" in c:
                tt, mm = c.split("\x1f", 1)
                feed.append({"ts": int(tt), "who": name, "emoji": emo, "msg": mm[:90]})
    feed.sort(key=lambda x: -x["ts"])
    for f in feed: f["ago"] = rel(f.pop("ts"))
    STATE["json"] = json.dumps({"agents": agents, "feed": feed[:30], "updated": now}, ensure_ascii=False)

PAGE = r"""<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Colmena · Mundo Ladrillos</title>
<!--BAKED-->
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:radial-gradient(120% 80% at 50% -10%,#241a08,#0c0a06 60%);color:#f3ead6;
 font:15px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;min-height:100vh;padding:20px}
.top{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin-bottom:18px}
h1{font-size:23px;font-weight:800;letter-spacing:.2px}
.live{color:#ffb300;font-weight:800;animation:blink 1.4s infinite}@keyframes blink{50%{opacity:.4}}
.muted{color:#a89774;font-size:12.5px}
.wrap{display:grid;grid-template-columns:1.5fr 1fr;gap:20px}@media(max-width:900px){.wrap{grid-template-columns:1fr}}
/* colmena */
.hive{display:flex;flex-wrap:wrap;justify-content:center;padding-top:6px}
.hex{position:relative;width:150px;height:168px;margin:-22px 6px;cursor:pointer;transition:transform .15s;filter:drop-shadow(0 6px 14px rgba(0,0,0,.45))}
.hex:hover{transform:translateY(-4px) scale(1.03);z-index:3}
.hex.sel{transform:scale(1.06);z-index:4}
.hex .in{position:absolute;inset:0;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);
 background:linear-gradient(160deg,#3a2c12,#1c1608);border:0;display:flex;flex-direction:column;
 align-items:center;justify-content:center;text-align:center;padding:14px 12px}
.hex.green .in{background:linear-gradient(160deg,#2f4a1f,#16240f);box-shadow:inset 0 0 0 2px #6fd66f55}
.hex.amber .in{background:linear-gradient(160deg,#4d3a12,#241a08);box-shadow:inset 0 0 0 2px #ffb30055}
.hex.gray .in{background:linear-gradient(160deg,#2a2620,#141210);box-shadow:inset 0 0 0 2px #6b625355}
.hex.sel .in{outline:0;box-shadow:inset 0 0 0 3px #ffd54f}
.hex .emo{font-size:34px;line-height:1}
.hex .nm{font-weight:800;font-size:15px;margin-top:5px}
.hex .rl{font-size:10.5px;color:#cbb98f;margin-top:2px;max-width:120px}
.hex .st{margin-top:6px;font-size:9.5px;font-weight:800;letter-spacing:.06em;padding:2px 7px;border-radius:8px;background:#0003}
.hex.green .st{color:#8fe38f}.hex.amber .st{color:#ffce5a}.hex.gray .st{color:#a89774}
.hex .dot{position:absolute;top:34px;right:34px;width:10px;height:10px;border-radius:50%}
.hex.green .dot{background:#6fd66f;box-shadow:0 0 8px #6fd66f}.hex.amber .dot{background:#ffb300}.hex.gray .dot{background:#6b6253}
.panel{background:#17120a;border:1px solid #3a2c12;border-radius:14px;padding:16px;max-height:82vh;overflow:auto}
.panel h2{font-size:14px;margin-bottom:12px;color:#ffce5a}
.frow{display:grid;grid-template-columns:70px 108px 1fr;gap:8px;padding:7px 0;border-bottom:1px solid #2a2010;font-size:12.5px}
.fago{color:#a89774}.fwho{font-weight:700}.fmsg{color:#e3d6b6}
/* drawer conversacion */
.conv{margin-top:16px;background:#17120a;border:1px solid #3a2c12;border-radius:14px;padding:16px;display:none}
.conv.show{display:block}
.chead{display:flex;align-items:center;gap:10px;margin-bottom:12px}.chead .emo{font-size:26px}
.chead .x{margin-left:auto;cursor:pointer;color:#a89774;font-size:20px}
.bub{border-radius:12px;padding:10px 13px;margin:8px 0;font-size:13px;white-space:pre-wrap}
.bub .who{font-weight:800;font-size:11px;letter-spacing:.04em;margin-bottom:4px;text-transform:uppercase}
.bub.said{background:#241a08;border:1px solid #3a2c12;margin-right:32px}.bub.said .who{color:#ffce5a}
.bub.ans{background:#1b2a13;border:1px solid #2f4a1f;margin-left:32px}.bub.ans .who{color:#8fe38f}
.bub .tt{font-weight:700;color:#f3ead6;margin-bottom:4px}
.empty{color:#a89774;font-style:italic;padding:8px 0}
.hint{margin-top:14px;background:#1b2a13;border:1px solid #2f4a1f33;border-radius:12px;padding:11px 14px;font-size:13px}
.hint b{color:#8fe38f}
</style></head><body>
<div class="top"><h1>🍯 Colmena · Mundo Ladrillos</h1>
 <span class="live">● EN DIRECTO</span>
 <span class="muted" id="upd">cargando…</span>
 <span class="muted">· pulsa un hilo para ver su conversación</span></div>
<div class="wrap">
  <div>
    <div class="hive" id="hive"></div>
    <div class="conv" id="conv"></div>
    <div class="hint">✍️ <b>Cómo intervenir:</b> dile una línea al Segundo Cerebro
      («diles a todos: X» / «pregunta al LEAD Y») y la reparte al tablón al instante.</div>
  </div>
  <div class="panel"><h2>🔴 Actividad en directo</h2><div id="feed"></div></div>
</div>
<script>
let SEL=null, DATA={agents:[],feed:[]};
function esc(s){return (s||'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
function drawHive(){
  const h=document.getElementById('hive');
  h.innerHTML=DATA.agents.map(a=>`
    <div class="hex ${a.color} ${SEL===a.id?'sel':''}" onclick="sel('${a.id}')">
      <div class="in"><div class="emo">${a.emoji}</div><div class="nm">${esc(a.name)}</div>
        <div class="rl">${esc(a.role)}</div><div class="st">${a.label}</div></div>
      <div class="dot"></div></div>`).join('');
}
function drawFeed(){
  document.getElementById('feed').innerHTML=DATA.feed.map(f=>`
    <div class="frow"><span class="fago">${esc(f.ago)}</span>
      <span class="fwho">${f.emoji} ${esc(f.who)}</span>
      <span class="fmsg">${esc(f.msg)}</span></div>`).join('');
}
function drawConv(){
  const c=document.getElementById('conv');
  if(!SEL){c.classList.remove('show');return;}
  const a=DATA.agents.find(x=>x.id===SEL); if(!a){c.classList.remove('show');return;}
  const said=(a.said||[]).map(m=>`<div class="bub said"><div class="who">${a.emoji} ${esc(a.name)} dijo</div>
      <div class="tt">${esc(m.t)}</div>${esc(m.b)}</div>`).join('')||'<div class="empty">Sin dudas registradas.</div>';
  const ans=(a.answered||[]).map(m=>`<div class="bub ans"><div class="who">🧠 Cerebro respondió</div>
      <div class="tt">${esc(m.t)}</div>${esc(m.b)}</div>`).join('')||'<div class="empty">Aún no le he contestado nada específico.</div>';
  c.innerHTML=`<div class="chead"><span class="emo">${a.emoji}</span>
      <div><div style="font-weight:800">${esc(a.name)}</div>
      <div class="muted">${esc(a.role)} · ${a.label} · ${esc(a.ago)} · ${a.commits} commits/12h</div></div>
      <span class="x" onclick="sel(null)">✕</span></div>
    <div class="muted" style="margin-bottom:8px">Última acción: ${esc(a.last)}</div>
    ${said}${ans}`;
  c.classList.add('show');
}
function sel(id){SEL=(id===SEL?null:id);drawHive();drawConv();
  if(SEL)document.getElementById('conv').scrollIntoView({behavior:'smooth',block:'nearest'});}
async function tick(){
  try{const r=await fetch('/data.json',{cache:'no-store'});DATA=await r.json();
    document.getElementById('upd').textContent='actualizado '+DATA.updated;
    drawHive();drawFeed();drawConv();}catch(e){}
}
if(window.__PANEL_DATA__){DATA=window.__PANEL_DATA__;
  document.getElementById('upd').textContent='actualizado '+DATA.updated+' · se refresca solo cada minuto';
  drawHive();drawFeed();drawConv();}
else{tick();setInterval(tick,5000);}
</script></body></html>"""

class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/data.json"):
            body = STATE["json"].encode("utf-8"); ct = "application/json; charset=utf-8"
        else:
            body = PAGE.encode("utf-8"); ct = "text/html; charset=utf-8"
        self.send_response(200); self.send_header("Content-Type", ct)
        self.send_header("Content-Length", str(len(body))); self.end_headers()
        self.wfile.write(body)
    def log_message(self, *a): pass

def loop():
    while True:
        try: collect()
        except Exception as e: STATE["json"] = json.dumps({"agents":[],"feed":[],"updated":"error: "+str(e)})
        time.sleep(FETCH_EVERY)

def write_standalone(path):
    """Genera un HTML autónomo (datos dentro, sin servidor) para publicar/compartir."""
    collect()
    baked = f'<meta http-equiv="refresh" content="60"><script>window.__PANEL_DATA__={STATE["json"]};</script>'
    doc = PAGE.replace("<!--BAKED-->", baked)
    with open(path, "w", encoding="utf-8") as f:
        f.write(doc)
    print(f"HTML autónomo escrito en {path} ({len(doc)//1024} KB)")

if __name__ == "__main__":
    if "--html" in sys.argv:
        out = sys.argv[sys.argv.index("--html") + 1]
        write_standalone(out); sys.exit(0)
    if not os.path.isdir(os.path.join(REPO, ".git")):
        print(f"⚠️  No veo repo git en {REPO}. Ejecútalo desde la carpeta del repo o pon PANEL_REPO=/ruta.", file=sys.stderr)
    threading.Thread(target=loop, daemon=True).start()
    time.sleep(1)
    print(f"🍯 Colmena en vivo → http://localhost:{PORT}   (Ctrl+C para parar)")
    with socketserver.ThreadingTCPServer(("127.0.0.1", PORT), H) as httpd:
        try: httpd.serve_forever()
        except KeyboardInterrupt: print("\n👋 Panel parado.")
