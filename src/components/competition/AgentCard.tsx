"use client";

import { useState } from "react";
import { Competitor, Position, getAgentPortfolio } from "@/lib/api/competition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AgentCardProps {
  competitor: Competitor;
}

export function AgentCard({ competitor }: AgentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [portfolio, setPortfolio] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolio = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setExpanded(true);

      const data = await getAgentPortfolio(competitor.id);
      setPortfolio(data);
    } catch (err) {
      console.error("Failed to load portfolio:", err);
      setError(err instanceof Error ? err.message : "Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  };

  const getModelColor = (modelId: string) => {
    if (modelId.includes("3-flash")) return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
    if (modelId.includes("3-pro")) return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300";
    if (modelId.includes("2.5-flash")) return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
    if (modelId.includes("2.5-pro")) return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300";
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  return (
    <Card className="hover:shadow-lg transition-all">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{competitor.name}</CardTitle>
            <CardDescription>{competitor.description}</CardDescription>
          </div>
          <Badge className={getModelColor(competitor.model_id)}>
            {competitor.model_id}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-muted-foreground">Current Equity</div>
            <div className="text-2xl font-bold">
              ${competitor.current_equity.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Total Return</div>
            <div
              className={`text-2xl font-bold flex items-center gap-1 ${
                competitor.total_return >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {competitor.total_return >= 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              {competitor.total_return >= 0 ? "+" : ""}
              {competitor.total_return.toFixed(2)}%
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Total Trades</div>
            <div className="text-lg font-semibold">{competitor.total_trades}</div>
          </div>

          {competitor.win_rate !== null && (
            <div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
              <div className="text-lg font-semibold">
                {competitor.win_rate.toFixed(1)}%
              </div>
            </div>
          )}

          {competitor.sharpe_ratio !== null && (
            <div>
              <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
              <div className="text-lg font-semibold">
                {competitor.sharpe_ratio.toFixed(2)}
              </div>
            </div>
          )}

          {competitor.max_drawdown !== null && (
            <div>
              <div className="text-sm text-muted-foreground">Max Drawdown</div>
              <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                {competitor.max_drawdown.toFixed(2)}%
              </div>
            </div>
          )}
        </div>

        {/* View Portfolio Button */}
        <button
          onClick={loadPortfolio}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
        >
          <span>View Portfolio</span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {/* Portfolio Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-sm text-center py-4">{error}</div>
            ) : portfolio.length === 0 ? (
              <div className="text-muted-foreground text-sm text-center py-4">
                No positions currently held
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm font-semibold mb-2">Current Holdings</div>
                {portfolio.map((position) => (
                  <div
                    key={position.symbol}
                    className="flex items-center justify-between p-2 bg-secondary/50 rounded"
                  >
                    <div>
                      <div className="font-semibold">{position.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {position.quantity} shares @ ${position.avg_entry_price.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      {position.market_value && (
                        <div className="font-semibold">
                          ${position.market_value.toLocaleString()}
                        </div>
                      )}
                      {position.unrealized_pnl !== null && (
                        <div
                          className={`text-xs ${
                            position.unrealized_pnl >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {position.unrealized_pnl >= 0 ? "+" : ""}
                          ${position.unrealized_pnl.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
