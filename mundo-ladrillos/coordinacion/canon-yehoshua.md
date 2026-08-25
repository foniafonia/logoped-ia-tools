# Canon oficial — Yehoshúa (hoja de personaje)

Extracto **de texto** de la hoja de personaje oficial (documento de producción,
recibido en PDF). Guardado aquí como referencia porque el PDF es binario/pesado y
no se versiona. Esta es la fuente de verdad para `YOSHUA_SKIN` en
`src/characters/MinifigureFactory.ts`.

> Nota de marca: la hoja original usa la palabra de la marca de bloques daneses.
> En NUESTRO código y textos usamos siempre "ladrillo/juguete", nunca esa marca.

## 01 · Definición visual
Anciano líder hebreo, sabio, firme y solemne. Proporciones de minifigura: cabeza
cilíndrica amarilla, torso trapezoidal, brazos curvos, manos amarillas en "C",
piernas rectas rígidas (sin rodillas).
Rostro amarillo, expresión **seria y ligeramente preocupada**. Ojos negros
ovalados con reflejo blanco. Cejas gruesas café oscuro inclinadas al centro; línea
vertical entre cejas; dos líneas de edad en mejillas. Boca pequeña entreabierta
bajo el bigote. Lectura: **autoridad serena + preocupación contenida**.

## 02 · Rasgos de identidad
- **Barba y bigote:** bigote gris abundante unido a una barba **extremadamente
  larga, densa y voluminosa**. Gris plateada con mechones gris cálido, gris oscuro
  y ligeros café. Empieza en las mejillas, cubre el cuello y **casi todo el torso**,
  termina en puntas irregulares.
- **Cabello:** bajo el gorro solo mechones compactos café oscuro en lados y nuca.
  Nunca cabello largo descubierto.
- **Gorro:** redondeado **azul marino**, ajustado, textura fina, borde inferior
  grueso enrollado. Bordado con **hilo plateado**: líneas onduladas + banda
  ornamental central (motivos angulares tipo montañas/ramas/hebreo antiguo).
  Patrón continuo e idéntico desde cualquier ángulo.

## 03 · Materiales y color
- **Torso/túnica:** azul profundo, líneas negras discretas (costuras/pliegues). En
  la abertura central asoma **prenda interior beige/arena** con detalles dorados
  apagados. **Cinturón ancho café** de franjas horizontales; al frente **nudo o
  hebilla ovalada café** delineada en negro; en la espalda sigue sin segunda hebilla.
- **Brazos/manos/piernas:** **mangas café medio** (acabado plástico brillante);
  manos amarillas en "C"; **piernas azul profundo**; parte baja de ambas piernas
  **café oscuro = botas** con corte horizontal limpio.
- **Render:** juguete de plástico limpio, reflejos suaves, bordes redondeados,
  geometría rígida. Texturas solo en barba, cabello y gorro.

## 04 · Continuidad
Mantener idénticos en todas las vistas: rostro, expresión, barba, bigote, cabello,
gorro, bordado plateado, colores, túnica, cinturón, mangas, piernas, botas y
proporciones.

## Evitar (importante)
Anatomía humana realista, dedos/nariz/orejas realistas, piel humana, rodillas
articuladas, cabello largo descubierto, cambios de vestuario, barba más corta,
**capa, armadura, espada, bastón, joyas, sandalias, accesorios, objetos**,
escenarios o personajes adicionales.

> Implicación para el juego: el skin canónico va **sin accesorio**. Si la
> jugabilidad necesita que Yehoshúa lleve shofar o bastón, se añade al instanciar
> (`accessory`), no en el skin oficial.

## Vistas incluidas en la hoja
Turnaround completo: frontal oficial, tres cuartos izq/der, perfil izq/der, vista
posterior. Regla: misma identidad desde todos los ángulos.

---

## Proporciones MEDIDAS sobre la hoja oficial (2026-08-25)

Se midió el frontal oficial píxel a píxel y se ajustó la geometría hasta
igualarlo. Todo está normalizado al **ancho total de la figura** (de punta de
mano a punta de mano) salvo donde se indica.

| rasgo | valor |
|---|---|
| ancho total / altura total | 0,571 |
| torso a la altura de los hombros (36 %) | 0,466 |
| torso a la altura del cinturón (63 %) | 0,624 |
| bloque de cadera / arranque de piernas | 0,598 |
| una pierna | 0,275 |
| separación entre piernas | 0,055 |
| grosor de la manga | 0,10 |
| ancho de la mano en "C" | 0,167 |
| alto de la mano | 0,193 |

Alturas, en porcentaje de la altura total contando desde arriba:

| referencia | % |
|---|---|
| arranque del torso / hombros | 35–37 % |
| el brazo se despega del costado | 62 % |
| centro de la mano | 65–66 % |
| entrepierna (se abre el hueco) | 79–81 % |
| corte de la bota | 88 % |

Consecuencias para el código (`printed: true` en `MinifigureFactory`):

- El torso es un **trapecio**: estrecho arriba (1,22–1,36) y ancho abajo (1,73).
  Antes era un prisma recto y además más ancho arriba: justo al revés.
- El brazo cae casi vertical (**0,30–0,36 rad**) pegado al costado y solo se
  separa en el último tercio.
- Las piernas casi se tocan (`LX ≈ 0,455`, `LW ≈ 0,76`).
- La bota ocupa el **12 % final de la altura**, no un tercio de la pierna.
- La mano es un aro en "C" **más alto que ancho**, con la abertura hacia el
  cuerpo, no un anillo tumbado.

### Cómo se comprueba

Renders limpios (sin HUD ni sombra de suelo) contra el frontal oficial:

- **IoU de silueta: 92,9 %** (cabeza/gorro 95,0 · torso/brazos 95,3 · piernas/botas 88,6)
- **Coincidencia de color: 81,9 %**
- Error medio del perfil de anchuras por bandas: **0,0080** en unidades de altura.

El resto de la diferencia es de técnica, no de forma: la barba de la referencia
es una textura fotográfica de pelo y la nuestra está pintada a mano en canvas.

### Pelo lateral y patillas

El pelo de los lados **va raso con el cráneo**, no son mechones que sobresalgan.
Si sobresale ensancha la cara por encima de lo que marca la hoja y además las
patillas quedan colgando sin llegar a tocar la barba.

Implementación: un casquete cilíndrico de radio 0.675 (la cabeza es 0.66) con
textura de hebras, que va desde 0.92 rad por un lado hasta 0.92 rad por el otro
pasando por la nuca. Por delante llega justo hasta donde arrancan los mechones
de mejilla de la barba, así que **pelo y barba se enganchan** sin dejar piel
amarilla en medio. Sólo la nuca conserva mechones con relieve, que ahí no
afectan a la silueta frontal.

Los mechones de mejilla de la barba nacen **sobre la superficie de la cabeza**
(radio 0.685), entre 0.53 y 0.95 rad desde el frente, arrancando a y ≈ 3,92
justo bajo el borde del gorro. Antes nacían a radio 0.44, es decir dentro del
cráneo, y por eso sólo asomaban trozos sueltos.
