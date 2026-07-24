/**
 * CHAPITA DE PARTE (para iterar el juego con feedback preciso).
 *
 * Pinta una etiqueta pequeña y siempre visible con el CÓDIGO de la parte del
 * juego (escena, modo, audio que suena) — ideal para captura — y un botón
 * "📋 Copiar" que copia al portapapeles un REPORTE listo para pegar al hilo
 * dueño (escena + archivo + audio + posición + hueco para el problema).
 *
 * USO (una vez por escena):
 *   import { mountSceneTag } from '../ui/SceneTag';
 *   const tag = mountSceneTag({
 *     id: 'E15', tramo: 'T2', nombre: 'Colarse por la puerta',
 *     modo: 'calle-noche', hilo: 'min05', archivo: 'escena15_colarse_puerta.ts',
 *     getAudio: () => audio.nowPlaying(),        // string con el/los clip(s)
 *     getPos:   () => ({ x: controller.pos.x, z: controller.pos.z }),
 *   });
 *   // al cambiar de escena:
 *   tag.dispose();
 */

export interface SceneTagInfo {
  id: string;                         // "E15" — código corto y estable
  nombre: string;                     // "Colarse por la puerta"
  tramo?: string;                     // "T2" (0-5, 5-10, muralla…)
  modo?: string;                      // "calle-noche" (modo de horizonte)
  hilo?: string;                      // "min05" — hilo dueño
  archivo?: string;                   // "escena15_colarse_puerta.ts"
  getAudio?: () => string;            // clip(s) sonando ahora ("mudo" si nada)
  getPos?: () => { x: number; z: number };
  getExtra?: () => string;            // cualquier dato extra (alarma, fase…)
  pos?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface SceneTagHandle {
  el: HTMLElement;
  setAudio(name: string): void;       // por si prefieres empujar el audio al cambiar
  dispose(): void;
}

export function mountSceneTag(info: SceneTagInfo): SceneTagHandle {
  const prev = document.getElementById('scene-tag');
  if (prev) prev.remove();

  const el = document.createElement('div');
  el.id = 'scene-tag';
  const corner = info.pos ?? 'top-left';
  const vy = corner.startsWith('top') ? 'top:54px;' : 'bottom:40px;';
  const vx = corner.endsWith('left') ? 'left:10px;' : 'right:10px;';
  el.setAttribute('style',
    `position:fixed;${vy}${vx}z-index:60;display:flex;align-items:center;gap:8px;` +
    'font:600 12px/1.2 ui-monospace,Menlo,Consolas,monospace;color:#ffe9c2;' +
    'background:rgba(20,16,28,.82);border:1px solid rgba(255,210,120,.35);' +
    'border-radius:10px;padding:6px 8px;backdrop-filter:blur(3px);max-width:60vw;');

  const label = document.createElement('span');
  const btn = document.createElement('button');
  btn.textContent = '📋 Copiar';
  btn.setAttribute('style',
    'font:700 12px/1 system-ui;color:#0a0705;background:#ffd24a;border:none;' +
    'border-radius:7px;padding:5px 8px;cursor:pointer;white-space:nowrap;');

  const audioNow = (): string => { try { return info.getAudio ? info.getAudio() : '—'; } catch { return '—'; } };
  const render = (): void => {
    const parts = [`▸ ${info.id}`];
    if (info.modo) parts.push(info.modo);
    parts.push('🎵 ' + audioNow());
    label.textContent = parts.join('  ·  ');
  };
  render();
  const timer = setInterval(render, 500);   // refresca el audio en vivo

  const report = (): string => {
    const pos = (() => { try { const p = info.getPos?.(); return p ? `x=${p.x.toFixed(1)} z=${p.z.toFixed(1)}` : '—'; } catch { return '—'; } })();
    const extra = (() => { try { return info.getExtra ? info.getExtra() : ''; } catch { return ''; } })();
    return [
      '=== REPORTE DE PARTE (pegar al hilo dueño) ===',
      `Parte: ${info.tramo ? info.tramo + ' · ' : ''}${info.id} "${info.nombre}"`,
      `Hilo/archivo: ${info.hilo ?? '?'} · ${info.archivo ?? '?'}`,
      info.modo ? `Modo horizonte: ${info.modo}` : '',
      `Audio sonando: ${audioNow()}`,
      `Jugador: ${pos}`,
      extra ? `Extra: ${extra}` : '',
      'PROBLEMA: (describe aquí qué falla / qué cambiar)',
      '=============================================='
    ].filter(Boolean).join('\n');
  };

  const flash = (msg: string): void => { const o = btn.textContent; btn.textContent = msg; setTimeout(() => { btn.textContent = o; }, 1100); };
  btn.onclick = async (): Promise<void> => {
    const text = report();
    try { await navigator.clipboard.writeText(text); flash('✓ copiado'); }
    catch {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); flash('✓ copiado'); } catch { flash('⚠ copia manual'); prompt('Copia esto:', text); }
      ta.remove();
    }
  };

  el.append(label, btn);
  document.body.appendChild(el);

  return {
    el,
    setAudio(name: string): void { info.getAudio = () => name; render(); },
    dispose(): void { clearInterval(timer); el.remove(); }
  };
}
