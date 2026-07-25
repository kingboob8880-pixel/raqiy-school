import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, CheckCircle, ChevronDown, ChevronUp, AlertCircle, Edit3, Save, RotateCcw } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { usePlansStore } from '../store/usePlansStore';
import { usePatientsStore } from '../store/usePatientsStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Button, Card, Badge, Modal, Select, ProgressBar, PageWrapper } from '../shared';
import { downloadHTML, downloadPDF, downloadTextReport } from '../utils/export';
import { getFormula } from '../data/formulas';
import { formatRU } from '../utils/date';
import type { ExportSettings } from '../types';

export function PlanBuilderPage() {
  const { setCurrentPage, currentPlan, addToast } = useAppStore();
  const { updatePlan } = usePlansStore();
  const { patients } = usePatientsStore();
  const { currentThemeId } = useSettingsStore();

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'html' | 'pdf' | 'text'>('html');
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [editingPlanName, setEditingPlanName] = useState(false);
  const [planNameDraft, setPlanNameDraft] = useState('');

  if (!currentPlan) return (
    <Card className="text-center py-16">
      <AlertCircle size={48} className="mx-auto mb-4 opacity-40" />
      <h3 className="text-lg font-medium mb-2">План не выбран</h3>
      <Button onClick={() => setCurrentPage('plans')} icon={<ArrowLeft size={18} />}>К списку</Button>
    </Card>
  );

  const patient = patients.find(p => p.id === currentPlan.patientId);
  const totalSteps = currentPlan.phases.reduce((s, ph) => s + ph.steps.length, 0);
  const completedSteps = currentPlan.phases.reduce((s, ph) => s + ph.steps.filter(st => st.completed).length, 0);
  const progress = totalSteps ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const toggleStep = (phaseId: string, stepId: string) => {
    const updated = {
      ...currentPlan,
      phases: currentPlan.phases.map(ph => {
        if (ph.id !== phaseId) return ph;
        const newSteps = ph.steps.map(st => st.id === stepId ? { ...st, completed: !st.completed } : st);
        return { ...ph, steps: newSteps, completed: newSteps.every(s => s.completed) };
      })
    };
    updatePlan(updated);
    useAppStore.getState().setCurrentPlan(updated);
  };

  const resetPlan = () => {
    const updated = {
      ...currentPlan,
      phases: currentPlan.phases.map(ph => ({
        ...ph, completed: false,
        steps: ph.steps.map(st => ({ ...st, completed: false }))
      }))
    };
    updatePlan(updated);
    useAppStore.getState().setCurrentPlan(updated);
    addToast({ message: 'Прогресс сброшен', type: 'info' });
  };

  const handleExport = async () => {
    if (!patient) { addToast({ message: 'Пациент не найден', type: 'error' }); return; }
    setExporting(true);
    const settings: ExportSettings = {
      format: exportFormat as any,
      includeArabic: true, includeTranslation: true, includeNotes: true,
      themeId: currentThemeId, pageSize: 'a4', language: 'ru'
    };
    try {
      if (exportFormat === 'html') downloadHTML(currentPlan, patient, settings);
      else if (exportFormat === 'pdf') await downloadPDF(currentPlan, patient, settings);
      else downloadTextReport(currentPlan, patient);
      addToast({ message: 'Документ экспортирован', type: 'success' });
      setShowExportModal(false);
    } catch { addToast({ message: 'Ошибка экспорта', type: 'error' }); }
    finally { setExporting(false); }
  };

  const statusVariant: Record<string, any> = {
    active: 'success', completed: 'info', paused: 'warning', draft: 'info', cancelled: 'error'
  };
  const statusLabel: Record<string, string> = {
    active: 'Активный', completed: 'Завершён', paused: 'Приостановлен', draft: 'Черновик', cancelled: 'Отменён'
  };

  return (
    <PageWrapper>
      {/* Back + Export */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setCurrentPage('plans')} icon={<ArrowLeft size={18} />}>Назад</Button>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={resetPlan} icon={<RotateCcw size={15} />}>Сброс</Button>
          <Button size="sm" onClick={() => setShowExportModal(true)} icon={<Download size={16} />}>Экспорт</Button>
        </div>
      </div>

      {/* Plan Header */}
      <Card>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            {editingPlanName ? (
              <div className="flex gap-2 items-center">
                <input value={planNameDraft} onChange={e => setPlanNameDraft(e.target.value)}
                  className="input text-xl font-semibold flex-1" autoFocus />
                <Button size="sm" onClick={() => {
                  const updated = { ...currentPlan, name: planNameDraft };
                  updatePlan(updated); useAppStore.getState().setCurrentPlan(updated);
                  setEditingPlanName(false); addToast({ message: 'Название обновлено', type: 'success' });
                }} icon={<Save size={14} />}>Сохранить</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{currentPlan.name}</h2>
                <button onClick={() => { setPlanNameDraft(currentPlan.name); setEditingPlanName(true); }}
                  className="p-1 rounded opacity-50 hover:opacity-100 transition-opacity"><Edit3 size={15} /></button>
              </div>
            )}
            <div className="flex flex-wrap gap-3 mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {patient && <span>👤 {patient.lastName} {patient.firstName}</span>}
              <span>📅 {formatRU(currentPlan.startDate)}</span>
              <span>⏱ {currentPlan.totalDays} дней</span>
            </div>
          </div>
          <Badge variant={statusVariant[currentPlan.status] || 'info'}>
            {statusLabel[currentPlan.status] || currentPlan.status}
          </Badge>
        </div>

        <div className="space-y-1">
          <ProgressBar value={completedSteps} max={totalSteps || 1} label={`Прогресс: ${completedSteps}/${totalSteps} шагов`} />
        </div>

        {progress === 100 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-3 rounded-xl text-center"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-success) 15%, transparent)', border: '1px solid var(--color-success)' }}>
            <p className="font-semibold" style={{ color: 'var(--color-success)' }}>🎉 Все шаги выполнены! Алхамдулиллях!</p>
          </motion.div>
        )}
      </Card>

      {/* Phases */}
      <div className="space-y-3">
        {currentPlan.phases.map((phase, phIdx) => {
          const phProgress = phase.steps.length
            ? Math.round((phase.steps.filter(s => s.completed).length / phase.steps.length) * 100) : 0;
          const isExpanded = expandedPhase === phase.id || expandedPhase === null;

          return (
            <Card key={phase.id}>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedPhase(isExpanded && expandedPhase === phase.id ? null : phase.id)}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${phase.completed ? 'bg-green-500' : ''}`}
                    style={phase.completed ? {} : { backgroundColor: 'var(--color-primary)' }}>
                    {phase.completed ? <CheckCircle size={18} /> : phIdx + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{phase.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      Дни {phase.startDay}–{phase.endDay} · {phProgress}% выполнено
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {phase.completed && <Badge variant="success">✓</Badge>}
                  {isExpanded ? <ChevronUp size={18} className="opacity-50" /> : <ChevronDown size={18} className="opacity-50" />}
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                    className="mt-4 space-y-2 overflow-hidden">

                    {phase.description && (
                      <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>{phase.description}</p>
                    )}

                    {phase.steps.map(step => {
                      const formula = step.formula || getFormula(step.formulaId);
                      if (!formula) return null;

                      return (
                        <motion.div key={step.id} layout
                          className="p-4 rounded-xl border-2 transition-all"
                          style={{
                            borderColor: step.completed ? 'var(--color-success)' : 'var(--color-border)',
                            backgroundColor: step.completed ? 'color-mix(in srgb, var(--color-success) 6%, transparent)' : 'transparent'
                          }}>
                          <div className="flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => toggleStep(phase.id, step.id)}
                              className="mt-1 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors"
                              style={{
                                borderColor: step.completed ? 'var(--color-success)' : 'var(--color-border)',
                                backgroundColor: step.completed ? 'var(--color-success)' : 'transparent'
                              }}>
                              {step.completed && <CheckCircle size={13} className="text-white" />}
                            </motion.button>

                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold ${step.completed ? 'line-through opacity-60' : ''}`}>
                                {formula.name}
                              </p>

                              {formula.arabic && (
                                <motion.p className="arabic-text text-xl mt-2 text-right leading-loose"
                                  style={{ color: step.completed ? 'var(--color-text-secondary)' : 'var(--color-text)', fontFamily: 'Amiri, serif' }}
                                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                                  {formula.arabic}
                                </motion.p>
                              )}

                              {formula.transliteration && (
                                <p className="text-sm mt-1 italic" style={{ color: 'var(--color-text-secondary)' }}>
                                  {formula.transliteration}
                                </p>
                              )}

                              {formula.translation && (
                                <p className="text-sm mt-1">{formula.translation}</p>
                              )}

                              <div className="flex flex-wrap gap-3 mt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                <span>🔁 {step.repeats}×</span>
                                <span>📖 {formula.source}</span>
                                {formula.duration && <span>⏱ {formula.duration}</span>}
                                <span className="capitalize">🕐 {step.timeOfDay === 'any' ? 'Любое время' : step.timeOfDay}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>

      {currentPlan.notes && (
        <Card>
          <h3 className="font-semibold mb-2">📝 Примечания</h3>
          <pre className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)', fontFamily: 'inherit' }}>
            {currentPlan.notes}
          </pre>
        </Card>
      )}

      {/* Export Modal */}
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="Экспорт плана">
        <div className="space-y-4">
          <Select label="Формат документа" value={exportFormat} onChange={v => setExportFormat(v as any)}
            options={[
              { value: 'html', label: '🌐 HTML документ (красивый, с арабским)' },
              { value: 'pdf',  label: '📄 PDF файл' },
              { value: 'text', label: '📝 Текстовый файл (.txt)' },
            ]} />
          <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: 'var(--color-background)' }}>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              {exportFormat === 'html' ? 'HTML-документ с арабским текстом, транслитерацией и переводом. Откроется в браузере.' :
               exportFormat === 'pdf'  ? 'PDF-файл для печати. Если возникнет ошибка — будет скачан HTML.' :
               'Простой текстовый файл. Открывается в любом редакторе.'}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowExportModal(false)}>Отмена</Button>
            <Button onClick={handleExport} loading={exporting} icon={<Download size={16} />}>Скачать</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
