// Дымовой прогон module-скриптов всех страниц.
//
// ЗАЧЕМ. `node --check` проверяет только синтаксис. Ошибка вида «читаю
// const до его объявления» (временная мёртвая зона) синтаксически
// безупречна — падает она в рантайме, и падает молча: модуль умирает на
// первой строке, страница остаётся пустой, в интерфейсе ни слова.
//
// Ровно так 2026-07-26 «пропал» весь словарь: строка со счётчиком
// терминов читала TERMS на двадцать строк раньше его `const`. Внешне —
// пустая страница, в консоли — единственный ReferenceError, который никто
// не смотрит. Проверять глазами каждую страницу после каждой правки
// нереально, поэтому проверяет скрипт.
//
// КАК. Из каждой страницы вырезается <script type="module">, импорты
// заменяются заглушками, DOM подменяется прокси, который на любой запрос
// возвращает пустой элемент. Дальше код просто выполняется. Нас не
// интересует, что он нарисовал — интересует, дошёл ли он до конца, не
// бросив ReferenceError или TypeError.
//
// ЧЕГО ОН НЕ ЛОВИТ: вёрстку, стили, обращения к Firebase (они заглушены)
// и ошибки внутри обработчиков событий, которые в прогоне не срабатывают.
// Это проверка «страница вообще запускается», а не полноценный тест.
//
// Запуск:  node scripts/smoke-pages.mjs
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

// fileURLToPath, а не .pathname: на Windows .pathname даёт «/C:/Users/…»
// с ведущим слэшем, и fs такой путь не находит (исправлено 2026-07-27).
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PAGES = join(ROOT, "pages");

function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...htmlFiles(full));
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

/** Заглушка на всё: любое свойство — снова заглушка, любой вызов —
 *  заглушка, любое сравнение — пусто. Так код может звать что угодно из
 *  DOM и импортов, не падая на «cannot read property of null». */
function stub(name = "stub") {
  const fn = function () { return stub(name); };
  return new Proxy(fn, {
    get(_t, prop) {
      if (prop === Symbol.toPrimitive) return () => "";
      // .then()/.catch() выполняем СРАЗУ и синхронно, подсунув заглушку
      // вместо результата. Так проверяются и тела колбэков — а именно там
      // на страницах и живёт половина логики (загрузка книги, профиля,
      // списка учеников). Раньше `then` возвращал undefined, и первая же
      // цепочка промисов роняла прогон ложной ошибкой.
      if (prop === "then" || prop === "catch" || prop === "finally") {
        return (cb) => { if (typeof cb === "function") cb(stub(name)); return stub(name); };
      }
      if (prop === Symbol.iterator) return function* () {};
      if (prop === "length") return 0;
      if (prop === "textContent" || prop === "innerHTML" || prop === "value") return "";
      if (prop === "dataset" || prop === "style" || prop === "classList") return stub(prop);
      return stub(String(prop));
    },
    set() { return true; },
    apply() { return stub(name); },
    construct() { return stub(name); },
    has() { return true; },
  });
}

function makeSandbox() {
  const doc = stub("document");
  const g = {
    document: doc,
    console: { log() {}, warn() {}, error() {}, info() {} },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {}, key: () => null, length: 0 },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    // hostname/protocol нужны base-path.js: он смотрит, github.io это или
    // нет, чтобы понять, отдаётся сайт из подпапки репозитория или из корня.
    location: {
      href: "http://localhost/pages/x.html", search: "", pathname: "/pages/x.html", hash: "",
      hostname: "localhost", host: "localhost", protocol: "http:", origin: "http://localhost",
    },
    navigator: { language: "ru", userAgent: "node" },
    fetch: () => Promise.resolve({ ok: false, json: () => Promise.resolve(null), text: () => Promise.resolve("") }),
    setTimeout, clearTimeout, setInterval, clearInterval,
    requestAnimationFrame: (f) => { void f; return 0; },
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
    ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
    MutationObserver: class { observe() {} disconnect() {} },
    URLSearchParams,
    CustomEvent: class { constructor() {} },
    alert() {}, confirm: () => false,
    addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true,
    scrollTo() {}, scrollY: 0, innerWidth: 1280, innerHeight: 800,
    getComputedStyle: () => stub("style"),
    Intl, Date, Math, JSON, Promise, Set, Map, Object, Array, String, Number, Boolean, RegExp, Error,
  };
  g.window = g;
  g.globalThis = g;
  return g;
}

/** Импорты заменяем на заглушки. Разбираем ровно две формы, которые в
 *  проекте и встречаются: `import { a, b as c } from "..."` и
 *  `import * as ns from "..."`. */
function stripImports(code) {
  return code.replace(/^\s*import\s+([\s\S]*?)\s+from\s+["'][^"']+["'];?/gm, (_m, clause) => {
    const named = clause.match(/\{([\s\S]*?)\}/);
    if (named) {
      const names = named[1].split(",").map((n) => n.trim()).filter(Boolean)
        .map((n) => (n.includes(" as ") ? n.split(" as ")[1].trim() : n));
      return names.map((n) => `const ${n} = __stub("${n}");`).join(" ");
    }
    const ns = clause.match(/\*\s+as\s+(\w+)/);
    if (ns) return `const ${ns[1]} = __stub("${ns[1]}");`;
    const def = clause.trim().match(/^(\w+)$/);
    if (def) return `const ${def[1]} = __stub("${def[1]}");`;
    return "";
  });
}

let failed = 0;
let checked = 0;

for (const file of htmlFiles(PAGES)) {
  const html = readFileSync(file, "utf8");
  const blocks = [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (!blocks.length) continue;
  checked++;
  const code = stripImports(blocks.join("\n"));
  const sandbox = makeSandbox();
  sandbox.__stub = stub;
  try {
    vm.createContext(sandbox);
    // Обычная функция, НЕ async. Сначала здесь стояла async-обёртка — и
    // тест молча пропускал ровно ту ошибку, ради которой писался:
    // исключение внутри async становится отклонённым промисом, то есть
    // всплывает уже ПОСЛЕ возврата из runInContext, когда ловить его
    // некому. Проверено намеренным возвратом бага в словарь: тест сказал
    // «OK». Синхронная обёртка бросает сразу. Await верхнего уровня в
    // страницах не встречается (проверено по всем 15).
    new vm.Script(`(function () { ${code} })();`, { filename: file })
      .runInContext(sandbox, { timeout: 5000 });
    console.log("OK   " + relative(ROOT, file));
  } catch (e) {
    failed++;
    console.log("FAIL " + relative(ROOT, file));
    console.log("     " + String(e && e.message).split("\n")[0]);
  }
}

// ---------------------------------------------------------------------------
// ВТОРОЙ ПРОХОД: модули pages/js/*.js (добавлено 2026-07-27).
//
// Зачем понадобился. Первый проход выполняет только код, написанный прямо
// в странице, а все импорты подменяет заглушками — то есть сами модули не
// запускаются вовсе. Половина логики сайта живёт именно в них, и ошибка
// уровня «читаю const до объявления» внутри модуля прошла бы мимо теста
// незамеченной, хотя убивает страницу так же наглухо.
//
// Проверяется то же самое: доходит ли верхний уровень модуля до конца.
// Тела экспортированных функций не вызываются — для этого нужен настоящий
// DOM, которого здесь нет.
function stripExports(code) {
  return code
    .replace(/^\s*export\s+default\s+/gm, "const __default = ")
    .replace(/^\s*export\s+(?=(async\s+)?function|const|let|var|class)/gm, "")
    .replace(/^\s*export\s*\{[^}]*\}\s*;?/gm, "");
}

const JS_DIR = join(PAGES, "js");
let jsChecked = 0;
for (const name of readdirSync(JS_DIR).sort()) {
  if (!name.endsWith(".js")) continue;
  const file = join(JS_DIR, name);
  jsChecked++;
  const code = stripExports(stripImports(readFileSync(file, "utf8")));
  const sandbox = makeSandbox();
  sandbox.__stub = stub;
  try {
    vm.createContext(sandbox);
    new vm.Script(`(function () { ${code} })();`, { filename: file })
      .runInContext(sandbox, { timeout: 5000 });
    console.log("OK   " + relative(ROOT, file));
  } catch (e) {
    failed++;
    console.log("FAIL " + relative(ROOT, file));
    console.log("     " + String(e && e.message).split("\n")[0]);
  }
}

console.log(`\nПроверено страниц: ${checked}, модулей: ${jsChecked}, с ошибками: ${failed}`);
process.exit(failed ? 1 : 0);
