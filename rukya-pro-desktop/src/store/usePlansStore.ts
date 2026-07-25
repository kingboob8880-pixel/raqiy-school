// ==========================================
// RUKYA PRO - Plans Store (Zustand)
// ==========================================

import { create } from 'zustand';
import { TreatmentPlan, PlanStatus } from '../types';
import { planStorage } from '../storage';
import { nanoid } from 'nanoid';

interface PlansState {
  plans: TreatmentPlan[];
  isLoading: boolean;
  filterStatus: PlanStatus | 'all';
  
  // Actions
  loadPlans: () => Promise<void>;
  addPlan: (plan: Omit<TreatmentPlan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<TreatmentPlan>;
  updatePlan: (plan: TreatmentPlan) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  getPlan: (id: string) => TreatmentPlan | undefined;
  getPlansByPatient: (patientId: string) => TreatmentPlan[];
  getActivePlans: () => TreatmentPlan[];
  
  // Filters
  setFilterStatus: (status: PlanStatus | 'all') => void;
  
  // Computed
  getFilteredPlans: () => TreatmentPlan[];
}

export const usePlansStore = create<PlansState>((set, get) => ({
  plans: [],
  isLoading: false,
  filterStatus: 'all',
  
  loadPlans: async () => {
    set({ isLoading: true });
    try {
      const plans = await planStorage.getAll();
      set({ plans, isLoading: false });
    } catch (error) {
      console.error('Failed to load plans:', error);
      set({ isLoading: false });
    }
  },
  
  addPlan: async (data) => {
    const now = new Date().toISOString();
    const plan: TreatmentPlan = {
      ...data,
      id: nanoid(),
      createdAt: now,
      updatedAt: now
    };
    
    await planStorage.create(plan);
    set((state) => ({ plans: [...state.plans, plan] }));
    return plan;
  },
  
  updatePlan: async (plan) => {
    const updated = { ...plan, updatedAt: new Date().toISOString() };
    await planStorage.update(updated);
    set((state) => ({
      plans: state.plans.map(p => p.id === updated.id ? updated : p)
    }));
  },
  
  deletePlan: async (id) => {
    await planStorage.delete(id);
    set((state) => ({
      plans: state.plans.filter(p => p.id !== id)
    }));
  },
  
  getPlan: (id) => {
    return get().plans.find(p => p.id === id);
  },
  
  getPlansByPatient: (patientId) => {
    return get().plans.filter(p => p.patientId === patientId);
  },
  
  getActivePlans: () => {
    return get().plans.filter(p => p.status === 'active');
  },
  
  setFilterStatus: (status) => set({ filterStatus: status }),
  
  getFilteredPlans: () => {
    const { plans, filterStatus } = get();
    
    if (filterStatus === 'all') {
      return plans;
    }
    
    return plans.filter(p => p.status === filterStatus);
  }
}));
