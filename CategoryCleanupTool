import { useState, useEffect } from 'react';
import { getCategoryStats, findDuplicateCategories, mergeCategories, deleteEmptyCategories } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Merge, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface CategoryCleanupToolProps {
  onCleanupComplete: () => void;
}

interface DuplicateGroup {
  normalizedName: string;
  categories: Array<{ id: string; name: string; count: number }>;
}

export default function CategoryCleanupTool({ onCleanupComplete }: CategoryCleanupToolProps) {
  const [stats, setStats] = useState<Array<{ id: string; name: string; normalizedName: string; count: number }>>([]);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMerge, setSelectedMerge] = useState<{ source: string; target: string } | null>(null);
  const [showMergeConfirm, setShowMergeConfirm] = useState(false);
  const [showDeleteEmptyConfirm, setShowDeleteEmptyConfirm] = useState(false);
  const [mergeTargetMap, setMergeTargetMap] = useState<Record<number, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const categoryStats = await getCategoryStats();
      const duplicateCategories = await findDuplicateCategories();
      
      setStats(categoryStats.map(s => ({
        id: s.id,
        name: s.name,
        normalizedName: s.normalizedName,
        count: s.count,
      })));
      setDuplicates(duplicateCategories);
    } catch (error) {
      toast.error('Failed to load category data');
    } finally {
      setLoading(false);
    }
  };

  const handleMergeCategories = async () => {
    if (!selectedMerge) return;
    
    try {
      await mergeCategories(selectedMerge.source, selectedMerge.target);
      toast.success('Categories merged successfully');
      setShowMergeConfirm(false);
      setSelectedMerge(null);
      await loadData();
      onCleanupComplete();
    } catch (error) {
      toast.error('Failed to merge categories');
    }
  };

  const handleDeleteEmptyCategories = async () => {
    try {
      const deleted = await deleteEmptyCategories();
      toast.success(`Deleted ${deleted} empty categories`);
      setShowDeleteEmptyConfirm(false);
      await loadData();
      onCleanupComplete();
    } catch (error) {
      toast.error('Failed to delete empty categories');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading category data...</p>
      </div>
    );
  }

  const emptyCategories = stats.filter(s => s.count === 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Category Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Categories</p>
              <p className="text-2xl font-bold">{stats.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duplicates Found</p>
              <p className="text-2xl font-bold text-orange-600">{duplicates.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Empty Categories</p>
              <p className="text-2xl font-bold text-red-600">{emptyCategories.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {stats.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex-1">
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">{cat.count} words</p>
                </div>
                {cat.count === 0 && (
                  <Badge variant="destructive" className="ml-2">Empty</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Duplicate Categories */}
      {duplicates.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Duplicate Categories Found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {duplicates.map((group, idx) => (
              <div key={idx} className="space-y-2 p-3 bg-white rounded border border-orange-200">
                <p className="text-sm font-medium text-orange-900">
                  Normalized name: <code className="bg-orange-100 px-2 py-1 rounded">{group.normalizedName}</code>
                </p>
                <div className="space-y-2">
                  {group.categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.count} words</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {group.categories.length === 2 && (
                  <div className="flex gap-2 mt-3">
                    <Select value={mergeTargetMap[idx] || ''} onValueChange={(value) => setMergeTargetMap({...mergeTargetMap, [idx]: value})}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select target category" />
                      </SelectTrigger>
                      <SelectContent>
                        {group.categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            Keep: {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => {
                        const targetId = mergeTargetMap[idx];
                        if (!targetId) {
                          toast.error('Please select a target category');
                          return;
                        }
                        const sourceId = group.categories.find(c => c.id !== targetId)?.id;
                        if (sourceId) {
                          setSelectedMerge({ source: sourceId, target: targetId });
                          setShowMergeConfirm(true);
                        }
                      }}
                    >
                      <Merge className="w-4 h-4" />
                      Merge
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty Categories */}
      {emptyCategories.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Empty Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {emptyCategories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                  <p className="text-sm font-medium">{cat.name}</p>
                </div>
              ))}
            </div>
            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={() => setShowDeleteEmptyConfirm(true)}
            >
              <Trash2 className="w-4 h-4" />
              Delete All Empty Categories ({emptyCategories.length})
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Merge Confirmation Dialog */}
      <AlertDialog open={showMergeConfirm} onOpenChange={setShowMergeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Merge Categories?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move all vocabulary from the source category to the target category and delete the source category. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleMergeCategories} className="bg-orange-600 hover:bg-orange-700">
            Merge
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Empty Categories Confirmation Dialog */}
      <AlertDialog open={showDeleteEmptyConfirm} onOpenChange={setShowDeleteEmptyConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Empty Categories?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {emptyCategories.length} empty categories. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteEmptyCategories} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
