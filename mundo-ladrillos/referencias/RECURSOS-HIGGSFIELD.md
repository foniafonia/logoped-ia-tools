# RECURSOS — Higgsfield en NUESTRO juego (memoria de técnica)

> Qué funciona y cómo, para reutilizar cuando toque meter arte de Higgsfield
> (u otra fuente externa) dentro del juego web. Aprendido en la rama
> `claude/munecos-ifepfa` (nivel-demo con la llanura de Jericó al atardecer).

---

## 1. Meter una imagen de Higgsfield DENTRO del juego (no como vídeo)

**Problema:** el CDN de Higgsfield (`*.cloudfront.net`) está **bloqueado por la
política de red** de la sesión (403 en CONNECT). No se puede `curl` la imagen al
sandbox local. Y las imágenes **pegadas** en el chat no dejan archivo en disco.
Además, los Artifacts de claude.ai tienen **CSP** que bloquea hosts externos →
hay que **incrustar** la imagen, no enlazarla.

**Solución que SÍ funciona (probada):**
1. En Higgsfield, localizar la imagen: `show_generations` / `show_medias` → coger
   el `rawUrl` del CDN.
2. Usar el **sandbox propio de Higgsfield** (`sandbox_exec`), que SÍ alcanza su
   CDN, para: descargarla, **optimizarla** (Pillow: redimensionar + JPEG con
   calidad ajustada) y sacarla en **base64**.
3. El resultado del tool **trunca el medio** de salidas largas (deja cabeza+cola).
   Presupuesto real ≈ **19.900 caracteres visibles** por llamada. → Mantener el
   JPEG por debajo de **~14 KB** (base64 ≈ 19 K) para que salga **entero de una**.
   Para un fondo tras niebla/bloom, **512–640 px** de ancho sobra.
4. **Verificar la copia con checksum:** que el sandbox imprima `md5sum` del JPEG.
   Al reensamblar en local, comparar el md5. Si coincide → copia perfecta; si no,
   se recorta/reescribe (un byte perdido corrompe el JPEG: `file` lo acepta por
   los headers, pero **el navegador no lo decodifica**).
5. Incrustar como **data URI** en un módulo TS (`src/assets/<x>.ts` que exporta
   `"data:image/jpeg;base64,…"`). Así queda **garantizado** dentro del build de un
   solo archivo (`vite build --mode single`) y el enlace es 100 % autocontenido.

**Regla de oro:** imagen pequeña + md5 verificado + data URI. Nada de enlazar al
CDN (CSP) ni fiarse de `file` (no valida el cuerpo del JPEG).

## 2. Que el fondo NO quede "pegote" al mover la cámara

**Síntoma (detectado por el usuario):** con `scene.background = textura`, la
imagen va **pegada a la pantalla**, no al mundo. Desde la cámara inicial se ve
perfecta, pero al girar / ponerse cenital el mundo se mueve y el fondo no →
**sin paralaje** = pegote.

**Solución:**
- **Anclar el telón al MUNDO 3D**, no a la pantalla. Mejor un **cilindro
  envolvente** (cara interior, `side: BackSide`) centrado en el punto que mira la
  cámara, radio grande (~80), textura mapeada al arco frontal. Al estar a
  distancia constante, gires donde gires ves una porción frontal → nunca "pared
  plana". Un plano plano solo funciona de frente.
- **Cámara sobre raíles:** limitar OrbitControls a un **arco frontal**
  (`minAzimuthAngle`/`maxAzimuthAngle` ~±0.45) y **prohibir cenital**
  (`minPolarAngle`~1.24 / `maxPolarAngle`~1.52). Así no se llega a los ángulos
  que rompen la ilusión. Es lo que hacen los juegos con matte-painting.
- `scene.background` = **color cálido de respaldo** para que no haya negros nunca.
- Material del telón: `MeshBasicMaterial` (sin luz), `toneMapped:false`,
  `fog:false`, `depthWrite:false`, `renderOrder:-1`.

Referencia de implementación: `src/nivel-demo.ts` (bloque "Telón de fondo").

## 3. Receta "precioso" en el motor web (mismo Three.js, tiempo real)

- IBL: `PMREMGenerator.fromScene(new RoomEnvironment())` → `scene.environment`.
- Post: `EffectComposer` + `UnrealBloomPass` + `SMAAPass` + `OutputPass`.
- `ACESFilmicToneMapping`, `PCFSoftShadowMap`, luces cálidas + hemisférica.
- Plástico: `MeshPhysicalMaterial` con clearcoat + `envMapIntensity`.
Demostrado en `beauty-demo.ts` (antes/después) y `nivel-demo.ts`.

## 4. ¿Pasar el juego por el "creador de juegos" de Higgsfield?

**No** para rehacer/mejorar NUESTRO juego. Su pipeline (`get_game_creation_*`)
**genera un juego nuevo** desde un brief, con su propia arquitectura
(`app.json` + `logic.js` turn-based / `server.js` realtime + cliente) y assets de
IA. Tiraría a la basura nuestro motor a medida (personajes fieles a la peli,
tramos, audio…). Herramienta equivocada para "mejorar lo que ya hay".

**Sí** como **fábrica de assets** (ya lo usamos): `generate_image`,
`generate_video`, `soul_location`/skybox, `generate_3d` (imagen→GLB para props
reales que caen en NUESTRO motor), `generate_audio`/voz, y el **sandbox** para
procesar media.

**Quizá** como **host** del juego terminado (`deploy_game`): daría URL jugable +
CDN nativo (adiós al CSP, imágenes a resolución completa). Pero obliga a empaquetar
en su estructura (zip con `logic.js`/`server.js`) y **lista el juego en su
marketplace público** → poco adecuado para una entrega **privada** de cliente.
Para el cliente, mejor hosting propio; el Artifact vale para demos privadas.

---
_Actualizar este archivo cuando descubramos más trucos con Higgsfield/arte externo._
