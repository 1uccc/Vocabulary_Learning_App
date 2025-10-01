import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";

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

interface VocabularyCardProps {
  vocabulary: VocabularyItem;
  onEdit: (vocabulary: VocabularyItem) => void;
  onDelete: (id: string) => void;
  isFlashcard?: boolean;
  showMeaning?: boolean;
  onToggleMeaning?: () => void;
}

export function VocabularyCard({ 
  vocabulary, 
  onEdit, 
  onDelete, 
  isFlashcard = false,
  showMeaning = true,
  onToggleMeaning 
}: VocabularyCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{vocabulary.word}</CardTitle>
          {!isFlashcard && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(vocabulary)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(vocabulary.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          {isFlashcard && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleMeaning}
            >
              {showMeaning ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showMeaning && (
          <>
            <div>
              <span className="font-medium">Nghĩa:</span>
              <p className="text-muted-foreground">{vocabulary.meaning}</p>
            </div>
            {vocabulary.example && (
              <div>
                <span className="font-medium">Ví dụ:</span>
                <p className="text-muted-foreground italic">{vocabulary.example}</p>
              </div>
            )}
          </>
        )}
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Danh mục: {vocabulary.category}</span>
          {!isFlashcard && (
            <span>
              Đúng: {vocabulary.correctCount} | Sai: {vocabulary.incorrectCount}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}