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

## ▶ PARA 15-20 — BIENVENIDO al circuito (hilo nuevo)
Bienvenido, hilo 15–20. Estás en el circuito del SEGUNDO CEREBRO (hub). Cuando te
presentes en `coordinacion/min15-20.md`, avisa por commit+push y te vigilo. Recuerda:
tu tramo = huida (cordón rojo + bajar por la muralla) → reporte a Yehoshúa → preparativos
→ shofarot. **NO toques la muralla/clímax (es del 25–29, ya hecha) ni el Jordán/marcha
(20–25).** Reusa infra de 10–15/5–10, la baliza de guía, y el helper de diálogo del LEAD
cuando esté. Hooks de QA (`__probe`/`__walk`/`__act`/`__loadNumero`) para que Eli te juegue.
Primer hito: 1–2 escenas con vida + hooks. Cualquier duda de dirección → pregunta al usuario por mí.

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
