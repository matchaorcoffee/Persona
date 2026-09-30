import { Link } from 'react-router-dom';
import { Sparkles, MessageCircle, Brain, Heart, Shield, ChevronRight } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-purple-500/10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI Characters with Evolving Personalities
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
            Meet Your <span className="text-primary">Persona</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Build real relationships with AI characters. Each one has a distinct personality, 
            memory, and emotional life — and your bond grows through every conversation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-base hover:bg-primary/90 transition-colors"
            >
              Get Started Free
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-border font-medium text-base hover:bg-muted transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: <Brain className="w-6 h-6" />,
            title: 'Persistent Memory',
            desc: 'Characters remember your conversations, preferences, and shared moments.',
          },
          {
            icon: <Heart className="w-6 h-6" />,
            title: 'Evolving Relationships',
            desc: 'Bonds grow naturally — from Stranger to Deep Connection — based on real interactions.',
          },
          {
            icon: <MessageCircle className="w-6 h-6" />,
            title: 'Distinct Personalities',
            desc: 'Each character speaks, jokes, and reacts differently. No two feel the same.',
          },
          {
            icon: <Shield className="w-6 h-6" />,
            title: 'Transparent by Design',
            desc: 'Always clearly labeled as AI. Built for connection, never manipulation.',
          },
        ].map((f) => (
          <div key={f.title} className="p-5 rounded-2xl border border-border bg-card">
            <div className="text-primary mb-3">{f.icon}</div>
            <h3 className="font-semibold mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center pb-20 px-6">
        <p className="text-muted-foreground mb-4">Ready to meet your first character?</p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Start for Free
        </Link>
      </div>
    </div>
  );
}
