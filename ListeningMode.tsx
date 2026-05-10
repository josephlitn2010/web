// 1. 檢查這幾行，確保副檔名是 .ts (通常邏輯檔不帶 x)
import { addToWrongWords } from './wrongWords.ts'; // <--- 檢查這裡！
import { speak, isSpeechSynthesisAvailable } from './speech.ts';
import { getProgressStats } from './utils.ts';
import { type VocabularyEntry, updateVocabularyMastery } from './db.ts';

// 2. 檢查 UI 組件，確保副檔名是 .tsx (組件檔帶 x)
import { Button } from './button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from './VocabularyLibrary.tsx'; 
// (註：如果你的 Card 是定義在 VocabularyLibrary.tsx 裡的話)


interface ListeningModeProps {
  vocabulary: VocabularyEntry[];
  categories: Category[];
  onDataUpdated: () => void;
}

interface ListeningResult {
  id: string;
  english: string;
  chinese: string;
  correct: boolean;
}

export default function ListeningMode({ vocabulary, categories, onDataUpdated }: ListeningModeProps) {
  const [cards, setCards] = useState<VocabularyEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [sessionResults, setSessionResults] = useState<ListeningResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const [currentConfig, setCurrentConfig] = useState<StudyConfig | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);

  const initializeCards = (config: StudyConfig) => {
    let filtered = vocabulary;

    // Filter by category
    if (config.category !== 'all') {
      filtered = filtered.filter(v => v.category === config.category);
    }

    // Select spaced repetition words
    const selectedCards = getSpacedRepetitionWords(filtered, config.numberOfQuestions);
    setCards(selectedCards);
    setCurrentIndex(0);
    setShowAnswer(false);
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
          'listening',
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
        setShowAnswer(false);
      } else {
        setShowResults(true);
      }

      onDataUpdated();
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  if (vocabulary.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Add some vocabulary first to start listening practice!</p>
        </CardContent>
      </Card>
    );
  }

  if (showConfig) {
    return (
      <StudyModeConfig
        categories={categories}
        onStart={initializeCards}
        onCancel={() => {}}
        mode="listening"
      />
    );
  }

  if (cards.length === 0) {
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
            <h2 className="text-3xl font-bold text-foreground mb-2">Listening Complete!</h2>
            <p className="text-muted-foreground mb-6">Great effort on your listening practice</p>
            
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

  return (
    <div className="space-y-6">
      {/* Progress Bar with Gradient */}
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">
            Word {currentIndex + 1} of {cards.length}
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

      {/* Listening Card */}
      <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/30">
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground mb-6">Listen to the word</p>
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

      {/* Answer Reveal */}
      {!showAnswer ? (
        <Button
          onClick={() => setShowAnswer(true)}
          variant="outline"
          className="w-full"
        >
          Reveal Answer
        </Button>
      ) : (
        <Card className="bg-secondary/50">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-2">English</p>
              <h2 className="text-3xl font-bold text-foreground mb-4">{currentCard.english}</h2>
              <p className="text-sm text-muted-foreground mb-4">Chinese</p>
              <h3 className="text-2xl font-semibold text-accent mb-4">{currentCard.chinese}</h3>
              {currentCard.exampleSentence && (
                <p className="text-sm text-muted-foreground italic">"{currentCard.exampleSentence}"</p>
              )}
            </div>

            {/* Feedback Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleNext(false)}
                className="flex-1 gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Wrong
              </Button>
              <Button
                onClick={() => handleNext(true)}
                className="flex-1 gap-2"
              >
                <ChevronRight className="w-4 h-4" />
                Correct
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Settings Button */}
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
