import { Dialogue } from '../../../ui/Dialogue';

/**
 * Instancia ÚNICA del helper de diálogo COMPARTIDO del LEAD (`ui/Dialogue`) para el
 * tramo 10–15 (posada de Rahab). El cerebro ordenó usar ESTE helper canónico (no el
 * `DialogueBox` del muñequero) para que el juego tenga UNA sola API de bocadillos.
 *
 * Uso: las escenas importan `dlg` y llaman `dlg.say(quién, texto, { color, ms })` en su
 * momento clave (una sola vez). El preview llama `dlg.update(dt)` en el bucle y
 * `dlg.clear()` al cambiar de escena.
 */
export const dlg = new Dialogue();

/** Colores de nombre por hablante (coherentes con la biblia de la peli). */
export const VOZ = {
  rahab: 0xc9a227,   // dorado cálido (posadera)
  espia: 0x6f9fc4,   // azul espía
  guardia: 0xff6b5a  // rojo guardia de Jericó
};
