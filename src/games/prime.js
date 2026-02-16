const { randomInt, isPrime } = require("../utils");

const MIN_NUMBER = 1;
const MAX_NUMBER = 200;

const game = {
  key: "prime",
  title: "Prime",
  description: 'Answer "yes" if the number is prime; otherwise answer "no".',
  getRound: () => {
    const n = randomInt(MIN_NUMBER, MAX_NUMBER);
    return { question: String(n), answer: isPrime(n) ? "yes" : "no" };
  },
};

module.exports = game;
