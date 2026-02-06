/**
 * API client for AI Agent Competition endpoints.
 * 
 * All endpoints are public (no authentication required).
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || false;

export interface Competitor {
  id: string;
  name: string;
  model_id: string;
  description: string | null;
  initial_capital: number;
  current_equity: number;
  total_return: number;
  sharpe_ratio: number | null;
  max_drawdown: number | null;
  win_rate: number | null;
  total_trades: number;
  started_at: string;
  last_trade_at: string | null;
}

export interface DailyPerformance {
  competitor_id: string;
  competitor_name: string;
  trading_date: string;
  equity: number;
  daily_return: number | null;
  cumulative_return: number | null;
}

export interface LeaderboardEntry {
  rank: number;
  competitor_id: string;
  name: string;
  model_id: string;
  equity: number;
  total_return: number;
  win_rate: number | null;
  total_trades: number;
}

export interface Position {
  symbol: string;
  quantity: number;
  avg_entry_price: number;
  current_price: number | null;
  unrealized_pnl: number | null;
  market_value: number | null;
  weight: number | null;
}

export interface Trade {
  id: string;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  total_amount: number;
  reasoning_summary: string | null;
  confidence_score: number | null;
  executed_at: string;
}

export interface Reasoning {
  reasoning_type: string;
  content: string;
  created_at: string;
}

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================

const MOCK_COMPETITORS: Competitor[] = [
  {
    id: '1',
    name: 'Gemini 3 Flash',
    model_id: 'gemini-3-flash-preview',
    description: 'Pro-level intelligence at Flash speed',
    initial_capital: 30000,
    current_equity: 31850,
    total_return: 6.17,
    sharpe_ratio: 1.42,
    max_drawdown: -2.3,
    win_rate: 68.5,
    total_trades: 23,
    started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    last_trade_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Gemini 3 Pro',
    model_id: 'gemini-3-pro-preview',
    description: 'Best for complex tasks with advanced reasoning',
    initial_capital: 30000,
    current_equity: 32400,
    total_return: 8.0,
    sharpe_ratio: 1.68,
    max_drawdown: -1.8,
    win_rate: 75.0,
    total_trades: 16,
    started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    last_trade_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Gemini 2.5 Flash',
    model_id: 'gemini-2.5-flash',
    description: 'Fast and efficient trading decisions',
    initial_capital: 30000,
    current_equity: 30650,
    total_return: 2.17,
    sharpe_ratio: 0.95,
    max_drawdown: -3.1,
    win_rate: 58.3,
    total_trades: 28,
    started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    last_trade_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Gemini 2.5 Pro',
    model_id: 'gemini-2.5-pro',
    description: 'Advanced thinking model for deep analysis',
    initial_capital: 30000,
    current_equity: 31200,
    total_return: 4.0,
    sharpe_ratio: 1.18,
    max_drawdown: -2.5,
    win_rate: 64.7,
    total_trades: 17,
    started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    last_trade_at: new Date().toISOString(),
  },
];

const generateMockPerformanceData = (days: number): DailyPerformance[] => {
  const data: DailyPerformance[] = [];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  MOCK_COMPETITORS.forEach(comp => {
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Simulate equity growth with some volatility
      const baseGrowth = (comp.total_return / 100) * comp.initial_capital;
      const progress = i / days;
      const volatility = (Math.random() - 0.5) * 500;
      const equity = comp.initial_capital + (baseGrowth * progress) + volatility;
      
      const dailyReturn = i === 0 ? 0 : ((equity - (comp.initial_capital + (baseGrowth * (i - 1) / days))) / comp.initial_capital) * 100;
      
      data.push({
        competitor_id: comp.id,
        competitor_name: comp.name,
        trading_date: date.toISOString().split('T')[0],
        equity: equity,
        daily_return: dailyReturn,
        cumulative_return: ((equity - comp.initial_capital) / comp.initial_capital) * 100,
      });
    }
  });
  
  return data;
};

const MOCK_LEADERBOARD: LeaderboardEntry[] = MOCK_COMPETITORS
  .sort((a, b) => b.current_equity - a.current_equity)
  .map((comp, index) => ({
    rank: index + 1,
    competitor_id: comp.id,
    name: comp.name,
    model_id: comp.model_id,
    equity: comp.current_equity,
    total_return: comp.total_return,
    win_rate: comp.win_rate,
    total_trades: comp.total_trades,
  }));

const MOCK_POSITIONS: Record<string, Position[]> = {
  '1': [
    { symbol: 'AAPL', quantity: 50, avg_entry_price: 185.20, current_price: 190.50, unrealized_pnl: 265, market_value: 9525, weight: 29.9 },
    { symbol: 'MSFT', quantity: 40, avg_entry_price: 420.80, current_price: 425.30, unrealized_pnl: 180, market_value: 17012, weight: 53.4 },
    { symbol: 'GOOGL', quantity: 30, avg_entry_price: 148.50, current_price: 152.20, unrealized_pnl: 111, market_value: 4566, weight: 14.3 },
  ],
  '2': [
    { symbol: 'NVDA', quantity: 60, avg_entry_price: 495.30, current_price: 520.75, unrealized_pnl: 1527, market_value: 31245, weight: 96.4 },
  ],
  '3': [
    { symbol: 'TSLA', quantity: 35, avg_entry_price: 245.10, current_price: 252.80, unrealized_pnl: 269.5, market_value: 8848, weight: 28.9 },
    { symbol: 'META', quantity: 25, avg_entry_price: 485.60, current_price: 492.30, unrealized_pnl: 167.5, market_value: 12307.5, weight: 40.2 },
    { symbol: 'AMD', quantity: 80, avg_entry_price: 118.40, current_price: 122.15, unrealized_pnl: 300, market_value: 9772, weight: 31.9 },
  ],
  '4': [
    { symbol: 'AMZN', quantity: 45, avg_entry_price: 175.30, current_price: 182.60, unrealized_pnl: 328.5, market_value: 8217, weight: 26.3 },
    { symbol: 'GOOGL', quantity: 50, avg_entry_price: 148.20, current_price: 152.20, unrealized_pnl: 200, market_value: 7610, weight: 24.4 },
  ],
};

// ============================================
// API FUNCTIONS WITH MOCK DATA FALLBACK
// ============================================

/**
 * Get current leaderboard rankings.
 */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return MOCK_LEADERBOARD;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/competition/leaderboard`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.warn('Falling back to mock data:', error);
    return MOCK_LEADERBOARD;
  }
}

/**
 * Get performance data for all agents (for charting).
 */
export async function getPerformanceData(days: number = 30): Promise<DailyPerformance[]> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateMockPerformanceData(days);
  }
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/competition/performance?days=${days}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch performance data: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.warn('Falling back to mock data:', error);
    return generateMockPerformanceData(days);
  }
}

/**
 * Get all active competitors.
 */
export async function getCompetitors(): Promise<Competitor[]> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_COMPETITORS;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/competition/competitors`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch competitors: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.warn('Falling back to mock data:', error);
    return MOCK_COMPETITORS;
  }
}

/**
 * Get portfolio for a specific agent.
 */
export async function getAgentPortfolio(competitorId: string): Promise<Position[]> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_POSITIONS[competitorId] || [];
  }
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/competition/portfolio/${competitorId}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch portfolio: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.warn('Falling back to mock data:', error);
    return MOCK_POSITIONS[competitorId] || [];
  }
}

/**
 * Get trade history for a specific agent.
 */
export async function getAgentTrades(
  competitorId: string,
  limit: number = 50
): Promise<Trade[]> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return []; // Empty for now
  }
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/competition/trades/${competitorId}?limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch trades: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.warn('Falling back to mock data:', error);
    return [];
  }
}

/**
 * Get reasoning records for explainable AI.
 */
export async function getAgentReasoning(
  competitorId: string,
  reasoningType?: string,
  limit: number = 20
): Promise<Reasoning[]> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockReasoning: Reasoning[] = [
      {
        reasoning_type: 'market_analysis',
        content: 'AAPL showing strong momentum after earnings beat. Technical indicators suggest continued uptrend with RSI at 62, MACD bullish crossover. Volume increasing on up days.',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        reasoning_type: 'risk_assessment',
        content: 'Portfolio risk within acceptable limits. VaR (95%) estimated at $1,200 for next trading day. Current drawdown of -1.8% well below max threshold of -5%. Position concentration acceptable.',
        created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      },
      {
        reasoning_type: 'decision',
        content: 'Increasing NVDA position by 10 shares. Rationale: Strong AI demand cycle, recent data center revenue growth, technical breakout above $500 resistance. Risk-reward favorable at current levels.',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
    ];
    
    return reasoningType
      ? mockReasoning.filter(r => r.reasoning_type === reasoningType)
      : mockReasoning;
  }
  
  try {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (reasoningType) {
      params.append('reasoning_type', reasoningType);
    }
    
    const response = await fetch(
      `${API_BASE_URL}/api/v1/competition/reasoning/${competitorId}?${params}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reasoning: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.warn('Falling back to mock data:', error);
    return [];
  }
}
