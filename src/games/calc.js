const { randomInt } = require("../utils");

const OPS = ["+", "-", "*"];
const OPERAND_MIN = 1;
const OPERAND_MAX = 25;
const OPS_FIRST_INDEX = 0;

const compute = (a, b, op) => {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    default:
      return a + b;
  }
};

const game = {
  key: "calc",
  title: "Calc",
  description: "Calculate the result of the expression.",
  getRound: () => {
    const a = randomInt(OPERAND_MIN, OPERAND_MAX);
    const b = randomInt(OPERAND_MIN, OPERAND_MAX);
    const op = OPS[randomInt(OPS_FIRST_INDEX, OPS.length - 1)];

    const answer = compute(a, b, op);

    return { question: `${a} ${op} ${b}`, answer: String(answer) };
  },
};

module.exports = game;
