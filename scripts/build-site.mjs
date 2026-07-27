// Сборка папки public/ для Firebase Hosting.
//
// ПОЧЕМУ НЕ «ВЫЛОЖИТЬ КОРЕНЬ С ИСКЛЮЧЕНИЯМИ».
// В корне проекта лежат: ключ сервисного аккаунта Firebase
// (rukya-school-firebase-adminsdk-*.json), api.txt, project.md со всей
// внутренней кухней курса, папка «Методы» с рабочими методиками автора,
// tg/ с личной перепиской и всеми исходными PDF, .env со свежим токеном
// бота. Список «что НЕ выкладывать» пришлось бы поддерживать вручную, и
// один забытый файл означал бы публикацию ключа или методик.
//
// Поэтому здесь БЕЛЫЙ СПИСОК: копируется только то, что перечислено ниже.
// Не перечислено — не попадёт на сайт, даже если появится завтра.
//
// Плюс страховка: перед выкладкой папка проверяется на признаки секретов, и
// при находке сборка останавливается.
//
// Запуск:  node scripts/build-site.mjs
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public");

/** Что попадает на сайт. Всё остальное — нет. */
const INCLUDE_DIRS = [
  "pages",        // страницы и их скрипты
  "design",       // токены и стили
  "assets",       // картинки, иконки, обложки
  "content",      // тексты уроков (после миграции — только отрывки)
  "integration",  // firebase-config.js и клиентские хелперы
];

const INCLUDE_FILES = [
  "index.html",
  "404.html",
  "offline.html",
  "manifest.webmanifest",
  "sw.js",
];

/** Внутри разрешённых папок всё равно есть лишнее. */
const EXCLUDE_PATTERNS = [
  /^integration\/README\.md$/,        // внутренняя инструкция
  /^integration\/.*\.rules$/,         // правила доступа — не для браузера
  /\/\.DS_Store$/,
  /(^|\/)\.env/,
  /adminsdk/i,                        // ключи сервисного аккаунта
];

// Признаки секретов. Проверяем СОДЕРЖИМОЕ уже собранной папки: имя файла
// можно не угадать, а вот ключ внутри узнаётся по виду.
const SECRET_PATTERNS = [
  { re: /"type"\s*:\s*"service_account"/, what: "ключ сервисного аккаунта" },
  { re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, what: "приватный ключ" },
  { re: /\b\d{8,10}:[A-Za-z0-9_-]{30,}\b/, what: "токен Telegram-бота" },
];

function walk(dir, base = dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, base, out);
    else out.push(relative(base, full).split("\\").join("/"));
  }
  return out;
}

// ── собираем ────────────────────────────────────────────────────────────
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let copied = 0;
for (const d of INCLUDE_DIRS) {
  const src = join(ROOT, d);
  if (!existsSync(src)) { console.warn(`⚠️ нет папки ${d} — пропускаю`); continue; }
  for (const rel of walk(src)) {
    const key = `${d}/${rel}`;
    if (EXCLUDE_PATTERNS.some((re) => re.test(key))) continue;
    const dest = join(OUT, d, rel);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(join(src, rel), dest);
    copied += 1;
  }
}
for (const f of INCLUDE_FILES) {
  const src = join(ROOT, f);
  if (!existsSync(src)) { console.warn(`⚠️ нет файла ${f} — пропускаю`); continue; }
  cpSync(src, join(OUT, f));
  copied += 1;
}

// ── страховка: ищем секреты в том, что собрали ──────────────────────────
const found = [];
for (const rel of walk(OUT)) {
  const full = join(OUT, rel);
  if (statSync(full).size > 3 * 1024 * 1024) continue;   // картинки и видео не читаем
  let text;
  try { text = readFileSync(full, "utf8"); } catch { continue; }
  for (const { re, what } of SECRET_PATTERNS) {
    if (re.test(text)) found.push(`${rel} — похоже на ${what}`);
  }
}

if (found.length) {
  console.error("\n❌ СБОРКА ОСТАНОВЛЕНА: в папке public/ нашлись секреты\n");
  for (const f of found) console.error("   " + f);
  console.error("\nЭти файлы нельзя выкладывать. Уберите их или добавьте в EXCLUDE_PATTERNS.\n");
  rmSync(OUT, { recursive: true, force: true });
  process.exit(1);
}

console.log(`Готово: ${copied} файлов в public/`);
console.log("Секретов не найдено.");
