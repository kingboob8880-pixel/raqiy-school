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
  "nav.archive":       { ru: "Архив", en: "Archive", uz: "Arxiv" },
  "nav.dashboard":     { ru: "Кабинет", en: "Dashboard", uz: "Kabinet" },
  "auth.login":        { ru: "Войти", en: "Sign in", uz: "Kirish" },
  "skip.link":         { ru: "Перейти к содержимому", en: "Skip to content", uz: "Kontentga o'tish" },
  "menu.open":         { ru: "Открыть меню", en: "Open menu", uz: "Menyuni ochish" },

  // Footer
  "footer.text":       { ru: "Онлайн-школа рукии · Лекарь Абу Мухаммад · Основатель школы", en: "Online Ruqyah School · Healer Abu Muhammad · School Founder", uz: "Onlayn ruqya maktabi · Tabib Abu Muhammad · Maktab asoschisi" },

  // Modules list (index)
  "modules.title":     { ru: "Путь ученика", en: "Student's Path", uz: "Talaba yo'li" },
  "modules.subtitle":  { ru: "11 модулей · от основ к самостоятельному приёму", en: "11 modules · from basics to independent practice", uz: "11 modul · asoslardan mustaqil amaliyotga" },

  // Module page
  "module.lessons":    { ru: "Уроки", en: "Lessons", uz: "Darslar" },
  "module.text":       { ru: "Текст модуля", en: "Module text", uz: "Modul matni" },
  "module.quiz":       { ru: "Пройти тест по модулю →", en: "Take module test →", uz: "Modul testini topshirish →" },
  "module.notcert":    { ru: "Модуль ещё не подтверждён шейхом — тест можно пройти для практики, но материал может измениться.", en: "Module not yet certified by sheikh — test available for practice, but content may change.", uz: "Modul shayx tomonidan tasdiqlanmagan — test mashq uchun, lekin mazmun o'zgarishi mumkin." },
  "module.nolessons":  { ru: "Отдельных уроков-первоисточников нет — весь текст модуля на его собственной странице ниже.", en: "No separate source lessons — full module text is on this page below.", uz: "Alohida dars-manbalar yo'q — modul matni to'liq shu sahifada." },
  "module.n":          { ru: "Модуль", en: "Module", uz: "Modul" },

  // Lesson meta
  "lesson.done":       { ru: "✓ Книга и тест пройдены", en: "✓ Book and test passed", uz: "✓ Kitob va test topshirildi" },
  "lesson.exam":       { ru: "📝 Экзамен по книге · порог 70%", en: "📝 Book exam · 70% threshold", uz: "📝 Kitob imtihoni · 70% chegara" },

  // Book page
  "book.back":         { ru: "← Назад", en: "← Back", uz: "← Orqaga" },
  "book.pdf":          { ru: "📥 Скачать PDF", en: "📥 Download PDF", uz: "📥 PDF yuklab olish" },
  "book.print":        { ru: "🖨️ Распечатать", en: "🖨️ Print", uz: "🖨️ Chop etish" },
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
  "status.certified":  { ru: "Подтверждено шейхом", en: "Certified by sheikh", uz: "Shayx tomonidan tasdiqlangan" },
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
  "common.nojs":       { ru: "Для работы сайта необходим JavaScript. Пожалуйста, включите его в настройках браузера.", en: "This site requires JavaScript. Please enable it in your browser settings.", uz: "Sayt ishlashi uchun JavaScript kerak. Brauzер sozlamalarida uni yoqing." },

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
  "about.school.title":  { ru: "Онлайн-школа рукии", en: "Online Ruqyah School", uz: "Onlayn ruqya maktabi" },
  "about.contacts.title": { ru: "Контакты", en: "Contacts", uz: "Aloqa" },
  "about.cta.modules":   { ru: "Смотреть модули курса", en: "View course modules", uz: "Kurs modullarini ko'rish" },
  "about.cta.home":      { ru: "На главную", en: "Home", uz: "Bosh sahifa" },
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

  // ── Modules search ──
  "modules.search":      { ru: "Поиск по модулям и книгам…", en: "Search modules and books…", uz: "Modullar va kitoblar bo'yicha qidirish…" },
  "modules.noResults":   { ru: "Ничего не найдено.", en: "Nothing found.", uz: "Hech narsa topilmadi." },

  // ── Path section headers ──
  "path.beginner":       { ru: "Начальный уровень", en: "Beginner Level", uz: "Boshlang'ich daraja" },
  "path.intermediate":   { ru: "Средний уровень", en: "Intermediate Level", uz: "O'rta daraja" },
  "path.advanced":       { ru: "Продвинутый уровень", en: "Advanced Level", uz: "Yuqori daraja" },
  "path.modules":        { ru: "Модули", en: "Modules", uz: "Modullar" }
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
