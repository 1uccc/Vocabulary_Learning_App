import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Eye, 
  EyeOff,
  Volume2,
  Heart,
  X,
  Check
} from "lucide-react";
import { safeFirebaseService } from "../lib/firebase-service-wrapper";
import { Topic, Vocabulary, UserProgress } from "./RealFirebaseService";

interface MobileFlashcardViewProps {
  selectedTopicId?: string;
  userId: string;
}

export function MobileFlashcardView({ selectedTopicId, userId }: MobileFlashcardViewProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>(selectedTopicId || "all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTopicId) {
      setSelectedTopic(selectedTopicId);
    }
  }, [selectedTopicId]);

  const loadData = async () => {
    try {
      const [topicsData, vocabulariesData] = await Promise.all([
        safeFirebaseService.getTopics(userId),
        safeFirebaseService.getVocabularies(userId)
      ]);

      setTopics(topicsData);
      setVocabularies(vocabulariesData);
    } catch (error) {
      console.error('Failed to load flashcard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVocabularies = selectedTopic === "all"
    ? vocabularies
    : vocabularies.filter(v => v.topicId === selectedTopic);

  const currentVocabulary = filteredVocabularies[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredVocabularies.length);
    setShowMeaning(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredVocabularies.length) % filteredVocabularies.length);
    setShowMeaning(false);
  };

  const handleTopicChange = (topicId: string) => {
    setSelectedTopic(topicId);
    setCurrentIndex(0);
    setShowMeaning(false);
  };

  const handleAnswer = async (isCorrect: boolean) => {
    if (!currentVocabulary) return;
    
    try {
      await safeFirebaseService.updateProgress(userId, currentVocabulary.id, isCorrect);
      handleNext();
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setShowMeaning(false);
  };

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (filteredVocabularies.length === 0) {
    return (
      <div className="space-y-4 pb-20">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Flashcard</h2>
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
              <p className="text-muted-foreground mb-4">
                Không có từ vựng nào trong chủ đề này
              </p>
              <Button variant="outline">Thêm từ vựng</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / filteredVocabularies.length) * 100;

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Flashcard</h2>
          <Badge variant="outline">
            {currentIndex + 1} / {filteredVocabularies.length}
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

      {/* Flashcard */}
      <Card className="min-h-[300px] relative overflow-hidden">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2">
            <CardTitle className="text-2xl font-bold text-primary">
              {currentVocabulary.word}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => speakWord(currentVocabulary.word)}
              className="text-primary hover:text-primary/80"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
          {currentVocabulary.pronunciation && (
            <p className="text-sm text-muted-foreground">
              [{currentVocabulary.pronunciation}]
            </p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {showMeaning ? (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">{currentVocabulary.meaning}</p>
                {currentVocabulary.example && (
                  <div className="bg-muted/50 p-3 rounded-xl">
                    <p className="text-sm text-muted-foreground italic">
                      "{currentVocabulary.example}"
                    </p>
                  </div>
                )}
              </div>
              
              {/* Answer Buttons */}
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleAnswer(false)}
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <X className="h-5 w-5 mr-2" />
                  Chưa nhớ
                </Button>
                <Button
                  size="lg"
                  onClick={() => handleAnswer(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-5 w-5 mr-2" />
                  Đã nhớ
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-6">
                Bạn có nhớ nghĩa của từ này không?
              </p>
              <Button
                onClick={() => setShowMeaning(true)}
                size="lg"
                className="bg-accent hover:bg-yellow-500 text-white"
              >
                <Eye className="h-5 w-5 mr-2" />
                Xem nghĩa
              </Button>
            </div>
          )}
        </CardContent>
        
        {/* Topic Badge */}
        <div className="absolute top-4 right-4">
          <Badge 
            variant="outline"
            style={{ 
              backgroundColor: topics.find(t => t.id === currentVocabulary.topicId)?.color + '20',
              borderColor: topics.find(t => t.id === currentVocabulary.topicId)?.color,
              color: topics.find(t => t.id === currentVocabulary.topicId)?.color
            }}
          >
            {topics.find(t => t.id === currentVocabulary.topicId)?.name}
          </Badge>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={filteredVocabularies.length <= 1}
          className="flex-1 mr-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Trước
        </Button>
        
        <Button
          variant="outline"
          onClick={handleReset}
          className="mx-2"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={filteredVocabularies.length <= 1}
          className="flex-1 ml-2"
        >
          Sau
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}