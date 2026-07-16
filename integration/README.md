# Интеграция с Firebase — что нужно сделать вручную

Это единственная часть портала, которую нельзя настроить кодом — нужен ваш вход
в Google-аккаунт в браузере (project.md §16).

## 1. Создать проект
1. https://console.firebase.google.com → Add project → любое имя (например `raqiy-school`).
2. Google Analytics — не обязателен, можно отключить.

## 2. Включить вход по email/паролю
Authentication → Sign-in method → Email/Password → включить.

## 3. Создать базу Firestore
Firestore Database → Create database → Production mode → ближайший регион.
Затем Rules → вставить содержимое `integration/firestore.rules` → Publish.

## 4. Скопировать конфиг
Project settings (шестерёнка) → General → вниз до "Your apps" → `</>` (Web app) →
зарегистрировать (имя любое) → скопировать объект `firebaseConfig` в
`integration/firebase-config.js` вместо `REPLACE_ME`.

## 5. Первый админ
Firestore Database → Data → создать коллекцию `admins` → документ с ID, равным
вашему будущему **Firebase Auth UID**. Проще всего:
1. Зарегистрируйтесь на сайте как обычный ученик (через `pages/auth/register.html`).
2. Authentication → Users → скопировать ваш UID.
3. Firestore → создать документ `admins/<этот UID>` с любым полем, например `{ name: "Абу Мухаммад" }`.
4. Теперь при входе с этим email/паролем сайт откроет кабинет админа, а не ученика.

## 6. GitHub Pages и домен Firebase Auth
Authentication → Settings → Authorized domains → добавить домен, на котором будет
жить сайт (например `<username>.github.io`), иначе вход будет отклонён браузером.

## Оплата (уже решено, без доработки)
Кнопка «Купить курс» ведёт на `t.me/ruqoq` (§18 project.md) — платёжного шлюза нет.
Когда ученик пишет вам в Telegram — это и есть уведомление, отдельно ничего не
интегрировано. После получения оплаты вручную включите переключатель «Оплачено» в
дашборде админа для этого ученика.
