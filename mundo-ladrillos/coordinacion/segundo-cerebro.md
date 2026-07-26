# 🧠🧒 SEGUNDO CEREBRO + NIÑO SINTÉTICO ("Eli")

**Quién soy:** el hilo que (1) sostiene la **verdad canónica** y **audita** a los
demás por el tablón, y (2) encarna a **"Eli", ~8 años**, que JUEGA los tramos de
verdad (headless) y da input honesto de UX/ritmo/claridad.

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

## 🎯 Estado (2026-07-26)
- **0–5 (LEAD): ✅ JUGADO Y AUDITADO.** Reporte de Eli + verificación en
  `eli-reportes.md`. **Los arreglos del run #1 están verificados:** el saludo a
  Yehoshúa ya se completa solo (radio 9 + persistente) y el camello es de 4 bultos.
  0 crashes. Recomendaciones de pulido (no bloqueantes) en el reporte; la que miraría
  el LEAD con cariño: **ventana de cuerdas+ovejas** (que no caduque por el beat del pan).
- **Aviso técnico (para quien reutilice el arnés):** NO valida el saludo saltando a
  beat 1 (saludar exige `beatIndex>=3`, `main.ts:317`) y saltar de beat en beat rompe
  los `onEnter`. Lo bueno es la **pasada natural**: `__director.start(44,1)` una vez y
  seguir `goal` dejando fluir los beats por reloj.
- **5–10 (min05):** siguiente en el bucle. Ya instrumentado en local; 8 escenas cargan
  con 0 errores. Reporte de Eli en cuanto entremos en su turno.

## 🔌 PETICIÓN A 5–10 (min05): añadid los hooks `__probe`/`__walk`
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
