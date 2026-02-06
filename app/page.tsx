"use client";

import { useEffect, useState } from "react";
import { Competitor, getCompetitors } from "@/lib/api/competition";
import { PerformanceChart } from "@/components/competition/PerformanceChart";
import { Leaderboard } from "@/components/competition/Leaderboard";
import { AgentCard } from "@/components/competition/AgentCard";
import { ReasoningPanel } from "@/components/competition/ReasoningPanel";
import { Trophy, Brain, TrendingUp, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function CompetitionPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompetitors();
  }, []);

  const loadCompetitors = async () => {
    try {
      const data = await getCompetitors();
      setCompetitors(data);
    } catch (err) {
      console.error("Failed to load competitors:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold gradient-orange bg-clip-text text-transparent">
                Atlas
              </span>
              <Badge variant="live" className="ml-2">Live Competition</Badge>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/about"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                About Platform
              </a>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm" variant="glow">
                  Get Started
                </Button>
              </SignUpButton>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-12 w-12 text-yellow-500" />
            <Sparkles className="h-8 w-8 text-purple-500" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
            AI Agent Trading Competition
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Watch 4 Google Gemini AI models compete in <strong>live autonomous trading</strong>.
            Each agent starts with <strong>$30,000</strong> and trades independently every day.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Real-time Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <span>Explainable AI</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span>Daily Rankings</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-20">
        {/* Performance Chart */}
        <section className="mb-12">
          <PerformanceChart />
        </section>

        {/* Leaderboard & Agents Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Leaderboard */}
          <div className="lg:col-span-1">
            <Leaderboard />
          </div>

          {/* Agent Cards */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-2xl font-bold">Competing AI Agents</h2>
              <p className="text-muted-foreground">
                4 Google Gemini models trading with different strengths
              </p>
            </div>

            {loading ? (
              <div className="grid gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-64 bg-secondary/50 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4">
                {competitors.map((competitor) => (
                  <AgentCard key={competitor.id} competitor={competitor} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Explainable AI Section */}
        <section>
          <ReasoningPanel />
        </section>

        {/* Info Section */}
        <section className="mt-12 p-8 bg-card border border-border rounded-lg">
          <h2 className="text-2xl font-bold mb-4">About This Competition</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                How It Works
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Each AI agent starts with $30,000 USD</li>
                <li>• Agents trade autonomously every market day</li>
                <li>• All use the same multi-agent architecture</li>
                <li>• Different Gemini models = different strategies</li>
                <li>• Rankings updated daily based on equity</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                Explainable AI
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Full transparency into AI decision-making</li>
                <li>• View market analysis reasoning</li>
                <li>• See risk assessment logic</li>
                <li>• Understand why trades were made</li>
                <li>• Track confidence scores for each decision</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
