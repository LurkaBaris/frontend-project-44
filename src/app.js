const readlineSync = require("readline-sync");
const chalk = require("chalk");
const { greet } = require("./cli");
const { runGame } = require("./engine");
const { gamesList } = require("./games");
const {
  loadProgress,
  saveProgress,
  hasUser,
  getOrCreateUser,
  resetUserProgress,
  formatProgress,
  PROGRESS_FILE,
} = require("./progress");

const ROUNDS_TO_WIN = 3;

const resolveGameChoice = (choice) => {
  const normalized = String(choice).trim().toLowerCase();
  if (!normalized) return null;

  const idx = Number(normalized);
  if (Number.isInteger(idx)) return gamesList[idx - 1] ?? null;

  return gamesList.find((g) => g.key.toLowerCase() === normalized) ?? null;
};

const pickRandomGame = (previousGameKey) => {
  if (gamesList.length === 0) return null;
  if (gamesList.length === 1) return gamesList[0];

  let next;
  do {
    next = gamesList[Math.floor(Math.random() * gamesList.length)];
  } while (next.key === previousGameKey);

  return next;
};

const printMainMenu = (user) => {
  console.log("");
  console.log(chalk.bold.cyan("=== Brain Games ==="));
  console.log(`${chalk.bold("User:")} ${chalk.yellow(user.nickname)}`);
  console.log(
    chalk.dim("Press Enter to start a random game (no repeats in a row).")
  );
  console.log(chalk.dim("Or choose a game by number / key:"));

  gamesList.forEach((g, idx) => {
    console.log(
      `  ${chalk.bold(String(idx + 1))}) ${g.title} ${chalk.dim(`(${g.key})`)}`
    );
  });

  console.log("");
  console.log(`  ${chalk.bold("p")} - progress`);
  console.log(`  ${chalk.bold("r")} - reset progress`);
  console.log(`  ${chalk.bold("0")} - exit`);
};

const EXIT_ALIASES = ["0", "exit", "q"];
const isExitChoice = (choiceLower) => EXIT_ALIASES.includes(choiceLower);
const isProgressChoice = (choiceLower) =>
  choiceLower === "p" || choiceLower === "progress";
const isResetChoice = (choiceLower) =>
  choiceLower === "r" || choiceLower === "reset";

const getSelectedGame = (choice, previousGameKey) =>
  choice.trim() === ""
    ? pickRandomGame(previousGameKey)
    : resolveGameChoice(choice);

const runApp = () => {
  const store = loadProgress();
  const name = greet();
  const existed = hasUser(store, name);
  const user = getOrCreateUser(store, name);
  saveProgress(store);

  console.log(
    chalk.dim(existed ? "Loaded your saved progress." : "Created a new profile for you.")
  );

  let previousGameKey = null;

  while (true) {
    printMainMenu(user);
    if (process.stdin.readableEnded || !process.stdin.readable) {
      saveProgress(store);
      console.log(`Bye, ${name}!`);
      return;
    }
    let choice;
    try {
      const raw = readlineSync.question(chalk.bold("> "));
      if (raw === undefined || raw === null) {
        saveProgress(store);
        console.log(`Bye, ${name}!`);
        return;
      }
      choice = raw.trim();
    } catch (_e) {
      saveProgress(store);
      console.log(`Bye, ${name}!`);
      return;
    }
    const choiceLower = choice.toLowerCase();

    if (isExitChoice(choiceLower)) {
      saveProgress(store);
      console.log(`Bye, ${name}!`);
      return;
    }

    if (isProgressChoice(choiceLower)) {
      console.log(formatProgress(user, gamesList));
      console.log(chalk.dim(`Saved at: ${PROGRESS_FILE}`));
      continue;
    }

    if (isResetChoice(choiceLower)) {
      resetUserProgress(store, user.nickname);
      saveProgress(store);
      console.log(chalk.yellow("Progress reset."));
      continue;
    }

    const game = getSelectedGame(choice, previousGameKey);
    if (!game) {
      console.log(chalk.red("Unknown choice. Try again."));
      continue;
    }

    previousGameKey = game.key;
    console.log("");
    console.log(chalk.bold.magenta(`--- ${game.title} ---`));

    const result = runGame(game, {
      playerName: name,
      store,
      user,
      roundsCount: ROUNDS_TO_WIN,
      showCongratulations: false,
    });

    if (result?.exited) {
      saveProgress(store);
      console.log(`Bye, ${name}!`);
      return;
    }
  }
};

module.exports = { runApp };
