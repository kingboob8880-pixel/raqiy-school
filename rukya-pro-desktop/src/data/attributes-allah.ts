// ==========================================
// RUKYA PRO - 99 Атрибутов Аллаха
// ==========================================

import type { AllahAttribute } from '../types';

export const ALLAH_ATTRIBUTES: AllahAttribute[] = [
  {
    id: 'ar-rahman',
    nameAr: 'الرَّحْمَنُ',
    transliteration: 'Ар-Рахман',
    meaning: 'Всемилостивый',
    application: 'Взывать при нужде в милосердии, прощении, облегчении',
    formula: 'يَا رَحْمَنُ ارْحَمْنِي'
  },
  {
    id: 'ar-rahim',
    nameAr: 'الرَّحِيمُ',
    transliteration: 'Ар-Рахим',
    meaning: 'Милосердный',
    application: 'При болезни, страдании, просьбе об исцелении',
    formula: 'يَا رَحِيمُ ارْحَمْنِي'
  },
  {
    id: 'al-malik',
    nameAr: 'الْمَلِكُ',
    transliteration: 'Аль-Малик',
    meaning: 'Царь, Владыка',
    application: 'При потере контроля, страхе, нужде в покровительстве',
    formula: 'يَا مَلِكُ أَعِنِّي'
  },
  {
    id: 'al-quddus',
    nameAr: 'الْقُدُّوسُ',
    transliteration: 'Аль-Куддус',
    meaning: 'Пресвятой, Пречистый',
    application: 'При духовном очищении, покаянии, избавлении от нечисти',
    formula: 'يَا قُدُّوسُ طَهِّرْ قَلْبِي'
  },
  {
    id: 'as-salam',
    nameAr: 'السَّلَامُ',
    transliteration: 'Ас-Салям',
    meaning: 'Мир, Источник мира',
    application: 'При тревоге, страхе, смятении души, поиске покоя',
    formula: 'يَا سَلَامُ سَلِّمْنِي'
  },
  {
    id: 'al-mumin',
    nameAr: 'الْمُؤْمِنُ',
    transliteration: 'Аль-Муьмин',
    meaning: 'Дарующий безопасность',
    application: 'При страхе от джиннов, нечисти, ночных кошмарах',
    formula: 'يَا مُؤْمِنُ آمِنِّي'
  },
  {
    id: 'al-muhaymin',
    nameAr: 'الْمُهَيْمِنُ',
    transliteration: 'Аль-Мухаймин',
    meaning: 'Хранитель, Надзирающий',
    application: 'При нужде в защите, охране от вреда',
    formula: 'يَا مُهَيْمِنُ احْفَظْنِي'
  },
  {
    id: 'al-aziz',
    nameAr: 'الْعَزِيزُ',
    transliteration: 'Аль-Азиз',
    meaning: 'Могущественный, Непобедимый',
    application: 'При слабости, унижении, нужде в силе',
    formula: 'يَا عَزِيزُ أَعِزَّنِي'
  },
  {
    id: 'al-jabbar',
    nameAr: 'الْجَبَّارُ',
    transliteration: 'Аль-Джаббар',
    meaning: 'Сильный, Восстанавливающий сломанное',
    application: 'При сломленности, отчаянии, нужде в восстановлении',
    formula: 'يَا جَبَّارُ اجْبُرْ كَسْرِي'
  },
  {
    id: 'al-mutakabbir',
    nameAr: 'الْمُتَكَبِّرُ',
    transliteration: 'Аль-Мутакаббир',
    meaning: 'Превознесённый',
    application: 'При чувстве незначимости, для укрепления достоинства',
    formula: 'يَا مُتَكَبِّرُ أَعِنِّي'
  },
  {
    id: 'al-khaliq',
    nameAr: 'الْخَالِقُ',
    transliteration: 'Аль-Халик',
    meaning: 'Творец',
    application: 'При болезни органов, нужде в обновлении тела',
    formula: 'يَا خَالِقُ اشْفِنِي'
  },
  {
    id: 'al-bari',
    nameAr: 'الْبَارِئُ',
    transliteration: 'Аль-Бариь',
    meaning: 'Создатель, Оформляющий',
    application: 'При болезнях тела, физических страданиях',
    formula: 'يَا بَارِئُ اشْفِنِي'
  },
  {
    id: 'al-ghaffar',
    nameAr: 'الْغَفَّارُ',
    transliteration: 'Аль-Гаффар',
    meaning: 'Всепрощающий',
    application: 'При тяжести грехов, после покаяния, духовной боли',
    formula: 'يَا غَفَّارُ اغْفِرْ لِي'
  },
  {
    id: 'al-qahhar',
    nameAr: 'الْقَهَّارُ',
    transliteration: 'Аль-Каhhар',
    meaning: 'Всепобеждающий',
    application: 'Против сихра, джиннов, всего враждебного',
    formula: 'يَا قَهَّارُ اقْهَرْ أَعْدَائِي'
  },
  {
    id: 'al-wahhab',
    nameAr: 'الْوَهَّابُ',
    transliteration: 'Аль-Ваhhаб',
    meaning: 'Щедрый Даритель',
    application: 'При нужде, бедности, блокировке ризка',
    formula: 'يَا وَهَّابُ هَبْ لِي'
  },
  {
    id: 'ar-razzaq',
    nameAr: 'الرَّزَّاقُ',
    transliteration: 'Ар-Раззак',
    meaning: 'Наделяющий уделом',
    application: 'При проблемах с ризком, работой, деньгами',
    formula: 'يَا رَزَّاقُ ارْزُقْنِي'
  },
  {
    id: 'al-fattah',
    nameAr: 'الْفَتَّاحُ',
    transliteration: 'Аль-Фаттах',
    meaning: 'Открывающий, Решающий',
    application: 'При сихре блокировки, закрытых дверях, трудных делах',
    formula: 'يَا فَتَّاحُ افْتَحْ لِي'
  },
  {
    id: 'al-alim',
    nameAr: 'الْعَلِيمُ',
    transliteration: 'Аль-Алим',
    meaning: 'Всезнающий',
    application: 'При поиске истины, сомнениях в диагнозе',
    formula: 'يَا عَلِيمُ عَلِّمْنِي'
  },
  {
    id: 'al-qabid',
    nameAr: 'الْقَابِضُ',
    transliteration: 'Аль-Кабид',
    meaning: 'Сжимающий',
    application: 'Призывать с пониманием — для сдержанности страстей нафса',
    formula: 'يَا قَابِضُ اقْبِضْ عَنِّي الشَّرّ'
  },
  {
    id: 'al-basit',
    nameAr: 'الْبَاسِطُ',
    transliteration: 'Аль-Басит',
    meaning: 'Расширяющий',
    application: 'При стеснённости, тревоге, для расширения груди',
    formula: 'يَا بَاسِطُ ابْسُطْ لِي'
  },
  {
    id: 'al-hafid',
    nameAr: 'الْخَافِضُ',
    transliteration: 'Аль-Хафид',
    meaning: 'Унижающий (врагов)',
    application: 'При угрозе от нечисти, джиннов, завистников',
    formula: 'يَا خَافِضُ اخْفِضْ أَعْدَائِي'
  },
  {
    id: 'ar-rafi',
    nameAr: 'الرَّافِعُ',
    transliteration: 'Ар-Рафиь',
    meaning: 'Возвышающий',
    application: 'При унижении, для поднятия духа и положения',
    formula: 'يَا رَافِعُ ارْفَعْنِي'
  },
  {
    id: 'al-muizz',
    nameAr: 'الْمُعِزُّ',
    transliteration: 'Аль-Муизз',
    meaning: 'Дарующий честь',
    application: 'При унижении, позоре, нужде в достоинстве',
    formula: 'يَا مُعِزُّ أَعِزَّنِي'
  },
  {
    id: 'al-muzill',
    nameAr: 'الْمُذِلُّ',
    transliteration: 'Аль-Музилль',
    meaning: 'Унижающий',
    application: 'Против тиранов, насильников — взывать в ду\'а',
    formula: 'يَا مُذِلُّ أَذِلَّ الظَّالِمِينَ'
  },
  {
    id: 'as-sami',
    nameAr: 'السَّمِيعُ',
    transliteration: 'Ас-Самиь',
    meaning: 'Всеслышащий',
    application: 'При любом дуа — Аллах слышит',
    formula: 'يَا سَمِيعُ اسْمَعْ دُعَائِي'
  },
  {
    id: 'al-basir',
    nameAr: 'الْبَصِيرُ',
    transliteration: 'Аль-Басыр',
    meaning: 'Всевидящий',
    application: 'При несправедливости, когда нужен свидетель',
    formula: 'يَا بَصِيرُ أَبْصِرْ حَالِي'
  },
  {
    id: 'al-hakam',
    nameAr: 'الْحَكَمُ',
    transliteration: 'Аль-Хакам',
    meaning: 'Судья',
    application: 'При несправедливости, спорах, нужде в суде Аллаха',
    formula: 'يَا حَكَمُ احْكُمْ بَيْنِي وَبَيْنَ عَدُوِّي'
  },
  {
    id: 'al-adl',
    nameAr: 'الْعَدْلُ',
    transliteration: 'Аль-Адль',
    meaning: 'Справедливый',
    application: 'При угнетении, нарушении прав',
    formula: 'يَا عَدْلُ انْصُرْنِي'
  },
  {
    id: 'al-latif',
    nameAr: 'اللَّطِيفُ',
    transliteration: 'Аль-Латыф',
    meaning: 'Тонкий, Добросердечный',
    application: 'При скрытых проблемах, тонких болезнях, деликатных ситуациях',
    formula: 'يَا لَطِيفُ الْطُفْ بِي'
  },
  {
    id: 'al-khabir',
    nameAr: 'الْخَبِيرُ',
    transliteration: 'Аль-Хабир',
    meaning: 'Осведомлённый',
    application: 'Когда скрыта причина болезни или беды',
    formula: 'يَا خَبِيرُ أَخْبِرْنِي'
  },
  {
    id: 'al-halim',
    nameAr: 'الْحَلِيمُ',
    transliteration: 'Аль-Халим',
    meaning: 'Кроткий',
    application: 'При гневе, раздражительности, взрывном характере',
    formula: 'يَا حَلِيمُ حَلِّمْنِي'
  },
  {
    id: 'al-azim',
    nameAr: 'الْعَظِيمُ',
    transliteration: 'Аль-Азым',
    meaning: 'Великий',
    application: 'Для мощного исцеления — взывать в дуа 7 раз (хадис от Ибн Аббаса)',
    formula: 'يَا اللَّهُ رَبَّ الْعَرْشِ الْعَظِيمِ اشْفِهِ'
  },
  {
    id: 'al-ghafur',
    nameAr: 'الْغَفُورُ',
    transliteration: 'Аль-Гафур',
    meaning: 'Прощающий',
    application: 'После грехов, при боли совести, во время покаяния',
    formula: 'يَا غَفُورُ اغْفِرْ لِي'
  },
  {
    id: 'ash-shakur',
    nameAr: 'الشَّكُورُ',
    transliteration: 'Аш-Шакур',
    meaning: 'Благодарный (воздающий за добро)',
    application: 'Для шукра, благодарности, усиления благ',
    formula: 'يَا شَكُورُ أَشْكُرُكَ'
  },
  {
    id: 'al-ali',
    nameAr: 'الْعَلِيُّ',
    transliteration: 'Аль-Алий',
    meaning: 'Высочайший',
    application: 'При нужде в поддержке свыше',
    formula: 'يَا عَلِيُّ أَعِنِّي'
  },
  {
    id: 'al-kabir',
    nameAr: 'الْكَبِيرُ',
    transliteration: 'Аль-Кабир',
    meaning: 'Большой, Великий',
    application: 'При ощущении малости проблем Аллаха нет',
    formula: 'يَا كَبِيرُ أَعِنِّي'
  },
  {
    id: 'al-hafiz',
    nameAr: 'الْحَفِيظُ',
    transliteration: 'Аль-Хафыз',
    meaning: 'Хранитель',
    application: 'Для защиты от всего вредного — ежедневно',
    formula: 'يَا حَفِيظُ احْفَظْنِي'
  },
  {
    id: 'al-muqit',
    nameAr: 'الْمُقِيتُ',
    transliteration: 'Аль-Мукыт',
    meaning: 'Питающий, Поддерживающий',
    application: 'При слабости, истощении, болезни',
    formula: 'يَا مُقِيتُ قَوِّنِي'
  },
  {
    id: 'al-hasib',
    nameAr: 'الْحَسِيبُ',
    transliteration: 'Аль-Хасиб',
    meaning: 'Достаточный',
    application: 'Для защиты: «Хасбийаллаху» — достаточно мне Аллаха',
    formula: 'حَسْبِيَ اللَّهُ الْحَسِيبُ'
  },
  {
    id: 'al-jalil',
    nameAr: 'الْجَلِيلُ',
    transliteration: 'Аль-Джалиль',
    meaning: 'Величественный',
    application: 'Для усиления трепета и богобоязненности',
    formula: 'يَا جَلِيلُ أَجِلَّنِي'
  },
  {
    id: 'al-karim',
    nameAr: 'الْكَرِيمُ',
    transliteration: 'Аль-Карим',
    meaning: 'Щедрый, Благородный',
    application: 'При нужде в великодушии Аллаха, прощении',
    formula: 'يَا كَرِيمُ تَكَرَّمْ عَلَيَّ'
  },
  {
    id: 'al-wakil',
    nameAr: 'الْوَكِيلُ',
    transliteration: 'Аль-Вакиль',
    meaning: 'Попечитель, Уполномоченный',
    application: 'При таваккуль — уповании на Аллаха',
    formula: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ'
  },
  {
    id: 'al-qawi',
    nameAr: 'الْقَوِيُّ',
    transliteration: 'Аль-Кавий',
    meaning: 'Сильный',
    application: 'При слабости перед испытаниями, нуждой в силе',
    formula: 'يَا قَوِيُّ قَوِّنِي'
  },
  {
    id: 'al-matin',
    nameAr: 'الْمَتِينُ',
    transliteration: 'Аль-Матин',
    meaning: 'Твёрдый, Несокрушимый',
    application: 'При нужде в стойкости, терпении',
    formula: 'يَا مَتِينُ أَعِنِّي'
  },
  {
    id: 'al-waliy',
    nameAr: 'الْوَلِيُّ',
    transliteration: 'Аль-Валий',
    meaning: 'Покровитель, Друг',
    application: 'При одиночестве, нужде в поддержке Аллаха',
    formula: 'يَا وَلِيُّ كُنْ وَلِيِّي'
  },
  {
    id: 'al-hamid',
    nameAr: 'الْحَمِيدُ',
    transliteration: 'Аль-Хамид',
    meaning: 'Достохвальный',
    application: 'Для прославления и шукра',
    formula: 'اَلْحَمْدُ لِلَّهِ الْحَمِيدِ'
  },
  {
    id: 'al-muhsi',
    nameAr: 'الْمُحْصِي',
    transliteration: 'Аль-Мухсый',
    meaning: 'Исчисляющий, Учитывающий',
    application: 'Для осознания ответственности, покаяния',
    formula: 'يَا مُحْصِي لَا تُحَاسِبْنِي بِعَدْلِكَ'
  },
  {
    id: 'al-mubdi',
    nameAr: 'الْمُبْدِئُ',
    transliteration: 'Аль-Мубди',
    meaning: 'Начинающий',
    application: 'При начале лечения, нового дела',
    formula: 'يَا مُبْدِئُ ابْدَأْ لِي بِالْخَيْرِ'
  },
  {
    id: 'al-muhyi',
    nameAr: 'الْمُحْيِي',
    transliteration: 'Аль-Мухйи',
    meaning: 'Оживляющий',
    application: 'При тяжёлой болезни, нужде в оживлении духа и тела',
    formula: 'يَا مُحْيِي أَحْيِ قَلْبِي'
  },
  {
    id: 'al-qayyum',
    nameAr: 'الْقَيُّومُ',
    transliteration: 'Аль-Каyyум',
    meaning: 'Вечно Живой, Поддерживающий',
    application: 'Мощнейшее имя для рукъи — в Аят аль-Курси',
    formula: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ'
  },
  {
    id: 'al-wajid',
    nameAr: 'الْوَاجِدُ',
    transliteration: 'Аль-Важид',
    meaning: 'Находящий',
    application: 'Для нахождения потерянного, выхода из тупика',
    formula: 'يَا وَاجِدُ أَوْجِدْ لِي مَخْرَجًا'
  },
  {
    id: 'al-majid',
    nameAr: 'الْمَاجِدُ',
    transliteration: 'Аль-Маджид',
    meaning: 'Великодушный, Славный',
    application: 'При нужде в великодушии',
    formula: 'يَا مَاجِدُ تَمَجَّدْ عَلَيَّ'
  },
  {
    id: 'al-wahid',
    nameAr: 'الْوَاحِدُ',
    transliteration: 'Аль-Вахид',
    meaning: 'Единственный',
    application: 'Для единобожия, очищения сердца от ширка',
    formula: 'يَا وَاحِدُ أَحِّدْ قَلْبِي لَكَ'
  },
  {
    id: 'as-samad',
    nameAr: 'الصَّمَدُ',
    transliteration: 'Ас-Самад',
    meaning: 'Вечный, Необходимый',
    application: 'В основе рукъи — Аллах единственная опора',
    formula: 'يَا صَمَدُ أَنْتَ غَنِيٌّ عَنِّي وَأَنَا فَقِيرٌ إِلَيْكَ'
  },
  {
    id: 'al-qadir',
    nameAr: 'الْقَادِرُ',
    transliteration: 'Аль-Кадир',
    meaning: 'Всемощный',
    application: 'При ощущении бессилия, невозможности изменить ситуацию',
    formula: 'يَا قَادِرُ اقْدِرْ لِي عَلَى الْخَيْرِ'
  },
  {
    id: 'al-muqtadir',
    nameAr: 'الْمُقْتَدِرُ',
    transliteration: 'Аль-Муктадир',
    meaning: 'Обладающий полной мощью',
    application: 'Против сихра и одержимости — Аллах мощнее всего',
    formula: 'يَا مُقْتَدِرُ أَعِنِّي'
  },
  {
    id: 'al-muqaddim',
    nameAr: 'الْمُقَدِّمُ',
    transliteration: 'Аль-Мукаддим',
    meaning: 'Выдвигающий вперёд',
    application: 'При нужде в продвижении дела',
    formula: 'يَا مُقَدِّمُ قَدِّمْنِي'
  },
  {
    id: 'al-muakhkhir',
    nameAr: 'الْمُؤَخِّرُ',
    transliteration: 'Аль-Муаххир',
    meaning: 'Откладывающий',
    application: 'Для отсрочки беды, замедления вреда',
    formula: 'يَا مُؤَخِّرُ أَخِّرْ عَنِّي الشَّرَّ'
  },
  {
    id: 'al-awwal',
    nameAr: 'الْأَوَّلُ',
    transliteration: 'Аль-Авваль',
    meaning: 'Первый',
    application: 'Для таваккуля — Аллах был до всего',
    formula: 'يَا أَوَّلُ أَنْتَ قَبْلَ كُلِّ شَيْءٍ'
  },
  {
    id: 'al-akhir',
    nameAr: 'الْآخِرُ',
    transliteration: 'Аль-Ахир',
    meaning: 'Последний',
    application: 'Для таваккуля — Аллах останется после всего',
    formula: 'يَا آخِرُ أَنْتَ بَعْدَ كُلِّ شَيْءٍ'
  },
  {
    id: 'az-zahir',
    nameAr: 'الظَّاهِرُ',
    transliteration: 'Аз-Захир',
    meaning: 'Явный',
    application: 'Для открытия скрытого, раскрытия тайн сихра',
    formula: 'يَا ظَاهِرُ أَظْهِرِ الْحَقَّ'
  },
  {
    id: 'al-batin',
    nameAr: 'الْبَاطِنُ',
    transliteration: 'Аль-Батин',
    meaning: 'Скрытый',
    application: 'Аллах знает скрытое — взывать при тайных болях',
    formula: 'يَا بَاطِنُ اعْلَمْ حَالِي'
  },
  {
    id: 'al-wali',
    nameAr: 'الْوَالِي',
    transliteration: 'Аль-Вали',
    meaning: 'Управляющий',
    application: 'Для упования на управление Аллаха',
    formula: 'يَا وَالِي تَوَلَّ أَمْرِي'
  },
  {
    id: 'al-mutaali',
    nameAr: 'الْمُتَعَالِي',
    transliteration: 'Аль-Мутаали',
    meaning: 'Превознесённый над всем',
    application: 'Для осознания величия Аллаха при слабости',
    formula: 'يَا مُتَعَالِي أَعِنِّي'
  },
  {
    id: 'al-barr',
    nameAr: 'الْبَرُّ',
    transliteration: 'Аль-Барр',
    meaning: 'Благодетельный',
    application: 'При нужде в доброте и заботе',
    formula: 'يَا بَرُّ أَبِرَّنِي'
  },
  {
    id: 'at-tawwab',
    nameAr: 'التَّوَّابُ',
    transliteration: 'Ат-Тавваб',
    meaning: 'Принимающий покаяние',
    application: 'При тяжёлых грехах, многократном покаянии',
    formula: 'يَا تَوَّابُ تُبْ عَلَيَّ'
  },
  {
    id: 'al-muntaqim',
    nameAr: 'الْمُنْتَقِمُ',
    transliteration: 'Аль-Мунтаким',
    meaning: 'Мстящий (за угнетённых)',
    application: 'При угнетении — Аллах отомстит за обиженного',
    formula: 'يَا مُنْتَقِمُ انْتَقِمْ لِي مِنَ الظَّالِمِينَ'
  },
  {
    id: 'al-afuw',
    nameAr: 'الْعَفُوُّ',
    transliteration: 'Аль-Афув',
    meaning: 'Снисходительный, Стирающий грехи',
    application: 'При покаянии, ночи Кадр, постоянно',
    formula: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي'
  },
  {
    id: 'ar-rauf',
    nameAr: 'الرَّؤُوفُ',
    transliteration: 'Ар-Рауф',
    meaning: 'Сострадательный',
    application: 'При боли и страдании — Аллах сострадает',
    formula: 'يَا رَؤُوفُ ارْأَفْ بِي'
  },
  {
    id: 'al-maalik',
    nameAr: 'مَالِكُ الْمُلْكِ',
    transliteration: 'Малик аль-Мульк',
    meaning: 'Владелец всего царства',
    application: 'При нужде в изменении обстоятельств — только Аллах управляет',
    formula: 'يَا مَالِكَ الْمُلْكِ أَعِنِّي'
  },
  {
    id: 'zul-jalal',
    nameAr: 'ذُو الْجَلَالِ وَالْإِكْرَامِ',
    transliteration: 'Зу-ль-Джаляль валь-Икрам',
    meaning: 'Обладатель величия и чести',
    application: 'Мощное имя для дуа — в конце рукъи',
    formula: 'يَا ذَا الْجَلَالِ وَالْإِكْرَامِ أَعِنِّي'
  },
  {
    id: 'al-muqsit',
    nameAr: 'الْمُقْسِطُ',
    transliteration: 'Аль-Мукситт',
    meaning: 'Справедливый',
    application: 'При несправедливости',
    formula: 'يَا مُقْسِطُ أَنْصِفْنِي'
  },
  {
    id: 'al-jami',
    nameAr: 'الْجَامِعُ',
    transliteration: 'Аль-Джамиь',
    meaning: 'Собирающий',
    application: 'При разлуке, разрушенных отношениях, сихре разделения',
    formula: 'يَا جَامِعُ اجْمَعْنِي بِمَنْ أُحِبُّ'
  },
  {
    id: 'al-ghani',
    nameAr: 'الْغَنِيُّ',
    transliteration: 'Аль-Ганий',
    meaning: 'Богатый, Самодостаточный',
    application: 'При бедности, для богатства духовного и мирского',
    formula: 'يَا غَنِيُّ أَغْنِنِي'
  },
  {
    id: 'al-mughni',
    nameAr: 'الْمُغْنِي',
    transliteration: 'Аль-Мугний',
    meaning: 'Обогащающий',
    application: 'При нужде в деньгах, ризке, блокировке средств',
    formula: 'يَا مُغْنِي أَغْنِنِي'
  },
  {
    id: 'al-mani',
    nameAr: 'الْمَانِعُ',
    transliteration: 'Аль-Маниь',
    meaning: 'Удерживающий, Защищающий',
    application: 'Для защиты от вреда, сихра, айна',
    formula: 'يَا مَانِعُ امْنَعْ عَنِّي الشَّرَّ'
  },
  {
    id: 'ad-darr',
    nameAr: 'الضَّارُّ',
    transliteration: 'Ад-Дарр',
    meaning: 'Попускающий вред',
    application: 'Осознавать — всё в руках Аллаха, любой вред по Его воле',
    formula: 'يَا اللَّهُ لَا ضَارَّ إِلَّا أَنْتَ'
  },
  {
    id: 'an-nafi',
    nameAr: 'النَّافِعُ',
    transliteration: 'Ан-Нафиь',
    meaning: 'Приносящий пользу',
    application: 'При лечении — только Аллах даёт пользу',
    formula: 'يَا نَافِعُ انْفَعْنِي'
  },
  {
    id: 'an-nur',
    nameAr: 'النُّورُ',
    transliteration: 'Ан-Нур',
    meaning: 'Свет',
    application: 'При духовной темноте, depression, закрытости сердца',
    formula: 'يَا نُورُ نَوِّرْ قَلْبِي'
  },
  {
    id: 'al-hadi',
    nameAr: 'الْهَادِي',
    transliteration: 'Аль-Хади',
    meaning: 'Ведущий прямым путём',
    application: 'При заблуждении, сомнениях, поиске пути',
    formula: 'يَا هَادِي اهْدِنِي'
  },
  {
    id: 'al-badi',
    nameAr: 'الْبَدِيعُ',
    transliteration: 'Аль-Бадиь',
    meaning: 'Создавший из ничего',
    application: 'При невозможных ситуациях — Аллах создаёт из ничего',
    formula: 'يَا بَدِيعَ السَّمَاوَاتِ وَالْأَرْضِ أَعِنِّي'
  },
  {
    id: 'al-baqi',
    nameAr: 'الْبَاقِي',
    transliteration: 'Аль-Баки',
    meaning: 'Вечный',
    application: 'Для утешения — всё кроме Аллаха исчезнет',
    formula: 'يَا بَاقِي أَبْقِنِي عَلَى طَاعَتِكَ'
  },
  {
    id: 'al-warith',
    nameAr: 'الْوَارِثُ',
    transliteration: 'Аль-Варис',
    meaning: 'Наследующий',
    application: 'Всё вернётся к Аллаху — таваккуль',
    formula: 'يَا وَارِثُ إِلَيْكَ الْمَصِيرُ'
  },
  {
    id: 'ar-rashid',
    nameAr: 'الرَّشِيدُ',
    transliteration: 'Ар-Рашид',
    meaning: 'Направляющий',
    application: 'При принятии решений, поиске правильного пути',
    formula: 'يَا رَشِيدُ أَرْشِدْنِي'
  },
  {
    id: 'as-sabur',
    nameAr: 'الصَّبُورُ',
    transliteration: 'Ас-Сабур',
    meaning: 'Терпеливый',
    application: 'При нужде в терпении, в длительном испытании',
    formula: 'يَا صَبُورُ أَعِنِّي عَلَى الصَّبْرِ'
  },
  {
    id: 'ash-shafi',
    nameAr: 'الشَّافِي',
    transliteration: 'Аш-Шафи',
    meaning: 'Исцеляющий',
    application: 'ГЛАВНОЕ имя для рукъи и исцеления — «нет исцеления кроме Твоего»',
    formula: 'اللَّهُمَّ رَبَّ النَّاسِ اشْفِ أَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ'
  }
];

// Поиск по атрибутам
export function searchAttributes(query: string): AllahAttribute[] {
  const q = query.toLowerCase();
  return ALLAH_ATTRIBUTES.filter(a =>
    a.transliteration.toLowerCase().includes(q) ||
    a.meaning.toLowerCase().includes(q) ||
    a.application.toLowerCase().includes(q)
  );
}

// Атрибуты для лечения
export const HEALING_ATTRIBUTES = ALLAH_ATTRIBUTES.filter(a =>
  ['ash-shafi', 'ar-rahman', 'ar-rahim', 'al-muhyi', 'al-qayyum', 'al-azim', 'al-mumin', 'an-nafi'].includes(a.id)
);

// Атрибуты для защиты
export const PROTECTION_ATTRIBUTES = ALLAH_ATTRIBUTES.filter(a =>
  ['al-hafiz', 'al-muhaymin', 'al-mumin', 'al-qahhar', 'al-mani', 'al-wakil'].includes(a.id)
);
