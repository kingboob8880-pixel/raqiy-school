// ==========================================
// RUKYA PRO - Theme System (10 Themes: 5 Dark + 5 Light)
// ==========================================

import { Theme } from './types';

// Dark Themes
export const darkOcean: Theme = {
  id: 'dark-ocean',
  name: 'Тёмный океан',
  isDark: true,
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  }
};

export const darkForest: Theme = {
  id: 'dark-forest',
  name: 'Тёмный лес',
  isDark: true,
  colors: {
    primary: '#22c55e',
    secondary: '#14b8a6',
    accent: '#84cc16',
    background: '#0c1a0f',
    surface: '#14291a',
    text: '#dcfce7',
    textSecondary: '#86efac',
    border: '#166534',
    success: '#22c55e',
    warning: '#eab308',
    error: '#dc2626',
    info: '#06b6d4'
  }
};

export const darkRoyal: Theme = {
  id: 'dark-royal',
  name: 'Королевский',
  isDark: true,
  colors: {
    primary: '#a855f7',
    secondary: '#ec4899',
    accent: '#f472b6',
    background: '#1a0a2e',
    surface: '#2d1b4e',
    text: '#f3e8ff',
    textSecondary: '#c084fc',
    border: '#4c1d95',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#818cf8'
  }
};

export const darkMidnight: Theme = {
  id: 'dark-midnight',
  name: 'Полночь',
  isDark: true,
  colors: {
    primary: '#f97316',
    secondary: '#fb923c',
    accent: '#fbbf24',
    background: '#1c1917',
    surface: '#292524',
    text: '#fef3c7',
    textSecondary: '#d6d3d1',
    border: '#44403c',
    success: '#4ade80',
    warning: '#facc15',
    error: '#fb7185',
    info: '#38bdf8'
  }
};

export const darkDesert: Theme = {
  id: 'dark-desert',
  name: 'Пустыня',
  isDark: true,
  colors: {
    primary: '#d97706',
    secondary: '#b45309',
    accent: '#f59e0b',
    background: '#1c1510',
    surface: '#2d2318',
    text: '#fef3c7',
    textSecondary: '#d4c4a8',
    border: '#78350f',
    success: '#84cc16',
    warning: '#fbbf24',
    error: '#dc2626',
    info: '#06b6d4'
  }
};

// Light Themes
export const lightDawn: Theme = {
  id: 'light-dawn',
  name: 'Рассвет',
  isDark: false,
  colors: {
    primary: '#2563eb',
    secondary: '#7c3aed',
    accent: '#0891b2',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#0284c7'
  }
};

export const lightGarden: Theme = {
  id: 'light-garden',
  name: 'Сад',
  isDark: false,
  colors: {
    primary: '#16a34a',
    secondary: '#0d9488',
    accent: '#65a30d',
    background: '#f0fdf4',
    surface: '#ffffff',
    text: '#14532d',
    textSecondary: '#166534',
    border: '#bbf7d0',
    success: '#22c55e',
    warning: '#ca8a04',
    error: '#dc2626',
    info: '#0891b2'
  }
};

export const lightRose: Theme = {
  id: 'light-rose',
  name: 'Роза',
  isDark: false,
  colors: {
    primary: '#db2777',
    secondary: '#c026d3',
    accent: '#e879f9',
    background: '#fdf2f8',
    surface: '#ffffff',
    text: '#831843',
    textSecondary: '#9d174d',
    border: '#fbcfe8',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#e11d48',
    info: '#8b5cf6'
  }
};

export const lightSand: Theme = {
  id: 'light-sand',
  name: 'Песок',
  isDark: false,
  colors: {
    primary: '#b45309',
    secondary: '#a16207',
    accent: '#ca8a04',
    background: '#fefce8',
    surface: '#ffffff',
    text: '#422006',
    textSecondary: '#854d0e',
    border: '#fef08a',
    success: '#65a30d',
    warning: '#d97706',
    error: '#dc2626',
    info: '#0284c7'
  }
};

export const lightSnow: Theme = {
  id: 'light-snow',
  name: 'Снег',
  isDark: false,
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#a78bfa',
    background: '#f5f5ff',
    surface: '#ffffff',
    text: '#1e1b4b',
    textSecondary: '#4338ca',
    border: '#e0e7ff',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  }
};

// All themes array
export const themes: Theme[] = [
  darkOcean,
  darkForest,
  darkRoyal,
  darkMidnight,
  darkDesert,
  lightDawn,
  lightGarden,
  lightRose,
  lightSand,
  lightSnow
];

// Get theme by ID
export function getTheme(id: string): Theme {
  return themes.find(t => t.id === id) || darkOcean;
}

// Apply theme to document
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  
  // Set CSS variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  // Set dark/light mode class
  if (theme.isDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  }
  
  // Update theme-color meta tag
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme.colors.background);
  }
}

// Get CSS for export documents
export function getExportStyles(theme: Theme): string {
  return `
    :root {
      --color-primary: ${theme.colors.primary};
      --color-secondary: ${theme.colors.secondary};
      --color-accent: ${theme.colors.accent};
      --color-background: ${theme.colors.background};
      --color-surface: ${theme.colors.surface};
      --color-text: ${theme.colors.text};
      --color-text-secondary: ${theme.colors.textSecondary};
      --color-border: ${theme.colors.border};
      --color-success: ${theme.colors.success};
      --color-warning: ${theme.colors.warning};
      --color-error: ${theme.colors.error};
      --color-info: ${theme.colors.info};
    }
    
    body {
      background-color: var(--color-background);
      color: var(--color-text);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    .arabic-text {
      font-family: 'Amiri', 'Traditional Arabic', serif;
      direction: rtl;
      font-size: 1.5em;
      line-height: 2;
    }
  `;
}

// Get dark themes
export function getDarkThemes(): Theme[] {
  return themes.filter(t => t.isDark);
}

// Get light themes
export function getLightThemes(): Theme[] {
  return themes.filter(t => !t.isDark);
}
