// ==========================================
// RUKYA PRO - Storage Layer (IndexedDB + localStorage fallback)
// ==========================================

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Patient, TreatmentPlan, Session, DiagnosisResult, MonitoringEntry, ErrorLog, AppSettings } from './types';

interface RukyaDB extends DBSchema {
  patients: {
    key: string;
    value: Patient;
    indexes: { 'by-name': string; 'by-created': string };
  };
  plans: {
    key: string;
    value: TreatmentPlan;
    indexes: { 'by-patient': string; 'by-status': string };
  };
  sessions: {
    key: string;
    value: Session;
    indexes: { 'by-patient': string; 'by-date': string };
  };
  diagnoses: {
    key: string;
    value: DiagnosisResult;
    indexes: { 'by-patient': string };
  };
  monitoring: {
    key: string;
    value: MonitoringEntry;
    indexes: { 'by-patient': string; 'by-date': string };
  };
  errors: {
    key: string;
    value: ErrorLog;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

const DB_NAME = 'rukya-pro-db';
const DB_VERSION = 1;

let db: IDBPDatabase<RukyaDB> | null = null;
let useLocalStorage = false;
let initPromise: Promise<void> | null = null;

// Initialize database. Safe to call multiple times/concurrently — every
// caller shares the same in-flight promise, so components that kick off a
// data load before the root App's own init() finishes no longer race ahead
// of it and hit "Database not initialized".
export async function initDB(): Promise<boolean> {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        // Check if we're in file:// protocol
        if (window.location.protocol === 'file:') {
          useLocalStorage = true;
          console.log('Running in file:// mode, using localStorage');
          return;
        }

        db = await openDB<RukyaDB>(DB_NAME, DB_VERSION, {
          upgrade(database) {
            // Patients store
            if (!database.objectStoreNames.contains('patients')) {
              const patientStore = database.createObjectStore('patients', { keyPath: 'id' });
              patientStore.createIndex('by-name', ['lastName', 'firstName']);
              patientStore.createIndex('by-created', 'createdAt');
            }

            // Plans store
            if (!database.objectStoreNames.contains('plans')) {
              const planStore = database.createObjectStore('plans', { keyPath: 'id' });
              planStore.createIndex('by-patient', 'patientId');
              planStore.createIndex('by-status', 'status');
            }

            // Sessions store
            if (!database.objectStoreNames.contains('sessions')) {
              const sessionStore = database.createObjectStore('sessions', { keyPath: 'id' });
              sessionStore.createIndex('by-patient', 'patientId');
              sessionStore.createIndex('by-date', 'date');
            }

            // Diagnoses store
            if (!database.objectStoreNames.contains('diagnoses')) {
              const diagnosisStore = database.createObjectStore('diagnoses', { keyPath: 'id' });
              diagnosisStore.createIndex('by-patient', 'patientId');
            }

            // Monitoring store
            if (!database.objectStoreNames.contains('monitoring')) {
              const monitoringStore = database.createObjectStore('monitoring', { keyPath: 'id' });
              monitoringStore.createIndex('by-patient', 'patientId');
              monitoringStore.createIndex('by-date', 'date');
            }

            // Errors store
            if (!database.objectStoreNames.contains('errors')) {
              database.createObjectStore('errors', { keyPath: 'id' });
            }

            // Settings store
            if (!database.objectStoreNames.contains('settings')) {
              database.createObjectStore('settings', { keyPath: 'id' });
            }
          },
        });
        console.log('IndexedDB initialized successfully');
      } catch (error) {
        console.warn('IndexedDB failed, falling back to localStorage:', error);
        useLocalStorage = true;
      }
    })();
  }
  await initPromise;
  return true;
}

// Generic CRUD operations
type StoreName = 'patients' | 'plans' | 'sessions' | 'diagnoses' | 'monitoring' | 'errors' | 'settings';

function getLocalStorageKey(store: StoreName): string {
  return `rukya_${store}`;
}

function getFromLocalStorage<T>(store: StoreName): T[] {
  try {
    const data = localStorage.getItem(getLocalStorageKey(store));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToLocalStorage<T>(store: StoreName, items: T[]): void {
  try {
    localStorage.setItem(getLocalStorageKey(store), JSON.stringify(items));
  } catch (error) {
    console.error('localStorage save failed:', error);
  }
}

// Create
export async function create<T extends { id: string }>(store: StoreName, item: T): Promise<T> {
  await initDB();
  if (useLocalStorage) {
    const items = getFromLocalStorage<T>(store);
    items.push(item);
    saveToLocalStorage(store, items);
    return item;
  }

  if (!db) throw new Error('Database not initialized');
  await db.put(store, item as any);
  return item;
}

// Read single
export async function get<T>(store: StoreName, id: string): Promise<T | undefined> {
  await initDB();
  if (useLocalStorage) {
    const items = getFromLocalStorage<T & { id: string }>(store);
    return items.find(item => item.id === id);
  }

  if (!db) throw new Error('Database not initialized');
  return db.get(store, id) as Promise<T | undefined>;
}

// Read all
export async function getAll<T>(store: StoreName): Promise<T[]> {
  await initDB();
  if (useLocalStorage) {
    return getFromLocalStorage<T>(store);
  }

  if (!db) throw new Error('Database not initialized');
  return db.getAll(store) as Promise<T[]>;
}

// Update
export async function update<T extends { id: string }>(store: StoreName, item: T): Promise<T> {
  await initDB();
  if (useLocalStorage) {
    const items = getFromLocalStorage<T>(store);
    const index = items.findIndex(i => (i as any).id === item.id);
    if (index >= 0) {
      items[index] = item;
      saveToLocalStorage(store, items);
    }
    return item;
  }

  if (!db) throw new Error('Database not initialized');
  await db.put(store, item as any);
  return item;
}

// Delete
export async function remove(store: StoreName, id: string): Promise<void> {
  await initDB();
  if (useLocalStorage) {
    const items = getFromLocalStorage<{ id: string }>(store);
    const filtered = items.filter(item => item.id !== id);
    saveToLocalStorage(store, filtered);
    return;
  }

  if (!db) throw new Error('Database not initialized');
  await db.delete(store, id);
}

// Clear store
export async function clearStore(store: StoreName): Promise<void> {
  await initDB();
  if (useLocalStorage) {
    localStorage.removeItem(getLocalStorageKey(store));
    return;
  }

  if (!db) throw new Error('Database not initialized');
  await db.clear(store);
}

// Count items
export async function count(store: StoreName): Promise<number> {
  await initDB();
  if (useLocalStorage) {
    return getFromLocalStorage(store).length;
  }

  if (!db) throw new Error('Database not initialized');
  return db.count(store);
}

// Patient-specific operations
export const patientStorage = {
  async getAll(): Promise<Patient[]> {
    return getAll<Patient>('patients');
  },
  
  async get(id: string): Promise<Patient | undefined> {
    return get<Patient>('patients', id);
  },
  
  async create(patient: Patient): Promise<Patient> {
    return create('patients', patient);
  },
  
  async update(patient: Patient): Promise<Patient> {
    return update('patients', patient);
  },
  
  async delete(id: string): Promise<void> {
    return remove('patients', id);
  },
  
  async search(query: string): Promise<Patient[]> {
    const patients = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return patients.filter(p => 
      p.firstName.toLowerCase().includes(lowerQuery) ||
      p.lastName.toLowerCase().includes(lowerQuery) ||
      p.phone?.includes(query) ||
      p.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }
};

// Plan-specific operations
export const planStorage = {
  async getAll(): Promise<TreatmentPlan[]> {
    return getAll<TreatmentPlan>('plans');
  },
  
  async getByPatient(patientId: string): Promise<TreatmentPlan[]> {
    const plans = await this.getAll();
    return plans.filter(p => p.patientId === patientId);
  },
  
  async get(id: string): Promise<TreatmentPlan | undefined> {
    return get<TreatmentPlan>('plans', id);
  },
  
  async create(plan: TreatmentPlan): Promise<TreatmentPlan> {
    return create('plans', plan);
  },
  
  async update(plan: TreatmentPlan): Promise<TreatmentPlan> {
    return update('plans', plan);
  },
  
  async delete(id: string): Promise<void> {
    return remove('plans', id);
  },
  
  async getActive(): Promise<TreatmentPlan[]> {
    const plans = await this.getAll();
    return plans.filter(p => p.status === 'active');
  }
};

// Session-specific operations
export const sessionStorage = {
  async getAll(): Promise<Session[]> {
    return getAll<Session>('sessions');
  },
  
  async getByPatient(patientId: string): Promise<Session[]> {
    const sessions = await this.getAll();
    return sessions.filter(s => s.patientId === patientId);
  },
  
  async create(session: Session): Promise<Session> {
    return create('sessions', session);
  },
  
  async update(session: Session): Promise<Session> {
    return update('sessions', session);
  },
  
  async delete(id: string): Promise<void> {
    return remove('sessions', id);
  }
};

// Monitoring-specific operations
export const monitoringStorage = {
  async getAll(): Promise<MonitoringEntry[]> {
    return getAll<MonitoringEntry>('monitoring');
  },
  
  async getByPatient(patientId: string): Promise<MonitoringEntry[]> {
    const entries = await this.getAll();
    return entries.filter(e => e.patientId === patientId);
  },
  
  async create(entry: MonitoringEntry): Promise<MonitoringEntry> {
    return create('monitoring', entry);
  }
};

// Error logging
export const errorStorage = {
  async getAll(): Promise<ErrorLog[]> {
    return getAll<ErrorLog>('errors');
  },
  
  async log(error: ErrorLog): Promise<void> {
    const errors = await this.getAll();
    errors.unshift(error);
    // Keep only last 50 errors
    const trimmed = errors.slice(0, 50);
    saveToLocalStorage('errors', trimmed);
  },
  
  async clear(): Promise<void> {
    return clearStore('errors');
  }
};

// Settings
export const settingsStorage = {
  async get(): Promise<AppSettings> {
    const settings = await get<AppSettings>('settings', 'app-settings');
    return settings || {
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
  },
  
  async save(settings: AppSettings): Promise<void> {
    await update('settings', { ...settings, id: 'app-settings' });
  }
};

// Export all data
export async function exportAllData(): Promise<string> {
  const data = {
    patients: await getAll('patients'),
    plans: await getAll('plans'),
    sessions: await getAll('sessions'),
    diagnoses: await getAll('diagnoses'),
    monitoring: await getAll('monitoring'),
    exportedAt: new Date().toISOString(),
    version: '1.0.0'
  };
  return JSON.stringify(data, null, 2);
}

// Import all data
export async function importAllData(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    
    if (data.patients) {
      for (const patient of data.patients) {
        await create('patients', patient);
      }
    }
    
    if (data.plans) {
      for (const plan of data.plans) {
        await create('plans', plan);
      }
    }
    
    if (data.sessions) {
      for (const session of data.sessions) {
        await create('sessions', session);
      }
    }
    
    if (data.diagnoses) {
      for (const diagnosis of data.diagnoses) {
        await create('diagnoses', diagnosis);
      }
    }
    
    if (data.monitoring) {
      for (const entry of data.monitoring) {
        await create('monitoring', entry);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Import failed:', error);
    return false;
  }
}
