import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  Brain, 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock, 
  Calendar,
  Play,
  BookOpen,
  Zap
} from "lucide-react";
import { safeFirebaseService } from "../lib/firebase-service-wrapper";
import { Topic, Vocabulary, UserProgress } from "./RealFirebaseService";

interface DashboardViewProps {
  onNavigate: (tab: string, topicId?: string) => void;
  userId: string;
}

export function DashboardView({ onNavigate, userId }: DashboardViewProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [topicsData, vocabulariesData, progressData, statsData] = await Promise.all([
        safeFirebaseService.getTopics(userId),
        safeFirebaseService.getVocabularies(userId),
        safeFirebaseService.getUserProgress(userId),
        safeFirebaseService.getLearningStats(userId)
      ]);

      setTopics(topicsData);
      setVocabularies(vocabulariesData);
      setUserProgress(progressData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopicProgress = (topicId: string) => {
    const topicVocabs = vocabularies.filter(v => v.topicId === topicId);
    const topicProgressData = userProgress.filter(p => 
      topicVocabs.some(v => v.id === p.vocabularyId)
    );
    const learned = topicProgressData.filter(p => p.learned).length;
    return {
      total: topicVocabs.length,
      learned,
      percentage: topicVocabs.length > 0 ? (learned / topicVocabs.length) * 100 : 0
    };
  };

  const todayProgress = {
    goal: 20,
    completed: stats?.sessionsCount || 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Today's Goal */}
      <Card className="bg-gradient-to-r from-accent to-yellow-400 text-white border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="h-5 w-5" />
            Mục tiêu hôm nay
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/90">Học {todayProgress.completed}/{todayProgress.goal} từ</span>
            <Badge className="bg-white/20 text-white border-0">
              {Math.round((todayProgress.completed / todayProgress.goal) * 100)}%
            </Badge>
          </div>
          <Progress 
            value={(todayProgress.completed / todayProgress.goal) * 100} 
            className="bg-white/20 [&>div]:bg-white"
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => onNavigate('flashcard')}
          className="h-20 bg-primary hover:bg-blue-600 flex-col gap-2 text-white"
        >
          <Brain className="h-6 w-6" />
          <span>Flashcard</span>
        </Button>
        <Button
          onClick={() => onNavigate('quiz')}
          className="h-20 bg-accent hover:bg-yellow-500 flex-col gap-2 text-white"
        >
          <Trophy className="h-6 w-6" />
          <span>Quiz</span>
        </Button>
      </div>

      {/* Learning Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {stats?.averageAccuracy.toFixed(0) || 0}%
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Độ chính xác
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent mb-1">
              {stats?.streak || 0}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Zap className="h-4 w-4" />
              Streak
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topics Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Tiến độ các chủ đề
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topics.map((topic) => {
            const progress = getTopicProgress(topic.id);
            return (
              <div
                key={topic.id}
                className="p-4 rounded-2xl border cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onNavigate('vocabulary', topic.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: topic.color }}
                    />
                    <h3 className="font-medium">{topic.name}</h3>
                  </div>
                  <Badge variant="outline">
                    {progress.learned}/{progress.total}
                  </Badge>
                </div>
                <Progress value={progress.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(progress.percentage)}% hoàn thành
                </p>
              </div>
            );
          })}
          
          {topics.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có chủ đề nào</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => onNavigate('vocabulary')}
              >
                Thêm từ vựng đầu tiên
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Hoạt động gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Học Flashcard</p>
                <p className="text-xs text-muted-foreground">5 phút trước</p>
              </div>
              <Badge variant="outline" className="text-xs">+10 từ</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                <Trophy className="h-4 w-4 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Hoàn thành Quiz</p>
                <p className="text-xs text-muted-foreground">1 giờ trước</p>
              </div>
              <Badge variant="outline" className="text-xs">85%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}