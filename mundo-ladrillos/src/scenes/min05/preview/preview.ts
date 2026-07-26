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
import { buildNightSky, cobbleTexture } from '../props/NightAmbience';
import { buildHorizon } from '../props/Horizon';
import { CinematicCamera } from '../props/CinematicCamera';
import { NavBeacon } from './NavBeacon';
import { setupPreciousRender } from '../../../core/PreciousRender';
import { mountSceneTag, SceneTagHandle } from '../../../ui/SceneTag';
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

// ACABADO "PRECIOSO" (helper compartido del muñequero): bloom + SMAA + tono ACES.
// `ibl:false` porque el IBL ya lo gestiona este preview por escena (envTex /
// applyLighting). En móvil el helper va en modo LITE solo (sin SMAA, bloom suave).
// Bloom SELECTIVO (umbral alto): brillan faroles/reflejos, NO el arenal de día
// (con el umbral por defecto se sobreexponían las escenas diurnas). Suave.
const fx = setupPreciousRender(renderer, scene, camera, { ibl: false, bloom: { strength: 0.26, radius: 0.5, threshold: 0.9 } });

const plastic = new PlasticMaterialFactory();
// El SoundEngine da el AMBIENTE + EFECTOS y reproduce el AUDIO REAL DE LA PELÍCULA
// por escena: cada escena toca su recorte `voz_NN` (ver SCENE_CLIP). No hay música
// sintética.
const sound = new SoundEngine();
// AUDIO de la peli, POR ESCENA. Cada escena reproduce su recorte `voz_NN` (voz +
// música de la peli, ya sincronizado). Mapeado por CONTENIDO con la transcripción
// con tiempos del vídeo completo. Los recortes se cortan del audio del vídeo por
// estas ventanas (segundos del VÍDEO) y se suben a `clips.ts` (solo en la entrega,
// PRIVADO). Hasta que existan, `playSceneClip` no suena (queda el ambiente):
//   9  voz_09  [0:46–1:03]  «…el poderoso río Jordán, la tierra prometida»
//   10 voz_10  [3:41–4:16]  «Necesito hombres… que vayan a espiar Jericó»
//   11 voz_11  [4:24–4:34]  «Es peligroso: si os descubren, os matarán»
//   12 voz_12  [4:44–5:00]  «¿Estás listo? — Vamos a cambiarnos»
//   13 (música/ambiente, sin diálogo)
//   14 voz_14  [5:12–5:37]  «Es una noche tranquila… ¡UN AVIÓN!»  (+ gag corto)
//   15 voz_15  [5:37–5:54]  «Vamos, ya es hora» (colarse)
//   16 voz_16  [5:54–6:44]  «Miren estas huellas… ¿vieron algo raro?»
const SCENE_CLIP: Record<number, string> = {
  9: 'voz_09', 10: 'voz_10', 11: 'voz_11', 12: 'voz_12', 14: 'voz_14', 15: 'voz_15', 16: 'voz_16'
};

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
// Kit de horizonte: dunas y cerros que rodean SIEMPRE al jugador (nunca un
// descampado pálido). Se iluminan solos con la luz día/noche de la escena.
const horizon = buildHorizon(plastic); scene.add(horizon.group);

function applyLighting(noche: boolean, street: boolean, interior = false): void {
  // interiores (tienda/taberna): sin cielo/horizonte/suelo exterior; luz base muy
  // tenue para que manden los faroles cálidos del propio interior.
  ground.visible = !interior;
  horizon.group.visible = !interior;
  if (interior) {
    scene.environment = null;
    renderer.toneMappingExposure = 1.12;
    scene.background = new THREE.Color(0x140f0a);
    scene.fog = new THREE.Fog(0x140f0a, 22, 72);
    hemi.color.setHex(0x7a5636); hemi.groundColor.setHex(0x1a1006); hemi.intensity = 0.28;
    key.color.setHex(0xffcaa0); key.intensity = 0.34; key.position.set(-6, 20, 8);
    fill.color.setHex(0x6a5330); fill.intensity = 0.22;
    nightSky.visible = false;
    return;
  }
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
    scene.background = horizon.daySky;                       // cielo con color (no liso)
    scene.fog = new THREE.Fog(horizon.horizonColor, 70, 360); // funde las dunas en el horizonte
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
// AVISO grande de escena (gag visual "¡MIRA, UN AVIÓN!"): siempre en cuadro
const avisoEl = mkDiv({ left: '50%', top: '30%', transform: 'translate(-50%,-50%)', maxWidth: '92%', color: '#ffe08a', background: 'rgba(10,14,22,.82)', border: '3px solid #ffd24a', font: '800 30px/1.15 Georgia, serif', padding: '12px 26px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 6px 22px rgba(0,0,0,.6)', display: 'none' });
let avisoUntil = 0;
function sceneFlash(text: string, seconds = 3): void { avisoEl.textContent = text; avisoEl.style.display = 'block'; avisoUntil = performance.now() + seconds * 1000; }
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
let sceneTag: SceneTagHandle | null = null;
let done = false;
let advanceT = 0;

// --- cinemática de cámara: "a veces el audio manda" (helper reutilizable) ---
const cineCam = new CinematicCamera(camera);
// baliza de navegación (flecha "a dónde ir" + aro "pulsa E aquí"), común a las 8 escenas
const navBeacon = new NavBeacon(); scene.add(navBeacon.group);
let started = false;                          // ¿pulsó ya "empezar"?
let pendingIntro: Min05Scene['intro'] | null = null;
const shotMode = new URLSearchParams(location.search).get('shot') === '1';

function fireIntro(): void {
  if (!pendingIntro) return;
  const i = pendingIntro; pendingIntro = null;
  cineCam.reveal(i.from, i.to, i.lookFrom, i.lookTo, i.seconds);
}

function disposeGroup(g: THREE.Group): void {
  g.traverse((o: THREE.Object3D) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
}

// Reproduce el recorte de voz/BSO de la peli de ESTA escena (voz_NN). Si el clip
// aún no existe, playSceneClip no suena (queda el ambiente). Sin errores.
function startSceneFilm(def: Min05Scene): void {
  if (!sound.ready) return;
  void sound.playSceneClip(SCENE_CLIP[def.numero]);
}

function loadScene(i: number): void {
  const idx = ((i % MIN05_SCENES.length) + MIN05_SCENES.length) % MIN05_SCENES.length;
  const def = MIN05_SCENES[idx];
  if (current) { scene.remove(current.group); current.dispose?.(); disposeGroup(current.group); }
  currentDef = def; done = false; advanceT = 0;
  const amb = def.ambiente ?? (def.noche ? 'night' : 'day');
  applyLighting(!!def.noche, amb === 'street', amb === 'interior');
  if (sound.ready) sound.setAmbience(amb === 'interior' ? 'night' : amb); // ambiente (interior→grillos suaves)
  // AUDIO DE LA PELÍCULA: salta al segundo de ESTA escena (la voz/música casa con
  // lo que se ve). Si el clip no está (build del repo), no-op.
  startSceneFilm(def);   // ventana de peli de ESTA escena (o para el audio si falta)
  setPlayerSkin(def.jugador ?? 'spy');
  player.root.visible = true; // por si la escena anterior escondió al jugador

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
    cameraReveal: (from, to, lookFrom, lookTo, seconds) => cineCam.reveal(from, to, lookFrom, lookTo, seconds),
    flash: (text, seconds) => sceneFlash(text, seconds)
  };
  avisoEl.style.display = 'none'; avisoUntil = 0;   // limpia el aviso al cambiar de escena
  current = def.build(ctx);

  // CHAPITA DE PARTE: código de escena + audio en vivo + botón "📋 Copiar" para
  // pegarme el momento exacto (escena, audio, posición) y así iterar en el sitio.
  sceneTag?.dispose();
  sceneTag = mountSceneTag({
    id: `E${def.numero}`, nombre: def.titulo, tramo: 'T5–10', modo: amb, hilo: 'min05',
    archivo: `escena${def.id.replace(/^m05_/, '')}.ts`,
    getAudio: () => sound.nowPlaying(),
    getPos: () => ({ x: controller.pos.x, z: controller.pos.z }),
    getExtra: () => `objetivo: ${def.objetivo.texto}`
  });

  // Límites del área: los de la escena si los define (corredor acotado, evita
  // rodear el sigilo por el borde); si no, se derivan del spawn/objetivo.
  if (def.bounds) controller.setBounds(def.bounds.minX, def.bounds.maxX, def.bounds.minZ, def.bounds.maxZ);
  else controller.setBounds(-72, 72, def.spawn.z - 8, (def.objetivo.target?.z ?? def.spawn.z) + 26);
  controller.teleport(def.spawn.x, def.spawn.z);

  if (def.camara) { tpcam.yaw = def.camara.yaw ?? Math.PI; tpcam.pitch = def.camara.pitch ?? 0.4; tpcam.dist = def.camara.dist ?? 28; }

  titleEl.textContent = `Escena ${def.numero} · ${def.titulo}`;
  objEl.textContent = def.objetivo.tipo === 'cinematica' ? '' : '🎯 ' + def.objetivo.texto;
  objEl.style.display = def.objetivo.tipo === 'cinematica' ? 'none' : 'block';
  subEl.textContent = def.subtitulo;
  flashEl.textContent = '';
  // intro cinemática: se dispara ya si el juego arrancó (o en modo captura);
  // en la PRIMERA escena espera a "empezar" para no reproducirse tras el overlay.
  pendingIntro = def.intro ?? null;
  if (pendingIntro && (started || shotMode)) fireIntro();
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
  // reproduce el recorte de voz/BSO de la escena actual (voz_NN). Si el recorte
  // aún no está en clips.ts, no suena (queda el ambiente) — el audio se mete después.
  if (currentDef) startSceneFilm(currentDef);
  void sound.preloadClip('m0510_14_avion'); // el "¡un avión!" para el gag (esc. 14)
  if (currentDef) sound.setAmbience(currentDef.ambiente ?? (currentDef.noche ? 'night' : 'day'));
  started = true;
  fireIntro();   // intro cinemática de la primera escena, ya con el juego activo
  startEl.style.opacity = '0'; setTimeout(() => startEl.remove(), 420);
};
startEl.addEventListener('pointerdown', startGame, { once: true });
addEventListener('keydown', () => { if (sound.ready) return; startGame(); }, { once: true });

// escena inicial
const params = new URLSearchParams(location.search);
const startNum = parseInt(params.get('scene') || '', 10);
const startIdx = Number.isFinite(startNum) ? MIN05_SCENES.findIndex((s) => s.numero === startNum) : 0;
loadScene(startIdx >= 0 ? startIdx : 0);
if (params.get('shot') === '1') { startEl.remove(); } // capturas: sin overlay

addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); fx.setSize(innerWidth, innerHeight); });

let last = 0;
function animate(now: number): void {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;

  if (avisoUntil && now >= avisoUntil) { avisoEl.style.display = 'none'; avisoUntil = 0; }
  const cine = cineCam.active;
  // durante la cinemática el jugador NO se mueve (solo mira); si no, control normal
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

    // BALIZA: objetivo dinámico (hud.goal) o el target de la escena; oculta en
    // cinemática, al completar, o si no hay objetivo (p. ej. escena cinemática).
    const gt = Array.isArray((h as { goal?: [number, number] }).goal)
      ? (h as { goal?: [number, number] }).goal!
      : (currentDef.objetivo.target ? [currentDef.objetivo.target.x, currentDef.objetivo.target.z] as [number, number] : null);
    if (cine || done || currentDef.objetivo.tipo === 'cinematica') navBeacon.hide();
    else navBeacon.update(now / 1000, controller.pos.x, controller.pos.z, gt, !!h.prompt);

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

  // ---- Cámara ---- (si hay cinemática la controla el helper; si no, la normal)
  if (!cineCam.update(dt, controller.pos.x, controller.pos.z)) tpcam.update(controller.pos);
  fx.render();   // acabado precioso (bloom+SMAA+ACES) en vez de renderer.render(scene,camera)
}
function setBar(b: { wrap: HTMLDivElement; fill: HTMLDivElement; lab: HTMLDivElement }, v?: number): void {
  if (v === undefined || v <= 0.001) { b.wrap.style.display = 'none'; b.lab.style.display = 'none'; return; }
  b.wrap.style.display = 'block'; b.lab.style.display = 'block'; b.fill.style.width = `${THREE.MathUtils.clamp(v, 0, 1) * 100}%`; b.fill.style.marginLeft = '0';
}
requestAnimationFrame(animate);

(window as any).__READY__ = true;
(window as any).__filmReady = () => sound.ready;
// hooks de depuración/captura
(window as any).__setPlayer = (x: number, z: number) => controller.teleport(x, z);
(window as any).__pos = () => ({ x: controller.pos.x, z: controller.pos.z });
(window as any).__cine = () => (cineCam.active ? 1 : 0);
// === JUGADOR SINTÉTICO / QA de niño (rol reutilizable, ver coordinacion/playtester.md) ===
// Contrato ACORDADO con el hilo Segundo Cerebro / Eli (coordinacion/segundo-cerebro.md):
// __probe() estado para guiarse (pos/goal como [x,z]); __walk(x,z,step)->bool "llegó"
// (anda respetando colisión, no teletransporta); __act()/__interact() pulsan "E";
// __jump() salta. Es aditivo: no toca el juego.
(window as any).__walk = (x: number, z: number, step = 0.9): boolean => {
  controller.stepToward(x, z, step);
  return Math.hypot(controller.pos.x - x, controller.pos.z - z) <= step;
};
(window as any).__interact = () => { interactFlag = true; };
(window as any).__act = () => { interactFlag = true; };
(window as any).__jump = () => { controller.touch.jump = true; };
(window as any).__probe = () => {
  const p = controller.pos; const def = currentDef;
  const hud = (current && current.hud) ? current.hud() : {};
  const tgt = def?.objetivo?.target;
  return {
    numero: def?.numero ?? null,
    titulo: def?.titulo ?? null,
    tipo: def?.objetivo?.tipo ?? null,            // 'ir_a' | 'sigilo' | 'equilibrio' | ...
    objetivo: def?.objetivo?.texto ?? null,       // texto del objetivo
    pos: [+p.x.toFixed(1), +p.z.toFixed(1)],       // [x,z]
    // objetivo dinámico: si la escena publica hud.goal (p. ej. el siguiente espía
    // por saludar), manda ese; si no, el target estático del objetivo. [x,z]
    goal: (Array.isArray(hud.goal) ? hud.goal : (tgt ? [tgt.x, tgt.z] : null)),
    radio: def?.objetivo?.radio ?? null,
    done: current ? current.isDone(controller.pos) : false,
    prompt: hud.prompt ?? null,                   // acción necesaria (p. ej. "Pulsa E")
    alarm: hud.alarm ?? 0,                         // sigilo: 0..1
    balance: hud.balance ?? null,                  // equilibrio (esc13): -1..1
    progress: hud.progress ?? 0,
    gems: hud.gems ?? null,
    status: (current && current.status) ? current.status() : null,
    cine: cineCam.active ? 1 : 0
  };
};
