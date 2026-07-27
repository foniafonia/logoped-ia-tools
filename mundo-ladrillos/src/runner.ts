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

/**
 * RUNNER UNIFICADO DEL INTEGRADOR — cose los tres tramos jugables en UNA aventura
 * continua: min 5–10 (el Jordán y los espías) → min 10–15 (la posada de Rahab) →
 * min 15–20 (el cordón rojo y los shofarot). Reutiliza VERBATIM las escenas de
 * cada hilo (sus `build(ctx)` y su contrato compartido `SceneContext`) y el runner
 * canónico del tramo 5–10 (`preview.ts`); esto solo es el PEGAMENTO: encadena las
 * tres listas y adapta la luz/ambiente a los `mundo` de min10/min15.
 *
 * El tramo 0–5 (campamento) lo lleva `main.ts` (mundo del LEAD); al terminarlo,
 * `main.ts` llama a `startTramoRunner(renderer)` y este toma el control del mismo
 * lienzo con su propia escena.
 */

// El contrato es el de min05; min10/min15 solo AÑADEN `mundo`. Los unifico casteando.
type AnyScene = Min05Scene & { mundo?: 'interior' | 'calle-noche' | 'balcon' | 'monte' | 'campamento' | 'taller' };
const SCENES: AnyScene[] = [
  ...(MIN05_SCENES as AnyScene[]),
  ...(MIN10_SCENES as unknown as AnyScene[]),
  ...(MIN15_SCENES as unknown as AnyScene[]),
];

export function startTramoRunner(renderer: THREE.WebGLRenderer): void {
  // ---- Escena propia sobre el MISMO renderer/lienzo del 0–5 ----
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 700);
  camera.position.set(0, 9, 30);
  const tpcam = new ThirdPersonCamera(camera, renderer.domElement);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // acabado "precioso" (bloom + SMAA + ACES); IBL por-escena vía applyAmbience.
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
    // ---- min10: interior de la taberna ----
    if (mundo === 'interior') {
      ground.visible = false; horizon.group.visible = false; nightSky.visible = false;
      scene.environment = envTex; renderer.toneMappingExposure = 1.15;
      scene.background = new THREE.Color(0x14100a);
      scene.fog = new THREE.Fog(0x14100a, 34, 74);
      hemi.color.setHex(0xffd9a0); hemi.groundColor.setHex(0x2a1c10); hemi.intensity = 0.5;
      key.color.setHex(0xffdca0); key.intensity = 1.1; key.position.set(-8, 22, 12);
      fill.color.setHex(0xffb877); fill.intensity = 0.25;
      applyBloom('interior'); if (sound.ready) sound.setAmbience('night'); return;
    }
    // ---- min10: calle nocturna (mercado) ----
    if (mundo === 'calle-noche') {
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
    // ---- min15: campamento militar / taller (noche cálida) ----
    if (mundo === 'campamento' || mundo === 'taller') {
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
    // ---- min15: balcón sobre la muralla / monte (noche azul con luna) ----
    if (mundo === 'balcon' || mundo === 'monte') {
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

  // ================= Escena activa + secuencia =================
  let current: SceneInstance | null = null;
  let currentDef: AnyScene | null = null;
  let done = false;
  let advanceT = 0;
  const cineCam = new CinematicCamera(camera);
  const navBeacon = new NavBeacon(); scene.add(navBeacon.group);
  const dlg = new Dialogue();

  function disposeGroup(g: THREE.Group): void {
    g.traverse((o: THREE.Object3D) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
  }

  function loadScene(i: number): void {
    if (i >= SCENES.length) { finalWin(); return; }
    const def = SCENES[i];
    if (current) { scene.remove(current.group); current.dispose?.(); disposeGroup(current.group); }
    dlg.clear();
    cineCam.stop();   // corta cualquier cinemática de la escena anterior; si esta declara intro, se relanza abajo
    currentDef = def; done = false; advanceT = 0;
    applyAmbience(def);
    if (sound.ready) void sound.playSceneClip(`voz_${String(def.numero).padStart(2, '0')}`);
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
      say: (text, who = '', seconds, color) => dlg.say(who, text, { ...(seconds ? { ms: seconds * 1000 } : {}), ...(color !== undefined ? { color } : {}) }),
      setPlayerSkin: (which) => setPlayerSkin(which),
      setPlayerVisible: (v) => { player.root.visible = v; },
      cameraFocus: (target, seconds) => cineCam.focus(target, seconds),
      cameraReveal: (from, to, lookFrom, lookTo, seconds) => cineCam.reveal(from, to, lookFrom, lookTo, seconds),
      flash: (text, seconds) => sceneFlash(text, seconds)
    };
    avisoEl.style.display = 'none'; avisoUntil = 0;
    current = def.build(ctx);

    if (def.bounds) controller.setBounds(def.bounds.minX, def.bounds.maxX, def.bounds.minZ, def.bounds.maxZ);
    else controller.setBounds(-72, 72, def.spawn.z - 8, (def.objetivo.target?.z ?? def.spawn.z) + 26);
    controller.teleport(def.spawn.x, def.spawn.z);

    if (def.camara) { tpcam.yaw = def.camara.yaw ?? Math.PI; tpcam.pitch = def.camara.pitch ?? 0.4; tpcam.dist = def.camara.dist ?? 28; }

    titleEl.textContent = `Escena ${def.numero} · ${def.titulo}`;
    objEl.textContent = def.objetivo.tipo === 'cinematica' ? '' : '🎯 ' + def.objetivo.texto;
    objEl.style.display = def.objetivo.tipo === 'cinematica' ? 'none' : 'block';
    subEl.textContent = def.subtitulo;
    flashEl.textContent = '';
    if (def.intro) cineCam.reveal(def.intro.from, def.intro.to, def.intro.lookFrom, def.intro.lookTo, def.intro.seconds);
    (window as any).__SCENE_READY__ = true;
  }
  let sceneIndex = 0;

  // ---- Pantalla final de la aventura ----
  let ended = false;
  function finalWin(): void {
    if (ended) return; ended = true;
    if (sound.ready) sound.success();
    const fin = document.createElement('div');
    fin.innerHTML =
      '<div style="text-align:center;color:#f4e9d2;font-family:system-ui,sans-serif;padding:24px;max-width:560px">' +
      '<div style="font:800 32px/1.1 Georgia,serif;color:#e8b04b">¡Aventura completada! 🎉</div>' +
      '<div style="opacity:.9;margin:16px 0 22px">Cruzaste el Jordán con los espías, os escondisteis en la posada de Rahab, ' +
      'huisteis con el cordón rojo y preparasteis los <b>shofarot</b>. ¡Buen trabajo!</div>' +
      '<button id="reBtn2" style="font:800 20px/1 system-ui;color:#0a0705;background:#e8b04b;border:none;border-radius:14px;padding:14px 26px;cursor:pointer">↻ Jugar otra vez</button></div>';
    Object.assign(fin.style, { position: 'fixed', inset: '0', zIndex: '60', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(120% 100% at 50% 0%, #23324f, #0a0f18 78%)', opacity: '0', transition: 'opacity .6s' } as CSSStyleDeclaration);
    document.body.appendChild(fin);
    requestAnimationFrame(() => { fin.style.opacity = '1'; });
    fin.querySelector('#reBtn2')?.addEventListener('pointerdown', () => location.reload());
  }

  // primera escena del runner = esc09 (arranque del tramo 5–10)
  loadScene(0);

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

    if (current && currentDef) {
      current.update(dt, now / 1000, controller.pos);
      const st = current.status?.() ?? null;
      statusEl.textContent = st ?? '';
      const h = current.hud?.() ?? {};
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
      if (cine || done || currentDef.objetivo.tipo === 'cinematica') navBeacon.hide();
      else navBeacon.update(now / 1000, controller.pos.x, controller.pos.z, gt, !!h.prompt);

      if (!done && current.isDone(controller.pos)) {
        done = true; advanceT = 0;
        flashEl.textContent = '✅ ' + currentDef.exito;
        if (sound.ready) sound.success();
        spawnConfetti(controller.pos.x, controller.pos.z);
      }
      updateConfetti(dt);
      if (done) { advanceT += dt; if (advanceT > 2.6) { sceneIndex += 1; loadScene(sceneIndex); } }
    }

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
  (window as any).__jump_next = () => { sceneIndex += 1; loadScene(sceneIndex); };
  (window as any).__probe = () => {
    const p = controller.pos; const def = currentDef;
    const hud = (current && current.hud) ? current.hud() : {};
    const tgt = def?.objetivo?.target;
    return {
      numero: def?.numero ?? null, titulo: def?.titulo ?? null,
      tipo: def?.objetivo?.tipo ?? null, objetivo: def?.objetivo?.texto ?? null,
      pos: [+p.x.toFixed(1), +p.z.toFixed(1)],
      goal: (Array.isArray(hud.goal) ? hud.goal : (tgt ? [tgt.x, tgt.z] : null)),
      radio: def?.objetivo?.radio ?? null,
      done: current ? current.isDone(controller.pos) : false,
      prompt: hud.prompt ?? null, alarm: hud.alarm ?? 0, balance: hud.balance ?? null,
      progress: hud.progress ?? 0, gems: hud.gems ?? null,
      status: (current && current.status) ? current.status() : null,
      cine: cineCam.active ? 1 : 0,
      indice: sceneIndex, total: SCENES.length
    };
  };
  (window as any).__runnerReady = true;
}
