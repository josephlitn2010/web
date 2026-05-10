'use client';

import { VocabularyEntry } from '@/lib/db';
import { generateTodayReviewPlan, getReviewStats, ReviewItem } from '@/lib/reviewPlan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, TrendingUp, BookOpen, CheckCircle2, Play } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';

interface TodayReviewPlanProps {
  vocabulary: VocabularyEntry[];
  onStartPractice?: (wordIds: string[]) => void;
}

export default function TodayReviewPlan({ vocabulary, onStartPractice }: TodayReviewPlanProps) {
  const reviewPlan = useMemo(() => generateTodayReviewPlan(vocabulary, 20), [vocabulary]);
  const stats = useMemo(() => getReviewStats(vocabulary), [vocabulary]);

  if (vocabulary.length === 0) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No words yet. Start adding vocabulary to get review recommendations!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 複習統計卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.reviewedToday}</div>
              <div className="text-xs text-muted-foreground">Reviewed Today</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.neverReviewed}</div>
              <div className="text-xs text-muted-foreground">Never Reviewed</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{stats.masteredWords}</div>
              <div className="text-xs text-muted-foreground">Mastered</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-500">{stats.averageMastery}%</div>
              <div className="text-xs text-muted-foreground">Avg Mastery</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 今日複習計劃 */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Today's Review Plan
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {reviewPlan.length} words recommended for review based on mastery level and review history
          </p>
        </CardHeader>
        <CardContent>
          {reviewPlan.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Great job! No words need review today.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {reviewPlan.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-border/80 transition-colors"
                >
                  {/* 排名 */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                    {index + 1}
                  </div>

                  {/* 詞彙信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground truncate">
                        {item.english}
                      </span>
                      <span className="text-sm text-muted-foreground truncate">
                        {item.chinese}
                      </span>
                    </div>

                    {/* 複習原因和掌握度 */}
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className="text-xs bg-background/50"
                      >
                        {item.reason}
                      </Badge>
                      {item.daysAgo >= 0 && (
                        <span className="text-xs text-muted-foreground">
                          {item.daysAgo === 0
                            ? 'Today'
                            : item.daysAgo === 1
                            ? '1 day ago'
                            : `${item.daysAgo} days ago`}
                        </span>
                      )}
                    </div>

                    {/* 掌握度進度條 */}
                    <div className="flex items-center gap-2">
                      <Progress
                        value={item.mastery}
                        className="flex-1 h-2"
                      />
                      <span className="text-xs font-semibold text-muted-foreground w-10 text-right">
                        {item.mastery}%
                      </span>
                    </div>
                  </div>

                  {/* 優先級指示器 */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs font-semibold text-muted-foreground">
                      Priority
                    </div>
                    <div className="text-lg font-bold">
                      {item.priority >= 75 ? (
                        <span className="text-red-500">🔴</span>
                      ) : item.priority >= 50 ? (
                        <span className="text-amber-500">🟡</span>
                      ) : (
                        <span className="text-green-500">🟢</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {reviewPlan.length > 0 && (
          <div className="px-6 py-4 border-t border-border/50 flex gap-2">
            <Button
              onClick={() => onStartPractice?.(reviewPlan.map(item => item.id))}
              className="flex-1 gap-2"
            >
              <Play className="w-4 h-4" />
              Start Practice ({reviewPlan.length} words)
            </Button>
          </div>
        )}
      </Card>

      {/* 複習建議 */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4" />
            Review Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>
            • 🔴 <strong>High Priority:</strong> Review these words first - they need the most attention
          </p>
          <p>
            • 🟡 <strong>Medium Priority:</strong> Review after high priority words
          </p>
          <p>
            • 🟢 <strong>Low Priority:</strong> These words are well-mastered, light review is enough
          </p>
          <p className="pt-2 border-t border-border/50">
            💡 Tip: Regular review helps fight the forgetting curve. Try to review at least 5-10 words daily!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
