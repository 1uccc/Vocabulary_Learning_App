// Fallback service khi Firebase không hoạt động
export class FirebaseFallbackService {
  private data = {
    topics: [] as any[],
    vocabularies: [] as any[],
    userProgress: [] as any[],
    stats: {
      totalWords: 0,
      learnedWords: 0,
      averageAccuracy: 0,
      streak: 0,
      sessionsCount: 0,
      timeSpent: 0
    }
  };

  async getTopics(userId: string) {
    console.warn('🔄 Using fallback mode - Firebase not available');
    return this.data.topics;
  }

  async getVocabularies(userId: string, topicId?: string) {
    console.warn('🔄 Using fallback mode - Firebase not available');
    return this.data.vocabularies;
  }

  async getUserProgress(userId: string, vocabularyId?: string) {
    console.warn('🔄 Using fallback mode - Firebase not available');
    return this.data.userProgress;
  }

  async getLearningStats(userId: string, days: number = 7) {
    console.warn('🔄 Using fallback mode - Firebase not available');
    return this.data.stats;
  }

  async addTopic(topic: any) {
    const newTopic = { ...topic, id: Date.now().toString() };
    this.data.topics.push(newTopic);
    return newTopic;
  }

  async addVocabulary(vocabulary: any) {
    const newVocab = { ...vocabulary, id: Date.now().toString() };
    this.data.vocabularies.push(newVocab);
    return newVocab;
  }

  async createOrUpdateUser(uid: string, userData: any) {
    console.warn('🔄 Using fallback mode - User data not persisted');
  }

  async updateProgress(userId: string, vocabularyId: string, isCorrect: boolean) {
    console.warn('🔄 Using fallback mode - Progress not persisted');
    return {
      id: 'fallback',
      userId,
      vocabularyId,
      learned: isCorrect,
      correctCount: isCorrect ? 1 : 0,
      incorrectCount: isCorrect ? 0 : 1,
      lastReviewed: new Date(),
      nextReview: new Date(),
      masteryLevel: isCorrect ? 20 : 0,
      streak: isCorrect ? 1 : 0
    };
  }

  async saveLearningSession(session: any) {
    console.warn('🔄 Using fallback mode - Session not persisted');
    return { ...session, id: Date.now().toString() };
  }
}

export const firebaseFallbackService = new FirebaseFallbackService();