import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, CheckCircle, Activity, Plus, BookOpen, Upload, ChevronRight, Heart } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { usePatientsStore } from '../store/usePatientsStore';
import { usePlansStore } from '../store/usePlansStore';
import { Button, Card, StatCard, PageWrapper } from '../shared';
import { StaggerList, StaggerItem } from '../components/animations';
import { smartDate } from '../utils/date';

export function DashboardPage() {
  const { setCurrentPage } = useAppStore();
  const { patients, loadPatients } = usePatientsStore();
  const { plans, loadPlans } = usePlansStore();

  useEffect(() => { loadPatients(); loadPlans(); }, []);

  const activePlans    = plans.filter(p => p.status === 'active');
  const completedPlans = plans.filter(p => p.status === 'completed');
  const recentPatients = [...patients].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);

  const quickActions = [
    { icon: Plus,     label: 'Новый случай',  desc: 'Пациент + план',    page: 'new-case',  color: 'var(--color-primary)' },
    { icon: Activity, label: 'Диагностика',   desc: 'Rule-based анализ', page: 'diagnosis', color: 'var(--color-info)' },
    { icon: BookOpen, label: 'Библиотека',    desc: 'Формулы, программы',page: 'library',   color: 'var(--color-secondary)' },
    { icon: Upload,   label: 'Импорт',        desc: 'Загрузить данные',  page: 'import',    color: 'var(--color-warning)' },
  ];

  return (
    <PageWrapper>
      {/* Hero Banner */}
      <motion.div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm mb-1">Ассаляму алейкум 🤲</p>
            <h2 className="text-2xl font-bold text-white mb-0.5">ПЛАН ИСЦЕЛЕНИЯ</h2>
            <p className="text-white/70 text-sm">Ash-Shifa · Метод Абу Мухаммада</p>
          </div>
          <Button onClick={() => setCurrentPage('new-case')} icon={<Plus size={18} />}
            className="!bg-white/20 hover:!bg-white/30 !text-white !border !border-white/30">
            Новый случай
          </Button>
        </div>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -right-4 -bottom-12 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={22} />}       label="Пациентов"       value={patients.length}       color="var(--color-primary)"   delay={0}   />
        <StatCard icon={<Activity size={22} />}    label="Активных планов" value={activePlans.length}    color="var(--color-success)"   delay={0.1} />
        <StatCard icon={<CheckCircle size={22} />} label="Завершено"       value={completedPlans.length} color="var(--color-info)"      delay={0.2} />
        <StatCard icon={<FileText size={22} />}    label="Всего планов"    value={plans.length}          color="var(--color-secondary)" delay={0.3} />
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          Быстрые действия
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <motion.div key={action.page}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}>
              <Card hover onClick={() => setCurrentPage(action.page)} className="!p-4">
                <motion.div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${action.color}20` }}
                  whileHover={{ scale: 1.15, rotate: 8 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <action.icon size={20} style={{ color: action.color }} />
                </motion.div>
                <p className="font-semibold text-sm">{action.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{action.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Active Plans */}
      {activePlans.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Активные планы
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage('plans')} icon={<ChevronRight size={15} />}>Все</Button>
          </div>
          <StaggerList className="space-y-2">
            {activePlans.slice(0, 3).map(plan => {
              const pat = usePatientsStore.getState().patients.find(p => p.id === plan.patientId);
              const progress = plan.phases.length
                ? Math.round((plan.phases.filter(ph => ph.completed).length / plan.phases.length) * 100) : 0;
              return (
                <StaggerItem key={plan.id}>
                  <Card hover onClick={() => { useAppStore.getState().setCurrentPlan(plan); setCurrentPage('plan-builder'); }} className="!p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
                        {pat ? pat.firstName[0] + pat.lastName[0] : '??'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{plan.name}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {pat ? `${pat.lastName} ${pat.firstName}` : '—'} · {plan.totalDays} дней
                        </p>
                        <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                          <motion.div className="h-full rounded-full" style={{ backgroundColor: 'var(--color-success)' }}
                            initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} />
                        </div>
                      </div>
                      <span className="text-sm font-bold shrink-0" style={{ color: 'var(--color-success)' }}>{progress}%</span>
                    </div>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerList>
        </motion.div>
      )}

      {/* Recent Patients */}
      {recentPatients.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Последние пациенты</h3>
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage('patients')} icon={<ChevronRight size={15} />}>Все</Button>
          </div>
          <StaggerList className="space-y-2">
            {recentPatients.map(patient => (
              <StaggerItem key={patient.id}>
                <Card hover onClick={() => { useAppStore.getState().setCurrentPatient(patient); setCurrentPage('patient-detail'); }} className="!p-4">
                  <div className="flex items-center gap-3">
                    <motion.div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: 'var(--color-primary)' }} whileHover={{ scale: 1.1 }}>
                      {patient.firstName[0]}{patient.lastName[0]}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{patient.lastName} {patient.firstName}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{smartDate(patient.updatedAt)}</p>
                    </div>
                    <motion.div whileHover={{ x: 3 }}>
                      <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
                    </motion.div>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerList>
        </motion.div>
      )}

      {patients.length === 0 && (
        <Card className="text-center py-12">
          <Heart size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold mb-1">Добро пожаловать!</p>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Добавьте первого пациента, чтобы начать работу
          </p>
          <Button onClick={() => setCurrentPage('new-case')} icon={<Plus size={16} />}>
            Создать первый случай
          </Button>
        </Card>
      )}
    </PageWrapper>
  );
}
