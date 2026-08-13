/**
 * Cargador de recursos MUÑEQUERO para tu app.
 * -------------------------------------------
 * Combina el manifiesto de imágenes (recursos-munequero.json) con la API de
 * las minifiguras 3D (src/characters/MinifigureFactory.ts + src/world/Crowd.ts).
 *
 * IMPORTANTE sobre las imágenes:
 *   Las URLs apuntan al CDN privado de Higgsfield y SOLO cargan con sesión
 *   iniciada. Para producción, descarga cada PNG y sírvelo desde tu propio
 *   hosting; luego cambia BASE por tu ruta local (p.ej. "/assets/munequero/").
 */

import manifest from './recursos-munequero.json';

export type Categoria =
  | 'caratula' | 'pantallas' | 'posters' | 'retratos' | 'objetos'
  | 'vfx' | 'emblemas' | 'escenas' | 'cielos' | 'texturas';

export interface Recurso {
  id: string;        // job id de Higgsfield
  name: string;      // nombre corto
  cat: Categoria;    // categoría
  w: number;         // ancho px
  h: number;         // alto px
  file: string;      // nombre de fichero PNG
  desc: string;      // descripción
}

/** CDN privado de Higgsfield. Cámbialo por tu ruta local en producción. */
export const BASE = manifest.imagenes.acceso.cdnBase;
// export const BASE = '/assets/munequero/';   // ← úsalo cuando descargues los PNG

/** Todos los recursos de imagen (252). */
export const RECURSOS: Recurso[] = manifest.imagenes.items as Recurso[];

/** URL final de un recurso. */
export const urlDe = (r: Recurso): string => BASE + r.file;

/** Filtra por categoría. */
export const porCategoria = (cat: Categoria): Recurso[] =>
  RECURSOS.filter((r) => r.cat === cat);

/** Busca un recurso por su id (job id) o por nombre (parcial, sin distinguir mayúsculas). */
export const buscar = (q: string): Recurso | undefined =>
  RECURSOS.find((r) => r.id === q) ??
  RECURSOS.find((r) => r.name.toLowerCase().includes(q.toLowerCase()));

/** Mapa nombre-normalizado → URL, cómodo para precargar. */
export const catalogoUrls = (): Record<string, string> =>
  Object.fromEntries(RECURSOS.map((r) => [r.id, urlDe(r)]));

/* ---- Atajos por sección ---- */
export const caratula  = () => porCategoria('caratula')[0];
export const retratos  = () => porCategoria('retratos');
export const objetos   = () => porCategoria('objetos');   // inventario
export const texturas  = () => porCategoria('texturas');  // materiales tileables
export const escenas   = () => porCategoria('escenas');
export const cielos    = () => porCategoria('cielos');    // backdrops
export const vfx       = () => porCategoria('vfx');

/* =========================================================================
 * MUÑECOS 3D (geometría por código, NO imágenes). Import directo desde tu app:
 *
 *   import {
 *     createMinifigure, CHARACTER_SKINS, villagerSkin, VILLAGER_PRESETS
 *   } from '../src/characters/MinifigureFactory';
 *   import {
 *     buildCrowd, buildProcessionCrowd, buildNightMarketCrowd
 *   } from '../src/world/Crowd';
 *
 *   // Un héroe:
 *   const yeho = createMinifigure(plastic, CHARACTER_SKINS.yehoshua);
 *   scene.add(yeho.root);
 *   // en el bucle:  yeho.update(dt, moving, speed);
 *
 *   // Skins de héroe disponibles (claves de CHARACTER_SKINS):
 *   //   espia, espia2, espiaCamp, espia2Camp, yehoshua, rahab,
 *   //   guardia, jefeGuardia, sacerdote, beduino, rabino
 *
 *   // Una multitud de aldeanos (20 presets, no se clonan):
 *   const crowd = buildProcessionCrowd(scene, plastic, { mode: 'celebration', rows: 4, perRow: 6 });
 *   // en el bucle:  crowd.update(dt);
 * ======================================================================= */
export const MUNIECOS_3D = manifest.muniecos3D;
