import * as THREE from 'three';

/**
 * GUÍA VISUAL reutilizable (extraída del 0–5, el estándar) para que TODOS los tramos
 * guíen igual al niño: una BALIZA "ve aquí" (aro + haz + flecha que bota) y FLECHAS-PISTA
 * "coge esto" flotando sobre coleccionables. Sin dependencias del juego: cualquier
 * escena Three puede usarlo. Objetivo: que el peque SIEMPRE sepa a dónde ir y qué pulsar.
 *
 * Uso típico:
 *   const beacon = createBeacon(scene);
 *   beacon.setTarget(x, z);           // marca el destino (o setTarget(null) para ocultar)
 *   // en el bucle de render:  beacon.update(performance.now());
 *
 *   const arrow = hintArrow(0xffe08a); collectible.add(arrow);   // pista sobre el objeto
 *   // en el bucle:  bobHint(arrow, performance.now());          // que bote y gire
 */

/** Flecha-pista: cono que apunta hacia abajo, flota sobre un coleccionable. */
export function hintArrow(color = 0xffe08a, y = 2.6): THREE.Mesh {
  const m = new THREE.Mesh(
    new THREE.ConeGeometry(0.34, 0.7, 4),
    new THREE.MeshBasicMaterial({ color })
  );
  m.rotation.x = Math.PI;   // punta hacia abajo (señala el objeto)
  m.position.y = y;
  m.userData.baseY = y;
  return m;
}

/** Anima una flecha-pista: gira sobre su eje y bota suavemente (llama cada frame). */
export function bobHint(arrow: THREE.Mesh, now: number, dt = 0.016): void {
  arrow.rotation.y += dt * 3;
  const baseY = (arrow.userData.baseY as number) ?? 2.6;
  arrow.position.y = baseY + Math.sin(now * 0.006 + arrow.position.x) * 0.25;
}

export interface Beacon {
  group: THREE.Group;
  /** Coloca la baliza en (x,z) y la muestra; `null` la oculta. */
  setTarget: (x: number | null, z?: number) => void;
  /** Anima aro + flecha (llamar cada frame con performance.now()). */
  update: (now: number) => void;
  visible: () => boolean;
}

/** Baliza "ve aquí": aro girando + haz translúcido + flecha que bota. */
export function createBeacon(scene: THREE.Scene, color = 0x8fe0ff): Beacon {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.5, 0.14, 10, 28),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 })
  );
  ring.rotation.x = Math.PI / 2;
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 1.4, 22, 16, 1, true),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false })
  );
  beam.position.y = 11;
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.3, 4), new THREE.MeshBasicMaterial({ color }));
  arrow.rotation.x = Math.PI; arrow.position.y = 4;
  group.add(ring, beam, arrow);
  group.visible = false;
  scene.add(group);

  let on = false;
  return {
    group,
    setTarget: (x: number | null, z = 0): void => {
      if (x === null) { group.visible = false; on = false; return; }
      group.position.set(x, 0, z); group.visible = true; on = true;
    },
    update: (now: number): void => {
      if (!on) return;
      ring.rotation.z += 0.025;
      arrow.position.y = 4 + Math.sin(now * 0.004) * 0.4;
    },
    visible: () => on
  };
}
