# Backlog del 0–5 (iteración con el usuario) — NO empaquetar sin su OK explícito

## 💡 Ideas de diseño nuevas (a diseñar JUNTOS antes de tocar código)

### 1. Sistema de AYUDAS ("cartas mágicas" / vidas) en vez de arreglar el atasco a lo bruto
- El riesgo de atasco (con las puertas que esperan) no se soluciona solo haciendo los
  minijuegos fáciles, sino con una **red de seguridad diegética**: si el niño ve que NO
  lo consigue, puede **gastar una "carta mágica"** para resolver/saltar ese problema.
- Las cartas/ayudas **se GANAN jugando**: al completar minijuegos, por tiempo jugado, por
  logros → vas acumulando ayudas para cuando te atasques.
- Escalable **por edades / niveles** (un modo con más ayudas para los más pequeños).
- Sustituye al viejo "salvavidas de tiempo" (que saltaba la fase) por algo que el niño
  CONTROLA y que además premia y engancha.
- PENDIENTE: decidir con el usuario el formato exacto (cartas, estrellas-ayuda, varita…),
  cuántas se ganan, qué resuelve cada una, y el escalado por edad.

### 2. Ovejas más lejos + LAZO visible (el protagonista lanza la cuerda)
- Ahora las ovejas quedaron **demasiado cerca del redil** (las puse en corona r=8–12).
  Alejarlas para que haya un verdadero "viaje" de arreo.
- Mecánica que pidió el usuario: el minifig **LANZA la cuerda como un lazo**, se VE cómo
  vuela y **engancha** la oveja, y DESPUÉS la lleva al redil. Que se vea el gesto, no que
  se enganche por proximidad.
- PENDIENTE: animación de lanzar (arco de la cuerda), enganche al impactar, y recolocar
  las ovejas más lejos (respetando REDIL_CLEAR / sin tiendas).

## 🔧 Notas de juego pendientes (del lote de 16, aún sin hacer)
- **5 · 7** Cámara: cuesta orientarla para ir a las cuerdas; el usuario dio su cámara base
  preferida (nota 7: x=0 z=22, mirando al N) → ponerla por defecto + suavizar el control.
- **6** Campamento apelotonado → más distancia entre tiendas.
- **12** Claridad del flujo cuerdas→ovejas→"recoger campamento" (mejora con los carteles
  nuevos, revisar tras el gating).
- **13** No se debe poder **atravesar el Mishkán** (tabernáculo): colisión salvo por la puerta.
- **15** Los espías del teaser llegan unos segundos antes y confunde → revisar timing del teaser.
- **16** El final (caravana caminando) se corta muy pronto y **el audio se corta a media
  frase** → alargar el plano final de la caravana + que la voz termine su frase.

## 💭 Pregunta abierta del usuario (sin decidir aún)
- **4** El render "precioso" brilla un poco de más → bajar bloom/exposición cuando decida
  (enseñar un antes/después). NO tocar hasta que lo pida.

## ✅ Ya hecho y en el repo (commiteado)
- Nota 1 (Yehoshúa encara bien), Nota 2 (contador de cuerdas), Notas 3/11/14 (PUERTAS: la
  historia y el audio esperan al niño), Nota 8 (cartel con tecla E), Nota 9 (alcance),
  Nota 10 (ovejas aleatorias, nunca en tienda). DevHUD: cuaderno de notas + "Quién juega".
