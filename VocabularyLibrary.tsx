import { useState } from 'react';
// 修正處：從 @/lib 改為 ./ 且補上副檔名
import { VocabularyEntry, Category, addVocabulary, updateVocabulary, deleteVocabulary, addCategory, deleteMultipleVocabulary, updateMultipleMastery, updateMultipleCategory } from './db.ts';
// 修正處：將原本所有 @/components/ui/ 改為直接指向根目錄的檔案
import { Button } from './button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog.tsx';
export const Select = ({ children, value, onValueChange }: any) => (
  <select value={value} onChange={(e) => onValueChange(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
    {children}
  </select>
);
export const SelectTrigger = ({ children }: any) => <>{children}</>;
export const SelectValue = (props: any) => null; 
export const SelectContent = ({ children }: any) => <>{children}</>;
export const SelectItem = ({ value, children }: any) => <option value={value}>{children}</option>;

// 修正處：因為你沒有單獨的 input.tsx 等檔案，我們先用最保險的方法：
// 直接定義簡單的 HTML 替代組件，避免 Build 失敗
const Input = (props: any) => <input {...props} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.className}`} />;
const Textarea = (props: any) => <textarea {...props} className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.className}`} />;

// 這些組件如果沒有檔案，建議先用簡單的 div/span 代替，確保能跑起來
const Card = ({ children, className }: any) => <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>;
const CardContent = ({ children, className }: any) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
const CardHeader = ({ children, className }: any) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className }: any) => <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const Badge = ({ children, className, style }: any) => <span style={style} className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>{children}</span>;
const Checkbox = (props: any) => <input type="checkbox" {...props} className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 ${props.className}`} />;


// 修正 Select：因為 Select 邏輯複雜，我們先用原生 HTML select 確保不崩潰
const Select = ({ children, value, onValueChange }: any) => (
  <select value={value} onChange={(e) => onValueChange(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
    {children}
  </select>
);
const SelectTrigger = ({ children }: any) => <>{children}</>;
const SelectValue = (props: any) => null; 
const SelectContent = ({ children }: any) => <>{children}</>;
const SelectItem = ({ value, children }: any) => <option value={value}>{children}</option>;


interface VocabularyLibraryProps {
  vocabulary: VocabularyEntry[];
  categories: Category[];
  onDataUpdated: () => void;
}

export default function VocabularyLibrary({
  vocabulary,
  categories,
  onDataUpdated,
}: VocabularyLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'a-z' | 'mastery'>('recent');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkOperationMode, setIsBulkOperationMode] = useState(false);
  const [formData, setFormData] = useState({
    english: '',
    chinese: '',
    ipa: '',
    exampleSentence: '',
    category: 'General',
  });
  const [bulkText, setBulkText] = useState('');
  const [isSearchHistoryOpen, setIsSearchHistoryOpen] = useState(false);

  const filteredVocabulary = vocabulary.filter(item => {
    const matchesSearch = item.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.chinese.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort vocabulary based on selected sort option
  const sortedVocabulary = [...filteredVocabulary].sort((a, b) => {
    if (sortBy === 'a-z') {
      return a.english.localeCompare(b.english);
    } else if (sortBy === 'mastery') {
      return (b.mastery || 0) - (a.mastery || 0);
    } else {
      // recent (default)
      return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt);
    }
  });

  const handleAddVocabulary = async () => {
    if (!formData.english.trim() || !formData.chinese.trim()) {
      toast.error('Please fill in English and Chinese fields');
      return;
    }

    try {
      await addVocabulary({
        english: formData.english,
        chinese: formData.chinese,
        ipa: formData.ipa,
        exampleSentence: formData.exampleSentence,
        category: formData.category,
        tags: [],
        mastery: 0,
      });
      toast.success('Word added successfully');
      setFormData({ english: '', chinese: '', ipa: '', exampleSentence: '', category: 'General' });
      setIsAddDialogOpen(false);
      onDataUpdated();
    } catch (error) {
      toast.error('Failed to add word');
    }
  };

  const handleBulkImport = async () => {
    if (!bulkText.trim()) {
      toast.error('Please enter vocabulary data');
      return;
    }

    const items = parseBulkVocabulary(bulkText);
    if (items.length === 0) {
      toast.error('No valid entries found. Use format: English | Chinese | Category');
      return;
    }

    try {
      // Get unique categories from items (trimmed)
      const categorySet = new Set<string>();
      items.forEach(item => categorySet.add(item.category.trim()));
      const uniqueCategories = Array.from(categorySet);
      
      // Create categories that don't exist (addCategory now handles duplicate prevention)
      for (const categoryName of uniqueCategories) {
        if (categoryName !== 'General' && categoryName !== 'Uncategorized') {
          await addCategory(categoryName, '');
        }
      }
      
      // Add vocabulary items
      for (const item of items) {
        await addVocabulary({
          english: item.english,
          chinese: item.chinese,
          category: item.category.trim(),
          tags: [],
          mastery: 0,
        });
      }
      toast.success(`Added ${items.length} words`);
      setBulkText('');
      setBulkMode(false);
      setIsAddDialogOpen(false);
      onDataUpdated();
    } catch (error) {
      toast.error('Failed to import words');
    }
  };

  const handleDeleteVocabulary = async (id: string) => {
    try {
      await deleteVocabulary(id);
      toast.success('Word deleted');
      onDataUpdated();
    } catch (error) {
      toast.error('Failed to delete word');
    }
  };

  const handleEditVocabulary = (item: VocabularyEntry) => {
    setEditingId(item.id);
    setFormData({
      english: item.english,
      chinese: item.chinese,
      ipa: item.ipa || '',
      exampleSentence: item.exampleSentence || '',
      category: item.category,
    });
    setIsAddDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!formData.english.trim() || !formData.chinese.trim()) {
      toast.error('Please fill in English and Chinese fields');
      return;
    }

    try {
      const editingItem = vocabulary.find(v => v.id === editingId);
      if (editingItem) {
        await updateVocabulary(editingId!, {
          english: formData.english,
          chinese: formData.chinese,
          ipa: formData.ipa,
          exampleSentence: formData.exampleSentence,
          category: formData.category,
          isEdited: true,
        });
        toast.success('Word updated successfully');
        setEditingId(null);
        setFormData({ english: '', chinese: '', ipa: '', exampleSentence: '', category: 'General' });
        setIsAddDialogOpen(false);
        onDataUpdated();
      }
    } catch (error) {
      toast.error('Failed to update word');
    }
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingId(null);
    setFormData({ english: '', chinese: '', ipa: '', exampleSentence: '', category: 'General' });
  };

  const handleSpeak = async (text: string) => {
    if (!isSpeechSynthesisAvailable()) {
      toast.error('Speech synthesis not available');
      return;
    }
    try {
      const vocabVoiceSpeed = parseFloat(localStorage.getItem('vocabVoiceSpeed') || '1');
      await speak(text, { language: 'en-US', rate: vocabVoiceSpeed });
    } catch (error) {
      toast.error('Failed to play audio');
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    if (newSelected.size === 0) {
      setIsBulkOperationMode(false);
    } else {
      setIsBulkOperationMode(true);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === sortedVocabulary.length) {
      setSelectedIds(new Set());
      setIsBulkOperationMode(false);
    } else {
      setSelectedIds(new Set(sortedVocabulary.map(v => v.id)));
      setIsBulkOperationMode(true);
    }
  };

  const handleBulkDelete = async () => {
    await deleteMultipleVocabulary(Array.from(selectedIds));
    onDataUpdated();
  };

  const handleBulkUpdateMastery = async (mastery: number) => {
    await updateMultipleMastery(Array.from(selectedIds), mastery);
    onDataUpdated();
  };

  const handleBulkUpdateCategory = async (category: string) => {
    await updateMultipleCategory(Array.from(selectedIds), category);
    onDataUpdated();
  };

  const handleCancelBulkOperation = () => {
    setSelectedIds(new Set());
    setIsBulkOperationMode(false);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search words..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchHistoryOpen(true)}
            onBlur={() => setTimeout(() => setIsSearchHistoryOpen(false), 200)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                addToSearchHistory(searchQuery);
              }
            }}
            className="pl-10"
          />
          <SearchHistoryDropdown
            isOpen={isSearchHistoryOpen}
            onSelect={(query) => {
              setSearchQuery(query);
              addToSearchHistory(query);
            }}
            onClose={() => setIsSearchHistoryOpen(false)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'recent' | 'a-z' | 'mastery')}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recent</SelectItem>
            <SelectItem value="a-z">A-Z</SelectItem>
            <SelectItem value="mastery">Mastery</SelectItem>
          </SelectContent>
        </Select>
        {!isBulkOperationMode && sortedVocabulary.length > 0 && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsBulkOperationMode(true)}
          >
            <Check className="w-4 h-4" />
            Bulk Select
          </Button>
        )}
        {isBulkOperationMode && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleSelectAll}
          >
            <Check className="w-4 h-4" />
            {selectedIds.size === sortedVocabulary.length ? 'Deselect All' : 'Select All'}
          </Button>
        )}
        {selectedCategory !== 'all' && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={async () => {
              try {
                const categoryVocab = vocabulary.filter(v => v.category === selectedCategory);
                if (categoryVocab.length === 0) {
                  toast.error('No words in this category to export');
                  return;
                }
                await exportVocabularyToHTML(selectedCategory, categoryVocab);
                toast.success('HTML exported successfully');
              } catch (error) {
                toast.error('Failed to export HTML');
              }
            }}
          >
            <Download className="w-4 h-4" />
            Export HTML
          </Button>
        )}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => {
              setEditingId(null);
              setFormData({ english: '', chinese: '', ipa: '', exampleSentence: '', category: 'General' });
            }}>
              <Plus className="w-4 h-4" />
              Add Word
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{bulkMode ? 'Bulk Import' : editingId ? 'Edit Word' : 'Add New Word'}</DialogTitle>
            </DialogHeader>
            {bulkMode ? (
              <div className="space-y-4">
                <Textarea
                  placeholder="Enter words in format: English | Chinese | Category&#10;Example:&#10;Hello | 你好 | Greeting&#10;Book | 书 | Daily Life"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <div className="flex gap-2 sticky bottom-0 bg-background pt-2 -mx-6 px-6 pb-6">
                  <Button variant="outline" onClick={() => setBulkMode(false)}>
                    Single Add
                  </Button>
                  <Button onClick={handleBulkImport} className="flex-1">
                    Import
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">English</label>
                  <Input
                    value={formData.english}
                    onChange={(e) => setFormData({ ...formData, english: e.target.value })}
                    placeholder="e.g., Hello"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Chinese</label>
                  <Input
                    value={formData.chinese}
                    onChange={(e) => setFormData({ ...formData, chinese: e.target.value })}
                    placeholder="e.g., 你好"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">IPA (optional)</label>
                  <Input
                    value={formData.ipa}
                    onChange={(e) => setFormData({ ...formData, ipa: e.target.value })}
                    placeholder="e.g., /həˈloʊ/"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Example Sentence (optional)</label>
                  <Textarea
                    value={formData.exampleSentence}
                    onChange={(e) => setFormData({ ...formData, exampleSentence: e.target.value })}
                    placeholder="e.g., Hello, how are you?"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setBulkMode(true)}>
                    Bulk Import
                  </Button>
                  <Button onClick={editingId ? handleSaveEdit : handleAddVocabulary} className="flex-1">
                    {editingId ? 'Save' : 'Add'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Vocabulary List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedVocabulary.length === 0 ? (
          <Card className="border-dashed col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No words found. Start by adding your first vocabulary!</p>
            </CardContent>
          </Card>
        ) : (
          sortedVocabulary.map((item, index) => {
            const isSelected = selectedIds.has(item.id);
            return (
            <Card 
              key={item.id} 
              className={`vocab-card animate-fade-in transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isSelected ? 'ring-2 ring-accent' : ''} ${isBulkOperationMode ? 'cursor-pointer hover:bg-accent/5' : ''}`} 
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => isBulkOperationMode && handleToggleSelect(item.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {isBulkOperationMode && (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleSelect(item.id)}
                          className="mt-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <h3 className="text-lg font-semibold text-foreground truncate">{item.english}</h3>
                      {isSpeechSynthesisAvailable() && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(item.english);
                          }}
                          className="p-1 hover:bg-secondary rounded transition-all duration-200 hover:scale-110"
                          title="Pronounce"
                        >
                          <Volume2 className="w-4 h-4 text-accent" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{item.chinese}</p>
                    {item.ipa && (
                      <p className="text-xs text-accent font-mono mb-2">{item.ipa}</p>
                    )}
                    {item.exampleSentence && (
                      <p className="text-sm text-muted-foreground italic mb-2">"{item.exampleSentence}"</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" style={{ backgroundColor: getCategoryColor(categories.findIndex(c => c.name === item.category)) }}>
                        {item.category}
                      </Badge>
                      <Badge variant="outline">
                        Mastery: {Math.round(item.mastery)}%
                      </Badge>
                      {item.isEdited && (
                        <Badge variant="default" className="bg-accent text-accent-foreground">
                          Edited
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditVocabulary(item);
                      }}
                      className="p-2 hover:bg-accent/10 rounded transition-colors text-accent"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteVocabulary(item.id);
                      }}
                      className="p-2 hover:bg-destructive/10 rounded transition-colors text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })
        )}
      </div>

      {/* Stats */}
      {vocabulary.length > 0 && (
        <Card className="bg-secondary/50">
          <CardContent className="p-4">
            <p className="text-sm text-foreground">
              Showing <span className="font-semibold">{filteredVocabulary.length}</span> of <span className="font-semibold">{vocabulary.length}</span> words
            </p>
          </CardContent>
        </Card>
      )}

      {/* Bulk Operations Toolbar */}
      {isBulkOperationMode && (
        <BulkOperationsToolbar
          selectedCount={selectedIds.size}
          categories={categories}
          onDelete={handleBulkDelete}
          onUpdateMastery={handleBulkUpdateMastery}
          onUpdateCategory={handleBulkUpdateCategory}
          onCancel={handleCancelBulkOperation}
        />
      )}

      {/* Add padding at bottom to prevent toolbar overlap */}
      {isBulkOperationMode && <div className="h-24" />}
    </div>
  );
}
