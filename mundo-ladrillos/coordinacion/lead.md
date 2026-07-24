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

**Preguntas:** ninguna abierta ahora mismo.
