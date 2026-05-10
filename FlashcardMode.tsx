import { useState, useEffect } from 'react';
import { VocabularyEntry, Category, updateVocabulary, updateMastery, addStudySession } from '@/lib/db';
import { Button } from './button.tsx';
import { Card, CardContent } from './card.tsx';
import { Volume2, RotateCw, ChevronLeft, ChevronRight, Settings, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { speak, isSpeechSynthesisAvailable } from './speech.ts';
import { getSpacedRepetitionWords, shuffleArray } from './utils.ts';
import { addWrongWord } from './wrongWords.tsx';
import StudyModeConfig, { StudyConfig } from './StudyModeConfig';

interface FlashcardModeProps {
  vocabulary: VocabularyEntry[];
  categories: Category[];
  onDataUpdated: () => void;
}

interface FlashcardResult {
  id: string;
  english: string;
  chinese: string;
  correct: boolean;
}

export default function FlashcardMode({ vocabulary, categories, onDataUpdated }: FlashcardModeProps) {
  const [cards, setCards] = useState<VocabularyEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [sessionResults, setSessionResults] = useState<FlashcardResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const [currentConfig, setCurrentConfig] = useState<StudyConfig | null>(null);
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
    setIsFlipped(false);
    setSessionStats({ correct: 0, total: 0 });
    setSessionResults([]);
    setShowResults(false);
    setCurrentConfig(config);
    setShowConfig(false);
    setSessionStartTime(Date.now());
  };

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

  const currentCard = cards[currentIndex];

  const handleNext = async (correct: boolean) => {
    if (!currentCard) return;

    try {
      const newMastery = correct
        ? Math.min(100, currentCard.mastery + 10)
        : Math.max(0, currentCard.mastery - 5);

      await updateVocabulary(currentCard.id, {
        mastery: newMastery,
        lastReviewedAt: Date.now(),
        reviewCount: currentCard.reviewCount + 1,
      });

      // Track wrong answers
      if (!correct) {
        addWrongWord(
          currentCard.english,
          currentCard.chinese,
          currentCard.chinese,
          'flashcard',
          currentCard.ipa
        );
      }

      const newResults = [...sessionResults, {
        id: currentCard.id,
        english: currentCard.english,
        chinese: currentCard.chinese,
        correct: correct,
      }];
      setSessionResults(newResults);

      setSessionStats(prev => ({
        correct: prev.correct + (correct ? 1 : 0),
        total: prev.total + 1,
      }));

      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
      } else {
        setShowResults(true);
      }

      onDataUpdated();
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const handleSpeak = async (text: string) => {
    if (!isSpeechSynthesisAvailable()) {
      toast.error('Speech synthesis not available');
      return;
    }
    try {
      const practiceVoiceSpeed = parseFloat(localStorage.getItem('practiceVoiceSpeed') || '1');
      await speak(text, { language: 'en-US', rate: practiceVoiceSpeed });
    } catch (error) {
      toast.error('Failed to play audio');
    }
  };

  if (vocabulary.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Add some vocabulary first to start flashcard study!</p>
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

  if (cards.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No words available for this configuration. Try adjusting your settings.</p>
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
            <h2 className="text-3xl font-bold text-foreground mb-2">Flashcard Study Complete!</h2>
            <p className="text-muted-foreground mb-6">Great effort on your flashcard practice</p>
            
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
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-6">
                <p className="text-accent font-semibold">Perfect score! 🎉</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Details */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Session Details</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {sessionResults.map((result, idx) => (
                <div key={result.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      backgroundColor: result.correct ? '#10b981' : '#ef4444',
                      color: 'white'
                    }}>
                    {result.correct ? '✓' : '✗'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{result.english}</p>
                    <p className="text-sm text-muted-foreground">{result.chinese}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowConfig(true)}
            className="flex-1 gap-2"
          >
            <RotateCw className="w-4 h-4" />
            New Session
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

  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar with Gradient */}
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <span className="text-sm font-semibold text-accent">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-secondary/50">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Correct</p>
            <p className="text-lg font-bold text-accent">{sessionStats.correct}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/50">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="text-lg font-bold text-foreground">{cards.length - currentIndex - 1}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/50">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Accuracy</p>
            <p className="text-lg font-bold text-accent">
              {cards.length > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) || 0 : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Flashcard */}
      {currentCard && (
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative h-64 cursor-pointer"
          style={{
            perspective: '1000px',
          }}
        >
          <div
            className="relative w-full h-full transform-gpu"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transformOrigin: 'center',
              transition: 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            }}
          >
            {/* Front - English */}
            <Card
              className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20"
              style={{
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
              }}
            >
              <CardContent className="text-center p-6 flex flex-col items-center justify-center h-full">
                <p className="text-sm text-muted-foreground mb-4">English</p>
                <h2 className="text-4xl font-bold text-foreground">{currentCard.english}</h2>
                {isSpeechSynthesisAvailable() && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(currentCard.english);
                    }}
                    className="p-2 hover:bg-accent/20 rounded-full transition-colors mt-4"
                  >
                    <Volume2 className="w-6 h-6 text-accent" />
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Back - Chinese */}
            <Card
              className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20"
              style={{
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <CardContent className="text-center p-6 flex flex-col items-center justify-center h-full">
                <p className="text-sm text-muted-foreground mb-4">Chinese</p>
                <h2 className="text-4xl font-bold text-foreground">{currentCard.chinese}</h2>
                {currentCard.exampleSentence && (
                  <p className="text-sm text-muted-foreground italic mt-4">"{currentCard.exampleSentence}"</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Flip Hint */}
      <div className="text-center text-sm text-muted-foreground">
        {isFlipped ? 'Click to see English' : 'Click to reveal Chinese'}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => handleNext(false)}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Difficult
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <RotateCw className="w-4 h-4 mr-2" />
          Flip
        </Button>
        <Button
          className="flex-1"
          onClick={() => handleNext(true)}
        >
          Easy
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Change Settings Button */}
      <Button
        variant="ghost"
        className="w-full gap-2"
        onClick={() => setShowConfig(true)}
      >
        <Settings className="w-4 h-4" />
        Change Settings
      </Button>
    </div>
  );
}
