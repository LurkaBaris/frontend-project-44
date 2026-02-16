const { randomInt } = require("../utils");

const MIN_NUMBER = 1;
const MAX_NUMBER = 100;

const game = {
  key: "even",
  title: "Even",
  description: 'Answer "yes" if the number is even; otherwise answer "no".',
  getRound: () => {
    const n = randomInt(MIN_NUMBER, MAX_NUMBER);
    return { question: String(n), answer: n % 2 === 0 ? "yes" : "no" };
  },
};

module.exports = game;
