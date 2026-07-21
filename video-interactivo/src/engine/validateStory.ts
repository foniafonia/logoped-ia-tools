import type { Story, StoryNode } from "../types";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

const VALID_TYPES = new Set([
  "video",
  "image",
  "feedback",
  "choice",
  "ending",
  "pause",
  "observation",
]);

const VALID_TONES = new Set([
  "positive",
  "reflective",
  "neutral",
  "consequence",
  "repair",
  "observation",
]);

/**
 * Valida la estructura de una historia.
 *
 * Comprueba referencias rotas, tipos desconocidos, tonos invalidos y, muy
 * importante, detecta CICLOS de avance automatico que provocarian un bucle
 * infinito (nodos encadenados por `next` sin ninguna interaccion del usuario).
 */
export function validateStory(story: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!story || typeof story !== "object") {
    return { ok: false, errors: ["La historia no es un objeto valido."], warnings };
  }

  const s = story as Partial<Story>;

  if (!s.id) errors.push("Falta el campo obligatorio 'id'.");
  if (!s.title) errors.push("Falta el campo obligatorio 'title'.");
  if (!s.startNode) errors.push("Falta el campo obligatorio 'startNode'.");
  if (!s.nodes || typeof s.nodes !== "object") {
    errors.push("Falta el objeto 'nodes' o no es valido.");
    return { ok: errors.length === 0, errors, warnings };
  }

  const nodes = s.nodes as Record<string, StoryNode>;
  const nodeIds = Object.keys(nodes);

  if (nodeIds.length === 0) errors.push("La historia no tiene nodos.");

  if (s.startNode && !nodes[s.startNode]) {
    errors.push(`El nodo inicial '${s.startNode}' no existe.`);
  }

  // Validacion por nodo.
  for (const id of nodeIds) {
    const node = nodes[id];
    const where = `Nodo '${id}'`;

    if (!node || typeof node !== "object") {
      errors.push(`${where}: no es un objeto valido.`);
      continue;
    }
    if (!node.type || !VALID_TYPES.has(node.type)) {
      errors.push(`${where}: tipo desconocido o ausente ('${node.type}').`);
    }

    // Referencias de 'next'.
    if (node.next && !nodes[node.next]) {
      errors.push(`${where}: 'next' apunta a un nodo inexistente '${node.next}'.`);
    }

    // Opciones.
    if (node.choices) {
      if (!Array.isArray(node.choices)) {
        errors.push(`${where}: 'choices' debe ser una lista.`);
      } else {
        const seen = new Set<string>();
        node.choices.forEach((c, i) => {
          if (!c || typeof c !== "object") {
            errors.push(`${where}: la opcion ${i} no es valida.`);
            return;
          }
          if (!c.id) errors.push(`${where}: la opcion ${i} no tiene 'id'.`);
          if (c.id && seen.has(c.id)) {
            errors.push(`${where}: id de opcion duplicado '${c.id}'.`);
          }
          if (c.id) seen.add(c.id);
          if (!c.label && !c.image) {
            warnings.push(`${where}: la opcion '${c.id}' no tiene texto ni imagen.`);
          }
          if (!c.next) {
            errors.push(`${where}: la opcion '${c.id}' no tiene 'next'.`);
          } else if (!nodes[c.next]) {
            errors.push(
              `${where}: la opcion '${c.id}' apunta a un nodo inexistente '${c.next}'.`
            );
          }
        });
      }
    }

    // Feedback.
    if (node.feedback?.tone && !VALID_TONES.has(node.feedback.tone)) {
      warnings.push(`${where}: tono de feedback desconocido '${node.feedback.tone}'.`);
    }

    // Nodos que deben terminar la rama.
    const hasExit =
      Boolean(node.next) ||
      (node.choices && node.choices.length > 0) ||
      node.type === "ending";
    if (!hasExit) {
      warnings.push(
        `${where}: no tiene salida ('next', 'choices' ni es 'ending'). La rama terminara aqui.`
      );
    }
  }

  // Deteccion de bucles infinitos de avance automatico.
  // Un nodo "auto-avanza" si NO tiene opciones y SI tiene 'next'.
  // Un ciclo cerrado entre nodos auto-avanzables no puede detenerse.
  detectAutoAdvanceCycles(nodes, errors);

  return { ok: errors.length === 0, errors, warnings };
}

function isAutoAdvance(node: StoryNode): boolean {
  const hasChoices = Boolean(node.choices && node.choices.length > 0);
  return !hasChoices && Boolean(node.next) && node.type !== "ending";
}

function detectAutoAdvanceCycles(
  nodes: Record<string, StoryNode>,
  errors: string[]
): void {
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color: Record<string, number> = {};

  const visit = (id: string, path: string[]): void => {
    const node = nodes[id];
    if (!node || !isAutoAdvance(node) || !node.next) {
      color[id] = BLACK;
      return;
    }
    color[id] = GRAY;
    const nextId = node.next;
    const nextNode = nodes[nextId];

    if (nextNode && isAutoAdvance(nextNode)) {
      if (color[nextId] === GRAY) {
        errors.push(
          `Bucle infinito de avance automatico detectado: ${[...path, id, nextId].join(" -> ")}.`
        );
      } else if (color[nextId] !== BLACK) {
        visit(nextId, [...path, id]);
      }
    }
    color[id] = BLACK;
  };

  for (const id of Object.keys(nodes)) {
    if (color[id] === undefined || color[id] === WHITE) {
      visit(id, []);
    }
  }
}
