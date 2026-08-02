# Arreglar el iMac — explicado paso a paso

## Qué le pasa a tu Mac (en una frase)

Tus proyectos de programación están guardados **dentro de iCloud Drive**.
Esos proyectos contienen carpetas como `node_modules` con **decenas de miles
de ficheros diminutos** cada una. iCloud intenta sincronizar y catalogar
**uno por uno** más de 1.270.000 ficheros. Ese catálogo se guarda en memoria,
tu Mac solo tiene 8 GB, y por eso se congela.

**No es un problema de espacio. Es un problema de CANTIDAD de ficheros.**

Por eso vaciar espacio no lo arregló: 3 GB liberados no importan si eran
400.000 ficheros los que sobraban y siguen quedando otros 800.000.

## La solución (también en una frase)

Sacar los proyectos de programación de iCloud y ponerlos en una carpeta
normal del Mac llamada `~/Dev`, que iCloud **no** sincroniza.

Tu código no se queda sin respaldo: el respaldo del código es **GitHub**.
iCloud se queda para lo que sí tiene sentido: documentos, PDFs, vídeos.

Esto se hace **una vez** y el problema no vuelve. Limpiar `node_modules`
cada noche no sirve: el siguiente `npm install` lo vuelve a crear dentro
de iCloud y estás igual.

---

## CÓMO EMPEZAR

### Paso 0 — Abrir el Terminal

En tu Mac, pulsa `Cmd` + `Barra espaciadora`, escribe `Terminal`, pulsa Enter.
Se abre una ventana negra o blanca con texto. Ahí es donde vas a pegar cosas.

**Todo lo que hagas es copiar una línea, pegarla, y pulsar Enter.** Nada más.

### Paso 1 — Descargar las herramientas

Copia esta línea entera, pégala en el Terminal y pulsa Enter:

```bash
cd ~/Documents && git clone https://github.com/foniafonia/logoped-ia-tools.git herramientas-mac 2>/dev/null || (cd ~/Documents/herramientas-mac && git pull); cd ~/Documents/herramientas-mac && git checkout claude/icloud-fileprovider-mac-optimization-rqzt5b && git pull && cd mac && pwd
```

Al terminar te debe salir una ruta acabada en `/mac`. Si sale eso, vas bien.

### Paso 2 — La radiografía (NO TOCA NADA)

```bash
bash 01_diagnostico.sh
```

Tarda un par de minutos (la parte de iCloud es lenta, es normal).

Este script **solo mira**. No borra, no mueve, no copia. Puedes ejecutarlo
mil veces sin ningún riesgo.

Al final te dirá una de tres cosas:

| Resultado | Significa | Qué haces |
|---|---|---|
| **VERDE** | El Mac está tranquilo | Pasa al paso 3 |
| **AMARILLO** | Va justo pero se puede | Pasa al paso 3 |
| **ROJO** | El Mac está ahogado | Cierra Chrome y Safari, espera 30-60 min, repite el paso 2 |

**Cópiame lo que salga y te digo yo qué hacer.**

### Paso 3 — La simulación (TAMPOCO TOCA NADA)

```bash
bash 02_migrar_proyectos.sh
```

Esto busca tus proyectos dentro de iCloud y te enseña, uno por uno:

- cuántas carpetas técnicas tiene dentro,
- si tiene cambios sin guardar en git,
- si está subido a GitHub,
- y si **es seguro moverlo o no**.

Al final te lista los que se moverían. **No mueve nada todavía.**

### Paso 4 — Mover UN solo proyecto, de prueba

Solo cuando hayas visto la lista del paso 3 y estés de acuerdo:

```bash
DRY_RUN=0 MAX_MOVES=1 bash 02_migrar_proyectos.sh
```

Mueve **un** proyecto de iCloud a `~/Dev`. Escribe lo que ha hecho en un
manifiesto. Se puede deshacer.

### Paso 5 — Comprobar que ha servido

Espera 15-30 minutos y repite:

```bash
bash 01_diagnostico.sh
```

Mira el número de **"pendientes de indexar"**. Si ha bajado, funciona:
repite el paso 4 tantas veces como haga falta, o sube el límite:

```bash
DRY_RUN=0 MAX_MOVES=3 bash 02_migrar_proyectos.sh
```

---

## Lo que estos scripts NUNCA hacen

- Nunca borran un fichero. Solo **mueven**, y todo movimiento queda anotado.
- Nunca tocan documentos, PDFs, fotos ni vídeos. Solo carpetas de código.
- Nunca desactivan iCloud Drive ni Escritorio/Documentos.
- Nunca mueven un proyecto con trabajo sin guardar.
- Nunca mueven un proyecto que no esté copiado en GitHub.
- Nunca actúan si iCloud está trabajando fuerte (más del 30% de CPU).
- Nunca usan `--delete`.

## Cómo deshacer cualquier cosa

Todo movimiento se anota aquí:

```
~/Documents/LIMPIEZA Y OPERATIVIDAD DEL MAC/MANIFIESTO_MIGRACION.md
```

Cada entrada incluye la línea exacta para deshacerlo. Abres el fichero,
copias esa línea, la pegas en el Terminal, y el proyecto vuelve a su sitio.

---

## Cómo trabajar a partir de ahora

**De día, trabajando:**
Tus proyectos viven en `~/Dev`. Trabajas ahí. iCloud ni se entera.
Guardas el código con `git commit` y `git push`, como siempre.

**Por la noche:**
iCloud sincroniza solo tus documentos reales, que son pocos y grandes,
en vez de un millón de ficheros diminutos. Tarda minutos, no días.

**Un proyecto nuevo:**
Créalo siempre dentro de `~/Dev`, nunca en Documentos ni en el Escritorio.

**Regla de oro:**
> Si una carpeta se puede regenerar con un comando (`npm install`,
> `pip install`, `npm run build`), **no debe estar en iCloud jamás**.
