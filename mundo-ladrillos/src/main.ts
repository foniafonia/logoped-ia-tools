import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
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
renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = QUALITY.shadows;
renderer.shadowMap.type = IS_MOBILE ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

// ---- Escena: atardecer dorado (campamento, minuto 0–5) ----
const DAY_SKY = new THREE.Color(0xf0d9a8);
const NIGHT_SKY = new THREE.Color(0x1a2340);
const scene = new THREE.Scene();
scene.background = DAY_SKY.clone();
// bruma que CIERRA el horizonte (mundo acotado, no infinito): más cerca que el
// perfil de calidad, pero dejando ver la caravana marchar al norte.
const FOG_FAR = Math.min(QUALITY.fogFar, 150);
scene.fog = new THREE.Fog(DAY_SKY.clone(), 42, FOG_FAR);
if (QUALITY.envMap) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
}

const camera = new THREE.PerspectiveCamera(IS_MOBILE ? 62 : 52, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 6, 24);
const tpcam = new ThirdPersonCamera(camera, renderer.domElement);
(window as any).__tpcam = tpcam;

// ---- Luz de atardecer ----
const hemi = new THREE.HemisphereLight(0xffe9c0, 0xa9895f, 0.55);
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

const plastic = new PlasticMaterialFactory();

// === ENTORNO + CAMPAMENTO + VIDA + VIAJE ===
setupEnvironment(scene);
buildHorizon(scene);                                        // cerros de arenisca que acotan el valle
const sky = buildSky(scene);                                // telón de montañas + nubes de juguete
const camp = buildCamp(scene, plastic);
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
    onEnter: () => { ropesActivas = true; setTarget(null); }
  },
  {
    t: 123, sub: 'Los niños llevan el pan al Tabernáculo. 🥖',
    obj: 'Visita el Tabernáculo', onEnter: () => setTarget({ x: 26, z: 22 })
  },
  {
    t: 133, sub: '¡Al camello del beduino se le cae toda la carga! 💥 Ayuda a cargar la caravana.',
    obj: 'Recoge los bultos para la caravana',
    onEnter: () => { life.derrumbar(); activarBultos(); }   // gag automático + mini-juego claro
  },
  {
    t: 228, sub: '¡La caravana se pone en marcha!',
    obj: 'Sigue a la caravana',
    onEnter: () => { journey.arrancarCaravana(); camp.bultos.forEach((b) => { b.visible = false; }); setTarget({ x: 0, z: Journey.MARCHA_Z }); }
  }
];
const director = new Director(beats, null, () => finDelTramo());
(window as any).__director = director;

// pantalla de recompensa al terminar el tramo (sensación de logro para el peque)
function finDelTramo(): void {
  director.confetti(60);
  audio.sfxSuccess();
  const fin = document.createElement('div');
  fin.innerHTML =
    '<div style="text-align:center;color:#f4e9d2;font-family:system-ui,sans-serif;padding:24px;max-width:520px">' +
    '<div style="font:800 30px/1.1 Georgia,serif;color:#e8b04b">¡Bien hecho!</div>' +
    '<div style="font:800 40px system-ui;margin:14px 0">⭐ ' + director.starCount + '</div>' +
    '<div style="opacity:.9;margin:0 0 20px">Has preparado el campamento y la caravana está en marcha.<br>Muy pronto: el río Jordán y la misión de los espías.</div>' +
    '<button id="reBtn" style="font:800 20px/1 system-ui;color:#0a0705;background:#e8b04b;border:none;border-radius:14px;padding:14px 26px;cursor:pointer">↻ Volver a jugar</button></div>';
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
let trailCd = 0;                 // temporizador de la estela de polvo
let waveT = 0;                   // Yehoshúa saludando
let ropesHechas = false;         // fase A (cuerdas) completada → empieza el arreo
let bultosActivos = false;       // mini-juego de cargar la caravana
const baa = (): void => { /* las ovejas saltan sin sonido (fuera musiquita sintética) */ };

// mini-juego "carga la caravana": recoge los bultos repartidos (fácil e intuitivo)
function actualizarObjBultos(): void {
  if (director.beatIndex !== 6) return;
  const got = camp.bultos.filter((b) => !b.visible).length;
  director.setObjetivo(`📦 Carga la caravana: recoge los bultos (${got}/${camp.bultos.length})`);
}
function balizaBulto(): void {
  let best: THREE.Mesh | null = null, bd = 1e9;
  for (const b of camp.bultos) {
    if (!b.visible) continue;
    const d = controller.pos.distanceTo(b.position);
    if (d < bd) { bd = d; best = b; }
  }
  setTarget(best ? { x: best.position.x, z: best.position.z } : null);
}
function activarBultos(): void {
  bultosActivos = true;
  for (const b of camp.bultos) b.visible = true;
  actualizarObjBultos(); balizaBulto();
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
  if (i >= 3 && !done.has('yeh') && Math.hypot(p.x - YEHOSHUA.x, p.z - YEHOSHUA.z) < 5.5) {
    done.add('yeh'); waveT = 2.2; audio.sfxSuccess(); director.star(); director.logro('¡Shalom! Yehoshúa te saluda');
    if (target) setTarget(null);
  }
  // visita el Tabernáculo (esc. 06, beat 5) — completable hasta lograrlo
  if (i >= 5 && !done.has('tab') && Math.hypot(p.x - 26, p.z - 22) < 6.5) {
    done.add('tab'); audio.sfxSuccess(); director.star(); director.logro('¡Qué bonito el Tabernáculo!');
    if (target) setTarget(null);
  }
  // sigue la caravana al norte (esc. 08, beat 7)
  if (i >= 7 && !done.has('carav') && p.z < Journey.MARCHA_Z + 3) {
    done.add('carav'); audio.sfxSuccess(); director.star(); director.logro('¡En marcha con la caravana!'); setTarget(null);
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
  director.setSpine(audio.playSpine('narracion_min0-5', 0.95));
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
  director.setSpine(audio.playSpine('narracion_min0-5', 0.95, 25));
  director.start(25, 1);   // reloj en 25 s; el siguiente beat es el 2 (campamento)
}

// ---- Bucle ----
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
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
    renderer.render(scene, camera);
    return;
  }

  const moving = controller.update(dt, tpcam.yaw);
  life.update(dt, now / 1000, controller.pos, baa, ovejaAlRedil);
  journey.update(dt, now / 1000);
  dust.update(dt);
  checkTargets();

  // estela de polvo al andar/correr (sensación de velocidad)
  trailCd -= dt;
  if (moving && trailCd <= 0) { dust.burst(controller.pos.x, 0.2, controller.pos.z, 3); trailCd = 0.14; }

  // Yehoshúa saluda con la mano un ratito tras acercarte
  if (waveT > 0) { waveT -= dt; camp.yehoshua.armR.rotation.x = -2.2 + Math.sin(now * 0.02) * 0.5; }

  // baliza
  if (beacon.visible) { ring.rotation.z += dt * 1.5; arrow.position.y = 4 + Math.sin(now * 0.004) * 0.4; }

  // FASE A — recoger cuerdas (flotan e invitan a cogerlas)
  if (ropesActivas && !ropesHechas) {
    let left = 0;
    for (const rope of camp.ropes) {
      if (!rope.visible) continue;
      left++;
      rope.rotation.z += dt * 1.5;
      rope.position.y = 0.35 + Math.sin(now * 0.004 + rope.position.x) * 0.15;
      if (controller.pos.distanceTo(rope.position) < 2.6) {
        rope.visible = false; left--;
        audio.sfxPickup();                                             // ¡pling!
        dust.burst(rope.position.x, 0.6, rope.position.z, 10);         // chispa
      }
    }
    const got = camp.ropes.length - left;
    if (director.beatIndex === 4) director.setObjetivo(`🎯 Recoge las cuerdas del campamento (${got}/${camp.ropes.length})`);
    if (got >= camp.ropes.length) {
      ropesHechas = true; audio.sfxSuccess(); director.star();
      director.logro('¡Cuerdas recogidas! Ahora arrea las ovejas 🐑');
      life.activarOvejas(); setTarget(camp.ropes.length ? life.redil : null);
    }
  }
  // FASE B — arrear las ovejas al redil (empújalas acercándote)
  if (ropesHechas && !done.has('camp')) {
    const enRedil = life.ovejasEnRedil;
    if (director.beatIndex === 4) director.setObjetivo(`🐑 Arrea las ovejas al redil (${enRedil}/${life.ovejasObjetivo})`);
    if (enRedil >= life.ovejasObjetivo) {
      done.add('camp'); audio.sfxSuccess(); director.star();
      director.logro('¡Campamento recogido! 🎉'); setTarget(null);
    }
  }

  // mini-juego: cargar la caravana (recoge los bultos) — solo en el beat del beduino
  if (bultosActivos && !done.has('bultos') && director.beatIndex === 6) {
    let cambio = false;
    for (const b of camp.bultos) {
      if (!b.visible) continue;
      b.rotation.y += dt * 1.2;
      b.position.y = 0.7 + Math.sin(now * 0.004 + b.position.x) * 0.12;
      if (controller.pos.distanceTo(b.position) < 2.6) {
        b.visible = false; audio.sfxPickup(); dust.burst(b.position.x, 0.7, b.position.z, 8); cambio = true;
      }
    }
    if (cambio) { actualizarObjBultos(); balizaBulto(); }
    if (camp.bultos.every((b) => !b.visible)) {
      done.add('bultos'); audio.sfxSuccess(); director.star(); director.logro('¡Caravana cargada! 🐫'); setTarget(null);
    }
  }

  // caída de la noche (rampa suave)
  if (goNight && nightF < 1) nightF = Math.min(1, nightF + dt * 0.5);
  if (nightF > 0) {
    (scene.background as THREE.Color).copy(DAY_SKY).lerp(NIGHT_SKY, nightF);
    (scene.fog as THREE.Fog).color.copy(DAY_SKY).lerp(NIGHT_SKY, nightF);
    key.intensity = 3.0 * (1 - nightF) + 0.5 * nightF;
    hemi.intensity = 0.55 * (1 - nightF) + 0.18 * nightF;
    renderer.toneMappingExposure = 1.02 * (1 - nightF) + 0.85 * nightF;
  }

  sky.update(dt, nightF);                                   // deriva de nubes + telón que oscurece de noche
  tpcam.update(controller.pos);
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
(window as any).__READY__ = true;
