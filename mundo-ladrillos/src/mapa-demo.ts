import { bgJericoMurallas } from './assets/bgJericoMurallas';
import { mountLevelSelect } from './ui/LevelSelect';
import { showResult } from './ui/ResultScreen';

/**
 * Demo: selección de tramos (mapa de la historia) + pantalla de resultado.
 * Al pulsar el tramo actual se muestra una victoria de ejemplo con estrellas.
 */
document.body.style.margin = '0';
document.body.style.height = '100vh';
document.body.style.background = `#1c130a url("${bgJericoMurallas}") center/cover no-repeat`;

mountLevelSelect(document.body, {
  levels: [
    { name: 'Campamento', state: 'done', stars: 3 },
    { name: 'El Jordán', state: 'done', stars: 2 },
    { name: 'La llanura', state: 'current' },
    { name: 'Las murallas', state: 'locked' }
  ],
  onSelect: () => {
    showResult(document.body, {
      win: true, stars: 2,
      onNext: () => alert('Siguiente tramo'),
      onRetry: () => alert('Reintentar'),
      onMenu: () => alert('Menú')
    });
  }
});

(window as any).__ready = true;
