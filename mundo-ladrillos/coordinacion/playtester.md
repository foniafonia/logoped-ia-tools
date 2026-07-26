# 🧒 JUGADOR SINTÉTICO / QA de niño (rol reutilizable por todos los hilos)

**Qué es:** un arnés que **juega un tramo de verdad** (mueve al personaje hacia los
objetivos, hace los mini-juegos) y mide si **se entiende**, si **se completa**,
cuánto **tarda/se atasca** cada tarea y qué **errores** hay. Luego un humano/agente
con visión escribe la **opinión "en voz de niño 6-8" + hallazgos de UX** a partir de
las capturas y las métricas.

**Qué mide bien:** claridad de la guía, **ritmo**, longitud de tareas,
completabilidad, errores de runtime. **Qué NO:** no replica motricidad/despiste de un
niño real (navega con ayuda interna); es un **proxy**, no sustituye test con niños.

## Cómo montarlo en tu tramo
1. Expón en tu `main.ts` dos hooks aditivos (ver el 0-5 como referencia):
   - `window.__probe()` → `{ beat, fase, pos, goal:[x,z]|null, stars, done, contadores }`
     (`goal` = a dónde iría ahora un jugador guiado: coleccionable/objetivo más útil).
   - `window.__walk(x,z,step)` → mueve al jugador un paso hacia (x,z) (anda, no teleporta).
2. Arnés Playwright headless: salta beats con `__director.start(t,beat)`, lee `__probe`,
   anda con `__walk` hacia `goal`, captura por tarea y guarda `pt_log.json`.
   Referencia: arnés del 0-5 (LEAD). Pídemelo y te paso el script adaptado.

## 📋 Run #1 — tramo 0-5 (2026-07-26, LEAD)
Jugado entero por el sintético. Estrellas finales: **3/5**. 0 crashes.

| Tarea | ¿Completó? | Tiempo | Nota |
|---|---|---|---|
| Saludar a Yehoshúa | ❌ | (se saltó) | el objetivo cambió a "cuerdas" antes de llegar |
| Recoger cuerdas + arrear ovejas | ✅ | 46 s · 2⭐ | limpio, ovejas 3/3 |
| **Atrapar el pan** (mini-juego nuevo) | ✅ | 47 s · 5/5 | ✨ funcionó de un tirón, claro y divertido |
| Cargar el camello | ❌ | 3/6 en 72 s | **tostón**: 6 bultos por todo el campo, ida y vuelta |
| Seguir la caravana | ❌ | — | dominó: no acabó el camello, siguió en "llevar bulto" |

### Hallazgos (prioridad)
1. **🔴 El saludo a Yehoshúa se pierde.** Sólo hay **10 s** (t45→t55) entre "Ve con
   Yehoshúa" y que el objetivo salte a "Recoge las cuerdas". Un peque que se entretiene
   10 s (lo normal) ve cambiar la guía y **se salta el saludo sin enterarse**.
   *Fix:* que el saludo siga siendo objetivo/baliza **hasta hacerlo** aunque empiecen
   las cuerdas, o ampliar la ventana.
2. **🟠 Cargar el camello aburre (slog).** 6 bultos repartidos por TODO el campamento,
   uno a uno = ~24 s por bulto. Demasiado largo/repetitivo para 6-8 años.
   *Fix:* bajar a 3-4 bultos y **acercarlos** a la zona del camello (o permitir varios).
3. **🟢 Bien:** cuerdas+ovejas y **atrapar el pan** se completan rápido y claros
   siguiendo las flechas-pista. El mini-juego del pan es un acierto.
4. **QA técnico:** 0 errores graves; 1 aviso 404 (recurso menor, revisar; benigno).

*Método: `__probe`/`__walk` + Chromium swiftshader headless. Reproducible.*
