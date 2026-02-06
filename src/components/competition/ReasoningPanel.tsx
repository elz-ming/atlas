"use client";

import { useEffect, useState } from "react";
import { Reasoning, getAgentReasoning, getCompetitors, Competitor } from "@/lib/api/competition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, AlertTriangle, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ReasoningPanel() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [reasoningType, setReasoningType] = useState<string>("all");
  const [reasoning, setReasoning] = useState<Reasoning[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompetitors();
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      loadReasoning();
    }
  }, [selectedAgent, reasoningType]);

  const loadCompetitors = async () => {
    try {
      const data = await getCompetitors();
      setCompetitors(data);
      if (data.length > 0) {
        setSelectedAgent(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load competitors:", err);
    }
  };

  const loadReasoning = async () => {
    if (!selectedAgent) return;

    try {
      setLoading(true);
      setError(null);

      const type = reasoningType === "all" ? undefined : reasoningType;
      const data = await getAgentReasoning(selectedAgent, type, 10);
      setReasoning(data);
    } catch (err) {
      console.error("Failed to load reasoning:", err);
      setError(err instanceof Error ? err.message : "Failed to load reasoning");
    } finally {
      setLoading(false);
    }
  };

  const getReasoningIcon = (type: string) => {
    if (type === "market_analysis") return <TrendingUp className="h-4 w-4" />;
    if (type === "risk_assessment") return <AlertTriangle className="h-4 w-4" />;
    if (type === "decision") return <Target className="h-4 w-4" />;
    return <Brain className="h-4 w-4" />;
  };

  const getReasoningColor = (type: string) => {
    if (type === "market_analysis") return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
    if (type === "risk_assessment") return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300";
    if (type === "decision") return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  const selectedCompetitor = competitors.find((c) => c.id === selectedAgent);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          Explainable AI - Agent Reasoning
        </CardTitle>
        <CardDescription>See why AI agents make their trading decisions</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Agent & Type Selection */}
        <div className="flex gap-4 mb-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Select Agent</label>
            <select
              value={selectedAgent || ""}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md"
            >
              {competitors.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Reasoning Type</label>
            <select
              value={reasoningType}
              onChange={(e) => setReasoningType(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md"
            >
              <option value="all">All Types</option>
              <option value="market_analysis">Market Analysis</option>
              <option value="risk_assessment">Risk Assessment</option>
              <option value="decision">Trade Decisions</option>
            </select>
          </div>
        </div>

        {/* Reasoning List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">
            <p>{error}</p>
            <button
              onClick={loadReasoning}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        ) : reasoning.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">
            No reasoning records found for this agent yet.
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {reasoning.map((item, index) => (
              <div
                key={index}
                className="p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge className={getReasoningColor(item.reasoning_type)}>
                    <span className="flex items-center gap-1">
                      {getReasoningIcon(item.reasoning_type)}
                      {item.reasoning_type.replace("_", " ").toUpperCase()}
                    </span>
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {item.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedCompetitor && (
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
            <strong>{selectedCompetitor.name}</strong> uses {selectedCompetitor.model_id} to
            analyze markets, assess risks, and make trading decisions with full transparency.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
