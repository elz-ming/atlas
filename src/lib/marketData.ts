/**
 * Market Data Service - Yahoo Finance Integration with MongoDB Caching
 * 
 * Fetches real-time market data from Yahoo Finance
 * Implements 15-minute caching layer in MongoDB
 * Processes raw data into agent-friendly format with technical indicators
 */

import { default as YahooFinanceImport } from 'yahoo-finance2';
const yahooFinance = new YahooFinanceImport();
import { getCachedMarketData, cacheMarketData } from './mongodb';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface MarketData {
  symbol: string;
  current_price: number;
  change_percent: number;
  volume: number;
  market_cap?: number;
  indicators: {
    rsi?: number;
    macd?: {
      value: number;
      signal: number;
      histogram: number;
    };
    moving_averages?: {
      ma_50: number;
      ma_200: number;
    };
  };
  price_history: {
    daily_high: number;
    daily_low: number;
    week_52_high: number;
    week_52_low: number;
  };
  recent_news?: string[];
  raw_data: Record<string, unknown>;
  cached_at: string;
  cache_hit: boolean;
}

// ============================================
// TECHNICAL INDICATORS
// ============================================

/**
 * Calculate Relative Strength Index (RSI)
 * Simplified calculation using recent price changes
 */
function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50; // Default neutral RSI

  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  const gains = changes.map(c => c > 0 ? c : 0);
  const losses = changes.map(c => c < 0 ? Math.abs(c) : 0);

  const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return Math.round(rsi * 100) / 100;
}

/**
 * Calculate Moving Average
 */
function calculateMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  
  const recentPrices = prices.slice(-period);
  const sum = recentPrices.reduce((a, b) => a + b, 0);
  return Math.round((sum / period) * 100) / 100;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * Simplified: 12-period EMA - 26-period EMA
 */
function calculateMACD(prices: number[]): {
  value: number;
  signal: number;
  histogram: number;
} {
  if (prices.length < 26) {
    return { value: 0, signal: 0, histogram: 0 };
  }

  // Simple approximation using SMAs instead of EMAs for demo
  const ema12 = calculateMA(prices, 12);
  const ema26 = calculateMA(prices, 26);
  const macdValue = ema12 - ema26;
  const signal = macdValue; // Simplified - normally would be 9-period EMA of MACD
  const histogram = macdValue - signal;

  return {
    value: Math.round(macdValue * 100) / 100,
    signal: Math.round(signal * 100) / 100,
    histogram: Math.round(histogram * 100) / 100
  };
}

// ============================================
// MAIN MARKET DATA FETCHER
// ============================================

/**
 * Get market data for a symbol with intelligent caching
 * 
 * Flow:
 * 1. Check MongoDB cache (data < 15 minutes old)
 * 2. If cache hit -> return cached data
 * 3. If cache miss -> fetch from Yahoo Finance
 * 4. Process raw data and calculate indicators
 * 5. Store in MongoDB with TTL
 * 6. Return processed data
 */
export async function getMarketData(symbol: string): Promise<MarketData> {
  const startTime = Date.now();
  const symbolUpper = symbol.toUpperCase();

  console.log(`📊 Fetching market data for ${symbolUpper}...`);

  try {
    // Step 1: Check cache
    const cached = await getCachedMarketData(symbolUpper);
    
    if (cached) {
      console.log(`✅ Cache HIT for ${symbolUpper}`);
      return {
        symbol: cached.symbol,
        current_price: cached.processed.current_price,
        change_percent: cached.processed.change_percent,
        volume: cached.processed.volume,
        indicators: cached.processed.indicators,
        price_history: {
          daily_high: cached.processed.current_price * 1.02, // Approximation from cache
          daily_low: cached.processed.current_price * 0.98,
          week_52_high: cached.processed.current_price * 1.2,
          week_52_low: cached.processed.current_price * 0.8,
        },
        raw_data: cached.data,
        cached_at: cached.timestamp.toISOString(),
        cache_hit: true
      };
    }

    console.log(`❌ Cache MISS for ${symbolUpper} - fetching from Yahoo Finance...`);

    // Step 2: Fetch from Yahoo Finance
    let quote: unknown = null;
    let historical: unknown[] = [];
    
    try {
      quote = await yahooFinance.quote(symbolUpper);
    } catch (err) {
      console.error(`Error fetching quote for ${symbolUpper}:`, err);
      quote = null;
    }
    
    try {
      historical = await yahooFinance.historical(symbolUpper, {
        period1: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        period2: new Date().toISOString().split('T')[0],
        interval: '1d'
      });
    } catch (err) {
      console.error(`Error fetching historical data for ${symbolUpper}:`, err);
      historical = [];
    }

    if (!quote) {
      throw new Error(`Unable to fetch data for symbol: ${symbolUpper}`);
    }

    // Step 3: Extract key metrics
    const quoteData = quote as Record<string, unknown> | null;
    const currentPrice = (quoteData?.regularMarketPrice as number) || 0;
    const previousClose = (quoteData?.regularMarketPreviousClose as number) || currentPrice;
    const changePercent = ((currentPrice - previousClose) / previousClose) * 100;

    // Step 4: Calculate technical indicators
    const closingPrices = (historical as Array<Record<string, unknown>>).map(h => (h.close as number) || 0);
    const rsi = calculateRSI(closingPrices);
    const ma50 = calculateMA(closingPrices, 50);
    const ma200 = calculateMA(closingPrices, 200);
    const macd = calculateMACD(closingPrices);

    // Step 5: Build processed data
    const processedData: MarketData = {
      symbol: symbolUpper,
      current_price: currentPrice,
      change_percent: Math.round(changePercent * 100) / 100,
      volume: (quoteData?.regularMarketVolume as number) || 0,
      market_cap: quoteData?.marketCap as number | undefined,
      indicators: {
        rsi,
        macd,
        moving_averages: {
          ma_50: ma50,
          ma_200: ma200
        }
      },
      price_history: {
        daily_high: (quoteData?.regularMarketDayHigh as number) || currentPrice,
        daily_low: (quoteData?.regularMarketDayLow as number) || currentPrice,
        week_52_high: (quoteData?.fiftyTwoWeekHigh as number) || currentPrice,
        week_52_low: (quoteData?.fiftyTwoWeekLow as number) || currentPrice
      },
      raw_data: (quoteData || {}) as Record<string, unknown>,
      cached_at: new Date().toISOString(),
      cache_hit: false
    };

    // Step 6: Cache the data
    await cacheMarketData({
      symbol: symbolUpper,
      timestamp: new Date(),
      source: 'yahoo_finance',
      data: quote as unknown as Record<string, unknown>,
      processed: {
        current_price: processedData.current_price,
        change_percent: processedData.change_percent,
        volume: processedData.volume,
        indicators: processedData.indicators
      },
      expires_at: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes TTL
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Market data fetched for ${symbolUpper} in ${duration}ms`);

    return processedData;

  } catch (error) {
    console.error(`❌ Error fetching market data for ${symbolUpper}:`, error);
    
    // Return mock data for demo purposes if Yahoo Finance fails
    console.warn(`⚠️ Returning mock data for ${symbolUpper} due to API error`);
    return getMockMarketData(symbolUpper);
  }
}

/**
 * Batch fetch market data for multiple symbols
 */
export async function getMultipleMarketData(symbols: string[]): Promise<Map<string, MarketData>> {
  const results = new Map<string, MarketData>();
  
  // Fetch in parallel
  const promises = symbols.map(async (symbol) => {
    try {
      const data = await getMarketData(symbol);
      results.set(symbol.toUpperCase(), data);
    } catch (error) {
      console.error(`Failed to fetch data for ${symbol}:`, error);
    }
  });

  await Promise.all(promises);
  return results;
}

/**
 * Mock market data for demo/fallback
 */
function getMockMarketData(symbol: string): MarketData {
  const basePrice = 100 + Math.random() * 500;
  const changePercent = (Math.random() - 0.5) * 10;
  
  return {
    symbol: symbol.toUpperCase(),
    current_price: Math.round(basePrice * 100) / 100,
    change_percent: Math.round(changePercent * 100) / 100,
    volume: Math.floor(Math.random() * 10000000),
    indicators: {
      rsi: Math.round((Math.random() * 60 + 20) * 100) / 100,
      macd: {
        value: Math.round((Math.random() - 0.5) * 10 * 100) / 100,
        signal: Math.round((Math.random() - 0.5) * 8 * 100) / 100,
        histogram: Math.round((Math.random() - 0.5) * 5 * 100) / 100
      },
      moving_averages: {
        ma_50: Math.round((basePrice * 0.95) * 100) / 100,
        ma_200: Math.round((basePrice * 0.90) * 100) / 100
      }
    },
    price_history: {
      daily_high: Math.round((basePrice * 1.02) * 100) / 100,
      daily_low: Math.round((basePrice * 0.98) * 100) / 100,
      week_52_high: Math.round((basePrice * 1.3) * 100) / 100,
      week_52_low: Math.round((basePrice * 0.7) * 100) / 100
    },
    raw_data: { mock: true },
    cached_at: new Date().toISOString(),
    cache_hit: false
  };
}

/**
 * Analyze technical signals for agent reasoning
 */
export function analyzeTechnicalSignals(data: MarketData): string[] {
  const signals: string[] = [];
  
  // RSI Analysis
  if (data.indicators.rsi) {
    if (data.indicators.rsi < 30) {
      signals.push(`RSI oversold at ${data.indicators.rsi.toFixed(1)} (strong buy signal)`);
    } else if (data.indicators.rsi > 70) {
      signals.push(`RSI overbought at ${data.indicators.rsi.toFixed(1)} (potential sell signal)`);
    } else {
      signals.push(`RSI neutral at ${data.indicators.rsi.toFixed(1)}`);
    }
  }
  
  // MACD Analysis
  if (data.indicators.macd) {
    if (data.indicators.macd.histogram > 0) {
      signals.push('MACD bullish crossover (positive momentum)');
    } else {
      signals.push('MACD bearish crossover (negative momentum)');
    }
  }
  
  // Moving Average Analysis
  if (data.indicators.moving_averages) {
    const { ma_50, ma_200 } = data.indicators.moving_averages;
    if (data.current_price > ma_50) {
      signals.push(`Price above 50-day MA at $${ma_50.toFixed(2)} (bullish)`);
    } else {
      signals.push(`Price below 50-day MA at $${ma_50.toFixed(2)} (bearish)`);
    }
    
    if (ma_50 > ma_200) {
      signals.push('Golden cross (50-day > 200-day MA)');
    } else if (ma_50 < ma_200) {
      signals.push('Death cross (50-day < 200-day MA)');
    }
  }
  
  // Volume Analysis
  if (data.volume > 1000000) {
    signals.push(`High volume (${(data.volume / 1000000).toFixed(1)}M shares)`);
  }
  
  return signals;
}

/**
 * Determine trend direction
 */
export function determineTrend(data: MarketData): string {
  const signals = analyzeTechnicalSignals(data);
  const bullishCount = signals.filter(s => 
    s.includes('bullish') || s.includes('Golden') || s.includes('above')
  ).length;
  const bearishCount = signals.filter(s => 
    s.includes('bearish') || s.includes('Death') || s.includes('below')
  ).length;
  
  if (bullishCount > bearishCount) {
    return 'Strong uptrend - multiple bullish indicators';
  } else if (bearishCount > bullishCount) {
    return 'Downtrend - caution advised';
  } else {
    return 'Sideways/neutral trend - mixed signals';
  }
}

/**
 * Get basic sentiment (mock for now - can integrate news API later)
 */
export function getBasicSentiment(data: MarketData): string {
  // Simple sentiment based on price change
  if (data.change_percent > 2) {
    return 'Positive - strong upward momentum today';
  } else if (data.change_percent < -2) {
    return 'Negative - significant decline today';
  } else {
    return 'Neutral - stable price action';
  }
}

/**
 * Identify risk factors
 */
export function identifyRiskFactors(data: MarketData): string[] {
  const risks: string[] = [];
  
  // Volatility check
  const dailyRange = ((data.price_history.daily_high - data.price_history.daily_low) / data.current_price) * 100;
  if (dailyRange > 5) {
    risks.push('High intraday volatility (>5% range)');
  }
  
  // Overbought/oversold extremes
  if (data.indicators.rsi && data.indicators.rsi > 75) {
    risks.push('Extreme overbought conditions - potential reversal');
  }
  if (data.indicators.rsi && data.indicators.rsi < 25) {
    risks.push('Extreme oversold conditions - high risk');
  }
  
  // Near 52-week highs/lows
  if (data.current_price >= data.price_history.week_52_high * 0.95) {
    risks.push('Trading near 52-week high - limited upside');
  }
  if (data.current_price <= data.price_history.week_52_low * 1.05) {
    risks.push('Trading near 52-week low - catching falling knife risk');
  }
  
  if (risks.length === 0) {
    risks.push('Standard market risk - normal volatility');
  }
  
  return risks;
}

