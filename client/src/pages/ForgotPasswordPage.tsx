import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // In development the server returns the raw token so the flow can be tested
  const [devToken, setDevToken] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      if (data.devToken) {
        setDevToken(data.devToken);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-2xl font-bold">Persona</span>
          </div>
          <h1 className="text-xl font-semibold">Forgot your password?</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Success state */}
            <div className="rounded-xl border border-border bg-card p-5 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto">
                <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-medium text-sm">Check your email</p>
              <p className="text-sm text-muted-foreground">
                If <span className="font-medium text-foreground">{email}</span> is registered,
                you'll receive a password reset link shortly.
              </p>
              <p className="text-xs text-muted-foreground">
                The link expires in 60 minutes.
              </p>
            </div>

            {/* Dev helper — only shown in non-production */}
            {devToken && (
              <div className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950 p-4 space-y-2">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                  Development only
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-300">
                  No email provider is configured. Use this token to reset your password:
                </p>
                <code className="block text-xs bg-amber-100 dark:bg-amber-900 rounded px-2 py-1.5 break-all select-all text-amber-800 dark:text-amber-200">
                  {devToken}
                </code>
                <Link
                  to={`/reset-password?token=${devToken}`}
                  className="block text-center text-xs font-medium text-primary hover:underline mt-1"
                >
                  → Open reset page with this token
                </Link>
              </div>
            )}

            <button
              onClick={() => { setSubmitted(false); setDevToken(null); }}
              className="w-full py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
            >
              Try a different email
            </button>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
