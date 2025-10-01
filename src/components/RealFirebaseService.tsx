import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch,
  setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

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

class RealFirebaseService {
  // Collections
  private usersCollection = collection(db, 'users');
  private topicsCollection = collection(db, 'topics');
  private vocabulariesCollection = collection(db, 'vocabularies');
  private progressCollection = collection(db, 'userProgress');
  private sessionsCollection = collection(db, 'learningSessions');

  // Helper function to convert Firestore timestamp to Date
  private convertTimestamp = (timestamp: any): Date => {
    if (timestamp?.toDate) {
      return timestamp.toDate();
    }
    return timestamp instanceof Date ? timestamp : new Date(timestamp);
  };

  // User methods
  async createOrUpdateUser(uid: string, userData: Partial<User>): Promise<void> {
    try {
      const userRef = doc(this.usersCollection, uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Use setDoc for creating new documents
        await setDoc(userRef, {
          ...userData,
          id: uid,
          createdAt: Timestamp.now(),
          lastActive: Timestamp.now()
        });
      } else {
        // Use updateDoc for existing documents
        await updateDoc(userRef, {
          lastActive: Timestamp.now(),
          ...userData
        });
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      // Fallback: try using setDoc with merge
      const userRef = doc(this.usersCollection, uid);
      await setDoc(userRef, {
        ...userData,
        id: uid,
        createdAt: Timestamp.now(),
        lastActive: Timestamp.now()
      }, { merge: true });
    }
  }

  async getCurrentUser(uid: string): Promise<User | null> {
    try {
      const userRef = doc(this.usersCollection, uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: userDoc.id,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          createdAt: this.convertTimestamp(data.createdAt),
          lastActive: this.convertTimestamp(data.lastActive)
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Topic methods
  async getTopics(userId: string): Promise<Topic[]> {
    try {
      // Simplified query without orderBy to avoid index requirement
      const q = query(
        this.topicsCollection,
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      const topics = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          color: data.color,
          iconUrl: data.iconUrl,
          userId: data.userId,
          createdAt: this.convertTimestamp(data.createdAt)
        };
      });
      
      // Sort client-side to avoid index requirement
      return topics.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting topics:', error);
      return [];
    }
  }

  async addTopic(topic: Omit<Topic, 'id' | 'createdAt'>): Promise<Topic> {
    try {
      const docRef = await addDoc(this.topicsCollection, {
        ...topic,
        createdAt: Timestamp.now()
      });
      
      return {
        ...topic,
        id: docRef.id,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error adding topic:', error);
      throw new Error('Failed to add topic');
    }
  }

  async updateTopic(id: string, updates: Partial<Topic>): Promise<Topic> {
    try {
      const topicRef = doc(this.topicsCollection, id);
      await updateDoc(topicRef, updates);
      
      const updatedDoc = await getDoc(topicRef);
      const data = updatedDoc.data()!;
      
      return {
        id: updatedDoc.id,
        name: data.name,
        description: data.description,
        color: data.color,
        iconUrl: data.iconUrl,
        userId: data.userId,
        createdAt: this.convertTimestamp(data.createdAt)
      };
    } catch (error) {
      console.error('Error updating topic:', error);
      throw new Error('Failed to update topic');
    }
  }

  async deleteTopic(id: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Delete topic
      const topicRef = doc(this.topicsCollection, id);
      batch.delete(topicRef);
      
      // Delete associated vocabularies
      const vocabQuery = query(this.vocabulariesCollection, where('topicId', '==', id));
      const vocabSnapshot = await getDocs(vocabQuery);
      
      vocabSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Delete associated progress
      const progressQuery = query(
        this.progressCollection, 
        where('vocabularyId', 'in', vocabSnapshot.docs.map(doc => doc.id))
      );
      const progressSnapshot = await getDocs(progressQuery);
      
      progressSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error deleting topic:', error);
      throw new Error('Failed to delete topic');
    }
  }

  // Vocabulary methods
  async getVocabularies(userId: string, topicId?: string): Promise<Vocabulary[]> {
    try {
      let q;
      if (topicId) {
        // Query with multiple where clauses - may need index
        q = query(
          this.vocabulariesCollection,
          where('userId', '==', userId),
          where('topicId', '==', topicId)
        );
      } else {
        // Simple query by userId only
        q = query(
          this.vocabulariesCollection,
          where('userId', '==', userId)
        );
      }
      
      const snapshot = await getDocs(q);
      
      const vocabularies = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          word: data.word,
          meaning: data.meaning,
          example: data.example,
          pronunciation: data.pronunciation,
          imageUrl: data.imageUrl,
          audioUrl: data.audioUrl,
          topicId: data.topicId,
          userId: data.userId,
          difficulty: data.difficulty,
          createdAt: this.convertTimestamp(data.createdAt),
          updatedAt: this.convertTimestamp(data.updatedAt)
        };
      });
      
      // Sort client-side to avoid index requirement
      return vocabularies.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting vocabularies:', error);
      return [];
    }
  }

  async addVocabulary(vocabulary: Omit<Vocabulary, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vocabulary> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(this.vocabulariesCollection, {
        ...vocabulary,
        createdAt: now,
        updatedAt: now
      });
      
      // Create initial progress entry
      await addDoc(this.progressCollection, {
        userId: vocabulary.userId,
        vocabularyId: docRef.id,
        learned: false,
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: now,
        nextReview: now,
        masteryLevel: 0,
        streak: 0
      });
      
      return {
        ...vocabulary,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error adding vocabulary:', error);
      throw new Error('Failed to add vocabulary');
    }
  }

  async updateVocabulary(id: string, updates: Partial<Vocabulary>): Promise<Vocabulary> {
    try {
      const vocabRef = doc(this.vocabulariesCollection, id);
      await updateDoc(vocabRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      
      const updatedDoc = await getDoc(vocabRef);
      const data = updatedDoc.data()!;
      
      return {
        id: updatedDoc.id,
        word: data.word,
        meaning: data.meaning,
        example: data.example,
        pronunciation: data.pronunciation,
        imageUrl: data.imageUrl,
        audioUrl: data.audioUrl,
        topicId: data.topicId,
        userId: data.userId,
        difficulty: data.difficulty,
        createdAt: this.convertTimestamp(data.createdAt),
        updatedAt: this.convertTimestamp(data.updatedAt)
      };
    } catch (error) {
      console.error('Error updating vocabulary:', error);
      throw new Error('Failed to update vocabulary');
    }
  }

  async deleteVocabulary(id: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Delete vocabulary
      const vocabRef = doc(this.vocabulariesCollection, id);
      batch.delete(vocabRef);
      
      // Delete associated progress
      const progressQuery = query(this.progressCollection, where('vocabularyId', '==', id));
      const progressSnapshot = await getDocs(progressQuery);
      
      progressSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
      throw new Error('Failed to delete vocabulary');
    }
  }

  // Progress methods
  async getUserProgress(userId: string, vocabularyId?: string): Promise<UserProgress[]> {
    try {
      let q;
      if (vocabularyId) {
        q = query(
          this.progressCollection,
          where('userId', '==', userId),
          where('vocabularyId', '==', vocabularyId)
        );
      } else {
        q = query(this.progressCollection, where('userId', '==', userId));
      }
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          vocabularyId: data.vocabularyId,
          learned: data.learned,
          correctCount: data.correctCount,
          incorrectCount: data.incorrectCount,
          lastReviewed: this.convertTimestamp(data.lastReviewed),
          nextReview: this.convertTimestamp(data.nextReview),
          masteryLevel: data.masteryLevel,
          streak: data.streak
        };
      });
    } catch (error) {
      console.error('Error getting user progress:', error);
      return [];
    }
  }

  async updateProgress(userId: string, vocabularyId: string, isCorrect: boolean): Promise<UserProgress> {
    try {
      const q = query(
        this.progressCollection,
        where('userId', '==', userId),
        where('vocabularyId', '==', vocabularyId)
      );
      const snapshot = await getDocs(q);
      
      const now = Timestamp.now();
      
      if (snapshot.empty) {
        // Create new progress entry
        const docRef = await addDoc(this.progressCollection, {
          userId,
          vocabularyId,
          learned: isCorrect,
          correctCount: isCorrect ? 1 : 0,
          incorrectCount: isCorrect ? 0 : 1,
          lastReviewed: now,
          nextReview: Timestamp.fromDate(new Date(Date.now() + (isCorrect ? 24 : 4) * 60 * 60 * 1000)),
          masteryLevel: isCorrect ? 20 : 0,
          streak: isCorrect ? 1 : 0
        });
        
        const newDoc = await getDoc(docRef);
        const data = newDoc.data()!;
        
        return {
          id: newDoc.id,
          userId: data.userId,
          vocabularyId: data.vocabularyId,
          learned: data.learned,
          correctCount: data.correctCount,
          incorrectCount: data.incorrectCount,
          lastReviewed: this.convertTimestamp(data.lastReviewed),
          nextReview: this.convertTimestamp(data.nextReview),
          masteryLevel: data.masteryLevel,
          streak: data.streak
        };
      } else {
        // Update existing progress
        const progressDoc = snapshot.docs[0];
        const currentData = progressDoc.data();
        
        const newMasteryLevel = Math.min(100, Math.max(0, 
          currentData.masteryLevel + (isCorrect ? 10 : -5)
        ));
        
        const updates = {
          correctCount: currentData.correctCount + (isCorrect ? 1 : 0),
          incorrectCount: currentData.incorrectCount + (isCorrect ? 0 : 1),
          lastReviewed: now,
          streak: isCorrect ? currentData.streak + 1 : 0,
          masteryLevel: newMasteryLevel,
          learned: newMasteryLevel >= 80,
          nextReview: Timestamp.fromDate(new Date(Date.now() + (isCorrect ? 24 : 4) * 60 * 60 * 1000))
        };
        
        await updateDoc(progressDoc.ref, updates);
        
        return {
          id: progressDoc.id,
          userId: currentData.userId,
          vocabularyId: currentData.vocabularyId,
          learned: updates.learned,
          correctCount: updates.correctCount,
          incorrectCount: updates.incorrectCount,
          lastReviewed: new Date(),
          nextReview: new Date(Date.now() + (isCorrect ? 24 : 4) * 60 * 60 * 1000),
          masteryLevel: updates.masteryLevel,
          streak: updates.streak
        };
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      throw new Error('Failed to update progress');
    }
  }

  // Session methods
  async saveLearningSession(session: Omit<LearningSession, 'id'>): Promise<LearningSession> {
    try {
      const docRef = await addDoc(this.sessionsCollection, {
        ...session,
        startedAt: Timestamp.fromDate(session.startedAt),
        completedAt: Timestamp.fromDate(session.completedAt)
      });
      
      return {
        ...session,
        id: docRef.id
      };
    } catch (error) {
      console.error('Error saving session:', error);
      throw new Error('Failed to save session');
    }
  }

  async getLearningStats(userId: string, days: number = 7): Promise<{
    totalWords: number;
    learnedWords: number;
    averageAccuracy: number;
    streak: number;
    sessionsCount: number;
    timeSpent: number;
  }> {
    try {
      // Get vocabularies (simple query)
      const vocabQuery = query(this.vocabulariesCollection, where('userId', '==', userId));
      const vocabSnapshot = await getDocs(vocabQuery);
      
      // Get progress (simple query)
      const progressQuery = query(this.progressCollection, where('userId', '==', userId));
      const progressSnapshot = await getDocs(progressQuery);
      
      // Get all sessions and filter client-side to avoid index requirement
      const sessionsQuery = query(this.sessionsCollection, where('userId', '==', userId));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      
      const progress = progressSnapshot.docs.map(doc => doc.data());
      
      // Filter sessions client-side
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const sessions = sessionsSnapshot.docs
        .map(doc => doc.data())
        .filter(session => {
          const completedAt = session.completedAt?.toDate ? session.completedAt.toDate() : new Date(session.completedAt);
          return completedAt >= cutoffDate;
        });
      
      const totalCorrect = progress.reduce((sum, p) => sum + (p.correctCount || 0), 0);
      const totalIncorrect = progress.reduce((sum, p) => sum + (p.incorrectCount || 0), 0);
      const totalAttempts = totalCorrect + totalIncorrect;
      
      return {
        totalWords: vocabSnapshot.docs.length,
        learnedWords: progress.filter(p => p.learned).length,
        averageAccuracy: totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0,
        streak: Math.max(...progress.map(p => p.streak || 0), 0),
        sessionsCount: sessions.length,
        timeSpent: sessions.reduce((sum, s) => sum + (s.timeSpent || 0), 0)
      };
    } catch (error) {
      console.error('Error getting learning stats:', error);
      return {
        totalWords: 0,
        learnedWords: 0,
        averageAccuracy: 0,
        streak: 0,
        sessionsCount: 0,
        timeSpent: 0
      };
    }
  }
}

export const realFirebaseService = new RealFirebaseService();