// Модуль интернационализации — три языка: русский (по умолчанию),
// английский, узбекский. Хранит выбор в localStorage, предоставляет
// t(key) для UI-строк и helpers для перевода заголовков модулей/уроков.
// Контентный маршрут (localizedDocPath) — для markdown-loader.js:
// /content/module-1/index.md → /content/en/module-1/index.md

export const LANGS = [
  { code: "ru", label: "РУ", full: "Русский" },
  { code: "en", label: "EN", full: "English" },
  { code: "uz", label: "UZ", full: "O'zbek" },
];
const DEFAULT = "ru";

export function getLang() {
  try { return localStorage.getItem("lang") || DEFAULT; } catch { return DEFAULT; }
}

export function setLang(code) {
  try { localStorage.setItem("lang", code); } catch { /* private mode */ }
  location.reload();
}

// ───── UI-строки ─────
const S = {
  // Header
  "site.title":        { ru: "Онлайн-школа рукии", en: "Online Ruqyah School", uz: "Onlayn ruqya maktabi" },
  "nav.about":         { ru: "Об авторе", en: "About", uz: "Muallif haqida" },
  "nav.modules":       { ru: "Модули", en: "Modules", uz: "Modullar" },
  "nav.tests":         { ru: "Тесты", en: "Tests", uz: "Testlar" },
  "nav.flashcards":    { ru: "Карточки", en: "Flashcards", uz: "Kartochkalar" },
  "nav.glossary":      { ru: "Словарь", en: "Glossary", uz: "Lug'at" },
  "nav.dashboard":     { ru: "Кабинет", en: "Dashboard", uz: "Kabinet" },
  "nav.admin":         { ru: "Админ", en: "Admin", uz: "Admin" },
  "auth.login":        { ru: "Войти", en: "Sign in", uz: "Kirish" },
  "skip.link":         { ru: "Перейти к содержимому", en: "Skip to content", uz: "Kontentga o'tish" },
  "menu.open":         { ru: "Открыть меню", en: "Open menu", uz: "Menyuni ochish" },
  "menu.close":        { ru: "Закрыть меню", en: "Close menu", uz: "Menyuni yopish" },

  // Footer
  "footer.text":       { ru: "Онлайн-школа рукии · Лекарь Абу Мухаммад · Основатель школы", en: "Online Ruqyah School · Healer Abu Muhammad · School Founder", uz: "Onlayn ruqya maktabi · Tabib Abu Muhammad · Maktab asoschisi" },

  // Modules list (index)
  "modules.title":     { ru: "Путь ученика", en: "Student's Path", uz: "Talaba yo'li" },
  "modules.subtitle":  { ru: "11 модулей · от основ к самостоятельному приёму", en: "11 modules · from basics to independent practice", uz: "11 modul · asoslardan mustaqil amaliyotga" },

  // Module page
  "module.lessons":    { ru: "Уроки", en: "Lessons", uz: "Darslar" },
  "module.text":       { ru: "Текст модуля", en: "Module text", uz: "Modul matni" },
  "module.quiz":       { ru: "Пройти тест по модулю →", en: "Take module test →", uz: "Modul testini topshirish →" },
  "module.notcert":    { ru: "Модуль ещё дорабатывается — тест можно пройти для практики, но материал может измениться.", en: "This module is still being finalised — the test is available for practice, but the content may change.", uz: "Modul hali yakunlanmoqda — testni mashq uchun topshirish mumkin, lekin mazmun o'zgarishi mumkin." },
  "module.nolessons":  { ru: "Отдельных уроков-первоисточников нет — весь текст модуля на его собственной странице ниже.", en: "No separate source lessons — full module text is on this page below.", uz: "Alohida dars-manbalar yo'q — modul matni to'liq shu sahifada." },
  "module.n":          { ru: "Модуль", en: "Module", uz: "Modul" },

  // Lesson meta
  "lesson.done":       { ru: "✓ Книга и тест пройдены", en: "✓ Book and test passed", uz: "✓ Kitob va test topshirildi" },
  "lesson.exam":       { ru: "📝 Экзамен по книге · порог 70%", en: "📝 Book exam · 70% threshold", uz: "📝 Kitob imtihoni · 70% chegara" },

  // Book page
  "book.back":         { ru: "← Назад", en: "← Back", uz: "← Orqaga" },
  "book.loading":      { ru: "Загрузка…", en: "Loading…", uz: "Yuklanmoqda…" },
  "book.nodoc":        { ru: "Не указан документ (параметр ?doc=).", en: "No document specified (?doc= parameter).", uz: "Hujjat ko'rsatilmagan (?doc= parametri)." },
  "book.loaderror":    { ru: "Не удалось загрузить материал", en: "Failed to load content", uz: "Materialni yuklash imkoni bo'lmadi" },
  "book.examdone":     { ru: "Экзамен по этой книге сдан", en: "Book exam passed", uz: "Kitob imtihoni topshirildi" },
  "book.examcta":      { ru: "Прочитали книгу?", en: "Finished reading?", uz: "Kitobni o'qib bo'ldingizmi?" },
  "book.retake":       { ru: "Пересдать экзамен →", en: "Retake exam →", uz: "Qayta topshirish →" },
  "book.takeexam":     { ru: "Перейти к экзамену →", en: "Take the exam →", uz: "Imtihonga o'tish →" },
  "book.gototests":    { ru: "Перейти к тестам", en: "Go to tests", uz: "Testlarga o'tish" },
  "book.threshold":    { ru: "Сдайте короткий экзамен по ней — порог 70%.", en: "Take a short exam — 70% pass threshold.", uz: "Qisqa imtihon topshiring — 70% chegara." },

  // Self-check
  "selfcheck.title":   { ru: "Самопроверка", en: "Self-check", uz: "O'z-o'zini tekshirish" },
  "selfcheck.hint":    { ru: "Отметьте, что усвоили, а что нужно перечитать.", en: "Mark what you understood and what needs review.", uz: "Nimani tushunganingizni va nimani qayta o'qish kerakligini belgilang." },
  "selfcheck.yes":     { ru: "Понял", en: "Got it", uz: "Tushundim" },
  "selfcheck.no":      { ru: "Не понял", en: "Review", uz: "Qayta o'qish" },
  "selfcheck.saving":  { ru: "Сохранение…", en: "Saving…", uz: "Saqlanmoqda…" },
  "selfcheck.saved":   { ru: "Сохранено ✓", en: "Saved ✓", uz: "Saqlandi ✓" },
  "selfcheck.error":   { ru: "Ошибка сохранения", en: "Save error", uz: "Saqlash xatosi" },
  "selfcheck.of":      { ru: "из", en: "of", uz: "dan" },

  // Auth
  "auth.register":     { ru: "Зарегистрироваться", en: "Sign up", uz: "Ro'yxatdan o'tish" },
  "auth.name":         { ru: "Имя", en: "Name", uz: "Ism" },
  "auth.email":        { ru: "Электронная почта", en: "Email", uz: "Elektron pochta" },
  "auth.password":     { ru: "Пароль", en: "Password", uz: "Parol" },
  "auth.forgotpw":     { ru: "Забыли пароль?", en: "Forgot password?", uz: "Parolni unutdingizmi?" },

  // Paywall / register wall
  "wall.register":     { ru: "Зарегистрируйтесь, чтобы читать дальше", en: "Sign up to continue reading", uz: "Davom etish uchun ro'yxatdan o'ting" },
  "wall.pay":          { ru: "Этот материал доступен после оплаты", en: "This content is available after payment", uz: "Bu material to'lovdan keyin ochiladi" },
  "wall.admin":        { ru: "Виден только администратору", en: "Visible to admin only", uz: "Faqat admin uchun" },

  // Levels
  "level.Начальный":   { ru: "Начальный", en: "Beginner", uz: "Boshlang'ich" },
  "level.Средний":     { ru: "Средний", en: "Intermediate", uz: "O'rta" },
  "level.Продвинутый": { ru: "Продвинутый", en: "Advanced", uz: "Yuqori" },

  // Status badges
  // "status.certified" удалён вместе с бейджем «Подтверждено шейхом»
  // (решение автора, 2026-07-25) — см. STATUS_BADGE в markdown-loader.js.
  "status.author":     { ru: "Черновик автора", en: "Author's draft", uz: "Muallif qoralamasi" },
  "status.stub":       { ru: "Заглушка", en: "Stub", uz: "Qoralama" },

  // Student dashboard
  "dash.continue":     { ru: "Продолжить обучение →", en: "Continue learning →", uz: "O'qishni davom ettirish →" },
  "dash.progress":     { ru: "Общий прогресс", en: "Overall progress", uz: "Umumiy progress" },
  "dash.streak":       { ru: "Стрик", en: "Streak", uz: "Strik" },
  "dash.days":         { ru: "дн.", en: "days", uz: "kun" },
  "dash.achievements": { ru: "Достижения", en: "Achievements", uz: "Yutuqlar" },
  "dash.inprogress":   { ru: "Сейчас в процессе", en: "In progress", uz: "Hozirda jarayonda" },
  "dash.chat":         { ru: "Чат с наставником", en: "Chat with mentor", uz: "Ustoz bilan chat" },
  "dash.certificate":  { ru: "Сертификат", en: "Certificate", uz: "Sertifikat" },

  // Tests page
  "tests.title":       { ru: "Тесты и экзамены", en: "Tests & Exams", uz: "Testlar va imtihonlar" },
  "tests.modules":     { ru: "Тесты по модулям", en: "Module tests", uz: "Modul testlari" },
  "tests.books":       { ru: "Экзамены по книгам", en: "Book exams", uz: "Kitob imtihonlari" },

  // Quiz
  "quiz.question":     { ru: "Вопрос", en: "Question", uz: "Savol" },
  "quiz.submit":       { ru: "Ответить", en: "Submit", uz: "Javob berish" },
  "quiz.next":         { ru: "Следующий →", en: "Next →", uz: "Keyingi →" },
  "quiz.result":       { ru: "Результат", en: "Result", uz: "Natija" },
  "quiz.passed":       { ru: "Тест пройден!", en: "Test passed!", uz: "Test topshirildi!" },
  "quiz.failed":       { ru: "Не пройден", en: "Not passed", uz: "Topshirilmadi" },
  "quiz.retry":        { ru: "Попробовать снова", en: "Try again", uz: "Qayta urinish" },

  // About page
  "about.title":       { ru: "Об авторе", en: "About the author", uz: "Muallif haqida" },

  // Landing
  "landing.hero":      { ru: "Онлайн-школа рукии", en: "Online Ruqyah School", uz: "Onlayn ruqya maktabi" },
  "landing.start":     { ru: "Начать обучение →", en: "Start learning →", uz: "O'qishni boshlash →" },

  // Common
  "common.loading":    { ru: "Загрузка…", en: "Loading…", uz: "Yuklanmoqda…" },
  "common.error":      { ru: "Произошла ошибка", en: "An error occurred", uz: "Xatolik yuz berdi" },
  "common.save":       { ru: "Сохранить", en: "Save", uz: "Saqlash" },
  "common.cancel":     { ru: "Отмена", en: "Cancel", uz: "Bekor qilish" },
  "common.send":       { ru: "Отправить", en: "Send", uz: "Yuborish" },
  "common.close":      { ru: "Закрыть", en: "Close", uz: "Yopish" },
  "common.nojs":       { ru: "Для работы сайта необходим JavaScript. Пожалуйста, включите его в настройках браузера.", en: "This site requires JavaScript. Please enable it in your browser settings.", uz: "Sayt ishlashi uchun JavaScript kerak. Brauzer sozlamalarida uni yoqing." },

  // Achievements
  "ach.first-book":    { ru: "Первая книга", en: "First Book", uz: "Birinchi kitob" },
  "ach.first-book.d":  { ru: "Сдать экзамен по первой книге", en: "Pass the first book exam", uz: "Birinchi kitob imtihonini topshirish" },
  "ach.first-module":  { ru: "Первый модуль", en: "First Module", uz: "Birinchi modul" },
  "ach.first-module.d":{ ru: "Завершить первый модуль целиком", en: "Complete the first module", uz: "Birinchi modulni to'liq yakunlash" },
  "ach.bookworm":      { ru: "Книгочей", en: "Bookworm", uz: "Kitobxon" },
  "ach.bookworm.d":    { ru: "Сдать 10 книжных экзаменов", en: "Pass 10 book exams", uz: "10 ta kitob imtihonini topshirish" },
  "ach.streak-7":      { ru: "Усердный", en: "Diligent", uz: "Tirishqoq" },
  "ach.streak-7.d":    { ru: "7 дней активности подряд", en: "7 days of activity in a row", uz: "Ketma-ket 7 kun faollik" },
  "ach.halfway":       { ru: "Половина пути", en: "Halfway There", uz: "Yarim yo'l" },
  "ach.halfway.d":     { ru: "Пройти 6 модулей из 11", en: "Complete 6 out of 11 modules", uz: "11 dan 6 ta modulni yakunlash" },
  "ach.honor":         { ru: "Отличник", en: "Honor Student", uz: "A'lochi" },
  "ach.honor.d":       { ru: "Все тесты сдать на 90%+", en: "Score 90%+ on all tests", uz: "Barcha testlardan 90%+ to'plash" },
  "ach.streak-30":     { ru: "Марафонец", en: "Marathoner", uz: "Marafonchi" },
  "ach.streak-30.d":   { ru: "30 дней активности подряд", en: "30 days of activity in a row", uz: "Ketma-ket 30 kun faollik" },
  "ach.graduate":      { ru: "Выпускник", en: "Graduate", uz: "Bitiruvchi" },
  "ach.graduate.d":    { ru: "Завершить все 11 модулей курса", en: "Complete all 11 course modules", uz: "Kursning barcha 11 modulini yakunlash" },

  // Reading aids
  "toc.title":         { ru: "Содержание", en: "Table of contents", uz: "Mundarija" },
  "reading.progress":  { ru: "Прогресс чтения", en: "Reading progress", uz: "O'qish jarayoni" },

  // PDF download
  // Печать и PDF (запрос автора «распечатывать и скачивать в красивом PDF
  // во всех модулях», 2026-07-25). Подписи без эмодзи — иконку кнопки
  // подставляет printBarHtml() отдельно, иначе она попадала бы и в
  // title/aria и читалась бы вслух экранной читалкой.
  "print.print":       { ru: "Распечатать", en: "Print", uz: "Chop etish" },
  "print.pdf":         { ru: "Скачать PDF", en: "Download PDF", uz: "PDF yuklab olish" },
  "print.quick":       { ru: "Быстро", en: "Quick", uz: "Tez" },
  "print.quickHint":   { ru: "Скачать одним кликом. Внутри картинка — текст нельзя выделить и найти поиском, файл тяжелее.", en: "One-click download. The file contains an image — text is not selectable or searchable, and the file is heavier.", uz: "Bir marta bosish bilan yuklab olish. Ichida rasm — matnni tanlash va qidirish mumkin emas, fayl ancha og'ir." },
  "print.hintTitle":   { ru: "Как сохранить в PDF", en: "How to save as PDF", uz: "PDF sifatida qanday saqlash" },
  "print.hintText":    { ru: "Сейчас откроется окно печати. В списке принтеров выберите «Сохранить как PDF» — так текст в файле останется настоящим: его можно выделять и искать, а арабская вязь напечатается ровно.", en: "The print dialog will open next. In the printer list choose \"Save as PDF\" — this keeps the text real: you can select and search it, and the Arabic script prints cleanly.", uz: "Hozir chop etish oynasi ochiladi. Printerlar ro'yxatidan \"PDF sifatida saqlash\"ni tanlang — shunda fayldagi matn haqiqiy bo'lib qoladi: uni tanlash va qidirish mumkin, arab yozuvi ham tekis chiqadi." },
  // Номера страниц браузер умеет ставить только сам, своей галочкой
  // «Колонтитулы» — CSS-правило @page { @bottom-center } поддерживают лишь
  // серверные генераторы PDF, в браузерах оно не работает. Поэтому не
  // обещаем номера молча, а подсказываем, где их включить.
  "print.hintPages":   { ru: "Нужны номера страниц — включите в том же окне галочку «Колонтитулы».", en: "If you want page numbers, tick \"Headers and footers\" in the same dialog.", uz: "Sahifa raqamlari kerak bo'lsa, xuddi shu oynada \"Kolontitullar\" bandini belgilang." },
  "print.hintGo":      { ru: "Открыть окно печати", en: "Open print dialog", uz: "Chop etish oynasini ochish" },
  "print.author":      { ru: "Лекарь Абу Мухаммад", en: "Healer Abu Muhammad", uz: "Tabib Abu Muhammad" },
  "print.foot":        { ru: "Онлайн-школа рукии · t.me/ruqoq", en: "Online Ruqyah School · t.me/ruqoq", uz: "Onlayn ruqya maktabi · t.me/ruqoq" },
  "module.allModules": { ru: "← Все модули", en: "← All modules", uz: "← Barcha modullar" },
  "pdf.preparing":     { ru: "Подготовка…", en: "Preparing…", uz: "Tayyorlanmoqda…" },
  "pdf.error":         { ru: "Не удалось создать PDF — попробуйте ещё раз.", en: "Failed to create PDF — please try again.", uz: "PDF yaratib bo'lmadi — qayta urinib ko'ring." },

  // Auth pages
  "auth.signinTitle":  { ru: "Вход", en: "Sign in", uz: "Kirish" },
  "auth.signinNote":   { ru: "Один экран входа для учеников и администратора — роль определяется автоматически после входа.", en: "Single sign-in for students and admin — role is determined automatically.", uz: "Talabalar va admin uchun yagona kirish — rol avtomatik aniqlanadi." },
  "auth.signinBtn":    { ru: "Войти", en: "Sign in", uz: "Kirish" },
  "auth.signingIn":    { ru: "Вход…", en: "Signing in…", uz: "Kirish…" },
  "auth.signupTitle":  { ru: "Регистрация", en: "Sign up", uz: "Ro'yxatdan o'tish" },
  "auth.signupNote":   { ru: "Сразу открыты бесплатные ознакомительные отрывки книг. Полный курс (30 000 ₽) — после оплаты в личке (t.me/ruqoq) и подтверждения администратором.", en: "Free preview excerpts available immediately. Full course (30,000 ₽) — after payment via DM (t.me/ruqoq) and admin confirmation.", uz: "Bepul tanishuv parchalaridan foydalanish mumkin. To'liq kurs (30 000 ₽) — to'lovdan so'ng (t.me/ruqoq) va admin tasdig'idan keyin." },
  "auth.signupBtn":    { ru: "Зарегистрироваться", en: "Sign up", uz: "Ro'yxatdan o'tish" },
  "auth.signingUp":    { ru: "Регистрация…", en: "Signing up…", uz: "Ro'yxatdan o'tish…" },
  "auth.noAccount":    { ru: "Нет аккаунта?", en: "No account?", uz: "Hisobingiz yo'qmi?" },
  "auth.hasAccount":   { ru: "Уже есть аккаунт?", en: "Already have an account?", uz: "Hisobingiz bormi?" },
  "auth.showPw":       { ru: "Показать пароль", en: "Show password", uz: "Parolni ko'rsatish" },
  "auth.hidePw":       { ru: "Скрыть пароль", en: "Hide password", uz: "Parolni yashirish" },
  "auth.enterEmail":   { ru: "Введите email", en: "Enter your email", uz: "Emailingizni kiriting" },
  "auth.resetSent":    { ru: "Ссылка для сброса пароля отправлена на", en: "Password reset link sent to", uz: "Parolni tiklash havolasi yuborildi:" },
  "auth.pwHint":       { ru: "Минимум 6 символов.", en: "Minimum 6 characters.", uz: "Kamida 6 belgi." },

  // Tests page
  "tests.subtitle":    { ru: "Экзамен по каждой прочитанной книге — короткий, сразу после чтения (порог 70%). Итоговый тест — по всему модулю целиком.", en: "Short exam after each book (70% threshold). Final test covers the entire module.", uz: "Har bir kitobdan so'ng qisqa imtihon (70% chegara). Yakuniy test butun modulni qamrab oladi." },
  "tests.passed":      { ru: "Сдано", en: "Passed", uz: "Topshirildi" },
  "tests.failed":      { ru: "Не сдано", en: "Failed", uz: "Topshirilmadi" },
  "tests.notStarted":  { ru: "Не начато", en: "Not started", uz: "Boshlanmagan" },
  "tests.avgScore":    { ru: "Средний балл", en: "Average score", uz: "O'rtacha ball" },
  "tests.all":         { ru: "Все", en: "All", uz: "Barchasi" },
  "tests.allDone":     { ru: "Всё сдано", en: "All passed", uz: "Barchasi topshirildi" },
  "tests.noBookExams": { ru: "Отдельных экзаменов по книгам нет — только итоговый тест.", en: "No separate book exams — final test only.", uz: "Alohida kitob imtihonlari yo'q — faqat yakuniy test." },
  "tests.moduleTest":  { ru: "Итоговый тест по модулю", en: "Module final test", uz: "Modul yakuniy testi" },

  // Quiz page
  "quiz.notFound":     { ru: "Экзамен не найден.", en: "Exam not found.", uz: "Imtihon topilmadi." },
  "quiz.notReady":     { ru: "Тест пока не готов.", en: "Test not ready yet.", uz: "Test hali tayyor emas." },
  "quiz.abort":        { ru: "← Прервать тест", en: "← Abort test", uz: "← Testni to'xtatish" },
  "quiz.prev":         { ru: "← Назад", en: "← Back", uz: "← Orqaga" },
  "quiz.forward":      { ru: "Далее →", en: "Next →", uz: "Keyingi →" },
  "quiz.finishBtn":    { ru: "Завершить ✓", en: "Finish ✓", uz: "Yakunlash ✓" },
  "quiz.correct":      { ru: "✅ Верно!", en: "✅ Correct!", uz: "✅ To'g'ri!" },
  "quiz.incorrect":    { ru: "❌ Неверно — правильный ответ отмечен выше.", en: "❌ Incorrect — correct answer marked above.", uz: "❌ Noto'g'ri — to'g'ri javob yuqorida belgilangan." },
  "quiz.passLine":     { ru: "Порог прохождения", en: "Pass threshold", uz: "O'tish chegarasi" },
  "quiz.correctCount": { ru: "правильных", en: "correct", uz: "to'g'ri" },
  "quiz.timeSpent":    { ru: "затрачено", en: "spent", uz: "sarflangan" },
  "quiz.min":          { ru: "мин", en: "min", uz: "daq" },
  "quiz.sec":          { ru: "сек", en: "sec", uz: "son" },
  "quiz.saveFailed":   { ru: "Не удалось сохранить результат. Попробуйте ещё раз позже.", en: "Could not save result. Try again later.", uz: "Natijani saqlash imkoni bo'lmadi. Keyinroq qayta urinib ko'ring." },
  "quiz.notLoggedIn":  { ru: "Вы не вошли — результат не сохранён.", en: "You're not signed in — result not saved.", uz: "Siz tizimga kirmadingiz — natija saqlanmadi." },
  "quiz.backModule":   { ru: "Вернуться к модулю", en: "Back to module", uz: "Modulga qaytish" },
  "quiz.backDash":     { ru: "Вернуться в кабинет", en: "Back to dashboard", uz: "Kabinetga qaytish" },
  "quiz.reviewTitle":  { ru: "Разбор ответов", en: "Answer review", uz: "Javoblar tahlili" },
  "quiz.yourAnswer":   { ru: "Ваш ответ", en: "Your answer", uz: "Sizning javobingiz" },
  "quiz.rightAnswer":  { ru: "Правильный ответ", en: "Correct answer", uz: "To'g'ri javob" },
  "quiz.guestWall":    { ru: "Зарегистрируйтесь, чтобы пройти тест", en: "Sign up to take the test", uz: "Testni topshirish uchun ro'yxatdan o'ting" },
  "quiz.guestNote":    { ru: "Экзамены — часть платного курса. Регистрация бесплатна.", en: "Exams are part of the paid course. Registration is free.", uz: "Imtihonlar pullik kursning bir qismi. Ro'yxatdan o'tish bepul." },
  "quiz.freeSignup":   { ru: "Зарегистрироваться бесплатно", en: "Sign up for free", uz: "Bepul ro'yxatdan o'tish" },
  "quiz.haveAccount":  { ru: "Уже есть аккаунт? Войти", en: "Have an account? Sign in", uz: "Hisobingiz bormi? Kirish" },
  "quiz.paidWall":     { ru: "Экзамены открываются после оплаты курса", en: "Exams unlock after course payment", uz: "Imtihonlar kurs to'lovidan keyin ochiladi" },
  "quiz.paidNote":     { ru: "Пока доступны бесплатные ознакомительные отрывки книг.", en: "Free preview excerpts are available.", uz: "Bepul tanishuv parchalaridan foydalanish mumkin." },
  "quiz.contactTg":    { ru: "Написать лекарю в Telegram", en: "Contact healer on Telegram", uz: "Tabibga Telegramda yozish" },
  "quiz.accessError":  { ru: "Не удалось проверить доступ.", en: "Could not verify access.", uz: "Ruxsatni tekshirib bo'lmadi." },

  // Dashboard
  "dash.greeting":     { ru: "Здравствуйте", en: "Hello", uz: "Assalomu alaykum" },
  "dash.salam":        { ru: "Ассаляму алейкум ва рахматуллах", en: "Assalamu Alaykum wa Rahmatullah", uz: "Assalomu alaykum va rohmatulloh" },
  "dash.title":        { ru: "Кабинет ученика", en: "Student Dashboard", uz: "Talaba kabineti" },
  "dash.courseProgress":{ ru: "Прогресс курса", en: "Course progress", uz: "Kurs progressi" },
  "dash.avgScore":     { ru: "Средний балл тестов", en: "Average test score", uz: "O'rtacha test balli" },
  "dash.daysInRow":    { ru: "Дней подряд", en: "Days in a row", uz: "Ketma-ket kunlar" },
  "dash.payStatus":    { ru: "Статус оплаты", en: "Payment status", uz: "To'lov holati" },
  "dash.paid":         { ru: "Оплачено", en: "Paid", uz: "To'langan" },
  "dash.trial":        { ru: "Ознакомительный", en: "Trial", uz: "Tanishuv" },
  "dash.passed":       { ru: "Пройден", en: "Passed", uz: "O'tildi" },
  "dash.inProgressSt": { ru: "В процессе", en: "In progress", uz: "Jarayonda" },
  "dash.notStartedSt": { ru: "Не начат", en: "Not started", uz: "Boshlanmagan" },
  "dash.afterPay":     { ru: "после оплаты", en: "after payment", uz: "to'lovdan keyin" },
  "dash.reviewFlag":   { ru: "Стоит повторить", en: "Review recommended", uz: "Takrorlash tavsiya etiladi" },
  "dash.books":        { ru: "Книги курса", en: "Course books", uz: "Kurs kitoblari" },
  "dash.nextUp":       { ru: "Дальше в программе", en: "Up next", uz: "Keyingisi dasturda" },
  "dash.continueRead": { ru: "Продолжить чтение →", en: "Continue reading →", uz: "O'qishni davom ettirish →" },
  "dash.openMod":      { ru: "Открыть модуль →", en: "Open module →", uz: "Modulni ochish →" },
  "dash.allModsDone":  { ru: "Все модули курса пройдены 🎉", en: "All course modules completed 🎉", uz: "Barcha kurs modullari yakunlandi 🎉" },
  "dash.getCert":      { ru: "Получить сертификат", en: "Get certificate", uz: "Sertifikat olish" },
  "dash.mentorChat":   { ru: "Сообщения от наставника", en: "Messages from mentor", uz: "Ustoz xabarlari" },
  "dash.msgPlaceholder":{ ru: "Написать сообщение…", en: "Write a message…", uz: "Xabar yozish…" },
  "dash.logout":       { ru: "Выйти", en: "Sign out", uz: "Chiqish" },
  "dash.unpaidTitle":  { ru: "Полный доступ ещё не открыт", en: "Full access not yet unlocked", uz: "To'liq kirish hali ochilmagan" },
  "dash.contactTg":    { ru: "Написать в Telegram", en: "Contact on Telegram", uz: "Telegramda yozish" },
  "dash.certBanner":   { ru: "🎓 Сертификат получен!", en: "🎓 Certificate received!", uz: "🎓 Sertifikat olindi!" },
  "dash.openCert":     { ru: "Открыть сертификат →", en: "Open certificate →", uz: "Sertifikatni ochish →" },
  "dash.checkLogin":   { ru: "Проверка входа…", en: "Checking login…", uz: "Kirish tekshirilmoqda…" },
  "dash.loadError":    { ru: "Не удалось загрузить кабинет — проверьте связь с интернетом.", en: "Could not load dashboard — check internet connection.", uz: "Kabinetni yuklab bo'lmadi — internet aloqangizni tekshiring." },
  "dash.welcomeBack":  { ru: "С возвращением!", en: "Welcome back!", uz: "Qaytganingiz bilan!" },
  "dash.earned":       { ru: "✓ Получено", en: "✓ Earned", uz: "✓ Olingan" },
  "dash.howItWorks":   { ru: "Как устроено обучение", en: "How the course works", uz: "Kurs qanday ishlaydi" },
  "dash.onboard1":     { ru: "Читайте бесплатные ознакомительные отрывки любой книги ниже — без оплаты.", en: "Read free preview excerpts of any book below — no payment required.", uz: "Quyidagi har qanday kitobning bepul tanishuv parchalarini o'qing — to'lovsiz." },
  "dash.onboard2":     { ru: "Готовы продолжить полным курсом — напишите в Telegram, лекарь откроет доступ вручную.", en: "Ready for the full course — message on Telegram, the healer will grant access manually.", uz: "To'liq kursga tayyormisiz — Telegramga yozing, tabib kirishni ochadi." },
  "dash.onboard3":     { ru: "После каждой книги — короткий экзамен (порог 70%), после каждого модуля — итоговый тест.", en: "After each book — a short exam (70% threshold), after each module — a final test.", uz: "Har bir kitobdan so'ng — qisqa imtihon (70% chegara), har bir moduldan so'ng — yakuniy test." },
  "dash.onboardDismiss":{ ru: "Понятно, скрыть", en: "Got it, hide", uz: "Tushundim, yashirish" },
  "dash.unpaidText":   { ru: "Пока доступны бесплатные ознакомительные отрывки всех книг курса. Чтобы открыть полный текст, экзамены и весь курс целиком — 30 000 ₽, напишите лекарю Абу Мухаммаду в Telegram, доступ откроется вручную после оплаты.", en: "Free preview excerpts of all course books are available. To unlock the full text, exams and the entire course — 30,000 ₽, message healer Abu Muhammad on Telegram, access will be granted manually after payment.", uz: "Barcha kurs kitoblarining bepul tanishuv parchalari mavjud. To'liq matn, imtihonlar va butun kursni ochish uchun — 30 000 ₽, tabib Abu Muhammadga Telegramda yozing, to'lovdan keyin kirish qo'lda ochiladi." },
  "dash.inactiveDays": { ru: "Вы не заходили {n} дн. — прогресс никуда не делся, продолжите с того же места ниже.", en: "You haven't visited for {n} days — your progress is saved, continue where you left off below.", uz: "Siz {n} kun kirmadingiz — progressingiz saqlanmoqda, quyida davom eting." },
  "dash.certNote":     { ru: "Наставник выдал вам сертификат о завершении курса.", en: "Your mentor has issued a course completion certificate.", uz: "Ustoz sizga kursni yakunlash sertifikatini berdi." },
  "dash.rukyaProTitle":{ ru: "🎓 RUKYA PRO — программа для приёма пациентов", en: "🎓 RUKYA PRO — patient reception software", uz: "🎓 RUKYA PRO — bemorlarni qabul qilish dasturi" },
  "dash.rukyaProNote": { ru: "Поздравляем! Вам открыт доступ к профессиональной программе RUKYA PRO. Она работает офлайн, без браузера — все данные хранятся только на вашем компьютере.", en: "Congratulations! You have access to the professional RUKYA PRO software. It works offline, no browser needed — all data stays on your computer.", uz: "Tabriklaymiz! Sizga RUKYA PRO professional dasturiga kirish ochildi. U oflayn ishlaydi, brauzer kerak emas — barcha ma'lumotlar faqat kompyuteringizda saqlanadi." },
  "dash.rukyaProBtn":  { ru: "Скачать RUKYA PRO (.exe, ~87 МБ) →", en: "Download RUKYA PRO (.exe, ~87 MB) →", uz: "RUKYA PRO yuklash (.exe, ~87 MB) →" },
  "dash.rukyaProSS":   { ru: "При первом запуске Windows может показать предупреждение SmartScreen — нажмите «Подробнее» → «Выполнить в любом случае».", en: "On first launch Windows may show a SmartScreen warning — click \"More info\" → \"Run anyway\".", uz: "Birinchi ishga tushirishda Windows SmartScreen ogohlantirishini ko'rsatishi mumkin — \"Batafsil\" → \"Baribir ishga tushirish\" tugmasini bosing." },
  "dash.congratsTitle":{ ru: "Поздравляем!", en: "Congratulations!", uz: "Tabriklaymiz!" },
  "dash.congratsText": { ru: "Вы прошли обучение и теперь можете принимать реальных пациентов и работать с ними. Пусть Аллах сделает вас причиной исцеления людей и примет ваши усилия.", en: "You have completed the training and can now see real patients. May Allah make you a means of healing and accept your efforts.", uz: "Siz ta'limni yakunladingiz va endi haqiqiy bemorlarni qabul qilishingiz mumkin. Alloh sizni odamlarni davolash sababchisi qilsin va harakatlaringizni qabul qilsin." },
  "dash.congratsNote": { ru: "Программа RUKYA PRO скачивается. Установите её и начните вести приём пациентов.", en: "RUKYA PRO is downloading. Install it and start seeing patients.", uz: "RUKYA PRO yuklanmoqda. Uni o'rnating va bemorlarni qabul qilishni boshlang." },
  "dash.msgSent":      { ru: "Сообщение отправлено", en: "Message sent", uz: "Xabar yuborildi" },
  "dash.msgFailed":    { ru: "Не удалось отправить — проверьте соединение", en: "Failed to send — check connection", uz: "Yuborib bo'lmadi — aloqani tekshiring" },
  "dash.voiceSent":    { ru: "Голосовое отправлено", en: "Voice message sent", uz: "Ovozli xabar yuborildi" },
  "dash.videoSent":    { ru: "Видео отправлено", en: "Video sent", uz: "Video yuborildi" },
  "dash.fileSent":     { ru: "Файл отправлен", en: "File sent", uz: "Fayl yuborildi" },
  "dash.msgLoadError": { ru: "Не удалось загрузить сообщения.", en: "Could not load messages.", uz: "Xabarlarni yuklab bo'lmadi." },
  "dash.retryBtn":     { ru: "Повторить", en: "Retry", uz: "Qayta urinish" },
  "dash.stopRec":      { ru: "Остановить", en: "Stop", uz: "To'xtatish" },
  "dash.chatAriaLabel":{ ru: "Сообщение наставнику (Enter — отправить, Shift+Enter — новая строка)", en: "Message to mentor (Enter — send, Shift+Enter — new line)", uz: "Ustozga xabar (Enter — yuborish, Shift+Enter — yangi qator)" },
  "dash.voiceAriaLabel":{ ru: "Записать голосовое сообщение", en: "Record voice message", uz: "Ovozli xabar yozish" },
  "dash.videoAriaLabel":{ ru: "Записать видеообращение", en: "Record video message", uz: "Video xabar yozish" },
  "dash.fileAriaLabel": { ru: "Прикрепить файл", en: "Attach file", uz: "Fayl biriktirish" },
  "dash.module":       { ru: "Модуль", en: "Module", uz: "Modul" },
  "dash.continueLearn":{ ru: "Продолжить обучение", en: "Continue learning", uz: "O'qishni davom ettirish" },

  // ── Chat ──
  "chat.today":     { ru: "Сегодня", en: "Today", uz: "Bugun" },
  "chat.yesterday": { ru: "Вчера", en: "Yesterday", uz: "Kecha" },
  "chat.empty":     { ru: "Сообщений пока нет", en: "No messages yet", uz: "Hozircha xabarlar yo'q" },
  "chat.emptyHint": { ru: "Напишите первое сообщение, чтобы начать переписку", en: "Send the first message to start the conversation", uz: "Suhbatni boshlash uchun birinchi xabarni yuboring" },
  "chat.play":      { ru: "Воспроизвести", en: "Play", uz: "Ijro etish" },
  "chat.videoError":{ ru: "Не удалось загрузить видео", en: "Failed to load video", uz: "Videoni yuklab bo'lmadi" },
  "chat.micError":  { ru: "Не удалось получить доступ к микрофону", en: "Microphone access denied", uz: "Mikrofonga ruxsat berilmadi" },
  "chat.camError":  { ru: "Не удалось получить доступ к камере и микрофону", en: "Camera and microphone access denied", uz: "Kamera va mikrofonga ruxsat berilmadi" },
  "chat.recVoice":  { ru: "Записать голосовое сообщение", en: "Record voice message", uz: "Ovozli xabar yozish" },
  "chat.recVideo":  { ru: "Записать видеообращение", en: "Record video message", uz: "Video xabar yozish" },
  "chat.attachFile":{ ru: "Прикрепить файл", en: "Attach file", uz: "Fayl biriktirish" },
  "chat.stop":      { ru: "Остановить", en: "Stop", uz: "To'xtatish" },
  // Мессенджер наставника + правка/удаление/поиск (запрос автора, 2026-07-25)
  "chat.messenger":     { ru: "Переписка", en: "Messages", uz: "Yozishmalar" },
  "chat.openThread":    { ru: "Открыть переписку с учеником", en: "Open conversation with student", uz: "O'quvchi bilan yozishmani ochish" },
  "chat.pickThread":    { ru: "Выберите ученика слева, чтобы открыть переписку.", en: "Pick a student on the left to open the conversation.", uz: "Yozishmani ochish uchun chapdan o'quvchini tanlang." },
  "chat.backToList":    { ru: "К списку диалогов", en: "Back to conversations", uz: "Suhbatlar ro'yxatiga" },
  "chat.searchThreads": { ru: "Поиск по ученикам…", en: "Search students…", uz: "O'quvchilarni qidirish…" },
  "chat.searchMessages":{ ru: "Поиск по сообщениям…", en: "Search messages…", uz: "Xabarlarni qidirish…" },
  "chat.noThreads":     { ru: "Ничего не найдено", en: "Nothing found", uz: "Hech narsa topilmadi" },
  "chat.noMatches":     { ru: "Совпадений нет", en: "No matches", uz: "Mos keluvchi yo'q" },
  "chat.noMessages":    { ru: "Переписки ещё не было", en: "No conversation yet", uz: "Hali yozishma yo'q" },
  "chat.filterAll":     { ru: "Все", en: "All", uz: "Hammasi" },
  "chat.filterUnread":  { ru: "Непрочитанные", en: "Unread", uz: "O'qilmagan" },
  "chat.you":           { ru: "Вы", en: "You", uz: "Siz" },
  "chat.progress":      { ru: "прогресс", en: "progress", uz: "progress" },
  "chat.voiceMsg":      { ru: "Голосовое сообщение", en: "Voice message", uz: "Ovozli xabar" },
  "chat.videoMsg":      { ru: "Видеосообщение", en: "Video message", uz: "Video xabar" },
  "chat.fileMsg":       { ru: "Файл", en: "File", uz: "Fayl" },
  "chat.replyAria":     { ru: "Ответ ученику (Enter — отправить, Shift+Enter — новая строка)", en: "Reply to student (Enter to send, Shift+Enter for a new line)", uz: "O'quvchiga javob (Enter — yuborish, Shift+Enter — yangi qator)" },
  "chat.replyPlaceholder": { ru: "Написать сообщение…", en: "Write a message…", uz: "Xabar yozish…" },
  "chat.loadError":     { ru: "Не удалось загрузить переписку", en: "Failed to load the conversation", uz: "Yozishmani yuklab bo'lmadi" },
  "chat.actions":       { ru: "Действия с сообщением", en: "Message actions", uz: "Xabar amallari" },
  "chat.edit":          { ru: "Изменить", en: "Edit", uz: "O'zgartirish" },
  "chat.delete":        { ru: "Удалить", en: "Delete", uz: "O'chirish" },
  "chat.edited":        { ru: "изменено", en: "edited", uz: "o'zgartirilgan" },
  "chat.editPrompt":    { ru: "Изменить сообщение:", en: "Edit message:", uz: "Xabarni o'zgartirish:" },
  "chat.confirmDelete": { ru: "Удалить это сообщение? Действие необратимо.", en: "Delete this message? This cannot be undone.", uz: "Bu xabar o'chirilsinmi? Amalni qaytarib bo'lmaydi." },
  "chat.editedOk":      { ru: "Сообщение изменено", en: "Message edited", uz: "Xabar o'zgartirildi" },
  "chat.deletedOk":     { ru: "Сообщение удалено", en: "Message deleted", uz: "Xabar o'chirildi" },
  "chat.voiceSent":     { ru: "Голосовое отправлено", en: "Voice message sent", uz: "Ovozli xabar yuborildi" },
  "chat.videoSent":     { ru: "Видео отправлено", en: "Video sent", uz: "Video yuborildi" },
  "chat.fileSent":      { ru: "Файл отправлен", en: "File sent", uz: "Fayl yuborildi" },
  "chat.unreadAria":    { ru: "непрочитанных сообщений", en: "unread messages", uz: "o'qilmagan xabar" },
  "chat.sendFailed":    { ru: "Сообщение не отправлено — проверьте связь. Текст сохранён в поле.", en: "Message not sent — check your connection. The text is kept in the box.", uz: "Xabar yuborilmadi — aloqani tekshiring. Matn maydonda saqlandi." },
  "chat.toBottom":      { ru: "К последним сообщениям", en: "Jump to latest", uz: "So'nggi xabarlarga" },

  // ── Landing page ──
  "landing.title":      { ru: "Онлайн-школа рукии — лечение Кораном и Сунной", en: "Online Ruqyah School — Healing through Quran and Sunnah", uz: "Onlayn ruqya maktabi — Qur'on va Sunna bilan davolash" },
  "landing.desc":       { ru: "Курс подготовки заклинателя (раки): от основ убеждённости до самостоятельного приёма пациентов через RUKYA Pro.", en: "Healer (raqi) training course: from foundations of faith to independent patient practice through RUKYA Pro.", uz: "Tabib (roqiy) tayyorlash kursi: imon asoslaridan RUKYA Pro orqali mustaqil bemorlarni qabul qilishgacha." },
  "landing.stat.modules":  { ru: "модулей курса", en: "course modules", uz: "kurs modullari" },
  "landing.stat.books":    { ru: "книг с отдельным экзаменом", en: "books with individual exams", uz: "alohida imtihonli kitoblar" },
  "landing.stat.content":  { ru: "контента промаркировано по источнику", en: "of content marked by source", uz: "kontent manbasi bo'yicha belgilangan" },
  "landing.stat.payment":  { ru: "один платёж за весь курс", en: "one payment for the full course", uz: "butun kurs uchun bitta to'lov" },
  "landing.ayah":       { ru: "«…то, что является исцелением и милостью для верующих»", en: "\"…that which is a healing and a mercy for the believers\"", uz: "\"…mo'minlar uchun shifo va rahmat bo'lgan narsani\"" },
  "landing.ayah.src":   { ru: "Сура аль-Исра · 17:82", en: "Surah al-Isra · 17:82", uz: "Isro surasi · 17:82" },
  "landing.teaser.eyebrow": { ru: "Из Урока 1 — «Основа основ», открыт бесплатно", en: "From Lesson 1 — \"Foundation of Foundations\", free access", uz: "1-darsdan — \"Asoslar asosi\", bepul ochiq" },
  "landing.teaser.quote":   { ru: "Сила заклинания — не в самих словах, а в убеждённости сердца, обращённого к Аллаху.", en: "The power of incantation lies not in the words themselves, but in the conviction of a heart turned to Allah.", uz: "Afsunning kuchi so'zlarning o'zida emas, balki Allohga yo'naltirilgan qalbning ishonchidadir." },
  "landing.teaser.note":    { ru: "Так заканчивается самый первый урок курса — прежде чем переходить к формулам, ученик разбирает, почему они вообще действуют.", en: "This is how the very first lesson ends — before moving to formulas, the student understands why they work at all.", uz: "Birinchi dars aynan shunday yakunlanadi — formulalarga o'tishdan oldin talaba ularning nima uchun ishlashini tushunadi." },
  "landing.teaser.cta": { ru: "Читать Урок 1 бесплатно →", en: "Read Lesson 1 for free →", uz: "1-darsni bepul o'qish →" },
  "landing.why.title":  { ru: "Почему именно этот курс", en: "Why this course", uz: "Nega aynan bu kurs" },
  "landing.why.subtitle": { ru: "Не обещание «стать мастером за неделю» — прозрачность источников, реальная ответственность и рабочий инструмент после выпуска.", en: "Not a promise to \"become a master in a week\" — transparent sources, real responsibility, and a working tool after graduation.", uz: "\"Bir haftada usta bo'lish\" va'dasi emas — manba shaffofligi, haqiqiy mas'uliyat va bitirganidan keyin ishchi vosita." },
  "landing.why.1.title": { ru: "Прозрачность источников", en: "Source transparency", uz: "Manba shaffofligi" },
  "landing.why.1.text":  { ru: "Каждая книга и каждая формула помечены: прямая цитата Корана и Сунны, устоявшаяся практика или авторская методика — открыто, без выдачи одного за другое.", en: "Every book and formula is labeled: direct Quran and Sunnah quote, established practice, or author's method — openly, without misrepresentation.", uz: "Har bir kitob va formula belgilangan: Qur'on va Sunna iqtibosi, o'rnatilgan amaliyot yoki muallif usuli — ochiq, birini boshqasi deb ko'rsatmasdan." },
  "landing.why.2.title": { ru: "Безопасность пациента — не оговорка, а правило", en: "Patient safety — not a caveat, but a rule", uz: "Bemor xavfsizligi — shart emas, balki qoida" },
  "landing.why.2.text":  { ru: "Диагностика никогда не строится на боли или надавливании. Страдание и мольба пациента никогда не трактуются как «манипуляция» — это встроено в сам курс, а не приписано потом.", en: "Diagnostics never rely on pain or pressure. Patient suffering and supplication are never interpreted as \"manipulation\" — this is built into the course, not added later.", uz: "Diagnostika hech qachon og'riq yoki bosimga asoslanmaydi. Bemorning azob chekishi va iltijosi hech qachon \"manipulyatsiya\" deb talqin qilinmaydi — bu kursga o'rnatilgan, keyin qo'shilmagan." },
  "landing.why.3.title": { ru: "Не только теория — рабочий инструмент", en: "Not just theory — a working tool", uz: "Faqat nazariya emas — ishchi vosita" },
  "landing.why.3.text":  { ru: "Выпускник получает не просто сертификат, а систему RUKYA Pro: карточки пациентов, план исцеления, библиотеку формул с указанием источника — приём пациентов начинается не с чистого листа.", en: "Graduates receive not just a certificate, but the RUKYA Pro system: patient cards, healing plans, formula library with sources — patient practice doesn't start from scratch.", uz: "Bitiruvchi nafaqat sertifikat, balki RUKYA Pro tizimini oladi: bemor kartalari, davolash rejasi, manbali formulalar kutubxonasi — bemorlarni qabul qilish noldan boshlanmaydi." },
  "landing.why.4.title": { ru: "Экзамен по каждой книге, а не один тест «по всему»", en: "Exam per book, not one test for everything", uz: "Har bir kitob bo'yicha imtihon, barchasi uchun bitta emas" },
  "landing.why.4.text":  { ru: "16 отдельных экзаменов с порогом 70% и правом пересдачи — знания проверяются по мере усвоения, а не одной галочкой в конце курса.", en: "16 separate exams with a 70% threshold and retake option — knowledge is tested as you learn, not with one checkbox at the end.", uz: "70% chegarali 16 ta alohida imtihon va qayta topshirish imkoniyati — bilim o'zlashtirilganda tekshiriladi, oxiridagi bitta belgi bilan emas." },
  "landing.why.5.title": { ru: "Личная проверка автора", en: "Author's personal verification", uz: "Muallifning shaxsiy tekshiruvi" },
  "landing.why.5.text":  { ru: "Абу Мухаммад лично триажировал 25 источников, прежде чем включить их в программу, и лично подтверждает оплату и доступ каждого ученика — не автоматическая воронка.", en: "Abu Muhammad personally triaged 25 sources before including them in the program and personally confirms each student's payment and access — not an automated funnel.", uz: "Abu Muhammad dasturga kiritishdan oldin 25 ta manbani shaxsan tekshirdi va har bir talabaning to'lovi va kirishini shaxsan tasdiqlaydi — avtomatik tizim emas." },
  "landing.why.6.title": { ru: "Можно начать бесплатно, без риска", en: "Start free, no risk", uz: "Bepul boshlash, xavfsiz" },
  "landing.why.6.text":  { ru: "Ознакомительные отрывки всех книг курса открыты сразу после регистрации — платите 30 000 ₽ только когда сами убедитесь, что курс вам подходит.", en: "Preview excerpts of all course books are available right after registration — pay 30,000 ₽ only when you're sure the course is right for you.", uz: "Barcha kurs kitoblarining tanishuv parchalari ro'yxatdan o'tganingizdan so'ng darhol ochiladi — 30 000 ₽ faqat kurs sizga mos ekanligiga ishonch hosil qilganingizda to'lang." },
  "landing.who.title":  { ru: "Для кого этот курс", en: "Who is this course for", uz: "Bu kurs kim uchun" },
  "landing.who.subtitle": { ru: "Три уровня одного пути — от первого прочитанного аята до самостоятельного приёма пациентов. Начинать можно с нуля.", en: "Three levels of one path — from the first recited verse to independent patient practice. You can start from zero.", uz: "Bitta yo'lning uch darajasi — o'qilgan birinchi oyatdan mustaqil bemorlarni qabul qilishgacha. Noldan boshlash mumkin." },
  "landing.who.1.badge": { ru: "Начальный", en: "Beginner", uz: "Boshlang'ich" },
  "landing.who.1.title": { ru: "Ещё не читали рукью — ни разу", en: "Never performed ruqyah before", uz: "Hali ruqya o'qimagan — hech qachon" },
  "landing.who.1.text":  { ru: "Базового чтения Корана достаточно (таджвид желателен, но не обязателен на старте). Курс начинается с основ убеждённости (якына) — с нуля, без предварительных знаний фикха рукьи. Цель — научиться грамотно читать рукью себе и близким.", en: "Basic Quran reading is enough (tajweed preferred but not required at the start). The course starts with foundations of conviction (yaqin) — from zero, no prior knowledge of ruqyah fiqh needed. Goal: learn to properly perform ruqyah for yourself and your family.", uz: "Qur'onni asosiy o'qish yetarli (tajvid afzal, lekin boshida shart emas). Kurs ishonch asoslaridan (yaqin) boshlanadi — noldan, ruqya fiqhi bo'yicha oldingi bilim talab qilinmaydi. Maqsad — o'zingiz va yaqinlaringiz uchun ruqya o'qishni o'rganish." },
  "landing.who.1.modules": { ru: "Модули 1–3", en: "Modules 1–3", uz: "Modullar 1–3" },
  "landing.who.2.badge": { ru: "Средний", en: "Intermediate", uz: "O'rta" },
  "landing.who.2.title": { ru: "Знаете основы, хотите разобраться глубже", en: "Know the basics, want to go deeper", uz: "Asoslarni bilasiz, chuqurroq tushunmoqchisiz" },
  "landing.who.2.text":  { ru: "Углублённая диагностика — по словам самого пациента, никогда через боль или надавливание (Модуль 4) — и направленное применение рукьи к конкретному случаю, плюс полный арсенал защиты от сглаза, зависти и колдовства.", en: "Advanced diagnostics — based on patient's own words, never through pain or pressure (Module 4) — and targeted ruqyah application for specific cases, plus a full protection arsenal against evil eye, envy, and sorcery.", uz: "Chuqurlashtirilgan diagnostika — bemorning o'z so'zlari asosida, hech qachon og'riq yoki bosim orqali emas (4-modul) — va aniq holatlarga yo'naltirilgan ruqya qo'llash, shuningdek ko'z tegish, hasad va sehrdan to'liq himoya arsenali." },
  "landing.who.2.modules": { ru: "Модули 4–6", en: "Modules 4–6", uz: "Modullar 4–6" },
  "landing.who.3.badge": { ru: "Продвинутый", en: "Advanced", uz: "Yuqori" },
  "landing.who.3.title": { ru: "Готовитесь принимать пациентов", en: "Preparing to see patients", uz: "Bemorlarni qabul qilishga tayyorlanmoqdasiz" },
  "landing.who.3.text":  { ru: "Изгнание духовных сущностей, разбор реальных обезличенных кейсов под супервизией наставника и финальный практикум в системе RUKYA Pro — с этого уровня выпускник несёт ответственность за приём настоящих пациентов.", en: "Expulsion of spiritual entities, analysis of real anonymized cases under mentor supervision, and final practicum in RUKYA Pro — from this level, graduates are responsible for real patient care.", uz: "Ruhiy mavjudotlarni haydash, ustoz nazorati ostida haqiqiy anonim holatlarni tahlil qilish va RUKYA Pro da yakuniy amaliyot — shu darajadan boshlab bitiruvchi haqiqiy bemorlarni qabul qilish uchun javobgardir." },
  "landing.who.3.modules": { ru: "Модули 7–11", en: "Modules 7–11", uz: "Modullar 7–11" },
  "landing.how.title":  { ru: "Как проходит обучение", en: "How the course works", uz: "O'quv jarayoni qanday" },
  "landing.how.1.title": { ru: "Регистрация", en: "Registration", uz: "Ro'yxatdan o'tish" },
  "landing.how.1.text":  { ru: "Бесплатно, за минуту — email и пароль.", en: "Free, in a minute — email and password.", uz: "Bepul, bir daqiqada — email va parol." },
  "landing.how.2.title": { ru: "Читаете отрывки", en: "Read excerpts", uz: "Parchalarni o'qing" },
  "landing.how.2.text":  { ru: "Бесплатный ознакомительный кусок каждой книги — без оплаты, сразу после регистрации.", en: "Free preview of each book — no payment, right after registration.", uz: "Har bir kitobning bepul tanishuv bo'limi — to'lovsiz, ro'yxatdan o'tganingizdan so'ng darhol." },
  "landing.how.3.title": { ru: "Открываете курс целиком", en: "Unlock the full course", uz: "To'liq kursni oching" },
  "landing.how.3.text":  { ru: "30 000 ₽ — пишете лекарю в Telegram, он высылает реквизиты и вручную подтверждает доступ.", en: "30,000 ₽ — message the healer on Telegram, he sends payment details and manually confirms access.", uz: "30 000 ₽ — tabibga Telegramda yozing, u to'lov tafsilotlarini yuboradi va kirishni qo'lda tasdiqlaydi." },
  "landing.how.4.title": { ru: "Экзамен за экзаменом", en: "Exam after exam", uz: "Imtihondan keyin imtihon" },
  "landing.how.4.text":  { ru: "Тест после каждой книги и итоговый тест по модулю — до сертификата.", en: "Test after each book and a final module test — until the certificate.", uz: "Har bir kitobdan keyin test va modul yakuniy testi — sertifikatgacha." },
  "landing.how.note":   { ru: "Порядок необязателен — оплатить можно сразу, не дожидаясь отрывков.", en: "Order is optional — you can pay right away without waiting for excerpts.", uz: "Tartib shart emas — parchalarni kutmasdan darhol to'lashingiz mumkin." },
  "landing.video.title": { ru: "Видео о курсе", en: "Course video", uz: "Kurs videosi" },
  "landing.video.desc":  { ru: "«Рукья: анатомия предписания» — вводное видео о том, как устроен курс и что стоит за самим понятием заклинания. То же видео открывает Модуль 1.", en: "\"Ruqyah: Anatomy of Prescription\" — introductory video about the course structure and the concept behind incantation. Same video opens Module 1.", uz: "\"Ruqya: buyruq anatomiyasi\" — kurs tuzilishi va afsun tushunchasi haqida kirish videosi. Xuddi shu video 1-modulni ochadi." },
  "landing.path.title": { ru: "Путь ученика — все 11 модулей", en: "Student's Path — all 11 modules", uz: "Talaba yo'li — barcha 11 modul" },
  "landing.exams.title": { ru: "Экзамены и сертификат", en: "Exams and Certificate", uz: "Imtihonlar va sertifikat" },
  "landing.exams.text":  { ru: "После каждой прочитанной книги — короткий экзамен по ней самой (порог 70%), не общий тест «по всему сразу». После каждого модуля — итоговый тест. Все экзамены и их статус собраны на одной странице — «Тесты». Когда пройдены все 11 модулей, в кабинете открывается сертификат «Практик рукии» за подписью Абу Мухаммада — можно распечатать или сохранить как PDF.", en: "After each book — a short exam (70% threshold), not a general \"everything at once\" test. After each module — a final test. All exams and their status are on one page — \"Tests\". When all 11 modules are completed, a \"Ruqyah Practitioner\" certificate signed by Abu Muhammad opens in your dashboard — print or save as PDF.", uz: "Har bir kitobdan keyin — qisqa imtihon (70% chegara), umumiy \"barchasini bir yo'la\" test emas. Har bir moduldan keyin — yakuniy test. Barcha imtihonlar va ularning holati bitta sahifada — \"Testlar\". Barcha 11 modul yakunlanganda, Abu Muhammad imzolagan \"Ruqya amaliyotchisi\" sertifikati kabinetingizda ochiladi — chop etish yoki PDF sifatida saqlash mumkin." },
  "landing.exams.cta1":  { ru: "Посмотреть все тесты", en: "View all tests", uz: "Barcha testlarni ko'rish" },
  "landing.exams.cta2":  { ru: "Как выглядит сертификат", en: "See the certificate", uz: "Sertifikatni ko'rish" },
  "landing.pro.badge":   { ru: "Выдаётся только выпускникам курса", en: "Available only to course graduates", uz: "Faqat kurs bitiruvchilariga beriladi" },
  "landing.pro.title":   { ru: "Что вы получите вместе с сертификатом — система RUKYA Pro", en: "What you get with the certificate — RUKYA Pro system", uz: "Sertifikat bilan nima olasiz — RUKYA Pro tizimi" },
  "landing.pro.text":    { ru: "После завершения всех 11 модулей и сдачи всех экзаменов выпускник получает не только сертификат, но и рабочий инструмент для приёма настоящих пациентов: карточки пациентов, план исцеления по каждому случаю, библиотеку из проверенных по источнику формул (Коран/Сунна) и 99 имён Аллаха, автоматический разбор симптомов — как черновик для проверки, не готовое решение (окончательный диагноз всегда пишет и подписывает сам раки, см. Модуль 11). Приложение работает офлайн — данные пациентов хранятся на устройстве самого раки, не в облаке. Не продаётся и не выдаётся отдельно от курса — только тем, кто прошёл обучение полностью.", en: "After completing all 11 modules and passing all exams, graduates receive not just a certificate but a working tool for real patient care: patient cards, healing plans for each case, a source-verified formula library (Quran/Sunnah) and 99 Names of Allah, automatic symptom analysis — as a draft for review, not a final solution (the final diagnosis is always written and signed by the raqi himself, see Module 11). The app works offline — patient data stays on the raqi's device, not in the cloud. Not sold or issued separately from the course — only for those who completed the full training.", uz: "Barcha 11 modulni yakunlash va barcha imtihonlarni topshirgandan so'ng, bitiruvchi nafaqat sertifikat, balki haqiqiy bemorlarni qabul qilish uchun ishchi vositani oladi: bemor kartalari, har bir holat uchun davolash rejasi, manba bo'yicha tekshirilgan formulalar kutubxonasi (Qur'on/Sunna) va Allohning 99 ismi, avtomatik simptomlar tahlili — tekshirish uchun qoralama, tayyor yechim emas (yakuniy tashxisni har doim roqiyning o'zi yozadi va imzolaydi, 11-modulga qarang). Ilova oflayn ishlaydi — bemor ma'lumotlari roqiyning qurilmasida saqlanadi, bulutda emas. Kursdan alohida sotilmaydi yoki berilmaydi — faqat to'liq ta'limni yakunlaganlarga." },
  "landing.pro.cta":     { ru: "Подробнее о работе в системе", en: "Learn more about the system", uz: "Tizim haqida batafsil" },
  "landing.pro.cap1":    { ru: "Панель управления приёмом пациентов", en: "Patient management dashboard", uz: "Bemorlarni boshqarish paneli" },
  "landing.pro.cap2":    { ru: "Библиотека формул — каждая с указанием источника (Коран/Сунна)", en: "Formula library — each with source reference (Quran/Sunnah)", uz: "Formulalar kutubxonasi — har biri manba ko'rsatilgan (Qur'on/Sunna)" },
  "landing.author.name": { ru: "Лекарь Абу Мухаммад", en: "Healer Abu Muhammad", uz: "Tabib Abu Muhammad" },
  "landing.author.role": { ru: "Основатель школы · Практикующий лекарь по рукье", en: "School founder · Practicing ruqyah healer", uz: "Maktab asoschisi · Amaliy ruqya tabibi" },
  "landing.author.bio":  { ru: "Многие годы учёбы у разных шейхов; главный наставник — шейх Абдураззак аль-Азхар, часть наследия и опыта получил у Абу Захаби. Веду людей через духовные испытания — сихр, одержимость, айн и хасад — опираясь только на Коран и Сунну. Более 1600 публикаций, 284 голосовых урока, 7 направлений лечения. Курс из 25 книг прошёл триаж по критерию подлинности — каждый источник помечен открыто.", en: "Many years of study under various sheikhs; main mentor — Sheikh Abdurazzaq al-Azhar, part of his legacy and experience comes from Abu Zahabi. I guide people through spiritual trials — sihr, possession, ayn and hasad — relying solely on Quran and Sunnah. Over 1,600 publications, 284 audio lessons, 7 treatment methods. The 25-book course was triaged for authenticity — every source is openly labeled.", uz: "Turli shayxlar qo'lida ko'p yillik ta'lim; asosiy ustoz — Shayx Abdurazzaq al-Azhar, merosining bir qismi Abu Zahabiydan olindi. Odamlarni ruhiy sinovlardan — sehr, jin bosishi, ayn va hasad — faqat Qur'on va Sunnaga tayangan holda olib o'taman. 1600 dan ortiq nashrlar, 284 ovozli dars, 7 ta davolash usuli. 25 kitobli kurs haqiqiylik mezoniga ko'ra saralangan — har bir manba ochiq belgilangan." },
  "landing.author.cta":  { ru: "Подробнее об авторе →", en: "More about the author →", uz: "Muallif haqida batafsil →" },
  "landing.faq.title":   { ru: "Частые вопросы", en: "FAQ", uz: "Ko'p beriladigan savollar" },
  "landing.faq.1.q":     { ru: "Нужна ли предыдущая подготовка?", en: "Is prior preparation needed?", uz: "Oldingi tayyorgarlik kerakmi?" },
  "landing.faq.1.a":     { ru: "Нет. Курс начинается с основ убеждённости (якына) — с нуля, без предварительных знаний фикха рукьи.", en: "No. The course starts with foundations of conviction (yaqin) — from zero, no prior knowledge of ruqyah fiqh required.", uz: "Yo'q. Kurs ishonch asoslaridan (yaqin) boshlanadi — noldan, ruqya fiqhi bo'yicha oldingi bilim talab qilinmaydi." },
  "landing.faq.2.q":     { ru: "Можно ли начать бесплатно?", en: "Can I start for free?", uz: "Bepul boshlash mumkinmi?" },
  "landing.faq.2.a":     { ru: "Да. Регистрация и ознакомительные отрывки всех книг курса — бесплатны, без ограничения по времени.", en: "Yes. Registration and preview excerpts of all course books are free, with no time limit.", uz: "Ha. Ro'yxatdan o'tish va barcha kurs kitoblarining tanishuv parchalari bepul, vaqt chegarasisiz." },
  "landing.faq.3.q":     { ru: "Как устроена оплата?", en: "How does payment work?", uz: "To'lov qanday amalga oshiriladi?" },
  "landing.faq.3.a":     { ru: "Через личные сообщения в Telegram (t.me/ruqoq) — лекарь высылает реквизиты лично и подтверждает доступ вручную после оплаты. Отдельного платёжного шлюза на сайте нет.", en: "Via Telegram DM (t.me/ruqoq) — the healer sends payment details personally and confirms access manually after payment. No separate payment gateway on the site.", uz: "Telegram shaxsiy xabarlari orqali (t.me/ruqoq) — tabib to'lov tafsilotlarini shaxsan yuboradi va to'lovdan keyin kirishni qo'lda tasdiqlaydi. Saytda alohida to'lov shlyuzi yo'q." },
  "landing.faq.4.q":     { ru: "Сколько длится курс?", en: "How long is the course?", uz: "Kurs qancha davom etadi?" },
  "landing.faq.4.a":     { ru: "Курс самостоятельный — проходите в своём темпе, жёстких дедлайнов нет.", en: "The course is self-paced — go at your own speed, no strict deadlines.", uz: "Kurs mustaqil — o'z tezligingizda o'ting, qat'iy muddatlar yo'q." },
  "landing.faq.5.q":     { ru: "Можно ли пересдать экзамен?", en: "Can I retake an exam?", uz: "Imtihonni qayta topshirish mumkinmi?" },
  "landing.faq.5.a":     { ru: "Да, экзамен по книге и тест по модулю можно пересдавать столько раз, сколько нужно, чтобы набрать порог 70%.", en: "Yes, book exams and module tests can be retaken as many times as needed to reach the 70% threshold.", uz: "Ha, kitob imtihonlari va modul testlarini 70% chegarasiga yetish uchun kerakli marta qayta topshirish mumkin." },
  "landing.faq.6.q":     { ru: "Что будет после завершения курса?", en: "What happens after completing the course?", uz: "Kursni yakunlaganidan keyin nima bo'ladi?" },
  "landing.faq.6.a":     { ru: "Доступ к системе RUKYA Pro — там выпускник ведёт приём настоящих пациентов, лично проверяя каждый диагноз и подписывая итоговое заключение.", en: "Access to the RUKYA Pro system — where graduates see real patients, personally verifying each diagnosis and signing the final report.", uz: "RUKYA Pro tizimiga kirish — u yerda bitiruvchi haqiqiy bemorlarni qabul qiladi, har bir tashxisni shaxsan tekshiradi va yakuniy xulosani imzolaydi." },
  "landing.cta.title":   { ru: "Начните с бесплатного уровня уже сегодня", en: "Start with the free level today", uz: "Bugunoq bepul daraja bilan boshlang" },
  "landing.cta.text":    { ru: "Зарегистрируйтесь на сайте — сразу открыты бесплатные ознакомительные отрывки всех книг курса. Полный текст, экзамены и весь курс целиком — 30 000 ₽: напишите лекарю Абу Мухаммаду в Telegram, он вышлет реквизиты лично и подтвердит доступ.", en: "Register on the site — free preview excerpts of all course books open immediately. Full text, exams, and the entire course — 30,000 ₽: message healer Abu Muhammad on Telegram, he'll send payment details and confirm access.", uz: "Saytda ro'yxatdan o'ting — barcha kurs kitoblarining bepul tanishuv parchalari darhol ochiladi. To'liq matn, imtihonlar va butun kurs — 30 000 ₽: tabib Abu Muhammadga Telegramda yozing, u to'lov tafsilotlarini yuboradi va kirishni tasdiqlaydi." },
  "landing.cta.register": { ru: "Начать бесплатно", en: "Start for free", uz: "Bepul boshlash" },
  "landing.cta.telegram": { ru: "Написать в Telegram", en: "Message on Telegram", uz: "Telegramda yozish" },

  // ── Module blurbs (landing path preview) ──
  "landing.blurb.1":    { ru: "Основы убеждённости (якын) и мольба заклинателя — без веры в то, что исцеляет только Аллах, заклинание остаётся пустым звуком.", en: "Foundations of conviction (yaqin) and the healer's supplication — without faith that only Allah heals, incantation remains an empty sound.", uz: "Ishonch asoslari (yaqin) va tabib duosi — faqat Alloh shifo berishiga ishonchsiz afsun bo'sh tovushligicha qoladi." },
  "landing.blurb.2":    { ru: "Что дозволено в заклинании, а что нет, и метод «Влияние Волей» — переход от роли читателя к осознанному действию.", en: "What is permitted in incantation and what is not, and the \"Influence by Will\" method — transition from reader to conscious practitioner.", uz: "Afsunda nimaga ruxsat va nimaga ruxsat emas, va \"Iroda bilan ta'sir\" usuli — o'quvchidan ongli amaliyotchiga o'tish." },
  "landing.blurb.3":    { ru: "Словарь арабских названий органов тела и адаб перед чтением — точность, которая нужна для личной, конкретной дуа.", en: "Dictionary of Arabic organ names and etiquette before recitation — the precision needed for personal, specific dua.", uz: "Arabcha a'zo nomlari lug'ati va o'qishdan oldingi odob — shaxsiy, aniq duo uchun zarur bo'lgan aniqlik." },
  "landing.blurb.4":    { ru: "Обязательный протокол безопасности: опросник пациента и красные флаги, требующие направления к врачу — до, а не вместо духовного лечения.", en: "Mandatory safety protocol: patient questionnaire and red flags requiring doctor referral — before, not instead of spiritual treatment.", uz: "Majburiy xavfsizlik protokoli: bemor so'rovnomasi va shifokorga yuborishni talab qiluvchi qizil bayroqlar — ruhiy davodan oldin, o'rniga emas." },
  "landing.blurb.5":    { ru: "Направленное чтение туда, куда указывает сам пациент — никогда через надавливание или ощупывание тела.", en: "Directed reading where the patient indicates — never through pressing or body palpation.", uz: "Bemorning o'zi ko'rsatgan joyga yo'naltirilgan o'qish — hech qachon bosish yoki tanani paypaslab emas." },
  "landing.blurb.6":    { ru: "Азкары и дуа личной защиты, арсенал против колдовства, сглаза и зависти — крепость верующего, а не набор амулетов.", en: "Personal protection adhkar and duas, arsenal against sorcery, evil eye, and envy — a believer's fortress, not a set of amulets.", uz: "Shaxsiy himoya azkorlari va duolari, sehr, ko'z tegish va hasadga qarshi arsenal — mo'minning qal'asi, tumor to'plami emas." },
  "landing.blurb.7":    { ru: "Что делать, если чтение встречает сопротивление — и обязательное правило немедленной остановки, если пациенту плохо.", en: "What to do when recitation meets resistance — and the mandatory rule to stop immediately if the patient feels unwell.", uz: "O'qish qarshilikka duch kelganda nima qilish kerak — va bemorga yomon bo'lsa darhol to'xtatish majburiy qoidasi." },
  "landing.blurb.8":    { ru: "Разбор реальных обезличенных кейсов с наставником и учебные сеансы под наблюдением — прежде чем принимать пациентов самостоятельно.", en: "Analysis of real anonymized cases with mentor and supervised training sessions — before seeing patients independently.", uz: "Ustoz bilan haqiqiy anonim holatlarni tahlil qilish va nazorat ostidagi o'quv seanslari — bemorlarni mustaqil qabul qilishdan oldin." },
  "landing.blurb.9":    { ru: "Богословские границы: единственность Истины и вопрос заступничества — где рукья остаётся в рамках акыды, а где выходит за них.", en: "Theological boundaries: uniqueness of Truth and the question of intercession — where ruqyah stays within aqeedah and where it crosses the line.", uz: "Ilohiyot chegaralari: Haqiqat yagonaligi va shafoat masalasi — ruqya aqida doirasida qayerda qoladi va qayerda chegaradan chiqadi." },
  "landing.blurb.10":   { ru: "Как отличить истинного заклинателя от того, кто наживается на чужой беде, не имея ни знания, ни богобоязненности.", en: "How to distinguish a true healer from one who profits from others' misfortune without knowledge or God-consciousness.", uz: "Haqiqiy tabibni bilim va taqvosiz boshqalarning baxtsizligidan foyda oladigan kishidan qanday ajratish mumkin." },
  "landing.blurb.11":   { ru: "Финальный практикум — приём пациентов через систему RUKYA Pro: диагноз алгоритма проверяется и подписывается самим раки.", en: "Final practicum — patient reception through RUKYA Pro: algorithm diagnosis is verified and signed by the raqi himself.", uz: "Yakuniy amaliyot — RUKYA Pro orqali bemorlarni qabul qilish: algoritm tashxisi roqiyning o'zi tomonidan tekshiriladi va imzolanadi." },

  // ── About page ──
  "about.name":          { ru: "Лекарь Абу Мухаммад", en: "Healer Abu Muhammad", uz: "Tabib Abu Muhammad" },
  "about.role":          { ru: "Основатель онлайн-школы рукии · Практикующий лекарь", en: "Online Ruqyah School Founder · Practicing Healer", uz: "Onlayn ruqya maktabi asoschisi · Amaliy tabib" },
  "about.quote":         { ru: "Аллах Великодушный и Милостивый исцеляет Своих рабов — а лекарь является лишь причиной", en: "Allah, the Most Generous and Merciful, heals His servants — the healer is merely a means", uz: "Alloh Saxovatli va Rahimli O'z bandalarini shifo beradi — tabib esa faqat sababdir" },
  "about.stat.pubs":     { ru: "Публикаций", en: "Publications", uz: "Nashrlar" },
  "about.stat.years":    { ru: "Года практики", en: "Years of practice", uz: "Yillik amaliyot" },
  "about.stat.audio":    { ru: "Голосовых уроков", en: "Audio lessons", uz: "Ovozli darslar" },
  "about.stat.methods":  { ru: "Методов лечения", en: "Treatment methods", uz: "Davolash usullari" },
  "about.stat.reviews":  { ru: "Отзывов", en: "Reviews", uz: "Sharhlar" },
  "about.edu.title":     { ru: "Образование и путь", en: "Education and path", uz: "Ta'lim va yo'l" },
  "about.edu.p1":        { ru: "Меня зовут абу Мухаммад, я раб Аллаха. Рукья для меня — не «одна из услуг», а ответственность перед Аллахом и людьми: поэтому я прошёл обучение у нескольких шейхов, а своим главным учителем и ориентиром в методике считаю шейха Абдураззак аль-Азхар; важный слой знаний получил у Абу Захаби.", en: "My name is Abu Muhammad, I am a servant of Allah. Ruqyah for me is not \"one of the services\", but a responsibility before Allah and people: that's why I studied under several sheikhs, and I consider Sheikh Abdurazzaq al-Azhar my main teacher and methodological guide; an important layer of knowledge came from Abu Zahabi.", uz: "Mening ismim Abu Muhammad, men Allohning quliman. Ruqya men uchun \"xizmatlardan biri\" emas, balki Alloh va odamlar oldidagi mas'uliyat: shuning uchun men bir necha shayxlar qo'lida ta'lim oldim, Shayx Abdurazzaq al-Azharni asosiy ustoz va uslubiy yo'l ko'rsatuvchi deb bilaman; bilimning muhim qismi Abu Zahabiydan olindi." },
  "about.edu.p2":        { ru: "Фундамент — систематическое изучение Корана, хадисов и наследия учёных по рукье, джиннам и сихру. Параллельно веду просветительскую работу: более 1600 публикаций, 284 голосовых урока и материалы в Telegram-канале — чтобы люди могли отличать дозволенное от запретного и не терялись в страхе. Постоянно углубляю знание и оттачиваю практику.", en: "The foundation is a systematic study of the Quran, hadith, and scholarly heritage on ruqyah, jinn, and sihr. In parallel, I do educational work: over 1,600 publications, 284 audio lessons, and materials on the Telegram channel — so people can distinguish the permissible from the forbidden and not be lost in fear. I constantly deepen my knowledge and refine my practice.", uz: "Asos — Qur'on, hadis va olimlarning ruqya, jinnlar va sehr bo'yicha merosini tizimli o'rganish. Parallel ravishda ma'rifiy ish olib boraman: 1600 dan ortiq nashr, 284 ovozli dars va Telegram kanalidagi materiallar — odamlar ruxsat etilganni taqiqlangandan ajrata olishi va qo'rquvda adashmasligi uchun. Bilimni doimo chuqurlashtiraman va amaliyotni takomillashtiraman." },
  "about.spec.title":    { ru: "Специализация", en: "Specialization", uz: "Mutaxassislik" },
  "about.spec.intro":    { ru: "Сопровождаю мужчин и женщин с различными видами духовных поражений — опираясь только на Коран и Сунну, без ширка и запретных приёмов. В арсенале — семь направлений лечения, которые комбинирую по ситуации:", en: "I guide men and women with various types of spiritual afflictions — relying solely on Quran and Sunnah, without shirk or forbidden practices. My arsenal includes seven treatment directions, combined as needed:", uz: "Turli xil ruhiy kasalliklar bilan erkak va ayollarni yo'l ko'rsataman — faqat Qur'on va Sunnaga tayanib, shirk va taqiqlangan usullarsiz. Arsenalda — vaziyatga qarab birishtiriladigan yetti davolash yo'nalishi:" },
  "about.spec.sihr":     { ru: "Колдовство всех видов: съеденный, закопанный, на разлуку, бесплодие, болезнь, привязку — включая сложные и запущенные формы.", en: "All types of sorcery: consumed, buried, separation, infertility, illness, binding — including complex and chronic forms.", uz: "Barcha turdagi sehr: yegilgan, ko'milgan, ajratish, bepushtlik, kasallik, bog'lash — murakkab va surunkali shakllar ham." },
  "about.spec.ayn":      { ru: "Дурной глаз, поразивший здоровье, красоту, имущество, семью, детей, карьеру.", en: "Evil eye affecting health, beauty, property, family, children, career.", uz: "Sog'liq, go'zallik, mol-mulk, oila, bolalar, karyerani zararlagan ko'z tegish." },
  "about.spec.jinn":     { ru: "Одержимость джинном, массовое поселение, воздействие через семью, через сновидения.", en: "Jinn possession, mass settlement, influence through family, through dreams.", uz: "Jin bosishi, ommaviy joylashish, oila orqali ta'sir, tushlar orqali ta'sir." },
  "about.principles.title": { ru: "Принципы и подход", en: "Principles and approach", uz: "Tamoyillar va yondashuv" },
  // Раздел «Мои книги» на странице «Об авторе» (запрос автора, 2026-07-25).
  // Одно описание на модуль — ключ about.books.N, где N = id модуля из
  // modules-data.js. Названия и уровни берутся оттуда же, здесь только текст.
  "about.books.title":   { ru: "Мои книги", en: "My books", uz: "Mening kitoblarim" },
  "about.books.intro":   { ru: "Я, лекарь Абу Мухаммад, — автор всех книг этого курса. Они писались не как теория, а как записи живой практики: то, что я проверял на приёме, разбирал с учениками и сверял с Кораном и Сунной. Материал собран в 11 модулей; ниже — коротко о каждом. Нажмите на книгу, чтобы открыть её.", en: "I, healer Abu Muhammad, am the author of every book in this course. They were written not as theory but as records of living practice: what I tested with patients, worked through with students and checked against the Quran and Sunnah. The material is gathered into 11 modules; below is a short note on each. Tap a book to open it.", uz: "Men, tabib Abu Muhammad, ushbu kursdagi barcha kitoblarning muallifiman. Ular nazariya sifatida emas, balki jonli amaliyot yozuvlari sifatida yozilgan: qabulda sinab ko'rganim, shogirdlar bilan tahlil qilganim va Qur'on hamda Sunnaga solishtirganim. Material 11 ta modulga jamlangan; quyida har biri haqida qisqacha. Kitobni ochish uchun bosing." },
  "about.books.inside":  { ru: "Что внутри", en: "What's inside", uz: "Ichida nima bor" },
  "about.books.open":    { ru: "Открыть книгу", en: "Open the book", uz: "Kitobni ochish" },
  "about.books.lesson1": { ru: "урок", en: "lesson", uz: "dars" },
  "about.books.lesson2": { ru: "урока", en: "lessons", uz: "dars" },
  "about.books.lesson5": { ru: "уроков", en: "lessons", uz: "dars" },
  "about.books.1":       { ru: "С чего вообще начинается заклинатель. Якын — убеждённость, без которой формулы остаются словами; мольба заклинателя из девяти частей; басира — зрение сердцем; эхсан и черпание силы от Аллаха; собранность, дыхание и удержание намерения. Курс мог бы начаться сразу с формул — но начинается отсюда.", en: "Where a healer actually begins. Yaqin — the certainty without which formulas stay mere words; the nine-part supplication of the healer; basira — seeing with the heart; ihsan and drawing strength from Allah; composure, breathing and holding the intention. The course could have opened with formulas — it opens here instead.", uz: "Roqiy aslida qayerdan boshlanadi. Yaqin — usiz formulalar shunchaki so'z bo'lib qoladigan ishonch; roqiyning to'qqiz qismli duosi; basira — qalb bilan ko'rish; ehson va Allohdan kuch olish; jamlanish, nafas va niyatni ushlab turish. Kurs formulalardan boshlanishi mumkin edi — lekin shundan boshlanadi." },
  "about.books.2":       { ru: "Переход от «читателя Корана» к осознанному действию. Признанная формула рукьи Джибриля عليه السلام, принцип уточнения недуга и сердечное чтение — собирание воздействия Корана и направление его к пациенту. Виды заклинаний, метод «Аллязи», дозволенные инструменты и полная методология сеанса.", en: "The move from \"reciter\" to deliberate action. The recognised ruqyah formula of Jibril عليه السلام, the principle of naming the ailment precisely, and heart-recitation — gathering the effect of the Quran and directing it to the patient. Types of incantation, the \"Allazi\" method, permitted tools and the full session methodology.", uz: "\"Qur'on o'quvchisi\"dan ongli harakatga o'tish. Jibril عليه السلام ning tan olingan ruqya formulasi, xastalikni aniqlashtirish tamoyili va qalb bilan o'qish — Qur'on ta'sirini jamlab, bemorga yo'naltirish. Afsun turlari, \"Allazi\" usuli, ruxsat etilgan vositalar va seansning to'liq uslubiyoti." },
  "about.books.3":       { ru: "Язык тела — прежде чем применять рукью прицельно. Как орган называется по-арабски и как меняется слово, когда речь о своём или чужом теле. Тридцать эмоциональных загрязнений с картой тела и дуа изгнания, влияние загрязнений на внешность и защита каждого органа от страстей.", en: "The language of the body, before aiming ruqyah at anything. What each organ is called in Arabic and how the word shifts between \"my\", \"your\" and \"his\". Thirty emotional defilements with a body map and expulsion supplications, their effect on appearance, and protection of each organ from the passions.", uz: "Tananing tili — ruqyani aniq yo'naltirishdan oldin. A'zo arabchada qanday ataladi va so'z o'z yoki o'zga tanasi haqida gap ketganda qanday o'zgaradi. O'ttizta hissiy iflosliklar tana xaritasi va chiqarish duolari bilan, ularning tashqi ko'rinishga ta'siri va har bir a'zoni nafslardan himoyalash." },
  "about.books.4":       { ru: "Как поставить диагноз, никому не навредив. Между основами и направленным применением обязан стоять модуль о безопасности: диагноз никогда не ставится через боль от прикосновения или надавливания. Три группы корневых проблем, карта зажимов и тридцать дуа выведения ран души.", en: "How to reach a diagnosis without harming anyone. Between the basics and targeted application there must be a module on safety: a diagnosis is never made through pain caused by touching or pressing. Three groups of root problems, a map of the body's blocks, and thirty supplications for drawing out the wounds of the soul.", uz: "Hech kimga zarar bermay tashxis qo'yish. Asoslar bilan yo'naltirilgan qo'llash orasida xavfsizlik moduli turishi shart: tashxis hech qachon teginish yoki bosish og'rig'i orqali qo'yilmaydi. Ildiz muammolarning uch guruhi, qisilishlar xaritasi va qalb yaralarini chiqarish uchun o'ttizta duo." },
  "about.books.5":       { ru: "Точный удар вместо чтения «в пространство». Пророк ﷺ, когда болел, клал руку на место боли — отсюда весь модуль. Хитаб аль-Исаба (Влияние Волей) по органам, рукья против сихра, сглаза и зависти, дуа против колдовства истощения, чёрные линии, лечение водой и трёхступенчатое избавление от джиннов.", en: "A precise strike instead of reciting \"into the air\". When the Prophet ﷺ was ill he placed his hand where the pain was — the whole module follows from that. Khitab al-Isaba (Influence by Will) organ by organ, ruqyah against sihr, the evil eye and envy, supplications against draining magic, black lines, water treatment and a three-stage removal of jinn.", uz: "\"Bo'shliqqa\" o'qish o'rniga aniq zarba. Payg'ambar ﷺ kasal bo'lganda qo'lini og'riq joyiga qo'ygan — butun modul shundan kelib chiqadi. A'zolar bo'yicha Xitob al-Isoba (Iroda ta'siri), sehr, ko'z tegishi va hasadga qarshi ruqya, holdan toydiruvchi sehrga qarshi duolar, qora chiziqlar, suv bilan davolash va jinlardan uch bosqichli xalos bo'lish." },
  "about.books.6":       { ru: "Почему пациент возвращается через неделю с тем же самым. Многие лекари умеют лечить, но не умеют защищать: это как чинить стену крепости, оставив ворота открытыми. Базовые азкары, дуа о Божественном Сокрытии, личная защита от джиннов и шайтанов, арсенал против колдовства и открытие духовных замков.", en: "Why the patient comes back a week later with the same thing. Many healers can treat but cannot protect: it is like repairing the fortress wall while leaving the gate open. Core adhkar, supplications of Divine Concealment, personal protection from jinn and devils, an arsenal against sorcery, and the opening of spiritual locks.", uz: "Nega bemor bir haftadan keyin o'sha dard bilan qaytadi. Ko'p tabiblar davolay oladi, lekin himoya qila olmaydi: bu qal'a devorini tuzatib, darvozani ochiq qoldirishga o'xshaydi. Asosiy zikrlar, Ilohiy Pardalash duolari, jin va shaytonlardan shaxsiy himoya, sehrga qarshi arsenal va ruhiy qulflarni ochish." },
  "about.books.7":       { ru: "Когда рукья встречает сопротивление. Пророк ﷺ сам столкнулся с ифритом, который набросился на него, чтобы прервать молитву. Четыре уровня формулы заклинаний на убийство и сжигание джиннов и полное учебное пособие по уничтожению духовных сущностей — самый тяжёлый раздел курса.", en: "When ruqyah meets resistance. The Prophet ﷺ himself faced an ifrit that lunged at him to break his prayer. Four levels of the formula for killing and burning jinn, and a full manual on destroying spiritual entities — the heaviest section of the course.", uz: "Ruqya qarshilikka uchraganda. Payg'ambar ﷺ ning o'zi namozini buzish uchun tashlangan ifrit bilan to'qnashgan. Jinlarni o'ldirish va kuydirish formulasining to'rt darajasi hamda ruhiy mavjudotlarni yo'q qilish bo'yicha to'liq qo'llanma — kursning eng og'ir bo'limi." },
  "about.books.8":       { ru: "Что отличает сильного заклинателя от начинающего. Пять столпов состояния: таухид, намаз, тахаджжуд, сура аль-Бакара, зикр и оставление грехов — без этого фундамента формулы не работают. Десять глаголов-действий, комбо-цепочки «Арки» и три уровня мастерства.", en: "What separates a strong healer from a beginner. Five pillars of state: tawhid, prayer, tahajjud, Surah al-Baqarah, dhikr and abandoning sin — without this foundation the formulas do not work. Ten action-verbs, \"Arqi\" combination chains and three levels of mastery.", uz: "Kuchli roqiyni yangi boshlovchidan nima ajratadi. Holatning besh ustuni: tavhid, namoz, tahajjud, Baqara surasi, zikr va gunohlarni tark etish — bu poydevorsiz formulalar ishlamaydi. O'nta harakat-fe'l, \"Arqi\" zanjirlari va mahoratning uch darajasi." },
  "about.books.9":       { ru: "Где проходит граница с эзотерикой. Практикующему рано или поздно приносят чужой язык — «энергетика», «биополе», «чакры», «Космос как источник силы». Граница не там, где заканчивается наблюдение, а там, где начинается приписывание силы кому-то кроме Аллаха. Плюс разбор заступничества и просьб у могил.", en: "Where the line with esotericism runs. Sooner or later someone brings the practitioner a foreign vocabulary — \"energy\", \"biofield\", \"chakras\", \"the Cosmos as a source of power\". The line is not where observation ends but where power starts being ascribed to something other than Allah. Plus intercession and requests at graves.", uz: "Ezoterika bilan chegara qayerdan o'tadi. Amaliyotchiga ertami-kechmi begona til keltiriladi — \"energetika\", \"biomaydon\", \"chakralar\", \"kuch manbai sifatida Koinot\". Chegara kuzatuv tugagan joyda emas, balki kuchni Allohdan o'zgaga nisbat berish boshlangan joyda. Shuningdek shafoat va qabr oldidagi so'rovlar tahlili." },
  "about.books.10":      { ru: "Лекарь и мучитель — два образа. Люди, выдающие себя за заклинателей без знания и богобоязненности, берут деньги с отчаявшихся, обещают исцеление, о котором не имеют представления, и мучают больных своим невежеством. Этика приёма и настоящая разница между практиком и теоретиком в рукье.", en: "The healer and the tormentor — two figures. People who pass themselves off as practitioners without knowledge or God-consciousness take money from the desperate, promise a cure they know nothing about, and torment the sick with their ignorance. The ethics of practice, and the real difference between a practitioner and a theorist.", uz: "Tabib va qiynoqchi — ikki qiyofa. Bilimsiz va taqvosiz o'zini roqiy qilib ko'rsatuvchilar umidsizlardan pul oladi, tushunchasi yo'q shifoni va'da qiladi va bemorlarni jaholati bilan qiynaydi. Qabul odobi va ruqyada amaliyotchi bilan nazariyotchi orasidagi haqiqiy farq." },
  "about.books.11":      { ru: "Финальный практикум перед самостоятельным приёмом. Этот модуль ничего не пересказывает — он превращает изученное в Модулях 1–10 в практический навык работы в системе RUKYA Pro, через которую выпускник будет вести реальных пациентов: карточка приёма, ответственность и проверка себя.", en: "The final practicum before working independently. This module retells nothing — it turns everything learned in Modules 1–10 into a working skill inside RUKYA Pro, the system through which the graduate will see real patients: the intake record, accountability and self-checking.", uz: "Mustaqil qabuldan oldingi yakuniy amaliyot. Bu modul hech narsani takrorlamaydi — u 1–10-modullarda o'rganilganni bitiruvchi haqiqiy bemorlarni qabul qiladigan RUKYA Pro tizimida ishlash ko'nikmasiga aylantiradi: qabul kartasi, mas'uliyat va o'zini tekshirish." },
  "about.school.title":  { ru: "Онлайн-школа рукии", en: "Online Ruqyah School", uz: "Onlayn ruqya maktabi" },
  "about.contacts.title": { ru: "Контакты", en: "Contacts", uz: "Aloqa" },
  "about.cta.modules":   { ru: "Смотреть модули курса", en: "View course modules", uz: "Kurs modullarini ko'rish" },
  "about.cta.home":      { ru: "На главную", en: "Home", uz: "Bosh sahifa" },
  // Шапка и оглавление страницы «Об авторе» — раскладка по макету автора
  // (2026-07-26): портрет, титул, цитата и две кнопки действия.
  "about.cta.appointment": { ru: "Записаться на приём", en: "Book an appointment", uz: "Qabulga yozilish" },
  "about.cta.books":     { ru: "Читать книги", en: "Read the books", uz: "Kitoblarni o'qish" },
  "about.toc":           { ru: "На странице", en: "On this page", uz: "Sahifada" },
  // Кабинет админа — четвёртый показатель и подпись списка (макет автора,
  // 2026-07-26): показателей в макете четыре, ряд из трёх ломался 2+1.
  "admin.certsIssued":   { ru: "Сертификатов", en: "Certificates", uz: "Sertifikatlar" },
  "admin.studentsTitle": { ru: "Ученики", en: "Students", uz: "Shogirdlar" },
  "about.contact.treatment": { ru: "Записаться на лечение", en: "Book treatment", uz: "Davolashga yozilish" },
  "about.contact.dm":    { ru: "Связь с лекарем", en: "Contact healer", uz: "Tabib bilan bog'lanish" },
  "about.contact.channel": { ru: "Telegram-канал", en: "Telegram channel", uz: "Telegram kanali" },
  "about.contact.reviews": { ru: "Отзывы свидетелей", en: "Testimonials", uz: "Guvohlar sharhlari" },

  // ── Certificate page ──
  "cert.pageTitle":      { ru: "Сертификат — Онлайн-школа рукии", en: "Certificate — Online Ruqyah School", uz: "Sertifikat — Onlayn ruqya maktabi" },
  "cert.sample":         { ru: "Пример", en: "Sample", uz: "Namuna" },
  "cert.completion":     { ru: "Сертификат о завершении", en: "Certificate of Completion", uz: "Yakunlash sertifikati" },
  "cert.desc":           { ru: "прошёл(-ла) полный курс подготовки заклинателя (раки) — 11 модулей, 25 книг, от основ убеждённости до итоговой практики под супервизией наставника.", en: "completed the full healer (raqi) training course — 11 modules, 25 books, from foundations of conviction to final practice under mentor supervision.", uz: "tabib (roqiy) tayyorlashning to'liq kursini yakunladi — 11 modul, 25 kitob, ishonch asoslaridan ustoz nazorati ostidagi yakuniy amaliyotgacha." },
  "cert.founder":        { ru: "Основатель школы", en: "School Founder", uz: "Maktab asoschisi" },
  "cert.dateLabel":      { ru: "Дата выдачи", en: "Issue date", uz: "Berilgan sana" },
  "cert.sealText":       { ru: "РУКИЯ", en: "RUQYAH", uz: "RUQYA" },
  "cert.sampleIntro":    { ru: "Так будет выглядеть ваш сертификат после завершения курса — это пример, не настоящий документ.", en: "This is how your certificate will look after completing the course — this is a sample, not a real document.", uz: "Kursni yakunlaganingizdan keyin sertifikatingiz shunday ko'rinadi — bu namuna, haqiqiy hujjat emas." },
  "cert.notReady":       { ru: "Ваш сертификат ещё не готов", en: "Your certificate is not ready yet", uz: "Sertifikatingiz hali tayyor emas" },
  "cert.modulesOf":      { ru: "Пройдено модулей:", en: "Modules completed:", uz: "Yakunlangan modullar:" },
  "cert.of":             { ru: "из", en: "of", uz: "dan" },
  "cert.notReadyNote":   { ru: "Сертификат выдаётся после завершения всех модулей и прохождения всех тестов.", en: "Certificate is issued after completing all modules and passing all tests.", uz: "Sertifikat barcha modullarni yakunlash va barcha testlarni topshirgandan keyin beriladi." },
  "cert.continue":       { ru: "Продолжить обучение", en: "Continue learning", uz: "O'qishni davom ettirish" },
  "cert.congrats":       { ru: "Поздравляем — курс пройден полностью. Вот ваш сертификат:", en: "Congratulations — course completed. Here is your certificate:", uz: "Tabriklaymiz — kurs to'liq yakunlandi. Mana sizning sertifikatingiz:" },
  "cert.dlPdf":          { ru: "Скачать PDF", en: "Download PDF", uz: "PDF yuklab olish" },
  "cert.dlPng":          { ru: "Скачать PNG", en: "Download PNG", uz: "PNG yuklab olish" },
  "cert.print":          { ru: "Распечатать", en: "Print", uz: "Chop etish" },
  "cert.preparing":      { ru: "Подготовка…", en: "Preparing…", uz: "Tayyorlanmoqda…" },
  "cert.pngError":       { ru: "Не удалось создать PNG — попробуйте ещё раз.", en: "Failed to create PNG — please try again.", uz: "PNG yaratib bo'lmadi — qayta urinib ko'ring." },
  "cert.pdfError":       { ru: "Не удалось создать PDF — попробуйте ещё раз.", en: "Failed to create PDF — please try again.", uz: "PDF yaratib bo'lmadi — qayta urinib ko'ring." },
  "cert.proTitle":       { ru: "RUKYA PRO — программа для приёма пациентов", en: "RUKYA PRO — patient reception software", uz: "RUKYA PRO — bemorlarni qabul qilish dasturi" },
  "cert.proDesc":        { ru: "Теперь, когда курс завершён, можно скачать RUKYA PRO — рабочую программу для ведения пациентов (из Модуля 11). Работает офлайн, без браузера, все данные хранятся только на вашем компьютере.", en: "Now that the course is complete, you can download RUKYA PRO — a working program for patient management (from Module 11). Works offline, no browser needed, all data stays on your computer.", uz: "Kurs yakunlangach, RUKYA PRO ni yuklab olishingiz mumkin — bemorlarni boshqarish uchun ishchi dastur (11-moduldan). Oflayn ishlaydi, brauzer kerak emas, barcha ma'lumotlar faqat kompyuteringizda saqlanadi." },
  "cert.proSmartscreen": { ru: "При первом запуске Windows может показать предупреждение SmartScreen (программа новая, без платной цифровой подписи) — это ожидаемо, нужно нажать «Подробнее» → «Выполнить в любом случае».", en: "On first launch Windows may show a SmartScreen warning (new app, no paid digital signature) — this is expected, click \"More info\" → \"Run anyway\".", uz: "Birinchi ishga tushirishda Windows SmartScreen ogohlantirishini ko'rsatishi mumkin (yangi dastur, pullik raqamli imzo yo'q) — bu kutilgan holat, \"Batafsil\" → \"Baribir ishga tushirish\" tugmasini bosing." },
  "cert.startFree":      { ru: "Начать бесплатно →", en: "Start for free →", uz: "Bepul boshlash →" },

  // ── Admin dashboard ──
  "admin.pageTitle":     { ru: "Кабинет админа — Онлайн-школа рукии", en: "Admin Dashboard — Online Ruqyah School", uz: "Admin kabineti — Onlayn ruqya maktabi" },
  "admin.checking":      { ru: "Проверка входа…", en: "Checking login…", uz: "Kirish tekshirilmoqda…" },
  "admin.deleteStudent": { ru: "Удалить ученика", en: "Delete student", uz: "O'quvchini o'chirish" },
  "admin.accessCheckError": { ru: "Не удалось проверить права доступа — проверьте связь с интернетом.", en: "Could not verify access rights — check your internet connection.", uz: "Kirish huquqlarini tekshirib bo'lmadi — internet aloqasini tekshiring." },
  "admin.loadError":     { ru: "Не удалось загрузить список учеников", en: "Failed to load the student list", uz: "O'quvchilar ro'yxatini yuklab bo'lmadi" },
  "admin.schoolTitle":   { ru: "Онлайн-школа рукии", en: "Online Ruqyah School", uz: "Onlayn ruqya maktabi" },
  "admin.dashboard":     { ru: "Кабинет администратора", en: "Admin Dashboard", uz: "Admin kabineti" },
  "admin.totalStudents": { ru: "Всего учеников", en: "Total students", uz: "Jami talabalar" },
  "admin.paidStudents":  { ru: "Оплатили", en: "Paid", uz: "To'lagan" },
  "admin.silentDays":    { ru: "Молчат >14 дней", en: "Silent >14 days", uz: ">14 kun jim" },
  "admin.broadcast":     { ru: "Массовая рассылка", en: "Broadcast", uz: "Ommaviy xabar" },
  "admin.sendAll":       { ru: "Отправить всем", en: "Send to all", uz: "Barchasiga yuborish" },
  "admin.name":          { ru: "Имя", en: "Name", uz: "Ism" },
  "admin.email":         { ru: "Email", en: "Email", uz: "Email" },
  "admin.progress":      { ru: "Прогресс", en: "Progress", uz: "Progress" },
  "admin.score":         { ru: "Балл", en: "Score", uz: "Ball" },
  "admin.silent":        { ru: "Молчит", en: "Silent", uz: "Jim" },
  "admin.paidCol":       { ru: "Оплачено", en: "Paid", uz: "To'langan" },
  "admin.certCol":       { ru: "Сертификат", en: "Certificate", uz: "Sertifikat" },
  "admin.proCol":        { ru: "Rukya Pro", en: "Rukya Pro", uz: "Rukya Pro" },
  "admin.filterAll":     { ru: "Все ученики", en: "All students", uz: "Barcha talabalar" },
  "admin.filterPaid":    { ru: "Оплатили", en: "Paid", uz: "To'lagan" },
  "admin.filterUnpaid":  { ru: "Не оплатили", en: "Unpaid", uz: "To'lamagan" },
  "admin.filterSilent":  { ru: "Молчат >14 дней", en: "Silent >14 days", uz: ">14 kun jim" },
  "admin.logout":        { ru: "Выйти", en: "Sign out", uz: "Chiqish" },
  "admin.paidStatus":    { ru: "Оплачено", en: "Paid", uz: "To'langan" },
  "admin.unpaidStatus":  { ru: "Не оплачено", en: "Unpaid", uz: "To'lanmagan" },
  "admin.grantCert":     { ru: "Выдать сертификат", en: "Grant certificate", uz: "Sertifikat berish" },
  "admin.revokeCert":    { ru: "Отозвать сертификат", en: "Revoke certificate", uz: "Sertifikatni qaytarib olish" },
  "admin.grantPro":      { ru: "Дать доступ к Rukya Pro", en: "Grant Rukya Pro access", uz: "Rukya Pro ga kirish berish" },
  "admin.revokePro":     { ru: "Отозвать доступ к Rukya Pro", en: "Revoke Rukya Pro access", uz: "Rukya Pro ga kirishni bekor qilish" },
  "admin.daysAgo":       { ru: "дн. назад", en: "days ago", uz: "kun oldin" },
  "admin.noStudents":    { ru: "Учеников пока нет", en: "No students yet", uz: "Hozircha talabalar yo'q" },
  "admin.search":        { ru: "Поиск по имени или email…", en: "Search by name or email…", uz: "Ism yoki email bo'yicha qidirish…" },
  "admin.confirmCert":   { ru: "Выдать сертификат ученику", en: "Grant certificate to student", uz: "Talabaga sertifikat berish" },
  "admin.confirmRevokeCert": { ru: "Отозвать сертификат ученика", en: "Revoke student certificate", uz: "Talaba sertifikatini bekor qilish" },
  "admin.confirmPro":    { ru: "Дать ученику доступ к Rukya Pro?", en: "Grant student Rukya Pro access?", uz: "Talabaga Rukya Pro ga kirish berilsinmi?" },
  "admin.confirmRevokePro": { ru: "Отозвать доступ к Rukya Pro?", en: "Revoke Rukya Pro access?", uz: "Rukya Pro ga kirishni bekor qilish?" },

  // ── Markdown-loader ──
  "ml.readTime":         { ru: "мин чтения", en: "min read", uz: "daq o'qish" },
  "ml.toc":              { ru: "Оглавление", en: "Table of Contents", uz: "Mundarija" },
  "ml.backToTop":        { ru: "Наверх", en: "Back to top", uz: "Yuqoriga" },
  "ml.source":           { ru: "Источник:", en: "Source:", uz: "Manba:" },
  "ml.linkModule":       { ru: "Другой модуль курса", en: "Another course module", uz: "Boshqa kurs moduli" },
  "ml.linkBook":         { ru: "Другая книга / справочник", en: "Another book / reference", uz: "Boshqa kitob / ma'lumotnoma" },
  "ml.linkNote":         { ru: "Переход откроет её на новой странице — место в текущем уроке не потеряется, можно будет вернуться назад.", en: "This will open on a new page — your place in the current lesson is saved, you can return.", uz: "Bu yangi sahifada ochiladi — joriy darsdagi joyingiz saqlanadi, qaytishingiz mumkin." },
  "ml.linkOpen":         { ru: "Открыть →", en: "Open →", uz: "Ochish →" },
  "ml.linkStay":         { ru: "Остаться здесь", en: "Stay here", uz: "Bu yerda qolish" },
  "ml.paywallTitle":     { ru: "Это лишь небольшой бесплатный отрывок", en: "This is just a small free excerpt", uz: "Bu faqat kichik bepul parcha" },
  "ml.paywallText":      { ru: "Полный текст, экзамен по нему и весь курс целиком — 11 модулей от основ якына до практики под супервизией наставника — открываются только после покупки курса.", en: "Full text, exam, and the entire course — 11 modules from yaqin basics to supervised practice — unlock only after purchasing the course.", uz: "To'liq matn, imtihon va butun kurs — yaqin asoslaridan ustoz nazorati ostidagi amaliyotgacha 11 modul — faqat kursni sotib olganidan keyin ochiladi." },
  "ml.paywallPrice":     { ru: "30 000 ₽", en: "30,000 ₽", uz: "30 000 ₽" },
  "ml.paywallCta":       { ru: "Написать лекарю в Telegram", en: "Message the healer on Telegram", uz: "Tabibga Telegramda yozish" },
  "ml.paywallLogin":     { ru: "Уже оплатили? Войти", en: "Already paid? Sign in", uz: "To'lagansizmi? Kirish" },
  "ml.registerTitle":    { ru: "Зарегистрируйтесь, чтобы прочитать бесплатный отрывок", en: "Sign up to read a free excerpt", uz: "Bepul parchani o'qish uchun ro'yxatdan o'ting" },
  "ml.registerText":     { ru: "Регистрация бесплатна и займёт меньше минуты. После входа откроется небольшой отрывок — полный текст, экзамены и весь курс целиком — 30 000 ₽.", en: "Registration is free and takes less than a minute. After signing in, a small excerpt opens — full text, exams, and the entire course — 30,000 ₽.", uz: "Ro'yxatdan o'tish bepul va bir daqiqadan kam vaqt oladi. Kirgandan so'ng kichik parcha ochiladi — to'liq matn, imtihonlar va butun kurs — 30 000 ₽." },
  "ml.registerCta":      { ru: "Зарегистрироваться бесплатно", en: "Sign up for free", uz: "Bepul ro'yxatdan o'tish" },
  "ml.registerLogin":    { ru: "Уже есть аккаунт? Войти", en: "Already have an account? Sign in", uz: "Hisobingiz bormi? Kirish" },
  "ml.adminOnly":        { ru: "Этот раздел виден только администратору школы", en: "This section is visible to the school admin only", uz: "Bu bo'lim faqat maktab adminiga ko'rinadi" },
  "ml.adminOnlyText":    { ru: "Здесь — внутренний разбор материалов, не входящих в сертифицируемую программу курса. Он не продаётся и не открывается по оплате — обычная часть курса вам доступна в разделе «Модули».", en: "This contains an internal review of materials not included in the certified course program. It is not for sale and not unlocked by payment — the regular course content is available in the \"Modules\" section.", uz: "Bu yerda sertifikatlangan kurs dasturiga kiritilmagan materiallarning ichki tahlili mavjud. U sotilmaydi va to'lov bilan ochilmaydi — oddiy kurs kontenti \"Modullar\" bo'limida mavjud." },

  // ── Assignments ──
  "module.assignments":  { ru: "Практические задания", en: "Practical assignments", uz: "Amaliy topshiriqlar" },
  "assign.reflection":   { ru: "Размышление", en: "Reflection", uz: "Fikrlash" },
  "assign.practice":     { ru: "Практика", en: "Practice", uz: "Amaliyot" },
  "assign.daily":        { ru: "Ежедневное", en: "Daily", uz: "Kundalik" },
  "assign.duration":     { ru: "Длительность", en: "Duration", uz: "Davomiyligi" },

  // Отметка выполнения задания (запрос автора «пусть будет автоматом»,
  // 2026-07-26): без неё лента достижений не имела бы источника — сервер
  // видел только сданные тесты, а практику не видел вовсе.
  "assign.markDone":     { ru: "Выполнил", en: "Done", uz: "Bajardim" },
  "assign.isDone":       { ru: "Выполнено", en: "Completed", uz: "Bajarildi" },
  "assign.undo":         { ru: "Снять отметку", en: "Undo", uz: "Belgini olish" },
  // Вопрос задаётся только после отметки о выполнении и только по практике:
  // у размышления «Аллах ответил?» смысла не имеет.
  "assign.answeredQ":    { ru: "Аллах ответил на твою мольбу?", en: "Did Allah answer your supplication?", uz: "Alloh duoyingga javob berdimi?" },
  "assign.answeredYes":  { ru: "الحمد لله — Аллах ответил", en: "الحمد لله — Allah answered", uz: "الحمد لله — Alloh javob berdi" },
  "assign.answeredWait": { ru: "Пока продолжаю просить", en: "I keep asking", uz: "Hozircha so'rashda davom etaman" },
  "assign.answeredDone": { ru: "الحمد لله — Аллах ответил", en: "الحمد لله — Allah answered", uz: "الحمد لله — Alloh javob berdi" },

  // ── Modules search ──
  "modules.search":      { ru: "Поиск по названиям и содержанию книг…", en: "Search titles and book contents…", uz: "Sarlavhalar va kitob mazmuni bo'yicha qidirish…" },
  "modules.noResults":   { ru: "Ничего не найдено.", en: "Nothing found.", uz: "Hech narsa topilmadi." },
  // Поиск по заголовкам внутри книг (индекс — scripts/build-search-index.mjs)
  // Возврат к месту чтения (pages/js/reading-position.js)
  "read.resumeText":     { ru: "Вы остановились примерно на", en: "You stopped at about", uz: "Siz taxminan shu joyda to'xtadingiz:" },
  "read.resumeGo":       { ru: "Продолжить чтение", en: "Continue reading", uz: "O'qishni davom ettirish" },
  // ── Ценность модуля (запрос автора, 2026-07-25) ────────────────────────
  // Смысл задан автором: «Если ты веришь, что Аллах мгновенно исцелит по
  // причине тебя, и усиливаешь эту веру повторными намерениями — Аллах
  // исцелит мгновенно. Он таков, каким ты о Нём думаешь».
  //
  // Формулировки намеренно ведут к УБЕЖДЁННОСТИ ОБ АЛЛАХЕ, а не к величию
  // самого лекаря. Это не смягчение просьбы, а её точное исполнение: Модуль
  // 10 курса прямо запрещает «гарантию результата» и «приписывание
  // исцеления себе», а Мольба заклинателя (Модуль 1) называет раки «слабым
  // рабом, причиной, а не источником». Текст вида «ты станешь могучим
  // лекарем» ученик прочёл бы на сайте, а через десять модулей встретил бы
  // прямой запрет на такие мысли — и перестал бы верить курсу.
  // Уведомления ученику (запрос автора, 2026-07-25). Заголовки и тексты
  // самих уведомлений приходят с сервера уже готовыми (functions/index.js) —
  // здесь только подписи интерфейса.
  "notif.title":     { ru: "Уведомления", en: "Notifications", uz: "Bildirishnomalar" },
  "notif.empty":     { ru: "Пока ничего нового", en: "Nothing new yet", uz: "Hozircha yangilik yo'q" },
  "notif.markAll":   { ru: "Прочитать все", en: "Mark all read", uz: "Hammasini o'qilgan deb belgilash" },
  "notif.open":      { ru: "Открыть", en: "Open", uz: "Ochish" },
  "notif.now":       { ru: "только что", en: "just now", uz: "hozirgina" },
  "notif.min":       { ru: "мин", en: "min", uz: "daq" },
  "notif.hour":      { ru: "ч", en: "h", uz: "soat" },
  "notif.day":       { ru: "дн", en: "d", uz: "kun" },
  "notif.yesterday": { ru: "вчера", en: "yesterday", uz: "kecha" },

  // Модалка «что внутри модуля» (запрос автора, 2026-07-26). Сами тексты
  // по модулям — pages/js/module-intro-data.js, здесь только подписи.
  "intro.what":       { ru: "Что внутри", en: "What's inside", uz: "Ichida nima bor" },
  "intro.learn":      { ru: "Чему учит", en: "What it teaches", uz: "Nimaga o'rgatadi" },
  "intro.after":      { ru: "После него", en: "After it", uz: "Undan keyin" },
  "intro.contains":   { ru: "Внутри", en: "Inside", uz: "Ichida" },
  "intro.books":      { ru: "книг", en: "books", uz: "kitob" },
  "intro.examEach":   { ru: "экзамен по каждой", en: "an exam for each", uz: "har biriga imtihon" },
  "intro.open":       { ru: "Открыть модуль", en: "Open the module", uz: "Modulni ochish" },
  "intro.opensAfter": { ru: "Откроется после экзамена по модулю", en: "Opens after the exam of module", uz: "Modul imtihonidan keyin ochiladi" },
  "intro.goRequired": { ru: "Перейти к", en: "Go to", uz: "O'tish" },

  // Лента достижений (запрос автора «пусть будет автоматом», 2026-07-26).
  // Текст записи собирается здесь, а не хранится в базе: иначе на
  // английской и узбекской версиях сайта лента навсегда осталась бы
  // русской. {name} и {n} подставляет pages/js/community-feed.js.
  "feed.title":       { ru: "Ученики школы", en: "Fellow students", uz: "Maktab shogirdlari" },
  "feed.empty":       { ru: "Пока пусто. Первая запись может быть о тебе.", en: "Nothing yet. The first entry could be about you.", uz: "Hozircha bo'sh. Birinchi yozuv sen haqingda bo'lishi mumkin." },
  "feed.module":      { ru: "{name} сдал экзамен Модуля {n}", en: "{name} passed the Module {n} exam", uz: "{name} {n}-modul imtihonidan o'tdi" },
  "feed.practice":    { ru: "{name} довёл до конца практику Модуля {n}", en: "{name} completed the Module {n} practice", uz: "{name} {n}-modul amaliyotini oxiriga yetkazdi" },
  // Формулировка автора (2026-07-26) и положение Модуля 10, §3: исцеление
  // приписано Аллаху, ученик — причина, а не источник.
  "feed.answered":    { ru: "{name} верно применил знание Модуля {n}: обратился к Аллаху с убеждённостью — и Аллах ответил и исцелил. الحمد لله", en: "{name} applied the knowledge of Module {n} rightly: he turned to Allah with certainty — and Allah answered and healed. الحمد لله", uz: "{name} {n}-modul ilmini to'g'ri qo'lladi: ishonch bilan Allohga yuzlandi — va Alloh javob berdi va shifo berdi. الحمد لله" },
  "feed.graduate":    { ru: "{name} прошёл все 11 модулей курса", en: "{name} completed all 11 modules of the course", uz: "{name} kursning barcha 11 modulini tamomladi" },
  "feed.certificate": { ru: "{name} получил сертификат раки", en: "{name} received the raqi certificate", uz: "{name} roqiy sertifikatini oldi" },
  "feed.rukyaPro":    { ru: "{name} получил доступ к системе RUKYA Pro", en: "{name} received access to RUKYA Pro", uz: "{name} RUKYA Pro tizimiga ruxsat oldi" },
  "feed.note":        { ru: "Записи появляются сами — по прогрессу учеников. Об ответе Аллаха свидетельствует сам ученик.", en: "Entries appear automatically from students' progress. Allah's answer is testified by the student himself.", uz: "Yozuvlar shogirdlarning natijasi bo'yicha o'zi paydo bo'ladi. Allohning javobiga shogirdning o'zi guvohlik beradi." },

  // Заголовок «Что даёт этот модуль» убран по решению автора (2026-07-26):
  // блок должен читаться не как продающее описание модуля, а как
  // напоминание — мгновенное исцеление связано с твоей верой в Аллаха.
  "value.reminder":  { ru: "Помни", en: "Remember", uz: "Eslab qol" },
  "value.hadithAr":  { ru: "أَنَا عِنْدَ ظَنِّ عَبْدِي بِي", en: "أَنَا عِنْدَ ظَنِّ عَبْدِي بِي", uz: "أَنَا عِنْدَ ظَنِّ عَبْدِي بِي" },
  "value.hadithTr":  { ru: "Ана 'инда занни 'абди би", en: "Ana 'inda zanni 'abdi bi", uz: "Ana 'inda zanni 'abdi bi" },
  "value.hadithRu":  { ru: "«Я — таков, каким полагает Меня раб Мой»", en: "\"I am as My servant thinks of Me\"", uz: "«Men bandam Meni qanday o'ylasa, shundayman»" },
  "value.hadithSrc": { ru: "Хадис кудси. аль-Бухари, 7405; Муслим, 2675", en: "Hadith qudsi. al-Bukhari 7405; Muslim 2675", uz: "Hadisi qudsiy. al-Buxoriy 7405; Muslim 2675" },
  "value.lead":      { ru: "Если ты убеждён, что Аллах исцелит мгновенно — по причине тебя, — и укрепляешь эту убеждённость повторным намерением, Аллах исцеляет мгновенно. Сила не в тебе: ты причина, а не источник. Каждый модуль курса выковывает эту убеждённость с новой стороны.", en: "If you are certain that Allah will heal instantly — through you as a cause — and you strengthen that certainty by renewing your intention, Allah heals instantly. The power is not yours: you are the cause, not the source. Every module of the course forges this certainty from a new angle.", uz: "Agar Alloh sen sabab bo'lib darhol shifo berishiga ishonsang va bu ishonchni niyatni takrorlash bilan mustahkamlasang, Alloh darhol shifo beradi. Kuch senda emas: sen sababsan, manba emas. Kursning har bir moduli bu ishonchni yangi tomondan quyadi." },

  "value.1":  { ru: "Здесь куётся сама убеждённость. Пока сердце сомневается, слова остаются сухим руслом — и никакая формула этого не заменит. Сорок дней ковки якына, мольба заклинателя, басира, эхсан. Модуль, после которого твоё «бисмиллях» перестаёт быть звуком.", en: "This is where certainty itself is forged. While the heart doubts, words stay a dry riverbed — no formula replaces that. Forty days of forging yaqin, the healer's supplication, basira, ihsan. After this module your \"bismillah\" stops being a sound.", uz: "Bu yerda ishonchning o'zi quyiladi. Qalb shubhalanar ekan, so'zlar quruq o'zan bo'lib qoladi — hech qanday formula buni almashtirmaydi. Yaqinni quyishning qirq kuni, roqiy duosi, basira, ehson. Shundan keyin «bismilloh»ing shunchaki tovush bo'lmay qoladi." },
  "value.2":  { ru: "Твоя убеждённость обретает точный язык. Формула рукьи Джибриля, уточнение недуга, сердечное чтение — собирание воздействия Корана и направление его к больному. Ты перестаёшь читать «вообще» и начинаешь обращаться к тому, что видишь.", en: "Your certainty gains a precise language. Jibril's ruqyah formula, naming the ailment exactly, heart-recitation — gathering the Quran's effect and directing it to the patient. You stop reciting \"in general\" and start addressing what you actually see.", uz: "Ishonching aniq til topadi. Jibril ruqyasi formulasi, xastalikni aniqlashtirish, qalb bilan o'qish — Qur'on ta'sirini jamlab, bemorga yo'naltirish. Sen «umuman» o'qishni to'xtatib, ko'rgan narsangga murojaat qila boshlaysan." },
  "value.3":  { ru: "Намерение получает адрес. Пока ты не знаешь, как орган зовётся по-арабски и как меняется слово, обращение остаётся общим. Тридцать эмоциональных загрязнений с картой тела — ты начинаешь видеть, куда именно направлять убеждённость.", en: "Your intention gets an address. Until you know what an organ is called in Arabic and how the word shifts, the address stays vague. Thirty emotional defilements with a body map — you begin to see exactly where to direct your certainty.", uz: "Niyat manzil topadi. A'zo arabchada qanday atalishini va so'z qanday o'zgarishini bilmaguningcha murojaat umumiy bo'lib qoladi. Tana xaritasi bilan o'ttizta hissiy iflosliklar — ishonchni aynan qayerga yo'naltirishni ko'ra boshlaysan." },
  "value.4":  { ru: "Убеждённость без осторожности калечит. Диагноз никогда не ставится через боль от прикосновения — этот модуль ставит красную линию раньше, чем ты научишься бить прицельно. Сильный лекарь узнаётся по тому, кого он не тронул.", en: "Certainty without caution maims. A diagnosis is never made through pain from touching — this module draws the red line before you learn to strike precisely. A strong healer is known by whom he did not touch.", uz: "Ehtiyotsiz ishonch mayib qiladi. Tashxis hech qachon teginish og'rig'i orqali qo'yilmaydi — bu modul aniq zarba berishni o'rganishingdan oldin qizil chiziqni tortadi. Kuchli tabib kimga tegmaganidan bilinadi." },
  "value.5":  { ru: "Пророк ﷺ, когда болел, клал руку на место боли. Отсюда весь модуль: точный удар вместо чтения в пространство. Хитаб аль-Исаба по органам, рукья против сихра и сглаза, чёрные линии, избавление от джиннов. Здесь убеждённость становится ремеслом.", en: "When the Prophet ﷺ was ill he placed his hand where the pain was. The whole module follows from that: a precise strike instead of reciting into the air. Khitab al-Isaba organ by organ, ruqyah against sihr and the evil eye, black lines, removing jinn. Here certainty becomes craft.", uz: "Payg'ambar ﷺ kasal bo'lganda qo'lini og'riq joyiga qo'ygan. Butun modul shundan: bo'shliqqa o'qish o'rniga aniq zarba. A'zolar bo'yicha Xitob al-Isoba, sehr va ko'z tegishiga qarshi ruqya, qora chiziqlar, jinlardan xalos bo'lish. Bu yerda ishonch hunarga aylanadi." },
  "value.6":  { ru: "Лечение без защиты — как чинить стену крепости, оставив ворота открытыми. Пациент вернётся через неделю с тем же. Азкары, дуа Сокрытия, защита от джиннов, открытие духовных замков — модуль, который удерживает достигнутое.", en: "Treating without protecting is like repairing the fortress wall while leaving the gate open. The patient returns a week later with the same thing. Adhkar, supplications of Concealment, protection from jinn, opening spiritual locks — the module that holds what you gained.", uz: "Himoyasiz davolash — qal'a devorini tuzatib, darvozani ochiq qoldirishga o'xshaydi. Bemor bir haftadan keyin o'sha dard bilan qaytadi. Zikrlar, Pardalash duolari, jinlardan himoya, ruhiy qulflarni ochish — erishilganni ushlab turadigan modul." },
  "value.7":  { ru: "Иногда чтение встречает сопротивление. Пророк ﷺ сам столкнулся с ифритом, набросившимся, чтобы прервать молитву. Четыре уровня формулы и полное пособие по уничтожению сущностей — самый тяжёлый раздел курса, и он требует убеждённости, а не смелости.", en: "Sometimes recitation meets resistance. The Prophet ﷺ himself faced an ifrit that lunged to break his prayer. Four levels of the formula and a full manual on destroying entities — the heaviest section of the course, and it demands certainty, not bravado.", uz: "Ba'zan o'qish qarshilikka uchraydi. Payg'ambar ﷺ ning o'zi namozini buzish uchun tashlangan ifrit bilan to'qnashgan. Formulaning to'rt darajasi va mavjudotlarni yo'q qilish bo'yicha to'liq qo'llanma — kursning eng og'ir bo'limi, u jasorat emas, ishonch talab qiladi." },
  "value.8":  { ru: "Что отличает сильного от начинающего — не формулы, а состояние. Пять столпов: таухид, намаз, тахаджжуд, аль-Бакара, зикр и оставление грехов. Без этого фундамента десять глаголов-действий останутся словарём. Твоя сила берёт начало в связи с Аллахом.", en: "What separates the strong from the beginner is not formulas but state. Five pillars: tawhid, prayer, tahajjud, al-Baqarah, dhikr and abandoning sin. Without that foundation the ten action-verbs stay a glossary. Your strength originates in your bond with Allah.", uz: "Kuchlini yangi boshlovchidan formulalar emas, holat ajratadi. Besh ustun: tavhid, namoz, tahajjud, Baqara, zikr va gunohlarni tark etish. Bu poydevorsiz o'nta harakat-fe'l lug'at bo'lib qoladi. Kuching Alloh bilan bog'liqlikdan boshlanadi." },
  "value.9":  { ru: "Рано или поздно тебе принесут чужой язык — «энергетика», «биополе», «Космос как источник». Граница не там, где заканчивается наблюдение, а там, где силу приписывают кому-то кроме Аллаха. Этот модуль хранит саму основу твоей убеждённости.", en: "Sooner or later someone brings you a foreign vocabulary — \"energy\", \"biofield\", \"the Cosmos as a source\". The line is not where observation ends but where power is ascribed to something other than Allah. This module guards the very ground of your certainty.", uz: "Ertami-kechmi senga begona til keltiriladi — «energetika», «biomaydon», «manba sifatida Koinot». Chegara kuzatuv tugagan joyda emas, kuch Allohdan o'zgaga nisbat berilgan joyda. Bu modul ishonchingning poydevorini qo'riqlaydi." },
  "value.10": { ru: "Лекарь и мучитель — два образа. Те, кто берёт деньги с отчаявшихся и обещает исцеление, о котором не имеет представления, зовутся лекарями. Модуль о том, чем ты от них отличаешься: знанием, богобоязненностью, искренностью и присутствием сердца.", en: "The healer and the tormentor — two figures. Those who take money from the desperate and promise a cure they know nothing about also call themselves healers. This module is about what separates you from them: knowledge, God-consciousness, sincerity, and presence of heart.", uz: "Tabib va qiynoqchi — ikki qiyofa. Umidsizlardan pul olib, tushunchasi yo'q shifoni va'da qiluvchilar ham o'zini tabib deydi. Bu modul sening ulardan farqing haqida: bilim, taqvo, ixloslik va qalb hozirligi." },
  "value.11": { ru: "Всё изученное встречается с живым пациентом. Карточка приёма, ответственность, проверка себя в RUKYA Pro. Здесь убеждённость перестаёт быть внутренним состоянием и становится работой, за которую ты отвечаешь перед Аллахом и человеком.", en: "Everything you learned meets a real patient. The intake record, accountability, self-checking inside RUKYA Pro. Here certainty stops being an inner state and becomes work you answer for — before Allah and before the person.", uz: "O'rganilgan hamma narsa tirik bemor bilan uchrashadi. Qabul kartasi, mas'uliyat, RUKYA Pro'da o'zini tekshirish. Bu yerda ishonch ichki holat bo'lishdan to'xtab, Alloh va inson oldida javob beradigan ishga aylanadi." },

  "modules.inside":      { ru: "Найдено внутри книг", en: "Found inside books", uz: "Kitoblar ichida topildi" },
  "modules.insideFound": { ru: "книг", en: "books", uz: "kitob" },
  "modules.insideMore":  { ru: "Ещё книг с совпадениями:", en: "More books with matches:", uz: "Mos keluvchi yana kitoblar:" },

  // ── Path section headers ──
  "path.beginner":       { ru: "Начальный уровень", en: "Beginner Level", uz: "Boshlang'ich daraja" },
  "path.intermediate":   { ru: "Средний уровень", en: "Intermediate Level", uz: "O'rta daraja" },
  "path.advanced":       { ru: "Продвинутый уровень", en: "Advanced Level", uz: "Yuqori daraja" },
  "path.modules":        { ru: "Модули", en: "Modules", uz: "Modullar" },

  // «Путь ученика» — раскладка по макету автора (2026-07-26, «Все
  // страницы - раскладка.html», страница 0). Статус модуля подписан
  // СЛОВОМ, а не только цветом: цвет один не читается ни на монохромном
  // экране, ни при дальтонизме.
  "path.subtitle":       { ru: "11 модулей · от основ к самостоятельному приёму", en: "11 modules · from the fundamentals to seeing patients", uz: "11 modul · asoslardan mustaqil qabulgacha" },
  "path.done":           { ru: "Пройден", en: "Completed", uz: "O'tildi" },
  "path.now":            { ru: "Сейчас", en: "Current", uz: "Hozir" },
  "path.locked":         { ru: "Откроется позже", en: "Opens later", uz: "Keyinroq ochiladi" },
  "path.notStarted":     { ru: "Не начат", en: "Not started", uz: "Boshlanmagan" },
  "path.of":             { ru: "из", en: "of", uz: "dan" },
  "path.modulesWord":    { ru: "модулей", en: "modules", uz: "modul" },
  "path.noBooks":        { ru: "Работа в программе", en: "Work in the app", uz: "Dasturda ishlash" },
  // Короткие описания уровней — из макета.
  "path.blurb.beginner":     { ru: "Фундамент: убеждённость, точный язык формул и адрес их применения.", en: "The foundation: certainty, the precise language of the formulas, and where to apply them.", uz: "Poydevor: ishonch, formulalarning aniq tili va ularni qo'llash manzili." },
  "path.blurb.intermediate": { ru: "Диагностика без вреда, направленное применение и защита лекаря.", en: "Diagnosis without harm, targeted application, and the healer's protection.", uz: "Zararsiz tashxis, yo'naltirilgan qo'llash va shifokorning himoyasi." },
  "path.blurb.advanced":     { ru: "Сложные случаи, различение подлинного и ложного, работа с пациентом.", en: "Difficult cases, telling the genuine from the false, working with a patient.", uz: "Murakkab holatlar, haqiqiyni soxtadan ajratish, bemor bilan ishlash." },

  // ── Weak areas (student dashboard) ──
  "dash.weak":           { ru: "Слабые места", en: "Weak areas", uz: "Zaif tomonlar" },
  "dash.needreview":     { ru: "Требует повторения", en: "Needs review", uz: "Takrorlash kerak" },
  "dash.recommend":      { ru: "Рекомендуем повторить", en: "We recommend reviewing", uz: "Takrorlashni tavsiya etamiz" },
  "dash.noscores":       { ru: "Пока нет результатов тестов", en: "No test results yet", uz: "Hali test natijalari yo'q" },
  "dash.score":          { ru: "Результат", en: "Score", uz: "Natija" },

  // ── Audio dua ──
  "dua.play":            { ru: "Прослушать произношение", en: "Listen to pronunciation", uz: "Talaffuzni tinglash" },
  "dua.novoice":         { ru: "Озвучка пока недоступна — в вашей системе нет арабского голоса.", en: "Audio unavailable — your system has no Arabic voice installed.", uz: "Ovoz hozircha mavjud emas — tizimingizda arab ovozi yo'q." },

  // ── Bookmarks ──
  "bookmark.add":        { ru: "Добавить закладку", en: "Add bookmark", uz: "Xatcho'p qo'shish" },
  "bookmark.panel":      { ru: "Закладки", en: "Bookmarks", uz: "Xatcho'plar" },
  "bookmark.note":       { ru: "Заметка...", en: "Note...", uz: "Eslatma..." },
  "bookmark.empty":      { ru: "Нет закладок", en: "No bookmarks", uz: "Xatcho'plar yo'q" },
  "bookmark.save":       { ru: "Сохранить", en: "Save", uz: "Saqlash" },
  "bookmark.saved":      { ru: "Закладка сохранена", en: "Bookmark saved", uz: "Xatcho'p saqlandi" },
  "bookmark.deleted":    { ru: "Закладка удалена", en: "Bookmark deleted", uz: "Xatcho'p o'chirildi" },

  // ── Module locking ──
  "module.locked":       { ru: "Модуль заблокирован", en: "Module locked", uz: "Modul bloklangan" },
  "module.lockedmsg":    { ru: "Сначала пройдите тест по модулю", en: "Pass the previous module test first", uz: "Avval oldingi modul testini toping" },
};

// ───── Module titles ─────
const MODULE_TITLES = {
  1:  { en: "Foundation of Foundations", uz: "Asoslar asosi" },
  2:  { en: "Fundamentals of Incantation", uz: "Afsun asoslari" },
  3:  { en: "Fundamentals of Application", uz: "Qo'llash asoslari" },
  4:  { en: "Diagnostics — Safety Protocol", uz: "Diagnostika — xavfsizlik protokoli" },
  5:  { en: "Targeted Application", uz: "Maqsadli qo'llash" },
  6:  { en: "Fundamentals of Protection", uz: "Himoya asoslari" },
  7:  { en: "Expulsion of Spiritual Entities", uz: "Ruhiy mavjudotlarni haydash" },
  8:  { en: "Advanced Master", uz: "Ilg'or usta" },
  9:  { en: "True vs False Incantation", uz: "Haqiqiy va soxta afsun" },
  10: { en: "True Healer vs False Healer", uz: "Haqiqiy tabib va soxta tabib" },
  11: { en: "Working with RUKYA Pro", uz: "RUKYA Pro tizimida ishlash" },
};

// ───── Lesson titles ─────
const LESSON_TITLES = {
  // Module 1
  "/content/module-1/yakyn.md":          { en: "Textbook of Certainty (Yaqin)", uz: "Yaqin darsligi" },
  "/content/module-1/molba-zaklinatelya.md": { en: "The Healer's Supplication", uz: "Tabib duosi" },
  "/content/module-1/teoretik-i-praktik.md": { en: "Theorist and Practitioner — How to Formulate Supplication", uz: "Nazariyotchi va amaliyotchi — duoni qanday tuzish" },
  "/content/module-1/metod-taukhid.md":  { en: "Method of Seclusion with Tawheed — Visualization through Names of Allah", uz: "Tavhid bilan xilvatga chiqish usuli — Alloh ismlari orqali tasavvur" },
  "/content/module-1/fundamentalnoe.md": { en: "The Healer's Fundamental State — Focus, Breathing, Composure", uz: "Tabibning asosiy holati — diqqat, nafas, o'zini tutish" },
  "/content/module-1/basira.md":         { en: "Basira — Spiritual Vision of the Heart", uz: "Basira — qalbning ruhiy ko'rishi" },
  "/content/module-1/ehsan-i-sila.md":   { en: "Ihsan and Drawing Strength from Allah", uz: "Ehson va Allohdan kuch olish" },
  "/content/module-1/volevoy-akt.md":    { en: "The Act of Will — Holding Intention in the Heart", uz: "Iroda amali — niyatni qalbda tutish san'ati" },
  // Module 2
  "/content/module-2/dozvolennost-zaklinaniya.md": { en: "Permissibility of Incantation — Where the Line Is", uz: "Afsunning ruxsat etilganligi — chegara qayerda" },
  "/content/module-2/chto-takoe-zaklinanie.md": { en: "What Is Incantation — Five Qualities of a True Healer", uz: "Afsun nima — haqiqiy tabibning besh sifati" },
  "/content/module-2/ya-zaklinayu.md":   { en: "I Perform Ruqyah", uz: "Men ruqya qilaman" },
  "/content/module-2/obshchee-ponyatie-zaklinanie.md": { en: "General Concept of Incantation — 'Influence by Will' Method", uz: "Afsunning umumiy tushunchasi — 'Iroda bilan ta'sir' usuli" },
  "/content/module-2/vidy-zaklinaniy.md": { en: "Types of Incantations and Their Application — Three Paths of the Arki Formula", uz: "Afsun turlari va qo'llanilishi — Arki formulasining uch yo'li" },
  "/content/module-2/prodvinutoe-zaklinanie.md": { en: "Advanced Incantation — the Allazi Method (Attribute Derivation)", uz: "Ilg'or afsun — Allaziy usuli (sifat derivatsiyasi)" },
  "/content/module-2/instrumenty-zaklinatelya.md": { en: "Healer's Tools: Permitted Practices", uz: "Tabib vositalari: ruxsat etilgan amaliyotlar" },
  "/content/module-2/rech-s-boleznyu.md": { en: "Addressing the Illness — Full Session Methodology", uz: "Kasallik bilan murojaat — to'liq seans metodologiyasi" },
  "/content/module-2/ubiranie-gryazi.md": { en: "Removing Impurity — Diagnosing and Treating Soul Ailments", uz: "Ifloslikni tozalash — ruh kasalliklarini tashxislash va davolash" },
  "/content/reference/classification.md": { en: "Classification of Ailments (Reference)", uz: "Kasalliklar tasnifi (Ma'lumotnoma)" },
  // Module 3
  "/content/reference/organs.md":        { en: "Dictionary of Body Organs (Reference)", uz: "Tana a'zolari lug'ati (Ma'lumotnoma)" },
  "/content/module-3/vliyanie-emots.md": { en: "30 Emotional Impurities — Body Map, Mechanism and Expulsion Duas", uz: "30 ta hissiy ifloslik — tana xaritasi, mexanizm va haydash duolari" },
  "/content/module-3/krasota.md":        { en: "Impact of Impurities on Appearance and Figure", uz: "Iflosliklarning tashqi ko'rinish va qomatga ta'siri" },
  "/content/module-3/tablitsa-strasti.md": { en: "Organ Protection from Passions — Duas for Each Organ", uz: "A'zolarni nafsdan himoya qilish — har bir a'zo uchun duo" },
  // Module 4
  "/content/module-4/diagnostika.md":    { en: "Diagnosing Soul Ailments — Three Groups of Root Problems", uz: "Ruh kasalliklarini tashxislash — uchta asosiy muammo guruhi" },
  "/content/module-4/zagryazneniya.md":  { en: "Emotional Impurities — Connection with Diagnostics", uz: "Hissiy iflosliklar — diagnostika bilan aloqasi" },
  "/content/module-4/zazhimy.md":        { en: "Soul Wounds — Map of Clamps, Removal Method and 30 Expulsion Duas", uz: "Ruh yaralari — qisqichlar xaritasi, bartaraf etish va 30 ta haydash duosi" },
  // Module 5
  "/content/module-5/ochishchenie-razuma.md": { en: "Mind Purification — Author's Formulas for Body and Psyche", uz: "Aqlni tozalash — tana va ruhiyat uchun muallif formulalari" },
  "/content/module-5/hitab-al-isaba.md": { en: "Khitab al-Isaba — Influence by Will: Organ-Based Method", uz: "Xitob al-Isoba — Iroda bilan ta'sir: a'zo bo'yicha usul" },
  "/content/module-5/zaklinaniya-na-organy.md": { en: "Textbook on Reading Incantations on Organs by Types of Sorcery", uz: "Sehrning turlariga qarab a'zolarga afsun o'qish darsligi" },
  "/content/module-5/prodvinutoe-zaklinanie-posobie.md": { en: "Advanced Incantation Manual — the Allazi Method", uz: "Ilg'or afsun qo'llanmasi — Allaziy usuli" },
  "/content/module-5/sravnenie-silnogo-so-slabym.md": { en: "Strong vs Weak — Components of Effective Incantation", uz: "Kuchli va zaif — samarali afsun tarkibiy qismlari" },
  "/content/module-5/protiv-istoshcheniya.md": { en: "Duas Against Exhaustion Sorcery — 13 Formulas", uz: "Holsizlik sehriga qarshi duolar — 13 formula" },
  "/content/module-5/lecheniya-sglaz.md": { en: "Treating Evil Eye with Water — Purification Program", uz: "Ko'z tegishni suv bilan davolash — tozalash dasturi" },
  "/content/module-5/sikhr-sglaz-posobie.md": { en: "Ruqyah Against Sorcery, Evil Eye and Envy — Detailed Guide", uz: "Sehr, ko'z tegish va hasadga qarshi ruqya — batafsil qo'llanma" },
  "/content/module-5/rukiya-sikhr.md":   { en: "Brief Ruqyah Against Sorcery — 50–70 Minute Session", uz: "Sehrga qarshi qisqa ruqya — 50–70 daqiqalik seans" },
  "/content/module-5/dua-strasti.md":    { en: "Ruqyah for Strengthening Marriage — 10 Duas", uz: "Nikohni mustahkamlash uchun ruqya — 10 ta duo" },
  "/content/module-5/ubiranie-liniy.md": { en: "Guide to Removing Black Lines", uz: "Qora chiziqlarni olib tashlash bo'yicha qo'llanma" },
  "/content/module-5/metod-izbavleniya.md": { en: "Method of Freeing from Jinn — Three-Step Approach", uz: "Jinnlardan xalos bo'lish usuli — uch bosqichli yondashuv" },
  // Module 6
  "/content/reference/azkar.md":         { en: "Basic Adhkar and Protection Duas (Reference)", uz: "Asosiy azkorlar va himoya duolari (Ma'lumotnoma)" },
  "/content/module-6/dua-o-sokrytii.md": { en: "Dua of Divine Concealment and Protection", uz: "Ilohiy saqlanish va himoya duosi" },
  "/content/module-6/dua-zashchity-ot-dzhinnov-i-shaytanov.md": { en: "Personal Protection Duas Against Jinn and Shaytan", uz: "Jinn va shaytonga qarshi shaxsiy himoya duolari" },
  "/content/module-6/arsenal-protiv-koldovstva.md": { en: "Arsenal Against Sorcery, Evil Eye and Envy", uz: "Sehr, ko'z tegish va hasadga qarshi arsenal" },
  "/content/module-6/otkrytie-dukhovnykh-zamkov.md": { en: "Opening Spiritual Locks", uz: "Ruhiy qulflarni ochish" },
  // Module 7
  "/content/module-7/zaklinaniya-na-ubiystvo-dzhinnov.md": { en: "Incantations for Killing and Burning Jinn — Four Formula Levels", uz: "Jinnlarni o'ldirish va yoqish afsunlari — formulaning to'rt darajasi" },
  "/content/module-7/unichtozhenie-dzhinnov-posobie.md": { en: "Textbook on Destroying and Burning Jinn and Spiritual Entities", uz: "Jinnlar va ruhiy mavjudotlarni yo'q qilish darsligi" },
  // Module 8
  "/content/module-8/fundament-mastera.md": { en: "Master's Foundation — Healer's State", uz: "Usta asosi — tabib holati" },
  "/content/module-8/prodvinutye-formuly.md": { en: "Incantation by Action — Advanced Formulas", uz: "Amal bilan afsun — ilg'or formulalar" },
  "/content/module-8/kombo-i-urovni.md": { en: "Combined Formulas and Mastery Levels", uz: "Kombinatsiyalangan formulalar va mahorat darajalari" },
  // Module 9
  "/content/module-9/granitsy-very-i-zastupnichestvo.md": { en: "Boundaries of Faith — Uniqueness of Truth and Intercession", uz: "Imon chegaralari — haqiqat yagonaligi va shafoat masalasi" },
  "/content/module-9/sut-istiny.md":     { en: "What Is Truth — Analysis with Evidences from Quran and Sunnah", uz: "Haqiqat nima — Qur'on va Sunna dalillari bilan tahlil" },
  "/content/module-9/voprosy-mogil.md":  { en: "Questions of Requests at the Grave — Classification of Appeals to the Deceased", uz: "Qabr oldida so'rash masalalari — vafot etganlarga murojaat tasnifi" },
  "/content/module-9/voprosy-zastup.md": { en: "Questions of Intercession — Analysis at the Prophet's ﷺ Grave", uz: "Shafoat masalalari — Payg'ambar ﷺ qabri oldidagi tahlil" },
  // Module 10
  "/content/module-10/raznitsa-praktik-vs-teoretik.md": { en: "Difference Between Practitioner and Theorist in Ruqyah", uz: "Ruqyada amaliyotchi va nazariyotchi o'rtasidagi farq" },
};

export function t(key) {
  const entry = S[key];
  if (!entry) return key;
  const lang = getLang();
  return entry[lang] || entry[DEFAULT] || key;
}

/** Заголовок модуля на текущем языке (русский = из MODULES.title как есть). */
export function moduleTitle(mod) {
  const lang = getLang();
  if (lang === "ru") return mod.title;
  return MODULE_TITLES[mod.id]?.[lang] || mod.title;
}

/** Заголовок урока на текущем языке. */
export function lessonTitle(lesson) {
  const lang = getLang();
  if (lang === "ru") return lesson.title;
  return LESSON_TITLES[lesson.doc]?.[lang] || lesson.title;
}

/** Уровень модуля на текущем языке. */
export function localLevel(level) {
  return t(`level.${level}`);
}

/** Контентный путь с учётом языка:
 *  /content/module-1/index.md → /content/en/module-1/index.md
 *  Для русского возвращает путь как есть. */
export function localizedDocPath(basePath) {
  const lang = getLang();
  if (lang === "ru") return basePath;
  return basePath.replace(/^\/content\//, `/content/${lang}/`);
}
