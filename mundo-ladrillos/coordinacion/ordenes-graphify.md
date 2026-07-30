# Ordenes Graphify

Este archivo es el buzon humano para pedir trabajo a Claude usando el mapa de Graphify.

Flujo acordado:

1. Idan escribe un encargo desde el panel Graphify humano o lo pega aqui.
2. Claude lee este archivo al arrancar su sesion y construye el juego.
3. Claude reporta lo hecho en `coordinacion/estado-claude.md`.
4. Codex revisa despues y escribe en `coordinacion/revision-codex.md`.

## Formato de encargo

```markdown
### Encargo #N
- Zona/escena:
- Que quiero:
- Prioridad: alta / media / baja
- Quien lo pide: Idan
- Estado: pendiente
- Nota Graphify:
```

## Encargos

### Encargo #1
- Zona/escena: Campamento e inicio
- Que quiero: hay un fallo en el mishkan la puerta no abre y cierra para entrar
- Prioridad: media
- Quien lo pide: Idan
- Estado: pendiente
- Nota Graphify: Consultar con Graphify: Nino, campLife.ts, camp.ts, personajes, objetos de campamento.

Claude: eres el constructor del juego. Usa Graphify antes de tocar nada. Trabaja solo en lo necesario para este encargo. No toques la capa del panel Graphify humano. Reporta el resultado en coordinacion/estado-claude.md. Codex revisara despues.
