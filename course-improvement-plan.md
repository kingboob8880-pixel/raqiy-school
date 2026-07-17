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
