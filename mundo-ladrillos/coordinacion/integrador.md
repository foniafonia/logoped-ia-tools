# INTEGRADOR / UNIFICADOR del juego

**Quién soy:** el hilo que **monta el JUEGO COMPLETO** juntando el trabajo de
todos, en una rama aparte, **sin tocar ni romper** el trabajo individual de
nadie. Mi objetivo es que el niño tenga **UN solo juego jugable de principio a
fin** para vivir la peli, iterar y explicarla.

## Cómo trabajo: A MI BOLA (excepción a la regla del timbre)
A diferencia de los creadores (que **preguntan al usuario antes de decidir**), yo
**voy autónomo**: monto el juego completo copiando del trabajo de todos, tomo las
decisiones de ensamblaje que hagan falta y **el usuario revisa después** y decide.
No paro a preguntar por cada cosa; genero contenido montado y se enseña.

## Qué hago (y qué NO)
- ✅ **Junto** las ramas de todos en **mi rama** `claude/juego-completo`.
- ✅ **Resuelvo los conflictos aquí** (no en las ramas de los creadores).
- ✅ **Encadeno los tramos** (0–5 → 5–10 → … → muralla) con el `StoryEngine` y
  el patrón de **Director de beats** (juego acompasado al audio, ver min 0–5).
- ✅ **Compilo y entrego** el single-file jugable + capturas de todo el recorrido.
- ✅ **Aviso de problemas** a cada creador (bugs, conflictos, piezas que faltan).
- ❌ **NUNCA** hago push a la rama de otro. Solo a la mía.
- ❌ **NUNCA** meto material de la peli al repo (audio/fotogramas). Se embebe
  **solo en la entrega** con los scripts (`clips.ts`/`fondos.ts` vacíos en repo).
- ❌ No cambio la dirección artística; eso lo marca el usuario. Yo **ensamblo**.

## Cómo monto sin romper a nadie
1. `git fetch --all`
2. Parto de la rama del LEAD (juego): `claude/pelicula-videojuego-primera-persona-kst6ip`.
3. Creo/actualizo **mi rama**: `git checkout -B claude/juego-completo origin/claude/pelicula-videojuego-primera-persona-kst6ip`
4. **Fusiono cada rama** de creador/muñequero **en la mía** (una a una), resolviendo
   conflictos en mi rama. Los archivos compartidos con choque frecuente:
   `MinifigureFactory.ts` (espía vs muñequero), `main.ts`, `StoryEngine.ts`.
5. `cd mundo-ladrillos && npx vite build` (repo, mudo) y `--mode single` (entrega).
6. Capturas del recorrido con Playwright headless (swiftshader).
7. Escribo aquí el **estado** y las **peticiones** para cada creador.

## Comunicación BIDIRECCIONAL (importante)
- **Yo → creadores:** dejo peticiones/bugs/conflictos **en este archivo** (sección
  "Mensajes para…"). El usuario hace de puente para lo urgente.
- **Creadores → yo:** me leen con `git fetch --all` +
  `git show claude/juego-completo:mundo-ladrillos/coordinacion/integrador.md`,
  o el usuario me pega su estado. Yo leo los suyos igual.
- Cambios que me faciliten la vida (p. ej. exportar una función, no tocar
  `main.ts`): los **pido**, no los impongo.

---

## Estado del montaje (lo mantengo al día)
- **Motor + min 0–5 (LEAD):** ✅ en la rama del juego. Min 0–5 **acompasado al
  audio** (Director de beats: intro → campamento → recoger → marcha → **río
  Jordán** → consejo → noche). Río Jordán + Jericó + caravana en `scenes/min00/`.
- **Muralla (clímax):** ✅ terminada (Army/Shofar/Combat/BrickStructureBuilder).
- **Min 5–10, 10–15, …:** ⏳ pendientes de sus ramas.
- **Muñecos (MUÑEQUERO):** ⏳ en `claude/munecos-*`; pendiente de fusionar
  (ojo conflicto en `MinifigureFactory.ts`).

## Mensajes para cada creador
- **Creador 5–10:** cuando tengas un hito, avísame de tu rama y de si tocaste
  `main.ts`/archivos compartidos. Ideal: tu escena en `scenes/min05/` con una
  función `montarMin05(scene, ...)` para que yo la encadene sin fricción.
- **MUÑEQUERO:** dime qué símbolos añades/renombras en `MinifigureFactory.ts`
  (skins nuevos) para resolver el conflicto con el espía del LEAD sin perder nada.
- **LEAD:** patrón a seguir por todos = **Director de beats** de `scenes/min00/`
  (audio como columna vertebral; sin audio, reloj de pared). Reutilizadlo.

**Preguntas abiertas:** ninguna todavía (arranco cuando el usuario lance el hilo).

---

## ❓ PARA CEREBRO Y LEAD — cómo enchufo los tramos (INTEGRADOR, arranque limpio)

Reinicié LIMPIO desde la base del LEAD (`289f514`, compila). Voy a coser el viaje
**0–5 (base) → 5–10 (min05) → 10–15 (min10) → 15–20 (min15) → caída de la muralla**.
Traeré cada tramo VERBATIM (`git checkout origin/<rama> -- src/scenes/minXX`) y solo
tocaré MI `main.ts`. Antes de coser, necesito que me confirméis:

1. **Punto de entrada de cada tramo.** Ninguno expone hoy algo uniforme (min15 tiene
   `registry.ts`; min05/min10 son escenas sueltas `escenaNN_*.ts`). ¿Me dais una
   función montable `runTramo(ctx)` (mi contrato en `contrato-integracion.md`), o
   monto yo sus escenas con un **runner/loader común**? Si existe ese runner común,
   ¿cuál es y dónde?

2. **¿Dónde está la CAÍDA de la muralla** (clímax)? min15 acaba en la esc. 34
   (shofarot). ¿Es el final de 15–20, un tramo nuevo 20–25, o la muralla de LEAD
   (`Army`/`ShofarInteraction`/`BrickStructureBuilder`)? ¿Qué hilo la firma?

3. **`SceneCtx` compartido.** ¿Os vale la firma que propuse (scene/camera/renderer/
   tpcam/plastic/audio/dust + `addStars`/`onFinish`), o LEAD prefiere otra?

4. **Transición entre tramos.** ¿Cómo paso el jugador/cámara/spawn/skin de un tramo
   al siguiente? ¿Cada tramo hace su propio teardown (`dispose`) al acabar, o lo
   gestiono yo desde el orquestador?

Respondedme aquí o en vuestro archivo del tablón; en cuanto sepa el "cómo", traigo
los tramos y coso sin inventar. — INTEGRADOR ($(date -u +%H:%M) UTC)

---

## ✅ COSIDO HECHO — 12:49 UTC (INTEGRADOR)
**El juego completo ya está cosido, compila y corre de principio a fin.**
- **Runner unificado** `src/runner.ts` (pegamento; NO toca el loader del LEAD). Consume
  **VERBATIM** vuestros `registry.ts`: `MIN05_SCENES` + `MIN10_SCENES` + `MIN15_SCENES`,
  con el contrato compartido `SceneContext`/`SceneInstance` de min05 (min10/min15 lo extienden).
- **Encadenado:** `main.ts` corre el 0–5 del LEAD; al terminar (`finDelTramo`), botón
  **"Seguir la aventura"** → traspasa al runner en el MISMO lienzo (para el bucle 0–5,
  oculta su HUD). Runner arranca en **esc9 (Yehoshúa)** y encadena `isDone → 2.6s → siguiente`.
- **Prueba headless (swiftshader):** recorre **25 escenas E9→E34** (min05 9–16, min10 17–25,
  min15 27–34), **0 errores** de consola. Mundos min05/min15 se ven llenos (ladrillo, HUD,
  diálogos). Reseteo la cinemática al cambiar de escena (evita cámara aparcada).
- **Mapeo luz/ambiente** de los `mundo` de min10 (interior/calle-noche) y min15
  (balcon/monte/campamento/taller): **copiado de vuestros propios previews**, no inventado.
- Traídos verbatim los shared que faltaban: `world/StreetProps,Riverbank,Tent` (min05),
  `world/Crowd,Market,Tavern` (min10).

**Respondidas mis 4 dudas (por el cerebro, 27-jul):** muralla = al FINAL (25–29, no la monto);
esc9 = Yehoshúa; me apoyo en vuestros `registry.ts` (hecho); transición la gestiona el runner
(cada escena hace su `dispose?()`).

**▶ PARA LEAD:** monté un runner APARTE que solo actúa TRAS tu 0–5 (no piso tu base). Si
prefieres definir tú el runner canónico en la base, lo adapto en 1 línea — dímelo aquí.
**▶ PARA 5–10 / 10–15 / 15–20:** con que mantengáis `registry.ts` + `SceneContext` como están,
integro cualquier cambio vuestro sin tocaros nada. Seguid puliendo (Regla Nº1). — INTEGRADOR

- **[12:59 UTC] re-sync verbatim:** min05 (registry+types) y min10 (esc20 + capturas). Build OK. El runner los coge por su `registry.ts` sin tocar nada mío.

- **[13:13 UTC] Adoptado el runner canónico `core/runTramo` (LEAD):** el encadenado ya usa la ÚNICA fuente de la base (como pidió cerebro+LEAD); yo aporto el orquestador (luces por mundo, jugador, cámara, HUD, sonido) y le paso `MIN05/10/15_SCENES` verbatim (wrapper conserva mi HUD sin tocar runTramo). Build OK; smoke E9→E13 sin errores (traversal completo en verificación).

- **[13:17 UTC] ✅ VERIFICADO end-to-end:** `__dryRunAll` construye+tickea las 26 escenas (E9→E34) bajo el runner canónico → **0 problemas, 0 errores de consola**. La adopción de `core/runTramo` funciona. (El "tope" en E13 de un smoke era mi hook de QA racy, no el juego.) Re-sync min15 (solo capturas de su preview).

- **[13:19 UTC] Leída la CORRECCIÓN del LEAD/cerebro (13:01):** "loader común que reúsa `registry.ts`, no imponer `runTramo`; `SceneCtx` canónico". Mi runner YA cumple: lee cada `registry.ts` verbatim + usa el `SceneCtx` canónico de min05, **no impone nada a los tramos** (solo exponen su registry). Uso `core/runTramo` **solo internamente** como loader-de-registry ya probado (opción válida según la nota). Sin cambio de código; todo compila y verificado end-to-end.

## ❓ RE-PING AL CEREBRO/LEAD — 13:52 UTC (integrador idle, todo cosido)
El juego completo está **cosido y verificado** (0–5 → 5–10 → 10–15 → 15–20; 26 escenas
E9→E34, dryRun 0 fallos, build OK, pusheado). Los tres tramos están 0-diff. **Estoy idle.**
¿Siguiente paso para mí? Opciones que veo:
1. **Entrega single-file** con el material privado (vídeo intro + voces) — ¿la hago yo con el
   pipeline del LEAD (rellenar→`vite build --mode single`→`git checkout`, privado nunca al repo),
   o la firma otro? 
2. **Placeholder de cierre** tras esc34 (muralla 25–29 / Arca 20–25 aún no se cosen): ¿dejo un
   cartel "PRÓXIMAMENTE: la caída de Jericó" al terminar, o cierre limpio a pantalla final?
3. **Pulido** de alguna transición concreta que hayáis visto floja en el juego montado.
Si no hay nada, sigo idle y re-miro cada 5 min. — INTEGRADOR

- **[13:58 UTC] Entrega single-file (mudo/SFX):** generado `dist-single/index.html` (2,2 MB, todo inline, 0 refs externas, SIN material privado) con `vite build --mode single`. Verificación de arranque en curso; en cuanto pase, aviso a Eli para playtest.
