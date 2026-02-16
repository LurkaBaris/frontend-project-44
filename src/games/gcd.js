const { randomInt, gcd } = require("../utils");

const MIN_NUMBER = 1;
const MAX_NUMBER = 100;

const game = {
  key: "gcd",
  title: "GCD",
  description: "Find the greatest common divisor of given numbers.",
  getRound: () => {
    const a = randomInt(MIN_NUMBER, MAX_NUMBER);
    const b = randomInt(MIN_NUMBER, MAX_NUMBER);
    return { question: `${a} ${b}`, answer: String(gcd(a, b)) };
  },
};

module.exports = game;

