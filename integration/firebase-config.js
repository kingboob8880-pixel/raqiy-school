// Конфигурация Firebase-проекта школы.
//
// ⚠️ ПЛЕЙСХОЛДЕР. Чтобы авторизация/дашборды заработали, нужно:
//   1. Создать проект на https://console.firebase.google.com (бесплатный план Spark).
//   2. Включить Authentication → Email/Password.
//   3. Создать базу Firestore (production mode, ближайший к пользователям регион).
//   4. Project settings → General → "Your apps" → Web app → скопировать сюда
//      firebaseConfig, который выдаст консоль (apiKey и т.п. — публичные, это
//      нормально для клиентского SDK, безопасность обеспечивают Firestore Security
//      Rules, а не секретность этих полей).
//   5. Применить правила из integration/firestore.rules (Firestore → Rules → вставить → Publish).
//   6. Создать первый админ-документ вручную (см. integration/README.md, шаг «Первый админ»).
//
// Это шаг, который я не могу сделать за вас — создание проекта требует входа в
// ваш Google-аккаунт в браузере (project.md §16).
export const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME",
};

export const TELEGRAM_PAYMENT_LINK = "https://t.me/ruqoq";
export const QUIZ_PASS_THRESHOLD = 0.7; // 70%, project.md §16а
