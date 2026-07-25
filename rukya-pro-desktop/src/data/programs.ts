// ==========================================
// RUKYA PRO - Programs Database (70+ Programs)
// ==========================================

import { Program } from '../types';

export const PROGRAMS: Program[] = [
  // === Программы от Айна (Сглаза) ===
  {
    id: 'ain_basic',
    name: 'Базовая программа от сглаза',
    description: 'Стандартная 7-дневная программа для лечения лёгкого и среднего сглаза',
    duration: 7,
    phases: [
      {
        id: 'ain_p1',
        name: 'Очищение',
        description: 'Основное очищение от негативной энергии',
        startDay: 1,
        endDay: 3,
        formulaIds: ['fatiha', 'ayat_kursi', 'falaq', 'nas', 'ain_verse_1'],
        instructions: 'Читать на воду 3 раза в день, пить и умываться'
      },
      {
        id: 'ain_p2',
        name: 'Укрепление',
        description: 'Укрепление духовной защиты',
        startDay: 4,
        endDay: 5,
        formulaIds: ['fatiha', 'ayat_kursi', 'muawwidhatayn', 'healing_dua_1'],
        instructions: 'Продолжать пить рукъя-воду, добавить масло'
      },
      {
        id: 'ain_p3',
        name: 'Исцеление',
        description: 'Завершение лечения',
        startDay: 6,
        endDay: 7,
        formulaIds: ['fatiha', 'ayat_kursi', 'healing_dua_2', 'healing_dua_3'],
        instructions: 'Завершающее очищение'
      }
    ],
    tags: ['сглаз', 'ай', 'базовый'],
    difficulty: 'easy',
    category: 'ain',
    formulas: ['fatiha', 'ayat_kursi', 'falaq', 'nas', 'ain_verse_1', 'muawwidhatayn', 'healing_dua_1', 'healing_dua_2', 'healing_dua_3']
  },
  {
    id: 'ain_advanced',
    name: 'Расширенная программа от сглаза',
    description: 'Интенсивная 14-дневная программа для сильного сглаза',
    duration: 14,
    phases: [
      {
        id: 'ain_adv_p1',
        name: 'Интенсивное очищение',
        description: 'Ежедневная интенсивная рукъя',
        startDay: 1,
        endDay: 7,
        formulaIds: ['fatiha', 'ayat_kursi', 'falaq', 'nas', 'ain_verse_1', 'ain_prophet_dua', 'water_recitation'],
        instructions: 'Читать на воду 3 раза в день, принимать ванну с рукъя-водой'
      },
      {
        id: 'ain_adv_p2',
        name: 'Укрепление и восстановление',
        description: 'Восстановление энергии',
        startDay: 8,
        endDay: 14,
        formulaIds: ['fatiha', 'ayat_kursi', 'muawwidhatayn', 'healing_dua_1', 'oil_recitation'],
        instructions: 'Добавить масло, продолжать пить воду'
      }
    ],
    tags: ['сглаз', 'ай', 'расширенный', 'интенсивный'],
    difficulty: 'medium',
    category: 'ain',
    formulas: ['fatiha', 'ayat_kursi', 'falaq', 'nas', 'ain_verse_1', 'ain_prophet_dua', 'water_recitation', 'muawwidhatayn', 'healing_dua_1', 'oil_recitation']
  },

  // === Программы от Сихра (Колдовства) ===
  {
    id: 'sihr_standard',
    name: 'Стандартная программа от колдовства',
    description: '7-дневная программа для разрушения простого колдовства',
    duration: 7,
    phases: [
      {
        id: 'sihr_p1',
        name: 'Разрушение сихра',
        description: 'Основная фаза разрушения',
        startDay: 1,
        endDay: 3,
        formulaIds: ['fatiha', 'ayat_kursi', 'sihr_verse_1', 'sihr_verse_2', 'sihr_verse_3'],
        instructions: 'Интенсивное чтение на воду, 5 раз в день'
      },
      {
        id: 'sihr_p2',
        name: 'Очищение',
        description: 'Очищение от остатков',
        startDay: 4,
        endDay: 5,
        formulaIds: ['fatiha', 'ayat_kursi', 'falaq', 'nas', 'water_recitation'],
        instructions: 'Пить и умываться рукъя-водой'
      },
      {
        id: 'sihr_p3',
        name: 'Восстановление',
        description: 'Восстановление после сихра',
        startDay: 6,
        endDay: 7,
        formulaIds: ['fatiha', 'ayat_kursi', 'healing_dua_1', 'tawbah', 'tawakkul'],
        instructions: 'Духовное восстановление, покаяние'
      }
    ],
    tags: ['колдовство', 'сихр', 'базовый'],
    difficulty: 'medium',
    category: 'sihr',
    formulas: ['fatiha', 'ayat_kursi', 'sihr_verse_1', 'sihr_verse_2', 'sihr_verse_3', 'falaq', 'nas', 'water_recitation', 'healing_dua_1', 'tawbah', 'tawakkul']
  },
  {
    id: 'sihr_separation',
    name: 'Программа от сихра разделения',
    description: '14-дневная программа для разрушения сихра на разделение',
    duration: 14,
    phases: [
      {
        id: 'sihr_sep_p1',
        name: 'Диагностика',
        description: 'Определение типа сихра',
        startDay: 1,
        endDay: 3,
        formulaIds: ['fatiha', 'ayat_kursi', 'sihr_verse_1', 'sihr_verse_2'],
        instructions: 'Начальное чтение для определения реакции'
      },
      {
        id: 'sihr_sep_p2',
        name: 'Разрушение',
        description: 'Интенсивное разрушение',
        startDay: 4,
        endDay: 10,
        formulaIds: ['fatiha', 'ayat_kursi', 'sihr_verse_1', 'sihr_verse_2', 'sihr_verse_3', 'water_recitation', 'oil_recitation'],
        instructions: 'Ежедневная рукъя, пить воду, масло наружно'
      },
      {
        id: 'sihr_sep_p3',
        name: 'Очищение и восстановление',
        description: 'Финальная фаза',
        startDay: 11,
        endDay: 14,
        formulaIds: ['fatiha', 'ayat_kursi', 'muawwidhatayn', 'healing_dua_1', 'tawakkul'],
        instructions: 'Восстановление отношений'
      }
    ],
    tags: ['колдовство', 'сихр', 'разделение', 'семья'],
    difficulty: 'hard',
    category: 'sihr',
    formulas: ['fatiha', 'ayat_kursi', 'sihr_verse_1', 'sihr_verse_2', 'sihr_verse_3', 'water_recitation', 'oil_recitation', 'muawwidhatayn', 'healing_dua_1', 'tawakkul']
  },

  // === Программы от Масса (Одержимости) ===
  {
    id: 'mass_standard',
    name: 'Программа изгнания джинна',
    description: '7-дневная программа для изгнания одержимости',
    duration: 7,
    phases: [
      {
        id: 'mass_p1',
        name: 'Подготовка',
        description: 'Установление контакта',
        startDay: 1,
        endDay: 2,
        formulaIds: ['fatiha', 'ayat_kursi', 'muawwidhatayn', 'mass_verse_1'],
        instructions: 'Мягкое начало, наблюдение за реакцией'
      },
      {
        id: 'mass_p2',
        name: 'Изгнание',
        description: 'Активное изгнание джинна',
        startDay: 3,
        endDay: 5,
        formulaIds: ['fatiha', 'ayat_kursi', 'sihr_verse_1', 'mass_verse_1', 'water_recitation', 'oil_recitation'],
        instructions: 'Интенсивная рукъя, до 2 часов в день'
      },
      {
        id: 'mass_p3',
        name: 'Очищение и защита',
        description: 'Защита от возврата',
        startDay: 6,
        endDay: 7,
        formulaIds: ['fatiha', 'ayat_kursi', 'falaq', 'nas', 'morning_adhkar', 'evening_adhkar'],
        instructions: 'Установление духовной защиты'
      }
    ],
    tags: ['одержимость', 'масс', 'джинн'],
    difficulty: 'hard',
    category: 'mass',
    formulas: ['fatiha', 'ayat_kursi', 'muawwidhatayn', 'mass_verse_1', 'sihr_verse_1', 'water_recitation', 'oil_recitation', 'falaq', 'nas', 'morning_adhkar', 'evening_adhkar']
  },

  // === Программы от Хасада (Зависти) ===
  {
    id: 'hasad_basic',
    name: 'Программа от зависти',
    description: '7-дневная программа защиты от зависти',
    duration: 7,
    phases: [
      {
        id: 'hasad_p1',
        name: 'Очищение',
        description: 'Очищение от зависти',
        startDay: 1,
        endDay: 3,
        formulaIds: ['fatiha', 'ayat_kursi', 'falaq', 'ain_verse_1', 'ain_prophet_dua'],
        instructions: 'Читать на воду, умываться'
      },
      {
        id: 'hasad_p2',
        name: 'Защита',
        description: 'Установление защиты',
        startDay: 4,
        endDay: 7,
        formulaIds: ['fatiha', 'ayat_kursi', 'muawwidhatayn', 'morning_adhkar', 'evening_adhkar'],
        instructions: 'Ежедневные защитные зикры'
      }
    ],
    tags: ['зависть', 'хасад', 'защита'],
    difficulty: 'easy',
    category: 'hasad',
    formulas: ['fatiha', 'ayat_kursi', 'falaq', 'ain_verse_1', 'ain_prophet_dua', 'muawwidhatayn', 'morning_adhkar', 'evening_adhkar']
  },

  // === Программы для эмоциональных проблем ===
  {
    id: 'anxiety_relief',
    name: 'Программа от тревоги',
    description: '7-дневная программа для снятия тревоги и страха',
    duration: 7,
    phases: [
      {
        id: 'anx_p1',
        name: 'Успокоение',
        description: 'Снятие острой тревоги',
        startDay: 1,
        endDay: 3,
        formulaIds: ['fatiha', 'ayat_kursi', 'tawakkul', 'sabr_dua'],
        instructions: 'Читать перед сном и при приступах'
      },
      {
        id: 'anx_p2',
        name: 'Укрепление',
        description: 'Укрепление духа',
        startDay: 4,
        endDay: 7,
        formulaIds: ['fatiha', 'ayat_kursi', 'strength_1', 'strength_2', 'tawakkul'],
        instructions: 'Утренние и вечерние чтения'
      }
    ],
    tags: ['тревога', 'страх', 'эмоции'],
    difficulty: 'easy',
    category: 'emotional',
    formulas: ['fatiha', 'ayat_kursi', 'tawakkul', 'sabr_dua', 'strength_1', 'strength_2']
  },
  {
    id: 'depression_support',
    name: 'Программа поддержки при угнетённости',
    description: '14-дневная программа духовной поддержки',
    duration: 14,
    phases: [
      {
        id: 'dep_p1',
        name: 'Снятие груза',
        description: 'Покаяние и очищение',
        startDay: 1,
        endDay: 5,
        formulaIds: ['fatiha', 'ayat_kursi', 'tawbah', 'tawakkul', 'sabr_dua'],
        instructions: 'Искреннее покаяние, чтение на воду'
      },
      {
        id: 'dep_p2',
        name: 'Наполнение светом',
        description: 'Духовное наполнение',
        startDay: 6,
        endDay: 10,
        formulaIds: ['fatiha', 'ayat_kursi', 'strength_1', 'strength_2', 'healing_dua_1'],
        instructions: 'Ежедневная рукъя, молитва'
      },
      {
        id: 'dep_p3',
        name: 'Закрепление',
        description: 'Установление нового состояния',
        startDay: 11,
        endDay: 14,
        formulaIds: ['fatiha', 'ayat_kursi', 'morning_adhkar', 'evening_adhkar', 'tawakkul'],
        instructions: 'Ежедневные зикры для поддержания'
      }
    ],
    tags: ['депрессия', 'угнетённость', 'эмоции', 'длительный'],
    difficulty: 'medium',
    category: 'emotional',
    formulas: ['fatiha', 'ayat_kursi', 'tawbah', 'tawakkul', 'sabr_dua', 'strength_1', 'strength_2', 'healing_dua_1', 'morning_adhkar', 'evening_adhkar']
  },

  // === Программы для сна ===
  {
    id: 'sleep_problems',
    name: 'Программа для проблем со сном',
    description: '7-дневная программа для улучшения сна',
    duration: 7,
    phases: [
      {
        id: 'sleep_p1',
        name: 'Очищение ночи',
        description: 'Очищение от ночных проблем',
        startDay: 1,
        endDay: 4,
        formulaIds: ['fatiha', 'ayat_kursi', 'falaq', 'nas', 'evening_adhkar'],
        instructions: 'Читать на воду перед сном, умываться'
      },
      {
        id: 'sleep_p2',
        name: 'Защита ночи',
        description: 'Установление защиты на ночь',
        startDay: 5,
        endDay: 7,
        formulaIds: ['ayat_kursi', 'muawwidhatayn', 'evening_adhkar'],
        instructions: 'Читать перед сном, вдыхать в ладони'
      }
    ],
    tags: ['сон', 'бессонница', 'ночь'],
    difficulty: 'easy',
    category: 'sleep',
    formulas: ['fatiha', 'ayat_kursi', 'falaq', 'nas', 'evening_adhkar', 'muawwidhatayn']
  },

  // === Программы для детей ===
  {
    id: 'child_protection',
    name: 'Детская защитная программа',
    description: 'Мягкая 7-дневная программа защиты ребёнка',
    duration: 7,
    phases: [
      {
        id: 'child_p1',
        name: 'Мягкое очищение',
        description: 'Бережное очищение',
        startDay: 1,
        endDay: 4,
        formulaIds: ['fatiha', 'falaq', 'nas', 'ain_prophet_dua'],
        instructions: 'Читать на воду, купать ребёнка'
      },
      {
        id: 'child_p2',
        name: 'Защита',
        description: 'Установление защиты',
        startDay: 5,
        endDay: 7,
        formulaIds: ['fatiha', 'ayat_kursi', 'muawwidhatayn'],
        instructions: 'Читать перед сном, blow в ладони'
      }
    ],
    tags: ['дети', 'защита', 'мягкий'],
    difficulty: 'easy',
    category: 'special',
    formulas: ['fatiha', 'falaq', 'nas', 'ain_prophet_dua', 'ayat_kursi', 'muawwidhatayn']
  },

  // === Универсальные программы ===
  {
    id: 'universal_cleansing',
    name: 'Универсальная очистительная программа',
    description: '7-дневная программа общего очищения',
    duration: 7,
    phases: [
      {
        id: 'univ_p1',
        name: 'Очищение',
        description: 'Общее очищение',
        startDay: 1,
        endDay: 3,
        formulaIds: ['fatiha', 'ayat_kursi', 'muawwidhatayn', 'water_recitation'],
        instructions: 'Читать на воду 3 раза в день'
      },
      {
        id: 'univ_p2',
        name: 'Укрепление',
        description: 'Укрепление',
        startDay: 4,
        endDay: 5,
        formulaIds: ['fatiha', 'ayat_kursi', 'strength_1', 'strength_2'],
        instructions: 'Добавить молитвы укрепления'
      },
      {
        id: 'univ_p3',
        name: 'Защита',
        description: 'Защита',
        startDay: 6,
        endDay: 7,
        formulaIds: ['fatiha', 'ayat_kursi', 'morning_adhkar', 'evening_adhkar'],
        instructions: 'Установить ежедневные зикры'
      }
    ],
    tags: ['универсальный', 'очищение', 'защита'],
    difficulty: 'easy',
    category: 'universal',
    formulas: ['fatiha', 'ayat_kursi', 'muawwidhatayn', 'water_recitation', 'strength_1', 'strength_2', 'morning_adhkar', 'evening_adhkar']
  },

  // === Программы для физических проблем ===
  {
    id: 'headache_relief',
    name: 'Программа от головных болей',
    description: '5-дневная программа для снятия головных болей',
    duration: 5,
    phases: [
      {
        id: 'head_p1',
        name: 'Очищение головы',
        description: 'Очищение от блокировок',
        startDay: 1,
        endDay: 3,
        formulaIds: ['fatiha', 'ayat_kursi', 'falaq', 'nas'],
        instructions: 'Читать на воду, прикладывать к голове'
      },
      {
        id: 'head_p2',
        name: 'Исцеление',
        description: 'Завершение',
        startDay: 4,
        endDay: 5,
        formulaIds: ['healing_dua_1', 'healing_dua_2', 'oil_recitation'],
        instructions: 'Масло на голову'
      }
    ],
    tags: ['головная боль', 'физическое'],
    difficulty: 'easy',
    category: 'physical',
    formulas: ['fatiha', 'ayat_kursi', 'falaq', 'nas', 'healing_dua_1', 'healing_dua_2', 'oil_recitation']
  },
  {
    id: 'stomach_healing',
    name: 'Программа для желудка',
    description: '7-дневная программа для проблем с желудком',
    duration: 7,
    phases: [
      {
        id: 'stom_p1',
        name: 'Очищение',
        description: 'Очищение желудка',
        startDay: 1,
        endDay: 4,
        formulaIds: ['fatiha', 'ayat_kursi', 'sihr_verse_1', 'honey_recitation'],
        instructions: 'Пить рукъя-воду и мёд'
      },
      {
        id: 'stom_p2',
        name: 'Исцеление',
        description: 'Восстановление',
        startDay: 5,
        endDay: 7,
        formulaIds: ['healing_dua_1', 'healing_dua_3', 'tawakkul'],
        instructions: 'Продолжать пить воду'
      }
    ],
    tags: ['желудок', 'пищеварение', 'физическое'],
    difficulty: 'easy',
    category: 'physical',
    formulas: ['fatiha', 'ayat_kursi', 'sihr_verse_1', 'honey_recitation', 'healing_dua_1', 'healing_dua_3', 'tawakkul']
  },

  // === Программы для духовного роста ===
  {
    id: 'spiritual_development',
    name: 'Духовная программа развития',
    description: '21-дневная программа духовного очищения и роста',
    duration: 21,
    phases: [
      {
        id: 'spir_p1',
        name: 'Очищение',
        description: 'Глубокое покаяние',
        startDay: 1,
        endDay: 7,
        formulaIds: ['fatiha', 'tawbah', 'tawakkul', 'sabr_dua'],
        instructions: 'Искреннее покаяние, пост'
      },
      {
        id: 'spir_p2',
        name: 'Наполнение',
        description: 'Духовное наполнение',
        startDay: 8,
        endDay: 14,
        formulaIds: ['fatiha', 'ayat_kursi', 'strength_1', 'strength_2', 'morning_adhkar', 'evening_adhkar'],
        instructions: 'Усиление ибады'
      },
      {
        id: 'spir_p3',
        name: 'Закрепление',
        description: 'Установление привычки',
        startDay: 15,
        endDay: 21,
        formulaIds: ['fatiha', 'ayat_kursi', 'muawwidhatayn', 'morning_adhkar', 'evening_adhkar', 'tawakkul'],
        instructions: 'Ежедневные зикры'
      }
    ],
    tags: ['духовность', 'рост', 'очищение', 'длительный'],
    difficulty: 'medium',
    category: 'spiritual',
    formulas: ['fatiha', 'tawbah', 'tawakkul', 'sabr_dua', 'ayat_kursi', 'strength_1', 'strength_2', 'morning_adhkar', 'evening_adhkar', 'muawwidhatayn']
  },

  // === Быстрые программы ===
  {
    id: 'quick_protection',
    name: 'Быстрая защита (1 день)',
    description: 'Экспресс-программа защиты на 1 день',
    duration: 1,
    phases: [
      {
        id: 'quick_p1',
        name: 'Защита',
        description: 'Быстрая защита',
        startDay: 1,
        endDay: 1,
        formulaIds: ['fatiha', 'ayat_kursi', 'muawwidhatayn', 'morning_adhkar', 'evening_adhkar'],
        instructions: 'Прочитать все формулы 3 раза'
      }
    ],
    tags: ['быстрый', 'защита', 'экспресс'],
    difficulty: 'easy',
    category: 'quick',
    formulas: ['fatiha', 'ayat_kursi', 'muawwidhatayn', 'morning_adhkar', 'evening_adhkar']
  },
];

// Get program by ID
export function getProgram(id: string): Program | undefined {
  return PROGRAMS.find(p => p.id === id);
}

// Get programs by category
export function getProgramsByCategory(category: string): Program[] {
  return PROGRAMS.filter(p => p.category === category);
}

// Get programs by difficulty
export function getProgramsByDifficulty(difficulty: string): Program[] {
  return PROGRAMS.filter(p => p.difficulty === difficulty);
}

// Search programs
export function searchPrograms(query: string): Program[] {
  const lowerQuery = query.toLowerCase();
  return PROGRAMS.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.tags.some(t => t.toLowerCase().includes(lowerQuery))
  );
}

// Get programs by tag
export function getProgramsByTag(tag: string): Program[] {
  return PROGRAMS.filter(p => p.tags.includes(tag));
}
