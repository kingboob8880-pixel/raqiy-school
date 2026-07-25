// ШАГ 2 — очистка истории git от полного текста.
// Запускается из ЗАЩИТА-2-очистка-истории.bat, можно и вручную:
//   node scripts/step2-purge.mjs
//
// Здесь только объяснение и подтверждение; сама работа — в
// purge-content-history.mjs. Разделено потому, что тот скрипт должен
// оставаться запускаемым и без диалога (например, из другого сценария).
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import readline from "node:readline";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(ROOT);

const RED = "\x1b[31m", DIM = "\x1b[2m", OFF = "\x1b[0m";
const say = (s = "") => console.log(s);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, (a) => res(a.trim())));

say("============================================================");
say("  ШАГ 2 — Очистка истории git от полного текста");
say("============================================================");
say("");
say("Зачем: шаг 1 обрезал файлы, но в истории git полный текст остаётся");
say("и достаётся командой " + DIM + "git show" + OFF + ". Пока история не вычищена,");
say("перенос в Firestore курс не защищает.");
say("");
say("Что произойдёт:");
say("  " + DIM + "•" + OFF + " будет сделана резервная копия всего репозитория");
say("  " + DIM + "•" + OFF + " папка content/ будет вырезана из всех коммитов");
say("  " + DIM + "•" + OFF + " история кода при этом сохранится");
say("  " + DIM + "•" + OFF + " отправка на GitHub " + RED + "НЕ" + OFF + " произойдёт автоматически");
say("");

const go = await ask('Начать? Напишите "да" и нажмите Enter: ');
rl.close();

if (go.toLowerCase() !== "да") { say(""); say("Отменено."); process.exit(0); }

say("");
const r = spawnSync(process.execPath, [path.join("scripts", "purge-content-history.mjs")],
  { stdio: "inherit", cwd: ROOT });

if (r.status !== 0) {
  say("");
  say(RED + "Остановлено — смотрите сообщение выше." + OFF);
  // Раньше здесь безусловно писалось «резервная копия сделана» — неправда,
  // если остановка случилась ДО её создания (например, на проверке
  // незакоммиченных изменений). Про копию сообщает сам purge-скрипт, когда
  // она действительно есть.
  say("Репозиторий не изменён — остановка произошла до внесения правок,");
  say("либо с уже сделанной копией, путь к которой указан выше.");
}
process.exit(r.status ?? 1);
