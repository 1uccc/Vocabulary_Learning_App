import { realFirebaseService } from "../components/RealFirebaseService";
import { firebaseFallbackService } from "../components/FirebaseFallback";

// Service wrapper that automatically handles Firebase errors
export class FirebaseServiceWrapper {
  private useRealService = true;

  async safeCall<T>(operation: () => Promise<T>, fallbackOperation?: () => Promise<T>): Promise<T> {
    try {
      if (this.useRealService) {
        return await operation();
      } else {
        return fallbackOperation ? await fallbackOperation() : operation();
      }
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        console.warn('🔄 Firebase permission denied, switching to fallback mode');
        this.useRealService = false;
        
        if (fallbackOperation) {
          return await fallbackOperation();
        }
      }
      throw error;
    }
  }

  // Wrapper methods for all Firebase operations
  async getTopics(userId: string) {
    return this.safeCall(
      () => realFirebaseService.getTopics(userId),
      () => firebaseFallbackService.getTopics(userId)
    );
  }

  async getVocabularies(userId: string, topicId?: string) {
    return this.safeCall(
      () => realFirebaseService.getVocabularies(userId, topicId),
      () => firebaseFallbackService.getVocabularies(userId, topicId)
    );
  }

  async getUserProgress(userId: string, vocabularyId?: string) {
    return this.safeCall(
      () => realFirebaseService.getUserProgress(userId, vocabularyId),
      () => firebaseFallbackService.getUserProgress(userId, vocabularyId)
    );
  }

  async getLearningStats(userId: string, days?: number) {
    return this.safeCall(
      () => realFirebaseService.getLearningStats(userId, days),
      () => firebaseFallbackService.getLearningStats(userId, days)
    );
  }

  async addTopic(topic: any) {
    return this.safeCall(
      () => realFirebaseService.addTopic(topic),
      () => firebaseFallbackService.addTopic(topic)
    );
  }

  async addVocabulary(vocabulary: any) {
    return this.safeCall(
      () => realFirebaseService.addVocabulary(vocabulary),
      () => firebaseFallbackService.addVocabulary(vocabulary)
    );
  }

  async updateVocabulary(id: string, updates: any) {
    return this.safeCall(
      () => realFirebaseService.updateVocabulary(id, updates),
      () => Promise.resolve({ ...updates, id }) // Fallback just returns the updates
    );
  }

  async deleteVocabulary(id: string) {
    return this.safeCall(
      () => realFirebaseService.deleteVocabulary(id),
      () => Promise.resolve() // Fallback does nothing
    );
  }

  async updateProgress(userId: string, vocabularyId: string, isCorrect: boolean) {
    return this.safeCall(
      () => realFirebaseService.updateProgress(userId, vocabularyId, isCorrect),
      () => firebaseFallbackService.updateProgress(userId, vocabularyId, isCorrect)
    );
  }

  async saveLearningSession(session: any) {
    return this.safeCall(
      () => realFirebaseService.saveLearningSession(session),
      () => firebaseFallbackService.saveLearningSession(session)
    );
  }

  async createOrUpdateUser(uid: string, userData: any) {
    return this.safeCall(
      () => realFirebaseService.createOrUpdateUser(uid, userData),
      () => firebaseFallbackService.createOrUpdateUser(uid, userData)
    );
  }

  isUsingFallback() {
    return !this.useRealService;
  }
}

export const safeFirebaseService = new FirebaseServiceWrapper();