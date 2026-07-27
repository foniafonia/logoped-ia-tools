import * as THREE from 'three';

/**
 * BALIZA DE NAVEGACIÓN (petición del Segundo Cerebro, P1+P2): que un niño sepa
 * SIEMPRE a dónde ir y dónde pulsar E, al nivel del tramo 0–5. Es genérica: se
 * añade UNA vez a la escena del preview y se alimenta cada frame con el objetivo
 * actual (`goal`) y si ahí hay acción de E (`atEspot`). No toca las 8 escenas.
 *
 * - Aro brillante + haz de luz vertical en el OBJETIVO → "aquí es" (visible de lejos).
 * - Flecha flotante sobre el jugador que APUNTA al objetivo → "hacia allá".
 * - En el sitio de pulsar E, el aro se vuelve DORADO y late más → "pulsa aquí".
 * Materiales básicos + aditivos (sin luces reales) para no cargar el móvil.
 */
export class NavBeacon {
  group = new THREE.Group();
  private marker = new THREE.Group();   // aro + haz (se coloca en el objetivo)
  private arrow = new THREE.Group();    // flecha (se coloca sobre el jugador)
  private ringMat: THREE.MeshBasicMaterial;
  private ring2Mat: THREE.MeshBasicMaterial;
  private beamMat: THREE.MeshBasicMaterial;
  private arrowMat: THREE.MeshBasicMaterial;
  private ring: THREE.Mesh;
  private chevron!: THREE.Mesh;
  private beamMatSolid!: THREE.MeshBasicMaterial;

  private readonly GO = 0x8fe0ff;   // cian: "ve aquí"
  private readonly E = 0xffd24a;    // dorado: "pulsa E aquí"

  constructor() {
    this.ringMat = new THREE.MeshBasicMaterial({ color: this.GO, transparent: true, opacity: 0.95, side: THREE.DoubleSide, depthWrite: false });
    this.ring = new THREE.Mesh(new THREE.RingGeometry(1.8, 2.7, 40), this.ringMat);
    this.ring.rotation.x = -Math.PI / 2; this.ring.position.y = 0.35;
    this.ring2Mat = new THREE.MeshBasicMaterial({ color: this.GO, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false });
    const ring2 = new THREE.Mesh(new THREE.RingGeometry(2.9, 3.4, 40), this.ring2Mat);
    ring2.rotation.x = -Math.PI / 2; ring2.position.y = 0.33;
    this.beamMat = new THREE.MeshBasicMaterial({ color: this.GO, transparent: true, opacity: 0.26, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.2, 17, 18, 1, true), this.beamMat);
    beam.position.y = 8.5;
    // galón flotante SOBRE el objetivo (bota): "aquí es", visible desde lejos aunque
    // el aro quede pequeño u ocluido. Cono invertido (punta hacia abajo).
    this.chevron = new THREE.Mesh(new THREE.ConeGeometry(1.35, 2.3, 4), this.beamMatSolid = new THREE.MeshBasicMaterial({ color: this.GO }));
    this.chevron.rotation.x = Math.PI;   // punta hacia abajo, señalando el aro
    this.marker.add(this.ring, ring2, beam, this.chevron);

    // flecha: cono (tip a +Z) sobre un mástil corto; el grupo gira para apuntar
    this.arrowMat = new THREE.MeshBasicMaterial({ color: this.E });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.7, 5), this.arrowMat);
    cone.rotation.x = Math.PI / 2;   // punta hacia +Z (dirección de avance)
    this.arrow.add(cone);

    this.group.add(this.marker, this.arrow);
    this.group.renderOrder = 5;
  }

  /** Coloca aro/haz en `goal` y la flecha sobre el jugador apuntando al objetivo.
   *  `goal` en [x,z] (o null para ocultar). `atEspot`: hay acción de E en el sitio. */
  update(t: number, px: number, pz: number, goal: [number, number] | null, atEspot: boolean): void {
    if (!goal) { this.group.visible = false; return; }
    this.group.visible = true;
    const [gx, gz] = goal;
    const col = atEspot ? this.E : this.GO;
    this.ringMat.color.setHex(col); this.ring2Mat.color.setHex(col);
    this.beamMat.color.setHex(col); this.beamMatSolid.color.setHex(col);

    // marcador en el objetivo (late; más rápido si es sitio de pulsar E)
    this.marker.position.set(gx, 0, gz);
    const pulse = 1 + Math.sin(t * (atEspot ? 7 : 3.5)) * (atEspot ? 0.18 : 0.1);
    this.ring.scale.setScalar(pulse);
    // galón botando sobre el objetivo
    this.chevron.position.y = 5.4 + Math.sin(t * (atEspot ? 6 : 3)) * 0.5;
    this.chevron.rotation.z = t * 1.2;   // gira suave para llamar la atención

    // flecha sobre el jugador, apuntando en horizontal al objetivo; se oculta al llegar
    const dx = gx - px, dz = gz - pz;
    const d = Math.hypot(dx, dz);
    if (d > 3.2) {
      this.arrow.visible = true;
      this.arrow.position.set(px, 4.4 + Math.sin(t * 3) * 0.28, pz);
      this.arrow.rotation.y = Math.atan2(dx, dz);
    } else {
      this.arrow.visible = false;   // ya estás encima: solo queda el aro
    }
  }

  hide(): void { this.group.visible = false; }
}
