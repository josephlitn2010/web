import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2, Tag, FolderOpen, X } from 'lucide-react';
import { toast } from 'sonner';
import { Category } from '@/lib/db';

interface BulkOperationsToolbarProps {
  selectedCount: number;
  categories: Category[];
  onDelete: () => Promise<void>;
  onUpdateMastery: (mastery: number) => Promise<void>;
  onUpdateCategory: (category: string) => Promise<void>;
  onCancel: () => void;
}

export default function BulkOperationsToolbar({
  selectedCount,
  categories,
  onDelete,
  onUpdateMastery,
  onUpdateCategory,
  onCancel,
}: BulkOperationsToolbarProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMasteryDialogOpen, setIsMasteryDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedMastery, setSelectedMastery] = useState<string>('50');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete();
      toast.success(`Deleted ${selectedCount} word(s)`);
      setIsDeleteDialogOpen(false);
      onCancel();
    } catch (error) {
      toast.error('Failed to delete words');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMastery = async () => {
    setIsLoading(true);
    try {
      await onUpdateMastery(parseInt(selectedMastery));
      toast.success(`Updated mastery for ${selectedCount} word(s)`);
      setIsMasteryDialogOpen(false);
      onCancel();
    } catch (error) {
      toast.error('Failed to update mastery');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }
    setIsLoading(true);
    try {
      await onUpdateCategory(selectedCategory);
      toast.success(`Moved ${selectedCount} word(s) to ${selectedCategory}`);
      setIsCategoryDialogOpen(false);
      onCancel();
    } catch (error) {
      toast.error('Failed to update category');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg animate-slide-up">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{selectedCount} selected</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Update Mastery Button */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsMasteryDialogOpen(true)}
              disabled={isLoading}
            >
              <Tag className="w-4 h-4" />
              Mastery
            </Button>

            {/* Update Category Button */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsCategoryDialogOpen(true)}
              disabled={isLoading}
            >
              <FolderOpen className="w-4 h-4" />
              Category
            </Button>

            {/* Delete Button */}
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>

            {/* Cancel Button */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} word(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All selected words will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Mastery Dialog */}
      <AlertDialog open={isMasteryDialogOpen} onOpenChange={setIsMasteryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Mastery Level</AlertDialogTitle>
            <AlertDialogDescription>
              Set the mastery level for {selectedCount} word(s)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={selectedMastery} onValueChange={setSelectedMastery}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">New (0%)</SelectItem>
                <SelectItem value="25">Learning (25%)</SelectItem>
                <SelectItem value="50">Intermediate (50%)</SelectItem>
                <SelectItem value="75">Advanced (75%)</SelectItem>
                <SelectItem value="100">Mastered (100%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateMastery} disabled={isLoading}>
              Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Category Dialog */}
      <AlertDialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Category</AlertDialogTitle>
            <AlertDialogDescription>
              Select a category for {selectedCount} word(s)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateCategory} disabled={isLoading}>
              Move
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
