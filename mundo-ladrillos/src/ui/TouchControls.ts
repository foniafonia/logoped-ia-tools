import { CharacterController } from '../characters/CharacterController';

/**
 * Controles táctiles para móvil: joystick virtual (izquierda) para moverse,
 * y botones de saltar y de interacción (shofar) a la derecha. Escribe en
 * controller.touch; la cámara se gira arrastrando en el resto de la pantalla.
 */
/** Qué botones de acción mostrar. Por defecto TODOS (retrocompatible). Las escenas
 *  sin shofar/combate (p.ej. el campamento 0–5) apagan los que no hacen nada, para
 *  no confundir al peque. */
export interface TouchOpts { shofar?: boolean; attack?: boolean; }

export class TouchControls {
  constructor(private controller: CharacterController, opts: TouchOpts = {}) {
    const showShofar = opts.shofar !== false;
    const showAttack = opts.attack !== false;
    this.buildJoystick();
    this.buildButton('⤴', 'right: 24px; bottom: 96px;', () => { this.controller.touch.jump = true; });
    if (showShofar) this.buildButton('🎺', 'right: 108px; bottom: 40px;', () => {
      dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' }));
    });
    if (showAttack) this.buildButton('⚔️', 'right: 108px; bottom: 124px;', () => {
      dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyF' }));
    });
    const hint = document.createElement('div');
    hint.textContent = 'Joystick para andar · arrastra la pantalla para girar la cámara';
    Object.assign(hint.style, {
      position: 'fixed', bottom: '14px', left: '50%', transform: 'translateX(-50%)', maxWidth: '52%',
      font: '600 12px system-ui, sans-serif', color: '#3a2f1c', textAlign: 'center',
      background: 'rgba(255,255,255,.6)', padding: '6px 10px', borderRadius: '8px', zIndex: '20', pointerEvents: 'none'
    } as CSSStyleDeclaration);
    document.body.appendChild(hint);
    setTimeout(() => hint.remove(), 6000);
  }

  private buildJoystick(): void {
    const base = document.createElement('div');
    Object.assign(base.style, {
      position: 'fixed', left: '26px', bottom: '30px', width: '128px', height: '128px',
      borderRadius: '50%', background: 'rgba(20,14,8,.28)', border: '2px solid rgba(255,255,255,.35)',
      touchAction: 'none', zIndex: '20'
    } as CSSStyleDeclaration);
    const knob = document.createElement('div');
    Object.assign(knob.style, {
      position: 'absolute', left: '50%', top: '50%', width: '56px', height: '56px',
      marginLeft: '-28px', marginTop: '-28px', borderRadius: '50%',
      background: 'rgba(232,176,75,.85)', boxShadow: '0 3px 10px rgba(0,0,0,.4)'
    } as CSSStyleDeclaration);
    base.appendChild(knob);
    document.body.appendChild(base);

    const R = 48;
    let id: number | null = null;
    const rect = () => base.getBoundingClientRect();
    const move = (cx: number, cy: number): void => {
      const r = rect();
      let dx = cx - (r.left + r.width / 2);
      let dy = cy - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy);
      if (d > R) { dx = dx / d * R; dy = dy / d * R; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      this.controller.touch.x = dx / R;
      this.controller.touch.z = dy / R;
    };
    const reset = (): void => {
      id = null; knob.style.transform = 'translate(0,0)';
      this.controller.touch.x = 0; this.controller.touch.z = 0;
    };
    base.addEventListener('pointerdown', (e) => { id = e.pointerId; base.setPointerCapture(e.pointerId); move(e.clientX, e.clientY); });
    base.addEventListener('pointermove', (e) => { if (e.pointerId === id) move(e.clientX, e.clientY); });
    base.addEventListener('pointerup', reset);
    base.addEventListener('pointercancel', reset);
  }

  private buildButton(label: string, pos: string, onPress: () => void): void {
    const b = document.createElement('button');
    b.textContent = label;
    b.style.cssText = `position:fixed;${pos}width:72px;height:72px;border-radius:50%;
      background:rgba(232,176,75,.85);border:2px solid rgba(255,255,255,.4);font-size:28px;
      z-index:20;touch-action:none;box-shadow:0 3px 10px rgba(0,0,0,.4);`;
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); onPress(); });
    document.body.appendChild(b);
  }
}
