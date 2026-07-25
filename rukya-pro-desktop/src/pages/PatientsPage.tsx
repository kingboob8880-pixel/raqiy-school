import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, Eye, Trash2, Phone, Filter } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { usePatientsStore } from '../store/usePatientsStore';
import { Button, Card, Badge, Input, Select, EmptyState, ConfirmDialog, PageWrapper } from '../shared';
import { StaggerList, StaggerItem } from '../components/animations';
import { smartDate, calculateAge } from '../utils/date';

export function PatientsPage() {
  const { setCurrentPage, addToast } = useAppStore();
  const { loadPatients, deletePatient, getFilteredPatients, searchQuery, setSearchQuery, sortBy, setSortBy, filterGender, setFilterGender } = usePatientsStore();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { loadPatients(); }, []);

  const filtered = getFilteredPatients();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deletePatient(deleteTarget.id);
    addToast({ message: `Пациент удалён`, type: 'success' });
  };

  return (
    <PageWrapper>
      {/* Toolbar */}
      <motion.div className="flex flex-col sm:flex-row gap-3" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Input
          value={searchQuery} onChange={setSearchQuery}
          placeholder="Поиск по имени, тегам..." icon={<Search size={16} />}
          className="flex-1"
        />
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)} icon={<Filter size={15} />}>
            Фильтры
          </Button>
          <Button onClick={() => setCurrentPage('new-case')} icon={<Plus size={16} />}>
            Пациент
          </Button>
        </div>
      </motion.div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden">
            <Card className="!p-4">
              <div className="flex flex-wrap gap-4">
                <Select label="Сортировка" value={sortBy} onChange={v => setSortBy(v as any)} className="w-40"
                  options={[
                    { value: 'recent', label: 'Недавние' },
                    { value: 'name',   label: 'По имени' },
                    { value: 'date',   label: 'По дате' }
                  ]} />
                <Select label="Пол" value={filterGender} onChange={v => setFilterGender(v as any)} className="w-36"
                  options={[
                    { value: 'all',    label: 'Все' },
                    { value: 'male',   label: 'Мужской' },
                    { value: 'female', label: 'Женский' }
                  ]} />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Counter */}
      {filtered.length > 0 && (
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Найдено: <strong>{filtered.length}</strong> пациентов
        </p>
      )}

      {/* List */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmptyState
              icon={<Users size={32} />}
              title={searchQuery ? 'Пациенты не найдены' : 'Нет пациентов'}
              description={searchQuery ? 'Попробуйте изменить запрос' : 'Добавьте первого пациента для начала работы'}
              action={!searchQuery && (
                <Button onClick={() => setCurrentPage('new-case')} icon={<Plus size={16} />}>
                  Добавить пациента
                </Button>
              )}
            />
          </motion.div>
        ) : (
          <StaggerList key="list" className="space-y-2">
            {filtered.map(patient => {
              const age = calculateAge(patient.birthDate || '');
              return (
                <StaggerItem key={patient.id}>
                  <Card>
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <motion.div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 cursor-pointer select-none"
                        style={{ backgroundColor: patient.gender === 'male' ? 'var(--color-primary)' : '#ec4899' }}
                        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                        onClick={() => { useAppStore.getState().setCurrentPatient(patient); setCurrentPage('patient-detail'); }}>
                        {patient.firstName[0]}{patient.lastName[0]}
                      </motion.div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => { useAppStore.getState().setCurrentPatient(patient); setCurrentPage('patient-detail'); }}>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{patient.lastName} {patient.firstName} {patient.middleName || ''}</p>
                          <Badge variant={patient.gender === 'male' ? 'info' : 'success'}>
                            {patient.gender === 'male' ? '♂' : '♀'}
                          </Badge>
                          {age && <Badge variant="info">{age} лет</Badge>}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {patient.phone && (
                            <span className="flex items-center gap-1"><Phone size={13} /> {patient.phone}</span>
                          )}
                          <span>{smartDate(patient.updatedAt)}</span>
                        </div>
                        {patient.tags.length > 0 && (
                          <motion.div className="flex flex-wrap gap-1 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                            {patient.tags.slice(0, 4).map((tag, i) => (
                              <Badge key={i} variant="info">{tag}</Badge>
                            ))}
                          </motion.div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 shrink-0">
                        <motion.button whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.08)' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => { useAppStore.getState().setCurrentPatient(patient); setCurrentPage('patient-detail'); }}
                          className="p-2 rounded-lg transition-colors" title="Открыть">
                          <Eye size={17} />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1, backgroundColor: 'rgba(239,68,68,0.12)' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setDeleteTarget({ id: patient.id, name: `${patient.lastName} ${patient.firstName}` })}
                          className="p-2 rounded-lg transition-colors" style={{ color: 'var(--color-error)' }} title="Удалить">
                          <Trash2 size={17} />
                        </motion.button>
                      </div>
                    </div>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerList>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Удалить пациента"
        message={`Удалить пациента «${deleteTarget?.name}»? Это действие нельзя отменить.`}
        confirmLabel="Удалить"
        danger
      />
    </PageWrapper>
  );
}
