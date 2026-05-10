import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { VocabularyEntry } from './db';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Download JSON file
 */
export function downloadJSON(data: any, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse JSON file
 */
export async function parseJSONFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        resolve(json);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Parse bulk vocabulary from textarea (CSV-like format)
 * Format: English | Chinese | Category (one per line)
 */
export function parseBulkVocabulary(text: string): Array<{
  english: string;
  chinese: string;
  category: string;
}> {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const parts = line.split('|').map(p => p.trim());
      return {
        english: parts[0] || '',
        chinese: parts[1] || '',
        category: parts[2] || 'Uncategorized',
      };
    })
    .filter(item => item.english && item.chinese);
}

/**
 * Calculate mastery percentage based on review count and time
 */
export function calculateMastery(entry: VocabularyEntry): number {
  const baseScore = Math.min(entry.mastery, 100);
  const reviewBonus = Math.min(entry.reviewCount * 5, 30);
  const timeDecay = entry.lastReviewedAt 
    ? Math.max(0, 20 - Math.floor((Date.now() - entry.lastReviewedAt) / (1000 * 60 * 60 * 24)))
    : 0;

  return Math.min(100, baseScore + reviewBonus + timeDecay);
}

/**
 * Get category color
 */
export function getCategoryColor(index: number): string {
  const colors = [
    'oklch(0.5 0.15 150)', // Deep Emerald
    'oklch(0.55 0.12 200)', // Teal
    'oklch(0.6 0.12 280)', // Purple
    'oklch(0.65 0.1 25)', // Terracotta
    'oklch(0.58 0.12 40)', // Warm Brown
    'oklch(0.52 0.1 120)', // Sage
    'oklch(0.62 0.12 350)', // Rose
    'oklch(0.6 0.1 280)', // Lavender
  ];
  return colors[index % colors.length];
}

/**
 * Format date for display
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format time duration
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

/**
 * Get progress statistics
 */
export function getProgressStats(vocabulary: VocabularyEntry[]) {
  const totalWords = vocabulary.length;
  const learnedWords = vocabulary.filter(v => v.mastery >= 80).length;
  const reviewedToday = vocabulary.filter(v => {
    if (!v.lastReviewedAt) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return v.lastReviewedAt >= today.getTime();
  }).length;
  const averageMastery = totalWords > 0
    ? Math.round(vocabulary.reduce((sum, v) => sum + v.mastery, 0) / totalWords)
    : 0;

  return {
    totalWords,
    learnedWords,
    reviewedToday,
    averageMastery,
    percentageLearned: totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0,
  };
}

/**
 * Shuffle array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get words for spaced repetition
 */
export function getSpacedRepetitionWords(vocabulary: VocabularyEntry[], count: number = 10): VocabularyEntry[] {
  // Sort by mastery (ascending) and last reviewed time
  const sorted = [...vocabulary].sort((a, b) => {
    const masteryDiff = a.mastery - b.mastery;
    if (masteryDiff !== 0) return masteryDiff;
    
    const aLastReviewed = a.lastReviewedAt || 0;
    const bLastReviewed = b.lastReviewedAt || 0;
    return aLastReviewed - bLastReviewed;
  });

  return sorted.slice(0, count);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
