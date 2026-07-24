# 🎯 BRIEF VISUAL — LEAD → MUÑEQUERO · carencias vs. película

**De:** LEAD (rama `claude/pelicula-videojuego-primera-persona-kst6ip`)
**Para:** MUÑEQUERO (rama `claude/munecos-ifepfa`)
**Fecha:** 2026-07-24

## Por qué este brief
Hemos montado una comparativa **"De la película al juego"** (fotograma real ↔ misma
escena hecha juego, 10 escenas). Al verlas lado a lado se ve **clarísimo el salto que
falta** en los muñecos: en el campamento, en Yehoshúa y en el gentío en general. Esto
NO es una queja — el nivel que hiciste con la **alfombra/kilim es brutal** y demuestra
que puedes llegar. Es aplicar ESE mismo mimo a las **figuras**. El norte es la peli.

> Pídele al usuario que te enseñe el documento **"De la película al juego"** y los
> fotogramas; ahí se ve el objetivo de un vistazo. Referencias abajo como
> `peli seg X-Y @Ns` (segmento de la peli + segundo dentro del segmento).

## Estado actual (para no pedir a ciegas)
`MinifigureSkin` hoy = colores sólidos por pieza + `headStyle: turban|hood|ninja` +
`beard` (color) + `straps`. Las caras se dibujan (ojos/cejas/boca) pero **casi iguales
para todos**. Material: `MeshPhysicalMaterial` con clearcoat (bien) pero **sin tetones
ni estampados** (torsos de color plano). Solo 3 skins canónicos (Yehoshúa + 2 espías);
el resto (aldeanos, guardia, rabino, Rahab…) está disperso en archivos de escena → sería
oro consolidarlos en `CHARACTER_SKINS`.

---

## CARENCIAS por prioridad

### 🔴 P0 — Yehoshúa (es el héroe, sale en todas)
`peli seg 0-5 @48s y @96s`, `seg 15-20 @156s`.
- **Peli:** turbante de **tela con pliegues** y caída lateral; **barba blanca larga y
  tupida** (pieza, no un color); túnica azul con **estampado** (cuello + banda/fajín);
  **manto/capa**; cayado tallado.
- **Juego:** figura azul lisa, casquete-cúpula, "barba" = color plano, torso liso.
- **Falta:** pieza de **turbante envuelto**, **barba geométrica** blanca prominente,
  **print de torso** (cuello + banda diagonal), **manto** de tela, cayado más largo.
- **Aceptación:** si un peque pone tu Yehoshúa al lado del fotograma, debe decir
  *"¡ese es el de la peli!"*.

### 🔴 P0 — Caras con EXPRESIÓN
`peli`: guardia sorprendido `seg 5-10 @84s`, Yehoshúa serio `@96s`, Rahab amable.
- **Falta:** un set de **3–4 expresiones** reutilizables (serio, sorprendido, amable,
  alerta) + **bocas** variadas + **vello facial** dibujado por personaje. Hoy todos
  comparten casi la misma cara → rompe la ilusión en primer plano.

### 🟠 P1 — Torsos con estampado (print)
`peli`: túnicas con cuello y pliegues, fajines, coraza del guardia con placas.
- **Falta:** textura/print de torso (un canvas por skin) al menos para los **héroes**:
  Yehoshúa, Rahab, guardia, sacerdote, rabino. Sin esto, todos parecen "en pijama".

### 🟠 P1 — Tocados variados (romper la clonación del gentío)
`peli`: turbantes envueltos (varios), cascos con **cresta y carrillera**, pelo, cofia
de Rahab. **Juego:** casi todo el campamento lleva el **mismo casquete claro** (se ve
larguísimo en la panorámica).
- **Falta:** 3–4 tocados distintos (turbante de tela, casco con cresta, pelo/melena,
  pañuelo) para variar la multitud.

### 🟠 P1 — Variedad de piel/barba en multitud (versión "lite")
- **Falta:** 2–3 tonos de piel + set de barbas en la versión **lite instanciada**
  (multitudes), para que el gentío no parezca clones amarillos idénticos. Barato: basta
  variar material/decal, no geometría.

### 🟡 P2 — Mantos/faldón de tela
Ancianos, sacerdotes y Rahab llevan **túnica larga con caída**. Hoy se ven las piernas
rígidas. Añadir un **faldón/manto opcional** en el skin (para no-combatientes/ancianos).

### 🟡 P2 — Tetones (studs) SOLO en héroes
La peli lee "ladrillo" por los **tetones**. Nuestras piezas no los tienen. Valorar un
tetón sutil en cabeza/hombros **solo para héroes** (caro en polys → NUNCA en la lite).
Coordínalo conmigo antes (afecta rendimiento).

---

## Personajes clave a subir de nivel (los que salen en la comparativa)
- **Guardia** `seg 5-10 @72s`: túnica **a rayas rojo/crema**, casco con carrillera,
  **escudo redondo**, alabarda + **farol**.
- **Rahab** `seg 5-10 @132s` y balcón `seg 15-20 @86s`: vestido claro con cinturón,
  **melena clara**, cara amable.
- **Espías** `seg 5-10 @156s`: vais bien (ninja simpático), falta **print del traje** y
  diferenciar mejor a los dos.
- **Rabino/Director** `seg 0-5 @12s`: en el marco "estudio" va de **traje moderno +
  claqueta** (si se usa ese gag).
- **Sacerdotes del shofar** `seg 10-15 @156s` y el **Arca** `@204s`: túnica blanca,
  **shofar (cuerno) en la mano**, y el Arca a hombros.

## Animales (si son tuyos; si no, dilo)
Camellos con **montura + carga** y textura de pelo (`seg 0-5 @72s/@108s`); ovejas más
lanudas. La peli los borda.

---

## Lo que NO es tuyo (lo asume LEAD — para que no nos solapemos)
Entorno del campamento: **suelo** (hoy blanco liso → dunas + color arena), **tiendas**
(conos lisos → tela con vientos y patrón), **iluminación** (plana → dorada con sombras +
niebla), densidad de props. Eso lo llevo yo; tú, las **figuras**.

## Criterio de "listo para entregar"
Coge a **Yehoshúa** y ponlo al lado de `peli seg 0-5 @48s`. Si se **reconoce la misma
figura**, vamos bien. Repetir con guardia y Rahab. El objetivo no es fotorrealismo: es
que el peque diga *"¡son los de la peli!"*.

> Cuando tengas una tanda, deja capturas en tu archivo y avísame por el tablón; el LEAD
> las integra. Cualquier duda de dirección → pregunta al usuario (regla del TIMBRE).
