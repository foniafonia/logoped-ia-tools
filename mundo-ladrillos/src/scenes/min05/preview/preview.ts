import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PlasticMaterialFactory } from '../../../materials/PlasticMaterialFactory';
import { ThirdPersonCamera } from '../../../camera/ThirdPersonCamera';
import { createMinifigure, MinifigureSkin } from '../../../characters/MinifigureFactory';
import { createStuddedGround } from '../../../world/EnvironmentManager';
import { PreviewController } from './PreviewController';
import { MIN05_SCENES } from '../registry';
import { Min05Scene, SceneInstance, SceneContext } from '../types';
import { SoundEngine } from '../audio/SoundEngine';
import { AudioManager } from '../../../audio/AudioManager';
import { buildNightSky, cobbleTexture } from '../props/NightAmbience';
import { YEHOSHUA_SKIN, ESPIA1_SIGILO, ESPIA2_SIGILO, ESPIA1_CAMP, ESPIA2_CAMP } from '../skins';

/**
 * PREVIEW jugable del tramo MINUTO 5–10. App autocontenida para PROBAR e ITERAR
 * las escenas: selector, jugador controlable con colisiones, sonido procedural,
 * HUD (objetivo + barras de detección/equilibrio), interacción con E/botón,
 * mandos táctiles y secuencia encadenada (al lograr el objetivo, auto-avanza).
 * No es el juego final: el LEAD integra los `Min05Scene` en el StoryEngine.
 */

const app = document.getElementById('app')!;

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 700);
camera.position.set(0, 9, 30);
const tpcam = new ThirdPersonCamera(camera, renderer.domElement);

const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const plastic = new PlasticMaterialFactory();
const sound = new SoundEngine();
// Audios REALES de la peli (clips embebidos en el repo para la entrega).
const film = new AudioManager();
let filmReady = false;
let filmBed: { stop: (f?: number) => void } | null = null;   // cama por escena (din, etc.)
let filmMusic: { stop: (f?: number) => void } | null = null; // BSO de la peli (continua)

// --- Luces (se reconfiguran día/noche) ---
const hemi = new THREE.HemisphereLight(0xffe9c0, 0xa9895f, 0.5);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xffd9a0, 3.0);
key.position.set(-18, 28, 14);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 1; key.shadow.camera.far = 220;
key.shadow.camera.left = -90; key.shadow.camera.right = 90;
key.shadow.camera.top = 90; key.shadow.camera.bottom = -70;
key.shadow.bias = -0.0002; key.shadow.normalBias = 0.02;
scene.add(key);
const fill = new THREE.DirectionalLight(0xbcd2ff, 0.35);
fill.position.set(12, 12, -6);
scene.add(fill);

// --- Suelo base + cielo nocturno (se muestran/ocultan por escena) ---
const groundDayTex = (createStuddedGround(700).material as THREE.MeshStandardMaterial).map;
const ground = createStuddedGround(700);
scene.add(ground);
const groundMat = ground.material as THREE.MeshStandardMaterial;
const cobbleTex = cobbleTexture(); cobbleTex.repeat.set(120, 120);
const nightSky = buildNightSky(); nightSky.visible = false; scene.add(nightSky);

function applyLighting(noche: boolean, street: boolean): void {
  if (noche) {
    scene.environment = null;
    renderer.toneMappingExposure = 1.2;
    scene.background = new THREE.Color(0x102138);
    scene.fog = new THREE.Fog(0x162943, 60, 250);
    hemi.color.setHex(0x466288); hemi.groundColor.setHex(0x172433); hemi.intensity = 0.95;
    key.color.setHex(0xb2caf5); key.intensity = 1.05;          // luna
    key.position.set(-150, 150, -240);
    fill.color.setHex(0x3d5c8c); fill.intensity = 0.42;
    nightSky.visible = true;
    if (street) { groundMat.map = cobbleTex; groundMat.color.setHex(0x8a8a92); }
    else { groundMat.map = groundDayTex; groundMat.color.setHex(0x5c6c82); }
    groundMat.emissive.setHex(0x0a1320); groundMat.needsUpdate = true;
  } else {
    scene.environment = envTex;
    renderer.toneMappingExposure = 1.05;
    scene.background = new THREE.Color(0xf0d9a8);
    scene.fog = new THREE.Fog(0xf0d9a8, 60, 360);
    hemi.color.setHex(0xffe9c0); hemi.groundColor.setHex(0xa9895f); hemi.intensity = 0.55;
    key.color.setHex(0xffd9a0); key.intensity = 3.0;
    key.position.set(-18, 28, 14);
    fill.color.setHex(0xbcd2ff); fill.intensity = 0.35;
    nightSky.visible = false;
    groundMat.map = groundDayTex; groundMat.color.setHex(0xffffff); groundMat.emissive.setHex(0x000000); groundMat.needsUpdate = true;
  }
}

// --- Jugador ---
const skins: Record<string, MinifigureSkin> = { yoshua: YEHOSHUA_SKIN, spy: ESPIA1_SIGILO, spy2: ESPIA2_SIGILO, spy_camp: ESPIA1_CAMP, spy2_camp: ESPIA2_CAMP };
let playerSkin = 'spy';
let player = createMinifigure(plastic, ESPIA1_SIGILO);
scene.add(player.root);
let controller = new PreviewController(player);

function setPlayerSkin(which: string): void {
  if (which === playerSkin) return;
  playerSkin = which;
  const keep = controller.pos.clone();
  scene.remove(player.root);
  player = createMinifigure(plastic, skins[which] ?? ESPIA1_SIGILO);
  scene.add(player.root);
  const b = controller.bounds, obs = controller.obstacles;
  controller = new PreviewController(player);
  controller.setBounds(b.minX, b.maxX, b.minZ, b.maxZ);
  controller.obstacles = obs;
  controller.teleport(keep.x, keep.z);
}

// --- Confeti 3D de celebración (premio para el niño al lograr el objetivo) ---
const confettiGroup = new THREE.Group();
scene.add(confettiGroup);
let confetti: Array<{ m: THREE.Mesh; v: THREE.Vector3; life: number }> = [];
const confettiCols = [0xff5a4d, 0xffd24a, 0x4c9e5e, 0x1f6fb2, 0xe8801e, 0xffffff];
function spawnConfetti(x: number, z: number): void {
  for (let i = 0; i < 60; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.05), new THREE.MeshBasicMaterial({ color: confettiCols[i % confettiCols.length] }));
    m.position.set(x + (Math.random() - 0.5) * 3, 7 + Math.random() * 2, z + (Math.random() - 0.5) * 3);
    confettiGroup.add(m);
    confetti.push({ m, v: new THREE.Vector3((Math.random() - 0.5) * 7, 4 + Math.random() * 4, (Math.random() - 0.5) * 7), life: 2.4 });
  }
}
function updateConfetti(dt: number): void {
  for (const c of confetti) {
    c.life -= dt; c.v.y -= 12 * dt;
    c.m.position.addScaledVector(c.v, dt);
    c.m.rotation.x += dt * 6; c.m.rotation.z += dt * 5;
  }
  const dead = confetti.filter((c) => c.life <= 0 || c.m.position.y < -1);
  for (const c of dead) { confettiGroup.remove(c.m); c.m.geometry.dispose(); }
  confetti = confetti.filter((c) => c.life > 0 && c.m.position.y >= -1);
}

// --- Interacción (E / botón de acción): flag de un frame ---
let interactFlag = false;
addEventListener('keydown', (e) => { if (e.code === 'KeyE') interactFlag = true; });
function consumeInteract(): boolean { const v = interactFlag; interactFlag = false; return v; }

// ================= HUD =================
function mkDiv(style: Partial<CSSStyleDeclaration>): HTMLDivElement {
  const d = document.createElement('div');
  Object.assign(d.style, { position: 'fixed', zIndex: '20', pointerEvents: 'none' } as CSSStyleDeclaration, style);
  document.body.appendChild(d); return d;
}
const titleEl = mkDiv({ left: '50%', top: '10px', transform: 'translateX(-50%)', color: '#ffd98a', font: '800 20px Georgia, serif', textShadow: '0 2px 8px rgba(0,0,0,.8)', textAlign: 'center' });
const objEl = mkDiv({ left: '50%', top: '44px', transform: 'translateX(-50%)', maxWidth: '86%', background: 'rgba(20,40,60,.8)', color: '#dff3ff', font: '700 15px system-ui', padding: '7px 15px', borderRadius: '18px', textAlign: 'center', border: '1px solid rgba(143,224,255,.6)' });
const statusEl = mkDiv({ left: '50%', top: '84px', transform: 'translateX(-50%)', color: '#ffe', font: '700 15px system-ui', textShadow: '0 2px 8px rgba(0,0,0,.85)', textAlign: 'center' });
const subEl = mkDiv({ left: '50%', bottom: '64px', transform: 'translateX(-50%)', maxWidth: '86%', background: 'rgba(8,6,4,.75)', color: '#ffeecb', font: '500 16px/1.35 Georgia, serif', padding: '9px 16px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(232,176,75,.35)' });
const flashEl = mkDiv({ left: '50%', top: '40%', transform: 'translate(-50%,-50%)', color: '#bfffce', font: '800 30px system-ui', textShadow: '0 2px 14px rgba(0,0,0,.8)', textAlign: 'center' });
const promptEl = mkDiv({ left: '50%', top: '58%', transform: 'translate(-50%,-50%)', color: '#0a0705', background: '#ffd24a', font: '800 16px system-ui', padding: '8px 16px', borderRadius: '12px', boxShadow: '0 4px 14px rgba(0,0,0,.5)', display: 'none' });
// viñeta de peligro (bordes rojos que suben con la alarma del sigilo)
const vignette = mkDiv({ inset: '0', zIndex: '18', boxShadow: 'inset 0 0 120px 40px rgba(255,40,30,0)', transition: 'box-shadow .12s linear' });

// barra genérica (detección / equilibrio / progreso)
function mkBar(top: string, label: string, color: string): { wrap: HTMLDivElement; fill: HTMLDivElement; lab: HTMLDivElement } {
  const wrap = mkDiv({ left: '50%', top, transform: 'translateX(-50%)', width: '220px', height: '14px', background: 'rgba(0,0,0,.45)', borderRadius: '8px', border: '1px solid rgba(255,255,255,.25)', display: 'none', overflow: 'hidden' });
  const fill = document.createElement('div');
  Object.assign(fill.style, { position: 'absolute', left: '0', top: '0', height: '100%', width: '0%', background: color, transition: 'width .08s linear' } as CSSStyleDeclaration);
  wrap.appendChild(fill);
  const lab = mkDiv({ left: '50%', top: `calc(${top} - 16px)`, transform: 'translateX(-50%)', color: '#fff', font: '700 11px system-ui', textShadow: '0 1px 3px #000', display: 'none' });
  lab.textContent = label;
  return { wrap, fill, lab };
}
const alarmBar = mkBar('112px', '🚨 ALARMA', 'linear-gradient(90deg,#ffd24a,#ff5a4d)');
const balBar = mkBar('112px', '⚖️ EQUILIBRIO', '#8fe0ff');
const progBar = mkBar('136px', '', 'linear-gradient(90deg,#8fe0ff,#bfffce)');

// selector de escenas
const bar = document.createElement('div');
Object.assign(bar.style, { position: 'fixed', left: '8px', bottom: '8px', zIndex: '30', display: 'flex', gap: '5px', flexWrap: 'wrap', maxWidth: '58%' } as CSSStyleDeclaration);
document.body.appendChild(bar);
MIN05_SCENES.forEach((s, i) => {
  const b = document.createElement('button');
  b.textContent = String(s.numero);
  Object.assign(b.style, { font: '700 14px system-ui', color: '#0a0705', background: '#e8b04b', border: 'none', borderRadius: '8px', padding: '7px 11px', cursor: 'pointer' } as CSSStyleDeclaration);
  b.title = s.titulo; b.onclick = () => { sound.init(); loadScene(i); };
  bar.appendChild(b);
});

// botón de silencio
const muteBtn = document.createElement('button');
muteBtn.textContent = '🔊';
Object.assign(muteBtn.style, { position: 'fixed', right: '10px', top: '10px', zIndex: '30', font: '18px system-ui', background: 'rgba(0,0,0,.5)', color: '#fff', border: '1px solid rgba(255,255,255,.3)', borderRadius: '10px', padding: '6px 10px', cursor: 'pointer' } as CSSStyleDeclaration);
muteBtn.onclick = () => { sound.setMuted(!sound.muted); muteBtn.textContent = sound.muted ? '🔈' : '🔊'; };
document.body.appendChild(muteBtn);

const gemsEl = mkDiv({ right: '10px', top: '52px', color: '#ffe08a', font: '800 18px system-ui', textShadow: '0 2px 6px rgba(0,0,0,.8)' });
const hint = mkDiv({ right: '10px', bottom: '10px', color: '#cfe', font: '12px system-ui', background: 'rgba(0,0,0,.42)', padding: '5px 9px', borderRadius: '8px' });
hint.textContent = 'WASD/flechas mover · Shift correr · E acción · arrastra cámara';

// ================= Mandos táctiles (móvil) =================
function isTouch(): boolean { return 'ontouchstart' in window || navigator.maxTouchPoints > 0; }
if (isTouch()) {
  hint.style.display = 'none';
  const stick = document.createElement('div');
  Object.assign(stick.style, { position: 'fixed', left: '18px', bottom: '78px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,.14)', border: '2px solid rgba(255,255,255,.35)', zIndex: '31', touchAction: 'none' } as CSSStyleDeclaration);
  const knob = document.createElement('div');
  Object.assign(knob.style, { position: 'absolute', left: '35px', top: '35px', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,.55)' } as CSSStyleDeclaration);
  stick.appendChild(knob); document.body.appendChild(stick);
  let sid = -1;
  const onMove = (cx: number, cy: number): void => {
    const r = stick.getBoundingClientRect(); const dx = cx - (r.left + 60), dy = cy - (r.top + 60);
    const m = Math.min(1, Math.hypot(dx, dy) / 46); const a = Math.atan2(dy, dx);
    controller.touch.x = Math.cos(a) * m; controller.touch.z = Math.sin(a) * m;
    knob.style.left = `${35 + Math.cos(a) * m * 35}px`; knob.style.top = `${35 + Math.sin(a) * m * 35}px`;
  };
  stick.addEventListener('touchstart', (e) => { sid = e.changedTouches[0].identifier; onMove(e.changedTouches[0].clientX, e.changedTouches[0].clientY); e.preventDefault(); }, { passive: false });
  stick.addEventListener('touchmove', (e) => { for (const t of Array.from(e.changedTouches)) if (t.identifier === sid) onMove(t.clientX, t.clientY); e.preventDefault(); }, { passive: false });
  stick.addEventListener('touchend', () => { sid = -1; controller.touch.x = 0; controller.touch.z = 0; knob.style.left = '35px'; knob.style.top = '35px'; });

  const mkBtn = (txt: string, right: string, bottom: string, cb: () => void): void => {
    const b = document.createElement('button');
    b.textContent = txt;
    Object.assign(b.style, { position: 'fixed', right, bottom, width: '68px', height: '68px', borderRadius: '50%', background: 'rgba(232,176,75,.85)', color: '#0a0705', border: 'none', font: '700 15px system-ui', zIndex: '31', touchAction: 'none' } as CSSStyleDeclaration);
    b.addEventListener('touchstart', (e) => { cb(); e.preventDefault(); }, { passive: false });
    document.body.appendChild(b);
  };
  mkBtn('E', '22px', '150px', () => { interactFlag = true; });
  mkBtn('SALTO', '96px', '86px', () => { controller.touch.jump = true; });
  mkBtn('▲', '22px', '78px', () => { controller.touch.jump = true; });
}

// ================= Escena activa + secuencia =================
let current: SceneInstance | null = null;
let currentDef: Min05Scene | null = null;
let done = false;
let advanceT = 0;

function disposeGroup(g: THREE.Group): void {
  g.traverse((o: THREE.Object3D) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
}

function loadScene(i: number): void {
  const idx = ((i % MIN05_SCENES.length) + MIN05_SCENES.length) % MIN05_SCENES.length;
  const def = MIN05_SCENES[idx];
  if (current) { scene.remove(current.group); current.dispose?.(); disposeGroup(current.group); }
  currentDef = def; done = false; advanceT = 0;
  const amb = def.ambiente ?? (def.noche ? 'night' : 'day');
  applyLighting(!!def.noche, amb === 'street');
  if (sound.ready) sound.setAmbience(amb); // solo viento/grillos/agua (NO música sintética)
  // FONDO Y MÚSICA = AUDIO DE LA PELÍCULA (nunca sintetizador):
  //  - `fondoClip`: música/ambiente del filme en bucle para la escena.
  //  - `voz`: la frase/narración de la peli de ese beat, al entrar.
  // Si el clip no existe todavía (falta el audio del tramo), hace no-op y queda
  // LISTO para cuando el hilo principal aporte el audio + la transcripción.
  if (filmReady) {
    if (filmBed) { filmBed.stop(0.6); filmBed = null; }
    if (def.fondoClip) filmBed = film.loop(def.fondoClip, def.fondoVol ?? 0.5);
    if (def.voz) film.play(def.voz, 1);
  }
  setPlayerSkin(def.jugador ?? 'spy');

  controller.clearObstacles();
  const ctx: SceneContext = {
    scene, plastic,
    getPlayer: () => controller.pos,
    setPlayer: (x, z) => controller.teleport(x, z),
    markDone: () => { done = true; },
    sound,
    film,
    wantsInteract: consumeInteract,
    addObstacle: (x, z, hw, hd) => controller.addObstacle(x, z, hw, hd),
    setPlayerSkin: (which) => setPlayerSkin(which)
  };
  current = def.build(ctx);

  controller.setBounds(-72, 72, def.spawn.z - 8, (def.objetivo.target?.z ?? def.spawn.z) + 26);
  controller.teleport(def.spawn.x, def.spawn.z);

  if (def.camara) { tpcam.yaw = def.camara.yaw ?? Math.PI; tpcam.pitch = def.camara.pitch ?? 0.4; tpcam.dist = def.camara.dist ?? 28; }

  titleEl.textContent = `Escena ${def.numero} · ${def.titulo}`;
  objEl.textContent = def.objetivo.tipo === 'cinematica' ? '' : '🎯 ' + def.objetivo.texto;
  objEl.style.display = def.objetivo.tipo === 'cinematica' ? 'none' : 'block';
  subEl.textContent = def.subtitulo;
  flashEl.textContent = '';
  (window as any).__SCENE_READY__ = true;
}

(window as any).__loadScene = loadScene;
(window as any).__loadNumero = (n: number) => { const idx = MIN05_SCENES.findIndex((s) => s.numero === n); if (idx >= 0) loadScene(idx); };

// ================= Pantalla de inicio (desbloquea audio) =================
const startEl = document.createElement('div');
startEl.innerHTML =
  '<div style="text-align:center;color:#f4e9d2;font-family:system-ui,sans-serif;padding:24px;max-width:520px">' +
  '<div style="font:800 30px/1.1 Georgia,serif;color:#e8b04b;letter-spacing:1px">EL JORDÁN Y LOS DOS ESPÍAS</div>' +
  '<div style="opacity:.85;margin:12px 0 22px">Minuto 5–10 · mundo de ladrillo. Cruza el río, distrae a los guardias con la treta del «¡un avión!» y cuélate en Jericó sin que te vean.</div>' +
  '<button id="startBtn" style="font:800 20px/1 system-ui;color:#0a0705;background:#e8b04b;border:none;border-radius:14px;padding:16px 30px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.5)">▶ Tocar para empezar</button>' +
  '<div style="opacity:.7;font-size:13px;margin-top:14px">🔊 Con sonido · WASD/flechas o joystick · E para actuar</div></div>';
Object.assign(startEl.style, { position: 'fixed', inset: '0', zIndex: '50', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(120% 100% at 50% 0%, #16283f, #060b12 72%)', transition: 'opacity .4s' } as CSSStyleDeclaration);
document.body.appendChild(startEl);
const startGame = (): void => {
  sound.init();
  film.init(); filmReady = true;
  // BSO de la peli como música de fondo CONTINUA para TODO el tramo (si existe
  // el clip `bso_min5-10`). Mientras no esté, no suena (no-op).
  filmMusic = film.loop('bso_min5-10', 0.5);
  if (currentDef) {
    sound.setAmbience(currentDef.ambiente ?? (currentDef.noche ? 'night' : 'day'));
    filmBed?.stop(0);
    if (currentDef.fondoClip) filmBed = film.loop(currentDef.fondoClip, currentDef.fondoVol ?? 0.5);
    if (currentDef.voz) film.play(currentDef.voz, 1);
  }
  startEl.style.opacity = '0'; setTimeout(() => startEl.remove(), 420);
};
void filmMusic;
startEl.addEventListener('pointerdown', startGame, { once: true });
addEventListener('keydown', () => { if (sound.ready) return; startGame(); }, { once: true });

// escena inicial
const params = new URLSearchParams(location.search);
const startNum = parseInt(params.get('scene') || '', 10);
const startIdx = Number.isFinite(startNum) ? MIN05_SCENES.findIndex((s) => s.numero === startNum) : 0;
loadScene(startIdx >= 0 ? startIdx : 0);
if (params.get('shot') === '1') { startEl.remove(); } // capturas: sin overlay

addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

let last = 0;
function animate(now: number): void {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;
  controller.update(dt, tpcam.yaw);

  // sonido de locomoción
  if (sound.ready) {
    sound.footTick(dt, controller.moving, controller.running);
    if (controller.justJumped) sound.jump();
    if (controller.justLanded) sound.land();
  }

  if (current && currentDef) {
    current.update(dt, now / 1000, controller.pos);
    const st = current.status?.() ?? null;
    statusEl.textContent = st ?? '';
    // barras HUD
    const h = current.hud?.() ?? {};
    setBar(alarmBar, h.alarm);
    // viñeta de peligro proporcional a la alarma
    const a = h.alarm ?? 0;
    vignette.style.boxShadow = `inset 0 0 120px 40px rgba(255,40,30,${(a * 0.55).toFixed(3)})`;
    if (h.balance !== undefined) {
      balBar.wrap.style.display = 'block'; balBar.lab.style.display = 'block';
      const off = Math.abs(THREE.MathUtils.clamp(h.balance, -1, 1));
      balBar.fill.style.width = `${off * 100}%`;
      balBar.fill.style.background = off > 0.7 ? '#ff5a4d' : (off > 0.4 ? '#ffd24a' : '#8fe0ff');
    } else { balBar.wrap.style.display = 'none'; balBar.lab.style.display = 'none'; }
    if (h.progress !== undefined) { progBar.wrap.style.display = 'block'; progBar.fill.style.width = `${THREE.MathUtils.clamp(h.progress, 0, 1) * 100}%`; }
    else progBar.wrap.style.display = 'none';
    promptEl.style.display = h.prompt ? 'block' : 'none';
    if (h.prompt) promptEl.textContent = h.prompt;
    gemsEl.textContent = h.gems ? `⭐ ${h.gems.got}/${h.gems.total}` : '';

    if (!done && current.isDone(controller.pos)) {
      done = true; advanceT = 0;
      flashEl.textContent = '✅ ' + currentDef.exito;
      if (sound.ready) sound.success();
      spawnConfetti(controller.pos.x, controller.pos.z);
    }
    updateConfetti(dt);
    if (done) {
      advanceT += dt;
      if (advanceT > 2.6) { const idx = MIN05_SCENES.findIndex((s) => s.id === currentDef!.id); loadScene(idx + 1); }
    }
  }
  tpcam.update(controller.pos);
  renderer.render(scene, camera);
}
function setBar(b: { wrap: HTMLDivElement; fill: HTMLDivElement; lab: HTMLDivElement }, v?: number): void {
  if (v === undefined || v <= 0.001) { b.wrap.style.display = 'none'; b.lab.style.display = 'none'; return; }
  b.wrap.style.display = 'block'; b.lab.style.display = 'block'; b.fill.style.width = `${THREE.MathUtils.clamp(v, 0, 1) * 100}%`; b.fill.style.marginLeft = '0';
}
requestAnimationFrame(animate);

(window as any).__READY__ = true;
