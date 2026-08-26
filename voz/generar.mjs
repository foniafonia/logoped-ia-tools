/**
 * Genera locuciones con la misma voz que usa FonoMundos.
 *
 * Sirve para cualquier proyecto: los MP3 de `locuciones-piper/` solo cubren el
 * vocabulario de FonoMundos, así que si tu juego dice otras cosas, genera las
 * tuyas con esto y suenan idénticas.
 *
 * Voz: Piper es_ES-sharvard-medium, hablante 1 (femenino, España).
 * Velocidad 1.35, más pausada que la normal: la comunidad de logopedas lo pidió
 * cuatro veces y con niños se nota.
 *
 *   pip install piper-tts
 *   node generar.mjs textos.txt salida/
 *
 * `textos.txt`: una locución por línea. Crea un MP3 por línea, con nombre
 * legible, y un indice.json que relaciona fichero y texto.
 *
 * OJO con los fonemas: no los generes aquí. Ninguna máquina dice una /m/ sola
 * sin colar una vocal — está medido. Usa los de `fonemas-jose/`.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const MODELO = 'es_ES-sharvard-medium.onnx'
const HABLANTE = '1'
const VELOCIDAD = '1.35'

const [entrada, salida = 'voz-generada'] = process.argv.slice(2)

if (!entrada || !existsSync(entrada)) {
  console.error('Uso: node generar.mjs textos.txt salida/')
  process.exit(1)
}

if (!existsSync(MODELO)) {
  console.error(`Falta ${MODELO}. Descárgalo con:

  B=https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/sharvard/medium
  curl -L -o ${MODELO}      $B/${MODELO}
  curl -L -o ${MODELO}.json $B/${MODELO}.json
`)
  process.exit(1)
}

const limpio = (t) =>
  t.toLocaleLowerCase('es-ES').replace(/[^a-z0-9áéíóúñü ]/gi, '').trim()
    .replace(/\s+/g, '-').slice(0, 52) || 'sin-texto'

const textos = [...new Set(
  readFileSync(entrada, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean),
)]

mkdirSync(salida, { recursive: true })
const tmp = join(salida, '.tmp')
mkdirSync(tmp, { recursive: true })

const indice = {}
let n = 0

for (const texto of textos) {
  let nombre = limpio(texto)
  let fichero = `${nombre}.mp3`
  let i = 2
  while (indice[fichero]) fichero = `${nombre}-${i++}.mp3`

  const wav = join(tmp, 'x.wav')
  execFileSync('python3', [
    '-m', 'piper', '-m', MODELO, '-s', HABLANTE,
    '--length-scale', VELOCIDAD, '-f', wav,
  ], { input: texto, encoding: 'utf8' })

  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error', '-i', wav,
    '-ar', '22050', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '64k',
    join(salida, fichero),
  ])

  indice[fichero] = texto
  if (++n % 25 === 0) console.log(`  ${n}/${textos.length}`)
}

rmSync(tmp, { recursive: true, force: true })
writeFileSync(join(salida, 'indice.json'), JSON.stringify(indice, null, 2))
console.log(`\n${n} locuciones en ${salida}/`)
console.log('Recuerda el crédito CC-BY: está en el LEEME.')
