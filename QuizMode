import { useState, useEffect } from 'react';
import { VocabularyEntry, Category, updateVocabulary, updateMastery, addStudySession } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, RotateCw, Loader2, ChevronRight, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { speak, isSpeechSynthesisAvailable } from '@/lib/speech';
import { getSpacedRepetitionWords, shuffleArray } from '@/lib/utils';
import { addWrongWord } from '@/lib/wrongWords';
import StudyModeConfig, { StudyConfig } from './StudyModeConfig';

interface QuizModeProps {
  vocabulary: VocabularyEntry[];
  categories: Category[];
  onDataUpdated: () => void;
}

interface QuizResult {
  id: string;
  english: string;
  chinese: string;
  userAnswer: string;
  correct: boolean;
}

export default function QuizMode({ vocabulary, categories, onDataUpdated }: QuizModeProps) {
  const [cards, setCards] = useState<VocabularyEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [sessionResults, setSessionResults] = useState<QuizResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);

  const initializeCardsWithConfig = (config: StudyConfig) => {
    let filtered = vocabulary;

    // Filter by category
    if (config.category !== 'all') {
      filtered = filtered.filter(v => v.category === config.category);
    }

    // Select spaced repetition words
    const selectedCards = getSpacedRepetitionWords(filtered, config.numberOfQuestions);
    setCards(selectedCards);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setSessionStats({ correct: 0, total: 0 });
    setSessionResults([]);
    setShowResults(false);
    setShowConfig(false);
    setSessionStartTime(Date.now());
  };

  useEffect(() => {
    if (cards.length > 0 && currentIndex < cards.length) {
      generateOptions();
    }
  }, [currentIndex, cards]);

  // Save study session when results are shown
  useEffect(() => {
    if (!showResults || sessionStartTime === 0) return;
    
    const saveSession = async () => {
      try {
        const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000);
        const wordsLearned = sessionStats.correct;
        await addStudySession({
          date: Date.now(),
          wordsStudied: sessionStats.total,
          wordsLearned: wordsLearned,
          duration: sessionDuration,
        });
      } catch (error) {
        console.error('Failed to save study session:', error);
      }
    };
    
    saveSession();
  }, [showResults, sessionStartTime, sessionStats]);

  const generateOptions = () => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    // Get 3 random wrong answers from other cards
    const otherCards = cards.filter((_, idx) => idx !== currentIndex);
    const wrongAnswers = shuffleArray(otherCards)
      .slice(0, 3)
      .map(card => card.chinese);

    // Combine with correct answer and shuffle
    const allOptions = shuffleArray([currentCard.chinese, ...wrongAnswers]);
    setOptions(allOptions);
    setSelectedAnswer(null);
    setShowAnswer(false);
  };

  const currentCard = cards[currentIndex];

  const handlePlayAudio = async () => {
    if (!currentCard || !isSpeechSynthesisAvailable()) {
      toast.error('Speech synthesis not available');
      return;
    }

    setIsPlaying(true);
    try {
      const practiceVoiceSpeed = parseFloat(localStorage.getItem('practiceVoiceSpeed') || '1');
      await speak(currentCard.english, { language: 'en-US', rate: practiceVoiceSpeed });
    } catch (error) {
      toast.error('Failed to play audio');
    } finally {
      setIsPlaying(false);
    }
  };

  const handleSelectAnswer = async (answer: string) => {
    setSelectedAnswer(answer);
    setShowAnswer(true);

    const isCorrect = answer === currentCard.chinese;

    if (!isCorrect) {
      addWrongWord(
        currentCard.english,
        currentCard.chinese,
        currentCard.chinese,
        'quiz',
        currentCard.ipa,
        answer
      );
    }

    try {
      const newMastery = isCorrect
        ? Math.min(100, currentCard.mastery + 10)
        : Math.max(0, currentCard.mastery - 5);

      await updateVocabulary(currentCard.id, {
        mastery: newMastery,
        lastReviewedAt: Date.now(),
        reviewCount: currentCard.reviewCount + 1,
      });

      const newResults = [...sessionResults, {
        id: currentCard.id,
        english: currentCard.english,
        chinese: currentCard.chinese,
        userAnswer: answer,
        correct: isCorrect,
      }];
      setSessionResults(newResults);

      setSessionStats(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));

      onDataUpdated();
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  if (vocabulary.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Add some vocabulary first to start quiz practice!</p>
        </CardContent>
      </Card>
    );
  }

  if (showConfig) {
    return (
      <StudyModeConfig
        categories={categories}
        onStart={initializeCardsWithConfig}
        onCancel={() => {}}
        mode="listening"
      />
    );
  }

  if (cards.length === 0 && !showConfig) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No cards available for the selected category.</p>
          <Button
            variant="outline"
            onClick={() => setShowConfig(true)}
            className="mt-4 gap-2"
          >
            <RotateCw className="w-4 h-4" />
            Change Settings
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Results Page
  if (showResults) {
    const accuracy = Math.round((sessionStats.correct / sessionStats.total) * 100);
    const isPerfect = accuracy === 100;
    return (
      <div className="space-y-6">
        {/* Results Header */}
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/30">
          <CardContent className="py-12 text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16 text-accent" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Quiz Complete!</h2>
            <p className="text-muted-foreground mb-6">Great effort on your quiz practice</p>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-card rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Correct</p>
                <p className="text-2xl font-bold text-accent">{sessionStats.correct}</p>
              </div>
              <div className="bg-card rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Total</p>
                <p className="text-2xl font-bold text-foreground">{sessionStats.total}</p>
              </div>
              <div className="bg-card rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Accuracy</p>
                <p className={`text-2xl font-bold ${isPerfect ? 'text-accent' : 'text-foreground'}`}>
                  {accuracy}%
                </p>
              </div>
            </div>

            {isPerfect && (
              <p className="text-lg font-semibold text-accent mb-6">🎉 Perfect score! Excellent work!</p>
            )}
          </CardContent>
        </Card>

        {/* Results List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Review Your Answers</h3>
          {sessionResults.map((result, index) => (
            <Card key={result.id} className={result.correct ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Question {index + 1}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${result.correct ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {result.correct ? '✓ Correct' : '✗ Wrong'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card rounded p-3">
                    <p className="text-xs text-muted-foreground mb-1">English</p>
                    <p className="text-sm font-semibold text-foreground">{result.english}</p>
                  </div>
                  <div className="bg-card rounded p-3">
                    <p className="text-xs text-muted-foreground mb-1">Your Answer</p>
                    <p className={`text-sm font-semibold ${result.correct ? 'text-green-700' : 'text-red-700'}`}>
                      {result.userAnswer}
                    </p>
                  </div>
                  {!result.correct && (
                    <div className="bg-card rounded p-3 col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">Correct Answer</p>
                      <p className="text-sm font-semibold text-accent">{result.chinese}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowConfig(true)}
            className="flex-1 gap-2"
          >
            <RotateCw className="w-4 h-4" />
            New Quiz
          </Button>
          <Button
            onClick={() => setShowConfig(true)}
            className="flex-1 gap-2"
          >
            <ChevronRight className="w-4 h-4" />
            Continue
          </Button>
        </div>
      </div>
    );
  }

  // Quiz Page
  return (
    <div className="space-y-6">
      {/* Progress Bar with Gradient */}
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">
            Question {currentIndex + 1} of {cards.length}
          </span>
          <span className="text-sm font-semibold text-accent">{Math.round(((currentIndex + 1) / cards.length) * 100)}%</span>
        </div>
        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / cards.length) * 100}%`,
              background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
            }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/30">
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground mb-6">Listen to the word and select the correct Chinese meaning</p>
          <Button
            size="lg"
            onClick={handlePlayAudio}
            disabled={isPlaying}
            className="gap-2 mb-6"
          >
            {isPlaying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Playing...
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5" />
                Play Audio
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">Click the button to hear the word</p>
        </CardContent>
      </Card>

      {/* Options */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Select the correct Chinese meaning:</p>
        {options.map((option, idx) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === currentCard.chinese;
          let buttonClass = 'w-full justify-start text-left h-auto py-3 px-4 border-2 transition-all';

          if (!showAnswer) {
            buttonClass += ' border-border hover:border-accent hover:bg-secondary/50';
          } else if (isSelected) {
            if (isCorrect) {
              buttonClass += ' border-green-400 bg-green-50/50 text-green-700';
            } else {
              buttonClass += ' border-red-400 bg-red-50/50 text-red-700';
            }
          } else if (isCorrect) {
            buttonClass += ' border-green-400 bg-green-50/50 text-green-700';
          } else {
            buttonClass += ' border-border opacity-50';
          }

          return (
            <Button
              key={idx}
              onClick={() => !showAnswer && handleSelectAnswer(option)}
              variant="outline"
              className={buttonClass}
              disabled={showAnswer}
            >
              <span className="text-base">{option}</span>
              {showAnswer && isCorrect && <span className="ml-auto">✓</span>}
              {showAnswer && isSelected && !isCorrect && <span className="ml-auto">✗</span>}
            </Button>
          );
        })}
      </div>

      {/* Session Stats */}
      {sessionStats.total > 0 && (
        <Card className="bg-secondary/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Session Progress</p>
                <p className="text-lg font-semibold text-foreground">
                  {sessionStats.correct}/{sessionStats.total} correct
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-accent">
                  {Math.round((sessionStats.correct / sessionStats.total) * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Button */}
      {showAnswer && (
        <Button onClick={handleNext} size="lg" className="w-full gap-2">
          <ChevronRight className="w-4 h-4" />
          {currentIndex < cards.length - 1 ? 'Next Question' : 'See Results'}
        </Button>
      )}

      {/* Change Settings Button */}
      <Button
        variant="outline"
        onClick={() => setShowConfig(true)}
        className="w-full gap-2"
      >
        <RotateCw className="w-4 h-4" />
        Change Settings
      </Button>
    </div>
  );
}
