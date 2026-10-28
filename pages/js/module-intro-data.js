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
//     гарантию исцеления: Модуль 11, §2 прямо запрещает заявления вида
//     «я точно вылечу это». Настрой не должен противоречить собственной
//     этике курса.
//   • Никакого «ты станешь сильным лекарем». Сила не в ученике — он
//     причина, а не источник (Модуль 11, §3). Поэтому текст говорит о том,
//     чему модуль учит, а не о том, кем ученик сделается.
//   • Каждый пункт «чему учит» опирается на реальный урок модуля из
//     modules-data.js, а не сочинён для красоты. Ученик, открыв модуль,
//     должен найти там ровно то, что ему пообещали.
export const MODULE_INTRO = {
  "1": {
    hook: {
      ru: "Прежде формулы нужно знать, Кому обращаешься и где обязан остановиться.",
      en: "Before a formula you must know Whom you address and where you must stop.",
      uz: "Formuladan oldin Kimga murojaat qilishing va qayerda to'xtashing kerak."
    },
    learn: {
      ru: [
        "Таухид, источник силы и границы дозволенного",
        "Входной ценз чтения и правила допуска",
        "Границы духа, тела и медицинской помощи"
      ],
      en: [
        "Tawhid, the source of strength and lawful boundaries",
        "The entrance reading check and admission rules",
        "The boundaries of spirit, body and medical care"
      ],
      uz: [
        "Tavhid, quvvat manbai va ruxsat chegaralari",
        "Kirish o'qish bahosi va qabul qoidalari",
        "Ruh, tana va tibbiy yordam chegaralari"
      ]
    },
    after: {
      ru: "Ты сможешь объяснить основание рукьи и пройти первичный допуск.",
      en: "You will be able to explain the foundation of ruqyah and pass the initial admission check.",
      uz: "Ruqyaning asosini tushuntirib, dastlabki qabuldan o'ta olasan."
    }
  },
  "2": {
    hook: {
      ru: "Формула не заменяет состояние сердца: здесь собираются якын, намерение и воля.",
      en: "A formula does not replace the heart: yaqin, intention and will are trained here.",
      uz: "Formula qalb holatini almashtirmaydi: bu yerda yaqin, niyat va iroda shakllanadi."
    },
    learn: {
      ru: [
        "Ихсан, якын и работа с намерением",
        "Волевой акт, басира и подготовка состояния",
        "Трилогия «Прямой путь» и практика на себе"
      ],
      en: [
        "Ihsan, yaqin and intention training",
        "The act of will, basira and preparation",
        "The Direct Path trilogy and self-practice"
      ],
      uz: [
        "Ihson, yaqin va niyat bilan ishlash",
        "Iroda amali, basira va holat tayyorgarligi",
        "«To'g'ri yo'l» trilogiyasi va o'z ustida amaliyot"
      ]
    },
    after: {
      ru: "Ты сможешь войти в чтение с собранным намерением и вести дневник подготовки.",
      en: "You will be able to enter recitation with focused intention and keep a preparation journal.",
      uz: "Yig'ilgan niyat bilan o'qishga kirib, tayyorgarlik kundaligini yurita olasan."
    }
  },
  "3": {
    hook: {
      ru: "Точность начинается с языка: аят, хадис и авторская формула не должны смешиваться.",
      en: "Precision begins with language: ayat, hadith and an author's formula must not be confused.",
      uz: "Aniqlik tildan boshlanadi: oyat, hadis va muallif formulasi aralashtirilmasligi kerak."
    },
    learn: {
      ru: [
        "Дозволенные тексты и статус каждой формулы",
        "Арабский, транслитерация и перевод",
        "«Арки», «Аллязи» и словарь органов"
      ],
      en: [
        "Lawful texts and the status of each formula",
        "Arabic, transliteration and translation",
        "Arqi, Alladhi and the organ vocabulary"
      ],
      uz: [
        "Ruxsat etilgan matnlar va formula holati",
        "Arab tili, transliteratsiya va tarjima",
        "«Arqi», «Allazi» va a'zolar lug'ati"
      ]
    },
    after: {
      ru: "Ты сможешь читать и проверять формулу, не приписывая ей ложного статуса.",
      en: "You will be able to read and check a formula without assigning it a false status.",
      uz: "Formulani o'qib, unga noto'g'ri maqom bermasdan tekshira olasan."
    }
  },
  "4": {
    hook: {
      ru: "Сначала безопасность и данные, только затем рабочая гипотеза и программа.",
      en: "Safety and data come first; only then a working hypothesis and programme.",
      uz: "Avval xavfsizlik va ma'lumot, keyin ish gipotezasi va dastur."
    },
    learn: {
      ru: [
        "Четыре двери, семь зон и профили случаев",
        "Красные флаги, согласие и стоп-правила",
        "Разбор кейсов и активизация против угрозы"
      ],
      en: [
        "Four doors, seven zones and case profiles",
        "Red flags, consent and stop rules",
        "Case analysis and activation versus danger"
      ],
      uz: [
        "To'rt eshik, yetti zona va holat profillari",
        "Qizil bayroqlar, rozilik va to'xtatish qoidalari",
        "Keys tahlili va faollashuv yoki xavf"
      ]
    },
    after: {
      ru: "Ты сможешь провести опрос и остановить приём, когда продолжать опасно.",
      en: "You will be able to conduct intake and stop when continuing is unsafe.",
      uz: "So'rov o'tkazib, davom etish xavfli bo'lganda to'xtaya olasan."
    }
  },
  "5": {
    hook: {
      ru: "Адресное чтение собирается в цикл, а не в набор отдельных приёмов.",
      en: "Addressed recitation becomes a cycle rather than isolated techniques.",
      uz: "Manzilli o'qish alohida usullar emas, yagona sikl bo'lib shakllanadi."
    },
    learn: {
      ru: [
        "Три адресата и девять ступеней",
        "Тринадцать шагов и тахриж",
        "Сердечное чтение и цепь намерения"
      ],
      en: [
        "Three addressees and nine stages",
        "Thirteen steps and takhrij",
        "Heartfelt recitation and the intention chain"
      ],
      uz: [
        "Uch manzil va to'qqiz bosqich",
        "O'n uch qadam va tahrij",
        "Qalbdan o'qish va niyat zanjiri"
      ]
    },
    after: {
      ru: "Ты сможешь выполнить сухой прогон полного цикла без пропусков.",
      en: "You will be able to perform a dry run of the full cycle without omissions.",
      uz: "To'liq siklni quruq mashqda hech bir bosqichni tashlab ketmasdan bajara olasan."
    }
  },
  "6": {
    hook: {
      ru: "После цикла нужна точность: зона, формула, один проход и проверка.",
      en: "After the cycle comes precision: zone, formula, one pass and verification.",
      uz: "Sikldan keyin aniqlik kerak: zona, formula, bir o'tish va tekshiruv."
    },
    learn: {
      ru: [
        "Протоколы по органам и библиотека формул",
        "Один точный проход и окна проверки",
        "Самоисцеление и дистанционный формат",
        "Исходный разбор одного чтения и маркеры 4/4"
      ],
      en: [
        "Organ protocols and the formula library",
        "One precise pass and verification windows",
        "Self-healing and remote format",
        "Source analysis of one recitation and the 4/4 markers"
      ],
      uz: [
        "A'zolar protokollari va formulalar kutubxonasi",
        "Bir aniq o'tish va tekshiruv oynalari",
        "O'zini davolash va masofaviy format",
        "Bitta o'qish tahlili va 4/4 belgilari"
      ]
    },
    after: {
      ru: "Ты сможешь собрать учебный сеанс для одной зоны и записать критерии проверки.",
      en: "You will be able to assemble a training session for one zone and record verification criteria.",
      uz: "Bitta zona uchun o'quv seansini tuzib, tekshiruv mezonlarini qayd eta olasan."
    }
  },
  "7": {
    hook: {
      ru: "Сеанс завершается не последним словом, а защитой и порядком после него.",
      en: "A session ends not with the last word but with protection and follow-up.",
      uz: "Seans oxirgi so'z bilan emas, himoya va keyingi tartib bilan yakunlanadi."
    },
    learn: {
      ru: [
        "Азкары, вода, дом и три уровня защиты",
        "Открытие и закрытие путей",
        "Цепь намерения и закрепление"
      ],
      en: [
        "Adhkar, water, home and three levels of protection",
        "Opening and closing paths",
        "The intention chain and consolidation"
      ],
      uz: [
        "Azkorlar, suv, uy va uch himoya darajasi",
        "Yo'llarni ochish va yopish",
        "Niyat zanjiri va natijani mustahkamlash"
      ]
    },
    after: {
      ru: "Ты сможешь завершить учебный сеанс защитой и планом последующего наблюдения.",
      en: "You will be able to close a training session with protection and a follow-up plan.",
      uz: "O'quv seansini himoya va kuzatuv rejasi bilan yakunlay olasan."
    }
  },
  "8": {
    hook: {
      ru: "Теперь разбор превращается в полную программу: от анализа до защиты.",
      en: "Now analysis becomes a complete programme, from assessment to protection.",
      uz: "Endi tahlil to'liq dasturga aylanadi: baholashdan himoyagacha."
    },
    learn: {
      ru: [
        "Части 0–4 разбора случая",
        "Десять критериев и приоритеты",
        "Спецпротоколы и переоценка",
        "Исходный кейс по приложениям 7–10 второго издания"
      ],
      en: [
        "Parts 0–4 of case analysis",
        "Ten criteria and priorities",
        "Special protocols and reassessment",
        "The source case from appendices 7–10 of the second edition"
      ],
      uz: [
        "Holat tahlilining 0–4 qismlari",
        "O'n mezon va ustuvorliklar",
        "Maxsus protokollar va qayta baholash",
        "Ikkinchi nashrning 7–10-ilovalari bo'yicha asl keys"
      ]
    },
    after: {
      ru: "Ты сможешь собрать и проверить полную программу на обезличенном кейсе.",
      en: "You will be able to build and verify a full programme for an anonymised case.",
      uz: "Anonim keys asosida to'liq dastur tuzib, uni tekshira olasan."
    }
  },
  "9": {
    hook: {
      ru: "Семейная история требует особенно точной границы между источником, диагнозом и обвинением.",
      en: "Family history requires a strict boundary between source claims, diagnosis and blame.",
      uz: "Oila tarixi manba, tashxis va ayblov o'rtasida aniq chegara talab qiladi."
    },
    learn: {
      ru: [
        "Наследственная болезнь по полному переводу",
        "Виды, механизмы и программы источника",
        "Семейные и пищевые случаи с безопасными границами"
      ],
      en: [
        "Inherited affliction in the full translation",
        "Source types, mechanisms and programmes",
        "Family and food-related cases with safe boundaries"
      ],
      uz: [
        "To'liq tarjimadagi meros kasalligi",
        "Manba turlari, mexanizmlari va dasturlari",
        "Oilaviy va oziq-ovqat holatlari xavfsiz chegaralarda"
      ]
    },
    after: {
      ru: "Ты сможешь разобрать текст источника без самодиагноза, обвинений и опасных процедур.",
      en: "You will be able to analyse source texts without self-diagnosis, blame or dangerous procedures.",
      uz: "Manba matnini o'ziga tashxis qo'yish, ayblash va xavfli amallarsiz tahlil qila olasan."
    }
  },
  "10": {
    hook: {
      ru: "Здесь цена ошибки выше: видение не доказательство, а тяжёлый случай не место для самостоятельного эксперимента.",
      en: "The cost of error is higher: a vision is not proof, and a severe case is no place for experimentation.",
      uz: "Bu yerda xato narxi yuqori: ko'rish dalil emas, og'ir holat esa mustaqil tajriba joyi emas."
    },
    learn: {
      ru: [
        "Виды кашфа и отличие от галлюцинаций",
        "Тяжёлые категории и риски для лекаря",
        "Изгнание только как разбор под супервизией"
      ],
      en: [
        "Types of kashf and differentiation from hallucinations",
        "Severe categories and risks to the practitioner",
        "Expulsion only as supervised analysis"
      ],
      uz: [
        "Kashf turlari va gallyutsinatsiyadan farqi",
        "Og'ir toifalar va tabib xavfi",
        "Chiqarish faqat nazorat ostidagi tahlil sifatida"
      ]
    },
    after: {
      ru: "Ты сможешь распознать запрет на самостоятельную практику и правильно передать случай на супервизию.",
      en: "You will be able to recognise when independent practice is forbidden and refer a case for supervision.",
      uz: "Mustaqil amaliyot taqiqlanganini bilib, holatni nazoratga topshira olasan."
    }
  },
  "11": {
    hook: {
      ru: "Мастерство проверяется не громкостью обещаний, а корнем, этикой и качеством записи случая.",
      en: "Mastery is shown not by promises but by foundations, ethics and case documentation.",
      uz: "Mahorat va'dalar bilan emas, asos, odob va holat yoritilgani bilan o'lchanadi."
    },
    learn: {
      ru: [
        "Корень влияния и восемь компонентов",
        "Этика истинного ракыя и границы обещаний",
        "Конфиденциальность и работа в RUKYA Pro",
        "Три столпа, пять элементов намерения и сердечный резервуар"
      ],
      en: [
        "The root of influence and eight components",
        "Ethics of a true raqi and limits of promises",
        "Confidentiality and work in RUKYA Pro",
        "Three pillars, five intention elements and the heart reservoir"
      ],
      uz: [
        "Ta'sir ildizi va sakkiz komponent",
        "Haqiqiy roqiy odobi va va'da chegaralari",
        "Maxfiylik va RUKYA Proda ishlash",
        "Uch ustun, niyatning besh elementi va qalb rezervuari"
      ]
    },
    after: {
      ru: "Ты сможешь вести случай профессионально: от состояния и этики до защищённой записи.",
      en: "You will be able to manage a case professionally, from intention and ethics to secure records.",
      uz: "Holatni niyat va odobdan himoyalangan qaydgacha professional yurita olasan."
    }
  },
  "12": {
    hook: {
      ru: "Завершает курс не прочитанная страница, а принятая наставником практика.",
      en: "The course is completed not by reading but by mentor-approved practice.",
      uz: "Kurs o'qish bilan emas, ustoz qabul qilgan amaliyot bilan yakunlanadi."
    },
    learn: {
      ru: [
        "Паспорт практики и ступени допуска",
        "Полный симуляционный случай",
        "Три принятых случая и защита двух",
        "Тест готовности, приём и карточка случая",
        "Супервизия, право и школа лекаря"
      ],
      en: [
        "The practice passport and admission stages",
        "A complete simulated case",
        "Three accepted cases and defence of two",
        "Readiness test, intake and case record",
        "Supervision, law and the healer's school"
      ],
      uz: [
        "Amaliyot pasporti va qabul bosqichlari",
        "To'liq simulyatsiya holati",
        "Uch qabul qilingan holat va ikkitasini himoya qilish",
        "Tayyorgarlik testi, qabul va holat kartasi",
        "Nazorat, huquq va tabib maktabi"
      ]
    },
    after: {
      ru: "Ты сможешь представить случай на проверку и пройти итоговую аттестацию.",
      en: "You will be able to present a case for review and complete final assessment.",
      uz: "Holatni tekshiruvga taqdim etib, yakuniy attestatsiyadan o'ta olasan."
    }
  }

};

/** Текст модуля на текущем языке. Русский — источник: если перевода нет,
 *  показываем русский, а не пустую рамку и не сырой ключ. */
export function moduleIntro(moduleId, lang) {
  const src = MODULE_INTRO[moduleId];
  if (!src) return null;
  const pick = (field) => src[field]?.[lang] || src[field]?.ru || null;
  return { hook: pick("hook"), learn: pick("learn") || [], after: pick("after") };
}
