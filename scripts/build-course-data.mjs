// Собирает данные курса в один JSON для Telegram-бота.
//
// ЗАЧЕМ. Бот живёт в functions/ (CommonJS, Admin SDK), а модули, уроки и
// упражнения описаны в pages/js/*.js как ES-модули для браузера. Скопировать
// их в functions/ руками — значит завести вторую копию, которая разъедется
// с первой на первой же правке курса: добавил урок на сайте, а бот его не
// видит, и никто не замечает, пока ученик не пожалуется.
//
// Поэтому здесь один генератор: он ИМПОРТИРУЕТ те же самые файлы, что и
// сайт, и выкладывает нужное боту в functions/course-data.json. Файл
// сгенерированный — руками его не правят.
//
// Запуск (после любой правки модулей, уроков или упражнений):
//   node scripts/build-course-data.mjs
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// ПОЧЕМУ ТАК, А НЕ ЧЕРЕЗ new URL(...).pathname.
// На Windows .pathname даёт «/C:/Users/…» — с ведущим слэшем. Такой путь
// не годится ни для fs, ни для import(): Node принимает его за имя пакета
// и падает в package_json_reader. Ловится это только на Windows, поэтому
// в Linux скрипт работал, а у автора — нет (2026-07-27).
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// import() принимает либо спецификатор пакета, либо file://-адрес.
// Абсолютный путь Windows не является ни тем, ни другим.
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href);

const { MODULES, QUIZ_PASS_THRESHOLD, bookKey } = await load("pages/js/modules-data.js");
const { ASSIGNMENTS } = await load("pages/js/assignments-data.js");

// Берём только то, что боту действительно нужно. Обложки, интро-видео и
// прочее оформление сайта в Telegram не используются — незачем раздувать
// файл, который читается на каждом холодном старте функции.
const modules = MODULES.map((m) => ({
  id: m.id,
  title: m.title,
  level: m.level,
  doc: m.doc,
  lessons: (m.lessons || []).map((l) => ({
    title: l.title,
    doc: l.doc,
    exam: l.exam || null,
    key: bookKey(l.doc),
  })),
}));

const assignments = {};
for (const [mid, items] of Object.entries(ASSIGNMENTS)) {
  assignments[mid] = items.map((a) => ({
    id: a.id,
    book: a.book || null,
    bookKey: a.book ? bookKey(a.book) : null,
    title: a.title,
    description: a.description,
    check: a.check,
    type: a.type,
    duration: a.duration,
    steps: a.steps || [],
    days: a.days || 0,
    intent: a.intent || null,
    counter: a.counter || null,
  }));
}

const out = {
  generatedAt: new Date().toISOString(),
  note: "Сгенерировано scripts/build-course-data.mjs — руками не править.",
  passThreshold: QUIZ_PASS_THRESHOLD,
  modules,
  assignments,
};

const dest = join(ROOT, "functions/course-data.json");
writeFileSync(dest, JSON.stringify(out, null, 1), "utf8");

const lessons = modules.reduce((n, m) => n + m.lessons.length, 0);
const tasks = Object.values(assignments).reduce((n, a) => n + a.length, 0);
console.log(`Готово: ${modules.length} модулей, ${lessons} уроков, ${tasks} упражнений`);
console.log(`  → ${dest}`);
