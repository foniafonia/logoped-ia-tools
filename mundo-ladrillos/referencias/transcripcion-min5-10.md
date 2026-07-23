# Minuto 5–10 — desglose por escenas (para el Director de beats)

**Para el Creador 5–10.** Datos sacados del **desglose oficial de la película**
que aportó el usuario (`referencias/desglose-escenas-peli.json`, 54 escenas con
tiempos exactos). El audio real del tramo va en `src/audio/clips.ts` con la clave
**`narracion_min5-10`** (voces + música, 5:00) — úsalo como **columna vertebral**
(spine), igual que el min 0–5 usa `narracion_min0-5`.

## Tiempos: global vs. local
- El desglose usa **tiempos globales** de la peli (segundos desde el minuto 0).
- El audio `narracion_min5-10` = **minutos 5:00–10:00** = **300–600 s globales**.
- Para tu Director, usa **tiempo LOCAL = global − 300** (el spine empieza en 0).

## Escenas del tramo (09 → 16)
```
LOCAL   GLOBAL      ESCENA           QUÉ PASA
0:07    307–340   09 · el Jordán     Yehoshúa, de espaldas ante la multitud, mira el
                                     río Jordán caudaloso; al otro lado, la fortaleza
                                     amurallada de Jericó entre palmeras.
0:41    341–439   10 · reclutar      Frente a su tienda, Yehoshúa da instrucciones
                                     secretas a los DOS espías (negro y gris). Ellos
                                     asienten, valientes.
2:20    440–449   11 · murallas      Vista nocturna de las murallas de Jericó: torres
                                     con antorchas, ventanas con luz cálida.
2:30    450–500   12 · trajes        En una carpa oscura con farol, los espías se
                                     cambian de ropa: trajes de sigilo negro y gris
                                     con capuchas ninja.
3:21    501–511   13 · cruzar        Noche estrellada: cruzan el río colgados de las
                                     manos de una CUERDA tensa de orilla a orilla,
                                     sobre el agua turbulenta.
3:32    512–533   14 · el avión      Dos guardias vigilan la entrada con antorchas;
                                     uno bosteza ("noche tranquila"). El espía gris
                                     asoma entre arbustos y grita "¡UN AVIÓN!"
                                     (broma anacrónica) → los guardias se despistan.
3:54    534–544   15 · colarse       Aprovechando la distracción, los dos espías
                                     cruzan corriendo, sigilosos, por detrás, por el
                                     gran portón de madera abierto.
4:05    545–604   16 · calles        Los guardias descubren el engaño del "avión" y
                                     vuelven por las calles con un farol, diciendo
                                     que los espías de Israel deben andar cerca.
```

## Ideas de mini-juego (encajan con cada beat)
- **09 el Jordán:** plano contemplativo; cámara al río + silueta de Jericó (el
  min 0–5 ya construye río + Jericó en `scenes/min00/journey.ts`, reutilízalo).
- **10 reclutar:** acércate a Yehoshúa para recibir la misión (diálogo + ⭐).
- **12 trajes:** mini-momento de "equiparse" (los espías pasan a traje ninja).
- **13 cruzar:** mini-juego de cruzar por la cuerda sin caer al agua.
- **14 el avión:** el gran gag — el espía gris grita "¡Un avión!"; tú (espía) te
  cuelas mientras el guardia mira al cielo (ventana de tiempo).
- **15 colarse:** sigilo por detrás de los guardias hasta el portón.
- **16 calles:** empieza el sigilo urbano (guardias con farol patrullando).

## Nota de honestidad
No hay locución palabra-por-palabra (la transcripción literal por voz no fue
posible: el proxy bloquea los modelos de STT). El texto de arriba es la **acción
y el diálogo del desglose oficial** + los **tiempos exactos**. Ajusta los
subtítulos a las frases que oigas en `narracion_min5-10`.

## Desglose completo (todas las escenas de la peli)
Está en `referencias/desglose-escenas-peli.json` (54 escenas, campos: `inicio_seg`,
`fin_seg`, `escenario`, `plano`, `personajes_presentes`, `accion_visual`,
`texto_en_pantalla`, `props`, `paleta`). Sirve a TODOS los tramos.

## Clip del gag del avión (`m0510_14_avion`)
Además del spine, en `clips.ts` hay un clip corto (~4 s, con fundidos) con el grito
"¡Un avión!" para tu **gag interactivo**. Uso previsto:
```js
// el niño pulsa E y hace la treta:
spine.setVolume(0.25);                 // baja la peli un segundo
audio.play('m0510_14_avion', 1.0);     // el grito suena encima
setTimeout(() => spine.setVolume(0.95), 3800);  // devuelve la música
```
⚠️ Es un candidato localizado por PICO DE VOLUMEN (local 219.8–223.8 s), no
verificado de oído. Si el grito queda corrido/cortado, escribe el segundo exacto
en `coordinacion/min05-10.md` y el LEAD lo recorta fino.

## Cómo respondes por el repo (sin copiar-pegar por el chat)
Deja tus dudas/peticiones/estado en `coordinacion/min05-10.md` de tu rama. El LEAD
las lee con `git fetch --all`. Así nos hablamos por el repo, sin que el usuario
haga de recadero.
