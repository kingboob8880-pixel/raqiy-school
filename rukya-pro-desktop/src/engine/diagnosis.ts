// ==========================================
// RUKYA PRO - Diagnosis Engine (Rule-Based)
// ==========================================

import { CAUSES, SYMPTOMS } from '../data/knowledge';
import type { DiagnosisResult, DiagnosedCause, SymptomEntry } from '../types';
import { nanoid } from 'nanoid';

interface RuleWeight {
  causeId: string;
  weight: number;
}

// Таблица весов: симптом → какие причины он указывает и с каким весом
const SYMPTOM_CAUSE_WEIGHTS: Record<string, RuleWeight[]> = {
  // Айн (сглаз)
  headache:            [{ causeId: 'ain', weight: 0.6 }, { causeId: 'sihr', weight: 0.3 }, { causeId: 'mass', weight: 0.2 }],
  eye_pain:            [{ causeId: 'ain', weight: 0.8 }, { causeId: 'hasad', weight: 0.4 }],
  dizziness:           [{ causeId: 'ain', weight: 0.5 }, { causeId: 'sihr', weight: 0.3 }],
  skin_rash:           [{ causeId: 'ain', weight: 0.6 }, { causeId: 'sihr', weight: 0.2 }],
  vision_blur:         [{ causeId: 'ain', weight: 0.7 }],
  sudden_weakness:     [{ causeId: 'ain', weight: 0.7 }, { causeId: 'sihr', weight: 0.4 }],
  nausea:              [{ causeId: 'ain', weight: 0.5 }, { causeId: 'sihr', weight: 0.4 }],
  itching:             [{ causeId: 'ain', weight: 0.5 }],

  // Сихр (колдовство)
  insomnia:            [{ causeId: 'sihr', weight: 0.7 }, { causeId: 'mass', weight: 0.5 }, { causeId: 'jinn', weight: 0.4 }],
  nightmare:           [{ causeId: 'sihr', weight: 0.7 }, { causeId: 'mass', weight: 0.6 }, { causeId: 'jinn', weight: 0.5 }],
  relationship_problems:[{ causeId: 'sihr', weight: 0.8 }, { causeId: 'hasad', weight: 0.5 }],
  family_issues:       [{ causeId: 'sihr', weight: 0.7 }, { causeId: 'hasad', weight: 0.5 }],
  stomach_pain:        [{ causeId: 'sihr', weight: 0.6 }, { causeId: 'ain', weight: 0.3 }],
  bloating:            [{ causeId: 'sihr', weight: 0.6 }],
  appetite_loss:       [{ causeId: 'sihr', weight: 0.5 }, { causeId: 'mass', weight: 0.3 }],
  work_difficulty:     [{ causeId: 'sihr', weight: 0.7 }, { causeId: 'hasad', weight: 0.5 }],
  back_pain:           [{ causeId: 'sihr', weight: 0.5 }],
  joint_pain:          [{ causeId: 'sihr', weight: 0.4 }],

  // Масс (одержимость)
  sleep_paralysis:     [{ causeId: 'mass', weight: 0.9 }, { causeId: 'jinn', weight: 0.7 }, { causeId: 'sihr', weight: 0.4 }],
  mood_swings:         [{ causeId: 'mass', weight: 0.7 }, { causeId: 'sihr', weight: 0.4 }],
  anger:               [{ causeId: 'mass', weight: 0.6 }, { causeId: 'sihr', weight: 0.3 }],
  confusion:           [{ causeId: 'mass', weight: 0.8 }, { causeId: 'sihr', weight: 0.4 }],
  fear:                [{ causeId: 'mass', weight: 0.6 }, { causeId: 'jinn', weight: 0.5 }],
  night_fear:          [{ causeId: 'mass', weight: 0.7 }, { causeId: 'jinn', weight: 0.6 }],
  sleepwalking:        [{ causeId: 'mass', weight: 0.8 }, { causeId: 'jinn', weight: 0.6 }],
  body_pain:           [{ causeId: 'mass', weight: 0.5 }, { causeId: 'sihr', weight: 0.4 }],

  // Хасад (зависть)
  depression:          [{ causeId: 'hasad', weight: 0.6 }, { causeId: 'sihr', weight: 0.4 }, { causeId: 'nafs', weight: 0.4 }],
  sadness:             [{ causeId: 'hasad', weight: 0.5 }, { causeId: 'nafs', weight: 0.4 }],
  hopelessness:        [{ causeId: 'hasad', weight: 0.5 }, { causeId: 'nafs', weight: 0.5 }],
  isolation:           [{ causeId: 'hasad', weight: 0.5 }, { causeId: 'sihr', weight: 0.4 }],

  // Джинн
  waswasa:             [{ causeId: 'jinn', weight: 0.8 }, { causeId: 'mass', weight: 0.5 }, { causeId: 'nafs', weight: 0.4 }],
  evil_thoughts:       [{ causeId: 'jinn', weight: 0.6 }, { causeId: 'nafs', weight: 0.5 }],
  chest_tightness:     [{ causeId: 'jinn', weight: 0.5 }, { causeId: 'sihr', weight: 0.4 }],
  heart_pain:          [{ causeId: 'jinn', weight: 0.4 }, { causeId: 'sihr', weight: 0.3 }],
  palpitations:        [{ causeId: 'jinn', weight: 0.4 }, { causeId: 'mass', weight: 0.4 }],

  // Духовные
  prayer_difficulty:   [{ causeId: 'nafs', weight: 0.6 }, { causeId: 'sihr', weight: 0.4 }, { causeId: 'jinn', weight: 0.3 }],
  quran_avoidance:     [{ causeId: 'sihr', weight: 0.7 }, { causeId: 'mass', weight: 0.6 }, { causeId: 'nafs', weight: 0.3 }],
  spiritual_emptiness: [{ causeId: 'nafs', weight: 0.7 }, { causeId: 'hasad', weight: 0.3 }],
  doubts_faith:        [{ causeId: 'nafs', weight: 0.6 }, { causeId: 'jinn', weight: 0.4 }],
  anxiety:             [{ causeId: 'nafs', weight: 0.4 }, { causeId: 'jinn', weight: 0.3 }, { causeId: 'sihr', weight: 0.3 }],
  irritability:        [{ causeId: 'mass', weight: 0.5 }, { causeId: 'sihr', weight: 0.3 }],
};

// Симптомы-маркеры с очень высоким весом (красные флаги)
const RED_FLAG_SYMPTOMS: Record<string, string[]> = {
  sleep_paralysis: ['mass', 'jinn'],
  quran_avoidance: ['sihr', 'mass'],
  sleepwalking:    ['mass'],
  relationship_problems: ['sihr'],
  conflict:        ['sihr'],
};

export interface DiagnosisInput {
  patientId: string;
  symptoms: SymptomEntry[];
}

export interface ExtendedDiagnosisResult extends DiagnosisResult {
  primaryCause: DiagnosedCause | null;
  recommendations: string[];
  urgencyLevel: 'low' | 'medium' | 'high';
}

// Главная функция диагностики
export function diagnose(input: DiagnosisInput): ExtendedDiagnosisResult {
  const { patientId, symptoms } = input;

  if (symptoms.length === 0) {
    return emptyDiagnosis(patientId);
  }

  // Накапливаем веса по причинам
  const causeScores: Record<string, number> = {
    ain: 0, sihr: 0, mass: 0, hasad: 0, jinn: 0, nafs: 0, physical: 0
  };

  // Симптомы с тяжестью > 0
  const activeSymptoms = symptoms.filter(s => s.severity > 0);
  
  for (const entry of activeSymptoms) {
    const weights = SYMPTOM_CAUSE_WEIGHTS[entry.symptomId] || [];
    const severityMultiplier = 0.5 + (entry.severity / 5) * 0.5; // 0.5–1.0

    for (const w of weights) {
      causeScores[w.causeId] = (causeScores[w.causeId] || 0) + w.weight * severityMultiplier;
    }

    // Красные флаги — добавляем бонус
    const redFlags = RED_FLAG_SYMPTOMS[entry.symptomId] || [];
    for (const causeId of redFlags) {
      causeScores[causeId] = (causeScores[causeId] || 0) + 0.5;
    }
  }

  // Если симптомов мало — добавляем физическую причину
  if (activeSymptoms.length <= 2) {
    causeScores.physical += 0.4;
  }

  // Нормализуем до 0–100
  const maxScore = Math.max(...Object.values(causeScores), 0.01);
  const normalizedScores = Object.fromEntries(
    Object.entries(causeScores).map(([k, v]) => [k, v / maxScore])
  );

  // Порог значимости — только причины с score >= 25%
  const THRESHOLD = 0.25;
  const significantCauses: DiagnosedCause[] = [];

  for (const cause of CAUSES) {
    const score = normalizedScores[cause.id] || 0;
    if (score >= THRESHOLD) {
      const affectedOrgans = findAffectedOrgans(symptoms, cause.id);
      significantCauses.push({
        causeId: cause.id,
        name: cause.name,
        confidence: Math.round(score * 100),
        affectedOrgans,
        subtypes: cause.subtypes
      });
    }
  }

  // Сортируем по уверенности
  significantCauses.sort((a, b) => b.confidence - a.confidence);

  // Общая уверенность диагноза
  const overallConfidence = significantCauses.length > 0
    ? Math.round(significantCauses[0].confidence * 0.7 + (activeSymptoms.length / 10) * 30)
    : 20;

  const primaryCause = significantCauses[0] || null;
  const recommendations = buildRecommendations(significantCauses, activeSymptoms.length);
  const urgencyLevel = determineUrgency(symptoms, significantCauses);

  return {
    id: nanoid(),
    patientId,
    date: new Date().toISOString(),
    symptoms,
    causes: significantCauses,
    confidence: Math.min(overallConfidence, 95),
    source: 'auto',
    primaryCause,
    recommendations,
    urgencyLevel
  };
}

function findAffectedOrgans(symptoms: SymptomEntry[], _causeId: string): string[] {
  const organs = new Set<string>();
  for (const entry of symptoms) {
    const symptomDef = SYMPTOMS.find(s => s.id === entry.symptomId);
    if (symptomDef?.organ && entry.severity > 0) {
      organs.add(symptomDef.organ);
    }
  }
  return Array.from(organs).slice(0, 4);
}

function buildRecommendations(causes: DiagnosedCause[], symptomCount: number): string[] {
  const recs: string[] = [];

  if (symptomCount < 3) {
    recs.push('Рекомендуется дополнительный сбор анамнеза — мало симптомов для точного диагноза');
  }

  for (const cause of causes.slice(0, 2)) {
    const def = CAUSES.find(c => c.id === cause.causeId);
    if (def) recs.push(def.treatmentApproach);
  }

  if (causes.some(c => c.causeId === 'physical')) {
    recs.push('Обязательно направить к врачу для исключения медицинских причин');
  }

  if (causes.some(c => c.causeId === 'mass' || c.causeId === 'sihr')) {
    recs.push('Требуется интенсивный курс рукъи — не менее 7 дней');
  }

  return recs;
}

function determineUrgency(symptoms: SymptomEntry[], causes: DiagnosedCause[]): 'low' | 'medium' | 'high' {
  const highSeverityCount = symptoms.filter(s => s.severity >= 4).length;
  const hasMass = causes.some(c => c.causeId === 'mass');
  const hasSihr = causes.some(c => c.causeId === 'sihr' && c.confidence > 60);

  if (hasMass || highSeverityCount >= 4) return 'high';
  if (hasSihr || highSeverityCount >= 2) return 'medium';
  return 'low';
}

function emptyDiagnosis(patientId: string): ExtendedDiagnosisResult {
  return {
    id: nanoid(),
    patientId,
    date: new Date().toISOString(),
    symptoms: [],
    causes: [],
    confidence: 0,
    source: 'auto',
    primaryCause: null,
    recommendations: ['Выберите симптомы для проведения диагностики'],
    urgencyLevel: 'low'
  };
}

// Метки для причин
export const CAUSE_LABELS: Record<string, string> = {
  ain: 'Айн (Сглаз)',
  sihr: 'Сихр (Колдовство)',
  mass: 'Масс (Одержимость)',
  hasad: 'Хасад (Зависть)',
  jinn: 'Джинн-привязка',
  nafs: 'Нафс (Духовное)',
  physical: 'Физическая причина'
};

export const CAUSE_COLORS: Record<string, string> = {
  ain:      '#3b82f6',
  sihr:     '#8b5cf6',
  mass:     '#ef4444',
  hasad:    '#f59e0b',
  jinn:     '#06b6d4',
  nafs:     '#10b981',
  physical: '#6b7280'
};

export const URGENCY_LABELS: Record<string, string> = {
  low:    'Низкая',
  medium: 'Средняя',
  high:   'Высокая'
};
