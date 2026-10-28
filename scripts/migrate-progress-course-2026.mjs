// Миграция прогресса на полностью перестроенную программу zaxab-2026.
//
// Что сохраняется: progress.books (все пути старых книг остались прежними),
// activityDates, fullAccess, супервизия и остальные поля студента.
// Что сбрасывается: только числовые progress.1–12 со старыми модульными
// статусами и баллами. Их нельзя переставить механически: модули разделены,
// а итоговые тесты проверяют новые компетенции. Старые записи архивируются
// в legacyCourseProgress2026 и в локальном backup, новые тесты проходят заново.
//
// СУХОЙ ПРОГОН (по умолчанию, Firestore не меняется):
//   node scripts/migrate-progress-course-2026.mjs
// ПРИМЕНЕНИЕ (сначала полный backup студентов в backups/):
//   node scripts/migrate-progress-course-2026.mjs --apply
//
// GOOGLE_APPLICATION_CREDENTIALS должен указывать на Admin SDK ключ проекта.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
export const COURSE_REVISION = "zaxab-2026-10";
const APPLY = process.argv.includes("--apply");
const MODULE_KEY = /^(?:[1-9]|1[0-2])$/;

/** Чистая функция: строит план одного студента и не обращается к Firestore. */
export function planMigration(student, now = new Date().toISOString()) {
  if (student.courseRevision === COURSE_REVISION) {
    return { skip: true, books: Object.keys(student.progress?.books || {}).length, reset: [], update: null };
  }
  const progress = student.progress || {};
  const reset = Object.keys(progress).filter((key) => MODULE_KEY.test(key)).sort((a, b) => Number(a) - Number(b));
  const modules = Object.fromEntries(reset.map((key) => [key, progress[key]]));
  const update = {
    courseRevision: COURSE_REVISION,
    legacyCourseProgress2026: student.legacyCourseProgress2026 || {
      revision: "pre-zaxab-2026-10",
      capturedAt: now,
      modules,
    },
  };
  return {
    skip: false,
    books: Object.keys(progress.books || {}).length,
    reset,
    update,
    deletePaths: reset.map((key) => `progress.${key}`),
  };
}

async function main() {
  const app = initializeApp({ credential: applicationDefault() });
  const db = getFirestore(app);
  const snap = await db.collection("students").get();
  const plans = snap.docs.map((doc) => ({ doc, plan: planMigration(doc.data()) }));
  const pending = plans.filter((x) => !x.plan.skip);
  const books = pending.reduce((n, x) => n + x.plan.books, 0);
  const reset = pending.reduce((n, x) => n + x.plan.reset.length, 0);

  console.log(`Студентов: ${snap.size}; уже обновлено: ${snap.size - pending.length}; к миграции: ${pending.length}.`);
  console.log(`Сохраняется книжных записей: ${books}; архивируется старых модульных записей: ${reset}.`);
  console.log("activityDates, fullAccess, супервизия и остальные поля не изменяются.");

  if (!APPLY) {
    console.log("Это СУХОЙ ПРОГОН — Firestore не изменён. Для применения добавьте --apply.");
    return;
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const backupFile = path.join(ROOT, "backups", `progress-course-2026-${stamp}.json`);
  mkdirSync(path.dirname(backupFile), { recursive: true });
  const backup = Object.fromEntries(snap.docs.map((doc) => [doc.id, doc.data()]));
  writeFileSync(backupFile, JSON.stringify(backup, null, 1), "utf8");
  console.log(`Полный backup студентов записан: ${path.basename(backupFile)}`);

  let migrated = 0;
  for (const { doc, plan } of pending) {
    const update = { ...plan.update };
    for (const key of plan.deletePaths) update[key] = FieldValue.delete();
    await doc.ref.update(update);
    migrated++;
  }
  console.log(`Готово: обновлено ${migrated}; повторный запуск пропустит их по courseRevision=${COURSE_REVISION}.`);
  console.log("Проверьте сохранение книг и повторное прохождение новых модульных тестов на нескольких учениках.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error("ОШИБКА:", error.message); process.exit(1); });
}
