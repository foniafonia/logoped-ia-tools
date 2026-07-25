# 🎧 PIPELINE DE AUDIO — la ÚNICA forma oficial (para TODOS los hilos)

**Problema que resuelve:** "no encontramos el audio de la peli / no sabemos cómo
está segmentado". A partir de ahora hay **una sola fuente de la verdad** y **un
solo comando**. Dejad de buscar el audio por otras ramas o de sacarlo de HTMLs
del cliente (el HTML del cliente NO sirve para nada aquí).

## Las 3 piezas
1. **`referencias/audio-manifest.json`** — la fuente de la verdad. Para cada
   clip que pide el código dice: de qué trozo del audio maestro sale
   (`desde_seg`–`hasta_seg`) y qué se oye. Y para cada una de las 54 escenas:
   su tiempo global, su **offset LOCAL dentro del spine** y el **texto** para
   subtítulos. (Va a git — son solo datos.)
2. **`scripts/build-audio-clips.mjs`** — el recortador. Corta el audio maestro
   según el manifiesto y escribe `src/audio/clips.ts` con todo en base64. (Va a git.)
3. **El AUDIO MAESTRO** — tu descarga completa de la peli. **PRIVADO, NO va a git.**
   Se pone en `mundo-ladrillos/assets-privados/pelicula-audio.m4a` (o se pasa por
   argumento). Añádelo a `.gitignore`.

## Cómo se usa (un solo comando)
```bash
# 1) pon tu audio maestro aquí (o pásalo como argumento):
#    mundo-ladrillos/assets-privados/pelicula-audio.m4a
# 2) genera los clips:
cd mundo-ladrillos
node scripts/build-audio-clips.mjs            # usa la ruta del manifiesto
#   o:  node scripts/build-audio-clips.mjs /ruta/a/pelicula-audio.m4a
```
Esto crea `src/audio/clips.ts` con las claves que el juego usa:
`narracion_min0-5`, `narracion_min5-10`, `m0510_14_avion`, y los sfx
`shofar/rumble/shout/din` (si tienes ficheros en `sfx/`, si no conserva los que ya había).
Requisitos: **ffmpeg** y **ffprobe** en el PATH.

## Convención de claves (que NADIE se invente otras)
- **Spine de narración por tramo de 5 min:** `narracion_min0-5`, `narracion_min5-10`, …
  Cada tramo usa su spine como columna vertebral (voz+música) y los **offsets
  locales** del manifiesto para acompasar sus beats/subtítulos.
- **Clips cortos de gag:** p. ej. `m0510_14_avion` (grito "¡Un avión!").
- **SFX:** `shofar`, `rumble`, `shout`, `din`.
El código pide la clave (`playSpine('narracion_min0-5')`, `play('m0510_14_avion')`);
el manifiesto dice de dónde sale. Si necesitas un clip nuevo, **añádelo al
manifiesto** (no lo metas a mano en clips.ts).

## Sincronía (esto es la otra mitad del problema)
Tener el audio no basta: hay que **acompasarlo al jugador**. Reglas:
- Cada escena tiene su `local_desde` en el manifiesto → arranca el spine en ese
  offset al entrar en la escena; **no dejes que el bucle invada la siguiente**.
- **Que los beats esperen al jugador** cuando haya tarea (no correr solo por reloj).
- Subtítulos = campo `texto` del manifiesto (una sola fuente, no hardcodear).

## Aviso de tiempos (importante)
Solo **0–600 s** (tramos **0–5** y **5–10**) están **validados**. El desglose llega
a 2910 s pero declara durar 1750 s → **los tiempos > ~600 s son DUDOSOS**. El
script valida contra la duración real del audio y **salta** lo que se salga.
Para los tramos 10–29 hay que **revisar los tiempos** contra el audio real antes de fiarse.

## Reglas de contenido (privacidad)
- `assets-privados/` (audio maestro) y el `src/audio/clips.ts` **generado** → **NO a git**.
- `audio-manifest.json`, este `.md` y el script → **SÍ a git**.
- El `clips.ts` se regenera en cada entrega con el audio maestro; en el repo va vacío/mudo.
