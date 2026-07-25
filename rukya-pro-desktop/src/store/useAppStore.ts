// ==========================================
// RUKYA PRO - Main App Store (Zustand)
// ==========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Toast, Patient, TreatmentPlan } from '../types';
import { getTheme, applyTheme } from '../theme';

interface AppState {
  // Navigation
  currentPage: string;
  setCurrentPage: (page: string) => void;
  
  // Theme
  currentThemeId: string;
  setTheme: (themeId: string) => void;
  
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Current entities
  currentPatient: Patient | null;
  setCurrentPatient: (patient: Patient | null) => void;
  
  currentPlan: TreatmentPlan | null;
  setCurrentPlan: (plan: TreatmentPlan | null) => void;
  
  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  
  // PIN Lock
  isLocked: boolean;
  setLocked: (locked: boolean) => void;
  lastActivity: number;
  updateActivity: () => void;
  
  // Search
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Loading
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Navigation
      currentPage: 'dashboard',
      setCurrentPage: (page) => set({ currentPage: page }),
      
      // Theme
      currentThemeId: 'dark-ocean',
      setTheme: (themeId) => {
        const theme = getTheme(themeId);
        applyTheme(theme);
        set({ currentThemeId: themeId });
      },
      
      // Sidebar
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      // Current entities
      currentPatient: null,
      setCurrentPatient: (patient) => set({ currentPatient: patient }),
      
      currentPlan: null,
      setCurrentPlan: (plan) => set({ currentPlan: plan }),
      
      // Toasts
      toasts: [],
      addToast: (toast) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }]
        }));
        // Auto remove after duration
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter(t => t.id !== id)
          }));
        }, toast.duration || 4000);
      },
      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      })),
      
      // PIN Lock
      isLocked: false,
      setLocked: (locked) => set({ isLocked: locked }),
      lastActivity: Date.now(),
      updateActivity: () => set({ lastActivity: Date.now() }),
      
      // Search
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      // Loading
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading })
    }),
    {
      name: 'rukya-app-store',
      partialize: (state) => ({
        currentPage: state.currentPage,
        currentThemeId: state.currentThemeId,
        sidebarOpen: state.sidebarOpen
      })
    }
  )
);
