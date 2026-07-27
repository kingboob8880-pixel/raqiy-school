// Разовая чистка ленты достижений.
//
// ЗАЧЕМ. Автор снял у ученика доступ к RUKYA Pro, а строка «М получил
// доступ к системе RUKYA Pro» осталась висеть в ленте у всех учеников
// (замечено 2026-07-27). Причина — лента писалась только «вперёд»: код
// ловил момент выдачи доступа и не ловил момент отзыва.
//
// Отзыв теперь обрабатывается сразу (functions/index.js#dropFeed), и раз в
// сутки лента сверяется с профилями целиком. Но уже повисшую запись это не
// уберёт до ближайшей ночи, а обратный переход «было → не стало» для неё
// уже произошёл и второй раз не случится.
//
// Этот скрипт делает ту же сверку прямо сейчас. Правило одно и то же —
// functions/feed-sweep.js, второй копии условий здесь нет намеренно.
//
// ЗАПУСК: двойной щелчок по ОЧИСТИТЬ-ЛЕНТУ.bat в корне проекта.
// Или вручную:  node scripts/clean-feed.mjs
//
// Ключ сервисного аккаунта скрипт находит в корне проекта сам
// (*adminsdk*.json). Ключ в репозиторий не попадает и не должен.
import { readdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// firebase-admin установлен в functions/node_modules, в корне его нет.
const require = createRequire(pathToFileURL(path.join(ROOT, "functions", "index.js")));

function findKey() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const hit = readdirSync(ROOT).find((f) => /adminsdk.*\.json$/i.test(f));
  return hit ? path.join(ROOT, hit) : null;
}

const keyPath = findKey();
if (!keyPath) {
  console.error("Не найден ключ сервисного аккаунта (*adminsdk*.json) в корне проекта.");
  console.error("Скачать: Firebase Console → ⚙️ → Service accounts → Generate new private key.");
  process.exit(1);
}

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { sweepFeed } = require(path.join(ROOT, "functions", "feed-sweep.js"));

initializeApp({ credential: cert(require(keyPath)) });
const db = getFirestore();

// sweepFeed ждёт logger как у Cloud Functions — подсовываем консоль.
const logger = { info: (...a) => console.log(...a), warn: (...a) => console.warn(...a) };

console.log("Сверяю ленту с профилями учеников…\n");
const removed = await sweepFeed(db, logger);

console.log(removed
  ? `\nГотово: убрано записей — ${removed}. В кабинетах учеников они исчезнут сразу, перезагружать страницу не нужно.`
  : "\nЛента уже в порядке — убирать нечего.");
process.exit(0);
