// Хелперы для данных портала (прогресс ученика, список учеников для админа,
// сообщения). Схема Firestore:
//   students/{uid}            — { name, email, paid, createdAt, progress, lastSeenAt }
//   students/{uid}/messages/{id} — { from: 'admin'|'student', text, createdAt,
//                                    read, editedAt?, type?, mediaUrl?, … }
//   admins/{uid}               — { name } — присутствие документа = права админа
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, addDoc,
  serverTimestamp, query, orderBy, where, arrayUnion, arrayRemove, onSnapshot,
  writeBatch, getCountFromServer, limit,
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

/** Правка своего сообщения (запрос автора, 2026-07-25). Меняем только текст
 * и ставим editedAt — интерфейс покажет пометку «изменено». Автора и дату
 * создания не трогаем, правила Firestore это и не пропустят. Медиа править
 * нельзя: у голосового/видео/файла нет текста, который имело бы смысл
 * переписать — там доступно только удаление. */
export async function editMessage(uid, messageId, newText) {
  await updateDoc(doc(db, "students", uid, "messages", messageId), {
    text: newText,
    editedAt: serverTimestamp(),
  });
}

/** Удаление своего сообщения. Файл в Storage намеренно остаётся: правила
 * Storage не дают клиенту удалять чужие объекты, а чистка осиротевших
 * файлов — задача обслуживания, а не интерфейса чата. */
export async function deleteMessage(uid, messageId) {
  await deleteDoc(doc(db, "students", uid, "messages", messageId));
}

/** Живая сводка по переписке одного ученика для списка диалогов
 * мессенджера: последнее сообщение (превью + время + кто написал) и число
 * непрочитанных ОТ ученика. Раньше список учеников у админа показывал
 * только счётчик, да и тот обновлялся исключительно при перезагрузке
 * страницы — понять, кто написал последним и о чём, без открытия каждого
 * треда было невозможно (запрос автора «сделай нормальный чат», 2026-07-25).
 *
 * Подписка на ВСЮ коллекцию сообщений ученика была бы расточительна, если
 * переписка длинная, поэтому слушаем только последние MAX_PREVIEW штук по
 * убыванию даты: этого хватает и на превью, и на подсчёт непрочитанных в
 * подавляющем большинстве тредов. Если непрочитанных больше окна, отдаём
 * «N+» — точная цифра тут не важна, важен факт «есть новое».
 *
 * Возвращает функцию отписки. */
const THREAD_PREVIEW_WINDOW = 30;

export function watchThreadSummary(uid, onChange, onError) {
  const q = query(
    collection(db, "students", uid, "messages"),
    orderBy("createdAt", "desc"),
    limit(THREAD_PREVIEW_WINDOW),
  );
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const last = docs[0] || null;
    let unread = 0;
    for (const m of docs) if (m.from === "student" && !m.read) unread++;
    onChange({
      uid,
      last,
      unread,
      unreadCapped: unread >= THREAD_PREVIEW_WINDOW,
      // Для сортировки списка по свежести. Сообщение, только что созданное
      // локально, ещё не имеет серверного времени (latency compensation) —
      // подставляем «сейчас», иначе свой же ответ уронил бы диалог вниз.
      lastAt: last?.createdAt?.toDate ? last.createdAt.toDate() : (last ? new Date() : null),
    });
  }, (err) => {
    console.warn("watchThreadSummary", uid, err);
    if (onError) onError(err);
  });
}

// watchUnreadFromAdmin удалён 2026-07-25: значок непрочитанных в шапке
// заменён колокольчиком уведомлений (pages/js/notifications.js), который
// подписан на students/{uid}/notifications и покрывает не только чат.

/** Живая подписка на уведомления ученика (запрос автора, 2026-07-25).
 *
 * Схема: students/{uid}/notifications/{id}
 *   { type, title, body, link, createdAt, read }
 *   type: 'message' | 'paid' | 'certificate' | 'rukyaPro'
 *
 * Пишет их только сервер (functions/index.js через Admin SDK) — правила
 * запрещают создание с клиента, чтобы ученик не мог подделать себе
 * уведомление «доступ открыт».
 *
 * Берём последние LIMIT штук по убыванию даты: список уведомлений — это
 * лента последнего, а не архив. Возвращает функцию отписки. */
const NOTIF_LIMIT = 30;

export function watchNotifications(uid, onChange, onError) {
  const q = query(
    collection(db, "students", uid, "notifications"),
    orderBy("createdAt", "desc"),
    limit(NOTIF_LIMIT),
  );
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.warn("watchNotifications", uid, err);
    if (onError) onError(err);
  });
}

/** Отметить одно уведомление прочитанным. */
export async function markNotificationRead(uid, notifId) {
  await updateDoc(doc(db, "students", uid, "notifications", notifId), { read: true });
}

/** Отметить прочитанными все непрочитанные разом («Прочитать все»).
 *  Пишем пакетом: по одному update на каждое — это N запросов подряд и
 *  заметная задержка, если уведомлений накопилось два десятка. */
export async function markAllNotificationsRead(uid) {
  const q = query(
    collection(db, "students", uid, "notifications"),
    where("read", "==", false),
    limit(NOTIF_LIMIT),
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

/** Чеклист самопроверки «Понял / Не понял» — заменяет прежние "Мои заметки"
 * (решение автора, 2026-07-22). understanding — объект { slug: true|false },
 * где slug — детерминированный ключ из текста h2/h3 заголовка урока. Хранится
 * в уже существующей структуре progress.books.{bookKey} — та же, что и
 * статус/результат теста, новой коллекции/правил не потребовалось. */
export async function saveUnderstanding(uid, bookKey, understanding) {
  await updateDoc(doc(db, "students", uid), {
    [`progress.books.${bookKey}.understanding`]: understanding,
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

// ──────────────────────────────────────────────────────────────────
// Практические задания и лента достижений (запрос автора, 2026-07-26)
// ──────────────────────────────────────────────────────────────────

/** Отметка «задание выполнено».
 *
 * Хранится массивами, а не объектом `assignments.{id}`, намеренно: id
 * заданий вида "m5-1" содержат дефис, а дефис в точечном пути к полю
 * Firestore ломает путь и требует экранирования обратными кавычками.
 * Массив снимает вопрос целиком, а порядок и уникальность нам тут не нужны
 * (arrayUnion сам не добавит дубль при повторном нажатии).
 *
 * allahAnswered — свидетельство самого ученика о практике. Отдельным
 * массивом, потому что «выполнил» и «Аллах ответил» — разные факты:
 * задание можно довести до конца и продолжать просить. Именно этот флаг
 * даёт запись в ленте о том, что Аллах ответил, — и ставит его сам ученик,
 * никто за него.
 *
 * Заодно продлеваем стрик: практика — такая же активность, как сдача
 * экзамена, а до сих пор в журнал попадали только тесты. */
export async function markAssignmentDone(uid, moduleId, assignId, allahAnswered) {
  const update = {
    [`progress.${moduleId}.doneAssignments`]: arrayUnion(assignId),
    lastSeenAt: serverTimestamp(),
    "progress.activityDates": arrayUnion(todayKey()),
  };
  if (allahAnswered) {
    update[`progress.${moduleId}.answeredAssignments`] = arrayUnion(assignId);
  }
  await updateDoc(doc(db, "students", uid), update);
}

/** Снять отметку — нажали по ошибке. Свидетельство «Аллах ответил» снимаем
 * вместе с ней: держать его у невыполненного задания бессмысленно. */
export async function unmarkAssignmentDone(uid, moduleId, assignId) {
  await updateDoc(doc(db, "students", uid), {
    [`progress.${moduleId}.doneAssignments`]: arrayRemove(assignId),
    [`progress.${moduleId}.answeredAssignments`]: arrayRemove(assignId),
  });
}

/** Живая подписка на общую ленту достижений (запрос автора «пусть будет
 * автоматом», 2026-07-26).
 *
 * Схема: feed/{id} = { kind, moduleId, firstName, uid, createdAt }
 *   kind: 'module' | 'practice' | 'answered' | 'graduate'
 *       | 'certificate' | 'rukyaPro'
 *
 * Текст записи НЕ хранится — только вид события и имя. Формулировку
 * собирает клиент (pages/js/community-feed.js) через i18n, иначе лента на
 * английском и узбекском осталась бы русской навсегда, а перевод задним
 * числом уже сохранённых строк невозможен.
 *
 * Пишет только сервер, правила запрещают запись с клиента.
 * Возвращает функцию отписки. */
const FEED_LIMIT = 40;

export function watchFeed(onChange, onError) {
  const q = query(collection(db, "feed"), orderBy("createdAt", "desc"), limit(FEED_LIMIT));
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.warn("watchFeed", err);
    if (onError) onError(err);
  });
}

/** Save a bookmark for a lesson */
export async function saveBookmark(uid, bookId, bookmark) {
  // bookmark: { id, text, note, createdAt }
  const docRef = doc(db, "students", uid);
  const snap = await getDoc(docRef);
  const data = snap.data() || {};
  const bookmarks = data.bookmarks || {};
  const arr = bookmarks[bookId] || [];
  arr.push(bookmark);
  await updateDoc(docRef, { [`bookmarks.${bookId}`]: arr });
}

export async function removeBookmark(uid, bookId, bookmarkId) {
  const docRef = doc(db, "students", uid);
  const snap = await getDoc(docRef);
  const data = snap.data() || {};
  const bookmarks = data.bookmarks || {};
  const arr = (bookmarks[bookId] || []).filter(b => b.id !== bookmarkId);
  await updateDoc(docRef, { [`bookmarks.${bookId}`]: arr });
}

export async function getBookmarks(uid, bookId) {
  const docRef = doc(db, "students", uid);
  const snap = await getDoc(docRef);
  return snap.data()?.bookmarks?.[bookId] || [];
}
