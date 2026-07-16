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
    lessons: [
      { title: "Учебник якына — убеждённости", doc: "/content/module-1/yakyn.md" },
      { title: "Мольба заклинателя", doc: "/content/module-1/molba-zaklinatelya.md" },
    ],
    intro_video: "/assets/video/rukya-intro.mp4",
  },
  {
    id: 2,
    title: "Основы заклинания",
    level: "Начальный",
    status: "certified",
    doc: "/content/module-2/index.md",
    lessons: [
      { title: "Я заклинаю", doc: "/content/module-2/ya-zaklinayu.md" },
      { title: "Общее понятие заклинания — метод «Влияние Волей»", doc: "/content/module-2/obshchee-ponyatie-zaklinanie.md" },
      { title: "Классификация недугов (Справочник)", doc: "/content/reference/classification.md" },
    ],
  },
  {
    id: 3,
    title: "Основы применения",
    level: "Начальный",
    status: "draft",
    doc: "/content/module-3/index.md",
    lessons: [
      { title: "Словарь органов тела (Справочник)", doc: "/content/reference/organs.md" },
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
    lessons: [],
  },
  {
    id: 6,
    title: "Основы защиты",
    level: "Средний",
    status: "certified",
    doc: "/content/module-6/index.md",
    lessons: [
      { title: "Базовые азкары и дуа защиты (Справочник)", doc: "/content/reference/azkar.md" },
    ],
  },
  {
    id: 7,
    title: "Изгнание духовных сущностей",
    level: "Продвинутый",
    status: "draft",
    doc: "/content/module-7/index.md",
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
    lessons: [],
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

export const QUIZ_PASS_THRESHOLD = 0.7;
