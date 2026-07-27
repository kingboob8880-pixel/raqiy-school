// Telegram-бот для УЧЕНИКОВ (запрос автора 2026-07-27: «чтобы ученики
// могли обучаться с телеграм-бота»).
//
// До этого бот отвечал только автору: в вебхуке стояла проверка
// chat.id === CHAT, и всё остальное молча отбрасывалось. Здесь — вторая
// половина: меню, чтение книг, экзамены, упражнения, прогресс и вопрос
// наставнику.
//
// ГЛАВНОЕ РЕШЕНИЕ — ОДИН АККАУНТ, А НЕ ДВА.
// Прогресс, экзамены и журнал упражнений лежат в students/{uid}. Бот пишет
// ровно туда же, а не заводит параллельную базу: иначе человек прошёл бы
// модуль в Telegram, зашёл на сайт — и увидел там пусто. Связка делается
// одноразовым кодом из кабинета (см. linkTelegram ниже), обратный индекс
// для быстрого поиска по chat_id — коллекция tgUsers/{chatId}.
//
// ПОЧЕМУ СОСТОЯНИЕ В FIRESTORE. Cloud Functions не помнят ничего между
// вызовами: каждое нажатие кнопки — новый холодный процесс. Поэтому «на
// какой странице книги я нахожусь», «какой вопрос экзамена сейчас» и
// «жду от него текст наблюдения» хранятся в tgUsers/{chatId}.state.
//
// ПЕЙВОЛ ПРОВЕРЯЕТ САМ БОТ. Правила Firestore ограничивают клиента, но не
// Admin SDK — под которым работают функции. Значит, «оплатил или нет»
// здесь решается кодом, и если это забыть, бот раздаст платный курс всем.
// Проверка одна: paid || fullAccess (см. hasFullText).
const COURSE = require("./course-data.json");
const { FieldValue, FieldPath } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

// Адрес сайта — для ссылок «дочитать в браузере» и для загрузки текстов
// уроков и экзаменов. Переопределяется переменной SITE_URL, если сайт
// переедет на свой домен.
const SITE = (process.env.SITE_URL || "https://kingboob8880-pixel.github.io/raqiy-school").replace(/\/$/, "");

// Telegram режет сообщение на 4096 символах. Берём с запасом: разметка
// (<b>, <i>) считается вместе с текстом, и на границе можно потерять
// закрывающий тег.
const CHUNK = 3400;

// Доля книги, которую видит неоплативший. Та же, что на сайте
// (pages/js/markdown-loader.js#applyPaywall) — иначе отрывок в боте и на
// сайте кончались бы в разных местах.
const FREE_SHARE = 0.12;

let deps = null; // { tg, db, CHAT, logger }

/** Вызывается один раз из index.js. */
function init(d) { deps = d; }

// ───────────────────────────────── утилиты

function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function todayKey(shift = 0) {
  const d = new Date();
  if (shift) d.setDate(d.getDate() + shift);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Длина серии — считаем назад от сегодня. От вчера, если сегодня ещё не
 *  отмечено: иначе серия обнулялась бы каждое утро до того, как человек
 *  успел сделать упражнение. Та же логика, что в окне упражнения на сайте. */
function streakOf(days) {
  const set = new Set(days || []);
  if (!set.size) return 0;
  let shift = set.has(todayKey()) ? 0 : (set.has(todayKey(-1)) ? -1 : null);
  if (shift === null) return 0;
  let n = 0;
  while (set.has(todayKey(shift))) { n += 1; shift -= 1; }
  return n;
}

async function send(chatId, text, keyboard) {
  return deps.tg("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(keyboard ? { reply_markup: { inline_keyboard: keyboard } } : {}),
  });
}

/** Длинный текст — несколькими сообщениями. Режем по абзацам, а не по
 *  символам: разрыв посреди аята или посреди формулы читается как ошибка. */
async function sendLong(chatId, text, keyboard) {
  const parts = [];
  let buf = "";
  for (const para of String(text).split("\n\n")) {
    if ((buf + "\n\n" + para).length > CHUNK && buf) { parts.push(buf); buf = para; }
    else buf = buf ? buf + "\n\n" + para : para;
  }
  if (buf) parts.push(buf);
  for (let i = 0; i < parts.length; i++) {
    await send(chatId, parts[i], i === parts.length - 1 ? keyboard : null);
  }
}

async function ack(id, text) {
  await deps.tg("answerCallbackQuery", { callback_query_id: id, text: text || "" });
}

// ───────────────────────────────── ученик и состояние

async function findStudent(chatId) {
  const link = await deps.db.doc(`tgUsers/${chatId}`).get();
  if (!link.exists) return null;
  const uid = link.data().uid;
  const snap = await deps.db.doc(`students/${uid}`).get();
  if (!snap.exists) return null;
  return { uid, chatId, state: link.data().state || {}, ...snap.data() };
}

async function setState(chatId, state) {
  await deps.db.doc(`tgUsers/${chatId}`).set(
    { state, updatedAt: new Date() },
    { merge: true },
  );
}

/** Открыт ли полный текст. Одна проверка на весь бот: пропустишь её в
 *  одном месте — и платный курс уедет бесплатно. */
function hasFullText(s) {
  return !!(s.paid || s.fullAccess);
}

function isModuleUnlocked(moduleId, s) {
  if (s.fullAccess) return true;
  if (moduleId <= 1) return true;
  return s.progress?.[moduleId - 1]?.status === "done";
}

/** Открыто ли упражнение: сдан экзамен его книги (решение автора
 *  2026-07-27). Правило то же, что на сайте — pages/js/assignments-gate.js. */
function isTaskUnlocked(task, moduleId, s) {
  if (s.fullAccess) return true;
  if (!isModuleUnlocked(moduleId, s)) return false;
  if (!task.bookKey) return true;
  const lesson = lessonByKey(task.bookKey);
  if (!lesson?.exam) return true;
  return s.progress?.books?.[task.bookKey]?.status === "done";
}

function lessonByKey(key) {
  for (const m of COURSE.modules) {
    for (const l of m.lessons) if (l.key === key) return l;
  }
  return null;
}

function taskById(id) {
  for (const [mid, items] of Object.entries(COURSE.assignments)) {
    for (const a of items) if (a.id === id) return { task: a, moduleId: Number(mid) };
  }
  return null;
}

// ───────────────────────────────── загрузка текста

/** Markdown → Telegram HTML. Телеграм понимает узкий набор тегов, поэтому
 *  заголовки и списки переводим в текст, а не в разметку. */
function mdToTelegram(md) {
  return String(md)
    .replace(/^---[\s\S]*?---\n/, "")                       // front matter
    .replace(/```[\s\S]*?```/g, "")                          // блоки кода
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^#{1,6}\s*(.+)$/gm, (_m, t) => `\n<b>${t.trim()}</b>`)
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<i>$2</i>")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/^\s*\|.*\|\s*$/gm, (row) =>                    // таблицы — в строки
      row.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim()).filter(Boolean).join(" — "))
    .replace(/^\s*[-—:| ]{5,}\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Текст урока. Сначала Firestore (туда переезжает полный текст платных
 *  книг), затем сам .md с сайта — до миграции полный текст ещё лежит там. */
async function loadLesson(lesson, full) {
  let body = null;
  try {
    const snap = await deps.db.doc(`content/${lesson.key}`).get();
    if (snap.exists) body = snap.data().body;
  } catch (e) { deps.logger.warn("content", e); }

  if (!body) {
    try {
      const r = await fetch(`${SITE}${lesson.doc}`);
      if (r.ok) body = await r.text();
    } catch (e) { deps.logger.warn("fetch lesson", e); }
  }
  if (!body) return null;

  const text = mdToTelegram(body);
  if (full) return { text, cut: false };

  // Отрывок: та же доля, что на сайте, но режем по абзацам.
  const paras = text.split("\n\n");
  const keep = Math.max(1, Math.ceil(paras.length * FREE_SHARE));
  return { text: paras.slice(0, keep).join("\n\n"), cut: keep < paras.length };
}

/** Экзамен из content/exams/*.md — тот же формат, что читает сайт. */
async function loadExam(path) {
  const r = await fetch(`${SITE}${path}`);
  if (!r.ok) return null;
  const raw = (await r.text()).replace(/^---[\s\S]*?---/, "");
  const qs = [];
  let cur = null;
  for (const line of raw.split(/\r?\n/)) {
    const q = line.match(/^\s*\d+\.\s+(.+)$/);
    const o = line.match(/^\s*-\s*\[([ xX])\]\s*(.+)$/);
    if (q) { cur = { q: q[1].trim(), options: [], correct: -1 }; qs.push(cur); }
    else if (o && cur) {
      if (o[1].toLowerCase() === "x") cur.correct = cur.options.length;
      cur.options.push(o[2].trim());
    }
  }
  return qs.filter((x) => x.options.length >= 2 && x.correct >= 0);
}

function shuffle(a) {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

// ───────────────────────────────── экраны

const MENU = [
  [{ text: "📖 Модули", callback_data: "mods" }, { text: "🏋 Практика", callback_data: "pr" }],
  [{ text: "📊 Мой прогресс", callback_data: "prog" }, { text: "🗓 Что сегодня", callback_data: "today" }],
  [{ text: "💬 Спросить наставника", callback_data: "ask" }],
  [{ text: "🎓 Супервизия", callback_data: "sv" }],
];

// Тем, кто записался через бота, нужен способ попасть и на сайт — своим же
// аккаунтом. Остальным эта кнопка не нужна: у них пароль уже есть.
const MENU_TG_REGISTERED = [
  ...MENU,
  [{ text: "🔑 Пароль для входа на сайт", callback_data: "pwd" }],
];

async function screenMenu(s) {
  const done = Object.entries(s.progress || {})
    .filter(([k, v]) => !["activityDates", "books"].includes(k) && v?.status === "done").length;
  await send(s.chatId, [
    `<b>Школа рукии</b> — Ассаламу алейкум, ${esc(s.name || "")}`,
    "",
    `Пройдено модулей: <b>${done}</b> из ${COURSE.modules.length}`,
    hasFullText(s) ? "" : "\n⬜ Курс не оплачен — доступны вводные отрывки книг.",
  ].filter(Boolean).join("\n"), s.registeredVia === "telegram" ? MENU_TG_REGISTERED : MENU);
}

async function screenModules(s) {
  const rows = COURSE.modules.map((m) => {
    const open = isModuleUnlocked(m.id, s);
    const done = s.progress?.[m.id]?.status === "done";
    const mark = done ? "✅" : open ? "▫️" : "🔒";
    return [{ text: `${mark} ${m.id}. ${m.title}`, callback_data: `mod:${m.id}` }];
  });
  rows.push([{ text: "‹ Меню", callback_data: "m" }]);
  await send(s.chatId, "<b>Модули курса</b>\nВыберите модуль:", rows);
}

async function screenModule(s, moduleId) {
  const mi = COURSE.modules.findIndex((m) => m.id === moduleId);
  const m = COURSE.modules[mi];
  if (!m) return;

  if (!isModuleUnlocked(m.id, s)) {
    await send(s.chatId,
      `🔒 <b>${esc(m.title)}</b>\n\nМодуль откроется, когда будет сдан тест Модуля ${m.id - 1}.`,
      [[{ text: `К Модулю ${m.id - 1}`, callback_data: `mod:${m.id - 1}` }], [{ text: "‹ Модули", callback_data: "mods" }]]);
    return;
  }

  const doneKeys = new Set(
    Object.entries(s.progress?.books || {}).filter(([, v]) => v?.status === "done").map(([k]) => k));
  const booksDone = m.lessons.filter((l) => doneKeys.has(l.key)).length;
  const allBooks = booksDone === m.lessons.length;
  const moduleDone = s.progress?.[m.id]?.status === "done";

  const rows = m.lessons.map((l, li) => [{
    text: `${doneKeys.has(l.key) ? "✅" : "▫️"} ${l.title.slice(0, 55)}`,
    callback_data: `les:${mi}:${li}`,
  }]);

  // «Продолжить» — сразу на первый несданный урок. Так же, как кнопка
  // «Продолжить обучение» в кабинете на сайте: человеку не нужно помнить,
  // где он остановился.
  const nextIdx = m.lessons.findIndex((l) => !doneKeys.has(l.key));
  if (nextIdx >= 0) {
    rows.unshift([{ text: `▶️ Продолжить: ${m.lessons[nextIdx].title.slice(0, 40)}`, callback_data: `les:${mi}:${nextIdx}` }]);
  }

  // Тест модуля — то, что закрывает модуль и открывает следующий.
  if (!moduleDone && (COURSE.quizzes?.[m.id] || []).length) {
    rows.push([{
      text: allBooks ? "📝 Сдать тест модуля" : `📝 Тест модуля (осталось книг: ${m.lessons.length - booksDone})`,
      callback_data: `mex:${m.id}`,
    }]);
  }
  if (moduleDone && m.id < COURSE.modules.length) {
    rows.push([{ text: `▶️ Модуль ${m.id + 1}`, callback_data: `mod:${m.id + 1}` }]);
  }
  rows.push([{ text: "‹ Модули", callback_data: "mods" }, { text: "Меню", callback_data: "m" }]);

  const head = [
    `<b>Модуль ${m.id}. ${esc(m.title)}</b>`,
    `${esc(m.level)} · книг: ${booksDone} из ${m.lessons.length}`,
    moduleDone
      ? "\n✅ Модуль сдан."
      : allBooks
        ? "\nВсе книги пройдены. Остался тест модуля — он открывает следующий."
        : "\nЧитайте книги и сдавайте их экзамены. Когда пройдёте все — откроется тест модуля.",
  ].join("\n");
  await send(s.chatId, head, rows);
}

async function screenLesson(s, mi, li, page = 0) {
  const m = COURSE.modules[mi];
  const l = m?.lessons[li];
  if (!l) return;
  if (!isModuleUnlocked(m.id, s)) return screenModule(s, m.id);

  const full = hasFullText(s);
  const doc = await loadLesson(l, full);
  if (!doc) {
    await send(s.chatId, "Не удалось загрузить урок. Попробуйте позже или откройте его на сайте.",
      [[{ text: "Открыть на сайте", url: `${SITE}/pages/book.html?doc=${encodeURIComponent(l.doc)}` }]]);
    return;
  }

  // Режем на страницы заранее, чтобы кнопка «дальше» знала, сколько их.
  const pages = [];
  let buf = "";
  for (const para of doc.text.split("\n\n")) {
    if ((buf + "\n\n" + para).length > CHUNK && buf) { pages.push(buf); buf = para; }
    else buf = buf ? buf + "\n\n" + para : para;
  }
  if (buf) pages.push(buf);

  const p = Math.min(Math.max(0, page), pages.length - 1);
  const nav = [];
  if (p > 0) nav.push({ text: "‹ Назад", callback_data: `rd:${mi}:${li}:${p - 1}` });
  if (p < pages.length - 1) nav.push({ text: "Дальше ›", callback_data: `rd:${mi}:${li}:${p + 1}` });

  const rows = [];
  if (nav.length) rows.push(nav);

  const last = p === pages.length - 1;
  if (last && doc.cut) {
    rows.push([{ text: "🔓 Открыть полный курс", url: "https://t.me/ruqoq" }]);
  }
  if (last && !doc.cut && l.exam) {
    rows.push([{ text: "📝 Сдать экзамен книги", callback_data: `ex:${mi}:${li}` }]);
  }
  if (last) {
    const tasks = (COURSE.assignments[m.id] || []).filter((a) => a.bookKey === l.key);
    if (tasks.length && !doc.cut) {
      rows.push([{ text: "🏋 Упражнение к книге", callback_data: `t:${tasks[0].id}` }]);
    }
    rows.push([{ text: "‹ К урокам", callback_data: `mod:${m.id}` }, { text: "Меню", callback_data: "m" }]);
  }

  const head = `<b>${esc(l.title)}</b>\nстраница ${p + 1} из ${pages.length}\n\n`;
  await send(s.chatId, head + pages[p], rows);

  if (last && doc.cut) {
    await send(s.chatId,
      "⬜ Это вводный отрывок. Полный текст открыт оплатившим курс.",
      [[{ text: "Открыть на сайте", url: `${SITE}/pages/book.html?doc=${encodeURIComponent(l.doc)}` }]]);
  }
}

// ───────────────────────────────── экзамен

async function examStart(s, mi, li) {
  const m = COURSE.modules[mi];
  const l = m?.lessons[li];
  if (!l?.exam) return;
  if (!hasFullText(s)) {
    await send(s.chatId, "Экзамен открыт тем, у кого открыт полный текст книги.");
    return;
  }
  const qs = await loadExam(l.exam);
  if (!qs?.length) { await send(s.chatId, "Экзамен пока недоступен."); return; }

  // Перемешиваем и вопросы, и варианты — как на сайте.
  const prepared = shuffle(qs).map((q) => {
    const idx = shuffle(q.options.map((_, i) => i));
    return { q: q.q, options: idx.map((i) => q.options[i]), correct: idx.indexOf(q.correct) };
  });
  await setState(s.chatId, { exam: { key: l.key, mi, li, qs: prepared, i: 0, right: 0 } });
  await send(s.chatId, `<b>Экзамен: ${esc(l.title)}</b>\nВопросов: ${prepared.length}. Порог — ${Math.round(COURSE.passThreshold * 100)}%.`);
  await examQuestion(s.chatId, { qs: prepared, i: 0 });
}

/** Тест МОДУЛЯ — тот самый, что закрывает модуль и открывает следующий.
 *
 *  Отличие от экзамена книги: результат пишется в progress.{модуль}.status,
 *  а следующий модуль открывается именно по нему. Пока тестов модулей в
 *  боте не было, ученик, прошедший все книги, упирался в потолок первого
 *  модуля навсегда (найдено 2026-07-27 по вопросу автора). */
async function moduleExamStart(s, moduleId) {
  const m = COURSE.modules.find((x) => x.id === moduleId);
  const bank = COURSE.quizzes?.[moduleId] || [];
  if (!m || !bank.length) { await send(s.chatId, "Тест этого модуля пока не готов."); return; }
  if (!hasFullText(s)) {
    await send(s.chatId, "Тест модуля открыт тем, у кого открыт полный курс.",
      [[{ text: "Купить курс", url: "https://t.me/ruqoq" }], [{ text: "‹ Назад", callback_data: `mod:${moduleId}` }]]);
    return;
  }
  if (!isModuleUnlocked(moduleId, s)) { await screenModule(s, moduleId); return; }

  const prepared = shuffle(bank).map((q) => {
    const idx = shuffle(q.options.map((_, i) => i));
    return { q: q.q, options: idx.map((i) => q.options[i]), correct: idx.indexOf(q.correct) };
  });
  await setState(s.chatId, { mexam: { moduleId, qs: prepared, i: 0, right: 0 } });
  await send(s.chatId, [
    `<b>Тест Модуля ${moduleId}. ${esc(m.title)}</b>`,
    `Вопросов: ${prepared.length}. Порог — ${Math.round(COURSE.passThreshold * 100)}%.`,
    "",
    "Сдадите — модуль закроется, откроется следующий и его упражнения.",
  ].join("\n"));
  await examQuestion(s.chatId, prepared[0] ? { qs: prepared, i: 0 } : null);
}

async function moduleExamAnswer(s, choice) {
  const ex = s.state?.mexam;
  if (!ex) return;
  const q = ex.qs[ex.i];
  const ok = choice === q.correct;
  if (ok) ex.right += 1;

  await send(s.chatId, ok
    ? "✅ Верно."
    : `❌ Неверно. Правильный ответ: <b>${LETTERS[q.correct]}</b>. ${esc(q.options[q.correct])}`);

  ex.i += 1;
  if (ex.i < ex.qs.length) {
    await setState(s.chatId, { mexam: ex });
    await examQuestion(s.chatId, ex);
    return;
  }

  const ratio = ex.right / ex.qs.length;
  const passed = ratio >= COURSE.passThreshold;
  const upd = {
    [`progress.${ex.moduleId}.quizScore`]: ratio,
    [`progress.${ex.moduleId}.status`]: passed ? "done" : "in_progress",
    lastSeenAt: new Date(),
    "progress.activityDates": FieldValue.arrayUnion(todayKey()),
  };
  if (passed) upd[`progress.${ex.moduleId}.passedAt`] = new Date();
  await deps.db.doc(`students/${s.uid}`).update(upd);
  await setState(s.chatId, {});

  const m = COURSE.modules.find((x) => x.id === ex.moduleId);
  const next = COURSE.modules.find((x) => x.id === ex.moduleId + 1);

  if (!passed) {
    await send(s.chatId, [
      "📖 <b>Тест модуля не сдан</b>",
      `Результат: <b>${Math.round(ratio * 100)}%</b> (${ex.right} из ${ex.qs.length})`,
      "",
      `Нужно ${Math.round(COURSE.passThreshold * 100)}%. Перечитайте книги модуля и попробуйте снова — это не потеря, а вторая попытка понять.`,
    ].join("\n"), [
      [{ text: "🔁 Пересдать", callback_data: `mex:${ex.moduleId}` }],
      [{ text: "‹ К модулю", callback_data: `mod:${ex.moduleId}` }],
    ]);
    return;
  }

  // Сдал — говорим прямо, что именно открылось. Иначе человек не понимает,
  // что дальше, и ждёт от бота следующего шага.
  const openedTasks = (COURSE.assignments[ex.moduleId + 1] || []).length;
  const rows = [];
  if (next) {
    rows.push([{ text: `▶️ Открыть Модуль ${next.id}. ${next.title.slice(0, 35)}`, callback_data: `mod:${next.id}` }]);
    if (openedTasks) rows.push([{ text: "🏋 Упражнения", callback_data: "pr" }]);
  }
  rows.push([{ text: "📊 Мой прогресс", callback_data: "prog" }, { text: "Меню", callback_data: "m" }]);

  await send(s.chatId, [
    `🎉 <b>Модуль ${ex.moduleId} сдан!</b>`,
    `${esc(m.title)} — <b>${Math.round(ratio * 100)}%</b>`,
    "",
    next
      ? `Открыт <b>Модуль ${next.id}. ${esc(next.title)}</b>${openedTasks ? " и его упражнения" : ""}.`
      : "Это был последний модуль курса. الحمد لله",
  ].join("\n"), rows);
}

const LETTERS = ["А", "Б", "В", "Г", "Д", "Е"];

async function examQuestion(chatId, ex) {
  const q = ex.qs[ex.i];
  const rows = q.options.map((o, i) => [{ text: `${LETTERS[i]}. ${o.slice(0, 60)}`, callback_data: `ea:${i}` }]);
  await send(chatId, `<b>Вопрос ${ex.i + 1} из ${ex.qs.length}</b>\n\n${esc(q.q)}\n\n` +
    q.options.map((o, i) => `<b>${LETTERS[i]}.</b> ${esc(o)}`).join("\n\n"), rows);
}

async function examAnswer(s, choice) {
  const ex = s.state?.exam;
  if (!ex) return;
  const q = ex.qs[ex.i];
  const ok = choice === q.correct;
  if (ok) ex.right += 1;

  await send(s.chatId, ok
    ? "✅ Верно."
    : `❌ Неверно. Правильный ответ: <b>${LETTERS[q.correct]}</b>. ${esc(q.options[q.correct])}`);

  ex.i += 1;
  if (ex.i < ex.qs.length) {
    await setState(s.chatId, { exam: ex });
    await examQuestion(s.chatId, ex);
    return;
  }

  // Результат — пишем в тот же прогресс, что и сайт.
  const ratio = ex.right / ex.qs.length;
  const passed = ratio >= COURSE.passThreshold;
  const upd = {
    [`progress.books.${ex.key}.quizScore`]: ratio,
    [`progress.books.${ex.key}.status`]: passed ? "done" : "in_progress",
    lastSeenAt: new Date(),
    "progress.activityDates": FieldValue.arrayUnion(todayKey()),
  };
  if (passed) upd[`progress.books.${ex.key}.passedAt`] = new Date();
  await deps.db.doc(`students/${s.uid}`).update(upd);
  await setState(s.chatId, {});

  const m = COURSE.modules[ex.mi];
  const l = m.lessons[ex.li];
  const rows = [];
  const tasks = (COURSE.assignments[m.id] || []).filter((a) => a.bookKey === ex.key);
  if (passed && tasks.length) rows.push([{ text: "🏋 К упражнению", callback_data: `t:${tasks[0].id}` }]);

  // Была ли это последняя книга модуля? Тогда сразу зовём на тест модуля —
  // иначе человек закрывает бота, не поняв, что модуль почти пройден.
  let lastOfModule = false;
  if (passed) {
    const fresh = await deps.db.doc(`students/${s.uid}`).get();
    const books = fresh.exists ? (fresh.data().progress?.books || {}) : {};
    lastOfModule = m.lessons.every((l) => books[l.key]?.status === "done");
    if (lastOfModule && fresh.data().progress?.[m.id]?.status !== "done") {
      rows.push([{ text: "📝 Сдать тест модуля", callback_data: `mex:${m.id}` }]);
    } else if (!lastOfModule) {
      const nextIdx = m.lessons.findIndex((l) => books[l.key]?.status !== "done");
      if (nextIdx >= 0) {
        rows.push([{ text: `▶️ Следующая книга: ${m.lessons[nextIdx].title.slice(0, 35)}`, callback_data: `les:${ex.mi}:${nextIdx}` }]);
      }
    }
  }

  if (!passed) rows.push([{ text: "🔁 Пересдать", callback_data: `ex:${ex.mi}:${ex.li}` }]);
  rows.push([{ text: "‹ К урокам", callback_data: `mod:${m.id}` }, { text: "Меню", callback_data: "m" }]);

  await send(s.chatId, [
    passed ? "🎉 <b>Экзамен сдан</b>" : "📖 <b>Экзамен не сдан</b>",
    `${esc(l.title)}`,
    `Результат: <b>${Math.round(ratio * 100)}%</b> (${ex.right} из ${ex.qs.length})`,
    passed ? "" : `Нужно ${Math.round(COURSE.passThreshold * 100)}%. Перечитайте книгу и попробуйте снова — это не потеря, а вторая попытка понять.`,
    passed && lastOfModule ? "\n<b>Все книги модуля пройдены.</b> Остался тест модуля — он открывает следующий." : "",
  ].filter(Boolean).join("\n"), rows);
}

// ───────────────────────────────── упражнения

async function screenPractice(s) {
  const rows = [];
  let open = 0;
  for (const m of COURSE.modules) {
    for (const a of COURSE.assignments[m.id] || []) {
      if (!isTaskUnlocked(a, m.id, s)) continue;
      open += 1;
      const done = (s.progress?.[m.id]?.doneAssignments || []).includes(a.id);
      if (rows.length < 20) rows.push([{ text: `${done ? "✅" : "▫️"} ${a.title.slice(0, 55)}`, callback_data: `t:${a.id}` }]);
    }
  }
  rows.push([{ text: "‹ Меню", callback_data: "m" }]);
  await send(s.chatId, open
    ? `<b>Практика</b>\nОткрыто упражнений: ${open}${open > 20 ? " (показаны первые 20)" : ""}`
    : "<b>Практика</b>\n\nПока не открыто ни одного упражнения. Упражнение книги открывается, когда сдан её экзамен.",
    rows);
}

async function screenTask(s, id) {
  const found = taskById(id);
  if (!found) return;
  const { task: a, moduleId } = found;

  if (!isTaskUnlocked(a, moduleId, s)) {
    const l = a.bookKey ? lessonByKey(a.bookKey) : null;
    await send(s.chatId,
      `🔒 <b>${esc(a.title)}</b>\n\nОткроется, когда вы сдадите экзамен книги «${esc(l?.title || "")}».`,
      [[{ text: "‹ Практика", callback_data: "pr" }]]);
    return;
  }

  const log = s.progress?.[moduleId]?.log?.[a.id] || {};
  const done = (s.progress?.[moduleId]?.doneAssignments || []).includes(a.id);
  const step = Number(log.step || 0);

  const out = [
    `${a.type === "daily" ? "📅" : a.type === "practice" ? "🏋" : "📝"} <b>${esc(a.title)}</b>`,
    `Длительность: ${esc(a.duration)}`,
    "",
    esc(a.description),
  ];

  if (a.intent) {
    out.push("", "<b>НАМЕРЕНИЕ</b>", `<i>${esc(a.intent)}</i>`,
      "Повторяйте в сердце, не двигая губами. В скобках подставьте своё.");
  }

  if (a.steps.length) {
    out.push("", "<b>ШАГИ</b>");
    a.steps.forEach((t, i) => out.push(`${i < step ? "✅" : `${i + 1}.`} ${esc(t)}`));
  }

  if (a.counter) {
    const target = Number(log.target || a.counter.targets[0]);
    out.push("", `<b>${esc(a.counter.label)}</b>: ${Number(log.count || 0)} / ${target}`);
  }

  if (a.days) {
    const st = streakOf(log.days);
    out.push("", `<b>Серия</b>: ${st} из ${a.days} дней`);
  }

  if (a.check) out.push("", "<b>СДЕЛАНО, КОГДА</b>", esc(a.check));

  const rows = [];
  if (a.steps.length && step < a.steps.length) {
    rows.push([{ text: `✓ Шаг ${step + 1} сделан`, callback_data: `ts:${a.id}` }]);
  }
  if (a.counter) {
    rows.push([
      { text: "＋1", callback_data: `tc:${a.id}` },
      { text: "Сбросить", callback_data: `tcr:${a.id}` },
    ]);
  }
  if (a.days) {
    const marked = (log.days || []).includes(todayKey());
    rows.push([{ text: marked ? "↩ Снять отметку за сегодня" : "📅 Отметить сегодня", callback_data: `td:${a.id}` }]);
  }
  rows.push([{ text: "✍️ Записать наблюдение", callback_data: `tn:${a.id}` }]);
  rows.push(done
    ? [{ text: "✅ Выполнено — снять", callback_data: `tu:${a.id}` }]
    : [{ text: "Выполнил", callback_data: `tdone:${a.id}` }]);
  rows.push([{ text: "‹ Практика", callback_data: "pr" }, { text: "Меню", callback_data: "m" }]);

  await sendLong(s.chatId, out.join("\n"), rows);
}

/** Путь к журналу упражнения. Идентификаторы содержат дефис («m1-8»), а в
 *  строковом пути Firestore дефис — часть имени только внутри обратных
 *  кавычек. FieldPath принимает сегменты списком и ничего не разбирает. */
function logPath(moduleId, id, leaf) {
  return new FieldPath("progress", String(moduleId), "log", id, leaf);
}

async function taskAction(s, action, id) {
  const found = taskById(id);
  if (!found) return;
  const { task: a, moduleId } = found;
  // Замок проверяем и здесь, а не только на экране: идентификатор
  // упражнения виден в кнопке, и нажать по нему можно из старого
  // сообщения, когда экран уже говорил «закрыто».
  if (!isTaskUnlocked(a, moduleId, s)) return screenTask(s, id);
  const ref = deps.db.doc(`students/${s.uid}`);
  const log = s.progress?.[moduleId]?.log?.[a.id] || {};

  if (action === "ts") {
    await ref.update(logPath(moduleId, id, "step"), Number(log.step || 0) + 1);
  } else if (action === "tc") {
    await ref.update(logPath(moduleId, id, "count"), Number(log.count || 0) + 1);
  } else if (action === "tcr") {
    await ref.update(logPath(moduleId, id, "count"), 0);
  } else if (action === "td") {
    const has = (log.days || []).includes(todayKey());
    await ref.update(
      logPath(moduleId, id, "days"), has ? FieldValue.arrayRemove(todayKey()) : FieldValue.arrayUnion(todayKey()),
      "progress.activityDates", FieldValue.arrayUnion(todayKey()),
      "lastSeenAt", new Date(),
    );
  } else if (action === "tdone") {
    await ref.update({
      [`progress.${moduleId}.doneAssignments`]: FieldValue.arrayUnion(id),
      "progress.activityDates": FieldValue.arrayUnion(todayKey()),
      lastSeenAt: new Date(),
    });
  } else if (action === "tu") {
    await ref.update({
      [`progress.${moduleId}.doneAssignments`]: FieldValue.arrayRemove(id),
      [`progress.${moduleId}.answeredAssignments`]: FieldValue.arrayRemove(id),
    });
  }

  const fresh = await findStudent(s.chatId);
  if (fresh) await screenTask(fresh, id);
}

// ───────────────────────────────── прогресс и «сегодня»

async function screenProgress(s) {
  const pr = s.progress || {};
  const modsDone = COURSE.modules.filter((m) => pr[m.id]?.status === "done").length;
  const booksTotal = COURSE.modules.reduce((n, m) => n + m.lessons.length, 0);
  const booksDone = Object.values(pr.books || {}).filter((b) => b?.status === "done").length;
  let tasksDone = 0;
  for (const m of COURSE.modules) tasksDone += (pr[m.id]?.doneAssignments || []).length;

  const scores = Object.values(pr.books || {}).map((b) => b?.quizScore).filter((x) => typeof x === "number");
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 100) : null;

  await send(s.chatId, [
    "<b>📊 Мой прогресс</b>", "",
    `Модули: <b>${modsDone}</b> из ${COURSE.modules.length}`,
    `Книги: <b>${booksDone}</b> из ${booksTotal}`,
    `Упражнения: <b>${tasksDone}</b>`,
    avg === null ? "" : `Средний балл: <b>${avg}%</b>`,
    "", hasFullText(s) ? "Доступ: полный" : "Доступ: вводные отрывки",
    `Супервизия: ${(s.supervision?.accepted || 0)} из ${COURSE.casesRequired || 3} разборов принято`,
  ].filter(Boolean).join("\n"), [
    [{ text: "🎓 Супервизия", callback_data: "sv" }],
    [{ text: "‹ Меню", callback_data: "m" }],
  ]);
}

/** «Что сегодня» — только начатые многодневные, которые сегодня ещё не
 *  отмечены. Не начатые сюда не попадают: иначе список из двадцати с
 *  лишним пунктов перестал бы отвечать на свой единственный вопрос. */
function todayTasks(s) {
  const out = [];
  for (const m of COURSE.modules) {
    for (const a of COURSE.assignments[m.id] || []) {
      if (!a.days) continue;
      if ((s.progress?.[m.id]?.doneAssignments || []).includes(a.id)) continue;
      const log = s.progress?.[m.id]?.log?.[a.id] || {};
      if (!log.days?.length) continue;
      if (log.days.includes(todayKey())) continue;
      out.push({ a, streak: streakOf(log.days) });
    }
  }
  return out;
}

async function screenToday(s) {
  const list = todayTasks(s);
  if (!list.length) {
    await send(s.chatId, "<b>🗓 Сегодня</b>\n\nНезакрытых на сегодня упражнений нет. الحمد لله",
      [[{ text: "🏋 Практика", callback_data: "pr" }], [{ text: "‹ Меню", callback_data: "m" }]]);
    return;
  }
  const rows = list.map(({ a, streak }) =>
    [{ text: `${a.title.slice(0, 45)} · ${streak}/${a.days}`, callback_data: `t:${a.id}` }]);
  rows.push([{ text: "‹ Меню", callback_data: "m" }]);
  await send(s.chatId, `<b>🗓 Сегодня</b>\n\nНе отмечено упражнений: ${list.length}`, rows);
}

// ───────────────────────────────── супервизия Модуля 11
//
// Решение автора 2026-07-27. «Финальный практикум под супервизией» был
// обещанием без механизма: прислать разбор было некуда, посмотреть его
// нечем, «допущен к практике» нигде не фиксировалось. Это самая дорогая
// часть курса — и единственная, которой технически не существовало.
//
// Форма строгая и одна на сайт и бота (COURSE.caseFields). В свободном
// рассказе первым выпадает то, о чём неудобно писать: не спросил про
// красные флаги, вывод сделал по впечатлению, результата не было — а
// именно это наставнику и нужно видеть.

const CASE_ST = {
  draft:     "✏️ Черновик",
  submitted: "⏳ На проверке",
  returned:  "↩️ Возвращён на доработку",
  accepted:  "✅ Принят",
};

async function loadCases(uid) {
  const snap = await deps.db.collection(`students/${uid}/cases`).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.n || 0) - (b.n || 0));
}

async function screenSupervision(s) {
  const need = COURSE.casesRequired || 3;
  const cases = await loadCases(s.uid);
  const accepted = cases.filter((c) => c.status === "accepted").length;
  const passed = accepted >= need;

  // Супервизия — финал курса. Пускать в неё раньше времени значит
  // приглашать разбирать случаи того, кто ещё не прошёл диагностику.
  const modulesDone = COURSE.modules.filter((m) => s.progress?.[m.id]?.status === "done").length;
  const ready = s.fullAccess || modulesDone >= COURSE.modules.length - 1;

  const out = [
    "<b>🎓 Супервизия — допуск к практике</b>", "",
    `Принято разборов: <b>${accepted}</b> из ${need}`,
  ];

  if (passed) {
    out.push("", "Вы допущены к практике. الحمد لله");
  } else if (!ready) {
    out.push("", `Откроется, когда пройдёте модули курса. Сейчас сдано: ${modulesDone} из ${COURSE.modules.length}.`);
  } else {
    out.push("",
      "Разберите случай своей практики по шагам — на себе или на близком с его согласия.",
      "Наставник прочитает и ответит: примет или вернёт с замечанием.",
      "",
      `Всего шагов: ${COURSE.caseFields.length}. Отвечать можно не подряд — черновик сохраняется.`);
  }

  const rows = [];
  for (const c of cases) {
    rows.push([{ text: `${CASE_ST[c.status] || ""} · Случай ${c.n}`.slice(0, 60), callback_data: `svc:${c.id}` }]);
  }
  if (ready && !passed && cases.filter((c) => c.status !== "accepted").length === 0 && cases.length < need) {
    rows.push([{ text: "➕ Разобрать случай", callback_data: "svnew" }]);
  } else if (ready && !passed && !cases.some((c) => ["draft", "returned"].includes(c.status)) && cases.length < need) {
    rows.push([{ text: "➕ Разобрать ещё случай", callback_data: "svnew" }]);
  }
  rows.push([{ text: "‹ Меню", callback_data: "m" }]);

  await sendLong(s.chatId, out.join("\n"), rows);
}

async function caseNew(s) {
  const need = COURSE.casesRequired || 3;
  const cases = await loadCases(s.uid);
  if (cases.length >= need && cases.every((c) => c.status === "accepted")) { await screenSupervision(s); return; }

  const n = cases.length + 1;
  const ref = deps.db.collection(`students/${s.uid}/cases`).doc();
  await ref.set({ n, status: "draft", fields: {}, createdAt: new Date() });
  await caseAsk(s, ref.id, 0);
}

/** Один шаг формы. Вопрос и подсказка идут вместе: подсказка здесь не
 *  украшение, а половина обучения — она называет то, что человек чаще
 *  всего пропускает. */
async function caseAsk(s, caseId, idx) {
  const f = COURSE.caseFields[idx];
  if (!f) return caseReview(s, caseId);

  await setState(s.chatId, { awaiting: `case:${caseId}:${idx}` });
  await send(s.chatId, [
    `<b>Разбор случая — шаг ${idx + 1} из ${COURSE.caseFields.length}</b>`,
    `<b>${esc(f.title)}</b>`, "",
    esc(f.q), "",
    `<i>${esc(f.hint)}</i>`,
  ].join("\n"), [[{ text: "Прервать — сохранится черновиком", callback_data: "sv" }]]);
}

async function caseAnswer(s, caseId, idx, text) {
  const f = COURSE.caseFields[idx];
  if (!f) return;
  const v = String(text).trim();
  if (v.length < f.min) {
    await send(s.chatId, `Слишком коротко — нужно хотя бы ${f.min} знаков. Наставник должен понять случай, не переспрашивая.\n\nНапишите подробнее.`);
    return;
  }
  await deps.db.doc(`students/${s.uid}/cases/${caseId}`).update({
    [`fields.${f.key}`]: v.slice(0, 4000),
    updatedAt: new Date(),
  });
  await caseAsk(s, caseId, idx + 1);
}

/** Показ собранного случая перед отправкой — и он же экран уже отправленного. */
async function caseReview(s, caseId) {
  const snap = await deps.db.doc(`students/${s.uid}/cases/${caseId}`).get();
  if (!snap.exists) return screenSupervision(s);
  const c = snap.data();
  await setState(s.chatId, {});

  const out = [`<b>Случай ${c.n}</b> — ${CASE_ST[c.status] || ""}`, ""];
  const missing = [];
  COURSE.caseFields.forEach((f, i) => {
    const v = c.fields?.[f.key];
    if (!v || String(v).trim().length < f.min) { missing.push(i); out.push(`${i + 1}. <b>${esc(f.title)}</b> — <i>не заполнено</i>`); }
    else out.push(`${i + 1}. <b>${esc(f.title)}</b>\n${esc(v)}`);
    out.push("");
  });

  if (c.verdict?.text) {
    out.push("<b>Заключение наставника</b>", esc(c.verdict.text), "");
  }

  const rows = [];
  if (c.status !== "accepted" && c.status !== "submitted") {
    if (missing.length) {
      rows.push([{ text: `✏️ Заполнить (осталось ${missing.length})`, callback_data: `svf:${caseId}:${missing[0]}` }]);
    } else {
      rows.push([{ text: "📨 Отправить наставнику", callback_data: `svs:${caseId}` }]);
    }
    rows.push([{ text: "✏️ Править с начала", callback_data: `svf:${caseId}:0` }]);
  }
  rows.push([{ text: "‹ Супервизия", callback_data: "sv" }]);
  await sendLong(s.chatId, out.join("\n"), rows);
}

async function caseSubmit(s, caseId) {
  const ref = deps.db.doc(`students/${s.uid}/cases/${caseId}`);
  const snap = await ref.get();
  if (!snap.exists) return;
  const c = snap.data();

  const missing = COURSE.caseFields.filter((f) => String(c.fields?.[f.key] || "").trim().length < f.min);
  if (missing.length) { await send(s.chatId, "Ещё не всё заполнено."); return caseReview(s, caseId); }

  await ref.update({ status: "submitted", submittedAt: new Date() });
  await send(s.chatId, [
    `📨 Случай ${c.n} отправлен наставнику.`, "",
    "Он прочитает и ответит: примет или вернёт с замечанием. Ответ придёт сюда.",
  ].join("\n"), [[{ text: "‹ Супервизия", callback_data: "sv" }]]);

  await deps.tg("sendMessage", {
    chat_id: deps.CHAT,
    text: [
      "🎓 <b>Разбор случая на проверку</b>", "",
      `Ученик: ${esc(s.name || s.email || "")}`,
      `Случай ${c.n} из ${COURSE.casesRequired || 3}`,
    ].join("\n"),
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: [
      [{ text: "📖 Открыть разбор", callback_data: `sr:${s.uid}:${caseId}` }],
      [{ text: "🎓 Все на проверке", callback_data: "sq" }],
    ]},
  });
}

// ───────────────────────────────── связь с наставником

async function askMentor(s) {
  await setState(s.chatId, { awaiting: "mentor" });
  await send(s.chatId, "Напишите вопрос одним сообщением — я передам наставнику. Ответ придёт сюда же.",
    [[{ text: "Отмена", callback_data: "m" }]]);
}

async function saveMentorQuestion(s, text) {
  await deps.db.collection(`students/${s.uid}/messages`).add({
    from: "student",
    text,
    createdAt: new Date(),
    read: false,
    via: "telegram",
  });
  await setState(s.chatId, {});
  await send(s.chatId, "Вопрос передан наставнику. Ответ придёт сюда.", [[{ text: "‹ Меню", callback_data: "m" }]]);

  // Автору — с пометкой, по которой его ответ вернётся этому же ученику.
  await deps.tg("sendMessage", {
    chat_id: deps.CHAT,
    text: `💬 <b>${esc(s.name || s.email || "Ученик")}</b> (Telegram)\n\n${esc(text)}\n\n<code>#${s.uid}</code>\nОтветьте на это сообщение — ответ уйдёт ученику.`,
    parse_mode: "HTML",
  });
}

async function saveObservation(s, id, text) {
  const found = taskById(id);
  if (!found) return;
  await deps.db.doc(`students/${s.uid}`).update(
    logPath(found.moduleId, id, "notes"),
    FieldValue.arrayUnion({ d: todayKey(), text: String(text).slice(0, 1000) }),
    "progress.activityDates", FieldValue.arrayUnion(todayKey()),
    "lastSeenAt", new Date(),
  );
  await setState(s.chatId, {});
  await send(s.chatId, "Записано.");
  const fresh = await findStudent(s.chatId);
  if (fresh) await screenTask(fresh, id);
}

/** Ответ автора на пересланный вопрос. Uid берём из пометки <code>#uid</code>
 *  в цитируемом сообщении — отдельного состояния для этого не нужно. */
async function mentorReply(msg) {
  const quoted = msg.reply_to_message?.text || "";
  const m = quoted.match(/#([A-Za-z0-9_-]{4,})/);
  if (!m) return false;
  const uid = m[1];
  // Проверяем, что такой ученик есть. Без этого автор, ответивший на любое
  // своё сообщение со словом через решётку, получал бы «отправлено» — и не
  // узнал бы, что ответ не ушёл никуда.
  const exists = await deps.db.doc(`students/${uid}`).get();
  if (!exists.exists) return false;
  await deps.db.collection(`students/${uid}/messages`).add({
    from: "admin", text: msg.text, createdAt: new Date(), read: false,
    // Пометка нужна триггеру onChatMessage: он по ней понимает, что в
    // Telegram сообщение уже ушло, и не отправляет его вторым обрезанным
    // превью.
    via: "telegram",
  });
  const link = await deps.db.collection("tgUsers").where("uid", "==", uid).limit(1).get();
  if (!link.empty) {
    await send(link.docs[0].id, `💬 <b>Ответ наставника</b>\n\n${esc(msg.text)}`, [[{ text: "Ответить", callback_data: "ask" }]]);
  }
  await deps.tg("sendMessage", { chat_id: deps.CHAT, text: "✅ Отправлено ученику." });
  return true;
}

// ───────────────────────────────── привязка аккаунта

/** /start <код>. Код одноразовый, выдаётся в кабинете ученика и живёт
 *  15 минут: попавший в чужие руки старый код не должен открывать доступ
 *  к чужому прогрессу. */
async function linkByCode(chatId, code, from) {
  const q = await deps.db.collection("students").where("tgLinkCode", "==", code).limit(1).get();
  if (q.empty) {
    await send(chatId, "Код не найден или уже использован.\n\nОткройте кабинет на сайте → «Привязать Telegram» и нажмите кнопку заново.");
    return;
  }
  const doc = q.docs[0];
  const s = doc.data();
  // Дата выдачи приходит из Firestore как Timestamp, но в прогоне (и при
  // ручной правке в консоли) может оказаться обычной датой или числом —
  // принимаем все три, иначе рабочий код молча считает код просроченным.
  const at = s.tgLinkCodeAt;
  const issued = at?.toMillis?.() ?? at?.getTime?.() ?? (typeof at === "number" ? at : 0);
  if (!issued || Date.now() - issued > 15 * 60 * 1000) {
    await send(chatId, "Срок кода истёк. Получите новый в кабинете на сайте.");
    return;
  }

  await deps.db.doc(`students/${doc.id}`).update({
    tgChatId: String(chatId),
    tgUsername: from?.username || null,
    tgLinkCode: FieldValue.delete(),
    tgLinkCodeAt: FieldValue.delete(),
  });
  await deps.db.doc(`tgUsers/${chatId}`).set({ uid: doc.id, state: {}, linkedAt: new Date() });

  await send(chatId, `Готово, ${esc(s.name || "")}. Аккаунт привязан — прогресс общий с сайтом.`);
  const fresh = await findStudent(chatId);
  if (fresh) await screenMenu(fresh);
}

async function greetUnlinked(chatId) {
  await send(chatId, [
    "<b>Школа рукии</b>",
    "Ассаламу алейкум.", "",
    "Здесь можно читать книги курса, сдавать экзамены и вести упражнения — прямо в Telegram.",
    "",
    "<b>Если вы уже учитесь на сайте</b> — привяжите аккаунт, чтобы прогресс был общим: кабинет → «Привязать Telegram».",
    "",
    "<b>Если вас в школе ещё нет</b> — можно записаться прямо здесь, сайт не понадобится.",
  ].join("\n"), [
    [{ text: "📝 Записаться в школу", callback_data: "reg" }],
    [{ text: "У меня есть аккаунт на сайте", url: `${SITE}/pages/dashboard/student.html` }],
    [{ text: "Купить курс", url: "https://t.me/ruqoq" }],
  ]);
}

// ───────────────────────────────── регистрация прямо в боте
//
// Запрос автора 2026-07-27: «для тех учеников, которые не могут попасть на
// сайт». Раньше единственная дорога в школу шла через браузер: не открылся
// сайт — человека нет.
//
// ПОЧЕМУ СОЗДАЁМ УЧЁТНУЮ ЗАПИСЬ FIREBASE, А НЕ ПРОСТО ЗАПИСЬ В БАЗЕ.
// Прогресс лежит в students/{uid}, где uid — идентификатор учётной записи.
// Заведи мы запись со случайным идентификатором, то в день, когда человек
// всё-таки откроет сайт и зарегистрируется там, у него появился бы ВТОРОЙ
// аккаунт, а первый с его прогрессом остался бы недостижимым. Поэтому
// учётная запись создаётся сразу, через Admin SDK, и uid один и тот же.
//
// Пароль не задаётся: человек его не вводит и не придумывает. Когда сайт
// понадобится, бот выдаёт ссылку на установку пароля (кнопка ниже).

async function regStart(s_chatId) {
  await setState(s_chatId, { awaiting: "reg_name" });
  await send(s_chatId, [
    "<b>Запись в школу</b>", "",
    "Напишите ваше имя — как к вам обращаться.",
  ].join("\n"), [[{ text: "Отмена", callback_data: "cancel" }]]);
}

async function regName(chatId, text) {
  const name = String(text).trim().slice(0, 60);
  if (name.length < 2) {
    await send(chatId, "Слишком коротко. Напишите имя целиком.");
    return;
  }
  await setState(chatId, { awaiting: "reg_email", regName: name });
  await send(chatId, [
    `Приятно познакомиться, ${esc(name)}.`, "",
    "Теперь напишите вашу почту. Она нужна, чтобы вы могли войти и с сайта — тем же аккаунтом, с тем же прогрессом.",
  ].join("\n"), [[{ text: "Отмена", callback_data: "cancel" }]]);
}

// Проверка почты нарочно простая. Строгая регулярка отсекает редкие, но
// вполне рабочие адреса, а настоящая проверка — это письмо, которого мы
// здесь не шлём. Задача — отсеять опечатки вроде «ivan@mail» и «ivan.ru».
function looksLikeEmail(v) {
  return /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/.test(v);
}

async function regEmail(s, chatId, text) {
  const email = String(text).trim().toLowerCase();
  const name = s.state?.regName || "";

  if (!looksLikeEmail(email)) {
    await send(chatId, "Это не похоже на почту. Пример: имя@почта.ру\n\nНапишите ещё раз.");
    return;
  }

  const auth = getAuth();

  // Почта занята — значит аккаунт уже есть. Молча привязать к нему чужой
  // Telegram нельзя: назвать чужой адрес может кто угодно, и это был бы
  // захват аккаунта вместе со всем прогрессом. Решает автор.
  let existing = null;
  try { existing = await auth.getUserByEmail(email); } catch (e) { /* нет такого — это норма */ }

  if (existing) {
    await setState(chatId, {});
    await send(chatId, [
      "Аккаунт с такой почтой уже есть.", "",
      "Если он ваш — я передал просьбу наставнику, он привяжет этот Telegram вручную. Обычно это занимает недолго.",
      "",
      "Если сайт открывается — быстрее сделать самому: кабинет → «Привязать Telegram».",
    ].join("\n"), [[{ text: "‹ Назад", callback_data: "m" }]]);

    await deps.tg("sendMessage", {
      chat_id: deps.CHAT,
      text: [
        "🔗 <b>Просьба привязать Telegram</b>", "",
        `Имя в боте: ${esc(name || "—")}`,
        `Почта: <code>${esc(email)}</code>`,
        `Telegram: @${esc(s.username || "—")} (chat ${chatId})`,
        "",
        "Аккаунт с такой почтой уже существует. Привязывать?",
        "Нажимайте только если уверены, что это тот же человек.",
      ].join("\n"),
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [
        [{ text: "🔗 Привязать", callback_data: `tglink:${existing.uid}:${chatId}` }],
      ]},
    });
    return;
  }

  // Создаём учётную запись и профиль ученика. Форма профиля — ровно та же,
  // что при регистрации на сайте (integration/auth.js#registerStudent):
  // иначе кабинет и бот показывали бы разное.
  let user;
  try {
    user = await auth.createUser({ email, displayName: name, emailVerified: false });
  } catch (e) {
    deps.logger.error("createUser", e);
    await send(chatId, "Не получилось создать аккаунт. Напишите наставнику — он заведёт вас вручную.",
      [[{ text: "‹ Назад", callback_data: "m" }]]);
    return;
  }

  await deps.db.doc(`students/${user.uid}`).set({
    name,
    email,
    paid: false,              // оплату подтверждает автор вручную
    createdAt: new Date(),
    progress: {},
    tgChatId: String(chatId),
    tgUsername: s.username || null,
    registeredVia: "telegram",
  });
  await deps.db.doc(`tgUsers/${chatId}`).set({ uid: user.uid, state: {}, linkedAt: new Date() });

  await send(chatId, [
    `Готово, ${esc(name)}. Вы записаны в школу.`, "",
    "Сейчас открыт первый модуль во вводных отрывках. Полный курс открывается после оплаты — наставник подтвердит её вручную.",
  ].join("\n"), [
    [{ text: "📖 Начать с Модуля 1", callback_data: "mod:1" }],
    [{ text: "Купить курс", url: "https://t.me/ruqoq" }],
    [{ text: "🔑 Пароль для входа на сайт", callback_data: "pwd" }],
  ]);

  const fresh = await findStudent(chatId);
  if (fresh) await screenMenu(fresh);
}

/** Ссылка на установку пароля — чтобы тот же аккаунт открылся и на сайте,
 *  когда сайт заработает. Ссылку выдаёт Firebase, живёт она ограниченно. */
async function sendPasswordLink(s) {
  if (!s.email) { await send(s.chatId, "У аккаунта нет почты — напишите наставнику."); return; }
  try {
    const link = await getAuth().generatePasswordResetLink(s.email);
    await send(s.chatId, [
      "<b>Вход на сайт</b>", "",
      `Почта: <code>${esc(s.email)}</code>`,
      "",
      "Откройте ссылку и задайте пароль — после этого сможете войти на сайте с тем же прогрессом.",
      "Ссылка одноразовая и действует ограниченное время.",
    ].join("\n"), [[{ text: "Задать пароль", url: link }], [{ text: "‹ Меню", callback_data: "m" }]]);
  } catch (e) {
    deps.logger.error("resetLink", e);
    await send(s.chatId, "Не получилось создать ссылку. Напишите наставнику.");
  }
}

// ───────────────────────────────── маршрутизация

async function onMessage(msg) {
  const chatId = msg.chat.id;
  const text = (msg.text || "").trim();

  if (text.startsWith("/start")) {
    const code = text.split(/\s+/)[1];
    if (code) return linkByCode(chatId, code, msg.from);
    const s = await findStudent(chatId);
    return s ? screenMenu(s) : greetUnlinked(chatId);
  }

  // Регистрация идёт ДО поиска ученика: человека в базе ещё нет, но
  // состояние диалога уже есть — иначе бот забывал бы, что спросил имя.
  const link = await deps.db.doc(`tgUsers/${chatId}`).get();
  const pending = link.exists ? (link.data().state || {}) : {};
  if (pending.awaiting === "reg_name") return regName(chatId, text);
  if (pending.awaiting === "reg_email") {
    return regEmail({ state: pending, username: msg.from?.username }, chatId, text);
  }

  const s = await findStudent(chatId);
  if (!s) return greetUnlinked(chatId);

  // Ждём от него текст? Тогда это ответ, а не команда.
  const aw = s.state?.awaiting;
  if (aw === "mentor") return saveMentorQuestion(s, text);
  if (aw?.startsWith?.("note:")) return saveObservation(s, aw.slice(5), text);
  if (aw?.startsWith?.("case:")) {
    const [, caseId, idx] = aw.split(":");
    return caseAnswer(s, caseId, Number(idx), text);
  }

  if (text === "/menu" || text === "/help") return screenMenu(s);
  if (text === "/today") return screenToday(s);
  if (text === "/progress") return screenProgress(s);

  return screenMenu(s);
}

async function onCallback(cb) {
  const chatId = cb.message.chat.id;
  const data = cb.data || "";

  // Эти две кнопки нажимают ДО того, как аккаунт существует.
  if (data === "reg") { await ack(cb.id); return regStart(chatId); }
  if (data === "cancel") {
    await ack(cb.id);
    await setState(chatId, {});
    const who = await findStudent(chatId);
    return who ? screenMenu(who) : greetUnlinked(chatId);
  }

  const s = await findStudent(chatId);
  if (!s) { await ack(cb.id); return greetUnlinked(chatId); }

  const [head, ...rest] = data.split(":");
  try {
    switch (head) {
      case "m": await ack(cb.id); return screenMenu(s);
      case "mods": await ack(cb.id); return screenModules(s);
      case "mod": await ack(cb.id); return screenModule(s, Number(rest[0]));
      case "les": await ack(cb.id); return screenLesson(s, Number(rest[0]), Number(rest[1]), 0);
      case "rd": await ack(cb.id); return screenLesson(s, Number(rest[0]), Number(rest[1]), Number(rest[2]));
      case "ex": await ack(cb.id); return examStart(s, Number(rest[0]), Number(rest[1]));
      case "mex": await ack(cb.id); return moduleExamStart(s, Number(rest[0]));
      // Одна кнопка ответа на оба экзамена: какой сейчас идёт, знает
      // состояние. Две разные кнопки означали бы, что ученик, вернувшийся к
      // старому сообщению, отвечает не на тот экзамен.
      case "ea":
        await ack(cb.id);
        return s.state?.mexam ? moduleExamAnswer(s, Number(rest[0])) : examAnswer(s, Number(rest[0]));
      case "pr": await ack(cb.id); return screenPractice(s);
      case "t": await ack(cb.id); return screenTask(s, rest[0]);
      case "ts": case "tc": case "tcr": case "td": case "tdone": case "tu":
        await ack(cb.id); return taskAction(s, head, rest[0]);
      case "tn":
        await ack(cb.id);
        await setState(chatId, { awaiting: `note:${rest[0]}` });
        return send(chatId, "Напишите наблюдение одним сообщением: что получилось, что нет, что заметили.");
      case "prog": await ack(cb.id); return screenProgress(s);
      case "today": await ack(cb.id); return screenToday(s);
      case "ask": await ack(cb.id); return askMentor(s);
      case "pwd": await ack(cb.id); return sendPasswordLink(s);
      case "sv":   await ack(cb.id); return screenSupervision(s);
      case "svnew": await ack(cb.id); return caseNew(s);
      case "svc":  await ack(cb.id); return caseReview(s, rest[0]);
      case "svf":  await ack(cb.id); return caseAsk(s, rest[0], Number(rest[1]));
      case "svs":  await ack(cb.id); return caseSubmit(s, rest[0]);
      default: await ack(cb.id);
    }
  } catch (e) {
    deps.logger.error("student callback", data, e);
    await ack(cb.id, "Не получилось. Попробуйте ещё раз.");
  }
}

module.exports = { init, onMessage, onCallback, mentorReply, todayTasks, streakOf, mdToTelegram, findStudent, send, looksLikeEmail };
