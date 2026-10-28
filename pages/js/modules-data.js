// Структурные данные навигации курса — НЕ религиозный контент (сам текст в content/).
// Единый источник для оглавления модулей (дорожка-путь), детальных страниц модулей
// и квизов. См. project.md §4 — порядок и статусы соответствуют финальным вердиктам §9а.
export const MODULES = [
  {
    id: 1,
    title: "Основание, дозволенность и допуск",
    level: "Начальный",
    status: "certified",
    doc: "/content/module-1/index.md",
    cover: "/assets/images/covers/volevoy-akt.jpg",
    lessons: [
      {
        title: "Входной ценз — проверка чтения (прежде чем начать курс)",
        doc: "/content/module-1/vhodnyy-cenz-chteniya.md",
        exam: "/content/exams/module-1-vhodnyy-cenz-chteniya.md"
      },
      {
        title: "Поклонение — кому ты поклоняешься и какое место это занимает в заклинании",
        doc: "/content/module-1/poklonenie.md",
        exam: "/content/exams/module-1-poklonenie.md"
      },
      {
        title: "Что есть истина — разбор с доказательствами из Корана и Сунны",
        doc: "/content/module-9/sut-istiny.md",
        exam: "/content/exams/module-9-sut-istiny.md"
      },
      {
        title: "Границы веры — единственность Истины и вопрос заступничества",
        doc: "/content/module-9/granitsy-very-i-zastupnichestvo.md",
        exam: "/content/exams/module-9-granitsy-very-i-zastupnichestvo.md"
      },
      {
        title: "Вопросы заступничества — разбор у могилы Пророка ﷺ",
        doc: "/content/module-9/voprosy-zastup.md",
        exam: "/content/exams/module-9-voprosy-zastup.md"
      },
      {
        title: "Метод уединения с таухидом — визуализация через имена Аллаха",
        doc: "/content/module-1/metod-taukhid.md",
        exam: "/content/exams/module-1-metod-taukhid.md"
      },
      {
        title: "Эхсан и черпание силы от Аллаха",
        doc: "/content/module-1/ehsan-i-sila.md",
        exam: "/content/exams/module-1-ehsan-i-sila.md"
      },
      {
        title: "Дозволенность заклинания — где проходит граница",
        doc: "/content/module-2/dozvolennost-zaklinaniya.md",
        exam: "/content/exams/module-2-dozvolennost-zaklinaniya.md"
      },
      {
        title: "Исцеляю Кораном — довод, границы и правильное понимание",
        doc: "/content/module-2/istselyayu-koranom.md",
        exam: "/content/exams/module-2-istselyayu-koranom.md"
      }
    ],
    intro_video: "/assets/video/rukya-intro.mp4"
  },
  {
    id: 2,
    title: "Подготовка лекаря",
    level: "Начальный",
    status: "certified",
    doc: "/content/module-2/index.md",
    cover: "/assets/images/covers/Gemini_Generated_Image_rvbggorvbggorvbg.jpg",
    lessons: [
      {
        title: "Учебник якына — убеждённости",
        doc: "/content/module-1/yakyn.md",
        exam: "/content/exams/module-1-yakyn.md"
      },
      {
        title: "Мольба заклинателя",
        doc: "/content/module-1/molba-zaklinatelya.md",
        exam: "/content/exams/module-1-molba-zaklinatelya.md"
      },
      {
        title: "Теоретик и практик — как правильно формулировать мольбу",
        doc: "/content/module-1/teoretik-i-praktik.md",
        exam: "/content/exams/module-1-teoretik-i-praktik.md"
      },
      {
        title: "Фундаментальное состояние целителя — собранность, дыхание, фокус",
        doc: "/content/module-1/fundamentalnoe.md",
        exam: "/content/exams/module-1-fundamentalnoe.md"
      },
      {
        title: "Басира — духовное зрение сердцем",
        doc: "/content/module-1/basira.md",
        exam: "/content/exams/module-1-basira.md"
      },
      {
        title: "Учебник по намерениям — виды, ярусы и выработка убеждённости",
        doc: "/content/module-1/namereniya.md",
        exam: "/content/exams/module-1-namereniya.md"
      },
      {
        title: "Волевой акт — часть 1: основа, понятие, анатомия намерения",
        doc: "/content/module-1/volevoy-akt.md",
        exam: "/content/exams/module-1-volevoy-akt.md"
      },
      {
        title: "Волевой акт — часть 2: метод заряжения и полная последовательность",
        doc: "/content/module-1/volevoy-akt-2-zaryazhenie-posledovatelnost.md",
        exam: "/content/exams/module-1-volevoy-akt-2.md"
      },
      {
        title: "Волевой акт — часть 3: тренировки, разрушители, уровни прогресса",
        doc: "/content/module-1/volevoy-akt-3-trenirovki-razrushiteli-urovni.md",
        exam: "/content/exams/module-1-volevoy-akt-3.md"
      },
      {
        title: "Волевой акт — часть 4: советы, мольбы, контрольный список",
        doc: "/content/module-1/volevoy-akt-4-sovety-molby-spisok.md",
        exam: "/content/exams/module-1-volevoy-akt-4.md"
      },
      {
        title: "Шаблоны намерения — короткие формулы для каждого случая",
        doc: "/content/reference/niyat.md",
        exam: "/content/exams/module-1-niyat.md"
      },
      {
        title: "Шкала усиления души — восемь ступеней и восемнадцать путей",
        doc: "/content/module-1/shkala-usileniya-dushi.md",
        exam: "/content/exams/module-1-shkala.md"
      },
      {
        title: "Прямой путь — вера и намерение",
        doc: "/content/module-12/pryamoy-put.md",
        exam: "/content/exams/module-12-pryamoy-put.md"
      },
      {
        title: "Пути влияния — понятие и мольбы",
        doc: "/content/module-12/puti-vliyaniya.md",
        exam: "/content/exams/module-12-puti-vliyaniya.md"
      },
      {
        title: "Прямой путь — подготовка и целостная практика",
        doc: "/content/module-12/podgotovka-pryamoy-put.md",
        exam: "/content/exams/module-12-podgotovka-pryamoy-put.md"
      },
      {
        title: "Сводка «Прямого пути» (Ресурс)",
        doc: "/content/reference/pryamoy-put-svodka.md",
        exam: "/content/exams/module-12-pryamoy-put-svodka.md"
      }
    ]
  },
  {
    id: 3,
    title: "Коран, дуа и язык формул",
    level: "Начальный",
    status: "certified",
    doc: "/content/module-3/index.md",
    cover: "/assets/images/covers/zaklinanie-organy-koldovstvo.jpg",
    lessons: [
      {
        title: "Что такое заклинание — пять качеств истинного заклинателя",
        doc: "/content/module-2/chto-takoe-zaklinanie.md",
        exam: "/content/exams/module-2-chto-takoe-zaklinanie.md"
      },
      {
        title: "Я заклинаю",
        doc: "/content/module-2/ya-zaklinayu.md",
        exam: "/content/exams/module-2-ya-zaklinayu.md"
      },
      {
        title: "Общее понятие заклинания — метод «Влияние Волей»",
        doc: "/content/module-2/obshchee-ponyatie-zaklinanie.md",
        exam: "/content/exams/module-2-obshchee-ponyatie-zaklinanie.md"
      },
      {
        title: "Виды заклинаний — часть 1: три пути формулы «Арки» и обобщённое заклинание",
        doc: "/content/module-2/vidy-zaklinaniy.md",
        exam: "/content/exams/module-2-vidy-zaklinaniy.md"
      },
      {
        title: "Виды заклинаний — часть 2: начальная формула, произнесение, порядок и сводка",
        doc: "/content/module-2/vidy-zaklinaniy-2-proiznoshenie-poryadok.md",
        exam: "/content/exams/module-2-vidy-2.md"
      },
      {
        title: "Продвинутое заклинание — метод «Аллязи» (деривация атрибутов)",
        doc: "/content/module-2/prodvinutoe-zaklinanie.md",
        exam: "/content/exams/module-2-prodvinutoe-zaklinanie.md"
      },
      {
        title: "Инструменты заклинателя: дозволенные практики",
        doc: "/content/module-2/instrumenty-zaklinatelya.md",
        exam: "/content/exams/module-2-instrumenty-zaklinatelya.md"
      },
      {
        title: "Речь с болезнью — полная методология сеанса рукьи",
        doc: "/content/module-2/rech-s-boleznyu.md",
        exam: "/content/exams/module-2-rech-s-boleznyu.md"
      },
      {
        title: "Убирание грязи — диагностика и заклинание недугов души",
        doc: "/content/module-2/ubiranie-gryazi.md",
        exam: "/content/exams/module-2-ubiranie-gryazi.md"
      },
      {
        title: "Классификация недугов (Справочник)",
        doc: "/content/reference/classification.md",
        exam: "/content/exams/reference-classification.md"
      },
      {
        title: "Каталог атрибутов «Аллязи» (Справочник)",
        doc: "/content/reference/allyazi-atributy.md",
        exam: "/content/exams/reference-allyazi-atributy.md"
      },
      {
        title: "Словарь органов тела (Справочник)",
        doc: "/content/reference/organs.md",
        exam: "/content/exams/reference-organs.md"
      },
      {
        title: "Пособие по продвинутому заклинанию — часть 1: атрибуты из аятов",
        doc: "/content/module-5/prodvinutoe-zaklinanie-posobie.md",
        exam: "/content/exams/module-5-prodvinutoe-zaklinanie-posobie.md"
      },
      {
        title: "Пособие по продвинутому заклинанию — часть 2: заклинание на действие, комбинированные формулы, сводная таблица",
        doc: "/content/module-5/prodvinutoe-zaklinanie-posobie-2-deystvie-kombo.md",
        exam: "/content/exams/module-5-posobie-2.md"
      }
    ]
  },
  {
    id: 4,
    title: "Диагностика и безопасность приёма",
    level: "Средний",
    status: "certified",
    doc: "/content/module-4/index.md",
    cover: "/assets/images/covers/diagnostika.jpg",
    lessons: [
      {
        title: "30 эмоциональных загрязнений — карта тела, механизм и дуа изгнания",
        doc: "/content/module-3/vliyanie-emots.md",
        exam: "/content/exams/module-3-vliyanie-emots.md"
      },
      {
        title: "Влияние загрязнений на внешность и фигуру",
        doc: "/content/module-3/krasota.md",
        exam: "/content/exams/module-3-krasota.md"
      },
      {
        title: "Защита органов от страстей — дуа по каждому органу",
        doc: "/content/module-3/tablitsa-strasti.md",
        exam: "/content/exams/module-3-tablitsa-strasti.md"
      },
      {
        title: "Диагностика недугов души — три группы корневых проблем",
        doc: "/content/module-4/diagnostika.md",
        exam: "/content/exams/module-4-diagnostika.md"
      },
      {
        title: "Эмоциональные загрязнения — связь с диагностикой",
        doc: "/content/module-4/zagryazneniya.md",
        exam: "/content/exams/module-4-zagryazneniya.md"
      },
      {
        title: "Раны души — карта зажимов, метод устранения и 30 дуа выведения",
        doc: "/content/module-4/zazhimy.md",
        exam: "/content/exams/module-4-zazhimy.md"
      },
      {
        title: "Банк диагностических кейсов — 15 разборов с эталоном",
        doc: "/content/module-4/bank-casey.md",
        exam: "/content/exams/module-4-bank-casey.md"
      },
      {
        title: "Тренажёр приёма: опрос и граница «активизация против угрозы»",
        doc: "/content/module-4/aktivizatsiya-vs-ugroza.md",
        exam: "/content/exams/module-4-aktivizatsiya-vs-ugroza.md"
      },
      {
        title: "Профили случая A/B/C, три окна проверки и карточка случая",
        doc: "/content/module-11/profili-sluchaev-i-okna-proverki.md",
        exam: "/content/exams/module-11-profili-sluchaev.md"
      }
    ]
  },
  {
    id: 5,
    title: "Хитаб Исаба: полный цикл",
    level: "Средний",
    status: "certified",
    doc: "/content/module-5/index.md",
    cover: "/assets/images/covers/napravlennoe-primenenie.jpg",
    lessons: [
      {
        title: "Хитаб аль-Исаба — часть 1: метод, органы, ключи воздействия",
        doc: "/content/module-5/hitab-al-isaba.md",
        exam: "/content/exams/module-5-hitab-al-isaba.md"
      },
      {
        title: "Хитаб аль-Исаба — часть 2: протокол полного сеанса, сводные таблицы, предостережения",
        doc: "/content/module-5/hitab-al-isaba-2-protokol-seansa.md",
        exam: "/content/exams/module-5-hitab-2.md"
      },
      {
        title: "Хитаб аль-Исаба — часть 3: три адресата, правило трёх и четыре двери диагностики",
        doc: "/content/module-5/hitab-al-isaba-3-adresat-i-diagnostika.md",
        exam: "/content/exams/module-5-hitab-3.md"
      },
      {
        title: "Хитаб аль-Исаба — часть 4: тринадцать шагов полного чтения и тахриж",
        doc: "/content/module-5/hitab-al-isaba-4-13-shagov-i-tahrizh.md",
        exam: "/content/exams/module-5-hitab-4.md"
      },
      {
        title: "Хитаб аль-Исаба — часть 5: пятичастная формула, конструктор и статус текстов",
        doc: "/content/module-5/hitab-al-isaba-5-formula-i-konstruktor.md",
        exam: "/content/exams/module-5-hitab-5.md"
      }
    ]
  },
  {
    id: 6,
    title: "Хитаб Исаба: зоны и сеанс",
    level: "Средний",
    status: "certified",
    doc: "/content/module-6/index.md",
    cover: "/assets/images/covers/organy-tela.jpg",
    lessons: [
      {
        title: "Очищение разума — авторские формулы по функциям тела и психики",
        doc: "/content/module-5/ochishchenie-razuma.md",
        exam: "/content/exams/module-5-ochishchenie-razuma.md"
      },
      {
        title: "Учебник по чтению заклинаний на органы по видам колдовства",
        doc: "/content/module-5/zaklinaniya-na-organy.md",
        exam: "/content/exams/module-5-zaklinaniya-na-organy.md"
      },
      {
        title: "Каталог по видам колдовства — часть 1 (Справочник)",
        doc: "/content/reference/zaklinaniya-na-organy-katalog-1.md",
        exam: "/content/exams/reference-organy-katalog-1.md"
      },
      {
        title: "Каталог по видам колдовства — часть 2 (Справочник)",
        doc: "/content/reference/zaklinaniya-na-organy-katalog-2.md",
        exam: "/content/exams/reference-organy-katalog-2.md"
      },
      {
        title: "Каталог по видам колдовства — часть 3 (Справочник)",
        doc: "/content/reference/zaklinaniya-na-organy-katalog-3.md",
        exam: "/content/exams/reference-organy-katalog-3.md"
      },
      {
        title: "Библиотека формул Хитаб аль-Исаба (Справочник)",
        doc: "/content/reference/hitab-biblioteka-formul.md",
        exam: "/content/exams/reference-hitab-formuly.md"
      },
      {
        title: "Приложения Хитаб аль-Исаба — глоссарий, программа 10 дней, дневник (Справочник)",
        doc: "/content/reference/hitab-prilozheniya.md",
        exam: "/content/exams/reference-hitab-prilozheniya.md"
      },
      {
        title: "Один точный проход: протокол 25 минут и четыре маркера",
        doc: "/content/module-11/protokol-odnogo-chteniya.md",
        exam: "/content/exams/module-11-protokol-odnogo-chteniya.md"
      },
      {
        title: "Дистанционный сеанс и самоисцеление: те же требования, другой адрес",
        doc: "/content/module-11/distancionnyy-seans-i-samoiscelenie.md",
        exam: "/content/exams/module-11-distancionnyy-seans.md"
      }
    ]
  },
  {
    id: 7,
    title: "Очищение, защита и закрепление",
    level: "Средний",
    status: "certified",
    doc: "/content/module-7/index.md",
    cover: "/assets/images/covers/krepost-veruyushchego.jpg",
    lessons: [
      {
        title: "Базовые азкары и дуа защиты (Справочник)",
        doc: "/content/reference/azkar.md",
        exam: "/content/exams/reference-azkar.md"
      },
      {
        title: "Дуа о Божественном Сокрытии и Защите",
        doc: "/content/module-6/dua-o-sokrytii.md",
        exam: "/content/exams/module-6-dua-o-sokrytii.md"
      },
      {
        title: "Дуа личной защиты от джиннов и шайтанов",
        doc: "/content/module-6/dua-zashchity-ot-dzhinnov-i-shaytanov.md",
        exam: "/content/exams/module-6-dua-zashchity-ot-dzhinnov-i-shaytanov.md"
      },
      {
        title: "Арсенал против колдовства, сглаза и зависти",
        doc: "/content/module-6/arsenal-protiv-koldovstva.md",
        exam: "/content/exams/module-6-arsenal-protiv-koldovstva.md"
      },
      {
        title: "Открытие духовных замков",
        doc: "/content/module-6/otkrytie-dukhovnykh-zamkov.md",
        exam: "/content/exams/module-6-otkrytie-dukhovnykh-zamkov.md"
      },
      {
        title: "Защита дома и целителя: состояние, порядок, пространство",
        doc: "/content/module-6/zashchita-doma-i-celitelya.md",
        exam: "/content/exams/module-6-zashchita-doma.md"
      },
      {
        title: "Три уровня защиты и четыре слоя — порядок, который держит результат",
        doc: "/content/module-6/tre-urovnya-zashchity.md",
        exam: "/content/exams/module-6-tri-urovnya-zashchity.md"
      },
      {
        title: "Духовный заряд Кораном — мольбы о корнях души",
        doc: "/content/module-12/zaryad-koranom.md",
        exam: "/content/exams/module-12-zaryad-koranom.md"
      },
      {
        title: "Разрыв путей колдовства — метод полного отсечения и изгнания",
        doc: "/content/module-12/razriv-putej-koldovstva.md",
        exam: "/content/exams/module-12-razriv-putej-koldovstva.md"
      },
      {
        title: "Дуа против колдовства истощения — 13 формул",
        doc: "/content/module-5/protiv-istoshcheniya.md",
        exam: "/content/exams/module-5-protiv-istoshcheniya.md"
      },
      {
        title: "Лечение от сглаза водой — программа очищения",
        doc: "/content/module-5/lecheniya-sglaz.md",
        exam: "/content/exams/module-5-lecheniya-sglaz.md"
      },
      {
        title: "Рукья против сихра, сглаза и зависти — подробное руководство",
        doc: "/content/module-5/sikhr-sglaz-posobie.md",
        exam: "/content/exams/module-5-sikhr-sglaz-posobie.md"
      },
      {
        title: "Краткая рукья от колдовства — сеанс 50–70 минут",
        doc: "/content/module-5/rukiya-sikhr.md",
        exam: "/content/exams/module-5-rukiya-sikhr.md"
      },
      {
        title: "Руководство по убиранию чёрных линий",
        doc: "/content/module-5/ubiranie-liniy.md",
        exam: "/content/exams/module-5-ubiranie-liniy.md"
      },
      {
        title: "Исцеляю Кораном на практике — формулы по видам поражения",
        doc: "/content/module-5/istselyayu-koranom-praktika.md",
        exam: "/content/exams/module-5-istselyayu-koranom-praktika.md"
      },
      {
        title: "Слушание и чтение Корана с намерением аннулирования",
        doc: "/content/module-7/new-method-annulirovanie.md",
        exam: "/content/exams/module-7-new-method-annulirovanie.md"
      }
    ]
  },
  {
    id: 8,
    title: "Программа по 10 критериям",
    level: "Продвинутый",
    status: "certified",
    doc: "/content/module-8/index.md",
    cover: "/assets/images/covers/prodvinutyy-master.jpg",
    lessons: [
      {
        title: "Программа по 10 критериям — карта и логика",
        doc: "/content/module-8/desyat-kriteriev.md",
        exam: "/content/exams/module-8-desyat-kriteriev.md"
      },
      {
        title: "Банк программ лечения — 10 эталонов сборки",
        doc: "/content/module-8/bank-programm-lecheniya.md",
        exam: "/content/exams/module-8-bank-programm-lecheniya.md"
      },
      {
        title: "Специальные протоколы приёма — восемь специальных приложений",
        doc: "/content/module-11/specialnye-protokoly-priyoma.md",
        exam: "/content/exams/module-11-specialnye-protokoly-priyoma.md"
      }
    ]
  },
  {
    id: 9,
    title: "Родовые и семейные поражения",
    level: "Продвинутый",
    status: "certified",
    doc: "/content/module-9/index.md",
    cover: "/assets/images/covers/diagnostika.jpg",
    lessons: [
      {
        title: "Рукья для укрепления супружества — 10 дуа",
        doc: "/content/module-5/dua-strasti.md",
        exam: "/content/exams/module-5-dua-strasti.md"
      },
      {
        title: "Особые состояния: истихваз, рабт, родовое, колдовство смерти и дом",
        doc: "/content/module-11/osobye-sostoyaniya.md",
        exam: "/content/exams/module-11-osobye-sostoyaniya.md"
      },
      {
        title: "Наследственная болезнь — определение, признаки и механизм",
        doc: "/content/module-9/nasledstvennaya-bolezn-1.md",
        exam: "/content/exams/module-9-nasledstvennaya-bolezn-1.md"
      },
      {
        title: "Наследственная болезнь — наблюдение, способности и формы",
        doc: "/content/module-9/nasledstvennaya-bolezn-2.md",
        exam: "/content/exams/module-9-nasledstvennaya-bolezn-2.md"
      },
      {
        title: "Наследственная болезнь — лечение и программа источника",
        doc: "/content/module-9/nasledstvennaya-bolezn-3.md",
        exam: "/content/exams/module-9-nasledstvennaya-bolezn-3.md"
      },
      {
        title: "Родовые духовные заболевания — виды и механизмы",
        doc: "/content/module-9/rodovye-zabolevaniya-1.md",
        exam: "/content/exams/module-9-rodovye-zabolevaniya-1.md"
      },
      {
        title: "Родовые духовные заболевания — диагностика и лечение",
        doc: "/content/module-9/rodovye-zabolevaniya-2.md",
        exam: "/content/exams/module-9-rodovye-zabolevaniya-2.md"
      }
    ]
  },
  {
    id: 10,
    title: "Кашф и тяжелейшие случаи",
    level: "Продвинутый",
    status: "certified",
    doc: "/content/module-10/index.md",
    cover: "/assets/images/covers/ubivanie-dzhinnov.jpg",
    lessons: [
      {
        title: "Заклинания на убийство и сжигание джиннов — четыре уровня формулы",
        doc: "/content/module-7/zaklinaniya-na-ubiystvo-dzhinnov.md",
        exam: "/content/exams/module-7-zaklinaniya-na-ubiystvo-dzhinnov.md"
      },
      {
        title: "Изгнание джиннов — часть 1: основа, классификация врагов, механизм",
        doc: "/content/module-7/unichtozhenie-dzhinnov-posobie.md",
        exam: "/content/exams/module-7-unichtozhenie-dzhinnov-posobie.md"
      },
      {
        title: "Изгнание джиннов — часть 2: конкретные протоколы",
        doc: "/content/module-7/unichtozhenie-dzhinnov-posobie-2-protokoly.md",
        exam: "/content/exams/module-7-unichtozhenie-2.md"
      },
      {
        title: "Изгнание джиннов — часть 3: принципы боевой рукьи и сводная таблица",
        doc: "/content/module-7/unichtozhenie-dzhinnov-posobie-3-printsipy.md",
        exam: "/content/exams/module-7-unichtozhenie-3.md"
      },
      {
        title: "Метод избавления от джиннов — трёхступенчатый подход",
        doc: "/content/module-5/metod-izbavleniya.md",
        exam: "/content/exams/module-5-metod-izbavleniya.md"
      },
      {
        title: "Кашф и визуальная рукъя — описание источника",
        doc: "/content/module-10/kashf-raskrytie-1.md",
        exam: "/content/exams/module-10-kashf-raskrytie-1.md"
      },
      {
        title: "Кашф — галлюцинации, сны и границы",
        doc: "/content/module-10/kashf-raskrytie-2.md",
        exam: "/content/exams/module-10-kashf-raskrytie-2.md"
      },
      {
        title: "Тяжелейшие случаи — категории и протоколы источника",
        doc: "/content/module-10/tyazheleyshie-sluchai-1.md",
        exam: "/content/exams/module-10-tyazheleyshie-sluchai-1.md"
      },
      {
        title: "Тяжелейшие случаи — риски и индивидуальный разбор",
        doc: "/content/module-10/tyazheleyshie-sluchai-2.md",
        exam: "/content/exams/module-10-tyazheleyshie-sluchai-2.md"
      }
    ]
  },
  {
    id: 11,
    title: "Профессиональный приём и мастерство",
    level: "Продвинутый",
    status: "certified",
    doc: "/content/module-11/index.md",
    cover: "/assets/images/covers/istinnyy-rakiy.jpg",
    lessons: [
      {
        title: "Фундамент мастера — состояние заклинателя",
        doc: "/content/module-8/fundament-mastera.md",
        exam: "/content/exams/module-8-fundament-mastera.md"
      },
      {
        title: "Заклинание действием — продвинутые формулы",
        doc: "/content/module-8/prodvinutye-formuly.md",
        exam: "/content/exams/module-8-prodvinutye-formuly.md"
      },
      {
        title: "Комбинированные формулы и уровни мастерства",
        doc: "/content/module-8/kombo-i-urovni.md",
        exam: "/content/exams/module-8-kombo-i-urovni.md"
      },
      {
        title: "Исцеление за секунды — часть 1: доктрина, плотность, почему мгновенно",
        doc: "/content/module-8/istselenie-za-sekundy.md",
        exam: "/content/exams/module-8-istselenie-za-sekundy.md"
      },
      {
        title: "Исцеление за секунды — часть 2: враги скорости, заряжение, точность",
        doc: "/content/module-8/istselenie-za-sekundy-2-vragi-i-mgnovennost.md",
        exam: "/content/exams/module-8-istselenie-2.md"
      },
      {
        title: "Исцеление за секунды — часть 3: полный цикл и формулы за секунды",
        doc: "/content/module-8/istselenie-za-sekundy-3-polny-cikl-formuly.md",
        exam: "/content/exams/module-8-istselenie-3.md"
      },
      {
        title: "Исцеление за секунды — часть 4: готовность, тренировки, границы учения",
        doc: "/content/module-8/istselenie-za-sekundy-4-gotovnost-granicy.md",
        exam: "/content/exams/module-8-istselenie-4.md"
      },
      {
        title: "Сравнение сильного со слабым — часть 1: намерение, визуализация, концентрация, голос, энергия",
        doc: "/content/module-5/sravnenie-silnogo-so-slabym.md",
        exam: "/content/exams/module-5-sravnenie-silnogo-so-slabym.md"
      },
      {
        title: "Сравнение сильного со слабым — часть 2: воля, связь, спецификация, выводы",
        doc: "/content/module-5/sravnenie-2-volya-svyaz-specifikaciya-vyvody.md",
        exam: "/content/exams/module-5-sravnenie-2.md"
      },
      {
        title: "Корень влияния — четыре уровня, три намерения и границы метода",
        doc: "/content/module-5/koren-vliyaniya.md",
        exam: "/content/exams/module-5-koren-vliyaniya.md"
      },
      {
        title: "Чужой язык — энергетика, биополе и «Космос» глазами ракыя",
        doc: "/content/module-9/chuzhoy-yazyk.md",
        exam: "/content/exams/module-9-chuzhoy-yazyk.md"
      },
      {
        title: "Лже-ракый: запреты и ошибки, недопустимые в практике рукьи",
        doc: "/content/module-10/oshibki-i-zaprety-lzherakii.md",
        exam: "/content/exams/module-10-oshibki-i-zaprety.md"
      },
      {
        title: "Образ истинного раки — знание, такъва, ихляс, присутствие сердца, рахма, таваду'",
        doc: "/content/module-10/obraz-istinnogo-rakii.md",
        exam: "/content/exams/module-10-obraz-istinnogo-rakii.md"
      },
      {
        title: "Разница между практиком и теоретиком в рукье",
        doc: "/content/module-10/raznitsa-praktik-vs-teoretik.md",
        exam: "/content/exams/module-10-raznitsa-praktik-vs-teoretik.md"
      },
      {
        title: "Внутренний саботаж: восемь ошибок, которые обесценивают сеанс",
        doc: "/content/module-10/vnutrenniy-sabotazh.md",
        exam: "/content/exams/module-10-vnutrenniy-sabotazh.md"
      },
      {
        title: "Защита и конфиденциальность данных пациента в RUKYA Pro",
        doc: "/content/module-11/zashchita-dannykh-patsienta.md",
        exam: "/content/exams/module-11-zashchita-dannykh-patsienta.md"
      }
    ]
  },
  {
    id: 12,
    title: "Супервизия и аттестация",
    level: "Продвинутый",
    status: "certified",
    doc: "/content/module-12/index.md",
    cover: "/assets/images/covers/rukya-pro.jpg",
    lessons: [
      {
        title: "Паспорт практики — ступени допуска лекаря-ракийи",
        doc: "/content/reference/praktika-passport.md",
        exam: "/content/exams/module-11-praktika-passport.md"
      },
      {
        title: "Финальный практикум-симуляция: один случай от Part 0 до защиты",
        doc: "/content/module-11/praktikum-simulyatsiya.md",
        exam: "/content/exams/module-11-praktikum-simulyatsiya.md"
      },
      {
        title: "Защита двух случаев — итоговый экзамен Модуля 12",
        doc: "/content/module-11/zashchita-dvukh-sluchaev.md",
        exam: "/content/exams/module-11-zashchita-dvukh-sluchaev.md"
      }
    ]
  }

];

export function getModule(id) {
  return MODULES.find((m) => m.id === Number(id));
}

/** Открыт ли модуль ученику. Первый открыт всегда, модуль N — после
 * сданного теста модуля N−1.
 *
 * full — доступ, выданный автором вручную (поле fullAccess в профиле,
 * кнопка «Всё открыто» в кабинете админа, 2026-07-27). Снимает порядок
 * целиком: открыты все модули сразу. Параметр третий и необязательный,
 * чтобы старые вызовы с двумя аргументами работали как прежде. */
export function isModuleUnlocked(moduleId, progress, full = false) {
  if (full) return true;
  if (moduleId <= 1) return true;
  return progress?.[moduleId - 1]?.status === "done";
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

/** Система достижений — вычисляются из имеющегося прогресса без новых полей
 * в Firestore. Каждое достижение: { id, icon, title, description, earned,
 * progress (текущее), goal (целевое) }. progress/goal дают числовую шкалу
 * для прогресс-бара у незаработанных достижений. */
export function computeAchievements(progress, activityDates) {
  const modules = MODULES;
  const doneModules = modules.filter((m) => progress?.[m.id]?.status === "done").length;

  // Количество сданных книжных экзаменов
  const books = progress?.books || {};
  const doneBooks = Object.values(books).filter((b) => b?.status === "done").length;

  // Все баллы тестов (модулей + книг)
  const moduleScores = Object.entries(progress || {})
    .filter(([k, v]) => k !== "activityDates" && k !== "books" && typeof v === "object" && v?.quizScore != null)
    .map(([, v]) => v.quizScore);
  const bookScores = Object.values(books)
    .filter((b) => b?.quizScore != null)
    .map((b) => b.quizScore);
  const allScores = [...moduleScores, ...bookScores];
  const allAbove90 = allScores.length > 0 && allScores.every((s) => s >= 0.9);

  // Стрик
  const dates = activityDates || [];
  const streakNow = computeStreakFromDates(dates);
  const maxStreak = computeMaxStreak(dates);

  return [
    {
      id: "first-book", icon: "📖", title: "Первая книга",
      description: "Сдать экзамен по первой книге",
      earned: doneBooks >= 1, progress: Math.min(doneBooks, 1), goal: 1,
    },
    {
      id: "first-module", icon: "✅", title: "Первый модуль",
      description: "Завершить первый модуль целиком",
      earned: doneModules >= 1, progress: Math.min(doneModules, 1), goal: 1,
    },
    {
      id: "bookworm", icon: "📚", title: "Книгочей",
      description: "Сдать 10 книжных экзаменов",
      earned: doneBooks >= 10, progress: Math.min(doneBooks, 10), goal: 10,
    },
    {
      id: "streak-7", icon: "🔥", title: "Усердный",
      description: "7 дней активности подряд",
      earned: maxStreak >= 7, progress: Math.min(streakNow, 7), goal: 7,
    },
    {
      id: "halfway", icon: "🏔️", title: "Половина пути",
      description: "Пройти 6 модулей из 12",
      earned: doneModules >= 6, progress: Math.min(doneModules, 6), goal: 6,
    },
    {
      id: "honor", icon: "⭐", title: "Отличник",
      description: "Все тесты сдать на 90%+",
      earned: allAbove90,
      progress: allScores.filter((s) => s >= 0.9).length,
      goal: Math.max(allScores.length, 1),
    },
    {
      id: "streak-30", icon: "💎", title: "Марафонец",
      description: "30 дней активности подряд",
      earned: maxStreak >= 30, progress: Math.min(streakNow, 30), goal: 30,
    },
    {
      id: "graduate", icon: "🎓", title: "Выпускник",
      description: "Завершить все 12 модулей курса",
      earned: doneModules === 12, progress: doneModules, goal: 12,
    },
  ];
}

/** Максимальный стрик за всю историю (для достижений "7 дней подряд" и т.д.) */
function computeMaxStreak(activityDates) {
  if (!activityDates || !activityDates.length) return 0;
  const sorted = [...activityDates].sort();
  let max = 1, cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const next = new Date(sorted[i]);
    const diffDays = Math.round((next - prev) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) { cur++; max = Math.max(max, cur); }
    else if (diffDays > 1) { cur = 1; }
  }
  return max;
}

/** Текущий стрик (сегодня/вчера назад) — повтор логики computeStreak из
 * firestore.js, но без серверного timestamp. */
function computeStreakFromDates(activityDates) {
  if (!activityDates || !activityDates.length) return 0;
  const set = new Set(activityDates);
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const cursor = new Date();
  if (!set.has(fmt(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (set.has(fmt(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}
