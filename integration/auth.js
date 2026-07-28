// Хелперы авторизации. Ученик сам регистрируется, оплату подтверждает админ
// вручную переключателем в дашборде (project.md §16/§18 — "сам регистрируется,
// вы подтверждаете"). Админ входит на том же экране входа, без формы регистрации
// (§16), роль определяется документом admins/{uid} в Firestore.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { auth, db } from "./firebase-init.js?v=2";
// Сообщения об ошибках входа берутся из общего словаря — чтобы они были
// на языке, который человек выбрал в шапке.
import { t } from "../pages/js/i18n.js?v=36";

/** «Запомнить меня» — вход сохраняется между запусками браузера, пока
 *  человек сам не нажмёт «Выйти» (запрос автора, 2026-07-25: приходилось
 *  каждый раз вводить логин и пароль заново).
 *
 *  browserLocalPersistence кладёт сессию в IndexedDB, а не в память
 *  вкладки. Формально это и есть значение по умолчанию, но задаём его явно
 *  по двум причинам: во-первых, при недоступной IndexedDB (жёсткие
 *  настройки приватности, режим инкогнито) Firebase молча откатывается на
 *  сессионное хранение и вход теряется при закрытии вкладки — теперь это
 *  видно в консоли; во-вторых, поведение перестаёт зависеть от версии SDK.
 *
 *  Промис запоминаем и ждём перед входом: setPersistence, вызванный после
 *  signIn, на уже созданную сессию не влияет. */
const persistenceReady = setPersistence(auth, browserLocalPersistence)
  .catch((err) => {
    console.warn(
      "Не удалось включить постоянное хранение сессии — вход не сохранится " +
      "после закрытия браузера. Обычно причина в блокировке хранилища сайта.",
      err,
    );
  });

export async function registerStudent({ name, email, password }) {
  await persistenceReady;
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  try {
    await setDoc(doc(db, "students", cred.user.uid), {
      name,
      email,
      paid: false, // ждёт ручного подтверждения админом, §18
      createdAt: serverTimestamp(),
      progress: {}, // { moduleId: { status: 'in_progress'|'done', quizScore: number } }
    });
  } catch (err) {
    // ⚠️ ЛОВУШКА, В КОТОРУЮ ЧЕЛОВЕК ПОПАДАЛ БЕЗ ВЫХОДА (аудит 2026-07-27).
    //
    // Учётная запись к этому моменту УЖЕ создана — упала только запись
    // профиля (сеть, правила). Человек видел общее «Что-то пошло не так»,
    // нажимал «Зарегистрироваться» ещё раз и получал «Этот email уже
    // зарегистрирован» — про адрес, которым он ни разу не пользовался.
    // Дальше он либо уходил, либо писал автору.
    //
    // Аккаунт рабочий, войти по этой паре можно, а профиль досоздастся при
    // первом входе. Поэтому говорим человеку именно это, отдельным кодом.
    console.warn("registerStudent: аккаунт создан, профиль не записан", err);
    const e = new Error("profile not created");
    e.code = "raqiy/profile-not-created";
    throw e;
  }
  return cred.user;
}

export async function loginWithEmail(email, password) {
  await persistenceReady;
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/** Имя админа из admins/{uid} — документ по схеме содержит { name }.
 *  Нужно для шапки: без него там показывался кусок email до «собаки», и у
 *  автора вместо «Админ» выводилось «4851» (скриншот, 2026-07-25). */
export async function getAdminProfile(uid) {
  const snap = await getDoc(doc(db, "admins", uid));
  return snap.exists() ? snap.data() : null;
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
// ⚠️ ЗДЕСЬ КЛЮЧИ СЛОВАРЯ, А НЕ ГОТОВЫЕ СТРОКИ (правка 2026-07-27).
// Раньше русский текст был вписан прямо сюда, и англо- или узбекоязычный
// ученик получал русское сообщение об ошибке — ровно в тот момент, когда
// он уже не может войти и раздражён. Шапка на его языке, а ошибка нет:
// выглядит как поломка сайта.
const AUTH_ERROR_KEYS = {
  "auth/email-already-in-use": "authErr.emailInUse",
  "auth/invalid-email": "authErr.badEmail",
  "auth/weak-password": "authErr.weakPassword",
  "auth/user-not-found": "authErr.noUser",
  "auth/wrong-password": "authErr.wrongPassword",
  "auth/invalid-credential": "authErr.badCredentials",
  "auth/invalid-login-credentials": "authErr.badCredentials",
  "auth/too-many-requests": "authErr.tooMany",
  "auth/network-request-failed": "authErr.noNetwork",
  // Аккаунт создан, а профиль записать не вышло — см. registerStudent.
  "raqiy/profile-not-created": "authErr.profileLater",
};

export function friendlyAuthError(err) {
  return t(AUTH_ERROR_KEYS[err?.code || ""] || "authErr.generic");
}
