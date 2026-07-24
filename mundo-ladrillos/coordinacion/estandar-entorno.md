# 🌄 EL CAMINO — estándar de ENTORNO para TODAS las escenas

**De:** LEAD (rama `claude/pelicula-videojuego-primera-persona-kst6ip`)
**Para:** TODOS los creadores de escena (5–10, muralla/otros), INTEGRADOR
**Fecha:** 2026-07-24

## Por qué
El usuario vio la comparativa "De la película al juego" y marcó el **campamento
mejorado como el LISTÓN de todo el juego**: *"la mejora del campamento es algo
esperable para todo el juego"*. O sea: **ninguna escena entrega con el suelo
blanco liso, cielo plano y horizonte vacío.** Ese es el camino. Aquí está la
receta y las piezas ya hechas para copiarlas.

## El antes/después (referencia)
- ANTES: suelo blanco reventado, cielo degradado plano, 4 tiendas, sensación de
  vacío.
- DESPUÉS: **cielo con nubes** que derivan, **montañas al fondo** (telón con
  perspectiva aérea), **mar de tiendas hasta el horizonte**, suelo de **arena**
  cálida con ondas, luz cálida con sombras y niebla que cierra el mundo.
- Pídele al usuario el antes/después del campamento: ese es el objetivo visual.

## La receta (5 ingredientes, todos obligatorios)
1. **Cielo con nubes** — no un degradado pelado. Nubes de juguete que derivan.
2. **Fondo con relieve** — montañas/mesetas o siluetas con **perspectiva aérea**
   (lo lejano, más claro y desaturado). Cierra el mundo, da profundidad.
3. **Relleno hasta el horizonte** — "mundo lleno, nunca vacío": multitudes,
   props, vegetación, más de lo mismo en pequeño hacia el fondo (instanciado).
4. **Suelo con alma** — nada de plano de un tono. Color de material cálido (que
   la luz no lo reviente a blanco) + variación (ondas, parches, huellas).
5. **Luz + niebla** — luz direccional cálida con **sombras**, niebla que funde
   el fondo con el cielo (mismo color) → aérea gratis y mundo acotado.

## Piezas YA HECHAS que podéis COPIAR (rama del LEAD)
- `src/scenes/min00/sky.ts` → **`buildSky(scene)`**: telón de montañas pintado
  (1 draw call, `fog:false`) + nubes 3D que derivan y oscurecen de noche. Es
  autónomo: `const sky = buildSky(scene)` y en el loop `sky.update(dt, nightF)`.
  Ajustad los tonos/altura a vuestra escena (noche, ciudad, río…).
- `src/scenes/min00/horizon.ts` → **`buildHorizon(scene)`**: anillo de cerros 3D
  que acota el valle (dejad abierta la dirección por donde se sale de escena).
- `src/world/EnvironmentManager.ts` (COMPARTIDO, lo mantiene LEAD) →
  **suelo de arena mejorado** ya integrado: todas las escenas que usen
  `setupEnvironment`/`createStuddedGround` heredan el suelo bueno **gratis**.
  Si vuestra escena es interior/nocturna, decidme y saco una variante.
- Densidad de tiendas / "mar de X": ver `camp.ts` (InstancedMesh + campo lejano
  desaturado hacia los cerros). Mismo patrón vale para casas, soldados, árboles.

## Rendimiento (no negociable en móvil)
- Multitudes y relleno lejano → **InstancedMesh** (una malla, muchas copias).
- Telón = 1 plano/cilindro pintado, no geometría. Nubes = pocas piezas.
- Luces puntuales limitadas (2–3 en móvil). Sombras solo la direccional.

## Por escena (adaptad la receta, no la copiéis igual)
- **5–10 (Jordán/espías/Rahab):** de noche → cielo estrellado + luna + nubes
  tenues; ciudad de Jericó al fondo (siluetas con ventanas cálidas); calles con
  relleno (barriles, puestos, patrullas). El río, con muros/orillas y vegetación.
- **Muralla/asedio (LEAD, ya hecha):** revisaré que cumpla el mismo listón.
- **INTEGRADOR:** al unir, cuida que NINGUNA escena quede con el suelo/cielo viejo.
  Si ves una con vacío, avísame en tu archivo y la subo.

## Criterio de "listo"
Pon un fotograma de la peli de tu escena al lado de tu captura. Si la tuya se ve
**vacía o plana** al lado, aún no está. El niño tiene que sentir que "entró en la
peli", no en un test.

> Dudas de dirección → preguntad al usuario (regla del TIMBRE). Cuando subáis una
> escena al nuevo listón, dejad captura en vuestro archivo y aviso.
