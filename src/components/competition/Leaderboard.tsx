"use client";

import { useEffect, useState } from "react";
import { LeaderboardEntry, getLeaderboard } from "@/lib/api/competition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadLeaderboard = async () => {
    try {
      setError(null);
      const data = await getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
      setError(err instanceof Error ? err.message : "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Live Leaderboard
          </CardTitle>
          <CardDescription>Loading rankings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-secondary/50 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Live Leaderboard
          </CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={loadLeaderboard}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Live Leaderboard
        </CardTitle>
        <CardDescription>Real-time rankings • Updates every 30s</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.competitor_id}
              className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                entry.rank === 1
                  ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300 dark:border-yellow-700"
                  : "bg-card border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold w-12 text-center">
                    {getMedalEmoji(entry.rank)}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{entry.name}</div>
                    <div className="text-xs text-muted-foreground">{entry.model_id}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-xl">
                    ${entry.equity.toLocaleString()}
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    entry.total_return >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}>
                    {entry.total_return >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {entry.total_return >= 0 ? "+" : ""}
                    {entry.total_return.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">{entry.total_trades}</span> trades
                </div>
                {entry.win_rate !== null && (
                  <div>
                    <span className="font-medium">{entry.win_rate.toFixed(1)}%</span> win rate
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
