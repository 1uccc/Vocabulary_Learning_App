import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { LoginScreen } from "./components/LoginScreen";
import { MobileHeader } from "./components/MobileHeader";
import { MobileTabBar } from "./components/MobileTabBar";
import { DashboardView } from "./components/DashboardView";
import { MobileFlashcardView } from "./components/MobileFlashcardView";
import { MobileQuizView } from "./components/MobileQuizView";
import { MobileProgressView } from "./components/MobileProgressView";
import { MobileVocabularyView } from "./components/MobileVocabularyView";
import { safeFirebaseService } from "./lib/firebase-service-wrapper";

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState<any>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      // Add small delay to ensure auth token is propagated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use safe service that handles errors automatically
      await safeFirebaseService.createOrUpdateUser(user.uid, {
        email: user.email!,
        displayName: user.displayName!,
        photoURL: user.photoURL
      });
      
      const statsData = await safeFirebaseService.getLearningStats(user.uid);
      setStats(statsData);
      
    } catch (error: any) {
      console.error('Failed to load user data:', error);
      // Silent error handling for better UX
    }
  };



  const handleNavigate = (tab: string, topicId?: string) => {
    setActiveTab(tab);
    if (topicId) {
      setSelectedTopicId(topicId);
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={handleNavigate} userId={user!.uid} />;
      case 'vocabulary':
        return <MobileVocabularyView selectedTopicId={selectedTopicId} userId={user!.uid} />;
      case 'flashcard':
        return <MobileFlashcardView selectedTopicId={selectedTopicId} userId={user!.uid} />;
      case 'quiz':
        return <MobileQuizView selectedTopicId={selectedTopicId} userId={user!.uid} />;
      case 'progress':
        return <MobileProgressView userId={user!.uid} />;
      default:
        return <DashboardView onNavigate={handleNavigate} userId={user!.uid} />;
    }
  };

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return (
      <LoginScreen 
        onToggleMode={() => setIsRegisterMode(!isRegisterMode)}
        isRegisterMode={isRegisterMode}
      />
    );
  }

  // Show main app
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Mobile Header */}
      <MobileHeader user={user} stats={stats} />
      
      {/* Main Content */}
      <div className="px-4 py-6">
        {renderActiveView()}
      </div>
      
      {/* Mobile Tab Bar */}
      <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}