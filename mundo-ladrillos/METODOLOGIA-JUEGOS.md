# Método para crear videojuegos paso a paso (con el usuario)

> Esta forma de trabajar surgió creando "La Caída de Jericó" y funciona muy bien.
> Es la manera POR DEFECTO de construir un videojuego (o cualquier proyecto jugable
> / interactivo) con el usuario. Guardada también en su memoria global de Claude.

## Principios

1. **Rebanadas jugables desde el principio.** Entregar SIEMPRE algo jugable y afinarlo
   sobre la marcha. Nunca esqueletos grandes "a ciegas": se construye, se ve, se ajusta.

2. **Un único archivo jugable, autónomo y offline.** El usuario tiene siempre a mano un
   archivo (p.ej. `Jerico.html`, self-contained: juego + audio + todo dentro) que abre con
   doble clic. Yo lo actualizo y se lo doy con el MISMO nombre para que lo reemplace in situ.

3. **DevHUD embebido (panel de trabajo dentro del juego).** Una herramienta 🐞 en el build
   que hace la iteración quirúrgica:
   - **Etiqueta de estado COPIABLE:** mundo, escena/beat, tiempo, posición + rumbo del
     personaje, audio que suena, objetivo actual.
   - **Menú de salto** a cualquier escena (para revisar sin jugar todo seguido).
   - **Cuaderno de notas:** el jugador anota mientras juega (📝) y cada nota se guarda CON
     el contexto exacto (mundo/escena/tiempo/posición); al final copia TODO el lote para
     pegármelo. Persiste entre recargas.
   - **Etiqueta "quién juega"** (Papá / el niño / otro ordenador) para atribuir cada nota
     cuando varios testers iteran en paralelo.
   - (En diseño) **anotación por voz** 🎤 para que un niño pequeño no tenga que teclear.

4. **Iterar por LOTES.** El usuario juega, apunta varias notas y me las pega juntas; yo las
   arreglo juntas y reempaqueto UNA sola vez (empaquetar es el paso "caro"). Agrupar las
   notas por mundo/escena, no de una en una.

5. **El usuario controla el empaquetado.** NUNCA entregar/empaquetar un build nuevo sin su
   **OK explícito**. Entre entregas, arreglar y commitear código libremente (es barato y
   seguro); el "aquí tienes archivo nuevo" espera a que el usuario lo pida.

6. **Arreglar en el origen, incremental.** Ediciones quirúrgicas a los archivos concretos,
   un commit por arreglo lógico, push. El código (y el diff) es el registro.

7. **Preguntar en dirección, ejecutar libre.** Las decisiones de diseño/dirección (ritmo,
   sistemas nuevos, estética) son del usuario: se PREGUNTA, no se asume. La ejecución fina
   corre libre. (Regla del "timbre".)

8. **Verificar antes de entregar.** Que compile (build-gate) y **probar en runtime** los
   cambios de riesgo (navegador headless: comprobar que la mecánica hace lo que debe) antes
   de empaquetar. No shippear a ciegas.

9. **Material privado fuera del repo.** Audio/imágenes con derechos jamás se suben: se
   rellenan SOLO para la entrega y se restaura el repo después.

10. **Trato.** Responder al usuario **en castellano**. Ser proactivo, honesto con lo que
    funciona y lo que no, y celebrar el avance conjunto.

## El bucle, en una línea
El usuario juega → anota con el 🐞 (firmado por quién juega) → me pega el lote → yo arreglo
en el origen y verifico → **con su OK** empaqueto un archivo nuevo → él lo reemplaza y sigue.
