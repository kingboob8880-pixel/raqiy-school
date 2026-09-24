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
    cover: "/assets/images/covers/volevoy-akt.jpg",
    lessons: [
      // ⚙️ ВХОДНОЙ ЦЕНЗ (практическая проверка, а не книга шейха) — стоит до
      // содержательных книг намеренно (Волна 7): весь курс идёт через чтение
      // ртом, поэтому прежде учить якыну и намерению — проверяем, что рот не
      // помешает сердцу. Это самопроверка, а не замок: теория открыта при любом
      // результате, закрыта только рукья над другими при красной зоне.
      { title: "Входной ценз — проверка чтения (прежде чем начать курс)", doc: "/content/module-1/vhodnyy-cenz-chteniya.md", exam: "/content/exams/module-1-vhodnyy-cenz-chteniya.md" },
      // ⚠️ ЕДИНОБОЖИЕ — ПЕРВОЕ, ЧТО ЧИТАЕТ УЧЕНИК (решение автора 2026-07-28:
      // «заклинание следует начать с основ, а это вопрос, кому ты
      // поклоняешься: от Того ты и черпаешь силы»).
      //
      // Эти четыре книги стояли в Модуле 10 — продвинутый уровень, почти
      // конец курса. То есть человек год лечил людей и только потом
      // разбирался, где проходит граница между обращением к Аллаху и
      // ширком. Порядок был перевёрнут: якын — это убеждённость В АЛЛАХЕ,
      // и она не может стоять раньше знания о том, Кто Он и в чём Его
      // единственность.
      //
      // Модули не перенумерованы намеренно: у тех, кто уже учится, прогресс
      // записан по номерам, и сдвиг превратил бы пройденное в чужое.
      // ⚠️ ПЕРВАЯ КНИГА КУРСА (решение автора 2026-07-28): «пусть будет
      // основа про поклонение и про то, какое место это занимает в
      // заклинании». Написана специально: разбор акыды на сайте был, а
      // ответа на вопрос «почему рукья вообще работает и от Кого» — не было
      // нигде. Она же связывает единобожие с якыном и намерением, которые
      // идут следом. (Практический входной ценз чтения стоит выше — это проверка
      // навыка, а не первая содержательная книга; первой книгой остаётся «Поклонение».)
      { title: "Поклонение — кому ты поклоняешься и какое место это занимает в заклинании", doc: "/content/module-1/poklonenie.md", exam: "/content/exams/module-1-poklonenie.md" },
      { title: "Что есть истина — разбор с доказательствами из Корана и Сунны", doc: "/content/module-9/sut-istiny.md", exam: "/content/exams/module-9-sut-istiny.md" },
      { title: "Границы веры — единственность Истины и вопрос заступничества", doc: "/content/module-9/granitsy-very-i-zastupnichestvo.md", exam: "/content/exams/module-9-granitsy-very-i-zastupnichestvo.md" },
      { title: "Вопросы заступничества — разбор у могилы Пророка ﷺ", doc: "/content/module-9/voprosy-zastup.md", exam: "/content/exams/module-9-voprosy-zastup.md" },
      { title: "Метод уединения с таухидом — визуализация через имена Аллаха", doc: "/content/module-1/metod-taukhid.md", exam: "/content/exams/module-1-metod-taukhid.md" },
      // Дальше — то, что стоит НА этом основании: убеждённость, мольба, намерение.
      { title: "Учебник якына — убеждённости", doc: "/content/module-1/yakyn.md", exam: "/content/exams/module-1-yakyn.md" },
      { title: "Мольба заклинателя", doc: "/content/module-1/molba-zaklinatelya.md", exam: "/content/exams/module-1-molba-zaklinatelya.md" },
      { title: "Теоретик и практик — как правильно формулировать мольбу", doc: "/content/module-1/teoretik-i-praktik.md", exam: "/content/exams/module-1-teoretik-i-praktik.md" },
      { title: "Фундаментальное состояние целителя — собранность, дыхание, фокус", doc: "/content/module-1/fundamentalnoe.md", exam: "/content/exams/module-1-fundamentalnoe.md" },
      { title: "Басира — духовное зрение сердцем", doc: "/content/module-1/basira.md", exam: "/content/exams/module-1-basira.md" },
      { title: "Эхсан и черпание силы от Аллаха", doc: "/content/module-1/ehsan-i-sila.md", exam: "/content/exams/module-1-ehsan-i-sila.md" },
      // «Учебник по намерениям» стоит ПЕРЕД «Волевым актом» намеренно
      // (книга автора, добавлена 2026-07-28). Он даёт карту: какие бывают
      // намерения, на каких ярусах лежат и какое на что ставится. «Волевой
      // акт» после него отвечает на следующий вопрос — как это намерение
      // удержать и натренировать. В обратном порядке ученик учился удерживать
      // раньше, чем узнавал, что именно.
      { title: "Учебник по намерениям — виды, ярусы и выработка убеждённости", doc: "/content/module-1/namereniya.md", exam: "/content/exams/module-1-namereniya.md" },
      { title: "Волевой акт — часть 1: основа, понятие, анатомия намерения", doc: "/content/module-1/volevoy-akt.md", exam: "/content/exams/module-1-volevoy-akt.md" },
      { title: "Волевой акт — часть 2: метод заряжения и полная последовательность", doc: "/content/module-1/volevoy-akt-2-zaryazhenie-posledovatelnost.md", exam: "/content/exams/module-1-volevoy-akt-2.md" },
      { title: "Волевой акт — часть 3: тренировки, разрушители, уровни прогресса", doc: "/content/module-1/volevoy-akt-3-trenirovki-razrushiteli-urovni.md", exam: "/content/exams/module-1-volevoy-akt-3.md" },
      { title: "Волевой акт — часть 4: советы, мольбы, контрольный список", doc: "/content/module-1/volevoy-akt-4-sovety-molby-spisok.md", exam: "/content/exams/module-1-volevoy-akt-4.md" },
      // Справочник шаблонов намерения (запрос автора 2026-07-27: «в модулях
      // и упражнениях говорится о намерении, но о каком — не написано»).
      // Стоит сразу после «Волевого акта»: там дана анатомия намерения, а
      // здесь — готовые формулировки по случаям, собранные по тому же
      // каркасу. Раньше ученик закрывал книгу и придумывал формулировку сам.
      { title: "Шаблоны намерения — короткие формулы для каждого случая", doc: "/content/reference/niyat.md", exam: "/content/exams/module-1-niyat.md" },
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
      // Книга автора «Исцеляю Кораном» (2026-07-28) разделена надвое по
      // смыслу, а не по объёму: довод и границы — здесь, рядом с
      // «Дозволенностью заклинания», потому что это ответ на тот же вопрос
      // «что делает рукью дозволенной». Применение по случаям — Модуль 5,
      // где стоят остальные книги с формулами по видам поражения.
      { title: "Исцеляю Кораном — довод, границы и правильное понимание", doc: "/content/module-2/istselyayu-koranom.md", exam: "/content/exams/module-2-istselyayu-koranom.md" },
      { title: "Что такое заклинание — пять качеств истинного заклинателя", doc: "/content/module-2/chto-takoe-zaklinanie.md", exam: "/content/exams/module-2-chto-takoe-zaklinanie.md" },
      { title: "Я заклинаю", doc: "/content/module-2/ya-zaklinayu.md", exam: "/content/exams/module-2-ya-zaklinayu.md" },
      { title: "Общее понятие заклинания — метод «Влияние Волей»", doc: "/content/module-2/obshchee-ponyatie-zaklinanie.md", exam: "/content/exams/module-2-obshchee-ponyatie-zaklinanie.md" },
      // Книга №2 инвентаря — восстановлена по решению автора курса (2026-07-21).
      // Три пути формулы «Арки» (органы, предметы, недуги) + каталоги недугов.
      { title: "Виды заклинаний — часть 1: три пути формулы «Арки» и обобщённое заклинание", doc: "/content/module-2/vidy-zaklinaniy.md", exam: "/content/exams/module-2-vidy-zaklinaniy.md" },
      { title: "Виды заклинаний — часть 2: начальная формула, произнесение, порядок и сводка", doc: "/content/module-2/vidy-zaklinaniy-2-proiznoshenie-poryadok.md", exam: "/content/exams/module-2-vidy-2.md" },
      { title: "Продвинутое заклинание — метод «Аллязи» (деривация атрибутов)", doc: "/content/module-2/prodvinutoe-zaklinanie.md", exam: "/content/exams/module-2-prodvinutoe-zaklinanie.md" },
      { title: "Инструменты заклинателя: дозволенные практики", doc: "/content/module-2/instrumenty-zaklinatelya.md", exam: "/content/exams/module-2-instrumenty-zaklinatelya.md" },
      { title: "Речь с болезнью — полная методология сеанса рукьи", doc: "/content/module-2/rech-s-boleznyu.md", exam: "/content/exams/module-2-rech-s-boleznyu.md" },
      { title: "Убирание грязи — диагностика и заклинание недугов души", doc: "/content/module-2/ubiranie-gryazi.md", exam: "/content/exams/module-2-ubiranie-gryazi.md" },
      { title: "Классификация недугов (Справочник)", doc: "/content/reference/classification.md", exam: "/content/exams/reference-classification.md" },
      { title: "Каталог атрибутов «Аллязи» (Справочник)", doc: "/content/reference/allyazi-atributy.md", exam: "/content/exams/reference-allyazi-atributy.md" },
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
      { title: "30 эмоциональных загрязнений — карта тела, механизм и дуа изгнания", doc: "/content/module-3/vliyanie-emots.md", exam: "/content/exams/module-3-vliyanie-emots.md" },
      { title: "Влияние загрязнений на внешность и фигуру", doc: "/content/module-3/krasota.md", exam: "/content/exams/module-3-krasota.md" },
      { title: "Защита органов от страстей — дуа по каждому органу", doc: "/content/module-3/tablitsa-strasti.md", exam: "/content/exams/module-3-tablitsa-strasti.md" },
    ],
  },
  {
    id: 4,
    title: "Диагностика — протокол безопасности",
    level: "Средний",
    status: "author",
    doc: "/content/module-4/index.md",
    cover: "/assets/images/covers/diagnostika.jpg",
    lessons: [
      { title: "Диагностика недугов души — три группы корневых проблем", doc: "/content/module-4/diagnostika.md", exam: "/content/exams/module-4-diagnostika.md" },
      { title: "Эмоциональные загрязнения — связь с диагностикой", doc: "/content/module-4/zagryazneniya.md", exam: "/content/exams/module-4-zagryazneniya.md" },
      { title: "Раны души — карта зажимов, метод устранения и 30 дуа выведения", doc: "/content/module-4/zazhimy.md", exam: "/content/exams/module-4-zazhimy.md" },
      { title: "Банк диагностических кейсов — 15 разборов с эталоном", doc: "/content/module-4/bank-casey.md", exam: "/content/exams/module-4-bank-casey.md" },
      { title: "Тренажёр приёма: опрос и граница «активизация против угрозы»", doc: "/content/module-4/aktivizatsiya-vs-ugroza.md", exam: "/content/exams/module-4-aktivizatsiya-vs-ugroza.md" },
    ],
  },
  {
    id: 5,
    title: "Направленное применение",
    level: "Средний",
    status: "author",
    doc: "/content/module-5/index.md",
    cover: "/assets/images/covers/napravlennoe-primenenie.jpg",
    lessons: [
      { title: "Очищение разума — авторские формулы по функциям тела и психики", doc: "/content/module-5/ochishchenie-razuma.md", exam: "/content/exams/module-5-ochishchenie-razuma.md" },
      // Книга №16 инвентаря — раньше исключена целиком (project.md §9а, диагностика
      // надавливанием). По прямому решению автора курса (2026-07-21) восстановлена
      // почти полностью — убрана только сама техника нажатия/надавливания (см.
      // status: "author" в front matter файла и предупреждение в начале урока).
      { title: "Хитаб аль-Исаба — часть 1: метод, органы, ключи воздействия", doc: "/content/module-5/hitab-al-isaba.md", exam: "/content/exams/module-5-hitab-al-isaba.md" },
      { title: "Хитаб аль-Исаба — часть 2: протокол полного сеанса, сводные таблицы, предостережения", doc: "/content/module-5/hitab-al-isaba-2-protokol-seansa.md", exam: "/content/exams/module-5-hitab-2.md" },
      // Книга №9 (Продвинутый Мастер) перенесена в Модуль 9 целиком.
      // Книга №12 — трёхуровневый метод по органам и видам колдовства.
      { title: "Учебник по чтению заклинаний на органы по видам колдовства", doc: "/content/module-5/zaklinaniya-na-organy.md", exam: "/content/exams/module-5-zaklinaniya-na-organy.md" },
      // Каталог глав 3–12 (двенадцать видов поражения) вынесен в Справочник (Волна 3).
      { title: "Каталог по видам колдовства — часть 1 (Справочник)", doc: "/content/reference/zaklinaniya-na-organy-katalog-1.md", exam: "/content/exams/reference-organy-katalog-1.md" },
      { title: "Каталог по видам колдовства — часть 2 (Справочник)", doc: "/content/reference/zaklinaniya-na-organy-katalog-2.md", exam: "/content/exams/reference-organy-katalog-2.md" },
      { title: "Каталог по видам колдовства — часть 3 (Справочник)", doc: "/content/reference/zaklinaniya-na-organy-katalog-3.md", exam: "/content/exams/reference-organy-katalog-3.md" },
      // Книга №13 — метод «Аллязи»: составное заклинание через атрибуты Аллаха из Корана.
      { title: "Пособие по продвинутому заклинанию — часть 1: атрибуты из аятов", doc: "/content/module-5/prodvinutoe-zaklinanie-posobie.md", exam: "/content/exams/module-5-prodvinutoe-zaklinanie-posobie.md" },
      { title: "Пособие по продвинутому заклинанию — часть 2: заклинание на действие, комбинированные формулы, сводная таблица", doc: "/content/module-5/prodvinutoe-zaklinanie-posobie-2-deystvie-kombo.md", exam: "/content/exams/module-5-posobie-2.md" },
      // Книга №10 — 8 компонентов эффективного заклинания (намерение, визуализация, концентрация, голос, энергия, воля, связь, спецификация).
      { title: "Сравнение сильного со слабым — часть 1: намерение, визуализация, концентрация, голос, энергия", doc: "/content/module-5/sravnenie-silnogo-so-slabym.md", exam: "/content/exams/module-5-sravnenie-silnogo-so-slabym.md" },
      { title: "Сравнение сильного со слабым — часть 2: воля, связь, спецификация, выводы", doc: "/content/module-5/sravnenie-2-volya-svyaz-specifikaciya-vyvody.md", exam: "/content/exams/module-5-sravnenie-2.md" },
      { title: "Дуа против колдовства истощения — 13 формул", doc: "/content/module-5/protiv-istoshcheniya.md", exam: "/content/exams/module-5-protiv-istoshcheniya.md" },
      { title: "Лечение от сглаза водой — программа очищения", doc: "/content/module-5/lecheniya-sglaz.md", exam: "/content/exams/module-5-lecheniya-sglaz.md" },
      { title: "Рукья против сихра, сглаза и зависти — подробное руководство", doc: "/content/module-5/sikhr-sglaz-posobie.md", exam: "/content/exams/module-5-sikhr-sglaz-posobie.md" },
      { title: "Краткая рукья от колдовства — сеанс 50–70 минут", doc: "/content/module-5/rukiya-sikhr.md", exam: "/content/exams/module-5-rukiya-sikhr.md" },
      { title: "Рукья для укрепления супружества — 10 дуа", doc: "/content/module-5/dua-strasti.md", exam: "/content/exams/module-5-dua-strasti.md" },
      { title: "Руководство по убиранию чёрных линий", doc: "/content/module-5/ubiranie-liniy.md", exam: "/content/exams/module-5-ubiranie-liniy.md" },
      { title: "Метод избавления от джиннов — трёхступенчатый подход", doc: "/content/module-5/metod-izbavleniya.md", exam: "/content/exams/module-5-metod-izbavleniya.md" },
      // Вторая половина «Исцеляю Кораном» — формулы по видам поражения.
      // Первая половина (довод и границы) стоит в Модуле 2.
      { title: "Исцеляю Кораном на практике — формулы по видам поражения", doc: "/content/module-5/istselyayu-koranom-praktika.md", exam: "/content/exams/module-5-istselyayu-koranom-praktika.md" },
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
    title: "Профессионал",
    level: "Продвинутый",
    status: "author",
    doc: "/content/module-12/index.md",
    cover: "/assets/images/covers/Gemini_Generated_Image_rvbggorvbggorvbg.jpg",
    // Модуль собран из трилогии автора «Прямой путь — Заклинание верой»
    // (решение автора, 2026-09-17): три книги лежали по разным модулям —
    // первая в основании курса, вторая в основах заклинания, третья в
    // мастерстве. Автор свёл их в один модуль, чтобы путь ученика стал
    // короче и понятнее.
    //
    // Поставлен ПЕРВЫМ в продвинутом блоке (№7) по решению автора от
    // 2026-09-23: трилогия задаёт намерение и настрой, с которыми дальше
    // идут протоколы изгнания, мастерство и различение. Прогресс учеников
    // перенесён в эту же перестановку скриптом миграции (см. журнал сеанса).
    lessons: [
      { title: "Прямой путь — вера и намерение", doc: "/content/module-12/pryamoy-put.md", exam: "/content/exams/module-12-pryamoy-put.md" },
      { title: "Пути влияния — понятие и мольбы", doc: "/content/module-12/puti-vliyaniya.md", exam: "/content/exams/module-12-puti-vliyaniya.md" },
      { title: "Прямой путь — подготовка и целостная практика", doc: "/content/module-12/podgotovka-pryamoy-put.md", exam: "/content/exams/module-12-podgotovka-pryamoy-put.md" },
      { title: "Сводка «Прямого пути» (Ресурс)", doc: "/content/reference/pryamoy-put-svodka.md", exam: "/content/exams/module-12-pryamoy-put-svodka.md" },
    ],
  },
  {
    id: 8,
    title: "Изгнание духовных сущностей",
    level: "Продвинутый",
    status: "author",
    doc: "/content/module-7/index.md",
    cover: "/assets/images/covers/ubivanie-dzhinnov.jpg",
    lessons: [
      // Книга №4 — четырёхуровневая система формул убийства/сжигания джиннов.
      { title: "Заклинания на убийство и сжигание джиннов — четыре уровня формулы", doc: "/content/module-7/zaklinaniya-na-ubiystvo-dzhinnov.md", exam: "/content/exams/module-7-zaklinaniya-na-ubiystvo-dzhinnov.md" },
      // Книга №18 — полное руководство: 13 типов джиннов + протоколы изгнания каждого.
      // Название урока приведено к «Изгнание» по решению автора (конфликт C4 / табл. 2.4):
      // тон — строгость к недугу, а не жестокость; формулы внутри книги не изменены.
      { title: "Изгнание джиннов — часть 1: основа, классификация врагов, механизм", doc: "/content/module-7/unichtozhenie-dzhinnov-posobie.md", exam: "/content/exams/module-7-unichtozhenie-dzhinnov-posobie.md" },
      { title: "Изгнание джиннов — часть 2: конкретные протоколы", doc: "/content/module-7/unichtozhenie-dzhinnov-posobie-2-protokoly.md", exam: "/content/exams/module-7-unichtozhenie-2.md" },
      { title: "Изгнание джиннов — часть 3: принципы боевой рукьи и сводная таблица", doc: "/content/module-7/unichtozhenie-dzhinnov-posobie-3-printsipy.md", exam: "/content/exams/module-7-unichtozhenie-3.md" },
    ],
  },
  {
    id: 9,
    title: "Продвинутый Мастер",
    level: "Продвинутый",
    status: "author",
    doc: "/content/module-8/index.md",
    cover: "/assets/images/covers/prodvinutyy-master.jpg",
    lessons: [
      { title: "Фундамент мастера — состояние заклинателя", doc: "/content/module-8/fundament-mastera.md", exam: "/content/exams/module-8-fundament-mastera.md" },
      { title: "Заклинание действием — продвинутые формулы", doc: "/content/module-8/prodvinutye-formuly.md", exam: "/content/exams/module-8-prodvinutye-formuly.md" },
      { title: "Комбинированные формулы и уровни мастерства", doc: "/content/module-8/kombo-i-urovni.md", exam: "/content/exams/module-8-kombo-i-urovni.md" },
      { title: "Программа по 10 критериям — карта и логика", doc: "/content/module-8/desyat-kriteriev.md", exam: "/content/exams/module-8-desyat-kriteriev.md" },
      // Авторский учебник «Исцеление за секунды» (2026-07-27). Поставлен в
      // Модуль 9, а не в Модуль 1, где лежит якын: книга не учит
      // убеждённости с нуля, а сводит воедино уже пройденное — восемь
      // компонентов из Модуля 5, волевой акт и якын из Модуля 1, защиту из
      // Модуля 6 — и требует, чтобы сорокадневная ковка была уже позади.
      // Тема модуля («что отличает сильного от начинающего — не формулы, а
      // состояние») ровно об этом.
      //
      // Стоит ПОСЛЕДНИМ уроком модуля: он опирается на три предыдущих.
      { title: "Исцеление за секунды — часть 1: доктрина, плотность, почему мгновенно", doc: "/content/module-8/istselenie-za-sekundy.md", exam: "/content/exams/module-8-istselenie-za-sekundy.md" },
      { title: "Исцеление за секунды — часть 2: враги скорости, заряжение, точность", doc: "/content/module-8/istselenie-za-sekundy-2-vragi-i-mgnovennost.md", exam: "/content/exams/module-8-istselenie-2.md" },
      { title: "Исцеление за секунды — часть 3: полный цикл и формулы за секунды", doc: "/content/module-8/istselenie-za-sekundy-3-polny-cikl-formuly.md", exam: "/content/exams/module-8-istselenie-3.md" },
      { title: "Исцеление за секунды — часть 4: готовность, тренировки, границы учения", doc: "/content/module-8/istselenie-za-sekundy-4-gotovnost-granicy.md", exam: "/content/exams/module-8-istselenie-4.md" },
    ],
  },
  {
    id: 10,
    title: "Истинное vs ложное заклинание",
    level: "Продвинутый",
    status: "certified",
    doc: "/content/module-9/index.md",
    cover: "/assets/images/covers/istinnoe-vs-lozhnoe.jpg",
    lessons: [
      // Четыре книги о единобожии переехали отсюда в Модуль 1 — см. пояснение
      // там же. Здесь остаётся прикладная часть: как отличить рукью от
      // практик, которые выдают себя за неё.
      { title: "Чужой язык — энергетика, биополе и «Космос» глазами ракыя", doc: "/content/module-9/chuzhoy-yazyk.md", exam: "/content/exams/module-9-chuzhoy-yazyk.md" },
    ],
  },
  {
    id: 11,
    title: "Истинный ракый vs лжеракый",
    level: "Продвинутый",
    status: "certified",
    doc: "/content/module-10/index.md",
    cover: "/assets/images/covers/istinnyy-rakiy.jpg",
    lessons: [
      { title: "Лже-ракый: запреты и ошибки, недопустимые в практике рукьи", doc: "/content/module-10/oshibki-i-zaprety-lzherakii.md", exam: "/content/exams/module-10-oshibki-i-zaprety.md" },
      { title: "Образ истинного раки — знание, такъва, ихляс, присутствие сердца, рахма, таваду'", doc: "/content/module-10/obraz-istinnogo-rakii.md", exam: "/content/exams/module-10-obraz-istinnogo-rakii.md" },
      { title: "Разница между практиком и теоретиком в рукье", doc: "/content/module-10/raznitsa-praktik-vs-teoretik.md", exam: "/content/exams/module-10-raznitsa-praktik-vs-teoretik.md" },
    ],
  },
  {
    id: 12,
    title: "Работа в системе RUKYA Pro",
    level: "Продвинутый",
    status: "author",
    doc: "/content/module-11/index.md",
    cover: "/assets/images/covers/rukya-pro.jpg",
    // Волна 8: курс выпускал знающего, но не считавшего часы. Паспорт
    // практики — трекер ступеней допуска (себя → близкие → добровольцы →
    // супервизированный приём), защита двух случаев — финальный экзамен,
    // привязанный к действующей форме супервизии (3 принятых случая).
    lessons: [
      { title: "Паспорт практики — ступени допуска лекаря-ракийи", doc: "/content/reference/praktika-passport.md", exam: "/content/exams/module-11-praktika-passport.md" },
      { title: "Защита и конфиденциальность данных пациента в RUKYA Pro", doc: "/content/module-11/zashchita-dannykh-patsienta.md", exam: "/content/exams/module-11-zashchita-dannykh-patsienta.md" },
      { title: "Специальные протоколы приёма — восемь специальных приложений", doc: "/content/module-11/specialnye-protokoly-priyoma.md", exam: "/content/exams/module-11-specialnye-protokoly-priyoma.md" },
      { title: "Финальный практикум-симуляция: один случай от Part 0 до защиты", doc: "/content/module-11/praktikum-simulyatsiya.md", exam: "/content/exams/module-11-praktikum-simulyatsiya.md" },
      { title: "Защита двух случаев — итоговый экзамен Модуля 12", doc: "/content/module-11/zashchita-dvukh-sluchaev.md", exam: "/content/exams/module-11-zashchita-dvukh-sluchaev.md" },
    ],
  },
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
