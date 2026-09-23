// Локальный раннер школы рукии — заменяет Cloud Functions на этом компьютере.
//
// ЗАЧЕМ: облачные Firebase Functions требуют тарифа Blaze (биллинг), а его
// нет и включить не получается. При этом компьютер автора включён постоянно,
// поэтому весь серверный функционал переехал сюда. Firestore и Hosting на
// Spark-плане работают как работали — они биллинга не требуют.
//
// Что здесь запускается (вся логика — одна копия, из ./index.js, через
// экспорт __local; дублирующего файла нет намеренно):
//
//   1. Telegram-боты на ЛОНГ-ПОЛЛИНГЕ (getUpdates) вместо вебхуков:
//      • @ruyka_school_bot — учебный бот + панель автора (routeTelegramUpdate);
//      • @pay_rukya_bot    — бот оплаты (handlePayUpdate).
//      Вебхук у обоих токенов снимается при старте: иначе Telegram отвечает
//      409 Conflict — «сначала удалите вебхук».
//
//   2. Триггеры Firestore через живые слушатели onSnapshot:
//      • students (создание → onStudentCreated, изменение → onStudentChanged);
//      • collectionGroup("messages") → onMessageAdded;
//      • collectionGroup("cases")   → onCaseChanged.
//      Первый снимок — эталонный (baseline): он запоминается молча, чтобы
//      каждая перезапуска не засыпала автора уведомлениями по уже живым
//      ученикам. Реагируем только на изменения ПОСЛЕ первого снимка.
//
//   3. Расписания (были pubsub schedule, теперь таймер внутри процесса):
//      • 10:00 Москва — runDailyReminders (неактивные + sweepFeed);
//      • 08:00 Москва — runStudentDailyPractice.
//      Не было компьютера в этот момент — напоминание просто пропускается,
//      догонять задним числом смысла нет.
//
// ЗАПУСК: двойным щелчком по RUN-SCHOOL.bat в корне репозитория.
// Один запущенный экземпляр гарантирован портом-локом (см. LOCK_PORT):
// второй процесс увидит «уже запущен» и выйдет, иначе боты отвечали бы
// дважды, а Firestore-слушатели писали бы уведомления в два раза.
//
// Секреты читаются из functions/.env.local (он в .gitignore). Ключ сервиса
// Firestore — rukya-school-firebase-adminsdk-*.json в корне репозитория.
//
// Created 2026-09-23.
"use strict";
const fs = require("fs");
const path = require("path");
const http = require("http");

// ─── 1. Окружение: .env.local → .env, не перетирая уже заданное ────────────
function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    if (process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadEnv(path.join(__dirname, ".env.local"));
loadEnv(path.join(__dirname, ".env"));

// ─── 2. Учётные данные Firestore (ключ сервиса из корня репо) ──────────────
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const root = path.join(__dirname, "..");
  const key = fs.readdirSync(root).find(
    (f) => f.includes("-adminsdk-") && f.endsWith(".json"),
  );
  if (key) process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(root, key);
}

const BOT_TOKEN = process.env.TG_BOT_TOKEN;
const PAY_TOKEN = process.env.TG_PAY_BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("TG_BOT_TOKEN пуст: заполните functions/.env.local");
  process.exit(1);
}

// ─── 3. Экземпляр-лок: порт занят — значит раннер уже работает ─────────────
const LOCK_PORT = 8791;
const lock = http.createServer((_req, res) => res.end("ruqya-local-server"));
lock.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.error("Локальный раннер уже запущен в другом окне. Не надо двух.");
    process.exit(1);
  }
  throw e;
});
lock.listen(LOCK_PORT, "127.0.0.1");

// ─── 4. Журнал: консоль + functions/local-server.log ────────────────────────
const LOG_FILE = path.join(__dirname, "local-server.log");
function log(...args) {
  const line = `[${new Date().toISOString()}] ${args
    .map((a) => (a instanceof Error ? (a.stack || a.message) : typeof a === "object" ? JSON.stringify(a) : String(a)))
    .join(" ")}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + "\n"); } catch {}
}
// firebase-functions внутри index.js пишет через logger — не глушим, но и
// свой журнал ведём: по нему автор присылает отчёты о запуске.

// ─── 5. Сама школа: тела триггеров и маршрутизация ботов из index.js ───────
const L = require("./index").__local;

// ─── 6. Транспорт Telegram ──────────────────────────────────────────────────
async function tgApi(token, method, body) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
    signal: AbortSignal.timeout(60000),
  });
  return r.json();
}

let running = true;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Один бот на лонг-поллинге. handler получает целый апдейт.
 * 409 — где-то висит вебхук или второй опрос: снимаем вебхук и пробуем снова. */
async function pollBot(name, token, handler, allowed) {
  let offset = 0;
  // узнаём номер последнего уже выданного апдейта, чтобы не перебирать
  // историю с момента жизни вебхука: старые апдейты обрабатывать не нужно.
  try {
    const first = await tgApi(token, "getUpdates", { offset: -1, timeout: 0 });
    if (first.ok && first.result?.length) offset = first.result[0].update_id;
  } catch {}
  while (running) {
    let r;
    try {
      r = await tgApi(token, "getUpdates", { offset, timeout: 25, allowed_updates: allowed });
    } catch (e) {
      log(`${name}: getUpdates сеть — ${e.message}`);
      await sleep(5000);
      continue;
    }
    if (!r.ok) {
      if (r.error_code === 409) {
        log(`${name}: 409 Conflict — снимаю вебхук и продолжаю`);
        await tgApi(token, "deleteWebhook", { drop_pending_updates: false });
      } else {
        log(`${name}: getUpdates — ${r.description}`);
      }
      await sleep(5000);
      continue;
    }
    for (const upd of r.result) {
      offset = upd.update_id + 1;
      try {
        await handler(upd);
      } catch (e) {
        log(`${name}: обработка апдейта ${upd.update_id}`, e);
      }
    }
  }
}

// ─── 7. Firestore: слушатели вместо облачных триггеров ─────────────────────
// change-объект той же формы, что даёт облако ({before.data(), after.data()}),
// поэтому тела триггеров в index.js работают без изменений.
const changeShim = (before, after) => ({
  before: { data: () => before },
  after: { data: () => after },
});

function watchCollection(name, query, onChange) {
  const prev = new Map();
  let seeded = false;
  const unsub = query.onSnapshot(
    (snap) => {
      if (!seeded) {
        snap.docs.forEach((d) => prev.set(d.ref.path, d.data()));
        seeded = true;
        log(`${name}: baseline ${snap.size} док(ов)`);
        return;
      }
      (async () => {
        for (const d of snap.docChanges()) {
          const pathKey = d.doc.ref.path;
          const before = prev.get(pathKey);
          const after = d.type === "removed" ? undefined : d.doc.data();
          if (d.type === "removed") prev.delete(pathKey);
          else prev.set(pathKey, after);
          try {
            await onChange(d.type, pathKey, before, after);
          } catch (e) {
            log(`${name}:`, e);
          }
        }
      })();
    },
    (err) => log(`${name}: слушатель отвалился — ${err.message}`),
  );
  unsubs.push(unsub);
}
const unsubs = [];

// students: создание → уведомление автору; изменение → весь onProgress
// (отвязка telegram, уведомления об оплате/сертификате/RUKYA Pro, лента,
// сводка прогресса).
watchCollection("students", L.db.collection("students"), async (type, key, before, after) => {
  const uid = key.split("/")[1];
  if (type === "added") return L.onStudentCreated(uid, after);
  if (type === "modified" && JSON.stringify(before) !== JSON.stringify(after)) {
    return L.onStudentChanged(uid, changeShim(before, after));
  }
});

// сообщения учеников и наставника (students/{uid}/messages/{msgId}).
watchCollection("messages", L.db.collectionGroup("messages"), async (type, key, _b, after) => {
  if (type !== "added") return;
  const parts = key.split("/");
  return L.onMessageAdded(parts[1], after);
});

// разборы случаев (students/{uid}/cases/{caseId}) — вердикты с сайта.
watchCollection("cases", L.db.collectionGroup("cases"), async (type, key, before, after) => {
  if (type !== "modified") return;
  const parts = key.split("/");
  return L.onCaseChanged(parts[1], changeShim(before, after));
});

// ─── 8. Расписания: 10:00 и 08:00 Москва (UTC+3, переходов нет с 2014) ─────
const SCHEDULES = [
  { key: "dailyReminders", at: "10:00", run: () => L.runDailyReminders() },
  { key: "studentDailyPractice", at: "08:00", run: () => L.runStudentDailyPractice() },
];
const lastFired = {};
setInterval(() => {
  const msk = new Date(Date.now() + 3 * 3600 * 1000);
  const day = msk.toISOString().slice(0, 10);
  const hm = msk.toISOString().slice(11, 16);
  for (const s of SCHEDULES) {
    if (hm !== s.at) continue;
    const stamp = `${day} ${s.at}`;
    if (lastFired[s.key] === stamp) continue;
    lastFired[s.key] = stamp;
    log(`расписание: ${s.key}`);
    s.run().catch((e) => log(`${s.key}:`, e));
  }
}, 20000).unref();

// ─── 9. Старт ───────────────────────────────────────────────────────────────
(async () => {
  // вебхуки снимаем ДО первого getUpdates (иначе 409), по обоим ботам.
  await tgApi(BOT_TOKEN, "deleteWebhook", { drop_pending_updates: false });
  if (PAY_TOKEN) await tgApi(PAY_TOKEN, "deleteWebhook", { drop_pending_updates: false });

  const me = await tgApi(BOT_TOKEN, "getMe");
  log(`раннер запущен: @${me.result?.username || "?"}, чат автора ${L.CHAT}`);

  pollBot("учебный", BOT_TOKEN, (u) => L.routeTelegramUpdate(u), ["message", "callback_query"]);
  if (PAY_TOKEN) {
    pollBot("оплата", PAY_TOKEN, (u) => (u.message ? L.handlePayUpdate(u.message) : null), ["message"]);
  } else {
    log("TG_PAY_BOT_TOKEN пуст — бот оплаты не запущен");
  }
})();

// аккуратная остановка по Ctrl+C в окне раннера
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    running = false;
    unsubs.forEach((u) => { try { u(); } catch {} });
    lock.close();
    log("остановлен по сигналу");
    setTimeout(() => process.exit(0), 500);
  });
}
