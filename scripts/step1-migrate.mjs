// ШАГ 1 — перенос полного текста книг в Firestore.
// Запускается из ЗАЩИТА-1-миграция.bat, можно и вручную:
//   node scripts/step1-migrate.mjs
//
// Весь диалог и весь русский текст живут ЗДЕСЬ, а не в .bat. Причина: cmd.exe
// разбирает .bat-файл побайтово в текущей кодировке, и если внутри файла
// встречается "chcp 65001" вместе с кириллицей, разбор сбивается — слова
// рвутся пополам и cmd пытается выполнить обрывки ("'ho' is not recognized"
// от echo). Проверено у автора 2026-07-25. Поэтому .bat остался чисто
// латинским, а всё общение с человеком — в Node, который с UTF-8 не путается.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import readline from "node:readline";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(ROOT);

const RED = "\x1b[31m", GREEN = "\x1b[32m", YELLOW = "\x1b[33m", DIM = "\x1b[2m", OFF = "\x1b[0m";
const say = (s = "") => console.log(s);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, (a) => res(a.trim())));

function bye(code = 0) { rl.close(); process.exit(code); }

say("============================================================");
say("  ШАГ 1 — Перенос полного текста книг в Firestore");
say("============================================================");
say("");
say("Что произойдёт:");
say("  " + DIM + "•" + OFF + " полный текст книг уйдёт в Firestore (доступ только оплатившим)");
say("  " + DIM + "•" + OFF + " в репозитории останутся бесплатные отрывки (примерно 12%)");
say("");

// ── Ключ сервисного аккаунта ────────────────────────────────────────────
say("Нужен закрытый ключ сервисного аккаунта Firebase — файл .json");
say(DIM + "Где взять: Firebase Console → Настройки проекта → Сервисные аккаунты" + OFF);
say(DIM + "           → «Создать закрытый ключ»" + OFF);
say("");
say("Перетащите файл ключа в это окно мышкой и нажмите Enter.");
say("");

let keyFile = await ask("Путь к ключу: ");
// Windows добавляет кавычки при перетаскивании, а PowerShell иногда одинарные
keyFile = keyFile.replace(/^["']|["']$/g, "").trim();

if (!keyFile) { say(""); say(RED + "Путь не указан. Ничего не изменено." + OFF); bye(1); }
if (!existsSync(keyFile)) { say(""); say(RED + "Файл не найден: " + keyFile + OFF); bye(1); }

// ── Ключ не должен лежать внутри репозитория ────────────────────────────
// Файл даёт полный доступ к проекту в обход правил Firestore. Внутри папки
// репозитория он рано или поздно уедет в публичный GitHub — достаточно
// одного "git add -A" в любой момент. Останавливаемся сразу.
const keyAbs = path.resolve(keyFile);
const rootAbs = path.resolve(ROOT);
if (keyAbs.startsWith(rootAbs + path.sep) || path.dirname(keyAbs) === rootAbs) {
  say("");
  say(RED + "ОПАСНО: ключ лежит внутри папки репозитория." + OFF);
  say("  " + keyAbs);
  say("");
  say("Этот файл даёт полный доступ к проекту Firebase в обход всех правил:");
  say("читать и стирать данные учеников, выгружать платный курс, менять права.");
  say("Внутри репозитория он рано или поздно попадёт в публичный GitHub.");
  say("");
  say(YELLOW + "Перенесите его наружу" + OFF + " — например, на Рабочий стол или в Документы,");
  say("и запустите заново, указав новый путь.");
  say("");
  say(DIM + "В .gitignore такие файлы уже внесены, но полагаться только на это" + OFF);
  say(DIM + "не стоит: правило легко обойти командой git add -f." + OFF);
  bye(1);
}

// ── Зависимости ─────────────────────────────────────────────────────────
if (!existsSync(path.join(ROOT, "scripts", "node_modules", "firebase-admin"))) {
  say("");
  say("Устанавливаю зависимости (один раз, займёт минуту)…");
  // npm на Windows — это npm.cmd, поэтому shell: true
  const r = spawnSync("npm", ["install"], { cwd: path.join(ROOT, "scripts"), stdio: "inherit", shell: true });
  if (r.status !== 0) {
    say("");
    say(RED + "npm install не отработал." + OFF);
    say("Проверьте, что установлен Node.js: https://nodejs.org");
    bye(1);
  }
}

const env = { ...process.env, GOOGLE_APPLICATION_CREDENTIALS: keyFile };

function runSeed(args) {
  return spawnSync(process.execPath, [path.join("scripts", "seed-paid-content.mjs"), ...args],
    { stdio: "inherit", env, cwd: ROOT });
}

// ── Сначала проверка без записи ─────────────────────────────────────────
say("");
say("============================================================");
say("  ПРОВЕРКА — ничего не меняется");
say("============================================================");
say("");
if (runSeed(["--dry-run"]).status !== 0) {
  say("");
  say(RED + "Проверка не прошла — смотрите сообщение выше. Ничего не изменено." + OFF);
  bye(1);
}

say("");
say("============================================================");
say("Выше — план переноса. " + GREEN + "Пока ничего не изменено." + OFF);
say("");
say("Дальше будет " + YELLOW + "реальная запись" + OFF + " в Firestore и обрезка файлов.");
say("============================================================");
say("");
const go = await ask('Продолжить? Напишите "да" и нажмите Enter: ');
if (go.toLowerCase() !== "да") { say(""); say("Отменено. Ничего не изменено."); bye(0); }

say("");
if (runSeed([]).status !== 0) {
  say("");
  say(RED + "Перенос не завершился. Смотрите сообщение выше." + OFF);
  bye(1);
}

// ── Коммит ──────────────────────────────────────────────────────────────
say("");
say("============================================================");
say(GREEN + "  Перенос выполнен" + OFF);
say("============================================================");
say("");
say("Осталось сохранить обрезанные файлы в репозиторий.");
say("");
const doCommit = await ask("Сделать это сейчас автоматически? (да/нет): ");

if (doCommit.toLowerCase() === "да") {
  try {
    // ТОЛЬКО content/ — не "git add -A".
    // Причина: закрытый ключ сервисного аккаунта часто лежит рядом, в папке
    // репозитория (автор так и сделал 2026-07-25). "git add -A" отправил бы
    // его в публичный репозиторий вместе с контентом — это компрометация
    // всего проекта, куда хуже открытого текста курса. Плюс так в коммит не
    // попадёт ничего постороннего, что случайно оказалось в папке.
    execFileSync("git", ["add", "content"], { stdio: "inherit" });
    execFileSync("git", ["commit", "-m", "Полный текст книг перенесён в Firestore"], { stdio: "inherit" });
    execFileSync("git", ["push"], { stdio: "inherit" });
    say("");
    say(GREEN + "Отправлено." + OFF);
    say("");
    say(YELLOW + "ТЕПЕРЬ ЗАПУСТИТЕ ШАГ 2: ЗАЩИТА-2-очистка-истории.bat" + OFF);
    say("Без него полный текст остаётся доступен из истории git.");
  } catch {
    say("");
    say(RED + "Отправка не прошла." + OFF + " Сделайте вручную:");
    say(DIM + "  git add -A" + OFF);
    say(DIM + '  git commit -m "Полный текст книг перенесён в Firestore"' + OFF);
    say(DIM + "  git push" + OFF);
  }
} else {
  say("");
  say("Хорошо. Сохраните вручную:");
  say(DIM + "  git add -A" + OFF);
  say(DIM + '  git commit -m "Полный текст книг перенесён в Firestore"' + OFF);
  say(DIM + "  git push" + OFF);
  say("");
  say("Потом запустите ШАГ 2: ЗАЩИТА-2-очистка-истории.bat");
}

say("");
bye(0);
