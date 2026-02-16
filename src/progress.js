const fs = require("fs");
const path = require("path");

const PROGRESS_DIR = path.resolve(__dirname, "..", "data");
const PROGRESS_FILE = path.join(PROGRESS_DIR, "progress.json");

const Table = require("cli-table3");
const chalk = require("chalk");

const nowIso = () => new Date().toISOString();

const defaultStore = () => ({
  version: 2,
  updatedAt: nowIso(),
  users: {},
});

const defaultUser = (nickname) => ({
  nickname,
  createdAt: nowIso(),
  lastPlayedAt: null,
  games: {},
});

const defaultGameStats = () => ({
  rounds: 0,
  correct: 0,
  wrong: 0,
  bestStreak: 0,
  currentStreak: 0,
  lastPlayedAt: null,
});

const ensureDir = () => {
  fs.mkdirSync(PROGRESS_DIR, { recursive: true });
};

const normalizeNickname = (nickname) => String(nickname ?? "").trim();

const nicknameKey = (nickname) => {
  const trimmed = normalizeNickname(nickname);
  if (!trimmed) return null;
  return trimmed.toLowerCase();
};

const mergeGameStats = (a, b) => ({
  rounds: (a.rounds ?? 0) + (b.rounds ?? 0),
  correct: (a.correct ?? 0) + (b.correct ?? 0),
  wrong: (a.wrong ?? 0) + (b.wrong ?? 0),
  bestStreak: Math.max(a.bestStreak ?? 0, b.bestStreak ?? 0),
  currentStreak: Math.max(a.currentStreak ?? 0, b.currentStreak ?? 0),
  lastPlayedAt:
    a.lastPlayedAt && b.lastPlayedAt
      ? String(a.lastPlayedAt) > String(b.lastPlayedAt)
        ? a.lastPlayedAt
        : b.lastPlayedAt
      : a.lastPlayedAt ?? b.lastPlayedAt ?? null,
});

const normalizeUsers = (users) => {
  const result = {};
  for (const [key, rawUser] of Object.entries(users ?? {})) {
    const rawNickname =
      rawUser && typeof rawUser === "object" && rawUser.nickname
        ? rawUser.nickname
        : key;
    const nickname = normalizeNickname(rawNickname);
    const keyNormalized = nicknameKey(nickname);
    if (!keyNormalized) continue;

    const base = result[keyNormalized] ?? defaultUser(nickname);
    const nextUser = rawUser && typeof rawUser === "object" ? rawUser : {};

    const merged = {
      ...base,
      ...nextUser,
      nickname: base.nickname || nickname,
      games: { ...(base.games ?? {}) },
    };

    const games =
      nextUser.games && typeof nextUser.games === "object"
        ? nextUser.games
        : {};
    for (const [gameKey, statsRaw] of Object.entries(games)) {
      const stats = statsRaw && typeof statsRaw === "object" ? statsRaw : {};
      merged.games[gameKey] = merged.games[gameKey]
        ? mergeGameStats(merged.games[gameKey], stats)
        : mergeGameStats(defaultGameStats(), stats);
    }

    result[keyNormalized] = merged;
  }

  return result;
};

const normalizeStore = (data) => {
  if (!data || typeof data !== "object") return defaultStore();

  // Legacy v1: { games: {...} }
  if (data.games && typeof data.games === "object" && !data.users) {
    const store = defaultStore();
    store.users.legacy = defaultUser("legacy");
    store.users.legacy.games = data.games;
    return store;
  }

  if (!data.users || typeof data.users !== "object") return defaultStore();

  return {
    ...data,
    version: 2,
    users: normalizeUsers(data.users),
  };
};

const loadProgress = () => {
  try {
    ensureDir();
    if (!fs.existsSync(PROGRESS_FILE)) return defaultStore();
    const raw = fs.readFileSync(PROGRESS_FILE, "utf8");
    return normalizeStore(JSON.parse(raw));
  } catch (_e) {
    return defaultStore();
  }
};

const saveProgress = (store) => {
  ensureDir();
  const next = { ...normalizeStore(store), updatedAt: nowIso() };
  fs.writeFileSync(PROGRESS_FILE, `${JSON.stringify(next, null, 2)}\n`, "utf8");
};

const hasUser = (store, nickname) => {
  const key = nicknameKey(nickname);
  return Boolean(key && store?.users && store.users[key]);
};

const getOrCreateUser = (store, nickname) => {
  const nicknameTrimmed = normalizeNickname(nickname);
  const key = nicknameKey(nicknameTrimmed);
  if (!key) return null;

  if (!store.users) store.users = {};
  if (!store.users[key]) {
    store.users[key] = defaultUser(nicknameTrimmed);
  }

  return store.users[key];
};

const resetUserProgress = (store, nickname) => {
  const user = getOrCreateUser(store, nickname);
  if (!user) return;
  user.games = {};
  user.lastPlayedAt = null;
};

const recordRound = (user, gameKey, isCorrect) => {
  if (!user.games[gameKey]) {
    user.games[gameKey] = defaultGameStats();
  }

  const stats = user.games[gameKey];
  stats.rounds += 1;
  stats.lastPlayedAt = nowIso();
  user.lastPlayedAt = stats.lastPlayedAt;

  if (isCorrect) {
    stats.correct += 1;
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.bestStreak)
      stats.bestStreak = stats.currentStreak;
  } else {
    stats.wrong += 1;
    stats.currentStreak = 0;
  }
};

const formatProgress = (user, gamesList) => {
  const table = new Table({
    head: [
      chalk.bold("Game"),
      chalk.bold("Rounds"),
      chalk.bold("Correct"),
      chalk.bold("Wrong"),
      chalk.bold("Best streak"),
    ],
  });

  for (const game of gamesList) {
    const stats = user.games[game.key];
    if (!stats) {
      table.push([game.title, "-", "-", "-", "-"]);
      continue;
    }

    table.push([
      game.title,
      String(stats.rounds),
      chalk.green(String(stats.correct)),
      chalk.red(String(stats.wrong)),
      chalk.cyan(String(stats.bestStreak)),
    ]);
  }

  const header = `${chalk.bold("User:")} ${chalk.yellow(user.nickname)}`;
  return `${header}\n${table.toString()}`;
};

module.exports = {
  loadProgress,
  saveProgress,
  hasUser,
  getOrCreateUser,
  resetUserProgress,
  recordRound,
  formatProgress,
  PROGRESS_FILE,
};
