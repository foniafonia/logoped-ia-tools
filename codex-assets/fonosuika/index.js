// FonoSuika CARTOON — Matter.js physics + cartoon visual style
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
const rand = mulberry32(Date.now());
const { Engine, Render, Runner, MouseConstraint, Mouse, Composite, Bodies, Events } = Matter;

const GW = 620, GH = 960;
const WALL = 55, LOSE_Y = 90, STATUS_H = 60;
const PHYSICS = { friction: 0.18, frictionStatic: 0.9, frictionAir: 0.02, restitution: 0.02, slop: 0.01 };

// ── SÍLABAS ───────────────────────────────────────────────────────────────────
const SILS = [
  { t:"/p/",  col:"#FF4D4D", outline:"#CC0000", tc:"#fff",    r:18  },
  { t:"/b/",  col:"#FF6BB5", outline:"#CC3380", tc:"#fff",    r:24  },
  { t:"PA",   col:"#FF7B2F", outline:"#CC4400", tc:"#fff",    r:30  },
  { t:"PE",   col:"#FFB800", outline:"#CC8800", tc:"#fff",    r:38  },
  { t:"PI",   col:"#FFE500", outline:"#CCAA00", tc:"#333",    r:46  },
  { t:"MA",   col:"#7BDB4F", outline:"#3A8F00", tc:"#fff",    r:55  },
  { t:"PO",   col:"#00CC88", outline:"#007755", tc:"#fff",    r:64  },
  { t:"PU",   col:"#00BBFF", outline:"#0077CC", tc:"#fff",    r:74  },
  { t:"PLA",  col:"#6655FF", outline:"#3300CC", tc:"#fff",    r:86  },
  { t:"PRE",  col:"#CC44FF", outline:"#8800CC", tc:"#fff",    r:100 },
  { t:"PATO", col:"#FF3388", outline:"#AA0055", tc:"#fff",    r:118 },
];

// ── CARTOON BALL TEXTURE ──────────────────────────────────────────────────────
function makeTex(sil) {
  const r = sil.r * 1.8, sz = r * 2;
  const cv = document.createElement("canvas"); cv.width = sz; cv.height = sz;
  const c = cv.getContext("2d");

  // Drop shadow
  c.shadowColor = "rgba(0,0,0,0.45)";
  c.shadowBlur = r * 0.18;
  c.shadowOffsetX = r * 0.06;
  c.shadowOffsetY = r * 0.1;

  c.shadowBlur = 0; c.shadowOffsetX = 0; c.shadowOffsetY = 0;

  // Main color fill with radial gradient — no outer black ring
  const grad = c.createRadialGradient(r * 0.65, r * 0.55, r * 0.05, r, r, r * 0.85);
  grad.addColorStop(0, lighten(sil.col, 70));
  grad.addColorStop(0.45, sil.col);
  grad.addColorStop(1, sil.outline);
  c.beginPath(); c.arc(r, r, r * 0.82, 0, Math.PI * 2);
  c.fillStyle = grad; c.fill();

  // No outline ring — prevents visual bleed outside physics body

  // Big glossy highlight (cartoon style)
  const shine = c.createRadialGradient(r * 0.58, r * 0.45, 0, r * 0.58, r * 0.45, r * 0.38);
  shine.addColorStop(0, "rgba(255,255,255,0.88)");
  shine.addColorStop(0.5, "rgba(255,255,255,0.3)");
  shine.addColorStop(1, "rgba(255,255,255,0)");
  c.beginPath(); c.ellipse(r * 0.6, r * 0.48, r * 0.34, r * 0.22, -0.4, 0, Math.PI * 2);
  c.fillStyle = shine; c.fill();

  // Small secondary highlight
  c.beginPath(); c.ellipse(r * 0.75, r * 0.3, r * 0.1, r * 0.06, -0.3, 0, Math.PI * 2);
  c.fillStyle = "rgba(255,255,255,0.7)"; c.fill();

  // Text with black outline (cartoon style)
  const fs = r * (sil.t.length > 3 ? 0.46 : sil.t.length > 2 ? 0.56 : 0.68);
  c.font = `900 ${Math.round(fs)}px "Arial Rounded MT Bold", Arial, sans-serif`;
  c.textAlign = "center"; c.textBaseline = "middle";
  // Black stroke for text outline
  c.strokeStyle = "#111";
  c.lineWidth = r * 0.06;
  c.lineJoin = "round";
  c.strokeText(sil.t, r, r + r * 0.04);
  // White/colored fill
  c.fillStyle = sil.tc;
  c.fillText(sil.t, r, r + r * 0.04);

  return cv.toDataURL();
}

function lighten(hex, a) {
  return `rgb(${Math.min(255,parseInt(hex.slice(1,3),16)+a)},${Math.min(255,parseInt(hex.slice(3,5),16)+a)},${Math.min(255,parseInt(hex.slice(5,7),16)+a)})`;
}

const TEXS = SILS.map(makeTex);

// ── POP TEXTURE (cartoon explosion) ──────────────────────────────────────────
function makePopTex() {
  const sz = 320;
  const cv = document.createElement("canvas"); cv.width = sz; cv.height = sz;
  const c = cv.getContext("2d");
  const cx = sz/2, cy = sz/2;
  // Star burst
  const points = 12;
  c.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI/2;
    const r = i % 2 === 0 ? sz * 0.46 : sz * 0.22;
    i === 0 ? c.moveTo(cx + r*Math.cos(angle), cy + r*Math.sin(angle))
            : c.lineTo(cx + r*Math.cos(angle), cy + r*Math.sin(angle));
  }
  c.closePath();
  const g = c.createRadialGradient(cx,cy,0,cx,cy,sz*0.46);
  g.addColorStop(0,"rgba(255,255,100,0.95)");
  g.addColorStop(0.4,"rgba(255,180,0,0.8)");
  g.addColorStop(1,"rgba(255,100,0,0)");
  c.fillStyle = g; c.fill();
  return cv.toDataURL();
}
const POP_TEX = makePopTex();

// ── CARTOON BACKGROUND ────────────────────────────────────────────────────────
function makeBackground() {
  const cv = document.createElement("canvas"); cv.width = GW; cv.height = GH;
  const c = cv.getContext("2d");

  // Sky gradient
  const sky = c.createLinearGradient(0, 0, 0, GH * 0.7);
  sky.addColorStop(0, "#87CEEB");
  sky.addColorStop(1, "#C8E8FF");
  c.fillStyle = sky; c.fillRect(0, 0, GW, GH);

  // Clouds
  function cloud(x, y, scale) {
    c.fillStyle = "rgba(255,255,255,0.9)";
    c.strokeStyle = "#ccc"; c.lineWidth = 2;
    const circles = [[0,0,40],[35,-15,32],[70,0,38],[105,-10,28],[50,10,30]];
    for (const [cx2,cy2,r] of circles) {
      c.beginPath(); c.arc(x+cx2*scale, y+cy2*scale, r*scale, 0, Math.PI*2);
      c.fill(); c.stroke();
    }
  }
  cloud(30, 80, 0.8); cloud(260, 50, 1.1); cloud(420, 100, 0.7);

  // Ground / jar area
  const ground = c.createLinearGradient(0, GH*0.72, 0, GH);
  ground.addColorStop(0, "#E8F4FF");
  ground.addColorStop(1, "#D0E8FF");
  c.fillStyle = ground; c.fillRect(0, GH * 0.72, GW, GH * 0.28);

  // Grass strip
  c.fillStyle = "#5DC85D";
  c.fillRect(0, GH * 0.72, GW, 12);
  c.fillStyle = "#3DA03D";
  c.fillRect(0, GH * 0.72 + 10, GW, 4);

  return cv.toDataURL();
}
const BG_TEX = makeBackground();

// ── JAR / CONTAINER WALLS ────────────────────────────────────────────────────
function makeWallTex(w, h) {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const c = cv.getContext("2d");
  const g = c.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, "#4488FF");
  g.addColorStop(0.3, "#66AAFF");
  g.addColorStop(0.7, "#66AAFF");
  g.addColorStop(1, "#4488FF");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  // Cartoon outline
  c.strokeStyle = "#2255CC"; c.lineWidth = 4;
  c.strokeRect(2, 2, w-4, h-4);
  // Shine
  c.fillStyle = "rgba(255,255,255,0.25)";
  c.fillRect(4, 4, w*0.3, h-8);
  return cv.toDataURL();
}

// ── MENU ──────────────────────────────────────────────────────────────────────
function makeMenuBg() {
  const cv = document.createElement("canvas"); cv.width = GW; cv.height = GH;
  const c = cv.getContext("2d");

  // Background
  const bg = c.createLinearGradient(0, 0, 0, GH);
  bg.addColorStop(0, "#1A0050"); bg.addColorStop(1, "#0A0030");
  c.fillStyle = bg; c.fillRect(0, 0, GW, GH);

  // Stars
  c.fillStyle = "rgba(255,255,255,0.8)";
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * GW, y = Math.random() * GH * 0.6;
    const r = Math.random() * 2 + 0.5;
    c.beginPath(); c.arc(x, y, r, 0, Math.PI*2); c.fill();
  }

  // Title panel
  c.fillStyle = "rgba(0,0,0,0.5)";
  c.beginPath(); c.roundRect(40, 60, GW-80, 200, 24); c.fill();
  c.strokeStyle = "#FFD700"; c.lineWidth = 5;
  c.beginPath(); c.roundRect(40, 60, GW-80, 200, 24); c.stroke();

  // Title
  c.font = '900 72px "Arial Rounded MT Bold", Arial';
  c.textAlign = "center"; c.textBaseline = "middle";
  // Outline
  c.strokeStyle = "#000"; c.lineWidth = 8; c.lineJoin = "round";
  c.strokeText("FonoSuika", GW/2, 145);
  // Fill gradient
  const tg = c.createLinearGradient(0, 100, 0, 190);
  tg.addColorStop(0, "#FFD700"); tg.addColorStop(1, "#FF8800");
  c.fillStyle = tg; c.fillText("FonoSuika", GW/2, 145);

  // Subtitle
  c.font = 'bold 22px Arial';
  c.strokeStyle = "#000"; c.lineWidth = 4;
  c.strokeText("Fonemas · Sílabas · Palabras", GW/2, 215);
  c.fillStyle = "#fff"; c.fillText("Fonemas · Sílabas · Palabras", GW/2, 215);

  return cv.toDataURL();
}

function makeStartBtn() {
  const w = 400, h = 100;
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const c = cv.getContext("2d");

  // Shadow
  c.fillStyle = "rgba(0,0,0,0.35)";
  c.beginPath(); c.roundRect(8, 12, w-16, h-16, 20); c.fill();

  // Button body
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#FFE500"); g.addColorStop(0.5, "#FFB800"); g.addColorStop(1, "#FF8800");
  c.beginPath(); c.roundRect(4, 4, w-8, h-16, 18); c.fillStyle = g; c.fill();

  // Outline
  c.strokeStyle = "#CC5500"; c.lineWidth = 5;
  c.beginPath(); c.roundRect(4, 4, w-8, h-16, 18); c.stroke();

  // Shine
  c.fillStyle = "rgba(255,255,255,0.35)";
  c.beginPath(); c.roundRect(10, 8, w-20, (h-20)*0.45, 12); c.fill();

  // Text
  c.font = '900 42px "Arial Rounded MT Bold", Arial';
  c.textAlign = "center"; c.textBaseline = "middle";
  c.strokeStyle = "#883300"; c.lineWidth = 6; c.lineJoin = "round";
  c.strokeText("¡JUGAR!", w/2, h/2 - 4);
  c.fillStyle = "#fff"; c.fillText("¡JUGAR!", w/2, h/2 - 4);

  return cv.toDataURL();
}

const MENU_BG_TEX = makeMenuBg();
const START_BTN_TEX = makeStartBtn();

// ── ENGINE ────────────────────────────────────────────────────────────────────
const engine = Engine.create({ positionIterations: 30, velocityIterations: 16, constraintIterations: 6 });
engine.timing.timeScale = 1;

const runner  = Runner.create();

const container = document.getElementById("game-canvas");

const render = Render.create({
  element: container,
  engine,
  options: {
    width: GW, height: GH,
    wireframes: false,
    background: "transparent",
  }
});

// Set canvas background to image
render.canvas.style.backgroundImage = `url(${BG_TEX})`;
render.canvas.style.backgroundSize = "100% 100%";

// ── STATE ─────────────────────────────────────────────────────────────────────
const ST = { MENU:0, READY:1, DROP:2, LOSE:3 };
let state = ST.MENU;
let score = 0;
let best  = parseInt(localStorage.getItem("fono-best") || "0");
let curIdx = 0, nextIdx = 0;
let previewBody = null;
let comboCount = 0, comboTimer = null;

const ui          = document.getElementById("game-ui");
const scoreEl     = document.getElementById("game-score");
const bestEl      = document.getElementById("game-highscore-value");
const nextImg     = document.getElementById("game-next-fruit");
const voiceToggle = document.getElementById("voice-toggle");
const comboEl     = document.getElementById("combo-overlay");
const endEl       = document.getElementById("game-end-container");
const endTitleEl  = document.getElementById("game-end-title");

// ── RESIZE ────────────────────────────────────────────────────────────────────
function resize() {
  const sw = window.innerWidth, sh = window.innerHeight;
  const scale = Math.min(sw / GW, sh / GH);
  const cw = GW * scale, ch = GH * scale;
  const left = (sw - cw) / 2, top = (sh - ch) / 2;

  render.canvas.style.cssText = `width:${cw}px;height:${ch}px;position:absolute;left:${left}px;top:${top}px;border-radius:12px;`;
  ui.style.cssText = `position:absolute;width:${GW}px;height:${GH}px;left:${left}px;top:${top}px;transform:scale(${scale});transform-origin:top left;pointer-events:none;user-select:none;`;
}
window.addEventListener("resize", resize);

// ── HELPERS ───────────────────────────────────────────────────────────────────
function makeBall(x, y, idx, extra={}) {
  const s = SILS[idx];
  const b = Bodies.circle(x, y, s.r, {
    ...PHYSICS, ...extra,
    render: { sprite: { texture: TEXS[idx], xScale: 0.82, yScale: 0.82 } }
  });
  b.sidx = idx; b.popped = false;
  return b;
}

function pickNext() { return Math.floor(rand() * 7); }

function setNext(idx) {
  nextIdx = idx;
  nextImg.src = TEXS[idx];
  if (voiceEnabled) speakSyllable(idx, "Siguiente");
}

function updateScore(pts) {
  score += pts;
  if (score > best) { best = score; localStorage.setItem("fono-best", best); }
  scoreEl.textContent = score;
  bestEl.textContent  = best;
}

function clampX(idx, x) {
  const r = SILS[idx].r;
  return Math.max(WALL + r + 4, Math.min(GW - WALL - r - 4, x));
}

const SYLLABLE_SPEAK = ["pe","be","pa","pe","pi","ma","po","pu","pla","pre","pato"];
let voiceEnabled = true;
let speechVoice = null;

function pickSpeechVoice(voices) {
  if (!voices || !voices.length) return null;
  const esChild = voices.find(v => /^(es|ES)/.test(v.lang) && /female|ni[aá]na|woman|girl|maria|luc[ií]a|sofia|valen/i.test(v.name));
  const esFemale = voices.find(v => /^(es|ES)/.test(v.lang) && /female|woman|girl/i.test(v.name));
  const anyFemale = voices.find(v => /female|woman|girl/i.test(v.name));
  return esChild || esFemale || anyFemale || voices[0];
}

function updateVoiceList() {
  const voices = speechSynthesis.getVoices();
  const found = pickSpeechVoice(voices);
  if (found) speechVoice = found;
}

function speakText(text) {
  if (!voiceEnabled || typeof window.speechSynthesis === "undefined") return;
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  if (speechVoice) utter.voice = speechVoice;
  utter.lang = "es-ES";
  utter.pitch = 1.45;
  utter.rate = 0.95;
  utter.volume = 1;
  speechSynthesis.speak(utter);
}

function speakSyllable(idx, prefix = "") {
  if (idx == null || idx < 0 || idx >= SYLLABLE_SPEAK.length) return;
  const phrase = prefix ? `${prefix} ${SYLLABLE_SPEAK[idx]}` : SYLLABLE_SPEAK[idx];
  speakText(phrase);
}

speechSynthesis.onvoiceschanged = updateVoiceList;
updateVoiceList();

function showCombo(idx) {
  comboCount++;
  clearTimeout(comboTimer);
  comboTimer = setTimeout(() => { comboCount = 0; }, 1100);
  scoreEl.style.transform = "scale(1.15)";
  setTimeout(() => { scoreEl.style.transform = ""; }, 220);
  if (comboCount >= 2) {
    comboEl.textContent = comboCount >= 5 ? "🔥🔥 MEGA x" + comboCount :
                          comboCount >= 3 ? "⚡ COMBO x" + comboCount : "✨ x2";
    comboEl.style.fontSize = (comboCount >= 5 ? 80 : comboCount >= 3 ? 64 : 52) + "px";
    comboEl.style.opacity = "1";
    clearTimeout(comboEl._t);
    comboEl._t = setTimeout(() => { comboEl.style.opacity = "0"; }, 900);
  }
}

function addPop(x, y, r) {
  const sz = Math.max(r * 1.4, 40);
  const b = Bodies.circle(x, y, sz, {
    isStatic: true, collisionFilter: { mask: 0x0040 },
    render: { sprite: { texture: POP_TEX, xScale: sz/160, yScale: sz/160 } }
  });
  Composite.add(engine.world, b);
  setTimeout(() => Composite.remove(engine.world, b), 150);
}

// ── MENU BODIES ───────────────────────────────────────────────────────────────
const menuBodies = [
  // Full screen background
  Bodies.rectangle(GW/2, GH/2, GW, GH, {
    isStatic: true, collisionFilter: { mask: 0 },
    render: { sprite: { texture: MENU_BG_TEX, xScale: 1, yScale: 1 } }
  }),
  // Decorative balls in arc
  ...SILS.slice(0, 9).map((s, i) => {
    const ang = (Math.PI * i) / 8 + Math.PI * 0.1;
    const cx = GW/2 + 200 * Math.cos(ang);
    const cy = GH * 0.52 + 160 * Math.sin(ang);
    return Bodies.circle(cx, cy, Math.min(s.r, 50), {
      isStatic: true,
      render: { sprite: { texture: TEXS[i], xScale: Math.min(s.r, 50)/s.r, yScale: Math.min(s.r, 50)/s.r } }
    });
  }),
  // Start button
  Bodies.rectangle(GW/2, GH * 0.78, 400, 100, {
    isStatic: true, label: "btn-start",
    render: { sprite: { texture: START_BTN_TEX, xScale: 1, yScale: 1 } }
  }),
];

// ── WALLS ─────────────────────────────────────────────────────────────────────
const wallH = GH - LOSE_Y - STATUS_H;
const wallTex = makeWallTex(WALL, wallH);
const floorTex = makeWallTex(GW - WALL*2, STATUS_H);

const wallOpts = { isStatic: true, ...PHYSICS };
const gameBodies = [
  // Left wall
  Bodies.rectangle(WALL/2, LOSE_Y + wallH/2, WALL, wallH, {
    ...wallOpts,
    render: { sprite: { texture: wallTex, xScale: 1, yScale: 1 } }
  }),
  // Right wall
  Bodies.rectangle(GW - WALL/2, LOSE_Y + wallH/2, WALL, wallH, {
    ...wallOpts,
    render: { sprite: { texture: wallTex, xScale: 1, yScale: 1 } }
  }),
  // Floor
  Bodies.rectangle(GW/2, GH - STATUS_H/2, GW - WALL*2, STATUS_H, {
    ...wallOpts,
    render: { sprite: { texture: floorTex, xScale: 1, yScale: 1 } }
  }),
];

// ── MOUSE ─────────────────────────────────────────────────────────────────────
const mouse = Mouse.create(render.canvas);
const mc    = MouseConstraint.create(engine, {
  mouse, constraint: { stiffness: 0.2, render: { visible: false } }
});
render.mouse = mouse;

// ── GAME FLOW ─────────────────────────────────────────────────────────────────
function startMenu() {
  state = ST.MENU;
  ui.style.display = "none";
  endEl.style.display = "none";
  Composite.add(engine.world, menuBodies);

  const onMenuClick = () => {
    if (mc.body?.label !== "btn-start") return;
    Events.off(mc, "mousedown", onMenuClick);
    Composite.remove(engine.world, menuBodies);
    startGame();
  };
  Events.on(mc, "mousedown", onMenuClick);
}

function startGame() {
  score = 0; comboCount = 0;
  scoreEl.textContent = "0";
  endEl.style.display = "none";
  endTitleEl.textContent = "¡Fin del juego!";
  ui.style.display = "block";
  runner.enabled = true;

  // Set game background
  render.canvas.style.backgroundImage = `url(${BG_TEX})`;

  const all = Composite.allBodies(engine.world);
  for (const b of all) if (!b.isStatic) Composite.remove(engine.world, b);

  Composite.add(engine.world, gameBodies);

  curIdx = pickNext();
  setNext(pickNext());

  previewBody = makeBall(GW/2, LOSE_Y, curIdx, {
    isStatic: true, collisionFilter: { mask: 0x0040 }
  });
  Composite.add(engine.world, previewBody);
  if (voiceEnabled) speakSyllable(curIdx, "Prepara");
  setTimeout(() => { state = ST.READY; }, 300);

  Events.on(mc, "mousemove", function(e) {
    if (state !== ST.READY || !previewBody) return;
    Matter.Body.setPosition(previewBody, { x: clampX(curIdx, e.mouse.position.x), y: LOSE_Y });
  });

  Events.on(mc, "mouseup", function(e) {
    if (state !== ST.READY) return;
    drop(clampX(curIdx, e.mouse.position.x));
  });

  Events.on(engine, "collisionStart", function(e) {
    for (const { bodyA, bodyB } of e.pairs) {
      if (bodyA.isStatic || bodyB.isStatic) continue;
      if ((bodyA.position.y - bodyA.circleRadius) < LOSE_Y ||
          (bodyB.position.y - bodyB.circleRadius) < LOSE_Y) {
        loseGame(); return;
      }
      if (bodyA.sidx !== bodyB.sidx) continue;
      if (bodyA.popped || bodyB.popped) continue;
      bodyA.popped = true; bodyB.popped = true;

      const newIdx = bodyA.sidx >= SILS.length - 1 ? 0 : bodyA.sidx + 1;
      const mx = (bodyA.position.x + bodyB.position.x) / 2;
      const my = (bodyA.position.y + bodyB.position.y) / 2;

      Composite.remove(engine.world, [bodyA, bodyB]);
      const nb = makeBall(mx, my, newIdx);
      nb.force = { x: 0, y: -0.04 };
      Composite.add(engine.world, nb);
      addPop(mx, my, bodyA.circleRadius);
      updateScore(SILS[bodyA.sidx].r * 2);
      showCombo(bodyA.sidx);
    }
  });
}

function drop(x) {
  if (state !== ST.READY) return;
  state = ST.DROP;
  if (previewBody) { Composite.remove(engine.world, previewBody); previewBody = null; }

  const b = makeBall(x, LOSE_Y, curIdx);
  Composite.add(engine.world, b);
  curIdx = nextIdx;
  setNext(pickNext());

  setTimeout(() => {
    if (state !== ST.DROP) return;
    const px = mouse.position?.x ? clampX(curIdx, mouse.position.x) : GW/2;
    previewBody = makeBall(px, LOSE_Y, curIdx, {
      isStatic: true, collisionFilter: { mask: 0x0040 }
    });
    Composite.add(engine.world, previewBody);
    if (voiceEnabled) speakSyllable(curIdx, "Siguiente");
    state = ST.READY;
  }, 300);
}

function loseGame() {
  if (state === ST.LOSE) return;
  state = ST.LOSE;
  runner.enabled = false;
  if (score >= best) endTitleEl.textContent = "¡Nuevo Récord! 🏆";
  endEl.style.display = "flex";
}

document.getElementById("game-end-link").addEventListener("click", function(e) {
  e.preventDefault();
  const all = Composite.allBodies(engine.world);
  for (const b of all) Composite.remove(engine.world, b);
  Events.off(engine, "collisionStart");
  Events.off(mc, "mousemove");
  Events.off(mc, "mouseup");
  runner.enabled = true;
  startMenu();
});

voiceToggle.addEventListener("click", function() {
  voiceEnabled = !voiceEnabled;
  voiceToggle.textContent = voiceEnabled ? "Con voz" : "Sin voz";
  if (voiceEnabled) speakSyllable(nextIdx, "Siguiente");
});

// ── LAUNCH ────────────────────────────────────────────────────────────────────
Composite.add(engine.world, mc);
Render.run(render);
Runner.run(runner, engine);
resize();
startMenu();
