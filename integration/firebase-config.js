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

// Учебный Telegram-бот (запрос автора 2026-07-27: «чтобы ученики могли
// обучаться с телеграм-бота»). Здесь только имя — токен лежит в
// functions/.env (локально) и в секретах функций (в бою), в репозиторий он
// не попадает ни при каких обстоятельствах.
//
// Это ОТДЕЛЬНЫЙ бот от @Lechenya_bot: тот принимает запись на лечение и
// указан в контактах на странице «Об авторе». Учебный — только для курса.
export const TELEGRAM_BOT_USERNAME = "ruyka_school_bot";
