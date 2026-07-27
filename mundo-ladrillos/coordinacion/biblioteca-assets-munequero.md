# 📦 BIBLIOTECA DE ASSETS — MUÑEQUERO (rama `claude/munecos-ifepfa`)

> 🌐 **Catálogo visual (web):** https://claude.ai/code/artifact/bd34fbb8-ce92-4a3c-b1e8-d4736019f6b3
> (privado del usuario; se comparte desde el menú "Share" para dar acceso a todos).

> **Para TODOS los hilos y el LEAD.** Todo esto está LISTO y verificado (build limpio).
> **Úsenlo ya en sus escenas** (Regla Nº1: ningún rincón pelado). Y **LEAD: mergéalo
> a la base compartida** (o a `main`) para que todos tengan acceso sin `git checkout`
> entre ramas. Mientras tanto, se trae con los comandos de abajo.

## Cómo traerse TODO de golpe
```bash
git fetch origin claude/munecos-ifepfa
git checkout origin/claude/munecos-ifepfa -- \
  mundo-ladrillos/src/assets \
  mundo-ladrillos/src/materials/tiling.ts \
  mundo-ladrillos/src/core/PreciousRender.ts \
  mundo-ladrillos/src/world/Clutter.ts \
  mundo-ladrillos/src/ui \
  mundo-ladrillos/src/world/Ark.ts \
  mundo-ladrillos/src/world/Shofar.ts \
  mundo-ladrillos/src/world/Relic.ts \
  mundo-ladrillos/src/world/Banner.ts
```

---

## 🎨 Texturas tileables (Higgsfield · seamless · data-URI)
Todas se usan igual, con el helper `tiledTexture`:
```ts
import { tiledTexture } from './materials/tiling';
import { texSand } from './assets/texSand';
const mat = new THREE.MeshStandardMaterial({ map: tiledTexture(texSand, 16), roughness: 0.95 });
floor.material = mat;   // y para muros: applyTiledTexture(mesh, texWall, 6)
```
| módulo | qué es | para |
|---|---|---|
| `texSand` | arena | suelo desierto/orilla |
| `texEarth` | tierra seca agrietada | **la marcha** alrededor de Jericó, exteriores áridos |
| `texRock` | roca/peñasco | peñascos, cimientos, murallas de piedra, cuevas |
| `texWall` | muro de adobe/ladrillo | muros de casas y murallas |
| `texStreet` | calle empedrada | plaza, mercado, calles |
| `texWater` | agua de río (¡anímala con `map.offset`!) | **el Jordán**, estanques |
| `texKilim` | alfombra/tela con motivo | interiores, posada, tiendas |
| `texWood` | tablones de madera | tarimas, puestos, muelles |
| `texThatch` | techo de palma/paja | tejados de casas, puestos, cobertizos |
| `texGrass` | pradera seca (hierba) | oasis, campos, tierra prometida |
| `texSky` | cielo dramático de nubes (16:9, tile horizontal) | skydome / telón de fondo, clímax |
| `texBronze` | bronce martillado y patinado | escudos, cascos, el Arca, armas, detalles metálicos |
| `texMarble` | mármol pulido con vetas | suelos de templo/palacio, pedestales |
| `texLeather` | cuero gastado | armaduras, sacos, correas, chalecos |
| `texGold` | oro grabado/ornamentado | el Arca, candelabros, tesoros |
| `texIron` | hierro forjado oscuro | armas, cascos, verjas, herrajes |
| `texBark` | corteza de árbol | troncos de palmera/olivo, postes, vigas |
| `texParchment` | pergamino envejecido | mapas, rollos (Torá), cartas, fondos de UI antiguos |

## 🎬 Biblioteca AUDIOVISUAL (carátula, pantallas, vídeo, voz)
Assets grandes en la biblioteca de Higgsfield del usuario (no embebidos por peso). Catálogo
con job ids + URLs en **`coordinacion/biblioteca-av-munequero.md`**: **carátula** del juego
(tipo caja/CD), pantallas de **título/inicio**, **victoria** y **game over**, y un **vídeo
de intro** (la muralla deshaciéndose). Se piden versiones reducidas embebibles al muñequero.

## 🖼️ Fondos y key-art (anclados, cámara en raíles)
| módulo | qué es |
|---|---|
| `bgPortadaKeyart` | **key-art de la PORTADA** (murallas al atardecer, desenfocado) |
| `bgJericoTelon` | **telón dramático de la muralla de Jericó al atardecer** (plano de fondo anclado; para el clímax del muro / "fondo cutre" que anotó el cerebro) |
| `bgJericoMurallas` | murallas de Jericó (telón) |
| `bgCampamento` | campamento israelita |
| `bgJordanNoche` | Jordán de noche |
| `jericoBackdrop` / `backdrops` | telones para cilindro anclado |

## 🎯 Iconos de juego (WebP transparente, HUD/botones)
```ts
import { iconShofar, iconCoin, iconKey, iconScroll, iconTorch } from './assets/gameIcons';
img.src = iconShofar;   // shofar · shékel · llave · rollo (Torá/mapa) · antorcha (noche)
```
`iconShofar` (cuerno, derriba murallas) · `iconCoin` (shékel/recompensa) · `iconKey`
(llave de puerta/puesto) · `iconScroll` (rollo — objetivo/pista) · `iconTorch` (antorcha,
noche/sigilo) · `iconBasket` (cesta de pan — comida/coleccionable, mercado) · `iconJug`
(cántaro de agua — aguadoras/pozo, prop de mercado) · `iconStar` (estrella dorada —
recompensa/nivel completado, universal) · `iconCord` (**cordón rojo** — la señal de Rahab,
objetivo clave de E20) · `iconLamp` (candil de aceite — interiores/noche, casa de Rahab) ·
`iconHelmet` (casco de bronce — guardias/soldados, asalto al muro) · `iconGrapes` (racimo de
uvas — comida/mercado/coleccionable) · `iconShield` (escudo de bronce con **león de Judá** —
guardias/combate). Todos recortados con IA (fondo transparente) y verificados por md5. **13 iconos**.

## ✨ Render "precioso" (COMPARTIDO)
```ts
import { setupPreciousRender } from './core/PreciousRender';
const fx = setupPreciousRender(renderer, scene, camera, { preset: 'day' }); // 'day'|'night'|'interior'
// loop: fx.render();   resize: fx.setSize(w,h)   (modo lite auto en móvil)
```

## 🧱 Attrezzo droppable (Regla Nº1) — `world/Clutter.ts`
```ts
import { buildCrateStack, buildSackPile, buildPotCluster, buildPalm, buildFirePit, buildTent } from './world/Clutter';
scene.add(buildCrateStack(plastic, { x: 4, z: -2 }));
scene.add(buildFirePit(plastic, { x: 0, z: 0 }));   // fogata con luz cálida (noches)
scene.add(buildTent(plastic, { x: 3, z: -2, rack: true }));  // carpa; rack=perchero de trajes de sigilo (E10/E12)
scene.add(buildWell(plastic, { x: 0, z: 0 }));   // pozo de aldea (agua/aguadoras, centro de plaza)
scene.add(buildMarketStall(plastic, { x: -2, z: 2 }));  // tenderete: mostrador + toldo a rayas + mercancía
```
`buildWell(plastic, { x, z, scale? })` → pozo de aldea (brocal de piedra + poste, travesaño,
cubo colgando y agua). Centro natural de plaza/mercado y fuente de las aguadoras (Regla Nº1).
`buildTent(plastic, { rack?, color?, scale?, yaw? })` → tienda de campaña a dos aguas
(frente abierto). Con `rack:true` monta dentro el perchero de trajes de sigilo (reclutar
espías / vestuario). Ver montaje en `tienda-demo`.

## 🎭 Personajes y multitud — `characters/MinifigureFactory.ts`, `world/Crowd.ts`
- `villagerSkin(i)` → **20 aldeanos** deterministas con **expresiones variadas**
  (feliz, sereno, alerta, preocupado, sorprendido, serio, risueño, pícaro, apenado, muchacho,
  **enfadado (regateo), niña asustada, anciano en asombro, mujer resuelta**…).
- `buildCrowd(scene, plastic, spots, { lite, walkers })` → multitud poblada (móvil-friendly).
- **`buildNightMarketCrowd(scene, plastic, { center, radius, density })`** → multitud LITE
  **curada para MERCADO NOCTURNO** (5–10 / 10–15): elenco variado de noche (mercader que
  regatea, encapuchados, asombro, niña asustada, aguadoras) alrededor de un centro + caminantes.
  Determinista y sin sombras (barato). Ver `mercado-noche-demo`. Devuelve `{ group, update, dispose }`.
- **`buildProcessionCrowd(scene, plastic, { mode, origin, rows, perRow, facingYaw })`** →
  multitud LITE de **PROCESIÓN** para los momentos "wow": `mode:'march'` (marcha alrededor
  de Jericó, caras resueltas avanzando hacia la muralla) o `mode:'celebration'` (júbilo/asombro
  cuando cae la muralla o el campamento celebra). Forma FILAS que miran a un objetivo común
  (`facingYaw`), con niños mezclados. Ver `procesion-demo`.
- **Emociones** (campo `emotion` del skin): happy, neutral, worried, stern, surprised, alert,
  angry, sad, scared, sly, joyful, **awe** (asombro reverente, p.ej. ante el milagro),
  **determined** (guerrero resuelto). Úsalas para variar caras en multitudes y momentos clave.

## 🧑‍🤝‍🧑 Personajes CANÓNICOS (clavados a `referencias/peli.json`) — `characters/MinifigureFactory.ts`
`CHARACTER_SKINS`: `yehoshua` (túnica azul real + banda azul/blanca + barba larga blanca + pantalón
marrón), `rahab` (vestido/pelo plateado + cordón rojo), `espia`/`espia2` (sigilo negro/gris +
`espiaCamp`/`espia2Camp` de viaje), `guardia` (cota de malla gris + bigote negro + escudo con león),
`jefeGuardia` (túnica roja a franjas + casco con pluma + barba rubia), `sacerdote` (túnica blanca +
**mitra** + pectoral + shofar), `beduino` (verde oliva + keffiyeh arena + barba marrón), `rabino`
(traje azul marino + gafas + corbata gris + kipá). Úsalos con `createMinifigure(plastic, CHARACTER_SKINS.yehoshua)`.

## 💥 CLÍMAX — "deshacer en ladrillos" (Regla de oro nº3) — `world/BrickBurst.ts`
Efecto insignia del final: lo que cae (un enemigo, un trozo de muralla) **se deshace en
ladrillos de juguete** que saltan, giran, rebotan y quedan como escombro (sin violencia).
Reutilizable por el LEAD para el clímax "La caída de la muralla".
```ts
import { BrickBurstSystem, spawnBrickBurst } from './world/BrickBurst';
const bricks = new BrickBurstSystem(scene, plastic);
bricks.burst(new THREE.Vector3(x, 1, z));                 // un enemigo derrotado → ladrillos
bricks.wall({ x0:-7, x1:7, z:-6, height:4 }, { rows:4, sweepSecs:2.4, lite:true }); // la MURALLA cae de izq→der
// en el loop:  bricks.update(dt);
// (o suelto: const b = spawnBrickBurst(scene, plastic, { center }); ... if(!b.update(dt)) b.dispose();)
```
Los ladrillos posados hacen también de **escombros**. Ver montaje en `muralla-demo`.
Para el estado FINAL (muro ya caído) usa el escombro estático `buildRubblePile(plastic, {x,z})`
de `world/Clutter.ts` (montón de ladrillos de juguete + polvo, determinista).

## 📜 Objetos de la historia — `world/`
`buildArk` (Arca), `buildShofar` (cuerno), `buildRelic` (reliquia), `buildBanner`/`buildBannerRow` (estandartes),
**`buildScarletCord`** (el **cordón rojo de Rahab** que cuelga de la ventana — la señal del RESCATE en el
clímax; `buildScarletCord(plastic, { top:{x,y,z}, length, lean, yaw })`. Ver `cordon-demo`).

## 🖥️ Kit de UI de ladrillo — `src/ui/`
`Portada` (título), `PauseMenu`, `Hud`, `DialogueBox` (typewriter + titleCard), `SettingsPanel`,
`ResultScreen`, `LevelSelect`, `Credits`, `Controls` (joystick + botón **E** + acción, móvil),
`Toast`, `Collectibles`, `LoadingScreen`, `Health`, `Compass`, `Tutorial`, `StealthMeter`, `BrickUI` (botones/paneles).

## 🧪 Demos para copiar montajes
`portada-demo`, `plaza-demo`, `rio-demo`, `terreno-demo`, `iconos-demo`, `tienda-demo`,
`mercado-noche-demo`, `procesion-demo`, `muralla-demo`, `cordon-demo`, `noche-demo`,
`clutter-demo`, `textura-demo`, `crowd-lite-demo`, `controles-demo`, `ui-demo`, `dialogo-demo`,
`ark-demo`, `shofar-demo`, `mapa-demo`, `ajustes-demo`, `combate-demo`, `tutorial-demo`, `sigilo-demo`, `extras-demo`.
