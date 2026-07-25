// ==========================================
// RUKYA PRO - Patients Store (Zustand)
// ==========================================

import { create } from 'zustand';
import { Patient } from '../types';
import { patientStorage } from '../storage';
import { nanoid } from 'nanoid';

interface PatientsState {
  patients: Patient[];
  isLoading: boolean;
  searchQuery: string;
  sortBy: 'name' | 'date' | 'recent';
  filterGender: 'all' | 'male' | 'female';
  
  // Actions
  loadPatients: () => Promise<void>;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Patient>;
  updatePatient: (patient: Patient) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  getPatient: (id: string) => Patient | undefined;
  
  // Filters
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'name' | 'date' | 'recent') => void;
  setFilterGender: (filter: 'all' | 'male' | 'female') => void;
  
  // Computed
  getFilteredPatients: () => Patient[];
}

export const usePatientsStore = create<PatientsState>((set, get) => ({
  patients: [],
  isLoading: false,
  searchQuery: '',
  sortBy: 'recent',
  filterGender: 'all',
  
  loadPatients: async () => {
    set({ isLoading: true });
    try {
      const patients = await patientStorage.getAll();
      set({ patients, isLoading: false });
    } catch (error) {
      console.error('Failed to load patients:', error);
      set({ isLoading: false });
    }
  },
  
  addPatient: async (data) => {
    const now = new Date().toISOString();
    const patient: Patient = {
      ...data,
      id: nanoid(),
      createdAt: now,
      updatedAt: now
    };
    
    await patientStorage.create(patient);
    set((state) => ({ patients: [...state.patients, patient] }));
    return patient;
  },
  
  updatePatient: async (patient) => {
    const updated = { ...patient, updatedAt: new Date().toISOString() };
    await patientStorage.update(updated);
    set((state) => ({
      patients: state.patients.map(p => p.id === updated.id ? updated : p)
    }));
  },
  
  deletePatient: async (id) => {
    await patientStorage.delete(id);
    set((state) => ({
      patients: state.patients.filter(p => p.id !== id)
    }));
  },
  
  getPatient: (id) => {
    return get().patients.find(p => p.id === id);
  },
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setFilterGender: (filter) => set({ filterGender: filter }),
  
  getFilteredPatients: () => {
    const { patients, searchQuery, sortBy, filterGender } = get();
    
    let filtered = [...patients];
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.firstName.toLowerCase().includes(query) ||
        p.lastName.toLowerCase().includes(query) ||
        p.phone?.includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }
    
    // Filter by gender
    if (filterGender !== 'all') {
      filtered = filtered.filter(p => p.gender === filterGender);
    }
    
    // Sort
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`));
        break;
      case 'date':
        filtered.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        break;
      case 'recent':
        filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        break;
    }
    
    return filtered;
  }
}));
