// ==========================================
// RUKYA PRO - Shared UI Components & Utilities
// Переиспользуемые компоненты для всех страниц
// ==========================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AnimatedCard, RippleButton, AnimatedModal, AnimatedProgress } from './components/animations';

// ─── Button ──────────────────────────────────────────────────────────────────
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
}
export function Button({ children, variant = 'primary', size = 'md', loading, disabled, onClick, className = '', icon }: ButtonProps) {
  return (
    <RippleButton variant={variant} size={size} onClick={onClick} disabled={disabled || loading} className={className}>
      <span className="flex items-center gap-2">
        {loading
          ? <motion.span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full inline-block"
              animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
          : icon}
        {children}
      </span>
    </RippleButton>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps { children: React.ReactNode; className?: string; hover?: boolean; onClick?: () => void; delay?: number; }
export function Card({ children, className = '', hover = false, onClick, delay = 0 }: CardProps) {
  return <AnimatedCard hover={hover} onClick={onClick} className={className} delay={delay}>{children}</AnimatedCard>;
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps {
  label?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; error?: string; icon?: React.ReactNode; className?: string;
}
export function Input({ label, value, onChange, placeholder, type = 'text', error, icon, className = '' }: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>{label}</label>}
      <div className="relative">
        {icon && (
          <motion.span className="absolute left-3 top-1/2 -translate-y-1/2"
            animate={{ color: focused ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
            {icon}
          </motion.span>
        )}
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={`input ${icon ? 'pl-10' : ''} ${error ? '!border-red-500' : ''}`}
          style={focused ? { borderColor: 'var(--color-primary)', boxShadow: `0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent)` } : {}}
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p className="mt-1 text-sm" style={{ color: 'var(--color-error)' }}
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps { label?: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; className?: string; }
export function Textarea({ label, value, onChange, placeholder, rows = 4, className = '' }: TextareaProps) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>{label}</label>}
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="input resize-none w-full" />
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps { label?: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string; }
export function Select({ label, value, onChange, options, className = '' }: SelectProps) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} className="input appearance-none cursor-pointer w-full">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'success' | 'warning' | 'error' | 'info';
interface BadgeProps { children: React.ReactNode; variant?: BadgeVariant; pulse?: boolean; }
export function Badge({ children, variant = 'info', pulse = false }: BadgeProps) {
  const colors: Record<BadgeVariant, { bg: string; text: string }> = {
    success: { bg: 'rgba(16,185,129,0.18)', text: 'var(--color-success)' },
    warning: { bg: 'rgba(245,158,11,0.18)', text: 'var(--color-warning)' },
    error:   { bg: 'rgba(239,68,68,0.18)',  text: 'var(--color-error)' },
    info:    { bg: 'rgba(59,130,246,0.18)', text: 'var(--color-info)' },
  };
  return (
    <motion.span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: colors[variant].bg, color: colors[variant].text }}
      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.15 }}>
      {pulse && (
        <motion.span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[variant].text }}
          animate={{ scale: [1,1.4,1], opacity:[1,0.5,1] }} transition={{ duration:2, repeat:Infinity }} />
      )}
      {children}
    </motion.span>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
interface ChipProps { label: string; selected?: boolean; onClick?: () => void; onRemove?: () => void; }
export function Chip({ label, selected, onClick, onRemove }: ChipProps) {
  return (
    <motion.button onClick={onClick} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
        selected ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary)]'
      }`}>
      {label}
      {onRemove && (
        <motion.span onClick={e => { e.stopPropagation(); onRemove(); }}
          whileHover={{ scale: 1.2 }} className="ml-0.5 p-0.5 rounded-full hover:bg-white/20">
          <X size={12} />
        </motion.span>
      )}
    </motion.button>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg'; }
export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  return <AnimatedModal isOpen={isOpen} onClose={onClose} title={title} size={size}>{children}</AnimatedModal>;
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
interface ProgressBarProps { value: number; max?: number; label?: string; color?: string; }
export function ProgressBar({ value, max = 100, label, color }: ProgressBarProps) {
  return <AnimatedProgress value={value} max={max} label={label} color={color} />;
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
interface SectionHeaderProps { icon?: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode; }
export function SectionHeader({ icon, title, subtitle, action }: SectionHeaderProps) {
  return (
    <motion.div className="flex items-center justify-between mb-0"
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-primary)', opacity: 0.9 }}>
            <span className="text-white">{icon}</span>
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {subtitle && <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps { icon: React.ReactNode; title: string; description?: string; action?: React.ReactNode; }
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div className="card text-center py-16"
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}>
      <motion.div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-surface)', border: '2px dashed var(--color-border)' }}
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>{icon}</span>
      </motion.div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>}
      {action}
    </motion.div>
  );
}

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
interface ToggleProps { value: boolean; onChange: (v: boolean) => void; label?: string; description?: string; }
export function Toggle({ value, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between">
      {(label || description) && (
        <div className="mr-4">
          {label && <p className="font-medium">{label}</p>}
          {description && <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>}
        </div>
      )}
      <motion.button
        onClick={() => onChange(!value)} whileTap={{ scale: 0.95 }}
        className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`}>
        <motion.div className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
          animate={{ left: value ? '1.75rem' : '0.25rem' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
      </motion.button>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
import { AnimatedCounter } from './components/animations';
interface StatCardProps { icon: React.ReactNode; label: string; value: number; color: string; delay?: number; suffix?: string; }
export function StatCard({ icon, label, value, color, delay = 0, suffix = '' }: StatCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.3 }}>
      <Card className="text-center">
        <motion.div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }} whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
          <span style={{ color }}>{icon}</span>
        </motion.div>
        <p className="text-3xl font-bold mb-1">
          <AnimatedCounter value={value} duration={0.8} />{suffix}
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
      </Card>
    </motion.div>
  );
}

// ─── ConfirmDialog ────────────────────────────────────────────────────────────
interface ConfirmDialogProps { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmLabel?: string; danger?: boolean; }
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Удалить', danger = true }: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p style={{ color: 'var(--color-text-secondary)' }}>{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── PageWrapper ──────────────────────────────────────────────────────────────
export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      {children}
    </motion.div>
  );
}

// ─── Database SVG icon ────────────────────────────────────────────────────────
export function DatabaseIcon({ size = 20, ...props }: { size?: number; [k: string]: any }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}
