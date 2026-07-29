# Backlog de calidad — mundo-ladrillos

Estado de los hallazgos (auditoría externa de la rama `h6eyug` + verificación en
nuestra rama `kst6ip`). Orden por valor/riesgo. Cada arreglo: **un commit, verificado,
sin romper lo bueno**.

## ✅ Ya resuelto en nuestra rama
- **"LEGO" en el repo** → limpio (0 apariciones).
- **StoryEngine.ts / guion.ts** (legado sin usar) → borrados.
- **Material privado en `clips.ts`** → NO es problema: los ~1,3 MB son **SFX libres**
  (shofar, rumble, shout, din), permitidos por la regla. Las voces de la peli van fuera
  + hook `pre-commit` que las bloquea. Las voces solo se rellenan para la entrega.
- **Muralla sin ejército/batalla/Rahab** → rescatada (ver `murallaEpica.ts` y CLIMAX_SCENE).
- **Fuga de recursos del clímax** → arreglada: `ShofarInteraction` cuelga todo de un
  `group` y expone `dispose()`; `buildClimax` y el runner lo llaman al salir.
- **Cámara del 0-5** → unificada con la de la muralla (ThirdPersonCamera "a pelo",
  sin recentrado; se queda donde la dejas).

## ⏳ Pendiente (cuando haya créditos / con OK)

### P0-P1 (más valor)
- **Arranque más rápido (lazy-load de tramos).** Hoy se carga todo al arrancar (bundle
  ~2,2 MB sin audio; 9,6 MB con voces). Cargar solo 0-5 al inicio y el resto bajo demanda.
  ⚠️ Toca el arranque → hacer con cuidado y verificar. Objetivo: interactivo <5 s en móvil
  razonable, 30 FPS móvil / 60 FPS escritorio.
- **TypeScript limpio (`tsc --noEmit`).** 153 errores, casi todos por falta de tipos de
  three (`TS7016`). Añadir `@types/three` quita ~90%; quedan unos pocos reales (contratos
  `Spine`, `SceneContext`/`SceneCtx`, algún `implicit any`). Riesgo cero en runtime (Vite
  no typa). Hacer que el pipeline corra `tsc` antes de aceptar entrega.

### P2
- **Accesibilidad** (clave para el salto a logopedia): navegación por teclado, controles
  táctiles con botones grandes, contraste, subtítulos, alternativa al audio, **modo de
  movimiento reducido**, pausa, **repetir instrucciones**, objetivos entendibles sin adulto.
- **Tramo 20-25** (Arca, aguas partidas del Jordán, siete vueltas a Jericó): hueco real
  en el runner (0-5 → 5-10 → 10-15 → 15-20 → muralla). **Decisión de dirección del usuario.**
- **Igualar calidad visual** de 5-10 y 15-20 al estándar de 0-5 (más vida, luz nocturna).
- **Dispose del ejército** (Army) en el clímax (instanced meshes) — menor.
- **Muralla como clímax completo**: siete vueltas + grito colectivo + transición desde 20-25.

## Notas de medición
- El FPS de Chromium **headless** NO vale (render por software). Medir en **móvil físico**.
- Lighthouse "Rendimiento 25/100" no es la vara buena para un juego 3D WebGL, pero su
  consejo de **carga diferida** sí es válido.
