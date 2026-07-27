# Tramo MINUTO 5–10 · "El Jordán y los dos espías"

Escenas 3D de ladrillo jugables para el tramo 5–10 de la película (CREADOR 5–10).
Todo son **mundos 3D de ladrillo** (como la muralla que ya existe): NADA de
fotogramas como fondo plano 2.5D. Los planos reales se usaron solo como
referencia para reconstruir el escenario en ladrillo.

## Escenas (en orden de la peli)

| Nº | Archivo | Escena | Objetivo jugable (mecánica) |
|----|---------|--------|------------------------------|
| 9  | `escena09_orilla_jordan.ts`   | Orilla del Jordán; Yehoshúa contempla Jericó | `ir_a` al promontorio |
| 10 | `escena10_reclutar_espias.ts` | Yehoshúa recluta a los dos espías en su tienda | `ir_a` a reunirse con los espías |
| 11 | `escena11_murallas_noche.ts`  | Murallas de Jericó de noche (establecimiento) | `ir_a` al puesto de observación |
| 12 | `escena12_trajes_sigilo.ts`   | Los espías se cambian a trajes de sigilo | `ir_a` al perchero de la carpa |
| 13 | `escena13_cruzar_rio.ts`      | Cruzan el río colgados de una cuerda | **cruzar por cuerda** (equilibrio) |
| 14 | `escena14_treta_avion.ts`     | Guardias en la puerta; la treta del "¡un avión!" | **distraer** (avión + guardias miran arriba) |
| 15 | `escena15_colarse_puerta.ts`  | Los espías se cuelan por la puerta abierta | **sigilo** (evitar conos de visión) |
| 16 | `escena16_guardias_calles.ts` | Los guardias patrullan las calles buscándolos | **sigilo** con guardias en movimiento |

Cada escena construye un escenario 3D de ladrillo + los personajes presentes
como NPCs + un objetivo jugable. El jugador **actúa** (mover / cruzar / distraer
/ esconderse), no pulsa "siguiente".

## Estructura de la carpeta

```
min05/
├── types.ts                     # contrato Min05Scene / SceneInstance / SceneContext
├── registry.ts                  # MIN05_SCENES (las 8, en orden)
├── escena09..16_*.ts            # las 8 escenas
├── props/
│   ├── BrickProps.ts            # río, carpa, palmera, antorcha, puerta, barca,
│   │                            #   casa, juncos, roca, Jericó lejano, barril…
│   ├── Walls.ts                 # muro recto de ladrillo con puerta/almenas
│   └── Npc.ts                   # NPC (envuelve la Minifigure compartida) + VisionCone
├── mechanics/
│   ├── StealthSystem.ts         # guardias + conos + escondites + detección
│   ├── RopeCrossing.ts          # puente de cuerda que se mece (equilibrio)
│   └── Distraction.ts           # la treta del "¡un avión!"
└── preview/
    ├── index.html               # app de prueba (selector de las 8 escenas)
    ├── preview.ts               # motor del preview (día/noche, HUD, jugador libre)
    ├── PreviewController.ts     # controlador de jugador con límites por escena
    ├── capture.mjs              # capturas headless (Playwright + SwiftShader)
    └── capturas/                # PNG de cada escena
```

## Piezas compartidas que se reutilizan (no se editan)

- `src/structures/BrickStructureBuilder.ts` — lenguaje de ladrillo de la muralla.
- `src/characters/MinifigureFactory.ts` — skins `YOSHUA_SKIN`, `SPY_SKIN`, `SPY2_SKIN`.
- `src/camera/ThirdPersonCamera.ts` — cámara en 3ª persona.
- `src/materials/PlasticMaterialFactory.ts`, `src/materials/BrickPalette.ts`.
- `src/world/EnvironmentManager.ts` — suelo con tetones.

Los muros propios (`props/Walls.ts`) replican el estilo del builder compartido
sin depender de sus funciones internas (que no están exportadas), para no tener
que tocar archivos compartidos.

## Audio y recompensas (para que sea divertido para un niño 6–8)
- **Música de fondo continua** (procedural, `audio/SoundEngine.ts`): alegre de
  día, de intriga en el sigilo. NUNCA hay silencio.
- **Audio REAL de la peli** (`AudioManager` + `clips.ts`): bullicio del
  campamento (`din`) y grito de guardia (`shout`) al pillarte.
- **Efectos**: pasos, salto, recoger, alarma, avión, puerta, chapuzón, éxito.
- **Gemas coleccionables** (`props/Collectibles.ts`) por el camino, con contador
  ⭐ y **confeti** al lograr el objetivo. Son premio, no bloquean el avance.

> ⚠️ El HTML de entrega `preview/jugar-min05.html` **embebe el audio de la peli**
> (privado) → **NO se versiona** (está en `.gitignore`). Se genera para la
> entrega con `npx vite build --config src/scenes/min05/preview/vite.preview.config.mjs`.
> En el repo, `clips.ts` debería ir vacío (regla de privacidad del proyecto).

## Probar el preview

```bash
cd mundo-ladrillos
npm install
npm run dev            # http://127.0.0.1:5178
# abre: /src/scenes/min05/preview/index.html
# o una escena directa:  /src/scenes/min05/preview/index.html?scene=13
```

Controles: **WASD/flechas** mover · **Shift** correr · **arrastra** cámara.
Botones 9–16 abajo a la izquierda para saltar de escena.

## Regenerar las capturas (headless SwiftShader)

Con el servidor de vite en marcha:

```bash
node src/scenes/min05/preview/capture.mjs
# genera preview/capturas/escena-09.png … escena-16.png
```

(En este entorno, Playwright es global; se enlaza a `node_modules/` con
`ln -sfn "$(npm root -g)/playwright" node_modules/playwright` — igual para
`playwright-core`.)

## Notas de integración para el LEAD

- Cada `Min05Scene` (ver `registry.ts` → `MIN05_SCENES`) trae `subtitulo`,
  `objetivo`, `exito`, `spawn`, `noche`, `camara`, `jugador` y `build(ctx)`.
- Para el `StoryEngine`: mapea `objetivo.tipo` `ir_a/cruzar/esconderse/huir/
  cinematica` 1:1. Los tipos nuevos **`distraer`** y **`sigilo`** los resuelve la
  propia escena vía `SceneInstance.isDone(player)` → engánchalo al hook
  `isDone` del motor. `SceneInstance.status()` da texto de HUD ("¡Te han
  visto!", "Escondido…").
- `build(ctx)` recibe `SceneContext { scene, plastic, getPlayer, setPlayer,
  markDone }`. `setPlayer(x,z)` lo usan las mecánicas para devolver al jugador al
  inicio (al caer del puente o al ser visto).
- El preview usa un `PreviewController` propio (jugador libre con límites por
  escena) porque el `CharacterController` compartido acota el movimiento al
  recinto de la muralla. Al integrar puedes sustituirlo, pero conviene fijar
  límites por escena.
- **Esta rama incluye un merge del marco** (rama del juego) como base para poder
  compilar y capturar. Todo mi trabajo propio está exclusivamente en
  `src/scenes/min05/`; no he tocado ningún archivo compartido.

### Al integrar los muñecos nuevos (rama `claude/munecos-ifepfa`)
Comprobado que mis skins son **compatibles** (la nueva `MinifigureFactory`
mantiene la interfaz `MinifigureSkin`; `headStyle` sigue teniendo `turban`,
`ninja`, `hood`). Cuando se fusionen los muñecos, se puede SIMPLIFICAR:
- `skins.ts` → usar los canónicos `YOSHUA_SKIN`, `SPY_SKIN`, `SPY2_SKIN`
  (los espías de sigilo) directamente del `MinifigureFactory`.
- `props/Guard.ts` → la nueva factoría trae `GUARD_SKIN`/`GUARD_CHIEF_SKIN` con
  `headStyle: 'coneHelmet'/'plumeHelmet'`, `tunicStripe` y `cape` NATIVOS, así
  que el casco/rayas/escudo que yo cuelgo a mano se pueden quitar y dejar solo el
  skin (más limpio y coherente). Mantengo `Guard.ts` para que funcione HOY (mi
  rama aún lleva la `MinifigureFactory` vieja del marco).
- Yehoshúa: `YOSHUA_SKIN` canónico ya trae barba larga blanca + `cape` cobalto.
