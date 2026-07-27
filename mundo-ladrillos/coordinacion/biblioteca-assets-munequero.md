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

## 🖼️ Fondos y key-art (anclados, cámara en raíles)
| módulo | qué es |
|---|---|
| `bgPortadaKeyart` | **key-art de la PORTADA** (murallas al atardecer, desenfocado) |
| `bgJericoMurallas` | murallas de Jericó (telón) |
| `bgCampamento` | campamento israelita |
| `bgJordanNoche` | Jordán de noche |
| `jericoBackdrop` / `backdrops` | telones para cilindro anclado |

## 🎯 Iconos de juego (WebP transparente, HUD/botones)
```ts
import { iconShofar, iconCoin } from './assets/gameIcons';
img.src = iconShofar;   // shofar (objeto clave) · shékel (moneda)
```

## ✨ Render "precioso" (COMPARTIDO)
```ts
import { setupPreciousRender } from './core/PreciousRender';
const fx = setupPreciousRender(renderer, scene, camera, { preset: 'day' }); // 'day'|'night'|'interior'
// loop: fx.render();   resize: fx.setSize(w,h)   (modo lite auto en móvil)
```

## 🧱 Attrezzo droppable (Regla Nº1) — `world/Clutter.ts`
```ts
import { buildCrateStack, buildSackPile, buildPotCluster, buildPalm, buildFirePit } from './world/Clutter';
scene.add(buildCrateStack(plastic, { x: 4, z: -2 }));
scene.add(buildFirePit(plastic, { x: 0, z: 0 }));   // fogata con luz cálida (noches)
```

## 🎭 Personajes y multitud — `characters/MinifigureFactory.ts`, `world/Crowd.ts`
- `villagerSkin(i)` → **16 aldeanos** deterministas con **expresiones variadas**
  (feliz, sereno, alerta, preocupado, sorprendido, serio, risueño, pícaro, apenado, muchacho…).
- `buildCrowd(scene, plastic, spots, { lite, walkers })` → multitud poblada (móvil-friendly).

## 📜 Objetos de la historia — `world/`
`buildArk` (Arca), `buildShofar` (cuerno), `buildRelic` (reliquia), `buildBanner`/`buildBannerRow` (estandartes).

## 🖥️ Kit de UI de ladrillo — `src/ui/`
`Portada` (título), `PauseMenu`, `Hud`, `DialogueBox` (typewriter + titleCard), `SettingsPanel`,
`ResultScreen`, `LevelSelect`, `Credits`, `Controls` (joystick + botón **E** + acción, móvil),
`Toast`, `Collectibles`, `LoadingScreen`, `Health`, `Compass`, `Tutorial`, `StealthMeter`, `BrickUI` (botones/paneles).

## 🧪 Demos para copiar montajes
`portada-demo`, `plaza-demo`, `rio-demo`, `terreno-demo`, `iconos-demo`, `noche-demo`,
`clutter-demo`, `textura-demo`, `crowd-lite-demo`, `controles-demo`, `ui-demo`, `dialogo-demo`,
`ark-demo`, `shofar-demo`, `mapa-demo`, `ajustes-demo`, `combate-demo`, `tutorial-demo`, `sigilo-demo`, `extras-demo`.
