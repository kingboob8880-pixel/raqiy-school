// Регрессия по поверхностям, которые раньше ничем не проверялись:
//   1. выпуск/сертификат в Cloud Functions (баг 2026-09: «все сдано» на частичном прогрессе);
//   2. структурная целостность банка вопросов QUIZZES;
//   3. согласованность формы супервизии (сайт) с course-data.json (бот);
//   4. полнота настрой-модалок модулей (MODULE_INTRO на все 12);
//   5. задания: уникальность id и разрешение книг на реальные файлы;
//   6. контракт withBase() для GitHub Pages / домена / локального сервера.
//
// Запуск: node --test scripts/logic-stress.test.cjs
// Firebase/Telegram/браузер не трогаем: чистые функции вытаскиваем из исходников
// и исполняем в vm с подменёнными глобалами (тот же приём, что в schedule.test.cjs).
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.join(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

/* ── 1. выпуск: progressShowsGraduation ─────────────────────────────────
 * Раньше onStudentChanged считал allDone без проверки количества модулей,
 * и ученику с 1–3 сданными (или с пустым прогрессом) предлагалась кнопка
 * «выдать сертификат». FIX вынес логику в progressShowsGraduation с guard
 * `mods.length >= TOTAL_MODULES`. Проверяем и поведение, и что оба места
 * больше не считают «вручную». */
function extractFn(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} должен быть объявлен в functions/index.js`);
  let i = source.indexOf("{", start);
  let depth = 0;
  for (; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") { depth--; if (depth === 0) return source.slice(start, i + 1); }
  }
  throw new Error(`не найден конец ${name}`);
}

function loadGraduationHelpers() {
  const source = read("functions/index.js");
  const m = source.match(/const TOTAL_MODULES\s*=\s*(\d+)/);
  assert.ok(m, "TOTAL_MODULES должен быть объявлен");
  const TOTAL = Number(m[1]);
  const code =
    `const TOTAL_MODULES = ${TOTAL};\n` +
    extractFn(source, "moduleEntries") + "\n" +
    extractFn(source, "progressShowsGraduation") + "\n" +
    "({ moduleEntries, progressShowsGraduation })";
  const helpers = vm.runInNewContext(code, {}, { timeout: 1000 });
  return { ...helpers, TOTAL };
}

test("progressShowsGraduation: пустой/частичный прогресс — НЕ выпуск", () => {
  const { progressShowsGraduation, TOTAL } = loadGraduationHelpers();
  assert.equal(TOTAL, 12, "программа из 12 модулей");
  const done = (n) => Object.fromEntries(
    Array.from({ length: n }, (_, i) => [String(i + 1), { status: "done" }]));
  // Пустой прогресс: [].every() истинно на пустом — без guard дал бы true.
  assert.equal(progressShowsGraduation({}), false, "пустой прогресс не выпуск");
  assert.equal(progressShowsGraduation(undefined), false, "undefined не выпуск");
  // Частичный: 1, 3, 11 сданных — все "done", но модулей меньше 12.
  for (const n of [1, 3, 11]) {
    assert.equal(progressShowsGraduation(done(n)), false,
      `${n} из ${TOTAL} сданных — ещё не выпуск`);
  }
});

test("progressShowsGraduation: все 12 done — выпуск; не все done — нет", () => {
  const { progressShowsGraduation, TOTAL } = loadGraduationHelpers();
  const all = {};
  for (let i = 1; i <= TOTAL; i++) all[String(i)] = { status: "done" };
  assert.equal(progressShowsGraduation(all), true, "все 12 done — выпуск");
  // Служебные ключи не должны ломать подсчёт.
  all.activityDates = ["2026-01-01", "2026-01-02"];
  all.books = { "/content/x.md": { status: "done" } };
  assert.equal(progressShowsGraduation(all), true, "activityDates/books — не модули");
  // Один не доведённый до done — уже не выпуск.
  const almost = { ...all, "12": { status: "in-progress" } };
  assert.equal(progressShowsGraduation(almost), false, "один не done — не выпуск");
  // Модуль без статуса вообще не учитывается в mods.
  assert.equal(progressShowsGraduation({ ...all, "12": {} }), false,
    " done без статуса не считается сданным");
});

test("в functions/index.js выпуск считается только через helper (без ручных .every)", () => {
  const source = read("functions/index.js");
  assert.match(source, /const allDone = progressShowsGraduation\(pA\);/,
    "onStudentChanged должен брать allDone из helper");
  assert.match(source, /if \(progressShowsGraduation\(pA\) && !progressShowsGraduation\(pB\)\) \{/,
    "buildFeedEntries должен сравнивать выпуск через helper");
  // Защита от отката: нигде больше «все done» не считается инлайновым Object.entries(...).every(...)
  const inline = source.match(/Object\.entries\(pA\)[\s\S]{0,160}?\.every\(\s*\(\s*\[,\s*v\]/);
  assert.equal(inline, null, "не должно остаться ручного allDone в обход helper");
});

/* ── 2. QUIZZES: структура ──────────────────────────────────────────────── */
function loadEsm(rel, globals) {
  const src = read(rel).replace(/^export /gm, "");
  const ctx = vm.createContext({ ...(globals || {}) });
  vm.runInContext(src, ctx);
  return ctx;
}

test("QUIZZES (курс-банк): все 12 модулей, корректный индекс ответа, ≥2 варианта", () => {
  const ctx = loadEsm("pages/js/quiz-data.js");
  const QUIZZES = vm.runInContext("QUIZZES", ctx);
  const mods = Object.keys(QUIZZES).map(Number).sort((a, b) => a - b);
  assert.deepEqual([...mods], Array.from({ length: 12 }, (_, i) => i + 1),
    "bank вопросов покрыывает все 12 модулей");
  for (const [mod, qs] of Object.entries(QUIZZES)) {
    assert.ok(Array.isArray(qs) && qs.length > 0, `Модуль ${mod}: банк пуст`);
    qs.forEach((q, i) => {
      assert.ok(typeof q.q === "string" && q.q.trim(), `${mod}#${i}: пустой вопрос`);
      assert.ok(Array.isArray(q.options) && q.options.length >= 2, `${mod}#${i}: <2 вариантов`);
      assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length,
        `${mod}#${i}: correct=${q.correct} вне диапазона 0..${q.options.length - 1}`);
      assert.equal(new Set(q.options).size, q.options.length, `${mod}#${i}: дубли вариантов`);
    });
  }
});

/* ── 3. форма супервизии ↔ course-data (сайт и бот не разъезжаются) ─────── */
test("CASE_FIELDS/CASES_REQUIRED сайта совпадают с course-data.json для бота", () => {
  const ctx = loadEsm("pages/js/case-form.js");
  const CASES_REQUIRED = vm.runInContext("CASES_REQUIRED", ctx);
  const CASE_FIELDS = vm.runInContext("CASE_FIELDS.map(f=>f.key)", ctx);
  const cd = require(path.join(ROOT, "functions/course-data.json"));
  assert.equal(CASES_REQUIRED, cd.casesRequired, "число обязательных случаев разошлось");
  const botKeys = cd.caseFields.map((f) => f.key || f);
  assert.deepEqual([...CASE_FIELDS], [...botKeys],
    "набор полей формы сайта ≠ набор полей бота (drift)");
});

test("missingFields/supervisionPassed: чистые функции формы", () => {
  const ctx = loadEsm("pages/js/case-form.js");
  vm.runInContext("var _mf = missingFields; var _sp = supervisionPassed;", ctx);
  const missingFields = vm.runInContext("missingFields", ctx);
  const supervisionPassed = vm.runInContext("supervisionPassed", ctx);
  // Пустые поля → не хватает всех.
  assert.equal(missingFields({}).length, vm.runInContext("CASE_FIELDS.length", ctx));
  // Достаточно длинный текст по всем полям → претензий нет.
  const CASE_FIELDS = vm.runInContext("CASE_FIELDS", ctx);
  const filled = {};
  for (const f of CASE_FIELDS) filled[f.key] = "х".repeat(f.min + 5);
  assert.equal(missingFields(filled).length, 0, "все поля заполнены — отправлять можно");
  // Допуск по числу принятых случаев.
  assert.equal(supervisionPassed({ supervision: { accepted: 2 } }), false);
  assert.equal(supervisionPassed({ supervision: { accepted: 3 } }), true);
  assert.equal(supervisionPassed({}), false);
});

/* ── 4. MODULE_INTRO: модалка «что внутри» есть у всех 12 ──────────────── */
test("MODULE_INTRO: у всех 12 модулей есть hook/learn/after на ru", () => {
  const ctx = loadEsm("pages/js/module-intro-data.js");
  const MODULE_INTRO = vm.runInContext("MODULE_INTRO", ctx);
  const ids = Object.keys(MODULE_INTRO).map(Number).sort((a, b) => a - b);
  assert.deepEqual([...ids], Array.from({ length: 12 }, (_, i) => i + 1),
    "настрой-модалка должна быть у каждого модуля");
  for (const id of ids) {
    const intro = MODULE_INTRO[id];
    assert.ok(intro.hook?.ru?.trim(), `М${id}: пустой hook.ru`);
    assert.ok(Array.isArray(intro.learn?.ru) && intro.learn.ru.length > 0, `М${id}: пустой learn.ru`);
    assert.ok(intro.after?.ru?.trim(), `М${id}: пустой after.ru`);
    intro.learn.ru.forEach((s, i) =>
      assert.ok(typeof s === "string" && s.trim(), `М${id}: learn.ru[${i}] пустой`));
  }
});

/* ── 5. задания: уникальность id и разрешение книг ─────────────────────── */
test("ASSIGNMENTS: id глобально уникальны; book → реальный файл (кроме модуля без книг)", () => {
  const cd = require(path.join(ROOT, "functions/course-data.json"));
  const seen = {};
  const problems = [];
  for (const [mod, arr] of Object.entries(cd.assignments)) {
    for (const a of arr) {
      if (seen[a.id]) problems.push(`дубль id ${a.id} (M${seen[a.id]} и M${mod})`);
      else seen[a.id] = mod;
      if (a.book) {
        const file = path.join(ROOT, a.book.replace(/^\//, ""));
        if (!fs.existsSync(file)) problems.push(`${a.id}: книга не найдена ${a.book}`);
      } else if (mod !== "12") {
        // Модуль 12 намеренно без книг (работа в программе). У остальных book обязателен.
        problems.push(`${a.id} (M${mod}): пустое поле book`);
      }
    }
  }
  assert.deepEqual([...problems], [], "проблемы в заданиях: " + problems.join("; "));
});

/* ── 6. withBase: базовый путь для GitHub Pages / домена / localhost ───── */
function readWithBase(host, pathname) {
  const src = read("pages/js/base-path.js").replace(/^export /gm, "");
  const ctx = vm.createContext({ location: { hostname: host, pathname } });
  const res = vm.runInContext(src + "\n;({ BASE_PATH, url: withBase('/content/x.md') })", ctx);
  return res;
}

test("withBase: проектный подкаталог github.io добавляет /repo", () => {
  const { BASE_PATH, url } = readWithBase("user.github.io", "/ruqiy-school/pages/book.html");
  assert.equal(BASE_PATH, "/ruqiy-school");
  assert.equal(url, "/ruqiy-school/content/x.md");
});
test("withBase: кастомный домен и localhost — без префикса", () => {
  assert.equal(readWithBase("ruqiy.example", "/pages/book.html").BASE_PATH, "");
  assert.equal(readWithBase("ruqiy.example", "/pages/book.html").url, "/content/x.md");
  assert.equal(readWithBase("localhost", "/index.html").BASE_PATH, "");
});

/* ── 7. согласованность билда: каждый урок покрыан поиском ─────────────── */
test("search-index покрывает каждый урок курса, и файл урока существует", () => {
  const cd = require(path.join(ROOT, "functions/course-data.json"));
  const si = require(path.join(ROOT, "content/search-index.json"));
  const indexed = new Set(si.entries.map((e) => e.d));
  const notFound = [];
  for (const m of cd.modules)
    for (const l of m.lessons || []) {
      if (l.doc && !indexed.has(l.doc)) notFound.push(l.doc);
      if (l.doc && !fs.existsSync(path.join(ROOT, l.doc.replace(/^\//, "")))) notFound.push("нет файла " + l.doc);
    }
  assert.deepEqual([...notFound], [], "некоторые уроки не в поиске / нет файла: " + notFound.join(", "));
});

/* ── 8. инлайновые данные карточек и словаря (живут прямо в HTML) ──────── */
function grabArray(src, name) {
  const s = src.indexOf(`const ${name} = [`);
  assert.ok(s >= 0, `${name} не найден в HTML`);
  let i = src.indexOf("[", s), depth = 0;
  for (; i < src.length; i++) {
    if (src[i] === "[") depth++;
    else if (src[i] === "]") { depth--; if (depth === 0) return src.slice(s, i + 1); }
  }
  throw new Error(`не найден конец массива ${name}`);
}

test("flashcards: карточки непустые, метка модуля в диапазоне 1..12", () => {
  const code = grabArray(read("pages/flashcards/index.html"), "CARDS");
  const CARDS = vm.runInNewContext(code + ";CARDS");
  assert.ok(CARDS.length > 0, "банк карточек пуст");
  for (const c of CARDS) {
    assert.ok(String(c.q || "").trim() && String(c.a || "").trim(), "карточка без вопроса/ответа");
    assert.ok(Number.isInteger(c.m) && c.m >= 1 && c.m <= 12, `карточка с module m=${c.m} вне 1..12`);
  }
});

test("glossary: термины с ru/en/uz, ссылки на модули в диапазоне", () => {
  const code = grabArray(read("pages/glossary/index.html"), "TERMS");
  const TERMS = vm.runInNewContext(code + ";TERMS");
  assert.ok(TERMS.length > 0, "словарь пуст");
  for (const t of TERMS) {
    assert.ok(t.ru?.trim() && t.en?.trim() && t.uz?.trim(), `термин ${t.translit || t.ar} без перевода`);
    if (Array.isArray(t.modules))
      for (const m of t.modules)
        assert.ok(Number.isInteger(m) && m >= 1 && m <= 12, `термин ${t.translit}: module ${m} вне 1..12`);
  }
});
