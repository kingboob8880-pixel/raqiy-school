// Инициализация Firebase (модульный SDK через ESM CDN — без сборщика,
// подходит для статического GitHub Pages, project.md §16 "Решение (2026-07-16)").
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// "Запомнить меня" по умолчанию (§15 project.md) — долгая локальная сессия.
// top-level await (не fire-and-forget) — раньше страница могла успеть
// вызвать watchAuth()/signIn до того, как персистентность реально
// применилась (гонка между этим промисом и первым обращением к auth в
// auth.js/дашбордах), из-за чего вход иногда не переживал перезаход на
// сайт. import ждёт весь модуль целиком, включая этот await, поэтому
// любой код, импортирующий auth/db отсюда, гарантированно получает их
// уже после того, как персистентность установлена (независимая проверка,
// 2026-07-19).
try {
  await setPersistence(auth, browserLocalPersistence);
} catch (err) {
  console.warn("Firebase persistence не установлена:", err);
}
