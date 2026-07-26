import { mountPortada } from './ui/Portada';
import { mountSettings } from './ui/SettingsPanel';
import { mountCredits } from './ui/Credits';

/**
 * Demo de la PORTADA (pantalla de título con botones de ladrillo) sobre el fondo
 * real de Higgsfield (murallas de Jericó). Los botones aquí solo muestran un
 * aviso; en el juego el LEAD engancha `onPlay` a empezar la partida, etc.
 */
const portada = mountPortada(document.body, {
  onPlay: () => {
    portada.hide(); // se desvanece como haría al empezar la partida
    setTimeout(() => {
      alert('▶ Empezar partida (aquí arrancaría el nivel).');
      portada.show();
    }, 550);
  },
  onContinue: () => alert('Continuar partida guardada.'),
  onSettings: () => mountSettings(document.body, { onChange: (v) => console.log('ajustes', v) }),
  onCredits: () => mountCredits(document.body, {})
});

(window as any).__ready = true;
