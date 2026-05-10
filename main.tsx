import { Route, Switch } from "wouter";
import { ThemeProvider } from "./ThemeContext.tsx";
import Home from "./Home.tsx";
import { useEffect, useState } from "react";
import { initializeDB } from "./db.ts";
import LoadingScreen from "./LoadingScreen.tsx";
import { UpdatePrompt } from "./UpdatePrompt.tsx";
import { useServiceWorkerUpdate } from "./useServiceWorkerUpdate.ts";
import { MeteorBackground } from "./MeteorBackground.tsx";
import { OfflineTranslationProvider } from "./OfflineTranslationContext.tsx";

const NotFound = () => <div className="p-4"><h1>404 - Not Found</h1></div>;

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initializeDB().then(() => setDbReady(true)).catch(() => setDbReady(true));
  }, []);

  if (!dbReady) return <LoadingScreen />;

  return (
    <OfflineTranslationProvider>
      <ThemeProvider defaultTheme="light">
        <MeteorBackground />
        <UpdatePrompt />
        <Router />
      </ThemeProvider>
    </OfflineTranslationProvider>
  );
}

export default App;
