import type { Story, StoryCatalogEntry } from "../types";

/** Carga el catalogo de historias. Devuelve [] si no existe o falla. */
export async function loadCatalog(url = "stories/index.json"): Promise<StoryCatalogEntry[]> {
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("El catalogo no es una lista.");
    return data as StoryCatalogEntry[];
  } catch (err) {
    console.warn("No se pudo cargar el catalogo de historias:", err);
    return [];
  }
}

/** Carga una historia desde su URL JSON. Lanza error legible si falla. */
export async function loadStory(url: string): Promise<Story> {
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-cache" });
  } catch {
    throw new Error(`No se pudo acceder al archivo de la historia (${url}).`);
  }
  if (!res.ok) {
    throw new Error(`No se pudo cargar la historia (${url}): HTTP ${res.status}.`);
  }
  try {
    return (await res.json()) as Story;
  } catch {
    throw new Error(`El archivo de la historia (${url}) no es un JSON valido.`);
  }
}
