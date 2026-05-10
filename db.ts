/**
 * IndexedDB Database Layer for VocabLearn
 * Handles all vocabulary storage, retrieval, and management
 */

export interface VocabularyEntry {
  id: string;
  english: string;
  chinese: string;
  pronunciation?: string;
  ipa?: string; // International Phonetic Alphabet
  exampleSentence?: string;
  category: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  mastery: number; // 0-100, represents learning progress
  lastReviewedAt?: number;
  reviewCount: number;
  isEdited?: boolean; // true if manually edited after creation
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface StudySession {
  id: string;
  date: number;
  wordsStudied: number;
  wordsLearned: number;
  duration: number; // in seconds
}

const DB_NAME = 'VocabLearnDB';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

/**
 * Initialize the database
 */
export async function initializeDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create vocabulary store
      if (!database.objectStoreNames.contains('vocabulary')) {
        const vocabStore = database.createObjectStore('vocabulary', { keyPath: 'id' });
        vocabStore.createIndex('category', 'category', { unique: false });
        vocabStore.createIndex('createdAt', 'createdAt', { unique: false });
        vocabStore.createIndex('mastery', 'mastery', { unique: false });
      }

      // Create categories store
      if (!database.objectStoreNames.contains('categories')) {
        database.createObjectStore('categories', { keyPath: 'id' });
      }

      // Create study sessions store
      if (!database.objectStoreNames.contains('studySessions')) {
        const sessionStore = database.createObjectStore('studySessions', { keyPath: 'id' });
        sessionStore.createIndex('date', 'date', { unique: false });
      }
    };
  });
}

/**
 * Get the database instance
 */
function getDB(): IDBDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDB() first.');
  }
  return db;
}

/**
 * Add a new vocabulary entry
 */
export async function addVocabulary(entry: Omit<VocabularyEntry, 'id' | 'createdAt' | 'updatedAt' | 'reviewCount'>): Promise<string> {
  const database = getDB();
  const id = `vocab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newEntry: VocabularyEntry = {
    ...entry,
    id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    reviewCount: 0,
    mastery: entry.mastery || 0,
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['vocabulary'], 'readwrite');
    const store = transaction.objectStore('vocabulary');
    const request = store.add(newEntry);

    request.onerror = () => reject(new Error('Failed to add vocabulary'));
    request.onsuccess = () => resolve(id);
  });
}

/**
 * Get all vocabulary entries
 */
export async function getAllVocabulary(): Promise<VocabularyEntry[]> {
  const database = getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['vocabulary'], 'readonly');
    const store = transaction.objectStore('vocabulary');
    const request = store.getAll();

    request.onerror = () => reject(new Error('Failed to get vocabulary'));
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Get vocabulary by category
 */
export async function getVocabularyByCategory(category: string): Promise<VocabularyEntry[]> {
  const database = getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['vocabulary'], 'readonly');
    const store = transaction.objectStore('vocabulary');
    const index = store.index('category');
    const request = index.getAll(category);

    request.onerror = () => reject(new Error('Failed to get vocabulary by category'));
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Get a single vocabulary entry by ID
 */
export async function getVocabularyById(id: string): Promise<VocabularyEntry | undefined> {
  const database = getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['vocabulary'], 'readonly');
    const store = transaction.objectStore('vocabulary');
    const request = store.get(id);

    request.onerror = () => reject(new Error('Failed to get vocabulary'));
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Update a vocabulary entry
 */
export async function updateVocabulary(id: string, updates: Partial<VocabularyEntry>): Promise<void> {
  const database = getDB();
  const existing = await getVocabularyById(id);
  
  if (!existing) {
    throw new Error('Vocabulary entry not found');
  }

  // Check if content was manually edited (not just mastery/review updates)
  const isContentEdit = updates.english || updates.chinese || updates.exampleSentence || updates.category || updates.tags;
  
  const updated: VocabularyEntry = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: Date.now(),
    isEdited: isContentEdit ? true : existing.isEdited,
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['vocabulary'], 'readwrite');
    const store = transaction.objectStore('vocabulary');
    const request = store.put(updated);

    request.onerror = () => reject(new Error('Failed to update vocabulary'));
    request.onsuccess = () => resolve();
  });
}

/**
 * Update mastery for a vocabulary entry based on quiz/dictation result
 */
export async function updateMastery(id: string, isCorrect: boolean): Promise<void> {
  const existing = await getVocabularyById(id);
  
  if (!existing) {
    throw new Error('Vocabulary entry not found');
  }

  // Calculate new mastery: increase by 10 if correct, decrease by 5 if incorrect
  let newMastery = existing.mastery || 0;
  if (isCorrect) {
    newMastery = Math.min(100, newMastery + 10);
  } else {
    newMastery = Math.max(0, newMastery - 5);
  }

  await updateVocabulary(id, {
    mastery: newMastery,
    reviewCount: (existing.reviewCount || 0) + 1,
    lastReviewedAt: Date.now(),
  });
}

/**
 * Get mastery level label
 */
export function getMasteryLevel(mastery: number): string {
  if (mastery >= 90) return 'Mastered';
  if (mastery >= 70) return 'Advanced';
  if (mastery >= 50) return 'Intermediate';
  if (mastery >= 30) return 'Learning';
  return 'New';
}

/**
 * Delete a vocabulary entry
 */
export async function deleteVocabulary(id: string): Promise<void> {
  const database = getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['vocabulary'], 'readwrite');
    const store = transaction.objectStore('vocabulary');
    const request = store.delete(id);

    request.onerror = () => reject(new Error('Failed to delete vocabulary'));
    request.onsuccess = () => resolve();
  });
}

/**
 * Search vocabulary by English word or Chinese meaning
 */
export async function searchVocabulary(query: string): Promise<VocabularyEntry[]> {
  const allVocab = await getAllVocabulary();
  const lowerQuery = query.toLowerCase();
  
  return allVocab.filter(entry =>
    entry.english.toLowerCase().includes(lowerQuery) ||
    entry.chinese.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Add a new category (with duplicate prevention)
 */
export async function addCategory(name: string, color: string): Promise<string> {
  const database = getDB();
  
  // First check if category already exists
  const existingCategory = await getCategoryByName(name);
  if (existingCategory) {
    return existingCategory.id;
  }
  
  const id = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const category: Category = {
    id,
    name,
    color,
    createdAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['categories'], 'readwrite');
    const store = transaction.objectStore('categories');
    const request = store.add(category);

    request.onerror = () => reject(new Error('Failed to add category'));
    request.onsuccess = () => resolve(id);
  });
}

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<Category[]> {
  const database = getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['categories'], 'readonly');
    const store = transaction.objectStore('categories');
    const request = store.getAll();

    request.onerror = () => reject(new Error('Failed to get categories'));
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Get a category by name
 */
export async function getCategoryByName(name: string): Promise<Category | undefined> {
  const database = getDB();
  const normalizedName = name.trim().toLowerCase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['categories'], 'readonly');
    const store = transaction.objectStore('categories');
    const request = store.getAll();

    request.onerror = () => reject(new Error('Failed to get category'));
    request.onsuccess = () => {
      const categories = request.result as Category[];
      // Find category with normalized name (trimmed and lowercase)
      const found = categories.find(cat => cat.name.trim().toLowerCase() === normalizedName);
      resolve(found);
    };
  });
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<void> {
  const database = getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['categories'], 'readwrite');
    const store = transaction.objectStore('categories');
    const request = store.delete(id);

    request.onerror = () => reject(new Error('Failed to delete category'));
    request.onsuccess = () => resolve();
  });
}

/**
 * Export all data as JSON
 */
export async function exportAllData(): Promise<{
  vocabulary: VocabularyEntry[];
  categories: Category[];
  exportedAt: number;
}> {
  const vocabulary = await getAllVocabulary();
  const categories = await getAllCategories();

  return {
    vocabulary,
    categories,
    exportedAt: Date.now(),
  };
}

/**
 * Import data from JSON
 */
export async function importData(data: {
  vocabulary: VocabularyEntry[];
  categories: Category[];
}): Promise<void> {
  const database = getDB();

  // Import categories
  for (const category of data.categories) {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.put(category);

      request.onerror = () => reject(new Error('Failed to import category'));
      request.onsuccess = () => resolve(null);
    });
  }

  // Import vocabulary
  for (const vocab of data.vocabulary) {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(['vocabulary'], 'readwrite');
      const store = transaction.objectStore('vocabulary');
      const request = store.put(vocab);

      request.onerror = () => reject(new Error('Failed to import vocabulary'));
      request.onsuccess = () => resolve(null);
    });
  }
}

/**
 * Add a study session
 */
export async function addStudySession(session: Omit<StudySession, 'id'>): Promise<string> {
  const database = getDB();
  const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newSession: StudySession = {
    ...session,
    id,
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['studySessions'], 'readwrite');
    const store = transaction.objectStore('studySessions');
    const request = store.add(newSession);

    request.onerror = () => reject(new Error('Failed to add study session'));
    request.onsuccess = () => resolve(id);
  });
}

/**
 * Get study sessions for today
 */
export async function getTodaysSessions(): Promise<StudySession[]> {
  const database = getDB();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['studySessions'], 'readonly');
    const store = transaction.objectStore('studySessions');
    const index = store.index('date');
    const range = IDBKeyRange.lowerBound(todayTimestamp);
    const request = index.getAll(range);

    request.onerror = () => reject(new Error('Failed to get today sessions'));
    request.onsuccess = () => {
      const sessions = request.result.filter(s => s.date >= todayTimestamp);
      resolve(sessions);
    };
  });
}

/**
 * Get study sessions for the last 7 days
 */
export async function getWeeklySessionsData(): Promise<StudySession[]> {
  const database = getDB();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const sevenDaysAgoTimestamp = sevenDaysAgo.getTime();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['studySessions'], 'readonly');
    const store = transaction.objectStore('studySessions');
    const index = store.index('date');
    const range = IDBKeyRange.lowerBound(sevenDaysAgoTimestamp);
    const request = index.getAll(range);

    request.onerror = () => reject(new Error('Failed to get weekly sessions'));
    request.onsuccess = () => {
      const sessions = request.result.filter(s => s.date >= sevenDaysAgoTimestamp);
      resolve(sessions);
    };
  });
}

/**
 * Get all study sessions
 */
export async function getAllStudySessions(): Promise<StudySession[]> {
  const database = getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['studySessions'], 'readonly');
    const store = transaction.objectStore('studySessions');
    const request = store.getAll();

    request.onerror = () => reject(new Error('Failed to get all sessions'));
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Clear all data (for testing/reset)
 */
export async function clearAllData(): Promise<void> {
  const database = getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['vocabulary', 'categories', 'studySessions'], 'readwrite');
    
    transaction.objectStore('vocabulary').clear();
    transaction.objectStore('categories').clear();
    transaction.objectStore('studySessions').clear();

    transaction.onerror = () => reject(new Error('Failed to clear data'));
    transaction.oncomplete = () => resolve();
  });
}

/**
 * Get category statistics (name, count, word list)
 */
export async function getCategoryStats(): Promise<Array<{
  id: string;
  name: string;
  normalizedName: string;
  count: number;
  words: VocabularyEntry[];
}>> {
  const vocabulary = await getAllVocabulary();
  const categories = await getAllCategories();
  
  const stats = categories.map(cat => {
    const words = vocabulary.filter(v => v.category === cat.name);
    return {
      id: cat.id,
      name: cat.name,
      normalizedName: cat.name.trim().toLowerCase(),
      count: words.length,
      words,
    };
  });
  
  return stats;
}

/**
 * Find duplicate categories (same normalized name)
 */
export async function findDuplicateCategories(): Promise<Array<{
  normalizedName: string;
  categories: Array<{ id: string; name: string; count: number }>;
}>> {
  const stats = await getCategoryStats();
  const grouped = new Map<string, Array<{ id: string; name: string; count: number }>>();
  
  stats.forEach(stat => {
    const key = stat.normalizedName;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push({
      id: stat.id,
      name: stat.name,
      count: stat.count,
    });
  });
  
  // Filter to only groups with duplicates (more than 1)
  const duplicates = Array.from(grouped.entries())
    .filter(([_, cats]) => cats.length > 1)
    .map(([normalizedName, categories]) => ({
      normalizedName,
      categories,
    }));
  
  return duplicates;
}

/**
 * Merge categories: move all vocabulary from source to target, then delete source
 */
export async function mergeCategories(sourceId: string, targetId: string): Promise<void> {
  const database = getDB();
  const vocabulary = await getAllVocabulary();
  
  // Find source and target categories
  const sourceCategory = await getCategoryById(sourceId);
  const targetCategory = await getCategoryById(targetId);
  
  if (!sourceCategory || !targetCategory) {
    throw new Error('Source or target category not found');
  }
  
  // Get all words in source category
  const sourceWords = vocabulary.filter(v => v.category === sourceCategory.name);
  
  // Update all words to target category
  for (const word of sourceWords) {
    await updateVocabulary(word.id, {
      category: targetCategory.name,
    });
  }
  
  // Delete source category
  await deleteCategory(sourceId);
}

/**
 * Get a category by ID
 */
export async function getCategoryById(id: string): Promise<Category | undefined> {
  const database = getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['categories'], 'readonly');
    const store = transaction.objectStore('categories');
    const request = store.get(id);
    
    request.onerror = () => reject(new Error('Failed to get category'));
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Delete empty categories
 */
export async function deleteEmptyCategories(): Promise<number> {
  const stats = await getCategoryStats();
  const emptyCategories = stats.filter(stat => stat.count === 0);
  
  for (const cat of emptyCategories) {
    await deleteCategory(cat.id);
  }
  
  return emptyCategories.length;
}

/**
 * Batch delete multiple vocabulary entries
 */
export async function deleteMultipleVocabulary(ids: string[]): Promise<void> {
  for (const id of ids) {
    await deleteVocabulary(id);
  }
}

/**
 * Batch update mastery for multiple vocabulary entries
 */
export async function updateMultipleMastery(ids: string[], mastery: number): Promise<void> {
  const clampedMastery = Math.max(0, Math.min(100, mastery));
  for (const id of ids) {
    await updateVocabulary(id, {
      mastery: clampedMastery,
      lastReviewedAt: Date.now(),
    });
  }
}

/**
 * Batch update category for multiple vocabulary entries
 */
export async function updateMultipleCategory(ids: string[], category: string): Promise<void> {
  for (const id of ids) {
    await updateVocabulary(id, {
      category,
    });
  }
}
