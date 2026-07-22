import { Escena } from './StoryEngine';

/**
 * GUION JUGABLE — ACTO 1: "LA MISIÓN DE RAHAB"
 * (película real, escenas ~13–28: los espías cruzan el río, se cuelan en
 * Jericó, la treta del "avión", corren al Restaurante de Rahab, se esconden
 * de los guardias, atan el cordón rojo y huyen por la muralla).
 *
 * Protagonista de este acto: el ESPÍA (multi-protagonista por relevo: en otros
 * actos el motor pasará el control a Yehoshúa, los niños, el sacerdote…).
 *
 * Cada escena: subtítulo (frase de la peli), voz real (clip a cortar del audio),
 * objetivo (mecánica) y fondo real (fotograma). Los `target`/tiempos se afinan
 * al construir cada escenario 3D. Marcado TODO para no dar nada por sentado.
 */
export const GUION: Escena[] = [
  {
    id: 'a1_intro',
    subtitulo: 'Dos espías de Israel, enviados por Yoshúa, se acercan de noche a la fortaleza de Jericó.',
    fondo: '/fondos/a1_ext.jpg', protagonista: 'espia',
    objetivo: { tipo: 'cinematica', texto: '', dur: 6 },
    exito: 'Comienza la misión'
  },
  {
    id: 'a1_cruzar_rio',
    subtitulo: 'Cruza el río a oscuras colgado de la cuerda, sin caer al agua.',
    fondo: '/fondos/a1_ext.jpg', protagonista: 'espia',
    objetivo: { tipo: 'cruzar', texto: 'Cruza el río por la cuerda', target: { x: 0, z: 40 }, radio: 4 },
    exito: '¡Al otro lado!'
  },
  {
    id: 'a1_avion',
    subtitulo: 'Los guardias vigilan la puerta. Distráelos con la vieja treta: «¡Mirad, un avión!».',
    fondo: '/fondos/a1_ext.jpg', protagonista: 'espia',
    objetivo: { tipo: 'ir_a', texto: 'Distrae a los guardias', target: { x: 12, z: 26 }, radio: 4 },
    exito: 'Los guardias miran al cielo, confundidos'
  },
  {
    id: 'a1_colarse',
    subtitulo: 'Aprovecha el despiste: cuela a los espías por la puerta sin que te vean.',
    fondo: '/fondos/a1_ext.jpg', protagonista: 'espia',
    objetivo: { tipo: 'esconderse', texto: 'Pasa la puerta sin ser visto', target: { x: 0, z: 8 }, radio: 4 },
    exito: '¡Dentro de Jericó!'
  },
  {
    id: 'a1_correr_rahab',
    subtitulo: 'Los guardias encuentran vuestras huellas. ¡Corre al Restaurante de Rahab!',
    fondo: '/fondos/a1_ext.jpg', protagonista: 'espia',
    objetivo: { tipo: 'huir', texto: 'Corre hasta el Restaurante de Rahab', target: { x: -18, z: 20 }, radio: 4 },
    exito: 'Entráis en el restaurante'
  },
  {
    id: 'a1_pacto_rahab',
    subtitulo: 'Le contáis a Rahab que sois de Israel y le juráis salvarla. Ella acepta ayudaros.',
    fondo: '/fondos/a1_taberna.jpg', protagonista: 'espia',
    objetivo: { tipo: 'cinematica', texto: '', dur: 7 },
    exito: 'Rahab os ayudará'
  },
  {
    id: 'a1_esconderse',
    subtitulo: '¡Los guardias entran! Rápido: elige un escondite (tras el tapiz o en la maceta).',
    fondo: '/fondos/a1_taberna.jpg', protagonista: 'espia',
    objetivo: { tipo: 'esconderse', texto: 'Escóndete antes de que te vean', target: { x: -22, z: 22 }, radio: 3 },
    exito: 'Bien escondido…'
  },
  {
    id: 'a1_rahab_engana',
    subtitulo: 'Rahab miente a los guardias: «Se fueron hacia el río». Y salen corriendo.',
    fondo: '/fondos/a1_taberna.jpg', protagonista: 'espia',
    objetivo: { tipo: 'cinematica', texto: '', dur: 6 },
    exito: 'Los guardias se marchan'
  },
  {
    id: 'a1_cordon_rojo',
    subtitulo: 'Le das a Rahab un cordón rojo: átalo en la ventana y su familia se salvará.',
    fondo: '/fondos/a1_taberna.jpg', protagonista: 'espia',
    objetivo: { tipo: 'ir_a', texto: 'Ata el cordón rojo en la ventana', target: { x: -16, z: 24 }, radio: 3 },
    exito: '¡Cordón rojo colocado!'
  },
  {
    id: 'a1_huir',
    subtitulo: 'Baja por la cuerda del balcón y escapa en la noche de vuelta al campamento.',
    fondo: '/fondos/a1_ext.jpg', protagonista: 'espia',
    objetivo: { tipo: 'huir', texto: 'Baja por la cuerda y huye', target: { x: 0, z: 46 }, radio: 4 },
    exito: '¡Misión cumplida! Fin del Acto 1'
  }
  // → Acto 2: el cruce del Jordán, el asedio, el shofar y la caída de la muralla.
];
