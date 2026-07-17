// Уведомление лекарю в Telegram при регистрации нового ученика.
// Срабатывает на создание документа students/{uid} (registerStudent() в
// integration/auth.js) — project.md, решение 2026-07-17. Токен бота и chat_id
// хранятся в Secret Manager (firebase functions:secrets:set), не в репозитории.
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");

const TELEGRAM_BOT_TOKEN = defineSecret("TELEGRAM_BOT_TOKEN");
const TELEGRAM_CHAT_ID = defineSecret("TELEGRAM_CHAT_ID");

exports.notifyNewStudent = onDocumentCreated(
  { document: "students/{uid}", secrets: [TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID] },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const text = [
      "🆕 Новая регистрация на сайте школы",
      `Имя: ${data.name || "—"}`,
      `Email: ${data.email || "—"}`,
    ].join("\n");

    const token = TELEGRAM_BOT_TOKEN.value();
    const chatId = TELEGRAM_CHAT_ID.value();

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
      if (!res.ok) {
        logger.error("Telegram API вернул ошибку", await res.text());
      }
    } catch (err) {
      logger.error("Не удалось отправить уведомление в Telegram", err);
    }
  }
);
