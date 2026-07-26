import { bgJericoMurallas } from './assets/bgJericoMurallas';
import { mountPortada } from './ui/Portada';
import { mountLevelSelect, type LevelNode } from './ui/LevelSelect';
import { mountHud } from './ui/Hud';
import { mountPauseMenu } from './ui/PauseMenu';
import { mountSettings } from './ui/SettingsPanel';
import { showResult } from './ui/ResultScreen';
import { mountDialogue, showTitleCard } from './ui/DialogueBox';

/**
 * Flujo completo del kit de UI encadenado (vertical slice), como referencia para
 * el LEAD: Portada → Mapa de tramos → (diálogo) → HUD/juego → Resultado → Mapa.
 * Todo con los mismos módulos; aquí solo se orquesta el "quién llama a quién".
 */
document.body.style.margin = '0';
document.body.style.height = '100vh';
document.body.style.background = `#1c130a url("${bgJericoMurallas}") center/cover no-repeat`;

const levels: LevelNode[] = [
  { name: 'Campamento', state: 'done', stars: 3 },
  { name: 'El Jordán', state: 'done', stars: 2 },
  { name: 'La llanura', state: 'current' },
  { name: 'Las murallas', state: 'locked' }
];

function goPortada(): void {
  const portada = mountPortada(document.body, {
    onPlay: () => { portada.destroy(); goMapa(); },
    onContinue: () => { portada.destroy(); goMapa(); },
    onSettings: () => mountSettings(document.body, {}),
    onCredits: () => alert('Créditos — Shevet Ahim')
  });
}

function goMapa(): void {
  const mapa = mountLevelSelect(document.body, {
    levels,
    onSelect: () => { mapa.destroy(); goTramo(); }
  });
}

function goTramo(): void {
  // Intro con diálogo, luego el "juego" (HUD)
  const dlg = mountDialogue(document.body);
  dlg.play([
    { speaker: 'Yehoshúa', text: 'Rodead la ciudad. Al séptimo día, el shofar.', color: '#4a7fd0' }
  ], () => { dlg.destroy(); playHud(); });
}

function playHud(): void {
  let lap = 0;
  const pause = mountPauseMenu(document.body, {
    onResume: () => {},
    onSettings: () => mountSettings(document.body, {}),
    onRestart: () => { hud.destroy(); pause.destroy(); goTramo(); },
    onQuit: () => { hud.destroy(); pause.destroy(); goMapa(); }
  });
  const hud = mountHud(document.body, {
    objective: 'Rodea la muralla', laps: 7, onPause: () => pause.open()
  });

  // Simulación: una vuelta cada 500 ms hasta 7, luego aparece el shofar.
  const tick = setInterval(() => {
    lap++;
    hud.setProgress(lap);
    if (lap >= 7) {
      clearInterval(tick);
      hud.setObjective('¡Toca el shofar!');
      hud.showAction('¡Toca el shofar!', () => {
        hud.hideAction();
        showTitleCard(document.body, 'Y la muralla cayó.', 1800, () => {
          hud.destroy(); pause.destroy();
          // desbloquea el siguiente tramo
          levels[2] = { name: 'La llanura', state: 'done', stars: 3 };
          levels[3] = { name: 'Las murallas', state: 'current' };
          showResult(document.body, {
            win: true, stars: 3,
            onNext: () => goMapa(),
            onRetry: () => goTramo(),
            onMenu: () => goPortada()
          });
        });
      });
    }
  }, 450);
}

goPortada();
(window as any).__ready = true;
