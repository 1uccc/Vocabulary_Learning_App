import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Plus } from "lucide-react";

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

interface AddVocabularyDialogProps {
  onAdd: (vocabulary: Omit<VocabularyItem, 'id' | 'learned' | 'correctCount' | 'incorrectCount'>) => void;
  editVocabulary?: VocabularyItem | null;
  onEdit?: (vocabulary: VocabularyItem) => void;
  categories: string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddVocabularyDialog({ 
  onAdd, 
  editVocabulary, 
  onEdit, 
  categories, 
  isOpen, 
  onOpenChange 
}: AddVocabularyDialogProps) {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);

  useEffect(() => {
    if (editVocabulary) {
      setWord(editVocabulary.word);
      setMeaning(editVocabulary.meaning);
      setExample(editVocabulary.example);
      setCategory(editVocabulary.category);
    } else {
      resetForm();
    }
  }, [editVocabulary, isOpen]);

  const resetForm = () => {
    setWord("");
    setMeaning("");
    setExample("");
    setCategory("");
    setNewCategory("");
    setIsAddingNewCategory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = isAddingNewCategory ? newCategory : category;
    
    if (!word || !meaning || !finalCategory) return;

    if (editVocabulary && onEdit) {
      onEdit({
        ...editVocabulary,
        word,
        meaning,
        example,
        category: finalCategory,
      });
    } else {
      onAdd({
        word,
        meaning,
        example,
        category: finalCategory,
      });
    }

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editVocabulary ? "Chỉnh sửa từ vựng" : "Thêm từ vựng mới"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="word">Từ vựng</Label>
            <Input
              id="word"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Nhập từ vựng..."
              required
            />
          </div>
          
          <div>
            <Label htmlFor="meaning">Nghĩa</Label>
            <Input
              id="meaning"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="Nhập nghĩa của từ..."
              required
            />
          </div>
          
          <div>
            <Label htmlFor="example">Ví dụ</Label>
            <Textarea
              id="example"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="Nhập câu ví dụ..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="category">Danh mục</Label>
            {!isAddingNewCategory ? (
              <div className="flex gap-2">
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingNewCategory(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Tên danh mục mới..."
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingNewCategory(false)}
                >
                  Hủy
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit">
              {editVocabulary ? "Cập nhật" : "Thêm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}