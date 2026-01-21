import { auth } from '@clerk/nextjs/server';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { TrendingUp, Shield, Zap, Brain, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default async function Home() {
  // Redirect to dashboard if already signed in
  const { userId } = await auth();
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold gradient-orange bg-clip-text text-transparent">
                Atlas
              </span>
              <Badge variant="live" className="ml-2">MooMoo Powered</Badge>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center">
          {/* Main Headline */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Brain className="h-4 w-4 text-primary animate-pulse-orange" />
            <span className="text-sm font-medium text-primary">AI-Powered Trading Platform</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-bold mb-6">
            <span className="text-foreground">Swing Trading</span>
            <br />
            <span className="gradient-orange bg-clip-text text-transparent">Reimagined</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Let AI analyze markets, identify opportunities, and execute trades while you maintain full control. 
            From observation to autonomy—your choice.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <SignUpButton mode="modal">
              <Button size="lg" variant="glow" className="text-lg px-8">
                Get Started Free
                <Zap className="ml-2 h-5 w-5" />
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </SignInButton>
          </div>

          {/* Trust Badge */}
          <Badge variant="paper" className="text-sm">
            <Shield className="mr-1 h-3 w-3" />
            Start with Paper Trading • No Credit Card Required
          </Badge>
        </div>

        {/* Feature Cards */}
        <div className="mt-32 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="glass-card p-8 rounded-xl hover:border-primary/50 transition-all group">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:glow-orange transition-all">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI-Driven Analysis</h3>
            <p className="text-muted-foreground leading-relaxed">
              Advanced algorithms analyze market patterns, technical indicators, and sentiment to identify high-probability swing trades.
            </p>
          </div>

          <div className="glass-card p-8 rounded-xl hover:border-primary/50 transition-all group">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:glow-orange transition-all">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Risk Management</h3>
            <p className="text-muted-foreground leading-relaxed">
              Set position limits, stop losses, and risk parameters. Your AI agent trades within boundaries you define.
            </p>
          </div>

          <div className="glass-card p-8 rounded-xl hover:border-primary/50 transition-all group">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:glow-orange transition-all">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Flexible Autonomy</h3>
            <p className="text-muted-foreground leading-relaxed">
              Choose from Observer, Copilot, Guarded Auto, or Full Auto modes. Adjust anytime based on your comfort level.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 glass rounded-2xl p-12 max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">&lt;50ms</div>
              <div className="text-sm text-muted-foreground">Latency</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="font-semibold">Atlas</span>
              <span className="text-sm text-muted-foreground">Powered by MooMoo</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Atlas Trading Platform • Phase 1: Paper Trading
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
