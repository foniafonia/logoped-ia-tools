import type { Choice, Story, StoryNode } from "../types";
import { validateStory, type ValidationResult } from "./validateStory";

/** Un paso registrado en el recorrido de la historia. */
export interface HistoryStep {
  nodeId: string;
  /** Id de la opcion elegida para SALIR de este nodo (si la hubo). */
  choiceId?: string;
}

export type EngineEventType =
  | "node"
  | "choice"
  | "back"
  | "replay"
  | "restart"
  | "end"
  | "error";

export interface EngineEvent {
  type: EngineEventType;
  nodeId: string;
  node: StoryNode;
  choice?: Choice;
  message?: string;
}

type Listener = (event: EngineEvent) => void;

/**
 * Limite de avances automaticos consecutivos SIN interaccion del usuario.
 * Es una red de seguridad extra frente a bucles que el validador no cubra.
 */
const MAX_AUTO_ADVANCE = 50;

/**
 * Motor de historias. No toca el DOM: gestiona el grafo, el historial y las
 * reglas de navegacion, y notifica a los suscriptores mediante eventos.
 */
export class StoryEngine {
  readonly story: Story;
  private currentId: string;
  /** Pila de nodos visitados (para "volver atras"). */
  private history: HistoryStep[] = [];
  private listeners = new Set<Listener>();
  private autoAdvanceCount = 0;

  private constructor(story: Story) {
    this.story = story;
    this.currentId = story.startNode;
  }

  /**
   * Crea un motor validando primero la historia. Lanza error si es invalida
   * para evitar arrancar una historia rota (referencias, bucles, etc.).
   */
  static create(story: Story): StoryEngine {
    const result = validateStory(story);
    if (!result.ok) {
      throw new StoryValidationError(result);
    }
    return new StoryEngine(story);
  }

  static validate(story: unknown): ValidationResult {
    return validateStory(story);
  }

  // --- Suscripcion ---
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: EngineEvent): void {
    for (const l of this.listeners) l(event);
  }

  // --- Estado ---
  get currentNodeId(): string {
    return this.currentId;
  }

  get currentNode(): StoryNode {
    return this.story.nodes[this.currentId];
  }

  canGoBack(): boolean {
    if (this.story.settings?.allowBack === false) return false;
    return this.history.length > 0;
  }

  /** Recorrido realizado (copia inmutable). */
  getPath(): HistoryStep[] {
    return [...this.history, { nodeId: this.currentId }];
  }

  // --- Navegacion ---

  /** Comienza la historia en el nodo inicial. */
  start(): void {
    this.currentId = this.story.startNode;
    this.history = [];
    this.autoAdvanceCount = 0;
    this.enterNode("node");
  }

  /** Elige una opcion del nodo actual y avanza al nodo destino. */
  choose(choiceId: string): void {
    const node = this.currentNode;
    const choice = node.choices?.find((c) => c.id === choiceId);
    if (!choice) {
      this.emit({
        type: "error",
        nodeId: this.currentId,
        node,
        message: `La opcion '${choiceId}' no existe en el nodo actual.`,
      });
      return;
    }
    // Cualquier eleccion del usuario reinicia el contador de seguridad.
    this.autoAdvanceCount = 0;
    this.history.push({ nodeId: this.currentId, choiceId });
    this.currentId = choice.next;
    this.enterNode("node", choice);
  }

  /** Avanza por el `next` automatico del nodo actual (si existe). */
  advance(): void {
    const node = this.currentNode;
    if (!node.next) return;

    if (this.autoAdvanceCount >= MAX_AUTO_ADVANCE) {
      this.emit({
        type: "error",
        nodeId: this.currentId,
        node,
        message:
          "Se ha alcanzado el limite de avances automaticos. Posible bucle en la historia.",
      });
      return;
    }
    this.autoAdvanceCount++;
    this.history.push({ nodeId: this.currentId });
    this.currentId = node.next;
    this.enterNode("node");
  }

  /** Vuelve al nodo anterior del historial. */
  back(): void {
    if (!this.canGoBack()) return;
    const previous = this.history.pop();
    if (!previous) return;
    this.autoAdvanceCount = 0;
    this.currentId = previous.nodeId;
    this.emit({ type: "back", nodeId: this.currentId, node: this.currentNode });
  }

  /** Repite el clip / nodo actual (sin cambiar de nodo). */
  replay(): void {
    this.emit({ type: "replay", nodeId: this.currentId, node: this.currentNode });
  }

  /** Salta directamente a un nodo (usado por "probar otra ruta"). */
  goto(nodeId: string): void {
    if (!this.story.nodes[nodeId]) {
      this.emit({
        type: "error",
        nodeId: this.currentId,
        node: this.currentNode,
        message: `No existe el nodo '${nodeId}'.`,
      });
      return;
    }
    this.autoAdvanceCount = 0;
    this.history.push({ nodeId: this.currentId });
    this.currentId = nodeId;
    this.enterNode("node");
  }

  /** Reinicia la historia desde el principio. */
  restart(): void {
    this.currentId = this.story.startNode;
    this.history = [];
    this.autoAdvanceCount = 0;
    this.emit({ type: "restart", nodeId: this.currentId, node: this.currentNode });
    this.enterNode("node");
  }

  private enterNode(type: EngineEventType, choice?: Choice): void {
    const node = this.currentNode;
    if (!node) {
      this.emit({
        type: "error",
        nodeId: this.currentId,
        node: {} as StoryNode,
        message: `El nodo '${this.currentId}' no existe.`,
      });
      return;
    }
    this.emit({ type, nodeId: this.currentId, node, choice });
    if (node.type === "ending") {
      this.emit({ type: "end", nodeId: this.currentId, node });
    }
  }
}

export class StoryValidationError extends Error {
  readonly result: ValidationResult;
  constructor(result: ValidationResult) {
    super(`Historia invalida:\n${result.errors.join("\n")}`);
    this.name = "StoryValidationError";
    this.result = result;
  }
}
