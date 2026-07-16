// Хелперы авторизации. Ученик сам регистрируется, оплату подтверждает админ
// вручную переключателем в дашборде (project.md §16/§18 — "сам регистрируется,
// вы подтверждаете"). Админ входит на том же экране входа, без формы регистрации
// (§16), роль определяется документом admins/{uid} в Firestore.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";

export async function registerStudent({ name, email, password }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "students", cred.user.uid), {
    name,
    email,
    paid: false, // ждёт ручного подтверждения админом, §18
    createdAt: serverTimestamp(),
    progress: {}, // { moduleId: { status: 'in_progress'|'done', quizScore: number } }
  });
  return cred.user;
}

export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function isAdmin(uid) {
  const snap = await getDoc(doc(db, "admins", uid));
  return snap.exists();
}

export async function getStudentProfile(uid) {
  const snap = await getDoc(doc(db, "students", uid));
  return snap.exists() ? snap.data() : null;
}

/**
 * Возвращает 'admin' | 'student-unpaid' | 'student-paid'.
 * Используется страницами дашборда, чтобы решить, какой экран показывать.
 */
export async function resolveRole(user) {
  if (await isAdmin(user.uid)) return "admin";
  const profile = await getStudentProfile(user.uid);
  if (!profile) return "student-unpaid";
  return profile.paid ? "student-paid" : "student-unpaid";
}
