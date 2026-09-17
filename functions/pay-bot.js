// Обработка оплаты без зависимости от Firebase: транспорт передаёт вебхук.
// copyMessage сохраняет фото/документ чека; текст уведомления — без HTML.
async function handlePaymentMessage(msg, { chat, send }) {
  if (!msg || msg.chat?.type !== "private" || !msg.chat?.id) return;
  const chatId = msg.chat.id;
  if (String(chatId) === String(chat)) return;
  const text = String(msg.text || "").trim();
  if (/^\/start(?:@\w+)?(?:\s|$)/i.test(text)) {
    await send("sendMessage", {
      chat_id: chatId,
      text: [
        "Ассаляму алейкум!", "",
        "Это бот оплаты курса «Онлайн-школа рукии».", "",
        "Напишите, пожалуйста:", "• ваше имя",
        "• email, с которым регистрировались на сайте",
        "• когда и как оплатили", "",
        "Чек можно прислать фото или документом.",
        "Наставник подтвердит доступ вручную.",
      ].join("\n"),
    });
    return;
  }
  if (!(msg.text || msg.photo?.length || msg.document || msg.caption)) return;
  if (!chat) throw new Error("Payment notification recipient is not configured");
  const from = msg.from || {};
  const who = from.username ? `@${from.username}`
    : [from.first_name, from.last_name].filter(Boolean).join(" ") || "Ученик";
  await send("sendMessage", {
    chat_id: chat,
    text: `💳 Оплата · @pay_rukya_bot\nОт: ${who} (${from.id || chatId})`,
  });
  // Не вклеиваем до 4096 символов сообщения в длинную HTML-шапку:
  // сохраняем исходное сообщение, включая вложение и подпись.
  await send("copyMessage", { chat_id: chat, from_chat_id: chatId, message_id: msg.message_id });
  await send("sendMessage", {
    chat_id: chatId,
    text: "Сообщение передано наставнику. Доступ будет подтверждён после проверки оплаты.",
  });
}

module.exports = { handlePaymentMessage };
