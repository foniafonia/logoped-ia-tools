# Ideas de futuro — cómo aprovechar el motor y lo aprendido

Notas de dirección (conversación con Idan). No son compromisos; son el mapa para
retomar sin perder nada.

## 1. Distribución del juego (cuando esté completo)
La gran ventaja: es una **web autocontenida**, así que de **un solo build** salen tres puertas.
- **Online (alojado):** una URL, cero instalación, se actualiza solo para todos. Hosting
  estático barato (Netlify / Vercel / Cloudflare / GitHub Pages).
- **PWA (la joya):** botón "Instalar" desde el navegador → icono y ventana propios, **como
  un ejecutable, sin tiendas**, y **funciona offline**. Cubre a la vez "ejecutable",
  "offline" y "móvil sin app store". **Opción recomendada por defecto.**
- **Offline (HTML de doble clic):** el propio fichero ya es el "ejecutable" offline (lo que
  usamos hoy). Para consultas/coles sin internet o máxima privacidad.
- **Ejecutable .exe/.app "de verdad":** solo si un cliente lo pide → envolver con **Tauri**
  (ligero). Baja prioridad.
- **Privacidad (menores):** el audio se procesa **en el dispositivo**, no sube a servidor →
  argumento de venta fuerte, sobre todo en la línea de logopedia.
- La preocupación real no es dónde se aloja, sino el **rendimiento en equipos flojos** →
  pulir un "modo ligero".

## 2. Versionar el motor a juegos LOGOPÉDICOS (línea de negocio de Idan)
Mismo motor + metodología + **conocimiento clínico** = juegos terapéuticos. Primer título
candidato: **tartamudez**.

### Lo que YA tenemos y sirve tal cual
- Estética de ladrillo amable (no amenazante).
- **Gating "esperar al niño"** (la historia no avanza hasta que completa la tarea) → sin
  prisa, sin cronómetro (la presión temporal empeora la tartamudez).
- Estrellas + cartas de ayuda que **facilitan, no resuelven** (refuerzo positivo, tipo
  Lidcombe).
- **Micrófono ya integrado** (dictar/grabar del DevHUD) → base para mini-juegos de voz.
- Cuaderno de notas del 🐞 → reconvertible en panel para el logopeda/padres.
- Entrega en **un HTML offline** → consulta y casa, audio local (privacidad).

### Concepto (tartamudez) — dos públicos, dos modos
- **Modo EMPATÍA** (entorno/aula): juegas *siendo* el niño que tartamudea → aprendes a ser
  aliado (esperar, no terminar frases). Para campañas escolares y el 22-oct (Día Mundial
  de Concienciación sobre la Tartamudez).
- **Modo HÉROE/DEFENSA** (el niño): practica técnicas y responde a la burla con seguridad;
  gana estrellas de **valentía**, no de fluidez.

### Mini-juegos de voz (puentes lúdicos, NO corrector clínico)
- Arranque suave (*easy onset*), habla estirada/lenta, turnos de habla (Palin PCI: bajar
  demandas), desensibilización ("el trabón mágico" → quitar vergüenza al tartamudeo).
- Enemigos/burlones de ladrillo que se **deshacen en bloques** (sin violencia real).

### Principio innegociable
**Cero presión, cero cronómetro, todo elogio.** Se premia participar/intentarlo/ser valiente,
no la fluidez. Encaja de forma nativa con nuestro gating + estrellas.

### Honestidad / riesgos
- Es **complemento** de la terapia, no sustituto (decirlo claro).
- **Co-diseñar** con la comunidad que tartamudea y con evidencia (Lidcombe / Palin PCI /
  Van Riper).
- La detección automática de tartamudez es limitada → apoyarse en estructura/ritmo/confianza,
  no en "puntuar" fluidez.

### Por dónde empezar
Una rebanada jugable: **el patio del cole (Modo Empatía)** o **arranque suave con micro
(Modo Héroe)**. Decidir con Idan (es la experta clínica).

## 3. DA3 Studio / Depth Anything 3 (herramienta, no para este juego)
- Convierte un vídeo en 3D navegable (nube de puntos / gaussian splats), monocular (no
  necesita poses de cámara) → encaja con **cine IA** (que no tiene cámara real).
- **Para el Jericó de ladrillo: NO** (fotorrealista, choca con el estilo; pesa).
- **Para un futuro juego de una peli IA (no-ladrillo): SÍ merece prueba** — como generador
  de escenarios explorables a partir de la peli, con nuestra jugabilidad Three.js encima.
  Peros: exploración limitada a ángulos filmados, mejor entornos estáticos, pesa, y no es
  un motor de juego (la jugabilidad la montamos nosotros).

## 4. Editor de mundos "por trazos" que autogenera ladrillos (inspiración: Canvas of Kings)
Idea vista en un post (Canvas of Kings, de Hannes Breuer): dibujas trazos (caminos, ríos,
murallas, aldeas) y el sistema **coloca los elementos automáticamente** sobre tu trazado; el
mapa "cobra vida solo".
- **La herramienta en sí NO nos sirve directa:** genera mapas **2D** (estilo tablero D&D) y
  nuestro mundo es **3D de ladrillo** → mismo choque de tecnologías que los fondos de la peli.
  Su export (imagen 2D) no se juega en Three.js.
- **Lo que SÍ nos llevamos = el PATRÓN, no el programa:** montar **nuestro** mini-editor de
  niveles donde dibujas un camino/muralla/río y **se autogeneran los ladrillos, tiendas y
  murallas** encima. Aceleraría muchísimo montar los **juegos 2 y 3** (menos construir a mano).
- Usos menores: **plano de nivel** antes de construir en 3D; **mapa decorativo 2D** para un
  menú o selector de mundos ("elige mundo").
- Prioridad: **baja / futura** — anotado por si al final compensa implementarlo cuando estén
  en marcha las entregas 2 y 3.
