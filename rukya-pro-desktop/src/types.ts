// ==========================================
// RUKYA PRO - Complete Type Definitions
// ==========================================

// ---- Patient Types ----
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: string;
  gender: 'male' | 'female';
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  avatar?: string;
}

// ---- Symptom & Diagnosis Types ----
export type SymptomSeverity = 0 | 1 | 2 | 3 | 4 | 5;
export type SymptomCategory = 'physical' | 'emotional' | 'spiritual' | 'sleep' | 'social';

export interface Symptom {
  id: string;
  name: string;
  nameAr?: string;
  category: SymptomCategory;
  description?: string;
  severity: SymptomSeverity;
  organ?: string;
  isCustom?: boolean;
}

export interface SymptomEntry {
  symptomId: string;
  severity: SymptomSeverity;
  notes?: string;
  recordedAt: string;
}

export interface DiagnosisResult {
  id: string;
  patientId: string;
  date: string;
  symptoms: SymptomEntry[];
  causes: DiagnosedCause[];
  confidence: number;
  notes?: string;
  source: 'manual' | 'auto' | 'ai';
}

export interface DiagnosedCause {
  causeId: string;
  name: string;
  confidence: number;
  affectedOrgans: string[];
  subtypes: string[];
}

// ---- Formula Types ----
export interface Formula {
  id: string;
  name: string;
  arabic: string;
  transliteration: string;
  translation: string;
  source: string;
  repeats: number;
  method: FormulaMethod;
  tags: string[];
  organ?: string;
  cause?: string;
  duration?: string;
  notes?: string;
  time_of_day?: TimeOfDay;
}

export type FormulaMethod = 
  | 'recite_patient' 
  | 'recite_water' 
  | 'recite_oil' 
  | 'recite_honey' 
  | 'blow_water' 
  | 'blow_patient'
  | 'recite_breathing'
  | 'special';

// ---- Program Types ----
export interface Program {
  id: string;
  name: string;
  description: string;
  duration: number; // days
  phases: ProgramPhase[];
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  formulas: string[]; // formula IDs
  instructions?: string;
}

export interface ProgramPhase {
  id: string;
  name: string;
  description: string;
  startDay: number;
  endDay: number;
  formulaIds: string[];
  instructions?: string;
}

// ---- Treatment Plan Types ----
export interface TreatmentPlan {
  id: string;
  patientId: string;
  diagnosisId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate?: string;
  status: PlanStatus;
  phases: PlanPhase[];
  totalDays: number;
  notes?: string;
  source: 'manual' | 'auto' | 'template';
}

export type PlanStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface PlanPhase {
  id: string;
  name: string;
  description?: string;
  startDay: number;
  endDay: number;
  steps: PlanStep[];
  completed: boolean;
}

export interface PlanStep {
  id: string;
  formulaId: string;
  formula?: Formula;
  timeOfDay: TimeOfDay;
  repeats: number;
  method: FormulaMethod;
  duration?: string;
  notes?: string;
  completed: boolean;
  completedAt?: string;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'any';

// ---- Session & Monitoring Types ----
export interface Session {
  id: string;
  patientId: string;
  planId?: string;
  date: string;
  duration: number; // minutes
  notes: string;
  symptomsBefore: SymptomEntry[];
  symptomsAfter: SymptomEntry[];
  formulasUsed: string[];
  progress: number; // 0-100
  nextSessionDate?: string;
}

export interface MonitoringEntry {
  id: string;
  patientId: string;
  date: string;
  symptoms: SymptomEntry[];
  overallWellbeing: number; // 0-10
  sleepQuality: number; // 0-10
  moodScore: number; // 0-10
  notes?: string;
}

// ---- Export Types ----
export type ExportFormat = 'html' | 'pdf' | 'png';

export interface ExportSettings {
  format: ExportFormat;
  includeArabic: boolean;
  includeTranslation: boolean;
  includeNotes: boolean;
  themeId: string;
  pageSize: 'a4' | 'letter';
  language: 'ru' | 'ar' | 'en';
}

// ---- Import Types ----
export interface ImportResult {
  success: boolean;
  patients: number;
  plans: number;
  sessions: number;
  errors: string[];
}

export type ImportFormat = 'old_pwa' | 'json_bot' | 'quick_analysis';

// ---- Theme Types ----
export interface Theme {
  id: string;
  name: string;
  isDark: boolean;
  colors: ThemeColors;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

// ---- Settings Types ----
export interface AppSettings {
  pinHash?: string;
  pinEnabled: boolean;
  autoLockMinutes: number;
  currentThemeId: string;
  animationsEnabled: boolean;
  exportDefaults: Partial<ExportSettings>;
  lastBackup?: string;
}

// ---- Toast Types ----
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// ---- Error Log Types ----
export interface ErrorLog {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  context?: string;
  component?: string;
}

// ---- Statistics Types ----
export interface DashboardStats {
  totalPatients: number;
  activePlans: number;
  completedPlans: number;
  totalSessions: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'patient_added' | 'plan_created' | 'session_completed' | 'plan_completed';
  title: string;
  description: string;
  timestamp: string;
  entityId?: string;
}

// ---- Allah Attributes ----
export interface AllahAttribute {
  id: string;
  nameAr: string;
  transliteration: string;
  meaning: string;
  application: string;
  formula?: string;
}

// ---- Knowledge Base ----
export interface Organ {
  id: string;
  name: string;
  nameAr?: string;
  category: string;
  relatedSymptoms: string[];
}

export interface Cause {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  relatedSymptoms: string[];
  relatedOrgans: string[];
  subtypes: string[];
  treatmentApproach: string;
}

export interface Subtype {
  id: string;
  causeId: string;
  name: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
}
