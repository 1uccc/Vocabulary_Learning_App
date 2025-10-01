import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Volume2,
  BookOpen,
  Filter
} from "lucide-react";
import { safeFirebaseService } from "../lib/firebase-service-wrapper";
import { Topic, Vocabulary, UserProgress } from "./RealFirebaseService";

interface MobileVocabularyViewProps {
  selectedTopicId?: string;
  userId: string;
}

export function MobileVocabularyView({ selectedTopicId, userId }: MobileVocabularyViewProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>(selectedTopicId || "all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVocab, setEditingVocab] = useState<Vocabulary | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    word: "",
    meaning: "",
    example: "",
    topicId: "",
    newTopicName: "",
    difficulty: "medium" as "easy" | "medium" | "hard"
  });

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
      const [topicsData, vocabulariesData, progressData] = await Promise.all([
        safeFirebaseService.getTopics(userId),
        safeFirebaseService.getVocabularies(userId),
        safeFirebaseService.getUserProgress(userId)
      ]);

      setTopics(topicsData);
      setVocabularies(vocabulariesData);
      setUserProgress(progressData);
    } catch (error) {
      console.error('Failed to load vocabulary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVocabularies = vocabularies.filter((vocab) => {
    const matchesSearch = vocab.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vocab.meaning.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = selectedTopic === "all" || vocab.topicId === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  const handleAddVocabulary = async () => {
    try {
      let topicId = formData.topicId;

      // Create new topic if needed
      if (formData.newTopicName && !formData.topicId) {
        const newTopic = await safeFirebaseService.addTopic({
          name: formData.newTopicName,
          description: `Chủ đề ${formData.newTopicName}`,
          color: getRandomColor(),
          userId: userId
        });
        topicId = newTopic.id;
        setTopics(prev => [...prev, newTopic]);
      }

      await safeFirebaseService.addVocabulary({
        word: formData.word,
        meaning: formData.meaning,
        example: formData.example,
        topicId: topicId,
        userId: userId,
        difficulty: formData.difficulty
      });

      await loadData();
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to add vocabulary:', error);
    }
  };

  const handleEditVocabulary = async () => {
    try {
      if (!editingVocab) return;

      await safeFirebaseService.updateVocabulary(editingVocab.id, {
        word: formData.word,
        meaning: formData.meaning,
        example: formData.example,
        difficulty: formData.difficulty
      });

      await loadData();
      resetForm();
      setEditingVocab(null);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to edit vocabulary:', error);
    }
  };

  const handleDeleteVocabulary = async (vocabularyId: string) => {
    try {
      await safeFirebaseService.deleteVocabulary(vocabularyId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete vocabulary:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      word: "",
      meaning: "",
      example: "",
      topicId: "",
      newTopicName: "",
      difficulty: "medium"
    });
  };

  const openAddDialog = () => {
    resetForm();
    setEditingVocab(null);
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (vocab: Vocabulary) => {
    setFormData({
      word: vocab.word,
      meaning: vocab.meaning,
      example: vocab.example,
      topicId: vocab.topicId,
      newTopicName: "",
      difficulty: vocab.difficulty
    });
    setEditingVocab(vocab);
    setIsAddDialogOpen(true);
  };

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const getRandomColor = () => {
    const colors = ['#2563eb', '#eab308', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getVocabProgress = (vocabularyId: string) => {
    return userProgress.find(p => p.vocabularyId === vocabularyId);
  };

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return 'Trung bình';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Từ vựng của tôi</h2>
        <Button onClick={openAddDialog} size="sm" className="bg-accent hover:bg-yellow-500">
          <Plus className="h-4 w-4 mr-1" />
          Thêm
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm từ vựng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedTopic} onValueChange={setSelectedTopic}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn chủ đề" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả chủ đề</SelectItem>
            {topics.map((topic) => (
              <SelectItem key={topic.id} value={topic.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: topic.color }}
                  />
                  {topic.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Vocabulary List */}
      <div className="space-y-3">
        {filteredVocabularies.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchTerm || selectedTopic !== "all"
                    ? "Không tìm thấy từ vựng nào"
                    : "Chưa có từ vựng nào"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredVocabularies.map((vocab) => {
            const progress = getVocabProgress(vocab.id);
            const topic = topics.find(t => t.id === vocab.topicId);
            
            return (
              <Card key={vocab.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg text-primary">
                          {vocab.word}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speakWord(vocab.word)}
                          className="h-6 w-6 p-0 text-primary"
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-muted-foreground">{vocab.meaning}</p>
                      {vocab.example && (
                        <p className="text-xs text-muted-foreground italic mt-1">
                          "{vocab.example}"
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(vocab)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVocabulary(vocab.id)}
                        className="h-8 w-8 p-0 text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {topic && (
                        <Badge 
                          variant="outline"
                          className="text-xs"
                          style={{ 
                            backgroundColor: topic.color + '20',
                            borderColor: topic.color,
                            color: topic.color
                          }}
                        >
                          {topic.name}
                        </Badge>
                      )}
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getDifficultyBadgeColor(vocab.difficulty)}`}
                      >
                        {getDifficultyLabel(vocab.difficulty)}
                      </Badge>
                    </div>
                    {progress && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="text-green-600">✓{progress.correctCount}</span>
                        <span className="text-red-600">✗{progress.incorrectCount}</span>
                        {progress.learned && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Đã học
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingVocab ? "Chỉnh sửa từ vựng" : "Thêm từ vựng mới"}
            </DialogTitle>
            <DialogDescription>
              {editingVocab 
                ? "Cập nhật thông tin từ vựng của bạn"
                : "Điền thông tin để thêm từ vựng mới vào bộ sưu tập"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="word">Từ vựng</Label>
              <Input
                id="word"
                value={formData.word}
                onChange={(e) => setFormData(prev => ({ ...prev, word: e.target.value }))}
                placeholder="Nhập từ vựng..."
              />
            </div>
            
            <div>
              <Label htmlFor="meaning">Nghĩa</Label>
              <Input
                id="meaning"
                value={formData.meaning}
                onChange={(e) => setFormData(prev => ({ ...prev, meaning: e.target.value }))}
                placeholder="Nhập nghĩa của từ..."
              />
            </div>
            
            <div>
              <Label htmlFor="example">Ví dụ</Label>
              <Textarea
                id="example"
                value={formData.example}
                onChange={(e) => setFormData(prev => ({ ...prev, example: e.target.value }))}
                placeholder="Nhập câu ví dụ..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="difficulty">Độ khó</Label>
              <Select 
                value={formData.difficulty} 
                onValueChange={(value: "easy" | "medium" | "hard") => 
                  setFormData(prev => ({ ...prev, difficulty: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Dễ</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="hard">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {!editingVocab && (
              <div>
                <Label htmlFor="topic">Chủ đề</Label>
                <Select 
                  value={formData.topicId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, topicId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chủ đề" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="mt-2">
                  <Label htmlFor="newTopic">Hoặc tạo chủ đề mới</Label>
                  <Input
                    id="newTopic"
                    value={formData.newTopicName}
                    onChange={(e) => setFormData(prev => ({ ...prev, newTopicName: e.target.value }))}
                    placeholder="Tên chủ đề mới..."
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Hủy
              </Button>
              <Button 
                onClick={editingVocab ? handleEditVocabulary : handleAddVocabulary}
                disabled={!formData.word || !formData.meaning || (!formData.topicId && !formData.newTopicName && !editingVocab)}
              >
                {editingVocab ? "Cập nhật" : "Thêm"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}