/**
 * MongoDB Connection and Utilities for Agent "Thoughts"
 * 
 * Collections:
 * - agent_runs: Complete agent execution traces
 * - market_data_cache: Cached market data from Yahoo Finance
 * 
 * Indexes:
 * - agent_runs: run_id (unique), user_id, timestamp (desc)
 * - market_data_cache: symbol, timestamp (desc), expires_at (TTL)
 */

import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

// Check for required environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

const uri = MONGODB_URI || 'mongodb://localhost:27017'; // Dummy URI to prevent module load crash
const dbName = MONGODB_DB_NAME || 'atlas_production';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getMongoClient(): Promise<MongoClient> {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined. Please add it to your .env.local file. See SETUP_NEXT_STEPS.md for instructions.');
  }
  return clientPromise;
}

export async function getDatabase(): Promise<Db> {
  if (!MONGODB_URI || !MONGODB_DB_NAME) {
    throw new Error('MongoDB is not configured. Please add MONGODB_URI and MONGODB_DB_NAME to your .env.local file. See SETUP_NEXT_STEPS.md for setup instructions.');
  }
  const client = await getMongoClient();
  return client.db(dbName);
}

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ToolCall {
  tool: string;
  symbol: string;
  data_source: string;
  timestamp: Date;
  cache_hit: boolean;
  result: Record<string, unknown>;
  duration_ms?: number;
}

export interface AgentReasoning {
  technical_signals: string[];
  trend_analysis: string;
  sentiment: string;
  risk_factors: string[];
}

export interface TradeProposal {
  action: 'BUY' | 'SELL' | 'HOLD';
  symbol: string;
  quantity: number;
  entry_price: number;
  stop_loss: number;
  target_price: number;
  confidence: number;
  holding_window: string;
}

export interface AgentRun {
  _id?: ObjectId;
  run_id: string; // UUID
  user_id: string; // Clerk ID
  timestamp: Date;
  input: string; // User intent
  agent_status: 'ANALYZING' | 'PROPOSING' | 'COMPLETED' | 'ERROR';
  tools_called: ToolCall[];
  reasoning: AgentReasoning;
  proposal?: TradeProposal;
  evidence_links: string[];
  error?: string;
  duration_ms: number;
  created_at: Date;
}

export interface MarketDataCache {
  _id?: ObjectId;
  symbol: string;
  timestamp: Date;
  source: string;
  data: Record<string, unknown>; // Raw Yahoo Finance response
  processed: {
    current_price: number;
    change_percent: number;
    volume: number;
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
  };
  expires_at: Date; // TTL index
}

// ============================================
// COLLECTION ACCESSORS
// ============================================

export async function getAgentRunsCollection(): Promise<Collection<AgentRun>> {
  const db = await getDatabase();
  return db.collection<AgentRun>('agent_runs');
}

export async function getMarketDataCacheCollection(): Promise<Collection<MarketDataCache>> {
  const db = await getDatabase();
  return db.collection<MarketDataCache>('market_data_cache');
}

// ============================================
// AGENT RUN OPERATIONS
// ============================================

/**
 * Save complete agent execution trace to MongoDB
 */
export async function saveAgentRun(trace: Omit<AgentRun, '_id'>): Promise<string> {
  try {
    const collection = await getAgentRunsCollection();
    const result = await collection.insertOne({
      ...trace,
      created_at: new Date(),
    } as AgentRun);
    
    console.log(`✅ Agent run saved to MongoDB: ${trace.run_id}`);
    return result.insertedId.toString();
  } catch (error) {
    console.error('❌ Error saving agent run to MongoDB:', error);
    throw error;
  }
}

/**
 * Get specific agent run by run_id
 */
export async function getAgentRun(runId: string): Promise<AgentRun | null> {
  try {
    const collection = await getAgentRunsCollection();
    return await collection.findOne({ run_id: runId });
  } catch (error) {
    console.error('❌ Error fetching agent run:', error);
    throw error;
  }
}

/**
 * Get all agent runs for a specific user
 */
export async function getAgentRunsByUser(
  userId: string,
  limit: number = 10
): Promise<AgentRun[]> {
  try {
    const collection = await getAgentRunsCollection();
    return await collection
      .find({ user_id: userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error('❌ Error fetching user agent runs:', error);
    throw error;
  }
}

/**
 * Get latest agent run for a user
 */
export async function getLatestAgentRun(userId: string): Promise<AgentRun | null> {
  try {
    const collection = await getAgentRunsCollection();
    return await collection.findOne(
      { user_id: userId },
      { sort: { timestamp: -1 } }
    );
  } catch (error) {
    console.error('❌ Error fetching latest agent run:', error);
    throw error;
  }
}

/**
 * Get agent run statistics for admin dashboard
 */
export async function getAgentStats(since?: Date): Promise<{
  total_runs: number;
  runs_with_proposals: number;
  average_confidence: number;
  unique_users: number;
}> {
  try {
    const collection = await getAgentRunsCollection();
    const matchStage = since ? { timestamp: { $gte: since } } : {};
    
    const stats = await collection.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total_runs: { $sum: 1 },
          runs_with_proposals: {
            $sum: { $cond: [{ $ne: ['$proposal', null] }, 1, 0] }
          },
          avg_confidence: { $avg: '$proposal.confidence' },
          unique_users: { $addToSet: '$user_id' }
        }
      },
      {
        $project: {
          total_runs: 1,
          runs_with_proposals: 1,
          average_confidence: { $round: ['$avg_confidence', 2] },
          unique_users: { $size: '$unique_users' }
        }
      }
    ]).toArray();

    return (stats[0] as { total_runs: number; runs_with_proposals: number; average_confidence: number; unique_users: number } | undefined) || {
      total_runs: 0,
      runs_with_proposals: 0,
      average_confidence: 0,
      unique_users: 0
    };
  } catch (error) {
    console.error('❌ Error fetching agent stats:', error);
    throw error;
  }
}

// ============================================
// MARKET DATA CACHE OPERATIONS
// ============================================

/**
 * Get cached market data if fresh (< 15 minutes old)
 */
export async function getCachedMarketData(symbol: string): Promise<MarketDataCache | null> {
  try {
    const collection = await getMarketDataCacheCollection();
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    return await collection.findOne({
      symbol: symbol.toUpperCase(),
      timestamp: { $gte: fifteenMinutesAgo }
    });
  } catch (error) {
    console.error('❌ Error fetching cached market data:', error);
    return null;
  }
}

/**
 * Save market data to cache
 */
export async function cacheMarketData(data: Omit<MarketDataCache, '_id'>): Promise<void> {
  try {
    const collection = await getMarketDataCacheCollection();
    await collection.insertOne(data as MarketDataCache);
    console.log(`✅ Market data cached for ${data.symbol}`);
  } catch (error) {
    console.error('❌ Error caching market data:', error);
    // Don't throw - caching is not critical
  }
}

// ============================================
// INITIALIZATION & INDEXES
// ============================================

/**
 * Initialize MongoDB collections and indexes
 * Call this during app startup or in a setup script
 */
export async function initializeMongoCollections(): Promise<void> {
  try {
    const db = await getDatabase();
    
    // Create agent_runs indexes
    const agentRuns = db.collection('agent_runs');
    await agentRuns.createIndex({ run_id: 1 }, { unique: true });
    await agentRuns.createIndex({ user_id: 1 });
    await agentRuns.createIndex({ timestamp: -1 });
    
    // Create market_data_cache indexes
    const marketCache = db.collection('market_data_cache');
    await marketCache.createIndex({ symbol: 1 });
    await marketCache.createIndex({ timestamp: -1 });
    await marketCache.createIndex(
      { expires_at: 1 },
      { expireAfterSeconds: 0 } // TTL index
    );
    
    console.log('✅ MongoDB collections and indexes initialized');
  } catch (error) {
    console.error('❌ Error initializing MongoDB collections:', error);
    throw error;
  }
}

export default clientPromise;

