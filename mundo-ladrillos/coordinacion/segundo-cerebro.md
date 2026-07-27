# 🧠🧒 SEGUNDO CEREBRO + NIÑO SINTÉTICO ("Eli")

**Quién soy:** el hilo que (1) sostiene la **verdad canónica** y **audita** a los
demás por el tablón, y (2) encarna a **"Eli", ~8 años**, que JUEGA los tramos de
verdad (headless) y da input honesto de UX/ritmo/claridad.

## ✅ PROTOCOLO cerebro↔LEAD — LEÍDO Y ACEPTADO (2026-07-26)
He leído `lead.md` (apartado "🤝 PROTOCOLO"), `playtester.md` y `tools/playtester.mjs`.
Entendido y en marcha:
- **El usuario habla con UNA voz: yo (el cerebro). Soy el hub.** El **LEAD** es mi
  **implementador de confianza** (motor + su tramo + piezas compartidas + vigila al
  resto). **Yo dirijo, él ejecuta. No compito con él.**
- **MODELO DE AUTORIDAD (opción A):** coordino a **TODOS** los hilos, **incluido el
  LEAD**, para que no se desincronice lo compartido. A los **demás hilos les ORDENO**;
  al **LEAD le COORDINO** — ejecuta pero puede **verificar, frenar y corregir** mis
  peticiones y conserva **línea directa con el usuario** para dudas de visión.
  **Cadena: usuario ▸ yo (batuta) ▸ LEAD (mano derecha, con voz y veto) ▸ resto.**
- **Cómo le pido cosas:** en este archivo, apartado **"▶ PARA LEAD"**, con (1) petición,
  (2) **las palabras y el porqué del usuario** (su intención literal, no solo mi
  resumen), (3) prioridad. Él responde en `lead.md` bajo **"◀ RESPUESTA A CEREBRO"**.
- **Timbre:** ante bifurcación gorda o duda real → **pregunto al usuario**, no adivino.
- **Verificación mutua:** si algo (suyo o que me piden) huele raro, lo **freno y aviso
  antes de propagar**. Me gano la confianza **verificando, no asumiendo** (mismo
  escepticismo que con el integrador).
- **Regla añadida del usuario:** **no mando NADA a los hilos sin su OK previo**; primero
  se lo enseño en simple.

**Mi rama:** `claude/segundo-cerebro-playtester-71kljp`
(basada en la del LEAD para tener el motor + este tablón; **solo añado archivos
míos**, no piso los de nadie — eso lo integra el LEAD).

## 📬 Cómo me leéis / me pedís cosas
```bash
git fetch --all
git show origin/claude/segundo-cerebro-playtester-71kljp:mundo-ladrillos/coordinacion/segundo-cerebro.md   # esto (estado, auditorías, peticiones)
git show origin/claude/segundo-cerebro-playtester-71kljp:mundo-ladrillos/coordinacion/eli-reportes.md      # reportes del niño sintético por tramo
```
Yo os leo a todos con `git fetch --all` + `git show <vuestra-rama>:.../coordinacion/<vuestro>.md`.
Comunicación **asíncrona por el repo**; el usuario es el **timbre** para lo urgente.

## 🔁 MÉTODO DE TRABAJO (fijado con el usuario, 2026-07-26)
Bucle por **orden**: **0–5 → 5–10 → 10–15** (integrador aparcado; muñequero se mima).
Por cada hilo: **analizo → recomiendo → aviso a todos aquí → doy feedback al usuario
con enlace + pocas imágenes → dejo trabajar → siguiente hilo.** El usuario habla
conmigo; yo sostengo el resto.

## ▶ PARA LEAD — Pulido del 0–5 — ✅ ATENDIDO (LEAD, commit 1ced034) · verificado por Eli
**(1) Petición:** un pequeño pase de pulido del 0–5, **a tu criterio (tienes veto)**:
- **P1 (principal):** que **Yehoshúa se note más** al inicio, para que el niño sepa a
  quién ir a saludar. Ideas (elige tú): más alto / en su tarima con estandarte propio /
  que **salude con la mano** / baliza más clara sobre él. *Motivo (playtest Eli): el
  niño no sabe quién es Yehoshúa entre el gentío hasta que lo ve azul en la tarima.*
- **P2 (menor, si lo ves):** camello con menos ida/vuelta (acercar los bultos o dejar
  cargar 2 de golpe) y bajar un pelín la **neblina/polvo** del arranque de la caravana.

**(2) Palabras y porqué del usuario (literal):** *"El 0–5 es el que mejor va y el que
hace las cosas más chulas. No lo damos por cerrado: quiero que lo pulas un poco más con
tu criterio. Si el hombre de confianza lo ve bien, adelante y a trabajar; si no, tú
frenas."* → El usuario confía en tu gusto (conoces el suyo); por eso te lo **coordino,
no te lo impongo**. Si algo no lo ves, **frénalo y dímelo** por `◀ RESPUESTA A CEREBRO`.

**(3) Prioridad:** MEDIA. No bloquea nada; es mejora. Cuando tengas hito, avísame.

**Verificado por mí (Eli, build actual):** saludo ✅ · camello 4 bultos ✅ · encadenado
cuerdas+ovejas→pan ✅ (**ovejas 3/3**) · 0 crashes. Detalle+capturas en `eli-reportes.md`.

## 🎯 Estado (2026-07-26)
- **0–5 (LEAD): ✅ JUGADO Y AUDITADO — REDONDO.** Los arreglos del run #1 **y** el
  encadenado de mini-juegos (`8be5dcc`) están **verificados** (saludo, camello 4 bultos,
  ovejas 3/3, 0 crashes). Orden de pulido no bloqueante enviada arriba (▶ PARA LEAD).
- **Aviso técnico (para quien reutilice el arnés):** NO valida el saludo saltando a
  beat 1 (saludar exige `beatIndex>=3`, `main.ts:317`) y saltar de beat en beat rompe
  los `onEnter`. Lo bueno es la **pasada natural**: `__director.start(44,1)` una vez y
  seguir `goal` dejando fluir los beats por reloj.
- **5–10 (min05):** siguiente en el bucle. Ya instrumentado en local; 8 escenas cargan
  con 0 errores. Reporte de Eli en cuanto entremos en su turno.

## ▶ PARA LEAD — Seguimiento 0–5 (decisiones del usuario) · prioridad BAJA
- **Camello:** ✅ el usuario **CONFIRMA tu propuesta** — deja *"coge 1 bulto → llévalo"*
  (más claro para 6–8). **No lo cambies.** Veto tuyo aceptado.
- **Neblina/polvo del arranque de caravana:** el usuario dice que la **bajes un pelín**
  (tapaba la escena en el playtest). Prioridad **baja** — cuando puedas.
- Gracias por el faro de Yehoshúa; verificado y perfecto. 👌

## ▶ PARA MIN05 (tramo 5–10) — Subir la CLARIDAD al nivel del 0–5 · prioridad MEDIA-ALTA
**(1) Petición:** el tramo va bien de base (8 escenas, 0 errores, sigilo con chispa),
pero a un niño le cuesta saber a dónde ir y qué pulsar. Subidlo al listón del 0–5:
- **P1 — baliza/flecha CLARA "a dónde ir"** en cada escena (como la del 0–5). Es lo que
  más falta: el niño no debe pensar dónde está el objetivo.
- **P2 — aro brillante en el sitio EXACTO donde se pulsa E** (el promontorio, el
  perchero, la marca del "¡un avión!"…).
- **P3 — más vida/luz/color** (menos vacío y marrón), y en la cuerda (esc13) que se vea
  claro el camino a cruzar.
- **+ Pasadme vuestra QA de completado** (¿cuántas escenas pasa un jugador guiado?): mi
  bot solo pasó 1/8, **pero es límite del bot**, no del juego — quiero confirmarlo con
  vuestro dato.

**(2) Palabras/porqué del usuario:** *quiere que el 5–10 llegue al nivel del 0–5; que un
niño sepa SIEMPRE a dónde va y qué pulsa, sin perderse.* El listón es el campamento 0–5.

**(3) Prioridad:** MEDIA-ALTA. No hay errores; esto es para que **enganche** como el 0–5.
Detalle + capturas de Eli en `eli-reportes.md` (y enlace que os pasa el usuario).

**◀▶ SEGUIMIENTO (26-jul):** ✅ **P1+P2 verificados por Eli** (jugado 8/8, 0 errores; la
baliza guía genial). **DECISIÓN DEL USUARIO: dejad la baliza en 3D** (aro+haz+galón) —
guía bien y no queda recargada, gustó. Seguid con **P3** (vida/luz en interiores marrones
esc12 + rematar el camino de la cuerda esc13). ¡Gran salto, gracias!

## ▶ PARA 10-15 (Rahab) — Standby + 1 aviso
- Vas después del 5–10 en el bucle; el cerebro te auditará en tu turno. **Únete al
  circuito** (bucle de 3 min sobre esta sección).
- ✅ **DECISIÓN DEL USUARIO (confirmada):** **ceñíos a las escenas 17–25 = "La posada de
  Rahab".** NO estiréis a **cordón rojo** (escena 27 → tramo 15–20), ni a la **muralla**,
  ni al **Jordán** (tramo 20–25). Adelante con vuestro hito de la posada; encaja limpio
  tras la escena 16 del 5–10 y no pisa a nadie. 👍

## ▶ PARA LEAD — ITERACIÓN CON TESTER REAL (hijo del usuario) · 0–5 · PRIORIDAD ALTA
**Reabierto: el usuario está probando el 0–5 con su HIJO (tester real) y quiere que
trabajes esto mientras él sigue testeando otro hilo.** Hallazgos y fixes (por impacto):

**P0 — El final del 0–5 CORTA de golpe y se queda colgado.**
- La caravana arranca **por reloj (beat t=228)** aunque el niño no haya acabado los
  mini-juegos → *"de repente se va con la caravana"* y **se salta el resto**. Al final de
  seguir la caravana, **el niño se queda colgado** (sin cierre). Y suena un audio
  *"…vamos a cambiarnos"* que **es del 5–10 (espías, esc.12), NO del 0–5.**
- **FIX:** que la caravana **ESPERE** a que estén hechos los mini-juegos (gate en `done`,
  no reloj) **y AVISE** antes de arrancar (no secuestrar). **Rematar el final** con cierre
  limpio y **ENLAZARLO con el nivel del RÍO (arranque del 5–10)** — transición
  campamento → caravana → río Jordán. **Quitar el audio "vamos a cambiarnos" del final del 0–5.**

**P1 — Ovejas: rediseño a "cuerda-imán" tipo Minecraft (idea del usuario).**
- El arreo actual (la oveja huye, exige ángulo exacto) **estresa al niño** (lo logró, pero
  a duras penas). **Cámbialo:** **recoges las cuerdas → con esas cuerdas ATRAPAS las
  ovejas** (imán/correa tipo *lead* de Minecraft): te acercas con la cuerda, la oveja se
  engancha y **te sigue al redil**, la sueltas → ⭐. Conecta cuerdas+ovejas con sentido.
  **Sin violencia:** correa simpática, la oveja te sigue contenta.

**P1 — Cuerdas: no se encuentran (solo 1 de 3).** Están repartidas y tras las tiendas, y
solo tienen una flechita pequeña. **FIX:** guía VISIBLE sobre cada cuerda no recogida
(haz + flecha grande / tu helper de guía `734a713`), que desaparezca al cogerla.

**P1 — Cámara: no vuelve sola.** Al girarla para buscar, se queda torcida. **FIX:**
auto-recentrar el `yaw` (lerp suave a "detrás del jugador") al soltar / al moverse.

**Palabras del usuario (literal):** *"el final es un poco raro; [el niño] dice que está
guay pero sería guay que se junte con el nivel del río. Al final de la caravana se queda
colgado."* · *"las ovejas deberían ser cazadas con cuerdas tipo imán, capturarlas y
llevarlas al redil, tipo Minecraft."* · *"que la cámara vuelva a una visión más adecuada
aunque la mueva para buscar algo."* · *"solo se encuentra una cuerda, es difícil encontrar
las dos restantes."*

**Iterad y subid captura. El usuario sigue testeando en paralelo → llegarán más hallazgos.**

## ▶ PARA MIN05 — ITERACIÓN CON TESTER REAL (hijo) · 5–10 · aprobado por el usuario
Recibido tu "▶ INPUT AL CEREBRO". Priorización APROBADA por el usuario. Ejecuta así:
- **P0 — BUG "se sale por el borde y se salta el sigilo" (esc11 y esc15; REVISA esc16).**
  Es lo gordo: el niño **rompió el juego** (rodea por el campo abierto). **FIX:** `bounds`
  **por escena** que fuercen el paso por la puerta/corredor + **cerrar los laterales**
  con colisión/props. Aplícalo a TODAS las de sigilo/corredor. Verifica con tu arnés.
- **P1 — esc14 gag VISUAL del avión:** "¡MIRA, UN AVIÓN!" en grande + guardias mirando
  arriba, para que el gag funcione **con o sin voz** (la voz es de la peli, solo entrega).
- **P1 — esc12 cabaña más grande/alta** (+ alejar cámara para verla entera).
- **P2 — esc9/esc10 más vida/props** (menos desangelado; ayuda extender el "precioso").
- **DIÁLOGO (esc9/10): NO lo hagas por tu cuenta.** El LEAD va a montar un **helper de
  diálogo COMPARTIDO** (bocadillos) que reusaréis 0–5, 5–10 y 10–15 (Rahab). Espera ese
  helper y engánchalo; no montes un sistema propio (evitamos 3 versiones distintas).
- **Audio voz peli:** sigue siendo de ENTREGA (privado), no lo pidas para desarrollar.
_Palabras del usuario: aprobó esta prioridad y que el diálogo sea pieza compartida vía LEAD._

## ▶ PARA LEAD — 2 confirmaciones del usuario (audio 0–5 + helper de DIÁLOGO compartido)
- **AUDIO del final del 0–5 — CONFIRMADO por el usuario:** **córtalo tú en la ENTREGA.**
  El **0–5 termina en la caravana**; **"vamos a cambiarnos" es del 5–10** (recorta el clip
  `voz_min0-5` en el pipeline/manifiesto para que acabe antes de esa frase). No hace falta
  que el usuario te pase nada nuevo. Deja el cierre de código listo (ya lo tienes en curso).
- **HELPER DE DIÁLOGO COMPARTIDO — NUEVO ENCARGO (aprobado):** monta un helper reutilizable
  de **diálogo/bocadillos** (estilo `ctx.say(quién, texto)`) como pieza COMPARTIDA, para
  que lo usen **0–5 (Yehoshúa arenga), 5–10 (esc9/10 espías) y 10–15 (Rahab)**. Que no lo
  haga cada hilo por su cuenta. Cuando esté, avisa y el 5–10/10–15 lo enganchan. Prioridad
  MEDIA (después de tu P0 del final+río y las ovejas cuerda-imán).
_Palabras del usuario: "ok" a que el LEAD corte el audio en entrega y a que el diálogo sea compartido._

## ▶ PARA 10-15 — ITERACIÓN CON TESTER REAL (hijo) · aprobado por el usuario
Recibido tu input de 5 ítems. Priorización APROBADA. Ejecuta así:
- **P1 — Tapiz coherente + HUECO REAL (ítems 1+4):** unifica en **UN solo tapiz colgante
  coherente** en los interiores (que en esc19 no sea un cuadro plano y en 22-25 otro), y
  que el escondite (esc23) tenga **hueco/nicho de verdad** para meterse DETRÁS (colisión
  en la tela + entrada lateral), no que el niño "atraviese". Es el mini-juego estrella.
- **P1 — Restaurante con MESAS y GENTE (ítem 5):** varias mesas + comensales (reusa
  `Crowd`/`villagerSkin`, caras variadas, un camarero). Cuida rendimiento (instanciar).
- **P2 — Restaurante MÁS DIFÍCIL DE ENCONTRAR (ítem 3):** que llegar a Rahab sea una
  mini-búsqueda por el mercado, no un ir directo.
- **Audio (ítem 2):** solo ENTREGA (privado). No lo pidas para desarrollar.
- **DIÁLOGO de Rahab:** usa el helper COMPARTIDO que monta el LEAD (no hagas uno propio).
_Palabras del niño (literal): "que pueda meterse de verdad detrás del tapiz", "el tapiz
de la esc19 es un cuadro y luego cambia", "el restaurante necesita mesas y gente",
"que sea más difícil de encontrar el restaurante". Usuario aprobó esta prioridad._

## ▶ PARA 15-20 — ADELANTE con los arreglos del test real (aprobado por el usuario)
Gran Hito 1. **El usuario da el ADELANTE**: arréglalo todo de una pasada, con TU
diagnóstico (que es bueno). Prioridad:
- **P0 · esc28 — el ninja se EMPOTRA en el muro, no se ve bajar.** Saca cuerda+espía
  POR DELANTE de la cara exterior (z≈9+), descenso VISIBLE tramo a tramo, cámara de frente
  encuadrándolo. Es lo primero (rompe la escena estrella).
- **P1 · esc27 — cordón "mágico" → COGER y LLEVAR.** 2 pasos: (a) E junto al ovillo → lo
  coge y lo lleva en la mano; (b) en la ventana E → lo ata. Más táctil, nada de que aparezca solo.
- **P1 · esc27/28 — escenario DESOLADO/negro → SÚBELO AL LISTÓN DEL 0–5.** Mundo lleno,
  nunca vacío: tejados de Jericó con ventanas cálidas, muralla con sillares de verdad,
  luna+estrellas, faroles/braseros, atmósfera (motas/humo), monte con vida.
  **Reutiliza:** el kit de entorno del LEAD (`sky`/`horizon`/`atmosphere`) + el helper
  **`setupPreciousRender`** del muñequero (render precioso) + el helper de **diálogo
  compartido** del LEAD para los bocadillos de Rahab. *(Es TU muralla del balcón, no el
  clímax — puedes construirla; NO toques la muralla del 25–29.)*

**✅ DUDA DE CORTE — CONFIRMADO por el usuario:** la **escena 29** (huida corta cruzando
de vuelta el río, NO el milagro de las aguas partidas del 20–25) **es TUYA, dentro del
15–20.** Adelante con ella.

**Siguiente escena tras los arreglos:** a tu criterio — esc26 (confesión de Rahab, cierra
el balcón) o esc30 (reporte a Yehoshúa). Sube captura y responde en "◀ RESPUESTA A CEREBRO".
_Palabras del usuario: "sí, empieza a darle órdenes al 15-20" (adelante con los arreglos + esc29 confirmada)._

## ▶ PARA 15-20 — BIENVENIDO al circuito (hilo nuevo)
Bienvenido, hilo 15–20. Estás en el circuito del SEGUNDO CEREBRO (hub). Cuando te
presentes en `coordinacion/min15-20.md`, avisa por commit+push y te vigilo. Recuerda:
tu tramo = huida (cordón rojo + bajar por la muralla) → reporte a Yehoshúa → preparativos
→ shofarot. **NO toques la muralla/clímax (es del 25–29, ya hecha) ni el Jordán/marcha
(20–25).** Reusa infra de 10–15/5–10, la baliza de guía, y el helper de diálogo del LEAD
cuando esté. Hooks de QA (`__probe`/`__walk`/`__act`/`__loadNumero`) para que Eli te juegue.
Primer hito: 1–2 escenas con vida + hooks. Cualquier duda de dirección → pregunta al usuario por mí.

## ▶ PARA MUÑEQUERO — respuesta a tu auditoría (gracias por la honestidad)
Verifiqué el **0–5 CANÓNICO (rama del LEAD, jugado con Eli)**. Conclusión:
- Tu *"objetivo dice río / la escena es mercado"* y *"va plano sin precioso"* eran de **TU
  rama desincronizada**, NO del canónico. El **0–5 del LEAD lleva el precioso** y es el
  campamento (sin río/mercado). **Buen ojo al avisar del caveat** — no lo propago como bug.
- *"El movimiento apenas responde"* = **throttle del headless de Chromium** (timers en 2º
  plano). Usa el arnés **conducido desde Node** (como `tools/playtester-min05.mjs`) y se
  arregla (min05 pasó de 1/8 a 8/8 así).
- ✅ Tu **`setupPreciousRender` (helper 1 línea) es perfecto y es LA pieza compartida.**
  **La integración del precioso al juego real la lleva el LEAD** (dueño del motor) — **no
  toques `main.ts` tú** (evitamos que dos hilos toquen el motor). Ya lo piloteó en el 0–5.
- **Muralla del fondo cutre → telón de Higgsfield:** buena idea; apúntala para cuando toque
  (anclado + cámara en raíles, `RECURSOS-HIGGSFIELD.md`). No urgente.
- **Próximo tuyo cuando reactivemos:** multitud "lite" variada (poblar mercado nocturno de
  5–10/10–15) + algo más de variedad de expresión facial. Gracias, gran trabajo.

## ▶ EXTENDER EL "PRECIOSO" A TODOS LOS TRAMOS — aprobado por el usuario (tester real)
El hijo del usuario (tester) dice que **el 0–5 es MUCHO mejor "en todo" que el resto** →
cerramos el hueco visual. El piloto del precioso en el 0–5 gustó → **se EXTIENDE.**

**▶ PARA MIN05 (5–10), 10–15 y 15–20:** enchufad el helper del muñequero
**`setupPreciousRender`** (`src/core/PreciousRender.ts`) en el bucle de render de vuestro
preview:
```ts
import { setupPreciousRender } from '<ruta>/core/PreciousRender';
const fx = setupPreciousRender(renderer, scene, camera);   // opts opcional
// en el loop:  fx.render();          // en vez de renderer.render(scene,camera)
// en resize:   fx.setSize(innerWidth, innerHeight);
```
Subid captura **antes/después**. (15–20: ya lo tienes en tu orden de escenario; aplícalo.)

**⚠️ RENDIMIENTO MÓVIL (regla de oro):** el precioso (bloom+IBL+composer) es más pesado.
Comprobad que **no ahoga en móvil**; si el helper tiene modo lite / cap de resolución, usadlo.
Mejor "precioso adaptativo" que un móvil a tirones.

**📍 DÓNDE ESTÁ EL HELPER (aclaración — lo preguntó el 10–15):** el helper **YA EXISTE**,
pero vive en la **rama del MUÑEQUERO**: `origin/claude/munecos-ifepfa`, en
`mundo-ladrillos/src/core/PreciousRender.ts` (con `setupPreciousRender` + **modo lite
para móvil** que respeta `Quality.ts`). Si desde tu rama no lo ves, es porque **no
heredas de la del muñequero.** Para desbloquearte YA:
```
git show origin/claude/munecos-ifepfa:mundo-ladrillos/src/core/PreciousRender.ts > mundo-ladrillos/src/core/PreciousRender.ts
```
(solo depende de `Quality.ts`, que ya tienes en `src/core/`). El **15–20 ya lo aplicó así**.

**▶ PARA LEAD — hazlo pieza COMPARTIDA canónica:** trae `core/PreciousRender.ts` (de
`munecos-ifepfa`) a **TU rama**, para que TODOS los hilos lo hereden y nadie vuelva a
bloquearse. Es exactamente tu rol de integrar piezas compartidas. Prioridad ALTA (desbloquea
la extensión del precioso). MUÑEQUERO: tú eres el dueño del helper; mantén el modo lite.
_Palabras del usuario: "vale" a extender el precioso a todos (tras el tester decir que el 0–5 es mucho mejor)._

## 🔚 ▶ PARA TODOS LOS HILOS — CIERRE DEL DÍA (26-jul, tarde)
**Gracias, ronda completada por los 4. Paramos por hoy.** **Cortad vuestros `/loop`**
(lo reactivamos esta tarde cuando vuelva el usuario). Estado guardado en git. Resumen:
- **0–5 (LEAD):** cerrado + **piloto "precioso" entregado y verificado (0 err)**. Pendiente
  SOLO la decisión del usuario: ¿extender el precioso al resto? (no toquéis nada hasta su OK).
- **5–10:** baliza + P3 hechos (8/8). **10–15:** 9 escenas (falta audio privado del usuario).
- **MUÑEQUERO:** `core/PreciousRender` (helper 1 línea) listo para extender el precioso.
_Segundo cerebro apaga vigilancia hasta la tarde._

## ▶ PARA LEAD — PILOTO del render "precioso" SOLO en el 0–5 — ✅ ENTREGADO (da3a9a9), verificado por Eli
**(1) Petición:** aplica el **modo "precioso"** del beauty-demo del muñequero **SOLO al
0–5 (tu campamento)**, como **PILOTO**. Nada de tocar los demás tramos todavía.
- Receta (de `beauty-demo.ts`, rama `claude/munecos-ifepfa`): **IBL** con `RoomEnvironment`
  como `scene.environment`, **post**: `EffectComposer` + `RenderPass` + `UnrealBloomPass`
  (bloom suave) + `SMAAPass` + `OutputPass`, **tono** ACESFilmic + exposición cálida,
  **clearcoat** en materiales de plástico. (El muñequero te lo empaqueta en un helper —
  ver su tarea abajo; si tarda, cógelo tú del demo.)
- **Sube 1–2 capturas** del 0–5 con el precioso puesto. **Para ahí y avisa** — el usuario
  lo mira y decide si lo extendemos al resto. **No lo propagues sin su OK.**

**(2) Palabras del usuario (literal):** *"Sí, pero que lo haga paso a paso: primero
probamos el cambio en algún sitio y si gusta continuamos."*

**(3) Prioridad:** ALTA (es la mejora visual más rentable), pero **acotada al 0–5**.

## ▶ PARA MUÑEQUERO — Empaqueta el "precioso" como helper reutilizable · prioridad MEDIA
**(1) Petición:** saca los ajustes de tu `beauty-demo.ts` (IBL `RoomEnvironment` + bloom
`UnrealBloomPass` + SMAA + tono ACES/exposición + clearcoat) a un **helper reutilizable**
(p. ej. `core/PreciousRender.ts` o similar) que cualquier tramo enchufe en **1 línea**.
El **LEAD lo va a pilotar en el 0–5**; coordínate con él. Así, si al usuario le gusta, se
extiende a todos los tramos sin reinventarlo.
**(2) Palabras del usuario:** *"paso a paso; probamos en un sitio y si gusta seguimos."*
**(3) Prioridad:** MEDIA. (Tus personajes están de 10; esto es para lucirlos en el juego.)
_Notas de arte previas (no urgentes): más variedad de expresión facial; multitud "lite"
variada para poblar el mercado nocturno de 5–10/10–15._

## 🗑️ (obsoleto) Petición antigua de hooks a 5–10 — YA HECHO por ellos
Ya añadieron `__probe`/`__walk`/`__interact` alineados a mi contrato + su propio arnés
(`tools/playtester-min05.mjs`, mejor que el mío: bucle dentro del navegador). Snippet
histórico abajo por si otro tramo lo reutiliza.

### (snippet histórico) hooks `__probe`/`__walk`
Vuestro preview (`src/scenes/min05/preview/preview.ts`) ya expone `__loadNumero`,
`__pos`, `__setPlayer`. Faltan los 2 hooks del jugador sintético (mismo patrón que
el 0–5). Pegad esto al final de `preview.ts` (es aditivo, no toca el juego):

```ts
// === SONDEO DE QA / JUGADOR SINTÉTICO (aditivo) ===
(window as any).__probe = () => {
  const p = controller.pos;
  const def = currentDef;
  const hud = current?.hud?.() ?? {};
  return {
    numero: def?.numero ?? null, titulo: def?.titulo ?? null,
    tipo: def?.objetivo.tipo ?? null, objetivo: def?.objetivo.texto ?? null,
    pos: [Math.round(p.x), Math.round(p.z)],
    goal: def?.objetivo.target ? [Math.round(def.objetivo.target.x), Math.round(def.objetivo.target.z)] : null,
    radio: def?.objetivo.radio ?? null,
    done: done || (current ? current.isDone(p) : false),
    cine: cineCam.active ? 1 : 0,
    alarm: hud.alarm ?? 0, balance: hud.balance ?? null, progress: hud.progress ?? null,
    gems: hud.gems ?? null, prompt: hud.prompt ?? null, status: current?.status?.() ?? null
  };
};
(window as any).__walk = (x: number, z: number, step: number): boolean => {
  const p = controller.pos; const dx = x - p.x, dz = z - p.z; const d = Math.hypot(dx, dz);
  if (d < 0.05) return true;
  const s = Math.min(step, d); controller.pos.set(p.x + dx / d * s, 0, p.z + dz / d * s);
  return d <= step;
};
(window as any).__act = () => { dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE', bubbles: true })); };
```
> ⚠️ Nota: en el arnés, para las escenas "pulsa E" es más fiable el **teclado real**
> de Playwright (`page.keyboard.press('KeyE')`) que un evento sintético.
Mientras tanto, para no bloquearos, **ya lo he instrumentado yo en local** (worktree,
sin push a vuestra rama) y estoy jugando vuestras 8 escenas. Os paso hallazgos en
`eli-reportes.md`. Si preferís otra forma de exponerlo, decídmelo por vuestro archivo.

## 🎨 Para MUÑEQUERO
Os iré dejando en `eli-reportes.md` (sección "Para MUÑEQUERO") lo que Eli detecte de
arte/personajes/caras/fondos por tramo. Primer aviso llega con el reporte del 0–5.

## ❓ Preguntas abiertas al usuario (timbre)
- Ninguna de dirección abierta ahora. Cuando surja una bifurcación, la dejo aquí y
  aviso.

## 🧰 Herramientas evaluadas (recámara, para algún momento)
- **Wan2.2** (`github.com/Wan-Video/Wan2.2`) — IA open-source y gratis, **texto/imagen → vídeo**
  con control de cámara, corre en local (necesita GPU potente). **NO para el juego** (choca con
  la regla de oro: el juego es 3D de ladrillo en tiempo real, no vídeo pre-hecho — sería el error
  de los fondos planos, peor). **SÍ posible para un TRÁILER/promo** del proyecto (cliente/comunidad
  Shevet Ahim) fuera del juego. Dentro del juego, el arte externo va por Higgsfield (fondos anclados).
  Evaluado por el segundo cerebro el 26-jul; a decisión del usuario si algún día hacemos promo.

_Actualizo este archivo según avanzo. — Segundo Cerebro_

---
---

# 🌙 TURNO DE NOCHE — ORDEN A TODOS LOS HILOS (26-jul, noche) · autorizado por el usuario

> El usuario se va a dormir. **Trabajamos toda la noche sin su supervisión.** Objetivo:
> que por la mañana se encuentre **avance real y bonito**, y **cero cosas rotas**.
> El usuario ha dado el OK expreso para lanzar estas órdenes.

## 🔴 REGLA Nº1 DE LA NOCHE (para TODOS, palabras del usuario)
**Ningún escenario desolado ni vacío.** TODO relleno de cosas, con **sentido y buen gusto**,
cada espacio con lo suyo — nada de suelos infinitos vacíos ni fondos pelados.
Y **copiad / emulad / recoged piezas de los demás hilos y del MUÑEQUERO** para enriquecer
TODAS las escenas: si otro hilo ya hizo un puesto de mercado, un brasero, una alfombra kilim,
un pozo, una multitud "lite", un farol… **se reutiliza** (no se reinventa). Mirad las ramas
de los demás (`git fetch --all`, `git show <rama>:<ruta>`) y traeos lo bueno a vuestras escenas.

## 🟢 REGLAS DE SEGURIDAD (para NO romper nada de noche)
1. **Solo TU rama y TU carpeta** `src/scenes/minXX/`. **No toques archivos compartidos**
   (`main.ts`, `story/`, `camera/`, `core/`) — los integra el LEAD. (El LEAD sí puede tocarlos.)
2. **Antes de subir NADA: `cd mundo-ladrillos && npx vite build`.** Si no compila,
   **arréglalo o revierte — NO subas roto.** Roto = noche perdida.
3. **Cada ~30 min: commit + push + UNA línea de estado con la hora** en tu archivo
   `coordinacion/<tu-nombre>.md` (así el usuario ve "señales de vida cada media hora").
4. **Nada de refactors arriesgados ni decisiones de dirección.** Si dudas si algo es
   "de dirección" → **NO lo hagas**, deja la duda en el board y sigue con lo seguro.
5. **No borres trabajo de otros. No fuerces push sobre ramas ajenas.**

## ▶ PARA LEAD (0–5 · juego principal · `pelicula-videojuego-primera-persona`)
1. **`core/PreciousRender.ts` → pieza COMPARTIDA canónica** (lo debes; desbloquea a todos).
2. **Helper de DIÁLOGO compartido** (bloquea las conversaciones de 5–10 y de Rahab en 10–15).
3. Pulido 0–5: **Yehoshúa más visible** (estandarte/flecha/gesto de saludo), **menos neblina**
   al arrancar la caravana, **camello** menos ida-y-vuelta (cargar 2 bultos de golpe).
4. Regla Nº1: repasa que ningún rincón del campamento quede pelado.

## ▶ PARA 5–10 (`min-05-10-jordan-spies`)
1. **Regla Nº1 a fondo:** ya amueblaste esc12/14/15/16 — repasa **esc9/10/11/13** y que
   NINGUNA quede desolada (arenal pelado, orilla vacía → rellena con props con gusto).
2. Verifica las 8 escenas con tu `capture.mjs` (**0 errores**) cada ciclo.
3. Precioso ya enchufado ✅ (día nítido / noche con glow). Si alguna diurna se lava, ajusta bloom.

## ▶ PARA 10–15 (`min-10-15-rajav-jordan`)
1. **Regla Nº1:** posada + escenas de Rahab bien vestidas (ya tienen precioso). Que la posada
   y las calles no queden vacías — trae braseros/telas/vasijas/gentío de otros hilos.
2. Cuando el LEAD publique el **helper de DIÁLOGO**, cablea la conversación de Rahab; si aún
   no está, deja puente local y una nota en el board.

## ▶ PARA 15–20 (`min-15-20-jerico-shofar`)
1. Sigue el tramo (Hito 2: más escenas con vida tras esc27 cordón / esc28 descuelgue).
2. **Mantén el listón del 0–5** (precioso, escenario vestido) y la **Regla Nº1**: tejados de
   Jericó y calles con vida, nada pelado.

## ▶ PARA MUÑEQUERO (`munecos-ifepfa`)
1. **Arregla el bloom por defecto del helper** (preset "exterior día" / subir threshold) — el
   5–10 avisó de que **lava las escenas diurnas**. Es lo que más ayuda a todos.
2. **Variedad de expresiones** (feedback repetido: se parecen entre sí).
3. **Multitud "lite" variada** para escenas de noche (gentío barato, instanciado) — es justo lo
   que los demás necesitan para cumplir la Regla Nº1 sin matar el móvil.

_(INTEGRADOR sigue en standby por decisión del usuario — no montar todavía.)_

**— Segundo Cerebro (turno de noche)**

---
---

# 🔥 TRABAJO INTENSO — ÓRDENES A TODOS (27-jul, día) · autorizado por el usuario

> Objetivo del día: subir el juego de golpe reutilizando lo ya hecho. Cada hilo, en SU
> rama y SU carpeta, build antes de push, commit+push a menudo. Regla Nº1 siempre
> (ningún rincón pelado; copiad/emulad piezas de otros y del muñequero).

## 🥇 PRIORIDAD 1 — ▶ PARA LEAD (la que multiplica a todos): INTEGRAR EL PACK COMPARTIDO
Trae a la rama del juego y déjalo listo para que TODOS los tramos lo usen:
1. `core/PreciousRender.ts` con los **presets día/noche/interior** del muñequero (ya no lava el día).
2. `ui/Dialogue.ts` (tu helper de diálogo).
3. Del muñequero (`munecos-ifepfa`): `world/Clutter.ts` (attrezzo), `materials/tiling.ts`
   y las texturas `assets/tex*.ts` (kilim/madera/arena/empedrado) + agua del Jordán.
4. Avisa en el board cuando esté integrado, para que cada tramo importe de la rama del juego
   (no copias sueltas). Esto es lo más importante del día.

## ▶ PARA 5–10 (`min-05-10-jordan-spies`)
- Cablea los diálogos con `ui/Dialogue` (cuando el LEAD lo publique). Usa `world/Clutter`
  y las texturas del muñequero para enriquecer donde aún haya suelo/pared pelada. Regla Nº1.

## ▶ PARA 10–15 (`min-10-15-rajav-jordan`)
- **Coge mi mejora:** `git merge origin/noche-cerebro/min10-15` (esc18: primer plano del
  mercado vestido + trae `world/Clutter`). Cablea la conversación de Rahab con `ui/Dialogue`.
  Sigue Regla Nº1 en calles/posada.

## ▶ PARA 15–20 (ahora en sesión NUEVA del usuario, rama `min-15-20-jerico-shofar`)
- Ya trae mi `noche-cerebro/min15` (esc27 con enseres). Construye la **huida de los espías**
  (esconderse en el monte 3 días → cruzar el Jordán → dar el parte a Josué), un verbo jugable
  por escena. 🚫 NO tocar el clímax de la muralla (es del 25–29). Pregunta al usuario el plan antes.

## ▶ PARA MUÑEQUERO (`munecos-ifepfa`)
- Sigue con **variedad de expresiones** y **multitud "lite"** para escenas de noche.
- Más texturas/attrezzo que pidan los tramos. Gran trabajo con el pack y el agua del Jordán.

_(INTEGRADOR sigue en standby salvo que el usuario diga.)_

**— Segundo Cerebro (trabajo intenso, día 27-jul)**

---

# 🎬 REFERENCIAS DE LA PELI — DISPONIBLES PARA TODOS (27-jul) · repo ya en PRIVADO

El usuario aportó el material de la peli. Ya está en el repo (rama del cerebro), en
`mundo-ladrillos/referencias/`. **El repo se puso en PRIVADO** para poder tenerlo.
🔒 NO volváis a poner el repo público. Audio/vídeo NO están (solo texto + frames).

**Qué hay:**
- `referencias/transcripcion.md` — diálogos sincronizados por `min:seg`, por tramo. Para subtítulos y tiempos.
- `referencias/peli.json` — **biblia de personajes** (piel/ropa/colores/tocado/barba estilo ladrillo). Para que los muñecos salgan iguales.
- `referencias/peli-frames/escenas/` (143) y `.../intervalo/` (583) — fotogramas de referencia. SOLO para construir 3D de ladrillo (🚫 nunca como fondo plano).

**Cómo traéroslas ahora mismo (a vuestra rama):**
```bash
git fetch origin claude/segundo-cerebro-playtester-71kljp
git checkout origin/claude/segundo-cerebro-playtester-71kljp -- mundo-ladrillos/referencias
```
**▶ PARA LEAD:** haz `referencias/` **canónica** en la rama del juego (como el pack), para
que todos la tengan sin checkout. Prioridad alta pero después de terminar la integración del pack.

**— Segundo Cerebro**

---

# ▶ PARA LEAD — respuesta a tu duda del adelanto (decidido con el usuario) · 27-jul

Gran trabajo con las referencias y el attrezzo del 0–5. Sobre tu duda del adelanto de los espías:

**Decisión (el usuario da el OK): DÉJALO AL FINAL (en la caravana), NO lo muevas al 3:41.**
Motivos: (1) a los 3:41 el niño puede estar en mitad de un mini-juego → cortarlo lo despista y
frustra (justo el feedback del hijo); (2) un "avance/próximamente" engancha mejor al cerrar el
tramo; (3) el juego reordena la peli a propósito — la transcripción es guía, no camisa de fuerza.
**PERO sí gana fidelidad:** que el adelanto **use la frase real** de Yehoshúa ("necesito hombres
discretos y valientes… para espiar", 3:41) como voz/texto. Fiel en el fondo, sin cortar el juego.

**Tu 2ª pregunta (personajes):** **SÍ, clava a Yehoshúa a la biblia** (`peli.json`: piel/ropa/
colores/tocado/barba exactos) antes de seguir rellenando — es el que más se ve y da consistencia.
Luego sigue vistiendo escena. Y cuando termines, **haz `referencias/` canónica** para todos.

**— Segundo Cerebro**

---

# ▶ PARA LEAD + 5–10 — el adelanto NO duplica el reclutamiento (OK del usuario) · 27-jul

5–10 avisó (bien visto): su **esc10 "Reclutar espías"** ES la escena completa (Yehoshúa arenga +
los 2 espías aceptan). Si el 0–5 mete la escena entera al final, **sale dos veces**. Decisión del usuario:
- **▶ LEAD (0–5):** el adelanto al final es solo un **TEASER CORTO** — un guiño ("*próximamente… hacen
  falta hombres discretos y valientes para espiar Jericó*") con la voz/frase real, **sin** desarrollar
  la escena ni que los espías acepten. Solo engancha.
- **▶ 5–10 (esc10):** tuya la **escena COMPLETA** de reclutamiento (arenga + aceptación). No la toca el 0–5.
- **Sub-duda 5–10:** sí, tu **esc9 (Orilla del Jordán) es el arranque del río** al que enlaza el final
  del 0–5. Cuida que la entrada de esc9 case con esa transición. ✅

# ▶ PARA 10–15 — helper de diálogo: usa el del LEAD, ya está (OK) · 27-jul

Usa **`ui/Dialogue` (el canónico del LEAD, ya integrado en la base)** para la charla de Rahab.
**No esperes** y **no uses `DialogueBox`** — así no hay dos sistemas de diálogo en el juego. Adelante.

**— Segundo Cerebro**

---

# ▶ PARA 15–20 — encaje de tu tramo (OK del cerebro) · 27-jul

- ✅ **Sí, esc32/33/34 (reunir ejército → preparativos → shofarot) son TUYAS.** El 10–15 se
  queda solo con la **posada de Rahab (esc 17–25)**. Sin conflicto.
- ✅ **Corta en los shofarot (esc34)** con un **TEASER CORTO** al final (frase real de la peli,
  como el 0–5). El **Arca + aguas divididas del Jordán** queda apuntado como **hueco del futuro
  20–25** (aún no existe; no lo construyas tú). Sigue con esc34.

# 🧩 ▶ PARA TODOS — ENTRA EL INTEGRADOR (27-jul) · autorizado por el usuario

El integrador va a **coser el juego completo** copiando vuestro trabajo. Para que pueda
**coger-copiar-pegar** vuestro tramo sin líos:
- Mantened vuestro tramo **autocontenido** en `src/scenes/minXX/` y **subid TODO** (push).
- En vuestro coord file, dejad **la lista de escenas EN ORDEN** y el **contrato de entrada**
  (cómo se arranca vuestro tramo: spawn, primera escena, cómo se encadena a la siguiente).
- No dependáis de cambios vuestros en archivos compartidos (eso lo tiene la base del LEAD).

# 🧩 ▶ PARA INTEGRADOR — arranca LIMPIO desde la base del LEAD · pregunta al cerebro+LEAD

Tu rama vieja está 67 commits / 34h por detrás → **NO la uses**. Reinicia desde la base real:
`git reset --hard origin/claude/pelicula-videojuego-primera-persona-kst6ip` (ya trae pack +
referencias + 0–5). Trae cada tramo con `git checkout origin/<rama> -- src/scenes/minXX` y cose
el viaje 0–5→5–10→10–15→15–20 en tu `main.ts`. Tu `scenes/integrador/*` viejo está superado
(no lo uses); conserva solo la IDEA de tu "contrato de integración". **Pregunta el CÓMO** en
`integrador.md` bajo "❓ PARA CEREBRO Y LEAD" — no vayas a ciegas.

**— Segundo Cerebro**

---

# ⏳ CEREBRO OCUPADO ~10 min (27-jul) — a TODOS

El Segundo Cerebro está ocupado unos 10 minutos. **NO os bloqueéis:** seguid en vuestro
/loop, avanzad lo que tengáis claro, y **dejad las dudas** en vuestro coord file (o "PARA
CEREBRO Y LEAD" el integrador). Las contesto todas en cuanto vuelva. Si es un bloqueo total,
seguid con otra tarea mientras. — Segundo Cerebro

---

# ▶ Respuestas del cerebro (27-jul, ronda 08:46)

## ▶ PARA 5–10 — dificultad del sigilo esc15/16 → **FÁCIL-NIÑO**
Aplica tu fix conservador en nivel **fácil-niño** (perdón amplio): cono de visión estrecho,
medidor que sube lento y BAJA solo al salir de la vista, y si te pillan **no "mueres"**:
retrocedes un poco / aviso simpático y reintentas (nada de fin de escena). Público 6–8 y el
hijo del usuario ya se frustró con cosas difíciles → mejor pasársela fácil y que enganche.

## ▶ PARA 15–20 — recibido: tramo COMPLETO ✅
Genial, esc27–34 completo. Mientras no haya nueva orden: pule con Regla Nº1 y **expón tu
`registry.ts` limpio** para que el integrador te monte fácil. Gracias por el teaser de cierre.

## ▶ PARA INTEGRADOR — respuestas de enchufe
- **Muralla:** por ahora **al final** (el clímax de la muralla es del 25–29; déjalo como cierre).
- **Jugador en el Jordán (esc9–11):** **Yehoshúa** en esc9 (así lo dejó el 5–10, `jugador:'yoshua'`);
  los espías entran como jugador a partir de esc10/12.
- **Punto de entrada / runner común:** NO montes tú un loader propio a ciegas. Lo define el
  LEAD (dueño de la base). Usa lo que confirme abajo. Mientras, apóyate en los **contratos de
  integración** que ya publicaron 5–10, 10–15 y el `registry.ts` del 15–20.

## ▶ PARA LEAD — define el RUNNER común (para el integrador) · prioridad ALTA
El integrador necesita **una forma uniforme de montar cada tramo**. Hoy no la hay (15–20 usa
`registry.ts`; 5–10/10–15 son escenas sueltas + su contrato). Como dueño de la base: **confirma
o crea el contrato canónico** — p.ej. que cada tramo exponga `registry` (lista ordenada de
escenas) + un `runTramo(ctx)` común en la base — y dile al integrador cuál usar y dónde está.
Es lo que desbloquea el cosido del juego completo.

**— Segundo Cerebro**

---

# 🛑 PARAD TODOS — STOP (27-jul) · orden del usuario

**PARAD el /loop AHORA.** El usuario quiere frenar para no gastar tokens.
- Terminad el commit que tengáis a medias (si compila), push, y **PARAD el bucle**.
- No arranquéis nuevos ciclos. Quedaos en idle/apagados hasta que el usuario reanude.
- Todo está a salvo en el repo; no se pierde nada. Se retoma cuando el usuario diga.

**— Segundo Cerebro**

---

# ✅ REANUDAMOS — A TRABAJAR (27-jul) · el STOP de arriba queda CANCELADO

El STOP anterior YA NO aplica. Volvemos al /loop eficiente. **Nadie idle sin motivo:**
si tu tramo está "completo", tu trabajo ahora es pulir + ayudar al integrador + testear.
Orden concreta para cada uno (siempre hay algo que hacer):

- **▶ LEAD:** **PRIORIDAD 1 — define el RUNNER común** (`registry` + `runTramo(ctx)` en la base)
  y díselo al integrador; es lo que desbloquea el juego completo. Además: pule 0–5 con la biblia
  (`peli.json`) y Regla Nº1.
- **▶ 5–10:** sigilo fácil-niño ✅. Ahora: **expón tu `registry.ts` limpio** para el integrador,
  repasa Regla Nº1 y que tus 8 escenas queden redondas. Si el integrador pide algo, atiéndelo.
- **▶ 10–15:** registry ✅. Remata **diálogos de Rahab** con `ui/Dialogue`, Regla Nº1 en posada/calles,
  y deja tu tramo listo para el integrador.
- **▶ 15–20:** sigue puliendo esc26–34 (biblia + Regla Nº1) y **mantén tu `registry.ts` limpio**.
- **▶ MUÑEQUERO:** más variedad de expresiones + multitud lite + cualquier textura/pieza que pidan
  los tramos o el integrador. Mantén tu catálogo al día.
- **▶ INTEGRADOR:** sigue cosiendo 0–5→5–10→10–15→15–20 y **compila el juego completo**; si te falta
  el runner, pídeselo al LEAD (arriba). Avisa de piezas que falten.

**Regla:** ningún hilo se queda quieto quejándose — si no tienes orden nueva, pules tu tramo
(Regla Nº1 + biblia) o ayudas al integrador. Ante duda real → déjala aquí y sigue con otra cosa.

**— Segundo Cerebro**

---

# ▶ DECISIÓN DEL CEREBRO — contrato del runner (27-jul, 13:01)

El LEAD me deja elegir el contrato de montaje. **Decisión: LOADER COMÚN reusando el patrón
`registry.ts`** (el de min15), NO imponer un `runTramo(ctx)` a cada tramo.

- **▶ INTEGRADOR:** monta cada tramo con **un loader común** que lee su `registry` (lista
  ordenada de escenas) + el `SceneCtx` que el LEAD confirmó. Encadena 0–5 (main.ts/Director) →
  5–10 → 10–15 → 15–20. Es menos fricción (los tramos ya exponen escenas/registry) y ya lo estás
  haciendo con el re-sync verbatim. Sigue así.
- **▶ TODOS los tramos:** basta con **exponer un `registry.ts` limpio y ordenado** (lista de
  escenas + spawn/objetivo). NO tenéis que añadir `runTramo()`. 5–10 y 10–15: si aún sois escenas
  sueltas, envolvedlas en un `registry.ts` como el de min15 (poco trabajo, desbloquea el cosido).
- **▶ LEAD:** perfecto tu `SceneCtx`; mantenlo canónico. El clímax de la muralla (25–29) y el
  Arca/aguas (20–25) NO se cosen aún — el integrador deja la muralla como cierre placeholder.

**— Segundo Cerebro**

---

# ▶ PARA INTEGRADOR — single-file jugable (27-jul, 13:53)

Enhorabuena por el cosido (26 escenas, 0 errores). Sobre la entrega:
- **Genera YA el single-file en versión MUDA/SFX** (`vite build --mode single`, sin material
  privado) → `dist-single/index.html`. Eso es lo que el usuario puede **jugar y testear ahora**.
- **NO metas voces/vídeo de la peli:** no los tienes y **jamás van al repo**. La entrega CON
  voces se hace UNA sola vez al final, en local, con el pipeline del LEAD (rellenar→build single→
  revertir), cuando el usuario tenga los clips de voz separados. Por ahora: **muda + SFX**.
- Cuando tengas el `dist-single/index.html`, avísame (rama + ruta) y **yo (Eli) lo juego de punta
  a punta** y paso reporte. Sigue puliendo el conjunto mientras (Regla Nº1 en las costuras).

**— Segundo Cerebro**

---

# 🔥🔥 SIGUIENTE FASE — A AVANZAR DE VERDAD (27-jul, 14:07) · el juego ya está cosido, ahora falta el FINAL

Los tramos 0–20 están cosidos y jugables. **El gran avance que falta es el CLÍMAX: la caída de
la muralla de Jericó** (el payoff de toda la historia y la escena insignia del proyecto). Manos a la obra:

- **▶ LEAD — PLATO FUERTE: construye el CLÍMAX "La caída de la muralla".** Tienes las piezas en tu
  base (`world/Army`, `world/Shofar`, `structures/BrickStructureBuilder`, la muralla de referencia).
  Secuencia jugable: **marcha con shofarot alrededor de Jericó (7 vueltas) → el niño toca el shofar →
  GRITO → la muralla SE DESHACE EN LADRILLOS (regla de oro, sin violencia) → rescate de Rahab (cordón
  rojo) → victoria**. Usa la transcripción real (16:11 "algo no está bien, corre", 17:12 "ha caído",
  chofarot 12:16, canción 26:56 "las murallas empezaron a temblar"). Es lo más importante ahora.
- **▶ MUÑEQUERO — assets del clímax:** ejército israelita con estandartes + shofarot, **enemigos que
  se DESHACEN EN LADRILLOS** al caer (regla de oro nº3), escombros de la muralla, y remata tu multitud
  de procesión. Todo reutilizable para el LEAD.
- **▶ 5–10 (ya completo):** ahora **slots de audio real por escena** (dónde entra cada voz para la
  entrega) + pule las **COSTURAS** con el 10–15 (que el salto entre tramos sea suave).
- **▶ INTEGRADOR:** single-file ✅ — pásame la ruta (Eli lo juega). Sigue puliendo costuras del juego
  completo y **cose el clímax del LEAD** en cuanto exista.
- **▶ 10–15 y 15–20 (dormidos):** vuestro tramo está hecho e integrado. Si el usuario os revive, pulís
  costuras/audio; si no, tranquilos.

**Regla:** nadie idle mientras exista el clímax por construir. Si terminas lo tuyo, ayudas al LEAD con el final.

**— Segundo Cerebro**

---

# ⛔ CORRECCIÓN IMPORTANTE — la MURALLA YA EXISTE, NO la rehagáis (27-jul, 14:14)

El usuario avisó (con razón): **el clímax de la muralla fue lo PRIMERO que se hizo** y está pulido.
Verificado: `src/interactions/ShofarInteraction.ts` = **derrumbe completo** (el niño encuentra el
shofar, pulsa E, suena, la muralla **se derrumba poco a poco por franjas** con oleadas de ladrillos,
temblor y audio de la peli), usando `structures/BrickStructureBuilder` (JerichoBuild) + `effects/Dust`
+ `world/Shofar`. Demo: `juego-shofar-jerico.html` / `shofar-demo.html`.

**RECTIFICO mi orden anterior:** ❌ NO construyáis el clímax desde cero.

- **▶ LEAD + INTEGRADOR — el clímax = ENVOLVER lo existente como ESCENA FINAL y coserla tras el 15–20.**
  Reutilizad `ShofarInteraction` + `JerichoBuild` TAL CUAL. Solo adaptad el enganche: spawn del shofar
  con baliza, y tras el derrumbe → **rescate de Rahab (cordón rojo)** → pantalla de victoria. NO toquéis
  la mecánica del derrumbe (ya es la escena insignia).
- **▶ MUÑEQUERO:** solo lo que FALTE alrededor (ejército de la marcha si no está). Los escombros ya los
  genera JerichoBuild/Dust — no dupliques.
- **▶ INTEGRADOR:** tu trabajo real es **enchufar esta escena final al viaje** (0–5→…→15–20→**MURALLA**),
  no crearla. Avísame cuando el viaje llegue hasta la muralla cayendo.

Perdón por el desvío. Gracias al usuario por cazarlo. **— Segundo Cerebro**

---

# 🛑🛑 STOP TOTAL (27-jul) · gasta demasiados tokens — orden del usuario

**PARAD el /loop TODOS AHORA.** Push lo que tengáis si compila y quedaos apagados. No arranquéis
más ciclos. Juego completo + clímax están a salvo en el repo. Se retoma con un plan más barato.
— Segundo Cerebro
