// Структурные данные навигации курса — НЕ религиозный контент (сам текст в content/).
// Единый источник для оглавления модулей (дорожка-путь), детальных страниц модулей
// и квизов. См. project.md §4 — порядок и статусы соответствуют финальным вердиктам §9а.
export const MODULES = [
  {
    id: 1,
    title: "Основа основ",
    level: "Начальный",
    // status: "author" (было "certified") — урок «Учебник якына» существенно
    // расширен 2026-07-20 (сорокадневная программа, 16 упражнений вместо
    // сжатого пересказа), сам урок понижен до черновика; честно отражаем
    // это и на бейдже модуля на "Пути ученика", а не только на странице
    // самого урока — иначе список модулей показывал бы модуль как
    // "подтверждено шейхом" при том, что треть его уроков ждёт подтверждения.
    status: "author",
    doc: "/content/module-1/index.md",
    cover: "/assets/images/covers/molba-lekarya.jpg",
    lessons: [
      { title: "Учебник якына — убеждённости", doc: "/content/module-1/yakyn.md", exam: "/content/exams/module-1-yakyn.md" },
      { title: "Мольба заклинателя", doc: "/content/module-1/molba-zaklinatelya.md", exam: "/content/exams/module-1-molba-zaklinatelya.md" },
      { title: "Теоретик и практик — как правильно формулировать мольбу", doc: "/content/module-1/teoretik-i-praktik.md", exam: "/content/exams/module-1-teoretik-i-praktik.md" },
      { title: "Метод уединения с таухидом — визуализация через имена Аллаха", doc: "/content/module-1/metod-taukhid.md" },
      { title: "Фундаментальное состояние целителя — собранность, дыхание, фокус", doc: "/content/module-1/fundamentalnoe.md" },
    ],
    intro_video: "/assets/video/rukya-intro.mp4",
  },
  {
    id: 2,
    title: "Основы заклинания",
    level: "Начальный",
    // status: "author" (было "certified") — добавлен новый урок
    // "Продвинутое заклинание — метод «Аллязи»" (перенос авторского
    // материала ruqyah-advanced44.html по решению автора курса,
    // 2026-07-21) — тот же принцип, что и с Модулем 1 (2026-07-20):
    // модуль с материально изменившимся составом уроков понижается до
    // черновика, пока шейх не подтвердит заново.
    status: "author",
    doc: "/content/module-2/index.md",
    cover: "/assets/images/covers/zaklinanie-organy-koldovstvo.jpg",
    lessons: [
      { title: "Дозволенность заклинания — где проходит граница", doc: "/content/module-2/dozvolennost-zaklinaniya.md", exam: "/content/exams/module-2-dozvolennost-zaklinaniya.md" },
      { title: "Я заклинаю", doc: "/content/module-2/ya-zaklinayu.md", exam: "/content/exams/module-2-ya-zaklinayu.md" },
      { title: "Общее понятие заклинания — метод «Влияние Волей»", doc: "/content/module-2/obshchee-ponyatie-zaklinanie.md", exam: "/content/exams/module-2-obshchee-ponyatie-zaklinanie.md" },
      { title: "Продвинутое заклинание — метод «Аллязи» (деривация атрибутов)", doc: "/content/module-2/prodvinutoe-zaklinanie.md", exam: "/content/exams/module-2-prodvinutoe-zaklinanie.md" },
      // Книга №2 инвентаря — восстановлена по решению автора курса (2026-07-21).
      // Три пути формулы «Арки» (органы, предметы, недуги) + каталоги недугов.
      { title: "Виды заклинаний и их применение — три пути формулы «Арки»", doc: "/content/module-2/vidy-zaklinaniy.md" },
      { title: "Инструменты заклинателя: дозволенные практики", doc: "/content/module-2/instrumenty-zaklinatelya.md", exam: "/content/exams/module-2-instrumenty-zaklinatelya.md" },
      { title: "Классификация недугов (Справочник)", doc: "/content/reference/classification.md", exam: "/content/exams/reference-classification.md" },
      { title: "Заклинания (рукья) от недугов души — 15 формул", doc: "/content/module-2/ubiranie-gryazi.md" },
    ],
  },
  {
    id: 3,
    title: "Основы применения",
    level: "Начальный",
    status: "author",
    doc: "/content/module-3/index.md",
    cover: "/assets/images/covers/organy-tela.jpg",
    lessons: [
      { title: "Словарь органов тела (Справочник)", doc: "/content/reference/organs.md", exam: "/content/exams/reference-organs.md" },
      { title: "Влияние эмоциональных загрязнений на тело", doc: "/content/module-3/vliyanie-emots.md" },
      { title: "Влияние загрязнений на внешность и фигуру", doc: "/content/module-3/krasota.md" },
      { title: "Защита органов от страстей — дуа по каждому органу", doc: "/content/module-3/tablitsa-strasti.md" },
    ],
  },
  {
    id: 4,
    title: "Диагностика — протокол безопасности",
    level: "Средний",
    status: "author",
    doc: "/content/module-4/index.md",
    lessons: [
      { title: "Диагностика недугов души — три группы корневых проблем", doc: "/content/module-4/diagnostika.md" },
      { title: "Таблица эмоциональных загрязнений — 30 состояний и зоны тела", doc: "/content/module-4/zagryazneniya.md" },
      { title: "Карта эмоциональных зажимов — метод устранения через зикры", doc: "/content/module-4/zazhimy.md" },
    ],
  },
  {
    id: 5,
    title: "Направленное применение",
    level: "Средний",
    status: "author",
    doc: "/content/module-5/index.md",
    lessons: [
      { title: "Очищение разума — авторские формулы по функциям тела и психики", doc: "/content/module-5/ochishchenie-razuma.md", exam: "/content/exams/module-5-ochishchenie-razuma.md" },
      // Книга №16 инвентаря — раньше исключена целиком (project.md §9а, диагностика
      // надавливанием). По прямому решению автора курса (2026-07-21) восстановлена
      // почти полностью — убрана только сама техника нажатия/надавливания (см.
      // status: "author" в front matter файла и предупреждение в начале урока).
      { title: "Хитаб аль-Исаба — Влияние Волей: метод по органам", doc: "/content/module-5/hitab-al-isaba.md" },
      // Книга №9 (Продвинутый Мастер) перенесена в Модуль 8 целиком.
      // Книга №12 — трёхуровневый метод по органам и видам колдовства.
      { title: "Учебник по чтению заклинаний на органы по видам колдовства", doc: "/content/module-5/zaklinaniya-na-organy.md" },
      // Книга №13 — метод «Аллязи»: составное заклинание через атрибуты Аллаха из Корана.
      { title: "Учебное пособие по продвинутому заклинанию — метод «Аллязи»", doc: "/content/module-5/prodvinutoe-zaklinanie-posobie.md" },
      // Книга №10 — 8 компонентов эффективного заклинания (намерение, визуализация, концентрация, голос, энергия, воля, связь, спецификация).
      { title: "Сравнение сильного со слабым — компоненты эффективного заклинания", doc: "/content/module-5/sravnenie-silnogo-so-slabym.md" },
      { title: "Дуа против колдовства истощения — 13 формул", doc: "/content/module-5/protiv-istoshcheniya.md" },
      { title: "Лечение от сглаза водой — программа очищения", doc: "/content/module-5/lecheniya-sglaz.md" },
      { title: "Рукья против сихра, сглаза и зависти — подробное руководство", doc: "/content/module-5/sikhr-sglaz-posobie.md" },
      { title: "Краткая рукья от колдовства — сеанс 50–70 минут", doc: "/content/module-5/rukiya-sikhr.md" },
      { title: "Рукья для укрепления супружества — 10 дуа", doc: "/content/module-5/dua-strasti.md" },
      { title: "Руководство по убиранию чёрных линий", doc: "/content/module-5/ubiranie-liniy.md" },
      { title: "Метод избавления от джиннов — трёхступенчатый подход", doc: "/content/module-5/metod-izbavleniya.md" },
    ],
  },
  {
    id: 6,
    title: "Основы защиты",
    level: "Средний",
    status: "certified",
    doc: "/content/module-6/index.md",
    cover: "/assets/images/covers/krepost-veruyushchego.jpg",
    lessons: [
      { title: "Базовые азкары и дуа защиты (Справочник)", doc: "/content/reference/azkar.md", exam: "/content/exams/reference-azkar.md" },
      { title: "Дуа о Божественном Сокрытии и Защите", doc: "/content/module-6/dua-o-sokrytii.md", exam: "/content/exams/module-6-dua-o-sokrytii.md" },
      { title: "Дуа личной защиты от джиннов и шайтанов", doc: "/content/module-6/dua-zashchity-ot-dzhinnov-i-shaytanov.md", exam: "/content/exams/module-6-dua-zashchity-ot-dzhinnov-i-shaytanov.md" },
      { title: "Арсенал против колдовства, сглаза и зависти", doc: "/content/module-6/arsenal-protiv-koldovstva.md", exam: "/content/exams/module-6-arsenal-protiv-koldovstva.md" },
      { title: "Открытие духовных замков", doc: "/content/module-6/otkrytie-dukhovnykh-zamkov.md", exam: "/content/exams/module-6-otkrytie-dukhovnykh-zamkov.md" },
      { title: "Закрытие дверей шайтанов — дуа для тела и дома", doc: "/content/module-6/zakrytie-dverey.md" },
    ],
  },
  {
    id: 7,
    title: "Изгнание духовных сущностей",
    level: "Продвинутый",
    status: "author",
    doc: "/content/module-7/index.md",
    cover: "/assets/images/covers/ubivanie-dzhinnov.jpg",
    lessons: [
      // Книга №4 — четырёхуровневая система формул убийства/сжигания джиннов.
      { title: "Заклинания на убийство и сжигание джиннов — четыре уровня формулы", doc: "/content/module-7/zaklinaniya-na-ubiystvo-dzhinnov.md" },
      // Книга №18 — полное руководство: 13 типов джиннов + протоколы уничтожения каждого.
      { title: "Учебник по уничтожению и сжиганию джиннов и духовных сущностей", doc: "/content/module-7/unichtozhenie-dzhinnov-posobie.md" },
      { title: "Дуа против одержимости — 9 формул защиты", doc: "/content/module-7/dua-oderzhimost.md" },
    ],
  },
  {
    id: 8,
    title: "Продвинутый Мастер",
    level: "Продвинутый",
    status: "author",
    doc: "/content/module-8/index.md",
    lessons: [
      { title: "Фундамент мастера — состояние заклинателя", doc: "/content/module-8/fundament-mastera.md" },
      { title: "Заклинание действием — продвинутые формулы", doc: "/content/module-8/prodvinutye-formuly.md" },
      { title: "Комбинированные формулы и уровни мастерства", doc: "/content/module-8/kombo-i-urovni.md" },
    ],
  },
  {
    id: 9,
    title: "Истинное vs ложное заклинание",
    level: "Продвинутый",
    status: "certified",
    doc: "/content/module-9/index.md",
    lessons: [
      { title: "Границы веры — единственность Истины и вопрос заступничества", doc: "/content/module-9/granitsy-very-i-zastupnichestvo.md", exam: "/content/exams/module-9-granitsy-very-i-zastupnichestvo.md" },
      { title: "Что есть истина — разбор с доказательствами из Корана и Сунны", doc: "/content/module-9/sut-istiny.md" },
      { title: "Вопросы просьб у могилы — классификация обращений к умершим", doc: "/content/module-9/voprosy-mogil.md" },
      { title: "Вопросы заступничества — разбор у могилы Пророка ﷺ", doc: "/content/module-9/voprosy-zastup.md" },
    ],
  },
  {
    id: 10,
    title: "Истинный ракый vs лжеракый",
    level: "Продвинутый",
    status: "certified",
    doc: "/content/module-10/index.md",
    lessons: [],
  },
  {
    id: 11,
    title: "Работа в системе RUKYA Pro",
    level: "Продвинутый",
    status: "author",
    doc: "/content/module-11/index.md",
    lessons: [],
  },
];

export function getModule(id) {
  return MODULES.find((m) => m.id === Number(id));
}

/** doc-путь ("/content/module-1/yakyn.md") -> плоский ключ, безопасный для
 * Firestore dot-notation в updateDoc (точки/слэши в doc-пути иначе читались
 * бы как вложенные поля). Используется для прогресса по отдельной книге. */
export function bookKey(docPath) {
  return docPath.replace(/[/.]/g, "_");
}

/** Первая непройденная точка программы в порядке модулей — цель кнопки
 * "Продолжить обучение" в кабинете ученика. Сначала непройденные книги
 * модуля (lessons), затем — если книги пройдены или их нет — тест по
 * самому модулю. Возвращает { module, lesson } (lesson === null значит
 * "иди на страницу модуля и сдай тест по нему") или null, если пройдены
 * все модули целиком. */
export function findNextLesson(progress) {
  for (const m of MODULES) {
    for (const lesson of m.lessons) {
      const done = progress?.books?.[bookKey(lesson.doc)]?.status === "done";
      if (!done) return { module: m, lesson };
    }
    const moduleDone = progress?.[m.id]?.status === "done";
    if (!moduleDone) return { module: m, lesson: null };
  }
  return null;
}

/** Доля прохождения одного модуля (0-100) + признак "в процессе" — для
 * секции "Сейчас в процессе" в кабинете ученика (kabinet-ux-improvements.md
 * §1.2.3). Модули без отдельных книг (lessons: []) считаются по статусу
 * итогового теста модуля: "in_progress" (провальная попытка) даёт 50%,
 * иначе 0/100. */
export function computeModuleProgress(m, progress) {
  const moduleStatus = progress?.[m.id]?.status;
  if (moduleStatus === "done") return { percent: 100, inProgress: false };
  if (!m.lessons.length) {
    return { percent: moduleStatus === "in_progress" ? 50 : 0, inProgress: moduleStatus === "in_progress" };
  }
  const doneLessons = m.lessons.filter((l) => progress?.books?.[bookKey(l.doc)]?.status === "done").length;
  const percent = Math.round((doneLessons / m.lessons.length) * 100);
  const inProgress = (doneLessons > 0 && doneLessons < m.lessons.length) || moduleStatus === "in_progress";
  return { percent, inProgress };
}

export const QUIZ_PASS_THRESHOLD = 0.7;

/** Бейджи за завершённый уровень (Начальный/Средний/Продвинутый) — считаются
 * из уже имеющегося прогресса по модулям, без новой схемы Firestore
 * (project.md, решение 2026-07-18, план улучшения курса). */
export function computeLevelBadges(progress) {
  const levels = [...new Set(MODULES.map((m) => m.level))];
  return levels.map((level) => {
    const modules = MODULES.filter((m) => m.level === level);
    const doneCount = modules.filter((m) => progress?.[m.id]?.status === "done").length;
    return { level, doneCount, total: modules.length, complete: doneCount === modules.length };
  });
}
