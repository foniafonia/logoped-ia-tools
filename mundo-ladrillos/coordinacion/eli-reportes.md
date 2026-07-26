# 🧒 REPORTES DE ELI (niño sintético ~8 años) — por tramo

> Método: arnés headless (Chromium swiftshader) que **juega de verdad** siguiendo la
> baliza `goal` del propio juego (`__probe`/`__walk`), deja fluir los beats por reloj
> y mide `pt_log.json` (completado, tiempos, estrellas, contadores, errores). La
> **voz de Eli** la pongo yo a partir de métricas + pocas capturas.
> **HONESTIDAD DEL MÉTODO:** el sintético (a) navega con ayuda interna (sabe dónde
> está todo) → mide **claridad / ritmo / longitud / completabilidad**, NO motricidad
> ni despiste de un niño real; (b) va **~4× más lento** que un niño (latencia del
> headless), así que los **segundos son orientativos e inflados**. No sustituye un
> test con niños reales.

---

## 📋 Run del SEGUNDO CEREBRO — Tramo 0–5 (LEAD) — 2026-07-26

**Verificación de los arreglos del run #1 (los pidió el usuario):**

| Arreglo del LEAD | ¿Verificado? | Evidencia |
|---|---|---|
| **Saludo a Yehoshúa** persistente + radio 5.5→9 | ✅ **ARREGLADO** | Ahora se completa solo, de forma natural (beat 4, +1⭐). En el run #1 se perdía; ya no. |
| **Camello** 6→4 bultos | ✅ confirmado (total=4) | Sigue siendo la tarea más larga (ida y vuelta); el sintético llegó a **3/4** antes de agotar el tiempo (inflado por su lentitud). |
| Estabilidad | ✅ | **0 crashes, 0 errores de consola** en toda la pasada. |

**Métricas de la pasada natural** (estrellas 4/5; pan 5/5; camello 3/4; **ovejas 0/3**):
- `yeh` (saludo) ✅ · `tab` (atrapar pan) ✅ 5/5 · `carav` (seguir caravana) ✅
- `camp` (cuerdas+ovejas) ❌ **se saltó (0/3)** — el beat del **pan** arrancó antes de
  que el sintético (lento) terminara las cuerdas. El propio juego lo avisa en la
  pantalla final: *"Te faltó: recoger el campamento"*. ⚠️ **A confirmar con niño real:**
  ¿un peque que se entretiene en el saludo pierde la ventana de las ovejas? (probable
  artefacto de la lentitud del sintético, pero huele a **ventana de ritmo apretada**).

### 🎮 REPORTE ELI (~8 años) — Tramo 0–5 — 2026-07-26
- **Qué creo que hay que hacer:** recojo el campamento, saludo al señor azul de la
  tarima, atrapo los panes que salen del horno y cargo al camello para irnos con la
  caravana. *Se entiende jugando, sí.*
- **¿Me enganché?:** sí — **atrapar el pan** es lo más divertido (claro y rápido, 5/5).
  Las estrellas y el confeti molan.
- **¿Entendí la historia solo mirando?:** casi. Se ve un campamento vivo que recoge y
  se pone en marcha. Lo que menos: **al principio no sé quién es "Yehoshúa"** entre
  tantos muñecos, hasta que veo al azul subido a la tarima.
- **Me confundió / frustró:** (1) ir hasta Yehoshúa se hace un poco largo desde el
  spawn; (2) **cargar el camello** es ida y vuelta con cada bulto (lo más pesado);
  (3) al arrancar la caravana hay **mucha neblina/polvo** que tapa la escena.
- **Lo más chulo:** el pan, las alfombras de kilim, el camello de ladrillo, la
  pantalla final que te dice qué te faltó y te deja reintentar.
- **Lo más aburrido/lioso:** cargar el camello (repetitivo) y no tener claro a quién
  saludar al principio.
- **Si fuera mío cambiaría (1-3):**
  1. Que **Yehoshúa "me llame"** (flecha/baliza más clara sobre él, o un "¡ven!") para
     saber a quién saludar sin buscarlo.
  2. Que la **ventana de cuerdas+ovejas no caduque** por el beat del pan (hacerla
     persistente como el saludo, o que el pan no empiece hasta terminar el campamento).
  3. **Camello:** acercar los bultos al camello o dejar cargar 2 de golpe (menos ida/vuelta).
- **Veredicto niño (0-10):** **8** · el mejor tramo, va fino y con vida.
- **Para MUÑEQUERO:** caras dibujadas y turbantes bien y variados; **Yehoshúa azul en
  la tarima se distingue** (👍). Sugerencia: que Yehoshúa **destaque aún más** (más
  alto / estandarte propio / gesto de saludo) para que el niño sepa a quién ir sin
  baliza. Kilims **preciosos** (se nota el listón). Nada urgente de arte en 0–5.

**Capturas** (pocas, MODO BARATO): campamento+saludo, atrapar-pan, caravana, pantalla
final. Enlace visual para el usuario aparte (Artifact).

**Para el LEAD:** enhorabuena, el saludo quedó arreglado y verificado. Las 3 mejoras
de arriba son de pulido de ritmo, no bloqueantes. La única que miraría con cariño es
la **ventana de cuerdas+ovejas** (mismo patrón "persistente" que ya aplicaste al saludo).

---

## 📋 Tramo 5–10 (min05) — PENDIENTE (siguiente en el orden)
Las 8 escenas **cargan con 0 errores de consola** y las mecánicas responden
(equilibrio y alarma registran). Reporte de Eli completo cuando lleguemos a este hilo
en el bucle (estoy afinando el arnés del preview: la tecla E de los objetivos "pulsa
E" hay que mandarla como tecla real, ya corregido).

_— Segundo Cerebro / Eli_
