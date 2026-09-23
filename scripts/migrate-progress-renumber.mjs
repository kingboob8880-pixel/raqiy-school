// Миграция прогресса учеников под перестановку продвинутого блока
// (решение автора от 2026-09-23: «Профессионал» стал Модулем 7, прежние
// 7–11 сдвинулись на 8–12; пути книг не менялись).
//
// Прогресс хранится в students/{uid}.progress как карта { "номер модуля":
// { status, quizScore, passedAt, doneAssignments } } (integration/
// firestore.js#markModuleProgress). Номера 7–12 нужно переставить ТОЙ ЖЕ
// перестановкой, что и id в реестрах курса, иначе пройденное превратится
// в чужое — об этом предупреждал авторский комментарий в modules-data.js.
//
//   старое -> новое:  12->7, 7->8, 8->9, 9->10, 10->11, 11->12
//
// ⚠ ПРИМЕНЯЕТСЯ ОДИН РАЗ. Перестановка не идемпотентна: повторный --apply
// сдвинет уже перенесённое ещё раз. Повторный dry-run после применения всегда
// показывает «затронуто N» — это не ошибка, а признак что ключи 7–12 заняты.
//
// progress.books.* ключи — пути книг, они НЕ менялись и не трогаются.
// activityDates не трогаем. Записи ленты (m7..m12) — история, не мигрируем.
//
// Запуск (у автора курса, ЛОКАЛЬНО — нужен Admin SDK доступ к rukya-school):
//   1. cd scripts && npm install            (если ещё не сделано)
//   2. СУХОЙ ПРОГОН (ничего не меняет, только план):
//      $env:GOOGLE_APPLICATION_CREDENTIALS="..\\rukya-school-firebase-adminsdk-....json"
//      node migrate-progress-renumber.mjs
//   3. ПРИМЕНЕНИЕ (сначала сам делает локальный бэкап всех progress):
//      node migrate-progress-renumber.mjs --apply
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APPLY = process.argv.includes("--apply");

// какое НОВОЕ число откуда берётся: new[n] = old[FROM[n]]
const FROM = { 7: 12, 8: 7, 9: 8, 10: 9, 11: 10, 12: 11 };
const IDS = Object.keys(FROM).map(Number);

async function main() {
  const app = initializeApp({ credential: applicationDefault() });
  const db = getFirestore(app);

  const snap = await db.collection("students").get();
  const backup = {};
  for (const doc of snap.docs) {
    backup[doc.id] = { email: doc.data().email || "", progress: doc.data().progress || {} };
  }
  // Бэкап пишем ДО первой записи: если прервётся на середине, откатываться
  // будет с чего.
  let backupFile = null;
  if (APPLY) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    backupFile = path.join(__dirname, `progress-backup-${stamp}.json`);
    writeFileSync(backupFile, JSON.stringify(backup, null, 1));
    console.log(`Бэкап всех progress записан: ${path.basename(backupFile)}`);
  }

  let touched = 0, untouched = 0, movedEntries = 0;
  const report = [];

  for (const doc of snap.docs) {
    const progress = doc.data().progress || {};

    // есть ли у ученика что переставлять
    const involved = IDS.filter((n) => progress[String(FROM[n])] !== undefined);
    const emptyTargets = IDS.filter((n) => progress[String(FROM[n])] === undefined && progress[String(n)] !== undefined);
    if (!involved.length && !emptyTargets.length) { untouched += 1; continue; }

    const upd = {};
    for (const n of IDS) {
      const src = progress[String(FROM[n])];
      if (src !== undefined) { upd[`progress.${n}`] = src; movedEntries += 1; }
      else if (progress[String(n)] !== undefined) upd[`progress.${n}`] = FieldValue.delete();
    }
    touched += 1;
    report.push(`${doc.id} (${doc.data().email || "?"}): переставляем ${involved.length} записей [${involved.join(",")}]`);

    if (APPLY) await db.collection("students").doc(doc.id).update(upd);
  }

  console.log(report.join("\n") || "— ни у одного ученика нет прогресса в 7–12 —");
  console.log(`\nИтог: документов ${snap.size}, затронуто ${touched}, без изменений ${untouched}, записей переносится ${movedEntries}.`);

  if (!APPLY) {
    console.log("\nЭто СУХОЙ ПРОГОН — Firestore не изменён. Для применения: node migrate-progress-renumber.mjs --apply");
    return;
  }

  console.log(`\nГотово. Бэкап: ${path.basename(backupFile)} (хранить до подтверждения учениками)`);
  console.log("Проверьте 1–2 учеников в портале, затем задеплойте functions и обновите сайт.");
}

main().catch((e) => { console.error("ОШИБКА:", e.message); process.exit(1); });
