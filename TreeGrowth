import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';
import { updateTreeProgress, getTreeLevel, getNextTreeLevel, getWordsUntilNextLevel, TREE_LEVELS } from '@/lib/treeSystem';
import type { VocabularyEntry } from '@/lib/db';

interface TreeGrowthProps {
  vocabulary: VocabularyEntry[];
}

export default function TreeGrowth({ vocabulary }: TreeGrowthProps) {
  const [masteredWords, setMasteredWords] = useState(0);
  const [treeState, setTreeState] = useState(updateTreeProgress(0));
  const [currentLevel, setCurrentLevel] = useState(TREE_LEVELS[0]);
  const [nextLevel, setNextLevel] = useState(TREE_LEVELS[1]);
  const [wordsUntilNext, setWordsUntilNext] = useState(0);

  useEffect(() => {
    const mastered = vocabulary.filter(v => v.mastery >= 100).length;
    setMasteredWords(mastered);

    const state = updateTreeProgress(mastered);
    setTreeState(state);

    const current = getTreeLevel(mastered);
    setCurrentLevel(current);

    const next = getNextTreeLevel(mastered);
    if (next) {
      setNextLevel(next);
    }

    const wordsUntil = getWordsUntilNextLevel(mastered);
    setWordsUntilNext(wordsUntil);
  }, [vocabulary]);

  return (
    <div className="space-y-6">
      {/* Tree Visualization */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-600" />
            Your Learning Tree
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tree Display */}
          <div className="text-center space-y-4">
            <div className="text-6xl animate-pulse">{currentLevel.icon}</div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{currentLevel.name}</h3>
              <p className="text-sm text-muted-foreground">{currentLevel.description}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              Level {treeState.level} of {TREE_LEVELS.length}
            </div>
          </div>

          {/* Progress to Next Level */}
          {treeState.level < TREE_LEVELS.length && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold">Progress to {nextLevel.name}</span>
                <span className="text-muted-foreground">{treeState.growth.toFixed(0)}%</span>
              </div>
              <Progress value={treeState.growth} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">
                {wordsUntilNext} more words to reach the next level
              </p>
            </div>
          )}

          {treeState.level === TREE_LEVELS.length && (
            <div className="text-center py-4">
              <p className="text-lg font-semibold text-green-600">🎉 Maximum Level Reached!</p>
              <p className="text-sm text-muted-foreground">You've mastered the World Tree!</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-green-200 dark:border-green-800">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{masteredWords}</p>
              <p className="text-xs text-muted-foreground">Words Mastered</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{treeState.level}</p>
              <p className="text-xs text-muted-foreground">Current Level</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tree Levels Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tree Growth Path</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {TREE_LEVELS.map((level, idx) => (
              <div
                key={level.level}
                className={`p-3 rounded-lg border transition-all ${
                  idx < treeState.level
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                    : idx === treeState.level
                      ? 'bg-accent/10 border-accent'
                      : 'bg-secondary/50 border-border opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{level.icon}</span>
                    <div>
                      <p className="font-semibold">{level.name}</p>
                      <p className="text-xs text-muted-foreground">{level.wordsNeeded} words needed</p>
                    </div>
                  </div>
                  {idx < treeState.level && <span className="text-green-600 font-semibold">✓</span>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-sm">💡 Growing Your Tree</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Master vocabulary words to grow your tree</p>
          <p>• Each level requires more mastered words</p>
          <p>• Keep practicing to reach the World Tree!</p>
          <p>• Your tree represents your learning journey</p>
        </CardContent>
      </Card>
    </div>
  );
}
