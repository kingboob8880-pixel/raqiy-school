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
import { db, storage } from "./firebase-init.js?v=2";
import {
  ref, uploadBytes, getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";
import { QUIZ_PASS_THRESHOLD } from "./firebase-config.js?v=1";
// Уведомления теперь через Cloud Functions (functions/index.js)

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

export async function recordQuizResult(uid, moduleId, scoreRatio, studentName) {
  const passed = scoreRatio >= QUIZ_PASS_THRESHOLD;
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
export async function recordBookQuizResult(uid, bookKey, scoreRatio, studentName) {
  const passed = scoreRatio >= QUIZ_PASS_THRESHOLD;
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

export async function sendMessage(uid, from, text, studentName) {
  await addDoc(collection(db, "students", uid, "messages"), {
    from, text, createdAt: serverTimestamp(), read: false,
  });
}

/** Отправка медиа-сообщения (голос/видео/файл) — загружает файл в
 * Firebase Storage, сохраняет ссылку в Firestore. Путь в Storage:
 * chat/{uid}/{timestamp}_{filename} — изолирован по ученику.
 * type: 'voice' | 'video' | 'file'. duration в секундах (для голоса/видео).
 * Правила Storage (integration/storage.rules) должны разрешать запись
 * авторизованным пользователям в chat/{uid}/ . */
export async function sendMediaMessage(uid, from, file, type, duration, studentName) {
  const ts = Date.now();
  const safeName = (file.name || (type === "voice" ? "voice.webm" : type === "video" ? "video.webm" : "file")).replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `chat/${uid}/${ts}_${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const mediaUrl = await getDownloadURL(storageRef);
  await addDoc(collection(db, "students", uid, "messages"), {
    from, text: null, type, mediaUrl,
    fileName: file.name || safeName,
    fileSize: file.size || 0,
    duration: duration || null,
    mimeType: file.type || null,
    createdAt: serverTimestamp(), read: false,
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

/** Личная заметка ученика к книге — веб-исследование лучших LMS-практик
 * (курс "оживление обучающей системы", 2026-07-20) показало, что
 * возможность делать заметки/аннотации прямо у текста превращает чтение
 * в двустороннее взаимодействие, а не пассивный просмотр — паттерн есть
 * почти у всех крупных читалок (заметки/хайлайты), у нас не было вообще.
 * Хранится в уже существующей структуре progress.books.{bookKey} — та же,
 * что и статус/результат теста, новой коллекции/правил не потребовалось
 * (integration/firestore.rules уже разрешает ученику править progress
 * своего документа, кроме поля paid). Видна только на этом modules/book
 * от источника ученику и админу — clients.rules не открывают чужие
 * students/{uid} документы. */
export async function saveBookNote(uid, bookKey, note) {
  await updateDoc(doc(db, "students", uid), {
    [`progress.books.${bookKey}.note`]: note,
  });
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

/** Выдать/отозвать сертификат ученику вручную (кнопка в админ-панели).
 * Поле certificateGranted в students/{uid} — булево. Сертификат также
 * выдаётся автоматически при прохождении всех модулей (логика на клиенте
 * в student.html/certificate/index.html). */
export async function setCertificateGranted(uid, granted) {
  const update = { certificateGranted: granted };
  if (granted) update.certificateGrantedAt = serverTimestamp();
  await updateDoc(doc(db, "students", uid), update);
}

/** Дать/забрать доступ к скачиванию Rukya Pro вручную (кнопка в админ-панели).
 * Поле rukyaProAccess в students/{uid} — булево. Доступ к скачиванию также
 * открывается автоматически, если у ученика есть сертификат. */
export async function setRukyaProAccess(uid, granted) {
  await updateDoc(doc(db, "students", uid), { rukyaProAccess: granted });
}
