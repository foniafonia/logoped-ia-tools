# Voz para herramientas de logopedia

Audio reutilizable en cualquier proyecto. Sale del trabajo hecho en FonoMundos
en agosto de 2026.

---

## `fonemas-jose/` — 18 clips, 184 KB

Los fonemas grabados por Jose Aserraf, logopeda.

**Esto es lo valioso y no se puede regenerar con una máquina.** Ningún
sintetizador produce un fonema aislado: están entrenados con habla encadenada
y nunca han oído una /m/ sola, así que siempre cuelan una vocal. Se midió sobre
la /m/ generada con Piper — la energía de la banda nasal solo superaba a la de
las vocales en 2,5 dB, cuando en la grabada son 13,6 dB.

Traducido: la máquina decía «eme»; la grabación dice `mmmmm`.

| Fichero | Fonema | Nota |
|---|---|---|
| `fonema-M.mp3` | /m/ | nasal sostenida |
| `fonema-N.mp3` | /n/ | nasal alveolar |
| `fonema-NY.mp3` | /ɲ/ | la eñe |
| `fonema-S.mp3` | /s/ | |
| `fonema-F.mp3` | /f/ | |
| `fonema-Z.mp3` | /θ/ | interdental |
| `fonema-J.mp3` | /x/ | |
| `fonema-L.mp3` | /l/ | |
| `fonema-R.mp3` | /r/ | vibrante múltiple |
| `fonema-A/E/I/O/U.mp3` | vocales | |
| `fonema-P/T/B-V/C-K.mp3` | oclusivas | con vocal de apoyo mínima: no se pueden aislar |

Entre 0,59 y 1,44 s, sin silencios en los extremos, normalizados a −18 LUFS.

**Licencia:** son de Jose. Úsalos donde quieras, no los repartas fuera.

---

## `locuciones-piper/` — 537 clips, 5,1 MB

Consignas, palabras, sílabas y refuerzos del corpus de FonoMundos.

Generados con **Piper**, modelo `es_ES-sharvard-medium`, hablante **1**
(femenino, España), `--length-scale 1.35` (más pausado de lo normal: la
comunidad lo pidió cuatro veces).

`_indice.json` relaciona cada fichero con su texto.

**Licencia:** CC-BY 3.0. Hay que citar la fuente allá donde se usen:

> Voz generada con Piper (Open Home Foundation), modelo es_ES-sharvard-medium,
> entrenado sobre el corpus de la Universidad de Edimburgo. Licencia CC-BY 3.0.

Estos sí se pueden regenerar. Si el otro proyecto tiene otro vocabulario, es
mejor generar el suyo que reaprovechar estos.

---

## `mapa-claves.json` — equivalencia lista para usar

Traduce el esquema de claves `fon: / sil: / pal: / con:` a la ruta del fichero.
552 entradas: 20 fonemas, 46 sílabas, 122 palabras y 364 consignas.

```json
{
  "fon:m":  "fonemas-jose/fonema-M.mp3",
  "sil:pa": "locuciones-piper/pa.mp3",
  "pal:mano": "locuciones-piper/mano.mp3",
  "con:escucha-la-frase": "locuciones-piper/escucha-la-frase.mp3"
}
```

Los `fon:` apuntan a las grabaciones humanas; el resto, a Piper. Si una clave
no está en el mapa, hay que caer al sintetizador del dispositivo para la
secuencia entera.

---

## `generar.mjs` — haz tus propias locuciones con la misma voz

Los 537 MP3 de aquí cubren el vocabulario de FonoMundos y nada más. Si tu
juego dice otras cosas, genera las tuyas: suenan idénticas porque es el mismo
modelo con los mismos ajustes.

```bash
pip install piper-tts

# El modelo (81 MB) y su configuración
B=https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/sharvard/medium
curl -L -o es_ES-sharvard-medium.onnx      $B/es_ES-sharvard-medium.onnx
curl -L -o es_ES-sharvard-medium.onnx.json $B/es_ES-sharvard-medium.onnx.json

# Una locución por línea
cat > textos.txt <<'FIN'
Escucha el sonido
Toca el bloque correcto
Muy bien
FIN

node generar.mjs textos.txt mi-voz/
```

Saca un MP3 por línea con nombre legible y un `indice.json`.

**No generes fonemas con esto.** Ninguna máquina dice una /m/ sola sin colar
una vocal. Usa los de `fonemas-jose/`.

Los scripts de FonoMundos sirven de plantilla:

- `scripts/recolectar-voz.ts` — saca los textos ejecutando los generadores de
  las actividades, en vez de adivinarlos leyendo el código.
- `scripts/generar-voz.mjs` — un MP3 por texto, idempotente.
- `scripts/grabar-fonemas.mjs` — página local para grabar fonemas a mano.

---

## Dos cosas que costaron encontrar

**El fonema nunca puede ir dentro de una frase.** Si se genera
`"empieza por lll"` de una pieza, Piper lo lee como «empieza por ele ele ele».
Hay que partirlo en `['empieza por', 'lll']` y reproducirlo encadenado. Además,
así la grabación humana sustituye solo el fonema y la máquina pone el resto.

**Si falta una parte, cae toda la secuencia.** Conviene que el reproductor
use el sintetizador del dispositivo para la frase entera cuando falte un clip:
mezclar dos voces distintas en la misma consigna suena peor que usar la mala
de principio a fin.
