const modulo = document.getElementById('modulo');
const btnGenerar = document.getElementById('btnGenerar');
const sections = {
  ruta_lexica: document.getElementById('fields_ruta_lexica'),
  conciencia_fonologica: document.getElementById('fields_conciencia_fonologica'),
  ortografia_cloze: document.getElementById('fields_ortografia_cloze')
};

function showSection(value) {
  Object.values(sections).forEach((el) => el.classList.add('hidden'));
  if (sections[value]) sections[value].classList.remove('hidden');
}

function splitCSV(v) {
  return String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
}

function baseMeta() {
  return {
    id_taller: document.getElementById('id_taller').value.trim(),
    nivel_educativo: document.getElementById('nivel_educativo').value.trim(),
    edad_recomendada: document.getElementById('edad_recomendada').value.trim(),
    modulo_cognitivo: modulo.value,
    configuracion_motor: {
      tiempo_exposicion_ms: 3000,
      limite_tiempo_sesion: 900000,
      modalidad_estimulo: document.getElementById('modalidad_estimulo').value
    },
    items: []
  };
}

function buildRutaLexica() {
  return {
    id_item: 'item_001',
    palabra_objetivo: document.getElementById('rl_palabra_objetivo').value.trim(),
    audio_text: document.getElementById('rl_palabra_objetivo').value.trim().toLowerCase(),
    imagen_url: /^https?:\/\//.test(document.getElementById('rl_imagen_placeholder').value.trim())
      ? document.getElementById('rl_imagen_placeholder').value.trim()
      : null,
    imagen_placeholder: /^https?:\/\//.test(document.getElementById('rl_imagen_placeholder').value.trim())
      ? '🖼️'
      : document.getElementById('rl_imagen_placeholder').value.trim(),
    distractor_similitud_inicio: document.getElementById('rl_distractor_similitud').value.trim(),
    distractor_contraste: document.getElementById('rl_distractor_contraste').value.trim()
  };
}

function buildConcienciaFonologica() {
  return {
    id_item: 'item_001',
    palabra: document.getElementById('cf_palabra_objetivo').value.trim().toUpperCase(),
    audio_text: document.getElementById('cf_palabra_objetivo').value.trim().toLowerCase(),
    silabas_original: splitCSV(document.getElementById('cf_silabas_array').value).map((s) => s.toUpperCase()),
    silabas_objetivo_inverso: splitCSV(document.getElementById('cf_orden_correcto_array').value).map((s) => s.toUpperCase()),
    pista_auditiva_tts: document.getElementById('cf_pista_auditiva_tts').value.trim()
  };
}

function buildOrtografiaCloze() {
  return {
    id_item: 'item_001',
    texto_base: document.getElementById('oc_frase_base').value.trim(),
    opciones_correctas: splitCSV(document.getElementById('oc_opciones_correctas').value).map((s) => s.toUpperCase()),
    distractores: splitCSV(document.getElementById('oc_distractores').value).map((s) => s.toUpperCase()),
    regla_ortografica_tts: document.getElementById('oc_regla_ortografica_tts').value.trim()
  };
}

function buildPayload() {
  const payload = baseMeta();
  if (modulo.value === 'ruta_lexica') payload.items = [buildRutaLexica()];
  if (modulo.value === 'conciencia_fonologica') payload.items = [buildConcienciaFonologica()];
  if (modulo.value === 'ortografia_cloze') payload.items = [buildOrtografiaCloze()];
  return payload;
}

function downloadJSON(obj) {
  const name = (obj.id_taller || 'taller_generado').replace(/\s+/g, '_');
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

modulo.addEventListener('change', () => showSection(modulo.value));
btnGenerar.addEventListener('click', () => downloadJSON(buildPayload()));
showSection(modulo.value);

