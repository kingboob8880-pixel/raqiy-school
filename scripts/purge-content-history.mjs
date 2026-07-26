// Удаление полного текста курса из ВСЕЙ истории git. Кроссплатформенно —
// работает в обычной командной строке Windows, bash не нужен.
//
// Запуск: node scripts/purge-content-history.mjs
// Или двойным кликом по ЗАЩИТА-2-очистка-истории.bat в корне репозитория.
//
// ЗАЧЕМ
// -----
// scripts/seed-paid-content.mjs обрезает content/*.md до бесплатного отрывка,
// но это меняет только текущую версию. История остаётся, и полный текст
// достаётся одной командой:
//     git log --all -- content/module-8/prodvinutye-formuly.md
//     git show <старый-коммит>:content/module-8/prodvinutye-formuly.md
// Проверено 2026-07-25 на публичном репозитории: текст Модуля 8 вычитывался
// из старого коммита целиком.
//
// ПОЧЕМУ git filter-branch, А НЕ git-filter-repo
// ----------------------------------------------
// filter-repo быстрее, но это отдельный пакет на Python — на Windows его
// установка регулярно спотыкается о PATH и права. filter-branch встроен в
// сам git, ставить ничего не нужно. На 152 коммитах он отрабатывает за
// минуту-полторы — приемлемо для разовой операции.
//
// ЧТО ДЕЛАЕТ
//   1. Резервная копия репозитория (bundle — из него всё восстанавливается).
//   2. Вырезает content/ из всех коммитов истории.
//   3. Возвращает текущее (обрезанное) содержимое content/ одним коммитом.
//   4. Проверяет результат и НЕ пушит — force-push остаётся за человеком.
import { execSync, execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, readFileSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(ROOT);

const RED = "\x1b[31m", GREEN = "\x1b[32m", YELLOW = "\x1b[33m", DIM = "\x1b[2m", OFF = "\x1b[0m";
const say = (s = "") => console.log(s);
const fail = (msg) => { say(""); say(RED + "ОСТАНОВЛЕНО: " + msg + OFF); process.exit(1); };

function git(args, opts = {}) {
  // При подавленном stdout execFileSync возвращает null — без этой защиты
  // вызов .trim() падал бы на командах вроде `git bundle create`.
  const out = execFileSync("git", args, { encoding: "utf8", maxBuffer: 1024 * 1024 * 256, ...opts });
  return typeof out === "string" ? out.trim() : "";
}

function allFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const n of readdirSync(dir)) {
    const f = path.join(dir, n);
    statSync(f).isDirectory() ? allFiles(f, out) : out.push(f);
  }
  return out;
}

say("=== Очистка истории от полного текста курса ===");
say(DIM + "Репозиторий: " + ROOT + OFF);
say("");

// ── 0. Проверки ─────────────────────────────────────────────────────────
if (!existsSync(path.join(ROOT, ".git"))) fail("это не git-репозиторий.");

try { git(["--version"]); } catch { fail("git не найден. Установите Git для Windows: https://git-scm.com/download/win"); }

if (git(["status", "--porcelain"])) {
  say(RED + "Есть незакоммиченные изменения:" + OFF);
  say(git(["status", "--short"]));
  fail("сначала закоммитьте или отмените их.");
}

// Миграция должна быть уже выполнена, иначе вычищать нечего.
const contentDir = path.join(ROOT, "content");
const hasPreview = allFiles(contentDir)
  .filter((f) => f.endsWith(".md"))
  .some((f) => /^preview:\s*true\s*$/m.test(readFileSync(f, "utf8")));

if (!hasPreview) {
  say(RED + "Не вижу ни одного файла с меткой 'preview: true'." + OFF);
  say("");
  say("Похоже, миграция ещё не запускалась. Сначала выполните ШАГ 1:");
  say("  " + YELLOW + "ЗАЩИТА-1-миграция.bat" + OFF);
  say("");
  say("Без неё очистка истории бессмысленна — полный текст вернётся обратно");
  say("на шаге 3 (возврат текущего содержимого content/).");
  process.exit(1);
}

const remoteUrl = (() => { try { return git(["remote", "get-url", "origin"]); } catch { return ""; } })();
const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
const commitsBefore = Number(git(["rev-list", "--count", "HEAD"]));

// ── 1. Резервная копия ──────────────────────────────────────────────────
// slice(0,14), а не (0,15): в ISO-строке после секунд идёт точка перед
// миллисекундами, и она попадала в имя папки ("...162253.").
const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
const backupDir = path.join(os.homedir(), `raqiy-backup-${stamp}`);
say("[1/5] Резервная копия → " + backupDir);
mkdirSync(backupDir, { recursive: true });
const bundlePath = path.join(backupDir, "repo-full.bundle");
try {
  git(["bundle", "create", bundlePath, "--all"], { stdio: ["ignore", "ignore", "pipe"] });
} catch (e) {
  fail("не удалось сделать резервную копию: " + (e.stderr?.toString().trim() || e.message)
    + "\nБез копии продолжать нельзя — операция необратима.");
}
say(GREEN + "      сохранено." + OFF);
say(DIM + "      Восстановление: git clone \"" + bundlePath + "\" восстановленный" + OFF);
say("");

// ── 2. Запоминаем текущее содержимое content/ ───────────────────────────
say("[2/5] Сохраняю текущее содержимое content/ (отрывки + индекс поиска)");
const tmpContent = path.join(os.tmpdir(), `raqiy-content-${stamp}`);
cpSync(contentDir, tmpContent, { recursive: true });
say(DIM + `      файлов: ${allFiles(tmpContent).length}` + OFF);
say("");

// ── 3. Вырезаем content/ из истории ─────────────────────────────────────
say("[3/5] Вырезаю content/ из всех коммитов…");
say(DIM + `      ${commitsBefore} коммитов, это займёт около минуты` + OFF);
try {
  execSync(
    'git filter-branch --force --index-filter "git rm -r --cached --ignore-unmatch content" --prune-empty -- --all',
    { stdio: ["ignore", "ignore", "pipe"], env: { ...process.env, FILTER_BRANCH_SQUELCH_WARNING: "1" } },
  );
} catch (e) {
  fail("filter-branch не отработал: " + (e.stderr?.toString().slice(0, 400) || e.message));
}

// filter-branch оставляет старые ссылки в refs/original — пока они есть,
// прежние коммиты остаются достижимыми, и вычистка не считается.
try { git(["for-each-ref", "--format=%(refname)", "refs/original"]).split("\n").filter(Boolean)
  .forEach((r) => git(["update-ref", "-d", r])); } catch { /* уже нет */ }
try { git(["reflog", "expire", "--expire=now", "--all"]); } catch { /* нет reflog */ }
try { git(["gc", "--prune=now", "--aggressive"], { stdio: ["ignore", "ignore", "ignore"] }); } catch { /* не критично */ }

say(GREEN + `      готово. Коммитов: было ${commitsBefore}, стало ${git(["rev-list", "--count", "HEAD"])}` + OFF);
say("");

// ── 4. Возвращаем обрезанный content/ ───────────────────────────────────
say("[4/5] Возвращаю обрезанный content/ новым коммитом");
cpSync(tmpContent, contentDir, { recursive: true });
rmSync(tmpContent, { recursive: true, force: true });
git(["add", "content"]);
git(["commit", "-q", "-m", `content: только бесплатные отрывки (полный текст — в Firestore)

Полный текст книг перенесён в Firestore скриптом seed-paid-content.mjs и
отдаётся только оплатившим по правилам integration/firestore.rules. В
репозитории остаются отрывки с меткой preview: true и индекс поиска по
заголовкам.

История content/ вычищена: до этого полный текст доставался из старых
коммитов командой git show, и обрезка текущей версии его не закрывала.`]);
say(GREEN + "      закоммичено." + OFF);
say("");

// ── 5. Проверка ─────────────────────────────────────────────────────────
// Проверяем РАЗМЕРЫ, а не текстовые фразы. Поиск по фразам оказался
// негодным (проверено 2026-07-25): фразы из начала книги законно остаются
// в бесплатном отрывке, а ещё скрипт находил их в собственном исходнике.
//
// После очистки в истории должна остаться ровно одна версия каждого файла
// под content/ — та, что лежит сейчас. Любая версия заметно крупнее
// текущей = сохранившийся полный текст. Любой файл под content/, которого
// сейчас нет = удалённый (например, дубль), чей текст остался в истории.
say("[5/5] Проверка: сверяю размеры всех версий content/ в истории");

const currentSizes = new Map();
for (const f of allFiles(contentDir)) {
  const rel = path.relative(ROOT, f).split(path.sep).join("/");
  currentSizes.set(rel, statSync(f).size);
}

// batch-check вместо вызова git на каждый объект: и быстрее, и сразу даёт
// тип. Папки (tree) отсеиваем — rev-list --objects перечисляет и их, из-за
// чего проверка сначала ругалась на "content/audio" и прочие каталоги.
const candidates = [];
for (const line of git(["rev-list", "--objects", "--all"]).split("\n")) {
  const i = line.indexOf(" ");
  if (i < 0) continue;
  const name = line.slice(i + 1).trim();
  if (name.startsWith("content/")) candidates.push([line.slice(0, i), name]);
}

const info = new Map();
if (candidates.length) {
  const out = execFileSync("git", ["cat-file", "--batch-check"], {
    input: candidates.map(([sha]) => sha).join("\n"),
    encoding: "utf8", maxBuffer: 1024 * 1024 * 64,
  });
  out.split("\n").filter(Boolean).forEach((l) => {
    const [sha, type, size] = l.split(" ");
    info.set(sha, { type, size: Number(size) });
  });
}

const problems = [];
const seenBlobs = new Set();
for (const [sha, name] of candidates) {
  if (seenBlobs.has(sha)) continue;
  const meta = info.get(sha);
  if (!meta || meta.type !== "blob") continue;  // папки пропускаем
  seenBlobs.add(sha);
  const size = meta.size;

  if (!currentSizes.has(name)) {
    problems.push(`${name} — файла сейчас нет, но его версия (${size} Б) осталась в истории`);
  } else if (size > currentSizes.get(name) * 1.5) {
    problems.push(`${name} — в истории версия ${size} Б против нынешних ${currentSizes.get(name)} Б`);
  }
}

let leak = problems.length > 0;
if (leak) {
  for (const p of problems.slice(0, 12)) say(RED + "      ✗ " + p + OFF);
  if (problems.length > 12) say(RED + `      … и ещё ${problems.length - 12}` + OFF);
} else {
  say(GREEN + `      ✓ проверено версий: ${seenBlobs.size}. Ни одной крупнее текущей — полного текста в истории нет.` + OFF);
}

if (leak) {
  say("");
  say(RED + "ВНИМАНИЕ: в истории остались версии крупнее нынешних. НЕ отправляйте на GitHub." + OFF);
  say("");
  say("Обычные причины:");
  say("  1. Под content/ есть файлы, которых нет в modules-data.js — миграция");
  say("     их не обрезала. Удалите или добавьте в modules-data.js.");
  say("  2. Миграция прошла не для всех файлов — проверьте её вывод.");
  say("");
  say("Разберитесь и запустите заново. Резервная копия уже сделана:");
  say("  " + backupDir);
  process.exit(1);
}

say("");
say("================================================================");
say(GREEN + "Локально всё готово." + OFF + " Осталась отправка на GitHub — она " + RED + "НЕОБРАТИМА" + OFF + ".");
say("");
say("Сначала посмотрите сами:");
say("  " + DIM + "git log --oneline" + OFF + "        — история кода на месте");
say("  " + DIM + "git log --all --oneline -- content/" + OFF + "  — по content/ один коммит");
say("");
say("Когда убедитесь — отправьте:");
say("  " + YELLOW + `git push --force origin ${branch}` + OFF);
if (remoteUrl) say(DIM + "  (репозиторий: " + remoteUrl + ")" + OFF);
say("");
say("Резервная копия: " + backupDir);
say("================================================================");
