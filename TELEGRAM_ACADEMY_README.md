# 📚 Academia Telegram - Skool Academy

Una plataforma moderna e interactiva para convertir tu export de Telegram en un hub de contenido clasificado y searchable para tu academia.

## 🎯 Características

✅ **Búsqueda avanzada** - Busca por título, contenido, autor
✅ **Filtros inteligentes** - Clasifica por categoría y tipo de contenido  
✅ **Categorización automática** - Detecta tutoriales, recursos, ejercicios, etc.
✅ **Dos vistas** - Grid (visual) y Lista (detallada)
✅ **Diseño moderno** - Estilo Telegram limpio y académico
✅ **Modal de detalles** - Ve el contenido completo con enlaces y media
✅ **Responsive** - Funciona perfecto en desktop y móvil
✅ **Sin dependencias** - Todo funciona en el navegador

## 📦 Archivos Incluidos

```
📁 telegram-academy/
├── 📄 telegram-academy.html      ← Landing page principal (abre esto en el navegador)
├── 🔧 parser-telegram.js         ← Parser para procesar el export
├── 💻 academy-app.js             ← Lógica de la aplicación
├── 🔄 convert-telegram.js        ← Script Node.js para convertir HTML → JSON
├── 📋 telegram-data.json         ← Datos procesados (generado)
└── 📖 TELEGRAM_ACADEMY_README.md  ← Este archivo
```

## 🚀 Guía Rápida

### Opción 1: Usar datos de demostración (sin configuración)

```bash
# 1. Abre el archivo en el navegador
open telegram-academy.html
# o
# Arrastra telegram-academy.html a tu navegador
```

¡Eso es! Verás datos de demostración para probar todas las funciones.

### Opción 2: Convertir tu export de Telegram (recomendado)

#### Paso 1: Exporta tu Telegram
En Telegram Desktop:
1. Click en el grupo/canal
2. Opciones (⋮) → Exportar diálogos
3. Elige ubicación y espera a que termine

#### Paso 2: Convierte el export a JSON

```bash
# Instala la dependencia (solo una vez)
npm install jsdom

# Convierte el export HTML a JSON
node convert-telegram.js \
  "/ruta/a/tu/ChatExport_2026-06-30/messages.html" \
  "./telegram-data.json"
```

**Salida esperada:**
```
✅ Se encontraron 342 mensajes
📊 Se extrajeron 328 mensajes válidos
✅ Datos guardados en: ./telegram-data.json
📈 Total de mensajes: 328

📊 Estadísticas:
Categorías:
  • tutoriales: 45
  • recursos: 62
  • ejercicios: 38
  • preguntas: 58
  • ...
```

#### Paso 3: Abre la landing page

```bash
# Con Python (si tienes Python)
python -m http.server 8000
# Luego abre: http://localhost:8000/telegram-academy.html

# O con Node.js
npx http-server
```

O simplemente abre `telegram-academy.html` directamente en el navegador.

## 📊 Categorías de contenido

El sistema automáticamente detecta y clasifica:

- **📚 Tutoriales** - Guías paso a paso, cómo hacer cosas
- **🛠️ Recursos** - Herramientas, plantillas, descargas
- **🔗 Enlaces** - URLs y referencias externas
- **🎬 Videos** - Contenido visual
- **❓ Preguntas** - Dudas de estudiantes
- **📢 Anuncios** - Comunicados e información importante
- **✏️ Ejercicios** - Tareas y prácticas
- **💻 Código** - Snippets y ejemplos de programación
- **💬 Discusiones** - Conversaciones y debates
- **🎪 Eventos** - Webinars, talleres, conferencias

## 🎨 Tipos de contenido detectados

- **🖼️ Imagen** - Screenshots, diagrama, etc.
- **🎬 Video** - Videos y clips
- **🎵 Audio** - Archivos de audio
- **📄 Archivo** - PDFs, zips, documentos
- **🔗 Enlace** - URLs
- **📰 Artículo** - Textos largos
- **💬 Mensaje** - Conversación normal

## 🔍 Funcionalidades en detalle

### Búsqueda
- Escribe en el campo superior
- Presiona Enter o haz click en "Buscar"
- Se busca en: título, contenido, autor, menciones

### Filtros
- **Categoría**: Click en cualquier categoría para filtrar
- **Tipo**: Filtra por imagen, video, archivo, etc.
- **Múltiples filtros**: Se combinan automáticamente
- **Limpiar**: Click en "Limpiar filtros" para resetear

### Vistas
- **Grid (⊞)**: Cards visuales, perfecta para explorar
- **List (☰)**: Vista de lista compacta, ideal para buscar

### Modal de detalles
- Click en cualquier card/item
- Ve el contenido completo
- Descarga archivos
- Abre enlaces externos

## 📱 Responsive

✅ Desktop - Experiencia completa
✅ Tablet - Optimizado para pantallas medianas
✅ Móvil - Interfaz compacta y touch-friendly

## 🛠️ Personalización

### Cambiar colores

En `telegram-academy.html`, busca las variables CSS:

```css
:root {
    --primary: #0088cc;      /* Color principal */
    --secondary: #31a24c;    /* Color secundario */
    --bg-dark: #0e1419;      /* Fondo oscuro */
    --text-primary: #ffffff; /* Texto principal */
}
```

### Agregar nuevas categorías

En `parser-telegram.js`, función `classifyCategory()`:

```javascript
const categories = {
    'mi-categoria': ['palabra clave 1', 'palabra clave 2'],
    // ...
};
```

### Cambiar emojis de categorías

En `academy-app.js`, función `getCategoryLabel()`:

```javascript
const labels = {
    'tutoriales': '📚 Tutoriales',
    'mi-categoria': '🎯 Mi Categoría',
    // ...
};
```

## 🔧 Solucionar problemas

### "No se encontraron resultados"

1. Asegúrate que `telegram-data.json` está en la misma carpeta que `telegram-academy.html`
2. Verifica que el archivo JSON está bien formado (JSON válido)
3. Prueba primero con los datos de demostración (sin telegram-data.json)

### La conversión HTML→JSON toma mucho tiempo

Es normal si tu export es grande (1000+ mensajes). El proceso es:
- Leer HTML
- Parsear cada elemento
- Extraer media, enlaces, menciones
- Clasificar automáticamente

**Optimización**: Edita `convert-telegram.js` para saltar ciertos tipos de contenido si no los necesitas.

### Los enlaces/imágenes no se muestran

1. Verifica que la ruta del archivo HTML de Telegram está correcta
2. Asegúrate que las carpetas `images/`, `videos/`, `files/` están en la misma ubicación que `messages.html`
3. Las URLs relativas necesitan estar correctamente mapeadas

### Búsqueda lenta

Si tienes 5000+ mensajes:
1. Intenta usar más filtros de categoría
2. Considera dividir el export en múltiples archivos JSON más pequeños

## 📈 Estadísticas después de la conversión

El script `convert-telegram.js` muestra:

```
Categorías:
  • tutoriales: 45
  • recursos: 62
  • ejercicios: 38
  • preguntas: 58
  • anuncios: 12
  • eventos: 8
  • ...

Tipos de contenido:
  • mensaje: 180
  • imagen: 95
  • archivo: 42
  • enlace: 18
  • video: 6
  • ...
```

## 🎯 Casos de uso

✅ **Academia Online** - Organiza tu contenido de Telegram
✅ **Comunidad de Aprendizaje** - Crea un hub para estudiantes
✅ **Base de conocimiento** - Documentación searchable
✅ **Portfolio** - Muestra tu contenido educativo
✅ **Archivo** - Preserva y organiza mensajes importantes

## 🚀 Próximas mejoras

- [ ] Exportar a PDF
- [ ] Sincronización en tiempo real con Telegram
- [ ] Sistema de comentarios
- [ ] Recomendaciones personalizadas
- [ ] Analytics de uso
- [ ] Integración con Skool
- [ ] Dark/Light mode automático

## 📝 Licencia

Este proyecto es de código abierto. Úsalo libremente para tu academia.

## 💬 Soporte

¿Problemas o sugerencias?
1. Revisa la sección "Solucionar problemas"
2. Verifica que los archivos están en el lugar correcto
3. Prueba con datos de demostración primero

---

**¡Dale caña! 🚀** Organiza tu contenido de Telegram y conviértelo en una academia profesional.

Hecho con ❤️ para educadores y comunidades
