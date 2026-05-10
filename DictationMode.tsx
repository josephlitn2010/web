// 1. 檢查這幾行，確保副檔名是 .ts (通常邏輯檔不帶 x)
import { addToWrongWords } from './wrongWords.ts'; // <--- 檢查這裡！
import { speak, isSpeechSynthesisAvailable } from './speech.ts';
import { getProgressStats } from './utils.ts';
import { type VocabularyEntry, updateVocabularyMastery } from './db.ts';

// 2. 檢查 UI 組件，確保副檔名是 .tsx (組件檔帶 x)
import { Button } from './button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from './VocabularyLibrary.tsx'; 
// (註：如果你的 Card 是定義在 VocabularyLibrary.tsx 裡的話)


interface DictationModeProps {
  vocabulary: VocabularyEntry[];
  categories: Category[];
  onDataUpdated: () => void;
}

interface DictationResult {
  id: string;
  userEnglish: string;
  userChinese: string;
  correctEnglish: string;
  correctChinese: string;
  correct: boolean;
}

export default function DictationMode({ vocabulary, categories, onDataUpdated }: DictationModeProps) {
  const [cards, setCards] = useState<VocabularyEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userEnglish, setUserEnglish] = useState('');
  const [userChinese, setUserChinese] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [sessionResults, setSessionResults] = useState<DictationResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const stopDictationRef = useRef<(() => void) | null>(null);

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
    setUserEnglish('');
    setUserChinese('');
    setShowAnswer(false);
    setSessionStats({ correct: 0, total: 0 });
    setSessionResults([]);
    setShowResults(false);
    setShowConfig(false);
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

  const handleStartDictation = () => {
    if (!isSpeechRecognitionAvailable()) {
      toast.error('Speech recognition not available in your browser');
      return;
    }

    setIsDictating(true);
    setUserEnglish('');

    stopDictationRef.current = startDictation(
      (transcript, isFinal) => {
        setUserEnglish(transcript);
        if (isFinal) {
          setIsDictating(false);
        }
      },
      (error) => {
        toast.error(error);
        setIsDictating(false);
      },
      'en-US'
    );
  };

  const handleStopDictation = () => {
    if (stopDictationRef.current) {
      stopDictationRef.current();
      setIsDictating(false);
    }
  };

  const checkAnswer = async () => {
    if (!currentCard || !userEnglish.trim() || !userChinese.trim()) {
      toast.error('Please fill in both English and Chinese fields');
      return;
    }

    const dictationScoreChinese = JSON.parse(localStorage.getItem('dictationScoreChinese') || 'true');
    const englishCorrect = userEnglish.toLowerCase().trim() === currentCard.english.toLowerCase().trim();
    const chineseCorrect = userChinese.toLowerCase().trim() === currentCard.chinese.toLowerCase().trim();
    const isCorrect = dictationScoreChinese ? (englishCorrect && chineseCorrect) : englishCorrect;

    if (!isCorrect) {
      addWrongWord(
        currentCard.english,
        currentCard.chinese,
        currentCard.chinese,
        'dictation',
        currentCard.ipa,
        userEnglish.trim() + ' / ' + userChinese.trim()
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
        userEnglish: userEnglish.trim(),
        userChinese: userChinese.trim(),
        correctEnglish: currentCard.english,
        correctChinese: currentCard.chinese,
        correct: isCorrect,
      }];
      setSessionResults(newResults);

      setSessionStats(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));

      setShowAnswer(true);
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const handleNextWord = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserEnglish('');
      setUserChinese('');
      setShowAnswer(false);
    } else {
      setShowResults(true);
    }
    onDataUpdated();
  };

  if (vocabulary.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Add some vocabulary first to start dictation practice!</p>
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
        mode="dictation"
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
            <h2 className="text-3xl font-bold text-foreground mb-2">Session Complete!</h2>
            <p className="text-muted-foreground mb-6">Great effort on your dictation practice</p>
            
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
                      <span className="text-sm font-medium text-muted-foreground">Word {index + 1}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${result.correct ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {result.correct ? '✓ Correct' : '✗ Wrong'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-card rounded p-3">
                    <p className="text-xs text-muted-foreground mb-1">Your English</p>
                    <p className={`text-sm font-semibold ${result.userEnglish.toLowerCase() === result.correctEnglish.toLowerCase() ? 'text-green-700' : 'text-red-700'}`}>
                      {result.userEnglish}
                    </p>
                  </div>
                  <div className="bg-card rounded p-3">
                    <p className="text-xs text-muted-foreground mb-1">Your Chinese</p>
                    <p className={`text-sm font-semibold ${result.userChinese.toLowerCase() === result.correctChinese.toLowerCase() ? 'text-green-700' : 'text-red-700'}`}>
                      {result.userChinese}
                    </p>
                  </div>
                </div>

                {!result.correct && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card rounded p-3">
                      <p className="text-xs text-muted-foreground mb-1">Correct English</p>
                      <p className="text-sm font-semibold text-accent">{result.correctEnglish}</p>
                    </div>
                    <div className="bg-card rounded p-3">
                      <p className="text-xs text-muted-foreground mb-1">Correct Chinese</p>
                      <p className="text-sm font-semibold text-accent">{result.correctChinese}</p>
                    </div>
                  </div>
                )}
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

  // Answer Reveal Page
  if (showAnswer && currentCard) {
    const englishCorrect = userEnglish.toLowerCase().trim() === currentCard.english.toLowerCase().trim();
    const chineseCorrect = userChinese.toLowerCase().trim() === currentCard.chinese.toLowerCase().trim();
    const isCorrect = englishCorrect && chineseCorrect;
    
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

        {/* Correct Answers */}
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/30">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">Correct Answers</p>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">English</p>
                <h3 className="text-2xl font-bold text-foreground">{currentCard.english}</h3>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Chinese</p>
                <h3 className="text-2xl font-bold text-accent">{currentCard.chinese}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Answers */}
        <div className="grid grid-cols-2 gap-3">
          <Card className={englishCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2">Your English</p>
              <p className={`text-sm font-semibold ${englishCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {userEnglish || '(empty)'}
              </p>
              {englishCorrect && <p className="text-xs text-green-700 mt-2">✓ Correct</p>}
              {!englishCorrect && <p className="text-xs text-red-700 mt-2">✗ Incorrect</p>}
            </CardContent>
          </Card>

          <Card className={chineseCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2">Your Chinese</p>
              <p className={`text-sm font-semibold ${chineseCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {userChinese || '(empty)'}
              </p>
              {chineseCorrect && <p className="text-xs text-green-700 mt-2">✓ Correct</p>}
              {!chineseCorrect && <p className="text-xs text-red-700 mt-2">✗ Incorrect</p>}
            </CardContent>
          </Card>
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
        <Button onClick={handleNextWord} size="lg" className="w-full gap-2">
          <ChevronRight className="w-4 h-4" />
          {currentIndex < cards.length - 1 ? 'Next Word' : 'See Results'}
        </Button>
      </div>
    );
  }

  // Practice Page
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

      {/* Audio Controls */}
      <div className="flex gap-2">
        <Button
          size="lg"
          onClick={handlePlayAudio}
          disabled={isPlaying}
          className="flex-1 gap-2"
        >
          {isPlaying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Playing...
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              Play Audio
            </>
          )}
        </Button>

        {isSpeechRecognitionAvailable() && (
          <Button
            size="lg"
            variant={isDictating ? 'destructive' : 'outline'}
            onClick={isDictating ? handleStopDictation : handleStartDictation}
            className="flex-1 gap-2"
          >
            <Mic className="w-4 h-4" />
            {isDictating ? 'Stop' : 'Speak'}
          </Button>
        )}
      </div>

      {/* English Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">English Word</label>
        <Input
          value={userEnglish}
          onChange={(e) => setUserEnglish(e.target.value)}
          placeholder="Type or speak the English word..."
          disabled={isDictating}
          className="text-base"
        />
        <p className="text-xs text-muted-foreground">Type or use the Speak button</p>
      </div>

      {/* Chinese Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Chinese Meaning</label>
        <Input
          value={userChinese}
          onChange={(e) => setUserChinese(e.target.value)}
          placeholder="Type the Chinese translation..."
          className="text-base"
        />
        <p className="text-xs text-muted-foreground">Type the Chinese meaning</p>
      </div>

      {/* Check Answer Button */}
      <Button onClick={checkAnswer} size="lg" className="w-full gap-2">
        <ChevronRight className="w-4 h-4" />
        Check Answer
      </Button>

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
