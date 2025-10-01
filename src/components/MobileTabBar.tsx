import { Home, Brain, Trophy, BarChart3, Book } from "lucide-react";

interface MobileTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileTabBar({ activeTab, onTabChange }: MobileTabBarProps) {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Trang chủ' },
    { id: 'vocabulary', icon: Book, label: 'Từ vựng' },
    { id: 'flashcard', icon: Brain, label: 'Flashcard' },
    { id: 'quiz', icon: Trophy, label: 'Quiz' },
    { id: 'progress', icon: BarChart3, label: 'Tiến độ' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border rounded-t-3xl shadow-2xl">
      <div className="flex justify-around items-center py-2 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary text-white scale-105' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-white' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-white' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}