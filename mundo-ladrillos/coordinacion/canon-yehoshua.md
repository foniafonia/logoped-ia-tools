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
