import * as THREE from 'three';

/** Textura de placa base (tetones) para el suelo, barata (un plano). */
function studTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d')!;
  x.fillStyle = '#d9c08a';
  x.fillRect(0, 0, 256, 256);
  const step = 64;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const cx = i * step + step / 2, cy = j * step + step / 2;
      const g = x.createRadialGradient(cx - 8, cy - 8, 2, cx, cy, 26);
      g.addColorStop(0, '#efdcae'); g.addColorStop(0.7, '#d4bb85'); g.addColorStop(1, '#c2a870');
      x.fillStyle = g;
      x.beginPath(); x.arc(cx, cy, 24, 0, Math.PI * 2); x.fill();
      x.strokeStyle = 'rgba(120,90,40,.25)'; x.lineWidth = 2;
      x.beginPath(); x.arc(cx, cy, 24, 0, Math.PI * 2); x.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

/** Suelo tipo placa base, muy grande, hecho con UN plano texturizado. */
export function createStuddedGround(size = 600): THREE.Mesh {
  const tex = studTexture();
  tex.repeat.set(size / 4, size / 4); // 1 tetón ≈ 1 unidad
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.4;
  ground.receiveShadow = true;
  return ground;
}

/** Cielo de atardecer (domo con degradado) + dunas lejanas. */
export function setupEnvironment(scene: THREE.Scene): void {
  scene.add(createStuddedGround(600));

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
