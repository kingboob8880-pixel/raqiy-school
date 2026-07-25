// ==========================================
// RUKYA PRO — Root App Component
// ПЛАН ИСЦЕЛЕНИЯ · Ash-Shifa · Абу Мухаммад
// ==========================================

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import {
  Home, Users, FileText, Activity, BarChart2, BookOpen,
  Star, Calendar, Upload, Settings, Search, Sun, Moon,
  Lock, Menu, X, Plus, ChevronRight, CheckCircle,
  AlertCircle, Eye, Trash2, Phone, ArrowLeft, Save,
  Edit3, Info, Shield, Zap, Download, Clock, Heart,
  Copy, Filter, RotateCcw
} from 'lucide-react';
import { AnimatedCard, RippleButton, AnimatedModal, AnimatedProgress, AnimatedCounter, StaggerList, StaggerItem } from './components/animations';
import { useAppStore } from './store/useAppStore';
import { usePatientsStore } from './store/usePatientsStore';
import { usePlansStore } from './store/usePlansStore';
import { useSettingsStore } from './store/useSettingsStore';
import { initDB } from './storage';
import { themes, applyTheme, getTheme } from './theme';
import { FORMULAS, getFormula, searchFormulas } from './data/formulas';
import { PROGRAMS, getProgram, searchPrograms } from './data/programs';
import { SYMPTOMS, getSymptomsByCategory } from './data/knowledge';
import { ALLAH_ATTRIBUTES, searchAttributes } from './data/attributes-allah';
import { diagnose, CAUSE_COLORS, URGENCY_LABELS } from './engine/diagnosis';
import { buildPlan } from './engine/plan-builder';
import { validatePlan, moveStepWithinPhase, type PlanValidationIssue } from './engine/logic-validator';
import { formatRU, smartDate, calculateAge } from './utils/date';
import { downloadHTML, downloadPDF, downloadTextReport } from './utils/export';
import { verifyPin, savePin, removePin, isLockedOut, getLockoutRemaining, formatLockoutTime, incrementPinAttempts, resetPinAttempts } from './utils/pin';
import { getErrors, clearErrors, copyErrorsToClipboard, downloadErrors } from './utils/error-logger';
import { nanoid } from 'nanoid';
import type { Patient, PlanPhase, Formula, ExportSettings, TreatmentPlan } from './types';
import type { ExtendedDiagnosisResult } from './engine/diagnosis';

// ==========================================
// Shared UI Primitives
// ==========================================

interface BtnProps { children: React.ReactNode; variant?: 'primary'|'secondary'|'ghost'|'danger'; size?: 'sm'|'md'|'lg'; loading?: boolean; disabled?: boolean; onClick?: () => void; className?: string; icon?: React.ReactNode; }
function Btn({ children, variant='primary', size='md', loading, disabled, onClick, className='', icon }: BtnProps) {
  return (
    <RippleButton variant={variant} size={size} onClick={onClick} disabled={disabled||loading} className={className}>
      <span className="flex items-center gap-2">
        {loading ? <motion.span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full inline-block" animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:'linear' }} /> : icon}
        {children}
      </span>
    </RippleButton>
  );
}

function Card({ children, className='', hover=false, onClick, delay=0 }: { children: React.ReactNode; className?: string; hover?: boolean; onClick?: () => void; delay?: number }) {
  return <AnimatedCard hover={hover} onClick={onClick} className={className} delay={delay}>{children}</AnimatedCard>;
}

function Inp({ label, value, onChange, placeholder, type='text', error, icon, className='' }: { label?: string; value: string; onChange: (v:string)=>void; placeholder?: string; type?: string; error?: string; icon?: React.ReactNode; className?: string }) {
  const [f, setF] = useState(false);
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium mb-1.5" style={{ color:'var(--color-text)' }}>{label}</label>}
      <div className="relative">
        {icon && <motion.span className="absolute left-3 top-1/2 -translate-y-1/2" animate={{ color: f ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>{icon}</motion.span>}
        <input type={type} value={value} onChange={e=>onChange(e.target.value)} onFocus={()=>setF(true)} onBlur={()=>setF(false)} placeholder={placeholder}
          className={`input ${icon?'pl-10':''} ${error?'!border-red-500':''}`}
          style={f ? { borderColor:'var(--color-primary)', boxShadow:'0 0 0 3px color-mix(in srgb, var(--color-primary) 18%, transparent)' } : {}} />
      </div>
      <AnimatePresence>{error && <motion.p className="mt-1 text-sm" style={{ color:'var(--color-error)' }} initial={{ opacity:0,y:-4 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-4 }}>{error}</motion.p>}</AnimatePresence>
    </div>
  );
}

function Sel({ label, value, onChange, options, className='' }: { label?: string; value: string; onChange: (v:string)=>void; options:{value:string;label:string}[]; className?: string }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium mb-1.5" style={{ color:'var(--color-text)' }}>{label}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)} className="input appearance-none cursor-pointer w-full">
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

type BV = 'success'|'warning'|'error'|'info';
function Bdg({ children, variant='info', pulse=false }: { children: React.ReactNode; variant?: BV; pulse?: boolean }) {
  const c: Record<BV,{bg:string;text:string}> = { success:{bg:'rgba(16,185,129,.18)',text:'var(--color-success)'}, warning:{bg:'rgba(245,158,11,.18)',text:'var(--color-warning)'}, error:{bg:'rgba(239,68,68,.18)',text:'var(--color-error)'}, info:{bg:'rgba(59,130,246,.18)',text:'var(--color-info)'} };
  return (
    <motion.span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor:c[variant].bg, color:c[variant].text }} initial={{ scale:.8,opacity:0 }} animate={{ scale:1,opacity:1 }} transition={{ duration:.15 }}>
      {pulse && <motion.span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor:c[variant].text }} animate={{ scale:[1,1.4,1],opacity:[1,.5,1] }} transition={{ duration:2,repeat:Infinity }} />}
      {children}
    </motion.span>
  );
}

function Chip({ label, selected, onClick, onRemove }: { label:string; selected?:boolean; onClick?:()=>void; onRemove?:()=>void }) {
  return (
    <motion.button onClick={onClick} whileHover={{ scale:1.04 }} whileTap={{ scale:.96 }}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${selected?'bg-[var(--color-primary)] border-[var(--color-primary)] text-white':'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary)]'}`}>
      {label}
      {onRemove && <motion.span onClick={e=>{e.stopPropagation();onRemove();}} whileHover={{ scale:1.2 }} className="ml-0.5 hover:bg-white/20 rounded-full p-0.5"><X size={12}/></motion.span>}
    </motion.button>
  );
}

function Toggle({ value, onChange, label, desc }: { value:boolean; onChange:(v:boolean)=>void; label?:string; desc?:string }) {
  return (
    <div className="flex items-center justify-between">
      {(label||desc) && <div className="mr-4">{label && <p className="font-medium">{label}</p>}{desc && <p className="text-sm" style={{ color:'var(--color-text-secondary)' }}>{desc}</p>}</div>}
      <motion.button onClick={()=>onChange(!value)} whileTap={{ scale:.95 }} className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${value?'bg-[var(--color-primary)]':'bg-[var(--color-border)]'}`}>
        <motion.div className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md" animate={{ left: value?'1.75rem':'0.25rem' }} transition={{ type:'spring', stiffness:500, damping:30 }} />
      </motion.button>
    </div>
  );
}

function Modal({ isOpen, onClose, title, children, size='md' }: { isOpen:boolean; onClose:()=>void; title:string; children:React.ReactNode; size?:'sm'|'md'|'lg' }) {
  return <AnimatedModal isOpen={isOpen} onClose={onClose} title={title} size={size}>{children}</AnimatedModal>;
}

function PBar({ value, max=100, label, color }: { value:number; max?:number; label?:string; color?:string }) {
  return <AnimatedProgress value={value} max={max} label={label} color={color} />;
}

function EmptyState({ icon, title, desc, action }: { icon:React.ReactNode; title:string; desc?:string; action?:React.ReactNode }) {
  return (
    <motion.div className="card text-center py-16" initial={{ opacity:0,scale:.95 }} animate={{ opacity:1,scale:1 }}>
      <motion.div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor:'var(--color-surface)', border:'2px dashed var(--color-border)' }} initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:.1,type:'spring',stiffness:200 }}>
        <span style={{ color:'var(--color-text-secondary)' }}>{icon}</span>
      </motion.div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {desc && <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color:'var(--color-text-secondary)' }}>{desc}</p>}
      {action}
    </motion.div>
  );
}

function StatCard({ icon, label, value, color, delay=0 }: { icon:React.ReactNode; label:string; value:number; color:string; delay?:number }) {
  return (
    <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay }}>
      <Card className="text-center">
        <motion.div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ backgroundColor:`${color}20` }} whileHover={{ scale:1.1,rotate:5 }} transition={{ type:'spring',stiffness:300 }}>
          <span style={{ color }}>{icon}</span>
        </motion.div>
        <p className="text-3xl font-bold mb-1"><AnimatedCounter value={value} duration={0.8} /></p>
        <p className="text-sm" style={{ color:'var(--color-text-secondary)' }}>{label}</p>
      </Card>
    </motion.div>
  );
}

function Pg({ children }: { children: React.ReactNode }) {
  return <motion.div className="space-y-6" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ duration:.25 }}>{children}</motion.div>;
}

function ConfirmDlg({ isOpen, onClose, onConfirm, title, message, confirmLabel='Удалить' }: { isOpen:boolean; onClose:()=>void; onConfirm:()=>void; title:string; message:string; confirmLabel?:string }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p style={{ color:'var(--color-text-secondary)' }}>{message}</p>
        <div className="flex gap-3 justify-end">
          <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
          <Btn variant="danger" onClick={()=>{onConfirm();onClose();}}>{ confirmLabel}</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ==========================================
// Global Search Overlay
// ==========================================

function GlobalSearch() {
  const { searchOpen, setSearchOpen, searchQuery, setSearchQuery, setCurrentPage } = useAppStore();
  const { patients } = usePatientsStore();
  const { plans } = usePlansStore();

  const results = searchQuery.length < 2 ? [] : [
    ...patients.filter(p => `${p.lastName} ${p.firstName}`.toLowerCase().includes(searchQuery.toLowerCase())).slice(0,4)
      .map(p => ({ type:'patient', id:p.id, title:`${p.lastName} ${p.firstName}`, sub:p.phone||'', obj:p })),
    ...plans.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0,3)
      .map(p => ({ type:'plan', id:p.id, title:p.name, sub:`${p.totalDays} дней`, obj:p })),
    ...searchFormulas(searchQuery).slice(0,3)
      .map(f => ({ type:'formula', id:f.id, title:f.name, sub:f.source, obj:f })),
  ];

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey||e.metaKey) && e.key==='k') { e.preventDefault(); setSearchOpen(true); }
      if (e.key==='Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  if (!searchOpen) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
        style={{ backgroundColor:'rgba(0,0,0,.65)' }}
        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        onClick={()=>setSearchOpen(false)}>
        <motion.div className="w-full max-w-xl" initial={{ opacity:0,y:-20 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-20 }} onClick={e=>e.stopPropagation()}>
          <div className="card p-0 overflow-hidden shadow-2xl">
            <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor:'var(--color-border)' }}>
              <Search size={20} style={{ color:'var(--color-text-secondary)' }} />
              <input autoFocus value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                placeholder="Поиск пациентов, планов, формул..." className="flex-1 bg-transparent outline-none text-lg" />
              <kbd className="text-xs px-2 py-1 rounded" style={{ backgroundColor:'var(--color-border)' }}>Esc</kbd>
            </div>

            {searchQuery.length >= 2 ? (
              <div className="max-h-80 overflow-y-auto">
                {results.length === 0
                  ? <p className="p-8 text-center" style={{ color:'var(--color-text-secondary)' }}>Ничего не найдено</p>
                  : <div className="p-2">
                      {results.map((r,i) => (
                        <motion.button key={r.id+i} initial={{ opacity:0,x:-8 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*.04 }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-white/5 transition-colors mb-1"
                          onClick={()=>{
                            if (r.type==='patient') { useAppStore.getState().setCurrentPatient(r.obj as Patient); setCurrentPage('patient-detail'); }
                            else if (r.type==='plan') { useAppStore.getState().setCurrentPlan(r.obj as TreatmentPlan); setCurrentPage('plan-builder'); }
                            else setCurrentPage('library');
                            setSearchOpen(false); setSearchQuery('');
                          }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: r.type==='patient'?'var(--color-primary)':r.type==='plan'?'var(--color-success)':'var(--color-secondary)' }}>
                            {r.type==='patient' ? <Users size={14} className="text-white" /> : r.type==='plan' ? <FileText size={14} className="text-white" /> : <BookOpen size={14} className="text-white" />}
                          </div>
                          <div className="flex-1"><p className="font-medium text-sm">{r.title}</p><p className="text-xs opacity-60">{r.sub}</p></div>
                          <ChevronRight size={15} className="opacity-40" />
                        </motion.button>
                      ))}
                    </div>}
              </div>
            ) : (
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color:'var(--color-text-secondary)' }}>Быстрые переходы</p>
                {[{ label:'Новый случай',icon:<Plus size={14}/>,page:'new-case' },{ label:'Библиотека формул',icon:<BookOpen size={14}/>,page:'library' },{ label:'Диагностика',icon:<Activity size={14}/>,page:'diagnosis' }].map(a=>(
                  <button key={a.page} onClick={()=>{ setCurrentPage(a.page); setSearchOpen(false); setSearchQuery(''); }}
                    className="flex items-center gap-2 w-full p-2.5 rounded-xl hover:bg-white/5 transition-colors mb-1 text-sm">
                    <span style={{ color:'var(--color-primary)' }}>{a.icon}</span>{a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ==========================================
// Bottom Navigation (Mobile)
// ==========================================

function BottomNav() {
  const { currentPage, setCurrentPage } = useAppStore();
  const items = [
    { id:'dashboard', icon:Home, label:'Главная' },
    { id:'patients',  icon:Users, label:'Пациенты' },
    { id:'new-case',  icon:Plus, label:'Новый', primary:true },
    { id:'library',   icon:BookOpen, label:'Библиотека' },
    { id:'settings',  icon:Settings, label:'Настройки' },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(item => {
          const active = currentPage === item.id;
          if ((item as any).primary) return (
            <motion.button key={item.id} whileTap={{ scale:.9 }} onClick={()=>setCurrentPage(item.id)}
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor:'var(--color-primary)' }}>
              <item.icon size={22} className="text-white" />
            </motion.button>
          );
          return (
            <motion.button key={item.id} whileTap={{ scale:.9 }} onClick={()=>setCurrentPage(item.id)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors relative"
              style={{ color: active?'var(--color-primary)':'var(--color-text-secondary)' }}>
              <item.icon size={20} />
              <span className="text-xs">{item.label}</span>
              {active && <motion.div layoutId="bNavDot" className="absolute -bottom-0.5 w-1 h-1 rounded-full" style={{ backgroundColor:'var(--color-primary)' }} />}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

// ==========================================
// Header
// ==========================================

function Header() {
  const { currentPage, toggleSidebar, setSearchOpen } = useAppStore();
  const { currentThemeId, setCurrentThemeId } = useSettingsStore();
  const { setLocked } = useAppStore();
  const theme = getTheme(currentThemeId);
  const isDark = theme.isDark;

  const titles: Record<string,string> = {
    dashboard:'Панель управления', patients:'Пациенты', 'patient-detail':'Карточка пациента',
    'new-case':'Новый случай', plans:'Планы лечения', 'plan-builder':'Конструктор плана',
    library:'Библиотека', attributes:'99 имён Аллаха', diagnosis:'Диагностика',
    monitoring:'Мониторинг', reports:'Отчёты', calendar:'Календарь',
    import:'Импорт', settings:'Настройки',
  };

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-4 lg:px-6" style={{ backgroundColor:'var(--color-surface)', borderBottom:'1px solid var(--color-border)' }}>
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"><Menu size={20}/></button>
        <div>
          <h1 className="text-base font-semibold leading-none">{titles[currentPage] || 'ПЛАН ИСЦЕЛЕНИЯ'}</h1>
          <p className="text-xs mt-0.5" style={{ color:'var(--color-text-secondary)' }}>Ash-Shifa · Абу Мухаммад</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }} onClick={()=>setSearchOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
          style={{ backgroundColor:'var(--color-background)', border:'1px solid var(--color-border)', color:'var(--color-text-secondary)' }}>
          <Search size={14}/> Поиск... <kbd className="text-xs opacity-50 ml-1">Ctrl+K</kbd>
        </motion.button>
        <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }} onClick={()=>setSearchOpen(true)} className="p-2 rounded-lg hover:bg-white/10 sm:hidden"><Search size={20}/></motion.button>
        <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }} onClick={()=>{ const id=isDark?'light-dawn':'dark-ocean'; setCurrentThemeId(id); applyTheme(getTheme(id)); }} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          {isDark ? <Sun size={20}/> : <Moon size={20}/>}
        </motion.button>
        <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }} onClick={()=>setLocked(true)} className="p-2 rounded-lg hover:bg-white/10 transition-colors"><Lock size={20}/></motion.button>
      </div>
    </header>
  );
}

// ==========================================
// Sidebar
// ==========================================

function Sidebar() {
  const { currentPage, setCurrentPage, sidebarOpen, setSidebarOpen } = useAppStore();
  const { patients } = usePatientsStore();
  const { plans } = usePlansStore();

  const sections = [
    { title:'Основное', items:[
      { id:'dashboard',  icon:Home,     label:'Главная' },
      { id:'patients',   icon:Users,    label:'Пациенты',    badge: patients.length || null },
      { id:'plans',      icon:FileText, label:'Планы',       badge: plans.filter(p=>p.status==='active').length || null },
    ]},
    { title:'Работа', items:[
      { id:'diagnosis',  icon:Activity,  label:'Диагностика' },
      { id:'new-case',   icon:Plus,      label:'Новый случай' },
      { id:'monitoring', icon:BarChart2, label:'Мониторинг' },
      { id:'reports',    icon:BarChart2, label:'Отчёты' },
    ]},
    { title:'Библиотека', items:[
      { id:'library',    icon:BookOpen,  label:'Формулы и программы' },
      { id:'attributes', icon:Star,      label:'99 имён Аллаха' },
    ]},
    { title:'Система', items:[
      { id:'calendar',   icon:Calendar,  label:'Календарь' },
      { id:'import',     icon:Upload,    label:'Импорт данных' },
      { id:'settings',   icon:Settings,  label:'Настройки' },
    ]},
  ];

  return (
    <>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={()=>setSidebarOpen(false)} />}
      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 z-50 overflow-y-auto scrollbar-hide transition-transform duration-300 lg:translate-x-0 ${sidebarOpen?'translate-x-0':'-translate-x-full'}`}
        style={{ backgroundColor:'var(--color-surface)', borderRight:'1px solid var(--color-border)' }}>
        <div className="p-3 space-y-4">
          {sections.map(section => (
            <div key={section.title}>
              <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-1.5" style={{ color:'var(--color-text-secondary)' }}>{section.title}</p>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const active = currentPage === item.id;
                  return (
                    <motion.button key={item.id} whileHover={{ x:2 }} whileTap={{ scale:.98 }}
                      onClick={()=>{ setCurrentPage(item.id); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${active?'font-semibold':''}`}
                      style={{ backgroundColor: active?'color-mix(in srgb, var(--color-primary) 12%, transparent)':'transparent', color: active?'var(--color-primary)':'var(--color-text)' }}>
                      {active && <motion.div layoutId="sidebarActive" className="absolute left-0 w-0.5 h-6 rounded-r-full" style={{ backgroundColor:'var(--color-primary)' }} />}
                      <item.icon size={18} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {(item as any).badge && <span className="badge badge-info">{(item as any).badge}</span>}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 mt-2">
          <Card className="!p-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor:'var(--color-primary)' }}><Heart size={18} className="text-white"/></div>
              <div><p className="font-semibold text-sm">ПЛАН ИСЦЕЛЕНИЯ</p><p className="text-xs" style={{ color:'var(--color-text-secondary)' }}>v1.0.0 · Ash-Shifa</p></div>
            </div>
          </Card>
        </div>
      </aside>
    </>
  );
}

// ==========================================
// Toast Container
// ==========================================

function Toasts() {
  const { toasts, removeToast } = useAppStore();
  return (
    <div className="fixed bottom-20 lg:bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id} layout
            initial={{ opacity:0,x:100,scale:.9 }} animate={{ opacity:1,x:0,scale:1 }} exit={{ opacity:0,x:100,scale:.9 }} transition={{ duration:.25,ease:'easeOut' }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white backdrop-blur-sm ${
              t.type==='success'?'bg-green-500/90':t.type==='error'?'bg-red-500/90':t.type==='warning'?'bg-yellow-500/90':'bg-blue-500/90'
            }`}>
            <motion.span initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:.1,type:'spring',stiffness:300 }}>
              {t.type==='success'?<CheckCircle size={18}/>:t.type==='error'?<AlertCircle size={18}/>:t.type==='warning'?<AlertCircle size={18}/>:<Info size={18}/>}
            </motion.span>
            <span className="flex-1 text-sm">{t.message}</span>
            <motion.button onClick={()=>removeToast(t.id)} whileHover={{ scale:1.1 }} whileTap={{ scale:.9 }} className="opacity-70 hover:opacity-100"><X size={15}/></motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// Dashboard Page
// ==========================================

function DashboardPage() {
  const { setCurrentPage } = useAppStore();
  const { patients, loadPatients } = usePatientsStore();
  const { plans, loadPlans } = usePlansStore();

  useEffect(() => { loadPatients(); loadPlans(); }, []);

  const active    = plans.filter(p=>p.status==='active');
  const completed = plans.filter(p=>p.status==='completed');
  const recent    = [...patients].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,5);

  return (
    <Pg>
      {/* Hero */}
      <motion.div className="relative overflow-hidden rounded-2xl p-6" style={{ background:'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }} initial={{ opacity:0,scale:.97 }} animate={{ opacity:1,scale:1 }} transition={{ duration:.3 }}>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm mb-1">Ассаляму алейкум 🤲</p>
            <h2 className="text-2xl font-bold text-white mb-0.5">ПЛАН ИСЦЕЛЕНИЯ</h2>
            <p className="text-white/70 text-sm">Ash-Shifa · Метод Абу Мухаммада</p>
          </div>
          <Btn onClick={()=>setCurrentPage('new-case')} icon={<Plus size={18}/>} className="!bg-white/20 !text-white !border !border-white/30">Новый случай</Btn>
        </div>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -right-4 -bottom-12 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={22}/>}       label="Пациентов"       value={patients.length}  color="var(--color-primary)"   delay={0}   />
        <StatCard icon={<Activity size={22}/>}    label="Активных планов" value={active.length}    color="var(--color-success)"   delay={.1}  />
        <StatCard icon={<CheckCircle size={22}/>} label="Завершено"       value={completed.length} color="var(--color-info)"      delay={.2}  />
        <StatCard icon={<FileText size={22}/>}    label="Всего планов"    value={plans.length}     color="var(--color-secondary)" delay={.3}  />
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color:'var(--color-text-secondary)' }}>Быстрые действия</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon:Plus,      label:'Новый случай',  desc:'Пациент + план',    page:'new-case',  color:'var(--color-primary)' },
            { icon:Activity,  label:'Диагностика',   desc:'Rule-based анализ', page:'diagnosis', color:'var(--color-info)' },
            { icon:BookOpen,  label:'Библиотека',    desc:'Формулы, программы',page:'library',   color:'var(--color-secondary)' },
            { icon:BarChart2, label:'Отчёты',        desc:'Статистика',        page:'reports',   color:'var(--color-warning)' },
          ].map((a,i)=>(
            <motion.div key={a.page} initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:.4+i*.08 }}>
              <Card hover onClick={()=>setCurrentPage(a.page)} className="!p-4">
                <motion.div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor:`${a.color}20` }} whileHover={{ scale:1.15,rotate:8 }} transition={{ type:'spring',stiffness:300 }}>
                  <a.icon size={20} style={{ color:a.color }}/>
                </motion.div>
                <p className="font-semibold text-sm">{a.label}</p>
                <p className="text-xs mt-0.5" style={{ color:'var(--color-text-secondary)' }}>{a.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Active plans */}
      {active.length > 0 && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.6 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>Активные планы</h3>
            <Btn variant="ghost" size="sm" onClick={()=>setCurrentPage('plans')} icon={<ChevronRight size={15}/>}>Все</Btn>
          </div>
          <StaggerList className="space-y-2">
            {active.slice(0,3).map(plan=>{
              const pat = usePatientsStore.getState().patients.find(p=>p.id===plan.patientId);
              const prog = plan.phases.length ? Math.round((plan.phases.filter(ph=>ph.completed).length/plan.phases.length)*100) : 0;
              return (
                <StaggerItem key={plan.id}>
                  <Card hover onClick={()=>{ useAppStore.getState().setCurrentPlan(plan); setCurrentPage('plan-builder'); }} className="!p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background:'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
                        {pat ? pat.firstName[0]+pat.lastName[0] : '??'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{plan.name}</p>
                        <p className="text-xs" style={{ color:'var(--color-text-secondary)' }}>{pat?`${pat.lastName} ${pat.firstName}`:'—'} · {plan.totalDays} дней</p>
                        <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ backgroundColor:'var(--color-border)' }}>
                          <motion.div className="h-full rounded-full" style={{ backgroundColor:'var(--color-success)' }} initial={{ width:0 }} animate={{ width:`${prog}%` }} transition={{ duration:.8 }}/>
                        </div>
                      </div>
                      <span className="text-sm font-bold shrink-0" style={{ color:'var(--color-success)' }}>{prog}%</span>
                    </div>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerList>
        </motion.div>
      )}

      {/* Recent patients */}
      {recent.length > 0 && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.7 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Последние пациенты</h3>
            <Btn variant="ghost" size="sm" onClick={()=>setCurrentPage('patients')} icon={<ChevronRight size={15}/>}>Все</Btn>
          </div>
          <StaggerList className="space-y-2">
            {recent.map(p=>(
              <StaggerItem key={p.id}>
                <Card hover onClick={()=>{ useAppStore.getState().setCurrentPatient(p); setCurrentPage('patient-detail'); }} className="!p-4">
                  <div className="flex items-center gap-3">
                    <motion.div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor:'var(--color-primary)' }} whileHover={{ scale:1.1 }}>
                      {p.firstName[0]}{p.lastName[0]}
                    </motion.div>
                    <div className="flex-1"><p className="font-medium">{p.lastName} {p.firstName}</p><p className="text-xs" style={{ color:'var(--color-text-secondary)' }}>{smartDate(p.updatedAt)}</p></div>
                    <motion.div whileHover={{ x:3 }}><ChevronRight size={18} style={{ color:'var(--color-text-secondary)' }}/></motion.div>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerList>
        </motion.div>
      )}

      {patients.length === 0 && (
        <Card className="text-center py-12">
          <Heart size={40} className="mx-auto mb-3 opacity-30"/>
          <p className="font-semibold mb-1">Добро пожаловать!</p>
          <p className="text-sm mb-4" style={{ color:'var(--color-text-secondary)' }}>Добавьте первого пациента для начала работы</p>
          <Btn onClick={()=>setCurrentPage('new-case')} icon={<Plus size={16}/>}>Создать первый случай</Btn>
        </Card>
      )}
    </Pg>
  );
}

// ==========================================
// Patients Page
// ==========================================

function PatientsPage() {
  const { setCurrentPage, addToast } = useAppStore();
  const { loadPatients, deletePatient, getFilteredPatients, searchQuery, setSearchQuery, sortBy, setSortBy, filterGender, setFilterGender } = usePatientsStore();
  const [delTarget, setDelTarget] = useState<{id:string;name:string}|null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(()=>{ loadPatients(); },[]);
  const filtered = getFilteredPatients();

  return (
    <Pg>
      <motion.div className="flex flex-col sm:flex-row gap-3" initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }}>
        <Inp value={searchQuery} onChange={setSearchQuery} placeholder="Поиск..." icon={<Search size={16}/>} className="flex-1"/>
        <div className="flex gap-2">
          <Btn variant="secondary" size="sm" onClick={()=>setShowFilters(!showFilters)} icon={<Filter size={15}/>}>Фильтры</Btn>
          <Btn onClick={()=>setCurrentPage('new-case')} icon={<Plus size={16}/>}>Пациент</Btn>
        </div>
      </motion.div>

      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:'auto' }} exit={{ opacity:0,height:0 }} transition={{ duration:.2 }} className="overflow-hidden">
            <Card className="!p-4">
              <div className="flex flex-wrap gap-4">
                <Sel label="Сортировка" value={sortBy} onChange={v=>setSortBy(v as any)} className="w-40"
                  options={[{value:'recent',label:'Недавние'},{value:'name',label:'По имени'},{value:'date',label:'По дате'}]} />
                <Sel label="Пол" value={filterGender} onChange={v=>setFilterGender(v as any)} className="w-36"
                  options={[{value:'all',label:'Все'},{value:'male',label:'Мужской'},{value:'female',label:'Женский'}]} />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length > 0 && <p className="text-sm" style={{ color:'var(--color-text-secondary)' }}>Найдено: <strong>{filtered.length}</strong></p>}

      <AnimatePresence mode="wait">
        {filtered.length === 0
          ? <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <EmptyState icon={<Users size={32}/>} title={searchQuery?'Пациенты не найдены':'Нет пациентов'} desc={searchQuery?'Попробуйте изменить запрос':'Добавьте первого пациента'}
                action={!searchQuery && <Btn onClick={()=>setCurrentPage('new-case')} icon={<Plus size={16}/>}>Добавить</Btn>} />
            </motion.div>
          : <StaggerList key="list" className="space-y-2">
              {filtered.map(patient=>{
                const age = calculateAge(patient.birthDate||'');
                return (
                  <StaggerItem key={patient.id}>
                    <Card>
                      <div className="flex items-center gap-4">
                        <motion.div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 cursor-pointer"
                          style={{ backgroundColor:patient.gender==='male'?'var(--color-primary)':'#ec4899' }}
                          whileHover={{ scale:1.08 }} whileTap={{ scale:.95 }}
                          onClick={()=>{ useAppStore.getState().setCurrentPatient(patient); setCurrentPage('patient-detail'); }}>
                          {patient.firstName[0]}{patient.lastName[0]}
                        </motion.div>
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={()=>{ useAppStore.getState().setCurrentPatient(patient); setCurrentPage('patient-detail'); }}>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">{patient.lastName} {patient.firstName} {patient.middleName||''}</p>
                            {age && <Bdg variant="info">{age} лет</Bdg>}
                          </div>
                          <div className="flex flex-wrap gap-3 mt-1 text-sm" style={{ color:'var(--color-text-secondary)' }}>
                            {patient.phone && <span className="flex items-center gap-1"><Phone size={13}/>{patient.phone}</span>}
                            <span>{smartDate(patient.updatedAt)}</span>
                          </div>
                          {patient.tags.length>0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {patient.tags.slice(0,4).map((tag,i)=><Bdg key={i} variant="info">{tag}</Bdg>)}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:.9 }} onClick={()=>{ useAppStore.getState().setCurrentPatient(patient); setCurrentPage('patient-detail'); }} className="p-2 rounded-lg transition-colors" title="Открыть"><Eye size={17}/></motion.button>
                          <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:.9 }} onClick={()=>setDelTarget({ id:patient.id, name:`${patient.lastName} ${patient.firstName}` })} className="p-2 rounded-lg transition-colors" style={{ color:'var(--color-error)' }} title="Удалить"><Trash2 size={17}/></motion.button>
                        </div>
                      </div>
                    </Card>
                  </StaggerItem>
                );
              })}
            </StaggerList>
        }
      </AnimatePresence>

      <ConfirmDlg isOpen={!!delTarget} onClose={()=>setDelTarget(null)} title="Удалить пациента"
        message={`Удалить «${delTarget?.name}»? Это действие необратимо.`}
        onConfirm={async()=>{ if(delTarget){ await deletePatient(delTarget.id); addToast({ message:'Пациент удалён',type:'success' }); } }} />
    </Pg>
  );
}

// ==========================================
// Patient Detail Page
// ==========================================

function PatientDetailPage() {
  const { setCurrentPage, currentPatient, setCurrentPatient, addToast } = useAppStore();
  const { plans, loadPlans } = usePlansStore();
  const [tab, setTab] = useState<'overview'|'plans'|'sessions'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [ed, setEd] = useState<Partial<Patient>>({});

  useEffect(()=>{ if(currentPatient){ setEd(currentPatient); loadPlans(); } },[currentPatient]);

  if(!currentPatient) return (
    <Card className="text-center py-16">
      <AlertCircle size={48} className="mx-auto mb-4 opacity-40"/>
      <h3 className="text-lg font-medium mb-2">Пациент не выбран</h3>
      <Btn onClick={()=>setCurrentPage('patients')} icon={<ArrowLeft size={18}/>}>К списку</Btn>
    </Card>
  );

  const patPlans = plans.filter(p=>p.id === currentPatient.id || p.patientId === currentPatient.id);
  const activePlan = patPlans.find(p=>p.status==='active');
  const age = calculateAge(currentPatient.birthDate||'');

  const save = async()=>{
    const updated = { ...currentPatient,...ed,updatedAt:new Date().toISOString() };
    usePatientsStore.getState().updatePatient(updated);
    setCurrentPatient(updated);
    setIsEditing(false);
    addToast({ message:'Данные сохранены',type:'success' });
  };

  const tabs = [{ id:'overview',label:'Обзор' },{ id:'plans',label:`Планы (${patPlans.length})` },{ id:'sessions',label:'История' }];

  return (
    <Pg>
      <Btn variant="ghost" onClick={()=>setCurrentPage('patients')} icon={<ArrowLeft size={18}/>}>Назад</Btn>

      {/* Patient Header */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
            style={{ background:'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
            whileHover={{ scale:1.05, rotate:3 }}>
            {currentPatient.firstName[0]}{currentPatient.lastName[0]}
          </motion.div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Inp label="Фамилия" value={ed.lastName||''} onChange={v=>setEd(d=>({...d,lastName:v}))} />
                  <Inp label="Имя"     value={ed.firstName||''} onChange={v=>setEd(d=>({...d,firstName:v}))} />
                  <Inp label="Отчество" value={ed.middleName||''} onChange={v=>setEd(d=>({...d,middleName:v}))} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Inp label="Телефон" value={ed.phone||''} onChange={v=>setEd(d=>({...d,phone:v}))} />
                  <Inp label="Дата рождения" type="date" value={ed.birthDate||''} onChange={v=>setEd(d=>({...d,birthDate:v}))} />
                </div>
                <div className="flex gap-2">
                  <Btn onClick={save} icon={<Save size={16}/>}>Сохранить</Btn>
                  <Btn variant="ghost" onClick={()=>setIsEditing(false)}>Отмена</Btn>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold">{currentPatient.lastName} {currentPatient.firstName} {currentPatient.middleName||''}</h2>
                  <Bdg variant={currentPatient.gender==='male'?'info':'success'}>{currentPatient.gender==='male'?'♂ Мужской':'♀ Женский'}</Bdg>
                  {age && <Bdg variant="info">{age} лет</Bdg>}
                </div>
                <div className="flex flex-wrap gap-4 text-sm mb-3" style={{ color:'var(--color-text-secondary)' }}>
                  {currentPatient.phone && <span className="flex items-center gap-1"><Phone size={13}/>{currentPatient.phone}</span>}
                  <span>Добавлен: {formatRU(currentPatient.createdAt)}</span>
                </div>
                {currentPatient.tags.length>0 && <div className="flex flex-wrap gap-2 mb-3">{currentPatient.tags.map((t,i)=><Bdg key={i} variant="info">{t}</Bdg>)}</div>}
                <div className="flex gap-2">
                  <Btn variant="secondary" size="sm" onClick={()=>setIsEditing(true)} icon={<Edit3 size={15}/>}>Редактировать</Btn>
                  <Btn size="sm" onClick={()=>{ useAppStore.getState().setCurrentPatient(currentPatient); setCurrentPage('new-case'); }} icon={<Plus size={15}/>}>Новый план</Btn>
                  <Btn variant="secondary" size="sm" onClick={()=>{ useAppStore.getState().setCurrentPatient(currentPatient); setCurrentPage('monitoring'); }} icon={<BarChart2 size={15}/>}>Мониторинг</Btn>
                  <Btn variant="secondary" size="sm" onClick={()=>{ useAppStore.getState().setCurrentPatient(currentPatient); setCurrentPage('diagnosis'); }} icon={<Activity size={15}/>}>Диагностика</Btn>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor:'var(--color-surface)', border:'1px solid var(--color-border)' }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id as any)}
            className={`relative flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab===t.id?'text-white':''}`}
            style={{ color: tab===t.id?'white':'var(--color-text-secondary)' }}>
            {tab===t.id && <motion.div layoutId="patTab" className="absolute inset-0 rounded-lg" style={{ backgroundColor:'var(--color-primary)' }} />}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab==='overview' && (
          <motion.div key="ov" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="grid sm:grid-cols-2 gap-4">
            <Card>
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Activity size={16} style={{ color:'var(--color-success)' }}/>Активный план</h3>
              {activePlan ? (
                <>
                  <p className="font-medium mb-2">{activePlan.name}</p>
                  <PBar value={activePlan.phases.filter(p=>p.completed).length} max={activePlan.phases.length||1} label="Прогресс фаз"/>
                  <p className="text-sm mt-2" style={{ color:'var(--color-text-secondary)' }}>{activePlan.totalDays} дней · {activePlan.phases.length} фаз</p>
                  <Btn size="sm" className="mt-3 w-full" onClick={()=>{ useAppStore.getState().setCurrentPlan(activePlan); setCurrentPage('plan-builder'); }} icon={<Eye size={15}/>}>Открыть план</Btn>
                </>
              ) : (
                <>
                  <p className="text-sm mb-3" style={{ color:'var(--color-text-secondary)' }}>Нет активного плана</p>
                  <Btn size="sm" onClick={()=>setCurrentPage('new-case')} icon={<Plus size={15}/>}>Создать план</Btn>
                </>
              )}
            </Card>
            <Card>
              <h3 className="font-semibold mb-3">Статистика</h3>
              <div className="space-y-3">
                {[
                  { l:'Всего планов',       v:patPlans.length },
                  { l:'Активных',           v:patPlans.filter(p=>p.status==='active').length },
                  { l:'Завершённых',        v:patPlans.filter(p=>p.status==='completed').length },
                ].map(s=>(
                  <div key={s.l} className="flex justify-between">
                    <span style={{ color:'var(--color-text-secondary)' }}>{s.l}</span>
                    <span className="font-semibold">{s.v}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
        {tab==='plans' && (
          <motion.div key="pl" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-3">
            {patPlans.length===0
              ? <EmptyState icon={<FileText size={32}/>} title="Нет планов" action={<Btn onClick={()=>setCurrentPage('new-case')} icon={<Plus size={16}/>}>Создать план</Btn>}/>
              : patPlans.map(plan=>(
                  <Card key={plan.id} hover onClick={()=>{ useAppStore.getState().setCurrentPlan(plan); setCurrentPage('plan-builder'); }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{plan.name}</p>
                        <p className="text-sm" style={{ color:'var(--color-text-secondary)' }}>{formatRU(plan.createdAt)} · {plan.totalDays} дней</p>
                      </div>
                      <Bdg variant={plan.status==='active'?'success':plan.status==='completed'?'info':plan.status==='paused'?'warning':'error'}>
                        {plan.status==='active'?'Активный':plan.status==='completed'?'Завершён':plan.status==='paused'?'Приост.':'Черновик'}
                      </Bdg>
                    </div>
                  </Card>
                ))
            }
          </motion.div>
        )}
        {tab==='sessions' && (
          <motion.div key="se" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <EmptyState icon={<Clock size={32}/>} title="История сеансов" desc="История сеансов будет отображаться здесь"/>
          </motion.div>
        )}
      </AnimatePresence>
    </Pg>
  );
}

// ==========================================
// New Case Page (5-step wizard)
// ==========================================

function NewCasePage() {
  const { setCurrentPage, currentPatient, setCurrentPatient, addToast } = useAppStore();
  const { addPatient } = usePatientsStore();
  const { addPlan } = usePlansStore();

  const [step, setStep]           = useState(currentPatient ? 2 : 1);
  const [diagRunning, setDiagRunning] = useState(false);
  const [patientData, setPatData] = useState<Partial<Patient>>({ firstName:currentPatient?.firstName||'', lastName:currentPatient?.lastName||'', middleName:currentPatient?.middleName||'', gender:currentPatient?.gender||'male', phone:currentPatient?.phone||'', birthDate:currentPatient?.birthDate||'', tags:[] });
  const [tagInput, setTagInput]   = useState('');
  const [selSymptoms, setSelSymp] = useState<{id:string;severity:number}[]>([]);
  const [activeCat, setActiveCat] = useState('physical');
  const [diagnosis, setDiagnosis] = useState<ExtendedDiagnosisResult|null>(null);
  const [selProgId, setSelProgId] = useState('');
  const [planName, setPlanName]   = useState('');

  const cats = [{ id:'physical',label:'🩺 Физические' },{ id:'emotional',label:'💭 Эмоциональные' },{ id:'spiritual',label:'🤲 Духовные' },{ id:'sleep',label:'🌙 Сон' },{ id:'social',label:'👥 Социальные' }];

  const toggleSym = (id:string) => setSelSymp(prev=>prev.find(s=>s.id===id)?prev.filter(s=>s.id!==id):[...prev,{id,severity:3}]);
  const setSev    = (id:string, v:number) => setSelSymp(prev=>prev.map(s=>s.id===id?{...s,severity:v}:s));
  const addTag    = () => { const t=tagInput.trim(); if(t&&!patientData.tags?.includes(t)){ setPatData(d=>({...d,tags:[...(d.tags||[]),t]})); setTagInput(''); } };

  const STEP_LABELS = ['Пациент','Симптомы','Диагноз','Программа','Итог'];

  const go1 = async()=>{
    if(!patientData.firstName||!patientData.lastName){ addToast({ message:'Заполните имя и фамилию',type:'error' }); return; }
    if(currentPatient){ setStep(2); return; }
    const p = await addPatient(patientData as Omit<Patient,'id'|'createdAt'|'updatedAt'>);
    setCurrentPatient(p); addToast({ message:'Пациент добавлен',type:'success' }); setStep(2);
  };

  const go2 = ()=>{
    if(selSymptoms.length===0){ addToast({ message:'Выберите хотя бы один симптом',type:'warning' }); return; }
    setDiagRunning(true);
    setTimeout(()=>{
      const r = diagnose({ patientId:currentPatient?.id||'', symptoms:selSymptoms.map(s=>({ symptomId:s.id,severity:s.severity as any,recordedAt:new Date().toISOString() })) });
      setDiagnosis(r);
      setDiagRunning(false);
      const map: Record<string,string> = { ain:'ain_basic',sihr:'sihr_standard',mass:'mass_standard',hasad:'hasad_basic',jinn:'mass_standard',nafs:'spiritual_development' };
      setSelProgId(r.primaryCause ? (map[r.primaryCause.causeId]||'universal_cleansing') : 'universal_cleansing');
      setStep(3);
    }, 900);
  };

  const go4 = async()=>{
    if(!currentPatient){ addToast({ message:'Пациент не найден',type:'error' }); return; }
    const prog = getProgram(selProgId);
    if(!prog){ addToast({ message:'Выберите программу',type:'error' }); return; }
    const phases: PlanPhase[] = prog.phases.map(ph=>({
      id:nanoid(), name:ph.name, description:ph.description, startDay:ph.startDay, endDay:ph.endDay, completed:false,
      steps:ph.formulaIds.map(fid=>{ const f=getFormula(fid); return { id:nanoid(),formulaId:fid,formula:f,timeOfDay:'any' as const,repeats:f?.repeats||1,method:f?.method||'recite_patient',completed:false }; })
    }));
    const name = planName || prog.name;
    let notes = '';
    if(diagnosis?.causes.length){ notes = 'Диагноз:\n'+diagnosis.causes.map(c=>`• ${c.name} — ${c.confidence}%`).join('\n'); }
    await addPlan({ patientId:currentPatient.id, diagnosisId:diagnosis?.id||nanoid(), name, startDate:new Date().toISOString(), status:'active', phases, totalDays:prog.duration, source:'template', notes });
    addToast({ message:'План создан! 🎉',type:'success' }); setCurrentPage('patient-detail');
  };

  const progress = ((step-1)/4)*100;

  return (
    <Pg>
      <div className="flex items-center gap-3">
        <Btn variant="ghost" onClick={()=>setCurrentPage('dashboard')} icon={<ArrowLeft size={18}/>}>Отмена</Btn>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            {STEP_LABELS.map((l,i)=>(
              <div key={i} className="flex flex-col items-center gap-1">
                <motion.div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  animate={{ backgroundColor:step>i+1?'var(--color-success)':step===i+1?'var(--color-primary)':'var(--color-border)', color:step>=i+1?'white':'var(--color-text-secondary)' }} transition={{ duration:.2 }}>
                  {step>i+1 ? <CheckCircle size={14}/> : i+1}
                </motion.div>
                <span className="text-xs hidden sm:block" style={{ color:step===i+1?'var(--color-primary)':'var(--color-text-secondary)' }}>{l}</span>
              </div>
            ))}
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor:'var(--color-border)' }}>
            <motion.div className="h-full rounded-full" style={{ backgroundColor:'var(--color-primary)' }} animate={{ width:`${progress}%` }} transition={{ duration:.4 }}/>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step===1 && (
          <motion.div key="s1" initial={{ opacity:0,x:30 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-30 }}>
            <Card>
              <h2 className="text-lg font-semibold mb-4">👤 Данные пациента</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Inp label="Фамилия *" value={patientData.lastName||''} onChange={v=>setPatData(d=>({...d,lastName:v}))}/>
                  <Inp label="Имя *"     value={patientData.firstName||''} onChange={v=>setPatData(d=>({...d,firstName:v}))}/>
                  <Inp label="Отчество"  value={patientData.middleName||''} onChange={v=>setPatData(d=>({...d,middleName:v}))}/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Sel label="Пол" value={patientData.gender||'male'} onChange={v=>setPatData(d=>({...d,gender:v as any}))} options={[{value:'male',label:'♂ Мужской'},{value:'female',label:'♀ Женский'}]}/>
                  <Inp label="Телефон" value={patientData.phone||''} onChange={v=>setPatData(d=>({...d,phone:v}))} placeholder="+7..."/>
                  <Inp label="Дата рождения" type="date" value={patientData.birthDate||''} onChange={v=>setPatData(d=>({...d,birthDate:v}))}/>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color:'var(--color-text)' }}>Теги</label>
                  <div className="flex gap-2 mb-2">
                    <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTag()} placeholder="Добавить тег..." className="input flex-1"/>
                    <Btn variant="secondary" size="sm" onClick={addTag} icon={<Plus size={14}/>}>+</Btn>
                  </div>
                  <div className="flex flex-wrap gap-2">{(patientData.tags||[]).map(t=><Chip key={t} label={t} selected onRemove={()=>setPatData(d=>({...d,tags:(d.tags||[]).filter(x=>x!==t)}))}/>)}</div>
                </div>
                <div className="flex justify-end"><Btn onClick={go1} icon={<ChevronRight size={18}/>}>Далее</Btn></div>
              </div>
            </Card>
          </motion.div>
        )}

        {step===2 && (
          <motion.div key="s2" initial={{ opacity:0,x:30 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-30 }}>
            <Card>
              <h2 className="text-lg font-semibold mb-4">🩺 Симптомы</h2>
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                {cats.map(c=><Chip key={c.id} label={c.label} selected={activeCat===c.id} onClick={()=>setActiveCat(c.id)}/>)}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={activeCat} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {getSymptomsByCategory(activeCat).map(sym=>{
                    const sel = selSymptoms.find(s=>s.id===sym.id);
                    return (
                      <motion.div key={sym.id} whileTap={{ scale:.97 }} onClick={()=>toggleSym(sym.id)}
                        role="button" tabIndex={0} onKeyDown={e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggleSym(sym.id); } }}
                        className="p-3 rounded-xl text-left text-sm border-2 transition-all cursor-pointer" style={{ backgroundColor:sel?'var(--color-primary)':'var(--color-surface)', borderColor:sel?'var(--color-primary)':'var(--color-border)', color:sel?'white':'inherit' }}>
                        <p className="font-medium leading-snug">{sym.name}</p>
                        {sel && <div className="flex gap-0.5 mt-2">{[1,2,3,4,5].map(lv=><button key={lv} onClick={e=>{e.stopPropagation();setSev(sym.id,lv);}} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor:sel.severity>=lv?'rgba(255,255,255,.85)':'rgba(255,255,255,.25)' }}/>)}</div>}
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
              {selSymptoms.length>0 && (
                <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor:'var(--color-background)' }}>
                  <p className="text-sm font-medium mb-2">Выбрано: {selSymptoms.length}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selSymptoms.map(s=>{ const sym=SYMPTOMS.find(sy=>sy.id===s.id); return sym ? (
                      <motion.span key={s.id} layout initial={{ scale:0 }} animate={{ scale:1 }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white" style={{ backgroundColor:'var(--color-primary)' }}>
                        {sym.name} <span className="opacity-70">({s.severity}/5)</span>
                        <button onClick={()=>toggleSym(s.id)} className="ml-0.5 hover:opacity-70"><X size={11}/></button>
                      </motion.span>
                    ) : null; })}
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <Btn variant="ghost" onClick={()=>setStep(1)} icon={<ArrowLeft size={18}/>}>Назад</Btn>
                <Btn onClick={go2} loading={diagRunning} icon={diagRunning?undefined:<Activity size={18}/>}>{diagRunning?'Анализирую...':'Диагностировать'}</Btn>
              </div>
            </Card>
          </motion.div>
        )}

        {step===3 && diagnosis && (
          <motion.div key="s3" initial={{ opacity:0,x:30 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-30 }} className="space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">✅ Диагностика</h2>
                <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor:`${diagnosis.urgencyLevel==='high'?'var(--color-error)':diagnosis.urgencyLevel==='medium'?'var(--color-warning)':'var(--color-success)'}20`, color:diagnosis.urgencyLevel==='high'?'var(--color-error)':diagnosis.urgencyLevel==='medium'?'var(--color-warning)':'var(--color-success)' }}>
                  Срочность: {URGENCY_LABELS[diagnosis.urgencyLevel]}
                </span>
              </div>
              <PBar value={diagnosis.confidence} label={`Уверенность: ${diagnosis.confidence}%`}/>
              <div className="space-y-3 mt-4">
                {diagnosis.causes.length===0 && <p style={{ color:'var(--color-text-secondary)' }}>Добавьте больше симптомов для точного диагноза</p>}
                {diagnosis.causes.map((cause,i)=>(
                  <motion.div key={cause.causeId} initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*.1 }}
                    className="p-3 rounded-xl" style={{ backgroundColor:`${CAUSE_COLORS[cause.causeId]||'#666'}15`, border:`1px solid ${CAUSE_COLORS[cause.causeId]||'#666'}30` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor:CAUSE_COLORS[cause.causeId]||'#666' }}/>
                        <span className="font-semibold text-sm">{cause.name}</span>
                        {i===0 && <Bdg variant="warning">Основная</Bdg>}
                      </div>
                      <span className="font-bold text-sm" style={{ color:CAUSE_COLORS[cause.causeId]||'#666' }}>{cause.confidence}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor:'var(--color-border)' }}>
                      <motion.div className="h-full rounded-full" style={{ backgroundColor:CAUSE_COLORS[cause.causeId]||'#666' }} initial={{ width:0 }} animate={{ width:`${cause.confidence}%` }} transition={{ duration:.7,delay:i*.1 }}/>
                    </div>
                    {cause.affectedOrgans.length>0 && <p className="text-xs mt-1.5" style={{ color:'var(--color-text-secondary)' }}>Затронуто: {cause.affectedOrgans.join(', ')}</p>}
                  </motion.div>
                ))}
              </div>
            </Card>
            {diagnosis.recommendations.length>0 && (
              <Card>
                <h3 className="font-semibold mb-3">💡 Рекомендации</h3>
                <ul className="space-y-2">{diagnosis.recommendations.map((r,i)=>(<motion.li key={i} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*.1 }} className="flex gap-2 text-sm"><CheckCircle size={16} className="mt-0.5 shrink-0" style={{ color:'var(--color-success)' }}/>{r}</motion.li>))}</ul>
              </Card>
            )}
            <div className="flex justify-between">
              <Btn variant="ghost" onClick={()=>setStep(2)} icon={<ArrowLeft size={18}/>}>Назад</Btn>
              <Btn onClick={()=>setStep(4)} icon={<ChevronRight size={18}/>}>Выбрать программу</Btn>
            </div>
          </motion.div>
        )}

        {step===4 && (
          <motion.div key="s4" initial={{ opacity:0,x:30 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-30 }}>
            <Card>
              <h2 className="text-lg font-semibold mb-4">📋 Выбор программы</h2>
              <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
                {PROGRAMS.map(prog=>(
                  <motion.div key={prog.id} whileHover={{ scale:1.003 }} whileTap={{ scale:.998 }}
                    onClick={()=>setSelProgId(prog.id)}
                    className="p-4 rounded-xl border-2 cursor-pointer transition-all"
                    style={{ borderColor:selProgId===prog.id?'var(--color-primary)':'var(--color-border)', backgroundColor:selProgId===prog.id?'color-mix(in srgb, var(--color-primary) 8%, transparent)':'transparent' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">{prog.name}</p>
                          {selProgId===prog.id && <motion.div initial={{ scale:0 }} animate={{ scale:1 }}><CheckCircle size={15} style={{ color:'var(--color-primary)' }}/></motion.div>}
                        </div>
                        <p className="text-xs mb-2" style={{ color:'var(--color-text-secondary)' }}>{prog.description}</p>
                        <div className="flex flex-wrap gap-1">{prog.tags.slice(0,4).map((t,i)=><Bdg key={i} variant="info">{t}</Bdg>)}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <Bdg variant={prog.difficulty==='easy'?'success':prog.difficulty==='medium'?'warning':'error'}>{prog.difficulty==='easy'?'Лёгкая':prog.difficulty==='medium'?'Средняя':'Сложная'}</Bdg>
                        <p className="text-sm mt-1 font-semibold">{prog.duration} дн.</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <Btn variant="ghost" onClick={()=>setStep(3)} icon={<ArrowLeft size={18}/>}>Назад</Btn>
                <Btn onClick={()=>setStep(5)} disabled={!selProgId} icon={<ChevronRight size={18}/>}>Далее</Btn>
              </div>
            </Card>
          </motion.div>
        )}

        {step===5 && (
          <motion.div key="s5" initial={{ opacity:0,x:30 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-30 }}>
            <Card>
              <h2 className="text-lg font-semibold mb-4">✅ Подтверждение</h2>
              <div className="space-y-4">
                <Inp label="Название плана" value={planName} onChange={setPlanName} placeholder={getProgram(selProgId)?.name||''}/>
                <div className="grid sm:grid-cols-2 gap-3">
                  {currentPatient && (
                    <div className="p-4 rounded-xl" style={{ backgroundColor:'var(--color-background)' }}>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color:'var(--color-text-secondary)' }}>Пациент</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor:'var(--color-primary)' }}>{currentPatient.firstName[0]}{currentPatient.lastName[0]}</div>
                        <div><p className="font-semibold">{currentPatient.lastName} {currentPatient.firstName}</p>{currentPatient.phone&&<p className="text-sm" style={{ color:'var(--color-text-secondary)' }}>{currentPatient.phone}</p>}</div>
                      </div>
                    </div>
                  )}
                  {selProgId && (
                    <div className="p-4 rounded-xl" style={{ backgroundColor:'var(--color-background)' }}>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color:'var(--color-text-secondary)' }}>Программа</p>
                      <p className="font-semibold">{getProgram(selProgId)?.name}</p>
                      <p className="text-sm" style={{ color:'var(--color-text-secondary)' }}>{getProgram(selProgId)?.duration} дней · {getProgram(selProgId)?.phases.length} фаз</p>
                    </div>
                  )}
                </div>
                {diagnosis?.primaryCause && (
                  <div className="p-3 rounded-xl flex items-center gap-3" style={{ backgroundColor:`${CAUSE_COLORS[diagnosis.primaryCause.causeId]}15`, border:`1px solid ${CAUSE_COLORS[diagnosis.primaryCause.causeId]}30` }}>
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor:CAUSE_COLORS[diagnosis.primaryCause.causeId] }}/>
                    <div><p className="text-sm font-medium">Диагноз: {diagnosis.primaryCause.name}</p><p className="text-xs" style={{ color:'var(--color-text-secondary)' }}>Уверенность: {diagnosis.confidence}%</p></div>
                  </div>
                )}
                <div className="flex justify-between">
                  <Btn variant="ghost" onClick={()=>setStep(4)} icon={<ArrowLeft size={18}/>}>Назад</Btn>
                  <Btn onClick={go4} icon={<CheckCircle size={18}/>}>Создать план</Btn>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Pg>
  );
}

// ==========================================
// Plans Page
// ==========================================

function PlansPage() {
  const { setCurrentPage, addToast } = useAppStore();
  const { plans, loadPlans, deletePlan } = usePlansStore();
  const { patients, loadPatients } = usePatientsStore();
  const [delTarget, setDelTarget] = useState<{id:string;name:string}|null>(null);

  useEffect(()=>{ loadPlans(); loadPatients(); },[]);

  const getPatName = (pid:string) => { const p=patients.find(pt=>pt.id===pid); return p?`${p.lastName} ${p.firstName}`:'—'; };
  const statusV: Record<string,any> = { active:'success',completed:'info',paused:'warning',draft:'info',cancelled:'error' };
  const statusL: Record<string,string> = { active:'Активный',completed:'Завершён',paused:'Приост.',draft:'Черновик',cancelled:'Отменён' };

  return (
    <Pg>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Планы лечения</h2>
        <Btn onClick={()=>setCurrentPage('new-case')} icon={<Plus size={16}/>}>Новый план</Btn>
      </div>
      <AnimatePresence mode="wait">
        {plans.length===0
          ? <motion.div key="e" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <EmptyState icon={<FileText size={32}/>} title="Нет планов" desc="Создайте первый план лечения" action={<Btn onClick={()=>setCurrentPage('new-case')} icon={<Plus size={16}/>}>Создать план</Btn>}/>
            </motion.div>
          : <StaggerList key="list" className="space-y-2">
              {plans.map(plan=>(
                <StaggerItem key={plan.id}>
                  <Card>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 cursor-pointer" onClick={()=>{ useAppStore.getState().setCurrentPlan(plan); setCurrentPage('plan-builder'); }}>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{plan.name}</p>
                          <Bdg variant={statusV[plan.status]||'info'}>{statusL[plan.status]||plan.status}</Bdg>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm" style={{ color:'var(--color-text-secondary)' }}>
                          <span>👤 {getPatName(plan.patientId)}</span>
                          <span>{plan.totalDays} дней</span>
                          <span>{formatRU(plan.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:.9 }} onClick={()=>{ useAppStore.getState().setCurrentPlan(plan); setCurrentPage('plan-builder'); }} className="p-2 rounded-lg transition-colors"><Eye size={17}/></motion.button>
                        <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:.9 }} onClick={()=>setDelTarget({ id:plan.id,name:plan.name })} className="p-2 rounded-lg transition-colors" style={{ color:'var(--color-error)' }}><Trash2 size={17}/></motion.button>
                      </div>
                    </div>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerList>
        }
      </AnimatePresence>
      <ConfirmDlg isOpen={!!delTarget} onClose={()=>setDelTarget(null)} title="Удалить план" message={`Удалить план «${delTarget?.name}»?`}
        onConfirm={async()=>{ if(delTarget){ await deletePlan(delTarget.id); addToast({ message:'План удалён',type:'success' }); } }}/>
    </Pg>
  );
}

// ==========================================
// Plan Builder Page (full arabic + progress)
// ==========================================

function PlanBuilderPage() {
  const { setCurrentPage, currentPlan, addToast } = useAppStore();
  const { updatePlan } = usePlansStore();
  const { patients } = usePatientsStore();
  const { currentThemeId } = useSettingsStore();

  const [showExportModal, setShowExportModal] = useState(false);
  const [expFmt, setExpFmt] = useState<'html'|'pdf'|'text'>('html');
  const [expandedPhase, setExpandedPhase] = useState<string|null>(null);
  const [exporting, setExporting] = useState(false);
  const [dragSource, setDragSource] = useState<{ phaseId: string; index: number } | null>(null);

  if(!currentPlan) return (
    <Card className="text-center py-16">
      <AlertCircle size={48} className="mx-auto mb-4 opacity-40"/><h3 className="text-lg font-medium mb-2">План не выбран</h3>
      <Btn onClick={()=>setCurrentPage('plans')} icon={<ArrowLeft size={18}/>}>К списку</Btn>
    </Card>
  );

  const patient = patients.find(p=>p.id===currentPlan.patientId);
  const totalSteps = currentPlan.phases.reduce((s,ph)=>s+ph.steps.length,0);
  const doneSteps  = currentPlan.phases.reduce((s,ph)=>s+ph.steps.filter(st=>st.completed).length,0);
  const progress   = totalSteps ? Math.round((doneSteps/totalSteps)*100) : 0;
  const validation = validatePlan(currentPlan);

  const toggleStep = (phId:string, stId:string)=>{
    const updated = { ...currentPlan, phases:currentPlan.phases.map(ph=>{
      if(ph.id!==phId) return ph;
      const ns = ph.steps.map(st=>st.id===stId?{...st,completed:!st.completed}:st);
      return { ...ph,steps:ns,completed:ns.every(s=>s.completed) };
    })};
    updatePlan(updated); useAppStore.getState().setCurrentPlan(updated);
  };

  const reorderStep = (phaseId: string, fromIndex: number, toIndex: number) => {
    const updated = moveStepWithinPhase(currentPlan, phaseId, fromIndex, toIndex);
    updatePlan(updated);
    useAppStore.getState().setCurrentPlan(updated);
    addToast({ message: 'Порядок шагов обновлён', type: 'success' });
  };

  const handleExport = async()=>{
    if(!patient){ addToast({ message:'Пациент не найден',type:'error' }); return; }
    setExporting(true);
    const settings: ExportSettings = { format:expFmt as any, includeArabic:true, includeTranslation:true, includeNotes:true, themeId:currentThemeId, pageSize:'a4', language:'ru' };
    try {
      if(expFmt==='html') downloadHTML(currentPlan, patient, settings);
      else if(expFmt==='pdf') await downloadPDF(currentPlan, patient, settings);
      else downloadTextReport(currentPlan, patient);
      addToast({ message:'Документ экспортирован',type:'success' }); setShowExportModal(false);
    } catch { addToast({ message:'Ошибка экспорта',type:'error' }); }
    finally { setExporting(false); }
  };

  const statusV: Record<string,any> = { active:'success',completed:'info',paused:'warning',draft:'info',cancelled:'error' };
  const statusL: Record<string,string> = { active:'Активный',completed:'Завершён',paused:'Приост.',draft:'Черновик',cancelled:'Отменён' };

  const issueVariant = (issue: PlanValidationIssue): BV => {
    if (issue.severity === 'error') return 'error';
    if (issue.severity === 'warning') return 'warning';
    return 'info';
  };

  return (
    <Pg>
      <div className="flex items-center justify-between">
        <Btn variant="ghost" onClick={()=>setCurrentPage('plans')} icon={<ArrowLeft size={18}/>}>Назад</Btn>
        <div className="flex gap-2">
          <Btn variant="secondary" size="sm" onClick={()=>{ const u={...currentPlan,phases:currentPlan.phases.map(ph=>({...ph,completed:false,steps:ph.steps.map(st=>({...st,completed:false}))}))}; updatePlan(u); useAppStore.getState().setCurrentPlan(u); addToast({ message:'Прогресс сброшен',type:'info' }); }} icon={<RotateCcw size={15}/>}>Сброс</Btn>
          <Btn size="sm" onClick={()=>setShowExportModal(true)} icon={<Download size={16}/>}>Экспорт</Btn>
        </div>
      </div>

      <Card>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold">{currentPlan.name}</h2>
            <div className="flex flex-wrap gap-3 mt-1 text-sm" style={{ color:'var(--color-text-secondary)' }}>
              {patient && <span>👤 {patient.lastName} {patient.firstName}</span>}
              <span>📅 {formatRU(currentPlan.startDate)}</span>
              <span>⏱ {currentPlan.totalDays} дней</span>
            </div>
          </div>
          <Bdg variant={statusV[currentPlan.status]||'info'}>{statusL[currentPlan.status]||currentPlan.status}</Bdg>
        </div>
        <PBar value={doneSteps} max={totalSteps||1} label={`Прогресс: ${doneSteps}/${totalSteps} шагов (${progress}%)`}/>
        {progress===100 && (
          <motion.div initial={{ opacity:0,scale:.9 }} animate={{ opacity:1,scale:1 }} className="mt-4 p-3 rounded-xl text-center" style={{ backgroundColor:'color-mix(in srgb, var(--color-success) 15%, transparent)', border:'1px solid var(--color-success)' }}>
            <p className="font-semibold" style={{ color:'var(--color-success)' }}>🎉 Все шаги выполнены! Алхамдулиллях!</p>
          </motion.div>
        )}
      </Card>

      {/* Logic Validator */}
      <Card>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Shield size={18} style={{ color: validation.isValid ? 'var(--color-success)' : 'var(--color-warning)' }} />
              Проверка логики плана
            </h3>
            <p className="text-sm mt-1" style={{ color:'var(--color-text-secondary)' }}>
              Автоматическая проверка перегрузки, пропусков и конфликтов методики
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold" style={{ color: validation.score >= 80 ? 'var(--color-success)' : validation.score >= 50 ? 'var(--color-warning)' : 'var(--color-error)' }}>
              {validation.score}
            </p>
            <p className="text-xs" style={{ color:'var(--color-text-secondary)' }}>баллов</p>
          </div>
        </div>

        {validation.issues.length === 0 ? (
          <div className="p-3 rounded-xl flex items-center gap-2" style={{ backgroundColor:'color-mix(in srgb, var(--color-success) 10%, transparent)' }}>
            <CheckCircle size={18} style={{ color:'var(--color-success)' }} />
            <span className="text-sm">Критических замечаний нет. План выглядит логичным.</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-3">
              {validation.summary.errors > 0 && <Bdg variant="error">Ошибки: {validation.summary.errors}</Bdg>}
              {validation.summary.warnings > 0 && <Bdg variant="warning">Предупреждения: {validation.summary.warnings}</Bdg>}
              {validation.summary.info > 0 && <Bdg variant="info">Инфо: {validation.summary.info}</Bdg>}
            </div>
            {validation.issues.slice(0, 6).map(issue => (
              <motion.div key={issue.id} initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} className="p-3 rounded-xl border"
                style={{ backgroundColor:'var(--color-background)', borderColor:'var(--color-border)' }}>
                <div className="flex items-start gap-3">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" style={{ color: issue.severity === 'error' ? 'var(--color-error)' : issue.severity === 'warning' ? 'var(--color-warning)' : 'var(--color-info)' }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{issue.title}</p>
                      <Bdg variant={issueVariant(issue)}>{issue.severity}</Bdg>
                    </div>
                    <p className="text-sm" style={{ color:'var(--color-text-secondary)' }}>{issue.message}</p>
                    {issue.recommendation && <p className="text-xs mt-1" style={{ color:'var(--color-primary)' }}>{issue.recommendation}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
            {validation.issues.length > 6 && (
              <p className="text-xs" style={{ color:'var(--color-text-secondary)' }}>
                Показано 6 из {validation.issues.length} замечаний.
              </p>
            )}
          </div>
        )}
      </Card>

      <div className="space-y-3">
        {currentPlan.phases.map((phase,pIdx)=>{
          const phProg = phase.steps.length ? Math.round((phase.steps.filter(s=>s.completed).length/phase.steps.length)*100) : 0;
          const isExp = expandedPhase===phase.id || expandedPhase===null;

          return (
            <Card key={phase.id}>
              <div className="flex items-center justify-between cursor-pointer" onClick={()=>setExpandedPhase(isExp&&expandedPhase===phase.id?null:phase.id)}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white`} style={{ backgroundColor:phase.completed?'var(--color-success)':'var(--color-primary)' }}>
                    {phase.completed ? <CheckCircle size={18}/> : pIdx+1}
                  </div>
                  <div>
                    <p className="font-semibold">{phase.name}</p>
                    <p className="text-xs" style={{ color:'var(--color-text-secondary)' }}>Дни {phase.startDay}–{phase.endDay} · {phProg}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">{phase.completed && <Bdg variant="success">✓</Bdg>}{isExp?<ChevronUp size={18} className="opacity-50"/>:<ChevronDown size={18} className="opacity-50"/>}</div>
              </div>
              <AnimatePresence>
                {isExp && (
                  <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:'auto' }} exit={{ opacity:0,height:0 }} transition={{ duration:.2 }} className="mt-4 space-y-2 overflow-hidden">
                    {phase.description && <p className="text-sm mb-3" style={{ color:'var(--color-text-secondary)' }}>{phase.description}</p>}
                    {phase.steps.map((step, stepIndex)=>{
                      const f = step.formula||getFormula(step.formulaId);
                      if(!f) return null;
                      return (
                        <motion.div key={step.id} layout draggable
                          onDragStart={(event)=>{
                            setDragSource({ phaseId: phase.id, index: stepIndex });
                            const dataTransfer = (event as any).dataTransfer;
                            if (dataTransfer) {
                              dataTransfer.effectAllowed = 'move';
                              dataTransfer.setData('text/plain', `${phase.id}:${stepIndex}`);
                            }
                          }}
                          onDragOver={(event)=>{
                            event.preventDefault();
                            event.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={(event)=>{
                            event.preventDefault();
                            const source = dragSource;
                            if (source && source.phaseId === phase.id) reorderStep(phase.id, source.index, stepIndex);
                            else addToast({ message:'Перетаскивание между фазами будет добавлено отдельно', type:'info' });
                            setDragSource(null);
                          }}
                          onDragEnd={()=>setDragSource(null)}
                          className="p-4 rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing"
                          style={{ borderColor:step.completed?'var(--color-success)':'var(--color-border)', backgroundColor:dragSource?.phaseId===phase.id && dragSource.index===stepIndex ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)' : step.completed?'color-mix(in srgb, var(--color-success) 6%, transparent)':'transparent' }}>
                          <div className="flex gap-3">
                            <div className="mt-1 text-lg leading-none select-none" style={{ color:'var(--color-text-secondary)' }} title="Перетащите для изменения порядка">⋮⋮</div>
                            <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:.9 }}
                              onClick={()=>toggleStep(phase.id,step.id)}
                              className="mt-1 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors"
                              style={{ borderColor:step.completed?'var(--color-success)':'var(--color-border)', backgroundColor:step.completed?'var(--color-success)':'transparent' }}>
                              {step.completed && <CheckCircle size={13} className="text-white"/>}
                            </motion.button>
                            <div className="flex-1">
                              <p className={`font-semibold ${step.completed?'line-through opacity-60':''}`}>{f.name}</p>
                              {f.arabic && <p className="arabic-text text-xl mt-2 text-right leading-loose" style={{ fontFamily:'Amiri, serif' }}>{f.arabic}</p>}
                              {f.transliteration && <p className="text-sm mt-1 italic" style={{ color:'var(--color-text-secondary)' }}>{f.transliteration}</p>}
                              {f.translation && <p className="text-sm mt-1">{f.translation}</p>}
                              <div className="flex flex-wrap gap-3 mt-2 text-xs" style={{ color:'var(--color-text-secondary)' }}>
                                <span>🔁 {step.repeats}×</span><span>📖 {f.source}</span>
                                {f.duration && <span>⏱ {f.duration}</span>}
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
        <Card><h3 className="font-semibold mb-2">📝 Примечания</h3><pre className="text-sm whitespace-pre-wrap" style={{ color:'var(--color-text-secondary)',fontFamily:'inherit' }}>{currentPlan.notes}</pre></Card>
      )}

      <Modal isOpen={showExportModal} onClose={()=>setShowExportModal(false)} title="Экспорт плана">
        <div className="space-y-4">
          <Sel label="Формат" value={expFmt} onChange={v=>setExpFmt(v as any)}
            options={[{ value:'html',label:'🌐 HTML (красивый, с арабским)' },{ value:'pdf',label:'📄 PDF файл' },{ value:'text',label:'📝 Текстовый файл' }]}/>
          <div className="flex justify-end gap-2">
            <Btn variant="ghost" onClick={()=>setShowExportModal(false)}>Отмена</Btn>
            <Btn onClick={handleExport} loading={exporting} icon={<Download size={16}/>}>Скачать</Btn>
          </div>
        </div>
      </Modal>
    </Pg>
  );
}

// ==========================================
// Library Page
// ==========================================

function LibraryPage() {
  const { setCurrentPage } = useAppStore();
  const [activeTab, setActiveTab] = useState<'formulas'|'programs'>('formulas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selFormula, setSelFormula] = useState<Formula|null>(null);

  const filteredFormulas = searchQuery ? searchFormulas(searchQuery) : FORMULAS;
  const filteredPrograms = searchQuery ? searchPrograms(searchQuery) : PROGRAMS;

  return (
    <Pg>
      <Inp value={searchQuery} onChange={setSearchQuery} placeholder="Поиск по библиотеке..." icon={<Search size={16}/>}/>
      <div className="flex gap-2">
        <Chip label={`Формулы (${FORMULAS.length})`} selected={activeTab==='formulas'} onClick={()=>setActiveTab('formulas')}/>
        <Chip label={`Программы (${PROGRAMS.length})`} selected={activeTab==='programs'} onClick={()=>setActiveTab('programs')}/>
        <Chip label="99 имён" selected={false} onClick={()=>setCurrentPage('attributes')}/>
      </div>
      <AnimatePresence mode="wait">
        {activeTab==='formulas' ? (
          <StaggerList key="f" className="space-y-2">
            {filteredFormulas.map(f=>(
              <StaggerItem key={f.id}>
                <Card hover onClick={()=>setSelFormula(f)}>
                  <p className="font-semibold">{f.name}</p>
                  <p className="arabic-text text-lg mt-1 text-right truncate" style={{ color:'var(--color-text-secondary)', fontFamily:'Amiri, serif' }}>{f.arabic.length>80?f.arabic.substring(0,80)+'…':f.arabic}</p>
                  <div className="flex flex-wrap gap-1 mt-2">{f.tags.map((t,i)=><Bdg key={i} variant="info">{t}</Bdg>)}</div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerList>
        ) : (
          <StaggerList key="p" className="space-y-2">
            {filteredPrograms.map(prog=>(
              <StaggerItem key={prog.id}>
                <Card>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold">{prog.name}</p>
                      <p className="text-sm mt-0.5" style={{ color:'var(--color-text-secondary)' }}>{prog.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">{prog.tags.slice(0,4).map((t,i)=><Bdg key={i} variant="info">{t}</Bdg>)}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <Bdg variant={prog.difficulty==='easy'?'success':prog.difficulty==='medium'?'warning':'error'}>{prog.difficulty==='easy'?'Лёгкая':prog.difficulty==='medium'?'Средняя':'Сложная'}</Bdg>
                      <p className="text-sm mt-1 font-semibold">{prog.duration} дн.</p>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </AnimatePresence>

      <Modal isOpen={!!selFormula} onClose={()=>setSelFormula(null)} title={selFormula?.name||''} size="lg">
        {selFormula && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor:'var(--color-background)' }}>
              <p className="arabic-text text-2xl leading-loose" style={{ fontFamily:'Amiri, serif' }}>{selFormula.arabic}</p>
            </div>
            <div><p className="font-medium mb-1 text-sm" style={{ color:'var(--color-text-secondary)' }}>Транслитерация:</p><p className="text-sm italic">{selFormula.transliteration}</p></div>
            <div><p className="font-medium mb-1 text-sm" style={{ color:'var(--color-text-secondary)' }}>Перевод:</p><p className="text-sm">{selFormula.translation}</p></div>
            <div className="flex flex-wrap gap-4 text-sm" style={{ color:'var(--color-text-secondary)' }}>
              <span>🔁 {selFormula.repeats}×</span><span>📖 {selFormula.source}</span>{selFormula.duration&&<span>⏱ {selFormula.duration}</span>}
            </div>
            <div className="flex flex-wrap gap-2">{selFormula.tags.map((t,i)=><Bdg key={i} variant="info">{t}</Bdg>)}</div>
          </div>
        )}
      </Modal>
    </Pg>
  );
}

// ==========================================
// Diagnosis Page
// ==========================================

function DiagnosisPage() {
  const { setCurrentPage, currentPatient, addToast } = useAppStore();
  const { addPlan } = usePlansStore();
  const [selSymptoms, setSelSymp] = useState<{id:string;severity:number}[]>([]);
  const [activeCat, setActiveCat] = useState('physical');
  const [diagResult, setDiagResult] = useState<ExtendedDiagnosisResult|null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const cats = [{ id:'physical',label:'🩺 Физические' },{ id:'emotional',label:'💭 Эмоциональные' },{ id:'spiritual',label:'🤲 Духовные' },{ id:'sleep',label:'🌙 Сон' },{ id:'social',label:'👥 Социальные' }];
  const toggleSym = (id:string) => setSelSymp(prev=>prev.find(s=>s.id===id)?prev.filter(s=>s.id!==id):[...prev,{id,severity:3}]);
  const setSev    = (id:string, v:number) => setSelSymp(prev=>prev.map(s=>s.id===id?{...s,severity:v}:s));

  const run = ()=>{
    if(selSymptoms.length===0){ addToast({ message:'Выберите хотя бы один симптом',type:'warning' }); return; }
    setIsRunning(true);
    setTimeout(()=>{
      const r=diagnose({ patientId:currentPatient?.id||'anonymous', symptoms:selSymptoms.map(s=>({ symptomId:s.id,severity:s.severity as any,recordedAt:new Date().toISOString() })) });
      setDiagResult(r); setIsRunning(false); setShowResult(true);
    },900);
  };

  const createPlan = async()=>{
    if(!diagResult||!currentPatient){ addToast({ message:'Выберите пациента',type:'error' }); return; }
    const plan = buildPlan({ patientId:currentPatient.id, diagnosis:diagResult });
    const { id:_i,createdAt:_c,updatedAt:_u,...pdata } = plan as any;
    await addPlan(pdata);
    addToast({ message:'План создан на основе диагноза',type:'success' });
    setCurrentPage('plans');
  };

  const urg = diagResult?.urgencyLevel;
  const urgColor = urg==='high'?'var(--color-error)':urg==='medium'?'var(--color-warning)':'var(--color-success)';

  return (
    <Pg>
      <div className="flex items-center justify-between">
        <Btn variant="ghost" onClick={()=>setCurrentPage('dashboard')} icon={<ArrowLeft size={18}/>}>Назад</Btn>
        {!showResult && selSymptoms.length>0 && <Bdg variant="info">{selSymptoms.length} симптомов</Bdg>}
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor:'var(--color-primary)' }}><Activity size={20} className="text-white"/></div>
          <div>
            <h2 className="text-xl font-semibold">Диагностика</h2>
            <p className="text-sm" style={{ color:'var(--color-text-secondary)' }}>{currentPatient?`${currentPatient.lastName} ${currentPatient.firstName}`:'Выберите пациента'}</p>
          </div>
        </div>
      </Card>

      {!showResult ? (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {cats.map(c=><Chip key={c.id} label={c.label} selected={activeCat===c.id} onClick={()=>setActiveCat(c.id)}/>)}
          </div>
          <AnimatePresence mode="wait">
            <StaggerList key={activeCat} className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {getSymptomsByCategory(activeCat).map(sym=>{
                const sel=selSymptoms.find(s=>s.id===sym.id);
                return (
                  <StaggerItem key={sym.id}>
                    <motion.div whileTap={{ scale:.97 }} onClick={()=>toggleSym(sym.id)}
                      role="button" tabIndex={0} onKeyDown={e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggleSym(sym.id); } }}
                      className="w-full p-3 rounded-xl text-left text-sm border-2 transition-all cursor-pointer"
                      style={{ backgroundColor:sel?'var(--color-primary)':'var(--color-surface)', borderColor:sel?'var(--color-primary)':'var(--color-border)', color:sel?'white':'inherit' }}>
                      <p className="font-medium leading-snug">{sym.name}</p>
                      {sel && <div className="flex gap-0.5 mt-2">{[1,2,3,4,5].map(lv=><button key={lv} onClick={e=>{e.stopPropagation();setSev(sym.id,lv);}} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor:sel.severity>=lv?'rgba(255,255,255,.85)':'rgba(255,255,255,.25)' }}/>)}</div>}
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerList>
          </AnimatePresence>
          {selSymptoms.length>0 && (
            <Card>
              <p className="text-sm font-medium mb-2">Выбранные симптомы ({selSymptoms.length}):</p>
              <div className="flex flex-wrap gap-1.5">
                {selSymptoms.map(s=>{ const sym=SYMPTOMS.find(sy=>sy.id===s.id); return sym?(
                  <motion.span key={s.id} layout initial={{ scale:0 }} animate={{ scale:1 }}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white" style={{ backgroundColor:'var(--color-primary)' }}>
                    {sym.name} <span className="opacity-70">({s.severity}/5)</span>
                    <button onClick={()=>toggleSym(s.id)} className="ml-0.5 hover:opacity-70"><X size={11}/></button>
                  </motion.span>
                ):null; })}
              </div>
            </Card>
          )}
          <Btn onClick={run} loading={isRunning} className="w-full py-3" icon={isRunning?undefined:<Activity size={18}/>}>
            {isRunning?'Анализирую симптомы...':'Провести диагностику'}
          </Btn>
        </>
      ) : diagResult && (
        <AnimatePresence>
          <motion.div className="space-y-4" initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Результат</h3>
                <div className="flex items-center gap-2 text-sm px-3 py-1 rounded-full" style={{ backgroundColor:`${urgColor}20`, color:urgColor }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor:urgColor }}/>
                  Срочность: {URGENCY_LABELS[diagResult.urgencyLevel]}
                </div>
              </div>
              <PBar value={diagResult.confidence} label={`Уверенность: ${diagResult.confidence}%`}/>
              <div className="space-y-3 mt-4">
                {diagResult.causes.length===0 && <p style={{ color:'var(--color-text-secondary)' }}>Недостаточно симптомов. Добавьте больше.</p>}
                {diagResult.causes.map((cause,i)=>(
                  <motion.div key={cause.causeId} initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*.1 }}
                    className="p-3 rounded-xl" style={{ backgroundColor:`${CAUSE_COLORS[cause.causeId]||'#666'}15`, border:`1px solid ${CAUSE_COLORS[cause.causeId]||'#666'}30` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor:CAUSE_COLORS[cause.causeId]||'#666' }}/>
                        <span className="font-semibold text-sm">{cause.name}</span>
                        {i===0 && <Bdg variant="warning">Основная</Bdg>}
                      </div>
                      <span className="font-bold text-sm" style={{ color:CAUSE_COLORS[cause.causeId]||'#666' }}>{cause.confidence}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor:'var(--color-border)' }}>
                      <motion.div className="h-full rounded-full" style={{ backgroundColor:CAUSE_COLORS[cause.causeId]||'#666' }} initial={{ width:0 }} animate={{ width:`${cause.confidence}%` }} transition={{ duration:.7,delay:i*.1 }}/>
                    </div>
                    {cause.affectedOrgans.length>0 && <p className="text-xs mt-1.5" style={{ color:'var(--color-text-secondary)' }}>Затронуто: {cause.affectedOrgans.join(', ')}</p>}
                  </motion.div>
                ))}
              </div>
            </Card>
            {diagResult.recommendations.length>0 && (
              <Card>
                <h3 className="font-semibold mb-3">💡 Рекомендации</h3>
                <ul className="space-y-2">{diagResult.recommendations.map((r,i)=>(<motion.li key={i} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*.1 }} className="flex gap-2 text-sm"><CheckCircle size={16} className="mt-0.5 shrink-0" style={{ color:'var(--color-success)' }}/>{r}</motion.li>))}</ul>
              </Card>
            )}
            <div className="flex gap-3">
              <Btn variant="secondary" className="flex-1" onClick={()=>{ setShowResult(false); setDiagResult(null); }}>Повторить</Btn>
              {currentPatient && <Btn className="flex-1" onClick={createPlan} icon={<Plus size={18}/>}>Создать план</Btn>}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </Pg>
  );
}

// ==========================================
// Monitoring Page
// ==========================================

function MonitoringPage() {
  const { currentPatient, setCurrentPage, addToast } = useAppStore();
  const [entries, setEntries] = useState([
    { date:new Date(Date.now()-6*86400000).toISOString(), wellbeing:3, notes:'Начало лечения' },
    { date:new Date(Date.now()-4*86400000).toISOString(), wellbeing:5, notes:'Улучшение' },
    { date:new Date(Date.now()-2*86400000).toISOString(), wellbeing:7, notes:'Значительное улучшение' },
    { date:new Date().toISOString(), wellbeing:8, notes:'Хорошее самочувствие' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newW, setNewW] = useState(5);
  const [newN, setNewN] = useState('');

  if(!currentPatient) return (
    <Card className="text-center py-16"><AlertCircle size={48} className="mx-auto mb-4 opacity-40"/>
      <p className="mb-4" style={{ color:'var(--color-text-secondary)' }}>Выберите пациента</p>
      <Btn onClick={()=>setCurrentPage('patients')} icon={<ArrowLeft size={18}/>}>К пациентам</Btn></Card>
  );

  const maxW = Math.max(...entries.map(e=>e.wellbeing), 10);

  const addEntry = ()=>{
    setEntries(prev=>[...prev,{ date:new Date().toISOString(), wellbeing:newW, notes:newN }]);
    setShowAdd(false); setNewN(''); setNewW(5);
    addToast({ message:'Запись добавлена',type:'success' });
  };

  const startW = entries[0]?.wellbeing||0;
  const lastW  = entries[entries.length-1]?.wellbeing||0;
  const diff   = lastW - startW;

  return (
    <Pg>
      <div className="flex items-center justify-between">
        <Btn variant="ghost" onClick={()=>setCurrentPage('patient-detail')} icon={<ArrowLeft size={18}/>}>Назад</Btn>
        <Btn size="sm" onClick={()=>setShowAdd(true)} icon={<Plus size={16}/>}>Добавить запись</Btn>
      </div>

      <Card>
        <h2 className="font-semibold mb-1 flex items-center gap-2"><BarChart2 size={20}/>Мониторинг</h2>
        <p className="text-sm mb-4" style={{ color:'var(--color-text-secondary)' }}>{currentPatient.lastName} {currentPatient.firstName}</p>

        {/* Chart */}
        <div className="flex items-end gap-1 h-24 mb-2">
          {entries.map((e,i)=>{
            const h = (e.wellbeing/maxW)*80;
            const color = e.wellbeing>=7?'var(--color-success)':e.wellbeing>=4?'var(--color-warning)':'var(--color-error)';
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 relative group">
                <motion.div className="w-full rounded-t-md" style={{ backgroundColor:color, height:h }} initial={{ height:0 }} animate={{ height:h }} transition={{ delay:i*.08 }}/>
                <span className="text-xs" style={{ color:'var(--color-text-secondary)' }}>{new Date(e.date).getDate()}.{new Date(e.date).getMonth()+1}</span>
                <div className="absolute -top-8 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">{e.wellbeing}/10 — {e.notes}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          {[{ l:'Начало',v:startW,c:'var(--color-error)' },{ l:'Сейчас',v:lastW,c:'var(--color-success)' },{ l:'Прирост',v:`${diff>=0?'+':''}${diff}`,c:'var(--color-primary)' }].map((s,i)=>(
            <motion.div key={i} initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:.3+i*.1 }}
              className="text-center p-3 rounded-xl" style={{ backgroundColor:`${s.c}15` }}>
              <p className="text-2xl font-bold" style={{ color:s.c }}>{s.v}</p>
              <p className="text-xs" style={{ color:'var(--color-text-secondary)' }}>{s.l}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      <div>
        <h3 className="font-semibold mb-3">История записей</h3>
        <StaggerList className="space-y-2">
          {[...entries].reverse().map((e,i)=>(
            <StaggerItem key={i}>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{smartDate(e.date)}</p>
                    <p className="text-sm mt-0.5" style={{ color:'var(--color-text-secondary)' }}>{e.notes}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color:e.wellbeing>=7?'var(--color-success)':e.wellbeing>=4?'var(--color-warning)':'var(--color-error)' }}>{e.wellbeing}</p>
                    <p className="text-xs" style={{ color:'var(--color-text-secondary)' }}>из 10</p>
                  </div>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>

      <Modal isOpen={showAdd} onClose={()=>setShowAdd(false)} title="Новая запись" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Самочувствие: <span className="text-xl font-bold">{newW}/10</span></label>
            <input type="range" min={1} max={10} value={newW} onChange={e=>setNewW(+e.target.value)} className="w-full accent-blue-500"/>
            <div className="flex justify-between text-xs mt-1" style={{ color:'var(--color-text-secondary)' }}><span>Плохо</span><span>Отлично</span></div>
          </div>
          <Inp label="Заметки" value={newN} onChange={setNewN} placeholder="Описание самочувствия..."/>
          <div className="flex justify-end gap-2">
            <Btn variant="ghost" onClick={()=>setShowAdd(false)}>Отмена</Btn>
            <Btn onClick={addEntry}>Сохранить</Btn>
          </div>
        </div>
      </Modal>
    </Pg>
  );
}

// ==========================================
// Reports Page
// ==========================================

function ReportsPage() {
  const { patients } = usePatientsStore();
  const { plans } = usePlansStore();

  const totalP    = patients.length;
  const activeP   = plans.filter(p=>p.status==='active').length;
  const doneP     = plans.filter(p=>p.status==='completed').length;
  const avgDays   = plans.length ? Math.round(plans.reduce((s,p)=>s+p.totalDays,0)/plans.length) : 0;
  const { addToast } = useAppStore();

  const download=()=>{
    const lines=['ОТЧЁТ — ПЛАН ИСЦЕЛЕНИЯ · Ash-Shifa',`Дата: ${new Date().toLocaleString('ru-RU')}`,'='.repeat(40),'','СТАТИСТИКА',`Пациентов: ${totalP}`,`Активных планов: ${activeP}`,`Завершённых: ${doneP}`,`Средняя длительность: ${avgDays} дней`,'','ПЛАНЫ',...plans.map(p=>{ const pt=patients.find(pt=>pt.id===p.patientId); return `- ${p.name} | ${pt?`${pt.lastName} ${pt.firstName}`:'—'} | ${p.status} | ${p.totalDays} дн`; })];
    const b=new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`report-${new Date().toISOString().split('T')[0]}.txt`; a.click();
    addToast({ message:'Отчёт скачан',type:'success' });
  };

  return (
    <Pg>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2"><BarChart2 size={22}/>Отчёты</h2>
        <Btn variant="secondary" size="sm" onClick={download} icon={<Download size={15}/>}>Скачать</Btn>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={22}/>}       label="Пациентов"  value={totalP}  color="var(--color-primary)"   delay={0}   />
        <StatCard icon={<Activity size={22}/>}    label="Активных"   value={activeP} color="var(--color-success)"   delay={.1}  />
        <StatCard icon={<CheckCircle size={22}/>} label="Завершено"  value={doneP}   color="var(--color-info)"      delay={.2}  />
        <StatCard icon={<Clock size={22}/>}       label="Ср. дней"   value={avgDays} color="var(--color-warning)"   delay={.3}  />
      </div>
      <Card>
        <h3 className="font-semibold mb-4">Статусы планов</h3>
        {[{ l:'Активные',v:activeP,c:'var(--color-success)' },{ l:'Завершённые',v:doneP,c:'var(--color-info)' },{ l:'Черновики',v:plans.filter(p=>p.status==='draft').length,c:'var(--color-text-secondary)' },{ l:'Приост.',v:plans.filter(p=>p.status==='paused').length,c:'var(--color-warning)' }].map((item,i)=>(
          <div key={i} className="mb-3"><PBar value={item.v} max={Math.max(plans.length,1)} label={`${item.l} (${item.v})`} color={item.c}/></div>
        ))}
      </Card>
      <Card>
        <h3 className="font-semibold mb-3">Последние пациенты</h3>
        {patients.length===0 ? <p style={{ color:'var(--color-text-secondary)' }}>Нет данных</p> : (
          <div className="space-y-2">
            {[...patients].reverse().slice(0,6).map(patient=>{
              const pp=plans.filter(p=>p.patientId===patient.id);
              return (
                <div key={patient.id} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor:'var(--color-background)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor:'var(--color-primary)' }}>{patient.firstName[0]}{patient.lastName[0]}</div>
                    <span className="font-medium text-sm">{patient.lastName} {patient.firstName}</span>
                  </div>
                  <Bdg variant={pp.some(p=>p.status==='active')?'success':'info'}>{pp.length} план{pp.length===1?'':'а'}</Bdg>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </Pg>
  );
}

// ==========================================
// Attributes Page (99 Names of Allah)
// ==========================================

function AttributesPage() {
  const [q, setQ] = useState('');
  const [selAttr, setSelAttr] = useState<typeof ALLAH_ATTRIBUTES[0]|null>(null);
  const [filt, setFilt] = useState<'all'|'healing'|'protection'>('all');
  const healingIds = ['ash-shafi','ar-rahman','ar-rahim','al-muhyi','al-qayyum','al-azim','al-mumin','an-nafi'];
  const protIds    = ['al-hafiz','al-muhaymin','al-mumin','al-qahhar','al-mani','al-wakil'];
  const filtered = (q.length>=2 ? searchAttributes(q) : ALLAH_ATTRIBUTES)
    .filter(a=>filt==='healing'?healingIds.includes(a.id):filt==='protection'?protIds.includes(a.id):true);

  return (
    <Pg>
      <div>
        <h2 className="text-xl font-semibold mb-0.5">99 имён Аллаха</h2>
        <p className="text-sm" style={{ color:'var(--color-text-secondary)' }}>أسماء الله الحسنى — {ALLAH_ATTRIBUTES.length} имён</p>
      </div>
      <Inp value={q} onChange={setQ} placeholder="Поиск по смыслу или применению..." icon={<Search size={16}/>}/>
      <div className="flex gap-2 flex-wrap">
        {[{ id:'all',label:`Все (${ALLAH_ATTRIBUTES.length})` },{ id:'healing',label:'🌿 Исцеление' },{ id:'protection',label:'🛡 Защита' }].map(f=>(
          <Chip key={f.id} label={f.label} selected={filt===f.id} onClick={()=>setFilt(f.id as any)}/>
        ))}
      </div>
      <StaggerList className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((attr,i)=>(
          <StaggerItem key={attr.id}>
            <Card hover onClick={()=>setSelAttr(attr)}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor:'var(--color-primary)' }}>
                  {i+1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="arabic-text text-2xl text-right leading-snug" style={{ fontFamily:'Amiri, serif' }}>{attr.nameAr}</p>
                  <p className="font-semibold text-sm mt-1">{attr.transliteration}</p>
                  <p className="text-xs" style={{ color:'var(--color-text-secondary)' }}>{attr.meaning}</p>
                </div>
              </div>
            </Card>
          </StaggerItem>
        ))}
      </StaggerList>
      <Modal isOpen={!!selAttr} onClose={()=>setSelAttr(null)} title={selAttr?.transliteration||''} size="md">
        {selAttr && (
          <div className="space-y-4">
            <div className="text-center p-4 rounded-xl" style={{ backgroundColor:'var(--color-background)' }}>
              <p className="arabic-text text-5xl leading-loose" style={{ fontFamily:'Amiri, serif' }}>{selAttr.nameAr}</p>
              <p className="text-lg font-semibold mt-2">{selAttr.meaning}</p>
            </div>
            <div><p className="text-sm font-medium mb-1" style={{ color:'var(--color-text-secondary)' }}>Применение в рукье:</p><p className="text-sm">{selAttr.application}</p></div>
            {selAttr.formula && (
              <div className="p-4 rounded-xl" style={{ backgroundColor:'var(--color-background)' }}>
                <p className="text-xs font-medium mb-2" style={{ color:'var(--color-text-secondary)' }}>Дуа:</p>
                <p className="arabic-text text-2xl text-center leading-loose" style={{ fontFamily:'Amiri, serif' }}>{selAttr.formula}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Pg>
  );
}

// ==========================================
// Calendar Page
// ==========================================

function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const { plans, loadPlans } = usePlansStore();
  useEffect(()=>{ loadPlans(); },[]);

  const active = plans.filter(p=>p.status==='active');
  const M=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
  const daysInMonth = new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
  const firstDay = (new Date(date.getFullYear(), date.getMonth(), 1).getDay()+6)%7;
  const days = Array.from({ length:daysInMonth },(_,i)=>i+1);
  const today = new Date();

  return (
    <Pg>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <motion.button onClick={()=>setDate(new Date(date.getFullYear(),date.getMonth()-1))} className="p-2 rounded-lg hover:bg-white/10" whileHover={{ scale:1.1 }} whileTap={{ scale:.9 }}><ChevronRight size={20} className="rotate-180"/></motion.button>
          <motion.h2 className="text-lg font-semibold" key={date.getMonth()} initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }}>{M[date.getMonth()]} {date.getFullYear()}</motion.h2>
          <motion.button onClick={()=>setDate(new Date(date.getFullYear(),date.getMonth()+1))} className="p-2 rounded-lg hover:bg-white/10" whileHover={{ scale:1.1 }} whileTap={{ scale:.9 }}><ChevronRight size={20}/></motion.button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d=>(
            <div key={d} className="p-2 text-xs font-semibold" style={{ color:'var(--color-text-secondary)' }}>{d}</div>
          ))}
          {Array.from({ length:firstDay }).map((_,i)=><div key={`e${i}`}/>)}
          {days.map((day,idx)=>{
            const isToday = day===today.getDate()&&date.getMonth()===today.getMonth()&&date.getFullYear()===today.getFullYear();
            return (
              <motion.div key={day} initial={{ opacity:0,scale:.8 }} animate={{ opacity:1,scale:1 }} transition={{ delay:idx*.01 }} whileHover={{ scale:1.1 }} whileTap={{ scale:.95 }}
                className="p-2 rounded-lg cursor-pointer text-sm transition-colors"
                style={{ backgroundColor:isToday?'var(--color-primary)':'transparent', color:isToday?'white':'inherit', fontWeight:isToday?'bold':undefined }}>
                {day}
              </motion.div>
            );
          })}
        </div>
      </Card>
      <Card>
        <h3 className="font-semibold mb-3">Активные планы</h3>
        <AnimatePresence>
          {active.length===0
            ? <p className="text-sm" style={{ color:'var(--color-text-secondary)' }}>Нет активных планов</p>
            : <StaggerList className="space-y-2">
                {active.map(plan=>(
                  <StaggerItem key={plan.id}>
                    <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor:'var(--color-background)' }}>
                      <div><p className="font-medium">{plan.name}</p><p className="text-xs" style={{ color:'var(--color-text-secondary)' }}>{plan.totalDays} дней</p></div>
                      <Bdg variant="success" pulse>Активный</Bdg>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerList>
          }
        </AnimatePresence>
      </Card>
    </Pg>
  );
}

// ==========================================
// Import Page
// ==========================================

function ImportPage() {
  const [text, setText] = useState('');
  const [importing, setImporting] = useState(false);
  const { addToast } = useAppStore();
  const { loadPatients } = usePatientsStore();
  const { loadPlans } = usePlansStore();

  const handleImport = async()=>{
    if(!text.trim()){ addToast({ message:'Введите JSON данные',type:'error' }); return; }
    setImporting(true);
    try {
      const data = JSON.parse(text);
      if(data.patients?.length) for(const p of data.patients) await usePatientsStore.getState().addPatient(p);
      if(data.plans?.length) for(const p of data.plans) await usePlansStore.getState().addPlan(p);
      await loadPatients(); await loadPlans();
      addToast({ message:`Импортировано: ${data.patients?.length||0} пациентов, ${data.plans?.length||0} планов`,type:'success' });
      setText('');
    } catch { addToast({ message:'Ошибка: неверный формат JSON',type:'error' }); }
    finally { setImporting(false); }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>)=>{
    const file = e.target.files?.[0]; if(!file) return;
    const r = new FileReader(); r.onload = ev=>setText(ev.target?.result as string); r.readAsText(file);
  };

  return (
    <Pg>
      <div>
        <h2 className="text-xl font-semibold mb-1">Импорт данных</h2>
        <p className="text-sm" style={{ color:'var(--color-text-secondary)' }}>Загрузите данные из JSON файла или вставьте JSON</p>
      </div>
      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color:'var(--color-text)' }}>Загрузить файл:</label>
            <input type="file" accept=".json" onChange={handleFile} className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-medium file:cursor-pointer" style={{ color:'var(--color-text-secondary)' }}/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color:'var(--color-text)' }}>Или вставьте JSON:</label>
            <textarea value={text} onChange={e=>setText(e.target.value)} placeholder='{"patients": [...], "plans": [...]}' className="input min-h-48 font-mono text-sm w-full resize-y"/>
          </div>
          <Btn onClick={handleImport} loading={importing} icon={<Upload size={18}/>}>Импортировать</Btn>
        </div>
      </Card>
      <Card>
        <h3 className="font-semibold mb-3">Поддерживаемый формат</h3>
        <pre className="p-4 rounded-xl text-xs overflow-x-auto" style={{ backgroundColor:'var(--color-background)', color:'var(--color-text-secondary)' }}>{`{\n  "patients": [\n    {\n      "firstName": "Имя",\n      "lastName": "Фамилия",\n      "gender": "male",\n      "phone": "+7...",\n      "tags": []\n    }\n  ],\n  "plans": [\n    {\n      "patientId": "...",\n      "name": "Название плана",\n      "status": "active",\n      "totalDays": 7,\n      "phases": []\n    }\n  ]\n}`}</pre>
      </Card>
    </Pg>
  );
}

// ==========================================
// Settings Page
// ==========================================

function SettingsPage() {
  const { currentThemeId, setCurrentThemeId, pinEnabled, setPinEnabled, autoLockMinutes, setAutoLockMinutes, animationsEnabled, setAnimationsEnabled } = useSettingsStore();
  const { addToast } = useAppStore();
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const errors = getErrors();

  const handleSetPin = async()=>{
    if(newPin.length!==4){ addToast({ message:'PIN — 4 цифры',type:'error' }); return; }
    if(newPin!==confirmPin){ addToast({ message:'PIN не совпадает',type:'error' }); return; }
    await savePin(newPin); setPinEnabled(true); setShowPinModal(false); setNewPin(''); setConfirmPin('');
    addToast({ message:'PIN установлен',type:'success' });
  };

  return (
    <Pg>
      {/* Themes */}
      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Sun size={18}/>Тема оформления</h3>
        <StaggerList className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {themes.map(theme=>(
            <StaggerItem key={theme.id}>
              <motion.button onClick={()=>{ setCurrentThemeId(theme.id); applyTheme(theme); addToast({ message:`Тема «${theme.name}» применена`,type:'success' }); }}
                className="p-3 rounded-xl border-2 w-full text-left transition-all" style={{ backgroundColor:theme.colors.surface, borderColor:currentThemeId===theme.id?theme.colors.primary:theme.colors.border }}
                whileHover={{ scale:1.04,y:-2 }} whileTap={{ scale:.96 }}>
                <div className="flex gap-1 mb-2">
                  {[theme.colors.primary,theme.colors.secondary,theme.colors.accent].map((c,i)=>(
                    <motion.div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor:c }} whileHover={{ scale:1.2 }}/>
                  ))}
                </div>
                <p className="text-xs font-medium truncate" style={{ color:theme.colors.text }}>{theme.name}</p>
                {currentThemeId===theme.id && <CheckCircle size={12} className="mt-1" style={{ color:theme.colors.primary }}/>}
              </motion.button>
            </StaggerItem>
          ))}
        </StaggerList>
      </Card>

      {/* Animations */}
      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Zap size={18}/>Анимации</h3>
        <Toggle value={animationsEnabled} onChange={v=>{ setAnimationsEnabled(v); addToast({ message:v?'Анимации включены':'Анимации отключены',type:'success' }); }} label="Анимации интерфейса" desc={animationsEnabled?'Плавные переходы и микроэффекты включены':'Все анимации отключены'}/>
        <AnimatePresence>
          {animationsEnabled && (
            <motion.p className="mt-3 text-sm p-3 rounded-xl" style={{ backgroundColor:'var(--color-background)',color:'var(--color-text-secondary)' }}
              initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:'auto' }}>
              💡 Calm Tech: плавные, ненавязчивые переходы (150–300ms)
            </motion.p>
          )}
        </AnimatePresence>
      </Card>

      {/* Security */}
      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield size={18}/>Безопасность</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="font-medium">PIN-код</p><p className="text-sm" style={{ color:'var(--color-text-secondary)' }}>{pinEnabled?'Установлен':'Не установлен'}</p></div>
            {pinEnabled
              ? <Btn variant="danger" size="sm" onClick={()=>{ removePin(); setPinEnabled(false); addToast({ message:'PIN удалён',type:'success' }); }}>Удалить</Btn>
              : <Btn size="sm" onClick={()=>setShowPinModal(true)}>Установить</Btn>
            }
          </div>
          <Sel label="Автоблокировка" value={String(autoLockMinutes)} onChange={v=>setAutoLockMinutes(+v)}
            options={[{value:'1',label:'1 минута'},{value:'5',label:'5 минут'},{value:'10',label:'10 минут'},{value:'15',label:'15 минут'},{value:'30',label:'30 минут'}]}/>
        </div>
      </Card>

      {/* Data */}
      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><DatabaseIcon size={18}/>Данные</h3>
        <Btn variant="secondary" onClick={()=>{
          const data=JSON.stringify({ patients:usePatientsStore.getState().patients, plans:usePlansStore.getState().plans, exportedAt:new Date().toISOString() },null,2);
          const b=new Blob([data],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`rukya-backup-${new Date().toISOString().split('T')[0]}.json`; a.click();
          addToast({ message:'Резервная копия создана',type:'success' });
        }} icon={<Download size={16}/>}>Экспорт данных (JSON)</Btn>
      </Card>

      {/* Error Logs */}
      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><AlertCircle size={18}/>Технический отчёт {errors.length>0 && <Bdg variant="warning">{errors.length}</Bdg>}</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <Btn variant="secondary" size="sm" onClick={()=>setShowErrors(!showErrors)} icon={<Eye size={14}/>}>{showErrors?'Скрыть':'Показать'}</Btn>
          <Btn variant="secondary" size="sm" onClick={async()=>{ const ok=await copyErrorsToClipboard(); addToast({ message:ok?'Скопировано':'Ошибка',type:ok?'success':'error' }); }} icon={<Copy size={14}/>}>Копировать</Btn>
          <Btn variant="secondary" size="sm" onClick={downloadErrors} icon={<Download size={14}/>}>Скачать</Btn>
          <Btn variant="danger" size="sm" onClick={()=>{ clearErrors(); addToast({ message:'Очищено',type:'success' }); }} icon={<Trash2 size={14}/>}>Очистить</Btn>
        </div>
        {showErrors && (
          <div className="max-h-64 overflow-y-auto space-y-2">
            {errors.length===0 ? <p className="text-sm" style={{ color:'var(--color-text-secondary)' }}>Нет ошибок</p>
              : errors.map(e=>(
                <div key={e.id} className="p-3 rounded-xl text-sm" style={{ backgroundColor:'var(--color-background)' }}>
                  <p className="font-medium">{e.message}</p>
                  <p className="text-xs opacity-60">{formatRU(e.timestamp)} · {e.component||'App'}</p>
                </div>
              ))
            }
          </div>
        )}
      </Card>

      {/* About */}
      <Card>
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Info size={18}/>О приложении</h3>
        <div className="space-y-1 text-sm">
          <p><strong>ПЛАН ИСЦЕЛЕНИЯ</strong> · Ash-Shifa</p>
          <p style={{ color:'var(--color-text-secondary)' }}>Версия: 1.0.0 · Метод Абу Мухаммада</p>
          <p style={{ color:'var(--color-text-secondary)' }}>Профессиональная система для рукъи</p>
        </div>
      </Card>

      <Modal isOpen={showPinModal} onClose={()=>setShowPinModal(false)} title="Установить PIN" size="sm">
        <div className="space-y-4">
          <Inp label="Новый PIN (4 цифры)" value={newPin} onChange={setNewPin} placeholder="••••" type="password"/>
          <Inp label="Подтвердите PIN"     value={confirmPin} onChange={setConfirmPin} placeholder="••••" type="password"/>
          <div className="flex justify-end gap-2">
            <Btn variant="ghost" onClick={()=>setShowPinModal(false)}>Отмена</Btn>
            <Btn onClick={handleSetPin}>Сохранить</Btn>
          </div>
        </div>
      </Modal>
    </Pg>
  );
}

// ==========================================
// Lock Screen
// ==========================================

function LockScreen() {
  const { setLocked, addToast } = useAppStore();
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');
  const [lockedOut, setLockedOut] = useState(isLockedOut());
  const [lockTime, setLockTime] = useState(getLockoutRemaining());

  useEffect(()=>{
    if(!lockedOut) return;
    const iv = setInterval(()=>{ const r=getLockoutRemaining(); setLockTime(r); if(r<=0){ setLockedOut(false); clearInterval(iv); } },1000);
    return ()=>clearInterval(iv);
  },[lockedOut]);

  const input = (digit:string)=>{
    if(pin.length>=4) return;
    const next = pin+digit;
    setPin(next); setErr('');
    if(next.length===4) verify(next);
  };

  const verify = async(p:string)=>{
    if(isLockedOut()){ setErr('Заблокировано'); setPin(''); return; }
    const ok = await verifyPin(p);
    if(ok){ resetPinAttempts(); setLocked(false); addToast({ message:'Разблокировано',type:'success' }); }
    else { const a=incrementPinAttempts(); setErr(`Неверный PIN. Осталось: ${5-a}`); setPin(''); if(a>=5){ setLockedOut(true); setLockTime(getLockoutRemaining()); } }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor:'var(--color-background)' }}>
      <motion.div className="text-center" initial={{ opacity:0,scale:.9 }} animate={{ opacity:1,scale:1 }}>
        <motion.div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ backgroundColor:'var(--color-primary)' }}
          animate={{ scale:[1,1.05,1] }} transition={{ duration:3,repeat:Infinity }}>
          <Lock size={32} className="text-white"/>
        </motion.div>
        <h2 className="text-xl font-semibold mb-1">Введите PIN-код</h2>
        <p className="mb-6 text-sm" style={{ color:'var(--color-text-secondary)' }}>ПЛАН ИСЦЕЛЕНИЯ заблокирован</p>
        <div className="flex justify-center gap-3 mb-4">
          {[0,1,2,3].map(i=>(
            <motion.div key={i} className="w-4 h-4 rounded-full transition-colors" style={{ backgroundColor:pin.length>i?'var(--color-primary)':'var(--color-border)' }} animate={pin.length>i?{ scale:[1,1.3,1] }:{}} transition={{ duration:.2 }}/>
          ))}
        </div>
        <AnimatePresence>
          {err && <motion.p className="mb-4 text-sm" style={{ color:'var(--color-error)' }} initial={{ opacity:0,y:-4 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>{err}</motion.p>}
        </AnimatePresence>
        {lockedOut ? (
          <div className="mb-4"><p className="text-lg font-semibold" style={{ color:'var(--color-error)' }}>Заблокировано</p><p style={{ color:'var(--color-text-secondary)' }}>Подождите {formatLockoutTime(lockTime)}</p></div>
        ) : (
          <div className="grid grid-cols-3 gap-3 max-w-[220px] mx-auto mb-4">
            {[1,2,3,4,5,6,7,8,9].map(n=>(
              <motion.button key={n} onClick={()=>input(String(n))} whileHover={{ scale:1.08 }} whileTap={{ scale:.92 }}
                className="w-16 h-16 rounded-full text-xl font-semibold transition-colors hover:bg-white/10" style={{ border:'1px solid var(--color-border)' }}>{n}</motion.button>
            ))}
            <div/>
            <motion.button onClick={()=>input('0')} whileHover={{ scale:1.08 }} whileTap={{ scale:.92 }} className="w-16 h-16 rounded-full text-xl font-semibold hover:bg-white/10" style={{ border:'1px solid var(--color-border)' }}>0</motion.button>
            <motion.button onClick={()=>setPin(p=>p.slice(0,-1))} whileHover={{ scale:1.08 }} whileTap={{ scale:.92 }} className="w-16 h-16 rounded-full flex items-center justify-center hover:bg-white/10" style={{ border:'1px solid var(--color-border)' }}><X size={22}/></motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── SVG icon helper ──────────────────────────────────────────────────────────
function DatabaseIcon({ size=20, ...p }: { size?: number; [k:string]:any }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>
    </svg>
  );
}

// ─── ChevronDown / ChevronUp icons ───────────────────────────────────────────
function ChevronDown({ size=20, className='' }: { size?: number; className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9"/></svg>;
}
function ChevronUp({ size=20, className='' }: { size?: number; className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="18 15 12 9 6 15"/></svg>;
}

// ==========================================
// ROOT App
// ==========================================

export default function App() {
  const { currentPage, isLocked } = useAppStore();
  const { currentThemeId, animationsEnabled } = useSettingsStore();
  const { loadPatients } = usePatientsStore();
  const { loadPlans } = usePlansStore();

  useEffect(()=>{
    const init = async()=>{ await initDB(); applyTheme(getTheme(currentThemeId)); await loadPatients(); await loadPlans(); };
    init();
  },[]);

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':     return <DashboardPage/>;
      case 'patients':      return <PatientsPage/>;
      case 'patient-detail':return <PatientDetailPage/>;
      case 'new-case':      return <NewCasePage/>;
      case 'plans':         return <PlansPage/>;
      case 'plan-builder':  return <PlanBuilderPage/>;
      case 'library':       return <LibraryPage/>;
      case 'diagnosis':     return <DiagnosisPage/>;
      case 'monitoring':    return <MonitoringPage/>;
      case 'reports':       return <ReportsPage/>;
      case 'attributes':    return <AttributesPage/>;
      case 'calendar':      return <CalendarPage/>;
      case 'import':        return <ImportPage/>;
      case 'settings':      return <SettingsPage/>;
      default:              return <DashboardPage/>;
    }
  };

  return (
    <MotionConfig
      reducedMotion={animationsEnabled ? 'never' : 'always'}
      transition={animationsEnabled ? undefined : { duration: 0, delay: 0 }}
    >
      <div className={`min-h-screen ${!animationsEnabled?'reduce-motion':''}`} style={{ backgroundColor:'var(--color-background)' }}>
        {isLocked ? <LockScreen/> : (
          <>
            <Header/>
            <Sidebar/>
            <main className="lg:ml-64 p-4 lg:p-6 pb-24 lg:pb-6">
              {animationsEnabled ? (
                <AnimatePresence mode="wait">
                  <motion.div key={currentPage} initial={{ opacity:0,y:6 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-6 }} transition={{ duration:.2 }}>
                    {renderPage()}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div key={currentPage}>{renderPage()}</div>
              )}
            </main>
            <BottomNav/>
            <GlobalSearch/>
            <Toasts/>
          </>
        )}
      </div>
    </MotionConfig>
  );
}
