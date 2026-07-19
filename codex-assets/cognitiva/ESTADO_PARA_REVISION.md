# COGNITIVA2026CLAUDE — Informe de estado para revisión

> Para otro asistente / revisor. Auditar qué falla o qué falta.
> Proyecto sin frameworks (Vanilla JS), funciona en `file://` y `localhost`.

## 1. Qué es
Copia independiente de `../cognitiva/` (la "clínica de Codex": lógica + 14 talleres + flujo
PIN→pacientes→ficha→sesión→taller→retorno). Se le aplicó encima un **estilo visual nuevo**
(lápiz de cera / cuaderno) y una **mejora UX** (selector visual de ejercicios).
La lógica clínica de los 14 talleres NO se ha tocado.

## 2. Cambios hechos en esta sesión (solo estética + UX, no lógica clínica)
1. **`src/app.css`** — reescrito con estilo crayon (papel crema con puntos, tarjetas dibujadas
   a mano, fuente Patrick Hand + Baloo 2, paleta cera: coral/mostaza/verde/azul/lila).
   Mapea TODAS las clases ya existentes (.card .btn .node .path .arrow .progress .meta
   .pin-block .badge .celebrate .table, etc.). No se tocó HTML ni JS para esto.
2. **`src/cognitiva-theme.css`** — NUEVO. Tema crayon SOLO estético para los 14 talleres.
   Enlazado en cada `alumno_*.html` justo antes de `</head>` (después del CSS propio, gana
   en cascada). Usa `!important` para vencer estilos inline (incl. botón "volver").
3. **Los 14 `alumno_*.html`** — única edición: un `<link rel="stylesheet" href="./src/cognitiva-theme.css">`.
   Su `<script>` y CSS clínico intactos.
4. **`paciente.html`** — se sustituyó el `<select>` "Añadir ejercicio" por un contenedor
   `<div id="exercisePicker">` (selector visual de tarjetas). Botón "Iniciar sesión" movido al header.
5. **`src/app.js`** — añadidos: `ICONOS`, `DESCRIPCIONES` (texto corto para familias/terapeutas),
   `CAT_COLOR`, `catDe()`. En `initPaciente` se reemplazó la lógica del select por
   `renderPicker()` + `toggleEjercicio()` (clic en tarjeta = añadir/quitar, persiste y redibuja camino).
6. **`index.html`, `paciente.html`, `sesion.html`** — assets con `?v=2` (cache-busting; el
   navegador servía `app.js` viejo y rompía la ficha).

## 3. Contrato que NO se debe romper (claves, rutas, flujo)
- localStorage keys: `cognitiva_pin`, `cognitiva_pacientes`, `cognitiva_pacientes_seq`,
  `cognitiva_sesion_<profileId>_<id_taller>`.
- Apertura de taller (en `sesion.html`): `window.open(`${url}?alumno=${encodeURIComponent(pac.id)}`,'_blank')`.
- Cierre de taller: botón `✅ Terminar y volver al camino` → `window.close()`.
- `NOMBRES` (nombres amigables) y `MAP_HTML` (eid → archivo) en `src/app.js`.
- Aviso ⚠️ cuando `errores_consecutivos_max >= 4`.

## 4. QA ya verificado en navegador (PASS)
- PIN: crea en 1er uso, valida en 2º; pide PIN al volver al index y al abrir ficha.
- Crear paciente, añadir/quitar ejercicios desde el selector visual (toggle persiste + camino se actualiza).
- Camino: 🔵 primer pendiente, 🔒 bloqueados, ✅ completados.
- Sesión: saludo, abre taller en pestaña nueva, detecta retorno y actualiza progreso.
- Taller `obj015j`: clic registra intento, estados correct(verde)/error(coral), 0 errores de consola.
- Botón "volver" con estilo crayon (vence al inline vía !important).
- ⚠️ aparece con `errores_consecutivos_max=4`.

## 5. PUNTOS A REVISAR / POSIBLES HUECOS (lo que pido auditar)
1. **Talleres NO probados uno a uno end-to-end.** Solo se verificó `obj015j` a fondo. Faltan los
   otros 13 (obj001a, obj003a, obj006a/007a/012a, obj015t, obj017b, obj020p, obj031a, obj041a,
   obj008a, eficiencia, escritura, lenguaje, ortografia): comprobar que cargan, que el tema no
   tapa controles ni rompe estados, y que persisten sesión con su `id_taller`.
2. **El `<style> !important` del tema puede pisar estados específicos** de algún taller con
   markup distinto (p.ej. `.dot`, `.slot`, `.cube-slot`, `.image-card.wrong`). Revisar visualmente.
3. **El selector visual nuevo NO está en `sesion.html`** (allí el niño abre el camino, no elige).
   Confirmar si se quiere también el formato icono+descripción en sesión.
4. **Cache-busting `?v=2` manual.** Si se vuelve a editar `app.js`/`app.css` hay que subir el número
   o el navegador servirá versión vieja. Conviene una estrategia mejor (no-cache headers o hash).
5. **`window.close()` solo funciona** en pestañas abiertas por script. Si el usuario abre el taller
   directo, el botón volver no cierra. (Comportamiento heredado del original.)
6. **Archivos heredados sin revisar:** `multitaller.html`, `perfil_alumno.html`, `perfil_tutor.html`,
   `perfil_programador.html`, `cuaderno_vocales.html` — no se tocaron ni se sabe si se usan.
7. **Lectura por voz** (`speechSynthesis`) depende del navegador; no probada en todos.

## 6. Cómo arrancar para probar
```
cd "/Users/joseaserraf/Documents/New project 6/COGNITIVA2026CLAUDE"
python3 -m http.server 8931
# abrir http://localhost:8931/index.html
```
O abrir `index.html` directamente (file://). PIN: cualquier 4 dígitos en el primer uso.

## 7. Archivos clave
- Pantallas: `index.html`, `paciente.html`, `sesion.html`
- Lógica: `src/app.js`
- Estilo pantallas: `src/app.css`
- Estilo talleres: `src/cognitiva-theme.css`
- Talleres: `alumno_*.html` (14) + sus `src/alumno_*.css`
- Datos/catálogos: `data/`
