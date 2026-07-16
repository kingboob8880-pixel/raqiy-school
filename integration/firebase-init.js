// Инициализация Firebase (модульный SDK через ESM CDN — без сборщика,
// подходит для статического GitHub Pages, project.md §16 "Решение (2026-07-16)").
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// "Запомнить меня" по умолчанию (§15 project.md) — долгая локальная сессия.
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("Firebase persistence не установлена:", err);
});
