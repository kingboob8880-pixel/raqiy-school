// ==========================================
// RUKYA PRO - Knowledge Base (Organs, Symptoms, Causes)
// ==========================================

import { Organ, Cause, Subtype, Symptom } from '../types';

// ---- Organs ----
export const ORGANS: Organ[] = [
  { id: 'head', name: 'Голова', nameAr: 'الرأس', category: 'upper', relatedSymptoms: ['headache', 'dizziness', 'pressure'] },
  { id: 'eyes', name: 'Глаза', nameAr: 'العينان', category: 'face', relatedSymptoms: ['eye_pain', 'vision_blur', 'eye_fatigue'] },
  { id: 'throat', name: 'Горло', nameAr: 'الحلق', category: 'neck', relatedSymptoms: ['throat_tightness', 'swallowing_difficulty'] },
  { id: 'chest', name: 'Грудь', nameAr: 'الصدر', category: 'torso', relatedSymptoms: ['chest_tightness', 'breathing_difficulty', 'heart_pain'] },
  { id: 'stomach', name: 'Желудок', nameAr: 'المعدة', category: 'torso', relatedSymptoms: ['stomach_pain', 'nausea', 'appetite_loss'] },
  { id: 'back', name: 'Спина', nameAr: 'الظهر', category: 'torso', relatedSymptoms: ['back_pain', 'spine_pain', 'muscle_tension'] },
  { id: 'heart', name: 'Сердце', nameAr: 'القلب', category: 'torso', relatedSymptoms: ['heart_pain', 'palpitations', 'anxiety'] },
  { id: 'liver', name: 'Печень', nameAr: 'الكبد', category: 'torso', relatedSymptoms: ['liver_pain', 'bitter_taste'] },
  { id: 'legs', name: 'Ноги', nameAr: 'الرجلان', category: 'lower', relatedSymptoms: ['leg_pain', 'leg_heaviness', 'numbness'] },
  { id: 'joints', name: 'Суставы', nameAr: 'المفاصل', category: 'body', relatedSymptoms: ['joint_pain', 'stiffness', 'swelling'] },
  { id: 'skin', name: 'Кожа', nameAr: 'الجلد', category: 'body', relatedSymptoms: ['skin_rash', 'itching', 'skin_discoloration'] },
  { id: 'brain', name: 'Мозг/Ум', nameAr: 'العقل', category: 'head', relatedSymptoms: ['confusion', 'memory_loss', 'concentration_loss'] },
];

// ---- Symptom Categories ----
export const SYMPTOMS: Symptom[] = [
  // Physical - Head
  { id: 'headache', name: 'Головная боль', category: 'physical', organ: 'head', severity: 0 },
  { id: 'dizziness', name: 'Головокружение', category: 'physical', organ: 'head', severity: 0 },
  { id: 'pressure', name: 'Давление в голове', category: 'physical', organ: 'head', severity: 0 },
  { id: 'head_heaviness', name: 'Тяжесть в голове', category: 'physical', organ: 'head', severity: 0 },
  
  // Physical - Eyes
  { id: 'eye_pain', name: 'Боль в глазах', category: 'physical', organ: 'eyes', severity: 0 },
  { id: 'vision_blur', name: 'Размытость зрения', category: 'physical', organ: 'eyes', severity: 0 },
  { id: 'eye_fatigue', name: 'Усталость глаз', category: 'physical', organ: 'eyes', severity: 0 },
  
  // Physical - Chest & Heart
  { id: 'chest_tightness', name: 'Стеснение в груди', category: 'physical', organ: 'chest', severity: 0 },
  { id: 'breathing_difficulty', name: 'Затруднённое дыхание', category: 'physical', organ: 'chest', severity: 0 },
  { id: 'heart_pain', name: 'Боль в сердце', category: 'physical', organ: 'heart', severity: 0 },
  { id: 'palpitations', name: 'Сердцебиение', category: 'physical', organ: 'heart', severity: 0 },
  
  // Physical - Stomach
  { id: 'stomach_pain', name: 'Боль в животе', category: 'physical', organ: 'stomach', severity: 0 },
  { id: 'nausea', name: 'Тошнота', category: 'physical', organ: 'stomach', severity: 0 },
  { id: 'appetite_loss', name: 'Потеря аппетита', category: 'physical', organ: 'stomach', severity: 0 },
  { id: 'bloating', name: 'Вздутие', category: 'physical', organ: 'stomach', severity: 0 },
  
  // Physical - Back & Body
  { id: 'back_pain', name: 'Боль в спине', category: 'physical', organ: 'back', severity: 0 },
  { id: 'spine_pain', name: 'Боль в позвоночнике', category: 'physical', organ: 'back', severity: 0 },
  { id: 'muscle_tension', name: 'Мышечное напряжение', category: 'physical', organ: 'back', severity: 0 },
  { id: 'body_pain', name: 'Ломота в теле', category: 'physical', organ: 'back', severity: 0 },
  
  // Physical - Legs & Joints
  { id: 'leg_pain', name: 'Боль в ногах', category: 'physical', organ: 'legs', severity: 0 },
  { id: 'leg_heaviness', name: 'Тяжесть в ногах', category: 'physical', organ: 'legs', severity: 0 },
  { id: 'numbness', name: 'Онемение', category: 'physical', organ: 'legs', severity: 0 },
  { id: 'joint_pain', name: 'Боль в суставах', category: 'physical', organ: 'joints', severity: 0 },
  { id: 'stiffness', name: 'Скованность', category: 'physical', organ: 'joints', severity: 0 },
  
  // Physical - Skin
  { id: 'skin_rash', name: 'Сыпь', category: 'physical', organ: 'skin', severity: 0 },
  { id: 'itching', name: 'Зуд', category: 'physical', organ: 'skin', severity: 0 },
  { id: 'skin_discoloration', name: 'Изменение цвета кожи', category: 'physical', organ: 'skin', severity: 0 },
  
  // Emotional
  { id: 'anxiety', name: 'Тревога', category: 'emotional', severity: 0 },
  { id: 'fear', name: 'Страх', category: 'emotional', severity: 0 },
  { id: 'depression', name: 'Угнетённость', category: 'emotional', severity: 0 },
  { id: 'anger', name: 'Гнев', category: 'emotional', severity: 0 },
  { id: 'irritability', name: 'Раздражительность', category: 'emotional', severity: 0 },
  { id: 'sadness', name: 'Грусть', category: 'emotional', severity: 0 },
  { id: 'hopelessness', name: 'Безнадёжность', category: 'emotional', severity: 0 },
  { id: 'mood_swings', name: 'Перепады настроения', category: 'emotional', severity: 0 },
  
  // Spiritual
  { id: 'prayer_difficulty', name: 'Трудность в молитве', category: 'spiritual', severity: 0 },
  { id: 'quran_avoidance', name: 'Избегание Корана', category: 'spiritual', severity: 0 },
  { id: 'spiritual_emptiness', name: 'Духовная пустота', category: 'spiritual', severity: 0 },
  { id: 'waswasa', name: 'Васвас (навязчивые мысли)', category: 'spiritual', severity: 0 },
  { id: 'evil_thoughts', name: 'Нечестивые мысли', category: 'spiritual', severity: 0 },
  { id: 'doubts_faith', name: 'Сомнения в вере', category: 'spiritual', severity: 0 },
  { id: 'nightmare', name: 'Кошмары', category: 'spiritual', severity: 0 },
  
  // Sleep
  { id: 'insomnia', name: 'Бессонница', category: 'sleep', severity: 0 },
  { id: 'sleep_paralysis', name: 'Сонный паралич', category: 'sleep', severity: 0 },
  { id: 'night_fear', name: 'Ночной страх', category: 'sleep', severity: 0 },
  { id: 'excessive_sleep', name: 'Чрезмерный сон', category: 'sleep', severity: 0 },
  { id: 'unrefreshing_sleep', name: 'Невосстанавливающий сон', category: 'sleep', severity: 0 },
  { id: 'sleepwalking', name: 'Лунатизм', category: 'sleep', severity: 0 },
  
  // Social
  { id: 'isolation', name: 'Изоляция', category: 'social', severity: 0 },
  { id: 'conflict', name: 'Конфликтность', category: 'social', severity: 0 },
  { id: 'relationship_problems', name: 'Проблемы в отношениях', category: 'social', severity: 0 },
  { id: 'work_difficulty', name: 'Трудности на работе', category: 'social', severity: 0 },
  { id: 'family_issues', name: 'Семейные проблемы', category: 'social', severity: 0 },
];

// ---- Causes ----
export const CAUSES: Cause[] = [
  {
    id: 'ain',
    name: 'Айн (Сглаз)',
    nameAr: 'العين',
    description: 'Вред, причинённый взглядом или завистью, часто без злого умысла',
    relatedSymptoms: ['headache', 'weakness', 'skin_rash', 'eye_pain', 'stomach_pain'],
    relatedOrgans: ['head', 'eyes', 'stomach'],
    subtypes: ['ain_envy', 'ain_admiration', 'ain_self'],
    treatmentApproach: 'Мытьё, чтение на воду, защитные аяты'
  },
  {
    id: 'sihr',
    name: 'Сихр (Колдовство)',
    nameAr: 'السحر',
    description: 'Магическое воздействие с целью причинения вреда',
    relatedSymptoms: ['headache', 'confusion', 'marriage_problems', 'separation_feeling', 'nightmare'],
    relatedOrgans: ['brain', 'heart', 'stomach'],
    subtypes: ['sihr_separation', 'sihr_block', 'sihr_love', 'sihr_illness'],
    treatmentApproach: 'Разрушение сихра, очищение, длительная программа'
  },
  {
    id: 'mass',
    name: 'Масс (Одержимость джинном)',
    nameAr: 'المس',
    description: 'Воздействие джинна на человека',
    relatedSymptoms: ['personality_change', 'voices', 'convulsions', 'blackout', 'strength_change'],
    relatedOrgans: ['brain', 'heart'],
    subtypes: ['mass_partial', 'mass_full', 'mass_sudden'],
    treatmentApproach: 'Интенсивная рукъя, укрепление веры, удаление джинна'
  },
  {
    id: 'hasad',
    name: 'Хасад (Зависть)',
    nameAr: 'الحسد',
    description: 'Злобное желание лишить блага другого человека',
    relatedSymptoms: ['depression', 'anxiety', 'loss_blessings', 'family_conflicts'],
    relatedOrgans: ['heart', 'brain'],
    subtypes: ['hasad_family', 'hasad_stranger', 'hasad_competitor'],
    treatmentApproach: 'Защитные молитвы, очищение, укрепление'
  },
  {
    id: 'jinn',
    name: 'Джинн-привязка',
    nameAr: 'التلبس',
    description: 'Присутствие джинна без полной одержимости',
    relatedSymptoms: ['whispers', 'sleep_paralysis', 'night_fear', 'movement_feeling'],
    relatedOrgans: ['brain', 'heart'],
    subtypes: ['jinn_attachment', 'jinn_following', 'jinn_guarding'],
    treatmentApproach: 'Очищение, изгнание, защита'
  },
  {
    id: 'nafs',
    name: 'Нафс (Эго/Душа)',
    nameAr: 'النفس',
    description: 'Проблемы, связанные с собственной душой и грехами',
    relatedSymptoms: ['guilt', 'shame', 'spiritual_emptiness', 'weakness'],
    relatedOrgans: ['heart', 'brain'],
    subtypes: ['nafs_sin', 'nafs_desire', 'nafs_pride'],
    treatmentApproach: 'Покаяние, духовное очищение, самодисциплина'
  },
  {
    id: 'physical',
    name: 'Физическая причина',
    nameAr: 'سبب طبيعي',
    description: 'Симптомы, требующие медицинского обследования',
    relatedSymptoms: ['chronic_pain', 'fatigue', 'weakness'],
    relatedOrgans: ['body'],
    subtypes: ['medical_condition', 'nutritional', 'lifestyle'],
    treatmentApproach: 'Направление к врачу + духовная поддержка'
  },
];

// ---- Subtypes ----
export const SUBTYPES: Subtype[] = [
  { id: 'ain_envy', causeId: 'ain', name: 'Сглаз от зависти', description: 'Вызван завистью другого человека', severity: 'moderate' },
  { id: 'ain_admiration', causeId: 'ain', name: 'Сглаз от восхищения', description: 'Вызван искренним восхищением', severity: 'mild' },
  { id: 'ain_self', causeId: 'ain', name: 'Самосглаз', description: 'Человек сглазил сам себя', severity: 'mild' },
  
  { id: 'sihr_separation', causeId: 'sihr', name: 'Сихр разделения', description: 'Для разлучения супругов или близких', severity: 'severe' },
  { id: 'sihr_block', causeId: 'sihr', name: 'Сихр блокировки', description: 'Блокирует ризк, брак, работу', severity: 'severe' },
  { id: 'sihr_love', causeId: 'sihr', name: 'Сихр приворота', description: 'Навязчивая привязанность', severity: 'moderate' },
  { id: 'sihr_illness', causeId: 'sihr', name: 'Сихр болезни', description: 'Вызывает болезни без медицинской причины', severity: 'severe' },
  
  { id: 'mass_partial', causeId: 'mass', name: 'Частичная одержимость', description: 'Джинн влияет периодически', severity: 'moderate' },
  { id: 'mass_full', causeId: 'mass', name: 'Полная одержимость', description: 'Полный контроль джинна', severity: 'severe' },
  { id: 'mass_sudden', causeId: 'mass', name: 'Внезапная одержимость', description: 'Внезапное начало воздействия', severity: 'severe' },
];

// Get symptoms by category
export function getSymptomsByCategory(category: string): Symptom[] {
  return SYMPTOMS.filter(s => s.category === category);
}

// Get organ by ID
export function getOrgan(id: string): Organ | undefined {
  return ORGANS.find(o => o.id === id);
}

// Get cause by ID
export function getCause(id: string): Cause | undefined {
  return CAUSES.find(c => c.id === id);
}

// Get subtypes for cause
export function getSubtypesForCause(causeId: string): Subtype[] {
  return SUBTYPES.filter(s => s.causeId === causeId);
}
