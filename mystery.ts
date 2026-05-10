/**
 * Mystery System - Achievements and Rewards
 * Tracks user achievements and unlocks special rewards
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  reward: string;
}

export interface MysteryState {
  achievements: Achievement[];
  totalMasteredWords: number;
  totalReviewCount: number;
  streakDays: number;
  specialPowers: string[];
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-word',
    name: 'First Step',
    description: 'Add your first vocabulary word',
    icon: '📝',
    reward: '🎁 Unlock basic learning mode',
  },
  {
    id: 'ten-words',
    name: 'Building Blocks',
    description: 'Master 10 vocabulary words',
    icon: '🏗️',
    reward: '🎨 Unlock category colors customization',
  },
  {
    id: 'fifty-words',
    name: 'Halfway There',
    description: 'Master 50 vocabulary words',
    icon: '🚀',
    reward: '⭐ Unlock achievement badges',
  },
  {
    id: 'hundred-words',
    name: 'Century Club',
    description: 'Master 100 vocabulary words',
    icon: '💯',
    reward: '🌙 Unlock dark mode theme',
  },
  {
    id: 'five-hundred-words',
    name: 'Word Collector',
    description: 'Master 500 vocabulary words',
    icon: '📚',
    reward: '✨ Unlock premium animations',
  },
  {
    id: 'thousand-words',
    name: 'Vocabulary Master',
    description: 'Master 1000 vocabulary words',
    icon: '👑',
    reward: '💎 Unlock exclusive features',
  },
  {
    id: 'perfect-day',
    name: 'Perfect Day',
    description: 'Get 100% accuracy in a study session',
    icon: '🌟',
    reward: '🏅 Unlock special badge',
  },
  {
    id: 'seven-day-streak',
    name: 'Week Warrior',
    description: 'Maintain a 7-day practice streak',
    icon: '🔥',
    reward: '⚡ Unlock streak multiplier (1.5x points)',
  },
  {
    id: 'thirty-day-streak',
    name: 'Month Master',
    description: 'Maintain a 30-day practice streak',
    icon: '🏆',
    reward: '💪 Unlock streak multiplier (2x points)',
  },
  {
    id: 'all-modes',
    name: 'Versatile Learner',
    description: 'Use all 4 study modes (Flashcard, Listening, Dictation, Quiz)',
    icon: '🎯',
    reward: '🎪 Unlock mixed mode study',
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete 50 words in one session',
    icon: '⚡',
    reward: '🚄 Unlock fast-track learning',
  },
  {
    id: 'comeback-kid',
    name: 'Comeback Kid',
    description: 'Recover a word from 0% mastery back to 100%',
    icon: '💪',
    reward: '🔄 Unlock recovery boost',
  },
];

export function initializeMysteryState(): MysteryState {
  const saved = localStorage.getItem('mysteryState');
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    achievements: [],
    totalMasteredWords: 0,
    totalReviewCount: 0,
    streakDays: 0,
    specialPowers: [],
  };
}

export function saveMysteryState(state: MysteryState): void {
  localStorage.setItem('mysteryState', JSON.stringify(state));
}

export function checkAchievements(
  masteredWords: number,
  totalReviews: number,
  vocabulary: any[],
  modesUsed?: string[],
  lastSessionAccuracy?: number,
  streakDays?: number
): Achievement[] {
  const state = initializeMysteryState();
  const newAchievements: Achievement[] = [];

  // Helper function to add achievement
  const addAchievement = (id: string) => {
    if (!state.achievements.find(a => a.id === id)) {
      const achievement = { ...ACHIEVEMENTS.find(a => a.id === id)!, unlockedAt: Date.now() };
      newAchievements.push(achievement);
      state.achievements.push(achievement);
    }
  };

  // Check first word
  if (vocabulary.length >= 1) {
    addAchievement('first-word');
  }

  // Check mastery milestones
  if (masteredWords >= 10) {
    addAchievement('ten-words');
  }
  if (masteredWords >= 50) {
    addAchievement('fifty-words');
  }
  if (masteredWords >= 100) {
    addAchievement('hundred-words');
  }
  if (masteredWords >= 500) {
    addAchievement('five-hundred-words');
  }
  if (masteredWords >= 1000) {
    addAchievement('thousand-words');
  }

  // Check perfect day (100% accuracy in session)
  if (lastSessionAccuracy === 100) {
    addAchievement('perfect-day');
  }

  // Check streak achievements
  if (streakDays && streakDays >= 7) {
    addAchievement('seven-day-streak');
  }
  if (streakDays && streakDays >= 30) {
    addAchievement('thirty-day-streak');
  }

  // Check all modes used
  if (modesUsed && modesUsed.length >= 4) {
    addAchievement('all-modes');
  }

  // Check speed demon (50 words in one session)
  if (totalReviews >= 50) {
    addAchievement('speed-demon');
  }

  // Check comeback kid (word recovered from 0% to 100%)
  const comebackWords = vocabulary.filter(v => {
    // This would need to be tracked separately in real implementation
    // For now, we check if there are mastered words with high review counts
    return v.mastery >= 100 && (v.reviewCount || 0) >= 5;
  });
  if (comebackWords.length > 0) {
    addAchievement('comeback-kid');
  }

  if (newAchievements.length > 0) {
    saveMysteryState(state);
  }

  return newAchievements;
}

export function getUnlockedPowers(achievements: Achievement[]): string[] {
  const powers: string[] = [];
  achievements.forEach(a => {
    if (a.id === 'first-word') powers.push('basic-mode');
    if (a.id === 'ten-words') powers.push('category-colors');
    if (a.id === 'fifty-words') powers.push('achievement-badges');
    if (a.id === 'hundred-words') powers.push('dark-mode');
    if (a.id === 'five-hundred-words') powers.push('premium-animations');
    if (a.id === 'thousand-words') powers.push('exclusive-features');
    if (a.id === 'perfect-day') powers.push('special-badge');
    if (a.id === 'seven-day-streak') powers.push('streak-multiplier-1.5');
    if (a.id === 'thirty-day-streak') powers.push('streak-multiplier-2');
    if (a.id === 'all-modes') powers.push('mixed-mode');
    if (a.id === 'speed-demon') powers.push('fast-track');
    if (a.id === 'comeback-kid') powers.push('recovery-boost');
  });
  return Array.from(new Set(powers));
}

export function getAchievementProgress(masteredWords: number): {
  current: number;
  nextMilestone: number;
  percentage: number;
} {
  let current = masteredWords;
  let nextMilestone = 10;

  if (masteredWords >= 1000) {
    nextMilestone = 10000;
    current = masteredWords;
  } else if (masteredWords >= 100) {
    nextMilestone = 1000;
    current = masteredWords;
  } else if (masteredWords >= 10) {
    nextMilestone = 100;
    current = masteredWords;
  }

  const percentage = Math.min(100, (current / nextMilestone) * 100);
  return { current, nextMilestone, percentage };
}

export function getAllAchievements(): Achievement[] {
  return ACHIEVEMENTS;
}
