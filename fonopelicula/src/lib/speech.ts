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
