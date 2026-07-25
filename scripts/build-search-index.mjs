// Сборка индекса для поиска по содержанию курса.
//
// Запуск (из корня репозитория):
//   node scripts/build-search-index.mjs
// Результат: content/search-index.json — его надо закоммитить вместе с
// контентом. Перезапускать после правки заголовков в книгах.
//
// ЧТО ПОПАДАЕТ В ИНДЕКС И ПОЧЕМУ ИМЕННО ЭТО
// -----------------------------------------
// Только названия уроков и ЗАГОЛОВКИ внутри них — никакого текста книг.
// Причина не в размере файла, а в защите платного контента: сам индекс
// лежит в открытом репозитории, и если положить в него абзацы, он станет
// ровно той же дырой, что и открытые content/*.md (project.md §18/§22) —
// полный курс можно будет вычитать из одного JSON в обход оплаты.
//
// Заголовки в этих книгах описательные («ДЕЙСТВИЕ 2 — СЖИГАНИЕ», «Глава 5.
// Вопрос: нужна ли частица „ли“»), поэтому даже без тел абзацев поиск
// отвечает на главный вопрос ученика: «в какой книге про это написано».
// Названия уроков и так публичны — они выводятся на «Пути ученика».
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Достаём список уроков из modules-data.js, не импортируя его: файл — ES-модуль
 *  для браузера и тянет за собой i18n. Разбираем регулярками, источник правды
 *  всё равно один. */
async function readModules() {
  const src = await readFile(join(ROOT, "pages/js/modules-data.js"), "utf8");
  const chunks = src.split(/\n {2}\{\n {4}id: /).slice(1);
  const mods = [];
  for (const chunk of chunks) {
    const id = Number(chunk.match(/^(\d+)/)?.[1]);
    const title = chunk.match(/title:\s*"((?:[^"\\]|\\.)*)"/)?.[1];
    const doc = chunk.match(/\n {4}doc:\s*"([^"]+)"/)?.[1];
    const lessons = [...chunk.matchAll(/\{\s*title:\s*"((?:[^"\\]|\\.)*)",\s*doc:\s*"([^"]+)"/g)]
      .map((m) => ({ title: m[1], doc: m[2] }));
    if (id && title) mods.push({ id, title, doc, lessons });
  }
  return mods;
}

/** Заголовки уровня ##…#### из markdown. Убираем markdown-разметку внутри
 *  заголовка (**жирный**, `код`, ссылки) — в поиске она только мешает. */
function extractHeadings(md) {
  const body = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  const out = [];
  for (const line of body.split(/\r?\n/)) {
    const m = line.match(/^(#{2,4})\s+(.+?)\s*$/);
    if (!m) continue;
    const text = m[2]
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/\[(.*?)\]\([^)]*\)/g, "$1")
      .trim();
    if (text) out.push({ level: m[1].length, text });
  }
  return out;
}

async function main() {
  const mods = await readModules();
  const entries = [];
  let missing = 0;

  for (const mod of mods) {
    // Сам модуль (у части модулей его текст — это и есть весь материал)
    const docs = [];
    if (mod.doc) docs.push({ title: mod.title, doc: mod.doc, isModule: true });
    for (const l of mod.lessons) docs.push({ title: l.title, doc: l.doc, isModule: false });

    for (const d of docs) {
      let md;
      try {
        md = await readFile(join(ROOT, d.doc.replace(/^\//, "")), "utf8");
      } catch {
        console.warn(`  пропущен (нет файла): ${d.doc}`);
        missing++;
        continue;
      }
      const headings = extractHeadings(md);
      entries.push({
        t: d.title,          // название урока
        d: d.doc,            // путь к .md — по нему строится ссылка
        m: mod.id,           // номер модуля
        mt: mod.title,       // название модуля
        k: d.isModule ? 1 : 0, // 1 — текст модуля, 0 — отдельный урок-книга
        h: headings.map((h) => h.text),
      });
    }
  }

  const index = {
    // Версию читает клиент: если формат поменяется, старый кэш не подойдёт.
    v: 1,
    built: new Date().toISOString().slice(0, 10),
    entries,
  };

  const outPath = join(ROOT, "content/search-index.json");
  await writeFile(outPath, JSON.stringify(index), "utf8");

  const headings = entries.reduce((n, e) => n + e.h.length, 0);
  const kb = Buffer.byteLength(JSON.stringify(index)) / 1024;
  console.log(`Готово: ${entries.length} документов, ${headings} заголовков, ${kb.toFixed(0)} КБ`);
  console.log(`  → ${outPath}`);
  if (missing) console.log(`  файлов не найдено: ${missing}`);
  // Страховка от случайной утечки: тел абзацев в индексе быть не должно.
  const json = JSON.stringify(index);
  if (json.length > 900 * 1024) {
    console.warn("  ВНИМАНИЕ: индекс подозрительно большой — проверьте, что в него не попал текст книг");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
