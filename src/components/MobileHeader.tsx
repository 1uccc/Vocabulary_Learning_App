import { User, Book, Trophy, TrendingUp, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "./AuthContext";

interface MobileHeaderProps {
  user?: any;
  stats?: {
    totalWords: number;
    learnedWords: number;
    streak: number;
  };
}

export function MobileHeader({ user, stats }: MobileHeaderProps) {
  const { logout } = useAuth();
  return (
    <div className="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-6 rounded-b-3xl shadow-lg">
      {/* User Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">
              {user?.displayName || 'Học viên'}
            </h1>
            <p className="text-blue-100 text-sm">Chào mừng trở lại!</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
        >
          <LogOut className="h-5 w-5 text-white" />
        </Button>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-2xl p-3 text-center">
            <Book className="h-5 w-5 text-accent mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.totalWords}</p>
            <p className="text-xs text-blue-100">Từ vựng</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 text-center">
            <TrendingUp className="h-5 w-5 text-accent mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.learnedWords}</p>
            <p className="text-xs text-blue-100">Đã học</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 text-center">
            <Trophy className="h-5 w-5 text-accent mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.streak}</p>
            <p className="text-xs text-blue-100">Streak</p>
          </div>
        </div>
      )}
    </div>
  );
}