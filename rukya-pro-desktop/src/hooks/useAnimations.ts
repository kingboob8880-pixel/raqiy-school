// ==========================================
// RUKYA PRO - Animations Hook
// ==========================================

import { useSettingsStore } from '../store/useSettingsStore';

// Хук для проверки включены ли анимации
export function useAnimationsEnabled(): boolean {
  return useSettingsStore((state) => state.animationsEnabled);
}

// Хук для получения transition props в зависимости от настройки
export function useTransition(duration: number = 0.25) {
  const animationsEnabled = useAnimationsEnabled();
  
  if (!animationsEnabled) {
    return { duration: 0 };
  }
  
  return { duration, ease: [0.25, 0.1, 0.25, 1] };
}

// Хук для получения motion props в зависимости от настройки
export function useMotionProps() {
  const animationsEnabled = useAnimationsEnabled();
  
  if (!animationsEnabled) {
    return {
      initial: false,
      animate: {},
      exit: {},
      transition: { duration: 0 },
      whileHover: {},
      whileTap: {}
    };
  }
  
  return null; // Будем использовать стандартные props
}

// Утилита для отключения анимаций через CSS
export function getAnimationClass(animationsEnabled: boolean): string {
  return animationsEnabled ? '' : 'reduce-motion';
}
