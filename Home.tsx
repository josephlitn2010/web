import { useEffect, useState } from 'react';
import { Button } from "./button.tsx";
// 修正處：將 lucide-react 視為外部套件，路徑不變
import { BookOpen, Zap, BarChart3, Settings, Plus } from 'lucide-react';

// 修正處：路徑扁平化，全部指向根目錄
import { getAllVocabulary, getAllCategories, initializeDB, type VocabularyEntry, type Category } from './db.ts';
import VocabularyLibrary from './VocabularyLibrary.tsx';
import FlashcardMode from './FlashcardMode.tsx';
import ListeningMode from './ListeningMode.tsx';
import DictationMode from './DictationMode.tsx';
import QuizMode from './QuizMode.tsx';
import ProgressDashboard from './ProgressDashboard.tsx';
import SettingsPanel from './SettingsPanel.tsx';
import PracticeSelector from './PracticeSelector.tsx';
import AchievementSystem from './AchievementSystem.tsx';
import { getProgressStats } from './utils.ts';

export default function Home() {
  const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState('library');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedPracticeMode, setSelectedPracticeMode] = useState<'flashcard' | 'listening' | 'dictation' | 'quiz' | null>(null);

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

  const handleDataUpdated = () => setRefreshTrigger(prev => prev + 1);
  const stats = getProgressStats(vocabulary);

  // 自定義簡單的 Tabs 切換邏輯，避免引用不存在的 UI 套件
  const TabButton = ({ value, icon: Icon, label }: { value: string, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={`flex items-center justify-center py-2 px-4 rounded-md transition-all ${
        activeTab === value ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">VocabLearn</h1>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{stats.totalWords} words</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-24 pt-6">
        {/* 自定義 Tabs 導航 */}
        <div className="grid grid-cols-4 gap-1 bg-gray-200/50 p-1 rounded-lg mb-8">
          <TabButton value="library" icon={BookOpen} label="Library" />
          <TabButton value="practice" icon={Zap} label="Practice" />
          <TabButton value="progress" icon={BarChart3} label="Stats" />
          <TabButton value="settings" icon={Settings} label="Settings" />
        </div>

        {/* 內容區塊控制 */}
        {activeTab === 'library' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Vocabulary Library</h2>
              <Button size="sm" onClick={() => setActiveTab('settings')} className="gap-2">
                <Plus className="w-4 h-4" /> Create Category
              </Button>
            </div>
            <VocabularyLibrary vocabulary={vocabulary} categories={categories} onDataUpdated={handleDataUpdated} />
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="space-y-4">
            {selectedPracticeMode === null ? (
              <PracticeSelector onSelectPractice={(mode) => setSelectedPracticeMode(mode as any)} />
            ) : (
              <div>
                <Button variant="outline" onClick={() => setSelectedPracticeMode(null)} className="mb-4">
                  ← Back
                </Button>
                {selectedPracticeMode === 'flashcard' && <FlashcardMode vocabulary={vocabulary} categories={categories} onDataUpdated={handleDataUpdated} />}
                {selectedPracticeMode === 'listening' && <ListeningMode vocabulary={vocabulary} categories={categories} onDataUpdated={handleDataUpdated} />}
                {selectedPracticeMode === 'dictation' && <DictationMode vocabulary={vocabulary} categories={categories} onDataUpdated={handleDataUpdated} />}
                {selectedPracticeMode === 'quiz' && <QuizMode vocabulary={vocabulary} categories={categories} onDataUpdated={handleDataUpdated} />}
              </div>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Your Progress</h2>
            <ProgressDashboard 
              vocabulary={vocabulary} 
              stats={stats} 
              onStartPractice={() => { setSelectedPracticeMode('flashcard'); setActiveTab('practice'); }} 
            />
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">🏆 Achievements</h3>
              <AchievementSystem
                totalWords={stats.totalWords}
                learnedWords={stats.learnedWords}
                reviewedToday={stats.reviewedToday}
                totalReviewCount={vocabulary.reduce((sum, v) => sum + (v.reviewCount || 0), 0)}
              />
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <SettingsPanel vocabulary={vocabulary} categories={categories} onDataUpdated={handleDataUpdated} />
          </div>
        )}
      </main>
    </div>
  );
}
