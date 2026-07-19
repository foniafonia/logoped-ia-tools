const fs = require('fs');
const path = require('path');

const baseDir = path.join(process.cwd(), 'cognitiva', 'data');

const specs = [
  { code: '015k', letter: 'M' },
  { code: '015l', letter: 'L' },
  { code: '015m', letter: 'P' },
  { code: '015n', letter: 'D' },
  { code: '015ñ', letter: 'N' },
  { code: '015o', letter: 'T' },
  { code: '015p', letter: 'F' },
  { code: '015q', letter: 'Ñ' }
];

function contrastSet(letter) {
  const pool = ['M', 'L', 'P', 'D', 'N', 'T', 'F', 'Ñ', 'S'];
  return pool.filter((c) => c !== letter).slice(0, 4);
}

for (const s of specs) {
  const json = {
    id_taller: `inf_2_obj_${s.code}`,
    codigo: `2º INFANTIL obj.${s.code}`,
    nombre: `Adquisición de sílabas directas con fonema ${s.letter} en mayúscula`,
    modulo: 'ruta_fonologica_silabas_directas',
    objetivo_clinico: [
      'transcodificacion_grafema_fonema',
      'integracion_consonante_vocal',
      'automatizacion_ruta_fonologica'
    ],
    estado: 'activo',
    motor_config: {
      feedback_inmediato: true,
      tratamiento_error: {
        reducir_distractores_en_error: true,
        reproducir_audio_automatico_en_error: true,
        mostrar_respuesta_correcta_segundo_error: true
      },
      registro_metricas: ['aciertos', 'errores', 'intentos', 'tiempo_reaccion_ms']
    },
    mecanica: {
      tipo: 'discriminacion_auditiva_silabica',
      estimulo_modelo: `audio_silaba_directa_${s.letter}V`,
      estructura_objetivo: 'CV',
      set_silabas_objetivo: [`${s.letter}A`, `${s.letter}E`, `${s.letter}I`, `${s.letter}O`, `${s.letter}U`],
      num_opciones: { base: 3, min: 2, max: 4 },
      boton_repeticion_audio: true,
      tiempo_max_respuesta_ms: 8000
    },
    regla_distractores: {
      tipo_1_vocal: `misma consonante ${s.letter} con vocal diferente`,
      tipo_2_contraste: 'silaba CV con consonante contrastada',
      consonantes_contraste: contrastSet(s.letter)
    }
  };

  const filename = `catalogo_talleres.obj${s.code}.fragmento.json`;
  fs.writeFileSync(path.join(baseDir, filename), `${JSON.stringify(json, null, 2)}\n`);
}

console.log('OK', specs.length);
