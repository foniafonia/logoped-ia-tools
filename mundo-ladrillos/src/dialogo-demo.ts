import { bgJericoMurallas } from './assets/bgJericoMurallas';
import { mountDialogue, showTitleCard } from './ui/DialogueBox';

/**
 * Demo de las cartelas de diálogo (máquina de escribir) + cartela de transición,
 * sobre el fondo real. Clic en la caja para avanzar.
 */
document.body.style.margin = '0';
document.body.style.height = '100vh';
document.body.style.background = `#1c130a url("${bgJericoMurallas}") center/cover no-repeat`;

const dlg = mountDialogue(document.body);

showTitleCard(document.body, 'Siete días ante Jericó…', 2200, () => {
  dlg.play([
    { speaker: 'Yehoshúa', text: 'Rodearemos la ciudad una vez cada día.', color: '#4a7fd0' },
    { speaker: 'Yehoshúa', text: 'Y al séptimo día, siete veces.', color: '#4a7fd0' },
    { speaker: 'Narrador', text: 'El pueblo marchó en silencio. Solo el polvo y los pasos.', color: '#b0742a' },
    { speaker: 'Yehoshúa', text: '¡Ahora! ¡Tocad los shofares y gritad!', color: '#4a7fd0' }
  ], () => {
    showTitleCard(document.body, 'Y la muralla cayó.', 2600);
  });
});

(window as any).__ready = true;
