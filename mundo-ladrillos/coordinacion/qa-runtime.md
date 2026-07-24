# QA EN RUNTIME del juego ensamblado (2026-07-24)

Lo hizo MUÑEQUERO (visor) con Chromium/SwiftShader headless sobre el build del
integrador (rama juego-completo-integrador). Cubre la laguna de la auditoría de
Codex, que no tenía Chromium en su entorno. **Es software render (swiftshader),
peor caso**: el FPS real en GPU/móvil será mucho mayor; lo importante aquí son
errores, tiempos de construcción y memoria.

## ✅ Bien
- **El juego BOOTEA LIMPIO**: 0 errores de consola y 0 pageerror al cargar los 6
  mundos (`?phase=camp|jordan|rahab|shofarot|cruce|muralla`). Sin crashes ni
  pérdida de contexto WebGL.
- Campamento monta en ~1,9 s.

## 🔴 Confirmado y GRAVE — la muralla (coincide con A3 de Codex, con datos)
- **La muralla se construye SÍNCRONA en ~24 s** (bloqueando el hilo) bajo software.
- **La heap salta a ~1.078 MB (¡~1 GB!)** al montar la muralla (vs ~80 MB en
  campamento). En un móvil modesto esto puede **congelarse o quedarse sin memoria**.
- Acción (LEAD / `Army.ts` + `BrickStructureBuilder.ts`): construir **por chunks**
  (requestIdleCallback/frames), **InstancedMesh**/geometría precocinada, cachear
  Jericó, y pantalla de progreso real. Es la **prioridad de rendimiento nº1**.

## ⚠️ Observaciones (con límites honestos)
- **FPS bajo en software** (campamento ~3 fps en swiftshader). Es el peor caso;
  **verificar en un móvil/GPU real** antes de sacar conclusiones. Aun así conviene
  el presupuesto de sombras/luces en móvil (M11 de Codex).
- **Fuga de memoria: NO concluyente.** Mi automatización de saltos entre mundos
  (overlay «☰ Mundos») no cambió de mundo de forma fiable en headless, así que no
  puedo confirmar ni descartar la fuga (A4). Recomiendo igualmente el **disposal
  completo** (materiales/texturas/listeners) como prevención.
- **jordan/rahab/shofarot/cruce**: no pude confirmar por automatización que
  montaran (no exponen los mismos globals que uso para detectar), pero **cargaron
  sin errores de consola** y con crecimiento de heap → probablemente montan bien;
  queda pendiente confirmación visual/manual.

## Método (reproducible)
`npx vite --port 5175` en la rama del integrador + Chromium headless_shell
(`/opt/pw-browsers/chromium_headless_shell-1194/...`, flags swiftshader). Clic
REAL de Playwright en el botón «Empezar» (el clic por `evaluate()` NO dispara el
handler — apunte para futuros QA). Medido: errores de consola, tiempo hasta que el
mundo expone `__ctrl/__army/__jericho`, FPS (rAF 1,5 s) y `performance.memory`.

## Prioridad que sugiero (runtime)
1. **Muralla por chunks + instancing + memoria** (24 s / 1 GB → inaceptable en móvil).
2. **Disposal completo** (A4) — prevención de fuga.
3. **QA en dispositivo real** para el FPS (el de aquí es software, no representativo).
4. Sigue en pie **A1 (audio en git)** como tema de gobernanza, y **unificar helpers**.
