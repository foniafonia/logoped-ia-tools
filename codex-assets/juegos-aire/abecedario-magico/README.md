# Abecedario Magico

App web vanilla para entrenar lectura secuencial, coordinacion bilateral, ritmo, atencion y lateralidad mediante una tabla A-Z con consignas A/I/D:

- `A`: arriba.
- `I`: izquierda.
- `D`: derecha.

No promete resultados clinicos ni sustituye valoracion profesional.

## Arquitectura

- `index.html`: pantallas de inicio, tabla, juego, resumen y debug.
- `styles.css`: interfaz accesible, alto contraste, botones grandes y responsive.
- `app.js`: flujo de sesion, fases, controles manuales, metrónomo y resumen.
- `alphabet-game.js`: alfabeto, generacion de secuencias y reglas de fase.
- `vision.js`: camara, MediaPipe Tasks Vision local, HandLandmarker y FaceLandmarker.
- `gesture-detector.js`: deteccion pragmatica D/I/J y estabilidad temporal.
- `vendor/tasks-vision/`: wasm, bundle y modelos locales.

## Probar en ordenador

```bash
cd abecedario-magico
python3 -m http.server 4179
```

Abrir `http://127.0.0.1:4179/`. El modo manual no necesita permisos. Para manos, cara o mixto, pulsar `Activar camara`.

## Probar en iPhone/Safari

Sirve la carpeta por HTTPS o desde Vercel. En red local, usa una URL accesible desde el iPhone y acepta permisos de camara. Si la camara falla, cambia a `Usar manual`.

## Riesgos tecnicos

- La mano derecha/izquierda puede variar segun camara, espejo y version de MediaPipe.
- FaceLandmarker usa zonas amplias de cabeza; sirve como acceso tolerante, no como medicion precisa.
- iPhone/Safari puede limitar camara, wasm o rendimiento; la vision se procesa a unos 10-12 FPS.
- Los modelos locales pesan varios MB, por lo que la primera carga puede tardar.

## Mejoras futuras

- Niveles personalizados por usuario.
- Letras con fonemas, silabas y pseudopalabras.
- Pictogramas y apoyos ARASAAC/locales.
- Registro de sesiones exportable.
- Perfiles adaptados para paralisis cerebral, afasia, TDAH o dano cerebral adquirido.
