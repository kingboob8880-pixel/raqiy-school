// Хелперы для данных портала (прогресс ученика, список учеников для админа,
// сообщения). Схема Firestore:
//   students/{uid}            — { name, email, paid, createdAt, progress, lastSeenAt }
//   students/{uid}/messages/{id} — { from: 'admin'|'student', text, createdAt, read }
//   admins/{uid}               — { name } — присутствие документа = права админа
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, addDoc,
  serverTimestamp, query, orderBy,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./firebase-init.js";

export async function markModuleProgress(uid, moduleId, status) {
  await updateDoc(doc(db, "students", uid), {
    [`progress.${moduleId}.status`]: status,
    lastSeenAt: serverTimestamp(),
  });
}

export async function recordQuizResult(uid, moduleId, scoreRatio) {
  await updateDoc(doc(db, "students", uid), {
    [`progress.${moduleId}.quizScore`]: scoreRatio,
    [`progress.${moduleId}.status`]: scoreRatio >= 0.7 ? "done" : "in_progress",
    lastSeenAt: serverTimestamp(),
  });
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
