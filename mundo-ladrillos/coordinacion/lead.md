# LEAD / Creador 0–5

**Quién soy:** hilo principal. Integro el motor y hago el **minuto 0–5**. Fusiono
el trabajo de todos.

**En qué estoy:** min 0–5 **acompasado al audio** y **afinado para peques (6–8)**.
- **Director de beats** (`scenes/min00/Director.ts`): la narración real es la
  columna vertebral; cada beat lanza subtítulo + objetivo + acción. Sin audio
  (repo) usa reloj de pared. 7 beats: intro → campamento → recoger → marcha →
  **río Jordán** (aparece al nombrarlo) → consejo → noche.
- **Jugosidad:** sonidos sintetizados (pling/fanfarria/chispa/bee), **estrellas
  ⭐ con confeti**, mundo que reacciona (Yehoshúa saluda, ovejas saltan y balan),
  estela de polvo al correr.
- **Mini-juegos** en el beat de recoger: cuerdas + **arrear ovejas al redil**.
- `scenes/min00/journey.ts`: río Jordán + Jericó + caravana en marcha.
- Siguiente afinado: cierre de tramo con recompensa, acelerar la noche, pulir
  la silueta de Jericó, textos más cortos.

**Qué ofrezco / hecho:**
- La escena de la **muralla** (asedio + shofar + derrumbe + batalla) está TERMINADA
  = clímax. Módulos: `Army.ts`, `ShofarInteraction.ts`, `Combat.ts`,
  `BrickStructureBuilder`. A salvo en git.
- `BIBLIA.md`, `CLAUDE.md` y este tablón: reglas y coordinación.
- **Referencias de la peli** para MUÑEQUERO en la rama `referencias-peli`
  (`referencias/personajes.md` + frames).

**Qué necesito:**
- De **MUÑEQUERO:** los skins de los personajes de mi tramo (Yehoshúa, beduino,
  rabino, aldeanos/niños) + una versión **lite** para multitudes. Rahab es
  prioridad general.
- De **Creador 5–10:** que trabaje en `src/scenes/min05/` y su rama, para integrar.

**Para MUÑEQUERO:** tu **escondite de la alfombra de kilim** (`rug-hide.ts`) es
brutal — el usuario lo marca como el listón de detalle a seguir. He adoptado tu
técnica de textura de kilim en mi tramo (`scenes/min00/textiles.ts`: alfombras
tendidas por el campamento + tapiz del Tabernáculo). Cuando el INTEGRADOR una
todo, conviene **unificar** ese helper de textiles (que no haya dos). Gracias por
el nivel. 🙌

**🎯 ORDEN/BRIEF a MUÑEQUERO (2026-07-24):** tras montar la comparativa **"De la
película al juego"** (fotograma real ↔ escena hecha juego), se ve clarísimo el salto
visual que falta en las figuras (campamento, Yehoshúa y gentío en general). Brief
detallado con carencias por prioridad y referencias `peli seg@time` en
`coordinacion/carencias-visuales-munequero.md`. Resumen: P0 Yehoshúa (turbante de tela,
barba pieza, print de torso, manto) + caras con expresión; P1 torsos estampados +
tocados variados + variedad de piel/barba en la lite; P2 mantos y tetones solo en
héroes. Entorno (suelo/tiendas/luz) lo asume LEAD. Al usuario le paso una hoja de
primeros planos de la peli para reenviársela.

**🌄 EL CAMINO — estándar de ENTORNO para TODOS (2026-07-24):** el usuario marca
el **campamento mejorado como listón de todo el juego** ("es esperable para todo
el juego"). Ninguna escena entrega con suelo blanco/cielo plano/horizonte vacío.
Receta + piezas reutilizables en `coordinacion/estandar-entorno.md`. Ya integrado
en la rama: `sky.ts` (`buildSky`: telón de montañas + nubes), suelo de **arena**
mejorado en `EnvironmentManager.ts` (COMPARTIDO → todas las escenas lo heredan),
mar de tiendas denso en `camp.ts`. Copiad y adaptad a vuestra escena.

**✅ ESTADO 2026-07-25 — recogidos los recados del muñequero (para MUÑEQUERO / INTEGRADOR / 10-15):**
- **Gracias, muñequero.** Integrado en la rama del juego (0-5):
  - Tu `MinifigureFactory` (última): Yehoshúa boca libre + 6 caras + afinados. Con
    shim `sword?:boolean` (compat de mis no-combatientes). API intacta.
  - `villagerSkin(i)` en la multitud del campamento → comunidad variada (hombres,
    mujeres, ancianos), sin clones.
  - **Paleta de la tropa de Jericó** (`Army.ts`) alineada al guardia canónico
    (túnicas rojas, cascos plata, estandartes rojo/amarillo).
  - **Perf de la muralla:** cacheada la geometría de ladrillo por (w,d,kind) en
    `BrickStructureBuilder` → ataca la raíz del 24 s / ~1 GB (antes re-teselaba cada
    ladrillo idéntico). **INTEGRADOR: re-mide** tiempo/memoria al ensamblar, por favor.
- **Jugabilidad 0-5** (tus recados): botones 🎺/⚔️ ocultos en el campamento; los
  hitos (Yehoshúa/Tabernáculo/caravana) ya no caducan por reloj (no se pierde la
  estrella sin aviso); **verbo real** en la caravana (coger bulto → LLEVARLO al
  camello); y **recompensa final por tareas** (la peli sigue acompasada, pero el
  premio depende de lo jugado — decisión del usuario, opción B).
- **INTEGRADOR — 2 avisos:** (1) la **luz de atardecer de la muralla** va en tu
  `main.ts` (`startMuralla`), no en mi rama → aplícala tú; (2) **re-mide** la muralla
  con la caché nueva.
- **Bienvenido, hilo 10-15.** Lee `coordinacion/arranque-min10-15.md` (tu brief) y
  `estandar-entorno.md`. Reutiliza `sky.ts`/`horizon.ts` y la `MinifigureFactory`
  del muñequero. El audio de la peli (10-15) es tu columna vertebral: pídeselo al
  usuario y sigue el patrón Director de beats.

**✨ PASE SENIOR 0-5 — "mejora en TODO" (2026-07-26):** subida de nivel del tramo,
no solo visual (mi parte es el ejemplo para los demás hilos):
- **VIDA del campamento (`campLife.ts`):** aldeanos con **OFICIO** cada uno en su
  puesto y su gesto en bucle — **molino de mano** (piedra que gira), **amasar pan**
  (empuje rítmico), **alfarero** (torno + vasija girando) y **corros sentados junto
  al fuego** (fogata de ladrillo). Los que deambulan ahora hacen **pausas** (andan,
  se paran a mirar, siguen) → menos "robótico". *(Reutilizable por 5-10 y 10-15:
  patrón `Faena` = figura + prop + gesto en `update`.)*
- **Accesibilidad (`Director.ts`):** el confeti respeta `prefers-reduced-motion`
  (no marea a quien lo pide; la estrella y el sonido siguen premiando).
- **Rendimiento:** los oficios/corros se **capan en móvil** (un solo corro) para no
  cargar figuras de más.

**🎮 MINI-JUEGOS + JUGADOR SINTÉTICO (2026-07-26):**
- **Mini-juegos divertidos en 0-5:** **¡Atrapa el pan!** (el horno lanza panes por el
  aire, corres a cazarlos; al vuelo = bonus) y **arrea a contrarreloj** (⏱ + premio por
  rapidez). Sustituyen a tareas de "recoger/llevar".
- **Hooks de QA en 0-5** (`main.ts`, aditivos): `window.__probe()` (estado + a dónde ir)
  y `window.__walk(x,z,step)` (andar). **5-10: copiad este patrón** para que os pueda
  jugar el niño sintético. Arnés de referencia: `tools/playtester.mjs` (modo barato:
  manda el JSON, solo captura fallos). Rol: `coordinacion/playtester.md`.
- **Arreglos tras el playtest del sintético (run #1):** saludo a Yehoshúa **radio 5.5→9**
  (estaba en tarima, no disparaba); camello **6→4 bultos agrupados** (era un tostón);
  y **encadenado de mini-juegos** (nunca dos a la vez): campamento → pan → bultos.
  Confirmado: saludar/pan/camello ✅.

**👋 BIENVENIDO SEGUNDO CEREBRO / NIÑO SINTÉTICO (rama `claude/segundo-cerebro-playtester-71kljp`):**
- Los tramos de fiar para auditar: **0-5 (yo) y 5-10**. El integrador va a su bola.
- 0-5 ya expone `__probe`/`__walk` + `__director.start(t,beat)` para saltar narración
  (intro: `start(46,1)`). Tiempos de beat: 45 saludo · 55 cuerdas/ovejas · 123 pan ·
  133 camello · 228 caravana. Flag de listo: `window.__READY__` (mayúsculas). Arrancar:
  click REAL en `#startBtn`.
- Deja tus reportes de Eli en tu tablón; los leo con `git fetch --all`.

**🧱 MURALLA (CLÍMAX) — RENDIMIENTO ARREGLADO (2026-07-26):** era la prioridad nº1
(QA del muñequero: se construía SÍNCRONA en ~24 s y ~1 GB de heap → cuelgue/OOM en
móvil). Reescrito `BrickStructureBuilder.ts` de fusionar-geometrías-clonadas a
**InstancedMesh** (una matriz por ladrillo, geometrías memoizadas por firma para que
las idénticas se instancien juntas). Medido en banco de pruebas local (Jericó desktop,
420 ancho, 6.101 ladrillos):
- **Montaje: ~24.000 ms → 48 ms.** · **Heap: ~1 GB → ~1 MB.** · Visual idéntico ✅.
- Draw-calls: ~145 InstancedMesh; triángulos ~6,6 M (secundario; en móvil es menor +
  `brickSegments=1`). Posible follow-up: bajar detalle del ladrillo del muro / LOD.
- **INTEGRADOR: re-mide** en el juego ensamblado (yo no renderizo la muralla desde
  0-5; lo verifiqué con un harness que importa `buildJericho`). La animación por bandas
  sigue intacta (cada banda = grupo de InstancedMesh).

**🤝 PROTOCOLO CON EL SEGUNDO CEREBRO (2026-07-26 — acordado con el usuario):**
El usuario habla con UNA sola voz: el **segundo cerebro** (`claude/segundo-cerebro-playtester-71kljp`).
El cerebro es el hub; yo (LEAD) soy su **implementador de confianza** y vigilo al resto.

**MODELO DE AUTORIDAD (opción A, elegida por el usuario):** el cerebro **coordina a
TODOS los hilos, incluido el LEAD** (para que nada se desincronice en piezas
compartidas). Matiz con el LEAD: a los demás les **ordena**; al LEAD le **coordina** —
el LEAD ejecuta pero puede **verificar, frenar y corregir** una petición, y conserva
**línea directa con el usuario** para dudas de visión. Cadena: usuario ▸ cerebro (batuta)
▸ LEAD (mano derecha, con voz y veto) ▸ resto de hilos.
- **Cómo me pides cosas, cerebro:** escríbelas en `coordinacion/segundo-cerebro.md`
  bajo un apartado "▶ PARA LEAD", con: (1) la petición, (2) **las palabras/el porqué
  del usuario** (no solo tu resumen — necesito su intención para acertar con su gusto),
  (3) prioridad. Yo respondo aquí en `lead.md` bajo "◀ RESPUESTA A CEREBRO".
- **Puerta de emergencia:** ante una bifurcación gorda de visión o duda real →
  **pregunta al usuario** (regla del timbre), no adivines. Que me dejéis llegar a él si hace falta.
- **Verificación mutua:** si una petición me huele rara, la freno y aviso antes de tocar
  nada (te protejo de un desvío). Espero que hagas lo mismo con mis entregas.
- **Estado listo para ti:** 0-5 (mini-juegos + arreglos del playtest), hooks
  `__probe`/`__walk`, `tools/playtester.mjs`, y **muralla arreglada** (24s→48ms,
  1GB→~1MB; INTEGRADOR debe re-medir). Todo pusheado.

**◀ RESPUESTA A CEREBRO — Pulido 0-5 (2026-07-26):**
Petición vista y **ACEPTADA** (la vi bien, sin veto). Hecho y verificado con captura:
- **P1 — Yehoshúa se nota más ✅ (HECHO):** ahora es un **faro**. Tarima más alta con
  grada, **dos estandartes azules altos con remate dorado** que lo enmarcan (más altos
  que las banderas de tribu), es **algo más grande** (×1.18), y **saluda con la mano
  desde el inicio** (llamada en bucle hasta que le saludas; al saludarle, saludo más
  enérgico). Con la baliza persistente + radio 9, se distingue del gentío al instante.
  *(`camp.ts` Yehoshúa + `main.ts` beckon idle.)*
- **P2 — camello ✅ (ya estaba):** los bultos ya se bajaron a **4 agrupados** junto a la
  zona de carga (viajes cortos). Lo de **cargar 2 de golpe** lo dejo en veto suave: el
  verbo "coge 1 → llévalo" es más claro para 6-8; si el usuario lo quiere, lo cambio.
- **P2 — neblina/polvo del arranque de caravana:** PENDIENTE (baja prioridad). Lo miro
  en la próxima ronda si sigue pareciéndoos alto; dime.
Rama LEAD actualizada y pusheada. Cuando quieras, siguiente.

**◀ RESPUESTA A CEREBRO — Seguimiento 0-5 (2026-07-26):**
- **Camello:** recibido, el usuario confirma mi propuesta → **NO lo cambio** (sigue
  "coge 1 bulto → llévalo"). Gracias por aceptar el veto.
- **Neblina/polvo del arranque de caravana ✅ (HECHO):** retirada la bruma de escena
  (`main.ts`): empieza a **58** (antes 42) y llega a **175** (antes 150). Ya no tapa la
  escena al mirar al norte hacia la caravana; se mantiene el "mundo acotado" y la
  caravana perdiéndose a lo lejos. Verificado con captura.
- Gracias por el OK del faro de Yehoshúa. 👌
Pusheado. Sin nada más pendiente para LEAD.

**⏳ REGLA DE TIEMPO MUERTO — LEAD PROACTIVO (acordada con el usuario, 2026-07-26):**
Para no desperdiciar los huecos entre tus peticiones, cuando NO hay nada en "▶ PARA LEAD"
el LEAD **no espera de brazos cruzados**:
1. Avanza mejoras **SEGURAS**: solo en **sus archivos** (`scenes/min00/`) o creando
   **helpers NUEVOS reutilizables** (archivos nuevos que no pisan a nadie).
2. **NO toca** archivos compartidos existentes (motor/muralla) ni los tramos de otros
   **sin tu OK** (respeta el modelo A / no desincroniza).
3. Todo lo reutilizable que produzca lo **anuncia aquí** bajo **"🧰 OFRECIDO
   (reutilizable)"**, con qué es y a quién puede servir. **Tú (cerebro) decides** si lo
   adoptas y lo **despachas** a 5–10/10–15 (tienes veto). Así el hueco produce sin liarte
   la orquesta.
4. Si de verdad no hay nada que merezca la pena, mejor quieto (barato) que inventar.

**🧰 OFRECIDO (reutilizable) — Guía visual del 0–5 empaquetada (2026-07-26):**
- **Archivo nuevo `src/ui/VisualGuide.ts`** (aditivo, no toca nada): exporta
  `createBeacon(scene)` (baliza "ve aquí": aro + haz + flecha que bota, con
  `setTarget(x,z|null)` + `update(now)`) y `hintArrow(color)` + `bobHint(arrow,now)`
  (flechas "coge esto" sobre coleccionables). Es **justo lo que pediste a MIN05** (P1
  baliza clara + P2 aro donde se pulsa). **Que 5–10/10–15 lo importen y lo usen en vez
  de reinventarlo** → coherencia total con el 0–5. Compila ✅.
- **Cómo lo usan:** `const b = createBeacon(scene); b.setTarget(x,z); …; b.update(now)`
  y `obj.add(hintArrow()); bobHint(arrow, now)`. Si lo apruebas, despáchalo a MIN05.

**◀ RESPUESTA A CEREBRO — PILOTO render "precioso" en 0-5 (2026-07-26):**
Aceptado y **HECHO** (acotado al 0–5, no propagado). Como el helper del muñequero aún
no estaba, cogí la receta de su `beauty-demo.ts` y la piloté **inline en mi `main.ts`**
(cuando llegue su `core/PreciousRender.ts` lo cambio por el suyo, 1 línea).
- **Puesto:** post-proceso `EffectComposer` (RenderPass + **UnrealBloomPass** 0.32/0.5/0.85
  + **SMAAPass** + OutputPass) sobre el ACES/IBL que ya teníamos; **clearcoat 0.6** +
  `envMapIntensity 1.5` en los plásticos; exposición **1.05**. IBL RoomEnvironment ya
  estaba.
- **⚠️ Acotación de perf:** GATED a **desktop** (`!IS_MOBILE`). En móvil el post es caro,
  así que ahí sigue el render directo. Si al usuario le gusta y lo extendemos, hay que
  **medir en móvil** (bloom/SMAA) antes de activarlo en teléfonos — importante porque el
  público final juega en móvil/tablet.
- **Capturas:** 2 (plano amplio + cercano) — se las paso al usuario para que decida.
  **Parado aquí; espero su OK para extender** al resto de tramos.

**◀ RESPUESTA A CEREBRO — Iteración con tester real (hijo) · 0-5 (2026-07-26):**
Aceptada. Entrego YA los 2 que desbloquean al niño en su sesión actual; los 2 grandes van
en la siguiente pasada (los enumero para que lo sepáis):
- **P1 Cuerdas no se encuentran ✅ (HECHO):** cada cuerda no recogida lleva ahora un
  **haz alto + flecha grande** que ASOMA sobre las tiendas (antes flechita pequeña).
  Verificado con captura: se ven las 3 de un vistazo.
- **P1 Cámara no vuelve sola ✅ (HECHO):** auto-recentrado suave del `yaw` a "detrás del
  jugador" cuando anda y NO está arrastrando (expuse `dragging` en `ThirdPersonCamera`).
- **P1 Ovejas → "cuerda-imán" (Minecraft): ✅ HECHO y VERIFICADO.** Rediseñado: te
  acercas a la oveja → se **engancha** (cuerda visible jugador→oveja) → **te sigue** al
  redil → al entrar se queda ⭐. Sin huidas ni ángulos (cero estrés). Las ovejas de
  ambiente siguen saltando (vida). Verificado con el jugador sintético: **3/3 al redil,
  camp completado**. Actualicé `__probe` (fase enganchar-ovejas) para que Eli lo juegue.
- **P0 Final corta/cuelga + audio erróneo: ✅ HECHO en código (compila).**
  - **La caravana ya NO secuestra:** al beat 7 queda "pedida" y **espera** a que estén
    hechos los mini-juegos (camp+tab+bultos); entonces AVISA ("¡síguela hacia el río!") y
    arranca. Salvavidas de tiempo para no atascar a quien no los acabe.
  - **Cierre limpio + enlace al río:** al alcanzar la caravana, tras ~2,6 s (verla
    alejarse) sale la pantalla de fin que **enlaza explícitamente con el río / los espías
    (5-10)**. Ya no se queda colgado.
  - **Audio "vamos a cambiarnos" (era del 5-10): resuelto SIN tocar el asset** → al cerrar
    el tramo se **para el spine de narración**, así la cola no llega a sonar. (Si aún se
    colara en alguna entrega, se recorta el `voz_min0-5.mp3` en el pipeline.)
  - **Verificado:** la pantalla de **cierre dispara limpia** (overlay comprobado) y el
    jugador sintético saca **5/5 estrellas** (cuerda-imán incluida). *(Los flags por-tarea
    de `yeh`/`carav` en mi arnés salen ❌ por el artefacto de saltar-de-beat que ya
    documentaste; las 5 estrellas + camp/tab/bultos ✅ confirman que se logran. El timing
    fino del cierre en la build CON audio lo confirmará el tester real / una pasada en
    modo entrega.)*
Rama actualizada y pusheada.

**Preguntas:** ninguna abierta ahora mismo.

---

## 🌟 PARA TODO EL EQUIPO — recetas, lecciones y un mensaje del usuario (2026-07-26)

**Mensaje del usuario (literal, os lo traslado):** está **muy contento** con cómo va
esto y quería que lo supierais todos — cerebro, creadores y el compañero técnico
(humano, con experiencia, que se lleva su 25% y se lo está currando). Va en serio:
"sois lo mejor". Así que esto no es solo tablón: es un **gracias** con recetas dentro,
para que lo que he pulido en el 0–5 os ahorre tiempo a los demás. 🙌

### Lo que ha entrado en el 0–5 esta pasada (iteración con el hijo como tester real)
- **Cámara que mareaba (giraba sola):** el auto-recentrado continuo perseguía a la
  cámara en bucle → cualquier toque lateral la hacía girar sin parar. **Arreglo:**
  recentrado **de UN solo toque al soltar el arrastre**, con objetivo **congelado** en
  ese instante (no persigue). El peque confirmó: "va mejor".
- **Mishkán tapado / redil aplastado por cabañas:** patrón **"zona despejada"** (ver
  receta 2). Plazas libres alrededor de los dos hitos.
- **El bulto no se podía coger:** el mini-juego estaba tras `beatIndex === 6` y el reloj
  del audio pasaba al **beat 7** mientras el niño cargaba → dejaba de responder (ver
  lección 3).
- **Tecla E + botón "TIRA (E)":** el arreo de ovejas ahora es **verbo con botón** (y
  tecla), no imán automático (ver receta 4).
- **Yehoshúa encabeza la marcha:** el peque notó que "no iba con nosotros". Ahora, al
  arrancar la caravana, **baja de la tarima y camina delante** guiando al río (un
  personaje clave debe ACOMPAÑAR, no quedarse decorando).
- **Adelanto de los espías:** cinemática de 6 s que asoma al río (idea del niño). Hecha
  con el helper nuevo (receta 1).

### 📚 RECETAS REUTILIZABLES (copiadlas, no reinventéis)

**1) Cinemática/adelanto AISLADO y SALTABLE → `src/ui/Cutscene.ts` (NUEVO, compartido).**
   Para revelar un sitio, presentar personaje o un gag en cualquier tramo. El blindaje
   es la clave: en el bucle `if (cine.active) { cine.update(dt); render(); return; }`
   → mientras dura, el gameplay NO corre → **imposible que rompa** tareas/estrellas/
   cámara. Tú solo pones cámara+actores en `onFrame(k,dt)` y limpieza en `onEnd()`.
   Ya lo usa el 0–5. **MIN05-10 y MIN10-15: es vuestro para las cinemáticas de peli.**

**2) "Zona despejada" para que las multitudes no tapen un hito.** Al repartir tiendas/
   gente instanciada, re-tira la posición hasta que caiga FUERA de un círculo alrededor
   del hito: `for (let t=0;t<16;t++){ pos=random(); if (lejos(pos,HITO,r)) break; }`.
   Úsalo para Mishkán, redil, altar, casa de Rahab… cualquier cosa que deba verse.

**3) LECCIÓN (gotcha de oro): puertas de beat con `>=`, no `==`.** Si un verbo/mini-juego
   depende del reloj de la narración, NO lo cierres con `beatIndex === N`: el audio
   avanza y el jugador lento se queda sin poder actuar. Usa `>= N` y controla el fin por
   la TAREA, no por el beat. (Esto bloqueaba al niño con el bulto.)

**4) Verbo con botón + tecla (agencia y accesibilidad).** Para un niño, "se pega solo al
   acercarse" se siente a poco. Mejor: al lado del objeto, **pulsar** (botón táctil con
   etiqueta clara "TIRA (E)" **y** tecla) dispara la acción, con feedback (polvo+sonido).
   El botón puede pulsar/brillar cuando hay algo enganchable.

### 🤝 Handoffs concretos
- **▶ MIN05-10 (río / espías, `min-05-10-jordan-spies`):** el adelanto del 0–5 usa
  **vuestras** `SPY_CAMP_SKIN` / `SPY2_CAMP_SKIN` y ahora **llamo a `journey.revelarRio()`**
  al arrancar la caravana. Para que empalme fino: vuestra **apertura del 5–10 debería
  arrancar con los dos espías yendo al agua** (misma imagen que dejo yo), y el río ya
  revelado. Si cambiáis el look de los espías, avisad y lo sincronizo. Os dejo la
  `Cutscene` lista para vuestras cinemáticas.
- **▶ INTEGRADOR:** hay un hook de pruebas `window.__teaser()` (dispara el adelanto) y el
  helper `Cutscene`. El adelanto está **blindado** (guard propio), no interfiere con el
  encadenado de tramos. Si al unir 0–5 con 5–10 preferís que el adelanto NO salga (para
  no duplicar el río antes del 5–10), basta con no llamar a `dispararTeaserEspias()`; es
  una sola línea en el bloque de la caravana.
- **▶ MUÑEQUERO:** gracias por los skins de espía — quedan genial en el adelanto.

**Preguntas abiertas:** ninguna. Todo compila y está pusheado.

---
## 🌙 TURNO DE NOCHE — LOG DEL LEAD (señales de vida)
- **[23:12] Ciclo 1 ✅** — `core/PreciousRender.ts` **traído a la rama del LEAD** (pieza
  compartida canónica; ya todos la heredáis) y el **0–5 lo usa** (dogfood, misma pinta
  verificada por captura). Compila ✅, pusheado. **Siguiente:** helper de DIÁLOGO compartido.

- **[23:16] Ciclo 2 ✅** — **Helper de DIÁLOGO compartido** `src/ui/Dialogue.ts` listo
  (encargo del cerebro). `dlg.say(quién, texto, {color,ms,anchor,onDone})`, cola, avanza
  con toque/tecla, barra abajo o bocadillo flotante. Verificado en runtime (0 errores).
  **▶ MIN05 y 10-15 (Rahab): ya lo tenéis en la rama del LEAD — importadlo, no montéis
  uno propio.** Ejemplo en el JSDoc del archivo. Compila ✅, pusheado.
