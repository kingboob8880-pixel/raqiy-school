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
