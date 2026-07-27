// Прогон учебного Telegram-бота без Telegram и без Firebase.
//
// ЗАЧЕМ. Бота нельзя проверить ни браузером, ни дымовым прогоном страниц:
// он живёт в Cloud Functions и разговаривает с двумя внешними системами.
// Ошибка вида «пейвол забыли проверить в одной ветке» обнаружилась бы уже
// на живых учениках — то есть после того, как платный курс раздали даром.
//
// КАК. Подменяем ровно три вещи: db (память вместо Firestore), tg (запись
// вызовов вместо отправки) и fetch (готовый markdown вместо сайта). Дальше
// прогоняем сценарии и проверяем, что бот ответил тем, чем должен.
//
// Запуск:  node scripts/smoke-tg-bot.cjs
const path = require("node:path");
const ROOT = path.join(__dirname, "..");

// ── заглушка Firestore ──────────────────────────────────────────────────
const store = new Map();

// structuredClone, а не JSON: JSON превращает даты в строки, и проверка
// срока действия кода начинала бы считать любой код просроченным.
function clone(v) { return v === undefined ? v : structuredClone(v); }

function getIn(obj, parts) {
  let cur = obj;
  for (const p of parts) { if (cur == null) return undefined; cur = cur[p]; }
  return cur;
}
function setIn(obj, parts, val) {
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof cur[parts[i]] !== "object" || cur[parts[i]] === null) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = val;
}

// Метки операций — повторяют смысл FieldValue/FieldPath, но без firebase-admin.
class AU { constructor(v) { this.v = v; } }   // arrayUnion
class AR { constructor(v) { this.v = v; } }   // arrayRemove
class DEL {}
class FP { constructor(...parts) { this.parts = parts; } }   // сегменты списком, как в firebase-admin

function applyOne(doc, key, value) {
  const parts = key instanceof FP ? key.parts : String(key).split(".");
  const cur = getIn(doc, parts);
  if (value instanceof AU) {
    const arr = Array.isArray(cur) ? [...cur] : [];
    const has = arr.some((x) => JSON.stringify(x) === JSON.stringify(value.v));
    if (!has) arr.push(value.v);
    setIn(doc, parts, arr);
  } else if (value instanceof AR) {
    const arr = Array.isArray(cur) ? cur.filter((x) => JSON.stringify(x) !== JSON.stringify(value.v)) : [];
    setIn(doc, parts, arr);
  } else if (value instanceof DEL) {
    const parent = getIn(doc, parts.slice(0, -1));
    if (parent) delete parent[parts[parts.length - 1]];
  } else {
    setIn(doc, parts, value);
  }
}

function docRef(pathStr) {
  return {
    async get() {
      const d = store.get(pathStr);
      return { exists: d !== undefined, id: pathStr.split("/").pop(), data: () => clone(d) };
    },
    async set(data, opts) {
      const prev = opts?.merge ? (store.get(pathStr) || {}) : {};
      store.set(pathStr, { ...prev, ...clone(data) });
    },
    async update(...args) {
      const d = store.get(pathStr);
      if (d === undefined) throw new Error("нет документа " + pathStr);
      if (args.length === 1 && typeof args[0] === "object" && !(args[0] instanceof FP)) {
        for (const [k, v] of Object.entries(args[0])) applyOne(d, k, v);
      } else {
        for (let i = 0; i < args.length; i += 2) applyOne(d, args[i], args[i + 1]);
      }
      store.set(pathStr, d);
    },
  };
}

function collRef(name) {
  const docsOf = () => [...store.entries()]
    .filter(([k]) => k.startsWith(name + "/") && k.split("/").length === name.split("/").length + 1)
    .map(([k, v]) => ({ id: k.split("/").pop(), data: () => clone(v) }));
  const api = {
    async get() { const docs = docsOf(); return { empty: !docs.length, docs, size: docs.length }; },
    async add(data) { store.set(`${name}/msg${store.size}`, clone(data)); },
    where(field, _op, val) {
      return {
        limit() { return this; },
        async get() {
          const docs = docsOf().filter((d) => getIn(d.data(), field.split(".")) === val);
          return { empty: !docs.length, docs };
        },
      };
    },
  };
  return api;
}

const db = { doc: docRef, collection: collRef };

// ── заглушка Telegram ───────────────────────────────────────────────────
let sent = [];
async function tg(method, body) { sent.push({ method, ...body }); return { ok: true }; }
const lastText = () => sent.filter((m) => m.method === "sendMessage").map((m) => m.text).join("\n---\n");
const buttons = () => sent.flatMap((m) => (m.reply_markup?.inline_keyboard || []).flat().map((b) => b.callback_data || b.url || b.text));

// ── подменяем firebase-admin/firestore до загрузки бота ─────────────────
const Module = require("node:module");
const origResolve = Module._resolveFilename;
const FAKE = path.join(ROOT, "scripts", ".fake-firestore.cjs");
require.cache[FAKE] = {
  id: FAKE, filename: FAKE, loaded: true, exports: {
    FieldValue: { arrayUnion: (v) => new AU(v), arrayRemove: (v) => new AR(v), delete: () => new DEL() },
    FieldPath: FP,
  },
};
Module._resolveFilename = function (request, ...rest) {
  if (request === "firebase-admin/firestore") return FAKE;
  return origResolve.call(this, request, ...rest);
};

// ── заглушка сети ───────────────────────────────────────────────────────
const FAKE_BOOK = "---\ntitle: X\n---\n\n" + Array.from({ length: 40 }, (_, i) => `Абзац номер ${i + 1}. ` + "Слово ".repeat(60)).join("\n\n");
const FAKE_EXAM = `---\ntitle: Экзамен\n---\n\n` +
  Array.from({ length: 4 }, (_, i) => `${i + 1}. Вопрос ${i + 1}?\n- [ ] Нет\n- [x] Да\n- [ ] Может\n- [ ] Никогда`).join("\n\n");
global.fetch = async (url) => ({
  ok: true,
  text: async () => (String(url).includes("/exams/") ? FAKE_EXAM : FAKE_BOOK),
});

const bot = require(path.join(ROOT, "functions", "tg-student.js"));
bot.init({ tg, db, CHAT: "999", logger: { warn() {}, error() {}, info() {} } });

// ── сценарии ────────────────────────────────────────────────────────────
let failed = 0;
function check(name, cond, extra) {
  if (cond) { console.log("OK   " + name); return; }
  failed++;
  console.log("FAIL " + name + (extra ? "\n     " + extra : ""));
}

const CHAT_ID = 12345;
function reset() { sent = []; }
const msg = (text) => ({ chat: { id: CHAT_ID }, from: { username: "u" }, text });
const cbq = (data) => ({ id: "cb", data, message: { chat: { id: CHAT_ID } } });

(async () => {
  // 1. Незнакомый чат — предложение привязаться, ничего лишнего.
  reset();
  await bot.onMessage(msg("/start"));
  check("гость получает приглашение привязать аккаунт", /привяжите свой аккаунт/i.test(lastText()));
  check("гостю не показан курс", !/Модули курса/.test(lastText()));

  // 2. Привязка по коду.
  store.set("students/UID1", {
    name: "Тестовый", email: "t@t.t", paid: false,
    tgLinkCode: "CODE123", tgLinkCodeAt: new Date(),
    progress: {},
  });
  reset();
  await bot.onMessage(msg("/start CODE123"));
  check("привязка прошла", /Аккаунт привязан/.test(lastText()));
  check("tgUsers создан", (await db.doc(`tgUsers/${CHAT_ID}`).get()).exists);
  check("код стёрт", store.get("students/UID1").tgLinkCode === undefined);

  // 3. Просроченный код не работает.
  store.set("students/UID2", { name: "Второй", tgLinkCode: "OLD", tgLinkCodeAt: new Date(Date.now() - 60 * 60 * 1000), progress: {} });
  reset();
  await bot.onMessage({ chat: { id: 777 }, text: "/start OLD" });
  check("просроченный код отклонён", /Срок кода истёк/.test(lastText()));

  // 4. Меню и модули: закрытые модули помечены замком.
  reset();
  await bot.onCallback(cbq("mods"));
  const modsText = lastText();
  check("список модулей показан", /Модули курса/.test(modsText));
  reset();
  await bot.onCallback(cbq("mod:3"));
  check("закрытый модуль не пускает", /🔒/.test(lastText()) && /откроется/i.test(lastText()));

  // 5. ПЕЙВОЛ. Неоплативший получает отрывок и не получает экзамен.
  reset();
  await bot.onCallback(cbq("les:0:0"));
  const freeText = lastText();
  check("неоплативший получил отрывок", /вводный отрывок/i.test(freeText));
  check("неоплатившему не предложен экзамен", !buttons().some((b) => String(b).startsWith("ex:")),
    "кнопки: " + buttons().join(", "));
  const freePages = (freeText.match(/страница \d+ из (\d+)/) || [])[1];

  // 6. Оплативший получает полный текст и кнопку экзамена.
  store.get("students/UID1").paid = true;
  reset();
  await bot.onCallback(cbq("les:0:0"));
  const paidPages = (lastText().match(/страница \d+ из (\d+)/) || [])[1];
  check("оплативший получил больше страниц", Number(paidPages) > Number(freePages),
    `отрывок: ${freePages} стр., полный: ${paidPages} стр.`);
  reset();
  await bot.onCallback(cbq("rd:0:0:99"));   // заведомо большая страница
  check("последняя страница даёт экзамен", buttons().some((b) => String(b).startsWith("ex:")),
    "кнопки: " + buttons().join(", "));

  // 7. Экзамен целиком: отвечаем верно на все вопросы.
  reset();
  await bot.onCallback(cbq("ex:0:0"));
  check("экзамен начался", /Вопрос 1 из 4/.test(lastText()));
  for (let i = 0; i < 4; i++) {
    const st = (await db.doc(`tgUsers/${CHAT_ID}`).get()).data().state;
    const correct = st.exam.qs[st.exam.i].correct;
    reset();
    await bot.onCallback(cbq(`ea:${correct}`));
  }
  const s1 = store.get("students/UID1");
  const bookKey = "_content_module-1_yakyn_md";
  check("экзамен сдан и записан в прогресс", s1.progress?.books?.[bookKey]?.status === "done",
    JSON.stringify(s1.progress?.books || {}).slice(0, 200));
  check("итог показан ученику", /Экзамен сдан/.test(lastText()));

  // 8. Замок упражнения снят сданным экзаменом.
  reset();
  await bot.onCallback(cbq("t:m1-1"));
  check("упражнение открылось после экзамена", /НАМЕРЕНИЕ/.test(lastText()) && !/🔒/.test(lastText()));
  check("намерение показано", /Ради Аллаха/.test(lastText()));
  reset();
  await bot.onCallback(cbq("t:m2-1"));
  check("упражнение другой книги закрыто", /🔒/.test(lastText()));

  // 9. Действие по ЗАКРЫТОМУ упражнению ничего не пишет — идентификатор виден
  //    в кнопке, и нажать по нему можно из старого сообщения.
  reset();
  await bot.onCallback(cbq("tc:m1-8"));   // экзамен этой книги не сдан
  check("закрытое упражнение не принимает нажатий",
    store.get("students/UID1").progress?.["1"]?.log === undefined);

  // 10. Выданный автором полный доступ снимает замки — и счётчик работает.
  store.get("students/UID1").fullAccess = true;
  reset();
  await bot.onCallback(cbq("t:m1-8"));   // у него есть счётчик и дни
  check("fullAccess открыл упражнение", !/🔒/.test(lastText()))
  reset();
  await bot.onCallback(cbq("tc:m1-8"));
  await bot.onCallback(cbq("tc:m1-8"));
  const log = store.get("students/UID1").progress?.["1"]?.log?.["m1-8"] || {};
  check("счётчик вырос до 2", log.count === 2, JSON.stringify(log));
  reset();
  await bot.onCallback(cbq("td:m1-8"));
  const log2 = store.get("students/UID1").progress["1"].log["m1-8"];
  check("день отмечен", (log2.days || []).length === 1, JSON.stringify(log2.days));
  reset();
  await bot.onCallback(cbq("td:m1-8"));
  check("повторное нажатие снимает день", (store.get("students/UID1").progress["1"].log["m1-8"].days || []).length === 0);

  // 10. Наблюдение — ждём текст и записываем.
  reset();
  await bot.onCallback(cbq("tn:m1-8"));
  check("бот ждёт наблюдение", /Напишите наблюдение/.test(lastText()));
  reset();
  await bot.onMessage(msg("Внимание держалось всё чтение."));
  const notes = store.get("students/UID1").progress["1"].log["m1-8"].notes || [];
  check("наблюдение записано", notes.length === 1 && /Внимание держалось/.test(notes[0].text));

  // 11. Вопрос наставнику уходит и автору, и в переписку.
  reset();
  await bot.onCallback(cbq("ask"));
  reset();
  await bot.onMessage(msg("Как правильно держать намерение?"));
  check("вопрос ушёл автору", sent.some((m) => String(m.chat_id) === "999" && /#UID1/.test(m.text || "")));
  check("вопрос лёг в переписку", [...store.keys()].some((k) => k.startsWith("students/UID1/messages/")));

  // 12. Ответ автора возвращается ученику.
  reset();
  await bot.mentorReply({ chat: { id: 999 }, text: "Держи внимание на пяти элементах.", reply_to_message: { text: "вопрос\n#UID1" } });
  check("ответ доставлен ученику", sent.some((m) => String(m.chat_id) === String(CHAT_ID) && /Ответ наставника/.test(m.text || "")));

  // 13. Прогресс и «сегодня» не падают.
  reset();
  await bot.onCallback(cbq("prog"));
  check("прогресс показан", /Мой прогресс/.test(lastText()));
  reset();
  await bot.onCallback(cbq("today"));
  check("экран «сегодня» работает", /Сегодня/.test(lastText()));

  console.log(`\nПроверок провалено: ${failed}`);
  process.exit(failed ? 1 : 0);
})();
