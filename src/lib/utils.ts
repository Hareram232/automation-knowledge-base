import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function highlightMatches(text: string, terms: string[]): string {
  if (!terms.length) return text;
  
  let result = text;
  const sortedTerms = [...terms].sort((a, b) => b.length - a.length);
  
  for (const term of sortedTerms) {
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    result = result.replace(regex, '<mark>$1</mark>');
  }
  
  return result;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export function getDeviceTypeColor(type: string): string {
  const colors: Record<string, string> = {
    PLC: 'bg-blue-100 text-blue-800',
    HMI: 'bg-green-100 text-green-800',
    SCADA: 'bg-purple-100 text-purple-800',
    VFD: 'bg-orange-100 text-orange-800',
    Sensor: 'bg-pink-100 text-pink-800',
    Controller: 'bg-red-100 text-red-800',
    Other: 'bg-gray-100 text-gray-800'
  };
  return colors[type] || colors.Other;
}

export function getDeviceTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    PLC: 'cpu',
    HMI: 'monitor',
    SCADA: 'server',
    VFD: 'zap',
    Sensor: 'radar',
    Controller: 'database',
    Other: 'box'
  };
  return icons[type] || icons.Other;
}