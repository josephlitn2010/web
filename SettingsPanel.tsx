import { useState, useEffect } from 'react';
// 1. 修正邏輯路徑
import { VocabularyEntry, Category, exportAllData, importData, clearAllData, addCategory, deleteCategory } from './db.ts';
import { initializeSampleData, hasSampleData } from './sampleData.ts';
import { downloadJSON, parseJSONFile } from './utils.ts';
import { exportAllVocabularyToCSV } from './csvExport.ts';
import { exportAllVocabularyToHTML } from './htmlExport.ts';
import { getSearchHistory, removeFromSearchHistory, clearSearchHistory, type SearchHistoryItem } from './searchHistory.ts';

// 2. 修正 UI 組件路徑 (從 VocabularyLibrary 借用定義好的 Card/Input 等)
import { Button } from './button.tsx';
import { 
  Card, CardContent, CardHeader, CardTitle, 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  Input 
} from './VocabularyLibrary.tsx'; 

// 3. 處理 AlertDialog (如果沒有檔案，我們用簡單的 HTML 代替)
const AlertDialog = ({ children }: any) => <>{children}</>;
const AlertDialogTrigger = ({ children, asChild }: any) => <>{children}</>;
const AlertDialogContent = ({ children }: any) => (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg p-6 max-w-sm w-full">{children}</div>
  </div>
);
const AlertDialogHeader = ({ children }: any) => <div className="mb-4">{children}</div>;
const AlertDialogTitle = ({ children }: any) => <h2 className="text-lg font-bold">{children}</h2>;
const AlertDialogDescription = ({ children }: any) => <p className="text-sm text-gray-500">{children}</p>;
const AlertDialogAction = (props: any) => <Button {...props} className={`bg-destructive text-destructive-foreground ${props.className}`} />;
const AlertDialogCancel = (props: any) => <Button {...props} variant="outline" />;

// 4. 其他剩餘組件
import { Download, Upload, Trash2, Plus, Settings, Sparkles, Wrench, Moon, Sun, Clock, X, Droplet } from 'lucide-react';
import { toast } from 'sonner';

// 5. 處理可能不存在的檔案 (如果 Build 報錯說找不到這些，建議先註解掉相關 HTML 區塊)
// import CategoryCleanupTool from './CategoryCleanupTool.tsx';
// import { OfflineTranslationPanel } from './OfflineTranslationPanel.tsx';

// 6. 處理 ThemeContext (如果沒有這個檔案，我們給一個虛擬的切換邏輯)
const useTheme = () => {
  const [theme, setTheme] = useState('light');
  return { theme, setTheme: (t: string) => setTheme(t) };
};

interface SettingsPanelProps {
  vocabulary: VocabularyEntry[];
  categories: Category[];
  onDataUpdated: () => void;
}

export default function SettingsPanel({
  vocabulary,
  categories,
  onDataUpdated,
}: SettingsPanelProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [hasSample, setHasSample] = useState(false);
  const [vocabVoiceSpeed, setVocabVoiceSpeed] = useState(() => {
    const saved = localStorage.getItem('vocabVoiceSpeed');
    return saved ? parseFloat(saved) : 1;
  });

  const [practiceVoiceSpeed, setPracticeVoiceSpeed] = useState(() => {
    const saved = localStorage.getItem('practiceVoiceSpeed');
    return saved ? parseFloat(saved) : 1;
  });

  const [dictationScoreChinese, setDictationScoreChinese] = useState(() => {
    const saved = localStorage.getItem('dictationScoreChinese');
    return saved ? JSON.parse(saved) : true;
  });
  const { theme, toggleTheme, switchTheme } = useTheme();
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isSearchHistoryOpen, setIsSearchHistoryOpen] = useState(false);

  useEffect(() => {
    if (isSearchHistoryOpen) {
      setSearchHistory(getSearchHistory());
    }
  }, [isSearchHistoryOpen]);

  const handleExportAllCSV = async () => {
    try {
      if (vocabulary.length === 0) {
        toast.error('No words to export');
        return;
      }
      await exportAllVocabularyToCSV(vocabulary);
      toast.success('All words exported as CSV successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV');
    }
  };

  const handleExportAllHTML = async () => {
    try {
      if (vocabulary.length === 0) {
        toast.error('No words to export');
        return;
      }
      await exportAllVocabularyToHTML(vocabulary);
      toast.success('All words exported as HTML successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export HTML');
    }
  };

  useEffect(() => {
    const checkSampleData = async () => {
      const has = await hasSampleData();
      setHasSample(has);
    };
    checkSampleData();
  }, []);

  const handleExportData = async () => {
    try {
      const data = await exportAllData();
      downloadJSON(data, `vocab-backup-${new Date().toISOString().split('T')[0]}.json`);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleImportData = async (file: File) => {
    try {
      const data = await parseJSONFile(file);
      
      if (!data.vocabulary || !data.categories) {
        toast.error('Invalid backup file format');
        return;
      }

      await importData(data);
      toast.success('Data imported successfully');
      onDataUpdated();
    } catch (error) {
      toast.error('Failed to import data');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      const colors = [
        'oklch(0.5 0.15 150)',
        'oklch(0.55 0.12 200)',
        'oklch(0.6 0.12 280)',
        'oklch(0.65 0.1 25)',
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      await addCategory(newCategoryName, randomColor);
      toast.success('Category created successfully');
      setNewCategoryName('');
      setIsAddCategoryOpen(false);
      onDataUpdated();
    } catch (error) {
      toast.error('Failed to create category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      toast.success('Category deleted');
      onDataUpdated();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleClearAllData = async () => {
    try {
      await clearAllData();
      toast.success('All data cleared');
      setIsClearDialogOpen(false);
      onDataUpdated();
    } catch (error) {
      toast.error('Failed to clear data');
    }
  };

  const handleLoadSampleData = async () => {
    try {
      await initializeSampleData();
      toast.success('Sample data loaded successfully');
      setHasSample(true);
      onDataUpdated();
    } catch (error) {
      toast.error('Failed to load sample data');
    }
  };

  const handleVocabVoiceSpeedChange = (speed: number) => {
    setVocabVoiceSpeed(speed);
    localStorage.setItem('vocabVoiceSpeed', speed.toString());
  };

  const handlePracticeVoiceSpeedChange = (speed: number) => {
    setPracticeVoiceSpeed(speed);
    localStorage.setItem('practiceVoiceSpeed', speed.toString());
  };

  const handleDictationScoreChineseChange = (value: boolean) => {
    setDictationScoreChinese(value);
    localStorage.setItem('dictationScoreChinese', JSON.stringify(value));
  };

  const handleRemoveSearchHistory = (query: string) => {
    removeFromSearchHistory(query);
    setSearchHistory(searchHistory.filter(item => item.query !== query));
  };

  const handleClearAllSearchHistory = () => {
    clearSearchHistory();
    setSearchHistory([]);
    toast.success('Search history cleared');
  };

  return (
    <div className="space-y-6">
      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="w-5 h-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full gap-2" onClick={handleExportData}>
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <Button variant="outline" className="w-full gap-2" onClick={handleExportAllCSV}>
            <Download className="w-4 h-4" />
            Export All Words as CSV
          </Button>
          <Button variant="outline" className="w-full gap-2" onClick={handleExportAllHTML}>
            <Download className="w-4 h-4" />
            Export All Words as HTML
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImportData(e.target.files[0]);
                }
              }}
              className="hidden"
              id="import-file"
            />
            <label htmlFor="import-file">
              <Button variant="outline" className="w-full gap-2 cursor-pointer text-foreground import-data-btn" asChild>
                <span>
                  <Upload className="w-4 h-4" />
                  Import Data
                </span>
              </Button>
            </label>
          </div>
          {!hasSample && (
            <Button variant="outline" className="w-full gap-2" onClick={handleLoadSampleData}>
              <Sparkles className="w-4 h-4" />
              Load Sample Data
            </Button>
          )}
          <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2">
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your vocabulary words and categories. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-2 justify-end">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {theme === 'liquid-glass' ? <Droplet className="w-5 h-5" /> : theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Select Theme</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => switchTheme?.('light')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  theme === 'light'
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                <Sun className="w-5 h-5 mx-auto mb-1" />
                <p className="text-xs font-medium">Light</p>
              </button>
              <button
                onClick={() => switchTheme?.('dark')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                <Moon className="w-5 h-5 mx-auto mb-1" />
                <p className="text-xs font-medium">Dark</p>
              </button>
              <button
                onClick={() => switchTheme?.('liquid-glass')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  theme === 'liquid-glass'
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                <Droplet className="w-5 h-5 mx-auto mb-1" />
                <p className="text-xs font-medium">Glass</p>
              </button>
            </div>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              {theme === 'liquid-glass'
                ? 'Liquid Glass: Modern glassmorphism design with blue gradient'
                : theme === 'dark'
                ? 'Dark Mode: Easy on the eyes with deep colors'
                : 'Light Mode: Clean and bright interface'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Voice Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Voice Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Vocabulary Speed: {(vocabVoiceSpeed * 100).toFixed(0)}%
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={vocabVoiceSpeed}
                onChange={(e) => handleVocabVoiceSpeedChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-primary/50 rounded-lg appearance-none cursor-pointer input-focus-ring accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Slow (0.5x)</span>
                <span>Normal (1x)</span>
                <span>Fast (2x)</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Speed for playing pronunciation in Vocabulary Library.
            </p>
          </div>
          <div className="border-t pt-4">
            <label className="text-sm font-medium text-foreground mb-3 block">
              Practice Speed: {(practiceVoiceSpeed * 100).toFixed(0)}%
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={practiceVoiceSpeed}
                onChange={(e) => handlePracticeVoiceSpeedChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-primary/50 rounded-lg appearance-none cursor-pointer input-focus-ring accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Slow (0.5x)</span>
                <span>Normal (1x)</span>
                <span>Fast (2x)</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Speed for playing pronunciation in Flashcard, Listening, Dictation, and Quiz modes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Practice Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Practice Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Score Chinese in Dictation</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dictationScoreChinese 
                    ? 'Both English and Chinese answers are checked for scoring' 
                    : 'Only English answer is checked for scoring, Chinese is displayed only'}
                </p>
              </div>
              <button
                onClick={() => handleDictationScoreChineseChange(!dictationScoreChinese)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  dictationScoreChinese ? 'bg-accent' : 'bg-secondary'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    dictationScoreChinese ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
            <DialogTrigger asChild>
              <Button className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Create New Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Category name (e.g., Business, IELTS)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCategory}>
                    Create
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {categories.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Existing categories:</p>
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm">{cat.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1 hover:bg-destructive/10 rounded text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Cleanup Tool */}
      <Dialog>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:bg-secondary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Category Cleanup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Find and merge duplicate categories, delete empty ones</p>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Category Cleanup Tool</DialogTitle>
          </DialogHeader>
          <CategoryCleanupTool onCleanupComplete={onDataUpdated} />
        </DialogContent>
      </Dialog>

      {/* Offline Translation */}
      <OfflineTranslationPanel />

      {/* Search History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Search History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {searchHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No search history yet</p>
          ) : (
            <>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {searchHistory.map((item) => (
                  <div
                    key={`${item.query}-${item.timestamp}`}
                    className="flex items-center justify-between gap-2 p-2 bg-secondary/50 rounded hover:bg-secondary transition-colors"
                  >
                    <span className="text-sm truncate flex-1">{item.query}</span>
                    <button
                      onClick={() => handleRemoveSearchHistory(item.query)}
                      className="p-1 hover:bg-destructive/10 rounded transition-colors"
                      title="Remove"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full gap-2 text-destructive hover:text-destructive"
                onClick={handleClearAllSearchHistory}
              >
                <Trash2 className="w-4 h-4" />
                Clear All History
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Version Info */}
      <Card className="mt-8 bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">VocabLearn</p>
            <p className="text-xs text-muted-foreground mt-1">Version 1.0.0</p>
            <p className="text-xs text-muted-foreground mt-2">Premium Vocabulary Learning PWA</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
