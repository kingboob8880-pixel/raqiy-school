// Регрессия расписания: cron интерпретируется в timeZone, а не всегда в UTC.
// Запуск: node --test scripts/schedule.test.cjs
// Никаких обращений к Firebase/Telegram и запуска обработчика рассылки.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function readSchedule(name = "studentDailyPractice") {
  const source = fs.readFileSync(path.join(__dirname, "../functions/index.js"), "utf8");
  const start = source.indexOf(`exports.${name} =`);
  assert.ok(start >= 0, `${name} должен быть объявлен`);
  const end = source.indexOf(".onRun(", start);
  assert.ok(end > start, "ожидается расписание перед onRun");
  const config = {};
  const builder = {
    region() { return this; },
    runWith() { return this; },
    get pubsub() { return this; },
    schedule(value) { config.cron = value; return this; },
    timeZone(value) { config.timeZone = value; return this; },
  };
  vm.runInNewContext(source.slice(start, end) + ";", {
    exports: {}, functions: builder, REGION: "test", SECRETS: [],
  }, { timeout: 1000 });
  return config;
}

function matchesDailySchedule(config, instant) {
  const [minute, hour, ...rest] = config.cron.split(/\s+/);
  assert.deepEqual(rest, ["*", "*", "*"], "проверяем ежедневное расписание");
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: config.timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(instant));
  const local = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return Number(local.hour) === Number(hour) && Number(local.minute) === Number(minute);
}

test("studentDailyPractice назначен на 08:00 Москвы, не на 05:00 Москвы", () => {
  const config = readSchedule();
  assert.equal(config.timeZone, "Europe/Moscow");
  for (const day of ["2026-01-16", "2026-07-16"]) {
    assert.equal(matchesDailySchedule(config, day + "T05:00:00Z"), true,
      "05:00 UTC = 08:00 Москвы: рассылка должна быть назначена");
    assert.equal(matchesDailySchedule(config, day + "T02:00:00Z"), false,
      "02:00 UTC = 05:00 Москвы: слишком рано");
    assert.equal(matchesDailySchedule(config, day + "T05:01:00Z"), false);
  }
});


test("dailyReminders назначен на 10:00 Москвы, не на 07:00 Москвы", () => {
  const config = readSchedule("dailyReminders");
  assert.equal(config.timeZone, "Europe/Moscow");
  for (const day of ["2026-01-16", "2026-07-16"]) {
    assert.equal(matchesDailySchedule(config, day + "T07:00:00Z"), true,
      "07:00 UTC = 10:00 Москвы: напоминание наставнику");
    assert.equal(matchesDailySchedule(config, day + "T04:00:00Z"), false,
      "04:00 UTC = 07:00 Москвы: слишком рано");
    assert.equal(matchesDailySchedule(config, day + "T07:01:00Z"), false);
  }
});

