// node --test scripts/site-regressions.test.cjs
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const read = f => fs.readFileSync(path.join(__dirname, "..", f), "utf8");

for (const failure of ["network", "http"]) {
  test("поиск восстанавливается после ошибки " + failure, async () => {
    const html = read("pages/modules/index.html");
    const start = html.indexOf("    let searchIndex = null;");
    const end = html.indexOf("    function escapeHtml(s)", start);
    assert.ok(start >= 0 && end > start);
    let calls = 0;
    const data = { entries: [] };
    const ctx = vm.createContext({ Promise, console: { warn() {} }, withBase: s => s,
      fetch: async () => {
        calls++;
        if (calls === 1) {
          if (failure === "network") throw new Error("offline");
          return { ok: false };
        }
        return { ok: true, json: async () => data };
      },
    });
    vm.runInContext(html.slice(start, end), ctx, { timeout: 1000 });
    const first = ctx.loadSearchIndex();
    assert.equal(first, ctx.loadSearchIndex(), "один запрос для параллельных вызовов");
    assert.equal(await first, null);
    assert.equal(await ctx.loadSearchIndex(), data, "следующий вызов повторяет загрузку");
    assert.equal(await ctx.loadSearchIndex(), data, "успешный результат кешируется");
    assert.equal(calls, 2);
  });
}

test("quiz.saveOk переведён на все поддерживаемые языки", () => {
  const src = read("pages/js/i18n.js").replace(/\bexport\s+/g, "");
  for (const lang of ["ru", "en", "uz"]) {
    const ctx = vm.createContext({ localStorage: { getItem: () => lang } });
    vm.runInContext(src, ctx, { timeout: 1000 });
    assert.ok(ctx.t("quiz.saveOk") && ctx.t("quiz.saveOk") !== "quiz.saveOk", lang);
  }
});

test("поисковые заголовки не содержат HTML, арабский текст сохранён", () => {
  const src = read("scripts/build-search-index.mjs");
  const start = src.indexOf("function extractHeadings(md)");
  const end = src.indexOf("async function main()", start);
  assert.ok(start >= 0 && end > start);
  const ctx = vm.createContext({});
  vm.runInContext(src.slice(start, end), ctx, { timeout: 1000 });
  const headings = ctx.extractHeadings('## Заголовок <span lang="ar">الله</span>');
  assert.equal(headings[0].text, "Заголовок الله");
});

// ── Целостность реестра и контента (страж после аудита 2026-09-25) ──
// Эти проверки превращают разовый аудит в постоянный guard: они ловят
// осиротевшие файлы, битые ссылки, латинские буквы-опечатки в кириллице,
// ссылки реестра в несуществующие файлы и дубли заголовков уроков.
const ROOT = path.join(__dirname, "..");
const walkMd = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? walkMd(p) : p.endsWith(".md") ? [p] : [];
});
const toRel = (p) => "/" + path.relative(ROOT, p).split(path.sep).join("/");
const registrySrc = read("pages/js/modules-data.js");
const grabAll = (re) => { const a = []; let m; while ((m = re.exec(registrySrc))) a.push(m[1]); return a; };
const grabSet = (re) => [...new Set(grabAll(re))];
const docPaths = grabSet(/doc:\s*"(\/[^"]+)"/g);
const examPaths = grabSet(/exam:\s*"(\/[^"]+)"/g);
const coverPaths = grabSet(/cover:\s*"(\/[^"]+)"/g);
const videoPaths = grabSet(/intro_video:\s*"(\/[^"]+)"/g);
const existsPath = (p) => fs.existsSync(path.join(ROOT, p.replace(/^\//, "").replace(/\//g, path.sep)));
const contentMds = () => walkMd(path.join(ROOT, "content"));

test("реестр: каждый путь doc/exam/cover/intro_video ведёт к существующему файлу", () => {
  const missing = [...docPaths, ...examPaths, ...coverPaths, ...videoPaths].filter((p) => !existsPath(p));
  assert.deepEqual(missing, [], "ссылки в несуществующие файлы: " + missing.join(", "));
});

test("контент: нет осиротевших .md, не связанных ни одним модулем", () => {
  const referenced = new Set([...docPaths, ...examPaths]);
  const orphans = contentMds().map(toRel).filter((p) => !referenced.has(p));
  assert.deepEqual(orphans, [], "файлы вне реестра: " + orphans.join(", "));
});

test("орфография: в кириллических словах уроков нет латинских букв-опечаток", () => {
  const re = /[\u0400-\u04FF][A-Za-z][\u0400-\u04FF]/;
  const hits = [];
  for (const f of contentMds()) {
    fs.readFileSync(f, "utf8").split(/\r?\n/).forEach((ln, i) => { if (re.test(ln)) hits.push(`${toRel(f)}:${i + 1}`); });
  }
  assert.deepEqual(hits, [], "латиница внутри кириллического слова: " + hits.join(", "));
});

test("контент: внутренние ссылки ведут на существующие файлы", () => {
  const linkRe = /\]\((\/?[^\s)#]+)(?:#[^)]*)?\)/g;
  const broken = [];
  for (const f of contentMds()) {
    const text = fs.readFileSync(f, "utf8");
    let m;
    while ((m = linkRe.exec(text))) {
      const target = m[1];
      if (target === "" || /^https?:/.test(target)) continue;
      const local = target.startsWith("/")
        ? path.join(ROOT, target.replace(/^\//, "").replace(/\//g, path.sep))
        : path.join(path.dirname(f), target.replace(/\//g, path.sep));
      if (!fs.existsSync(local)) broken.push(`${toRel(f)} -> ${target}`);
    }
  }
  assert.deepEqual(broken, [], "битые внутренние ссылки: " + broken.join(", "));
});

test("реестр: заголовки уроков и модулей уникальны", () => {
  const seen = new Set(), dup = new Set();
  for (const t of grabAll(/title:\s*"([^"]+)"/g)) { if (seen.has(t)) dup.add(t); seen.add(t); }
  assert.deepEqual([...dup], [], "повторяющиеся заголовки: " + [...dup].join(" | "));
});
