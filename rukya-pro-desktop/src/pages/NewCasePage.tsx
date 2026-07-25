import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, CheckCircle, Plus, X, User, Activity, FileText, Layers } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useAppStore } from '../store/useAppStore';
import { usePatientsStore } from '../store/usePatientsStore';
import { usePlansStore } from '../store/usePlansStore';
import { Button, Card, Input, Select, Badge, Chip, PageWrapper } from '../shared';
import { AnimatedProgress } from '../components/animations';
import { SYMPTOMS, getSymptomsByCategory } from '../data/knowledge';
import { PROGRAMS, getProgram } from '../data/programs';
import { getFormula } from '../data/formulas';
import { diagnose, CAUSE_COLORS, URGENCY_LABELS, type ExtendedDiagnosisResult } from '../engine/diagnosis';
import { buildPlan } from '../engine/plan-builder';
import type { Patient, PlanPhase } from '../types';

const STEPS = [
  { id: 1, label: 'Пациент',    icon: User },
  { id: 2, label: 'Симптомы',   icon: Activity },
  { id: 3, label: 'Диагноз',    icon: CheckCircle },
  { id: 4, label: 'Программа',  icon: FileText },
  { id: 5, label: 'Подтверждение', icon: Layers },
];

export function NewCasePage() {
  const { setCurrentPage, currentPatient, setCurrentPatient, addToast } = useAppStore();
  const { addPatient } = usePatientsStore();
  const { addPlan } = usePlansStore();

  const [step, setStep] = useState(currentPatient ? 2 : 1);
  const [isRunningDiagnosis, setIsRunningDiagnosis] = useState(false);

  // Step 1
  const [patientData, setPatientData] = useState<Partial<Patient>>({
    firstName: currentPatient?.firstName || '',
    lastName:  currentPatient?.lastName  || '',
    middleName: currentPatient?.middleName || '',
    gender: currentPatient?.gender || 'male',
    phone: currentPatient?.phone || '',
    birthDate: currentPatient?.birthDate || '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  // Step 2
  const [selectedSymptoms, setSelectedSymptoms] = useState<{ id: string; severity: number }[]>([]);
  const [activeCategory, setActiveCategory] = useState('physical');

  // Step 3
  const [diagnosis, setDiagnosis] = useState<ExtendedDiagnosisResult | null>(null);

  // Step 4
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [planName, setPlanName] = useState('');

  // ─────────────────────────────────────────────────────────────
  const categories = [
    { id: 'physical',  label: '🩺 Физические' },
    { id: 'emotional', label: '💭 Эмоциональные' },
    { id: 'spiritual', label: '🤲 Духовные' },
    { id: 'sleep',     label: '🌙 Сон' },
    { id: 'social',    label: '👥 Социальные' },
  ];

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev =>
      prev.find(s => s.id === id) ? prev.filter(s => s.id !== id) : [...prev, { id, severity: 3 }]
    );
  };

  const setSeverity = (id: string, v: number) =>
    setSelectedSymptoms(prev => prev.map(s => s.id === id ? { ...s, severity: v } : s));

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !patientData.tags?.includes(tag)) {
      setPatientData(d => ({ ...d, tags: [...(d.tags || []), tag] }));
      setTagInput('');
    }
  };

  // ─── Step handlers ────────────────────────────────────────────
  const handleStep1 = async () => {
    if (!patientData.firstName || !patientData.lastName) {
      addToast({ message: 'Заполните имя и фамилию', type: 'error' }); return;
    }
    if (currentPatient) { setStep(2); return; }
    const p = await addPatient(patientData as Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>);
    setCurrentPatient(p);
    addToast({ message: 'Пациент добавлен', type: 'success' });
    setStep(2);
  };

  const handleStep2 = () => {
    if (selectedSymptoms.length === 0) {
      addToast({ message: 'Выберите хотя бы один симптом', type: 'warning' }); return;
    }
    // Run diagnosis automatically
    setIsRunningDiagnosis(true);
    setTimeout(() => {
      const result = diagnose({
        patientId: currentPatient?.id || '',
        symptoms: selectedSymptoms.map(s => ({
          symptomId: s.id, severity: s.severity as any, recordedAt: new Date().toISOString()
        }))
      });
      setDiagnosis(result);
      setIsRunningDiagnosis(false);
      // Auto-select best program
      const primaryCause = result.primaryCause?.causeId || 'universal';
      const causeProgMap: Record<string, string> = {
        ain: 'ain_basic', sihr: 'sihr_standard', mass: 'mass_standard',
        hasad: 'hasad_basic', jinn: 'mass_standard', nafs: 'spiritual_development',
      };
      setSelectedProgramId(causeProgMap[primaryCause] || 'universal_cleansing');
      setStep(3);
    }, 900);
  };

  const handleStep4 = async () => {
    if (!currentPatient) { addToast({ message: 'Пациент не найден', type: 'error' }); return; }
    const prog = getProgram(selectedProgramId);
    if (!prog) { addToast({ message: 'Выберите программу', type: 'error' }); return; }

    let plan;
    if (diagnosis) {
      plan = buildPlan({ patientId: currentPatient.id, diagnosis });
      if (selectedProgramId !== (plan as any).programId) {
        // Use selected program phases instead
        const phases: PlanPhase[] = prog.phases.map(ph => ({
          id: nanoid(), name: ph.name, description: ph.description,
          startDay: ph.startDay, endDay: ph.endDay, completed: false,
          steps: ph.formulaIds.map(fid => {
            const f = getFormula(fid);
            return { id: nanoid(), formulaId: fid, formula: f, timeOfDay: 'any' as const, repeats: f?.repeats || 1, method: f?.method || 'recite_patient', completed: false };
          })
        }));
        plan = { ...plan, phases, totalDays: prog.duration, name: planName || prog.name };
      }
    } else {
      const phases: PlanPhase[] = prog.phases.map(ph => ({
        id: nanoid(), name: ph.name, description: ph.description,
        startDay: ph.startDay, endDay: ph.endDay, completed: false,
        steps: ph.formulaIds.map(fid => {
          const f = getFormula(fid);
          return { id: nanoid(), formulaId: fid, formula: f, timeOfDay: 'any' as const, repeats: f?.repeats || 1, method: f?.method || 'recite_patient', completed: false };
        })
      }));
      plan = {
        patientId: currentPatient.id, diagnosisId: nanoid(), name: planName || prog.name,
        startDate: new Date().toISOString(), status: 'active' as const,
        phases, totalDays: prog.duration, source: 'template' as const
      };
    }

    const { id: _id, createdAt: _ca, updatedAt: _ua, ...planData } = plan as any;
    await addPlan({ ...planData, name: planName || plan.name });
    addToast({ message: 'План создан! 🎉', type: 'success' });
    setCurrentPage('patient-detail');
  };

  // ─── Progress bar ─────────────────────────────────────────────
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <PageWrapper>
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => setCurrentPage('dashboard')} icon={<ArrowLeft size={18} />}>Отмена</Button>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map(s => (
              <div key={s.id} className="flex flex-col items-center gap-1">
                <motion.div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  animate={{
                    backgroundColor: step > s.id ? 'var(--color-success)' : step === s.id ? 'var(--color-primary)' : 'var(--color-border)',
                    color: step >= s.id ? 'white' : 'var(--color-text-secondary)'
                  }}
                  transition={{ duration: 0.2 }}>
                  {step > s.id ? <CheckCircle size={14} /> : s.id}
                </motion.div>
                <span className="text-xs hidden sm:block" style={{ color: step === s.id ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
            <motion.div className="h-full rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}
              animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Step 1: Patient ───────────────────────────────────── */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <Card>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><User size={20} /> Данные пациента</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input label="Фамилия *" value={patientData.lastName || ''} onChange={v => setPatientData(d => ({ ...d, lastName: v }))} />
                  <Input label="Имя *"     value={patientData.firstName || ''} onChange={v => setPatientData(d => ({ ...d, firstName: v }))} />
                  <Input label="Отчество"  value={patientData.middleName || ''} onChange={v => setPatientData(d => ({ ...d, middleName: v }))} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Select label="Пол" value={patientData.gender || 'male'} onChange={v => setPatientData(d => ({ ...d, gender: v as any }))}
                    options={[{ value: 'male', label: '♂ Мужской' }, { value: 'female', label: '♀ Женский' }]} />
                  <Input label="Телефон" value={patientData.phone || ''} onChange={v => setPatientData(d => ({ ...d, phone: v }))} placeholder="+7..." />
                  <Input label="Дата рождения" type="date" value={patientData.birthDate || ''} onChange={v => setPatientData(d => ({ ...d, birthDate: v }))} />
                </div>
                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Теги</label>
                  <div className="flex gap-2 mb-2">
                    <input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Добавить тег..."
                      onKeyDown={e => e.key === 'Enter' && addTag()}
                      className="input flex-1" />
                    <Button variant="secondary" size="sm" onClick={addTag} icon={<Plus size={14} />}>Добавить</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(patientData.tags || []).map(tag => (
                      <Chip key={tag} label={tag} selected onRemove={() => setPatientData(d => ({ ...d, tags: (d.tags||[]).filter(t => t !== tag) }))} />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleStep1} icon={<ChevronRight size={18} />}>Далее</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ─── Step 2: Symptoms ──────────────────────────────────── */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <Card>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Activity size={20} /> Симптомы</h2>
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                {categories.map(cat => (
                  <Chip key={cat.id} label={cat.label} selected={activeCategory === cat.id} onClick={() => setActiveCategory(cat.id)} />
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={activeCategory} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {getSymptomsByCategory(activeCategory).map(sym => {
                    const sel = selectedSymptoms.find(s => s.id === sym.id);
                    return (
                      <motion.button key={sym.id} whileTap={{ scale: 0.97 }}
                        onClick={() => toggleSymptom(sym.id)}
                        className={`p-3 rounded-xl text-left text-sm transition-colors border-2 ${sel ? 'text-white' : 'hover:border-[var(--color-primary)]'}`}
                        style={{
                          backgroundColor: sel ? 'var(--color-primary)' : 'var(--color-surface)',
                          borderColor: sel ? 'var(--color-primary)' : 'var(--color-border)'
                        }}>
                        <p className="font-medium leading-snug">{sym.name}</p>
                        {sel && (
                          <div className="flex gap-0.5 mt-2">
                            {[1,2,3,4,5].map(lvl => (
                              <button key={lvl} onClick={e => { e.stopPropagation(); setSeverity(sym.id, lvl); }}
                                className="flex-1 h-1.5 rounded-full transition-colors"
                                style={{ backgroundColor: sel.severity >= lvl ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)' }} />
                            ))}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              {selectedSymptoms.length > 0 && (
                <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                  <p className="text-sm font-medium mb-2">Выбрано: {selectedSymptoms.length} симптомов</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSymptoms.map(s => {
                      const sym = SYMPTOMS.find(sy => sy.id === s.id);
                      return sym ? (
                        <motion.span key={s.id} layout initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white"
                          style={{ backgroundColor: 'var(--color-primary)' }}>
                          {sym.name} <span className="opacity-70">({s.severity}/5)</span>
                          <button onClick={() => toggleSymptom(s.id)} className="ml-0.5 hover:opacity-70"><X size={11} /></button>
                        </motion.span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)} icon={<ArrowLeft size={18} />}>Назад</Button>
                <Button onClick={handleStep2} loading={isRunningDiagnosis}
                  icon={isRunningDiagnosis ? undefined : <Activity size={18} />}>
                  {isRunningDiagnosis ? 'Анализирую...' : 'Диагностировать'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ─── Step 3: Diagnosis Result ──────────────────────────── */}
        {step === 3 && diagnosis && (
          <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><CheckCircle size={20} /> Результат диагностики</h2>
                <div className="flex items-center gap-2 text-sm px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: `${diagnosis.urgencyLevel === 'high' ? 'var(--color-error)' : diagnosis.urgencyLevel === 'medium' ? 'var(--color-warning)' : 'var(--color-success)'}20`,
                    color: diagnosis.urgencyLevel === 'high' ? 'var(--color-error)' : diagnosis.urgencyLevel === 'medium' ? 'var(--color-warning)' : 'var(--color-success)'
                  }}>
                  Срочность: {URGENCY_LABELS[diagnosis.urgencyLevel]}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: 'var(--color-text-secondary)' }}>Уверенность</span>
                  <span className="font-bold">{diagnosis.confidence}%</span>
                </div>
                <AnimatedProgress value={diagnosis.confidence} />
              </div>

              <div className="space-y-3">
                {diagnosis.causes.length === 0 && (
                  <p style={{ color: 'var(--color-text-secondary)' }}>Недостаточно симптомов для точной диагностики. Добавьте больше симптомов.</p>
                )}
                {diagnosis.causes.map((cause, i) => (
                  <motion.div key={cause.causeId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: `${CAUSE_COLORS[cause.causeId] || '#666'}15`, border: `1px solid ${CAUSE_COLORS[cause.causeId] || '#666'}30` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CAUSE_COLORS[cause.causeId] || '#666' }} />
                        <span className="font-semibold text-sm">{cause.name}</span>
                        {i === 0 && <Badge variant="warning">Основная</Badge>}
                      </div>
                      <span className="font-bold text-sm" style={{ color: CAUSE_COLORS[cause.causeId] || '#666' }}>{cause.confidence}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: CAUSE_COLORS[cause.causeId] || '#666' }}
                        initial={{ width: 0 }} animate={{ width: `${cause.confidence}%` }} transition={{ duration: 0.7, delay: i * 0.1 }} />
                    </div>
                    {cause.affectedOrgans.length > 0 && (
                      <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                        Затронуто: {cause.affectedOrgans.join(', ')}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>

            {diagnosis.recommendations.length > 0 && (
              <Card>
                <h3 className="font-semibold mb-3">💡 Рекомендации</h3>
                <ul className="space-y-2">
                  {diagnosis.recommendations.map((rec, i) => (
                    <motion.li key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                      className="flex gap-2 text-sm">
                      <CheckCircle size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--color-success)' }} />
                      {rec}
                    </motion.li>
                  ))}
                </ul>
              </Card>
            )}

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)} icon={<ArrowLeft size={18} />}>Назад</Button>
              <Button onClick={() => setStep(4)} icon={<ChevronRight size={18} />}>Выбрать программу</Button>
            </div>
          </motion.div>
        )}

        {/* ─── Step 4: Program Selection ─────────────────────────── */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <Card>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileText size={20} /> Выбор программы</h2>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {PROGRAMS.map(prog => (
                  <motion.div key={prog.id} whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.997 }}
                    onClick={() => setSelectedProgramId(prog.id)}
                    className="p-4 rounded-xl border-2 cursor-pointer transition-colors"
                    style={{
                      borderColor: selectedProgramId === prog.id ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: selectedProgramId === prog.id ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)' : 'transparent'
                    }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">{prog.name}</p>
                          {selectedProgramId === prog.id && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <CheckCircle size={16} style={{ color: 'var(--color-primary)' }} />
                            </motion.div>
                          )}
                        </div>
                        <p className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>{prog.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {prog.tags.slice(0, 4).map((t, i) => <Badge key={i} variant="info">{t}</Badge>)}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant={prog.difficulty === 'easy' ? 'success' : prog.difficulty === 'medium' ? 'warning' : 'error'}>
                          {prog.difficulty === 'easy' ? 'Лёгкая' : prog.difficulty === 'medium' ? 'Средняя' : 'Сложная'}
                        </Badge>
                        <p className="text-sm mt-1 font-semibold">{prog.duration} дней</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="ghost" onClick={() => setStep(3)} icon={<ArrowLeft size={18} />}>Назад</Button>
                <Button onClick={() => setStep(5)} disabled={!selectedProgramId} icon={<ChevronRight size={18} />}>Далее</Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ─── Step 5: Confirm ───────────────────────────────────── */}
        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <Card>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Layers size={20} /> Подтверждение</h2>
              <div className="space-y-4">
                <Input label="Название плана" value={planName} onChange={setPlanName}
                  placeholder={getProgram(selectedProgramId)?.name || 'Введите название...'} />

                <div className="grid sm:grid-cols-2 gap-3">
                  {currentPatient && (
                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-secondary)' }}>Пациент</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: 'var(--color-primary)' }}>
                          {currentPatient.firstName[0]}{currentPatient.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold">{currentPatient.lastName} {currentPatient.firstName}</p>
                          {currentPatient.phone && <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{currentPatient.phone}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedProgramId && (
                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-secondary)' }}>Программа</p>
                      <p className="font-semibold">{getProgram(selectedProgramId)?.name}</p>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {getProgram(selectedProgramId)?.duration} дней · {getProgram(selectedProgramId)?.phases.length} фаз
                      </p>
                    </div>
                  )}
                </div>

                {diagnosis?.primaryCause && (
                  <div className="p-3 rounded-xl flex items-center gap-3"
                    style={{ backgroundColor: `${CAUSE_COLORS[diagnosis.primaryCause.causeId]}15`, border: `1px solid ${CAUSE_COLORS[diagnosis.primaryCause.causeId]}30` }}>
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CAUSE_COLORS[diagnosis.primaryCause.causeId] }} />
                    <div>
                      <p className="text-sm font-medium">Диагноз: {diagnosis.primaryCause.name}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Уверенность: {diagnosis.confidence}%</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(4)} icon={<ArrowLeft size={18} />}>Назад</Button>
                  <Button onClick={handleStep4} icon={<CheckCircle size={18} />}>Создать план</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
