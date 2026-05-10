import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, BookOpen, Target, Zap, Award, Star, Crown, Sparkles, Rocket } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

interface AchievementSystemProps {
  totalWords: number;
  learnedWords: number;
  reviewedToday: number;
  totalReviewCount: number;
  consecutiveDays?: number;
}

export default function AchievementSystem({
  totalWords,
  learnedWords,
  reviewedToday,
  totalReviewCount,
  consecutiveDays = 0,
}: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    const newAchievements: Achievement[] = [
      // 初級成就（Common）
      {
        id: 'first_word',
        name: 'First Step',
        description: 'Add your first vocabulary word',
        icon: <BookOpen className="w-5 h-5" />,
        unlocked: totalWords >= 1,
        progress: Math.min(totalWords, 1),
        maxProgress: 1,
        rarity: 'common',
        points: 5,
      },
      {
        id: 'ten_words',
        name: 'Building Blocks',
        description: 'Add 10 vocabulary words',
        icon: <Zap className="w-5 h-5" />,
        unlocked: totalWords >= 10,
        progress: Math.min(totalWords, 10),
        maxProgress: 10,
        rarity: 'common',
        points: 10,
      },
      {
        id: 'fifty_words',
        name: 'Word Collector',
        description: 'Add 50 vocabulary words',
        icon: <Target className="w-5 h-5" />,
        unlocked: totalWords >= 50,
        progress: Math.min(totalWords, 50),
        maxProgress: 50,
        rarity: 'rare',
        points: 25,
      },
      {
        id: 'hundred_words',
        name: 'Vocabulary Master',
        description: 'Add 100 vocabulary words',
        icon: <Trophy className="w-5 h-5" />,
        unlocked: totalWords >= 100,
        progress: Math.min(totalWords, 100),
        maxProgress: 100,
        rarity: 'epic',
        points: 50,
      },
      {
        id: 'five_hundred_words',
        name: 'Lexicon Legend',
        description: 'Add 500 vocabulary words',
        icon: <Crown className="w-5 h-5" />,
        unlocked: totalWords >= 500,
        progress: Math.min(totalWords, 500),
        maxProgress: 500,
        rarity: 'legendary',
        points: 100,
      },
      // 複習成就
      {
        id: 'first_review',
        name: 'Getting Started',
        description: 'Review your first word',
        icon: <Zap className="w-5 h-5" />,
        unlocked: totalReviewCount >= 1,
        progress: Math.min(totalReviewCount, 1),
        maxProgress: 1,
        rarity: 'common',
        points: 5,
      },
      {
        id: 'fifty_reviews',
        name: 'Dedicated Learner',
        description: 'Complete 50 reviews',
        icon: <Flame className="w-5 h-5" />,
        unlocked: totalReviewCount >= 50,
        progress: Math.min(totalReviewCount, 50),
        maxProgress: 50,
        rarity: 'common',
        points: 20,
      },
      {
        id: 'hundred_reviews',
        name: 'Review Champion',
        description: 'Complete 100 reviews',
        icon: <Award className="w-5 h-5" />,
        unlocked: totalReviewCount >= 100,
        progress: Math.min(totalReviewCount, 100),
        maxProgress: 100,
        rarity: 'rare',
        points: 40,
      },
      {
        id: 'five_hundred_reviews',
        name: 'Review Master',
        description: 'Complete 500 reviews',
        icon: <Star className="w-5 h-5" />,
        unlocked: totalReviewCount >= 500,
        progress: Math.min(totalReviewCount, 500),
        maxProgress: 500,
        rarity: 'epic',
        points: 75,
      },
      {
        id: 'thousand_reviews',
        name: 'Eternal Scholar',
        description: 'Complete 1000 reviews',
        icon: <Sparkles className="w-5 h-5" />,
        unlocked: totalReviewCount >= 1000,
        progress: Math.min(totalReviewCount, 1000),
        maxProgress: 1000,
        rarity: 'legendary',
        points: 150,
      },
      // 掌握成就
      {
        id: 'mastery_5',
        name: 'Rising Star',
        description: 'Master 5 words (80%+ mastery)',
        icon: <Star className="w-5 h-5" />,
        unlocked: learnedWords >= 5,
        progress: Math.min(learnedWords, 5),
        maxProgress: 5,
        rarity: 'common',
        points: 15,
      },
      {
        id: 'mastery_10',
        name: 'Mastery Achieved',
        description: 'Master 10 words (80%+ mastery)',
        icon: <Trophy className="w-5 h-5" />,
        unlocked: learnedWords >= 10,
        progress: Math.min(learnedWords, 10),
        maxProgress: 10,
        rarity: 'rare',
        points: 30,
      },
      {
        id: 'mastery_50',
        name: 'Expert Scholar',
        description: 'Master 50 words (80%+ mastery)',
        icon: <Crown className="w-5 h-5" />,
        unlocked: learnedWords >= 50,
        progress: Math.min(learnedWords, 50),
        maxProgress: 50,
        rarity: 'epic',
        points: 60,
      },
      {
        id: 'mastery_100',
        name: 'Perfect Knowledge',
        description: 'Master 100 words (80%+ mastery)',
        icon: <Sparkles className="w-5 h-5" />,
        unlocked: learnedWords >= 100,
        progress: Math.min(learnedWords, 100),
        maxProgress: 100,
        rarity: 'legendary',
        points: 120,
      },
      // 連續學習成就
      {
        id: 'daily_streak_3',
        name: 'Consistent Learner',
        description: 'Maintain a 3-day learning streak',
        icon: <Flame className="w-5 h-5" />,
        unlocked: consecutiveDays >= 3,
        progress: Math.min(consecutiveDays, 3),
        maxProgress: 3,
        rarity: 'common',
        points: 15,
      },
      {
        id: 'daily_streak_7',
        name: 'On Fire',
        description: 'Maintain a 7-day learning streak',
        icon: <Flame className="w-5 h-5" />,
        unlocked: consecutiveDays >= 7,
        progress: Math.min(consecutiveDays, 7),
        maxProgress: 7,
        rarity: 'rare',
        points: 35,
      },
      {
        id: 'daily_streak_30',
        name: 'Month Master',
        description: 'Maintain a 30-day learning streak',
        icon: <Rocket className="w-5 h-5" />,
        unlocked: consecutiveDays >= 30,
        progress: Math.min(consecutiveDays, 30),
        maxProgress: 30,
        rarity: 'epic',
        points: 70,
      },
      {
        id: 'daily_streak_100',
        name: 'Century Champion',
        description: 'Maintain a 100-day learning streak',
        icon: <Crown className="w-5 h-5" />,
        unlocked: consecutiveDays >= 100,
        progress: Math.min(consecutiveDays, 100),
        maxProgress: 100,
        rarity: 'legendary',
        points: 150,
      },
      // 每日挑戰成就
      {
        id: 'daily_practice_10',
        name: 'Daily Grind',
        description: 'Review 10 words in a single day',
        icon: <Zap className="w-5 h-5" />,
        unlocked: reviewedToday >= 10,
        progress: Math.min(reviewedToday, 10),
        maxProgress: 10,
        rarity: 'common',
        points: 10,
      },
      {
        id: 'daily_practice_20',
        name: 'Power Learner',
        description: 'Review 20 words in a single day',
        icon: <Rocket className="w-5 h-5" />,
        unlocked: reviewedToday >= 20,
        progress: Math.min(reviewedToday, 20),
        maxProgress: 20,
        rarity: 'rare',
        points: 25,
      },
      {
        id: 'daily_practice_50',
        name: 'Marathon Runner',
        description: 'Review 50 words in a single day',
        icon: <Star className="w-5 h-5" />,
        unlocked: reviewedToday >= 50,
        progress: Math.min(reviewedToday, 50),
        maxProgress: 50,
        rarity: 'epic',
        points: 50,
      },
    ];

    setAchievements(newAchievements);

    // Calculate total points and level
    const points = newAchievements.reduce((sum, achievement) => {
      return sum + (achievement.unlocked ? achievement.points : 0);
    }, 0);
    setTotalPoints(points);

    // Calculate level (每 100 點升一級)
    const level = Math.floor(points / 100) + 1;
    setUserLevel(level);
  }, [totalWords, learnedWords, reviewedToday, totalReviewCount, consecutiveDays]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const rarityColors = {
    common: 'text-gray-600 dark:text-gray-400',
    rare: 'text-blue-600 dark:text-blue-400',
    epic: 'text-purple-600 dark:text-purple-400',
    legendary: 'text-yellow-600 dark:text-yellow-400',
  };
  const rarityBgColors = {
    common: 'bg-gray-100 dark:bg-gray-800',
    rare: 'bg-blue-100 dark:bg-blue-900',
    epic: 'bg-purple-100 dark:bg-purple-900',
    legendary: 'bg-yellow-100 dark:bg-yellow-900',
  };

  return (
    <div className="space-y-6">
      {/* User Level and Points Summary */}
      <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Your Level</p>
              <p className="text-4xl font-bold text-accent">{userLevel}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {totalPoints} / {userLevel * 100} points to next level
              </p>
              <Progress
                value={(totalPoints % 100) / 100 * 100}
                className="mt-2"
              />
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="text-3xl font-bold text-accent">{totalPoints}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {unlockedCount} of {achievements.length} achievements
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(achievement => (
            <Card
              key={achievement.id}
              className={`transition-all duration-300 ${
                achievement.unlocked
                  ? `bg-gradient-to-br ${rarityBgColors[achievement.rarity]} border-2 border-current`
                  : 'opacity-50 bg-muted/30'
              }`}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      achievement.unlocked
                        ? `${rarityColors[achievement.rarity]}`
                        : 'text-muted-foreground'
                    }`}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{achievement.name}</h4>
                      {achievement.unlocked && (
                        <Badge
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          {achievement.rarity}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {achievement.description}
                    </p>
                    {achievement.maxProgress && achievement.maxProgress > 1 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                        <Progress
                          value={
                            ((achievement.progress || 0) / (achievement.maxProgress || 1)) *
                            100
                          }
                        />
                      </div>
                    )}
                    {achievement.unlocked && (
                      <p className="text-xs text-accent font-semibold mt-2">
                        +{achievement.points} points
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
