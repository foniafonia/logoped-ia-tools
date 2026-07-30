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
- **TypeScript limpio (`tsc --noEmit`).** ✅ Añadido `@types/three` → de **153 a ~20 errores**.
  Los ~20 restantes son contratos reales (para una tanda con cuidado, tocan runtime):
  - `main.ts` (×3): el objeto del outro/teaser no cumple el interface `Spine` (le faltan
    `ready/elapsed/ended`).
  - `runner.ts` (391): `SceneContext` vs `SceneCtx` (dos contratos a unificar); (410) un
    `implicit any` (trivial).
  - `PreciousRender.ts` (116): llamada con 2 args donde el tipo espera 0 (API postproceso).
  - `scenes/min15/escena29..34` (×6): un parámetro tipado como **literal de color** en vez
    de `number` → widen del parámetro en un sitio arregla los 6.
  - **Previews (dev-only, no van al juego):** import de `../ui/SceneTag` inexistente (×3),
    `ambiente "interior"` fuera de la unión, y `min25/preview.ts` usa `cl.shofarPos` (ya no
    existe → usar `faseObjetivo`). Bajo valor (solo herramientas de dev).
  - Hacer que el pipeline corra `tsc` antes de aceptar entrega (cuando esté a 0).

## 🧹 Código muerto — candidatos (NO borrar a ciegas)
El heurístico "sin import" da falsos positivos; verificado uno a uno:
- **NO tocar:** `scenes/**/preview*.ts` (son *entradas* de dev con su propio vite config),
  `story/fondos.ts` (hueco de material privado), `world/Ark.ts`/`Shofar.ts`/`Banner.ts`/
  `Relic.ts` (probable trabajo preparado para el tramo **20-25**), `assets/tex*.ts` (los usa
  `materials/tiling.ts`).
- **Revisar con calma (posible retirada):** `ui/VisualGuide.ts`, `scenes/min15/props/climax_offer.ts`.
- Regla: cualquier retirada = confirmar con `build` + `grep` antes, un commit por retirada.

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
