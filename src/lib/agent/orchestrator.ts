/**
 * Atlas Agent Orchestrator - Core Intelligence Layer
 * 
 * Uses Google Gemini Flash 3 via @google/generative-ai
 * Implements Think → Act → Observe loop
 * 
 * Agent Responsibilities:
 * - Interpret user intent (natural language command)
 * - Call market data tools (Yahoo Finance)
 * - Reason about technical signals, trends, sentiment, risks
 * - Propose trades (NEVER execute - enforced boundary)
 * - Explain reasoning in human-readable format
 * - Provide confidence scores for proposals
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getMarketData, analyzeTechnicalSignals, determineTrend, getBasicSentiment, identifyRiskFactors } from '../marketData';
import { AgentReasoning, TradeProposal, ToolCall } from '../mongodb';

if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error('GOOGLE_AI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// ============================================
// AGENT SYSTEM PROMPT
// ============================================

const ATLAS_SYSTEM_PROMPT = `You are Atlas, an AI trading assistant designed to analyze markets and propose swing trades for US equities.

CORE PRINCIPLES:
1. You NEVER execute trades. You only analyze and propose.
2. You always explain your reasoning using technical signals, trends, and risks.
3. You provide confidence scores (0-1) for each proposal.
4. You cite evidence sources (Yahoo Finance links, indicators used).
5. You are cautious and risk-aware - human approval is required.

YOUR CAPABILITIES:
- Analyze real-time market data from Yahoo Finance
- Evaluate technical indicators (RSI, MACD, Moving Averages)
- Assess trend direction and momentum
- Identify risk factors and volatility
- Propose swing trades (3-7 day holding windows)

RESPONSE FORMAT:
When analyzing a stock, structure your response as:

1. **Technical Signals**: List specific indicators (RSI, MACD, MAs)
2. **Trend Analysis**: Describe the overall trend and momentum
3. **Sentiment**: Current market sentiment for this stock
4. **Risk Factors**: Identify specific risks and concerns
5. **Proposal**: If conditions are favorable, propose a trade:
   - Action: BUY, SELL, or HOLD
   - Quantity: Reasonable position size
   - Entry Price: Current market price
   - Stop Loss: Risk management level
   - Target Price: Profit target
   - Confidence: 0.0 to 1.0 (be honest about uncertainty)
   - Holding Window: Expected duration (e.g., "3-7 days")

IMPORTANT:
- If conditions are not favorable, recommend HOLD and explain why
- Be specific with numbers (prices, percentages, quantities)
- Cite the indicators you used in your analysis
- Explain your confidence score honestly
- Consider risk-reward ratio in all proposals

Remember: You are a copilot, not an autopilot. The human makes the final decision.`;

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface OrchestratorInput {
  userId: string;
  userIntent: string;
  runId?: string; // Optional - generated if not provided
}

export interface OrchestratorOutput {
  runId: string;
  status: 'ANALYZING' | 'PROPOSING' | 'COMPLETED' | 'ERROR';
  reasoning: AgentReasoning;
  proposal?: TradeProposal;
  evidence_links: string[];
  tools_called: ToolCall[];
  raw_trace: {
    user_intent: string;
    agent_response: string;
    tool_calls: ToolCall[];
    processing_time_ms: number;
  };
  error?: string;
}

// ============================================
// TOOL DEFINITIONS
// ============================================

/**
 * Extract stock symbol from user intent
 * Simple regex-based extraction - can be enhanced with NLP
 */
function extractSymbol(intent: string): string | null {
  // Common company name mappings (check first for better accuracy)
  const nameMap: Record<string, string> = {
    'nvidia': 'NVDA',
    'apple': 'AAPL',
    'tesla': 'TSLA',
    'microsoft': 'MSFT',
    'amazon': 'AMZN',
    'google': 'GOOGL',
    'meta': 'META',
    'netflix': 'NFLX',
    'amd': 'AMD',
    'intel': 'INTC',
    'facebook': 'META'
  };
  
  const lowerIntent = intent.toLowerCase();
  for (const [name, symbol] of Object.entries(nameMap)) {
    if (lowerIntent.includes(name)) {
      return symbol;
    }
  }
  
  // Look for ticker symbols: "NVDA", "AAPL", "TSLA", etc.
  // Match 2-5 uppercase letters that are not common words
  const symbolMatch = intent.match(/\b([A-Z]{2,5})\b/);
  if (symbolMatch) {
    const symbol = symbolMatch[1];
    // Exclude common words that might be mistaken for tickers
    const excludeWords = ['I', 'A', 'THE', 'AND', 'OR', 'FOR', 'TO', 'IN', 'IS', 'IT', 'AI'];
    if (!excludeWords.includes(symbol)) {
      return symbol;
    }
  }
  
  return null;
}

/**
 * Call market data tool
 */
async function callMarketDataTool(symbol: string): Promise<ToolCall> {
  const startTime = Date.now();
  
  try {
    const data = await getMarketData(symbol);
    const duration = Date.now() - startTime;
    
    return {
      tool: 'get_market_data',
      symbol: symbol.toUpperCase(),
      data_source: 'yahoo_finance',
      timestamp: new Date(),
      cache_hit: data.cache_hit,
      result: {
        current_price: data.current_price,
        change_percent: data.change_percent,
        volume: data.volume,
        indicators: data.indicators,
        price_history: data.price_history
      },
      duration_ms: duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      tool: 'get_market_data',
      symbol: symbol.toUpperCase(),
      data_source: 'yahoo_finance',
      timestamp: new Date(),
      cache_hit: false,
      result: { error: error instanceof Error ? error.message : 'Unknown error' },
      duration_ms: duration
    };
  }
}

/**
 * Analyze technicals tool
 */
async function analyzeTechnicalsTool(symbol: string): Promise<ToolCall> {
  const startTime = Date.now();
  
  try {
    const data = await getMarketData(symbol);
    const signals = analyzeTechnicalSignals(data);
    const trend = determineTrend(data);
    const sentiment = getBasicSentiment(data);
    const risks = identifyRiskFactors(data);
    const duration = Date.now() - startTime;
    
    return {
      tool: 'analyze_technicals',
      symbol: symbol.toUpperCase(),
      data_source: 'yahoo_finance',
      timestamp: new Date(),
      cache_hit: data.cache_hit,
      result: {
        technical_signals: signals,
        trend_analysis: trend,
        sentiment,
        risk_factors: risks
      },
      duration_ms: duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      tool: 'analyze_technicals',
      symbol: symbol.toUpperCase(),
      data_source: 'yahoo_finance',
      timestamp: new Date(),
      cache_hit: false,
      result: { error: error instanceof Error ? error.message : 'Unknown error' },
      duration_ms: duration
    };
  }
}

// ============================================
// AGENT ORCHESTRATOR
// ============================================

/**
 * Main orchestrator function
 * Runs the Think → Act → Observe loop
 */
export async function runOrchestratorAgent(input: OrchestratorInput): Promise<OrchestratorOutput> {
  const runId = input.runId || uuidv4();
  const startTime = Date.now();
  
  console.log(`🤖 [${runId}] Starting Atlas agent for user: ${input.userId}`);
  console.log(`💬 User intent: "${input.userIntent}"`);
  
  const toolsCalled: ToolCall[] = [];
  const evidenceLinks: string[] = [];
  
  try {
    // Step 1: Extract symbol from intent
    const symbol = extractSymbol(input.userIntent);
    if (!symbol) {
      return {
        runId,
        status: 'ERROR',
        reasoning: {
          technical_signals: [],
          trend_analysis: '',
          sentiment: '',
          risk_factors: []
        },
        evidence_links: [],
        tools_called: [],
        raw_trace: {
          user_intent: input.userIntent,
          agent_response: 'Error: Could not identify a stock symbol in your request. Please include a ticker symbol (e.g., NVDA, AAPL).',
          tool_calls: [],
          processing_time_ms: Date.now() - startTime
        },
        error: 'No symbol found in user intent'
      };
    }
    
    console.log(`📊 [${runId}] Identified symbol: ${symbol}`);
    
    // Step 2: Fetch market data
    console.log(`🔧 [${runId}] Calling market data tool for ${symbol}...`);
    const marketDataCall = await callMarketDataTool(symbol);
    toolsCalled.push(marketDataCall);
    evidenceLinks.push(`https://finance.yahoo.com/quote/${symbol}`);
    
    if (marketDataCall.result.error) {
      throw new Error(`Market data fetch failed: ${marketDataCall.result.error}`);
    }
    
    // Step 3: Analyze technicals
    console.log(`🔧 [${runId}] Analyzing technicals for ${symbol}...`);
    const technicalsCall = await analyzeTechnicalsTool(symbol);
    toolsCalled.push(technicalsCall);
    
    if (technicalsCall.result.error) {
      throw new Error(`Technical analysis failed: ${technicalsCall.result.error}`);
    }
    
    // Step 4: Prepare context for Gemini
    const marketData = marketDataCall.result;
    const technicals = technicalsCall.result as {
      technical_signals: string[];
      trend_analysis: string;
      sentiment: string;
      risk_factors: string[];
    };
    
    const contextForAI = `
USER REQUEST: "${input.userIntent}"

MARKET DATA FOR ${symbol}:
- Current Price: $${(marketData as Record<string, unknown>).current_price}
- Daily Change: ${(marketData as Record<string, unknown>).change_percent}%
- Volume: ${((marketData as Record<string, unknown>).volume as number | undefined)?.toLocaleString() || 'N/A'}
- 52-Week High: $${((marketData as Record<string, unknown>).price_history as Record<string, unknown> | undefined)?.week_52_high || 'N/A'}
- 52-Week Low: $${((marketData as Record<string, unknown>).price_history as Record<string, unknown> | undefined)?.week_52_low || 'N/A'}

TECHNICAL INDICATORS:
- RSI: ${((marketData as Record<string, unknown>).indicators as Record<string, unknown> | undefined)?.rsi || 'N/A'}
- MACD: ${(((marketData as Record<string, unknown>).indicators as Record<string, unknown> | undefined)?.macd as Record<string, unknown> | undefined)?.value || 'N/A'} (Signal: ${(((marketData as Record<string, unknown>).indicators as Record<string, unknown> | undefined)?.macd as Record<string, unknown> | undefined)?.signal || 'N/A'})
- 50-day MA: $${(((marketData as Record<string, unknown>).indicators as Record<string, unknown> | undefined)?.moving_averages as Record<string, unknown> | undefined)?.ma_50 || 'N/A'}
- 200-day MA: $${(((marketData as Record<string, unknown>).indicators as Record<string, unknown> | undefined)?.moving_averages as Record<string, unknown> | undefined)?.ma_200 || 'N/A'}

TECHNICAL SIGNALS:
${technicals.technical_signals.join('\n')}

TREND ANALYSIS:
${technicals.trend_analysis}

SENTIMENT:
${technicals.sentiment}

RISK FACTORS:
${technicals.risk_factors.join('\n')}

Based on this data, provide your analysis and trade proposal (BUY, SELL, or HOLD) following the response format in your system prompt.
`;

    // Step 5: Call Gemini
    console.log(`🧠 [${runId}] Calling Gemini for reasoning...`);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: ATLAS_SYSTEM_PROMPT }]
        },
        {
          role: 'model',
          parts: [{ text: 'Understood. I am Atlas, your AI trading copilot. I will analyze markets, provide reasoning, and propose trades for your approval. I will never execute trades without your explicit approval.' }]
        }
      ]
    });
    
    const result = await chat.sendMessage(contextForAI);
    const agentResponse = result.response.text();
    
    console.log(`✅ [${runId}] Gemini response received`);
    
    // Step 6: Parse response into structured format
    const parsed = parseAgentResponse(agentResponse, marketData, technicals);
    
    const processingTime = Date.now() - startTime;
    
    console.log(`🎉 [${runId}] Agent run completed in ${processingTime}ms`);
    
    return {
      runId,
      status: parsed.proposal ? 'COMPLETED' : 'PROPOSING',
      reasoning: parsed.reasoning,
      proposal: parsed.proposal,
      evidence_links: evidenceLinks,
      tools_called: toolsCalled,
      raw_trace: {
        user_intent: input.userIntent,
        agent_response: agentResponse,
        tool_calls: toolsCalled,
        processing_time_ms: processingTime
      }
    };
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [${runId}] Agent error:`, error);
    
    return {
      runId,
      status: 'ERROR',
      reasoning: {
        technical_signals: [],
        trend_analysis: '',
        sentiment: '',
        risk_factors: []
      },
      evidence_links: evidenceLinks,
      tools_called: toolsCalled,
      raw_trace: {
        user_intent: input.userIntent,
        agent_response: '',
        tool_calls: toolsCalled,
        processing_time_ms: processingTime
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Parse agent response into structured format
 * Extract reasoning and proposal from Gemini's text response
 */
function parseAgentResponse(
  response: string,
  marketData: Record<string, unknown>,
  technicals: {
    technical_signals: string[];
    trend_analysis: string;
    sentiment: string;
    risk_factors: string[];
  }
): {
  reasoning: AgentReasoning;
  proposal?: TradeProposal;
} {
  // Use the structured data we already have
  const reasoning: AgentReasoning = {
    technical_signals: technicals.technical_signals,
    trend_analysis: technicals.trend_analysis,
    sentiment: technicals.sentiment,
    risk_factors: technicals.risk_factors
  };
  
  // Parse proposal from response (look for BUY/SELL/HOLD action)
  const actionMatch = response.match(/Action:\s*(BUY|SELL|HOLD)/i);
  const action = actionMatch ? actionMatch[1].toUpperCase() as 'BUY' | 'SELL' | 'HOLD' : 'HOLD';
  
  // Extract confidence (look for percentage or decimal)
  const confidenceMatch = response.match(/Confidence:\s*(\d+(?:\.\d+)?)/i);
  const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5;
  const normalizedConfidence = confidence > 1 ? confidence / 100 : confidence;
  
  // Extract quantity
  const quantityMatch = response.match(/Quantity:\s*(\d+)/i);
  const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 10;
  
  // Only create proposal if action is BUY or SELL
  let proposal: TradeProposal | undefined;
  if (action === 'BUY' || action === 'SELL') {
    const currentPrice = typeof marketData.current_price === 'number' ? marketData.current_price : 100;
    
    proposal = {
      action,
      symbol: typeof marketData.symbol === 'string' ? marketData.symbol : 'UNKNOWN',
      quantity,
      entry_price: currentPrice,
      stop_loss: action === 'BUY' ? currentPrice * 0.95 : currentPrice * 1.05,
      target_price: action === 'BUY' ? currentPrice * 1.10 : currentPrice * 0.90,
      confidence: normalizedConfidence,
      holding_window: '3-7 days'
    };
  }
  
  return { reasoning, proposal };
}

/**
 * UUID generator (inline implementation)
 */
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

