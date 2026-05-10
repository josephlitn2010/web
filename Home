import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Zap, BarChart3, Settings, Plus } from 'lucide-react';
import { getAllVocabulary, getAllCategories, initializeDB } from '@/lib/db';
import { VocabularyEntry, Category } from '@/lib/db';
import VocabularyLibrary from '@/components/VocabularyLibrary';
import FlashcardMode from '@/components/FlashcardMode';
import ListeningMode from '@/components/ListeningMode';
import DictationMode from '@/components/DictationMode';
import QuizMode from '@/components/QuizMode';
import ProgressDashboard from '@/components/ProgressDashboard';
import SettingsPanel from '@/components/SettingsPanel';
import PracticeSelector from '@/components/PracticeSelector';
import AchievementSystem from '@/components/AchievementSystem';
import { getProgressStats } from '@/lib/utils';

export default function Home() {
  const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState('library');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedPracticeMode, setSelectedPracticeMode] = useState<'flashcard' | 'listening' | 'dictation' | 'quiz' | null>(null);
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeDB();
        const [vocabData, categoriesData] = await Promise.all([
          getAllVocabulary(),
          getAllCategories(),
        ]);
        setVocabulary(vocabData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, [refreshTrigger]);

  const handleDataUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const stats = getProgressStats(vocabulary);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border/50 shadow-sm">
        <div className="container py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-accent-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground hidden sm:inline">VocabLearn</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{stats.totalWords}</p>
              <p className="text-xs text-muted-foreground">words</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container pb-24 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-4 mb-8 bg-secondary/50 p-1 gap-0.5 rounded-lg shadow-sm transition-all duration-300">
            <TabsTrigger value="library" className="text-xs sm:text-sm px-1 sm:px-2 transition-all duration-200 data-[state=active]:shadow-md">
              <BookOpen className="w-4 h-4 mr-0.5 sm:mr-1" />
              <span className="hidden md:inline">Library</span>
            </TabsTrigger>
            <TabsTrigger value="practice" className="text-xs sm:text-sm px-1 sm:px-2">
              <Zap className="w-4 h-4 mr-0.5 sm:mr-1" />
              <span className="hidden md:inline">Practice</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="text-xs sm:text-sm px-1 sm:px-2">
              <BarChart3 className="w-4 h-4 mr-0.5 sm:mr-1" />
              <span className="hidden md:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm px-1 sm:px-2">
              <Settings className="w-4 h-4 mr-0.5 sm:mr-1" />
              <span className="hidden md:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="library" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Vocabulary Library</h2>
              <Button
                size="sm"
                className="gap-2 bg-accent hover:bg-accent/90"
                onClick={() => setActiveTab('settings')}
              >
                <Plus className="w-4 h-4" />
                Create New Category
              </Button>
            </div>
            <VocabularyLibrary
              vocabulary={vocabulary}
              categories={categories}
              onDataUpdated={handleDataUpdated}
            />
          </TabsContent>

          <TabsContent value="practice" className="space-y-4">
            {selectedPracticeMode === null ? (
              <PracticeSelector
                onSelectPractice={(mode) => {
                  setSelectedPracticeMode(mode);
                }}
              />
            ) : (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPracticeMode(null)}
                  className="mb-4"
                >
                  ← Back to Practice Selection
                </Button>
                {selectedPracticeMode === 'flashcard' && (
                  <>
                    <h2 className="text-xl font-bold text-foreground">Flashcard Study</h2>
                    <FlashcardMode
                      vocabulary={vocabulary}
                      categories={categories}
                      onDataUpdated={handleDataUpdated}
                    />
                  </>
                )}
                {selectedPracticeMode === 'listening' && (
                  <>
                    <h2 className="text-xl font-bold text-foreground">Listening Practice</h2>
                    <ListeningMode
                      vocabulary={vocabulary}
                      categories={categories}
                      onDataUpdated={handleDataUpdated}
                    />
                  </>
                )}
                {selectedPracticeMode === 'dictation' && (
                  <>
                    <h2 className="text-xl font-bold text-foreground">Dictation Practice</h2>
                    <DictationMode
                      vocabulary={vocabulary}
                      categories={categories}
                      onDataUpdated={handleDataUpdated}
                    />
                  </>
                )}
                {selectedPracticeMode === 'quiz' && (
                  <>
                    <h2 className="text-xl font-bold text-foreground">Quiz Practice</h2>
                    <QuizMode
                      vocabulary={vocabulary}
                      categories={categories}
                      onDataUpdated={handleDataUpdated}
                    />
                  </>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <h2 className="text-xl font-bold text-foreground mb-4">Your Progress</h2>
            <ProgressDashboard
              vocabulary={vocabulary}
              stats={stats}
              onStartPractice={(wordIds) => {
                setSelectedWordIds(wordIds);
                setSelectedPracticeMode('flashcard');
                setActiveTab('practice');
              }}
            />
            <div className="mt-8">
              <h3 className="text-lg font-bold text-foreground mb-4">🏆 Achievements</h3>
              <AchievementSystem
                totalWords={stats.totalWords}
                learnedWords={stats.learnedWords}
                reviewedToday={stats.reviewedToday}
                totalReviewCount={vocabulary.reduce((sum, v) => sum + (v.reviewCount || 0), 0)}
              />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-xl font-bold text-foreground mb-4">Settings</h2>
            <SettingsPanel
              vocabulary={vocabulary}
              categories={categories}
              onDataUpdated={handleDataUpdated}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
