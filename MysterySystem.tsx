import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Trophy, Zap, Lock, Leaf, AlertTriangle } from 'lucide-react';
import { getAllAchievements, getAchievementProgress, checkAchievements, initializeMysteryState } from '@/lib/mystery';
import TreeGrowth from './TreeGrowth';
import WrongWordsManager from './WrongWordsManager';
import WrongWordsReview from './WrongWordsReview';
import type { VocabularyEntry, Category } from '@/lib/db';
import { getAllCategories } from '@/lib/db';

interface MysterySystemProps {
  vocabulary: VocabularyEntry[];
}

export default function MysterySystem({ vocabulary }: MysterySystemProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isReviewingWrongWords, setIsReviewingWrongWords] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      const cats = await getAllCategories();
      setCategories(cats);
    };
    loadCategories();
  }, []);
  const [masteredWords, setMasteredWords] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [progress, setProgress] = useState({ current: 0, nextMilestone: 10, percentage: 0 });

  useEffect(() => {
    // Calculate mastered words
    const mastered = vocabulary.filter(v => v.mastery >= 100).length;
    setMasteredWords(mastered);

    // Check for new achievements
    const state = initializeMysteryState();
    const newAchievements = checkAchievements(mastered, 0, vocabulary);
    setUnlockedAchievements(state.achievements.map(a => a.id));

    // Update progress
    const progressData = getAchievementProgress(mastered);
    setProgress(progressData);
  }, [vocabulary]);

  const allAchievements = getAllAchievements();
  const isUnlocked = (id: string) => unlockedAchievements.includes(id);

  const handleDataUpdated = () => {
    // Trigger refresh
  };

  return (
    <Tabs defaultValue="tree" className="w-full space-y-4">
      <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
        <TabsTrigger value="tree" className="text-xs sm:text-sm">
          <Leaf className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Tree</span>
        </TabsTrigger>
        <TabsTrigger value="achievements" className="text-xs sm:text-sm">
          <Trophy className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Achievements</span>
        </TabsTrigger>
        <TabsTrigger value="wrong-words" className="text-xs sm:text-sm">
          <AlertTriangle className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Wrong Words</span>
        </TabsTrigger>
      </TabsList>

      {/* Tree Tab */}
      <TabsContent value="tree" className="space-y-4">
        <TreeGrowth vocabulary={vocabulary} />
      </TabsContent>

      {/* Achievements Tab */}
      <TabsContent value="achievements" className="space-y-4">
        {/* Mystery Progress */}
        <Card className="bg-gradient-to-br from-accent/10 to-secondary/10 border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Mystery Mastery Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Words Mastered: {progress.current}</span>
                <span className="text-sm text-muted-foreground">Next: {progress.nextMilestone}</span>
              </div>
              <Progress value={progress.percentage} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                {progress.percentage.toFixed(0)}% to next milestone
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Unlocked Achievements ({unlockedAchievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {allAchievements
                  .filter(a => isUnlocked(a.id))
                  .map(achievement => (
                    <div
                      key={achievement.id}
                      className="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800"
                    >
                      <div className="text-2xl mb-1">{achievement.icon}</div>
                      <h4 className="font-semibold text-sm">{achievement.name}</h4>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {achievement.reward}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Locked Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-muted-foreground" />
              Upcoming Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allAchievements
                .filter(a => !isUnlocked(a.id))
                .slice(0, 6)
                .map(achievement => (
                  <div
                    key={achievement.id}
                    className="p-3 bg-secondary/50 rounded-lg border border-border opacity-60"
                  >
                    <div className="text-2xl mb-1 opacity-50">{achievement.icon}</div>
                    <h4 className="font-semibold text-sm text-muted-foreground">{achievement.name}</h4>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Locked</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Mystery Surprises */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              🎁 Mystery Surprises
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Unlock special rewards as you master more words! Here's what awaits:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-lg">🏗️</span>
                <span>
                  <strong>10 Mastered Words:</strong> Unlock category color customization to personalize your learning experience
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">💯</span>
                <span>
                  <strong>100 Mastered Words:</strong> Unlock dark mode theme for comfortable learning anytime
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">👑</span>
                <span>
                  <strong>1000 Mastered Words:</strong> Unlock premium animations for a more polished experience
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">🔥</span>
                <span>
                  <strong>7-Day Streak:</strong> Unlock streak multiplier (1.5x points) to accelerate learning
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">🏆</span>
                <span>
                  <strong>30-Day Streak:</strong> Unlock streak multiplier (2x points) for ultimate learning power
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Wrong Words Tab */}
      <TabsContent value="wrong-words" className="space-y-4">
        {isReviewingWrongWords ? (
          <div className="space-y-4">
            <WrongWordsReview
              vocabulary={vocabulary}
              categories={categories}
              onDataUpdated={handleDataUpdated}
            />
          </div>
        ) : (
          <WrongWordsManager
            onStartReview={() => setIsReviewingWrongWords(true)}
            onDataUpdated={handleDataUpdated}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
