// node --test scripts/course-audit.test.cjs
// Страж после глубокого аудита курса 2026-09-29. Оси:
//  A) ?v-версии: одно имя js-файла = одна версия во всех ссылках;
//  B) все t("ключ") из кода определены в словаре i18n и непусты во всех языках;
//  C) «Модуль N «Название»» в текстах уроков совпадает с реестром;
//  D) квизы без дублей вопросов/вариантов; карты STEPS/COUNTERS/INTENTS без мёртвых id;
//  F) ссылки content/**/index.md ведут в реестр и на существующие файлы;
//  G) front-matter module:N равен номеру папки module-N;
//  K) строгое правило смешанного письма (латиница внутри кириллицы) в контенте и коде.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const { test } = require("node:test");

const ROOT = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const walk = (dir, re, out = []) => {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const p = dir + "/" + e.name;
    if (e.isDirectory()) walk(p, re, out);
    else if (re.test(e.name)) out.push(p);
  }
  return out;
};
const norm = (s) => String(s).toLowerCase().replace(/[«”"'\-–—…]/g, " ").replace(/\s+/g, " ").trim();
const runModule = (file, exports_) =>
  vm.runInContext(read(file).replace(/\bexport\s+/g, "") + `;({${exports_}});`, vm.createContext({}), { timeout: 2000 });

const siteFiles = [...walk("pages", /\.(html|js)$/), ...walk("integration", /\.(html|js)$/), "index.html"];

test("A) кэш-буст: у каждого js-файла ровно одна ?v через все ссылки", () => {
  const vers = {};
  for (const f of siteFiles)
    for (const m of read(f).matchAll(/([\w.-]+\.js)\?v=(\d+)/g)) (vers[m[1]] ||= new Set()).add(m[2]);
  const mixed = Object.entries(vers).filter(([, set]) => set.size > 1).map(([n, s]) => n + ": " + [...s].join(","));
  assert.ok(Object.keys(vers).length > 10, "не найдены ссылки ?v — изменился формат?");
  assert.deepEqual(mixed, [], "разные версии одного файла: " + mixed.join(" | "));
});

test("B) все используемые t(\"ключ\") определены и непусты во всех языках", () => {
  const i18nSrc = read("pages/js/i18n.js").replace(/\bexport\s+/g, "");
  const reg = vm.runInContext(i18nSrc + "\n;({ S, LANGS });", vm.createContext({ localStorage: { getItem: () => "ru" } }), { timeout: 2000 });
  const dictKeys = new Set(Object.keys(reg.S));
  const missing = new Set();
  let usedCount = 0;
  for (const f of siteFiles)
    for (const m of read(f).matchAll(/\bt\(\s*["']([a-z0-9]+(?:\.[a-z0-9]+)+)["']/gi))
      if (!dictKeys.has(m[1])) missing.add(m[1] + " (" + f + ")"); else usedCount++;
  assert.equal(missing.size, 0, "неопределённые ключи: " + [...missing].join(", "));
  assert.ok(usedCount > 200, "слишком мало использований t() —regex сломался?");
  const codes = reg.LANGS.map((x) => x.code);
  const empty = [];
  for (const [key, entry] of Object.entries(reg.S))
    for (const l of codes) if (!String(entry[l] ?? "").trim()) empty.push(key + "." + l);
  assert.deepEqual(empty, [], "пустые переводы: " + empty.join(", "));
});

test("C) отсылки «Модуль N «Название»» в контенте соответствуют реестру", () => {
  const md = read("pages/js/modules-data.js");
  const arrStart = md.indexOf("export const MODULES = [") + "export const MODULES = ".length;
  const MODULES = vm.runInContext(md.slice(arrStart, findArrayEnd(md, arrStart)) + ";", vm.createContext({}), { timeout: 2000 });
  const titleByNum = {};
  MODULES.forEach((m, i) => (titleByNum[i + 1] = m.title));
  const bad = [];
  for (const f of walk("content", /\.md$/)) {
    if (f.includes("/exams/")) continue;
    const s = read(f).replace(/^---[\s\S]*?^---/m, ""); // front-matter: кавычки ломают regex
    for (const m of s.matchAll(/[Мм]одул(?:ь|я|е|ей)\s*(\d{1,2})\s*[«"]([^»"]{3,60})[»"]/g)) {
      const real = titleByNum[+m[1]];
      if (real === undefined) { bad.push(`${f}: Модуль ${m[1]} не существует`); continue; }
      const a = norm(m[2]), b = norm(real);
      if (!(a === b || a.includes(b.slice(0, 20)) || b.includes(a.slice(0, 20))))
        bad.push(`${f}: «${m[2]}» против реестра «${real}»`);
    }
  }
  assert.deepEqual(bad, [], "несовпадения названий модулей: " + bad.join(" | "));
});
function findArrayEnd(src, from) {
  let depth = 0;
  for (let i = from; i < src.length; i++) {
    const c = src[i];
    if (c === "[") depth++;
    else if (c === "]") { depth--; if (!depth) return i + 1; }
    else if (c === '"' || c === "'") { const q = c; i++; while (i < src.length && src[i] !== q) { if (src[i] === "\\") i++; i++; } }
  }
  return -1;
}

test("D1) квизы: нет дублей вопросов внутри модуля и дублей вариантов внутри вопроса", () => {
  const { QUIZZES } = runModule("pages/js/quiz-data.js", "QUIZZES");
  const dup = [];
  for (const [mod, arr] of Object.entries(QUIZZES)) {
    const seenQ = new Map();
    arr.forEach((qq, i) => {
      const kq = norm(qq.q);
      if (seenQ.has(kq)) dup.push(`квиз ${mod}: вопрос «${qq.q.slice(0, 40)}» дублирует №${seenQ.get(kq) + 1}`);
      else seenQ.set(kq, i);
      const opts = (qq.options || []).map(norm);
      if (new Set(opts).size !== opts.length) dup.push(`квиз ${mod} вопрос №${i + 1}: дубль варианта`);
    });
  }
  assert.deepEqual(dup, [], dup.join(" | "));
});

test("D2) карты заданий STEPS/COUNTERS/INTENTS: каждый id существует в ASSIGNMENTS", () => {
  const { ASSIGNMENTS, STEPS, COUNTERS, INTENTS } = runModule("pages/js/assignments-data.js", "ASSIGNMENTS, STEPS, COUNTERS, INTENTS");
  const allIds = new Set(Object.values(ASSIGNMENTS).flat().map((a) => a.id));
  assert.ok(allIds.size > 50, "слишком мало заданий — формат изменился?");
  const dead = [];
  for (const [name, map] of [["STEPS", STEPS], ["COUNTERS", COUNTERS], ["INTENTS", INTENTS]])
    for (const id of Object.keys(map || {})) if (!allIds.has(id)) dead.push(`${name}: ${id}`);
  assert.deepEqual(dead, [], "мёртвые id в картах: " + dead.join(", "));
});

test("F) ссылки content/**/index.md ведут на уроки реестра и существующие файлы", () => {
  const registrySrc = read("pages/js/modules-data.js");
  const referenced = new Set();
  for (const m of registrySrc.matchAll(/(?:doc|exam|cover|intro_video):\s*"(\/[^"]+)"/g)) referenced.add(m[1]);
  const bad = [];
  for (const f of walk("content", /^index\.md$/)) {
    const s = read(f);
    for (const m of s.matchAll(/\]\((\/content\/[^)\s#]+)/g)) {
      const rel = m[1];
      const disk = path.join(ROOT, rel.slice(1).replace(/\//g, path.sep));
      if (!fs.existsSync(disk)) bad.push(`${f} -> ${rel}: файла нет`);
      else if (rel.endsWith(".md") && !rel.endsWith("/index.md") && !referenced.has(rel)) bad.push(`${f} -> ${rel}: вне реестра`);
    }
  }
  assert.deepEqual(bad, [], "битые/вне-реестровые ссылки индексов: " + bad.join(" | "));
});

test("G) front-matter module:N совпадает с номером папки module-N", () => {
  const bad = [];
  for (const f of walk("content", /\.md$/)) {
    const m = read(f).match(/^---[\s\S]*?^module:\s*(\d+)[\s\S]*?^---/m);
    if (!m) continue;
    const folder = f.match(/content\/module-(\d+)\//);
    if (folder && Number(m[1]) !== Number(folder[1])) bad.push(`${f}: module: ${m[1]}, папка module-${folder[1]}`);
  }
  assert.deepEqual(bad, [], "front-matter против папки: " + bad.join(" | "));
});

// Строгое правило: в слове без дефисов минимум 2 латинских и 1 кириллическая
// (или 2 кириллических и 1 латинская) — это опечатка обмена раскладкой.
const LAT = /[A-Za-z]/, CYR = /[\u0430-\u044F\u0451\u0410-\u042F\u0401]/, CYR_G = /[\u0430-\u044F\u0451\u0410-\u042F\u0401]/g;
function mixedTokens(text) {
  const out = [];
  for (const line of text.split(/\r?\n/))
    for (const tok of line.split(/[^\p{L}]+/u)) {
      if (!tok || tok.includes("-") || !CYR.test(tok) || !LAT.test(tok)) continue;
      const c = (tok.match(CYR_G) || []).length, l = tok.length - c;
      if ((l >= 2 && c >= 1) || (c >= 2 && l >= 1)) out.push(tok);
    }
  return out;
}

test("K1) контент: в кириллических словах нет латинских вкраплений (строгое правило)", () => {
  const hits = [];
  for (const f of walk("content", /\.md$/)) {
    const s = read(f).replace(/^---[\s\S]*?^---/m, "");
    for (const tok of mixedTokens(s)) hits.push(`${f}: ${tok}`);
  }
  assert.deepEqual(hits, [], "смешанное письмо в контенте: " + hits.join(", "));
});

test("K2) код страниц: смешанное письмо только в белом списке технических терминов", () => {
  const WHITELIST = new Set([
    "a-zа-яё", "wа-яА-ЯёЁ", "А-ЯёЁ", // классы символов в регулярках
  ]);
  const hits = [];
  for (const f of siteFiles) {
    if (!/\.js$|\.html$/.test(f)) continue;
    for (const tok of mixedTokens(read(f)))
      if (!WHITELIST.has(tok)) hits.push(`${f}: ${tok}`);
  }
  assert.deepEqual(hits, [], "подозрение на опечатку раскладки в коде: " + hits.join(", "));
});
