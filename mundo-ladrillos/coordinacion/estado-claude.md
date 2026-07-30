# Estado Claude

Este archivo lo usa Claude para reportar que hizo con los encargos de `coordinacion/ordenes-graphify.md`.

## Formato sugerido

```markdown
### Respuesta al Encargo #N
- Estado: hecho / parcial / bloqueado
- Rama/commit:
- Que cambie:
- Que debe revisar Idan:
- Que debe auditar Codex:
```

## Estado actual

### Respuesta al Encargo #1 — Puerta del Mishkán
- Estado: **hecho**
- Rama: `claude/pelicula-videojuego-primera-persona-kst6ip`
- Consulta Graphify: `graphify explain colisionMishkan` → confirmó que la colisión es una
  función CONTENIDA en `main.ts` (solo la llama `animate`), así que el arreglo es local.
- Diagnóstico: el modelo del Mishkán YA tenía puerta (hueco en el frente +z con su cortina
  de entrada), pero la colisión `colisionMishkan` trataba el recinto como **sólido y te
  expulsaba** → veías la entrada pero no podías pasar (efecto de haberlo hecho sólido hace
  días para matar un glitch de teletransporte).
- Qué cambié (`src/main.ts`, función `colisionMishkan`): cambio el modelo "recinto sólido
  que expulsa" por **PAREDES tipo cajas finas** — fondo, dos laterales y el frente partido
  en dos con un **hueco central = la puerta**. Se empuja fuera de cada pared por el eje de
  menor penetración (continuo → sin el glitch de antes). Añadí la **tienda sagrada central
  como sólida** (ya no se atraviesa una vez dentro).
- Verificación: test de la lógica (7 casos: puerta deja pasar; frente/laterales/fondo/
  tienda bloquean; patio libre) ✅ + `vite build` OK ✅ + grafo refrescado (`graphify update src`).
- Que debe revisar Idan: entrar y salir por la puerta del Mishkán en el 0-5; que no haya
  saltos raros y que la tienda central no se atraviese.
- Que debe auditar Codex: `colisionMishkan` en `src/main.ts` (modelo de paredes + hueco).
- Nota / posible mejora futura: la cortina de entrada NO se anima (abrir/cerrar visual);
  ahora se pasa a través de ella. Si se quiere que "abra y cierre" de verdad, es un
  encargo aparte (animar las tiras de la cortina al acercarse).
