const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const gcd = (a, b) => {
  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }

  return x;
};

const isPrime = (n) => {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;

  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }

  return true;
};

module.exports = { randomInt, gcd, isPrime };
