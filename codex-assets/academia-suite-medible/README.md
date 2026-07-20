# Local MVP - Hub Inicial Logoped-IA

## Ejecutar en local
Desde la raiz del workspace:

```bash
cd "/Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS"
python3 -m http.server 8080
```

Abrir en navegador:
- http://localhost:8080/codexgptcurso/frontend/local-mvp/index.html

Antes de abrir, regenera el catalogo de actividades:

```bash
python3 codexgptcurso/scripts/build_activity_catalog.py
```

## Conexion API
El endpoint ya esta fijado en el codigo:
- `https://api.openai.com/v1/responses`

En la pantalla solo tienes que poner:
- `API Key` (tu `sk-...`)
- `Model` (opcional, por defecto `gpt-4.1-mini`)

## Flujo recomendado de clase
0. Selecciona modulo en el selector de teoria.
1. Escribe el prompt del ejercicio.
2. Pulsa `Enviar a API` para obtener respuesta interna.
3. Pega la respuesta de tu GPT externo en el campo correspondiente.
4. Pulsa `Comparar respuestas con IA`.
5. Revisa:
   - cual salida gana,
   - por que,
   - y el prompt mejorado propuesto.
6. Revisa el semaforo comparativo (verde/amarillo/rojo).
7. Guarda el intento para registrar evolucion.
8. Pulsa `Siguiente ejercicio` para avanzar.

## Seguimiento por paciente
- Cada quiz y cada intento se guarda asociado al paciente activo.
- Nota global (ponderada): 30% quiz + 70% media de practicas.
- Barras de evolucion por intentos.
- Historial con ganador de comparacion IA por intento.
- Plan de adaptacion clinica sugerido dentro de cada ejercicio.
- Catalogo integrado con recomendacion de recursos segun edad, objetivos y etiquetas.

## Contenido ampliado
Se carga desde:
- `content/catalog.json`
- `content/modules/module-00..06.json`
- `content/quizzes/quiz-00..06-01.json`
- `content/challenges/challenge-00..06-01.json`
- `content/activity-catalog.generated.json`

## Integracion progresiva del proyecto
Esta version ya deja una base para integrar "todo en una sola web" poco a poco:
- Inventaria juegos y prototipos HTML del workspace.
- Prioriza recursos de mayor valor clinico para integrarlos primero.
- Permite empezar a personalizar recomendaciones y resultados por paciente.
- Evita mezclar todos los experimentos en una sola app sin orden previo.

Body enviado:
```json
{
  "model": "gpt-4.1-mini",
  "input": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ]
}
```

Headers:
- `Content-Type: application/json`
- `Authorization: Bearer <API_KEY>`

El frontend intenta leer `output_text` o texto dentro de `output[].content[].text`.

## Nota de seguridad
Este MVP guarda configuracion y resultados en `localStorage` del navegador. Para produccion, mover auth y secretos al backend.
