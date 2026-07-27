import * as THREE from 'three';

/**
 * runTramo — RUNNER CANÓNICO de tramos (contrato común para el INTEGRADOR).
 * Encargo del cerebro: "LEAD define el runner común".
 *
 * ── El contrato de ESCENA canónico YA existe ─────────────────────────────────
 * Es `src/scenes/min05/types.ts` (`SceneContext` / `SceneInstance` / `Min05Scene`),
 * que YA usan 5–10, 10–15 y 15–20 (15–20 lo extiende con `mundo`). Cada tramo
 * exporta su lista ORDENADA de escenas (`MIN05_SCENES`, `MIN10_SCENES`,
 * `MIN15_SCENES`) en su `registry.ts`. **Ese es el contrato: no se cambia.**
 *
 * ── Qué añade la base (aquí) ─────────────────────────────────────────────────
 * La base del LEAD NO contiene las escenas de los tramos (las trae el integrador),
 * así que este runner se tipa con interfaces MÍNIMAS **estructuralmente compatibles**
 * con las de min05/types (un `Min05Scene[]` encaja como `SceneDef[]`). Así el
 * integrador monta CUALQUIER tramo igual:
 *
 *   import { runTramo } from '../core/runTramo';
 *   import { MIN05_SCENES } from '../scenes/min05/registry';
 *   const runner = runTramo(MIN05_SCENES, orq, () => cargarSiguienteTramo());
 *   // en el bucle:   runner.update(dt, t);
 *   // al desmontar:  runner.dispose();
 *
 * El runner: por cada escena → pone spawn/skin/cámara/bounds (ganchos del
 * orquestador) → `build(ctx)` → añade su `group` → cada frame `update` + comprueba
 * `isDone(player)` → al cumplirse, `dispose()` + suma estrella + pasa a la siguiente;
 * al acabar la lista llama `onFinish` (el integrador enlaza con el siguiente tramo).
 *
 * El 0–5 (base) NO usa esto: es el flujo de `main.ts` (Director + beats), la apertura
 * del juego. Tras `finDelTramo()`, el integrador arranca el primer tramo jugable
 * (5–10, esc9) con `runTramo(...)`.
 */

/** Servicios que la escena pide (⊇ `SceneContext` de min05/types). Los provee el orquestador. */
export interface SceneCtx {
  scene: THREE.Scene;
  plastic: unknown;                                   // PlasticMaterialFactory
  getPlayer: () => THREE.Vector3;
  setPlayer: (x: number, z: number) => void;
  markDone: () => void;
  sound: unknown;                                     // SoundEngine (del orquestador)
  wantsInteract: () => boolean;
  addObstacle: (x: number, z: number, halfW: number, halfD: number) => void;
  setPlayerSkin: (which: string) => void;
  say?: (text: string, who?: string, seconds?: number, color?: number) => void;
  flash?: (text: string, seconds?: number) => void;
  setPlayerVisible?: (visible: boolean) => void;
  cameraFocus?: (target: THREE.Object3D, seconds: number) => void;
  cameraReveal?: (from: XYZ, to: XYZ, lookFrom: XYZ, lookTo: XYZ, seconds: number) => void;
}
interface XYZ { x: number; y: number; z: number }

/** Instancia viva (⊆ `SceneInstance` de min05/types) — lo que el runner llama. */
export interface SceneRunnable {
  group: THREE.Group;
  update(dt: number, t: number, player: THREE.Vector3): void;
  isDone(player: THREE.Vector3): boolean;
  dispose?(): void;
}

/** Descriptor de escena (⊆ `Min05Scene`) — lo que el runner consume del registry. */
export interface SceneDef {
  id: string;
  spawn: { x: number; z: number };
  camara?: { yaw?: number; pitch?: number; dist?: number };
  bounds?: { minX: number; maxX: number; minZ: number; maxZ: number };
  jugador?: string;
  build(ctx: SceneCtx): SceneRunnable;
}

/** Ganchos que pone el orquestador (integrador): mueve jugador/cámara/skin/bounds y HUD. */
export interface Orquestador {
  ctx: SceneCtx;
  setSpawn: (x: number, z: number) => void;
  setCamera?: (h: { yaw?: number; pitch?: number; dist?: number }) => void;
  setBounds?: (b: { minX: number; maxX: number; minZ: number; maxZ: number } | null) => void;
  setSkin?: (which: string) => void;
  addStars?: (n: number) => void;
}

export interface TramoRunner {
  update(dt: number, t: number): void;
  dispose(): void;
  /** Índice de la escena actual (0..total-1) y total, para HUD/QA. */
  readonly indice: number;
  readonly total: number;
}

/** Opciones del runner. */
export interface RunTramoOpts {
  /** Pausa de "celebración" (ms) entre que se cumple una escena y arranca la siguiente
   *  (la escena cumplida se queda visible ese ratito). Def. 0 = inmediato. El integrador
   *  usaba 2600 ms ("isDone → 2.6s → siguiente"); pásalo aquí para el mismo tacto. */
  pauseMs?: number;
}

/** Monta y encadena una lista ORDENADA de escenas. Llama `onFinish` al terminar todas. */
export function runTramo(scenes: SceneDef[], orq: Orquestador, onFinish?: () => void, opts: RunTramoOpts = {}): TramoRunner {
  const pauseMs = opts.pauseMs ?? 0;
  let i = -1;
  let inst: SceneRunnable | null = null;
  let pendiente = false;   // objetivo cumplido, esperando la pausa antes de pasar
  let pausa = 0;           // ms restantes de la pausa de celebración

  const salir = (): void => {
    if (inst) { orq.ctx.scene.remove(inst.group); inst.dispose?.(); inst = null; }
  };
  const entrar = (n: number): void => {
    salir();
    pendiente = false; pausa = 0;
    if (n >= scenes.length) { i = n; onFinish?.(); return; }
    i = n;
    const def = scenes[n];
    orq.setSkin?.(def.jugador ?? 'yoshua');
    orq.setSpawn(def.spawn.x, def.spawn.z);
    orq.setBounds?.(def.bounds ?? null);
    if (def.camara) orq.setCamera?.(def.camara);
    inst = def.build(orq.ctx);
    orq.ctx.scene.add(inst.group);
  };

  entrar(0);

  return {
    get indice() { return i; },
    get total() { return scenes.length; },
    update(dt, t) {
      if (!inst) return;
      const p = orq.ctx.getPlayer();
      inst.update(dt, t, p);                       // sigue animando (idle) también en la pausa
      if (!pendiente && inst.isDone(p)) {          // objetivo cumplido: ⭐ y arranca la pausa
        pendiente = true; pausa = pauseMs; orq.addStars?.(1);
      }
      if (pendiente) {
        pausa -= dt * 1000;
        if (pausa <= 0) entrar(i + 1);             // pasa a la siguiente (o onFinish al final)
      }
    },
    dispose() { salir(); },
  };
}
