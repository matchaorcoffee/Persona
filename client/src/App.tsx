import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './stores/auth.store';
import { AppShell } from './components/Layout/AppShell';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { CharactersPage } from './pages/CharactersPage';
import { CharacterProfilePage } from './pages/CharacterProfilePage';
import { ChatPage } from './pages/ChatPage';
import { CreateCharacterPage } from './pages/CreateCharacterPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isGuest } = useAuthStore();
  // Allow guests to visit public pages so they can upgrade their account
  if (isAuthenticated && !isGuest) return <Navigate to="/characters" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected routes (wrapped in AppShell) */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/characters/:id" element={<CharacterProfilePage />} />
          <Route path="/chat/:characterId" element={<ChatPage />} />
          <Route path="/create-character" element={<CreateCharacterPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
