import * as THREE from 'three';
import { setupPreciousRender } from './core/PreciousRender';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { ThirdPersonCamera } from './camera/ThirdPersonCamera';
import { CharacterController } from './characters/CharacterController';
import { createMinifigure, Minifigure, SPY_CAMP_SKIN, SPY2_CAMP_SKIN } from './characters/MinifigureFactory';
import { setupEnvironment } from './world/EnvironmentManager';
import { AudioManager } from './audio/AudioManager';
import { QUALITY, IS_MOBILE } from './core/Quality';
import { TouchControls } from './ui/TouchControls';
import { Cutscene } from './ui/Cutscene';
import { Dialogue } from './ui/Dialogue';
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
import { startTramoRunner } from './runner';
import { installDevHUD, saltoPedido, limpiarSalto, EstadoDev, DestinoDev } from './debug/DevHUD';
import { MIN05_SCENES } from './scenes/min05/registry';
import { MIN10_SCENES } from './scenes/min10/registry';
import { MIN15_SCENES } from './scenes/min15/registry';

const app = document.getElementById('app')!;

// ---- Renderer ----
const renderer = new THREE.WebGLRenderer({ antialias: !IS_MOBILE, powerPreference: 'high-performance' });
renderer.setPixelRatio(QUALITY.pixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.98;   // "precioso" bajado ~30% (menos brillo, más de juguete)
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
const FOG_FAR = Math.min(QUALITY.fogFar, 182);
scene.fog = new THREE.Fog(DAY_SKY.clone(), 68, FOG_FAR);   // bruma un pelín más lejos (petición del usuario: al mirar al norte a la caravana tapaba un poco); se mantiene el "mundo acotado"

const camera = new THREE.PerspectiveCamera(IS_MOBILE ? 62 : 52, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 6, 24);
const tpcam = new ThirdPersonCamera(camera, renderer.domElement);
(window as any).__tpcam = tpcam;

// === "PRECIOSO": acabado cinemático (helper COMPARTIDO core/PreciousRender) ===
// Piloto verificado del 0-5, ahora vía la pieza compartida (IBL + bloom + SMAA +
// tono ACES). GATED a desktop: en móvil se mantiene el render directo. Mantengo los
// valores exactos del piloto (exposición 1.05, bloom 0.32/0.5/0.85, IBL sigma 0.04).
const PRECIOSO = !IS_MOBILE;
const fx = PRECIOSO
  ? setupPreciousRender(renderer, scene, camera, {
      exposure: 0.98, iblSigma: 0.04, bloom: { strength: 0.22, radius: 0.5, threshold: 0.90 },   // "precioso" −30%: menos glow (bloom 0.32→0.22, umbral 0.85→0.90)
    })
  : null;

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
if (PRECIOSO && QUALITY.envMap) plastic.update({ roughness: 0.34, clearcoat: 0.42, envMapIntensity: 1.05 });   // reflejos/brillo −30% (clearcoat 0.6→0.42, envMap 1.5→1.05, algo menos pulido)

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
(window as any).__life = life; (window as any).__journey = journey; (window as any).__camp = camp;
// Helper de DIÁLOGO compartido (bocadillos) — disponible para todos los tramos.
// En el 0-5 aún no se usa (tiene su narración); lo dejo instanciado + hook de QA.
const dlg = new Dialogue();
(window as any).__dlg = dlg;

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

// === Botón "🪢 TIRA" para enganchar ovejas (petición del peque: que ÉL pulse para
// tirar de la cuerda y coger la oveja, en vez de que se pegue sola al acercarse) ===
// Se crea siempre (vale con dedo o con ratón); solo se muestra durante el arreo.
let grabReq = false;                          // se activa al pulsar; se consume cada frame
const grabBtn = document.createElement('button');
grabBtn.textContent = '🪢';
grabBtn.style.cssText = `position:fixed;right:26px;bottom:186px;width:88px;height:88px;
  border-radius:50%;background:rgba(120,80,40,.55);border:3px solid rgba(255,255,255,.4);
  font-size:36px;z-index:21;touch-action:none;box-shadow:0 3px 12px rgba(0,0,0,.45);
  display:none;transition:transform .08s,background .15s,box-shadow .15s;`;
const grabLabel = document.createElement('div');
grabLabel.textContent = 'TIRA (E)';
grabLabel.style.cssText = `position:fixed;right:26px;bottom:166px;width:88px;text-align:center;
  font:800 13px system-ui,sans-serif;color:#fff;text-shadow:0 1px 3px #000;z-index:21;
  display:none;pointer-events:none;letter-spacing:.05em;`;
const pressGrab = (): void => { grabReq = true; grabBtn.style.transform = 'scale(.86)'; };
grabBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); pressGrab(); });
grabBtn.addEventListener('pointerup', () => { grabBtn.style.transform = 'scale(1)'; });
document.body.appendChild(grabBtn); document.body.appendChild(grabLabel);
addEventListener('keydown', (e) => {
  const t = e.target as HTMLElement | null;   // no dispares el enganche si estás escribiendo una nota (E/Enter en el campo de texto)
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
  if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'KeyG') grabReq = true;
});
(window as any).__grab = pressGrab;   // para el playtester sintético

// === Botón 🎯 RECENTRAR cámara ===
// La cámara es LIBRE: se queda donde la dejes. Si te lías con la vista, este botón la
// vuelve a poner detrás del jugador de un solo toque (una vez, sin perseguir). Tecla: C.
const recenterBtn = document.createElement('button');
recenterBtn.textContent = '🎯';
recenterBtn.title = 'Poner la cámara detrás (C)';
recenterBtn.style.cssText = `position:fixed;right:26px;bottom:96px;width:64px;height:64px;
  border-radius:50%;background:rgba(30,60,90,.62);border:3px solid rgba(255,255,255,.4);
  font-size:28px;z-index:21;touch-action:none;box-shadow:0 3px 12px rgba(0,0,0,.45);
  display:none;transition:transform .08s,background .15s;`;
const pedirRecentrar = (): void => { recenterReq = true; recenterBtn.style.transform = 'scale(.86)'; };
recenterBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); pedirRecentrar(); });
recenterBtn.addEventListener('pointerup', () => { recenterBtn.style.transform = 'scale(1)'; });
document.body.appendChild(recenterBtn);
addEventListener('keydown', (e) => {
  const t = e.target as HTMLElement | null;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
  if (e.code === 'KeyC') recenterReq = true;
});

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
    obj: 'Ve con Yehoshúa', onEnter: () => { terminarIntro(); setTarget(YEHOSHUA); },
    gate: () => done.has('yeh')   // ESPERA: la historia no sigue hasta que saludes a Yehoshúa
  },
  {
    t: 55, sub: '¡A recoger el campamento!',
    obj: `Recoge las cuerdas (0/${camp.ropes.length})`,
    onEnter: () => { ropesActivas = true; camp.ropes.forEach((r) => { if (r.userData.hint) r.userData.hint.visible = true; }); setTarget(done.has('yeh') ? null : YEHOSHUA); },   // si aún no saludó, la baliza sigue en Yehoshúa
    gate: () => done.has('camp')   // ESPERA: recoger cuerdas + arrear las ovejas al redil
  },
  {
    t: 123, sub: 'El pan sale del horno. ¡Atrápalo! 🥖',
    // sin `obj`: el pan ESPERA a que se termine el campamento (no se solapan mini-juegos)
    onEnter: () => { panPedido = true; },
    gate: () => done.has('tab')   // ESPERA: atrapar todo el pan
  },
  {
    t: 133, sub: '¡Se cayó la carga del camello! 💥',
    // sin `obj`: el objetivo lo pone el mini-juego al activarse (los bultos esperan al pan)
    onEnter: () => { life.derrumbar(); bultosPedidos = true; },   // gag automático; los bultos esperan a que acabe el pan
    gate: () => done.has('bultos')   // ESPERA: cargar todos los bultos en la caravana
  },
  {
    t: 228, sub: 'La caravana está casi lista para partir…',
    // sin `obj`: la caravana ESPERA a que acabes los mini-juegos (no secuestra); el gate del
    // bucle la arranca cuando estén hechos (o con un salvavidas de tiempo).
    onEnter: () => { caravanaPedida = true; }
  }
];
const director = new Director(beats, null, () => lanzarOutro());   // al acabar la narración (o el último beat en mudo) → cierre con outro
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
let spine: { stop: () => void; fade?: (sec?: number) => void; pause?: () => void; resume?: () => void } | null = null;   // control del audio narración (cortar/fundir/pausar al cerrar/anotar)
let pausado = false;   // juego en pausa mientras se anota (nota del usuario: no mezclar)
(window as { __setPausa?: (v: boolean) => void }).__setPausa = (v: boolean): void => {
  pausado = !!v;
  director.setPausa(pausado);                              // congela el reloj de pared (build sin audio)
  if (pausado) spine?.pause?.(); else spine?.resume?.();   // congela también la narración (build con voz)
};
let tramoCerrado = false;
let hijacked = false;   // true cuando el RUNNER de tramos toma el control (0–5 termina)
let caravanaPedida = false;      // beat 7 pedido; la caravana ESPERA a los mini-juegos (no secuestra)
let caravanaEnMarcha = false;
// ---- ADELANTO DE LOS ESPÍAS: usa el helper compartido Cutscene ----------------
function dispararTeaserEspias(esFinal = false): void {
  if (teaserVisto) { if (esFinal) finDelTramo(); return; }   // una sola vez; si es el cierre, cerrar igual
  teaserVisto = true;
  journey.revelarRio();          // asoma el río Jordán + Jericó (el mundo del 5-10)
  // los dos espías, con su look real del 5-10 (piezas compartidas), cerca de la orilla
  espiaA = createMinifigure(plastic, SPY_CAMP_SKIN);
  espiaB = createMinifigure(plastic, SPY2_CAMP_SKIN);
  espiaA.root.position.set(-2.2, 0, ESPIA_Z0);
  espiaB.root.position.set(2.4, 0, ESPIA_Z0 + 1.8);
  espiaA.root.rotation.y = 0; espiaB.root.rotation.y = 0;   // miran al norte (−z, al agua)
  scene.add(espiaA.root); scene.add(espiaB.root);
  camSaved.yaw = tpcam.yaw; camSaved.pitch = tpcam.pitch; camSaved.dist = tpcam.dist;
  teaserClock = 0; teaserDustCd = 0;
  audio.sfxSparkle();
  // VOZ de la peli del reclutamiento («Necesito hombres discretos y valientes…») — es
  // el clip voz_10, que el AudioManager ya tiene cargado. Solo suena en la entrega
  // (con audio); en el build del repo no hace nada. Fix nota 22/23 (los espías salían mudos).
  audio.play('voz_10', 1.0, 12);
  cine.start({
    duration: TEASER_DUR,
    // TEASER CORTO (guiño "próximamente"), NO la escena de reclutamiento: esa es del
    // 5–10 (esc10). Aquí solo se engancha con la frase real y un vistazo al río.
    bannerHTML: '🎬 <b>PRÓXIMAMENTE</b> · <i>«Necesito hombres discretos y valientes que vayan a espiar la tierra…»</i><br>La misión de los dos espías en Jericó — <b>¡pronto la jugarás tú!</b> 🕵️🕵️',
    onFrame: (k, dt) => {
      teaserClock += dt;
      const z = ESPIA_Z0 + (ESPIA_Z1 - ESPIA_Z0) * k;          // avanzan hacia el agua
      if (espiaA) { espiaA.root.position.z = z; espiaA.update(dt, true, 1); }
      if (espiaB) { espiaB.root.position.z = z + 1.8; espiaB.update(dt, true, 1); }
      journey.update(dt, teaserClock);                          // deja subir el río + animar antorchas
      teaserDustCd -= dt;
      if (teaserDustCd <= 0 && espiaA) { dust.burst(espiaA.root.position.x, 0.2, espiaA.root.position.z + 0.6, 2); teaserDustCd = 0.25; }
      dust.update(dt);
      // cámara cinematográfica: dolly lento tras los espías, mirando al río
      const midZ = z + 0.9;
      camera.position.set(4 - k * 3, 6.4 - k * 0.8, midZ + 15 - k * 4);
      camera.lookAt(0, 1.8, midZ - 8);
    },
    onEnd: () => {
      tpcam.yaw = camSaved.yaw; tpcam.pitch = camSaved.pitch; tpcam.dist = camSaved.dist;   // restaura cámara
      if (espiaA) { scene.remove(espiaA.root); espiaA = null; }
      if (espiaB) { scene.remove(espiaB.root); espiaB = null; }
      if (esFinal) finDelTramo();   // el teaser es el CIERRE del 0–5 → ahora sí, pantalla de "Seguir"
    },
  });
}

// CIERRE del 0–5 (una sola vez): funde la voz (no corta a media frase), y lanza el
// guiño de los espías como remate; su onEnd abre la pantalla de "Seguir la aventura".
let outroLanzado = false;
function lanzarOutro(): void {
  if (outroLanzado || tramoCerrado) return;
  outroLanzado = true;
  setTarget(null);
  spine?.fade?.(1.6);                                    // funde la narración suavemente
  setTimeout(() => dispararTeaserEspias(true), 1700);   // deja terminar el fundido, luego el teaser
}

(window as any).__teaser = () => dispararTeaserEspias();   // hook de pruebas (playtester)
(window as any).__finDelTramo = () => finDelTramo();      // hook de pruebas: cierra el 0–5 y ofrece "Seguir"

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
    ? 'Preparaste el campamento y la caravana parte hacia el <b>río Jordán</b>. ¡Eres un fenómeno!'
    : hechas > 0
      ? `Hiciste <b>${hechas} de ${total}</b> tareas. Te faltó: <b>${faltan.join(', ')}</b>.`
      : `Casi no jugaste: te quedaron todas las tareas (${faltan.join(', ')}).`;

  const fin = document.createElement('div');
  fin.innerHTML =
    '<div style="text-align:center;color:#f4e9d2;font-family:system-ui,sans-serif;padding:24px;max-width:520px">' +
    '<div style="font:800 30px/1.1 Georgia,serif;color:#e8b04b">' + titulo + '</div>' +
    '<div style="font:800 40px system-ui;margin:14px 0">⭐ ' + director.starCount + ' / ' + total + '</div>' +
    '<div style="opacity:.9;margin:0 0 20px">' + cuerpo + '<br>👉 La aventura sigue en el <b>río con los dos espías</b>.</div>' +
    '<button id="goBtn" style="font:800 22px/1 system-ui;color:#0a0705;background:#e8b04b;border:none;border-radius:14px;padding:16px 30px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.5)">▶ Seguir la aventura 🕵️</button>' +
    '<div style="margin-top:14px"><button id="reBtn" style="font:700 14px/1 system-ui;color:#f4e9d2;background:transparent;border:1px solid rgba(244,233,210,.4);border-radius:10px;padding:8px 16px;cursor:pointer">↻ Repetir el campamento</button></div></div>';
  Object.assign(fin.style, {
    position: 'fixed', inset: '0', zIndex: '60', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'radial-gradient(120% 100% at 50% 0%, #23324f, #0a0f18 78%)',
    opacity: '0', transition: 'opacity .6s'
  } as CSSStyleDeclaration);
  document.body.appendChild(fin);
  requestAnimationFrame(() => { fin.style.opacity = '1'; });
  fin.querySelector('#reBtn')?.addEventListener('pointerdown', () => location.reload());
  // ▶ ENGANCHE CON EL RUNNER: el botón (clic real = gesto que desbloquea el audio)
  // apaga el bucle del 0–5 y arranca la aventura de los tramos 5–20 en el mismo lienzo.
  fin.querySelector('#goBtn')?.addEventListener('pointerdown', () => {
    hijacked = true;
    spine?.stop();
    fin.remove();
    // Traspaso limpio: oculta TODO el HUD/mandos/overlays del 0–5 (el runner monta los
    // suyos). Se mantiene solo el lienzo (#app, con el canvas del renderer compartido).
    beacon.visible = false; loadPad.visible = false;
    Array.from(document.body.children).forEach((el) => {
      if ((el as HTMLElement).id === 'app') return;
      (el as HTMLElement).style.display = 'none';
    });
    startTramoRunner(renderer);
  });
}

// jugosidad: sonidos, estelas y reacciones
let wasDragging = false;         // cámara: (sin uso ya; la cámara es libre) — se conserva por compat
let camRecenter = false;         // cámara: recentrado de una sola vez en curso (solo tras pulsar 🎯)
let camTarget = 0;               // cámara: yaw objetivo (congelado → no persigue)
let recenterReq = false;         // cámara: petición del botón 🎯 Recentrar (una sola vez)
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

// ---- ADELANTO DE LOS ESPÍAS (in-engine, AISLADO y SALTABLE) ----------------------
// Idea del peque: cuando Yehoshúa envía a los "hombres discretos", asomarse al
// siguiente mundo. La cámara "asoma" 6 s al río (ya construido) y ves a los DOS
// espías escabullirse hacia el agua, con un cartel. Luego vuelve al jugador.
// Se dispara UNA sola vez, al arrancar la caravana. Usa el helper compartido
// `Cutscene` (src/ui/Cutscene.ts), BLINDADO con su propio guard en el bucle → el
// gameplay NO corre mientras dura → NO toca ninguna variable del juego (estrellas,
// tareas, caravana…). Si algo fallara, la cámara vuelve y el nivel sigue igual.
const cine = new Cutscene();
let teaserVisto = false;
let teaserClock = 0;
const TEASER_DUR = 6.2;
let espiaA: Minifigure | null = null, espiaB: Minifigure | null = null;
const camSaved = { yaw: 0, pitch: 0, dist: 0 };
let teaserDustCd = 0;
// z de arranque de los espías (cerca de la orilla) y meta (al borde del agua)
const ESPIA_Z0 = -50, ESPIA_Z1 = -66;

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
  if (director.beatIndex < 6) return;   // sigue mostrándose aunque el reloj pase al beat 7
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

// === CARTAS DE AYUDA 🃏 — red de seguridad que SE GANA jugando ================
// Ganas 1 carta al completar cada minijuego; si te atascas, gastas una para que
// una "mano mágica" avance UN paso de la tarea. Si te quedas sin cartas y muy
// atascado, se regala una (nadie se bloquea). Sustituye al viejo salto por tiempo.
let cartas = 0;
let modoPequenin = false;   // modo por edad (se fija en la pantalla de inicio)
let esperandoAcc = 0;       // segundos que la historia lleva esperando (carta de cortesía)

const cartasEl = document.createElement('div');
Object.assign(cartasEl.style, {
  position: 'fixed', left: '14px', top: '48px', zIndex: '26', color: '#ffd76a',
  font: '800 20px system-ui, sans-serif', textShadow: '0 2px 6px rgba(0,0,0,.6)',
  transition: 'transform .18s', pointerEvents: 'none', display: 'none'
} as CSSStyleDeclaration);
document.body.appendChild(cartasEl);
function pintarCartas(): void { cartasEl.style.display = 'block'; cartasEl.textContent = `🃏 ${cartas}`; }
function ganarCarta(n = 1): void {
  cartas += n; pintarCartas();
  cartasEl.style.transform = 'scale(1.5)'; setTimeout(() => { cartasEl.style.transform = 'scale(1)'; }, 180);
  dust.burst(controller.pos.x, 2.2, controller.pos.z, 10); audio.sfxSparkle();   // ✨
}

const ayudaBtn = document.createElement('button');
ayudaBtn.textContent = '🃏 Ayuda';
Object.assign(ayudaBtn.style, {
  position: 'fixed', right: '16px', top: '96px', zIndex: '27', display: 'none',
  font: '800 15px system-ui', color: '#3a2a00', background: '#ffd76a', border: 'none',
  borderRadius: '12px', padding: '10px 14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,.4)'
} as CSSStyleDeclaration);
document.body.appendChild(ayudaBtn);
ayudaBtn.addEventListener('pointerdown', (ev) => { ev.preventDefault(); usarAyuda(); });

/** ¿Hay una tarea activa sin terminar ahora mismo? (para mostrar el botón 🃏). */
function tareaActivaPendiente(): boolean {
  const i = director.beatIndex;
  if (i >= 3 && !done.has('yeh')) return true;
  if (ropesActivas && !ropesHechas) return true;
  if (ropesHechas && !done.has('camp')) return true;
  if (panActivos && !done.has('tab')) return true;
  if (bultosActivos && !done.has('bultos')) return true;
  return false;
}

/** Saluda a Yehoshúa "por arte de magia" (carta de ayuda en la fase del saludo). */
function forzarSaludo(): void {
  if (done.has('yeh')) return;
  done.add('yeh'); waveT = 2.2; audio.sfxSuccess(); director.star();
  director.logro('¡Shalom! Yehoshúa te saluda 🃏'); setTarget(null);
}

/** Avanza UN paso la tarea activa. La detección normal de fin hace el resto. */
function avanzarUnPaso(): boolean {
  const i = director.beatIndex;
  if (i >= 3 && !done.has('yeh')) { forzarSaludo(); return true; }
  if (ropesActivas && !ropesHechas) {
    const r = camp.ropes.find((x) => x.visible);
    if (r) { r.visible = false; audio.sfxPickup(); dust.burst(r.position.x, 0.6, r.position.z, 10); return true; }
  }
  if (ropesHechas && !done.has('camp')) {
    const p = life.ayudaMeterUnaOveja();
    if (p) { audio.sfxAnimal(); dust.burst(p.x, 1.2, p.z, 10); return true; }
  }
  if (panActivos && !done.has('tab')) {
    const b = camp.panes.find((x) => x.visible && !x.userData.caught);
    if (b) { b.userData.caught = true; b.visible = false; audio.sfxPickup(); dust.burst(b.position.x, 1.4, b.position.z, 8); return true; }
  }
  if (bultosActivos && !done.has('bultos')) {
    const b = camp.bultos.find((x) => x.visible && !entregados.has(x));
    if (b) { entregados.add(b); apilarBulto(b); audio.sfxPickup(); dust.burst(CARGA_DEST.x, 1.0, CARGA_DEST.z, 10); return true; }
  }
  return false;
}

/** Gasta una carta para avanzar un paso (si tienes). */
function usarAyuda(): void {
  if (cartas <= 0) { director.logro('Gana cartas 🃏 terminando minijuegos'); return; }
  if (avanzarUnPaso()) { cartas--; pintarCartas(); esperandoAcc = 0; }
}

/** Gestión por frame del botón 🃏 y de la carta de cortesía (llamar con dt). */
function actualizarCartas(dt: number): void {
  if (tareaActivaPendiente()) {
    ayudaBtn.style.display = 'block';
    ayudaBtn.style.opacity = cartas > 0 ? '1' : '0.5';
    if (director.esperando) {
      esperandoAcc += dt;
      if (cartas === 0 && esperandoAcc > 75) { ganarCarta(1); director.logro('¡Una carta de regalo! 🃏 Úsala si te atascas'); esperandoAcc = 0; }
    } else esperandoAcc = Math.max(0, esperandoAcc - dt * 0.5);
  } else { ayudaBtn.style.display = 'none'; esperandoAcc = 0; }
}
function checkTargets(): void {
  const p = controller.pos;
  const i = director.beatIndex;
  // acércate a Yehoshúa (esc. 04, beat 3). Se puede cumplir DESDE que empieza su
  // beat y HASTA que se logra (no solo durante los 10 s del beat): así el peque no
  // pierde la estrella sin aviso si tarda en llegar. (Recado de jugabilidad.)
  if (i >= 3 && !done.has('yeh') && Math.hypot(p.x - YEHOSHUA.x, p.z - YEHOSHUA.z) < 9) {   // radio amplio: Yehoshúa está en tarima, no hace falta pegarse
    done.add('yeh'); waveT = 2.2; audio.sfxSuccess(); director.star(); director.logro('¡Shalom! Yehoshúa te saluda'); ganarCarta(modoPequenin ? 2 : 1);
    if (target) setTarget(null);
  }
  // (el Tabernáculo ya no es "visita": ahora es el oficio de llevarle el pan, más abajo)
  // sigue la caravana al norte (esc. 08, beat 7) → al alcanzarla, deja VER la caravana
  // alejarse un buen rato y LUEGO el cierre (funde voz + teaser). Antes cortaba a los 2,6s.
  if (i >= 7 && caravanaEnMarcha && !done.has('carav') && p.z < Journey.MARCHA_Z + 3) {
    done.add('carav'); audio.sfxSuccess(); director.star();
    director.logro('¡Con la caravana rumbo al río! 🐫'); setTarget(null);
    setTimeout(lanzarOutro, 6000);   // ~6s viendo la caravana marchar antes de cerrar
  }
}

// ---- Pantalla de inicio ----
const startEl = document.createElement('div');
startEl.innerHTML =
  '<div style="text-align:center;color:#f4e9d2;font-family:system-ui,sans-serif;padding:24px">' +
  '<div style="font:800 30px/1.1 Georgia,serif;color:#e8b04b;letter-spacing:2px">LA CONQUISTA DE ISRAEL</div>' +
  '<div style="opacity:.8;margin:10px 0 22px">Minuto 0–5 · Del campamento al río Jordán</div>' +
  '<button id="startBtn" style="font:800 20px/1 system-ui;color:#0a0705;background:#e8b04b;border:none;border-radius:14px;padding:16px 30px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.5)">▶ Empezar</button>' +
  '<div style="margin-top:16px"><button id="pequeninBtn" style="font:700 14px/1 system-ui;color:#f4e9d2;background:transparent;border:1px solid rgba(244,233,210,.4);border-radius:10px;padding:8px 16px;cursor:pointer">👶 Modo Pequeñín: OFF</button></div>' +
  '<div style="opacity:.55;font-size:12px;margin-top:8px">(Pequeñín: empiezas con cartas de ayuda 🃏)</div></div>';
Object.assign(startEl.style, {
  position: 'fixed', inset: '0', zIndex: '50', display: 'flex', alignItems: 'center',
  justifyContent: 'center', background: 'radial-gradient(120% 100% at 50% 0%, #3a2a12, #0a0705 72%)', transition: 'opacity .4s'
} as CSSStyleDeclaration);
document.body.appendChild(startEl);
// Toggle "Modo Pequeñín" (más cartas de ayuda). stopPropagation: no arranca el juego al tocarlo.
const pequeninBtn = startEl.querySelector('#pequeninBtn') as HTMLButtonElement | null;
pequeninBtn?.addEventListener('pointerdown', (ev) => {
  ev.stopPropagation();
  modoPequenin = !modoPequenin;
  pequeninBtn.textContent = `👶 Modo Pequeñín: ${modoPequenin ? 'ON' : 'OFF'}`;
  pequeninBtn.style.background = modoPequenin ? 'rgba(232,176,75,.3)' : 'transparent';
});
// ¿venimos de un SALTO del DevHUD (#go=…)? Reetiqueta el botón para que quede claro.
const saltoKey = saltoPedido();
if (saltoKey) {
  const btn = startEl.querySelector('#startBtn') as HTMLButtonElement | null;
  if (btn) {
    btn.textContent = '▶ Saltar aquí (dev)';
    setTimeout(() => {   // __destinos ya está definido tras evaluar el módulo
      const dest = ((window as any).__destinos?.() as DestinoDev[] | undefined)?.find((d) => d.key === saltoKey);
      if (dest) btn.textContent = '▶ ' + dest.label;
    }, 0);
  }
}
startEl.addEventListener('pointerdown', () => {
  if (saltoKey) { ejecutarSalto(saltoKey); return; }
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
  if (modoPequenin) cartas = 3;  // modo por edad: empieza con cartas de ayuda
  pintarCartas();
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
  if (modoPequenin) cartas = 3;  // modo por edad: empieza con cartas de ayuda
  pintarCartas();
  spine = audio.playSpine('narracion_min0-5', 0.95, 25); director.setSpine(spine);
  director.start(25, 1);   // reloj en 25 s; el siguiente beat es el 2 (campamento)
}

// === SALTO DIRECTO (DevHUD): al recargar con #go=<key>, el botón "Empezar" salta
// aquí (respeta el gesto que desbloquea el audio). "b<i>" = beat del 0–5; "s<n>" =
// escena de un tramo del runner. Es una herramienta de trabajo, no de juego. ===
function ejecutarSalto(key: string): void {
  limpiarSalto();
  audio.init();
  if (modoPequenin) cartas = 3; pintarCartas();
  startEl.style.opacity = '0'; setTimeout(() => startEl.remove(), 420);
  if (key[0] === 'b') {
    const i = Math.max(0, Math.min(beats.length - 1, parseInt(key.slice(1), 10) || 0));
    villager.root.visible = true;
    if (esMovil && !touchCreado) { new TouchControls(controller, { shofar: false, attack: false }); touchCreado = true; }
    for (let k = 0; k <= i; k++) { try { beats[k].onEnter?.(); } catch { /* estado parcial ok en dev */ } }
    spine = audio.playSpine('narracion_min0-5', 0.95, beats[i].t); director.setSpine(spine);
    director.start(beats[i].t, i - 1);   // arranca en ese beat sin re-disparar los previos
  } else {
    (window as any).__gotoNumero = parseInt(key.slice(1), 10);
    hijacked = true; spine?.stop();
    beacon.visible = false; loadPad.visible = false;
    Array.from(document.body.children).forEach((el) => {
      if ((el as HTMLElement).id === 'app') return;
      (el as HTMLElement).style.display = 'none';
    });
    startTramoRunner(renderer);   // el runner lee __gotoNumero y salta a esa escena
  }
}

// ---- Bucle ----
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  fx?.setSize(innerWidth, innerHeight);
});
let last = 0;
// #13 — COLISIÓN DEL MISHKÁN: recinto en (26,22), girado -0.35, escala 1.7. El jugador
// NO lo atraviesa (paredes y fondo), pero SÍ puede entrar/salir por el pasillo de la
// PUERTA (frente, franja central). Se corrige la posición tras mover al jugador.
const TAB_C = Math.cos(0.35), TAB_S = Math.sin(0.35);
function colisionMishkan(p: THREE.Vector3): void {
  const dx = p.x - 26, dz = p.z - 22;
  const lx = dx * TAB_C + dz * TAB_S, lz = -dx * TAB_S + dz * TAB_C;   // a coords locales del recinto
  const HW = 6.5 * 1.7 + 0.7, HD = 4 * 1.7 + 0.7;                      // medias-extensiones (con radio)
  if (Math.abs(lx) >= HW || Math.abs(lz) >= HD) return;   // fuera del recinto → nada
  // RECINTO SÓLIDO: empuja SIEMPRE a la pared más cercana (suave, sin saltos). Antes
  // había un "pasillo de puerta" que creaba una discontinuidad en el borde → glitch
  // (el jugador se colaba/saltaba al otro lado y no podía llegar al tapiz azul).
  let nlx = lx, nlz = lz;
  if (HW - Math.abs(lx) < HD - Math.abs(lz)) nlx = Math.sign(lx || 1) * HW;
  else nlz = Math.sign(lz || 1) * HD;
  p.x = 26 + (nlx * TAB_C - nlz * TAB_S);            // de vuelta a coords de mundo
  p.z = 22 + (nlx * TAB_S + nlz * TAB_C);
}

function animate(now: number): void {
  if (hijacked) return;   // el RUNNER de tramos tomó el lienzo → el bucle del 0–5 se detiene
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;

  if (pausado) { if (fx) fx.render(); else renderer.render(scene, camera); return; }   // en pausa (anotando): congela el juego, sigue viéndose

  director.update();

  // — CINEMÁTICA DE ESTUDIO: cámara propia, sin gameplay —
  if (introActiva) {
    studio.update(dt, now / 1000, director.tiempo);
    studio.frameCamera(camera, director.tiempo);
    if (fx) fx.render(); else renderer.render(scene, camera);
    return;
  }

  actualizarCartas(dt);   // botón 🃏 de ayuda + carta de cortesía si se atasca

  // — ADELANTO DE LOS ESPÍAS: guard propio (como la intro). Blinda el juego: mientras
  //   dura el "ojito" al río, el gameplay no corre → no puede tocar nada. —
  if (cine.active) {
    cine.update(dt);
    if (fx) fx.render(); else renderer.render(scene, camera);
    return;
  }

  if (recenterBtn.style.display === 'none') recenterBtn.style.display = 'block';   // ya en juego → muestra 🎯
  const moving = controller.update(dt, tpcam.yaw);
  colisionMishkan(controller.pos);   // #13: no se atraviesa el Mishkán (solo por la puerta)
  // CÁMARA LIBRE (nota #33): la cámara se queda EXACTAMENTE donde el jugador la deja.
  // NO recentra sola nunca (ni en bucle "loca", ni de un tirón al soltar "no me hace
  // caso y se vuelve a su sitio"). El único que mueve la cámara es el dedo/ratón del
  // jugador arrastrando. Si quiere volver a ponerse detrás, usa el botón 🎯 Recentrar.
  if (recenterReq) {
    // botón pulsado: un empujón suave de una sola vez hasta quedar detrás del jugador
    camTarget = villager.root.rotation.y; camRecenter = true; recenterReq = false;
  }
  if (tpcam.dragging) { camRecenter = false; }   // si tocas la cámara, mandas tú: cancela el recentrado
  if (camRecenter) {
    let d = camTarget - tpcam.yaw;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    if (Math.abs(d) < 0.03) { camRecenter = false; } else tpcam.yaw += d * Math.min(1, dt * 6);
  }
  life.update(dt, now / 1000, controller.pos, baa, ovejaAlRedil, grabReq);
  // Botón "🪢 TIRA": visible solo mientras se arrean ovejas; se ilumina y late
  // cuando hay una oveja al alcance (así el peque sabe CUÁNDO pulsar).
  const arreando = ropesHechas && !done.has('camp');
  grabBtn.style.display = grabLabel.style.display = arreando ? 'block' : 'none';
  if (arreando) {
    const cerca = life.ovejaEnganchable(controller.pos);
    grabBtn.style.background = cerca ? 'rgba(90,190,90,.92)' : 'rgba(120,80,40,.55)';
    grabBtn.style.boxShadow = cerca
      ? `0 0 ${16 + Math.sin(now * 0.012) * 8}px 3px rgba(120,240,120,.85)`
      : '0 3px 12px rgba(0,0,0,.45)';
  }
  grabReq = false;   // consumido este frame
  journey.update(dt, now / 1000);
  dust.update(dt);
  checkTargets();

  // estela de polvo al andar/correr (sensación de velocidad)
  trailCd -= dt;
  if (moving && trailCd <= 0) { dust.burst(controller.pos.x, 0.2, controller.pos.z, 3); trailCd = 0.14; }

  // Yehoshúa LLAMA con la mano desde el principio (hasta que le saludas) → el peque
  // ve a quién ir entre el gentío; al saludarle, saludo más enérgico un ratito.
  // Y cuando arranca la caravana, BAJA de la tarima y ENCABEZA la marcha hacia el río
  // (el peque notó que "no iba con nosotros": es el líder, así que ahora guía él).
  if (caravanaEnMarcha) {
    const y = camp.yehoshua.root;
    y.position.y += (0 - y.position.y) * Math.min(1, dt * 3);              // baja de la tarima
    const lead = Math.max(Journey.ORILLA_Z + 4, controller.pos.z - 12);   // 12 por delante, hacia el río
    const dz = lead - y.position.z;
    const andando = Math.abs(dz) > 0.35;
    if (andando) y.position.z += Math.sign(dz) * Math.min(Math.abs(dz), 7 * dt);
    y.rotation.y += (Math.PI - y.rotation.y) * Math.min(1, dt * 4);       // se GIRA a mirar al río (norte, −z) y encabeza la marcha de frente
    camp.yehoshua.update(dt, andando, 1);                                 // braceo/piernas al andar
  } else if (waveT > 0) { waveT -= dt; camp.yehoshua.armR.rotation.x = -2.2 + Math.sin(now * 0.02) * 0.5; }
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
    // El contador se refresca SIEMPRE que haya cuerdas activas. Antes se gateaba a
    // `beatIndex === 4`, pero los beats avanzan por TIEMPO: si recogías cuerdas en el
    // beat 5/6, el texto se congelaba en "0/N" aunque las cogieras (bug reportado).
    // mientras no haya saludado a Yehoshúa, la guía SIGUE en él (no se pierde el saludo).
    director.setObjetivo(done.has('yeh')
      ? `🎯 Recoge las cuerdas del campamento (${got}/${camp.ropes.length})`
      : '👋 Ve a saludar a Yehoshúa');
    if (got >= camp.ropes.length) {
      ropesHechas = true; audio.sfxSuccess(); director.star();
      director.logro('¡Cuerdas recogidas! Acércate a una oveja y pulsa la tecla E (o el botón 🪢) para tirar de la cuerda 🐑');
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
      director.setObjetivo(`🐑 Acércate a una oveja y pulsa E (o 🪢) para engancharla; llévala al redil (${enRedil}/${life.ovejasObjetivo}) · ${reloj}`);
    }
    if (enRedil >= life.ovejasObjetivo) {
      done.add('camp'); audio.sfxSuccess(); director.star(); ganarCarta(modoPequenin ? 2 : 1);
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
      done.add('tab'); audio.sfxSuccess(); director.star(); director.logro('¡Todo el pan atrapado! 🕍'); setTarget(null); ganarCarta(modoPequenin ? 2 : 1);
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
    if (listos) {   // con las PUERTAS del Director, el beat 7 solo llega con todo hecho: ya no forzamos por tiempo
      caravanaEnMarcha = true;
      journey.arrancarCaravana();
      camp.bultos.forEach((b) => { b.visible = false; });
      loadPad.visible = false;
      journey.revelarRio();       // asoma el río al fondo (SIN los espías todavía: el teaser va al FINAL, nota 15)
      director.logro('¡Yehoshúa encabeza la marcha! ¡Síguele hacia el río! 🐫');
      director.setObjetivo('🐫 Sigue a Yehoshúa hacia el río');
      setTarget({ x: 0, z: Journey.MARCHA_Z });
    }
  }

  // mini-juego: CARGAR LA CARAVANA (verbo real: coge un bulto y llévalo al camello)
  // El reloj del audio puede pasar al beat 7 mientras el peque sigue cargando: por eso
  // >= 6 (antes === 6 y el bulto dejaba de poder cogerse). La caravana igualmente espera.
  if (bultosActivos && !done.has('bultos') && director.beatIndex >= 6) {
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
      done.add('bultos'); audio.sfxSuccess(); director.star(); director.logro('¡Caravana cargada! 🐫'); setTarget(null); ganarCarta(modoPequenin ? 2 : 1);
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
    renderer.toneMappingExposure = 0.98 * (1 - nightF) + 0.82 * nightF;   // exposición "precioso" bajada
  }

  sky.update(dt, nightF);                                   // deriva de nubes + telón que oscurece de noche
  atmo.update(dt, now / 1000);                              // humo de fogatas + pájaros + banderas
  tpcam.update(controller.pos);
  if (fx) fx.render(); else renderer.render(scene, camera);
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
    // ahora hay que PULSAR 🪢 al lado de una oveja libre; si ya la llevas → al redil
    const libres = life._targets.filter((s) => !s.penned && !s.leashed);
    if (libres.length) { const c = nearest(libres); if (c) goal = c; }
    else goal = life.redil;
  }
  const grabNow = ropesHechas && !done.has('camp') && life.ovejaEnganchable(p);
  return {
    beat: director.beatIndex, t: Math.round(director.tiempo),
    fase, pos: [Math.round(p.x), Math.round(p.z)], grabNow,
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

// === DevHUD: etiqueta copiable + menú de salto (transversal 0–5 ↔ runner) ===
const TRAMO_LABELS = [
  '0–5 · Apertura (campamento → Jordán)',
  '5–10 · El Jordán y los dos espías',
  '10–15 · La posada de Rahab',
  '15–20 · El cordón rojo y los shofarot',
  '25 · La caída de la muralla'
];
(window as any).__estado = (): EstadoDev => {
  const p = controller.pos;
  const i = Math.max(0, director.beatIndex);
  const b = beats[i] ?? beats[0];
  const pr = (window as any).__probe?.() ?? {};
  return {
    mundo: TRAMO_LABELS[0],
    escena: 'Beat ' + i,
    titulo: (b?.sub ?? '').replace(/[«»]/g, '').trim(),
    t: director.tiempo,
    pos: [Math.round(p.x), Math.round(p.z)],
    rumbo: villager.root.rotation.y * 180 / Math.PI,
    audio: spine ? `narración 0–5 @ ${Math.round(director.tiempo)}s ▶` : '🔇 mudo (build sin voz)',
    objetivo: (pr.fase as string) || (b?.obj ?? '')
  };
};
(window as any).__destinos = (): DestinoDev[] => {
  const d: DestinoDev[] = [];
  beats.forEach((b, i) => d.push({ key: 'b' + i, grupo: TRAMO_LABELS[0], label: `Beat ${i} · ${(b.sub || '').replace(/[«»]/g, '').slice(0, 30)}` }));
  const push = (arr: Array<{ numero: number; titulo: string }>, grupo: string): void => {
    arr.forEach((s) => d.push({ key: 's' + s.numero, grupo, label: `Esc ${s.numero} · ${s.titulo}` }));
  };
  push(MIN05_SCENES, TRAMO_LABELS[1]);
  push(MIN10_SCENES, TRAMO_LABELS[2]);
  push(MIN15_SCENES, TRAMO_LABELS[3]);
  d.push({ key: 's35', grupo: TRAMO_LABELS[4], label: 'Esc 35 · La caída de la muralla' });
  return d;
};
installDevHUD();

(window as any).__READY__ = true;
