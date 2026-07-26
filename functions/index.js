// Telegram-бот для управления школой рукии.
// Firestore triggers (Gen 1) + HTTPS webhook (Gen 2).
const functions = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");

initializeApp();
const db = getFirestore();

// Всего модулей в программе — нужно, чтобы отличить «сдал все» от «сдал все,
// которые вообще открывал». Без этого ученик с одним пройденным модулем
// формально проходил проверку «все со статусом done».
const TOTAL_MODULES = 11;

// Токен бота и chat_id берутся из настроек функций, а НЕ из кода.
//
// Раньше они были вписаны сюда прямо строкой и лежали в публичном
// репозитории — токен свободно читался по raw-ссылке GitHub (обнаружено
// 2026-07-25). С ним посторонний может читать всё, что приходит боту, и
// писать от его имени.
//
// КАК ЗАДАТЬ (один раз, из папки functions/):
//   firebase functions:secrets:set TG_BOT_TOKEN
//   firebase functions:secrets:set TG_CHAT_ID
// и затем задеплоить:  firebase deploy --only functions
//
// Для локального запуска эмулятора положите значения в functions/.env
// (файл уже закрыт в .gitignore):
//   TG_BOT_TOKEN=…
//   TG_CHAT_ID=…
const BOT = process.env.TG_BOT_TOKEN;
const CHAT = process.env.TG_CHAT_ID;

if (!BOT || !CHAT) {
  // Не бросаем исключение: без этого весь набор функций не задеплоился бы,
  // включая те, что к Telegram отношения не имеют. Вместо этого пишем в лог
  // и тихо пропускаем отправку — школа продолжает работать без уведомлений.
  logger.error(
    "TG_BOT_TOKEN / TG_CHAT_ID не заданы — уведомления в Telegram отключены. " +
    "Задайте: firebase functions:secrets:set TG_BOT_TOKEN",
  );
}

async function tg(method, body) {
  if (!BOT || !CHAT) return { ok: false, skipped: true };
  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await r.json();
  } catch (e) {
    logger.error("TG API", e);
    return { ok: false };
  }
}

/** Уведомление УЧЕНИКУ на сайте (запрос автора, 2026-07-25).
 *
 * Пишем в students/{uid}/notifications — клиент подписан на эту коллекцию
 * живьём (integration/firestore.js#watchNotifications) и показывает
 * колокольчик в шапке.
 *
 * Почему сервер, а не клиент: правила Firestore запрещают создание
 * уведомлений с клиента. Иначе ученик мог бы подделать себе «доступ
 * открыт» — и потом искренне не понимать, почему курс не открывается.
 *
 * link — куда вести по клику, путь от корня сайта. База (/raqiy-school на
 * GitHub Pages) добавляется уже на клиенте через withBase().
 *
 * Никогда не бросает исключение: уведомление не должно ронять триггер,
 * внутри которого оно создаётся, — иначе из-за него не ушло бы и
 * сообщение в Telegram.
 */
async function notifyStudent(uid, { type, title, body, link }) {
  try {
    await db.collection("students").doc(uid).collection("notifications").add({
      type,
      title,
      body: body || null,
      link: link || null,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (e) {
    logger.error("notifyStudent", uid, type, e);
  }
}

/** Запись в общую ленту достижений (запрос автора «пусть будет автоматом»,
 * 2026-07-26).
 *
 * Зачем лента: ученик учится один и не видит, что рядом кто-то доходит до
 * конца. Автор хотел показывать это для мотивации — и решил, что записи
 * должны появляться сами, без ручной публикации.
 *
 * Что здесь важно:
 *
 * 1. Пишет только сервер. Правила Firestore (integration/firestore.rules)
 *    запрещают запись в feed с клиента наотрез. Иначе ученик мог бы
 *    опубликовать в общей ленте что угодно от чужого имени — включая
 *    утверждения о чужом здоровье.
 *
 * 2. Только имя, без фамилии и без email. Лента мотивирует, а не выдаёт
 *    справочник учеников школы.
 *
 * 3. Текст не хранится — только вид события. Формулировку собирает клиент
 *    через i18n, иначе записи навсегда остались бы русскими и на
 *    английской, и на узбекской версии сайта.
 *
 * 4. id детерминированный (uid + вид + ключ). Триггеры Firestore могут
 *    сработать повторно на одном и том же изменении — при обычном addDoc()
 *    это дало бы дубли в ленте. set() на тот же id просто перезапишет
 *    запись, и её в ленте останется ровно одна.
 */
async function pushFeed(uid, kind, key, extra) {
  try {
    const id = `${uid}__${kind}__${key}`;
    await db.collection("feed").doc(id).set({
      uid, kind,
      createdAt: FieldValue.serverTimestamp(),
      ...extra,
    });
  } catch (e) {
    logger.error("pushFeed", uid, kind, key, e);
  }
}

/** Одно имя без фамилии — то, что попадает в ленту. Пустое имя заменяем
 * нейтральным «Ученик»: строка «получил сертификат» без подлежащего
 * читалась бы как обрывок. */
function feedName(data) {
  const first = String(data?.name || "").trim().split(/\s+/)[0];
  return first || "Ученик";
}

/** Модули ученика без служебных ключей (activityDates — массив дат,
 * books — вложенная карта по книгам, а не модуль). Одно и то же условие
 * раньше повторялось в пяти местах файла. */
function moduleEntries(progress) {
  return Object.entries(progress || {}).filter(
    ([k, v]) => k !== "activityDates" && k !== "books" && v && typeof v === "object",
  );
}

// ─────────────────────────────────────────────────
// УВЕДОМЛЕНИЯ (Gen 1 Firestore triggers)
// ─────────────────────────────────────────────────

/** Новый ученик */
exports.onNewStudent = functions.firestore
  .document("students/{uid}")
  .onCreate(async (snap, ctx) => {
    const data = snap.data();
    const uid = ctx.params.uid;
    await tg("sendMessage", {
      chat_id: CHAT,
      text: `📋 <b>Новый ученик</b>\n${data.name || "—"}\n${data.email || "—"}`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [
        [{ text: "✅ Подтвердить оплату", callback_data: `pay:${uid}` }],
        [{ text: "💬 Написать", callback_data: `reply:${uid}` }],
        [{ text: "📋 Подробнее", callback_data: `info:${uid}` }],
      ]},
    });
  });

/** Сообщение от ученика */
exports.onChatMessage = functions.firestore
  .document("students/{uid}/messages/{msgId}")
  .onCreate(async (snap, ctx) => {
    const msg = snap.data();
    const uid = ctx.params.uid;

    // Сообщение ОТ НАСТАВНИКА — уведомляем ученика на сайте. Раньше этот
    // триггер выходил сразу же на первой строке, и ответ наставника ученик
    // обнаруживал, только зайдя в кабинет.
    if (msg.from === "admin") {
      const kind = { voice: "🎤 Голосовое сообщение", video: "📹 Видеосообщение", file: "📎 Файл" };
      let preview = msg.text || kind[msg.type] || "Новое сообщение";
      if (preview.length > 140) preview = preview.slice(0, 140) + "…";
      await notifyStudent(uid, {
        type: "message",
        title: "Сообщение от наставника",
        body: preview,
        link: "/pages/dashboard/student.html",
      });
      return;
    }

    if (msg.from !== "student") return;
    const studentDoc = await db.doc(`students/${uid}`).get();
    const name = studentDoc.exists ? (studentDoc.data().name || uid) : uid;
    let preview = msg.text || `(${msg.type || "медиа"})`;
    if (preview.length > 120) preview = preview.slice(0, 120) + "…";
    await tg("sendMessage", {
      chat_id: CHAT,
      text: `💬 <b>Сообщение от ${name}</b>\n${preview}`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [
        [{ text: "💬 Ответить", callback_data: `reply:${uid}` }],
        [{ text: "📋 Подробнее", callback_data: `info:${uid}` }],
      ]},
    });
  });

/** Прогресс ученика */
exports.onProgress = functions.firestore
  .document("students/{uid}")
  .onUpdate(async (change, ctx) => {
    const before = change.before.data();
    const after = change.after.data();
    const uid = ctx.params.uid;

    // ── Уведомления ученику о том, что открыл наставник ────────────────
    // Раньше про это ученик узнавал случайно: зашёл и заметил, что кнопка
    // появилась. Реагируем только на переход false → true — иначе любое
    // сохранение профиля (а оно бывает при каждой активности) слало бы
    // повторное уведомление об уже открытом доступе.
    if (!before.paid && after.paid) {
      await notifyStudent(uid, {
        type: "paid",
        title: "Открыт полный доступ к курсу",
        body: "Все 11 модулей и экзамены теперь доступны целиком. Продолжайте с того места, где остановились.",
        link: "/pages/modules/index.html",
      });
    }
    if (!before.certificateGranted && after.certificateGranted) {
      await notifyStudent(uid, {
        type: "certificate",
        title: "Вам выдан сертификат",
        body: "Наставник подтвердил завершение курса. Сертификат можно открыть и скачать.",
        link: "/pages/certificate/index.html",
      });
    }
    if (!before.rukyaProAccess && after.rukyaProAccess) {
      await notifyStudent(uid, {
        type: "rukyaPro",
        title: "Открыт доступ к RUKYA Pro",
        body: "Программа для приёма пациентов доступна для скачивания в кабинете.",
        link: "/pages/dashboard/student.html",
      });
    }

    const lines = [];
    const pB = before.progress || {};
    const pA = after.progress || {};

    // ── Лента достижений ──────────────────────────────────────────────
    // Наполняется здесь же, из того же сравнения before/after: отдельный
    // триггер на тот же документ означал бы второй холодный запуск функции
    // и второе чтение того же изменения.
    await buildFeedEntries(uid, before, after, pB, pA);

    for (const [k, v] of Object.entries(pA)) {
      if (k === "activityDates" || k === "books" || typeof v !== "object") continue;
      if (v?.quizScore != null && v.quizScore !== pB[k]?.quizScore) {
        lines.push(`Модуль ${k}: ${Math.round(v.quizScore * 100)}%${v.status === "done" ? " ✅" : ""}`);
      }
    }
    const bB = pB.books || {};
    const bA = pA.books || {};
    for (const [k, v] of Object.entries(bA)) {
      if (v?.quizScore != null && v.quizScore !== bB[k]?.quizScore) {
        lines.push(`Книга ${k}: ${Math.round(v.quizScore * 100)}%${v.status === "done" ? " ✅" : ""}`);
      }
    }
    if (!lines.length) return;

    const name = after.name || uid;
    const buttons = [[{ text: "💬 Написать", callback_data: `reply:${uid}` }]];
    const allDone = Object.entries(pA)
      .filter(([k, v]) => k !== "activityDates" && k !== "books" && typeof v === "object" && v?.status)
      .every(([, v]) => v.status === "done");
    if (allDone && !after.certificateGranted) {
      buttons.unshift([{ text: "🎓 Выдать сертификат", callback_data: `cert:${uid}` }]);
    }
    await tg("sendMessage", {
      chat_id: CHAT,
      text: `📊 <b>Прогресс: ${name}</b>\n${lines.join("\n")}`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: buttons },
    });
  });

/** Что именно попадает в ленту.
 *
 * Правило одно: публикуем только то, что сервер видит в прогрессе своими
 * глазами. Никаких «наверное, у него получилось» — каждая запись опирается
 * на конкретное поле, которое изменилось.
 *
 * По одной записи на модуль, а не на задание: у модуля два-три задания, и
 * при записи на каждое лента одного ученика забила бы её целиком, а
 * остальные из неё вытеснились бы.
 */
async function buildFeedEntries(uid, before, after, pB, pA) {
  const name = feedName(after);

  // Сданный экзамен модуля — переход статуса в "done".
  for (const [k, v] of moduleEntries(pA)) {
    if (v.status === "done" && pB[k]?.status !== "done") {
      await pushFeed(uid, "module", `m${k}`, { firstName: name, moduleId: Number(k) });
    }

    // Практика: первое доведённое до конца задание модуля.
    const doneBefore = (pB[k]?.doneAssignments || []).length;
    const doneAfter = (v.doneAssignments || []).length;
    if (doneAfter > 0 && doneBefore === 0) {
      await pushFeed(uid, "practice", `m${k}`, { firstName: name, moduleId: Number(k) });
    }

    // Свидетельство ученика о том, что Аллах ответил. Ставит его сам
    // ученик у себя в кабинете — сервер лишь переносит уже поставленный
    // флаг в ленту. Формулировка (её собирает клиент) приписывает
    // исцеление Аллаху, а не ученику: ученик — причина, а не источник.
    // Это то же положение, что и в Модуле 10, §3.
    const ansBefore = (pB[k]?.answeredAssignments || []).length;
    const ansAfter = (v.answeredAssignments || []).length;
    if (ansAfter > 0 && ansBefore === 0) {
      await pushFeed(uid, "answered", `m${k}`, { firstName: name, moduleId: Number(k) });
      // Автору — в Telegram: такое он хочет видеть сразу, а не в общей
      // сводке прогресса.
      await tg("sendMessage", {
        chat_id: CHAT,
        text: `🤲 <b>${after.name || uid}</b> — практика Модуля ${k}: Аллах ответил`,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: [[{ text: "💬 Написать", callback_data: `reply:${uid}` }]] },
      });
    }
  }

  // Выпуск: все модули со статусом "done". Сравниваем с состоянием ДО, иначе
  // каждое следующее сохранение профиля выпускника переписывало бы запись и
  // поднимало её в ленте наверх заново.
  const allDone = (p) => {
    const mods = moduleEntries(p).filter(([, v]) => v.status);
    return mods.length >= TOTAL_MODULES && mods.every(([, v]) => v.status === "done");
  };
  if (allDone(pA) && !allDone(pB)) {
    await pushFeed(uid, "graduate", "all", { firstName: name });
  }

  if (!before.certificateGranted && after.certificateGranted) {
    await pushFeed(uid, "certificate", "one", { firstName: name });
  }
  if (!before.rukyaProAccess && after.rukyaProAccess) {
    await pushFeed(uid, "rukyaPro", "one", { firstName: name });
  }
}

// ─────────────────────────────────────────────────
// WEBHOOK (кнопки + ответы + команды)
// ─────────────────────────────────────────────────

exports.telegramWebhook = onRequest(async (req, res) => {
  const u = req.body;
  try {
    if (u.callback_query) {
      await handleCallback(u.callback_query);
    } else if (u.message?.text && String(u.message.chat.id) === CHAT) {
      await handleMessage(u.message);
    }
  } catch (e) {
    logger.error("webhook", e);
  }
  res.sendStatus(200);
});

async function handleCallback(cb) {
  const [action, uid] = cb.data.split(":");
  const cbId = cb.id;
  const snap = uid ? await db.doc(`students/${uid}`).get() : null;
  const s = snap?.exists ? snap.data() : null;
  const name = s?.name || s?.email || uid || "?";

  switch (action) {
    case "pay": {
      if (!s) { await ack(cbId, "Ученик не найден"); return; }
      await db.doc(`students/${uid}`).update({ paid: true });
      await ack(cbId, "✅ Оплата подтверждена");
      await tg("sendMessage", {
        chat_id: CHAT,
        text: `✅ <b>${name}</b> — оплата подтверждена`,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: [
          [{ text: "❌ Отменить оплату", callback_data: `unpay:${uid}` }],
        ]},
      });
      break;
    }
    case "unpay": {
      if (!s) { await ack(cbId, "Ученик не найден"); return; }
      await db.doc(`students/${uid}`).update({ paid: false });
      await ack(cbId, "❌ Оплата отменена");
      await tg("sendMessage", { chat_id: CHAT, text: `❌ <b>${name}</b> — оплата отменена`, parse_mode: "HTML" });
      break;
    }
    case "cert": {
      if (!s) { await ack(cbId, "Ученик не найден"); return; }
      await db.doc(`students/${uid}`).update({
        certificateGranted: true,
        certificateGrantedAt: FieldValue.serverTimestamp(),
      });
      await ack(cbId, "🎓 Сертификат выдан");
      await tg("sendMessage", { chat_id: CHAT, text: `🎓 <b>${name}</b> — сертификат выдан`, parse_mode: "HTML" });
      break;
    }
    case "reply": {
      await db.doc("bot_state/pending_reply").set({ uid, name, ts: Date.now() });
      await ack(cbId);
      await tg("sendMessage", {
        chat_id: CHAT,
        text: `✏️ Напишите ответ для <b>${name}</b>:`,
        parse_mode: "HTML",
        reply_markup: { force_reply: true },
      });
      break;
    }
    case "info": {
      if (!s) { await ack(cbId, "Ученик не найден"); return; }
      const pr = s.progress || {};
      const done = Object.entries(pr)
        .filter(([k, v]) => k !== "activityDates" && k !== "books" && typeof v === "object" && v?.status === "done")
        .length;
      const scores = Object.entries(pr)
        .filter(([k, v]) => k !== "activityDates" && k !== "books" && typeof v === "object" && v?.quizScore != null)
        .map(([, v]) => v.quizScore);
      const avg = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) : "—";
      const lastSeen = s.lastSeenAt ? new Date(s.lastSeenAt.toDate()).toLocaleDateString("ru-RU") : "—";
      const text = [
        `📋 <b>${s.name || "—"}</b>`,
        `Email: ${s.email || "—"}`,
        `Оплата: ${s.paid ? "✅ да" : "❌ нет"}`,
        `Модулей: ${done}/11`,
        `Средний балл: ${avg}%`,
        `Сертификат: ${s.certificateGranted ? "✅ да" : "❌ нет"}`,
        `Последний визит: ${lastSeen}`,
      ].join("\n");
      await ack(cbId);
      await tg("sendMessage", {
        chat_id: CHAT, text, parse_mode: "HTML",
        reply_markup: { inline_keyboard: [
          [s.paid
            ? { text: "❌ Отменить оплату", callback_data: `unpay:${uid}` }
            : { text: "✅ Подтвердить оплату", callback_data: `pay:${uid}` }],
          [{ text: "🎓 Выдать сертификат", callback_data: `cert:${uid}` }],
          [{ text: "💬 Написать", callback_data: `reply:${uid}` }],
          [{ text: "🗑 Удалить ученика", callback_data: `del:${uid}` }],
        ]},
      });
      break;
    }
    case "del": {
      await ack(cbId);
      await tg("sendMessage", {
        chat_id: CHAT,
        text: `⚠️ Удалить <b>${name}</b>? Это удалит все данные ученика.`,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: [
          [{ text: "🗑 Да, удалить", callback_data: `confirmdel:${uid}` }],
          [{ text: "Отмена", callback_data: `cancel:${uid}` }],
        ]},
      });
      break;
    }
    case "confirmdel": {
      const msgs = await db.collection(`students/${uid}/messages`).listDocuments();
      const batch = db.batch();
      msgs.forEach((d) => batch.delete(d));
      batch.delete(db.doc(`students/${uid}`));
      await batch.commit();
      await ack(cbId, "🗑 Удалён");
      await tg("sendMessage", { chat_id: CHAT, text: `🗑 <b>${name}</b> — удалён`, parse_mode: "HTML" });
      break;
    }
    case "cancel": {
      await ack(cbId, "Отменено");
      break;
    }
  }
}

async function ack(cbId, text) {
  await tg("answerCallbackQuery", { callback_query_id: cbId, text: text || "" });
}

async function handleMessage(msg) {
  const text = msg.text.trim();

  if (text === "/start" || text === "/help") {
    await tg("sendMessage", {
      chat_id: CHAT,
      text: [
        "<b>Бот школы рукии</b>", "",
        "/students — список учеников",
        "/paid — только оплатившие",
        "/unpaid — неоплатившие",
        "/stats — статистика", "",
        "Уведомления приходят автоматически.",
        "Кнопки под сообщениями — для быстрых действий.",
      ].join("\n"),
      parse_mode: "HTML",
    });
    return;
  }

  if (text === "/students" || text === "/paid" || text === "/unpaid") {
    const snaps = await db.collection("students").get();
    if (snaps.empty) { await tg("sendMessage", { chat_id: CHAT, text: "Учеников пока нет." }); return; }
    let list = snaps.docs.map((d) => ({ uid: d.id, ...d.data() }));
    if (text === "/paid") list = list.filter((s) => s.paid);
    if (text === "/unpaid") list = list.filter((s) => !s.paid);
    if (!list.length) { await tg("sendMessage", { chat_id: CHAT, text: "Список пуст." }); return; }

    for (const s of list) {
      const pr = s.progress || {};
      const done = Object.entries(pr)
        .filter(([k, v]) => k !== "activityDates" && k !== "books" && typeof v === "object" && v?.status === "done")
        .length;
      await tg("sendMessage", {
        chat_id: CHAT,
        text: `${s.paid ? "✅" : "⬜"} <b>${s.name || "—"}</b> · ${s.email || ""} · ${done}/11`,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: [[{ text: "📋 Подробнее", callback_data: `info:${s.uid}` }]] },
      });
    }
    return;
  }

  if (text === "/stats") {
    const snaps = await db.collection("students").get();
    const all = snaps.docs.map((d) => d.data());
    const paid = all.filter((s) => s.paid).length;
    const certs = all.filter((s) => s.certificateGranted).length;
    await tg("sendMessage", {
      chat_id: CHAT,
      text: `<b>📊 Статистика</b>\nВсего учеников: ${all.length}\nОплатили: ${paid}\nСертификатов: ${certs}`,
      parse_mode: "HTML",
    });
    return;
  }

  // Ответ ученику
  const pending = await db.doc("bot_state/pending_reply").get();
  if (pending.exists) {
    const { uid, name, ts } = pending.data();
    if (Date.now() - ts > 30 * 60 * 1000) {
      await db.doc("bot_state/pending_reply").delete();
      await tg("sendMessage", { chat_id: CHAT, text: "⏰ Время ответа истекло. Нажмите «Ответить» ещё раз." });
      return;
    }
    await db.collection(`students/${uid}/messages`).add({
      from: "admin", text, createdAt: FieldValue.serverTimestamp(), read: false,
    });
    await db.doc("bot_state/pending_reply").delete();
    await tg("sendMessage", { chat_id: CHAT, text: `✅ Ответ отправлен <b>${name}</b>`, parse_mode: "HTML" });
    return;
  }

  await tg("sendMessage", { chat_id: CHAT, text: "Отправьте /help для списка команд." });
}

// ─────────────────────────────────────────────────
// НАПОМИНАНИЯ (Gen 1 Pub/Sub schedule)
// ─────────────────────────────────────────────────

/** Ежедневная проверка неактивных учеников — отправляет напоминание в Telegram
 * ученикам, которые не заходили 3+ дня. Бот пишет админу список таких учеников
 * с кнопкой «Написать» для каждого. Запуск: каждый день в 10:00 UTC+3. */
exports.dailyReminders = functions.pubsub
  .schedule("0 7 * * *")       // 07:00 UTC = 10:00 Москва
  .timeZone("Europe/Moscow")
  .onRun(async () => {
    const snaps = await db.collection("students").where("paid", "==", true).get();
    if (snaps.empty) return null;

    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const inactive = [];

    for (const doc of snaps.docs) {
      const s = doc.data();
      if (s.certificateGranted) continue; // выпускник — не трогаем

      const lastSeen = s.lastSeenAt?.toDate?.()?.getTime?.() || 0;
      const daysSince = Math.floor((now - lastSeen) / DAY);

      if (daysSince >= 3) {
        inactive.push({ uid: doc.id, name: s.name || s.email || doc.id, days: daysSince });
      }
    }

    if (!inactive.length) {
      logger.info("dailyReminders: все ученики активны");
      return null;
    }

    // Отправляем админу сводку
    const header = `⏰ <b>Неактивные ученики (${inactive.length})</b>\n`;
    const lines = inactive.map(
      (s) => `• <b>${s.name}</b> — ${s.days} дн. без визита`
    );

    // Telegram ограничивает длину сообщения — разбиваем по 10
    for (let i = 0; i < inactive.length; i += 10) {
      const chunk = inactive.slice(i, i + 10);
      const text = (i === 0 ? header : "") + chunk.map(
        (s) => `• <b>${s.name}</b> — ${s.days} дн.`
      ).join("\n");

      const buttons = chunk.map((s) => [
        { text: `💬 ${s.name}`, callback_data: `reply:${s.uid}` },
      ]);

      await tg("sendMessage", {
        chat_id: CHAT,
        text,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: buttons },
      });
    }

    logger.info(`dailyReminders: ${inactive.length} неактивных`);
    return null;
  });
