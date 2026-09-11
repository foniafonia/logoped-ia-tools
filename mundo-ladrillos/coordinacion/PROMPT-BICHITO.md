# Prompt para replicar el 🐞 (panel de iteración) en cualquier proyecto

Copia el bloque de abajo y pégalo en el hilo del proyecto donde lo quieras montar.
Está sacado de nuestro `src/debug/DevHUD.ts` (373 líneas), que ya funciona en producción.

---

````markdown
# Encargo: monta el panel 🐞 (herramienta de iteración)

Quiero que montes en este proyecto un panel de anotación que llamamos "el bichito" (🐞).
No es una función del producto: es una **herramienta de trabajo** para que quien prueba la
app pueda apuntar lo que falla **sin salir de ella**, y pasármelo todo de una vez.

## El problema que resuelve

Sin esto, iterar es así:
> "Oye, en una pantalla que no sé cuál era, el muñeco se quedaba parado… creo."

Con esto, es así:
> "Escena 12 «El mercado», segundo 34, jugador en x=12 z=-8 mirando al SO, sonando
> pista_mercado, objetivo 'llegar al pozo' → el muñeco anda hacia atrás."

La diferencia entre perder media hora adivinando y arreglarlo a la primera.

## El ciclo de trabajo que habilita

1. La persona **juega/usa la app** con el 🐞 puesto.
2. Cada vez que ve algo raro, pulsa **📝 Anotar** y lo dice o lo escribe. Sigue jugando.
   No para a reportar cada cosa: acumula.
3. Al terminar, pulsa **📋 Notas** → se copia **el lote entero** al portapapeles.
4. Lo pega en el chat conmigo.
5. Yo arreglo **en el origen** (un commit por arreglo) y devuelvo build nueva.

La clave es **iterar por lotes**, no de una en una.

## Principio de diseño innegociable

**El panel NO debe saber nada de la aplicación.**

Solo lee dos funciones globales que publica la app:

```js
window.__estado    = () => ({ ... })   // dónde estoy ahora mismo
window.__destinos  = () => [ ... ]     // a dónde puedo saltar
```

Esto es lo que lo hace portable: el mismo panel sirve para un juego 3D, una web o una
herramienta interna. Si el panel empieza a importar cosas del proyecto, está mal hecho.

En nuestro caso son dos "mundos" de código distintos (la apertura y el motor de tramos) y
cada uno **reemplaza** esos hooks cuando toma el control. El panel ni se entera.

## Qué tiene que hacer

### 1. Píldora plegada → panel

Un botón 🐞 discreto en una esquina (`position:fixed`, z-index alto). Al pulsarlo se abre
el panel; con ✕ se pliega. Que no estorbe mientras se usa la app.

### 2. Estado en vivo

El panel muestra el estado actual, refrescado cada ~300 ms con un `setInterval`.
Adapta los campos a tu proyecto. Los nuestros (juego):

- 🌍 zona/mundo
- 🎬 escena o pantalla + su título
- ⏱ tiempo en segundos
- 🧍 posición x/z + rumbo en grados y en letras (N, NE, E…)
- 🔊 qué audio suena
- 🎯 objetivo actual

Para una **app web** serían: ruta actual, usuario, estado del formulario, última acción,
datos cargados, versión.

### 3. 📋 Copiar

Copia el estado actual al portapapeles, ya formateado y legible. Feedback visual
("✅ ¡Copiado!" durante ~1 s).

### 4. 📝 Anotar — el corazón

Abre una ventanita con:

- Un campo de texto.
- **🎤 Dictar** — transcripción del navegador (`SpeechRecognition`). Imprescindible si
  quien prueba es un niño o alguien que no quiere teclear.
- **🔴 Grabar voz** — `MediaRecorder` → descarga un audio para adjuntar. Es el respaldo
  para cuando el dictado no está disponible (funciona sin internet).
- **✅ Guardar** / **Cancelar**.

Al guardar, la nota se apunta **junto con una copia completa del estado de ese momento**.
Eso es lo importante: quien anota solo escribe "esto va raro", el contexto se captura solo.

### 5. 📋 Notas — copiar el lote

Vuelca **todas** las notas acumuladas al portapapeles, numeradas, cada una con su
contexto completo. El botón muestra el contador (`📋 Notas·7`).
Un botón 🗑 aparte las borra, con confirmación.

### 6. 👤 Quién juega

Un campo para poner el nombre de quien está probando (se guarda). Va en la cabecera del
lote de notas. Sirve para saber de quién viene cada opinión cuando prueban varias personas
—no es lo mismo lo que le chirría a un adulto que lo que no entiende un niño.

### 7. 🎬 Ir a…

Menú desplegable con todos los destinos (`window.__destinos()`), agrupados por sección.
Al pulsar uno: `location.hash = '#go=' + clave` y **recargar**.

Recargar en vez de saltar en caliente es a propósito: funciona desde cualquier punto sin
tener que desmontar medio estado, y respeta el gesto de usuario que el navegador exige
para que suene el audio (al recargar, el botón "Empezar" ejecuta el salto pendiente).

Añade dos ayudas: una que **lee** el destino pedido del hash y otra que lo **limpia**, para
que una recarga normal no repita el salto.

## Los tropiezos que ya nos costaron tiempo (no los repitas)

**1. El campo de texto y las teclas de la app se pelean.**
Si la app captura teclas (WASD, espacio, flechas), al escribir una nota se disparan
acciones y el espacio ni siquiera escribe. En **todos** los manejadores de teclado de la
app, lo primero:

```js
const t = e.target;
if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
```

Nos pasó, lo arreglamos en un sitio y se nos olvidó el otro. Revísalos todos.

**2. Pausa la app mientras se anota.**
Si no, sigue corriendo por detrás y cuando cierras la nota estás en otro sitio. Publica un
`window.__setPausa(true/false)` y llámalo al abrir y cerrar la ventanita.

**3. El dictado borra lo dicho al pausar.**
`SpeechRecognition` va por tandas. Si solo acumulas desde `resultIndex`, al hacer una pausa
se pierde lo anterior. Acumula **todos** los resultados desde el principio.

**4. En `file://` el portapapeles moderno falla.**
Pon un respaldo con un `<textarea>` oculto + `document.execCommand('copy')`. Si la app se
reparte como archivo suelto, sin esto el botón no hace nada.

**5. En `file://` puede no haber `localStorage`.**
Envuelve **cada** lectura y escritura en `try/catch`. Si falla, que las notas se queden en
memoria durante la sesión en vez de romper el panel.

**6. Que instalarlo sea idempotente.**
La función de montaje debe borrar el panel anterior y limpiar su `setInterval` antes de
crear el nuevo. Si no, al cambiar de pantalla acabas con tres paneles y tres temporizadores.

## Cómo lo quiero hecho

- **Un solo archivo**, sin dependencias, sin framework.
- Estilos en línea (así no depende de la hoja de estilos del proyecto).
- Que se monte con **una línea** desde la app.
- Que **no se incluya en la build de producción** si no quieres que lo vea el usuario final
  (o déjalo, que es discreto: nosotros lo dejamos puesto a propósito, porque quien prueba
  es el cliente).

## Antes de darlo por hecho

Pruébalo de verdad: anota tres notas en tres sitios distintos, copia el lote y comprueba
que el texto pegado tiene el contexto completo y se entiende sin haber estado delante.
````

---

## Notas para Idan (no van en el prompt)

- Lo que hace que esto valga es **el contexto automático**. Cualquiera puede montar una
  caja de texto; lo que ahorra tiempo es que cada nota traiga sola dónde estabas.
- El 🎤 dictado es lo que permite que **un niño** pueda reportar. Sin eso, no reporta.
- Si el proyecto no es un juego, cambia los campos del estado (ruta, usuario, última
  acción) y **todo lo demás vale igual**.
