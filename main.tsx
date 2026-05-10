import { Toaster } from "./sonner.tsx"; // 假設 sonner 在根目錄
import { TooltipProvider } from "./tooltip.tsx"; // 假設 tooltip 在根目錄
// import NotFound from "./NotFound.tsx"; // 如果你有這個檔案請開啟
import { Route, Switch } from "wouter";
import ErrorBoundary from "./ErrorBoundary.tsx";
import { ThemeProvider } from "./ThemeContext.tsx";
import Home from "./Home.tsx";
import { useEffect, useState } from "react";
import { initializeDB } from "./db.ts";
import LoadingScreen from "./LoadingScreen.tsx";
import { UpdatePrompt } from "./UpdatePrompt.tsx";
import { useServiceWorkerUpdate } from "./useServiceWorkerUpdate.ts";
import { MeteorBackground } from "./MeteorBackground.tsx";
import { OfflineTranslationProvider } from "./OfflineTranslationContext.tsx";

// 暫時定義一個簡易的 NotFound，防止報錯
const NotFound = () => (
  <div className="flex items-center justify-center h-screen">
    <h1>404 - Page Not Found</h1>
  </div>
);

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useServiceWorkerUpdate({
    onUpdateAvailable: () => {
      console.log('[App] Update available');
    },
    onUpdateActivated: () => {
      console.log('[App] Update activated');
    },
    checkInterval: 60000 
  });

  useEffect(() => {
    const initDB = async () => {
      try {
        await initializeDB();
        setDbReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize database');
        setDbReady(true); 
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
