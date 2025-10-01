// Mock Firebase Service for Vocabulary Learning App
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  lastActive: Date;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  color: string;
  iconUrl?: string;
  createdAt: Date;
  userId: string;
}

export interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  example: string;
  pronunciation?: string;
  imageUrl?: string;
  audioUrl?: string;
  topicId: string;
  userId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgress {
  id: string;
  userId: string;
  vocabularyId: string;
  learned: boolean;
  correctCount: number;
  incorrectCount: number;
  lastReviewed: Date;
  nextReview: Date;
  masteryLevel: number; // 0-100
  streak: number;
}

export interface LearningSession {
  id: string;
  userId: string;
  topicId: string;
  type: 'flashcard' | 'quiz' | 'review';
  score: number;
  totalQuestions: number;
  timeSpent: number; // seconds
  startedAt: Date;
  completedAt: Date;
}

class FirebaseService {
  private users: User[] = [];
  private topics: Topic[] = [];
  private vocabularies: Vocabulary[] = [];
  private userProgress: UserProgress[] = [];
  private sessions: LearningSession[] = [];

  constructor() {
    this.initMockData();
  }

  private initMockData() {
    // Mock user
    const mockUser: User = {
      id: 'user1',
      email: 'user@example.com',
      displayName: 'Học viên',
      createdAt: new Date(),
      lastActive: new Date()
    };
    this.users.push(mockUser);

    // Mock topics
    const mockTopics: Topic[] = [
      {
        id: 'topic1',
        name: 'Gia đình',
        description: 'Từ vựng về gia đình và người thân',
        color: '#2563eb',
        userId: 'user1',
        createdAt: new Date()
      },
      {
        id: 'topic2',
        name: 'Công việc',
        description: 'Từ vựng liên quan đến công việc',
        color: '#eab308',
        userId: 'user1',
        createdAt: new Date()
      },
      {
        id: 'topic3',
        name: 'Du lịch',
        description: 'Từ vựng khi đi du lịch',
        color: '#10b981',
        userId: 'user1',
        createdAt: new Date()
      }
    ];
    this.topics.push(...mockTopics);

    // Mock vocabularies
    const mockVocabularies: Vocabulary[] = [
      {
        id: 'vocab1',
        word: 'Father',
        meaning: 'Bố, cha',
        example: 'My father is a teacher.',
        topicId: 'topic1',
        userId: 'user1',
        difficulty: 'easy',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'vocab2',
        word: 'Mother',
        meaning: 'Mẹ',
        example: 'My mother cooks delicious food.',
        topicId: 'topic1',
        userId: 'user1',
        difficulty: 'easy',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'vocab3',
        word: 'Manager',
        meaning: 'Quản lý, giám đốc',
        example: 'She is the manager of this department.',
        topicId: 'topic2',
        userId: 'user1',
        difficulty: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    this.vocabularies.push(...mockVocabularies);

    // Mock user progress
    const mockProgress: UserProgress[] = [
      {
        id: 'progress1',
        userId: 'user1',
        vocabularyId: 'vocab1',
        learned: true,
        correctCount: 8,
        incorrectCount: 2,
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000),
        masteryLevel: 85,
        streak: 3
      },
      {
        id: 'progress2',
        userId: 'user1',
        vocabularyId: 'vocab2',
        learned: false,
        correctCount: 3,
        incorrectCount: 4,
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 12 * 60 * 60 * 1000),
        masteryLevel: 40,
        streak: 0
      }
    ];
    this.userProgress.push(...mockProgress);
  }

  // User methods
  async getCurrentUser(): Promise<User | null> {
    return this.users[0] || null;
  }

  // Topic methods
  async getTopics(userId: string): Promise<Topic[]> {
    return this.topics.filter(topic => topic.userId === userId);
  }

  async addTopic(topic: Omit<Topic, 'id' | 'createdAt'>): Promise<Topic> {
    const newTopic: Topic = {
      ...topic,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    this.topics.push(newTopic);
    return newTopic;
  }

  async updateTopic(id: string, updates: Partial<Topic>): Promise<Topic> {
    const index = this.topics.findIndex(topic => topic.id === id);
    if (index === -1) throw new Error('Topic not found');
    
    this.topics[index] = { ...this.topics[index], ...updates };
    return this.topics[index];
  }

  async deleteTopic(id: string): Promise<void> {
    this.topics = this.topics.filter(topic => topic.id !== id);
    this.vocabularies = this.vocabularies.filter(vocab => vocab.topicId !== id);
  }

  // Vocabulary methods
  async getVocabularies(userId: string, topicId?: string): Promise<Vocabulary[]> {
    let vocabularies = this.vocabularies.filter(vocab => vocab.userId === userId);
    if (topicId) {
      vocabularies = vocabularies.filter(vocab => vocab.topicId === topicId);
    }
    return vocabularies;
  }

  async addVocabulary(vocabulary: Omit<Vocabulary, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vocabulary> {
    const newVocabulary: Vocabulary = {
      ...vocabulary,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.vocabularies.push(newVocabulary);
    
    // Create initial progress entry
    const progress: UserProgress = {
      id: Date.now().toString() + '_progress',
      userId: vocabulary.userId,
      vocabularyId: newVocabulary.id,
      learned: false,
      correctCount: 0,
      incorrectCount: 0,
      lastReviewed: new Date(),
      nextReview: new Date(),
      masteryLevel: 0,
      streak: 0
    };
    this.userProgress.push(progress);
    
    return newVocabulary;
  }

  async updateVocabulary(id: string, updates: Partial<Vocabulary>): Promise<Vocabulary> {
    const index = this.vocabularies.findIndex(vocab => vocab.id === id);
    if (index === -1) throw new Error('Vocabulary not found');
    
    this.vocabularies[index] = { 
      ...this.vocabularies[index], 
      ...updates, 
      updatedAt: new Date() 
    };
    return this.vocabularies[index];
  }

  async deleteVocabulary(id: string): Promise<void> {
    this.vocabularies = this.vocabularies.filter(vocab => vocab.id !== id);
    this.userProgress = this.userProgress.filter(progress => progress.vocabularyId !== id);
  }

  // Progress methods
  async getUserProgress(userId: string, vocabularyId?: string): Promise<UserProgress[]> {
    let progress = this.userProgress.filter(p => p.userId === userId);
    if (vocabularyId) {
      progress = progress.filter(p => p.vocabularyId === vocabularyId);
    }
    return progress;
  }

  async updateProgress(userId: string, vocabularyId: string, isCorrect: boolean): Promise<UserProgress> {
    let progressIndex = this.userProgress.findIndex(
      p => p.userId === userId && p.vocabularyId === vocabularyId
    );

    if (progressIndex === -1) {
      // Create new progress entry
      const newProgress: UserProgress = {
        id: Date.now().toString(),
        userId,
        vocabularyId,
        learned: isCorrect,
        correctCount: isCorrect ? 1 : 0,
        incorrectCount: isCorrect ? 0 : 1,
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + (isCorrect ? 24 : 4) * 60 * 60 * 1000),
        masteryLevel: isCorrect ? 20 : 0,
        streak: isCorrect ? 1 : 0
      };
      this.userProgress.push(newProgress);
      return newProgress;
    }

    const progress = this.userProgress[progressIndex];
    const updatedProgress: UserProgress = {
      ...progress,
      correctCount: progress.correctCount + (isCorrect ? 1 : 0),
      incorrectCount: progress.incorrectCount + (isCorrect ? 0 : 1),
      lastReviewed: new Date(),
      streak: isCorrect ? progress.streak + 1 : 0,
      masteryLevel: Math.min(100, Math.max(0, 
        progress.masteryLevel + (isCorrect ? 10 : -5)
      )),
      learned: progress.masteryLevel >= 80,
      nextReview: new Date(Date.now() + (isCorrect ? 24 : 4) * 60 * 60 * 1000)
    };

    this.userProgress[progressIndex] = updatedProgress;
    return updatedProgress;
  }

  // Session methods
  async saveLearningSession(session: Omit<LearningSession, 'id'>): Promise<LearningSession> {
    const newSession: LearningSession = {
      ...session,
      id: Date.now().toString()
    };
    this.sessions.push(newSession);
    return newSession;
  }

  async getLearningStats(userId: string, days: number = 7): Promise<{
    totalWords: number;
    learnedWords: number;
    averageAccuracy: number;
    streak: number;
    sessionsCount: number;
    timeSpent: number;
  }> {
    const vocabularies = await this.getVocabularies(userId);
    const progress = await this.getUserProgress(userId);
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentSessions = this.sessions.filter(
      s => s.userId === userId && s.completedAt >= cutoffDate
    );

    const totalCorrect = progress.reduce((sum, p) => sum + p.correctCount, 0);
    const totalIncorrect = progress.reduce((sum, p) => sum + p.incorrectCount, 0);
    const totalAttempts = totalCorrect + totalIncorrect;

    return {
      totalWords: vocabularies.length,
      learnedWords: progress.filter(p => p.learned).length,
      averageAccuracy: totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0,
      streak: Math.max(...progress.map(p => p.streak), 0),
      sessionsCount: recentSessions.length,
      timeSpent: recentSessions.reduce((sum, s) => sum + s.timeSpent, 0)
    };
  }
}

export const firebaseService = new FirebaseService();