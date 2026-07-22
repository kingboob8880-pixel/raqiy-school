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
import { auth, db } from "./firebase-init.js?v=1";
import { notifyRegistration } from "./notify.js?v=1";

export async function registerStudent({ name, email, password }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "students", cred.user.uid), {
    name,
    email,
    paid: false, // ждёт ручного подтверждения админом, §18
    createdAt: serverTimestamp(),
    progress: {}, // { moduleId: { status: 'in_progress'|'done', quizScore: number } }
  });
  notifyRegistration(name, email);
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

/** Человеко-читаемые сообщения об ошибках входа/регистрации на русском —
 * Firebase SDK по умолчанию отдаёт сырой английский текст ("Firebase: The
 * email address is already in use... (auth/email-already-in-use).") — это
 * известная точка потери пользователей на форме регистрации (план улучшения
 * курса, 2026-07-18, четвёртый проход). Неизвестные коды — нейтральный
 * fallback вместо необработанного текста. */
const AUTH_ERROR_MESSAGES = {
  "auth/email-already-in-use": "Этот email уже зарегистрирован — попробуйте войти вместо регистрации.",
  "auth/invalid-email": "Проверьте формат email.",
  "auth/weak-password": "Пароль слишком простой — минимум 6 символов.",
  "auth/user-not-found": "Ученик с таким email не найден — проверьте адрес или зарегистрируйтесь.",
  "auth/wrong-password": "Неверный пароль.",
  "auth/invalid-credential": "Неверный email или пароль.",
  "auth/invalid-login-credentials": "Неверный email или пароль.",
  "auth/too-many-requests": "Слишком много попыток — подождите немного и попробуйте снова.",
  "auth/network-request-failed": "Нет связи с сервером — проверьте интернет-соединение.",
};

export function friendlyAuthError(err) {
  const code = err?.code || "";
  return AUTH_ERROR_MESSAGES[code] || "Что-то пошло не так. Попробуйте ещё раз чуть позже.";
}
