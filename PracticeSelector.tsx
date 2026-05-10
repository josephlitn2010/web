import { Card, CardContent } from '@/components/ui/card';
import { Zap, Headphones, PenTool, Brain } from 'lucide-react';

interface PracticeSelectorProps {
  onSelectPractice: (mode: 'flashcard' | 'listening' | 'dictation' | 'quiz') => void;
}

const practiceOptions = [
  {
    id: 'flashcard',
    name: 'Flashcard',
    description: 'Flip cards to learn and review',
    icon: Zap,
    color: 'from-blue-500/20 to-blue-500/5',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'listening',
    name: 'Listening',
    description: 'Listen and recognize words',
    icon: Headphones,
    color: 'from-purple-500/20 to-purple-500/5',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'dictation',
    name: 'Dictation',
    description: 'Type what you hear',
    icon: PenTool,
    color: 'from-orange-500/20 to-orange-500/5',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: 'quiz',
    name: 'Quiz',
    description: 'Test your knowledge',
    icon: Brain,
    color: 'from-green-500/20 to-green-500/5',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-600 dark:text-green-400',
  },
];

export default function PracticeSelector({ onSelectPractice }: PracticeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Practice Mode</h2>
        <p className="text-sm text-muted-foreground">
          Select a practice method to improve your vocabulary
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {practiceOptions.map(option => {
          const Icon = option.icon;
          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-br ${option.color} border-2 ${option.borderColor}`}
              onClick={() => onSelectPractice(option.id as any)}
            >
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className={`flex justify-center ${option.textColor}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{option.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
