'use client';

/**
 * CommandBar Component
 * 
 * Large, prominent input for user intent
 * Calls /api/agent/analyze when submitted
 * Shows loading state during agent processing
 */

import { useState } from 'react';
import { Loader2, Sparkles, Send } from 'lucide-react';

interface CommandBarProps {
  onAnalyze: (intent: string) => Promise<void>;
  isAnalyzing: boolean;
}

export function CommandBar({ onAnalyze, isAnalyzing }: CommandBarProps) {
  const [intent, setIntent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intent.trim() || isAnalyzing) return;

    await onAnalyze(intent);
    setIntent(''); // Clear after submission
  };

  const exampleQueries = [
    'Should I buy NVDA?',
    'What\'s the best setup for AAPL today?',
    'Analyze TSLA for a swing trade',
    'Is META a good buy right now?'
  ];

  const handleExampleClick = (query: string) => {
    if (!isAnalyzing) {
      setIntent(query);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Main Command Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative glass-card border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          
          <div className="relative flex items-center gap-3 p-4">
            {/* AI Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-glow">
                {isAnalyzing ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Sparkles className="w-6 h-6 text-white" />
                )}
              </div>
            </div>

            {/* Input Field */}
            <input
              type="text"
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              disabled={isAnalyzing}
              placeholder="Ask me anything about the markets... (e.g., Should I buy NVDA?)"
              className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              autoFocus
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!intent.trim() || isAnalyzing}
              className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl font-medium hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Analyze
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Example Queries */}
      {!isAnalyzing && (
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="text-sm text-muted-foreground">Try:</span>
          {exampleQueries.map((query, idx) => (
            <button
              key={idx}
              onClick={() => handleExampleClick(query)}
              className="text-sm px-3 py-1 rounded-lg bg-background/50 hover:bg-primary/10 border border-border hover:border-primary/30 transition-all duration-200 text-muted-foreground hover:text-primary"
            >
              {query}
            </button>
          ))}
        </div>
      )}

      {/* Hint Text */}
      <p className="text-center text-sm text-muted-foreground">
        <Sparkles className="w-4 h-4 inline mr-1" />
        Atlas will analyze market data and propose trades for your approval
      </p>
    </div>
  );
}

