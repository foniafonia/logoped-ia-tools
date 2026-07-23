# Plan de trabajo del LEAD / Creador 0–5 (mi parcela)

Me centro **solo en lo mío**: el **minuto 0–5** y el **motor**. Los demás tramos
(5–10, 10–15, …) los hacen **otros hilos**; **no los toco**.

## Reglas de seguridad (no romper nada)
1. Trabajo **aditivo** dentro de `scenes/min00/` y del motor. No piso el trabajo
   de otros hilos ni la muralla/clímax.
2. **Antes de cada commit:** `cd mundo-ladrillos && npx vite build` debe pasar.
3. **Captura(s)** con Playwright headless como prueba de vida.
4. **Contenido:** jamás audio/fotogramas de la peli al repo. `clips.ts`/`fondos.ts`
   vacíos en el repo; se rellenan **solo** para entregas y se restauran.

## Pendiente de pulido del min 0–5 (esto SÍ es mío)
- [x] **Intro con personalidad** (esc. 01–02): plató + pergamino-título + Rabino
  riñe al Beduino. ✅
- [x] **Beats a tiempos OFICIALES** del desglose (esc. 01–08) + **cierre en la
  caravana** (el río se lo deja al 5–10). ✅
- [x] **Tabernáculo** (Mishkán: cortinas azul/púrpura/carmesí + capiteles dorados)
  **+ 4 niños desfilando con canastas de pan** (esc. 06). ✅
- [x] **Textos más cortos** (subtítulos y objetivos). ✅
- [x] **Quitar espadas** a los no-combatientes (campo `sword:false`). ✅
- [x] **Abrevadero** con aldeano dando de beber + oveja bebiendo (esc. 05). ✅
- [x] **Nivel de detalle "del muñequero"**: alfombras de **kilim** con patrón
  tejido (bordes zigzag, rombos, medallón, flecos) tendidas por el campamento +
  **tapiz de patrón** en el Tabernáculo. Técnica de `textiles.ts` inspirada en su
  escondite de la alfombra (`rug-hide.ts`). ✅
- [ ] Más reactividad interactiva (camellos/tiendas que reaccionen al jugador).
- [ ] Silueta de **Jericó** más fina (queda como pieza para el 5–10).
- [ ] Subir ese mimo a más assets (lonas de tienda con textura, etc.).
- [ ] Entregas: single-file jugable + capturas.

## Bitácora
- (miér) min 0–5 acompasado al audio + jugosidad (estrellas, confeti, ovejas,
  redil) + UI móvil. Entregado jugable con voz. ✅
- (jue) Enriquecido: **intro de estudio** (pergamino-título + Rabino/Beduino) +
  **re-cuadre de beats a los tiempos oficiales** del desglose + cierre en la
  caravana. Controles táctiles aparecen al terminar la intro. ✅
- Nota: el tramo 5–10 lo lleva otro hilo (ya avanzado). No es mi parcela.
- Nota: `referencias/desglose-escenas-peli.json` (54 escenas, tiempos) sirve a
  todos los tramos; lo integré en la rama de assets del 5–10.
