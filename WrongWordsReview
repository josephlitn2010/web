import { useState, useEffect } from 'react';
import { VocabularyEntry, Category, updateVocabulary } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, RotateCw, ChevronLeft, ChevronRight, Trash2, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { speak, isSpeechSynthesisAvailable } from '@/lib/speech';
import { getWrongWords, markWrongWordAsMastered, deleteWrongWord } from '@/lib/wrongWords';
import type { WrongWordEntry } from '@/lib/wrongWords';

interface WrongWordsReviewProps {
  vocabulary: VocabularyEntry[];
  categories: Category[];
  onDataUpdated: () => void;
}

export default function WrongWordsReview({ vocabulary, categories, onDataUpdated }: WrongWordsReviewProps) {
  const [wrongWords, setWrongWords] = useState<WrongWordEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [showResults, setShowResults] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const words = getWrongWords();
    setWrongWords(words);
    if (words.length === 0) {
      toast.info('No wrong words to review! Keep practicing.');
    }
  }, []);

  const currentCard = wrongWords[currentIndex];

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

  const handleNext = async (mastered: boolean) => {
    if (!currentCard) return;

    try {
      if (mastered) {
        markWrongWordAsMastered(currentCard.id);
        setSessionStats(prev => ({
          correct: prev.correct + 1,
          total: prev.total + 1,
        }));
      } else {
        setSessionStats(prev => ({
          correct: prev.correct,
          total: prev.total + 1,
        }));
      }

      if (currentIndex < wrongWords.length - 1) {
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

  const handleDeleteWord = async () => {
    if (!currentCard) return;

    try {
      deleteWrongWord(currentCard.id);
      const updatedWords = wrongWords.filter((_, idx) => idx !== currentIndex);
      setWrongWords(updatedWords);

      if (updatedWords.length === 0) {
        setShowResults(true);
      } else if (currentIndex >= updatedWords.length) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }

      toast.success('Word removed from wrong words list');
      onDataUpdated();
    } catch (error) {
      toast.error('Failed to delete word');
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionStats({ correct: 0, total: 0 });
    setShowResults(false);
    const words = getWrongWords();
    setWrongWords(words);
  };

  if (wrongWords.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Trophy className="w-12 h-12 mx-auto mb-4 text-accent" />
          <h3 className="text-lg font-semibold mb-2">No Wrong Words!</h3>
          <p className="text-muted-foreground mb-4">
            Great job! You don't have any words to review. Keep practicing to maintain your progress.
          </p>
          <Button onClick={onDataUpdated} variant="default">
            Back to Study
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    return (
      <Card className="text-center py-12">
        <CardContent className="space-y-4">
          <Trophy className="w-12 h-12 mx-auto text-accent" />
          <h3 className="text-2xl font-bold">Review Complete!</h3>
          <div className="space-y-2">
            <p className="text-lg">
              <span className="font-semibold text-accent">{sessionStats.correct}</span>
              <span className="text-muted-foreground"> / {sessionStats.total} mastered</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Accuracy: {sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0}%
            </p>
          </div>
          <Button onClick={handleRestart} variant="default" className="w-full">
            Review Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {wrongWords.length}
        </span>
        <div className="flex-1 mx-4 h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / wrongWords.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-semibold">{Math.round(((currentIndex + 1) / wrongWords.length) * 100)}%</span>
      </div>

      {/* Card */}
      <Card className="min-h-64 flex items-center justify-center cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <CardContent className="text-center space-y-4 py-12">
          {!isFlipped ? (
            <div className="space-y-4">
              <div className="text-4xl font-bold text-accent">{currentCard.english}</div>
              <div className="text-sm text-muted-foreground">
                {currentCard.ipa && <p className="font-mono">{currentCard.ipa}</p>}
              </div>
              <p className="text-sm text-muted-foreground">Click to reveal</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-2xl font-semibold text-foreground">{currentCard.chinese}</div>
              {currentCard.userAnswer && (
                <div className="text-sm text-red-500">
                  <p className="font-semibold">Your answer:</p>
                  <p>{currentCard.userAnswer}</p>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                <p>Wrong in: <span className="capitalize font-semibold">{currentCard.mode}</span> mode</p>
                <p>Reviewed: {currentCard.reviewCount} times</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex gap-2">
        <Button
          onClick={handlePlayAudio}
          disabled={isPlaying}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <Volume2 className="w-4 h-4 mr-2" />
          {isPlaying ? 'Playing...' : 'Play'}
        </Button>
        <Button
          onClick={handleDeleteWord}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        <Button
          onClick={() => {
            if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
            setIsFlipped(false);
          }}
          disabled={currentIndex === 0}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={() => handleNext(false)}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <RotateCw className="w-4 h-4 mr-2" />
          Review Again
        </Button>
        <Button
          onClick={() => handleNext(true)}
          variant="default"
          size="sm"
          className="flex-1"
        >
          <ChevronRight className="w-4 h-4 mr-2" />
          Mastered
        </Button>
      </div>

      {/* Stats */}
      <Card className="bg-secondary/50">
        <CardContent className="pt-4 text-center text-sm">
          <p className="text-muted-foreground">
            Mastered so far: <span className="font-semibold text-accent">{sessionStats.correct}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
