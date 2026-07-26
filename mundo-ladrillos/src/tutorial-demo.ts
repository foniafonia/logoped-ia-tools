import { bgCampamento } from './assets/bgCampamento';
import { mountControls } from './ui/Controls';
import { showTutorial } from './ui/Tutorial';

document.body.style.margin = '0';
document.body.style.height = '100vh';
document.body.style.background = `#1c130a url("${bgCampamento}") center/cover no-repeat`;

mountControls(document.body, { forceTouch: true, onMove: () => {}, onInteract: () => {} });
showTutorial(document.body, [
  { target: '.gc-stick', text: 'Arrastra aquí para MOVERTE' },
  { target: '.gc-e', text: 'Pulsa la mano para HABLAR o actuar' },
  { text: '¡Listo! Rodea la muralla y toca el shofar.' }
]);
(window as any).__ready = true;
