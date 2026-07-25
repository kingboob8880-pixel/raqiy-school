// ==========================================
// RUKYA PRO - Settings Store (Zustand)
// ==========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings, ExportSettings } from '../types';
import { settingsStorage } from '../storage';

interface SettingsState extends AppSettings {
  // Actions
  loadSettings: () => Promise<void>;
  setPinHash: (hash: string | undefined) => void;
  setPinEnabled: (enabled: boolean) => void;
  setAutoLockMinutes: (minutes: number) => void;
  setCurrentThemeId: (themeId: string) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setExportDefaults: (settings: Partial<ExportSettings>) => void;
  setLastBackup: (date: string) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  pinEnabled: false,
  autoLockMinutes: 5,
  currentThemeId: 'dark-ocean',
  animationsEnabled: true,
  exportDefaults: {
    format: 'pdf',
    includeArabic: true,
    includeTranslation: true,
    includeNotes: true,
    pageSize: 'a4',
    language: 'ru'
  }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      
      loadSettings: async () => {
        try {
          const settings = await settingsStorage.get();
          set(settings);
        } catch (error) {
          console.error('Failed to load settings:', error);
        }
      },
      
      setPinHash: (hash) => {
        set({ pinHash: hash });
        settingsStorage.save({ ...get(), pinHash: hash });
      },
      
      setPinEnabled: (enabled) => {
        set({ pinEnabled: enabled });
        settingsStorage.save({ ...get(), pinEnabled: enabled });
      },
      
      setAutoLockMinutes: (minutes) => {
        set({ autoLockMinutes: minutes });
        settingsStorage.save({ ...get(), autoLockMinutes: minutes });
      },
      
      setCurrentThemeId: (themeId) => {
        set({ currentThemeId: themeId });
        settingsStorage.save({ ...get(), currentThemeId: themeId });
      },
      
      setAnimationsEnabled: (enabled) => {
        set({ animationsEnabled: enabled });
        settingsStorage.save({ ...get(), animationsEnabled: enabled });
      },
      
      setExportDefaults: (settings) => {
        const current = get().exportDefaults;
        set({ exportDefaults: { ...current, ...settings } });
        settingsStorage.save({ ...get(), exportDefaults: { ...current, ...settings } });
      },
      
      setLastBackup: (date) => {
        set({ lastBackup: date });
        settingsStorage.save({ ...get(), lastBackup: date });
      },
      
      resetSettings: () => {
        set(defaultSettings);
        settingsStorage.save(defaultSettings);
      }
    }),
    {
      name: 'rukya-settings-store'
    }
  )
);
