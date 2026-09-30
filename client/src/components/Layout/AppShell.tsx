import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, User, LogOut, Sparkles, Plus, UserRound, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { useThemeStore } from '../../stores/theme.store';
import api from '../../services/api';
import { toast } from 'sonner';

export function AppShell() {
  const { user, logout, isGuest } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore errors
    }
    logout();
    navigate('/login');
    toast.success('Logged out');
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Guest upgrade banner */}
      {isGuest && (
        <div className="bg-amber-500 dark:bg-amber-600 text-white text-xs px-4 py-2 flex items-center justify-center gap-3">
          <UserRound className="w-3.5 h-3.5 shrink-0" />
          <span>
            You're browsing as a <strong>guest</strong>. Your conversations and characters won't be saved permanently.
          </span>
          <Link
            to="/register"
            className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:no-underline whitespace-nowrap"
          >
            Create a free account <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/characters" className="flex items-center gap-2 font-semibold text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Persona</span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              to="/create-character"
              className="hidden sm:flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-1 text-sm text-muted-foreground pl-2 border-l border-border">
              {isGuest ? (
                <UserRound className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
              <span className="hidden sm:block truncate max-w-[120px]">
                {isGuest ? 'Guest' : user?.email}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
