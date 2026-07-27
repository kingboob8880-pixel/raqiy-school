// Панель управления школой прямо в Telegram (запрос автора 2026-07-27:
// «мониторинг состояния учеников, дать доступ, не дать доступ, написать
// ученику — всё с бота»).
//
// Что было. У автора в боте лежали четыре команды-списка (/students,
// /paid, /unpaid, /stats), которые вываливали по сообщению на каждого
// ученика, и три кнопки в карточке. Всё остальное — выдача полного
// доступа, доступ к RUKYA Pro, поиск конкретного человека, «кто застрял»
// — жило только в кабинете на сайте. То есть ровно то, ради чего автор и
// открывает бота с телефона, требовало компьютера.
//
// Здесь панель целиком: меню, список с фильтрами и страницами, поиск,
// карточка ученика со всеми переключателями и мониторинг.
//
// ⚠️ ВСЁ ЭТО ДОСТУПНО ТОЛЬКО ИЗ ЧАТА АВТОРА. Проверка стоит в вебхуке
// (functions/index.js): чат сравнивается с TG_CHAT_ID, и лишь потом
// управление попадает сюда. Внутри этого файла проверки роли НЕТ — если
// когда-нибудь появится второй admin-чат, проверку добавлять надо там же,
// в одном месте, а не рассыпать по обработчикам.
const { FieldValue } = require("firebase-admin/firestore");

let deps = null; // { tg, db, CHAT, logger }
function init(d) { deps = d; }

const PAGE = 8;              // учеников на страницу
const TOTAL_MODULES = 11;
const SILENT_DAYS = 7;       // после скольких дней молчания ученик в списке

function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function send(text, keyboard) {
  return deps.tg("sendMessage", {
    chat_id: deps.CHAT,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(keyboard ? { reply_markup: { inline_keyboard: keyboard } } : {}),
  });
}

async function ack(id, text) {
  await deps.tg("answerCallbackQuery", { callback_query_id: id, text: text || "" });
}

function daysSince(ts) {
  const d = ts?.toDate ? ts.toDate() : (ts instanceof Date ? ts : null);
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

function fmtDate(ts) {
  const d = ts?.toDate ? ts.toDate() : (ts instanceof Date ? ts : null);
  return d ? d.toLocaleDateString("ru-RU") : "—";
}

// ───────────────────────────────── выборка и подсчёты

async function allStudents() {
  const snap = await deps.db.collection("students").get();
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

/** Сводка по одному ученику. Считаем здесь, а не при показе: одни и те же
 *  числа нужны и списку, и карточке, и мониторингу. */
function summarize(s) {
  const pr = s.progress || {};
  const modules = Object.entries(pr)
    .filter(([k, v]) => !["activityDates", "books"].includes(k) && v && typeof v === "object");

  const modulesDone = modules.filter(([, v]) => v.status === "done").length;
  const booksDone = Object.values(pr.books || {}).filter((b) => b?.status === "done").length;
  let tasksDone = 0;
  for (const [, v] of modules) tasksDone += (v.doneAssignments || []).length;

  const scores = Object.values(pr.books || {}).map((b) => b?.quizScore).filter((x) => typeof x === "number");
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 100) : null;

  return {
    modulesDone, booksDone, tasksDone, avg,
    silent: daysSince(s.lastSeenAt),
    access: s.paid ? "оплачен" : s.fullAccess ? "открыт вручную" : "нет",
    hasAccess: !!(s.paid || s.fullAccess),
    inTelegram: !!s.tgChatId,
  };
}

/** Строка ученика в списке — одна, короткая, с самым важным. */
function line(s) {
  const x = summarize(s);
  const mark = s.paid ? "✅" : s.fullAccess ? "🔓" : "⬜";
  const silent = x.silent === null ? "" : x.silent >= SILENT_DAYS ? ` · молчит ${x.silent} дн.` : "";
  return `${mark} ${s.name || s.email || s.uid} · ${x.modulesDone}/${TOTAL_MODULES}${silent}`;
}

const FILTERS = {
  all:    { title: "Все ученики",       test: () => true },
  paid:   { title: "Оплатившие",        test: (s) => !!s.paid },
  unpaid: { title: "Без оплаты",        test: (s) => !s.paid && !s.fullAccess },
  full:   { title: "Доступ вручную",    test: (s) => !!s.fullAccess },
  silent: { title: "Молчат",            test: (s) => { const d = daysSince(s.lastSeenAt); return d !== null && d >= SILENT_DAYS; } },
  tg:     { title: "Учатся в Telegram", test: (s) => !!s.tgChatId },
};

// ───────────────────────────────── экраны

const MENU = [
  [{ text: "👥 Ученики", callback_data: "as:all:0" }, { text: "🔎 Найти", callback_data: "aq" }],
  [{ text: "📊 Сводка по школе", callback_data: "ast" }],
  [{ text: "⚠️ Требуют внимания", callback_data: "aatt" }],
];

async function screenMenu() {
  const list = await allStudents();
  const paid = list.filter((s) => s.paid).length;
  const full = list.filter((s) => s.fullAccess).length;
  await send([
    "<b>Управление школой</b>", "",
    `Учеников: <b>${list.length}</b> · оплатили: <b>${paid}</b>${full ? ` · доступ вручную: <b>${full}</b>` : ""}`,
  ].join("\n"), MENU);
}

async function screenList(filter, page) {
  const f = FILTERS[filter] || FILTERS.all;
  const list = (await allStudents()).filter(f.test);

  // Сначала те, кто требует внимания: без оплаты и давно молчащие наверх.
  list.sort((a, b) => (daysSince(b.lastSeenAt) ?? -1) - (daysSince(a.lastSeenAt) ?? -1));

  if (!list.length) {
    await send(`<b>${f.title}</b>\n\nПусто.`, [[{ text: "‹ Меню", callback_data: "a" }]]);
    return;
  }

  const pages = Math.ceil(list.length / PAGE);
  const p = Math.min(Math.max(0, page), pages - 1);
  const slice = list.slice(p * PAGE, p * PAGE + PAGE);

  const rows = slice.map((s) => [{ text: line(s).slice(0, 60), callback_data: `ac:${s.uid}` }]);

  const nav = [];
  if (p > 0) nav.push({ text: "‹", callback_data: `as:${filter}:${p - 1}` });
  nav.push({ text: `${p + 1}/${pages}`, callback_data: "noop" });
  if (p < pages - 1) nav.push({ text: "›", callback_data: `as:${filter}:${p + 1}` });
  if (nav.length > 1) rows.push(nav);

  // Фильтры — переключаются здесь же, без возврата в меню.
  const keys = Object.keys(FILTERS);
  for (let i = 0; i < keys.length; i += 3) {
    rows.push(keys.slice(i, i + 3).map((k) => ({
      text: (k === filter ? "• " : "") + FILTERS[k].title,
      callback_data: `as:${k}:0`,
    })));
  }
  rows.push([{ text: "‹ Меню", callback_data: "a" }]);

  await send(`<b>${f.title}</b> — ${list.length}`, rows);
}

async function screenCard(uid) {
  const snap = await deps.db.doc(`students/${uid}`).get();
  if (!snap.exists) { await send("Ученик не найден.", [[{ text: "‹ Меню", callback_data: "a" }]]); return; }
  const s = { uid, ...snap.data() };
  const x = summarize(s);

  const text = [
    `<b>${esc(s.name || "—")}</b>`,
    `<code>${esc(s.email || "—")}</code>`,
    "",
    `Доступ: <b>${x.access}</b>`,
    `Модули: <b>${x.modulesDone}</b> из ${TOTAL_MODULES}`,
    `Книги: <b>${x.booksDone}</b> · упражнения: <b>${x.tasksDone}</b>`,
    x.avg === null ? "" : `Средний балл: <b>${x.avg}%</b>`,
    "",
    `Последний визит: ${fmtDate(s.lastSeenAt)}${x.silent >= SILENT_DAYS ? ` — молчит ${x.silent} дн.` : ""}`,
    `Записан: ${fmtDate(s.createdAt)}${s.registeredVia === "telegram" ? " (через бота)" : ""}`,
    `Telegram: ${x.inTelegram ? "привязан" : "нет"}`,
    s.certificateGranted ? "Сертификат: выдан" : "",
    s.rukyaProAccess ? "RUKYA Pro: открыт" : "",
  ].filter(Boolean).join("\n");

  const rows = [
    [s.paid
      ? { text: "❌ Снять оплату", callback_data: `ap:${uid}` }
      : { text: "✅ Подтвердить оплату", callback_data: `ap:${uid}` }],
    [s.fullAccess
      ? { text: "🔒 Закрыть полный доступ", callback_data: `ax:${uid}` }
      : { text: "🔓 Открыть всё без оплаты", callback_data: `ax:${uid}` }],
    [{ text: s.certificateGranted ? "🎓 Отозвать сертификат" : "🎓 Выдать сертификат", callback_data: `ag:${uid}` }],
    [{ text: s.rukyaProAccess ? "📥 Закрыть RUKYA Pro" : "📥 Открыть RUKYA Pro", callback_data: `ar:${uid}` }],
    [{ text: "💬 Написать", callback_data: `aw:${uid}` }, { text: "📈 Подробно", callback_data: `am:${uid}` }],
    [{ text: "🗑 Удалить", callback_data: `ad:${uid}` }],
    [{ text: "‹ К списку", callback_data: "as:all:0" }, { text: "Меню", callback_data: "a" }],
  ];
  await send(text, rows);
}

/** Подробный прогресс — по модулям, чтобы видеть, где именно человек стоит. */
async function screenDetail(uid) {
  const snap = await deps.db.doc(`students/${uid}`).get();
  if (!snap.exists) return;
  const s = snap.data();
  const pr = s.progress || {};

  const lines = [`<b>${esc(s.name || "—")}</b> — по модулям`, ""];
  for (let i = 1; i <= TOTAL_MODULES; i++) {
    const m = pr[i] || {};
    const done = m.status === "done";
    const started = m.status === "in_progress" || (m.doneAssignments || []).length;
    const mark = done ? "✅" : started ? "▶️" : "▫️";
    const score = typeof m.quizScore === "number" ? ` · ${Math.round(m.quizScore * 100)}%` : "";
    const tasks = (m.doneAssignments || []).length;
    lines.push(`${mark} Модуль ${i}${score}${tasks ? ` · упражнений ${tasks}` : ""}`);
  }

  const dates = pr.activityDates || [];
  lines.push("", `Дней с занятиями: ${dates.length}`);

  await send(lines.join("\n"), [
    [{ text: "‹ К карточке", callback_data: `ac:${uid}` }],
    [{ text: "Меню", callback_data: "a" }],
  ]);
}

// ───────────────────────────────── переключатели

/** Все переключатели идут через одну функцию: у каждого одинаковая пара
 *  «поменять поле — показать карточку заново», и три копии этого кода
 *  разъехались бы. Уведомление ученику шлёт триггер onProgress — здесь
 *  его дублировать не нужно. */
async function toggle(uid, field, onText, offText) {
  const ref = deps.db.doc(`students/${uid}`);
  const snap = await ref.get();
  if (!snap.exists) return "Ученик не найден";
  const now = !snap.data()[field];

  const upd = { [field]: now };
  if (field === "fullAccess" && now) upd.fullAccessAt = new Date();
  if (field === "certificateGranted" && now) upd.certificateGrantedAt = new Date();
  await ref.update(upd);

  await screenCard(uid);
  return now ? onText : offText;
}

async function askWrite(uid) {
  const snap = await deps.db.doc(`students/${uid}`).get();
  const name = snap.exists ? (snap.data().name || snap.data().email) : uid;
  await deps.db.doc("bot_state/admin").set({ awaiting: `write:${uid}`, ts: Date.now() });
  await send(`✏️ Напишите сообщение для <b>${esc(name)}</b> — следующим сообщением.`,
    [[{ text: "Отмена", callback_data: `ac:${uid}` }]]);
}

/** Сообщение уходит в ту же переписку, что и на сайте. Доставку в Telegram
 *  берёт на себя триггер onChatMessage — если ученик привязан, он получит
 *  его в боте, если нет, увидит в кабинете. */
async function doWrite(uid, text) {
  await deps.db.collection(`students/${uid}/messages`).add({
    from: "admin", text, createdAt: new Date(), read: false,
  });
  await deps.db.doc("bot_state/admin").set({ awaiting: null });
  await send("Отправлено.", [[{ text: "‹ К ученику", callback_data: `ac:${uid}` }]]);
}

async function askDelete(uid) {
  const snap = await deps.db.doc(`students/${uid}`).get();
  const name = snap.exists ? (snap.data().name || snap.data().email) : uid;
  await send([
    `⚠️ Удалить <b>${esc(name)}</b>?`, "",
    "Прогресс и переписка пропадут безвозвратно. Учётная запись входа при этом остаётся: если человек снова войдёт, у него откроется чистый кабинет.",
  ].join("\n"), [
    [{ text: "🗑 Да, удалить", callback_data: `aD:${uid}` }],
    [{ text: "Отмена", callback_data: `ac:${uid}` }],
  ]);
}

async function doDelete(uid) {
  const msgs = await deps.db.collection(`students/${uid}/messages`).listDocuments();
  const batch = deps.db.batch();
  msgs.forEach((d) => batch.delete(d));
  batch.delete(deps.db.doc(`students/${uid}`));
  await batch.commit();
  await send("🗑 Удалён.", [[{ text: "‹ Меню", callback_data: "a" }]]);
}

// ───────────────────────────────── поиск

async function askSearch() {
  await deps.db.doc("bot_state/admin").set({ awaiting: "search", ts: Date.now() });
  await send("🔎 Напишите имя или почту — найду ученика.",
    [[{ text: "Отмена", callback_data: "a" }]]);
}

async function doSearch(query) {
  const q = String(query).trim().toLowerCase();
  await deps.db.doc("bot_state/admin").set({ awaiting: null });

  const found = (await allStudents()).filter((s) =>
    (s.name || "").toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q));

  if (!found.length) {
    await send(`По запросу «${esc(query)}» никого нет.`, [[{ text: "‹ Меню", callback_data: "a" }]]);
    return;
  }
  if (found.length === 1) return screenCard(found[0].uid);

  const rows = found.slice(0, 20).map((s) => [{ text: line(s).slice(0, 60), callback_data: `ac:${s.uid}` }]);
  rows.push([{ text: "‹ Меню", callback_data: "a" }]);
  await send(`Найдено: ${found.length}`, rows);
}

// ───────────────────────────────── мониторинг

async function screenStats() {
  const list = await allStudents();
  const sum = list.map(summarize);

  const paid = list.filter((s) => s.paid).length;
  const full = list.filter((s) => s.fullAccess).length;
  const certs = list.filter((s) => s.certificateGranted).length;
  const inTg = list.filter((s) => s.tgChatId).length;
  const viaTg = list.filter((s) => s.registeredVia === "telegram").length;
  const silent = sum.filter((x) => x.silent !== null && x.silent >= SILENT_DAYS).length;
  const started = sum.filter((x) => x.modulesDone > 0 || x.booksDone > 0).length;
  const graduates = sum.filter((x) => x.modulesDone >= TOTAL_MODULES).length;

  const booksTotal = sum.reduce((n, x) => n + x.booksDone, 0);
  const tasksTotal = sum.reduce((n, x) => n + x.tasksDone, 0);

  await send([
    "<b>📊 Сводка по школе</b>", "",
    `Учеников: <b>${list.length}</b>`,
    `Оплатили: <b>${paid}</b>${full ? ` · доступ вручную: <b>${full}</b>` : ""}`,
    `Приступили к учёбе: <b>${started}</b>`,
    `Прошли курс: <b>${graduates}</b> · сертификатов: <b>${certs}</b>`,
    "",
    `В Telegram: <b>${inTg}</b>${viaTg ? ` (из них записались через бота: ${viaTg})` : ""}`,
    `Молчат ${SILENT_DAYS}+ дней: <b>${silent}</b>`,
    "",
    `Всего сдано экзаменов: <b>${booksTotal}</b>`,
    `Всего выполнено упражнений: <b>${tasksTotal}</b>`,
  ].join("\n"), [
    [{ text: "⚠️ Требуют внимания", callback_data: "aatt" }],
    [{ text: "‹ Меню", callback_data: "a" }],
  ]);
}

/** Кто требует внимания. Три списка вместо одного «молчат»: причины разные
 *  и делать с ними надо разное. */
async function screenAttention() {
  const list = await allStudents();
  const rows = [];
  const out = ["<b>⚠️ Требуют внимания</b>"];

  // 1. Оплатили, но не начали — самая дорогая потеря: деньги взяты, а
  //    человек ни разу не открыл курс.
  const paidNotStarted = list.filter((s) => (s.paid || s.fullAccess) && summarize(s).booksDone === 0);
  if (paidNotStarted.length) {
    out.push("", `<b>Доступ открыт, но не начали — ${paidNotStarted.length}</b>`);
    for (const s of paidNotStarted.slice(0, 5)) {
      out.push(`• ${esc(s.name || s.email)}`);
      rows.push([{ text: `💬 ${(s.name || s.email || "").slice(0, 40)}`, callback_data: `ac:${s.uid}` }]);
    }
  }

  // 2. Начали и пропали.
  const stuck = list.filter((s) => {
    const x = summarize(s);
    return x.booksDone > 0 && x.silent !== null && x.silent >= SILENT_DAYS && x.modulesDone < TOTAL_MODULES;
  }).sort((a, b) => (daysSince(b.lastSeenAt) || 0) - (daysSince(a.lastSeenAt) || 0));
  if (stuck.length) {
    out.push("", `<b>Начали и замолчали — ${stuck.length}</b>`);
    for (const s of stuck.slice(0, 5)) {
      out.push(`• ${esc(s.name || s.email)} — ${daysSince(s.lastSeenAt)} дн.`);
      rows.push([{ text: `💬 ${(s.name || s.email || "").slice(0, 40)}`, callback_data: `ac:${s.uid}` }]);
    }
  }

  // 3. Ждут решения по оплате.
  const waiting = list.filter((s) => !s.paid && !s.fullAccess);
  if (waiting.length) {
    out.push("", `<b>Без доступа — ${waiting.length}</b>`);
    for (const s of waiting.slice(0, 5)) out.push(`• ${esc(s.name || s.email)}`);
    rows.push([{ text: "Показать всех без доступа", callback_data: "as:unpaid:0" }]);
  }

  if (out.length === 1) out.push("", "Все на месте, никто не выпал. الحمد لله");
  rows.push([{ text: "‹ Меню", callback_data: "a" }]);
  await send(out.join("\n"), rows);
}

// ───────────────────────────────── маршрутизация

/** Текст из чата автора. Возвращает true, если сообщение было ответом на
 *  вопрос панели (поиск или письмо ученику) и обрабатывать его дальше не
 *  нужно. */
async function onMessage(msg) {
  const text = (msg.text || "").trim();

  const st = await deps.db.doc("bot_state/admin").get();
  const awaiting = st.exists ? st.data().awaiting : null;

  if (awaiting === "search") { await doSearch(text); return true; }
  if (awaiting?.startsWith?.("write:")) { await doWrite(awaiting.slice(6), text); return true; }

  if (text === "/admin" || text === "/menu" || text === "/students") { await screenMenu(); return true; }
  if (text === "/stats") { await screenStats(); return true; }

  return false;
}

/** Кнопка из чата автора. Возвращает true, если кнопка наша. */
async function onCallback(cb) {
  const data = cb.data || "";
  const [head, ...rest] = data.split(":");

  const handlers = {
    a:    async () => screenMenu(),
    as:   async () => screenList(rest[0] || "all", Number(rest[1] || 0)),
    ac:   async () => screenCard(rest[0]),
    am:   async () => screenDetail(rest[0]),
    aq:   async () => askSearch(),
    ast:  async () => screenStats(),
    aatt: async () => screenAttention(),
    aw:   async () => askWrite(rest[0]),
    ad:   async () => askDelete(rest[0]),
    aD:   async () => doDelete(rest[0]),
    noop: async () => {},
  };

  if (handlers[head]) {
    await ack(cb.id);
    try { await handlers[head](); } catch (e) {
      deps.logger.error("admin", data, e);
      await send("Не получилось. Попробуйте ещё раз.");
    }
    return true;
  }

  // Переключатели — отдельно: у них ответ на кнопке зависит от результата.
  const toggles = {
    ap: ["paid", "✅ Оплата подтверждена", "❌ Оплата снята"],
    ax: ["fullAccess", "🔓 Открыт весь курс", "🔒 Полный доступ закрыт"],
    ag: ["certificateGranted", "🎓 Сертификат выдан", "🎓 Сертификат отозван"],
    ar: ["rukyaProAccess", "📥 RUKYA Pro открыт", "📥 RUKYA Pro закрыт"],
  };
  if (toggles[head]) {
    try {
      const res = await toggle(rest[0], ...toggles[head]);
      await ack(cb.id, res);
    } catch (e) {
      deps.logger.error("admin toggle", data, e);
      await ack(cb.id, "Не получилось");
    }
    return true;
  }

  return false;
}

module.exports = { init, onMessage, onCallback, summarize, line, FILTERS };
