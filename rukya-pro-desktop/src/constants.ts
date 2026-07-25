// ==========================================
// RUKYA PRO - Global Constants
// ==========================================

// App Info
export const APP_NAME = 'ПЛАН ИСЦЕЛЕНИЯ';
export const APP_SUBNAME = 'Ash-Shifa';
export const APP_VERSION = '1.0.0';
export const APP_AUTHOR = 'Абу Мухаммад';

// PIN & Security
export const PIN_TIMEOUT = 5 * 60 * 1000; // 5 minutes in ms
export const PIN_LENGTH = 4;
export const MAX_PIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

// Storage Limits
export const MAX_ERROR_LOGS = 50;
export const MAX_HISTORY_ENTRIES = 1000;
export const MAX_PATIENTS = 500;
export const MAX_PLANS_PER_PATIENT = 10;

// Export Limits
export const EXPORT_LIMITS = {
  maxPages: 50,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  imageQuality: 0.92,
  pdfCompression: true
};

// UI Constants
export const ANIMATION_DURATION = 250; // ms
export const TOAST_DURATION = 4000; // ms
export const DEBOUNCE_DELAY = 300; // ms

// Plan Phases (Abu Muhammad Method)
export const PLAN_PHASES = {
  PHASE_1: { start: 1, end: 3, name: 'Очищение' },
  PHASE_2: { start: 4, end: 5, name: 'Укрепление' },
  PHASE_3: { start: 6, end: 7, name: 'Исцеление' }
};

// Symptom Severity Labels
export const SEVERITY_LABELS = {
  0: 'Отсутствует',
  1: 'Лёгкая',
  2: 'Умеренная',
  3: 'Средняя',
  4: 'Сильная',
  5: 'Тяжёлая'
};

// Time of Day Labels
export const TIME_OF_DAY_LABELS = {
  morning: 'Утро',
  afternoon: 'День',
  evening: 'Вечер',
  night: 'Ночь',
  any: 'Любое время'
};

// Plan Status Labels
export const PLAN_STATUS_LABELS = {
  draft: 'Черновик',
  active: 'Активный',
  paused: 'Приостановлен',
  completed: 'Завершён',
  cancelled: 'Отменён'
};

// Plan Status Colors
export const PLAN_STATUS_COLORS = {
  draft: 'gray',
  active: 'green',
  paused: 'yellow',
  completed: 'blue',
  cancelled: 'red'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'rukya_theme',
  PIN_HASH: 'rukya_pin_hash',
  PIN_ENABLED: 'rukya_pin_enabled',
  LAST_ACTIVITY: 'rukya_last_activity',
  SETTINGS: 'rukya_settings',
  ERRORS: 'rukya_errors'
};
