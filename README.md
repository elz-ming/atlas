# Atlas - AI-Powered Swing Trading Platform

Atlas is an AI-powered swing trading platform for US equities, built as a thesis project demonstrating agentic AI implementation in fintech.

**Phase 2 Status**: ✅ Agent Intelligence Layer Complete - Ready for Friday Demo

## 🎯 Project Vision

Atlas demonstrates how AI agents can assist traders while maintaining human control through enforced decision boundaries and complete auditability.

**Core Principles:**
1. **Intelligence**: AI agent analyzes markets using real data and explains decisions
2. **Human-in-the-Loop**: Agent proposes, human approves - no backdoors
3. **Auditability**: Complete execution traces for regulatory compliance

## 🏗️ Architecture

### Data Split: "Facts vs Thoughts"
- **Supabase (PostgreSQL)**: "Facts" - user profiles, orders, approvals, audit logs
- **MongoDB**: "Thoughts" - agent reasoning, tool calls, execution traces
- **Yahoo Finance**: Real-time market data with intelligent caching

### Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Authentication**: Clerk (Google OAuth, JWT)
- **Agent**: Google Gemini Flash 3
- **Databases**: Supabase (facts), MongoDB (thoughts)
- **Market Data**: Yahoo Finance (via yahoo-finance2)

## 🚀 Quick Start

### Phase 1: Authentication & Database (Completed)
See [`Knowledge/002_QUICK_START.md`](Knowledge/002_QUICK_START.md) for initial setup.

### Phase 2: Agent Intelligence Layer (NEW!)

**For Friday Demo**, follow [`Knowledge/007_FRIDAY_DEMO_IMPLEMENTATION.md`](Knowledge/007_FRIDAY_DEMO_IMPLEMENTATION.md).

**Quick Setup:**
```bash
# 1. Install dependencies
npm install

# 2. Add to .env.local (in addition to Phase 1 vars):
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=atlas_production
GOOGLE_AI_API_KEY=AIzaSy...

# 3. Run Supabase migration
cd supabase
npx supabase db push

# 4. Initialize MongoDB collections
npm run setup:mongo

# 5. Activate new dashboard
mv app/dashboard/page.tsx app/dashboard/page_old.tsx
mv app/dashboard/page_new.tsx app/dashboard/page.tsx

# 6. Start development
npm run dev
```

## 🤖 Agent Intelligence Demo

**Demo Flow:**
1. **User**: "Should I buy NVDA?"
2. **Agent**: 
   - Fetches real market data from Yahoo Finance
   - Calculates technical indicators (RSI, MACD, MAs)
   - Analyzes trends, sentiment, risks
   - Generates proposal with confidence score
3. **Human**: Reviews reasoning, approves or rejects
4. **System**: Logs everything to MongoDB for auditability

**What Makes It Special:**
- Real market data (not mocked)
- Transparent reasoning (every decision explained)
- Enforced boundary (no automatic execution)
- Complete audit trail (MongoDB traces)

## 📚 Documentation

All documentation is in the [`Knowledge/`](Knowledge/) folder:

- **[000_INDEX.md](Knowledge/000_INDEX.md)** - Complete documentation index
- **[001_SETUP.md](Knowledge/001_SETUP.md)** - Initial project setup
- **[002_QUICK_START.md](Knowledge/002_QUICK_START.md)** - Getting started guide
- **[003_DESIGN_SYSTEM.md](Knowledge/003_DESIGN_SYSTEM.md)** - MooMoo orange theme
- **[007_FRIDAY_DEMO_IMPLEMENTATION.md](Knowledge/007_FRIDAY_DEMO_IMPLEMENTATION.md)** - **Friday demo guide** ⭐

## 🎨 Design System

Custom MooMoo orange-themed design with:
- **Light Mode**: Orange accents on white/cream
- **Dark Mode**: Orange accents on rich charcoal
- **Components**: Glass morphism, glow effects, smooth animations
- **Typography**: Terminal font for stock symbols, clean sans-serif for UI

## 🔐 Security & Permissions

**Role-Based Access:**
- **Trader**: Can analyze markets, approve own trades, view own history
- **Admin**: Can view all orders, access audit logs, view agent traces
- **SuperAdmin**: Full system access, user management

**Data Security:**
- Row-Level Security (RLS) in Supabase
- JWT-based authentication via Clerk
- Service role keys never exposed to client
- MongoDB connection strings server-side only

## 🧪 Testing the Demo

**Success Criteria:**
- [ ] Submit "Should I buy NVDA?" and get proposal
- [ ] See agent status transitions (ANALYZING → AWAITING APPROVAL)
- [ ] View complete reasoning with technical signals
- [ ] Approve trade and see it in Recent Decisions
- [ ] Switch to Admin View
- [ ] Open trace viewer and see MongoDB trace
- [ ] Explain data architecture (Facts vs Thoughts)

## 📊 Project Structure

```
atlas/
├── app/                          # Next.js App Router
│   ├── dashboard/                # Trader view (NEW: agent interface)
│   ├── admin/                    # Admin view (NEW: trace viewer)
│   └── api/                      # API routes
│       └── agent/                # NEW: Agent endpoints
├── src/
│   ├── lib/
│   │   ├── mongodb.ts            # NEW: MongoDB connection
│   │   ├── marketData.ts         # NEW: Yahoo Finance integration
│   │   └── agent/
│   │       └── orchestrator.ts   # NEW: Gemini agent
│   └── components/
│       ├── trader/               # NEW: Agent UI components
│       └── admin/                # NEW: Trace viewer
├── supabase/
│   └── migrations/
│       ├── 001_complete_schema_with_clerk_jwt.sql
│       └── 002_agent_fields.sql  # NEW: Agent-related fields
├── Knowledge/                    # Documentation
└── scripts/
    └── setup-mongodb.ts          # NEW: MongoDB initialization
```

## 🎯 Thesis Contribution

Atlas demonstrates:
1. **Agentic AI in Fintech**: Real-world application of LLM-based agents
2. **Human-AI Collaboration**: Enforced decision boundaries
3. **Explainable AI**: Transparent reasoning and audit trails
4. **Data Architecture**: Separation of facts (SQL) and thoughts (NoSQL)
5. **Regulatory Compliance**: Complete auditability for financial systems

## 🛠️ Development

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint

# Setup MongoDB
npm run setup:mongo
```

## 📝 License

This is a thesis project. All rights reserved.

## 🙏 Acknowledgments

Built with:
- Next.js & Vercel
- Clerk Authentication
- Supabase
- MongoDB Atlas
- Google Gemini
- Yahoo Finance
- shadcn/ui

---

**Ready for Friday Demo!** 🚀

For complete demo instructions, see [`Knowledge/007_FRIDAY_DEMO_IMPLEMENTATION.md`](Knowledge/007_FRIDAY_DEMO_IMPLEMENTATION.md).
