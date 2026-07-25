// ==========================================
// RUKYA PRO - Advanced Animation Components
// Calm Tech: плавные, ненавязчивые микровзаимодействия
// ==========================================

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { X, Edit, Trash2 } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';

// Хук для проверки включены ли анимации
function useAnimationsEnabled(): boolean {
  return useSettingsStore((state) => state.animationsEnabled);
}

// ==========================================
// Animation Presets (Calm Tech подход)
// ==========================================

export const animations = {
  // Плавные переходы страниц
  pageTransition: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }
  },

  // Fade снизу для модалок
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },

  // Масштабирование для акцентов
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.15, ease: 'easeOut' }
  },

  // Stagger для списков
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  },

  staggerItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },

  // Появление слева/справа
  slideLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },

  slideRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },

  // Пульсация для внимания
  pulse: {
    animate: {
      scale: [1, 1.02, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    }
  },

  // Покачивание для ошибок
  shake: {
    animate: {
      x: [0, -5, 5, -5, 5, 0],
      transition: { duration: 0.4 }
    }
  }
};

// ==========================================
// Animated Page Wrapper
// ==========================================

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className = '' }: AnimatedPageProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ==========================================
// Stagger List Container
// ==========================================

interface StaggerListProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerList({ children, className = '' }: StaggerListProps) {
  const animationsEnabled = useAnimationsEnabled();
  if (!animationsEnabled) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      variants={animations.staggerContainer}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const animationsEnabled = useAnimationsEnabled();
  if (!animationsEnabled) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={animations.staggerItem}
    >
      {children}
    </motion.div>
  );
}

// ==========================================
// Ripple Effect Button
// ==========================================

interface RippleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function RippleButton({ 
  children, 
  onClick, 
  disabled, 
  className = '',
  variant = 'primary',
  size = 'md'
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const animationsEnabled = useAnimationsEnabled();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    if (!animationsEnabled) {
      onClick?.();
      return;
    }

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);

    onClick?.();
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'bg-[var(--color-primary)] text-white hover:brightness-110',
    secondary: 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-border)]',
    ghost: 'hover:bg-[var(--color-surface)]',
    danger: 'bg-[var(--color-error)] text-white hover:brightness-110'
  };

  if (!animationsEnabled) {
    return (
      <button
        ref={buttonRef}
        onClick={handleClick}
        disabled={disabled}
        className={`relative overflow-hidden rounded-lg font-medium ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      className={`relative overflow-hidden rounded-lg font-medium transition-all duration-200 
        ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} 
        ${className}`}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.1 }}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x - 50,
            top: ripple.y - 50,
            width: 100,
            height: 100
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
      {children}
    </motion.button>
  );
}

// ==========================================
// Animated Card с hover эффектами
// ==========================================

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  delay?: number;
}

export function AnimatedCard({ children, className = '', hover = false, onClick, delay = 0 }: AnimatedCardProps) {
  const animationsEnabled = useAnimationsEnabled();

  if (!animationsEnabled) {
    return (
      <div 
        className={`card ${hover ? 'cursor-pointer card-hover' : ''} ${className}`}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={`card ${hover ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay, ease: 'easeOut' }}
      whileHover={hover ? { 
        scale: 1.01, 
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        borderColor: 'var(--color-primary)'
      } : {}}
      whileTap={onClick ? { scale: 0.99 } : {}}
    >
      {children}
    </motion.div>
  );
}

// ==========================================
// Skeleton Components
// ==========================================

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = '', variant = 'rectangular', width, height }: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  return (
    <motion.div
      className={`bg-[var(--color-surface)] ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );
}

// Skeleton для карточки пациента
export function PatientCardSkeleton() {
  return (
    <div className="card flex items-center gap-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" height={20} />
        <Skeleton variant="text" width="40%" height={16} />
      </div>
    </div>
  );
}

// Skeleton для списка
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <PatientCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ==========================================
// Animated Counter
// ==========================================

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ value, duration = 1, className = '' }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const animationsEnabled = useAnimationsEnabled();

  useEffect(() => {
    if (!animationsEnabled) {
      setDisplayValue(value);
      return;
    }
    if (!isInView) return;

    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + diff * eased);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, isInView, animationsEnabled]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}

// ==========================================
// Animated Progress Bar
// ==========================================

interface AnimatedProgressProps {
  value: number;
  max?: number;
  label?: string;
  color?: string;
  showValue?: boolean;
}

export function AnimatedProgress({ 
  value, 
  max = 100, 
  label, 
  color = 'var(--color-primary)',
  showValue = true 
}: AnimatedProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const animationsEnabled = useAnimationsEnabled();

  if (!animationsEnabled) {
    return (
      <div ref={ref}>
        {(label || showValue) && (
          <div className="flex justify-between text-sm mb-1.5">
            {label && <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>}
            {showValue && <span>{Math.round(percentage)}%</span>}
          </div>
        )}
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
          <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: color }} />
        </div>
      </div>
    );
  }

  return (
    <div ref={ref}>
      {(label || showValue) && (
        <div className="flex justify-between text-sm mb-1.5">
          {label && <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>}
          {showValue && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
            >
              {Math.round(percentage)}%
            </motion.span>
          )}
        </div>
      )}
      <div 
        className="h-2 rounded-full overflow-hidden" 
        style={{ backgroundColor: 'var(--color-border)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${percentage}%` } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
        />
      </div>
    </div>
  );
}

// ==========================================
// Animated Badge
// ==========================================

interface AnimatedBadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info';
  pulse?: boolean;
}

export function AnimatedBadge({ children, variant = 'info', pulse = false }: AnimatedBadgeProps) {
  const colors = {
    success: { bg: 'rgba(16, 185, 129, 0.2)', text: 'var(--color-success)' },
    warning: { bg: 'rgba(245, 158, 11, 0.2)', text: 'var(--color-warning)' },
    error: { bg: 'rgba(239, 68, 68, 0.2)', text: 'var(--color-error)' },
    info: { bg: 'rgba(59, 130, 246, 0.2)', text: 'var(--color-info)' }
  };

  return (
    <motion.span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: colors[variant].bg, color: colors[variant].text }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      {pulse && (
        <motion.span
          className="w-1.5 h-1.5 rounded-full mr-1.5"
          style={{ backgroundColor: colors[variant].text }}
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      {children}
    </motion.span>
  );
}

// ==========================================
// Animated Toast
// ==========================================

interface AnimatedToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export function AnimatedToast({ message, type = 'info', onClose }: AnimatedToastProps) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${colors[type]}`}
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      layout
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
        className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20"
      >
        {icons[type]}
      </motion.span>
      <span className="flex-1">{message}</span>
      <motion.button
        onClick={onClose}
        className="opacity-70 hover:opacity-100 transition-opacity"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        ✕
      </motion.button>
    </motion.div>
  );
}

// ==========================================
// Animated Modal
// ==========================================

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function AnimatedModal({ isOpen, onClose, title, children, size = 'md' }: AnimatedModalProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  };
  const animationsEnabled = useAnimationsEnabled();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!animationsEnabled) {
    return isOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className={`relative w-full ${sizeClasses[size]} card`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <X size={18} />
            </button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    ) : null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className={`relative w-full ${sizeClasses[size]} card`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between mb-4">
              <motion.h2 
                className="text-xl font-semibold"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                {title}
              </motion.h2>
              <motion.button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <X size={18} />
              </motion.button>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// Animated Input с floating label
// ==========================================

interface AnimatedInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function AnimatedInput({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'text', 
  error,
  icon,
  className = ''
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {icon && (
          <motion.span 
            className="absolute left-3 top-1/2 -translate-y-1/2"
            animate={{ 
              color: isFocused ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              scale: isFocused ? 1.1 : 1 
            }}
            transition={{ duration: 0.15 }}
          >
            {icon}
          </motion.span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`w-full py-3 ${icon ? 'pl-10' : 'pl-4'} pr-4 bg-[var(--color-surface)] rounded-lg 
            text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)]
            transition-all duration-200 outline-none
            ${isFocused 
              ? 'ring-2 ring-[var(--color-primary)] border-transparent' 
              : 'border border-[var(--color-border)]'
            }
            ${error ? 'ring-2 ring-[var(--color-error)]' : ''}`}
        />
        {label && (
          <motion.label
            className={`absolute left-4 transition-all duration-200 pointer-events-none
              ${icon ? 'left-10' : 'left-4'}`}
            initial={false}
            animate={{
              top: isFocused || hasValue ? '0.25rem' : '50%',
              translateY: isFocused || hasValue ? 0 : '-50%',
              fontSize: isFocused || hasValue ? '0.75rem' : '1rem',
              color: isFocused ? 'var(--color-primary)' : 'var(--color-text-secondary)'
            }}
            transition={{ duration: 0.15 }}
          >
            {label}
          </motion.label>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            className="mt-1 text-sm text-[var(--color-error)]"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// Animated Chip/Toggle
// ==========================================

interface AnimatedChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export function AnimatedChip({ label, selected, onClick, onRemove }: AnimatedChipProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
        transition-colors duration-200
        ${selected 
          ? 'bg-[var(--color-primary)] text-white' 
          : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]'
        }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      layout
    >
      <motion.span layout>{label}</motion.span>
      {onRemove && (
        <motion.span
          className="ml-1 p-0.5 rounded-full hover:bg-white/20"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
        >
          <X size={12} />
        </motion.span>
      )}
    </motion.button>
  );
}

// ==========================================
// Animated Tab Switcher
// ==========================================

interface AnimatedTabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function AnimatedTabs({ tabs, activeTab, onChange }: AnimatedTabsProps) {
  return (
    <div className="flex gap-1 p-1 rounded-lg bg-[var(--color-surface)] relative">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
            transition-colors duration-200 z-10
            ${activeTab === tab.id ? 'text-white' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'}`}
        >
          {activeTab === tab.id && (
            <motion.div
              className="absolute inset-0 rounded-md bg-[var(--color-primary)]"
              layoutId="activeTab"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {tab.icon}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ==========================================
// Pull to Refresh индикатор
// ==========================================

interface PullToRefreshProps {
  isRefreshing: boolean;
  pullDistance: number;
}

export function PullToRefreshIndicator({ isRefreshing, pullDistance }: PullToRefreshProps) {
  const progress = Math.min(pullDistance / 80, 1);

  return (
    <motion.div
      className="flex justify-center py-4"
      initial={{ opacity: 0, height: 0 }}
      animate={{ 
        opacity: pullDistance > 20 ? 1 : 0,
        height: pullDistance > 20 ? 'auto' : 0
      }}
    >
      <motion.div
        className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent"
        animate={isRefreshing ? { rotate: 360 } : { rotate: progress * 270 }}
        transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
        style={{ opacity: progress }}
      />
    </motion.div>
  );
}

// ==========================================
// Animated List Item с swipe actions
// ==========================================

interface SwipeableItemProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function SwipeableItem({ children, onDelete, onEdit }: SwipeableItemProps) {
  const [dragX, setDragX] = useState(0);
  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={constraintsRef} className="relative overflow-hidden rounded-lg">
      {/* Background actions */}
      <div className="absolute inset-0 flex">
        {onEdit && (
          <motion.div 
            className="flex-1 flex items-center justify-start pl-4 bg-blue-500"
            style={{ opacity: Math.min(1, Math.max(0, -dragX / 80)) }}
          >
            <Edit size={20} className="text-white" />
          </motion.div>
        )}
        {onDelete && (
          <motion.div 
            className="flex-1 flex items-center justify-end pr-4 bg-red-500"
            style={{ opacity: Math.min(1, Math.max(0, dragX / 80)) }}
          >
            <Trash2 size={20} className="text-white" />
          </motion.div>
        )}
      </div>

      {/* Swipeable content */}
      <motion.div
        className="relative bg-[var(--color-surface)]"
        drag="x"
        dragConstraints={{ left: onEdit ? -100 : 0, right: onDelete ? 100 : 0 }}
        dragElastic={0.1}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={(_, info) => {
          if (info.offset.x < -80 && onEdit) onEdit();
          if (info.offset.x > 80 && onDelete) onDelete();
          setDragX(0);
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ==========================================
// Confetti для праздничных моментов
// ==========================================

export function Confetti({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)]
          }}
          initial={{ top: -10, opacity: 1 }}
          animate={{
            top: '100%',
            opacity: 0,
            rotate: Math.random() * 720,
            x: (Math.random() - 0.5) * 200
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: Math.random() * 0.5,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
}
