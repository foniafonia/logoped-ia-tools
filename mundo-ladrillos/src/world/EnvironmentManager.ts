import * as THREE from 'three';

/** Cielo de atardecer (domo con degradado) + dunas lejanas. */
export function setupEnvironment(scene: THREE.Scene): void {
  // --- Domo de cielo con degradado (dorado abajo, azul arriba) ---
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(320, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        top: { value: new THREE.Color(0x9dc0e2) },
        mid: { value: new THREE.Color(0xf5dca6) },
        bot: { value: new THREE.Color(0xe7a94e) }
      },
      vertexShader: /* glsl */`
        varying float h;
        void main(){
          vec4 wp = modelMatrix * vec4(position, 1.0);
          h = normalize(wp.xyz).y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */`
        varying float h; uniform vec3 top; uniform vec3 mid; uniform vec3 bot;
        void main(){
          float t = clamp(h, -1.0, 1.0);
          vec3 c = t > 0.0 ? mix(mid, top, pow(t, 0.6)) : mix(mid, bot, pow(-t, 0.5));
          gl_FragColor = vec4(c, 1.0);
        }`
    })
  );
  scene.add(sky);

  // --- Dunas lejanas (montículos aplanados color arena) ---
  const duneMat = new THREE.MeshStandardMaterial({ color: 0xd9be86, roughness: 1, metalness: 0 });
  const dunes = [
    [-70, 0, -60, 60, 10], [40, 0, -80, 90, 14], [110, 0, -40, 70, 11],
    [-120, 0, -20, 80, 12], [80, 0, 60, 70, 10], [-90, 0, 70, 65, 9]
  ];
  for (const [x, , z, r, hh] of dunes) {
    const g = new THREE.SphereGeometry(r, 20, 12);
    const m = new THREE.Mesh(g, duneMat);
    m.position.set(x, -r + hh, z);
    m.scale.set(1, hh / r, 1);
    m.receiveShadow = true;
    scene.add(m);
  }
}
