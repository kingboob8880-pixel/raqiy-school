// ==========================================
// RUKYA PRO - Error Logger Utility
// ==========================================

import { nanoid } from 'nanoid';
import { ErrorLog } from '../types';
import { MAX_ERROR_LOGS } from '../constants';

const STORAGE_KEY = 'rukya_errors';

// Get errors from localStorage
export function getErrors(): ErrorLog[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Save errors to localStorage
function saveErrors(errors: ErrorLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(errors));
  } catch (error) {
    console.error('Failed to save errors:', error);
  }
}

// Log an error
export function logError(
  message: string,
  error?: Error | unknown,
  context?: string,
  component?: string
): void {
  const errorLog: ErrorLog = {
    id: nanoid(),
    timestamp: new Date().toISOString(),
    message,
    stack: error instanceof Error ? error.stack : undefined,
    context,
    component
  };
  
  const errors = getErrors();
  errors.unshift(errorLog);
  
  // Keep only last MAX_ERROR_LOGS errors
  const trimmed = errors.slice(0, MAX_ERROR_LOGS);
  saveErrors(trimmed);
  
  console.error(`[${component || 'App'}] ${message}`, error);
}

// Clear all errors
export function clearErrors(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Export errors as text
export function exportErrorsAsText(): string {
  const errors = getErrors();
  
  if (errors.length === 0) {
    return 'Нет ошибок для экспорта.';
  }
  
  let text = '=== ТЕХНИЧЕСКИЙ ОТЧЁТ ОШИБОК ===\n';
  text += `Дата: ${new Date().toLocaleString('ru-RU')}\n`;
  text += `Количество ошибок: ${errors.length}\n`;
  text += '================================\n\n';
  
  errors.forEach((error, index) => {
    text += `[${index + 1}] ${error.timestamp}\n`;
    text += `Компонент: ${error.component || 'Не указан'}\n`;
    text += `Сообщение: ${error.message}\n`;
    if (error.context) {
      text += `Контекст: ${error.context}\n`;
    }
    if (error.stack) {
      text += `Стек:\n${error.stack}\n`;
    }
    text += '\n---\n\n';
  });
  
  return text;
}

// Download errors as file
export function downloadErrors(): void {
  const text = exportErrorsAsText();
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `rukya-errors-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Copy errors to clipboard
export async function copyErrorsToClipboard(): Promise<boolean> {
  try {
    const text = exportErrorsAsText();
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

// Get error count
export function getErrorCount(): number {
  return getErrors().length;
}
