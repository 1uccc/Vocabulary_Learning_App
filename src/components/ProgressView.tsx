import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { BarChart3, Target, TrendingUp, BookOpen } from "lucide-react";

interface VocabularyItem {
  id: string;
  word: string;
  meaning: string;
  example: string;
  category: string;
  learned: boolean;
  correctCount: number;
  incorrectCount: number;
}

interface ProgressViewProps {
  vocabularies: VocabularyItem[];
}

export function ProgressView({ vocabularies }: ProgressViewProps) {
  const stats = useMemo(() => {
    const totalWords = vocabularies.length;
    const learnedWords = vocabularies.filter(v => v.learned).length;
    const totalCorrect = vocabularies.reduce((sum, v) => sum + v.correctCount, 0);
    const totalIncorrect = vocabularies.reduce((sum, v) => sum + v.incorrectCount, 0);
    const totalAttempts = totalCorrect + totalIncorrect;
    
    const categoryStats = vocabularies.reduce((acc, v) => {
      if (!acc[v.category]) {
        acc[v.category] = {
          total: 0,
          learned: 0,
          correct: 0,
          incorrect: 0
        };
      }
      acc[v.category].total++;
      if (v.learned) acc[v.category].learned++;
      acc[v.category].correct += v.correctCount;
      acc[v.category].incorrect += v.incorrectCount;
      return acc;
    }, {} as Record<string, { total: number; learned: number; correct: number; incorrect: number }>);

    return {
      totalWords,
      learnedWords,
      totalCorrect,
      totalIncorrect,
      totalAttempts,
      learningProgress: totalWords > 0 ? (learnedWords / totalWords) * 100 : 0,
      accuracy: totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0,
      categoryStats
    };
  }, [vocabularies]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 90) return <Badge className="bg-green-100 text-green-800">Xuất sắc</Badge>;
    if (accuracy >= 75) return <Badge className="bg-blue-100 text-blue-800">Tốt</Badge>;
    if (accuracy >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Trung bình</Badge>;
    return <Badge className="bg-red-100 text-red-800">Cần cải thiện</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Tổng quan */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalWords}</p>
                <p className="text-xs text-muted-foreground">Tổng từ vựng</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.learnedWords}</p>
                <p className="text-xs text-muted-foreground">Đã học</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.accuracy)}%</p>
                <p className="text-xs text-muted-foreground">Độ chính xác</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalAttempts}</p>
                <p className="text-xs text-muted-foreground">Lượt thử</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tiến độ học tập */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Tiến độ học tập</span>
            {getAccuracyBadge(stats.accuracy)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Tiến độ hoàn thành</span>
              <span>{Math.round(stats.learningProgress)}%</span>
            </div>
            <Progress 
              value={stats.learningProgress} 
              className="h-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span>Trả lời đúng:</span>
              <span className="text-green-600 font-medium">{stats.totalCorrect}</span>
            </div>
            <div className="flex justify-between">
              <span>Trả lời sai:</span>
              <span className="text-red-600 font-medium">{stats.totalIncorrect}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thống kê theo danh mục */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê theo danh mục</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(stats.categoryStats).map(([category, categoryData]) => {
            const categoryProgress = (categoryData.learned / categoryData.total) * 100;
            const categoryAccuracy = categoryData.correct + categoryData.incorrect > 0
              ? (categoryData.correct / (categoryData.correct + categoryData.incorrect)) * 100
              : 0;

            return (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{category}</h4>
                  <Badge variant="outline">
                    {categoryData.learned}/{categoryData.total}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Tiến độ: {Math.round(categoryProgress)}%</span>
                    <span>Độ chính xác: {Math.round(categoryAccuracy)}%</span>
                  </div>
                  <Progress 
                    value={categoryProgress} 
                    className="h-1"
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Gợi ý cải thiện */}
      <Card>
        <CardHeader>
          <CardTitle>Gợi ý cải thiện</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {stats.accuracy < 70 && (
              <p className="text-yellow-600">
                💡 Độ chính xác còn thấp. Hãy ôn tập thêm với Flashcard trước khi làm Quiz.
              </p>
            )}
            {stats.learningProgress < 50 && (
              <p className="text-blue-600">
                📚 Bạn vẫn còn nhiều từ vựng chưa học. Hãy dành thời gian học đều đặn mỗi ngày.
              </p>
            )}
            {stats.totalAttempts < 20 && (
              <p className="text-purple-600">
                🎯 Hãy thực hành nhiều hơn với Quiz để cải thiện kỹ năng ghi nhớ.
              </p>
            )}
            {stats.accuracy >= 90 && stats.learningProgress >= 80 && (
              <p className="text-green-600">
                🏆 Xuất sắc! Bạn đang học rất tốt. Hãy tiếp tục duy trì!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}