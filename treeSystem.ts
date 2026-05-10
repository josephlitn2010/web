/**
 * Tree Growth System - Visual representation of learning progress
 * The tree grows as users master more words
 */

export interface TreeState {
  level: number; // 1-10 levels
  growth: number; // 0-100 progress to next level
  totalMastered: number;
  milestones: number[]; // Words mastered at each level
}

export const TREE_LEVELS = [
  {
    level: 1,
    name: 'Seedling',
    icon: '🌱',
    wordsNeeded: 5,
    description: 'Your learning journey begins',
  },
  {
    level: 2,
    name: 'Sprout',
    icon: '🌿',
    wordsNeeded: 15,
    description: 'Growing stronger',
  },
  {
    level: 3,
    name: 'Young Tree',
    icon: '🌳',
    wordsNeeded: 30,
    description: 'Steady progress',
  },
  {
    level: 4,
    name: 'Flourishing Tree',
    icon: '🌲',
    wordsNeeded: 50,
    description: 'Impressive growth',
  },
  {
    level: 5,
    name: 'Mighty Oak',
    icon: '🌳',
    wordsNeeded: 100,
    description: 'Strong foundation',
  },
  {
    level: 6,
    name: 'Ancient Tree',
    icon: '🌲',
    wordsNeeded: 200,
    description: 'Wisdom accumulated',
  },
  {
    level: 7,
    name: 'Legendary Tree',
    icon: '🌳',
    wordsNeeded: 500,
    description: 'Mastery in sight',
  },
  {
    level: 8,
    name: 'Sacred Tree',
    icon: '🌲',
    wordsNeeded: 1000,
    description: 'Near perfection',
  },
  {
    level: 9,
    name: 'Eternal Tree',
    icon: '🌳',
    wordsNeeded: 2000,
    description: 'Ultimate knowledge',
  },
  {
    level: 10,
    name: 'World Tree',
    icon: '🌲',
    wordsNeeded: 5000,
    description: 'Infinite wisdom',
  },
];

export function initializeTreeState(): TreeState {
  const saved = localStorage.getItem('treeState');
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    level: 1,
    growth: 0,
    totalMastered: 0,
    milestones: [],
  };
}

export function saveTreeState(state: TreeState): void {
  localStorage.setItem('treeState', JSON.stringify(state));
}

export function updateTreeProgress(masteredWords: number): TreeState {
  const state = initializeTreeState();
  state.totalMastered = masteredWords;

  // Calculate current level and growth
  let currentLevel = 1;
  let wordsForCurrentLevel = 0;

  for (let i = 0; i < TREE_LEVELS.length; i++) {
    const cumulativeWords = TREE_LEVELS.slice(0, i + 1).reduce((sum, level) => sum + level.wordsNeeded, 0);
    if (masteredWords >= cumulativeWords) {
      currentLevel = i + 1;
      wordsForCurrentLevel = cumulativeWords;
    } else {
      break;
    }
  }

  state.level = Math.min(currentLevel, TREE_LEVELS.length);

  // Calculate growth percentage to next level
  if (state.level < TREE_LEVELS.length) {
    const currentLevelData = TREE_LEVELS[state.level - 1];
    const nextLevelData = TREE_LEVELS[state.level];
    const wordsInCurrentLevel = currentLevelData.wordsNeeded;
    const wordsNeededForNext = nextLevelData.wordsNeeded;
    const totalWordsNeeded = wordsInCurrentLevel + wordsNeededForNext;

    const wordsProgressInLevel = masteredWords - wordsForCurrentLevel;
    state.growth = Math.min(100, Math.max(0, (wordsProgressInLevel / wordsNeededForNext) * 100));
  } else {
    state.growth = 100;
  }

  saveTreeState(state);
  return state;
}

export function getTreeLevel(masteredWords: number): (typeof TREE_LEVELS)[0] {
  const state = updateTreeProgress(masteredWords);
  return TREE_LEVELS[state.level - 1];
}

export function getNextTreeLevel(masteredWords: number): (typeof TREE_LEVELS)[0] | null {
  const state = updateTreeProgress(masteredWords);
  if (state.level < TREE_LEVELS.length) {
    return TREE_LEVELS[state.level];
  }
  return null;
}

export function getWordsUntilNextLevel(masteredWords: number): number {
  const state = updateTreeProgress(masteredWords);
  if (state.level >= TREE_LEVELS.length) {
    return 0;
  }

  let totalWordsForCurrentLevel = 0;
  for (let i = 0; i < state.level; i++) {
    totalWordsForCurrentLevel += TREE_LEVELS[i].wordsNeeded;
  }

  const nextLevelWords = TREE_LEVELS[state.level].wordsNeeded;
  const wordsUntilNext = totalWordsForCurrentLevel + nextLevelWords - masteredWords;
  return Math.max(0, wordsUntilNext);
}
