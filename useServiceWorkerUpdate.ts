import { useEffect, useCallback, useRef } from 'react';

interface UseServiceWorkerUpdateOptions {
  onUpdateAvailable?: () => void;
  onUpdateActivated?: () => void;
  checkInterval?: number; // milliseconds, default 60000 (1 minute)
}

/**
 * Hook to manage Service Worker updates
 * Provides automatic and manual update checking with callbacks
 */
export function useServiceWorkerUpdate({
  onUpdateAvailable,
  onUpdateActivated,
  checkInterval = 60000
}: UseServiceWorkerUpdateOptions = {}) {
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Manual update check function
  const checkForUpdate = useCallback(async () => {
    if (!registrationRef.current) {
      console.warn('[useServiceWorkerUpdate] No SW registration available');
      return;
    }

    try {
      console.log('[useServiceWorkerUpdate] Checking for updates...');
      await registrationRef.current.update();
      console.log('[useServiceWorkerUpdate] Update check completed');
    } catch (err) {
      console.error('[useServiceWorkerUpdate] Update check failed:', err);
    }
  }, []);

  // Skip waiting - force new SW to activate immediately
  const skipWaiting = useCallback(() => {
    if (registrationRef.current?.waiting) {
      console.log('[useServiceWorkerUpdate] Sending SKIP_WAITING to SW');
      registrationRef.current.waiting.postMessage({
        type: 'SKIP_WAITING'
      });
    }
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.warn('[useServiceWorkerUpdate] Service Worker not supported');
      return;
    }

    // Get current registration
    navigator.serviceWorker.ready.then((registration) => {
      registrationRef.current = registration;
      console.log('[useServiceWorkerUpdate] Got SW registration');

      // Listen for waiting state (new SW installed but not activated)
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('[useServiceWorkerUpdate] New SW found');

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if ((newWorker.state as string) === 'waiting' && navigator.serviceWorker.controller) {
              // New SW is waiting, old one still active
              console.log('[useServiceWorkerUpdate] New SW waiting, old one still active');
              onUpdateAvailable?.();
            }
          });
        }
      });

      // Initial update check
      checkForUpdate();
    });

    // Set up periodic update checks
    checkIntervalRef.current = setInterval(() => {
      checkForUpdate();
    }, checkInterval);

    // Listen for controller change (new SW activated)
    const handleControllerChange = () => {
      console.log('[useServiceWorkerUpdate] SW controller changed - new version activated');
      onUpdateActivated?.();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // Cleanup
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, [checkForUpdate, onUpdateAvailable, onUpdateActivated, checkInterval]);

  return {
    checkForUpdate,
    skipWaiting,
    registration: registrationRef.current
  };
}
