# Muñequero de Yehoshúa — el bueno

Este es el modelo del vídeo: gorro de punto con cenefa, barba con textura de
pelo, cara impresa y manos en "C". Coincidencia de silueta con la hoja de
personaje oficial: **92,9 %**.

**Cómo distinguirlo de la copia vieja en 5 segundos.** Si tu `MinifigureFactory.ts`
no tiene la bandera `printed` ni existen `FaceDecal.ts` y `HairLocks.ts` al lado,
es la versión anterior: torso plano, gorro liso y barba de dos conos. Todo el
salto de calidad está en el camino `printed: true`; el resto del elenco sigue
por el camino antiguo a propósito, para no romperlo.

```bash
grep -c "printed" src/characters/MinifigureFactory.ts   # el bueno da 41
ls src/characters/HairLocks.ts src/characters/FaceDecal.ts
```

---

## 1 · Dónde está el código

| | |
|---|---|
| Repo | `github.com/foniafonia/logoped-ia-tools` |
| Rama | `claude/munecos-ifepfa` |
| Fuente viva | `mundo-ladrillos/src/characters/` |
| Copia lista para llevarte | `referencia-munequero/` (esta carpeta), en la raíz del repo |

```bash
git clone -b claude/munecos-ifepfa https://github.com/foniafonia/logoped-ia-tools
cp -R logoped-ia-tools/referencia-munequero ~/Developer/referencia-munequero
```

**No he podido dejártelo en `~/Developer/` yo mismo.** Esta sesión corre en un
contenedor remoto, no en tu Mac; no tengo acceso a tu disco. La carpeta está en
la rama y también te la mando comprimida.

## 2 · Qué archivos lo componen

| archivo | líneas | qué hace |
|---|---:|---|
| `src/characters/MinifigureFactory.ts` | 1.252 | el muñeco entero: proporciones, ropa, tocados, elenco |
| `src/characters/FaceDecal.ts` | 478 | las 8 texturas pintadas en canvas |
| `src/characters/HairLocks.ts` | 282 | barba, bigote, flequillo y nuca como mechones barridos |
| `src/characters/BeardSculpt.ts` | 116 | barba esculpida anterior; la sustituyó HairLocks, se conserva |
| `src/materials/PlasticMaterialFactory.ts` | 58 | material plástico compartido (caché por color) |
| `src/core/PreciousRender.ts` | 131 | IBL, tone mapping, bloom, calidad por dispositivo |
| `src/characters/CharacterController.ts` | 77 | mover la figura por el mundo (opcional) |
| `ejemplo/minimo.ts` | 66 | el ejemplo mínimo |

**2.460 líneas** contando el ejemplo. La lámina de proceso dice 2.330 porque es
una foto del día que la generé; el código creció después.

## 3 · Con qué se renderiza

**Three.js, en tiempo real, en el navegador.** El mismo motor del juego.

No hay Blender, no hay GLB, no hay render offline. No existe ningún `.glb` ni
`.fbx` en el proyecto — la geometría se construye en código al instanciar la
figura. El vídeo que viste es una captura de pantalla del canvas con
`MediaRecorder`, no un render aparte.

Piezas que usa: `RoundedBoxGeometry`, `CylinderGeometry`, `TorusGeometry`,
`SphereGeometry` y tubos barridos sobre `CatmullRomCurve3` con
`computeFrenetFrames` (eso son los mechones), fusionados con `mergeGeometries`.

## 4 · Las texturas

**Todas procedurales, pintadas con canvas 2D al arrancar.** Cero archivos de
imagen. Ni un PNG, ni un JPG. Están memorizadas: se pintan una vez y se
comparten entre todas las figuras.

| textura | canvas | dónde va |
|---|---|---|
| `makeElderFaceTexture` | 640 × 480 | cara impresa (ojos, cejas, arrugas, boca) |
| `makeBeardTexture` | 768 × 768 | pelo de la barba |
| `makeBeardFuzzTexture` | 768 × 768 | pelusa de las capas de relleno |
| `makeHeadHairTexture` | 512 × 512 | pelo de sienes y nuca |
| `makeCapTexture` | 1024 × 512 | punto de lana del gorro |
| `makeEmbroideryTexture` | 1024 × 256 | cenefa de hilo plateado |
| `makeTorsoTexture` | 512 × 528 | túnica, costuras, prenda interior |
| `makeBeltTexture` | 920 × 200 | cuero del cinturón |

Ventaja para tu juego: cambias un color en el skin y la textura se repinta sola.
No hay que retocar PNG en Photoshop ni mantener un atlas.

Los únicos `.jpg` del proyecto (`src/assets/bg-*.jpg`) son fondos de escenario,
no tocan al muñeco.

## 5 · Cómo se define un personaje nuevo

Un objeto plano. Esto es Yehoshúa completo:

```ts
export const YOSHUA_SKIN: MinifigureSkin = {
  head: 0xf2b40a,         // amarillo dorado (muestreado de la hoja)
  torso: 0x0d5288,        // túnica azul profundo
  belt: 0x4a2f1a,         // cinturón café oscuro
  legs: 0x14508a,
  arms: 0x5e3520,         // mangas café oscuro
  hands: 0xf2b40a,
  headwear: 0x0c2f4d,     // gorro azul profundo
  headStyle: 'cap',       // gorro redondeado con borde enrollado
  turbanStripe: 0xc3c8d0, // bordado plateado
  beard: 0xc4c9ce,
  beardStyle: 'long',
  vestPanel: 0x104263,
  collar: 0xd6c199,
  loincloth: 0x6e4a2c,
  printed: true,          // ← LA BANDERA QUE LO CAMBIA TODO
  emotion: 'worried',
  accessory: 'none'
};

const fig = createMinifigure(plastic, YOSHUA_SKIN);
scene.add(fig.root);
```

`printed: true` activa el camino de máxima fidelidad: cara impresa en vez de
ojos de caja, barba de mechones en vez de conos, gorro con cenefa, proporciones
medidas sobre la hoja, manos en "C". Sin esa bandera sale el muñeco antiguo.

La interfaz `MinifigureSkin` tiene ~40 campos opcionales (tocados, capa,
pectoral, falda, gafas, accesorio…). Está toda comentada en
`src/characters/MinifigureFactory.ts`.

## 6 · ¿Corre en móvil?

Sí, pero con cabeza. Medido sobre la figura real:

| | por figura |
|---|---:|
| mallas (≈ draw calls) | 35 |
| triángulos | 30.758 |
| vértices | 38.329 |
| materiales | 22 |
| texturas | 7 (compartidas entre todas las figuras) |

Traducción honesta: **una a cuatro figuras en pantalla van sobradas en un móvil
de gama media.** Para una multitud de veinte no sirve tal cual — 700 draw calls
lo tumban. Si el juego de Melilla necesita muchos niños a la vez, el camino es
un skin con `printed: false` para los del fondo (mucho más barato) y `printed:
true` sólo para los protagonistas y los primeros planos.

`PreciousRender.ts` ya baja el pixelRatio y apaga el IBL en móvil.

## 7 · ¿Está animado?

Sí, va dentro del propio muñeco, no es un sistema aparte:

```ts
fig.update(dt, caminando, velocidad);  // piernas y brazos
fig.attack();                          // gesto de brazo
```

Es animación procedural por código, sin esqueleto ni clips. El detalle que le da
carácter: la fase del paso está **cuantizada a ~15 fps** para que se mueva como
un juguete en stop-motion, no como un personaje interpolado. Está en
`MinifigureFactory.ts:1230`.

## 8 · La hoja de personaje y la lámina de pasos

| qué | dónde |
|---|---|
| Frontal oficial (extraído del PDF) | `docs/hoja-personaje-frontal.png` |
| Texto de la hoja + medidas | `docs/canon-yehoshua.md` |
| Lámina de los 27 pasos | `docs/proceso-yehoshua.png` |
| Comparativa lado a lado | `docs/comparativa-final.png` |
| Turnaround de 4 vistas | `docs/turnaround-final.png` |
| Origen y licencias | `docs/PROVENANCE.md` |

El PDF original no está en git por ser binario y pesado; `canon-yehoshua.md` es
su extracto de texto más todas las medidas que saqué píxel a píxel.

---

## Arrancar

**Verlo ya, sin instalar nada:** doble clic en
`ejemplo/yehoshua-listo-para-abrir.html`. Un fichero, 595 KB, sin internet.
En móvil no funciona: los navegadores de móvil no ejecutan HTML descargado.

**Trabajar con el código:**

```bash
npm install
npm run dev              # luego abre http://localhost:5173/ejemplo/minimo.html
npm run build:suelto     # empaqueta todo en un html de doble clic
```

`ejemplo/minimo.ts` son 66 líneas: crea la escena, las luces, la figura y el
bucle. Es el patrón para meterlo en otro proyecto.

**Tres cosas que parecen decorativas y no lo son.** Si las quitas el muñeco se
te cae al nivel de la copia vieja:

1. **El IBL** (`RoomEnvironment` vía PMREM). Sin él el plástico no brilla. Es la
   mitad del acabado.
2. **La lente larga** (`PerspectiveCamera(20, …)`, ≈85 mm). Con un fov ancho las
   proporciones se deforman y deja de parecer una foto de producto.
3. **La luz de cuatro puntos** (key + fill + dos rim). Una luz plana y uniforme
   aplana el volumen.

## Las herramientas de medida — esto es lo que más te va a servir

En `herramientas/`. Es el método que llevó la fidelidad del 83 % al 92,9 %, y
sirve igual para tus niños de Melilla si tienes una referencia con la que
comparar:

```bash
node herramientas/clean.mjs render.png     # render limpio, sin HUD ni sombra de suelo
python3 herramientas/iou_pure.py render.png   # IoU de silueta + color, por zonas
python3 herramientas/cmp2.py render.png       # perfil de anchuras en 20 bandas
python3 herramientas/pelo.py render.png       # cuánta cara tapa el pelo, fila a fila
python3 herramientas/runs.py render.png       # estructura de la silueta por filas
```

Iterar a ojo se estanca. Medir no. La mitad inferior del muñeco pasó del 70,8 %
al 88,6 % de coincidencia en una sola tarde en cuanto empecé a medir en vez de
mirar.

## Para el juego de Melilla — lo que te sirve y lo que no

**Se reaprovecha entero:** las proporciones de minifigura, el sistema de skins,
las texturas procedurales, la animación de stop-motion, el material plástico,
la luz de producto y las herramientas de medida.

**Hay que rehacer para niños de 7-10 años:**

- **La cara.** `makeElderFaceTexture` pinta arrugas, ceño y cejas gruesas de
  anciano. Para un niño hace falta otra función hermana: ojos más grandes y
  redondos, cejas finas y altas, sin arrugas. Es el mismo patrón de canvas,
  ~80 líneas.
- **La barba.** Sobra. `HairLocks.ts` te sirve igual para **el pelo**: los
  mechones son el mismo mecanismo, sólo cambian el punto de nacimiento y la
  dirección. Ahí tienes flequillos, coletas y melenas.
- **Las proporciones.** Las de esta figura están medidas sobre un anciano. Un
  niño de juguete suele llevar cabeza más grande respecto al cuerpo y piernas
  más cortas. Están todas en constantes con nombre dentro del bloque
  `if (s.printed)`, así que es tocar números, no reescribir.

Yo empezaría por conseguir una referencia del acabado que quieres para los
niños, aunque sea una sola imagen frontal, y medir contra ella desde el primer
día con `iou_pure.py`. Sin referencia el método no funciona; con ella, funciona
muy bien.
