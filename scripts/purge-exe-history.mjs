// Удаление установщика RUKYA PRO из ИСТОРИИ гита.
//
// ЗАЧЕМ. assets/downloads/RUKYA-PRO-Setup-1.0.0.exe весит ~87 МБ при
// жёстком пределе GitHub 100 МБ на файл. Каждый клон репозитория тянет эти
// 87 МБ (именно на этом 2026-07-26 закончилось место в рабочей песочнице), а
// каждое скачивание учеником расходовало трафик GitHub Pages.
//
// Программу теперь присылает лекарь лично в Telegram, файл с сайта убран.
// Но удаление из папки НЕ ДЕЛАЕТ РЕПОЗИТОРИЙ ЛЕГЧЕ: файл остаётся во всех
// прошлых коммитах. Полегчает только после перезаписи истории — этим и
// занимается скрипт.
//
// ЧТО ОН ДЕЛАЕТ:
//   1. Проверяет, что рабочая копия чистая и что мы в нужном репозитории.
//   2. Делает резервную копию папки .git рядом с проектом.
//   3. Проходит по всей истории и вычищает файл из каждого коммита
//      (git filter-branch --index-filter).
//   4. Сбрасывает служебные ссылки, чистит мусор, сжимает репозиторий.
//   5. Сравнивает размер до и после и печатает результат.
//
// ЧЕГО ОН НЕ ДЕЛАЕТ: не пушит. Историю перезаписывать на сервере — это
// git push --force, и такую команду скрипт за автора не решает. Команду он
// печатает в конце, отправлять — вручную.
//
// ПОСЛЕДСТВИЯ ПЕРЕЗАПИСИ: у всех коммитов меняются хеши. Если репозиторий
// склонирован куда-то ещё, там придётся сделать свежий клон — обычный
// git pull после перезаписи истории не сработает.
//
// git filter-branch, а не git-filter-repo: последний надо ставить отдельно
// (Python-пакет), и на Windows установка регулярно спотыкается. filter-branch
// встроен в сам git, работает всюду, где есть git — ценой скорости, но на
// репозитории такого размера это минуты.
import { execFileSync } from "node:child_process";
import { existsSync, cpSync, rmSync, statSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const TARGET = "assets/downloads/RUKYA-PRO-Setup-1.0.0.exe";
const ROOT = resolve(process.cwd());

function git(args, opts = {}) {
  // encoding обязателен: без него execFileSync отдаёт Buffer, и .trim()
  // падает на нём — эта ошибка уже ловилась в прошлом скрипте очистки.
  return String(execFileSync("git", args, { cwd: ROOT, encoding: "utf8", ...opts }) || "").trim();
}

function dirSize(dir) {
  let total = 0;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    total += st.isDirectory() ? dirSize(full) : st.size;
  }
  return total;
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1) + " МБ";

function fail(msg) {
  console.error("\n[ОСТАНОВЛЕНО] " + msg + "\n");
  process.exit(1);
}

console.log("=== Очистка истории от установщика RUKYA PRO ===\n");

// 1. Проверки. Дешевле остановиться сейчас, чем разбирать последствия потом.
if (!existsSync(join(ROOT, ".git"))) fail("Здесь нет папки .git. Запускайте скрипт из корня проекта Raqiy.");

const status = git(["status", "--porcelain"]);
if (status) {
  console.error(status);
  fail("В рабочей копии есть несохранённые изменения. Сначала закоммитьте или отмените их —\n" +
       "перезапись истории поверх незакоммиченных правок может их потерять.");
}

const inHistory = git(["log", "--oneline", "--all", "--", TARGET]);
if (!inHistory) {
  console.log("Файла " + TARGET + " в истории нет — чистить нечего.");
  console.log("Возможно, история уже очищена. Ничего не меняю.");
  process.exit(0);
}
const commitsWithFile = inHistory.split("\n").length;
console.log("Файл найден в " + commitsWithFile + " коммитах.");

const sizeBefore = dirSize(join(ROOT, ".git"));
console.log("Размер .git до очистки: " + mb(sizeBefore) + "\n");

// 2. Резервная копия. Перезапись истории необратима, поэтому копия делается
//    ВСЕГДА и проверяется на существование — молча пропустить её нельзя.
const backup = join(ROOT, "..", "Raqiy-git-backup-" + new Date().toISOString().slice(0, 10).replace(/-/g, ""));
if (existsSync(backup)) rmSync(backup, { recursive: true, force: true });
console.log("Делаю резервную копию .git → " + backup);
cpSync(join(ROOT, ".git"), backup, { recursive: true });
if (!existsSync(join(backup, "HEAD"))) fail("Резервная копия не создалась. Без неё дальше не иду.");
console.log("Копия на месте.\n");

// 3. Перезапись истории.
console.log("Прохожу по всей истории. Это займёт минуты, окно не закрывайте…\n");
try {
  git(["filter-branch", "--force", "--index-filter",
       `git rm --cached --ignore-unmatch "${TARGET}"`,
       "--prune-empty", "--tag-name-filter", "cat", "--", "--all"],
      { stdio: ["ignore", "inherit", "inherit"], env: { ...process.env, FILTER_BRANCH_SQUELCH_WARNING: "1" } });
} catch {
  fail("filter-branch завершился ошибкой. История НЕ изменена (или изменена частично).\n" +
       "Восстановить: удалите папку .git и переименуйте в .git копию " + backup);
}

// 4. Уборка. Без неё старые объекты остаются в репозитории и размер не
//    меняется вообще — самая частая причина «почистил, а легче не стало».
console.log("\nЧищу служебные ссылки и сжимаю репозиторий…");
try { rmSync(join(ROOT, ".git", "refs", "original"), { recursive: true, force: true }); } catch { /* могло не создаться */ }
try { git(["reflog", "expire", "--expire=now", "--all"]); } catch { /* не критично */ }
git(["gc", "--prune=now", "--aggressive"], { stdio: ["ignore", "inherit", "inherit"] });

// 5. Проверка результата — по РАЗМЕРУ, а не по «файл больше не находится».
//    Проверка поиском однажды уже дала ложный успех: находился текст самого
//    скрипта очистки, а не то, что чистили.
const sizeAfter = dirSize(join(ROOT, ".git"));
const stillThere = git(["log", "--oneline", "--all", "--", TARGET]);

console.log("\n=== Результат ===");
console.log("Размер .git до:    " + mb(sizeBefore));
console.log("Размер .git после: " + mb(sizeAfter));
console.log("Освободилось:      " + mb(sizeBefore - sizeAfter));
console.log("Коммитов с файлом: " + (stillThere ? stillThere.split("\n").length : 0));

if (stillThere) {
  fail("Файл всё ещё встречается в истории. Резервная копия здесь: " + backup);
}
if (sizeAfter > sizeBefore * 0.8) {
  console.log("\n[ВНИМАНИЕ] Размер почти не изменился. Файл из истории убран, но объекты");
  console.log("могли остаться в упаковке. Попробуйте ещё раз: git gc --prune=now --aggressive");
}

console.log("\nГотово. История перезаписана ЛОКАЛЬНО.");
console.log("\nЧтобы отправить на GitHub, выполните вручную:");
console.log("    git push --force origin main");
console.log("\nПосле этого у всех коммитов новые хеши. Если репозиторий склонирован");
console.log("куда-то ещё — там нужен свежий клон, обычный git pull не сработает.");
console.log("\nРезервная копия .git: " + backup);
console.log("Удалите её, когда убедитесь, что сайт работает.\n");
