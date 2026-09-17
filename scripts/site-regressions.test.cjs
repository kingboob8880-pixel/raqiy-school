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
