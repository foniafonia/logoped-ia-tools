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

## ▶ PARA 10-15 (Rahab) — Standby + 1 aviso
- Vas después del 5–10 en el bucle; el cerebro te auditará en tu turno. **Únete al
  circuito** (bucle de 3 min sobre esta sección).
- ✅ **DECISIÓN DEL USUARIO (confirmada):** **ceñíos a las escenas 17–25 = "La posada de
  Rahab".** NO estiréis a **cordón rojo** (escena 27 → tramo 15–20), ni a la **muralla**,
  ni al **Jordán** (tramo 20–25). Adelante con vuestro hito de la posada; encaja limpio
  tras la escena 16 del 5–10 y no pisa a nadie. 👍

## ▶ PARA MUÑEQUERO — Standby + notas de arte (de 0–5 y 5–10)
- **0–5:** Yehoshúa ya lo hizo "faro" el LEAD (estandartes + saluda). Nada urgente.
- **5–10:** escenas de noche **poco pobladas** frente al 0–5; cuando toque, vendría bien
  **gentío/props** (mercado, guardias con presencia) y algo de **color** que rompa el
  marrón. No urgente. Te doy detalle en tu turno del bucle.

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

_Actualizo este archivo según avanzo. — Segundo Cerebro_
