import { useEffect, useState } from 'react';
import { Button } from "./button.tsx"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RefreshCw, Zap } from 'lucide-react';

interface UpdatePromptProps {
  onUpdate?: () => void;
}

/**
 * UpdatePrompt Component
 * Displays an elegant update notification when a new version is available
 * Follows the premium dark-themed design of VocabLearn
 */
export function UpdatePrompt({ onUpdate }: UpdatePromptProps) {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Listen for Service Worker update available event
    const handleSWUpdateAvailable = () => {
      console.log('[UpdatePrompt] New version available');
      setShowUpdate(true);
    };

    window.addEventListener('sw-update-available', handleSWUpdateAvailable);

    // Also listen for controller change (new SW taking over)
    const handleControllerChange = () => {
      console.log('[UpdatePrompt] Service Worker controller changed');
      // Auto-reload after a short delay to ensure new SW is ready
      setTimeout(() => {
        window.location.reload();
      }, 500);
    };

    navigator.serviceWorker?.addEventListener('controllerchange', handleControllerChange);

    return () => {
      window.removeEventListener('sw-update-available', handleSWUpdateAvailable);
      navigator.serviceWorker?.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    console.log('[UpdatePrompt] User confirmed update');

    try {
      // Signal Service Worker to skip waiting
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SKIP_WAITING'
        });
      }

      // Call optional callback
      onUpdate?.();

      // The page will reload automatically when the new SW takes control
      // via the controllerchange event listener
    } catch (err) {
      console.error('[UpdatePrompt] Update failed:', err);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    console.log('[UpdatePrompt] User dismissed update');
    setShowUpdate(false);
  };

  return (
    <Dialog open={showUpdate} onOpenChange={setShowUpdate}>
      <DialogContent className="sm:max-w-md border-0 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        <DialogHeader className="space-y-3">
          {/* Icon with animation */}
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-lg opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full p-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <DialogTitle className="text-center text-xl font-bold text-white">
            有新版本可用
          </DialogTitle>

          <DialogDescription className="text-center text-slate-300 text-sm leading-relaxed">
            VocabLearn 已更新，新版本包含改進的功能和更好的體驗。立即更新以獲得最新版本。
          </DialogDescription>
        </DialogHeader>

        {/* Feature highlights */}
        <div className="space-y-2 py-4 px-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <RefreshCw className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>自動快取更新</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>更快的載入速度</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <RefreshCw className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>改進的離線支援</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleDismiss}
            disabled={isUpdating}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white border-slate-600 hover:border-slate-500 disabled:opacity-50"
          >
            稍後再說
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold disabled:opacity-50 transition-all"
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                更新中...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                立即更新
              </>
            )}
          </Button>
        </div>

        {/* Footer note */}
        <p className="text-xs text-slate-400 text-center mt-4">
          更新後頁面會自動重新載入，您的學習進度已安全保存。
        </p>
      </DialogContent>
    </Dialog>
  );
}
