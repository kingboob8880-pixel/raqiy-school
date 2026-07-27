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
let autoId = 0;

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
    __path: pathStr,
    id: pathStr.split('/').pop(),
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
    async listDocuments() { return docsOf().map((d) => docRef(`${name}/${d.id}`)); },
    // .doc() без аргумента — новый документ со сгенерированным id: так
    // бот создаёт разбор случая.
    doc(id) { return docRef(`${name}/${id || "auto" + (++autoId)}`); },
    async add(data) { store.set(`${name}/msg${store.size}`, clone(data)); },
    where(field, _op, val) {
      return {
        limit() { return this; },
        async get() {
          const docs = docsOf().filter((d) => getIn(d.data(), field.split(".")) === val);
          // size — настоящий QuerySnapshot его отдаёт, и код супервизии
          // считает по нему число принятых разборов.
          return { empty: !docs.length, docs, size: docs.length };
        },
      };
    },
  };
  return api;
}

const db = {
  doc: docRef,
  collection: collRef,
  // batch/listDocuments нужны панели админа для удаления ученика.
  batch: () => {
    const ops = [];
    return { delete: (ref) => ops.push(ref), async commit() { for (const r of ops) store.delete(r.__path); } };
  },
};

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

// Заглушка Admin Auth: регистрация в боте заводит настоящую учётную запись,
// и без подмены прогон полез бы в живой Firebase.
const users = new Map();   // email -> { uid, email, displayName }
let uidSeq = 0;
const FAKE_AUTH = path.join(ROOT, "scripts", ".fake-auth.cjs");
require.cache[FAKE_AUTH] = {
  id: FAKE_AUTH, filename: FAKE_AUTH, loaded: true, exports: {
    getAuth: () => ({
      async getUserByEmail(email) {
        const u = users.get(email);
        if (!u) { const e = new Error("no user"); e.code = "auth/user-not-found"; throw e; }
        return u;
      },
      async createUser({ email, displayName }) {
        const u = { uid: "UIDNEW" + (++uidSeq), email, displayName };
        users.set(email, u);
        return u;
      },
      async generatePasswordResetLink(email) { return "https://example.test/reset?e=" + email; },
    }),
  },
};

Module._resolveFilename = function (request, ...rest) {
  if (request === "firebase-admin/firestore") return FAKE;
  if (request === "firebase-admin/auth") return FAKE_AUTH;
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

const admin = require(path.join(ROOT, "functions", "tg-admin.js"));
admin.init({ tg, db, CHAT: "999", logger: { warn() {}, error() {}, info() {} } });

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
  check("гость получает приглашение привязать аккаунт", /привяжите аккаунт/i.test(lastText()));
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

  // ── 14. РЕГИСТРАЦИЯ ПРЯМО В БОТЕ ──────────────────────────────────────
  const NEW = 55501;
  const nmsg = (t) => ({ chat: { id: NEW }, from: { username: "novichok" }, text: t });
  const ncb = (d) => ({ id: "cb", data: d, message: { chat: { id: NEW } } });

  reset();
  await bot.onMessage(nmsg("/start"));
  check("новичку предложена запись в школу", /Записаться в школу|записаться прямо здесь/i.test(lastText()));

  reset();
  await bot.onCallback(ncb("reg"));
  check("бот спросил имя", /Напишите ваше имя/i.test(lastText()));

  reset();
  await bot.onMessage(nmsg("А"));
  check("слишком короткое имя отклонено", /Слишком коротко/i.test(lastText()));

  reset();
  await bot.onMessage(nmsg("Ибрахим"));
  check("бот спросил почту", /напишите вашу почту/i.test(lastText()));

  reset();
  await bot.onMessage(nmsg("ибрахим собака почта"));
  check("кривая почта отклонена", /не похоже на почту/i.test(lastText()));

  reset();
  await bot.onMessage(nmsg("ibrahim@mail.ru"));
  check("регистрация прошла", /Вы записаны в школу/i.test(lastText()));

  const newLink = await db.doc(`tgUsers/${NEW}`).get();
  check("Telegram привязан к новому аккаунту", newLink.exists && !!newLink.data().uid);
  const newDoc = store.get(`students/${newLink.data().uid}`);
  check("профиль создан как на сайте",
    newDoc && newDoc.name === "Ибрахим" && newDoc.email === "ibrahim@mail.ru"
    && newDoc.paid === false && typeof newDoc.progress === "object",
    JSON.stringify(newDoc || {}).slice(0, 200));
  check("помечено, что записался через бота", newDoc.registeredVia === "telegram");

  // Записавшемуся через бота нужен путь на сайт своим же аккаунтом.
  reset();
  await bot.onCallback(ncb("pwd"));
  check("выдана ссылка на установку пароля", buttons().some((b) => String(b).includes("reset?e=ibrahim")));

  // Новичок сразу работает как обычный ученик.
  reset();
  await bot.onCallback(ncb("mods"));
  check("новичок видит модули", /Модули курса/.test(lastText()));

  // ── 15. ЗАНЯТАЯ ПОЧТА — привязку решает автор, а не бот ───────────────
  const OTHER = 55502;
  const omsg = (t) => ({ chat: { id: OTHER }, from: { username: "chuzhoy" }, text: t });
  const ocb = (d) => ({ id: "cb", data: d, message: { chat: { id: OTHER } } });

  reset();
  await bot.onCallback(ocb("reg"));
  await bot.onMessage(omsg("Посторонний"));
  reset();
  await bot.onMessage(omsg("ibrahim@mail.ru"));
  check("занятая почта НЕ привязывается молча", /уже есть/i.test(lastText()));
  check("чужой Telegram не получил доступ", !(await db.doc(`tgUsers/${OTHER}`).get()).data()?.uid);
  check("автору ушла просьба с кнопкой",
    sent.some((m) => String(m.chat_id) === "999" && /Просьба привязать/i.test(m.text || "")));
  const linkBtn = sent.flatMap((m) => (m.reply_markup?.inline_keyboard || []).flat())
    .find((b) => String(b.callback_data || "").startsWith("tglink:"));
  check("кнопка привязки адресована автору", !!linkBtn, "кнопки: " + buttons().join(", "));

  // ── 15б. ПОЛНЫЙ КРУГ МОДУЛЯ: книги → тест модуля → следующий модуль ────
  //
  // Главная проверка всего бота: ради неё автор и спрашивал. Раньше тестов
  // модулей в боте не было вовсе, и ученик упирался в потолок Модуля 1.
  const M = 61000;
  const mmsg = (t) => ({ chat: { id: M }, from: { username: "modul" }, text: t });
  const mcb = (d) => ({ id: "cb", data: d, message: { chat: { id: M } } });

  store.set("students/UIDM", { name: "Проходящий", email: "m@m.m", paid: true, progress: {} });
  await db.doc(`tgUsers/${M}`).set({ uid: "UIDM", state: {} });

  // Модуль 2 закрыт, пока не сдан первый.
  reset();
  await bot.onCallback(mcb("mod:2"));
  check("Модуль 2 закрыт до сдачи первого", /🔒/.test(lastText()));

  // Сдаём экзамены всех книг Модуля 1.
  const { modules } = require(path.join(ROOT, "functions", "course-data.json"));
  const m1 = modules[0];
  for (let li = 0; li < m1.lessons.length; li++) {
    if (!m1.lessons[li].exam) continue;
    reset();
    await bot.onCallback(mcb(`ex:0:${li}`));
    for (let q = 0; q < 4; q++) {
      const st = (await db.doc(`tgUsers/${M}`).get()).data().state;
      if (!st?.exam) break;
      reset();
      await bot.onCallback(mcb(`ea:${st.exam.qs[st.exam.i].correct}`));
    }
  }
  const afterBooks = store.get("students/UIDM").progress.books || {};
  const booksDone = m1.lessons.filter((l) => afterBooks[l.key]?.status === "done").length;
  check("все книги Модуля 1 сданы", booksDone === m1.lessons.length, `сдано ${booksDone} из ${m1.lessons.length}`);
  check("после последней книги предложен тест модуля",
    buttons().some((b) => b === "mex:1"), "кнопки: " + buttons().join(", "));

  // Модуль всё ещё НЕ закрыт — книги пройдены, но тест модуля не сдан.
  check("модуль не закрывается сам по себе", store.get("students/UIDM").progress["1"]?.status !== "done");
  reset();
  await bot.onCallback(mcb("mod:2"));
  check("Модуль 2 всё ещё закрыт", /🔒/.test(lastText()));

  // Сдаём тест модуля.
  reset();
  await bot.onCallback(mcb("mex:1"));
  check("тест модуля начался", /Тест Модуля 1/.test(lastText()));
  for (let i = 0; i < 20; i++) {
    const st = (await db.doc(`tgUsers/${M}`).get()).data().state;
    if (!st?.mexam) break;
    reset();
    await bot.onCallback(mcb(`ea:${st.mexam.qs[st.mexam.i].correct}`));
  }
  check("Модуль 1 закрыт", store.get("students/UIDM").progress["1"]?.status === "done",
    JSON.stringify(store.get("students/UIDM").progress["1"] || {}));
  check("сказано, что открылся Модуль 2", /Модуль 1 сдан/.test(lastText()) && /Открыт/.test(lastText()));
  check("дана кнопка на Модуль 2", buttons().some((b) => b === "mod:2"));

  // Теперь второй модуль действительно открыт — и его упражнения тоже.
  reset();
  await bot.onCallback(mcb("mod:2"));
  check("Модуль 2 открылся", !/🔒/.test(lastText()) && /Модуль 2/.test(lastText()));
  reset();
  await bot.onCallback(mcb("t:m2-1"));
  check("упражнения Модуля 2 доступны после экзамена своей книги или закрыты по книге",
    /🔒|СДЕЛАНО, КОГДА|Откроется/.test(lastText()));

  // Провал теста модуля не закрывает модуль.
  store.set("students/UIDF", { name: "Провальный", email: "f@f.f", paid: true, progress: {} });
  await db.doc("tgUsers/62000").set({ uid: "UIDF", state: {} });
  const fcb = (d) => ({ id: "cb", data: d, message: { chat: { id: 62000 } } });
  reset();
  await bot.onCallback(fcb("mex:1"));
  for (let i = 0; i < 20; i++) {
    const st = (await db.doc("tgUsers/62000").get()).data().state;
    if (!st?.mexam) break;
    const wrong = (st.mexam.qs[st.mexam.i].correct + 1) % st.mexam.qs[st.mexam.i].options.length;
    reset();
    await bot.onCallback(fcb(`ea:${wrong}`));
  }
  check("проваленный тест не закрывает модуль", store.get("students/UIDF").progress["1"]?.status !== "done");
  check("предложена пересдача", buttons().some((b) => b === "mex:1"));

  // ── 16. ПАНЕЛЬ УПРАВЛЕНИЯ В ЧАТЕ АВТОРА ───────────────────────────────
  const acb = (d) => ({ id: "cb", data: d, message: { chat: { id: 999 } } });
  const amsg = (t) => ({ chat: { id: 999 }, from: { username: "author" }, text: t });

  reset();
  check("панель отвечает на /admin", await admin.onMessage(amsg("/admin")));
  check("меню показано", /Управление школой/.test(lastText()));

  reset();
  await admin.onCallback(acb("as:all:0"));
  check("список учеников открылся", /Все ученики/.test(lastText()));

  reset();
  await admin.onCallback(acb("as:unpaid:0"));
  check("фильтр «без оплаты» работает", /Без оплаты/.test(lastText()));

  // Карточка: берём ученика, созданного при регистрации.
  const regUid = (await db.doc(`tgUsers/${NEW}`).get()).data().uid;
  reset();
  await admin.onCallback(acb(`ac:${regUid}`));
  check("карточка ученика открылась", /Ибрахим/.test(lastText()) && /Доступ:/.test(lastText()));
  check("в карточке есть выдача полного доступа", buttons().some((b) => b === `ax:${regUid}`));

  // Выдача доступа прямо из бота — то, ради чего всё и делалось.
  reset();
  await admin.onCallback(acb(`ap:${regUid}`));
  check("оплата подтверждена из бота", store.get(`students/${regUid}`).paid === true);
  reset();
  await admin.onCallback(acb(`ax:${regUid}`));
  check("полный доступ выдан из бота", store.get(`students/${regUid}`).fullAccess === true);
  reset();
  await admin.onCallback(acb(`ax:${regUid}`));
  check("полный доступ снимается тем же нажатием", !store.get(`students/${regUid}`).fullAccess);
  reset();
  await admin.onCallback(acb(`ag:${regUid}`));
  check("сертификат выдан из бота", store.get(`students/${regUid}`).certificateGranted === true);

  // Письмо ученику.
  reset();
  await admin.onCallback(acb(`aw:${regUid}`));
  check("панель ждёт текст письма", /Напишите сообщение/.test(lastText()));
  reset();
  check("текст письма перехвачен панелью", await admin.onMessage(amsg("Продолжайте, вы молодец.")));
  check("письмо легло в переписку ученика",
    [...store.keys()].some((k) => k.startsWith(`students/${regUid}/messages/`)));

  // Поиск.
  reset();
  await admin.onCallback(acb("aq"));
  reset();
  check("поиск перехвачен панелью", await admin.onMessage(amsg("ибрахим")));
  check("поиск нашёл и открыл карточку", /Ибрахим/.test(lastText()));

  // Сводка и мониторинг.
  reset();
  await admin.onCallback(acb("ast"));
  check("сводка по школе показана", /Сводка по школе/.test(lastText()) && /Учеников/.test(lastText()));
  reset();
  await admin.onCallback(acb("aatt"));
  check("экран «требуют внимания» работает", /Требуют внимания/.test(lastText()));
  reset();
  await admin.onCallback(acb(`am:${regUid}`));
  check("подробный прогресс по модулям", /по модулям/.test(lastText()) && /Модуль 11/.test(lastText()));

  // ГЛАВНОЕ: панель не должна отзываться на кнопки учеников.
  check("панель не перехватывает ученические кнопки",
    !(await admin.onCallback(acb("mods"))) && !(await admin.onCallback(acb("t:m1-1")))
    && !(await admin.onCallback(acb("pwd"))));
  check("панель не перехватывает обычный текст ученика",
    !(await admin.onMessage(amsg("просто текст"))));

  // ── 17. СУПЕРВИЗИЯ: ПОЛНЫЙ КРУГ ДО ДОПУСКА ────────────────────────────
  //
  // Ради этого всё и строилось: разбор случая, заключение наставника,
  // допуск к практике. Проверяем и то, что легко упустить: возвращённый
  // случай не засчитывается, а принять один и тот же дважды нельзя.
  const SV = 71000;
  const svmsg = (t) => ({ chat: { id: SV }, from: { username: "sv" }, text: t });
  const svcb = (d) => ({ id: "cb", data: d, message: { chat: { id: SV } } });
  const COURSE = require(path.join(ROOT, "functions", "course-data.json"));

  // Ученик с полным доступом — супервизия открыта.
  store.set("students/UIDSV", { name: "Выпускник", email: "v@v.v", paid: true, fullAccess: true, progress: {} });
  await db.doc(`tgUsers/${SV}`).set({ uid: "UIDSV", state: {} });

  reset();
  await bot.onCallback(svcb("sv"));
  check("экран супервизии открылся", /Супервизия/.test(lastText()) && /0<\/b> из 3|0 из 3/.test(lastText()));
  check("предложено разобрать случай", buttons().some((b) => b === "svnew"));

  // Заполняем все девять шагов.
  reset();
  await bot.onCallback(svcb("svnew"));
  check("форма началась с первого шага", /шаг 1 из 9/.test(lastText()));

  reset();
  await bot.onMessage(svmsg("коротко"));
  check("слишком короткий ответ отклонён", /Слишком коротко/.test(lastText()));

  for (let i = 0; i < COURSE.caseFields.length; i++) {
    reset();
    await bot.onMessage(svmsg("Подробный ответ на этот шаг разбора случая, достаточно длинный чтобы наставник понял без переспрашивания."));
  }
  check("после последнего шага показан разбор целиком", /Случай 1/.test(lastText()));
  check("предложена отправка наставнику", buttons().some((b) => String(b).startsWith("svs:")));

  const caseId = buttons().find((b) => String(b).startsWith("svs:")).split(":")[1];
  reset();
  await bot.onCallback(svcb(`svs:${caseId}`));
  check("случай отправлен", /отправлен наставнику/.test(lastText()));
  check("автору пришло уведомление о разборе",
    sent.some((m) => String(m.chat_id) === "999" && /Разбор случая на проверку/.test(m.text || "")));

  // Автор видит очередь и открывает разбор.
  const acb2 = (d) => ({ id: "cb", data: d, message: { chat: { id: 999 } } });
  const amsg2 = (t) => ({ chat: { id: 999 }, from: { username: "author" }, text: t });
  reset();
  await admin.onCallback(acb2("sq"));
  check("очередь разборов не пуста", /Разборы на проверке/.test(lastText()) && !/Очередь пуста/.test(lastText()));
  reset();
  await admin.onCallback(acb2(`sr:UIDSV:${caseId}`));
  check("разбор открылся у автора", /Выпускник/.test(lastText()) && /Красные флаги/.test(lastText()));

  // Сначала возвращаем с замечанием.
  reset();
  await admin.onCallback(acb2(`sb:UIDSV:${caseId}`));
  check("панель ждёт замечание", /Напишите замечание/.test(lastText()));
  reset();
  await admin.onMessage(amsg2("Не назван орган в намерении. Доработайте шаг седьмой."));
  check("случай возвращён", store.get(`students/UIDSV/cases/${caseId}`).status === "returned");
  check("допуск не засчитан", (store.get("students/UIDSV").supervision?.accepted || 0) === 0);
  check("ученику ушло заключение",
    sent.some((m) => String(m.chat_id) === String(SV) && /возвращён на доработку/i.test(m.text || "")));

  // Теперь принимаем — трижды, по одному случаю за раз.
  const ids = [caseId];
  for (let n = 2; n <= 3; n++) {
    reset();
    await bot.onCallback(svcb("svnew"));
    for (let i = 0; i < COURSE.caseFields.length; i++) {
      await bot.onMessage(svmsg("Подробный ответ на этот шаг разбора случая, достаточно длинный чтобы наставник понял без переспрашивания."));
    }
    const id = buttons().find((b) => String(b).startsWith("svs:"))?.split(":")[1];
    if (id) { ids.push(id); await bot.onCallback(svcb(`svs:${id}`)); }
  }
  check("создано три случая", ids.length === 3, "создано " + ids.length);

  for (const id of ids) {
    reset();
    await admin.onCallback(acb2(`sa:UIDSV:${id}`));
    await admin.onMessage(amsg2("Разбор принят. Опрос полный, красные флаги проверены, вывод следует из ответов."));
  }
  const sv = store.get("students/UIDSV").supervision || {};
  check("принято три разбора", sv.accepted === 3, JSON.stringify(sv));
  check("ученик допущен к практике", sv.status === "passed");
  check("ученику сообщено о принятии",
    sent.some((m) => String(m.chat_id) === String(SV) && /принят/i.test(m.text || "")));

  // Повторный вердикт по уже принятому не даёт четвёртого зачёта.
  reset();
  await admin.onCallback(acb2(`sa:UIDSV:${ids[0]}`));
  await admin.onMessage(amsg2("Ещё раз принято."));
  check("повторное принятие не удваивает зачёт",
    (store.get("students/UIDSV").supervision?.accepted || 0) === 3,
    JSON.stringify(store.get("students/UIDSV").supervision));

  console.log(`\nПроверок провалено: ${failed}`);
  process.exit(failed ? 1 : 0);
})();
