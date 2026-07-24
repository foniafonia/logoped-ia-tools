import { GAME_STATES, LEVELS } from "./data.js";
import { KaboomGame } from "./gameEngine.js";
import { KaboomUI } from "./ui.js";

const game = new KaboomGame();
const ui = new KaboomUI();
let lastConfig = null;

function refresh() {
  ui.renderState(game.getState());
}

function startGame(config) {
  const level = config.level === LEVELS.ADVANCED ? LEVELS.ADVANCED : LEVELS.INITIAL;
  const teamNames = config.teamNames.filter(Boolean);

  if (!teamNames.length) {
    return;
  }

  const payload = {
    level,
    teamNames,
    endMode: config.endMode === "turns" ? "turns" : "sticks",
    maxTurns: Number.isFinite(config.maxTurns) && config.maxTurns > 0 ? config.maxTurns : 20,
  };

  lastConfig = payload;
  game.startGame(payload);
  ui.showGamePanel();
  refresh();
}

function handleDrawStick() {
  const result = game.drawStick();
  if (!result.ok && result.reason === "no_numbered_sticks") {
    refresh();
    return;
  }
  refresh();
}

function handleResolve(success) {
  const state = game.getState();
  if (!state.Pending_Resolution) {
    return;
  }

  if (state.Lightning.active) {
    game.resolveLightning(success);
  } else {
    game.resolveChallenge(success);
  }
  refresh();
}

function handleRestart() {
  if (!lastConfig) {
    return;
  }
  game.startGame(lastConfig);
  refresh();
}

function handleNewConfig() {
  game.resetAll();
  ui.showSetupPanel();
}

function handleLightningStart() {
  const result = game.beginLightningRound();
  if (!result.ok) {
    return;
  }
  refresh();
}

function handleKeepTie() {
  const state = game.getState();
  if (state.Game_State !== GAME_STATES.FINISHED) {
    return;
  }
  game.keepTieResult();
  refresh();
}

function handleDrawLightning() {
  game.nextLightningChallenge();
  refresh();
}

ui.bindSetup({
  onTeamsCountChange: () => {},
  onEndModeChange: () => {},
  onStart: startGame,
});

ui.bindGameActions({
  onDraw: handleDrawStick,
  onSuccess: () => handleResolve(true),
  onFail: () => handleResolve(false),
  onRestart: handleRestart,
  onNewConfig: handleNewConfig,
  onLightning: handleLightningStart,
  onKeepTie: handleKeepTie,
  onDrawLightning: handleDrawLightning,
});
