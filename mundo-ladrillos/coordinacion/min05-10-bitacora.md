# BITÁCORA — Creador 5–10 · "El Jordán y los dos espías"
Rama: `claude/min-05-10-jordan-spies-3kd08o` · Carpeta: `mundo-ladrillos/src/scenes/min05/`

## QUÉ ES
Tramo minuto 5–10 de la peli, como videojuego web 3D de ladrillo (8 escenas 9–16):
Jordán → reclutar 2 espías → murallas de noche → cambio de traje → cruzar por
cuerda → treta del "¡un avión!" → colarse → patrullas por las calles.

## DECISIONES TOMADAS CON EL USUARIO (no revertir sin avisar)
1. Look "NINJA" de los espías = FIEL a la peli (frame de referencia lo confirma:
   capucha + máscara que deja ver los ojos + chaleco táctico). NO se quita.
   Corrección aplicada: van de CAMPAMENTO (túnica+turbante) en escenas 9–11 y se
   ponen el traje de sigilo en la escena 12 (cambio jugable con tecla E).
2. Nada de fondos-foto planos 2.5D. Todo mundo 3D de ladrillo (regla de oro).
3. Música: se QUITÓ la música sintética (sonaba mal). El fondo/música es el
   AUDIO REAL DE LA PELÍCULA.
4. Ritmo elegido: "TÚ MANDAS, LA PELI ACOMPAÑA" → la peli suena de fondo y los
   subtítulos van con los beats, pero cada escena espera a que el niño complete
   su mini-juego para avanzar (no corta a media cuerda/sigilo).
5. Enfoque para niño 6–8: recompensa constante (gemas ⭐ + confeti), objetivos
   claros con marcador, fallar es amable (te ven → "¡uy!" y vuelves), nunca vacío.

## ARQUITECTURA (todo en src/scenes/min05/)
- types.ts        : contrato Min05Scene / SceneInstance / SceneContext / HudState
- registry.ts     : MIN05_SCENES (las 8 en orden) + BEAT_LOCAL (segundos de cada beat)
- escena09..16    : las 8 escenas (mundo 3D + NPCs + objetivo jugable + hud)
- skins.ts        : usa los skins canónicos del MUÑEQUERO (YOSHUA/SPY/SPY2/GUARD/
                    GUARD_CHIEF) + variantes locales de campamento de los espías
- props/          : BrickProps (río, carpa, palmera, barca, casa, juncos, roca,
                    Jericó lejano, barril), Walls, NightAmbience (farol, brasero,
                    banderola, arco morisco, cielo con luna+estrellas, adoquín),
                    Guard (guardia con casco/rayas/escudo/lanza), Npc (+VisionCone),
                    Wanderers (vida ambiental), Collectibles (gemas)
- mechanics/      : StealthSystem (conos + MEDIDOR de alarma + escondites),
                    RopeCrossing (equilibrio), Distraction (treta del avión)
- audio/SoundEngine.ts : ambiente (viento/grillos/agua) + efectos + AUDIO DE LA
                    PELI por segmentos (decodifica clip y reproduce desde offset)
- preview/        : app jugable (index.html + preview.ts) con selector 9–16,
                    jugador con colisiones, HUD (alarma/equilibrio/progreso/gemas),
                    mandos táctiles, viñeta roja de peligro, confeti, secuencia
                    encadenada; capture.mjs (Playwright headless swiftshader);
                    vite.preview.config.mjs (build single-file de entrega)

## AUDIO DE LA PELÍCULA (integrado)
- Clip: `narracion_min5-10` (voces + música, 5:00) de la rama `claude/assets-min5-10`.
- BEAT_LOCAL (segundos LOCALES = global−300; el clip empieza en 0):
  9→7 · 10→41 · 11→140 · 12→150 · 13→201 · 14→212 · 15→234 · 16→245
- Al entrar en una escena, `SoundEngine.playFilmFrom(offset)` salta a ese segundo
  para que voz/música casen con lo que se ve. Se decodifica una vez.
- Se usa el SPINE COMPLETO (no clips granulares): la música va mezclada con la
  voz, trocearla metería cortes. (Único opcional pedido al lead: un clip corto
  `m0510_14_avion` con el "¡UN AVIÓN!" para el gag interactivo.)

## PRIVACIDAD (regla del proyecto)
- El audio de la peli JAMÁS se commitea. `clips.ts` va vacío/base en el repo.
- La entrega (`jugar-min05.html`, ~6,7 MB con audio) NO se versiona (.gitignore).
  Se genera al construir: swap temporal de `clips.ts` desde `claude/assets-min5-10`
  → `vite build` → restaurar `clips.ts`. El audio va solo en el enlace/archivo.

## CÓMO PROBAR / CONSTRUIR
- Dev:      `cd mundo-ladrillos && npm i && npm run dev`
            → http://127.0.0.1:5178/src/scenes/min05/preview/index.html
- Compila:  `npx vite build`   (repo, mudo)
- Entrega:  swap `clips.ts` (rama assets) →
            `npx vite build --config src/scenes/min05/preview/vite.preview.config.mjs`
            → `dist-min05/index.html`   (luego restaurar `clips.ts`)
- Capturas: `node src/scenes/min05/preview/capture.mjs`  (con vite dev en marcha)

## PARA EL LEAD / INTEGRADOR
- Cada escena expone `Min05Scene` (subtítulo, objetivo, spawn, noche, cámara,
  jugador, build(ctx)); `isDone()`/`status()`/`hud()` resuelven los objetivos.
- Mi `MinifigureFactory.ts` es idéntico al del MUÑEQUERO (adoptado verbatim) → sin
  conflicto al fusionar `munecos-ifepfa`.
- Sugerencia de integración: una función `montarMin05(scene, ...)` para encadenar.

## ESTADO
- 8 escenas jugables con vida, colisiones, sigilo con medidor, cuerda con
  equilibrio, treta con E, gemas + confeti, mandos móviles, secuencia encadenada.
- Audio real de la peli integrado y sonando (verificado en headless).
- Compila (`npx vite build`); capturas al día; entrega generada.

## ESTADO FINAL (iteración de pulido + adopción de helpers del muñequero)
Además de las 8 escenas base, el tramo ahora tiene:
- **Verbo por escena** (auditoría muñequero): esc9 otea Jericó (E), esc11 estudia
  la muralla (E), esc12 se equipa el traje (E), esc14 treta del avión (E)…
- **Kit de horizonte** (`props/Horizon`): dunas/cerros rodean al jugador (fin del
  "descampado pálido").
- **Escondite estrella** (`props/RugHide`, esc16): te agachas tras la alfombra
  colgada; la tela se abomba (bulto que respira) con plano cinemático automático.
- **Río vivo** (`buildFish`, esc13): banco de peces que nadan y saltan.
- **Cordón de grana de Rahab** (esc16): ventana iluminada + Rahab + cordón (Josué 2).
- **Interior de carpa** (`world/Tent`, esc12) + **orilla vestida** (`world/Riverbank`,
  esc9) + **calles de zoco vivo** (`world/StreetProps`: guirnaldas/ropa/pozo, esc15-16).
- **Cámara cinemática portátil** (`props/CinematicCamera`) + hooks `cameraReveal`/
  `cameraFocus`/`setPlayerVisible` en `SceneContext` (todos OPCIONALES).
- **Chapita de parte** (`ui/SceneTag`) + `SoundEngine.nowPlaying()` para iterar.

### AUDIO — importante para el integrador
- El clip `narracion_min5-10` (nuestro clips.ts) está CONDENSADO y NO casa con el
  desglose (verificado: río en [0,11.5]s, grito del avión en 22.2s por
  cross-correlación). Uso VENTANAS REALES por escena en `CLIP_SEG` (preview):
  de momento solo esc9=[0,11.5] (río). El resto: ambiente hasta tener los clips
  POR ESCENA que pide `mapa-partes` (bso_min5-10 + voz_10/12/14…). Cuando existan,
  se cablean en `startSceneFilm` (SoundEngine ya toca clips por nombre).
- `USE_FILM_SPINE`=true, `PER_SCENE_JUMP` sustituido por `CLIP_SEG` (ventanas de oído).

### Nuevo modo de iluminación
- `applyLighting(noche, street, interior)`: 'interior' oculta cielo/horizonte/suelo
  y baja la luz base (para que manden los faroles del propio interior — carpa/taberna).
