import { useState } from 'react';
import { Category } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, RotateCw } from 'lucide-react';

interface StudyModeConfigProps {
  categories: Category[];
  onStart: (config: StudyConfig) => void;
  onCancel: () => void;
  mode: 'listening' | 'dictation';
}

export interface StudyConfig {
  category: string;
  numberOfQuestions: number;
}

export default function StudyModeConfig({
  categories,
  onStart,
  onCancel,
  mode,
}: StudyModeConfigProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(10);

  const handleStart = () => {
    onStart({
      category: selectedCategory,
      numberOfQuestions,
    });
  };

  const modeTitle = mode === 'listening' ? 'Listening Practice' : 'Dictation Practice';
  const modeDescription = mode === 'listening' 
    ? 'Listen to words and reveal their meanings' 
    : 'Listen to words and type what you hear';

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/30">
        <CardHeader>
          <CardTitle className="text-2xl">{modeTitle}</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">{modeDescription}</p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configure Your Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Choose a specific category or practice all words
            </p>
          </div>

          {/* Number of Questions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Number of Questions</label>
              <span className="text-lg font-bold text-accent">{numberOfQuestions}</span>
            </div>
            <Slider
              value={[numberOfQuestions]}
              onValueChange={(value) => setNumberOfQuestions(value[0])}
              min={3}
              max={50}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Choose between 3 and 50 questions per session
            </p>
          </div>

          {/* Session Summary */}
          <Card className="bg-secondary/50">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Session Summary</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Category:</p>
                  <p className="text-sm font-semibold text-foreground">
                    {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Questions:</p>
                  <p className="text-sm font-semibold text-foreground">{numberOfQuestions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 gap-2"
            >
              <RotateCw className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              onClick={handleStart}
              className="flex-1 gap-2"
            >
              <Play className="w-4 h-4" />
              Start Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-secondary/50">
        <CardHeader>
          <CardTitle className="text-sm">💡 Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Start with fewer questions (5-10) to build confidence</p>
          <p>• Use specific categories to focus on weak areas</p>
          <p>• Increase difficulty as you improve</p>
          <p>• Regular practice improves retention</p>
        </CardContent>
      </Card>
    </div>
  );
}
