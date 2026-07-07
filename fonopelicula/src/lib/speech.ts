/**
 * Voz de Foni: síntesis de voz del navegador en español.
 * Sin assets ni servicios externos.
 */

let voice: SpeechSynthesisVoice | null = null;

function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  voice =
    voices.find((v) => v.lang.startsWith('es') && /mónica|monica|paulina|helena/i.test(v.name)) ??
    voices.find((v) => v.lang === 'es-ES') ??
    voices.find((v) => v.lang.startsWith('es')) ??
    null;
}

if ('speechSynthesis' in window) {
  pickVoice();
  window.speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export function speak(text: string, rate = 0.95) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = rate;
  utterance.pitch = 1.15;
  if (!voice) pickVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function canSpeak(): boolean {
  return 'speechSynthesis' in window;
}

/* ---------- Reconocimiento de voz (Web Speech API) ---------- */

export interface RecognitionHandle {
  stop: () => void;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export function canRecognize(): boolean {
  const w = window as unknown as Record<string, unknown>;
  return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition);
}

/** Escucha continua; llama a onText con cada transcripción (final o parcial). */
export function listen(onText: (text: string) => void, onUnavailable: () => void): RecognitionHandle {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) {
    onUnavailable();
    return { stop: () => undefined };
  }
  let active = true;
  const recognition = new Ctor();
  recognition.lang = 'es-ES';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onresult = (event) => {
    const pieces: string[] = [];
    for (let i = 0; i < event.results.length; i++) {
      pieces.push(event.results[i][0]?.transcript ?? '');
    }
    onText(pieces.join(' '));
  };
  recognition.onerror = () => {
    /* reintenta en onend */
  };
  recognition.onend = () => {
    if (active) {
      try {
        recognition.start();
      } catch {
        /* sin efecto */
      }
    }
  };
  try {
    recognition.start();
  } catch {
    onUnavailable();
  }
  return {
    stop: () => {
      active = false;
      try {
        recognition.abort();
      } catch {
        /* sin efecto */
      }
    },
  };
}

/** Normaliza para comparar: minúsculas y sin tildes (elimina diacríticos combinantes). */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
