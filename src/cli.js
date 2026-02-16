const readlineSync = require("readline-sync");

const greet = () => {
  console.log("Welcome to the Brain Games!");
  let name = "";
  while (!name) {
    name = readlineSync.question("May I have your name? ").trim();
  }
  console.log(`Hello, ${name}!`);
  return name;
};

module.exports = { greet };
