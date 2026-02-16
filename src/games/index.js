const even = require("./even");
const calc = require("./calc");
const gcd = require("./gcd");
const progression = require("./progression");
const prime = require("./prime");

const gamesList = [even, calc, gcd, progression, prime];
const gamesByKey = gamesList.reduce((acc, g) => {
  acc[g.key] = g;
  return acc;
}, {});

module.exports = { gamesList, gamesByKey };

