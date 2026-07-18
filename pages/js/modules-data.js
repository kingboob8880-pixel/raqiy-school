// Структурные данные навигации курса — НЕ религиозный контент (сам текст в content/).
// Единый источник для оглавления модулей (дорожка-путь), детальных страниц модулей
// и квизов. См. project.md §4 — порядок и статусы соответствуют финальным вердиктам §9а.
export const MODULES = [
  {
    id: 1,
    title: "Основа основ",
    level: "Начальный",
    status: "certified",
    doc: "/content/module-1/index.md",
    cover: "/assets/images/covers/molba-lekarya.jpg",
    lessons: [
      { title: "Учебник якына — убеждённости", doc: "/content/module-1/yakyn.md", exam: "/content/exams/module-1-yakyn.md" },
      { title: "Мольба заклинателя", doc: "/content/module-1/molba-zaklinatelya.md", exam: "/content/exams/module-1-molba-zaklinatelya.md" },
      { title: "Теоретик и практик — как правильно формулировать мольбу", doc: "/content/module-1/teoretik-i-praktik.md", exam: "/content/exams/module-1-teoretik-i-praktik.md" },
    ],
    intro_video: "/assets/video/rukya-intro.mp4",
  },
  {
    id: 2,
    title: "Основы заклинания",
    level: "Начальный",
    status: "certified",
    doc: "/content/module-2/index.md",
    cover: "/assets/images/covers/zaklinanie-organy-koldovstvo.jpg",
    lessons: [
      { title: "Дозволенность заклинания — где проходит граница", doc: "/content/module-2/dozvolennost-zaklinaniya.md", exam: "/content/exams/module-2-dozvolennost-zaklinaniya.md" },
      { title: "Я заклинаю", doc: "/content/module-2/ya-zaklinayu.md", exam: "/content/exams/module-2-ya-zaklinayu.md" },
      { title: "Общее понятие заклинания — метод «Влияние Волей»", doc: "/content/module-2/obshchee-ponyatie-zaklinanie.md", exam: "/content/exams/module-2-obshchee-ponyatie-zaklinanie.md" },
      { title: "Инструменты заклинателя: дозволенные практики", doc: "/content/module-2/instrumenty-zaklinatelya.md", exam: "/content/exams/module-2-instrumenty-zaklinatelya.md" },
      { title: "Классификация недугов (Справочник)", doc: "/content/reference/classification.md", exam: "/content/exams/reference-classification.md" },
    ],
  },
  {
    id: 3,
    title: "Основы применения",
    level: "Начальный",
    status: "draft",
    doc: "/content/module-3/index.md",
    cover: "/assets/images/covers/organy-tela.jpg",
    lessons: [
      { title: "Словарь органов тела (Справочник)", doc: "/content/reference/organs.md", exam: "/content/exams/reference-organs.md" },
    ],
  },
  {
    id: 4,
    title: "Диагностика — протокол безопасности",
    level: "Средний",
    status: "draft",
    doc: "/content/module-4/index.md",
    lessons: [],
  },
  {
    id: 5,
    title: "Направленное применение",
    level: "Средний",
    status: "draft",
    doc: "/content/module-5/index.md",
    lessons: [
      { title: "Очищение разума — авторские формулы по функциям тела и психики", doc: "/content/module-5/ochishchenie-razuma.md", exam: "/content/exams/module-5-ochishchenie-razuma.md" },
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
    ],
  },
  {
    id: 7,
    title: "Изгнание духовных сущностей",
    level: "Продвинутый",
    status: "draft",
    doc: "/content/module-7/index.md",
    cover: "/assets/images/covers/ubivanie-dzhinnov.jpg",
    lessons: [],
  },
  {
    id: 8,
    title: "Итоговая практика под супервизией",
    level: "Продвинутый",
    status: "draft",
    doc: "/content/module-8/index.md",
    lessons: [],
  },
  {
    id: 9,
    title: "Истинное vs ложное заклинание",
    level: "Продвинутый",
    status: "certified",
    doc: "/content/module-9/index.md",
    lessons: [
      { title: "Границы веры — единственность Истины и вопрос заступничества", doc: "/content/module-9/granitsy-very-i-zastupnichestvo.md", exam: "/content/exams/module-9-granitsy-very-i-zastupnichestvo.md" },
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
    status: "draft",
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
