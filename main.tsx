import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { useEffect, useState } from "react";
import { initializeDB } from "./lib/db";
import LoadingScreen from "./components/LoadingScreen";
import { UpdatePrompt } from "./components/UpdatePrompt";
import { useServiceWorkerUpdate } from "./hooks/useServiceWorkerUpdate";
import { MeteorBackground } from "./components/MeteorBackground";
import { OfflineTranslationProvider } from "./contexts/OfflineTranslationContext";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Service Worker update checking
  useServiceWorkerUpdate({
    onUpdateAvailable: () => {
      console.log('[App] Update available');
    },
    onUpdateActivated: () => {
      console.log('[App] Update activated');
    },
    checkInterval: 60000 // Check every 60 seconds
  });

  useEffect(() => {
    const initDB = async () => {
      try {
        await initializeDB();
        setDbReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize database');
        setDbReady(true); // Still show app even if DB fails
      }
    };

    initDB();
  }, []);

  if (!dbReady) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <OfflineTranslationProvider>
        <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <MeteorBackground />
          <Toaster />
          <UpdatePrompt />
          {error && (
            <div className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground p-4 z-50">
              <p className="text-sm">Database initialization warning: {error}</p>
            </div>
          )}
          <Router />
        </TooltipProvider>
      </ThemeProvider>
      </OfflineTranslationProvider>
    </ErrorBoundary>
  );
}

export default App;
