#!/usr/bin/env node
/**
 * build-audio-clips.mjs — PIPELINE DE AUDIO (única forma oficial)
 *
 * Recorta el AUDIO MAESTRO de la película (tu descarga completa) en los clips
 * que el juego pide, según `referencias/audio-manifest.json`, y escribe
 * `src/audio/clips.ts` con cada clip embebido en base64 (data URI).
 *
 * Qué hace, en cristiano:
 *   1. Lee el manifiesto (escena → tiempos → clave de clip → texto).
 *   2. Para cada clip de origen "maestro", corta [desde_seg, hasta_seg] del
 *      audio maestro con ffmpeg y lo pasa a base64.
 *   3. Los sfx (shofar/rumble/shout/din): si hay ficheros en `sfx/`, los usa;
 *      si no, CONSERVA los que ya haya en el clips.ts actual (no los pierde).
 *   4. Valida contra la duración real del audio: avisa y SALTA lo que se salga
 *      (los tiempos > ~600 s del desglose son dudosos).
 *
 * Requisitos: ffmpeg y ffprobe en el PATH.
 * Uso:
 *   node scripts/build-audio-clips.mjs [ruta-al-audio-maestro]
 *   (si no pasas ruta, usa meta.audio_maestro del manifiesto)
 *
 * Privacidad: el audio maestro NO va a git. El clips.ts generado tampoco
 * debería subirse (llévalo solo a la entrega). El manifiesto y este script SÍ
 * van a git (son solo datos/código).
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = join(ROOT, 'referencias', 'audio-manifest.json');
const OUT = join(ROOT, 'src', 'audio', 'clips.ts');

function die(msg) { console.error('\n❌ ' + msg + '\n'); process.exit(1); }
function have(cmd) { try { execFileSync(cmd, ['-version'], { stdio: 'ignore' }); return true; } catch { return false; } }

if (!have('ffmpeg') || !have('ffprobe')) die('Faltan ffmpeg/ffprobe en el PATH. Instálalos (brew install ffmpeg / apt install ffmpeg).');
if (!existsSync(MANIFEST)) die('No encuentro ' + MANIFEST);

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const masterArg = process.argv[2];
const master = masterArg
  ? resolve(masterArg)
  : join(ROOT, String(manifest.meta.audio_maestro).split(/\s+/)[0]);

if (!existsSync(master)) {
  die('No encuentro el AUDIO MAESTRO en:\n     ' + master +
      '\n   Pon tu descarga completa de la peli ahí, o pásala como argumento:\n' +
      '     node scripts/build-audio-clips.mjs /ruta/a/pelicula-audio.m4a');
}

// Duración real del audio maestro (para validar tiempos)
const durSec = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
  '-of', 'default=noprint_wrappers=1:nokey=1', master]).toString().trim());
console.log(`\n🎬 Audio maestro: ${master}\n   Duración real: ${durSec.toFixed(1)} s\n`);

// clips.ts existente → para conservar sfx si no hay ficheros nuevos
const existing = {};
if (existsSync(OUT)) {
  const txt = readFileSync(OUT, 'utf8');
  for (const m of txt.matchAll(/"([a-z0-9_-]+)":\s*"(data:audio[^"]+)"/gi)) existing[m[1]] = m[2];
}

function sliceToDataUri(from, to) {
  const dur = Math.max(0.1, to - from);
  // corta y recodifica a mp3 mono 96k (ligero) con fundidos de 40 ms
  const buf = execFileSync('ffmpeg', [
    '-v', 'error', '-ss', String(from), '-t', String(dur), '-i', master,
    '-ac', '1', '-b:a', '96k', '-af', `afade=t=in:st=0:d=0.04,afade=t=out:st=${(dur - 0.04).toFixed(3)}:d=0.04`,
    '-f', 'mp3', 'pipe:1'
  ], { maxBuffer: 1 << 28 });
  return 'data:audio/mpeg;base64,' + buf.toString('base64');
}

const out = {};
let hechos = 0, saltados = 0, conservados = 0;

for (const c of manifest.clips) {
  if (c.origen === 'maestro') {
    if (c.hasta_seg > durSec + 0.5) {
      console.log(`   ⏭️  ${c.key}: [${c.desde_seg}-${c.hasta_seg}s] fuera del audio (dura ${durSec.toFixed(0)}s) → SALTADO${c.fiable === false ? ' (tiempo dudoso)' : ''}`);
      saltados++; continue;
    }
    out[c.key] = sliceToDataUri(c.desde_seg, c.hasta_seg);
    console.log(`   ✅ ${c.key}: ${c.desde_seg}-${c.hasta_seg}s (${(c.hasta_seg - c.desde_seg)}s)`);
    hechos++;
  } else if (c.origen === 'sfx') {
    const f = join(ROOT, c.archivo || '');
    if (existsSync(f)) {
      out[c.key] = 'data:audio/mpeg;base64,' + readFileSync(f).toString('base64');
      console.log(`   ✅ ${c.key}: desde ${c.archivo}`);
      hechos++;
    } else if (c.conservar_si_existe && existing[c.key]) {
      out[c.key] = existing[c.key];
      console.log(`   ♻️  ${c.key}: conservado del clips.ts actual`);
      conservados++;
    } else {
      console.log(`   ⚠️  ${c.key}: sin ${c.archivo} y sin previo → OMITIDO`);
      saltados++;
    }
  }
}

const header = `// GENERADO por scripts/build-audio-clips.mjs desde referencias/audio-manifest.json\n` +
  `// NO editar a mano. NO subir a git (audio de la peli). Regenerar con el audio maestro.\n`;
const body = 'export const CLIPS: Record<string, string> = {\n' +
  Object.entries(out).map(([k, v]) => `  "${k}": "${v}",`).join('\n') +
  '\n};\n';
writeFileSync(OUT, header + body);

console.log(`\n📦 Escrito ${OUT}\n   ${hechos} recortados/copiados · ${conservados} conservados · ${saltados} saltados\n`);
console.log('Listo. Este clips.ts es para la ENTREGA (no lo subas a git).\n');
