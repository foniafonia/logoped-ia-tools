import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { ThirdPersonCamera } from './camera/ThirdPersonCamera';
import { CharacterController } from './characters/CharacterController';
import { createMinifigure } from './characters/MinifigureFactory';
import { setupEnvironment } from './world/EnvironmentManager';
import { AudioManager } from './audio/AudioManager';
import { QUALITY, IS_MOBILE } from './core/Quality';
import { TouchControls } from './ui/TouchControls';
import { Dust } from './effects/Dust';
import { buildCamp, VILLAGER_SKIN } from './scenes/min00/camp';
import { CampLife } from './scenes/min00/campLife';
import { Journey } from './scenes/min00/journey';
import { buildHorizon } from './scenes/min00/horizon';
import { buildSky } from './scenes/min00/sky';
import { buildAtmosphere } from './scenes/min00/atmosphere';
import { StudioIntro } from './scenes/min00/studioIntro';
import { INTRO_VIDEO } from './video/intro';
import { Director, Beat } from './scenes/min00/Director';

const app = document.getElementById('app')!;

// ---- Renderer ----
const renderer = new THREE.WebGLRenderer({ antialias: !IS_MOBILE, powerPreference: 'high-performance' });
renderer.setPixelRatio(QUALITY.pixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;   // PILOTO "precioso": exposición cálida
renderer.shadowMap.enabled = QUALITY.shadows;
renderer.shadowMap.type = IS_MOBILE ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

// ---- Escena: atardecer dorado (campamento, minuto 0–5) ----
const DAY_SKY = new THREE.Color(0xf0d9a8);
const NIGHT_SKY = new THREE.Color(0x1a2340);
const scene = new THREE.Scene();
scene.background = DAY_SKY.clone();
// bruma que CIERRA el horizonte (mundo acotado, no infinito). Retirada un pelín
// (empieza a 58, no a 42) para que la neblina no tape la escena al mirar al norte
// hacia la caravana (petición del cerebro / playtest de Eli), sin perder el "mundo
// acotado" ni el efecto de la caravana perdiéndose a lo lejos.
const FOG_FAR = Math.min(QUALITY.fogFar, 175);
scene.fog = new THREE.Fog(DAY_SKY.clone(), 58, FOG_FAR);
if (QUALITY.envMap) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
}

const camera = new THREE.PerspectiveCamera(IS_MOBILE ? 62 : 52, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 6, 24);
const tpcam = new ThirdPersonCamera(camera, renderer.domElement);
(window as any).__tpcam = tpcam;

// === PILOTO "PRECIOSO" (solo 0-5, acotado; petición del cerebro) ===
// Post-proceso cinemático: bloom suave + SMAA sobre el render ACES/IBL ya existente.
// GATED a desktop: en móvil el post es caro → se mantiene el render directo.
const PRECIOSO = !IS_MOBILE;
let composer: EffectComposer | null = null;
if (PRECIOSO) {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.32, 0.5, 0.85)); // bloom suave
  composer.addPass(new SMAAPass(innerWidth, innerHeight));
  composer.addPass(new OutputPass());
}

// ---- Luz de atardecer ----
const hemi = new THREE.HemisphereLight(0xffe9c0, 0xa9895f, 0.46);   // algo menos plano (el rim aporta)
scene.add(hemi);
const key = new THREE.DirectionalLight(0xffd9a0, 3.0);
key.position.set(-18, 14, 16);
key.castShadow = QUALITY.shadows;
key.shadow.mapSize.set(QUALITY.shadowMap, QUALITY.shadowMap);
key.shadow.camera.near = 1; key.shadow.camera.far = 160;
key.shadow.camera.left = -60; key.shadow.camera.right = 60;
key.shadow.camera.top = 60; key.shadow.camera.bottom = -30;
key.shadow.bias = -0.0002; key.shadow.normalBias = 0.02;
scene.add(key);
// Contraluz cálido (rim/back light): separa las figuras y tiendas del fondo y da
// profundidad de atardecer. Sin sombras (barato). Pase senior de mood.
const rim = new THREE.DirectionalLight(0xffb066, 1.15);
rim.position.set(26, 9, -22);
scene.add(rim);

const plastic = new PlasticMaterialFactory();
// PILOTO "precioso": plástico que refleja el IBL (clearcoat + más reflejo). Solo desktop.
if (PRECIOSO && QUALITY.envMap) plastic.update({ roughness: 0.28, clearcoat: 0.6, envMapIntensity: 1.5 });

// === ENTORNO + CAMPAMENTO + VIDA + VIAJE ===
setupEnvironment(scene);
buildHorizon(scene);                                        // cerros de arenisca que acotan el valle
const sky = buildSky(scene);                                // telón de montañas + nubes de juguete
const camp = buildCamp(scene, plastic);
const atmo = buildAtmosphere(scene, camp.fires, camp.flags);  // humo + pájaros + banderas ondeando
const dust = new Dust(scene);
const life = new CampLife(scene, plastic, dust);           // aldeanos, animales, gag del beduino
const journey = new Journey(scene, plastic);               // río Jordán + Jericó + caravana (ocultos)
const studio = new StudioIntro(scene, plastic);            // plató de cine (cinemática de apertura)
let introActiva = false;                                   // true durante la intro del estudio
(window as any).__life = life; (window as any).__journey = journey;

// === JUGADOR: un joven levita del campamento ===
const villager = createMinifigure(plastic, VILLAGER_SKIN);
scene.add(villager.root);
const controller = new CharacterController(villager);
// terreno abierto: del fondo del campamento (+z) hasta la orilla del Jordán (−z)
controller.bounds = { minX: -88, maxX: 88, minZ: Journey.ORILLA_Z + 2, maxZ: 88 };
controller.pos.set(0, 0, 64);
const esMovil = IS_MOBILE || 'ontouchstart' in window;
let touchCreado = false;   // los controles táctiles se crean al terminar la intro
(window as any).__spy = villager; (window as any).__ctrl = controller;

// === Baliza del objetivo (anillo + flecha que bota) ===
const beacon = new THREE.Group();
const ring = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.14, 10, 28),
  new THREE.MeshBasicMaterial({ color: 0x8fe0ff, transparent: true, opacity: 0.9 }));
ring.rotation.x = Math.PI / 2;
const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 1.4, 22, 16, 1, true),
  new THREE.MeshBasicMaterial({ color: 0x8fe0ff, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false }));
beam.position.y = 11;
const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.3, 4), new THREE.MeshBasicMaterial({ color: 0x8fe0ff }));
arrow.rotation.x = Math.PI; arrow.position.y = 4;
beacon.add(ring, beam, arrow);
beacon.visible = false;
scene.add(beacon);
let target: { x: number; z: number } | null = null;
const setTarget = (t: { x: number; z: number } | null): void => {
  target = t;
  if (t) { beacon.position.set(t.x, 0, t.z); beacon.visible = true; } else beacon.visible = false;
};

// === Zona de carga del camello (solo en el mini-juego de bultos) ===
// Un tapiz dorado en el suelo junto al camello + flecha que bota: deja CLARÍSIMO
// dónde llevar los bultos (antes no se entendía qué hacer con los camellos).
const loadPad = new THREE.Group();
const padRing = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.2, 10, 32),
  new THREE.MeshBasicMaterial({ color: 0xffd34d, transparent: true, opacity: 0.95 }));
padRing.rotation.x = Math.PI / 2; padRing.position.y = 0.12;
const padDisc = new THREE.Mesh(new THREE.CircleGeometry(2.5, 28),
  new THREE.MeshBasicMaterial({ color: 0xffd34d, transparent: true, opacity: 0.18, side: THREE.DoubleSide }));
padDisc.rotation.x = -Math.PI / 2; padDisc.position.y = 0.06;
const padArrow = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.2, 4), new THREE.MeshBasicMaterial({ color: 0xffd34d }));
padArrow.rotation.x = Math.PI; padArrow.position.y = 5.2;
loadPad.add(padRing, padDisc, padArrow);
loadPad.position.set(0, 0, 0); loadPad.visible = false;
scene.add(loadPad);

// === AUDIO: la narración real es la columna vertebral del tramo ===
const audio = new AudioManager();
(window as any).__audio = audio;

// === DIRECTOR: beats acompasados al reloj del audio ===
const YEHOSHUA = { x: 0, z: 8 };
let ropesActivas = false;
let nightF = 0;            // 0 = día, 1 = noche (rampa al beat final)
let goNight = false;

// termina la cinemática de estudio y devuelve el control al jugador en el campamento
function terminarIntro(): void {
  if (!introActiva) return;
  introActiva = false;
  studio.setActive(false);
  villager.root.visible = true;
  if (esMovil && !touchCreado) { new TouchControls(controller, { shofar: false, attack: false }); touchCreado = true; }  // controles al empezar a jugar
}

// Beats con los TIEMPOS OFICIALES del desglose de la peli (escenas 01–08)
const beats: Beat[] = [
  // — INTRO DE ESTUDIO (esc. 01–02) —
  { t: 0, sub: '«Construyendo la Conquista de Israel»', obj: '' },
  { t: 15, sub: '—¡Deja de quejarte y a grabar! 🎬', obj: '' },
  // — CAMPAMENTO (esc. 03–08) —
  {
    t: 25, sub: 'El gran campamento de Israel.',
    obj: '', onEnter: () => terminarIntro()
  },
  {
    t: 45, sub: '¡Yehoshúa arenga al pueblo!',
    obj: 'Ve con Yehoshúa', onEnter: () => { terminarIntro(); setTarget(YEHOSHUA); }
  },
  {
    t: 55, sub: '¡A recoger el campamento!',
    obj: `Recoge las cuerdas (0/${camp.ropes.length})`,
    onEnter: () => { ropesActivas = true; camp.ropes.forEach((r) => { if (r.userData.hint) r.userData.hint.visible = true; }); setTarget(done.has('yeh') ? null : YEHOSHUA); }   // si aún no saludó, la baliza sigue en Yehoshúa
  },
  {
    t: 123, sub: 'El pan sale del horno. ¡Atrápalo! 🥖',
    // sin `obj`: el pan ESPERA a que se termine el campamento (no se solapan mini-juegos)
    onEnter: () => { panPedido = true; }
  },
  {
    t: 133, sub: '¡Se cayó la carga del camello! 💥',
    // sin `obj`: el objetivo lo pone el mini-juego al activarse (los bultos esperan al pan)
    onEnter: () => { life.derrumbar(); bultosPedidos = true; }   // gag automático; los bultos esperan a que acabe el pan
  },
  {
    t: 228, sub: 'La caravana está casi lista para partir…',
    // sin `obj`: la caravana ESPERA a que acabes los mini-juegos (no secuestra); el gate del
    // bucle la arranca cuando estén hechos (o con un salvavidas de tiempo).
    onEnter: () => { caravanaPedida = true; }
  }
];
const director = new Director(beats, null, () => finDelTramo());
(window as any).__director = director;

// pantalla de recompensa al terminar el tramo. La peli SIGUE acompasada (no se
// gatea), pero el PREMIO depende de las tareas hechas → hay motivo para jugar
// (opción B acordada con el usuario). Si no juegas, llegas igual pero sin fiesta.
const TAREAS_TRAMO: Array<[string, string]> = [
  ['yeh', 'saludar a Yehoshúa'],
  ['camp', 'recoger el campamento'],
  ['tab', 'atrapar el pan del horno'],
  ['bultos', 'cargar la caravana'],
  ['carav', 'seguir a la caravana']
];
let spine: { stop: () => void } | null = null;   // control del audio narración (para cortarlo al cerrar)
let tramoCerrado = false;
let caravanaPedida = false;      // beat 7 pedido; la caravana ESPERA a los mini-juegos (no secuestra)
let caravanaEnMarcha = false;
function finDelTramo(): void {
  if (tramoCerrado) return;      // cierre idempotente (lo puede disparar el jugador o el fin del audio)
  tramoCerrado = true;
  spine?.stop();                 // corta el audio → no suena la cola "vamos a cambiarnos" (es del 5-10)
  const total = TAREAS_TRAMO.length;
  const hechas = TAREAS_TRAMO.filter(([k]) => done.has(k)).length;
  const faltan = TAREAS_TRAMO.filter(([k]) => !done.has(k)).map(([, n]) => n);
  const todo = hechas === total;

  if (todo) { director.confetti(90); audio.sfxSuccess(); }
  else if (hechas > 0) { director.confetti(28); audio.sfxSuccess(); }
  // si no hizo nada: sin confeti ni fanfarria (premio ligado al juego)

  const titulo = todo ? '¡Lo hiciste TODO! 🎉' : hechas > 0 ? '¡Buen trabajo!' : 'Llegaste al final…';
  const cuerpo = todo
    ? 'Preparaste el campamento y la caravana parte hacia el <b>río Jordán</b>. ¡Eres un fenómeno!<br>👉 La aventura sigue en el <b>río con los dos espías</b> (min 5–10).'
    : hechas > 0
      ? `Hiciste <b>${hechas} de ${total}</b> tareas. Te faltó: <b>${faltan.join(', ')}</b>.<br>¿Lo intentas otra vez y las haces todas?`
      : `Casi no jugaste: te quedaron todas las tareas (${faltan.join(', ')}).<br>¡Vuelve a intentarlo y ayuda al campamento!`;
  const btnTxt = todo ? '↻ Jugar otra vez' : '↻ Intentarlo de nuevo';

  const fin = document.createElement('div');
  fin.innerHTML =
    '<div style="text-align:center;color:#f4e9d2;font-family:system-ui,sans-serif;padding:24px;max-width:520px">' +
    '<div style="font:800 30px/1.1 Georgia,serif;color:#e8b04b">' + titulo + '</div>' +
    '<div style="font:800 40px system-ui;margin:14px 0">⭐ ' + director.starCount + ' / ' + total + '</div>' +
    '<div style="opacity:.9;margin:0 0 20px">' + cuerpo + '</div>' +
    '<button id="reBtn" style="font:800 20px/1 system-ui;color:#0a0705;background:#e8b04b;border:none;border-radius:14px;padding:14px 26px;cursor:pointer">' + btnTxt + '</button></div>';
  Object.assign(fin.style, {
    position: 'fixed', inset: '0', zIndex: '60', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'radial-gradient(120% 100% at 50% 0%, #23324f, #0a0f18 78%)',
    opacity: '0', transition: 'opacity .6s'
  } as CSSStyleDeclaration);
  document.body.appendChild(fin);
  requestAnimationFrame(() => { fin.style.opacity = '1'; });
  fin.querySelector('#reBtn')?.addEventListener('pointerdown', () => location.reload());
}

// jugosidad: sonidos, estelas y reacciones
let wasDragging = false;         // cámara: para detectar cuándo SUELTAS el arrastre
let camRecenter = false;         // cámara: recentrado de una sola vez en curso
let camTarget = 0;               // cámara: yaw objetivo (congelado al soltar → no persigue)
let trailCd = 0;                 // temporizador de la estela de polvo
let waveT = 0;                   // Yehoshúa saludando
let ropesHechas = false;         // fase A (cuerdas) completada → empieza el arreo
let herdStart = 0;               // marca de tiempo al arrancar el arreo (contrarreloj)
const HERD_LIMIT = 30;           // segundos "objetivo" para arrear rápido (sin castigo)
let bultosActivos = false;       // mini-juego de cargar la caravana
let cargandoBulto: THREE.Mesh | null = null;   // bulto que el jugador lleva en brazos
const CARGA_DEST = { x: 26.5, z: 33 };          // junto al camello del beduino (zona de carga)
const baa = (): void => { /* las ovejas saltan sin sonido (fuera musiquita sintética) */ };
const entregados = new Set<THREE.Mesh>();       // bultos ya apilados en el camello

// ---- MINI-JUEGO: ¡ATRAPA EL PAN! (esc. 06) — el horno lanza panes por el aire ----
let panActivos = false;
let panPedido = false;                          // beat 5 pedido; el pan espera a terminar el campamento
let bultosPedidos = false;                      // beat 6 pedido; se activa al acabar el pan
let panLaunchCd = 0;                            // cadencia de lanzamiento
let panNextIdx = 0;                             // siguiente pan a lanzar
const OVEN_MOUTH = { x: -6, y: 2.2, z: 56 };    // boca del horno (de donde salen los panes)
function objPan(caz: number): void { director.setObjetivo(`🥖 ¡Atrapa el pan! (${caz}/${camp.panes.length})`); }
function activarPan(): void {
  panActivos = true; panLaunchCd = 0.4; panNextIdx = 0;
  setTarget(null);                              // sin baliza: las flechas 🔻 sobre cada pan guían
  objPan(0);
}
/** El horno "escupe" el siguiente pan en un arco hacia el campo abierto. */
function lanzarPan(): void {
  const m = camp.panes[panNextIdx++];
  m.visible = true; m.userData.flying = true; m.userData.caught = false;
  m.position.set(OVEN_MOUTH.x, OVEN_MOUTH.y, OVEN_MOUTH.z);
  const ang = (Math.random() - 0.5) * 1.4;
  m.userData.vel = { vx: Math.sin(ang) * 3.5, vy: 12.5 + Math.random() * 3, vz: -(3 + Math.random() * 3) };  // arco alto y atrapable
  if (m.userData.hint) m.userData.hint.visible = true;
  dust.burst(OVEN_MOUTH.x, OVEN_MOUTH.y, OVEN_MOUTH.z, 8);   // puff del horno
  audio.sfxPickup();
}

// mini-juego "carga la caravana" — VERBO REAL: coge un bulto y LLÉVALO al camello.
function bultosEntregados(): number { return entregados.size; }
function actualizarObjBultos(): void {
  if (director.beatIndex !== 6) return;
  const got = bultosEntregados();
  director.setObjetivo(cargandoBulto
    ? `🐫 Llévalo al tapiz dorado, junto al camello (${got}/${camp.bultos.length})`
    : `📦 Coge un bulto (🔵) y llévalo al camello (${got}/${camp.bultos.length})`);
}
// La baliza guía el verbo: si llevas un bulto → apunta al camello; si no → al bulto más cercano.
function balizaBulto(): void {
  if (cargandoBulto) { setTarget(CARGA_DEST); return; }
  let best: THREE.Mesh | null = null, bd = 1e9;
  for (const b of camp.bultos) {
    if (entregados.has(b) || b === cargandoBulto) continue;
    const d = controller.pos.distanceTo(b.position);
    if (d < bd) { bd = d; best = b; }
  }
  setTarget(best ? { x: best.position.x, z: best.position.z } : null);
}
function activarBultos(): void {
  bultosActivos = true;
  for (const b of camp.bultos) b.visible = true;      // aparecen con su flecha-pista (🔵)
  loadPad.position.set(CARGA_DEST.x, 0, CARGA_DEST.z); // tapiz dorado junto al camello
  loadPad.visible = true;
  actualizarObjBultos(); balizaBulto();
}
/** Apila el bulto entregado sobre el tapiz (feedback visible: el camello se va cargando). */
function apilarBulto(b: THREE.Mesh): void {
  entregados.add(b);
  if (b.userData.hint) b.userData.hint.visible = false;   // ya no hay que cogerlo
  const n = entregados.size - 1;
  const col = n % 2, row = (n / 2) | 0;
  b.position.set(CARGA_DEST.x - 0.6 + col * 1.2, 0.7 + row * 0.85, CARGA_DEST.z);
  b.rotation.set(0, (n * 0.6), 0);
  b.visible = true;
}
const ovejaAlRedil = (): void => { audio.sfxPickup(); };   // pling discreto al meter una oveja

// hitos por jugador (una sola vez) — cada uno premia con sonido + estrella
const done = new Set<string>();
function checkTargets(): void {
  const p = controller.pos;
  const i = director.beatIndex;
  // acércate a Yehoshúa (esc. 04, beat 3). Se puede cumplir DESDE que empieza su
  // beat y HASTA que se logra (no solo durante los 10 s del beat): así el peque no
  // pierde la estrella sin aviso si tarda en llegar. (Recado de jugabilidad.)
  if (i >= 3 && !done.has('yeh') && Math.hypot(p.x - YEHOSHUA.x, p.z - YEHOSHUA.z) < 9) {   // radio amplio: Yehoshúa está en tarima, no hace falta pegarse
    done.add('yeh'); waveT = 2.2; audio.sfxSuccess(); director.star(); director.logro('¡Shalom! Yehoshúa te saluda');
    if (target) setTarget(null);
  }
  // (el Tabernáculo ya no es "visita": ahora es el oficio de llevarle el pan, más abajo)
  // sigue la caravana al norte (esc. 08, beat 7) → al alcanzarla, CIERRE limpio que
  // enlaza con el río (tras un ratito para verla alejarse). finDelTramo corta el audio.
  if (i >= 7 && caravanaEnMarcha && !done.has('carav') && p.z < Journey.MARCHA_Z + 3) {
    done.add('carav'); audio.sfxSuccess(); director.star();
    director.logro('¡Con la caravana rumbo al río! 🐫'); setTarget(null);
    setTimeout(() => finDelTramo(), 2600);
  }
}

// ---- Pantalla de inicio ----
const startEl = document.createElement('div');
startEl.innerHTML =
  '<div style="text-align:center;color:#f4e9d2;font-family:system-ui,sans-serif;padding:24px">' +
  '<div style="font:800 30px/1.1 Georgia,serif;color:#e8b04b;letter-spacing:2px">LA CONQUISTA DE ISRAEL</div>' +
  '<div style="opacity:.8;margin:10px 0 22px">Minuto 0–5 · Del campamento al río Jordán</div>' +
  '<button id="startBtn" style="font:800 20px/1 system-ui;color:#0a0705;background:#e8b04b;border:none;border-radius:14px;padding:16px 30px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.5)">▶ Empezar</button></div>';
Object.assign(startEl.style, {
  position: 'fixed', inset: '0', zIndex: '50', display: 'flex', alignItems: 'center',
  justifyContent: 'center', background: 'radial-gradient(120% 100% at 50% 0%, #3a2a12, #0a0705 72%)', transition: 'opacity .4s'
} as CSSStyleDeclaration);
document.body.appendChild(startEl);
startEl.addEventListener('pointerdown', () => {
  audio.init();
  startEl.style.opacity = '0';
  setTimeout(() => startEl.remove(), 420);
  // Entrega con el vídeo real de la peli como intro; si no, la intro 3D de estudio.
  if (INTRO_VIDEO) reproducirIntroVideo();
  else arrancarConEstudio3D();
}, { once: true });

// intro 3D de estudio (respaldo cuando no hay vídeo embebido)
function arrancarConEstudio3D(): void {
  spine = audio.playSpine('narracion_min0-5', 0.95); director.setSpine(spine);
  introActiva = true;
  studio.setActive(true);
  villager.root.visible = false;
  director.start();
}

// data:video → blob URL (más compatible con la política de contenido del artefacto)
function videoBlobUrl(dataUri: string): string {
  if (!dataUri.startsWith('data:')) return dataUri;
  try {
    const b64 = dataUri.slice(dataUri.indexOf(',') + 1);
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes], { type: 'video/mp4' }));
  } catch { return dataUri; }
}

// intro con el VÍDEO REAL de la peli (arranque: logo → título → estudio)
function reproducirIntroVideo(): void {
  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position: 'fixed', inset: '0', zIndex: '55', background: '#000',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  } as CSSStyleDeclaration);
  const v = document.createElement('video');
  v.src = videoBlobUrl(INTRO_VIDEO); v.autoplay = true; v.playsInline = true; v.setAttribute('playsinline', '');
  Object.assign(v.style, { maxWidth: '100%', maxHeight: '100%' } as CSSStyleDeclaration);
  const skip = document.createElement('button');
  skip.textContent = 'Saltar intro ▶';
  Object.assign(skip.style, {
    position: 'fixed', right: '16px', bottom: '16px', zIndex: '56', font: '700 16px system-ui, sans-serif',
    color: '#0a0705', background: '#e8b04b', border: 'none', borderRadius: '12px', padding: '10px 18px', cursor: 'pointer'
  } as CSSStyleDeclaration);
  let done = false;
  const fin = (): void => {
    if (done) return; done = true;
    try { v.pause(); } catch { /* noop */ }
    wrap.remove(); empezarJuegoTrasVideo();
  };
  v.onended = fin; skip.addEventListener('pointerdown', fin);
  wrap.append(v, skip); document.body.appendChild(wrap);
  v.play().catch(() => { /* si no arranca, el botón Saltar lleva al juego */ });
}

// al terminar el vídeo: entra al campamento y la narración continúa desde el seg 25
function empezarJuegoTrasVideo(): void {
  villager.root.visible = true;
  if (esMovil && !touchCreado) { new TouchControls(controller, { shofar: false, attack: false }); touchCreado = true; }
  audio.resume();   // el vídeo suspendió el contexto: hay que reanudarlo o no se oye
  spine = audio.playSpine('narracion_min0-5', 0.95, 25); director.setSpine(spine);
  director.start(25, 1);   // reloj en 25 s; el siguiente beat es el 2 (campamento)
}

// ---- Bucle ----
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer?.setSize(innerWidth, innerHeight);
});
let last = 0;
function animate(now: number): void {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;

  director.update();

  // — CINEMÁTICA DE ESTUDIO: cámara propia, sin gameplay —
  if (introActiva) {
    studio.update(dt, now / 1000, director.tiempo);
    studio.frameCamera(camera, director.tiempo);
    if (composer) composer.render(); else renderer.render(scene, camera);
    return;
  }

  const moving = controller.update(dt, tpcam.yaw);
  // Cámara: al SOLTAR el arrastre, vuelve UNA sola vez detrás del jugador (objetivo
  // congelado en ese instante → NO persigue → no marea). Antes perseguía en bucle y
  // "giraba como loca"; esto lo arregla. Si arrastras, no toca nada.
  if (tpcam.dragging) { camRecenter = false; }
  else if (wasDragging) { camTarget = villager.root.rotation.y; camRecenter = true; }   // soltaste → recentra
  wasDragging = tpcam.dragging;
  if (camRecenter) {
    let d = camTarget - tpcam.yaw;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    if (Math.abs(d) < 0.03) { camRecenter = false; } else tpcam.yaw += d * Math.min(1, dt * 4);
  }
  life.update(dt, now / 1000, controller.pos, baa, ovejaAlRedil);
  journey.update(dt, now / 1000);
  dust.update(dt);
  checkTargets();

  // estela de polvo al andar/correr (sensación de velocidad)
  trailCd -= dt;
  if (moving && trailCd <= 0) { dust.burst(controller.pos.x, 0.2, controller.pos.z, 3); trailCd = 0.14; }

  // Yehoshúa LLAMA con la mano desde el principio (hasta que le saludas) → el peque
  // ve a quién ir entre el gentío; al saludarle, saludo más enérgico un ratito.
  if (waveT > 0) { waveT -= dt; camp.yehoshua.armR.rotation.x = -2.2 + Math.sin(now * 0.02) * 0.5; }
  else if (director.beatIndex >= 3 && !done.has('yeh')) { camp.yehoshua.armR.rotation.x = -2.4 + Math.sin(now * 0.006) * 0.45; }

  // baliza
  if (beacon.visible) { ring.rotation.z += dt * 1.5; arrow.position.y = 4 + Math.sin(now * 0.004) * 0.4; }
  // tapiz de carga del camello (pulso + flecha que bota) — guía clara del destino
  if (loadPad.visible) {
    const pulse = 1 + Math.sin(now * 0.006) * 0.06;
    padRing.scale.set(pulse, pulse, 1);
    padArrow.position.y = 5.2 + Math.sin(now * 0.005) * 0.4;
  }

  // FASE A — recoger cuerdas (flotan e invitan a cogerlas)
  if (ropesActivas && !ropesHechas) {
    let left = 0;
    for (const rope of camp.ropes) {
      if (!rope.visible) continue;
      left++;
      rope.rotation.y += dt * 1.0;   // la soga gira despacio sobre el suelo
      rope.position.y = 0.32 + Math.sin(now * 0.004 + rope.position.x) * 0.15;
      const h = rope.userData.hint as THREE.Object3D | undefined;
      if (h) { h.rotation.y += dt * 2; h.position.y = Math.sin(now * 0.005 + rope.position.x) * 0.15; }
      if (controller.pos.distanceTo(rope.position) < 2.6) {
        rope.visible = false; left--;
        audio.sfxPickup();                                             // ¡pling!
        dust.burst(rope.position.x, 0.6, rope.position.z, 10);         // chispa
      }
    }
    const got = camp.ropes.length - left;
    // mientras no haya saludado a Yehoshúa, la guía SIGUE en él (no se pierde el saludo)
    if (director.beatIndex === 4) director.setObjetivo(done.has('yeh')
      ? `🎯 Recoge las cuerdas del campamento (${got}/${camp.ropes.length})`
      : '👋 Ve a saludar a Yehoshúa');
    if (got >= camp.ropes.length) {
      ropesHechas = true; audio.sfxSuccess(); director.star();
      director.logro('¡Cuerdas recogidas! Acércate a las ovejas para engancharlas y llévalas al redil 🐑');
      life.activarOvejas(); herdStart = now; setTarget(camp.ropes.length ? life.redil : null);
    }
  }
  // FASE B — ARREA A CONTRARRELOJ: mete las ovejas en el redil antes de que baje el reloj
  if (ropesHechas && !done.has('camp')) {
    const enRedil = life.ovejasEnRedil;
    const elapsed = (now - herdStart) / 1000;
    const queda = Math.max(0, HERD_LIMIT - elapsed);
    if (director.beatIndex === 4) {
      const reloj = queda > 0 ? `⏱ ${Math.ceil(queda)}s` : '⏱ ¡tú puedes!';
      director.setObjetivo(`🐑 Engancha las ovejas con la cuerda y llévalas al redil (${enRedil}/${life.ovejasObjetivo}) · ${reloj}`);
    }
    if (enRedil >= life.ovejasObjetivo) {
      done.add('camp'); audio.sfxSuccess(); director.star();
      // premio por rapidez: cuanto antes, más fiesta (sin castigo si tardas)
      if (elapsed < 14) { director.confetti(60); director.logro('¡RAPIDÍSIMO! 🐑⚡ ⭐⭐⭐'); }
      else if (elapsed < 24) { director.confetti(30); director.logro('¡Bien arreado! 🐑 ⭐⭐'); }
      else director.logro('¡Campamento recogido! 🎉');
      setTarget(null);
    }
  }

  // MINI-JUEGO: ¡ATRAPA EL PAN! (el horno lanza panes; corre a cazarlos; al vuelo = bonus)
  if (panActivos && !done.has('tab')) {
    if (panNextIdx < camp.panes.length) {   // ir lanzando panes en cadencia
      panLaunchCd -= dt;
      if (panLaunchCd <= 0) { lanzarPan(); panLaunchCd = 1.5; }
    }
    let cazados = 0;
    for (const b of camp.panes) {
      if (b.userData.caught) { cazados++; continue; }
      if (!b.visible) continue;             // aún dentro del horno
      const v = b.userData.vel as { vx: number; vy: number; vz: number };
      if (b.userData.flying) {
        v.vy -= 22 * dt;
        b.position.x += v.vx * dt; b.position.y += v.vy * dt; b.position.z += v.vz * dt;
        b.rotation.y += dt * 5;             // gira sobre su eje (la flecha sigue arriba)
        if (b.position.y <= 0.6) {          // toca suelo: rebota y acaba parándose
          b.position.y = 0.6; v.vy = Math.abs(v.vy) * 0.4; v.vx *= 0.5; v.vz *= 0.5;
          if (v.vy < 1.2) { b.userData.flying = false; v.vx = v.vy = v.vz = 0; }
        }
      } else {
        b.position.y = 0.6 + Math.abs(Math.sin(now * 0.005 + b.position.x)) * 0.12;   // botecito en el suelo
      }
      const h = b.userData.hint as THREE.Mesh | undefined;
      if (h) h.rotation.y += dt * 3;
      if (controller.pos.distanceTo(b.position) < 2.4) {          // ¡ATRAPADO!
        const alVuelo = b.userData.flying && b.position.y > 1.6;
        b.userData.caught = true; b.visible = false; if (h) h.visible = false; cazados++;
        dust.burst(b.position.x, b.position.y, b.position.z, 8);
        if (alVuelo) { audio.sfxSparkle(); director.confetti(10); director.logro('¡Al vuelo! 🥖'); }
        else audio.sfxPickup();
        objPan(cazados);
      }
    }
    if (cazados >= camp.panes.length) {
      done.add('tab'); audio.sfxSuccess(); director.star(); director.logro('¡Todo el pan atrapado! 🕍'); setTarget(null);
    }
  }
  // encadenado de mini-juegos (nunca dos a la vez, sin liar al peque):
  // el PAN espera a recoger el campamento; los BULTOS esperan a terminar el pan.
  if (panPedido && !panActivos && done.has('camp')) activarPan();
  if (bultosPedidos && !bultosActivos && done.has('tab')) activarBultos();
  // CARAVANA: NO secuestra. Espera a que estén hechos los mini-juegos (o un salvavidas de
  // tiempo para no dejar al peque atascado). Al arrancar, AVISA y guía a seguirla.
  if (caravanaPedida && !caravanaEnMarcha) {
    const listos = done.has('camp') && done.has('tab') && done.has('bultos');
    if (listos || director.tiempo > 272) {
      caravanaEnMarcha = true;
      journey.arrancarCaravana();
      camp.bultos.forEach((b) => { b.visible = false; });
      loadPad.visible = false;
      director.logro('¡La caravana se pone en marcha! ¡Síguela hacia el río! 🐫');
      director.setObjetivo('🐫 Sigue a la caravana');
      setTarget({ x: 0, z: Journey.MARCHA_Z });
    }
  }

  // mini-juego: CARGAR LA CARAVANA (verbo real: coge un bulto y llévalo al camello)
  if (bultosActivos && !done.has('bultos') && director.beatIndex === 6) {
    if (cargandoBulto) {
      // llevas un bulto: va en brazos (sobre el jugador) hasta que lo sueltas en el tapiz
      const b = cargandoBulto;
      b.position.set(controller.pos.x, 3.0, controller.pos.z);
      b.rotation.y += dt * 2;
      if (Math.hypot(controller.pos.x - CARGA_DEST.x, controller.pos.z - CARGA_DEST.z) < 3.5) {
        cargandoBulto = null;
        apilarBulto(b);                                    // ENTREGADO: se apila (el camello se carga)
        audio.sfxPickup(); dust.burst(CARGA_DEST.x, 1.0, CARGA_DEST.z, 12);
        actualizarObjBultos(); balizaBulto();
      }
    } else {
      // no llevas nada: los bultos por coger flotan e invitan (flecha 🔵); al tocar uno, lo coges
      for (const b of camp.bultos) {
        if (!b.visible || entregados.has(b)) continue;
        b.rotation.y += dt * 1.2;
        b.position.y = 0.7 + Math.sin(now * 0.004 + b.position.x) * 0.12;
        const h = b.userData.hint as THREE.Mesh | undefined;
        if (h) h.position.y = 2.6 + Math.sin(now * 0.006 + b.position.x) * 0.25;
        if (controller.pos.distanceTo(b.position) < 2.6) {
          cargandoBulto = b; audio.sfxPickup();            // ¡COGIDO! ahora llévalo
          if (h) h.visible = false;                        // ya lo llevas: fuera la pista
          actualizarObjBultos(); balizaBulto();
          break;
        }
      }
    }
    if (entregados.size >= camp.bultos.length) {
      done.add('bultos'); audio.sfxSuccess(); director.star(); director.logro('¡Caravana cargada! 🐫'); setTarget(null);
      loadPad.visible = false;
    }
  }

  // caída de la noche (rampa suave)
  if (goNight && nightF < 1) nightF = Math.min(1, nightF + dt * 0.5);
  if (nightF > 0) {
    (scene.background as THREE.Color).copy(DAY_SKY).lerp(NIGHT_SKY, nightF);
    (scene.fog as THREE.Fog).color.copy(DAY_SKY).lerp(NIGHT_SKY, nightF);
    key.intensity = 3.0 * (1 - nightF) + 0.5 * nightF;
    hemi.intensity = 0.55 * (1 - nightF) + 0.18 * nightF;
    renderer.toneMappingExposure = 1.05 * (1 - nightF) + 0.85 * nightF;
  }

  sky.update(dt, nightF);                                   // deriva de nubes + telón que oscurece de noche
  atmo.update(dt, now / 1000);                              // humo de fogatas + pájaros + banderas
  tpcam.update(controller.pos);
  if (composer) composer.render(); else renderer.render(scene, camera);
}
requestAnimationFrame(animate);

// === SONDEO DE QA / JUGADOR SINTÉTICO (aditivo, no afecta al juego) ===
// Devuelve el estado y "a dónde debería ir" un jugador guiado ahora mismo, para que
// un arnés de pruebas (o un "niño sintético") pueda jugar el tramo y opinar.
(window as any).__probe = () => {
  const p = controller.pos;
  const nearest = (arr: Array<{ x: number; z: number }>): { x: number; z: number } | null => {
    let best: { x: number; z: number } | null = null, bd = 1e9;
    for (const o of arr) { const d = (o.x - p.x) ** 2 + (o.z - p.z) ** 2; if (d < bd) { bd = d; best = o; } }
    return best;
  };
  let goal: { x: number; z: number } | null = target ? { x: target.x, z: target.z } : null;
  let fase = 'explorar';
  if (director.beatIndex >= 3 && !done.has('yeh')) { goal = YEHOSHUA; fase = 'saludar-yehoshua'; }   // el saludo va primero
  else if (cargandoBulto) { goal = CARGA_DEST; fase = 'llevar-bulto'; }
  else if (panActivos && !done.has('tab')) {
    fase = 'atrapar-pan';
    const c = nearest(camp.panes.filter((m) => m.visible && !m.userData.caught).map((m) => ({ x: m.position.x, z: m.position.z })));
    if (c) goal = c;
  } else if (bultosActivos && !done.has('bultos')) {
    fase = 'cargar-camello';
    const c = nearest(camp.bultos.filter((m) => m.visible && !entregados.has(m)).map((m) => ({ x: m.position.x, z: m.position.z })));
    if (c) goal = c;
  } else if (ropesActivas && !ropesHechas) {
    fase = 'recoger-cuerdas';
    const c = nearest(camp.ropes.filter((m) => m.visible).map((m) => ({ x: m.position.x, z: m.position.z })));
    if (c) goal = c;
  } else if (ropesHechas && !done.has('camp')) {
    fase = 'enganchar-ovejas';
    // cuerda-imán: si queda alguna SIN enganchar → ve a por ella; si ya la llevas → al redil
    const libres = life._targets.filter((s) => !s.penned && !s.leashed);
    if (libres.length) { const c = nearest(libres); if (c) goal = c; }
    else goal = life.redil;
  }
  return {
    beat: director.beatIndex, t: Math.round(director.tiempo),
    fase, pos: [Math.round(p.x), Math.round(p.z)],
    goal: goal ? [Math.round(goal.x), Math.round(goal.z)] : null,
    stars: director.starCount, done: [...done],
    pan: [camp.panes.filter((m) => m.userData.caught).length, camp.panes.length],
    sheep: [life.ovejasEnRedil, life.ovejasObjetivo],
    bultos: [entregados.size, camp.bultos.length]
  };
};
/** Mueve al jugador un paso hacia (x,z) — anda, no teletransporta (para el arnés). */
(window as any).__walk = (x: number, z: number, step: number): boolean => {
  const p = controller.pos; const dx = x - p.x, dz = z - p.z; const d = Math.hypot(dx, dz);
  if (d < 0.05) return true;
  const s = Math.min(step, d); p.x += dx / d * s; p.z += dz / d * s;
  villager.root.rotation.y = Math.atan2(dx, dz);
  return d <= step;
};
(window as any).__READY__ = true;
