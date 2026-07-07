import type { Avatar, Film, MockStudent, Reward } from '../types';

/**
 * CONTENIDO DEMO — Para adaptar a la película real:
 * 1. Cambia `youtubeId` por el id del vídeo definitivo.
 * 2. Ajusta `videoStart` / `videoEnd` de cada escena (segundos).
 *    Regla de producto: cada fragmento dura 90–120 s como máximo; el reproductor
 *    corta ANTES si la edad lo pide y nunca deja ver más allá del rango.
 * 3. Sustituye títulos, narrativa y actividades por el contenido real.
 * La estructura de datos no necesita cambios.
 *
 * Los fragmentos demo están repartidos a lo largo de la película (~39 min).
 */

export const rewards: Reward[] = [
  { id: 'r-claqueta', type: 'sticker', name: 'Pegatina Claqueta', emoji: '🎬' },
  { id: 'r-gema', type: 'gem', name: 'Gema del Detective', emoji: '💎' },
  { id: 'r-palomitas', type: 'sticker', name: 'Pegatina Palomitas', emoji: '🍿' },
  { id: 'r-cofre-bronce', type: 'chest', name: 'Cofre de Bronce', emoji: '🎁' },
  { id: 'r-valiente', type: 'badge', name: 'Insignia Valiente', emoji: '🛡️' },
  { id: 'r-cofre-oro', type: 'chest', name: 'Cofre Dorado', emoji: '🏆' },
  { id: 'r-diez-estrellas', type: 'badge', name: 'Estrella de 10', emoji: '🌟' },
  { id: 'r-superfan', type: 'sticker', name: 'Superfan del Cine', emoji: '🎟️' },
];

export const avatars: Avatar[] = [
  { id: 'av-timo', name: 'Timo el zorro', emoji: '🦊', color: '#E4572E' },
  { id: 'av-luna', name: 'Luna la búho', emoji: '🦉', color: '#3E7CB1' },
  { id: 'av-mila', name: 'Mila la gata', emoji: '🐱', color: '#F7B32B' },
];

export const film: Film = {
  title: 'FonoPelícula',
  tagline: 'La Aventura Desbloqueada',
  guideName: 'Foni',
  guideEmoji: '⭐',
  youtubeId: 'T3LUopT40Zs',
  scenes: [
    {
      id: 'escena-1',
      order: 1,
      title: 'El misterio comienza',
      subtitle: 'Todo empieza con una sorpresa',
      emoji: '🔮',
      color: '#3E7CB1',
      videoStart: 0,
      videoEnd: 110,
      narrative:
        '¡Hola! Soy Foni, la estrella del cine. ¡Los trozos de mi película se han perdido! Mira esta primera escena con mucha atención: si superas los retos, recuperaremos la película juntos.',
      rewardId: 'r-claqueta',
      magicWords: ['misterio', 'estrella', 'sorpresa'],
      activities: [
        {
          id: 'a1-1',
          type: 'quiz',
          objective: 'Comprensión oral',
          prompt: '¿Qué descubren los protagonistas al principio de la historia?',
          options: [
            { id: 'o1', label: 'Un misterio que resolver', emoji: '🔍' },
            { id: 'o2', label: 'Un tesoro pirata', emoji: '🏴‍☠️' },
            { id: 'o3', label: 'Una nave espacial', emoji: '🚀' },
            { id: 'o4', label: 'Un dragón dormido', emoji: '🐉' },
          ],
          correctOptionId: 'o1',
          explanation: '¡Eso es! La aventura empieza con un misterio por resolver.',
        },
        {
          id: 'a1-2',
          type: 'trueFalse',
          objective: 'Atención auditiva',
          prompt: 'La historia empieza cuando aparece el primer personaje.',
          options: [
            { id: 'v', label: 'Verdadero', emoji: '👍' },
            { id: 'f', label: 'Falso', emoji: '👎' },
          ],
          correctOptionId: 'v',
          explanation: '¡Bien escuchado! El primer personaje abre la historia.',
        },
        {
          id: 'a1-3',
          type: 'emotion',
          objective: 'Inferencia emocional',
          prompt: '¿Cómo se siente el personaje al descubrir el misterio?',
          options: [
            { id: 'sorpresa', label: 'Sorprendido', emoji: '😮' },
            { id: 'aburrido', label: 'Aburrido', emoji: '😴' },
            { id: 'enfadado', label: 'Enfadado', emoji: '😡' },
            { id: 'triste', label: 'Triste', emoji: '😢' },
          ],
          correctOptionId: 'sorpresa',
          explanation: '¡Exacto! Su cara de sorpresa lo dice todo.',
        },
      ],
    },
    {
      id: 'escena-2',
      order: 2,
      title: 'La pista escondida',
      subtitle: 'Un detalle muy importante',
      emoji: '🔍',
      color: '#F7B32B',
      videoStart: 350,
      videoEnd: 460,
      narrative:
        '¡Genial, ya tenemos el primer trozo! En esta escena hay una pista escondida. Fíjate bien en los detalles: los buenos detectives escuchan y miran con atención.',
      rewardId: 'r-gema',
      magicWords: ['pista', 'detective', 'camino'],
      activities: [
        {
          id: 'a2-1',
          type: 'quiz',
          objective: 'Vocabulario',
          prompt: '¿Qué es una «pista»?',
          options: [
            { id: 'o1', label: 'Una señal que ayuda a resolver un misterio', emoji: '🧭' },
            { id: 'o2', label: 'Un tipo de comida', emoji: '🍕' },
            { id: 'o3', label: 'Un juguete', emoji: '🧸' },
            { id: 'o4', label: 'Una canción', emoji: '🎵' },
          ],
          correctOptionId: 'o1',
          explanation: '¡Muy bien! Las pistas nos guían hacia la solución.',
        },
        {
          id: 'a2-2',
          type: 'sequence',
          objective: 'Secuenciación temporal',
          prompt: 'Ordena lo que pasa en esta escena:',
          sequenceItems: [
            { id: 's1', label: 'Encuentran la pista', emoji: '👀' },
            { id: 's2', label: 'Leen la pista con atención', emoji: '📜' },
            { id: 's3', label: 'Deciden seguir la pista', emoji: '🏃' },
          ],
          explanation: '¡Perfecto! Primero se encuentra, luego se lee y después se sigue.',
        },
        {
          id: 'a2-3',
          type: 'trueFalse',
          objective: 'Comprensión oral',
          prompt: 'La pista estaba escondida en un lugar secreto.',
          options: [
            { id: 'v', label: 'Verdadero', emoji: '👍' },
            { id: 'f', label: 'Falso', emoji: '👎' },
          ],
          correctOptionId: 'v',
          explanation: '¡Eso es! Estaba muy bien escondida.',
        },
      ],
    },
    {
      id: 'escena-3',
      order: 3,
      title: 'Los personajes se conocen',
      subtitle: 'Nace un gran equipo',
      emoji: '🤝',
      color: '#5F9E3E',
      videoStart: 760,
      videoEnd: 870,
      narrative:
        '¡La película va volviendo! Ahora los personajes se van a conocer. Los equipos son más fuertes que las personas solas… ¿te has fijado en cómo se ayudan?',
      rewardId: 'r-palomitas',
      magicWords: ['amigos', 'equipo', 'sonrisa'],
      activities: [
        {
          id: 'a3-1',
          type: 'quiz',
          objective: 'Memoria narrativa',
          prompt: '¿Cuántos amigos forman el equipo de la aventura?',
          options: [
            { id: 'o1', label: 'Tres amigos', emoji: '3️⃣' },
            { id: 'o2', label: 'Un amigo', emoji: '1️⃣' },
            { id: 'o3', label: 'Diez amigos', emoji: '🔟' },
            { id: 'o4', label: 'Ninguno', emoji: '0️⃣' },
          ],
          correctOptionId: 'o1',
          explanation: '¡Muy bien recordado! Tres amigos, un gran equipo.',
        },
        {
          id: 'a3-2',
          type: 'emotion',
          objective: 'Inferencia emocional',
          prompt: '¿Cómo se sienten los personajes cuando se hacen amigos?',
          options: [
            { id: 'contentos', label: 'Contentos', emoji: '😊' },
            { id: 'asustados', label: 'Asustados', emoji: '😱' },
            { id: 'enfadados', label: 'Enfadados', emoji: '😠' },
            { id: 'cansados', label: 'Cansados', emoji: '🥱' },
          ],
          correctOptionId: 'contentos',
          explanation: '¡Claro que sí! Hacer amigos nos pone contentos.',
        },
        {
          id: 'a3-3',
          type: 'memory',
          objective: 'Vocabulario',
          prompt: 'Encuentra las parejas de palabras de la película:',
          memoryPairs: [
            { id: 'm1', word: 'Misterio', emoji: '🔍' },
            { id: 'm2', word: 'Amigos', emoji: '🤝' },
            { id: 'm3', word: 'Pista', emoji: '📜' },
            { id: 'm4', word: 'Película', emoji: '🎬' },
          ],
          explanation: '¡Memoria de detective! Todas las parejas encontradas.',
        },
        {
          id: 'a3-4',
          type: 'quiz',
          objective: 'Comprensión oral',
          prompt: '¿Por qué deciden trabajar juntos?',
          options: [
            { id: 'o1', label: 'Porque juntos pueden resolver el misterio', emoji: '💪' },
            { id: 'o2', label: 'Porque llueve mucho', emoji: '🌧️' },
            { id: 'o3', label: 'Porque tienen sueño', emoji: '😴' },
            { id: 'o4', label: 'Porque quieren merendar', emoji: '🥪' },
          ],
          correctOptionId: 'o1',
          explanation: '¡Exacto! Juntos son mucho más fuertes.',
        },
      ],
    },
    {
      id: 'escena-4',
      order: 4,
      title: 'El gran problema',
      subtitle: '¡Cuidado, se complica!',
      emoji: '⛈️',
      color: '#E4572E',
      videoStart: 1180,
      videoEnd: 1290,
      narrative:
        '¡Uy! En toda buena historia aparece un problema gordo. No te preocupes: fíjate en QUÉ pasa y POR QUÉ pasa. Eso nos ayudará a recuperar este trozo de película.',
      rewardId: 'r-cofre-bronce',
      magicWords: ['problema', 'tormenta', 'plan'],
      activities: [
        {
          id: 'a4-1',
          type: 'quiz',
          objective: 'Comprensión causa-efecto',
          prompt: '¿Qué provoca el gran problema de la historia?',
          options: [
            { id: 'o1', label: 'Un malentendido entre los personajes', emoji: '💥' },
            { id: 'o2', label: 'Una tormenta de helado', emoji: '🍦' },
            { id: 'o3', label: 'Un concurso de baile', emoji: '💃' },
            { id: 'o4', label: 'Un viaje a la luna', emoji: '🌙' },
          ],
          correctOptionId: 'o1',
          explanation: '¡Eso es! Un malentendido lo complica todo.',
        },
        {
          id: 'a4-2',
          type: 'sequence',
          objective: 'Secuenciación temporal',
          prompt: 'Ordena lo que pasa cuando llega el problema:',
          sequenceItems: [
            { id: 's1', label: 'Aparece el problema', emoji: '⛈️' },
            { id: 's2', label: 'Los amigos se preocupan', emoji: '😟' },
            { id: 's3', label: 'Buscan una solución', emoji: '🔎' },
            { id: 's4', label: 'Hacen un plan juntos', emoji: '📝' },
          ],
          explanation: '¡Perfecto! Problema → preocupación → búsqueda → plan.',
        },
        {
          id: 'a4-3',
          type: 'trueFalse',
          objective: 'Atención auditiva',
          prompt: 'Los amigos se rinden cuando aparece el problema.',
          options: [
            { id: 'v', label: 'Verdadero', emoji: '👍' },
            { id: 'f', label: 'Falso', emoji: '👎' },
          ],
          correctOptionId: 'f',
          explanation: '¡Muy bien! No se rinden: buscan una solución.',
        },
      ],
    },
    {
      id: 'escena-5',
      order: 5,
      title: 'La decisión importante',
      subtitle: 'Hay que ser valiente',
      emoji: '💡',
      color: '#E8891D',
      videoStart: 1620,
      videoEnd: 1730,
      narrative:
        'Casi lo tenemos… Ahora llega el momento más difícil: tomar una decisión importante. Piensa: ¿qué harías tú en su lugar? Ser valiente también se entrena.',
      rewardId: 'r-valiente',
      magicWords: ['valiente', 'idea', 'corazón'],
      activities: [
        {
          id: 'a5-1',
          type: 'quiz',
          objective: 'Comprensión causa-efecto',
          prompt: '¿Qué pasaría si los personajes decidieran NO ayudar?',
          options: [
            { id: 'o1', label: 'El problema no se resolvería', emoji: '🚫' },
            { id: 'o2', label: 'Todo se arreglaría solo', emoji: '✨' },
            { id: 'o3', label: 'Llegaría un superhéroe', emoji: '🦸' },
            { id: 'o4', label: 'Empezaría otra película', emoji: '📼' },
          ],
          correctOptionId: 'o1',
          explanation: '¡Exacto! Si nadie ayuda, el problema sigue ahí.',
        },
        {
          id: 'a5-2',
          type: 'emotion',
          objective: 'Inferencia emocional',
          prompt: '¿Cómo se siente el protagonista justo antes de decidir?',
          options: [
            { id: 'nervioso', label: 'Nervioso', emoji: '😟' },
            { id: 'dormido', label: 'Dormido', emoji: '😴' },
            { id: 'furioso', label: 'Furioso', emoji: '🤬' },
            { id: 'aburrido', label: 'Aburrido', emoji: '🥱' },
          ],
          correctOptionId: 'nervioso',
          explanation: '¡Muy bien visto! Decidir cosas importantes pone nervioso.',
        },
        {
          id: 'a5-3',
          type: 'quiz',
          objective: 'Vocabulario',
          prompt: '«Decidir» significa…',
          options: [
            { id: 'o1', label: 'Elegir qué hacer', emoji: '✅' },
            { id: 'o2', label: 'Correr muy rápido', emoji: '🏃' },
            { id: 'o3', label: 'Cantar en voz alta', emoji: '🎤' },
            { id: 'o4', label: 'Esconderse', emoji: '🙈' },
          ],
          correctOptionId: 'o1',
          explanation: '¡Eso es! Decidir es elegir qué camino tomar.',
        },
        {
          id: 'a5-4',
          type: 'memory',
          objective: 'Vocabulario',
          prompt: 'Encuentra las parejas de esta escena:',
          memoryPairs: [
            { id: 'm1', word: 'Valiente', emoji: '🦁' },
            { id: 'm2', word: 'Idea', emoji: '💡' },
            { id: 'm3', word: 'Corazón', emoji: '❤️' },
            { id: 'm4', word: 'Camino', emoji: '🛤️' },
          ],
          explanation: '¡Parejas completas! Palabras de valientes.',
        },
      ],
    },
    {
      id: 'escena-6',
      order: 6,
      title: 'El final desbloqueado',
      subtitle: 'La gran celebración',
      emoji: '🏆',
      color: '#5F9E3E',
      videoStart: 2200,
      videoEnd: 2310,
      narrative:
        '¡Último trozo de película! Si superas estos retos, la habrás desbloqueado ENTERA. Repasa todo lo que ha pasado… ¡y a por el final!',
      rewardId: 'r-cofre-oro',
      magicWords: ['final', 'trofeo', 'fiesta'],
      activities: [
        {
          id: 'a6-1',
          type: 'sequence',
          objective: 'Memoria narrativa',
          prompt: 'Ordena toda la historia de la película:',
          sequenceItems: [
            { id: 's1', label: 'Descubren el misterio', emoji: '🔮' },
            { id: 's2', label: 'Encuentran la pista', emoji: '🔍' },
            { id: 's3', label: 'Superan el gran problema', emoji: '⛈️' },
            { id: 's4', label: 'Celebran el final juntos', emoji: '🎉' },
          ],
          explanation: '¡Memoria de cine! Has recordado toda la historia.',
        },
        {
          id: 'a6-2',
          type: 'quiz',
          objective: 'Comprensión oral',
          prompt: '¿Qué aprendemos con esta historia?',
          options: [
            { id: 'o1', label: 'Que juntos podemos resolver cualquier problema', emoji: '🤝' },
            { id: 'o2', label: 'Que hay que ver mucha tele', emoji: '📺' },
            { id: 'o3', label: 'Que los misterios dan miedo', emoji: '👻' },
            { id: 'o4', label: 'Que es mejor no ayudar', emoji: '🙅' },
          ],
          correctOptionId: 'o1',
          explanation: '¡Esa es la gran lección de la película!',
        },
        {
          id: 'a6-3',
          type: 'trueFalse',
          objective: 'Atención auditiva',
          prompt: 'Al final, la película queda desbloqueada del todo.',
          options: [
            { id: 'v', label: 'Verdadero', emoji: '👍' },
            { id: 'f', label: 'Falso', emoji: '👎' },
          ],
          correctOptionId: 'v',
          explanation: '¡VERDADERO! Y lo has conseguido tú. 🎬',
        },
      ],
    },
  ],
};

export const mockStudents: MockStudent[] = [
  { id: 'st-leo', name: 'Leo (6 años)', emoji: '🦖', filmPercent: 100, stars: 16, accuracy: 92, lastObjective: 'Memoria narrativa' },
  { id: 'st-vera', name: 'Vera (7 años)', emoji: '🦄', filmPercent: 67, stars: 10, accuracy: 85, lastObjective: 'Secuenciación temporal' },
  { id: 'st-hugo', name: 'Hugo (5 años)', emoji: '🐢', filmPercent: 33, stars: 5, accuracy: 71, lastObjective: 'Inferencia emocional' },
];

export function getReward(id: string): Reward {
  return rewards.find((r) => r.id === id) ?? rewards[0];
}
