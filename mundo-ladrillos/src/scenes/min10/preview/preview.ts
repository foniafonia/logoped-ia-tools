import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PlasticMaterialFactory } from '../../../materials/PlasticMaterialFactory';
import { ThirdPersonCamera } from '../../../camera/ThirdPersonCamera';
import { createMinifigure, MinifigureSkin } from '../../../characters/MinifigureFactory';
import { createStuddedGround } from '../../../world/EnvironmentManager';
import { PreviewController } from '../../min05/preview/PreviewController';
import { CinematicCamera } from '../../min05/props/CinematicCamera';
import { SoundEngine } from '../../min05/audio/SoundEngine';
import { buildNightSky, cobbleTexture } from '../../min05/props/NightAmbience';
import { buildSky } from '../../min00/sky';
import { buildHorizon as buildMesaRing } from '../../min00/horizon';
import { mountSceneTag, SceneTagHandle } from '../../../ui/SceneTag';
import { ESPIA1_SIGILO, ESPIA2_SIGILO } from '../../min05/skins';
import { MIN10_SCENES } from '../registry';
import { Min10Scene, SceneContext, SceneInstance } from '../types';
import { TAVERN_BOUNDS } from '../props/stage';

/**
 * PREVIEW jugable del tramo MINUTO 10–15 · "LA POSADA DE RAHAB" (escenas 17–25).
 * App autocontenida para PROBAR e ITERAR: selector de escena, jugador con
 * colisiones, sonido procedural (ambiente + SFX), HUD (objetivo + barras de
 * detección/progreso), interacción E/botón, mandos táctiles y secuencia encadenada.
 *
 * AUDIO: el clip real del min 10–15 es privado y aún no está en el repo, así que el
 * "film-spine" está CABLEADO pero APAGADO (USE_FILM_SPINE=false). Suenan ambiente +
 * SFX + subtítulos; cuando el usuario pase el audio, se encenderá como en min05.
 */
const USE_FILM_SPINE = false;

const app = document.getElementById('app')!;

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
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

// --- Luces (se reconfiguran por 'mundo': interior cálido / calle nocturna) ---
const hemi = new THREE.HemisphereLight(0xffe9c0, 0xa9895f, 0.6); scene.add(hemi);
const key = new THREE.DirectionalLight(0xffd9a0, 2.4);
key.position.set(-14, 26, 16); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 1; key.shadow.camera.far = 160;
key.shadow.camera.left = -50; key.shadow.camera.right = 50;
key.shadow.camera.top = 60; key.shadow.camera.bottom = -50;
key.shadow.bias = -0.0002; key.shadow.normalBias = 0.02;
scene.add(key);
const fill = new THREE.DirectionalLight(0xbcd2ff, 0.32); fill.position.set(12, 12, -6); scene.add(fill);

// --- Suelo global + cielo nocturno (solo para exteriores; ocultos en interior) ---
const ground = createStuddedGround(700); scene.add(ground);
const groundMat = ground.material as THREE.MeshStandardMaterial;
const groundDayTex = groundMat.map;
const cobbleTex = cobbleTexture(); cobbleTex.repeat.set(120, 120);
const nightSky = buildNightSky(); nightSky.visible = false; scene.add(nightSky);

// Telón de MONTAÑAS pintadas + nubes que derivan (kit del LEAD, listón 0–5) y
// anillo de MESETAS 3D que cierran el mundo. Se crean una vez y se muestran solo
// en exteriores. buildSky no expone su grupo → lo capturo por diferencia.
const beforeSky = new Set(scene.children);
const sky = buildSky(scene);
const skyGroup = scene.children.find((c) => !beforeSky.has(c)) as THREE.Object3D;
const mesaRing = buildMesaRing(scene); // Group ya añadido a la escena
function setWorldVisible(v: boolean): void {
  if (skyGroup) skyGroup.visible = v;
  mesaRing.visible = v;
  nightSky.visible = v;
}

function applyLighting(mundo: Min10Scene['mundo']): void {
  if (mundo === 'interior') {
    // el interior lo ilumina la propia taberna (faroles + hemi cálido). Bajamos las
    // luces globales y ocultamos suelo/cielo del mundo exterior.
    scene.environment = envTex;
    renderer.toneMappingExposure = 1.15;
    scene.background = new THREE.Color(0x14100a);
    scene.fog = new THREE.Fog(0x14100a, 34, 74);
    hemi.color.setHex(0xffd9a0); hemi.groundColor.setHex(0x2a1c10); hemi.intensity = 0.5;
    key.color.setHex(0xffdca0); key.intensity = 1.1; key.position.set(-8, 22, 12);
    fill.color.setHex(0xffb877); fill.intensity = 0.25;
    ground.visible = false; setWorldVisible(false);
  } else {
    // calle nocturna: luna + cielo estrellado + adoquín
    scene.environment = null;
    renderer.toneMappingExposure = 1.2;
    scene.background = new THREE.Color(0x102138);
    scene.fog = new THREE.Fog(0x162943, 60, 250);
    hemi.color.setHex(0x4c6690); hemi.groundColor.setHex(0x2a2a2a); hemi.intensity = 1.05;
    key.color.setHex(0xc2d4f7); key.intensity = 1.25; key.position.set(-120, 140, 200);
    fill.color.setHex(0x6a86c0); fill.intensity = 0.5;
    ground.visible = true; setWorldVisible(true);
    groundMat.map = cobbleTex; groundMat.color.setHex(0x8a8a92);
    groundMat.emissive.setHex(0x0a1320); groundMat.needsUpdate = true;
  }
}

// --- Jugador ---
const skins: Record<string, MinifigureSkin> = { spy: ESPIA1_SIGILO, spy2: ESPIA2_SIGILO };
let playerSkin = 'spy';
let player = createMinifigure(plastic, ESPIA1_SIGILO); scene.add(player.root);
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

// --- Confeti de celebración ---
const confettiGroup = new THREE.Group(); scene.add(confettiGroup);
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
  for (const c of confetti) { c.life -= dt; c.v.y -= 12 * dt; c.m.position.addScaledVector(c.v, dt); c.m.rotation.x += dt * 6; c.m.rotation.z += dt * 5; }
  const dead = confetti.filter((c) => c.life <= 0 || c.m.position.y < -1);
  for (const c of dead) { confettiGroup.remove(c.m); c.m.geometry.dispose(); }
  confetti = confetti.filter((c) => c.life > 0 && c.m.position.y >= -1);
}

// --- Interacción (E / botón) ---
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
const vignette = mkDiv({ inset: '0', zIndex: '18', boxShadow: 'inset 0 0 120px 40px rgba(255,40,30,0)', transition: 'box-shadow .12s linear' });

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
const progBar = mkBar('136px', '', 'linear-gradient(90deg,#8fe0ff,#bfffce)');

// selector de escenas
const bar = document.createElement('div');
Object.assign(bar.style, { position: 'fixed', left: '8px', bottom: '8px', zIndex: '30', display: 'flex', gap: '5px', flexWrap: 'wrap', maxWidth: '58%' } as CSSStyleDeclaration);
document.body.appendChild(bar);
MIN10_SCENES.forEach((s, i) => {
  const b = document.createElement('button');
  b.textContent = String(s.numero);
  Object.assign(b.style, { font: '700 14px system-ui', color: '#0a0705', background: '#e8b04b', border: 'none', borderRadius: '8px', padding: '7px 11px', cursor: 'pointer' } as CSSStyleDeclaration);
  b.title = s.titulo; b.onclick = () => { sound.init(); loadScene(i); };
  bar.appendChild(b);
});

const muteBtn = document.createElement('button');
muteBtn.textContent = '🔊';
Object.assign(muteBtn.style, { position: 'fixed', right: '10px', top: '10px', zIndex: '30', font: '18px system-ui', background: 'rgba(0,0,0,.5)', color: '#fff', border: '1px solid rgba(255,255,255,.3)', borderRadius: '10px', padding: '6px 10px', cursor: 'pointer' } as CSSStyleDeclaration);
muteBtn.onclick = () => { sound.setMuted(!sound.muted); muteBtn.textContent = sound.muted ? '🔈' : '🔊'; };
document.body.appendChild(muteBtn);

const gemsEl = mkDiv({ right: '10px', top: '52px', color: '#ffe08a', font: '800 18px system-ui', textShadow: '0 2px 6px rgba(0,0,0,.8)' });
const hint = mkDiv({ right: '10px', bottom: '10px', color: '#cfe', font: '12px system-ui', background: 'rgba(0,0,0,.42)', padding: '5px 9px', borderRadius: '8px' });
hint.textContent = 'WASD/flechas mover · Shift correr · E acción · arrastra cámara';

// ================= Mandos táctiles =================
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
}

// ================= Escena activa + secuencia =================
let current: SceneInstance | null = null;
let currentDef: Min10Scene | null = null;
let sceneTag: SceneTagHandle | null = null;
let done = false;
let advanceT = 0;

const cineCam = new CinematicCamera(camera);
let started = false;
let pendingIntro: Min10Scene['intro'] | null = null;
const shotMode = new URLSearchParams(location.search).get('shot') === '1';

function fireIntro(): void {
  if (!pendingIntro) return;
  const i = pendingIntro; pendingIntro = null;
  cineCam.reveal(i.from, i.to, i.lookFrom, i.lookTo, i.seconds);
}
function disposeGroup(g: THREE.Group): void {
  g.traverse((o: THREE.Object3D) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
}

function loadScene(i: number): void {
  const idx = ((i % MIN10_SCENES.length) + MIN10_SCENES.length) % MIN10_SCENES.length;
  const def = MIN10_SCENES[idx];
  if (current) { scene.remove(current.group); current.dispose?.(); disposeGroup(current.group); }
  currentDef = def; done = false; advanceT = 0;
  applyLighting(def.mundo);
  const amb = def.ambiente ?? 'street';
  if (sound.ready) sound.setAmbience(amb);
  setPlayerSkin(def.jugador ?? 'spy');
  player.root.visible = true;

  controller.clearObstacles();
  const ctx: SceneContext = {
    scene, plastic,
    getPlayer: () => controller.pos,
    setPlayer: (x, z) => controller.teleport(x, z),
    markDone: () => { done = true; },
    sound,
    wantsInteract: consumeInteract,
    addObstacle: (x, z, hw, hd) => controller.addObstacle(x, z, hw, hd),
    setPlayerSkin: (which) => setPlayerSkin(which),
    setPlayerVisible: (v) => { player.root.visible = v; },
    cameraFocus: (target, seconds) => cineCam.focus(target, seconds),
    cameraReveal: (from, to, lookFrom, lookTo, seconds) => cineCam.reveal(from, to, lookFrom, lookTo, seconds)
  };
  current = def.build(ctx);

  sceneTag?.dispose();
  sceneTag = mountSceneTag({
    id: `E${def.numero}`, nombre: def.titulo, tramo: 'T10–15', modo: def.mundo, hilo: 'min10',
    archivo: `${def.id}.ts`,
    getAudio: () => (USE_FILM_SPINE ? sound.nowPlaying() : '🔇 ambiente + SFX (audio peli pendiente)'),
    getPos: () => ({ x: controller.pos.x, z: controller.pos.z }),
    getExtra: () => `objetivo: ${def.objetivo.texto}`
  });

  // límites del recinto: interior = sala de la taberna; exterior = corredor de calle
  if (def.mundo === 'interior') controller.setBounds(TAVERN_BOUNDS.minX, TAVERN_BOUNDS.maxX, TAVERN_BOUNDS.minZ, TAVERN_BOUNDS.maxZ);
  else controller.setBounds(-28, 28, def.spawn.z - 6, (def.objetivo.target?.z ?? def.spawn.z) + 12);
  controller.teleport(def.spawn.x, def.spawn.z);

  if (def.camara) { tpcam.yaw = def.camara.yaw ?? Math.PI; tpcam.pitch = def.camara.pitch ?? 0.4; tpcam.dist = def.camara.dist ?? 24; }

  titleEl.textContent = `Escena ${def.numero} · ${def.titulo}`;
  objEl.textContent = def.objetivo.tipo === 'cinematica' ? '' : '🎯 ' + def.objetivo.texto;
  objEl.style.display = def.objetivo.tipo === 'cinematica' ? 'none' : 'block';
  subEl.textContent = def.subtitulo;
  flashEl.textContent = '';
  pendingIntro = def.intro ?? null;
  if (pendingIntro && (started || shotMode)) fireIntro();
  (window as any).__SCENE_READY__ = true;
}

(window as any).__loadScene = loadScene;
(window as any).__loadNumero = (n: number) => { const idx = MIN10_SCENES.findIndex((s) => s.numero === n); if (idx >= 0) loadScene(idx); };

// ================= Pantalla de inicio =================
const startEl = document.createElement('div');
startEl.innerHTML =
  '<div style="text-align:center;color:#f4e9d2;font-family:system-ui,sans-serif;padding:24px;max-width:540px">' +
  '<div style="font:800 30px/1.1 Georgia,serif;color:#e8b04b;letter-spacing:1px">LA POSADA DE RAHAB</div>' +
  '<div style="opacity:.85;margin:12px 0 22px">Minuto 10–15 · mundo de ladrillo. Escabúllete por el mercado nocturno hasta la posada de Rahab, haz el pacto y escóndete de los guardias mientras Rahab los engaña.</div>' +
  '<button id="startBtn" style="font:800 20px/1 system-ui;color:#0a0705;background:#e8b04b;border:none;border-radius:14px;padding:16px 30px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.5)">▶ Tocar para empezar</button>' +
  '<div style="opacity:.7;font-size:13px;margin-top:14px">🔊 Con sonido · WASD/flechas o joystick · E para actuar</div></div>';
Object.assign(startEl.style, { position: 'fixed', inset: '0', zIndex: '50', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(120% 100% at 50% 0%, #2a1c10, #060b12 72%)', transition: 'opacity .4s' } as CSSStyleDeclaration);
document.body.appendChild(startEl);
const startGame = (): void => {
  sound.init();
  if (currentDef) sound.setAmbience(currentDef.ambiente ?? 'street');
  started = true; fireIntro();
  startEl.style.opacity = '0'; setTimeout(() => startEl.remove(), 420);
};
startEl.addEventListener('pointerdown', startGame, { once: true });
addEventListener('keydown', () => { if (sound.ready) return; startGame(); }, { once: true });

// escena inicial
const params = new URLSearchParams(location.search);
const startNum = parseInt(params.get('scene') || '', 10);
const startIdx = Number.isFinite(startNum) ? MIN10_SCENES.findIndex((s) => s.numero === startNum) : 0;
loadScene(startIdx >= 0 ? startIdx : 0);
if (params.get('shot') === '1') startEl.remove();

addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

let last = 0;
function animate(now: number): void {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;

  sky.update(dt, 0.82); // deriva de nubes + tinte noche del telón de montañas

  const cine = cineCam.active;
  if (!cine) {
    controller.update(dt, tpcam.yaw);
    if (sound.ready) {
      sound.footTick(dt, controller.moving, controller.running);
      if (controller.justJumped) sound.jump();
      if (controller.justLanded) sound.land();
    }
  }

  if (current && currentDef) {
    current.update(dt, now / 1000, controller.pos);
    const st = current.status?.() ?? null;
    statusEl.textContent = st ?? '';
    const h = current.hud?.() ?? {};
    setBar(alarmBar, h.alarm);
    const a = h.alarm ?? 0;
    vignette.style.boxShadow = `inset 0 0 120px 40px rgba(255,40,30,${(a * 0.55).toFixed(3)})`;
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
    if (done) { advanceT += dt; if (advanceT > 2.8) { const idx = MIN10_SCENES.findIndex((s) => s.id === currentDef!.id); loadScene(idx + 1); } }
  }

  if (!cineCam.update(dt, controller.pos.x, controller.pos.z)) tpcam.update(controller.pos);
  renderer.render(scene, camera);
}
function setBar(b: { wrap: HTMLDivElement; fill: HTMLDivElement; lab: HTMLDivElement }, v?: number): void {
  if (v === undefined || v <= 0.001) { b.wrap.style.display = 'none'; b.lab.style.display = 'none'; return; }
  b.wrap.style.display = 'block'; b.lab.style.display = 'block'; b.fill.style.width = `${THREE.MathUtils.clamp(v, 0, 1) * 100}%`;
}
requestAnimationFrame(animate);

(window as any).__READY__ = true;
(window as any).__setPlayer = (x: number, z: number) => controller.teleport(x, z);
(window as any).__pos = () => ({ x: controller.pos.x, z: controller.pos.z });
(window as any).__cine = () => (cineCam.active ? 1 : 0);

// ============================================================================
// HOOKS DE PLAYTEST para el SEGUNDO-CEREBRO / Eli (rama segundo-cerebro-playtester).
// Contrato para que un playtester headless conduzca y "vea" el tramo:
//   __loadNumero(n)          → carga la escena n (17..25)
//   __walk(dx, dz, ms)       → empuja al jugador en (dx,dz) normalizados durante ms
//   __act()                  → pulsa la acción E (pactar, pedir café, asomarse…)
//   __probe()                → estado legible AHORA: escena, objetivo, status, hud,
//                              posición, si está en cinemática y si la escena está resuelta
// (Si Eli espera otra firma, que me lo diga en coordinacion/eli-reportes.md y la adapto.)
(window as any).__act = () => { interactFlag = true; };
(window as any).__walk = (dx: number, dz: number, ms = 500): void => {
  controller.touch.x = Math.max(-1, Math.min(1, dx));
  controller.touch.z = Math.max(-1, Math.min(1, dz));
  setTimeout(() => { controller.touch.x = 0; controller.touch.z = 0; }, ms);
};
(window as any).__probe = () => ({
  escena: currentDef?.numero ?? null,
  id: currentDef?.id ?? null,
  mundo: currentDef?.mundo ?? null,
  titulo: currentDef?.titulo ?? null,
  objetivo: currentDef?.objetivo?.texto ?? null,
  status: current?.status?.() ?? null,
  hud: current?.hud?.() ?? null,
  pos: { x: +controller.pos.x.toFixed(2), z: +controller.pos.z.toFixed(2) },
  cine: cineCam.active,
  resuelta: done
});
