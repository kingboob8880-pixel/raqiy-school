// node --test scripts/personas-stress.test.cjs
//
// Стресс-тест курса через 10 персон студентов (протокол мультиперсонного
// тестирования). Каждая персона — отдельный сценарный test: не повторяет
// site-regressions (тот про целостность файлов), а проверяет ЖИЗНЬ В КУРСЕ:
// вход, замки, пейвол, языки, офлайн, экзамены, безопасность, выпуск.
//
// Персоны:
//   1. Новичок с нуля      — вход с лендинга, первая книга, оглавление
//   2. Нетерпеливый        — пытается перескочить порядок модулей
//   3. Платящий клиент     — купил: получает полный текст, не дыра
//   4. Приватист           — боится утечки данных и секретов
//   5. Узбекскоязычный     — UI без русского должен переводиться
//   6. Офлайн-ученик       — метро, просадка сети, PWA-оболочка
//   7. Тревожный отличник  — каждый экзамен честен и однозначен
//   8. Skeptic-медик       — безопасность: красные флаги и «к врачу»
//   9. Выгребщик мусора    — студент не должен видеть внутреннюю кухню
//  10. Выпускник-наставник — путь до сертификата и супервизии реальна
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const { test } = require("node:test");

const ROOT = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const walk = (dir, filter) => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p, filter);
    return filter(p) ? [p] : [];
  });
const advisories = [];
const note = (persona, msg) => advisories.push(`[${persona}] ${msg}`);

// ── Реестр курсов, исполненный в vm (импорты вычищаем, как в site-regressions) ──
// `const` в vm-скрипте не ложится на объект контекста, поэтому забираем
// нужные символы завершающим выражением — vm.runInContext возвращает его.
const registrySrc = read("pages/js/modules-data.js");
function runRegistry() {
  const ctx = vm.createContext({ console });
  return vm.runInContext(
    registrySrc.replace(/^import[^;]+;\s*$/gm, "").replace(/\bexport\s+/g, "") +
      "\n;({ MODULES, isModuleUnlocked, findNextLesson, bookKey });",
    ctx, { timeout: 2000 });
}
const __reg = runRegistry();
const MODULES = __reg.MODULES;
const ALL_LESSONS = MODULES.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleId: m.id })));
const examPaths = [...new Set(ALL_LESSONS.map((l) => l.exam).filter(Boolean))];
const docPaths = [...new Set(ALL_LESSONS.map((l) => l.doc))];

// ═══ 1. НОВИЧОК С НУЛЯ ═══
test("новичок: путь входа цел — лендинг, вход/регистрация, оглавления модулей", () => {
  const landing = read("index.html");
  const hrefs = [...landing.matchAll(/href="(\/[^"#]+|[^":\/\/#]+\.html)(?:#[^"]*)?"/g)].map((m) => m[1]);
  const broken = hrefs.filter((h) => {
    if (/^https?:/.test(h)) return false;
    const clean = h.replace(/^\//, "");
    return !(exists(clean) || exists(path.join("pages", clean)) || exists(path.join("public", clean)));
  });
  assert.deepEqual(broken, [], "битые ссылки входа с лендинга: " + broken.join(", "));
  // У новичка должен быть хотя бы один модуль уровня «Начальный», и у каждого
  // модуля — страница-оглавление, существующая на диске.
  assert.ok(MODULES.some((m) => m.level === "Начальный"), "нет ни одного начального модуля");
  const missingIdx = MODULES.filter((m) => m.doc && !exists(m.doc.slice(1)));
  assert.deepEqual([...missingIdx.map((m) => m.id)], [], "модули без оглавления: ");
  // Первая книга первой персоны course'а — с целью урока, чтобы новичок понимал «зачем».
  const firstDoc = docPaths[0];
  assert.match(read(firstDoc.slice(1)), /\*\*Цель урока\.\*\*/, "в первой книге нет блока «Цель урока»");
});

// ═══ 2. НЕТЕРПЕЛИВЫЙ ═══
test("нетерпеливый: перескочить порядок модулей и замок упражнений нельзя", () => {
  const { isModuleUnlocked, findNextLesson } = __reg;
  assert.equal(isModuleUnlocked(1, {}), true, "М1 должна быть открыта сразу");
  for (let id = 2; id <= 12; id++) {
    assert.equal(isModuleUnlocked(id, {}), false, `М${id} открыта без прогресса — обход порядка`);
  }
  // Прыжок: сдан только М1 → открыта ровно М2, М3 ещё заперта.
  const p1 = { 1: { status: "done" } };
  assert.equal(isModuleUnlocked(2, p1), true);
  assert.equal(isModuleUnlocked(3, p1), false);
  // Полное бездействие: «продолжить обучение» всегда ведёт в начало.
  const next = findNextLesson({});
  assert.ok(next && next.module.id === 1, "пустому прогрессу не на что указывать");
  // Замек на gate.js: gate обязан ссылаться на isModuleUnlocked (единственный замок).
  assert.match(read("pages/js/assignments-gate.js"), /isModuleUnlocked/, "assignments-gate обошёл единый замок");
});

// ═══ 3. ПЛАТЯЩИЙ КЛИЕНТ ═══
test("платящий клиент: пейвол на реальных правилах, а не на JS-стене", () => {
  const rules = read("integration/firestore.rules");
  // Текст платного контента читает только оплативший (или с fullAccess).
  assert.match(rules, /match \/content\/\{docId\}/, "нет правила на коллекцию content");
  assert.match(rules, /\.data\.paid == true/, "content не проверяет оплату");
  // Клиентская запись в content и feed закрыта полностью.
  assert.match(rules, /match \/content\/\{docId\}[\s\S]*?allow write: if false/, "content открыт для клиентской записи");
  assert.match(rules, /match \/feed\/\{entryId\}[\s\S]*?allow write: if false/, "feed открыт для клиентской записи");
  // Архив — даже для paid только админ.
  assert.match(rules, /isArchiveDoc\(docId\)/, "исключение архива исчезло из правил");
  // book.html реально дёргает Firestore для полного текста (иначе стена декоративная).
  assert.match(read("pages/book.html"), /getFullBookContent/, "book.html больше не читает полный текст из Firestore");
  // Сам seed-скрипт пишет через Admin SDK (иначе студент мог бы сеять свой контент).
  assert.match(read("scripts/seed-paid-content.mjs"), /initializeApp|applicationDefault|cert\(/, "seed-paid-content не через Admin SDK");
});

// ═══ 4. ПРИВАТИСТ ═══
test("приватист: в сборке нет секретов, чужие коллекции закрыты", () => {
  const banned = /adminsdk|serviceAccount|\.env(\.|$)|api\.txt|telegramBotToken|PREVIEW_TOKEN/i;
  const publicDir = path.join(ROOT, "public");
  const leaks = fs.existsSync(publicDir)
    ? walk(publicDir, () => true).map((p) => path.relative(ROOT, p).split(path.sep).join("/")).filter((f) => banned.test(f))
    : [];
  assert.deepEqual(leaks, [], "секреты в public/: " + leaks.join(", "));
  const rules = read("integration/firestore.rules");
  // Telegram-привязка и уведомления: клиент не читает и не фабрикует.
  assert.match(rules, /match \/tgUsers\/\{chatId\}[\s\S]*?allow read, write: if false/, "tgUsers открыт клиенту");
  assert.match(rules, /match \/notifications\/\{notifId\}[\s\S]*?allow create: if false/, "уведомления можно подделать с клиента");
  // Чужой профиль/переписку не прочитать и не прочитать чужие cases.
  assert.match(rules, /allow read: if isOwner\(uid\) \|\| isAdmin\(\);/, "профиль ученика шире, чем владелец+админ");
  // Билдер публичной части обязан останавливаться при находке секрета.
  assert.match(read("scripts/build-site.mjs"), /СБОРКА ОСТАНОВЛЕНА/, "build-site больше не блокирует выкладку секретов");
});

// ═══ 5. УЗБЕКСКОЯЗЫЧНЫЙ ═══
test("узбекскоязычный: каждый ключ UI переведён на все языки без дыр", () => {
  const src = read("pages/js/i18n.js").replace(/\bexport\s+/g, "");
  const ctx = vm.createContext({ localStorage: { getItem: () => "ru" } });
  const reg = vm.runInContext(src + "\n;({ LANGS, S, t });", ctx, { timeout: 2000 });
  const langs = [...reg.LANGS.map((l) => l.code)];
  assert.deepEqual(langs.sort(), ["en", "ru", "uz"], "состав языков изменился — проверить персон");
  const holes = [];
  for (const [key, entry] of Object.entries(reg.S)) {
    for (const lang of langs) {
      const v = entry[lang];
      if (!v || !v.trim()) holes.push(`${key}.${lang}`);
      else if (lang !== "ru" && /^[А-Яа-яЁё]/.test(v) && /[А-Яа-яЁё]{4,}/.test(v)) holes.push(`${key}.${lang} (рус. текст)`);
    }
  }
  assert.deepEqual(holes, [], "дыры в переводах: " + holes.slice(0, 10).join(", "));
  // t() возвращает сам ключ при пропуске — молчаливый fallback не допускается на видном месте.
  assert.ok(reg.t("nav.modules") !== "nav.modules", "t() не работает");
});

// ═══ 6. ОФЛАЙН-УЧЕНИК ═══
test("офлайн-ученик: оболочка PWA complete — кэшируемые файлы реальны", () => {
  const sw = read("sw.js");
  const shell = [...sw.matchAll(/^\s*["']([^"']+\.html|[^"']+\.png|[^"']+\.webmanifest)["'],?$/gm)].map((m) => m[1]);
  assert.ok(shell.includes("offline.html"), "offline.html выпал из SHELL-кеша");
  const missing = shell.filter((p) => !(exists(p) || exists(path.join("public", p))));
  assert.deepEqual(missing, [], "SHELL кэширует несуществующие файлы: " + missing.join(", "));
  // Оффлайн-страница не должна вести в дождливый цикл (только наружу).
  const offline = read("offline.html");
  assert.doesNotMatch(offline, /href=["']?\/?sw\.js|serviceWorker\.register/, "offline.html сам регистрирует SW (риск цикла)");
  // Все экранные пути реестра лежат и в собранном public/ (иначе 404 после деплоя).
  const notBuilt = [...docPaths, ...examPaths].filter((p) => !exists("public" + p));
  assert.deepEqual(notBuilt.slice(0, 5), [], "в public/ нет файлов реестра: " + notBuilt.slice(0, 5).join(", "));
});

// ═══ 7. ТРЕВОЖНЫЙ ОТЛИЧНИК ═══
test("отличник: каждый экзамен честен — 1 правильный, ≥2 дистрактора, ≥3 опций", () => {
  const bad = [];
  for (const rel of examPaths) {
    if (!exists(rel.slice(1))) { bad.push(`${rel}: файл отсутствует`); continue; }
    const text = read(rel.slice(1));
    const blocks = text.split(/^\d+\.\s+.+$/m).slice(1);
    const qCount = (text.match(/^\d+\.\s+/gm) || []).length;
    if (blocks.length !== qCount) bad.push(`${rel}: вопрос без блока опций`);
    blocks.forEach((b, i) => {
      const opts = [...b.matchAll(/^- \[( |x)\] (.+)$/gm)];
      const right = opts.filter((o) => o[1] === "x").length;
      if (opts.length < 3) bad.push(`${rel} Q${i + 1}: <3 опций`);
      if (right !== 1) bad.push(`${rel} Q${i + 1}: правильных=${right}`);
      if (opts.length - right < 2) bad.push(`${rel} Q${i + 1}: <2 дистракторов`);
    });
    const fmBook = (text.match(/^book:\s*"([^"]+)"/m) || [])[1];
    if (fmBook && !exists(fmBook.slice(1))) bad.push(`${rel}: book ведёт в никуда (${fmBook})`);
  }
  assert.deepEqual(bad, [], "нечестные экзамены: " + bad.slice(0, 8).join(" | "));
  // Порог сдачи в рамках здравого смысла (не 0 и не 100%).
  const cd = require("../functions/course-data.json");
  assert.ok(cd.passThreshold >= 0.6 && cd.passThreshold <= 0.9, "порог сдачи вне разумных границ");
  note("отличник", `экзаменов в реестре: ${examPaths.length}, уроков без экзамена: ${ALL_LESSONS.filter((l) => !l.exam).length}`);
});

// ═══ 8. SKEPTIC-МЕДИК ═══
test("медик: безопасность в диагностике — красные флаги и направление к специалисту", () => {
  const m4 = walk(path.join(ROOT, "content", "module-4"), (p) => p.endsWith(".md"));
  assert.ok(m4.length >= 3, "Модуль 4 (диагностика) подозрительно тонок");
  const withFlags = m4.filter((f) => /красны[йе][мх]? флаг|красны[ех]е флаг/i.test(fs.readFileSync(f, "utf8")));
  assert.ok(withFlags.length >= 2, "менее двух уроков диагностики про красные флаги");
  const any = m4.map((f) => fs.readFileSync(f, "utf8")).join("\n");
  assert.match(any, /психиатр|врач|медпомощ|скорой|специалист/i, "в диагностике нет ни одного указания на медицинскую помощь");
  // Кейс-форма супервизии обязана спрашивать красные флаги (курсы лечат, а не заменяют медицину).
  const cd = require("../functions/course-data.json");
  assert.ok(cd.caseFields.some((f) => /redFlags/i.test(f.key)), "в кейс-форме нет поля красных флагов");
  assert.ok(cd.caseFields.some((f) => /consent/i.test(f.key)), "в кейс-форме нет согласия пациента");
});

// ═══ 9. ВЫГРЕБЩИК МУСОРА ═══
test("аудитор: студент не видит внутреннюю кухню редактора", () => {
  const artifact = /project\.md\s*§|§\s*\d+[а-яa-z]?|TODO|FIXME|WAVE\s*\d|черновик волн|задача автора/i;
  const hits = [];
  for (const rel of docPaths) {
    const lines = read(rel.slice(1)).split(/\r?\n/);
    // Фронтматтер (source/status) — служебный, студенту не рендерится (markdown-loader
    // вырезает blockBetween front matter). Смотрим только тело урока.
    const bodyStart = lines[0] === "---" ? lines.indexOf("---", 1) + 1 : 0;
    lines.slice(bodyStart).forEach((ln, i) => { if (artifact.test(ln)) hits.push(`${rel}:${bodyStart + i + 1}`); });
  }
  assert.deepEqual(hits.slice(0, 10), [], "артефакты редакторства в теле уроков: " + hits.slice(0, 10).join(", ") + (hits.length > 10 ? ` …всего ${hits.length}` : ""));
});

// ═══ 10. ВЫПУСКНИК-НАСТАВНИК ═══
test("выпускник: путь до сертификата и супервизии физически существует", () => {
  assert.equal(MODULES.length, 12, "изменилось число модулей — правьте достижения вместе с реестром");
  assert.deepEqual([...MODULES.map((m) => m.id)], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], "номера модулей не подряд");
  assert.ok(MODULES.every((m) => m.status === "certified"), "немодули все certified — сверьтесь с решением автора");
  const gradles = ["pages/certificate/index.html", "pages/supervision/index.html", "pages/dashboard/student.html"];
  const gone = gradles.filter((p) => !exists(p));
  assert.deepEqual(gone, [], "страниц выпуска нет: " + gone.join(", "));
  // Допуск к практике: принимается только админом, порог кейсов > 0.
  const rules = read("integration/firestore.rules");
  assert.match(rules, /'supervision'/, "поле supervision перестало быть защищённым");
  const cd = require("../functions/course-data.json");
  assert.ok(cd.casesRequired >= 1, "порог кейсов обнулён");
  // Функции сервера выдают допуск по принятым разборам (не кнопка в браузере).
  assert.match(read("functions/index.js"), /supervision/, "серверная логика супервизии исчезла");
  note("выпускник", `порог: ${cd.casesRequired} принятых кейсов, порог сдачи ${Math.round(cd.passThreshold * 100)}%`);
});

// ── Итоговая панель наблюдений (не провал, а сигнал для человека) ──
test("персоны: сводка наблюдений", () => {
  if (advisories.length) console.log("\n📋 Наблюдения персон:\n" + advisories.map((a) => "   • " + a).join("\n"));
  else console.log("\n📋 Персоны не добавили наблюдений.");
});
