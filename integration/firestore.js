// Хелперы для данных портала (прогресс ученика, список учеников для админа,
// сообщения). Схема Firestore:
//   students/{uid}            — { name, email, paid, createdAt, progress, lastSeenAt }
//   students/{uid}/messages/{id} — { from: 'admin'|'student', text, createdAt, read }
//   admins/{uid}               — { name } — присутствие документа = права админа
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, addDoc,
  serverTimestamp, query, orderBy, where, arrayUnion, onSnapshot,
  writeBatch, getCountFromServer,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./firebase-init.js?v=1";

/** Сегодняшняя дата в виде "YYYY-MM-DD" (локальная, не UTC) — ключ для
 * журнала активности (стрики, project.md, решение 2026-07-18). */
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function markModuleProgress(uid, moduleId, status) {
  await updateDoc(doc(db, "students", uid), {
    [`progress.${moduleId}.status`]: status,
    lastSeenAt: serverTimestamp(),
    "progress.activityDates": arrayUnion(todayKey()),
  });
}

export async function recordQuizResult(uid, moduleId, scoreRatio) {
  const passed = scoreRatio >= 0.7;
  const update = {
    [`progress.${moduleId}.quizScore`]: scoreRatio,
    [`progress.${moduleId}.status`]: passed ? "done" : "in_progress",
    lastSeenAt: serverTimestamp(),
    "progress.activityDates": arrayUnion(todayKey()),
  };
  if (passed) update[`progress.${moduleId}.passedAt`] = serverTimestamp();
  await updateDoc(doc(db, "students", uid), update);
}

/** Экзамен по отдельной книге (не по модулю целиком, project.md §5) —
 * bookKey — плоский ключ из pages/js/modules-data.js#bookKey(doc). */
export async function recordBookQuizResult(uid, bookKey, scoreRatio) {
  const passed = scoreRatio >= 0.7;
  const update = {
    [`progress.books.${bookKey}.quizScore`]: scoreRatio,
    [`progress.books.${bookKey}.status`]: passed ? "done" : "in_progress",
    lastSeenAt: serverTimestamp(),
    "progress.activityDates": arrayUnion(todayKey()),
  };
  if (passed) update[`progress.books.${bookKey}.passedAt`] = serverTimestamp();
  await updateDoc(doc(db, "students", uid), update);
}

/** Дней подряд с активностью (тест сдавался/пересдавался), включая сегодня
 * или вчера — так стрик не "обнуляется" мгновенно в полночь, пока ученик
 * ещё может позаниматься сегодня (project.md, решение 2026-07-18). */
export function computeStreak(activityDates) {
  if (!activityDates || !activityDates.length) return 0;
  const set = new Set(activityDates);
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const cursor = new Date();
  if (!set.has(fmt(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (set.has(fmt(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function listStudents() {
  const snap = await getDocs(collection(db, "students"));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

export async function setStudentPaid(uid, paid) {
  await updateDoc(doc(db, "students", uid), { paid });
}

/** Удаляет только запись ученика в Firestore (прогресс/сообщения/статус
 * оплаты) — учётную запись Firebase Auth это не трогает, для этого нужен
 * Admin SDK, недоступный из клиентского кода (project.md §16). */
export async function deleteStudent(uid) {
  await deleteDoc(doc(db, "students", uid));
}

export async function sendMessage(uid, from, text) {
  await addDoc(collection(db, "students", uid, "messages"), {
    from, text, createdAt: serverTimestamp(), read: false,
  });
}

export async function listMessages(uid) {
  const q = query(collection(db, "students", uid, "messages"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Живая подписка на переписку — чат обновлялся только при собственной
 * отправке сообщения (listMessages() дёргался вручную), поэтому ответ
 * наставника/ученика появлялся у собеседника только после ручного
 * обновления страницы. Улучшение чата, 2026-07-20: разбор реализации на
 * сторонних сайтах (WhatsApp/Slack-style DM) показал, что живое обновление
 * через слушатель — это база, а не опция, для любого 1:1-чата. onSnapshot()
 * присылает и текущий срез сразу, и каждое следующее изменение — включая
 * собственную отправку (мгновенно, за счёт latency compensation) и входящие
 * сообщения от собеседника без перезагрузки. Возвращает функцию отписки —
 * вызывающий код обязан её вызвать при закрытии треда/уходе со страницы,
 * иначе слушатель останется висеть и продолжит тратить чтения Firestore. */
export function watchMessages(uid, onChange, onError) {
  const q = query(collection(db, "students", uid, "messages"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.warn("watchMessages", uid, err);
    if (onError) onError(err);
  });
}

/** Отмечает прочитанными все сообщения от собеседника при открытии треда —
 * поле read у сообщения существовало в схеме с самого начала, но нигде не
 * читалось и не проставлялось обратно в true, то есть было мёртвым полем
 * (улучшение чата, 2026-07-20). viewerRole — та сторона, которая СЕЙЧАС
 * читает тред ("admin" или "student"): отмечаем прочитанными сообщения
 * от ПРОТИВОПОЛОЖНОЙ стороны. Пустой список — не ошибка, просто нечего
 * отмечать (например, тред уже прочитан). */
export async function markThreadRead(uid, viewerRole) {
  const otherRole = viewerRole === "admin" ? "student" : "admin";
  const q = query(
    collection(db, "students", uid, "messages"),
    where("from", "==", otherRole),
    where("read", "==", false),
  );
  const snap = await getDocs(q);
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
  await batch.commit();
}

/** Кол-во непрочитанных сообщений ОТ ученика — значок 💬 в списке учеников
 * админа, чтобы не открывать каждый тред, чтобы понять, кто написал новое
 * (улучшение чата, 2026-07-20). getCountFromServer — агрегирующий запрос,
 * не тянет тела сообщений, дешёвый даже при большом списке учеников. */
export async function countUnreadFromStudent(uid) {
  try {
    const q = query(
      collection(db, "students", uid, "messages"),
      where("from", "==", "student"),
      where("read", "==", false),
    );
    const snap = await getCountFromServer(q);
    return snap.data().count;
  } catch (err) {
    console.warn("countUnreadFromStudent", uid, err);
    return 0;
  }
}

/** Полный текст платной книги/модуля из Firestore (docId = bookKey() из
 * modules-data.js) — реальная защита вместо визуальной обрезки в браузере
 * (project.md §18/§22, "закрыть дыру с платным контентом", 2026-07-20).
 * Правила Firestore (integration/firestore.rules) пускают на чтение только
 * оплативших/админа, поэтому вызывать эту функцию для незалогиненных/
 * неоплативших нет смысла — get() просто упадёт на правилах. Возвращает
 * null, если для этого docId ещё не запущена миграция
 * (scripts/seed-paid-content.mjs) — тогда вызывающий код должен показать то,
 * что уже загружено локально (текущий бесплатный отрывок), а не падать. */
export async function getFullBookContent(docId) {
  try {
    const snap = await getDoc(doc(db, "content", docId));
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.warn("getFullBookContent", docId, err);
    return null;
  }
}

/** "Молчат N дней" — для счётчика в дашборде админа (§19 project.md). */
export function daysSince(timestamp) {
  if (!timestamp) return null;
  const ms = Date.now() - timestamp.toMillis();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

const TOTAL_MODULES = 11;

export function computeOverallProgress(progress) {
  if (!progress) return 0;
  const done = Object.values(progress).filter((m) => m.status === "done").length;
  return Math.round((done / TOTAL_MODULES) * 100);
}

export function computeAverageScore(progress) {
  if (!progress) return null;
  const scores = Object.values(progress).map((m) => m.quizScore).filter((s) => typeof s === "number");
  if (!scores.length) return null;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);
}
