export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-block">
            <div className="w-16 h-16 rounded-full border-4 border-accent/20 border-t-accent animate-spin"></div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">VocabLearn</h1>
        <p className="text-muted-foreground">Initializing your learning space...</p>
      </div>
    </div>
  );
}
