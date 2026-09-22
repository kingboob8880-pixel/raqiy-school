// node --test scripts/trilogy-course.test.cjs
//
// Точная проверка Модуля 12 «Профессионал»: три книги трилогии «Прямой путь»
// переехали в один финальный модуль, курсу добавлены ресурсы (сводка,
// флеш-карточки, глоссарий), а счётчики модулей переведены с 11 на 12.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { pathToFileURL } = require("node:url");

const ROOT = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const has = (t, s) => t.includes(s);

const LESSONS = [
  "content/module-12/pryamoy-put.md",
  "content/module-12/puti-vliyaniya.md",
  "content/module-12/podgotovka-pryamoy-put.md",
  "content/reference/pryamoy-put-svodka.md",
];
const EXAMS = [
  "content/exams/module-12-pryamoy-put.md",
  "content/exams/module-12-puti-vliyaniya.md",
  "content/exams/module-12-podgotovka-pryamoy-put.md",
  "content/exams/module-12-pryamoy-put-svodka.md",
];

test("книги трилогии собраны в Модуле 12 и корректны", () => {
  for (const f of [...LESSONS, ...EXAMS]) {
    assert.ok(fs.existsSync(path.join(ROOT, f)), "нет файла: " + f);
    const t = read(f);
    assert.ok(!t.includes("\uFFFD"), "повреждённые символы: " + f);
    assert.match(t, /^---\r?\n/, "нет front-matter: " + f);
  }
  assert.ok(has(read("content/module-12/index.md"), "Профессионал"), "в оглавлении Модуля 12 нет названия");
  for (const f of LESSONS.slice(0, 3)) {
    assert.match(read(f), /^module: 12$/m, "номер модуля не 12: " + f);
  }
  for (const f of EXAMS) {
    assert.match(read(f), /book: "\/content\/(module-12|reference)\//, "book указывает не туда: " + f);
  }
});

test("в Модулях 1, 2 и 8 не осталось уроков трилогии", () => {
  for (const [mod, needle] of [[1, "pryamoy-put"], [2, "puti-vliyaniya"], [8, "podgotovka-pryamoy-put"]]) {
    const idx = read(`content/module-${mod}/index.md`);
    assert.ok(!has(idx, needle), `в оглавлении Модуля ${mod} остался ${needle}`);
    assert.ok(!fs.existsSync(path.join(ROOT, `content/module-${mod}/${needle}.md`)), `файл остался в Модуле ${mod}`);
  }
  assert.ok(has(read("content/module-8/index.md"), "istselenie-za-sekundy"), "«Исцеление за секунды» потеряно из Модуля 8");
});

test("реестр модулей: 12 модулей и трилогия ровно в одном месте", async () => {
  const { MODULES, computeAchievements } = await import(pathToFileURL(path.join(ROOT, "pages/js/modules-data.js")).href);
  assert.equal(MODULES.length, 12);
  assert.deepEqual(MODULES.map((m) => m.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const m12 = MODULES.find((m) => m.id === 12);
  assert.equal(m12.title, "Профессионал");
  assert.equal(m12.lessons.length, 4);
  for (const l of m12.lessons) {
    assert.ok(l.doc.startsWith("/content/"), "путь урока: " + l.doc);
    assert.ok(l.exam && l.exam.startsWith("/content/exams/"), "экзамен урока: " + l.doc);
    assert.ok(fs.existsSync(path.join(ROOT, l.doc.replace(/^\//, ""))), "нет файла урока: " + l.doc);
    assert.ok(fs.existsSync(path.join(ROOT, l.exam.replace(/^\//, ""))), "нет файла экзамена: " + l.exam);
  }
  let occurrences = 0;
  for (const m of MODULES) for (const l of m.lessons) if (l.doc.includes("pryamoy-put") || l.doc.includes("puti-vliyaniya")) occurrences += 1;
  assert.equal(occurrences - 1, 3, "книги трилогии должны встречаться только в Модуле 12 и сводке");

  const grad = computeAchievements({}, []).find((a) => a.id === "graduate");
  assert.equal(grad.goal, 12);
  assert.ok(grad.description.includes("12"));
});

test("задания и тесты Модуля 12 на месте", async () => {
  const { ASSIGNMENTS } = await import(pathToFileURL(path.join(ROOT, "pages/js/assignments-data.js")).href);
  assert.equal(ASSIGNMENTS[12].length, 4);
  const { MODULES } = await import(pathToFileURL(path.join(ROOT, "pages/js/modules-data.js")).href);
  const docs = MODULES.find((m) => m.id === 12).lessons.map((l) => l.doc);
  for (const a of ASSIGNMENTS[12]) assert.ok(docs.includes(a.book), "задание вне Модуля 12: " + a.id);
  for (const id of ["m1-pryamoy-put", "m2-puti-vliyaniya", "m8-podgotovka-pryamoy-put"]) {
    const stray = Object.values(ASSIGNMENTS).flat().some((a) => a.id === id);
    assert.ok(!stray, "осталось старое задание: " + id);
  }

  const { QUIZZES } = await import(pathToFileURL(path.join(ROOT, "pages/js/quiz-data.js")).href);
  assert.equal(QUIZZES[12].length, 8);
  for (const q of QUIZZES[12]) {
    assert.equal(q.options.length, 4);
    assert.ok(q.correct >= 0 && q.correct < 4);
  }
  for (const [mod, needle] of [[1, "Прямого пути"], [2, "сабиль"], [8, "одно мгновение"]]) {
    assert.ok(!QUIZZES[mod].some((q) => q.q.includes(needle)), `вопрос остался в тесте Модуля ${mod}`);
  }
});

test("ресурсы: сводка, флеш-карточки и глоссарий несут Модуль 12", () => {
  const svodka = read("content/reference/pryamoy-put-svodka.md");
  for (const s of ["Четыре элемента", "Сабиль", "Обещай усилие"]) assert.ok(has(svodka, s), "в сводке нет: " + s);

  const flash = read("pages/flashcards/index.html");
  assert.ok(has(flash, "i <= 12"), "выбор колоды не расширен до 12");
  assert.ok(!has(flash, "i <= 11"), "осталось ограничение на 11 модулей");
  assert.ok(!has(flash, "всех 11 модулей"), "устаревшая карточка про 11 модулей");
  assert.equal((flash.match(/\{ m:12,/g) || []).length, 10, "карточек Модуля 12 должно быть 10");

  const gloss = read("pages/glossary/index.html");
  assert.equal((gloss.match(/modules: \[12\]/g) || []).length, 3, "терминов Модуля 12 должно быть 3");
  for (const s of ["Сабиль", "аль-Фаттах", "Формула «Прямого пути»"]) assert.ok(has(gloss, s), "в глоссарии нет: " + s);
});

test("счётчики модулей переведены на 12", () => {
  const i18n = read("pages/js/i18n.js");
  assert.ok(!/11 модул/.test(i18n), "в i18n осталось «11 модул»");
  assert.ok(!/11 modul/.test(i18n), "в i18n осталось «11 modul»");
  assert.ok(!/11 modules/.test(i18n), "в i18n осталось «11 modules»");
  assert.ok(has(i18n, "12 модулей"), "в i18n нет «12 модулей»");
  for (const f of ["pages/index.html", "pages/about.html"]) {
    assert.ok(!has(read(f), "11 модул"), "осталось «11 модул»: " + f);
  }
  assert.ok(has(read("pages/js/module-intro-data.js"), "  12: {"), "нет intro для Модуля 12");
});

test("сгенерированные индексы содержат Модуль 12", () => {
  const si = read("content/search-index.json");
  const cd = read("functions/course-data.json");
  for (const f of LESSONS) {
    assert.ok(has(si, f), "search-index без " + f);
    assert.ok(has(cd, f), "course-data без " + f);
  }
  assert.ok(has(cd, "Профессионал"), "course-data без Модуля 12");
  assert.ok(!has(cd, "module-1/pryamoy-put.md"), "course-data всё ещё знает старый путь");
});

test("все экзамены курса валидны: 6 вопросов и один правильный", () => {
  const dir = path.join(ROOT, "content/exams");
  let checked = 0;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".md"))) {
    const t = read(path.join("content", "exams", f));
    const q = (t.match(/^\d+\./gm) || []).length;
    if (!q) continue;
    checked += 1;
    assert.equal((t.match(/^- \[x\]/gm) || []).length, q, "правильных ответов не по числу вопросов: " + f);
    assert.ok((t.match(/^- \[ \]/gm) || []).length >= q * 3, "меньше трёх неверных вариантов: " + f);
  }
  assert.ok(checked >= 60, "проверено экзаменов: " + checked);
});

test("сборка public содержит Модуль 12 и актуальный поиск", () => {
  for (const f of [...LESSONS, ...EXAMS]) {
    assert.ok(fs.existsSync(path.join(ROOT, "public", f)), "нет в public: " + f);
  }
  assert.ok(fs.existsSync(path.join(ROOT, "public/content/module-12/index.md")), "нет оглавления Модуля 12 в public");
  const built = JSON.parse(read("public/content/search-index.json"));
  const source = JSON.parse(read("content/search-index.json"));
  assert.deepEqual(built, source, "search-index в public разошёлся с исходным");
});

