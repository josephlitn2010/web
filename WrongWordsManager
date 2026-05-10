import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getWrongWords, getWrongWordsStats, clearAllWrongWords, deleteWrongWord } from '@/lib/wrongWords';
import type { WrongWordEntry } from '@/lib/wrongWords';

interface WrongWordsManagerProps {
  onStartReview: () => void;
  onDataUpdated: () => void;
}

export default function WrongWordsManager({ onStartReview, onDataUpdated }: WrongWordsManagerProps) {
  const [wrongWords, setWrongWords] = useState<WrongWordEntry[]>([]);
  const [stats, setStats] = useState(getWrongWordsStats());
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const words = getWrongWords();
    setWrongWords(words);
    setStats(getWrongWordsStats());
  }, [onDataUpdated]);

  const handleDeleteWord = (id: string) => {
    deleteWrongWord(id);
    const updated = getWrongWords();
    setWrongWords(updated);
    setStats(getWrongWordsStats());
    setDeleteId(null);
    toast.success('Word removed');
    onDataUpdated();
  };

  const handleClearAll = () => {
    clearAllWrongWords();
    setWrongWords([]);
    setStats(getWrongWordsStats());
    setIsClearDialogOpen(false);
    toast.success('All wrong words cleared');
    onDataUpdated();
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'dictation':
        return 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300';
      case 'quiz':
        return 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300';
      case 'listening':
        return 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300';
      default:
        return 'bg-gray-100 dark:bg-gray-950/30 text-gray-700 dark:text-gray-300';
    }
  };

  if (wrongWords.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <RefreshCw className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Wrong Words Yet</h3>
          <p className="text-muted-foreground mb-4">
            Wrong words from your practice sessions will appear here. Keep practicing!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-accent">{stats.active}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.byMode.dictation}</p>
            <p className="text-xs text-muted-foreground">Dictation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.byMode.quiz}</p>
            <p className="text-xs text-muted-foreground">Quiz</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.byMode.listening}</p>
            <p className="text-xs text-muted-foreground">Listening</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={onStartReview} variant="default" className="flex-1">
          <RefreshCw className="w-4 h-4 mr-2" />
          Review Wrong Words
        </Button>
        <Button onClick={() => setIsClearDialogOpen(true)} variant="outline" className="flex-1">
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </div>

      {/* Wrong Words List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Wrong Words List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {wrongWords.map((word, idx) => (
              <div key={word.id} className="p-3 bg-secondary/50 rounded-lg border border-border flex items-start justify-between hover:bg-secondary/70 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground">{word.english}</p>
                    <Badge variant="secondary" className={`text-xs capitalize ${getModeColor(word.mode)}`}>
                      {word.mode}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{word.chinese}</p>
                  {word.userAnswer && (
                    <p className="text-xs text-red-500 mt-1">
                      Your answer: {word.userAnswer}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Reviewed {word.reviewCount} times
                  </p>
                </div>
                <Button
                  onClick={() => setDeleteId(word.id)}
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Clear All Dialog */}
      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Clear All Wrong Words?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {stats.active} wrong words from your list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Clear All
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Word?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this word from your wrong words list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDeleteWord(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
