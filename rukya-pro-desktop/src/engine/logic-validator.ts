// ==========================================
// RUKYA PRO - Treatment Plan Logic Validator
// Проверяет план на перегрузку, пропуски и логические конфликты
// ==========================================

import type { TreatmentPlan, PlanPhase, PlanStep } from '../types';
import { getFormula } from '../data/formulas';

export type ValidationSeverity = 'info' | 'warning' | 'error';

export interface PlanValidationIssue {
  id: string;
  severity: ValidationSeverity;
  title: string;
  message: string;
  phaseId?: string;
  stepId?: string;
  recommendation?: string;
}

export interface PlanValidationResult {
  isValid: boolean;
  score: number;
  issues: PlanValidationIssue[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}

const CORE_FORMULAS = ['fatiha', 'ayat_kursi'];
const PROTECTION_FORMULAS = ['falaq', 'nas', 'muawwidhatayn'];
const SIHR_FORMULAS = ['sihr_verse_1', 'sihr_verse_2', 'sihr_verse_3'];
const MASS_FORMULAS = ['mass_verse_1'];

export function validatePlan(plan: TreatmentPlan): PlanValidationResult {
  const issues: PlanValidationIssue[] = [];
  const allSteps = plan.phases.flatMap(phase => phase.steps.map(step => ({ phase, step })));

  validateStructure(plan, issues);
  validateFormulaExistence(allSteps, issues);
  validateCoreProtection(allSteps.map(x => x.step), issues);
  validateIntensity(plan, issues);
  validateDuplicates(plan, issues);
  validatePhaseOrder(plan.phases, issues);
  validateMethodBalance(plan, issues);
  validateDiagnosisCoverage(plan, allSteps.map(x => x.step), issues);

  const errors = issues.filter(i => i.severity === 'error').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;
  const info = issues.filter(i => i.severity === 'info').length;

  const score = Math.max(0, 100 - errors * 25 - warnings * 10 - info * 3);

  return {
    isValid: errors === 0,
    score,
    issues,
    summary: { errors, warnings, info }
  };
}

function addIssue(issues: PlanValidationIssue[], issue: Omit<PlanValidationIssue, 'id'>) {
  issues.push({ id: `${issue.severity}-${issues.length + 1}`, ...issue });
}

function validateStructure(plan: TreatmentPlan, issues: PlanValidationIssue[]) {
  if (!plan.phases.length) {
    addIssue(issues, {
      severity: 'error',
      title: 'План пустой',
      message: 'В плане нет фаз лечения.',
      recommendation: 'Добавьте минимум одну фазу и хотя бы одну формулу.'
    });
    return;
  }

  for (const phase of plan.phases) {
    if (phase.startDay > phase.endDay) {
      addIssue(issues, {
        severity: 'error',
        title: 'Неверный диапазон дней',
        message: `В фазе «${phase.name}» день начала больше дня окончания.`,
        phaseId: phase.id,
        recommendation: 'Исправьте startDay/endDay фазы.'
      });
    }

    if (!phase.steps.length) {
      addIssue(issues, {
        severity: 'warning',
        title: 'Пустая фаза',
        message: `Фаза «${phase.name}» не содержит шагов.`,
        phaseId: phase.id,
        recommendation: 'Добавьте формулы или удалите пустую фазу.'
      });
    }
  }
}

function validateFormulaExistence(
  allSteps: { phase: PlanPhase; step: PlanStep }[],
  issues: PlanValidationIssue[]
) {
  for (const { phase, step } of allSteps) {
    const formula = step.formula || getFormula(step.formulaId);
    if (!formula) {
      addIssue(issues, {
        severity: 'error',
        title: 'Формула не найдена',
        message: `В фазе «${phase.name}» есть ссылка на неизвестную формулу: ${step.formulaId}.`,
        phaseId: phase.id,
        stepId: step.id,
        recommendation: 'Удалите шаг или замените его существующей формулой.'
      });
    }

    if (step.repeats <= 0) {
      addIssue(issues, {
        severity: 'error',
        title: 'Неверное число повторов',
        message: `У шага ${step.formulaId} число повторов меньше 1.`,
        phaseId: phase.id,
        stepId: step.id,
        recommendation: 'Установите минимум 1 повтор.'
      });
    }
  }
}

function validateCoreProtection(steps: PlanStep[], issues: PlanValidationIssue[]) {
  const ids = steps.map(step => step.formulaId);
  for (const core of CORE_FORMULAS) {
    if (!ids.includes(core)) {
      addIssue(issues, {
        severity: 'warning',
        title: 'Отсутствует базовая формула',
        message: core === 'fatiha'
          ? 'В плане нет суры Аль-Фатиха.'
          : 'В плане нет Аят аль-Курси.',
        recommendation: 'Добавьте базовую защитную формулу в первую фазу.'
      });
    }
  }

  const hasProtection = ids.some(id => PROTECTION_FORMULAS.includes(id));
  if (!hasProtection) {
    addIssue(issues, {
      severity: 'warning',
      title: 'Недостаточно защиты',
      message: 'В плане нет Аль-Фаляк, Ан-Нас или Муаввизатейн.',
      recommendation: 'Добавьте защитные суры в первую или последнюю фазу.'
    });
  }
}

function validateIntensity(plan: TreatmentPlan, issues: PlanValidationIssue[]) {
  for (const phase of plan.phases) {
    const days = Math.max(1, phase.endDay - phase.startDay + 1);
    const totalRepeats = phase.steps.reduce((sum, step) => sum + step.repeats, 0);
    const stepsPerDay = phase.steps.length / days;
    const repeatsPerDay = totalRepeats / days;

    if (phase.steps.length > 12) {
      addIssue(issues, {
        severity: 'warning',
        title: 'Фаза перегружена',
        message: `Фаза «${phase.name}» содержит ${phase.steps.length} шагов.`,
        phaseId: phase.id,
        recommendation: 'Разделите фазу или уберите второстепенные формулы.'
      });
    }

    if (stepsPerDay > 6) {
      addIssue(issues, {
        severity: 'warning',
        title: 'Слишком много шагов в день',
        message: `В фазе «${phase.name}» в среднем ${stepsPerDay.toFixed(1)} шагов в день.`,
        phaseId: phase.id,
        recommendation: 'Снизьте нагрузку, особенно для ослабленного пациента.'
      });
    }

    if (repeatsPerDay > 80) {
      addIssue(issues, {
        severity: 'warning',
        title: 'Высокая интенсивность повторов',
        message: `В фазе «${phase.name}» в среднем ${Math.round(repeatsPerDay)} повторов в день.`,
        phaseId: phase.id,
        recommendation: 'Проверьте переносимость пациентом и уменьшите повторы при слабости.'
      });
    }
  }
}

function validateDuplicates(plan: TreatmentPlan, issues: PlanValidationIssue[]) {
  for (const phase of plan.phases) {
    const seen = new Map<string, number>();
    for (const step of phase.steps) {
      seen.set(step.formulaId, (seen.get(step.formulaId) || 0) + 1);
    }

    for (const [formulaId, count] of seen.entries()) {
      if (count >= 3) {
        const formula = getFormula(formulaId);
        addIssue(issues, {
          severity: 'info',
          title: 'Повтор формулы',
          message: `Формула «${formula?.name || formulaId}» встречается в фазе «${phase.name}» ${count} раза.`,
          phaseId: phase.id,
          recommendation: 'Проверьте, это намеренное усиление или дублирование.'
        });
      }
    }
  }
}

function validatePhaseOrder(phases: PlanPhase[], issues: PlanValidationIssue[]) {
  const sorted = [...phases].sort((a, b) => a.startDay - b.startDay);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (curr.startDay <= prev.endDay) {
      addIssue(issues, {
        severity: 'info',
        title: 'Фазы пересекаются',
        message: `Фазы «${prev.name}» и «${curr.name}» имеют пересечение по дням.`,
        phaseId: curr.id,
        recommendation: 'Проверьте, это допустимое наложение или ошибка расписания.'
      });
    }

    if (curr.startDay > prev.endDay + 1) {
      addIssue(issues, {
        severity: 'info',
        title: 'Пауза между фазами',
        message: `Между «${prev.name}» и «${curr.name}» есть разрыв в днях.`,
        phaseId: curr.id,
        recommendation: 'Если пауза не задумана, сделайте фазы последовательными.'
      });
    }
  }
}

function validateMethodBalance(plan: TreatmentPlan, issues: PlanValidationIssue[]) {
  const methodCounts: Record<string, number> = {};
  for (const phase of plan.phases) {
    for (const step of phase.steps) {
      methodCounts[step.method] = (methodCounts[step.method] || 0) + 1;
    }
  }

  const waterLike = (methodCounts.recite_water || 0) + (methodCounts.blow_water || 0);
  const oilLike = methodCounts.recite_oil || 0;
  const internal = waterLike + (methodCounts.recite_honey || 0);

  if (oilLike > internal + 3) {
    addIssue(issues, {
      severity: 'info',
      title: 'Преобладает наружное лечение',
      message: 'В плане много чтения на масло и мало внутреннего приёма/воды.',
      recommendation: 'Проверьте баланс: вода/мёд внутрь и масло наружно.'
    });
  }

  if (waterLike === 0 && plan.phases.some(p => p.steps.length > 0)) {
    addIssue(issues, {
      severity: 'info',
      title: 'Нет рукъи на воду',
      message: 'В плане нет чтения или дуновения на воду.',
      recommendation: 'Для большинства программ вода является мягкой базовой поддержкой.'
    });
  }
}

function validateDiagnosisCoverage(
  plan: TreatmentPlan,
  steps: PlanStep[],
  issues: PlanValidationIssue[]
) {
  const ids = new Set(steps.map(step => step.formulaId));
  const notes = (plan.notes || '').toLowerCase();

  if (notes.includes('сихр')) {
    const hasSihr = SIHR_FORMULAS.some(id => ids.has(id));
    if (!hasSihr) {
      addIssue(issues, {
        severity: 'warning',
        title: 'Диагноз сихр без аятов разрушения',
        message: 'В примечаниях указан сихр, но нет специальных аятов разрушения сихра.',
        recommendation: 'Добавьте sihr_verse_1, sihr_verse_2 или sihr_verse_3.'
      });
    }
  }

  if (notes.includes('масс') || notes.includes('одерж')) {
    const hasMass = MASS_FORMULAS.some(id => ids.has(id));
    if (!hasMass) {
      addIssue(issues, {
        severity: 'warning',
        title: 'Диагноз масс без формул от джиннов',
        message: 'В примечаниях указан масс/одержимость, но нет специальных формул от джиннов.',
        recommendation: 'Добавьте mass_verse_1 или усиленные защитные формулы.'
      });
    }
  }
}

export function moveStepWithinPhase(plan: TreatmentPlan, phaseId: string, fromIndex: number, toIndex: number): TreatmentPlan {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return plan;

  return {
    ...plan,
    updatedAt: new Date().toISOString(),
    phases: plan.phases.map(phase => {
      if (phase.id !== phaseId) return phase;
      if (fromIndex >= phase.steps.length || toIndex >= phase.steps.length) return phase;
      const steps = [...phase.steps];
      const [moved] = steps.splice(fromIndex, 1);
      steps.splice(toIndex, 0, moved);
      return { ...phase, steps };
    })
  };
}