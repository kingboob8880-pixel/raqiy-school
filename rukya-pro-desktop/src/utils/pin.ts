// ==========================================
// RUKYA PRO - PIN Security Utility
// ==========================================

import { PIN_LENGTH, MAX_PIN_ATTEMPTS, LOCKOUT_DURATION } from '../constants';

const PIN_HASH_KEY = 'rukya_pin_hash';
const PIN_ATTEMPTS_KEY = 'rukya_pin_attempts';
const PIN_LOCKOUT_KEY = 'rukya_pin_lockout';

// Hash PIN using SubtleCrypto or fallback
export async function hashPin(pin: string): Promise<string> {
  try {
    // Use Web Crypto API if available
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + 'rukya-salt-2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback simple hash for file:// protocol
    let hash = 0;
    const str = pin + 'rukya-salt-2024';
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}

// Save PIN hash
export async function savePin(pin: string): Promise<void> {
  const hash = await hashPin(pin);
  localStorage.setItem(PIN_HASH_KEY, hash);
}

// Verify PIN
export async function verifyPin(pin: string): Promise<boolean> {
  const storedHash = localStorage.getItem(PIN_HASH_KEY);
  if (!storedHash) return false;
  
  const hash = await hashPin(pin);
  return hash === storedHash;
}

// Check if PIN is set
export function isPinSet(): boolean {
  return localStorage.getItem(PIN_HASH_KEY) !== null;
}

// Remove PIN
export function removePin(): void {
  localStorage.removeItem(PIN_HASH_KEY);
  localStorage.removeItem(PIN_ATTEMPTS_KEY);
  localStorage.removeItem(PIN_LOCKOUT_KEY);
}

// Get PIN attempts
export function getPinAttempts(): number {
  const attempts = localStorage.getItem(PIN_ATTEMPTS_KEY);
  return attempts ? parseInt(attempts, 10) : 0;
}

// Increment PIN attempts
export function incrementPinAttempts(): number {
  const attempts = getPinAttempts() + 1;
  localStorage.setItem(PIN_ATTEMPTS_KEY, attempts.toString());
  
  if (attempts >= MAX_PIN_ATTEMPTS) {
    setLockout();
  }
  
  return attempts;
}

// Reset PIN attempts
export function resetPinAttempts(): void {
  localStorage.removeItem(PIN_ATTEMPTS_KEY);
}

// Check if locked out
export function isLockedOut(): boolean {
  const lockoutTime = localStorage.getItem(PIN_LOCKOUT_KEY);
  if (!lockoutTime) return false;
  
  const lockout = parseInt(lockoutTime, 10);
  const now = Date.now();
  
  if (now < lockout) {
    return true;
  }
  
  // Lockout expired
  localStorage.removeItem(PIN_LOCKOUT_KEY);
  localStorage.removeItem(PIN_ATTEMPTS_KEY);
  return false;
}

// Set lockout
function setLockout(): void {
  const lockoutUntil = Date.now() + LOCKOUT_DURATION;
  localStorage.setItem(PIN_LOCKOUT_KEY, lockoutUntil.toString());
}

// Get remaining lockout time in seconds
export function getLockoutRemaining(): number {
  const lockoutTime = localStorage.getItem(PIN_LOCKOUT_KEY);
  if (!lockoutTime) return 0;
  
  const lockout = parseInt(lockoutTime, 10);
  const now = Date.now();
  const remaining = Math.ceil((lockout - now) / 1000);
  
  return Math.max(0, remaining);
}

// Validate PIN format
export function isValidPinFormat(pin: string): boolean {
  return pin.length === PIN_LENGTH && /^\d+$/.test(pin);
}

// Format remaining lockout time
export function formatLockoutTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
