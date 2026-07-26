import { mountPortada } from './ui/Portada';

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
  onSettings: () => alert('Ajustes (sonido, calidad…).'),
  onCredits: () => alert('Créditos — Shevet Ahim.')
});

(window as any).__ready = true;
