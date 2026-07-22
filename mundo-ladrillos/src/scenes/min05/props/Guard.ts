import { PlasticMaterialFactory } from '../../../materials/PlasticMaterialFactory';
import { Npc } from './Npc';
import { GUARDIA_SKIN, JEFE_GUARDIA_SKIN } from '../skins';

/**
 * GUARDIA DE JERICÓ. Con los muñecos nuevos integrados, el casco cónico
 * plateado, las rayas rojo/amarillo, el escudo y la lanza (o alabarda dorada y
 * capa del jefe) los aporta YA el skin canónico (`GUARD_SKIN`/`GUARD_CHIEF_SKIN`)
 * de forma nativa — así que aquí basta con crear el NPC con ese skin. Se
 * mantiene la función `buildGuard(...)` para que las escenas no cambien.
 */
export function buildGuard(
  plastic: PlasticMaterialFactory, x = 0, z = 0, facing = 0, jefe = false
): Npc {
  return new Npc(plastic, jefe ? JEFE_GUARDIA_SKIN : GUARDIA_SKIN, x, z, facing);
}
