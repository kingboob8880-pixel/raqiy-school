// Конфигурация Firebase-проекта школы (rukya-school).
// Подключаем через CDN ESM-импорты (integration/firebase-init.js), без сборщика —
// поэтому здесь именно объект конфига, а не npm-style initializeApp(...).
export const firebaseConfig = {
  apiKey: "AIzaSyA2FBe5rO8gEghoGiTUWBgPLWk1Bkqv59Y",
  authDomain: "rukya-school.firebaseapp.com",
  projectId: "rukya-school",
  storageBucket: "rukya-school.firebasestorage.app",
  messagingSenderId: "756469023258",
  appId: "1:756469023258:web:9bff15dc29f6c37eec47a3",
  measurementId: "G-YY5Q2R8F4K",
};

export const TELEGRAM_PAYMENT_LINK = "https://t.me/ruqoq";
export const QUIZ_PASS_THRESHOLD = 0.7; // 70%, project.md §16а

