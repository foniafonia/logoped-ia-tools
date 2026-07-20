# Deploy del hub Juegos Aire

Este dominio no debe desplegarse desde la raiz del workspace.

Ruta correcta:

- `/Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS/deploy-juegos-aire`

Proyecto Vercel enlazado:

- `juegos-aire-logoped-ia`
- `https://juegos-aire-logoped-ia.vercel.app`

Comandos:

```bash
cd "/Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS/deploy-juegos-aire"
npm run deploy:prod
```

Comprobacion rapida:

```bash
cd "/Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS/deploy-juegos-aire"
npm run inspect:prod
curl -s -L https://juegos-aire-logoped-ia.vercel.app | head -n 20
```
