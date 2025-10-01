import { useState } from "react";
import { VocabularyCard } from "./VocabularyCard";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

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

interface FlashcardViewProps {
  vocabularies: VocabularyItem[];
  selectedCategory: string;
  onUpdateVocabulary: (vocabulary: VocabularyItem) => void;
}

export function FlashcardView({ vocabularies, selectedCategory, onUpdateVocabulary }: FlashcardViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);

  const filteredVocabularies = selectedCategory === "Tất cả"
    ? vocabularies
    : vocabularies.filter(v => v.category === selectedCategory);

  if (filteredVocabularies.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            Không có từ vựng nào trong danh mục này.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentVocabulary = filteredVocabularies[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredVocabularies.length);
    setShowMeaning(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredVocabularies.length) % filteredVocabularies.length);
    setShowMeaning(false);
  };

  const handleCorrect = () => {
    const updated = {
      ...currentVocabulary,
      correctCount: currentVocabulary.correctCount + 1,
      learned: true
    };
    onUpdateVocabulary(updated);
    handleNext();
  };

  const handleIncorrect = () => {
    const updated = {
      ...currentVocabulary,
      incorrectCount: currentVocabulary.incorrectCount + 1
    };
    onUpdateVocabulary(updated);
    handleNext();
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setShowMeaning(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Flashcard</span>
            <span className="text-sm font-normal text-muted-foreground">
              {currentIndex + 1} / {filteredVocabularies.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <VocabularyCard
            vocabulary={currentVocabulary}
            onEdit={() => {}}
            onDelete={() => {}}
            isFlashcard={true}
            showMeaning={showMeaning}
            onToggleMeaning={() => setShowMeaning(!showMeaning)}
          />
          
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={filteredVocabularies.length <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </Button>
            
            <Button
              variant="outline"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4" />
              Đặt lại
            </Button>
            
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={filteredVocabularies.length <= 1}
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {showMeaning && (
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={handleIncorrect}>
                Sai ❌
              </Button>
              <Button onClick={handleCorrect}>
                Đúng ✅
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}