import { Escena } from './StoryEngine';

/**
 * GUION JUGABLE de "La Conquista de Israel".
 * La película, escena a escena, en el orden real. Cada escena tiene su
 * subtítulo (frase de la peli), su objetivo y el enlace a la siguiente.
 *
 * Empezamos por el principio (el espía llega a Jericó de noche). Las voces
 * reales se irán cortando del audio y enganchando en el campo "voz".
 * Las escenas de shofar/batalla ya existen como sistemas y se integrarán
 * como escenas finales de este mismo guión.
 */
export const GUION: Escena[] = [
  {
    id: 'intro',
    subtitulo: 'Eres un espía de Israel. Yoshúa te ha enviado a Jericó para explorar la ciudad… sin que te descubran.',
    objetivo: { tipo: 'cinematica', texto: '', dur: 6 },
    exito: 'La misión comienza'
  },
  {
    id: 'entrar_ciudad',
    subtitulo: 'Es de noche. La puerta de Jericó está delante. Entra en la ciudad.',
    objetivo: { tipo: 'ir_a', texto: 'Entra por la puerta de la ciudad', target: { x: 0, z: 6 }, radio: 5 },
    exito: '¡Estás dentro de Jericó!'
  },
  {
    id: 'esconderse_rahab',
    subtitulo: '¡Los guardias del rey te buscan! Corre a esconderte en la casa de Rahab.',
    objetivo: { tipo: 'esconderse', texto: 'Escóndete en la casa de Rahab', target: { x: -18, z: 20 }, radio: 4 },
    exito: 'Rahab te oculta en su tejado'
  },
  {
    id: 'rahab_pacto',
    subtitulo: 'Rahab te protege. A cambio, le prometes salvarla a ella y su familia con un cordón rojo en la ventana.',
    objetivo: { tipo: 'cinematica', texto: '', dur: 7 },
    exito: 'Trato hecho con Rahab'
  }
  // … (continúa la peli: colgar el cordón, huir por la ventana, el sendero,
  //     cruzar el Jordán, la marcha, el shofar, la muralla y la batalla)
];
