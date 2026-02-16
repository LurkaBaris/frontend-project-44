const readlineSync = require("readline-sync");
const chalk = require("chalk");
const { greet } = require("./cli");
const {
  loadProgress,
  saveProgress,
  getOrCreateUser,
  recordRound,
} = require("./progress");

const EXIT_COMMAND = "exit";

const runGame = (game, options = {}) => {
  const name = options.playerName ?? greet();
  const store = options.store ?? loadProgress();
  const user = options.user ?? getOrCreateUser(store, name);
  const roundsCount = Number.isInteger(options.roundsCount)
    ? options.roundsCount
    : Infinity;
  const showCongratulations = options.showCongratulations !== false;

  console.log(chalk.dim(game.description));
  console.log(chalk.dim(`Type '${EXIT_COMMAND}' to exit.`));

  let roundsPlayed = 0;

  while (true) {
    const { question, answer } = game.getRound();
    console.log(`${chalk.bold("Question:")} ${question}`);
    let userAnswerRaw;
    try {
      userAnswerRaw = readlineSync.question(chalk.bold("Your answer: "));
    } catch (_e) {
      saveProgress(store);
      return { exited: true };
    }
    if (userAnswerRaw === undefined || userAnswerRaw === null) {
      saveProgress(store);
      return { exited: true };
    }
    userAnswerRaw = userAnswerRaw.trim();
    const userAnswer =
      userAnswerRaw.toLowerCase() === EXIT_COMMAND
        ? EXIT_COMMAND
        : userAnswerRaw;

    if (userAnswer === EXIT_COMMAND) {
      saveProgress(store);
      return { exited: true };
    }

    const isCorrect = userAnswerRaw === String(answer);
    recordRound(user, game.key, isCorrect);
    saveProgress(store);

    if (!isCorrect) {
      console.log(
        chalk.red(
          `'${userAnswerRaw}' is wrong answer ;(. Correct answer was '${answer}'.`
        )
      );
      console.log(chalk.yellow(`Let's try again, ${name}!`));

      if (roundsCount !== Infinity) {
        return { failed: true };
      }

      continue;
    }

    console.log(chalk.green("Correct!"));
    roundsPlayed += 1;

    if (roundsPlayed >= roundsCount) {
      if (showCongratulations) {
        console.log(chalk.green(`Congratulations, ${name}!`));
      }
      return { completed: true };
    }
  }
};

module.exports = { runGame, EXIT_COMMAND };
