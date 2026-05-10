import React from 'react';
// 修正處：路徑扁平化
import { type VocabularyEntry } from './db.ts';
// 修正處：圖表套件已在 package.json 補齊，路徑不變
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie 
} from 'recharts';
// 修正處：UI 組件使用我們在根目錄建立的或自定義的
import { Card, CardContent, CardHeader, CardTitle } from './VocabularyLibrary.tsx'; 
import { Button } from './button.tsx';
import { Calendar, TrendingUp, Award, Clock } from 'lucide-react';

interface ProgressDashboardProps {
  vocabulary: VocabularyEntry[];
  stats: {
    totalWords: number;
    learnedWords: number;
    reviewedToday: number;
    averageMastery: number;
    percentageLearned: number;
  };
  onStartPractice?: (wordIds: string[]) => void;
}

export default function ProgressDashboard({ vocabulary, stats, onStartPractice }: ProgressDashboardProps) {
  const [weeklySessions, setWeeklySessions] = useState<StudySession[]>([]);
  const [totalStudyTime, setTotalStudyTime] = useState(0);

  useEffect(() => {
    const loadWeeklyData = async () => {
      try {
        const sessions = await getWeeklySessionsData();
        setWeeklySessions(sessions);
        const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        setTotalStudyTime(totalTime);
      } catch (error) {
        console.error('Failed to load weekly sessions:', error);
      }
    };
    loadWeeklyData();
  }, []);

  // Calculate additional stats
  const masteredWords = vocabulary.filter(v => v.mastery >= 80).length;
  const learningWords = vocabulary.filter(v => v.mastery >= 40 && v.mastery < 80).length;
  const newWords = vocabulary.filter(v => v.mastery < 40).length;
  const totalReviews = vocabulary.reduce((sum, v) => sum + (v.reviewCount || 0), 0);
  const averageReviewsPerWord = vocabulary.length > 0 ? Math.round(totalReviews / vocabulary.length) : 0;
  
  // Calculate daily progress trend from real session data
  const getDailyTrend = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const trendData = days.map((day, index) => {
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() - (6 - index));
      dayDate.setHours(0, 0, 0, 0);
      const dayTimestamp = dayDate.getTime();
      const nextDayTimestamp = dayTimestamp + 24 * 60 * 60 * 1000;
      
      const sessionsForDay = weeklySessions.filter(
        s => s.date >= dayTimestamp && s.date < nextDayTimestamp
      );
      const totalSessions = sessionsForDay.length;
      const totalWords = sessionsForDay.reduce((sum, s) => sum + (s.wordsStudied || 0), 0);
      
      return {
        day,
        sessions: totalSessions,
        words: totalWords,
        time: Math.round(sessionsForDay.reduce((sum, s) => sum + (s.duration || 0), 0) / 60),
      };
    });
    return trendData;
  };

  const dailyTrend = getDailyTrend();

  // Prepare mastery distribution data
  const masteryDistribution = [
    { range: '0-20%', count: vocabulary.filter(v => v.mastery < 20).length },
    { range: '20-40%', count: vocabulary.filter(v => v.mastery >= 20 && v.mastery < 40).length },
    { range: '40-60%', count: vocabulary.filter(v => v.mastery >= 40 && v.mastery < 60).length },
    { range: '60-80%', count: vocabulary.filter(v => v.mastery >= 60 && v.mastery < 80).length },
    { range: '80-100%', count: vocabulary.filter(v => v.mastery >= 80).length },
  ];

  // Prepare category distribution data
  const categoryMap = new Map<string, number>();
  vocabulary.forEach(v => {
    categoryMap.set(v.category, (categoryMap.get(v.category) || 0) + 1);
  });
  const categoryDistribution = Array.from(categoryMap.entries()).map(([name, count]) => ({
    name,
    value: count,
  }));

  const COLORS = [
    'oklch(0.5 0.15 150)',
    'oklch(0.55 0.12 200)',
    'oklch(0.6 0.12 280)',
    'oklch(0.65 0.1 25)',
    'oklch(0.58 0.12 40)',
    'oklch(0.52 0.1 120)',
    'oklch(0.62 0.12 350)',
    'oklch(0.6 0.1 280)',
  ];

  return (
    <div className="space-y-6">
      {/* Today's Review Plan */}
      <TodayReviewPlan vocabulary={vocabulary} onStartPractice={onStartPractice} />
      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Words</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalWords}</p>
              </div>
              <BookOpen className="w-5 h-5 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Learned</p>
                <p className="text-2xl font-bold text-accent">{stats.learnedWords}</p>
                <p className="text-xs text-muted-foreground">{stats.percentageLearned}%</p>
              </div>
              <Zap className="w-5 h-5 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Reviewed Today</p>
                <p className="text-2xl font-bold text-foreground">{stats.reviewedToday}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Avg Mastery</p>
                <p className="text-2xl font-bold text-foreground">{stats.averageMastery}%</p>
              </div>
              <Target className="w-5 h-5 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mastery Level Breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Mastered</p>
                <p className="text-2xl font-bold text-green-600">{masteredWords}</p>
                <p className="text-xs text-muted-foreground">80-100%</p>
              </div>
              <Award className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Learning</p>
                <p className="text-2xl font-bold text-blue-600">{learningWords}</p>
                <p className="text-xs text-muted-foreground">40-80%</p>
              </div>
              <Flame className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">New</p>
                <p className="text-2xl font-bold text-orange-600">{newWords}</p>
                <p className="text-xs text-muted-foreground">0-40%</p>
              </div>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Statistics */}
      <Card className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
        <CardHeader>
          <CardTitle className="text-lg">Review Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Reviews</p>
              <p className="text-3xl font-bold text-accent">{totalReviews}</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Avg Reviews/Word</p>
              <p className="text-3xl font-bold text-accent">{averageReviewsPerWord}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity Trend */}
      <Card className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Total Sessions</p>
              <p className="text-2xl font-bold text-accent">{weeklySessions.length}</p>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Total Study Time</p>
              <p className="text-2xl font-bold text-accent">{Math.round(totalStudyTime / 60)}m</p>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Avg per Session</p>
              <p className="text-2xl font-bold text-accent">{weeklySessions.length > 0 ? Math.round(totalStudyTime / weeklySessions.length / 60) : 0}m</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  color: 'var(--foreground)',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
                formatter={(value, name) => {
                  if (name === 'sessions') return [value, 'Practice Sessions'];
                  if (name === 'words') return [value, 'Words Studied'];
                  if (name === 'time') return [value + ' min', 'Study Time'];
                  return value;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke="var(--accent)" 
                strokeWidth={2}
                dot={{ fill: 'var(--accent)', r: 4 }}
                activeDot={{ r: 6 }}
                name="Practice Sessions"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Mastery Distribution */}
      <Card className="animate-fade-in" style={{ animationDelay: '0.9s' }}>
        <CardHeader>
          <CardTitle className="text-lg">Mastery Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={masteryDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="range" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  color: 'var(--foreground)',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Bar dataKey="count" fill="var(--accent)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      {categoryDistribution.length > 0 && (
        <Card className="animate-fade-in" style={{ animationDelay: '1s' }}>
          <CardHeader>
            <CardTitle className="text-lg">Words by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => {
                    const truncatedName = name.length > 12 ? name.substring(0, 10) + '...' : name;
                    return `${truncatedName}: ${value}`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    maxWidth: '200px',
                    wordWrap: 'break-word',
                    color: 'var(--foreground)',
                  }}
                  labelStyle={{ color: 'var(--foreground)' }}
                  formatter={(value, name, props) => {
                    return [value, props.payload.name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-xs text-muted-foreground space-y-1">
              {categoryDistribution.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="truncate">{cat.name}: {cat.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
