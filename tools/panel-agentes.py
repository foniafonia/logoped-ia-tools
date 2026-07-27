#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🧠 PANEL DE MANDO EN VIVO — Mundo Ladrillos
Ve a todos los hilos/agentes trabajando en tiempo real y cómo se comunican por el tablón.

USO (en una carpeta con el repo clonado):
    python3 tools/panel-agentes.py
    -> abre http://localhost:8787  (se refresca solo cada 5 s)

Sin dependencias (solo Python 3). Hace `git fetch` cada pocos segundos y pinta el estado.
"""
import http.server, socketserver, subprocess, threading, time, html, os, sys

PORT = int(os.environ.get("PANEL_PORT", "8787"))
FETCH_EVERY = int(os.environ.get("PANEL_FETCH", "8"))   # segundos entre git fetch
REPO = os.environ.get("PANEL_REPO", os.getcwd())

# (rama, nombre corto, rol, emoji)
AGENTS = [
    ("segundo-cerebro-playtester-71kljp", "Segundo Cerebro", "Coordina a todos + playtester", "🧠"),
    ("pelicula-videojuego-primera-persona-kst6ip", "LEAD", "Campamento 0–5 + base del juego", "🫡"),
    ("min-05-10-jordan-spies-3kd08o", "5–10", "Los dos espías / Jordán", "🕵️"),
    ("min-10-15-rajav-jordan", "10–15", "La posada de Rahab", "🏠"),
    ("min-15-20-jerico-shofar", "15–20", "Cordón rojo y huida", "🧗"),
    ("munecos-ifepfa", "Muñequero", "Personajes y biblioteca", "🎭"),
    ("juego-completo-integrador-h6eyug", "Integrador", "Cose el juego completo", "🧩"),
]

def git(*args, timeout=25):
    try:
        return subprocess.run(["git", "-C", REPO, *args], capture_output=True,
                              text=True, timeout=timeout).stdout.strip()
    except Exception:
        return ""

def rel(ts):
    if not ts:
        return "—"
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

STATE = {"html": "<h1>Cargando…</h1>", "updated": 0}

def collect():
    git("fetch", "--all", "-q", timeout=40)
    now = time.strftime("%H:%M:%S")
    cards, feed = [], []
    for branch, name, role, emo in AGENTS:
        ref = f"origin/claude/{branch}"
        line = git("log", "-1", "--format=%ct\x1f%s", ref)
        ts, msg = ("", "(sin commits)")
        if "\x1f" in line:
            ts, msg = line.split("\x1f", 1)
        cnt = git("rev-list", "--count", f"--since=12.hours.ago", ref) or "0"
        color, lbl = status(ts)
        cards.append((emo, name, role, color, lbl, rel(ts), msg, cnt))
        # feed: últimos 6 commits de cada rama
        for c in git("log", "-6", "--format=%ct\x1f%s", ref).splitlines():
            if "\x1f" in c:
                t, m = c.split("\x1f", 1)
                feed.append((int(t), name, emo, m))
    feed.sort(key=lambda x: -x[0])
    STATE["html"] = render(cards, feed[:26], now)
    STATE["updated"] = time.time()

def render(cards, feed, now):
    card_html = ""
    for emo, name, role, color, lbl, ago, msg, cnt in cards:
        card_html += f"""
        <div class="card {color}">
          <div class="chead"><span class="emo">{emo}</span>
            <div><div class="cname">{html.escape(name)}</div><div class="crole">{html.escape(role)}</div></div>
            <span class="dot {color}"></span>
          </div>
          <div class="cmsg">{html.escape(msg[:90])}</div>
          <div class="cfoot"><span class="pill {color}">{lbl}</span>
            <span class="muted">{ago} · {cnt} commits/12h</span></div>
        </div>"""
    feed_html = ""
    for t, name, emo, m in feed:
        feed_html += f"""<div class="frow"><span class="fago">{rel(t)}</span>
            <span class="fwho">{emo} {html.escape(name)}</span>
            <span class="fmsg">{html.escape(m[:80])}</span></div>"""
    return f"""<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="refresh" content="5">
<title>Panel de mando · Mundo Ladrillos</title>
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{background:#0d1117;color:#e6edf3;font:15px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;padding:18px}}
.top{{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin-bottom:16px}}
h1{{font-size:22px;font-weight:800}} .live{{color:#f85149;font-weight:700;animation:blink 1.4s infinite}}
@keyframes blink{{50%{{opacity:.35}}}}
.muted{{color:#8b949e;font-size:12.5px}}
.wrap{{display:grid;grid-template-columns:1.35fr 1fr;gap:16px}} @media(max-width:820px){{.wrap{{grid-template-columns:1fr}}}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:12px}} @media(max-width:520px){{.grid{{grid-template-columns:1fr}}}}
.card{{background:#161b22;border:1px solid #21262d;border-left:4px solid #30363d;border-radius:12px;padding:12px 14px}}
.card.green{{border-left-color:#3fb950}} .card.amber{{border-left-color:#d29922}} .card.gray{{border-left-color:#484f58}}
.chead{{display:flex;align-items:center;gap:10px}} .emo{{font-size:22px}}
.cname{{font-weight:700}} .crole{{color:#8b949e;font-size:12px}}
.dot{{width:10px;height:10px;border-radius:50%;margin-left:auto}}
.dot.green{{background:#3fb950;box-shadow:0 0 8px #3fb950}} .dot.amber{{background:#d29922}} .dot.gray{{background:#484f58}}
.cmsg{{margin:9px 0;font-size:13.5px;color:#c9d1d9;min-height:2.6em}}
.cfoot{{display:flex;align-items:center;justify-content:space-between;gap:8px}}
.pill{{font-size:10.5px;font-weight:800;letter-spacing:.05em;padding:3px 7px;border-radius:6px}}
.pill.green{{background:#12331c;color:#3fb950}} .pill.amber{{background:#3a2d10;color:#d29922}} .pill.gray{{background:#21262d;color:#8b949e}}
.panel{{background:#161b22;border:1px solid #21262d;border-radius:12px;padding:14px;max-height:78vh;overflow:auto}}
.panel h2{{font-size:14px;margin-bottom:10px}}
.frow{{display:grid;grid-template-columns:74px 120px 1fr;gap:8px;padding:7px 0;border-bottom:1px solid #21262d;font-size:12.5px}}
.fago{{color:#8b949e}} .fwho{{font-weight:600}} .fmsg{{color:#c9d1d9}}
.intervene{{margin-top:16px;background:#12210f;border:1px solid #2ea04326;border-radius:12px;padding:12px 14px;font-size:13.5px}}
.intervene b{{color:#3fb950}}
</style></head><body>
<div class="top"><h1>🧠 Panel de mando · Mundo Ladrillos</h1>
  <span class="live">● EN DIRECTO</span>
  <span class="muted">actualizado {now} · se refresca solo cada 5 s</span></div>
<div class="wrap">
  <div><div class="grid">{card_html}</div>
    <div class="intervene">✍️ <b>Cómo intervenir:</b> escríbele al Segundo Cerebro una línea
      («diles a todos: X» / «pregunta al LEAD Y») y la reparte al tablón al instante — todos se enteran a la vez.</div>
  </div>
  <div class="panel"><h2>🔴 Actividad en directo (últimos movimientos)</h2>{feed_html}</div>
</div></body></html>"""

class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        body = STATE["html"].encode("utf-8")
        self.send_response(200); self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body))); self.end_headers()
        self.wfile.write(body)
    def log_message(self, *a): pass

def loop():
    while True:
        try: collect()
        except Exception as e: STATE["html"] = f"<h1>error</h1><pre>{html.escape(str(e))}</pre>"
        time.sleep(FETCH_EVERY)

if __name__ == "__main__":
    if not os.path.isdir(os.path.join(REPO, ".git")):
        print(f"⚠️  No veo un repo git en {REPO}. Ejecuta esto desde la carpeta del repo, "
              f"o pon PANEL_REPO=/ruta/al/repo", file=sys.stderr)
    threading.Thread(target=loop, daemon=True).start()
    time.sleep(1)
    print(f"🧠 Panel en vivo → http://localhost:{PORT}   (Ctrl+C para parar)")
    with socketserver.ThreadingTCPServer(("127.0.0.1", PORT), H) as httpd:
        try: httpd.serve_forever()
        except KeyboardInterrupt: print("\n👋 Panel parado.")
