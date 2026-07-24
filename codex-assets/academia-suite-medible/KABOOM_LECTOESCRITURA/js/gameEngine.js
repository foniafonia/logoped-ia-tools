import {
  ADVANCED_BOARD,
  ADVANCED_DATABASE,
  ADVANCED_SLOT_TYPES,
  GAME_STATES,
  INITIAL_BOARD,
  INITIAL_DATABASE,
  INITIAL_SLOT_TYPES,
  LEVELS,
  READ_AS_IF,
  SLOT_TYPE,
  STICK_CONFIG,
} from "./data.js";

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export class KaboomGame {
  constructor() {
    this.resetAll();
  }

  resetAll() {
    this.stickPool = [];
    this.teams = [];
    this.activeTeamIndex = 0;
    this.teamInventory = [];
    this.gameLevel = LEVELS.INITIAL;
    this.gameState = GAME_STATES.FINISHED;
    this.lastDrawnStick = null;
    this.currentChallenge = null;
    this.pendingResolution = false;
    this.endMode = "sticks";
    this.maxTurns = null;
    this.turnsPlayed = 0;
    this.lastFeedback = null;
    this.lightning = {
      active: false,
      tiedTeams: [],
      queuePos: 0,
      round: 0,
    };
    this.winners = [];
  }

  startGame({ teamNames, level, endMode, maxTurns }) {
    this.resetAll();
    this.teams = teamNames;
    this.teamInventory = teamNames.map(() => []);
    this.activeTeamIndex = 0;
    this.gameLevel = level;
    this.gameState = GAME_STATES.PLAYING;
    this.endMode = endMode;
    this.maxTurns = endMode === "turns" ? Number(maxTurns) : null;

    const numbered = Array.from({ length: STICK_CONFIG.numberedCount }, (_, i) => ({
      type: "NUMBER",
      value: i + 1,
    }));
    const kaboom = Array.from({ length: STICK_CONFIG.kaboomCount }, () => ({
      type: "KABOOM",
      value: null,
    }));

    this.stickPool = shuffle([...numbered, ...kaboom]);
  }

  getState() {
    return {
      Stick_Pool: this.stickPool,
      Numbered_Sticks: this.stickPool.filter((s) => s.type === "NUMBER").map((s) => s.value),
      KABOOM_Sticks: this.stickPool.filter((s) => s.type === "KABOOM"),
      Teams: this.teams,
      Active_Team_Index: this.activeTeamIndex,
      Team_Inventory: this.teamInventory,
      Game_Level: this.gameLevel,
      Game_State: this.gameState,
      Last_Drawn_Stick: this.lastDrawnStick,
      Current_Challenge: this.currentChallenge,
      Pending_Resolution: this.pendingResolution,
      End_Mode: this.endMode,
      Max_Turns: this.maxTurns,
      Turns_Played: this.turnsPlayed,
      Last_Feedback: this.lastFeedback,
      Lightning: this.lightning,
      Winners: this.winners,
    };
  }

  drawStick() {
    if (this.gameState !== GAME_STATES.PLAYING || this.pendingResolution || this.lightning.active) {
      return { ok: false, reason: "invalid_state" };
    }

    const numberedRemaining = this.countNumberedInPool();
    if (numberedRemaining === 0) {
      this.finishGame();
      return { ok: false, reason: "no_numbered_sticks" };
    }

    const stickIndex = Math.floor(Math.random() * this.stickPool.length);
    const drawn = this.stickPool.splice(stickIndex, 1)[0];
    this.lastDrawnStick = drawn;

    if (drawn.type === "KABOOM") {
      this.teamInventory[this.activeTeamIndex] = [];
      this.currentChallenge = null;
      this.pendingResolution = false;
      this.lastFeedback = {
        type: "KABOOM",
        message: "KABOOM 💥",
      };
      this.completeTurn();
      return { ok: true, event: "kaboom" };
    }

    this.currentChallenge = this.buildChallenge(drawn.value);
    this.pendingResolution = true;
    this.lastFeedback = null;

    return {
      ok: true,
      event: "numbered",
      challenge: this.currentChallenge,
    };
  }

  resolveChallenge(success) {
    if (!this.pendingResolution || !this.currentChallenge || this.lightning.active) {
      return { ok: false, reason: "no_pending_challenge" };
    }

    if (success) {
      this.teamInventory[this.activeTeamIndex].push({
        type: "NUMBER",
        value: this.currentChallenge.stickNumber,
      });
      this.lastFeedback = {
        type: "SUCCESS",
        message: "Acierto ✅ Palito ganado",
      };
    } else {
      this.lastFeedback = {
        type: "FAIL",
        message: "Fallo ❌ Turno perdido",
      };
    }

    this.currentChallenge = null;
    this.pendingResolution = false;
    this.completeTurn();

    return { ok: true };
  }

  beginLightningRound() {
    if (this.gameState !== GAME_STATES.FINISHED) {
      return { ok: false, reason: "not_finished" };
    }

    const topTeams = this.getTiedTopTeams();
    if (topTeams.length < 2) {
      return { ok: false, reason: "no_tie" };
    }

    this.lightning = {
      active: true,
      tiedTeams: topTeams,
      queuePos: 0,
      round: 1,
    };
    this.gameState = GAME_STATES.PLAYING;
    this.activeTeamIndex = topTeams[0];
    this.lastFeedback = {
      type: "LIGHTNING_START",
      message: "Ronda relámpago activada ⚡",
    };
    return { ok: true };
  }

  nextLightningChallenge() {
    if (!this.lightning.active || this.pendingResolution || this.gameState !== GAME_STATES.PLAYING) {
      return { ok: false, reason: "invalid_lightning_state" };
    }

    const teamIndex = this.lightning.tiedTeams[this.lightning.queuePos];
    this.activeTeamIndex = teamIndex;

    const slotTypes = this.gameLevel === LEVELS.INITIAL ? INITIAL_SLOT_TYPES : ADVANCED_SLOT_TYPES;
    const randomIndex = Math.floor(Math.random() * slotTypes.length);
    const pseudoStick = randomIndex + 1;

    this.currentChallenge = {
      ...this.buildChallenge(pseudoStick),
      stickNumber: null,
      slotLabel: "Ronda relámpago",
      lightningRound: this.lightning.round,
    };
    this.pendingResolution = true;

    return { ok: true, challenge: this.currentChallenge };
  }

  resolveLightning(success) {
    if (!this.lightning.active || !this.pendingResolution || !this.currentChallenge) {
      return { ok: false, reason: "no_pending_lightning" };
    }

    if (success) {
      this.teamInventory[this.activeTeamIndex].push({
        type: "LIGHTNING",
        value: `L${this.lightning.round}-${this.activeTeamIndex + 1}`,
      });
      this.lastFeedback = {
        type: "SUCCESS",
        message: "Acierto en relámpago ✅ +1 palito",
      };
    } else {
      this.lastFeedback = {
        type: "FAIL",
        message: "Fallo en relámpago ❌",
      };
    }

    this.currentChallenge = null;
    this.pendingResolution = false;

    this.lightning.queuePos += 1;
    if (this.lightning.queuePos >= this.lightning.tiedTeams.length) {
      const topTeams = this.getTiedTopTeams();
      if (topTeams.length === 1) {
        this.lightning.active = false;
        this.finishGame();
        return { ok: true, finished: true };
      }
      this.lightning.round += 1;
      this.lightning.queuePos = 0;
      this.lightning.tiedTeams = topTeams;
    }

    this.activeTeamIndex = this.lightning.tiedTeams[this.lightning.queuePos];
    return { ok: true, finished: false };
  }

  keepTieResult() {
    if (this.gameState !== GAME_STATES.FINISHED) {
      return { ok: false, reason: "not_finished" };
    }
    return { ok: true };
  }

  buildChallenge(stickNumber) {
    const isInitial = this.gameLevel === LEVELS.INITIAL;
    const slotLabels = isInitial ? INITIAL_BOARD : ADVANCED_BOARD;
    const slotTypes = isInitial ? INITIAL_SLOT_TYPES : ADVANCED_SLOT_TYPES;
    const slotIndex = stickNumber - 1;
    const slotLabel = slotLabels[slotIndex];
    const slotType = slotTypes[slotIndex];

    const challenge = {
      stickNumber,
      slotLabel,
      slotType,
      instruction: "",
      metadata: {},
    };

    if (slotType === SLOT_TYPE.READ_AS_IF) {
      challenge.instruction = randomItem(READ_AS_IF);
    }

    if (slotType === SLOT_TYPE.DRAW_PHRASE) {
      challenge.instruction = randomItem(INITIAL_DATABASE.drawPhrase);
    }

    if (slotType === SLOT_TYPE.WRITE_WORD) {
      challenge.instruction = randomItem(INITIAL_DATABASE.writeWord);
    }

    if (slotType === SLOT_TYPE.GESTURE_INITIAL) {
      challenge.instruction = randomItem(INITIAL_DATABASE.gesture);
    }

    if (slotType === SLOT_TYPE.STARTS_WITH) {
      const set = randomItem(INITIAL_DATABASE.startsWithSets);
      challenge.instruction = `Di una palabra que empiece por: ${randomItem(set)}`;
      challenge.metadata.letterSet = [...set];
    }

    if (slotType === SLOT_TYPE.CORRECT_SENTENCE) {
      challenge.instruction = randomItem(ADVANCED_DATABASE.correctSentence);
    }

    if (slotType === SLOT_TYPE.WRITE_SENTENCE_REQUIRED || slotType === SLOT_TYPE.WRITE_SENTENCE) {
      const words = randomItem(ADVANCED_DATABASE.requiredWords);
      challenge.instruction = "Escribe una oración usando estas palabras obligatorias:";
      challenge.metadata.requiredWords = [...words];
    }

    if (slotType === SLOT_TYPE.EXPLAIN_WITHOUT_FORBIDDEN) {
      const pair = randomItem(ADVANCED_DATABASE.explainWithoutForbidden);
      challenge.instruction = `Explica: ${pair.concept}`;
      challenge.metadata.forbiddenWord = pair.forbidden;
    }

    if (slotType === SLOT_TYPE.GESTURE_ADVANCED) {
      challenge.instruction = randomItem(ADVANCED_DATABASE.advancedGesture);
    }

    return challenge;
  }

  completeTurn() {
    this.turnsPlayed += 1;

    const noNumbered = this.countNumberedInPool() === 0;
    const turnsLimitReached =
      this.endMode === "turns" &&
      Number.isFinite(this.maxTurns) &&
      this.turnsPlayed >= this.maxTurns;

    if (noNumbered || turnsLimitReached) {
      this.finishGame();
      return;
    }

    this.nextTeam();
  }

  finishGame() {
    this.gameState = GAME_STATES.FINISHED;
    this.pendingResolution = false;
    this.currentChallenge = null;
    this.winners = this.getTiedTopTeams();
  }

  nextTeam() {
    this.activeTeamIndex = (this.activeTeamIndex + 1) % this.teams.length;
  }

  countNumberedInPool() {
    return this.stickPool.reduce((acc, stick) => acc + (stick.type === "NUMBER" ? 1 : 0), 0);
  }

  getScores() {
    return this.teamInventory.map((sticks, index) => ({
      teamIndex: index,
      name: this.teams[index],
      score: sticks.length,
      sticks,
    }));
  }

  getTiedTopTeams() {
    const scores = this.getScores();
    const maxScore = Math.max(...scores.map((s) => s.score));
    return scores.filter((s) => s.score === maxScore).map((s) => s.teamIndex);
  }
}
