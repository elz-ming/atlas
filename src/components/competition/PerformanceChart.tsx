"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DailyPerformance, getPerformanceData } from "@/lib/api/competition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AGENT_COLORS = {
  "Gemini 3 Flash": "#3b82f6",      // Blue
  "Gemini 3 Pro": "#8b5cf6",        // Purple
  "Gemini 2.5 Flash": "#10b981",    // Green
  "Gemini 2.5 Pro": "#f59e0b",      // Orange
};

export function PerformanceChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadPerformanceData();
  }, [days]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const rawData = await getPerformanceData(days);

      // Transform data for recharts: group by date
      const dataByDate: Record<string, any> = {};

      rawData.forEach((perf: DailyPerformance) => {
        const date = perf.trading_date;

        if (!dataByDate[date]) {
          dataByDate[date] = { date };
        }

        // Use competitor name as key for equity value
        dataByDate[date][perf.competitor_name] = perf.equity;
      });

      // Convert to array and sort by date
      const chartData = Object.values(dataByDate).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setData(chartData);
    } catch (err) {
      console.error("Failed to load performance data:", err);
      setError(err instanceof Error ? err.message : "Failed to load chart data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <button
              onClick={loadPerformanceData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>Equity progression for all competing AI agents (log scale)</CardDescription>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setDays(7)}
              className={`px-3 py-1 rounded text-sm ${
                days === 7 ? "bg-primary text-primary-foreground" : "bg-secondary"
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setDays(30)}
              className={`px-3 py-1 rounded text-sm ${
                days === 30 ? "bg-primary text-primary-foreground" : "bg-secondary"
              }`}
            >
              30D
            </button>
            <button
              onClick={() => setDays(90)}
              className={`px-3 py-1 rounded text-sm ${
                days === 90 ? "bg-primary text-primary-foreground" : "bg-secondary"
              }`}
            >
              90D
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              className="text-xs"
            />
            <YAxis
              scale="log"
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
              className="text-xs"
            />
            <Tooltip
              formatter={(value: number | undefined) => 
                value !== undefined ? [`$${value.toLocaleString()}`, "Equity"] : ["N/A", "Equity"]
              }
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
            />
            <Legend />
            {Object.entries(AGENT_COLORS).map(([name, color]) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={color}
                strokeWidth={2}
                dot={false}
                name={name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
