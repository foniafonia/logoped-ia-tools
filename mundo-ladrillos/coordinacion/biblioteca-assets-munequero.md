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
import { iconShofar, iconCoin, iconKey, iconScroll } from './assets/gameIcons';
img.src = iconShofar;   // shofar (objeto clave) · shékel (moneda) · llave · rollo (Torá/mapa)
```
`iconShofar` (cuerno, derriba murallas) · `iconCoin` (shékel/recompensa) · `iconKey`
(llave de puerta/puesto) · `iconScroll` (rollo — objetivo/pista). Todos recortados con
IA (fondo transparente) y verificados por md5.

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
```
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

## 📜 Objetos de la historia — `world/`
`buildArk` (Arca), `buildShofar` (cuerno), `buildRelic` (reliquia), `buildBanner`/`buildBannerRow` (estandartes).

## 🖥️ Kit de UI de ladrillo — `src/ui/`
`Portada` (título), `PauseMenu`, `Hud`, `DialogueBox` (typewriter + titleCard), `SettingsPanel`,
`ResultScreen`, `LevelSelect`, `Credits`, `Controls` (joystick + botón **E** + acción, móvil),
`Toast`, `Collectibles`, `LoadingScreen`, `Health`, `Compass`, `Tutorial`, `StealthMeter`, `BrickUI` (botones/paneles).

## 🧪 Demos para copiar montajes
`portada-demo`, `plaza-demo`, `rio-demo`, `terreno-demo`, `iconos-demo`, `tienda-demo`,
`mercado-noche-demo`, `noche-demo`,
`clutter-demo`, `textura-demo`, `crowd-lite-demo`, `controles-demo`, `ui-demo`, `dialogo-demo`,
`ark-demo`, `shofar-demo`, `mapa-demo`, `ajustes-demo`, `combate-demo`, `tutorial-demo`, `sigilo-demo`, `extras-demo`.
