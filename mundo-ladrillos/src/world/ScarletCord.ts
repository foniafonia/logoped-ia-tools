import * as THREE from 'three';
import { PlasticMaterialFactory } from '../materials/PlasticMaterialFactory';

/**
 * El CORDÓN ROJO de Rahab (Josué 2:18) — la señal atada a la ventana por la que
 * bajan los espías y que marca su casa para que se salve. Es el objeto simbólico
 * del RESCATE en el clímax (tras caer la muralla). Cordón trenzado carmesí que
 * cuelga desde un punto de anclaje (alféizar/ventana) con una lazada arriba y un
 * pequeño rollo al pie. Objeto de historia reutilizable por el LEAD/integrador.
 *
 *   scene.add(buildScarletCord(plastic, { top: { x: 2, y: 5, z: -3 }, length: 4.2 }));
 *   // apoyado en un muro que mira a +Z; usa `yaw`/`lean` para orientarlo.
 */
export function buildScarletCord(
  plastic: PlasticMaterialFactory,
  o: {
    top?: { x: number; y: number; z: number };
    length?: number;
    lean?: number;        // cuánto se separa del muro al caer (m)
    thickness?: number;
    color?: number;
    yaw?: number;         // orientación del plano de caída
    coil?: boolean;       // rollo/lazada en el suelo al pie
  } = {}
): THREE.Group {
  const g = new THREE.Group();
  const top = o.top ?? { x: 0, y: 5, z: 0 };
  const L = o.length ?? 4.2;
  const lean = o.lean ?? 0.5;
  const th = o.thickness ?? 0.06;
  const red = plastic.get(o.color ?? 0xb31b1b);
  const redDk = plastic.get(0x8f1414);

  // Curva de caída: sale del anclaje, se separa un poco del muro y baja al suelo.
  const pts = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.05, -L * 0.28, lean * 0.55),
    new THREE.Vector3(-0.03, -L * 0.6, lean * 0.9),
    new THREE.Vector3(0.02, -L * 0.86, lean * 0.75),
    new THREE.Vector3(0, -L, lean * 0.5)
  ];
  const curve = new THREE.CatmullRomCurve3(pts);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, th, 8, false), red);
  tube.castShadow = true; g.add(tube);
  // "Trenzado": un segundo hilo fino enroscado en espiral sobre el principal.
  const braidPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const p = curve.getPoint(t);
    const ang = t * Math.PI * 18;
    braidPts.push(new THREE.Vector3(p.x + Math.cos(ang) * th * 0.7, p.y, p.z + Math.sin(ang) * th * 0.7));
  }
  const braid = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(braidPts), 60, th * 0.28, 6, false), redDk);
  g.add(braid);

  // Lazada/nudo en el anclaje
  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(th * 1.6, th * 0.7, 40, 6), redDk);
  knot.position.set(0, 0.02, 0); knot.castShadow = true; g.add(knot);
  // Cabo suelto que cuelga del nudo
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(th * 0.7, th * 0.5, 0.5, 6), red);
  tail.position.set(th * 2, -0.25, th); tail.rotation.z = 0.3; g.add(tail);

  // Rollo en el suelo al pie (opcional)
  if (o.coil ?? true) {
    const coil = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22 - i * 0.05, th * 0.8, 6, 16), i % 2 ? red : redDk);
      ring.rotation.x = Math.PI / 2; ring.position.y = i * th * 1.4 + th; coil.add(ring);
    }
    coil.position.set(0, 0, lean * 0.5); coil.position.y = -L + th;
    g.add(coil);
  }

  g.position.set(top.x, top.y, top.z);
  if (o.yaw) g.rotation.y = o.yaw;
  return g;
}
