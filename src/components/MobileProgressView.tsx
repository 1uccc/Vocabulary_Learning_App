import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  BarChart3, 
  Clock, 
  Zap,
  Calendar,
  Award,
  Brain,
  Trophy
} from "lucide-react";
import { safeFirebaseService } from "../lib/firebase-service-wrapper";
import { Topic, Vocabulary, UserProgress } from "./RealFirebaseService";

interface MobileProgressViewProps {
  userId: string;
}

export function MobileProgressView({ userId }: MobileProgressViewProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const [topicsData, vocabulariesData, progressData, statsData] = await Promise.all([
        safeFirebaseService.getTopics(userId),
        safeFirebaseService.getVocabularies(userId),
        safeFirebaseService.getUserProgress(userId),
        safeFirebaseService.getLearningStats(userId, 30)
      ]);

      setTopics(topicsData);
      setVocabularies(vocabulariesData);
      setUserProgress(progressData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load progress data:', error);
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
    const totalCorrect = topicProgressData.reduce((sum, p) => sum + p.correctCount, 0);
    const totalIncorrect = topicProgressData.reduce((sum, p) => sum + p.incorrectCount, 0);
    const totalAttempts = totalCorrect + totalIncorrect;
    
    return {
      total: topicVocabs.length,
      learned,
      percentage: topicVocabs.length > 0 ? (learned / topicVocabs.length) * 100 : 0,
      accuracy: totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0
    };
  };

  const getProgressLevel = (percentage: number) => {
    if (percentage >= 90) return { label: "Thành thạo", color: "text-green-600", bg: "bg-green-100" };
    if (percentage >= 70) return { label: "Giỏi", color: "text-blue-600", bg: "bg-blue-100" };
    if (percentage >= 50) return { label: "Khá", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { label: "Cần cải thiện", color: "text-red-600", bg: "bg-red-100" };
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return "Siêu sao! 🌟";
    if (streak >= 14) return "Tuyệt vời! 🔥";
    if (streak >= 7) return "Tốt lắm! ⚡";
    if (streak >= 3) return "Tiếp tục! 💪";
    return "Bắt đầu thôi! 🚀";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const overallProgress = stats ? (stats.learnedWords / stats.totalWords) * 100 : 0;
  const level = getProgressLevel(overallProgress);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">Tiến độ học tập</h2>
        <div className="text-4xl mb-2">
          {overallProgress >= 90 ? "🏆" : overallProgress >= 70 ? "🎯" : overallProgress >= 50 ? "📚" : "🌱"}
        </div>
        <Badge className={`${level.bg} ${level.color} border-0`}>
          {level.label}
        </Badge>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-blue-100">
          <CardContent className="p-4 text-center">
            <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">
              {stats?.totalWords || 0}
            </div>
            <div className="text-sm text-muted-foreground">Tổng từ vựng</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {stats?.learnedWords || 0}
            </div>
            <div className="text-sm text-muted-foreground">Đã học</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-yellow-100">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-accent">
              {Math.round(stats?.averageAccuracy || 0)}%
            </div>
            <div className="text-sm text-muted-foreground">Độ chính xác</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {stats?.streak || 0}
            </div>
            <div className="text-sm text-muted-foreground">Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Tổng quan tiến độ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Hoàn thành</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Đã học:</span>
              <span className="font-medium text-green-600">{stats?.learnedWords || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Còn lại:</span>
              <span className="font-medium text-blue-600">
                {(stats?.totalWords || 0) - (stats?.learnedWords || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phiên học:</span>
              <span className="font-medium">{stats?.sessionsCount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Thời gian:</span>
              <span className="font-medium">
                {Math.floor((stats?.timeSpent || 0) / 60)}m
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak Card */}
      <Card className="bg-gradient-to-r from-orange-400 to-red-400 text-white">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-2">🔥</div>
          <div className="text-2xl font-bold mb-1">{stats?.streak || 0} ngày</div>
          <div className="text-orange-100 mb-2">Chuỗi học liên tiếp</div>
          <div className="text-sm font-medium">
            {getStreakMessage(stats?.streak || 0)}
          </div>
        </CardContent>
      </Card>

      {/* Topics Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Tiến độ theo chủ đề
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topics.map((topic) => {
            const progress = getTopicProgress(topic.id);
            const level = getProgressLevel(progress.percentage);
            
            return (
              <div
                key={topic.id}
                className="p-4 rounded-2xl border hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: topic.color }}
                    />
                    <h3 className="font-medium">{topic.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${level.bg} ${level.color} border-0 text-xs`}>
                      {level.label}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {progress.learned}/{progress.total}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Tiến độ: {Math.round(progress.percentage)}%</span>
                    <span>Độ chính xác: {Math.round(progress.accuracy)}%</span>
                  </div>
                  <Progress value={progress.percentage} className="h-2" />
                </div>
              </div>
            );
          })}
          
          {topics.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có chủ đề nào để theo dõi</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement & Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Thành tích & Lời khuyên
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Achievements */}
          <div className="grid grid-cols-3 gap-2">
            <div className={`p-3 rounded-xl text-center ${stats?.streak >= 7 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-xs font-medium">Streak 7</div>
            </div>
            <div className={`p-3 rounded-xl text-center ${stats?.learnedWords >= 50 ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <div className="text-2xl mb-1">📚</div>
              <div className="text-xs font-medium">50 từ</div>
            </div>
            <div className={`p-3 rounded-xl text-center ${stats?.averageAccuracy >= 80 ? 'bg-green-100' : 'bg-gray-100'}`}>
              <div className="text-2xl mb-1">🎯</div>
              <div className="text-xs font-medium">80% chính xác</div>
            </div>
          </div>

          {/* Tips */}
          <div className="space-y-2 text-sm">
            {stats?.averageAccuracy < 70 && (
              <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200">
                <p className="text-yellow-700">
                  💡 <strong>Mẹo:</strong> Hãy sử dụng Flashcard nhiều hơn để cải thiện độ chính xác trước khi làm Quiz.
                </p>
              </div>
            )}
            {overallProgress < 50 && (
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                <p className="text-blue-700">
                  📈 <strong>Mục tiêu:</strong> Hãy dành 15-20 phút mỗi ngày để học từ vựng đều đặn.
                </p>
              </div>
            )}
            {stats?.streak < 3 && (
              <div className="bg-orange-50 p-3 rounded-xl border border-orange-200">
                <p className="text-orange-700">
                  🔥 <strong>Thử thách:</strong> Hãy học liên tiếp 3 ngày để bắt đầu chuỗi streak của bạn!
                </p>
              </div>
            )}
            {overallProgress >= 80 && stats?.averageAccuracy >= 85 && (
              <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                <p className="text-green-700">
                  🏆 <strong>Xuất sắc!</strong> Bạn đang học rất tốt. Hãy tiếp tục duy trì!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}