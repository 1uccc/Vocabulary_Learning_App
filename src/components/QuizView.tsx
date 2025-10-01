import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";

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

interface QuizViewProps {
  vocabularies: VocabularyItem[];
  selectedCategory: string;
  onUpdateVocabulary: (vocabulary: VocabularyItem) => void;
}

interface QuizQuestion {
  question: VocabularyItem;
  options: string[];
  correctIndex: number;
}

export function QuizView({ vocabularies, selectedCategory, onUpdateVocabulary }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const filteredVocabularies = selectedCategory === "Tất cả"
    ? vocabularies
    : vocabularies.filter(v => v.category === selectedCategory);

  useEffect(() => {
    generateQuiz();
  }, [filteredVocabularies]);

  const generateQuiz = () => {
    if (filteredVocabularies.length < 2) return;

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
  };

  if (filteredVocabularies.length < 2) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            Cần ít nhất 2 từ vựng để bắt đầu quiz.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Đang tạo câu hỏi...</p>
            <Button onClick={generateQuiz}>Tạo Quiz</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    setShowResult(true);
    const isCorrect = selectedAnswer === currentQuestion.correctIndex;

    if (isCorrect) {
      setScore(prev => prev + 1);
      const updated = {
        ...currentQuestion.question,
        correctCount: currentQuestion.question.correctCount + 1,
        learned: true
      };
      onUpdateVocabulary(updated);
    } else {
      const updated = {
        ...currentQuestion.question,
        incorrectCount: currentQuestion.question.incorrectCount + 1
      };
      onUpdateVocabulary(updated);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">Quiz Hoàn Thành! 🎉</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl mb-4">
            {percentage >= 80 ? "🏆" : percentage >= 60 ? "🎯" : "📚"}
          </div>
          <div>
            <p>Điểm số: {score}/{questions.length}</p>
            <p>Tỷ lệ đúng: {percentage}%</p>
          </div>
          <Button onClick={generateQuiz} className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Làm Quiz Mới
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Quiz</CardTitle>
            <span className="text-sm text-muted-foreground">
              Câu {currentQuestionIndex + 1}/{questions.length}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">{currentQuestion.question.word}</h3>
            <p className="text-muted-foreground">Chọn nghĩa đúng:</p>
          </div>

          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === index ? "default" : "outline"}
                className={`w-full justify-start text-left h-auto p-3 ${
                  showResult
                    ? index === currentQuestion.correctIndex
                      ? "bg-green-100 border-green-500 text-green-700"
                      : selectedAnswer === index
                      ? "bg-red-100 border-red-500 text-red-700"
                      : ""
                    : ""
                }`}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
              >
                <div className="flex items-center gap-2">
                  {showResult && index === currentQuestion.correctIndex && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {showResult && selectedAnswer === index && index !== currentQuestion.correctIndex && (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span>{option}</span>
                </div>
              </Button>
            ))}
          </div>

          {!showResult ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="w-full"
            >
              Gửi đáp án
            </Button>
          ) : (
            <div className="space-y-4">
              {currentQuestion.question.example && (
                <div className="bg-muted p-3 rounded">
                  <p className="text-sm">
                    <strong>Ví dụ:</strong> {currentQuestion.question.example}
                  </p>
                </div>
              )}
              <Button onClick={handleNextQuestion} className="w-full">
                {currentQuestionIndex < questions.length - 1 ? "Câu tiếp theo" : "Hoàn thành"}
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Điểm hiện tại: {score}/{currentQuestionIndex + (showResult ? 1 : 0)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}