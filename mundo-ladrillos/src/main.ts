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
scene.fog = new THREE.Fog(DAY_SKY.clone(), 55, QUALITY.fogFar);
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
const camp = buildCamp(scene, plastic);
const dust = new Dust(scene);
const life = new CampLife(scene, plastic, dust);           // aldeanos, animales, gag del beduino
const journey = new Journey(scene, plastic);               // río Jordán + Jericó + caravana (ocultos)

// === JUGADOR: un joven levita del campamento ===
const villager = createMinifigure(plastic, VILLAGER_SKIN);
scene.add(villager.root);
const controller = new CharacterController(villager);
// terreno abierto: del fondo del campamento (+z) hasta la orilla del Jordán (−z)
controller.bounds = { minX: -88, maxX: 88, minZ: Journey.ORILLA_Z + 2, maxZ: 88 };
controller.pos.set(0, 0, 64);
if (IS_MOBILE || 'ontouchstart' in window) new TouchControls(controller);
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

const beats: Beat[] = [
  { t: 0, sub: 'Comunidad Shevet Ajim presenta: «La conquista de Jericó», la historia de Yehoshúa.', obj: '' },
  {
    t: 21, sub: 'El pueblo de Israel acampa en el desierto, listo para entrar en la Tierra Prometida.',
    obj: 'Explora el campamento y acércate a Yehoshúa', onEnter: () => setTarget(YEHOSHUA)
  },
  {
    t: 63, sub: '¡Hay que recoger el campamento! Enrolla las cuerdas y ayuda a cargar los bultos.',
    obj: `Recoge las cuerdas del campamento (0/${camp.ropes.length})`,
    onEnter: () => { ropesActivas = true; setTarget(null); }
  },
  {
    t: 135, sub: 'La caravana se pone en marcha por el desierto, rumbo al río Jordán.',
    obj: 'Sigue a la caravana hacia el norte',
    onEnter: () => { journey.arrancarCaravana(); setTarget({ x: 0, z: Journey.MARCHA_Z }); }
  },
  {
    t: 189, sub: '¡Ahí está el río Jordán! Y al otro lado se alza Jericó, la ciudad amurallada.',
    obj: 'Llega a la orilla del río Jordán',
    onEnter: () => { journey.revelarRio(); audio.sfxSparkle(); setTarget({ x: 0, z: Journey.ORILLA_Z + 4 }); }
  },
  {
    t: 235, sub: 'Yehoshúa reúne a los jefes: enviará dos espías a explorar Jericó en secreto.',
    obj: 'Observa el consejo junto al río', onEnter: () => setTarget(null)
  },
  {
    t: 279, sub: 'Cae la noche sobre el desierto. Los dos espías se preparan para entrar en Jericó…',
    obj: '', onEnter: () => { goNight = true; journey.caeLaNoche(); setTarget(null); }
  }
];
const director = new Director(beats, null, () => { /* fin del tramo → enganchará con el min 5–10 */ });
(window as any).__director = director;

// jugosidad: sonidos, estelas y reacciones
let trailCd = 0;                 // temporizador de la estela de polvo
let waveT = 0;                   // Yehoshúa saludando
let baaCd = 0;                   // anti-spam del "bee" de oveja
const baa = (): void => { if (baaCd <= 0) { audio.sfxAnimal(); baaCd = 0.5; } };

// hitos por jugador (una sola vez) — cada uno premia con sonido + estrella
const done = new Set<number>();
function checkTargets(): void {
  const p = controller.pos;
  const i = director.beatIndex;
  if (i === 1 && target && !done.has(1) && Math.hypot(p.x - YEHOSHUA.x, p.z - YEHOSHUA.z) < 5.5) {
    done.add(1); waveT = 2.2; audio.sfxSparkle(); director.star(); director.logro('¡Shalom! Yehoshúa te saluda'); setTarget(null);
  }
  if (i === 3 && target && !done.has(3) && p.z < Journey.MARCHA_Z + 3) {
    done.add(3); audio.sfxSparkle(); director.star(); director.logro('¡Sigues a la caravana!'); setTarget({ x: 0, z: Journey.ORILLA_Z + 4 });
  }
  if (i >= 4 && target && !done.has(5) && p.z < Journey.ORILLA_Z + 7) {
    done.add(5); audio.sfxSuccess(); director.star(); director.logro('¡Has llegado al río Jordán!'); setTarget(null);
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
  // la NARRACIÓN real de la peli conduce el tramo (si está embebida en la entrega)
  director.setSpine(audio.playSpine('narracion_min0-5', 0.95));   // el reloj del audio real conduce
  director.start();
  startEl.style.opacity = '0';
  setTimeout(() => startEl.remove(), 420);
}, { once: true });

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

  const moving = controller.update(dt, tpcam.yaw);
  life.update(dt, now / 1000, controller.pos, baa);
  journey.update(dt, now / 1000);
  dust.update(dt);
  director.update();
  checkTargets();

  // estela de polvo al andar/correr (sensación de velocidad)
  trailCd -= dt;
  if (moving && trailCd <= 0) { dust.burst(controller.pos.x, 0.2, controller.pos.z, 3); trailCd = 0.14; }

  // Yehoshúa saluda con la mano un ratito tras acercarte
  if (waveT > 0) { waveT -= dt; camp.yehoshua.armR.rotation.x = -2.2 + Math.sin(now * 0.02) * 0.5; }

  // baliza
  if (beacon.visible) { ring.rotation.z += dt * 1.5; arrow.position.y = 4 + Math.sin(now * 0.004) * 0.4; }

  baaCd -= dt;

  // recoger cuerdas (durante su beat; el contador solo manda mientras es el objetivo activo)
  if (ropesActivas && !done.has(2)) {
    let left = 0;
    for (const rope of camp.ropes) {
      if (!rope.visible) continue;
      left++;
      rope.rotation.z += dt * 1.5;
      rope.position.y = 0.35 + Math.sin(now * 0.004 + rope.position.x) * 0.15;   // flota (invita a cogerla)
      if (controller.pos.distanceTo(rope.position) < 2.6) {
        rope.visible = false; left--;
        audio.sfxPickup();                                             // ¡pling!
        dust.burst(rope.position.x, 0.6, rope.position.z, 10);         // chispa
      }
    }
    const got = camp.ropes.length - left;
    if (director.beatIndex === 2) director.setObjetivo(`🎯 Recoge las cuerdas del campamento (${got}/${camp.ropes.length})`);
    if (got >= camp.ropes.length) { done.add(2); audio.sfxSuccess(); director.star(); director.logro('¡Campamento recogido!'); }
  }

  // caída de la noche (rampa suave)
  if (goNight && nightF < 1) nightF = Math.min(1, nightF + dt * 0.35);
  if (nightF > 0) {
    (scene.background as THREE.Color).copy(DAY_SKY).lerp(NIGHT_SKY, nightF);
    (scene.fog as THREE.Fog).color.copy(DAY_SKY).lerp(NIGHT_SKY, nightF);
    key.intensity = 3.0 * (1 - nightF) + 0.5 * nightF;
    hemi.intensity = 0.55 * (1 - nightF) + 0.18 * nightF;
    renderer.toneMappingExposure = 1.02 * (1 - nightF) + 0.85 * nightF;
  }

  tpcam.update(controller.pos);
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
(window as any).__READY__ = true;
