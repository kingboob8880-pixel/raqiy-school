// ==========================================
// RUKYA PRO - Auto Plan Builder
// Строит план по диагнозу автоматически
// ==========================================

import { PROGRAMS } from '../data/programs';
import { getFormula } from '../data/formulas';
import type { TreatmentPlan, PlanPhase, PlanStep } from '../types';
import type { ExtendedDiagnosisResult } from './diagnosis';
import { nanoid } from 'nanoid';

// Маппинг причины → рекомендованные программы
const CAUSE_PROGRAM_MAP: Record<string, string[]> = {
  ain:      ['ain_basic', 'ain_advanced', 'hasad_basic'],
  sihr:     ['sihr_standard', 'sihr_separation', 'universal_cleansing'],
  mass:     ['mass_standard', 'universal_cleansing'],
  hasad:    ['hasad_basic', 'ain_basic'],
  jinn:     ['mass_standard', 'sleep_problems'],
  nafs:     ['spiritual_development', 'depression_support'],
  physical: ['universal_cleansing', 'headache_relief']
};

// Маппинг причины → специфические формулы
const CAUSE_FORMULA_MAP: Record<string, string[]> = {
  ain:  ['ain_verse_1', 'ain_prophet_dua', 'fatiha', 'ayat_kursi', 'falaq', 'nas'],
  sihr: ['sihr_verse_1', 'sihr_verse_2', 'sihr_verse_3', 'fatiha', 'ayat_kursi'],
  mass: ['mass_verse_1', 'ayat_kursi', 'fatiha', 'muawwidhatayn'],
  hasad:['ain_verse_1', 'falaq', 'fatiha', 'tawakkul'],
  jinn: ['ayat_kursi', 'nas', 'falaq', 'muawwidhatayn'],
  nafs: ['tawbah', 'tawakkul', 'sabr_dua', 'fatiha'],
};

export interface BuildPlanInput {
  patientId: string;
  diagnosis: ExtendedDiagnosisResult;
  preferredDuration?: 7 | 14 | 21;
}

export function buildPlan(input: BuildPlanInput): TreatmentPlan {
  const { patientId, diagnosis, preferredDuration = 7 } = input;
  const primaryCause = diagnosis.primaryCause;

  // 1. Подбираем программу
  const programIds = primaryCause
    ? (CAUSE_PROGRAM_MAP[primaryCause.causeId] || ['universal_cleansing'])
    : ['universal_cleansing'];

  const program = PROGRAMS.find(p => p.id === programIds[0] && p.duration <= preferredDuration)
    || PROGRAMS.find(p => p.id === programIds[0])
    || PROGRAMS.find(p => p.id === 'universal_cleansing')!;

  // 2. Формулы для причины
  const causeFormulas = primaryCause
    ? (CAUSE_FORMULA_MAP[primaryCause.causeId] || [])
    : [];

  // 3. Строим фазы
  const phases: PlanPhase[] = program.phases.map(phase => {
    // Объединяем формулы программы и специфические для причины
    const allFormulaIds = [...new Set([...phase.formulaIds, ...causeFormulas.slice(0, 3)])];

    const steps: PlanStep[] = allFormulaIds.map(formulaId => {
      const formula = getFormula(formulaId);
      return {
        id: nanoid(),
        formulaId,
        formula,
        timeOfDay: getOptimalTimeOfDay(formulaId, phase.startDay),
        repeats: formula?.repeats || 1,
        method: formula?.method || 'recite_patient',
        duration: formula?.duration,
        notes: '',
        completed: false
      };
    });

    return {
      id: nanoid(),
      name: phase.name,
      description: phase.description,
      startDay: phase.startDay,
      endDay: phase.endDay,
      steps,
      completed: false
    };
  });

  // 4. Подбираем название
  const planName = buildPlanName(diagnosis);

  return {
    id: nanoid(),
    patientId,
    diagnosisId: diagnosis.id,
    name: planName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startDate: new Date().toISOString(),
    status: 'draft',
    phases,
    totalDays: program.duration,
    notes: buildPlanNotes(diagnosis),
    source: 'auto'
  };
}

function getOptimalTimeOfDay(formulaId: string, startDay: number): 'morning' | 'afternoon' | 'evening' | 'night' | 'any' {
  if (formulaId.includes('morning') || formulaId === 'morning_adhkar') return 'morning';
  if (formulaId.includes('evening') || formulaId === 'evening_adhkar') return 'evening';
  if (startDay <= 3) return 'morning';
  return 'any';
}

function buildPlanName(diagnosis: ExtendedDiagnosisResult): string {
  if (!diagnosis.primaryCause) return 'Индивидуальный план лечения';
  const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  return `Лечение: ${diagnosis.primaryCause.name} · ${date}`;
}

function buildPlanNotes(diagnosis: ExtendedDiagnosisResult): string {
  const lines: string[] = ['Автоматически сформированный план на основе диагностики.'];

  if (diagnosis.causes.length > 0) {
    lines.push(`\nОбнаруженные причины:`);
    diagnosis.causes.forEach(c => {
      lines.push(`• ${c.name} — уверенность ${c.confidence}%`);
    });
  }

  if (diagnosis.recommendations.length > 0) {
    lines.push(`\nРекомендации:`);
    diagnosis.recommendations.forEach(r => lines.push(`• ${r}`));
  }

  return lines.join('\n');
}
