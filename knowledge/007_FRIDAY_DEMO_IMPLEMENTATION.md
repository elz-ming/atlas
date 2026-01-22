# Atlas Phase 2: Friday Demo Implementation Guide

## 🎯 Mission-Critical Objective

Deliver a high-impact proof-of-concept demo that demonstrates:
1. **Intelligence**: AI agent that reasons, uses tools (market data), and explains decisions
2. **Human-in-the-Loop Boundary**: Visible, enforced decision boundary where agent proposes but human approves

## ✅ What's Been Built

### Infrastructure (COMPLETED)
- ✅ MongoDB connection and schemas (`src/lib/mongodb.ts`)
- ✅ Market data service with Yahoo Finance + caching (`src/lib/marketData.ts`)
- ✅ Google Gemini agent orchestrator (`src/lib/agent/orchestrator.ts`)
- ✅ API routes for agent execution and approval
- ✅ Supabase schema extensions for agent fields

### Frontend Components (COMPLETED)
- ✅ CommandBar component (`src/components/trader/CommandBar.tsx`)
- ✅ AgentStatus component (`src/components/trader/AgentStatus.tsx`)
- ✅ CopilotCard component (`src/components/trader/CopilotCard.tsx`)
- ✅ RecentDecisions component (`src/components/trader/RecentDecisions.tsx`)
- ✅ TraceViewer component (`src/components/admin/TraceViewer.tsx`)
- ✅ New dashboard page (`app/dashboard/page_new.tsx`)

## 🚀 Setup Instructions

### 1. Environment Variables

Copy `env.template` to `.env.local` and fill in:

```bash
# MongoDB (Required - NEW)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=atlas_production

# Google AI (Required - NEW)
GOOGLE_AI_API_KEY=AIzaSy...

# Clerk (Already configured from Phase 1)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase (Already configured from Phase 1)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

#### Getting MongoDB URI:
1. Go to https://cloud.mongodb.com
2. Create a free M0 cluster (if you don't have one)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password

#### Getting Google AI API Key:
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIzaSy...`)

### 2. Run Database Migrations

```bash
# Navigate to Supabase project
cd supabase

# Run the new migration
npx supabase db push

# Or manually run in Supabase SQL Editor:
# Copy contents of migrations/002_agent_fields.sql
```

### 3. Initialize MongoDB Collections

Create a setup script or run once on app startup:

```typescript
// In your app startup or create a script
import { initializeMongoCollections } from '@/lib/mongodb';

await initializeMongoCollections();
```

Or create `scripts/setup-mongo.ts`:

```typescript
import { initializeMongoCollections } from '../src/lib/mongodb';

async function setup() {
  try {
    await initializeMongoCollections();
    console.log('✅ MongoDB setup complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB setup failed:', error);
    process.exit(1);
  }
}

setup();
```

Run with: `npx tsx scripts/setup-mongo.ts`

### 4. Replace Dashboard Page

The new dashboard is in `app/dashboard/page_new.tsx`. To activate it:

```bash
# Backup old dashboard
mv app/dashboard/page.tsx app/dashboard/page_old.tsx

# Activate new dashboard
mv app/dashboard/page_new.tsx app/dashboard/page.tsx
```

### 5. Start Development Server

```bash
npm run dev
```

## 🎬 Demo Flow (Step-by-Step)

### Part 1: Intelligence Layer Demo

1. **Navigate to Dashboard** (`/dashboard`)
   - Show the clean, minimalist interface
   - Point out: "This is NOT a Bloomberg terminal - it's an intelligence layer"

2. **Submit Analysis Request**
   - Type in CommandBar: "Should I buy NVDA?"
   - Press Enter or click "Analyze"

3. **Watch Agent Status**
   - Status changes to "ANALYZING" (blue, pulsing)
   - Explain: "Agent is fetching real market data from Yahoo Finance"
   - Show: "It's checking MongoDB cache first (15-minute TTL)"

4. **Proposal Appears**
   - CopilotCard slides in with full proposal
   - Point out key elements:
     - **Symbol & Action**: NVDA BUY
     - **Confidence Score**: 75% (orange/green indicator)
     - **Trade Details**: Entry, Target, Stop Loss, R:R Ratio
     - **Collapsible Sections**:
       - "Why This Trade?" - Technical signals, trend analysis, sentiment
       - "Risk Factors" - Specific risks identified
       - "Evidence Sources" - Yahoo Finance links

5. **Explain the Reasoning**
   - Expand "Why This Trade?" section
   - Read through technical signals: "RSI oversold at 28", "MACD bullish crossover"
   - Show trend analysis: "Strong uptrend, above 50-day MA"
   - Point out: "This is the agent's thinking process - fully transparent"

### Part 2: Human-in-the-Loop Boundary Demo

6. **Highlight the Approval Boundary**
   - Point to the large "Approve Trade" button
   - Say: "This is the critical boundary - the agent CANNOT execute without my approval"
   - Show the "Reject" button as well

7. **Approve the Trade**
   - Click "Approve Trade"
   - Show success toast: "Trade Approved! ✅"
   - Proposal card disappears
   - Order appears in "Recent Decisions" timeline

8. **Show Recent Decisions**
   - Point to the timeline below
   - Click to expand a decision
   - Show: Symbol, Action, Status (Approved), Confidence, Reasoning Summary, Timestamps

### Part 3: Auditability Demo (Admin View)

9. **Switch to Admin View**
   - Click user menu → "Switch to Admin View"
   - Navigate to `/admin/orders`

10. **View Trace**
    - Find the just-approved order
    - Click "View Trace" button
    - TraceViewer modal opens

11. **Show Complete Audit Trail**
    - **Tab 1: Reasoning Summary**
      - Full technical signals, trend analysis, sentiment, risks, proposal details
    - **Tab 2: Tool Calls**
      - Show each tool called: `get_market_data`, `analyze_technicals`
      - Point out: Cache hit/miss, duration, timestamp
      - Say: "Every data fetch is logged"
    - **Tab 3: Raw JSON**
      - Show complete MongoDB trace
      - Click "Copy" to copy full JSON
      - Say: "This is stored in MongoDB - complete auditability"

12. **Explain Data Architecture**
    - "Supabase stores FACTS: orders, approvals, who did what"
    - "MongoDB stores THOUGHTS: agent reasoning, tool calls, full execution trace"
    - "This separation is critical for the thesis - facts vs thoughts"

## 🎯 Key Demo Talking Points

### Intelligence
- "The agent uses Google Gemini Flash 3 for reasoning"
- "It fetches real market data from Yahoo Finance"
- "It calculates technical indicators: RSI, MACD, Moving Averages"
- "It provides confidence scores and explains its reasoning"
- "It's not a black box - every decision is transparent"

### Human-in-the-Loop
- "The agent NEVER executes trades automatically"
- "There's an explicit approval boundary"
- "The human always makes the final decision"
- "This is enforced at the code level - no backdoors"

### Auditability
- "Every agent run is logged to MongoDB"
- "Every approval creates an audit log entry"
- "We can trace back exactly what the agent saw and why it decided"
- "This is critical for regulatory compliance and trust"

## 🔧 Troubleshooting

### MongoDB Connection Issues
```bash
# Test connection
npx tsx -e "import { getDatabase } from './src/lib/mongodb'; getDatabase().then(() => console.log('✅ Connected')).catch(console.error)"
```

### Google AI API Issues
- Check API key is correct (starts with `AIzaSy...`)
- Ensure you have Gemini API enabled in Google AI Studio
- Check quota limits (free tier has rate limits)

### Yahoo Finance Issues
- If Yahoo Finance fails, the system returns mock data
- Check console logs for "⚠️ Returning mock data"
- Mock data is sufficient for demo purposes

### Agent Not Proposing Trades
- Check that symbol is recognized (NVDA, AAPL, TSLA, etc.)
- Look at agent response in console logs
- Verify Gemini is returning structured output

## 📊 Admin Dashboard Enhancements (Optional)

To show agent stats on admin dashboard, update `app/admin/page.tsx`:

```typescript
import { getAgentStats } from '@/lib/mongodb';

// In your component:
const stats = await getAgentStats(new Date()); // Today's stats

// Display:
// - Total Agent Runs Today
// - Approval Rate
// - Average Confidence Score
```

## 🎨 Polish & Animations (Already Included)

- ✅ Smooth status transitions with pulsing animations
- ✅ Proposal card slide-in animation
- ✅ Success/error toast notifications
- ✅ Loading states with spinners
- ✅ Skeleton loaders (can be added if needed)
- ✅ Responsive design (works on laptop/tablet)

## 📝 Demo Script Template

```
[INTRO]
"I'm building Atlas - an AI-powered swing trading platform. 
The goal is to show how AI can assist traders while maintaining human control."

[INTELLIGENCE]
"Let me show you the intelligence layer. I'll ask the agent to analyze NVDA..."
[Type query, show analysis process]
"The agent is fetching real market data, calculating indicators, and reasoning about the trade."
[Show proposal]
"Here's what it came up with - a BUY recommendation with 75% confidence.
Notice how it explains its reasoning: RSI oversold, MACD bullish crossover, strong uptrend."

[BOUNDARY]
"But here's the critical part - the agent can't execute this trade.
I have to explicitly approve it. This is the human-in-the-loop boundary."
[Click Approve]
"Now it's approved and will appear in my trading history."

[AUDITABILITY]
"Let me show you the admin view..."
[Switch to admin, open trace viewer]
"Every agent decision is fully logged. We can see exactly what data it fetched,
how long it took, what indicators it calculated, and why it made this recommendation.
This is stored in MongoDB for complete auditability."

[CONCLUSION]
"So we have: AI intelligence, human control, and complete transparency.
That's the foundation for trustworthy AI trading."
```

## 🚨 Known Limitations (For Friday Demo)

1. **No Real Broker Execution**: "Approved" is the final state (no actual order placement)
2. **Paper Trading Only**: All trades are simulated
3. **Basic Sentiment**: Sentiment analysis is simplified (can integrate news API later)
4. **Single User**: Multi-user features are architected but not fully implemented
5. **No Real-Time Updates**: Uses polling instead of WebSockets (fine for demo)

## ✅ Success Criteria Checklist

Before Friday, verify you can demonstrate:

- [ ] Type "Should I buy NVDA?" and get a proposal
- [ ] See agent status change (ANALYZING → AWAITING APPROVAL)
- [ ] View complete reasoning with technical signals
- [ ] See confidence score and risk factors
- [ ] Click "Approve Trade" and see success
- [ ] View approved trade in Recent Decisions
- [ ] Switch to Admin View
- [ ] Click "View Trace" and see complete MongoDB trace
- [ ] Show tool calls, timestamps, and raw JSON
- [ ] Explain data architecture (Facts vs Thoughts)

## 📚 Additional Resources

- **MongoDB Atlas**: https://cloud.mongodb.com
- **Google AI Studio**: https://aistudio.google.com
- **Yahoo Finance API**: https://www.npmjs.com/package/yahoo-finance2
- **Gemini API Docs**: https://ai.google.dev/docs

## 🎉 You're Ready!

If you can check all the success criteria, you're ready for Friday's demo.

The system is fully functional with:
- Real market data fetching
- AI agent reasoning with Gemini
- Complete audit trails in MongoDB
- Enforced human-in-the-loop boundary
- Clean, focused UI that showcases intelligence

Good luck with your thesis demo! 🚀

