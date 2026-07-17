---
title: "План улучшения курса как образовательного продукта"
date: 2026-07-18
status: реализовано (см. отметки [x] ниже) — не богословский контент, доп. подтверждения не требует
---

# План улучшения курса (не сайта-обёртки — самого обучения)

Источник — веб-исследование лучших практик e-learning/онлайн-курсов (Coursera/Udemy-класс
площадок, инструкционный дизайн, геймификация, retention). Ниже: что нашли → что из этого
применимо к нашему стеку (статичный GitHub Pages + Firebase Auth/Firestore, без бэкенда для
писем/пушей) → что сделано.

## Источники

- [9 best practices for online course design — LearnWorlds](https://www.learnworlds.com/blog/elearning/best-practices-online-course-design/)
- [Instructional Design Best Practices 2026 — VideoLearningAI](https://videolearningai.com/blog/instructional-design-best-practices)
- [UX Best Practices for Modern E-Learning Platforms — Pinlearn](https://pinlearn.com/ux-best-practices-for-e-learning-platforms/)
- [25 Ways to Reduce Dropout Rates in eLearning Courses — Shift eLearning](https://www.shiftelearning.com/blog/bid/272689/25-Ways-to-Reduce-Dropout-Rates-in-eLearning-Courses-Part-II)
- [6 eLearning Content Chunking Strategies — eLearning Industry](https://elearningindustry.com/elearning-content-chunking-strategies-apply-instructional-design)
- [Chunking Information for Instructional Design — The eLearning Coach](https://theelearningcoach.com/elearning_design/chunking-information/)
- [Maximize Retention with Quizzes — LearnDash](https://www.learndash.com/blog/maximize-retention-learndash-quizzes/)
- [How Spaced Repetition Boosts Knowledge Retention — LearnDash](https://www.learndash.com/blog/how-spaced-repetition-and-microlearning-boost-knowledge-retention/)
- [Gamification Techniques in E-Learning Platforms — ResearchGate](https://www.researchgate.net/publication/401623787_Gamification_Techniques_in_E-Learning_Platform_A_Framework_for_Student_Engagement_and_Performance)
- [Gamification and Online Learning Streaks — LMSNinjas](https://lmsninjas.com/online-learning-streaks/)
- [Gamification in Education: How to Use It — Open LMS](https://www.openlms.net/blog/insights/gamification-in-education-how-to-use-with-examples/)
- [User Onboarding Best Practices](https://www.udemy.com/course/build-better-ux-for-user-onboarding-with-journey-mapping/)

## Ключевые выводы

1. **Дробление контента (chunking/microlearning).** Короткие фокусированные блоки
   снижают когнитивную перегрузку (Miller, 1956); длинный текст без ориентиров
   («один большой блок») — частая причина ухода читателя. Практический вывод для
   нас: длинные книги нужно снабжать оглавлением/якорями и оценкой времени чтения,
   а не резать сам текст (текст уже прошёл триаж §7/§9, менять нельзя без решения
   пользователя как шейха).
2. **Частые низкоставочные проверки + spaced repetition.** Регулярные короткие тесты
   удерживают до 50% больше материала, чем однократное чтение; ценность повторного
   тестирования растёт со временем между попытками. У нас уже есть тест-после-книги
   (§5 project.md) — недостаёт «мягкого» напоминания вернуться и повторить пройденное
   спустя время.
3. **Геймификация: полосы прогресса, стрики, бейджи.** Прямо называется одним из
   немногих реально работающих инструментов против оттока (у MOOC completion часто
   <10-20%). Наш дашборд уже считает % прогресса и средний балл, но не показывает
   ни серии дней, ни визуального кольца/бейджей за уровень — чистый недобор с учётом
   того, что данные для этого уже есть в Firestore.
4. **Онбординг.** Первое впечатление сильно определяет, продолжит ли человек;
   пустой кабинет без объяснения «что дальше» — частая причина потери новичка в
   первые минуты. У нас кабинет ученика при первом входе показывает пустую сетку
   книг без объяснения модели «сначала бесплатные отрывки — потом оплата».
5. **Реальный контекст/практика.** Теория + разбор кейсов держит вовлечённость
   лучше сухой теории — это уже заложено в структуре курса (итоговые модули =
   разбор кейсов под супервизией, §4 project.md), доп. правок не требует.

## Действия (что применимо к нашему стеку и что сделано)

| # | Идея из исследования | Реализация здесь | Статус |
|---|---|---|---|
| 1 | Стрики (streaks) как удержание | Подсчёт дней подряд по журналу активности `progress.activityDates` (пишется при каждом тесте), карточка "🔥 N дней подряд" в кабинете ученика | [x] |
| 2 | Бейджи/достижения | Бейджи за завершённый уровень (Начальный/Средний/Продвинутый — по `MODULES[].level`), считаются из уже имеющегося прогресса, без новой схемы | [x] |
| 3 | Визуальный индикатор прогресса вместо голого % | Кольцо прогресса (conic-gradient) вместо текстового числа в кабинете ученика | [x] |
| 4 | Онбординг нового пользователя | Приветственная карточка "как это работает" при пустом прогрессе — закрывается один раз, статус в localStorage | [x] |
| 5 | Мягкое напоминание повторить (spaced review) | Дата сдачи (`passedAt`) пишется вместе с результатом теста; если прошло >30 дней — метка "🔄 Стоит повторить" на карточке книги/модуля в кабинете | [x] |
| 6 | Дробление длинного текста / ориентиры чтения | Оглавление (якоря по заголовкам) + оценка времени чтения на странице книги — без изменения самого текста | [x] |
| 7 | Персонализация/адаптивность контента под уровень ученика | Требует бэкенд-логику подбора контента — вне статичного сайта без сервера, не делаю | backlog |
| 8 | Предиктивная аналитика оттока | Требует агрегации событий + ML/правил на сервере — нет бэкенда для этого, ручной дашборд админа уже частично закрывает (видно, кто "молчит") | backlog, уже частично закрыто §19 |
| 9 | Лидерборд (соревновательность между учениками) | Сознательно НЕ делаю — курс про личное духовное развитие, публичное сравнение баллов между учениками неуместно предмету (рукья, не игра) | не делаю (осознанно) |

## Что не реализовано и почему

- **Персонализация/адаптивный контент (№7)** и **предиктивная аналитика (№8)** —
  требуют сервер/ML, за рамками статичного сайта без бэкенда (project.md §11/§16).
- **Лидерборд (№9)** — осознанно отклонён: публичное соревнование неуместно для
  предмета курса (личная практика рукьи, не игра на скорость/баллы).

## Второй проход (2026-07-18) — мгновенная обратная связь + доступность

Источники:
- [Immediate detailed feedback to test-enhanced learning — ResearchGate](https://www.researchgate.net/publication/256447703_Immediate_detailed_feedback_to_test-enhanced_learning_An_effective_online_educational_tool)
- [Using Retrieval Practice to Increase Student Learning — WashU CTL](https://ctl.wustl.edu/resources/using-retrieval-practice-to-increase-student-learning/)
- [Retrieval Practice: How Low-Stakes Quizzes Help — Kognity](https://kognity.com/resources/retrieval-practice/)
- [WCAG Guidelines for Accessible E-Learning — Artisan Learning](https://artisanlearning.com/resources/elearning-accessibility-fixes/)
- [How to Meet WCAG Standards in eLearning — Branch Boston](https://branchboston.com/how-to-meet-wcag-standards-in-elearning-accessibility/)
- [Mayer's 12 Principles of Multimedia Learning — DLI](https://www.digitallearninginstitute.com/blog/mayers-principles-multimedia-learning)
- [The Complete Guide to ARIA Live Regions — A11Y Collective](https://www.a11y-collective.com/blog/aria-live/)
- [ARIA live regions — MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)

**Ключевые выводы:**
1. Обратная связь работает лучше всего, если ученик СНАЧАЛА пытается вспомнить
   ответ (кликает вариант), а ПОТОМ сразу видит верно/неверно — именно эта
   последовательность усиливает запоминание (retrieval + immediate feedback), а
   не показ % только в самом конце теста.
2. WCAG AA — минимальный контраст 4.5:1 для обычного текста, видимый фокус
   клавиатуры на всех интерактивных элементах, `aria-live` для важных
   динамических обновлений (но не злоупотреблять — только там, где
   пользователю правда нужно узнать об изменении).

**Реализовано:**
- Мгновенная обратная связь по каждому вопросу теста (`pages/quiz/index.html`) —
  клик по варианту сразу подсвечивает верно/неверно (зелёный/красный + текст
  "✅ Верно!"/"❌ Неверно"), правильный вариант помечается, если ученик ошибся;
  дальше — кнопка "Далее"/"Завершить". Заменило прежний флоу "просто выбери и
  жми Далее, узнаешь результат в конце".
- **Найден и исправлен реальный WCAG-провал**, вскрывшийся при подключении этой
  фичи: `.quiz-option.is-correct`/`.is-wrong` (готовые, но не использовавшиеся
  классы в design/base.css) заливали вариант ответа жёстко-светлым фоном
  (`--rp-color-green-100`/`--rp-status-danger-bg`) — на тёмной теме "изумруд"
  светлый текст поверх них давал **1.1:1** контраст (нечитаемо, порог WCAG AA —
  4.5:1). Похожая проблема — `review-flag`/`level-badge` (метки из первого
  прохода плана) полагались на `--rp-status-danger` как цвет текста и на
  `opacity` для "неактивного" состояния — на тёмных темах давали 1.7:1 и
  ~4.2:1. Все три переведены на `color-mix()` с текущим `--rp-learn-surface`
  (для заливок вариантов ответа) и на `var(--rp-zone-text)`/различение
  иконкой вместо цвета (для меток) — проверено расчётом контраста, теперь
  9–10:1 на всех темах (`design/base.css`).
- Видимый фокус клавиатуры (`:focus-visible`) — единое кольцо через
  `var(--rp-zone-accent)` для всех интерактивных элементов сайта; раньше
  полагались на браузерный дефолт без гарантии видимости на цветных кнопках.
- `role="log" aria-live="polite"` на списках переписки (кабинет ученика/админа)
  — новое сообщение объявляется вслух ассистивной технологией.

**Не найдено поводов менять:** принципы Мейера (мультимедиа-обучение) — курс
почти весь текстовый (по решению об источниках, project.md §7/§9), видео есть
только у одного модуля как опциональное дополнение — специальных
мультимедиа-практик применять было не к чему в этом проходе.

## Третий проход (2026-07-18) — offline/печать, findability, теория мотивации

Источники:
- [Self-Determination Theory and Online Education: A Primer — Oregon State Ecampus](https://blogs.oregonstate.edu/inspire/2019/06/10/self-determination-theory-and-online-education-a-primer/)
- [Using Self-Determination Theory to Improve Online Learner Motivation — Faculty Focus](https://www.facultyfocus.com/articles/online-education/online-student-engagement/using-self-determination-theory-improve-online-learner-motivation/)
- [Discoverability in UX: Strategies, Challenges & Examples — Ramotion](https://www.ramotion.com/blog/discoverability-in-ux-design/)
- [UX Best Practices for Modern E-Learning Platforms — Pinlearn](https://pinlearn.com/ux-best-practices-for-e-learning-platforms/)
- [Learning Offline: 6 Tips To Create Printer-Friendly eLearning Courses — eLearning Industry](https://elearningindustry.com/learning-offline-6-tips-create-printer-friendly-elearning-courses)
- [The Importance of Offline Options for Online Learners — JIME](https://jime.open.ac.uk/articles/10.5334/jime.898)

**Ключевые выводы:**
1. Self-Determination Theory (Deci & Ryan) — устойчивая внутренняя мотивация
   держится на трёх опорах: автономия (свобода выбора порядка/темпа),
   компетентность (ощутимый прогресс + обратная связь), связанность
   (ощущение, что о тебе заботятся). Автономия и компетентность у нас уже
   закрыты (свободный порядок оплаты, мгновенная обратная связь, кольцо
   прогресса/бейджи из первых двух проходов) — не нашёл, что добавить кодом
   без выдумывания текста от лица автора (связанность — это скорее вопрос
   тона переписки наставника, не UI-фичи).
2. Findability/discoverability — поиск и предсказуемая навигация снижают
   усилие найти нужное; у нас 25 книг видны только "внутри" своих модулей,
   отдельного поиска по названиям книг не было.
3. Офлайн/печать — многие ученики религиозных курсов предпочитают бумагу для
   заучивания/чтения без экрана; печатные материалы должны быть
   малоцветными, с читаемым шрифтом, без интерактивных элементов на странице.

**Реализовано:**
- **Печать/PDF книги.** Кнопка "🖨️ Распечатать / сохранить PDF" на странице
  книги (`pages/book.html`) — тот же паттерн, что уже был на сертификате.
  `@media print` скрывает шапку/подвал/кнопки/CTA (`.no-print`), оставляет
  только текст книги — печатается ровно то, что открыто (эксцерпт или полный
  текст, в зависимости от уровня доступа, пейвол не обходится).
- **Поиск по модулям и книгам** на странице "Путь ученика"
  (`pages/modules/index.html`) — фильтрует не только по названию/уровню
  модуля, но и по названиям вложенных книг (25 книг, которые раньше нигде не
  искались отдельно), показывает, какая именно книга совпала с запросом.
  Чисто клиентская фильтрация по уже загруженным данным `MODULES`.

**Осознанно не реализовано:** «связанность» по SDT — не пишу новый текст от
лица наставника без его участия (это была бы выдумка тона/формулировок,
которую не подтверждал пользователь как автор).

Изменено: `pages/book.html` (кнопка печати + `@media print`),
`pages/modules/index.html` (поиск по модулям/книгам).

Проверено: Playwright — кнопка печати скрывается вместе с шапкой под print
media (`offsetParent === null`), текст книги остаётся видимым; поиск сужает
11 модулей до 1 по названию вложенной книги «Мольба заклинателя», показывает
"Ничего не найдено" на несуществующий запрос, сбрасывается к полному списку
при очистке поля.

## Четвёртый проход (2026-07-18) — трение при регистрации/входе

Источники:
- [Effective Form Error Messages: UX & Accessibility Guide — Static Forms](https://www.staticforms.dev/blog/form-error-messages)
- [Sign Up Flow Best Practices to Reduce Drop-Off Rates — Ping Identity](https://www.pingidentity.com/en/resources/blog/post/frictionless-signup.html)
- [Error Messages: Examples, Best Practices & Common Mistakes — CXL](https://cxl.com/blog/error-messages/)
- [Login & Signup UX: The 2026 Guide to Best Practices — Authgear](https://www.authgear.com/post/login-signup-ux-guide/)

**Ключевые выводы:**
1. 55% пользователей бросают формы, не дойдя до конца; поле пароля — самое
   частое место отказа (~10.5%). Наша форма регистрации уже минимальна (имя/
   email/пароль, 3 поля — сокращать нечего), но:
2. Сообщения об ошибках должны быть понятными и помогающими, а не техническим
   текстом. У нас в обе формы (вход/регистрация) напрямую пробрасывался сырой
   `err.message` из Firebase SDK — английский, с кодом ошибки в скобках
   (`Firebase: Error (auth/email-already-in-use).`) — реальная, а не гипотетическая
   проблема для русскоязычных учеников.
3. Нет обратной связи "идёт отправка" — пользователь мог кликнуть "Отправить"
   несколько раз, не понимая, что форма уже обрабатывается (риск двойной
   отправки + путаница).

**Реализовано:**
- `friendlyAuthError()` в `integration/auth.js` — словарь понятных русских
  сообщений по кодам ошибок Firebase Auth (email занят, неверный пароль,
  слишком много попыток, нет сети и т.д.), с нейтральным fallback для
  неизвестных кодов вместо необработанного текста.
- Кнопки "Войти"/"Зарегистрироваться" получают состояние загрузки
  (текст меняется на "Вход…"/"Регистрация…", блокируются на время запроса,
  разблокируются при ошибке) — `pages/auth/login.html`, `register.html`.
- Видимая подсказка "Минимум 6 символов" у поля пароля при регистрации —
  раньше это правило было видно только через нативную браузерную валидацию.
- `role="alert"` на блоке ошибки формы (WCAG 2.2 Error Identification —
  ошибка должна быть программно определена и озвучена ассистивной технологией).

Изменено: `integration/auth.js` (`friendlyAuthError`), `pages/auth/login.html`,
`pages/auth/register.html`. Версия `auth.js` v6→v7 поднята во всех импортёрах.

Проверено: Playwright с намеренно проваливающимся мок-Firebase — во время
отправки кнопка блокируется и меняет текст, после ошибки показывает понятный
русский текст (не сырой Firebase-код) и снова разблокируется; то же на входе
с кодом `auth/invalid-credential` → "Неверный email или пароль.".

## Пятый проход (2026-07-18) — "вечный спиннер" и рендер-блокирующий скрипт

Источники:
- [Your Loading Spinner Is a UX Killer! Here's an Alternative — Boldist](https://boldist.co/usability/loading-spinner-ux-killer/)
- [Error State Design Patterns: Design for Failures — Figr](https://figr.design/blog/error-state-design-patterns)
- [UI best practices for loading, error, and empty states — LogRocket](https://blog.logrocket.com/ui-design-best-practices-loading-error-empty-state-react/)
- [Remove Render-Blocking JavaScript — Google for Developers](https://developers.google.com/speed/docs/insights/BlockingJS)
- [Render-blocking requests — Chrome for Developers](https://developer.chrome.com/docs/performance/insights/render-blocking)

**Ключевые выводы:**
1. "Design idle, loading, success, and failure states as a family" — у нас
   были состояния idle/loading/success, но не было failure: если запрос к
   Firestore падал (обрыв сети, permission-denied), экран навсегда оставался
   на "Проверка входа…"/"Загрузка…" без единой подсказки — классический
   антипаттерн "вечный спиннер", реальный (не гипотетический) баг, найден
   чтением кода дашбордов на предмет незащищённых `await`.
2. Хороший паттерн отказа: остановить ожидание, сообщить пользователю, дать
   контроль (кнопка "Повторить"), не автоматический тихий ретрай.
3. Синхронный `<script src="...marked.min.js">` в `<head>` блокирует первую
   отрисовку страницы книги/модуля — стандартная рекомендация: `defer`.

**Реализовано:**
- `pages/dashboard/student.html`: `getStudentProfile()` и `listMessages()`
  обёрнуты в try/catch — при ошибке показывается понятный текст + кнопка
  "Повторить" вместо бесконечного "Проверка входа…"; раньше падение
  `listMessages()` заодно тихо ломало обработчик отправки сообщений (код
  после непойманного `await` просто не выполнялся).
- `pages/dashboard/admin.html`: аналогично для `isAdmin()` (гейт входа) и
  `listStudents()` (таблица учеников) — retry-кнопка у таблицы вызывает
  `refreshStudents()` повторно напрямую, без перезагрузки всей страницы.
- `marked.min.js` (`pages/book.html`, `pages/modules/module.html`) получил
  `defer` — не блокирует первую отрисовку, порядок выполнения относительно
  модульного скрипта сохраняется (оба откладываются, порядок в документе).

Изменено: `pages/dashboard/student.html`, `pages/dashboard/admin.html`,
`pages/book.html`, `pages/modules/module.html`. Общие модули не менялись —
версии кэша не поднимал.

Проверено: Playwright с намеренно падающими моками auth.js/firestore.js —
во всех трёх точках отказа (профиль ученика, права админа, список учеников)
вместо зависшего спиннера показывается ошибка с кнопкой "Повторить";
поиск/фильтр в админке остаются рабочими даже когда таблица не загрузилась;
рендер markdown-документа с `defer` на marked.js не сломался (3 заголовка
модуля 1 отрендерились корректно).

## Шестой проход (2026-07-18) — skip-link, показать пароль, ещё один WCAG-провал

Источники:
- [Understanding Success Criterion 2.5.5/2.5.8: Target Size — W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [WebAIM: Skip Navigation Links](https://webaim.org/techniques/skipnav/)
- [Incorporating Skip to Main Content Links — A11Y Collective](https://www.a11y-collective.com/blog/skip-to-main-content/)
- [The Password Eye Dilemma — What's the Right UX?](https://blog.sajidhasan.com/password-eye-dilemma)
- [Quick Fix: Hide and Show Passwords to Reduce Login Problems — UXcellence](https://uxcellence.com/2014/hide-show-passwords)

**Ключевые выводы:**
1. Skip-link должен быть первым фокусируемым элементом страницы — у нас его
   не было нигде; клавиатурный/скринридер-пользователь был вынужден
   пролистывать шапку/навигацию Tab'ом на каждой странице заново.
2. Показ пароля снижает опечатки на вводе — прямое продолжение находки
   четвёртого прохода ("пароль — самое частое поле отказа при регистрации").
3. При проверке размеров интерактивных элементов (WCAG 2.5.8, минимум
   24×24px) — кнопки `.btn-sm` и переключатель тем уже проходят порог,
   специальных правок не потребовалось (в отличие от предыдущих находок,
   здесь всё было уже в норме).

**Реализовано:**
- Skip-link ("Перейти к содержимому") — добавлен в общий `renderHeader()`
  (`pages/js/layout.js`), значит работает на каждой странице сайта разом;
  визуально скрыт за экраном, появляется по фокусу с клавиатуры (WebAIM
  паттерн — не `display:none`, чтобы не выпасть из последовательности фокуса).
- **Побочная находка при проверке**: `pages/index.html` (лендинг) — вообще
  не имел тега `<main>` (только 8 `<section>` без общей обёртки), из-за чего
  на нём не на что было ссылаться skip-link'у, да и ассистивные технологии не
  видели на странице ландмарк "основной контент". Обёрнуто в `<main>`.
- Кнопка "показать/скрыть пароль" (👁/🙈) на входе и регистрации.
- **Ещё один найден WCAG-провал того же типа, что в проходах 2 и 3**:
  `.field-error` (используется и в других местах — ошибка теста, ошибка
  загрузки документа) красился в `--rp-status-danger` напрямую — тот же
  ~2.4:1 контраст на тёмной теме. Переведён на `var(--rp-zone-text)` +
  иконка "⚠" вместо цвета (тот же паттерн, что уже применялся к
  review-flag/level-badge/quiz-feedback).

Изменено: `pages/js/layout.js` (skip-link), `pages/index.html` (`<main>`),
`design/base.css` (`.skip-link`, `.field-error`, `.password-field`/
`.password-toggle`), `pages/auth/login.html`, `pages/auth/register.html`.
Версии `layout.js` v8→v9 и `base.css` v16→v17 подняты во всех импортёрах.

Проверено: Playwright — первый Tab на любой странице фокусирует skip-link,
активация переносит фокус на `<main>`; переключатель показать/скрыть пароля
меняет `type` поля и `aria-pressed`.

## Итог плана (после 6 проходов)

Систематическая находка через весь план: **одна и та же категория бага
повторялась 4 раза** (review-flag → quiz-option → field-error, все три раза
одна причина — `--rp-status-danger`/жёсткий светлый фон как цвет текста без
проверки на тёмной теме "изумруд"). Стоит зафиксировано как урок на будущее:
любой новый компонент с "красным" или "приглушённым" текстом — сразу
проверять `color-mix`/`var(--rp-zone-text)`, не `var(--rp-status-danger)`
напрямую, вместо повторного обнаружения того же класса бага в шестой раз.

## Седьмой (финальный) проход (2026-07-18) — базовая гигиена сайта

Источники:
- [The Complete Guide to Open Graph Tags — LinkPreview](https://linkpreview.io/blog/complete-guide-to-open-graph-tags)
- [Open Graph Tags: Boost Social Sharing and SEO — iMark Infotech](https://www.imarkinfotech.com/open-graph-tags-boost-social-sharing-and-seo-in-2026/)

**Ключевые выводы:** страницы с полным набором Open Graph тегов получают на
~40% больше вовлечённости при репостах — прямо касается этого курса, так как
единственный канал продажи — личка в Telegram, куда ссылка на сайт
пересылается постоянно; без og:image/og:title превью выглядит голой ссылкой.

**Реализовано (аудит "чего просто нет" — не из гайдов, а прямой проверкой файлов):**
- **Favicon** — сайт не имел ни одного, вкладка браузера показывала дефолтную
  иконку. Добавлена как inline SVG data URI (без нового файла-ассета) — тот
  же золотой круг с "ش", что уже используется как фирменный знак в шапке.
  Добавлено на все 11 HTML-страниц.
- **Open Graph/Twitter Card теги** на лендинге (`pages/index.html`) —
  og:title/og:description/og:image (обложка "книги для обучения")/og:url,
  twitter:card — раньше ссылка на сайт в Telegram разворачивалась бы без
  превью или с произвольным текстом.
- **Кастомная страница 404** (`404.html` в корне репозитория — стандартное
  место для GitHub Pages) — раньше отсутствовала, GitHub Pages отдавал бы
  голый служебный 404 без брендинга и без пути назад на сайт. Страница
  самодостаточна (без внешнего CSS — относительные пути ненадёжны на
  произвольной глубине несовпавшего URL), с той же логикой вычисления
  базового пути, что `pages/js/base-path.js`.

Изменено: `pages/index.html` (OG/Twitter теги), все 11 HTML-страниц
(favicon), `404.html` (новый файл).

Проверено: Playwright — favicon и OG-теги видны в `<head>` живого рендера,
`404.html` открывается автономно без ошибок консоли, ссылка "На главную"
корректно вычисляется под локальный/GitHub Pages контекст.

## Итог всего плана (7 проходов, 2026-07-18)

Начиналось с одной просьбы «разработать план полного улучшения курса» —
превратилось в 7 итеративных проходов веб-исследования → находки → точечная
реализация → проверка. Коротко, что изменилось в курсе как продукте:

- **Мотивация/удержание**: стрики, бейджи за уровень, кольцо прогресса,
  онбординг новичка, мягкое "стоит повторить" через 30 дней.
- **Обучение**: мгновенная обратная связь по вопросу теста (retrieval
  practice), оглавление + оценка времени чтения книг.
- **Доступность (WCAG)**: видимый фокус клавиатуры, skip-link, `aria-live`
  на переписке, 4 независимо найденных и исправленных провала контраста на
  тёмной теме (единый паттерн — см. раздел про пятую находку выше).
- **Трение при входе**: понятные русские сообщения об ошибках вместо сырых
  кодов Firebase, loading-состояния кнопок, показать/скрыть пароль.
- **Надёжность**: устранён "вечный спиннер" в обоих кабинетах при обрыве
  связи, `defer` на блокирующий рендер скрипт.
- **Находимость/офлайн**: поиск по модулям и книгам, печать/PDF книги.
- **Базовая гигиена**: favicon, Open Graph превью, кастомная 404.

Всё — код и клиентские вычисления поверх уже существующей схемы Firestore;
богословский контент модулей не менялся ни разу. Всё проверено Playwright
на реальном рендере (мобайл+десктоп, где применимо — все 3 темы сайта)
перед тем, как считаться готовым.
