import * as THREE from 'three';

/**
 * Textura de suelo = placa base de tetones con ALMA DE ARENA: base cálida (no se
 * revienta a blanco con la luz fuerte), + ondas del desierto + parches y motas
 * → deja de parecer un plano liso repetido. Tile grande (8 u.) para disimular
 * la repetición. Barata (un plano).
 */
function studTexture(): THREE.CanvasTexture {
  const T = 512, UN = 8;               // 512 px = 8 unidades (8×8 tetones)
  const c = document.createElement('canvas');
  c.width = c.height = T;
  const x = c.getContext('2d')!;

  // base arena cálida con degradado suave (rompe el tono plano)
  const base = x.createLinearGradient(0, 0, T, T);
  base.addColorStop(0, '#cdb082'); base.addColorStop(0.5, '#c6a974'); base.addColorStop(1, '#c9ab77');
  x.fillStyle = base; x.fillRect(0, 0, T, T);

  // parches de arena (más claros/oscuros) — macro variación
  for (let i = 0; i < 26; i++) {
    const px = Math.random() * T, py = Math.random() * T, pr = 30 + Math.random() * 90;
    const g = x.createRadialGradient(px, py, 0, px, py, pr);
    const dark = Math.random() < 0.5;
    g.addColorStop(0, dark ? 'rgba(150,120,72,.16)' : 'rgba(238,220,176,.16)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.beginPath(); x.arc(px, py, pr, 0, Math.PI * 2); x.fill();
  }
  // ondas del desierto (líneas suaves)
  x.lineWidth = 2;
  for (let i = 0; i < 22; i++) {
    x.strokeStyle = `rgba(150,120,72,${0.05 + Math.random() * 0.06})`;
    const y0 = Math.random() * T, amp = 4 + Math.random() * 8;
    x.beginPath();
    for (let px = 0; px <= T; px += 12) x.lineTo(px, y0 + Math.sin(px * 0.03 + i) * amp);
    x.stroke();
  }

  // tetones (8×8) sutiles y cálidos
  const step = T / UN;
  for (let i = 0; i < UN; i++) {
    for (let j = 0; j < UN; j++) {
      const cx = i * step + step / 2, cy = j * step + step / 2, rr = step * 0.36;
      const g = x.createRadialGradient(cx - rr * 0.35, cy - rr * 0.35, 1, cx, cy, rr);
      g.addColorStop(0, 'rgba(233,215,170,.55)'); g.addColorStop(0.7, 'rgba(203,175,124,.28)'); g.addColorStop(1, 'rgba(184,154,99,.10)');
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, rr, 0, Math.PI * 2); x.fill();
      x.strokeStyle = 'rgba(120,90,40,.14)'; x.lineWidth = 1.5;
      x.beginPath(); x.arc(cx, cy, rr, 0, Math.PI * 2); x.stroke();
    }
  }

  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Suelo tipo placa base, muy grande, hecho con UN plano texturizado. */
export function createStuddedGround(size = 600): THREE.Mesh {
  const tex = studTexture();
  tex.repeat.set(size / 8, size / 8); // el tile cubre 8 unidades
  // color de material cálido: aunque la luz fuerte lo suba, NO se va a blanco
  const mat = new THREE.MeshStandardMaterial({ map: tex, color: 0xdcc290, roughness: 0.96, metalness: 0 });
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
