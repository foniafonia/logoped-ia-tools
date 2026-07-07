/**
 * Confeti de canvas: ligero, limitado en tiempo y FPS, se limpia solo
 * y respeta prefers-reduced-motion.
 */

const COLORS = ['#F7B32B', '#E4572E', '#5F9E3E', '#3E7CB1', '#E8891D', '#FFFFFF'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
}

let active = false;

export function burstConfetti(durationMs = 2200, count = 90) {
  if (active) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  active = true;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    active = false;
    return;
  }

  const particles: Particle[] = Array.from({ length: count }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.4,
    y: canvas.height * 0.35,
    vx: (Math.random() - 0.5) * 620,
    vy: -Math.random() * 560 - 160,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 10,
    size: 6 + Math.random() * 7,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));

  const start = performance.now();
  let last = start;
  let raf = 0;

  const cleanup = () => {
    cancelAnimationFrame(raf);
    canvas.remove();
    active = false;
    document.removeEventListener('visibilitychange', onHidden);
  };
  const onHidden = () => {
    if (document.hidden) cleanup();
  };
  document.addEventListener('visibilitychange', onHidden);

  const frame = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.04);
    last = now;
    const elapsed = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const fade = Math.max(0, 1 - elapsed / durationMs);
    for (const p of particles) {
      p.vy += 900 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = fade;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    if (elapsed < durationMs) {
      raf = requestAnimationFrame(frame);
    } else {
      cleanup();
    }
  };
  raf = requestAnimationFrame(frame);
}
