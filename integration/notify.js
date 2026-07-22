// Уведомления наставнику в Telegram. Вызывается из auth.js (регистрация),
// firestore.js (чат, прогресс). Никогда не бросает исключения — уведомление
// не должно блокировать основное действие ученика.
import { TG_BOT_TOKEN, TG_CHAT_ID } from "./telegram-config.js?v=1";

async function send(text) {
  if (!TG_BOT_TOKEN || TG_BOT_TOKEN.startsWith("ВСТАВЬ")) return;
  try {
    await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: "HTML" }),
    });
  } catch (_) { /* тихо — не ломаем UX ученику */ }
}

/** Новая регистрация */
export function notifyRegistration(name, email) {
  send(`<b>Новый ученик</b>\n${name}\n${email}`);
}

/** Сообщение в чате от ученика */
export function notifyChat(studentName, preview) {
  const short = preview && preview.length > 120 ? preview.slice(0, 120) + "..." : preview;
  send(`<b>Сообщение от ${studentName}</b>\n${short || "(медиа)"}`);
}

/** Ученик прошёл тест / завершил модуль */
export function notifyProgress(studentName, what, score) {
  const pct = score != null ? ` — ${Math.round(score * 100)}%` : "";
  send(`<b>Прогресс</b>\n${studentName}: ${what}${pct}`);
}
