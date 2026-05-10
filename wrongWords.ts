/**
 * Wrong Words System - Tracks words that user got wrong during practice
 * Allows focused review on problematic words
 */

export interface WrongWordEntry {
  id: string;
  english: string;
  chinese: string;
  ipa?: string;
  userAnswer?: string;
  correctAnswer: string;
  mode: 'dictation' | 'quiz' | 'listening' | 'flashcard'; // Which mode the error occurred in
  timestamp: number;
  reviewCount: number; // How many times reviewed
  mastered: boolean; // Whether user has mastered this word after review
}

const WRONG_WORDS_STORE = 'wrongWords';

export function initializeWrongWords(): WrongWordEntry[] {
  const saved = localStorage.getItem(WRONG_WORDS_STORE);
  if (saved) {
    return JSON.parse(saved);
  }
  return [];
}

export function saveWrongWords(words: WrongWordEntry[]): void {
  localStorage.setItem(WRONG_WORDS_STORE, JSON.stringify(words));
}

export function addWrongWord(
  english: string,
  chinese: string,
  correctAnswer: string,
  mode: 'dictation' | 'quiz' | 'listening' | 'flashcard',
  ipa?: string,
  userAnswer?: string
): void {
  const words = initializeWrongWords();

  // Check if word already exists
  const existingIndex = words.findIndex(w => w.english.toLowerCase() === english.toLowerCase());

  if (existingIndex >= 0) {
    // Update existing entry
    words[existingIndex].timestamp = Date.now();
    words[existingIndex].userAnswer = userAnswer;
  } else {
    // Add new entry
    const newEntry: WrongWordEntry = {
      id: `wrong-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      english,
      chinese,
      ipa,
      userAnswer,
      correctAnswer,
      mode,
      timestamp: Date.now(),
      reviewCount: 0,
      mastered: false,
    };
    words.push(newEntry);
  }

  saveWrongWords(words);
}

export function getWrongWords(): WrongWordEntry[] {
  return initializeWrongWords().filter(w => !w.mastered);
}

export function getAllWrongWords(): WrongWordEntry[] {
  return initializeWrongWords();
}

export function markWrongWordAsReviewed(id: string): void {
  const words = initializeWrongWords();
  const index = words.findIndex(w => w.id === id);
  if (index >= 0) {
    words[index].reviewCount += 1;
  }
  saveWrongWords(words);
}

export function markWrongWordAsMastered(id: string): void {
  const words = initializeWrongWords();
  const index = words.findIndex(w => w.id === id);
  if (index >= 0) {
    words[index].mastered = true;
  }
  saveWrongWords(words);
}

export function deleteWrongWord(id: string): void {
  const words = initializeWrongWords();
  const filtered = words.filter(w => w.id !== id);
  saveWrongWords(filtered);
}

export function clearAllWrongWords(): void {
  localStorage.removeItem(WRONG_WORDS_STORE);
}

export function getWrongWordsStats(): {
  total: number;
  active: number;
  mastered: number;
  byMode: { dictation: number; quiz: number; listening: number };
} {
  const words = initializeWrongWords();
  return {
    total: words.length,
    active: words.filter(w => !w.mastered).length,
    mastered: words.filter(w => w.mastered).length,
    byMode: {
      dictation: words.filter(w => w.mode === 'dictation' && !w.mastered).length,
      quiz: words.filter(w => w.mode === 'quiz' && !w.mastered).length,
      listening: words.filter(w => w.mode === 'listening' && !w.mastered).length,
    },
  };
}
