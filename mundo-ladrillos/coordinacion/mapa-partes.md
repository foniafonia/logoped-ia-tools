# MAPA DE PARTES DEL JUEGO (para iterar con feedback preciso)

Cada escena lleva una **chapita** (`src/ui/SceneTag.ts`) con su código. Cuando el
usuario juega y algo falla, pulsa **📋 Copiar** o manda captura; con el código de
abajo sabemos al instante **qué hilo**, **qué archivo** y **qué audio**.

> Lo mantiene MUÑEQUERO (visor). Hilos: si añadís/movéis escenas, decidlo en
> vuestro archivo del tablón y actualizo aquí. Rellenad el AUDIO real de cada una.

| Código | Parte | Tramo | Hilo | Archivo | Modo horizonte | Audio (por confirmar) |
|---|---|---|---|---|---|---|
| C1 | Campamento de Israel | 0–5 | LEAD | `scenes/min00/camp.ts` | desierto-atardecer | bso_camp + voces |
| E9 | Orilla del Jordán | 5–10 | min05 | `escena09_orilla_jordan.ts` | rio-oasis | bso_min5-10 |
| E10 | Reclutar espías | 5–10 | min05 | `escena10_reclutar_espias.ts` | desierto-atardecer | voz_10 |
| E11 | Murallas de noche | 5–10 | min05 | `escena11_murallas_noche.ts` | muralla-noche | bso_jerico |
| E12 | Trajes de sigilo | 5–10 | min05 | `escena12_trajes_sigilo.ts` | desierto-noche | voz_12 |
| E13 | Cruzar el río (cuerda) | 5–10 | min05 | `escena13_cruzar_rio.ts` | rio-oasis (noche) | bso_sigilo |
| E14 | Treta del avión | 5–10 | min05 | `escena14_treta_avion.ts` | calle-noche | voz_14 + avion |
| E15 | Colarse por la puerta | 5–10 | min05 | `escena15_colarse_puerta.ts` | calle-noche | bso_jerico |
| E16 | Guardias en las calles | 5–10 | min05 | `escena16_guardias_calles.ts` | calle-noche | bso_jerico |
| E18 | Restaurante de Rahab (taberna) | 5–10 | integrador/min05 | (interior) | — interior — | voz_rahab |
| E19 | ¡Escóndete! (tapiz/maceta) | 5–10 | integrador/min05 | (azotea/calle) | calle-noche | bso_sigilo |
| E20 | El cordón rojo | 5–10 | integrador/min05 | (balcón) | calle-noche | voz_cordon |
| E34 | El Jordán se parte | conquista | integrador | (cruce) | rio-oasis | bso_milagro |
| M1 | La muralla (clímax) | muralla | LEAD | `Army/ShofarInteraction/Combat` | muralla-noche/amanecer | bso_muralla + shofar |

*(Códigos provisionales; se ajustan según confirmen los hilos. Interiores no llevan
modo de horizonte: se visten con paredes/props.)*
