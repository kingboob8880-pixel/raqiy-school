// node --test scripts/trilogy-course.test.cjs
// Структурный страж полностью перестроенной программы zaxab-2026.
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { pathToFileURL } = require("node:url");
const ROOT = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const sourceMap = JSON.parse(read("content/course-source-map.json"));
const NEW = sourceMap.newSources;
const EXPECTED = {
  1: ["Основание, дозволенность и допуск", 9],
  2: ["Подготовка лекаря", 16],
  3: ["Коран, дуа и язык формул", 14],
  4: ["Диагностика и безопасность приёма", 9],
  5: ["Хитаб Исаба: полный цикл", 5],
  6: ["Хитаб Исаба: зоны и сеанс", 10],
  7: ["Очищение, защита и закрепление", 16],
  8: ["Программа по 10 критериям", 4],
  9: ["Родовые и семейные поражения", 7],
  10: ["Кашф и тяжелейшие случаи", 9],
  11: ["Профессиональный приём и мастерство", 17],
  12: ["Супервизия и аттестация", 5],
};

test("реестр zaxab-2026: 12 модулей, 121 книга и правильные уровни", async () => {
  const { MODULES, computeAchievements } = await import(pathToFileURL(path.join(ROOT, "pages/js/modules-data.js")).href);
  assert.equal(MODULES.length, 12);
  assert.equal(MODULES.flatMap((m) => m.lessons).length, 121);
  assert.deepEqual(MODULES.map((m) => m.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  for (const m of MODULES) {
    assert.deepEqual([m.title, m.lessons.length], EXPECTED[m.id]);
    assert.equal(m.level, m.id <= 3 ? "Начальный" : m.id <= 7 ? "Средний" : "Продвинутый");
    assert.equal(m.doc, `/content/module-${m.id}/index.md`);
  }
  const grad = computeAchievements({}, []).find((a) => a.id === "graduate");
  assert.equal(grad.goal, 12);
  assert.equal(grad.earned, false);
});

test("десять новых произведений zaxab существуют, размечены и имеют границы", () => {
  assert.equal(NEW.length, 10);
  for (const n of NEW) {
    const lesson = read(n.doc.slice(1));
    const exam = read(n.exam.slice(1));
    assert.match(lesson, /^---\n/, n.doc);
    assert.match(lesson, new RegExp(`^module: ${n.module}$`, "m"), n.doc);
    assert.match(lesson, /\*\*Позиция источника и границы\.\*\*/);
    assert.match(lesson, /## Проверь себя/);
    assert.ok(!lesson.includes("\uFFFD"), n.doc);
    assert.ok(exam.includes(`book: "${n.doc}"`), n.exam);
  }
});

test("трилогия находится в Модуле 2, «Заряд» и «Разрыв» — в Модуле 7", async () => {
  const { MODULES } = await import(pathToFileURL(path.join(ROOT, "pages/js/modules-data.js")).href);
  const m2 = MODULES.find((m) => m.id === 2).lessons.map((l) => l.doc);
  const m7 = MODULES.find((m) => m.id === 7).lessons.map((l) => l.doc);
  for (const doc of ["pryamoy-put", "puti-vliyaniya", "podgotovka-pryamoy-put"])
    assert.ok(m2.includes(`/content/module-12/${doc}.md`), doc);
  assert.ok(m2.includes("/content/reference/pryamoy-put-svodka.md"));
  assert.ok(m7.includes("/content/module-12/zaryad-koranom.md"));
  assert.ok(m7.includes("/content/module-12/razriv-putej-koldovstva.md"));
  const trilogy = MODULES.flatMap((m) => m.lessons).filter((l) => l.doc.includes("pryamoy-put"));
  assert.equal(trilogy.length, 3);
  for (const l of trilogy) assert.ok(m2.includes(l.doc), `трилогия вне Модуля 2: ${l.doc}`);
});

test("каждая новая книга имеет безопасное задание и шесть экзаменационных вопросов", async () => {
  const { ASSIGNMENTS } = await import(pathToFileURL(path.join(ROOT, "pages/js/assignments-data.js")).href);
  const all = Object.values(ASSIGNMENTS).flat();
  for (const n of NEW) {
    const tasks = all.filter((a) => a.book === n.doc);
    assert.ok(tasks.length >= 1, n.doc);
    for (const a of tasks) {
      assert.ok(a.check && !/кровопускан|вызывание рвоты|игл|надавливан/.test(`${a.description} ${a.check}`), `опасное задание: ${a.id}`);
    }
    const exam = read(n.exam.slice(1));
    assert.equal((exam.match(/^\d+\./gm) || []).length, 6, n.exam);
  }
});

test("все экзамены курса валидны: один правильный и минимум три дистрактора", () => {
  const dir = path.join(ROOT, "content/exams");
  let checked = 0;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".md"))) {
    const text = read(path.join("content", "exams", f));
    const questions = (text.match(/^\d+\./gm) || []).length;
    if (!questions) continue;
    checked++;
    assert.equal((text.match(/^- \[x\]/gm) || []).length, questions, f);
    assert.ok((text.match(/^- \[ \]/gm) || []).length >= questions * 3, f);
  }
  assert.equal(checked, 121);
});

test("итоговые тесты: 150 вопросов, все модули и корректные индексы ответов", async () => {
  const { QUIZZES } = await import(pathToFileURL(path.join(ROOT, "pages/js/quiz-data.js")).href);
  assert.equal(Object.values(QUIZZES).flat().length, 150);
  for (const id of Object.keys(EXPECTED)) {
    assert.ok(QUIZZES[id].length >= 3, `мало вопросов в модуле ${id}`);
    for (const q of QUIZZES[id]) {
      assert.ok(q.options.length >= 4);
      assert.ok(q.correct >= 0 && q.correct < q.options.length);
    }
  }
});

test("флеш-карточки и глоссарий покрывают новые блоки", () => {
  const flash = read("pages/flashcards/index.html");
  for (const id of [8, 9, 10]) assert.ok(flash.includes(`{ m:${id},`), `нет карточек модуля ${id}`);
  assert.ok(flash.includes("{ m:2, q:\"Что выделяет «Прямой путь»"));
  const gloss = read("pages/glossary/index.html");
  for (const term of ["Десять критериев", "Наследственная болезнь", "Кашф", "Таби"])
    assert.ok(gloss.includes(term), `глоссарий без ${term}`);
});

test("сгенерированные данные и public содержат новую программу", () => {
  const search = read("content/search-index.json");
  const course = read("functions/course-data.json");
  for (const n of NEW) {
    assert.ok(search.includes(n.doc), `search-index без ${n.doc}`);
    assert.ok(course.includes(n.doc), `course-data без ${n.doc}`);
    assert.ok(fs.existsSync(path.join(ROOT, "public", n.doc.slice(1))), `public без ${n.doc}`);
    assert.ok(fs.existsSync(path.join(ROOT, "public", n.exam.slice(1))), `public без ${n.exam}`);
  }
  assert.ok(course.includes("Программа по 10 критериям"));
  assert.ok(course.includes("Родовые и семейные поражения"));
  assert.ok(course.includes("Кашф и тяжелейшие случаи"));
});
