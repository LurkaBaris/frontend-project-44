const { randomInt } = require("../utils");

const PROGRESSION_LENGTH = 10;
const START_MIN = 1;
const START_MAX = 20;
const STEP_MIN = 2;
const STEP_MAX = 10;
const HIDDEN_INDEX_MIN = 0;

const game = {
  key: "progression",
  title: "Progression",
  description: "Find the missing number in the progression.",
  getRound: () => {
    const start = randomInt(START_MIN, START_MAX);
    const step = randomInt(STEP_MIN, STEP_MAX);
    const hiddenIndex = randomInt(HIDDEN_INDEX_MIN, PROGRESSION_LENGTH - 1);

    const progression = Array.from(
      { length: PROGRESSION_LENGTH },
      (_v, i) => start + step * i
    );
    const answer = String(progression[hiddenIndex]);
    progression[hiddenIndex] = "..";

    return { question: progression.join(" "), answer };
  },
};

module.exports = game;
