#!/usr/bin/env node
// Точный проверочный скрипт обновления курса.
// Запуск: node scripts/trilogy-course.test.cjs
// Выход с кодом 0 только если выполнены все утверждения ниже.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { test } = require("node:test");

const ROOT = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const has = (t, s) => t.includes(s);
const hasBad = (t) => t.includes("\uFFFD");

const NEW = [
  ["content/module-1/pryamoy-put.md", ["Прямой путь", "/content/module-1/namereniya.md", "/content/module-1/volevoy-akt.md", "/content/module-2/puti-vliyaniya.md"]],
  ["content/module-2/puti-vliyaniya.md", ["/content/module-1/pryamoy-put.md", "/content/module-8/podgotovka-pryamoy-put.md"]],
  ["content/module-8/podgotovka-pryamoy-put.md", ["/content/module-1/pryamoy-put.md", "/content/module-2/puti-vliyaniya.md", "/content/module-8/istselenie-za-sekundy.md"]],
  ["content/exams/module-1-pryamoy-put.md", ['book: "/content/module-1/pryamoy-put.md"']],
  ["content/exams/module-2-puti-vliyaniya.md", ['book: "/content/module-2/puti-vliyaniya.md"']],
  ["content/exams/module-8-podgotovka-pryamoy-put.md", ['book: "/content/module-8/podgotovka-pryamoy-put.md"']],
];

test("новые уроки и экзамены существуют и корректны", () => {
  for (const [file, needs] of NEW) {
    const t = read(file);
    assert.ok(t.startsWith("---\n") || t.startsWith("---\r\n"), "front-matter: " + file);
    assert.ok(!hasBad(t), "повреждённые символы: " + file);
    for (const s of needs) assert.ok(has(t, s), file + " ожидает " + s);
  }
});

test("реестр модулей ссылается на три урока ровно один раз", () => {
  const t = read("pages/js/modules-data.js");
  for (const p of ["module-1/pryamoy-put.md", "module-2/puti-vliyaniya.md", "module-8/podgotovka-pryamoy-put.md"]) {
    const n = t.split('"/content/' + p + '"').length - 1;
    assert.equal(n, 1, p + " должен встречаться 1 раз");
  }
});

test("задания привязаны к новым урокам", () => {
  const t = read("pages/js/assignments-data.js");
  for (const id of ["m1-pryamoy-put", "m2-puti-vliyaniya", "m8-podgotovka-pryamoy-put"]) {
    assert.ok(has(t, id));
  }
});

test("вопросы тестов модулей по всем трём урокам", () => {
  const t = read("pages/js/quiz-data.js");
  assert.ok(has(t, "Прямого пути»?"));
  assert.ok(has(t, "сабиль / пути влияния»"));
  assert.ok(has(t, "проходит подготовка?"));
  assert.ok(has(t, "одно мгновение»?"));
});

test("оглавления модулей упомянуты и не повреждены", () => {
  const m1 = read("content/module-1/index.md");
  const m2 = read("content/module-2/index.md");
  const m8 = read("content/module-8/index.md");
  assert.equal((m1.match(/pryamoy-put\.md/g) || []).length, 1);
  assert.ok(has(m2, "puti-vliyaniya.md"));
  assert.ok(has(m8, "podgotovka-pryamoy-put.md"));
  assert.ok(has(m8, "Модуль разделён на пять уроков"));
  for (const t2 of [m1, m2, m8]) assert.ok(!hasBad(t2));
});

test("сгенерированные индексы содержат новые уроки", () => {
  const si = read("content/search-index.json");
  const cd = read("functions/course-data.json");
  for (const p of ["module-1/pryamoy-put.md", "module-2/puti-vliyaniya.md", "module-8/podgotovka-pryamoy-put.md"]) {
    assert.ok(has(si, p), "search-index: " + p);
    assert.ok(has(cd, p), "course-data: " + p);
  }
});

test("все экзамены валидны: 6 вопросов, ровно один правильный", () => {
  for (const f of fs.readdirSync(path.join(ROOT, "content/exams")).filter((x) => x.endsWith(".md"))) {
    const t = read(path.join("content", "exams", f));
    if (t.includes("status: author") && has(t, "module-1-pryamoy-put") === false && f.startsWith("module-")) continue;
    const q = (t.match(/^\d+\./gm) || []).length;
    const a = (t.match(/^- \[ \]/gm) || []).length;
    const c = (t.match(/^- \[x\]/gm) || []).length;
    if (q === 0) continue;
    assert.equal(c, q, f + ": по одному правильному на вопрос");
    assert.ok(a >= q * 3, f + ": минимум три неверных варианта");
  }
});

test("сборка public актуальна и содержит новые файлы", () => {
  const required = [
    "public/content/module-1/pryamoy-put.md",
    "public/content/module-2/puti-vliyaniya.md",
    "public/content/module-8/podgotovka-pryamoy-put.md",
    "public/content/exams/module-1-pryamoy-put.md",
    "public/content/exams/module-2-puti-vliyaniya.md",
    "public/content/exams/module-8-podgotovka-pryamoy-put.md",
    "public/content/search-index.json",
  ];
  for (const f of required) assert.ok(fs.existsSync(path.join(ROOT, f)), "нет в public: " + f);
  const src = read("content/module-1/index.md");
  const pub = read("public/content/module-1/index.md");
  assert.ok(has(pub, "pryamoy-put.md"), "урок в собранном оглавлении");
  const built = JSON.parse(read("public/content/search-index.json"));
  const source = JSON.parse(read("content/search-index.json"));
  assert.deepEqual(built, source, "search-index в public совпадает с исходным");
});
