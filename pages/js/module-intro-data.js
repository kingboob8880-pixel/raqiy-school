// Тексты-настрои для модалки «что внутри модуля» (запрос автора, 2026-07-26).
//
// Зачем отдельный файл, а не ключи в i18n.js: на одиннадцать модулей нужно
// по пять-шесть строк, то есть под семьдесят плоских ключей вида
// intro.5.learn3 — они утопили бы i18n.js (он и так под восемьсот строк) и
// читались бы там как каша. Здесь всё про один модуль лежит вместе, и
// править текст можно, видя его целиком.
//
// Подписи интерфейса («Чему учит», «Что ты сможешь») остались в i18n.js —
// они общие для всех модулей и меняются вместе с остальным интерфейсом.
//
// Правила текста, которые здесь соблюдаются:
//
//   • Никаких обещаний результата. «Ты сможешь» — про умение, а не про
//     гарантию исцеления: Модуль 10, §2 прямо запрещает заявления вида
//     «я точно вылечу это». Настрой не должен противоречить собственной
//     этике курса.
//   • Никакого «ты станешь сильным лекарем». Сила не в ученике — он
//     причина, а не источник (Модуль 10, §3). Поэтому текст говорит о том,
//     чему модуль учит, а не о том, кем ученик сделается.
//   • Каждый пункт «чему учит» опирается на реальный урок модуля из
//     modules-data.js, а не сочинён для красоты. Ученик, открыв модуль,
//     должен найти там ровно то, что ему пообещали.
export const MODULE_INTRO = {
  1: {
    hook: {
      ru: "Аллах таков, каким полагает Его раб. Пока сердце сомневается, слова остаются сухим руслом — и никакая формула этого не заменит.",
      en: "Allah is as His servant thinks of Him. While the heart doubts, words stay a dry riverbed — and no formula replaces that.",
      uz: "Alloh bandasi Uni qanday o'ylasa, shundaydir. Qalb shubhalanar ekan, so'zlar quruq o'zan bo'lib qoladi — buni hech qanday formula almashtirmaydi.",
    },
    learn: {
      ru: [
        "Сорокадневную программу ковки якына — четыре этапа по десять дней, шестнадцать упражнений",
        "Как формулируется мольба заклинателя и чем просьба практика отличается от просьбы теоретика",
        "Фундаментальное состояние лекаря: собранность, дыхание, фокус — и басиру, зрение сердцем",
        "Волевой акт: удержание намерения в сердце, не давая мысли рассеяться",
      ],
      en: [
        "The forty-day programme of forging yaqin — four stages of ten days, sixteen exercises",
        "How the healer's supplication is formed, and how a practitioner's asking differs from a theorist's",
        "The healer's fundamental state: composure, breathing, focus — and basira, seeing with the heart",
        "The act of will: holding the intention in the heart without letting thought scatter",
      ],
      uz: [
        "Yaqinni quyishning qirq kunlik dasturi — o'n kunlik to'rt bosqich, o'n olti mashq",
        "Roqiy duosi qanday tuziladi va amaliyotchining so'rovi nazariyotchinikidan nimasi bilan farq qiladi",
        "Shifokorning asosiy holati: jamlanish, nafas, diqqat — va basira, qalb bilan ko'rish",
        "Iroda amali: fikrni tarqatmay, niyatni qalbda ushlab turish",
      ],
    },
    after: {
      ru: "Твоё «бисмиллях» перестанет быть звуком. Ты будешь входить в чтение из состояния, а не по привычке.",
      en: "Your \"bismillah\" will stop being a sound. You will enter recitation from a state, not out of habit.",
      uz: "«Bismilloh»ing shunchaki tovush bo'lmay qoladi. O'qishga odat bo'yicha emas, holat ichidan kirasan.",
    },
  },

  2: {
    hook: {
      ru: "Убеждённость есть — теперь ей нужен точный язык. Иначе она разливается вширь и не доходит никуда.",
      en: "The certainty is there — now it needs precise language. Otherwise it spreads wide and reaches nowhere.",
      uz: "Ishonch bor — endi unga aniq til kerak. Aks holda u yoyilib ketadi va hech qayerga yetmaydi.",
    },
    learn: {
      ru: [
        "Где проходит граница дозволенного в заклинании — с доводами, а не на слово",
        "Пять качеств истинного заклинателя: таква, якын, ильм, сабр, ихляс",
        "Три пути формулы «Арки» — на органы, на предметы, на недуги",
        "Метод «Аллязи»: составное заклинание через атрибуты Аллаха из Корана",
        "Полную методологию сеанса — речь с болезнью от первого слова до последнего",
      ],
      en: [
        "Where the boundary of the permitted runs in incantation — with evidence, not on trust",
        "The five qualities of a true healer: taqwa, yaqin, ilm, sabr, ikhlas",
        "The three paths of the \"Arqi\" formula — to organs, to objects, to ailments",
        "The \"Alladhi\" method: a composed incantation through Allah's attributes from the Qur'an",
        "The full methodology of a session — speech with the illness from the first word to the last",
      ],
      uz: [
        "Roqiyada ruxsat etilganning chegarasi qayerdan o'tadi — dalil bilan, quruq so'z bilan emas",
        "Haqiqiy roqiyning besh sifati: taqvo, yaqin, ilm, sabr, ixlos",
        "«Arqi» formulasining uch yo'li — a'zolarga, buyumlarga, dardlarga",
        "«Allazi» usuli: Qur'ondagi Alloh sifatlari orqali tuzilgan roqiya",
        "Seansning to'liq uslubiyoti — kasallik bilan suhbat birinchi so'zdan oxirgisigacha",
      ],
    },
    after: {
      ru: "Ты перестанешь читать «вообще». У каждого твоего слова появится адресат.",
      en: "You will stop reciting \"in general\". Every word of yours will have an addressee.",
      uz: "«Umuman» o'qishni bas qilasan. Har bir so'zingning manzili paydo bo'ladi.",
    },
  },

  3: {
    hook: {
      ru: "Намерение получает адрес. Пока ты не знаешь, как орган зовётся по-арабски, обращение остаётся общим.",
      en: "The intention gets an address. Until you know what the organ is called in Arabic, the address stays general.",
      uz: "Niyat manzil oladi. A'zoning arabcha nomini bilmasang, murojaat umumiy bo'lib qolaveradi.",
    },
    learn: {
      ru: [
        "Словарь органов тела по-арабски — как называется то, на что ты читаешь",
        "Тридцать эмоциональных загрязнений: карта тела, механизм каждого, дуа изгнания",
        "Как загрязнения отражаются на внешности и фигуре",
        "Дуа защиты по каждому органу от страстей",
      ],
      en: [
        "The Arabic vocabulary of the body's organs — what to call what you recite upon",
        "Thirty emotional impurities: the body map, the mechanism of each, the supplication of expulsion",
        "How impurities show in appearance and figure",
        "Supplications guarding each organ against the passions",
      ],
      uz: [
        "Tana a'zolarining arabcha lug'ati — o'qiyotgan narsang qanday ataladi",
        "O'ttiz hissiy ifloslik: tana xaritasi, har birining mexanizmi, chiqarish duosi",
        "Iflosliklar tashqi ko'rinish va gavdada qanday aks etadi",
        "Har bir a'zoni nafsdan asrovchi duolar",
      ],
    },
    after: {
      ru: "Ты начнёшь видеть, куда именно направлять убеждённость, — вместо того чтобы бить по площадям.",
      en: "You will begin to see exactly where to direct your certainty — instead of striking at random.",
      uz: "Ishonchni aynan qayerga yo'naltirishni ko'ra boshlaysan — tavakkaliga urish o'rniga.",
    },
  },

  4: {
    hook: {
      ru: "Убеждённость без осторожности калечит. Этот модуль стоит четвёртым не случайно: до него ты учился действовать, здесь научишься останавливаться.",
      en: "Certainty without caution maims. This module is fourth for a reason: before it you learned to act, here you learn to stop.",
      uz: "Ehtiyotsiz ishonch nogiron qiladi. Bu modul bejiz to'rtinchi emas: undan oldin harakat qilishni o'rganding, bu yerda to'xtashni o'rganasan.",
    },
    learn: {
      ru: [
        "Три группы корневых проблем и опросник из одиннадцати разделов",
        "Три красных флага — эпилепсия, психоз, суицидальные мысли — и как направить к врачу, не бросив человека",
        "Карту ран души: зажимы, метод устранения и тридцать дуа выведения",
        "Как связаны диагностика и эмоциональные загрязнения из третьего модуля",
      ],
      en: [
        "The three groups of root problems and the eleven-section questionnaire",
        "The three red flags — epilepsy, psychosis, suicidal thoughts — and how to refer to a doctor without abandoning the person",
        "The map of the soul's wounds: the blocks, the method of removal, and thirty supplications of release",
        "How diagnosis connects to the emotional impurities of Module 3",
      ],
      uz: [
        "Ildiz muammolarning uch guruhi va o'n bir bo'limli so'rovnoma",
        "Uchta qizil bayroq — epilepsiya, psixoz, o'z joniga qasd qilish fikrlari — va odamni tashlab qo'ymay shifokorga yo'naltirish",
        "Qalb yaralari xaritasi: qisilishlar, bartaraf etish usuli va o'ttiz chiqarish duosi",
        "Tashxis 3-moduldagi hissiy iflosliklar bilan qanday bog'liq",
      ],
    },
    after: {
      ru: "Ты будешь знать, кого вести дальше, а кого — сначала к врачу. Это и отличает лекаря от того, кто навредит из лучших побуждений.",
      en: "You will know whom to take further and whom to send to a doctor first. That is what separates a healer from one who harms with the best of intentions.",
      uz: "Kimni davom ettirish, kimni avval shifokorga yuborish kerakligini bilasan. Shifokorni yaxshi niyat bilan zarar yetkazuvchidan ajratadigan narsa shu.",
    },
  },

  5: {
    hook: {
      ru: "Пророк ﷺ, когда болел, клал руку на место боли. Не «вообще» — туда.",
      en: "When the Prophet ﷺ was ill, he placed his hand on the place of pain. Not \"in general\" — there.",
      uz: "Payg'ambar ﷺ kasal bo'lganda qo'lini og'riq joyiga qo'yardi. «Umuman» emas — o'sha yerga.",
    },
    learn: {
      ru: [
        "Хитаб аль-Исаба — влияние волей по органам",
        "Трёхуровневое чтение на органы по видам колдовства",
        "Восемь компонентов эффективного заклинания — чем сильное отличается от слабого",
        "Готовые протоколы: сихр, сглаз, зависть, колдовство истощения, чёрные линии, изгнание джиннов",
        "Очищение разума — авторские формулы по функциям тела и психики",
      ],
      en: [
        "Khitab al-Isaba — influence by will, organ by organ",
        "Three-level recitation upon organs according to the type of sorcery",
        "The eight components of effective incantation — what separates the strong from the weak",
        "Ready protocols: sihr, the evil eye, envy, sorcery of exhaustion, black lines, expelling jinn",
        "Cleansing of the mind — the author's formulas by the functions of body and psyche",
      ],
      uz: [
        "Xitob al-Isoba — a'zolar bo'yicha iroda ta'siri",
        "Sehr turlariga qarab a'zolarga uch bosqichli o'qish",
        "Samarali roqiyaning sakkiz tarkibi — kuchlisini kuchsizidan nima ajratadi",
        "Tayyor tartiblar: sehr, ko'z tegishi, hasad, holdan toydiruvchi sehr, qora chiziqlar, jinlarni haydash",
        "Ongni tozalash — tana va ruhiyat vazifalari bo'yicha muallif formulalari",
      ],
    },
    after: {
      ru: "Самый большой модуль курса — двенадцать книг. После него у тебя будет ответ почти на всё, с чем к тебе придут.",
      en: "The largest module of the course — twelve books. After it you will have an answer to nearly everything people bring you.",
      uz: "Kursning eng katta moduli — o'n ikki kitob. Undan keyin senga keltiriladigan deyarli har narsaga javobing bo'ladi.",
    },
  },

  6: {
    hook: {
      ru: "Лечение без защиты — как чинить стену крепости, оставив ворота открытыми.",
      en: "Healing without protection is like mending a fortress wall while leaving the gate open.",
      uz: "Himoyasiz davolash — darvozani ochiq qoldirib, qal'a devorini tuzatgan bilan barobar.",
    },
    learn: {
      ru: [
        "Трёхуровневую защиту: постоянную, ситуативную, боевую",
        "Дуа о божественном сокрытии — и почему лекаря замечают",
        "Арсенал против колдовства, сглаза и зависти",
        "Открытие духовных замков",
        "Базовые азкары и дуа защиты как справочник под рукой",
      ],
      en: [
        "Three-level protection: constant, situational, combat",
        "The supplication of divine concealment — and why a healer gets noticed",
        "The arsenal against sorcery, the evil eye and envy",
        "Opening spiritual locks",
        "Core adhkar and protective supplications as a reference at hand",
      ],
      uz: [
        "Uch bosqichli himoya: doimiy, vaziyatli, jangovar",
        "Ilohiy pardalanish duosi — va shifokor nega e'tiborga tushadi",
        "Sehr, ko'z tegishi va hasadga qarshi qurollar",
        "Ruhiy qulflarni ochish",
        "Asosiy azkor va himoya duolari — qo'l ostidagi ma'lumotnoma",
      ],
    },
    after: {
      ru: "Ты сможешь работать с тяжёлым и не приносить это домой.",
      en: "You will be able to work with heavy cases and not carry them home.",
      uz: "Og'ir holatlar bilan ishlab, ularni uyingga olib kelmaysan.",
    },
  },

  7: {
    hook: {
      ru: "Иногда чтение встречает сопротивление. Значит, там кто-то есть — и с этим нужно уметь работать.",
      en: "Sometimes the recitation meets resistance. That means someone is there — and you must know how to work with it.",
      uz: "Ba'zan o'qish qarshilikka uchraydi. Demak, u yerda kimdir bor — va bu bilan ishlashni bilish kerak.",
    },
    learn: {
      ru: [
        "Четырёхуровневую систему формул",
        "Тринадцать типов духовных сущностей и протокол по каждому",
        "Как отличить сопротивление сущности от сопротивления самого пациента",
      ],
      en: [
        "The four-level system of formulas",
        "Thirteen types of spiritual entities and the protocol for each",
        "How to tell an entity's resistance from the patient's own",
      ],
      uz: [
        "To'rt bosqichli formulalar tizimi",
        "Ruhiy mavjudotlarning o'n uch turi va har biriga tartib",
        "Mavjudotning qarshiligini bemorning o'z qarshiligidan qanday ajratish",
      ],
    },
    after: {
      ru: "Ты перестанешь отступать там, где нужно продолжать, — и продолжать там, где нужно остановиться.",
      en: "You will stop retreating where you should continue — and continuing where you should stop.",
      uz: "Davom etish kerak joyda chekinmaysan — to'xtash kerak joyda davom etmaysan.",
    },
  },

  8: {
    hook: {
      ru: "Сильного от начинающего отличают не формулы. Формулы у них одни и те же.",
      en: "It is not formulas that separate the strong from the beginner. Their formulas are the same.",
      uz: "Kuchlini boshlovchidan formulalar ajratmaydi. Formulalari bir xil.",
    },
    learn: {
      ru: [
        "Фундамент мастера — состояние, из которого читают",
        "Заклинание действием и продвинутые формулы",
        "Комбинированные формулы и уровни мастерства",
      ],
      en: [
        "The master's foundation — the state one recites from",
        "Incantation through action and advanced formulas",
        "Combined formulas and the levels of mastery",
      ],
      uz: [
        "Ustozning poydevori — o'qiladigan holat",
        "Harakat bilan roqiya va ilg'or formulalar",
        "Qo'shma formulalar va mahorat bosqichlari",
      ],
    },
    after: {
      ru: "Ты поймёшь, почему одни и те же слова у одного работают, а у другого — нет.",
      en: "You will understand why the very same words work for one and not for another.",
      uz: "Nega aynan bir xil so'zlar birida ishlab, boshqasida ishlamasligini tushunasan.",
    },
  },

  9: {
    hook: {
      ru: "Рано или поздно тебе принесут чужой язык — «энергетика», «биополе», «Космос как источник». Нужно уметь ответить, а не отмахнуться.",
      en: "Sooner or later someone will bring you a foreign vocabulary — \"energy\", \"biofield\", \"the Cosmos as a source\". You must be able to answer, not wave it away.",
      uz: "Ertami-kechmi senga begona til keltiriladi — «energetika», «biomaydon», «Kosmos manba». Javob bera olish kerak, qo'l siltab qo'yish emas.",
    },
    learn: {
      ru: [
        "Границы веры: единственность Истины и вопрос заступничества",
        "Что есть истина — разбор с доводами из Корана и Сунны",
        "Классификацию обращений к умершим и разбор вопросов у могилы",
        "Разбор вопросов заступничества у могилы Пророка ﷺ",
      ],
      en: [
        "The boundaries of faith: the oneness of the Truth and the question of intercession",
        "What the truth is — an examination with evidence from the Qur'an and the Sunnah",
        "A classification of appeals to the dead and an examination of questions at the grave",
        "An examination of intercession at the grave of the Prophet ﷺ",
      ],
      uz: [
        "Iymon chegaralari: Haqning yagonaligi va shafoat masalasi",
        "Haqiqat nima — Qur'on va Sunnat dalillari bilan tahlil",
        "Vafot etganlarga murojaatlar tasnifi va qabr oldidagi savollar tahlili",
        "Payg'ambar ﷺ qabri oldidagi shafoat masalalari tahlili",
      ],
    },
    after: {
      ru: "Ты сможешь отличить рукью от того, что на неё похоже, — и объяснить разницу словами, а не ощущением.",
      en: "You will be able to tell ruqyah from what merely resembles it — and explain the difference in words, not by feeling.",
      uz: "Ruqyani unga o'xshaganidan ajrata olasan — va farqni tuyg'u bilan emas, so'z bilan tushuntirasan.",
    },
  },

  10: {
    hook: {
      ru: "Лекарь и мучитель — два образа. Со стороны они делают одно и то же.",
      en: "The healer and the tormentor are two figures. From outside they do the same thing.",
      uz: "Shifokor va qiynoqchi — ikki siymo. Tashqaridan ular bir xil ish qiladi.",
    },
    learn: {
      ru: [
        "Десять ошибок раки — по списку, честно, про себя",
        "Разницу между практиком и теоретиком в рукье",
        "Почему недопустимы «я исцелил его» и «гарантирую результат»",
      ],
      en: [
        "The ten mistakes of a raqi — by the list, honestly, about yourself",
        "The difference between a practitioner and a theorist in ruqyah",
        "Why \"I healed him\" and \"I guarantee the result\" are inadmissible",
      ],
      uz: [
        "Roqiyning o'nta xatosi — ro'yxat bo'yicha, halol, o'zing haqingda",
        "Ruqyada amaliyotchi bilan nazariyotchi orasidagi farq",
        "«Men uni shifo qildim» va «natijaga kafolat beraman» nega mumkin emas",
      ],
    },
    after: {
      ru: "Ты будешь узнавать в себе то, что портит лекаря, раньше, чем это заметит пациент.",
      en: "You will recognise in yourself what spoils a healer before the patient notices it.",
      uz: "Shifokorni buzadigan narsani bemor sezishidan oldin o'zingda tanib olasan.",
    },
  },

  11: {
    hook: {
      ru: "Всё изученное встречается с живым пациентом. Дальше нужна не память, а система.",
      en: "Everything you have learned meets a living patient. From here you need not memory but a system.",
      uz: "O'rganganlaring tirik bemor bilan uchrashadi. Bundan keyin xotira emas, tizim kerak.",
    },
    learn: {
      ru: [
        "Интерфейс и логику RUKYA Pro",
        "Ведение карточки пациента и истории сеансов",
        "Почему программа работает офлайн и данные остаются только у тебя",
      ],
      en: [
        "The interface and logic of RUKYA Pro",
        "Keeping a patient record and the history of sessions",
        "Why the programme works offline and the data stays only with you",
      ],
      uz: [
        "RUKYA Pro interfeysi va mantig'i",
        "Bemor kartasi va seanslar tarixini yuritish",
        "Dastur nega oflayn ishlaydi va ma'lumot nega faqat sende qoladi",
      ],
    },
    after: {
      ru: "Ты сможешь принимать людей системно, а не по памяти и заметкам на полях.",
      en: "You will be able to receive people systematically, not from memory and notes in the margins.",
      uz: "Odamlarni xotira va chetdagi qaydlar bilan emas, tizimli qabul qila olasan.",
    },
  },
};

/** Текст модуля на текущем языке. Русский — источник: если перевода нет,
 *  показываем русский, а не пустую рамку и не сырой ключ. */
export function moduleIntro(moduleId, lang) {
  const src = MODULE_INTRO[moduleId];
  if (!src) return null;
  const pick = (field) => src[field]?.[lang] || src[field]?.ru || null;
  return { hook: pick("hook"), learn: pick("learn") || [], after: pick("after") };
}
