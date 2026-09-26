// node --test scripts/pay-bot.test.cjs
// Реальный обработчик, Telegram заменён записью вызовов. Никакой сети.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { handlePaymentMessage } = require("../functions/pay-bot");

function message(extra = {}) {
  return { message_id: 42, chat: { id: 123, type: "private" },
    from: { id: 123, first_name: "Имя < & >" }, ...extra };
}

for (const [name, content] of [
  ["фото чека без подписи", { photo: [{ file_id: "test-photo" }] }],
  ["документ без подписи", { document: { file_id: "test-document" } }],
  ["текст до 4096 символов", { text: "<>&" + "а".repeat(4093) }],
]) {
  test(name + ": исходное сообщение передаётся наставнику до подтверждения ученику", async () => {
    const calls = [];
    await handlePaymentMessage(message(content), {
      chat: "999", send: async (method, body) => { calls.push({ method, body }); return { ok: true }; },
    });
    assert.equal(calls.length, 3);
    assert.equal(calls[0].body.chat_id, "999");
    assert.match(calls[0].body.text, /Имя < & >/);
    assert.equal(calls[0].body.parse_mode, undefined, "имя не интерпретируется как HTML");
    assert.deepEqual(calls[1], { method: "copyMessage", body: {
      chat_id: "999", from_chat_id: 123, message_id: 42,
    } });
    assert.equal(calls[2].body.chat_id, 123);
    assert.match(calls[2].body.text, /передано наставнику/);
    assert.doesNotMatch(calls[2].body.text, /Напишите, пожалуйста/);
  });
}

test("/start показывает инструкцию без уведомления наставника", async () => {
  const calls = [];
  await handlePaymentMessage(message({ text: "/start welcome" }), {
    chat: "999", send: async (method, body) => { calls.push({ method, body }); },
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].body.chat_id, 123);
  assert.match(calls[0].body.text, /Чек можно прислать/);
});

test("отказ копирования не подтверждает ученику успешную доставку", async () => {
  const calls = [];
  await assert.rejects(handlePaymentMessage(message({ photo: [{}] }), {
    chat: "999", send: async (method, body) => {
      calls.push({ method, body });
      if (method === "copyMessage") throw new Error("Telegram unavailable");
    },
  }), /Telegram unavailable/);
  assert.equal(calls.length, 2);
  assert.ok(calls.every(c => c.body.chat_id === "999"));
});

test("сообщения наставника и групп не пересылаются", async () => {
  let calls = 0;
  const options = { chat: "999", send: async () => { calls++; } };
  await handlePaymentMessage(message({ text: "test", chat: { id: 999, type: "private" } }), options);
  await handlePaymentMessage(message({ text: "test", chat: { id: -123, type: "group" } }), options);
  assert.equal(calls, 0);
});

// Проверяем связку HTTP webhook -> payTg -> handler, а не только helper.
// Загружается только pay-секция index.js; Firebase и секреты не читаются.
function webhook(response) {
  const source = fs.readFileSync(path.join(__dirname, "../functions/index.js"), "utf8");
  const start = source.indexOf("const PAY_BOT =");
  assert.ok(start >= 0);
  const calls = [];
  const ctx = vm.createContext({
    exports: {}, process: { env: { TG_PAY_BOT_TOKEN: "test-only" } },
    require: id => { assert.equal(id, "./pay-bot"); return { handlePaymentMessage }; },
    HOOK_SECRET: "test-secret", CHAT: "999", AbortSignal,
    logger: { warn() {}, error() {} },
    // Хвост index.js с 2026-09-26 объявляет вебхук через v1-стиль:
    // functions.region(...).https.onRequest(handler) — имитируем цепочку.
    functions: { region: () => ({ https: { onRequest: (handler) => handler } }) },
    fetch: async (url, options) => {
      const method = url.slice(url.lastIndexOf("/") + 1);
      calls.push({ method, body: JSON.parse(options.body) });
      return response(method);
    },
  });
  vm.runInContext(source.slice(start), ctx, { timeout: 1000 });
  return { calls, handler: ctx.exports.payTelegramWebhook };
}

for (const failed of [false, true]) {
  test("webhook: Telegram " + (failed ? "отклонил чек -> HTTP 503" : "принял чек -> HTTP 200"), async () => {
    const { calls, handler } = webhook(method => {
      const ok = !(failed && method === "copyMessage");
      return { ok, status: ok ? 200 : 429, json: async () => ({ ok, error_code: ok ? undefined : 429 }) };
    });
    let status;
    await handler({ get: () => "test-secret", body: { message: message({ photo: [{}] }) } },
      { sendStatus: value => { status = value; } });
    assert.equal(status, failed ? 503 : 200);
    assert.equal(calls.filter(c => c.method === "copyMessage").length, 1);
    assert.equal(calls.some(c => c.body.chat_id === 123), !failed);
  });
}

test("webhook: неверный секрет -> HTTP 401 без вызовов Telegram", async () => {
  const { handler, calls } = webhook(() => { throw new Error("unexpected network call"); });
  let status;
  await handler({ get: () => "wrong", body: { message: message({ photo: [{}] }) } },
    { sendStatus: value => { status = value; } });
  assert.equal(status, 401);
  assert.equal(calls.length, 0);
});
