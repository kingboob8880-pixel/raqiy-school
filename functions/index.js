// Telegram-бот для управления школой рукии.
// Уведомления с кнопками + webhook для ответов и команд.
// Деплой: firebase deploy --only functions
// После деплоя: установить webhook (URL из вывода деплоя).
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");

initializeApp();
const db = getFirestore();

const BOT = "8996853653:AAH5wykwBERZfdcMA86gJ5SfERpHEXKmqSA";
const CHAT = "5200039060";

// ─── Telegram API helper ───
async function tg(method, body) {
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

// ─────────────────────────────────────────────────
// УВЕДОМЛЕНИЯ (Firestore triggers → Telegram)
// ─────────────────────────────────────────────────

/** Новый ученик зарегистрировался */
exports.onNewStudent = onDocumentCreated("students/{uid}", async (event) => {
  const data = event.data?.data();
  if (!data) return;
  const uid = event.params.uid;
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

/** Сообщение от ученика в чате */
exports.onChatMessage = onDocumentCreated("students/{uid}/messages/{msgId}", async (event) => {
  const msg = event.data?.data();
  if (!msg || msg.from !== "student") return;
  const uid = event.params.uid;
  const snap = await db.doc(`students/${uid}`).get();
  const name = snap.exists ? (snap.data().name || uid) : uid;
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

/** Ученик сдал тест (изменился quizScore) */
exports.onProgress = onDocumentUpdated("students/{uid}", async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  if (!before || !after) return;
  const uid = event.params.uid;

  const lines = [];
  const pB = before.progress || {};
  const pA = after.progress || {};

  // Модульные тесты
  for (const [k, v] of Object.entries(pA)) {
    if (k === "activityDates" || k === "books" || typeof v !== "object") continue;
    if (v?.quizScore != null && v.quizScore !== pB[k]?.quizScore) {
      lines.push(`Модуль ${k}: ${Math.round(v.quizScore * 100)}%${v.status === "done" ? " ✅" : ""}`);
    }
  }
  // Экзамены по книгам
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

// ─────────────────────────────────────────────────
// WEBHOOK (кнопки + ответы + команды)
// ─────────────────────────────────────────────────

exports.telegramWebhook = onRequest(async (req, res) => {
  const u = req.body;
  try {
    // ── Нажатие кнопки ──
    if (u.callback_query) {
      await handleCallback(u.callback_query);
    }
    // ── Текстовое сообщение / команда ──
    else if (u.message?.text && String(u.message.chat.id) === CHAT) {
      await handleMessage(u.message);
    }
  } catch (e) {
    logger.error("webhook", e);
  }
  res.sendStatus(200);
});

// ── Обработка кнопок ──
async function handleCallback(cb) {
  const [action, uid] = cb.data.split(":");
  const cbId = cb.id;
  const snap = uid ? await db.doc(`students/${uid}`).get() : null;
  const s = snap?.exists ? snap.data() : null;
  const name = s?.name || s?.email || uid || "?";

  switch (action) {
    case "pay": {
      if (!s) return ack(cbId, "Ученик не найден");
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
      if (!s) return ack(cbId, "Ученик не найден");
      await db.doc(`students/${uid}`).update({ paid: false });
      await ack(cbId, "❌ Оплата отменена");
      await tg("sendMessage", {
        chat_id: CHAT,
        text: `❌ <b>${name}</b> — оплата отменена`,
        parse_mode: "HTML",
      });
      break;
    }
    case "cert": {
      if (!s) return ack(cbId, "Ученик не найден");
      await db.doc(`students/${uid}`).update({
        certificateGranted: true,
        certificateGrantedAt: FieldValue.serverTimestamp(),
      });
      await ack(cbId, "🎓 Сертификат выдан");
      await tg("sendMessage", {
        chat_id: CHAT,
        text: `🎓 <b>${name}</b> — сертификат выдан`,
        parse_mode: "HTML",
      });
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
      if (!s) return ack(cbId, "Ученик не найден");
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
        chat_id: CHAT,
        text,
        parse_mode: "HTML",
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
      // Удаляем подколлекцию messages, затем документ
      const msgs = await db.collection(`students/${uid}/messages`).listDocuments();
      const batch = db.batch();
      msgs.forEach((d) => batch.delete(d));
      batch.delete(db.doc(`students/${uid}`));
      await batch.commit();
      await ack(cbId, "🗑 Удалён");
      await tg("sendMessage", {
        chat_id: CHAT,
        text: `🗑 <b>${name}</b> — удалён`,
        parse_mode: "HTML",
      });
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

// ── Обработка текстовых сообщений / команд ──
async function handleMessage(msg) {
  const text = msg.text.trim();

  // Команды
  if (text === "/start" || text === "/help") {
    await tg("sendMessage", {
      chat_id: CHAT,
      text: [
        "<b>Бот школы рукии</b>",
        "",
        "/students — список учеников",
        "/paid — только оплатившие",
        "/unpaid — неоплатившие",
        "/stats — статистика",
        "",
        "Уведомления приходят автоматически.",
        "Кнопки под сообщениями — для быстрых действий.",
      ].join("\n"),
      parse_mode: "HTML",
    });
    return;
  }

  if (text === "/students" || text === "/paid" || text === "/unpaid") {
    const snap = await db.collection("students").get();
    if (snap.empty) {
      await tg("sendMessage", { chat_id: CHAT, text: "Учеников пока нет." });
      return;
    }
    let list = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
    if (text === "/paid") list = list.filter((s) => s.paid);
    if (text === "/unpaid") list = list.filter((s) => !s.paid);

    if (!list.length) {
      await tg("sendMessage", { chat_id: CHAT, text: "Список пуст." });
      return;
    }

    // Отправляем по одному — каждый с кнопками
    for (const s of list) {
      const pr = s.progress || {};
      const done = Object.entries(pr)
        .filter(([k, v]) => k !== "activityDates" && k !== "books" && typeof v === "object" && v?.status === "done")
        .length;
      await tg("sendMessage", {
        chat_id: CHAT,
        text: `${s.paid ? "✅" : "⬜"} <b>${s.name || "—"}</b> · ${s.email || ""} · ${done}/11`,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: [
          [{ text: "📋 Подробнее", callback_data: `info:${s.uid}` }],
        ]},
      });
    }
    return;
  }

  if (text === "/stats") {
    const snap = await db.collection("students").get();
    const all = snap.docs.map((d) => d.data());
    const paid = all.filter((s) => s.paid).length;
    const certs = all.filter((s) => s.certificateGranted).length;
    await tg("sendMessage", {
      chat_id: CHAT,
      text: [
        "<b>📊 Статистика</b>",
        `Всего учеников: ${all.length}`,
        `Оплатили: ${paid}`,
        `Сертификатов: ${certs}`,
      ].join("\n"),
      parse_mode: "HTML",
    });
    return;
  }

  // Не команда — проверяем, есть ли pending_reply
  const pending = await db.doc("bot_state/pending_reply").get();
  if (pending.exists) {
    const { uid, name, ts } = pending.data();
    // Если прошло больше 30 минут — считаем протухшим
    if (Date.now() - ts > 30 * 60 * 1000) {
      await db.doc("bot_state/pending_reply").delete();
      await tg("sendMessage", {
        chat_id: CHAT,
        text: "⏰ Время ответа истекло. Нажмите «Ответить» ещё раз.",
      });
      return;
    }

    // Сохраняем ответ в Firestore — ученик увидит в чате мгновенно
    await db.collection(`students/${uid}/messages`).add({
      from: "admin",
      text,
      createdAt: FieldValue.serverTimestamp(),
      read: false,
    });
    await db.doc("bot_state/pending_reply").delete();
    await tg("sendMessage", {
      chat_id: CHAT,
      text: `✅ Ответ отправлен <b>${name}</b>`,
      parse_mode: "HTML",
    });
    return;
  }

  // Неизвестное сообщение
  await tg("sendMessage", {
    chat_id: CHAT,
    text: "Отправьте /help для списка команд, или нажмите «Ответить» под сообщением ученика.",
  });
}
