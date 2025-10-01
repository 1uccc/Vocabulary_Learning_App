import { VocabularyCard } from "./VocabularyCard";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { Search } from "lucide-react";

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

interface VocabularyListProps {
  vocabularies: VocabularyItem[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  onEdit: (vocabulary: VocabularyItem) => void;
  onDelete: (id: string) => void;
}

export function VocabularyList({
  vocabularies,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onEdit,
  onDelete,
}: VocabularyListProps) {
  const filteredVocabularies = vocabularies.filter((vocab) => {
    const matchesSearch = vocab.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vocab.meaning.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tất cả" || vocab.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Thanh tìm kiếm và lọc */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm từ vựng..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tất cả">Tất cả danh mục</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Danh sách từ vựng */}
      <div className="space-y-3">
        {filteredVocabularies.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== "Tất cả"
                  ? "Không tìm thấy từ vựng nào phù hợp."
                  : "Chưa có từ vựng nào. Hãy thêm từ vựng đầu tiên!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredVocabularies.map((vocabulary) => (
            <VocabularyCard
              key={vocabulary.id}
              vocabulary={vocabulary}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {/* Thông tin thống kê */}
      {filteredVocabularies.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Hiển thị {filteredVocabularies.length} / {vocabularies.length} từ vựng
        </div>
      )}
    </div>
  );
}