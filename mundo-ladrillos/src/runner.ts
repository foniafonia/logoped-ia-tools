import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { ThirdPersonCamera } from './camera/ThirdPersonCamera';
import { createMinifigure, MinifigureSkin } from './characters/MinifigureFactory';
import { createStuddedGround } from './world/EnvironmentManager';
import { PreviewController } from './scenes/min05/preview/PreviewController';
import { MIN05_SCENES } from './scenes/min05/registry';
import { MIN10_SCENES } from './scenes/min10/registry';
import { MIN15_SCENES } from './scenes/min15/registry';
import { Min05Scene, SceneInstance, SceneContext } from './scenes/min05/types';
import { SoundEngine } from './scenes/min05/audio/SoundEngine';
import { buildNightSky, cobbleTexture } from './scenes/min05/props/NightAmbience';
import { buildHorizon } from './scenes/min05/props/Horizon';
import { CinematicCamera } from './scenes/min05/props/CinematicCamera';
import { NavBeacon } from './scenes/min05/preview/NavBeacon';
import { setupPreciousRender } from './core/PreciousRender';
import { Dialogue } from './ui/Dialogue';
import { YEHOSHUA_SKIN, ESPIA1_SIGILO, ESPIA2_SIGILO, ESPIA1_CAMP, ESPIA2_CAMP } from './scenes/min05/skins';
import { runTramo, TramoRunner, Orquestador, SceneDef } from './core/runTramo';
import { buildClimax } from './scenes/min25/climax';
import { Dust } from './effects/Dust';

/**
 * CLÍMAX (min 25) — puente FINO del integrador sobre el módulo del LEAD `buildClimax`
 * (hito 1: muralla de Jericó + derrumbe "se deshace en ladrillos"). NO reescribe nada:
 * envuelve su API pública (`soplarShofar` / `update` / `cayo` / `muroZ`) en una escena
 * del contrato compartido `SceneContext`, para coserlo como final del viaje. El jugador
 * (Yehoshúa) llega al pie de la muralla y toca el shofar (E) → la muralla cae.
 */
const CLIMAX_SCENE: Min05Scene = {
  id: 'm25_climax_muralla',
  numero: 35,
  titulo: 'La caída de la muralla',
  subtitulo: '«…y las murallas de Jericó empezaron a temblar.»',
  objetivo: { tipo: 'ir_a', texto: 'Llega al pie de la muralla y toca el shofar (E)', target: { x: 0, z: -28 }, radio: 8 },
  exito: '¡La muralla se deshace en ladrillos!',
  spawn: { x: 0, z: 14 },
  ambiente: 'day',
  jugador: 'yoshua',
  bounds: { minX: -42, maxX: 42, minZ: -30, maxZ: 20 },
  camara: { yaw: Math.PI, pitch: 0.42, dist: 30 },
  build(ctx: SceneContext): SceneInstance {
    const dust = new Dust(ctx.scene);
    const cl = buildClimax(ctx.scene, ctx.plastic, dust);
    const GRITO_Z = cl.muroZ + 12;   // punto desde donde se toca el shofar
    let soplado = false;
    return {
      group: cl.group,
      update(dt, t, player): void {
        cl.update(dt, t); dust.update(dt);
        if (!soplado && player.z <= GRITO_Z + 6 && ctx.wantsInteract()) {
          soplado = true; cl.soplarShofar();
          ctx.flash?.('¡GRITAD! 🎺', 2.4);
          ctx.sound.success();
        }
      },
      isDone(): boolean { return soplado && cl.cayo(); },
      status(): string | null { return soplado && !cl.cayo() ? '¡La muralla se derrumba! 🧱' : null; },
      hud() {
        if (soplado) return { progress: cl.cayo() ? 1 : 0.5 };
        const p = ctx.getPlayer();
        const near = p.z <= GRITO_Z + 6;
        return near ? { prompt: 'Pulsa E para tocar el shofar 🎺' } : { goal: [0, GRITO_Z] as [number, number] };
      },
      dispose(): void { ctx.scene.remove(cl.group); }
    };
  }
};

/**
 * RUNNER DEL INTEGRADOR — cose los tres tramos jugables en UNA aventura continua:
 * min 5–10 (Jordán/espías) → 10–15 (posada de Rahab) → 15–20 (cordón rojo/shofarot).
 *
 * El ENCADENADO de escenas lo hace el RUNNER CANÓNICO de la base `core/runTramo`
 * (definido por el LEAD, verificado en runtime): una sola fuente para todos los tramos.
 * Este módulo aporta el **ORQUESTADOR** que `runTramo` pide (escena, luces por
 * ambiente/mundo, jugador, cámara, HUD, sonido) y le pasa cada `registry.ts` VERBATIM.
 * Reutiliza las escenas de cada hilo tal cual (su `build(ctx)` y el contrato compartido
 * `SceneContext`). Es el pegamento; no reescribe el trabajo de nadie.
 *
 * El 0–5 (campamento) lo lleva `main.ts`; al terminarlo llama a `startTramoRunner()`.
 */

type AnyScene = Min05Scene & { mundo?: 'interior' | 'calle-noche' | 'balcon' | 'monte' | 'campamento' | 'taller' };
const TRAMOS: AnyScene[][] = [
  MIN05_SCENES as AnyScene[],
  MIN10_SCENES as unknown as AnyScene[],
  MIN15_SCENES as unknown as AnyScene[],
  [CLIMAX_SCENE as AnyScene],            // min 25 — el clímax (muralla) del LEAD, cosido como final
];

export function startTramoRunner(renderer: THREE.WebGLRenderer): void {
  // ---- Escena propia sobre el MISMO renderer/lienzo del 0–5 ----
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 700);
  camera.position.set(0, 9, 30);
  const tpcam = new ThirdPersonCamera(camera, renderer.domElement);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const fx = setupPreciousRender(renderer, scene, camera, { ibl: false });
  const BLOOM_PRESET = {
    day: { s: 0.20, r: 0.50, t: 0.92 },
    night: { s: 0.50, r: 0.70, t: 0.70 },
    interior: { s: 0.34, r: 0.60, t: 0.82 }
  } as const;
  function applyBloom(mood: 'day' | 'night' | 'interior'): void {
    const b = BLOOM_PRESET[mood]; const k = fx.lite ? 0.72 : 1;
    fx.bloomPass.strength = b.s * k;
    fx.bloomPass.radius = b.r;
    fx.bloomPass.threshold = Math.min(0.95, b.t + (fx.lite ? 0.03 : 0));
  }

  const plastic = new PlasticMaterialFactory();
  const sound = new SoundEngine();
  sound.init();   // el clic de "seguir" del 0–5 ya es un gesto → desbloquea el audio

  // --- Luces (se reconfiguran por ambiente/mundo en cada escena) ---
  const hemi = new THREE.HemisphereLight(0xffe9c0, 0xa9895f, 0.5); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffd9a0, 3.0);
  key.position.set(-18, 28, 14); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 1; key.shadow.camera.far = 320;
  key.shadow.camera.left = -90; key.shadow.camera.right = 90;
  key.shadow.camera.top = 90; key.shadow.camera.bottom = -70;
  key.shadow.bias = -0.0002; key.shadow.normalBias = 0.02;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xbcd2ff, 0.35); fill.position.set(12, 12, -6); scene.add(fill);

  // --- Suelo + cielo nocturno + horizonte (kit compartido; se muestran/ocultan) ---
  const groundDayTex = (createStuddedGround(700).material as THREE.MeshStandardMaterial).map;
  const ground = createStuddedGround(700); scene.add(ground);
  const groundMat = ground.material as THREE.MeshStandardMaterial;
  const cobbleTex = cobbleTexture(); cobbleTex.repeat.set(120, 120);
  const nightSky = buildNightSky(); nightSky.visible = false; scene.add(nightSky);
  const horizon = buildHorizon(plastic); scene.add(horizon.group);

  // AMBIENTE por escena. min05 usa `ambiente`; min10/min15 usan `mundo`. Los valores
  // de luz/niebla se copian VERBATIM del preview de cada hilo (no se inventan).
  function applyAmbience(def: AnyScene): void {
    const mundo = def.mundo;
    if (mundo === 'interior') {                                   // min10: interior de la taberna
      ground.visible = false; horizon.group.visible = false; nightSky.visible = false;
      scene.environment = envTex; renderer.toneMappingExposure = 1.15;
      scene.background = new THREE.Color(0x14100a);
      scene.fog = new THREE.Fog(0x14100a, 34, 74);
      hemi.color.setHex(0xffd9a0); hemi.groundColor.setHex(0x2a1c10); hemi.intensity = 0.5;
      key.color.setHex(0xffdca0); key.intensity = 1.1; key.position.set(-8, 22, 12);
      fill.color.setHex(0xffb877); fill.intensity = 0.25;
      applyBloom('interior'); if (sound.ready) sound.setAmbience('night'); return;
    }
    if (mundo === 'calle-noche') {                                // min10: calle nocturna (mercado)
      ground.visible = true; horizon.group.visible = true; nightSky.visible = true;
      scene.environment = null; renderer.toneMappingExposure = 1.2;
      scene.background = new THREE.Color(0x102138);
      scene.fog = new THREE.Fog(0x162943, 60, 250);
      hemi.color.setHex(0x4c6690); hemi.groundColor.setHex(0x2a2a2a); hemi.intensity = 1.05;
      key.color.setHex(0xc2d4f7); key.intensity = 1.25; key.position.set(-120, 140, 200);
      fill.color.setHex(0x6a86c0); fill.intensity = 0.5;
      groundMat.map = cobbleTex; groundMat.color.setHex(0x8a8a92);
      groundMat.emissive.setHex(0x0a1320); groundMat.needsUpdate = true;
      applyBloom('night'); if (sound.ready) sound.setAmbience('street'); return;
    }
    if (mundo === 'campamento' || mundo === 'taller') {           // min15: campamento militar / taller (noche cálida)
      ground.visible = true; horizon.group.visible = true; nightSky.visible = true;
      scene.environment = null; renderer.toneMappingExposure = 1.15;
      scene.background = new THREE.Color(0x161020);
      scene.fog = new THREE.Fog(0x161020, 40, 120);
      hemi.color.setHex(0xffd9a0); hemi.groundColor.setHex(0x2a1c10); hemi.intensity = 0.7;
      key.color.setHex(0xffdca0); key.intensity = 1.1; key.position.set(-40, 60, 40);
      fill.color.setHex(0xffb877); fill.intensity = 0.3;
      groundMat.map = groundDayTex; groundMat.color.setHex(0x6a5b48); groundMat.emissive.setHex(0x0a0806); groundMat.needsUpdate = true;
      applyBloom('night'); if (sound.ready) sound.setAmbience('night'); return;
    }
    if (mundo === 'balcon' || mundo === 'monte') {                // min15: balcón sobre la muralla / monte (noche azul)
      ground.visible = true; horizon.group.visible = true; nightSky.visible = true;
      scene.environment = null; renderer.toneMappingExposure = 1.2;
      scene.background = new THREE.Color(0x0d1a30);
      scene.fog = new THREE.Fog(0x122238, 70, 260);
      hemi.color.setHex(0x4c6690); hemi.groundColor.setHex(0x1a1a22); hemi.intensity = 1.0;
      key.color.setHex(0xc2d4f7); key.intensity = 1.25; key.position.set(-120, 140, 200);
      fill.color.setHex(0x6a86c0); fill.intensity = 0.5;
      groundMat.map = groundDayTex; groundMat.color.setHex(0x5c6c82); groundMat.emissive.setHex(0x0a1320); groundMat.needsUpdate = true;
      applyBloom('night'); if (sound.ready) sound.setAmbience('night'); return;
    }
    // ---- min05: por `ambiente` (día / noche / calle / interior) ----
    const amb = def.ambiente ?? (def.noche ? 'night' : 'day');
    const noche = !!def.noche;
    const interior = amb === 'interior';
    const street = amb === 'street';
    ground.visible = !interior; horizon.group.visible = !interior;
    if (interior) {
      scene.environment = null; renderer.toneMappingExposure = 1.12;
      scene.background = new THREE.Color(0x140f0a);
      scene.fog = new THREE.Fog(0x140f0a, 22, 72);
      hemi.color.setHex(0x7a5636); hemi.groundColor.setHex(0x1a1006); hemi.intensity = 0.28;
      key.color.setHex(0xffcaa0); key.intensity = 0.34; key.position.set(-6, 20, 8);
      fill.color.setHex(0x6a5330); fill.intensity = 0.22; nightSky.visible = false;
      applyBloom('interior'); if (sound.ready) sound.setAmbience('night'); return;
    }
    if (noche) {
      scene.environment = null; renderer.toneMappingExposure = 1.2;
      scene.background = new THREE.Color(0x102138);
      scene.fog = new THREE.Fog(0x162943, 60, 250);
      hemi.color.setHex(0x466288); hemi.groundColor.setHex(0x172433); hemi.intensity = 0.95;
      key.color.setHex(0xb2caf5); key.intensity = 1.05; key.position.set(-150, 150, -240);
      fill.color.setHex(0x3d5c8c); fill.intensity = 0.42; nightSky.visible = true;
      if (street) { groundMat.map = cobbleTex; groundMat.color.setHex(0x8a8a92); }
      else { groundMat.map = groundDayTex; groundMat.color.setHex(0x5c6c82); }
      groundMat.emissive.setHex(0x0a1320); groundMat.needsUpdate = true;
      applyBloom('night'); if (sound.ready) sound.setAmbience(street ? 'street' : 'night'); return;
    }
    scene.environment = envTex; renderer.toneMappingExposure = 1.05;
    scene.background = horizon.daySky;
    scene.fog = new THREE.Fog(horizon.horizonColor, 70, 360);
    hemi.color.setHex(0xffe9c0); hemi.groundColor.setHex(0xa9895f); hemi.intensity = 0.55;
    key.color.setHex(0xffd9a0); key.intensity = 3.0; key.position.set(-18, 28, 14);
    fill.color.setHex(0xbcd2ff); fill.intensity = 0.35; nightSky.visible = false;
    groundMat.map = groundDayTex; groundMat.color.setHex(0xffffff); groundMat.emissive.setHex(0x000000); groundMat.needsUpdate = true;
    applyBloom('day'); if (sound.ready) sound.setAmbience(amb === 'river' ? 'river' : 'day');
  }

  // --- Jugador ---
  const skins: Record<string, MinifigureSkin> = { yoshua: YEHOSHUA_SKIN, spy: ESPIA1_SIGILO, spy2: ESPIA2_SIGILO, spy_camp: ESPIA1_CAMP, spy2_camp: ESPIA2_CAMP };
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

  // --- Confeti de celebración (lo dispara el runner canónico vía orq.addStars) ---
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
  const avisoEl = mkDiv({ left: '50%', top: '30%', transform: 'translate(-50%,-50%)', maxWidth: '92%', color: '#ffe08a', background: 'rgba(10,14,22,.82)', border: '3px solid #ffd24a', font: '800 30px/1.15 Georgia, serif', padding: '12px 26px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 6px 22px rgba(0,0,0,.6)', display: 'none' });
  let avisoUntil = 0;
  function sceneFlash(text: string, seconds = 3): void { avisoEl.textContent = text; avisoEl.style.display = 'block'; avisoUntil = performance.now() + seconds * 1000; }
  const promptEl = mkDiv({ left: '50%', top: '58%', transform: 'translate(-50%,-50%)', color: '#0a0705', background: '#ffd24a', font: '800 16px system-ui', padding: '8px 16px', borderRadius: '12px', boxShadow: '0 4px 14px rgba(0,0,0,.5)', display: 'none' });
  const vignette = mkDiv({ inset: '0', zIndex: '18', boxShadow: 'inset 0 0 120px 40px rgba(255,40,30,0)', transition: 'box-shadow .12s linear' });

  function mkBar(top: string, label: string, color: string): { wrap: HTMLDivElement; fill: HTMLDivElement; lab: HTMLDivElement } {
    const wrap = mkDiv({ left: '50%', top, transform: 'translateX(-50%)', width: '220px', height: '14px', background: 'rgba(0,0,0,.45)', borderRadius: '8px', border: '1px solid rgba(255,255,255,.25)', display: 'none', overflow: 'hidden' });
    const fill2 = document.createElement('div');
    Object.assign(fill2.style, { position: 'absolute', left: '0', top: '0', height: '100%', width: '0%', background: color, transition: 'width .08s linear' } as CSSStyleDeclaration);
    wrap.appendChild(fill2);
    const lab = mkDiv({ left: '50%', top: `calc(${top} - 16px)`, transform: 'translateX(-50%)', color: '#fff', font: '700 11px system-ui', textShadow: '0 1px 3px #000', display: 'none' });
    lab.textContent = label;
    return { wrap, fill: fill2, lab };
  }
  const alarmBar = mkBar('112px', '🚨 ALARMA', 'linear-gradient(90deg,#ffd24a,#ff5a4d)');
  const balBar = mkBar('112px', '⚖️ EQUILIBRIO', '#8fe0ff');
  const progBar = mkBar('136px', '', 'linear-gradient(90deg,#8fe0ff,#bfffce)');

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

  // ================= Cinemática + diálogo + baliza (comunes a todas las escenas) ======
  const cineCam = new CinematicCamera(camera);
  const navBeacon = new NavBeacon(); scene.add(navBeacon.group);
  const dlg = new Dialogue();

  // El ctx que pide cada escena (contrato compartido min05). Es ESTABLE: lo comparten
  // todas las escenas (runTramo se lo pasa a cada `build`). Referencia el `controller`
  // por variable (setPlayerSkin lo recrea, y el closure lee siempre el vigente).
  const ctx: SceneContext = {
    scene, plastic,
    getPlayer: () => controller.pos,
    setPlayer: (x, z) => controller.teleport(x, z),
    markDone: () => { forceDone = true; },   // (compat: el runner canónico avanza por isDone)
    sound,
    wantsInteract: consumeInteract,
    addObstacle: (x, z, hw, hd) => controller.addObstacle(x, z, hw, hd),
    say: (text, who = '', seconds, color) => dlg.say(who, text, { ...(seconds ? { ms: seconds * 1000 } : {}), ...(color !== undefined ? { color } : {}) }),
    setPlayerSkin: (which) => setPlayerSkin(which),
    setPlayerVisible: (v) => { player.root.visible = v; },
    cameraFocus: (target, seconds) => cineCam.focus(target, seconds),
    cameraReveal: (from, to, lookFrom, lookTo, seconds) => cineCam.reveal(from, to, lookFrom, lookTo, seconds),
    flash: (text, seconds) => sceneFlash(text, seconds)
  };

  // ORQUESTADOR que pide `core/runTramo`: mueve jugador/cámara/skin/bounds y premia.
  let lastSpawn = { x: 0, z: 0 };   // runTramo llama setSpawn justo antes de setBounds
  const orq: Orquestador = {
    ctx,
    setSpawn: (x, z) => { lastSpawn = { x, z }; controller.teleport(x, z); },
    setCamera: (h) => { tpcam.yaw = h.yaw ?? Math.PI; tpcam.pitch = h.pitch ?? 0.4; tpcam.dist = h.dist ?? 28; },
    setBounds: (b) => {
      if (b) controller.setBounds(b.minX, b.maxX, b.minZ, b.maxZ);
      else controller.setBounds(-72, 72, lastSpawn.z - 8, lastSpawn.z + 26);   // fallback si la escena no acota
    },
    setSkin: (which) => setPlayerSkin(which),
    addStars: () => { if (currentDef) flashEl.textContent = '✅ ' + currentDef.exito; if (sound.ready) sound.success(); spawnConfetti(controller.pos.x, controller.pos.z); }
  };

  // ---- Escenas: `currentInst` (para el HUD) se captura envolviendo `build` sin tocar
  //      runTramo; `currentDef` = descriptor original (numero/objetivo/mundo/intro…). --
  let currentInst: SceneInstance | null = null;
  let currentDef: AnyScene | null = null;
  let forceDone = false;   // solo para el hook de QA __jump_next
  function wrap(scenes: AnyScene[]): SceneDef[] {
    return scenes.map((def) => ({
      ...def,
      build: (c) => {
        const inst = def.build(c as unknown as SceneContext);
        currentInst = inst;
        const orig = inst.isDone.bind(inst);
        inst.isDone = (p: THREE.Vector3) => forceDone || orig(p);   // QA: __jump_next fuerza isDone
        return inst as unknown as ReturnType<SceneDef['build']>;
      }
    })) as unknown as SceneDef[];
  }

  // ---- Encadenado de los TRES tramos con el runner canónico ----
  let ti = 0;                        // índice de tramo (0=5-10, 1=10-15, 2=15-20)
  let sceneArr: AnyScene[] = TRAMOS[0];
  let runner: TramoRunner | null = null;
  let lastIndice = -1;
  let ended = false;

  // COSTURA entre tramos: tarjeta breve (minuto + título) que suaviza el salto de un
  // mundo al siguiente y le deja claro al peque en qué parte de la historia está.
  const TRAMO_CARDS = [
    { min: 'MINUTO 5–10', tit: 'El Jordán y los dos espías' },
    { min: 'MINUTO 10–15', tit: 'La posada de Rahab' },
    { min: 'MINUTO 15–20', tit: 'El cordón rojo y los shofarot' },
    { min: 'MINUTO 25', tit: 'La caída de Jericó' }
  ];
  function showTramoCard(idx: number, done: () => void): void {
    const c = TRAMO_CARDS[idx] ?? { min: '', tit: '' };
    const card = document.createElement('div');
    card.innerHTML =
      '<div style="text-align:center;font-family:Georgia,serif">' +
      `<div style="font:800 18px system-ui;letter-spacing:3px;color:#8fe0ff;opacity:.9">${c.min}</div>` +
      `<div style="font:800 34px/1.15 Georgia,serif;color:#e8b04b;margin-top:10px">${c.tit}</div></div>`;
    Object.assign(card.style, { position: 'fixed', inset: '0', zIndex: '45', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(120% 100% at 50% 0%, #16283f, #060b12 78%)', opacity: '0', transition: 'opacity .45s' } as CSSStyleDeclaration);
    document.body.appendChild(card);
    requestAnimationFrame(() => { card.style.opacity = '1'; });
    setTimeout(() => { card.style.opacity = '0'; setTimeout(() => { card.remove(); done(); }, 460); }, 1400);
  }

  function startTramo(): void {
    if (ti >= TRAMOS.length) { finalWin(); return; }
    runner = null;   // pausa los updates mientras se muestra la tarjeta de tramo
    showTramoCard(ti, () => {
      sceneArr = TRAMOS[ti];
      lastIndice = -1; currentInst = null; currentDef = null;
      // runTramo ya dispone la última escena del tramo previo (salir() al pasar de la lista).
      runner = runTramo(wrap(sceneArr), orq, () => { ti += 1; startTramo(); }, { pauseMs: 2600 });
      onSceneChanged();
      lastIndice = runner.indice;
    });
  }

  // Cuando el runner cambia de escena (o de tramo): aplica AMBIENTE + HUD + intro.
  function onSceneChanged(): void {
    forceDone = false;
    cineCam.stop();
    dlg.clear();
    if (!runner || runner.indice >= sceneArr.length) return;
    const def = sceneArr[runner.indice];
    currentDef = def;
    applyAmbience(def);
    if (sound.ready) void sound.playSceneClip(`voz_${String(def.numero).padStart(2, '0')}`);
    player.root.visible = true;
    avisoEl.style.display = 'none'; avisoUntil = 0;
    titleEl.textContent = `Escena ${def.numero} · ${def.titulo}`;
    objEl.textContent = def.objetivo.tipo === 'cinematica' ? '' : '🎯 ' + def.objetivo.texto;
    objEl.style.display = def.objetivo.tipo === 'cinematica' ? 'none' : 'block';
    subEl.textContent = def.subtitulo;
    flashEl.textContent = '';
    if (def.intro) cineCam.reveal(def.intro.from, def.intro.to, def.intro.lookFrom, def.intro.lookTo, def.intro.seconds);
    (window as any).__SCENE_READY__ = true;
  }

  function finalWin(): void {
    if (ended) return; ended = true;
    if (sound.ready) sound.success();
    const fin = document.createElement('div');
    fin.innerHTML =
      '<div style="text-align:center;color:#f4e9d2;font-family:system-ui,sans-serif;padding:24px;max-width:560px">' +
      '<div style="font:800 32px/1.1 Georgia,serif;color:#e8b04b">¡Aventura completada! 🎉</div>' +
      '<div style="opacity:.9;margin:16px 0 22px">Cruzaste el Jordán con los espías, os escondisteis en la posada de Rahab, ' +
      'huisteis con el cordón rojo, tocasteis los <b>shofarot</b> y las <b>murallas de Jericó cayeron</b>. ¡VICTORIA! 🎉</div>' +
      '<button id="reBtn2" style="font:800 20px/1 system-ui;color:#0a0705;background:#e8b04b;border:none;border-radius:14px;padding:14px 26px;cursor:pointer">↻ Jugar otra vez</button></div>';
    Object.assign(fin.style, { position: 'fixed', inset: '0', zIndex: '60', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(120% 100% at 50% 0%, #23324f, #0a0f18 78%)', opacity: '0', transition: 'opacity .6s' } as CSSStyleDeclaration);
    document.body.appendChild(fin);
    requestAnimationFrame(() => { fin.style.opacity = '1'; });
    fin.querySelector('#reBtn2')?.addEventListener('pointerdown', () => location.reload());
  }

  startTramo();   // muestra la tarjeta del tramo 5–10 y, al acabar, monta esc9 + ambiente/HUD

  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); fx.setSize(innerWidth, innerHeight); });

  let last = performance.now();
  function animate(now: number): void {
    requestAnimationFrame(animate);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    if (avisoUntil && now >= avisoUntil) { avisoEl.style.display = 'none'; avisoUntil = 0; }
    dlg.update(dt);
    subEl.style.display = dlg.active ? 'none' : 'block';

    const cine = cineCam.active;
    if (!cine) {
      controller.update(dt, tpcam.yaw);
      if (sound.ready) {
        sound.footTick(dt, controller.moving, controller.running);
        if (controller.justJumped) sound.jump();
        if (controller.justLanded) sound.land();
      }
    }

    // El runner canónico anima la escena y encadena (isDone → ⭐ → pausa → siguiente).
    if (runner && !ended) {
      runner.update(dt, now / 1000);
      if (runner.indice !== lastIndice) { lastIndice = runner.indice; onSceneChanged(); }
    }

    // HUD de la escena viva (capturada por el wrapper).
    if (currentInst && currentDef) {
      const st = currentInst.status?.() ?? null;
      statusEl.textContent = st ?? '';
      const h = currentInst.hud?.() ?? {};
      setBar(alarmBar, h.alarm);
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

      const gt = Array.isArray((h as { goal?: [number, number] }).goal)
        ? (h as { goal?: [number, number] }).goal!
        : (currentDef.objetivo.target ? [currentDef.objetivo.target.x, currentDef.objetivo.target.z] as [number, number] : null);
      if (cine || currentDef.objetivo.tipo === 'cinematica') navBeacon.hide();
      else navBeacon.update(now / 1000, controller.pos.x, controller.pos.z, gt, !!h.prompt);
    }
    updateConfetti(dt);

    if (!cineCam.update(dt, controller.pos.x, controller.pos.z)) tpcam.update(controller.pos);
    fx.render();
  }
  function setBar(b: { wrap: HTMLDivElement; fill: HTMLDivElement; lab: HTMLDivElement }, v?: number): void {
    if (v === undefined || v <= 0.001) { b.wrap.style.display = 'none'; b.lab.style.display = 'none'; return; }
    b.wrap.style.display = 'block'; b.lab.style.display = 'block'; b.fill.style.width = `${THREE.MathUtils.clamp(v, 0, 1) * 100}%`; b.fill.style.marginLeft = '0';
  }
  requestAnimationFrame(animate);

  // === hooks de QA / jugador sintético (contrato con Segundo Cerebro / Eli) ===
  (window as any).__walk = (x: number, z: number, step = 0.9): boolean => { controller.stepToward(x, z, step); return Math.hypot(controller.pos.x - x, controller.pos.z - z) <= step; };
  (window as any).__interact = () => { interactFlag = true; };
  (window as any).__act = () => { interactFlag = true; };
  (window as any).__jump = () => { controller.touch.jump = true; };
  (window as any).__jump_next = () => { forceDone = true; };   // QA: fuerza isDone → el runner avanza (con su pausa)
  // QA definitivo: construye + tickea TODAS las escenas de los 3 tramos con el
  // orquestador real y devuelve la lista de fallos (vacía = todas montan y corren).
  (window as any).__dryRunAll = () => {
    const problems: string[] = [];
    const pos = new THREE.Vector3();
    for (const arr of TRAMOS) for (const def of arr) {
      try {
        const inst = def.build(ctx);
        for (let f = 0; f < 3; f++) inst.update(0.016, f * 0.016, pos);
        inst.isDone(pos); inst.status?.(); inst.hud?.();
        scene.remove(inst.group); inst.dispose?.();
      } catch (e) { problems.push(`E${def.numero}: ${(e as Error).message}`); }
    }
    return problems;
  };
  (window as any).__probe = () => {
    const p = controller.pos; const def = currentDef;
    const hud = (currentInst && currentInst.hud) ? currentInst.hud() : {};
    const tgt = def?.objetivo?.target;
    // índice ABSOLUTO en el viaje completo (para QA): escenas de tramos previos + índice local
    const prev = TRAMOS.slice(0, ti).reduce((s, arr) => s + arr.length, 0);
    return {
      numero: def?.numero ?? null, titulo: def?.titulo ?? null,
      tipo: def?.objetivo?.tipo ?? null, objetivo: def?.objetivo?.texto ?? null,
      pos: [+p.x.toFixed(1), +p.z.toFixed(1)],
      goal: (Array.isArray(hud.goal) ? hud.goal : (tgt ? [tgt.x, tgt.z] : null)),
      radio: def?.objetivo?.radio ?? null,
      done: currentInst ? currentInst.isDone(controller.pos) : false,
      prompt: hud.prompt ?? null, alarm: hud.alarm ?? 0, balance: hud.balance ?? null,
      progress: hud.progress ?? 0, gems: hud.gems ?? null,
      status: (currentInst && currentInst.status) ? currentInst.status() : null,
      cine: cineCam.active ? 1 : 0,
      indice: prev + (runner ? runner.indice : 0), total: TRAMOS.reduce((s, a) => s + a.length, 0)
    };
  };
  (window as any).__runnerReady = true;
}
