# Local MVP - Modulo 00

## Ejecutar en local
Desde `curso-gpt-logopedia` (raiz del proyecto):

```bash
python3 -m http.server 8080
```

Abrir en navegador:
- http://localhost:8080/frontend/local-mvp/index.html

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

## Seguimiento del alumno
- Nota global (ponderada): 30% quiz + 70% media de practicas.
- Barras de evolucion por intentos.
- Historial con ganador de comparacion IA por intento.

## Contenido ampliado
Se carga desde:
- `content/catalog.json`
- `content/modules/module-00..06.json`
- `content/quizzes/quiz-00..06-01.json`
- `content/challenges/challenge-00..06-01.json`

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
