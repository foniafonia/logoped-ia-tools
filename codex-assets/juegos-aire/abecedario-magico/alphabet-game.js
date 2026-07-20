export const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

export const SPEED_MS = {
  slow: 3200,
  medium: 2400,
  fast: 1600,
};

const DIFFICULTY_WEIGHTS = {
  easy: ['D', 'I', 'D', 'I', 'D', 'I'],
  medium: ['D', 'I', 'D', 'I', 'A'],
  hard: ['D', 'I', 'A', 'A'],
};

export function createSequence(difficulty = 'medium', previous = null) {
  const pool = DIFFICULTY_WEIGHTS[difficulty] || DIFFICULTY_WEIGHTS.medium;
  const sequence = [];

  for (let i = 0; i < ALPHABET.length; i += 1) {
    let candidate = pick(pool);
    let guard = 0;
    while (wouldRepeatTooMuch(sequence, candidate) || sameAsPrevious(previous, i, candidate)) {
      candidate = pick(pool);
      guard += 1;
      if (guard > 30) break;
    }
    sequence.push(candidate);
  }

  return sequence;
}

export function getPhaseLetters(phase) {
  return Number(phase) === 2 ? [...ALPHABET].reverse() : [...ALPHABET];
}

export function movementLabel(code, phase, accessibleJump = true) {
  if (Number(phase) === 3) {
    if (code === 'I') return 'Desliza el dedo a la izquierda';
    if (code === 'D') return 'Desliza el dedo a la derecha';
    return accessibleJump ? 'Arriba con ambos brazos' : 'Salto o brazos arriba';
  }
  if (code === 'I') return 'Desliza el dedo a la izquierda';
  if (code === 'D') return 'Desliza el dedo a la derecha';
  return 'Arriba';
}

export function codeForLetter(letter, sequence) {
  const index = ALPHABET.indexOf(letter);
  return sequence[index] || 'A';
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function wouldRepeatTooMuch(sequence, candidate) {
  const len = sequence.length;
  return len >= 2 && sequence[len - 1] === candidate && sequence[len - 2] === candidate;
}

function sameAsPrevious(previous, index, candidate) {
  if (!previous) return false;
  return previous[index] === candidate && Math.random() < 0.65;
}
