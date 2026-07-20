// Разовая миграция: переносит полный текст платных книг/модулей в Firestore
// (коллекция `content`, docId = bookKey()) и обрезает локальные content/*.md
// до бесплатного отрывка — той же длины, что сейчас режется в браузере
// (pages/js/markdown-loader.js#applyPaywall, ~12% верхнеуровневых блоков).
//
// Зачем: до этой миграции полный текст лежал открытым в content/*.md на
// GitHub — пейвол был визуальным (обрезка в браузере после загрузки), не
// реальным. Любой человек мог прочитать raw-файл на GitHub в обход оплаты
// (project.md §18/§22). После миграции полный текст отдаёт только Firestore
// по правилам integration/firestore.rules (оплатившим/админу), а в
// открытом репозитории остаётся только маленький бесплатный отрывок.
//
// Запуск (у автора курса, ЛОКАЛЬНО, не в этой песочнице — нужен Admin SDK
// доступ к продакшен-проекту rukya-school):
//   1. Firebase Console → Настройки проекта → Сервисные аккаунты →
//      "Создать закрытый ключ" → скачать JSON. НЕ коммитить этот файл.
//   2. cd scripts && npm install
//   3. GOOGLE_APPLICATION_CREDENTIALS=/путь/к/ключу.json node seed-paid-content.mjs --dry-run
//      — проверить план миграции без записи (ничего не меняет)
//   4. GOOGLE_APPLICATION_CREDENTIALS=/путь/к/ключу.json node seed-paid-content.mjs
//      — реальная запись в Firestore + обрезка локальных .md файлов
//   5. git add -A && git commit -m "Полный текст книг перенесён в Firestore" && git push

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");

function bookKey(docPath) {
  return docPath.replace(/[/.]/g, "_");
}

function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontMatterRaw: "", meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z_]+):\s*"?(.*?)"?\s*$/);
    if (m) meta[m[1]] = m[2];
  }
  return { frontMatterRaw: match[1], meta, body: match[2] };
}

// Приближение того же деления на "верхнеуровневые блоки", что делает marked.js
// в браузере (applyPaywall режет по .children верхнего уровня): разделяем по
// пустым строкам и по началу заголовка (# ...), не трогая списки/таблицы
// внутри одного блока без пустых строк — они станут одним <ul>/<table> узлом,
// как и при рендере marked.
function splitBlocks(body) {
  const lines = body.split(/\r?\n/);
  const blocks = [];
  let current = [];
  const flush = () => { if (current.length) { blocks.push(current.join("\n").trim()); current = []; } };
  for (const line of lines) {
    if (/^#{1,6}\s/.test(line) && current.length) flush();
    if (line.trim() === "") { flush(); continue; }
    current.push(line);
  }
  flush();
  return blocks.filter(Boolean);
}

// Тот же docPath-список, что MODULES в pages/js/modules-data.js (m.doc для
// каждого модуля + l.doc для каждого урока) + архив, который тоже за
// пейволом (book.html?doc=/content/archive/index.md, раздел "Архив" в шапке).
async function collectProtectedDocs() {
  const modulesDataPath = path.join(REPO_ROOT, "pages/js/modules-data.js");
  const src = readFileSync(modulesDataPath, "utf8");
  // Не импортируем файл напрямую (он написан для браузера, но не использует
  // браузерных API — импорт сработал бы, но регэксп-парсинг надёжнее не
  // зависеть от синтаксиса модуля при будущих правках файла).
  const docs = new Set([...src.matchAll(/doc:\s*"([^"]+)"/g)].map((m) => m[1]));
  docs.add("/content/archive/index.md");
  return [...docs];
}

async function main() {
  const protectedDocs = await collectProtectedDocs();
  console.log(`Найдено ${protectedDocs.length} защищённых документов.`);

  let app;
  if (!DRY_RUN) {
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!credPath) {
      console.error("Нужен сервисный ключ: GOOGLE_APPLICATION_CREDENTIALS=/путь/к/ключу.json node seed-paid-content.mjs");
      console.error("Или запустите с --dry-run, чтобы проверить план без записи.");
      process.exit(1);
    }
    app = initializeApp({ credential: applicationDefault() });
  }
  const db = DRY_RUN ? null : getFirestore(app);

  let migrated = 0;
  let skippedTooShort = 0;
  let alreadyShort = 0;

  for (const docPath of protectedDocs) {
    const filePath = path.join(REPO_ROOT, docPath.replace(/^\//, ""));
    let raw;
    try {
      raw = readFileSync(filePath, "utf8");
    } catch (err) {
      console.warn(`  [пропуск] ${docPath} — файл не найден: ${err.message}`);
      continue;
    }
    const { frontMatterRaw, meta, body } = parseFrontMatter(raw);
    const blocks = splitBlocks(body);

    // Та же граница, что applyPaywall() в браузере: если блоков <=1, резать
    // нечего — текст и так весь бесплатный, в Firestore дублировать незачем.
    if (blocks.length <= 1) {
      skippedTooShort++;
      console.log(`  [без изменений] ${docPath} — всего ${blocks.length} блок(ов), пейвол и так не режет`);
      continue;
    }
    const cutIndex = Math.max(1, Math.ceil(blocks.length * 0.12));
    if (cutIndex >= blocks.length) {
      alreadyShort++;
      console.log(`  [без изменений] ${docPath} — отрывок 12% покрывает весь текст`);
      continue;
    }

    const preview = blocks.slice(0, cutIndex).join("\n\n");
    const id = bookKey(docPath);

    console.log(`  [миграция] ${docPath} → content/${id} (${blocks.length} блоков, отрывок оставляет ${cutIndex})`);

    if (!DRY_RUN) {
      await db.collection("content").doc(id).set({
        body,
        meta,
        sourceDoc: docPath,
        updatedAt: FieldValue.serverTimestamp(),
      });
      const newRaw = `---\n${frontMatterRaw}\n---\n${preview}\n`;
      writeFileSync(filePath, newRaw, "utf8");
    }
    migrated++;
  }

  console.log("");
  console.log(`Итог: мигрировано ${migrated}, без изменений (короткие) ${skippedTooShort + alreadyShort}.`);
  if (DRY_RUN) {
    console.log("Это был --dry-run — ничего не записано и не изменено. Запустите без --dry-run, чтобы применить.");
  } else {
    console.log("Готово. Теперь: git add -A && git commit -m \"Полный текст книг перенесён в Firestore\" && git push");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
