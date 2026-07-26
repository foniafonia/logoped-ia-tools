import { bgJericoMurallas } from './assets/bgJericoMurallas';
import { mountHud } from './ui/Hud';
import { mountPauseMenu } from './ui/PauseMenu';

/**
 * Demo de la capa de JUEGO: HUD (objetivo + progreso de vueltas + pausa + acción
 * "shofar") y el MENÚ DE PAUSA, ambos con botones de ladrillo, sobre el fondo real.
 * Simula la mecánica del clímax: rodear la muralla 7 veces y tocar el shofar.
 */
document.body.style.margin = '0';
document.body.style.background = `#1c130a url("${bgJericoMurallas}") center/cover no-repeat`;
document.body.style.height = '100vh';

const pause = mountPauseMenu(document.body, {
  onResume: () => {},
  onSettings: () => alert('Ajustes'),
  onRestart: () => { hud.setProgress(0); hud.setObjective('Rodea la muralla'); hud.hideAction(); },
  onQuit: () => alert('Salir al menú')
});

const hud = mountHud(document.body, {
  objective: 'Rodea la muralla',
  laps: 7,
  onPause: () => pause.open()
});

// Simulación de progreso (para la demo/captura): 3 de 7 vueltas + shofar listo
hud.setProgress(3);
hud.showAction('¡Toca el shofar!', () => {
  hud.setProgress(7);
  hud.setObjective('¡La muralla cae!');
  hud.hideAction();
});

(window as any).__ready = true;
