import { VocabularyEntry } from './db';

export interface ReviewItem {
  id: string;
  english: string;
  chinese: string;
  mastery: number;
  lastReviewedAt?: number;
  daysAgo: number;
  priority: number; // 0-100, higher = more urgent
  reason: string; // 複習原因
}

/**
 * 根據 Ebbinghaus 遺忘曲線計算複習優先級
 * 優先級 = (100 - mastery) * urgencyFactor
 * urgencyFactor 基於上次複習時間
 */
function calculateReviewPriority(
  mastery: number,
  lastReviewedAt?: number
): { priority: number; reason: string } {
  const now = Date.now();
  
  // 如果從未複習過，優先級最高
  if (!lastReviewedAt) {
    return {
      priority: 100,
      reason: 'Never reviewed',
    };
  }

  const daysAgo = (now - lastReviewedAt) / (1000 * 60 * 60 * 24);

  // 根據掌握度和時間計算優先級
  // 掌握度越低，優先級越高
  // 距離上次複習越久，優先級越高
  let urgencyFactor = 1;

  if (daysAgo < 1) {
    urgencyFactor = 0.5; // 1 天內複習過，優先級較低
  } else if (daysAgo < 3) {
    urgencyFactor = 1; // 1-3 天，正常優先級
  } else if (daysAgo < 7) {
    urgencyFactor = 1.5; // 3-7 天，優先級提高
  } else if (daysAgo < 14) {
    urgencyFactor = 2; // 7-14 天，優先級更高
  } else if (daysAgo < 30) {
    urgencyFactor = 2.5; // 14-30 天，很高優先級
  } else {
    urgencyFactor = 3; // 超過 30 天，最高優先級
  }

  const priority = Math.min(100, (100 - mastery) * urgencyFactor);

  // 根據複習間隔確定原因
  let reason = '';
  if (mastery < 30) {
    reason = 'Low mastery - needs practice';
  } else if (daysAgo > 30) {
    reason = 'Not reviewed for 30+ days';
  } else if (daysAgo > 14) {
    reason = 'Not reviewed for 14+ days';
  } else if (daysAgo > 7) {
    reason = 'Not reviewed for 7+ days';
  } else if (daysAgo > 3) {
    reason = 'Not reviewed for 3+ days';
  } else if (mastery < 70) {
    reason = 'Needs more practice';
  } else {
    reason = 'Regular review';
  }

  return { priority, reason };
}

/**
 * 生成今日複習計劃
 */
export function generateTodayReviewPlan(
  vocabulary: VocabularyEntry[],
  maxReviewCount: number = 20
): ReviewItem[] {
  const now = Date.now();

  // 計算每個詞彙的複習優先級
  const reviewItems: ReviewItem[] = vocabulary
    .map(word => {
      const { priority, reason } = calculateReviewPriority(
        word.mastery,
        word.lastReviewedAt
      );
      const daysAgo = word.lastReviewedAt
        ? Math.floor((now - word.lastReviewedAt) / (1000 * 60 * 60 * 24))
        : -1;

      return {
        id: word.id,
        english: word.english,
        chinese: word.chinese,
        mastery: word.mastery,
        lastReviewedAt: word.lastReviewedAt,
        daysAgo,
        priority,
        reason,
      };
    })
    // 按優先級排序（從高到低）
    .sort((a, b) => b.priority - a.priority)
    // 取前 N 個
    .slice(0, maxReviewCount);

  return reviewItems;
}

/**
 * 根據複習進度更新掌握度
 */
export function updateMasteryAfterReview(
  currentMastery: number,
  isCorrect: boolean,
  reviewCount: number
): number {
  // 如果答對，增加掌握度
  if (isCorrect) {
    // 掌握度越高，增長越慢
    const increment = Math.max(2, 10 - reviewCount * 0.5);
    return Math.min(100, currentMastery + increment);
  } else {
    // 如果答錯，降低掌握度
    const decrement = Math.max(5, 15 - reviewCount * 0.5);
    return Math.max(0, currentMastery - decrement);
  }
}

/**
 * 獲取複習統計信息
 */
export function getReviewStats(vocabulary: VocabularyEntry[]) {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  const reviewedToday = vocabulary.filter(
    w => w.lastReviewedAt && w.lastReviewedAt > oneDayAgo
  ).length;

  const reviewedLast3Days = vocabulary.filter(
    w => w.lastReviewedAt && w.lastReviewedAt > threeDaysAgo
  ).length;

  const reviewedLast7Days = vocabulary.filter(
    w => w.lastReviewedAt && w.lastReviewedAt > sevenDaysAgo
  ).length;

  const neverReviewed = vocabulary.filter(w => !w.lastReviewedAt).length;

  const averageMastery =
    vocabulary.length > 0
      ? Math.round(
          vocabulary.reduce((sum, w) => sum + w.mastery, 0) / vocabulary.length
        )
      : 0;

  const masteredWords = vocabulary.filter(w => w.mastery >= 80).length;

  return {
    reviewedToday,
    reviewedLast3Days,
    reviewedLast7Days,
    neverReviewed,
    averageMastery,
    masteredWords,
    totalWords: vocabulary.length,
  };
}
