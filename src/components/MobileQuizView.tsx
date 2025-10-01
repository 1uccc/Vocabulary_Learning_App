import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Trophy,
  Target,
  Clock,
  Zap
} from "lucide-react";
import { safeFirebaseService } from "../lib/firebase-service-wrapper";
import { Topic, Vocabulary } from "./RealFirebaseService";

interface QuizQuestion {
  question: Vocabulary;
  options: string[];
  correctIndex: number;
}

interface MobileQuizViewProps {
  selectedTopicId?: string;
  userId: string;
}

export function MobileQuizView({ selectedTopicId, userId }: MobileQuizViewProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>(selectedTopicId || "all");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTopicId) {
      setSelectedTopic(selectedTopicId);
    }
  }, [selectedTopicId]);

  useEffect(() => {
    if (vocabularies.length > 0) {
      generateQuiz();
    }
  }, [vocabularies, selectedTopic]);

  const loadData = async () => {
    try {
      const [topicsData, vocabulariesData] = await Promise.all([
        safeFirebaseService.getTopics(userId),
        safeFirebaseService.getVocabularies(userId)
      ]);

      setTopics(topicsData);
      setVocabularies(vocabulariesData);
    } catch (error) {
      console.error('Failed to load quiz data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = () => {
    const filteredVocabularies = selectedTopic === "all"
      ? vocabularies
      : vocabularies.filter(v => v.topicId === selectedTopic);

    if (filteredVocabularies.length < 4) return;

    const shuffled = [...filteredVocabularies].sort(() => Math.random() - 0.5);
    const quizQuestions: QuizQuestion[] = [];

    for (let i = 0; i < Math.min(10, shuffled.length); i++) {
      const question = shuffled[i];
      const wrongOptions = filteredVocabularies
        .filter(v => v.id !== question.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(v => v.meaning);

      const correctIndex = Math.floor(Math.random() * 4);
      const options = [...wrongOptions];
      options.splice(correctIndex, 0, question.meaning);

      quizQuestions.push({
        question,
        options,
        correctIndex
      });
    }

    setQuestions(quizQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
    setStartTime(new Date());
  };

  const handleTopicChange = (topicId: string) => {
    setSelectedTopic(topicId);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;

    setShowResult(true);
    const isCorrect = selectedAnswer === currentQuestion.correctIndex;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Update progress
    try {
      await safeFirebaseService.updateProgress(userId, currentQuestion.question.id, isCorrect);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    setQuizCompleted(true);
    
    // Save quiz session
    if (startTime) {
      try {
        await safeFirebaseService.saveLearningSession({
          userId: userId,
          topicId: selectedTopic === "all" ? "" : selectedTopic,
          type: 'quiz',
          score: (score / questions.length) * 100,
          totalQuestions: questions.length,
          timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
          startedAt: startTime,
          completedAt: new Date()
        });
      } catch (error) {
        console.error('Failed to save quiz session:', error);
      }
    }
  };

  const filteredVocabularies = selectedTopic === "all"
    ? vocabularies
    : vocabularies.filter(v => v.topicId === selectedTopic);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (filteredVocabularies.length < 4) {
    return (
      <div className="space-y-4 pb-20">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Quiz</h2>
          <Select value={selectedTopic} onValueChange={handleTopicChange}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn chủ đề" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chủ đề</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Card className="h-64">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Cần ít nhất 4 từ vựng để bắt đầu quiz
              </p>
              <Button variant="outline">Thêm từ vựng</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-4 pb-20">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Quiz</h2>
          <Select value={selectedTopic} onValueChange={handleTopicChange}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn chủ đề" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chủ đề</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Card className="h-64">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Đang tạo câu hỏi...</p>
              <Button onClick={generateQuiz}>Tạo Quiz</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    const timeSpent = startTime ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000) : 0;
    
    return (
      <div className="space-y-4 pb-20">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Quiz</h2>
          <Select value={selectedTopic} onValueChange={handleTopicChange}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn chủ đề" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chủ đề</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-accent to-yellow-400 rounded-full flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl">Quiz Hoàn Thành! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-6xl mb-4">
              {percentage >= 90 ? "🏆" : percentage >= 70 ? "🎯" : percentage >= 50 ? "📚" : "💪"}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/10 p-4 rounded-2xl">
                <div className="text-2xl font-bold text-primary">{percentage}%</div>
                <div className="text-sm text-muted-foreground">Điểm số</div>
              </div>
              <div className="bg-accent/10 p-4 rounded-2xl">
                <div className="text-2xl font-bold text-accent">{score}/{questions.length}</div>
                <div className="text-sm text-muted-foreground">Câu đúng</div>
              </div>
              <div className="bg-green-100 p-4 rounded-2xl">
                <div className="text-2xl font-bold text-green-600">
                  <Clock className="h-5 w-5 inline mr-1" />
                  {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-muted-foreground">Thời gian</div>
              </div>
              <div className="bg-purple-100 p-4 rounded-2xl">
                <div className="text-2xl font-bold text-purple-600">
                  <Zap className="h-5 w-5 inline mr-1" />
                  +{score}
                </div>
                <div className="text-sm text-muted-foreground">Exp</div>
              </div>
            </div>

            <div className="text-center">
              {percentage >= 90 && (
                <p className="text-green-600 font-medium">Xuất sắc! Bạn đã thành thạo!</p>
              )}
              {percentage >= 70 && percentage < 90 && (
                <p className="text-blue-600 font-medium">Tốt lắm! Tiếp tục cố gắng!</p>
              )}
              {percentage >= 50 && percentage < 70 && (
                <p className="text-yellow-600 font-medium">Khá tốt! Hãy ôn tập thêm!</p>
              )}
              {percentage < 50 && (
                <p className="text-red-600 font-medium">Cần cải thiện! Hãy học thêm với Flashcard!</p>
              )}
            </div>
            
            <Button onClick={generateQuiz} className="w-full bg-primary hover:bg-blue-600">
              <RotateCcw className="h-4 w-4 mr-2" />
              Làm Quiz Mới
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Quiz</h2>
          <Badge variant="outline">
            {currentQuestionIndex + 1}/{questions.length}
          </Badge>
        </div>
        
        <Select value={selectedTopic} onValueChange={handleTopicChange}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn chủ đề" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả chủ đề</SelectItem>
            {topics.map((topic) => (
              <SelectItem key={topic.id} value={topic.id}>
                {topic.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="min-h-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            Nghĩa của từ "{currentQuestion.question.word}" là gì?
          </CardTitle>
          {currentQuestion.question.example && !showResult && (
            <div className="bg-muted/50 p-3 rounded-xl mt-4">
              <p className="text-sm text-muted-foreground italic">
                Ví dụ: "{currentQuestion.question.example}"
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedAnswer === index ? "default" : "outline"}
              className={`w-full justify-start text-left h-auto p-4 text-wrap ${
                showResult
                  ? index === currentQuestion.correctIndex
                    ? "bg-green-100 border-green-500 text-green-700 hover:bg-green-100"
                    : selectedAnswer === index && index !== currentQuestion.correctIndex
                    ? "bg-red-100 border-red-500 text-red-700 hover:bg-red-100"
                    : "opacity-60"
                  : selectedAnswer === index
                  ? "bg-primary text-white"
                  : "hover:bg-muted"
              }`}
              onClick={() => handleAnswerSelect(index)}
              disabled={showResult}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                  showResult && index === currentQuestion.correctIndex
                    ? "bg-green-500 border-green-500 text-white"
                    : showResult && selectedAnswer === index && index !== currentQuestion.correctIndex
                    ? "bg-red-500 border-red-500 text-white"
                    : selectedAnswer === index
                    ? "bg-primary border-primary text-white"
                    : "border-muted-foreground"
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="flex-1">{option}</span>
                {showResult && index === currentQuestion.correctIndex && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {showResult && selectedAnswer === index && index !== currentQuestion.correctIndex && (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Action Button */}
      {!showResult ? (
        <Button
          onClick={handleSubmitAnswer}
          disabled={selectedAnswer === null}
          className="w-full bg-accent hover:bg-yellow-500 text-white"
          size="lg"
        >
          <Target className="h-4 w-4 mr-2" />
          Xác nhận đáp án
        </Button>
      ) : (
        <div className="space-y-4">
          {currentQuestion.question.example && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm">
                  <strong>Ví dụ:</strong> {currentQuestion.question.example}
                </p>
              </CardContent>
            </Card>
          )}
          <Button onClick={handleNextQuestion} className="w-full" size="lg">
            {currentQuestionIndex < questions.length - 1 ? "Câu tiếp theo" : "Hoàn thành Quiz"}
          </Button>
        </div>
      )}

      {/* Score Display */}
      <div className="text-center text-sm text-muted-foreground">
        Điểm hiện tại: {score}/{currentQuestionIndex + (showResult ? 1 : 0)}
      </div>
    </div>
  );
}