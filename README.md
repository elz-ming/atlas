# Atlas - AI-Powered Trading Platform

[![Phase 1](https://img.shields.io/badge/Phase-1-blue)](https://github.com) [![Paper Trading](https://img.shields.io/badge/Trading-Paper%20Only-green)](https://github.com) [![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/) [![MooMoo](https://img.shields.io/badge/Powered%20by-MooMoo-orange)](https://moomoo.com/)

Atlas is an AI-powered swing trading platform for US equities with a beautiful MooMoo orange-themed design. This is the **Phase 1** implementation focusing on paper trading with a hard deadline of April 12, 2025.

## 📚 Documentation

**All detailed documentation is in the [`Knowledge/`](./Knowledge) folder!**

- **[000_INDEX.md](./Knowledge/000_INDEX.md)** - Complete documentation index
- **[001_SETUP.md](./Knowledge/001_SETUP.md)** - Setup and installation guide
- **[002_QUICK_START.md](./Knowledge/002_QUICK_START.md)** - Quick start guide
- **[003_DESIGN_SYSTEM.md](./Knowledge/003_DESIGN_SYSTEM.md)** - Design system reference (★ Use this!)
- **[004_THEME_IMPLEMENTATION.md](./Knowledge/004_THEME_IMPLEMENTATION.md)** - Technical details
- **[005_THEME_UPDATES_V2.md](./Knowledge/005_THEME_UPDATES_V2.md)** - Latest updates
- **[006_PROJECT_SUMMARY.md](./Knowledge/006_PROJECT_SUMMARY.md)** - Project overview

## 🎯 Project Status

**Phase 1 - Paper Trading Prototype** ✅ In Development

- ✅ Authentication system (Clerk with Google OAuth + JWT integration)
- ✅ User profile management with role-based access
- ✅ Trader dashboard with watchlists, orders, positions
- ✅ Admin panel for user and order management
- ✅ SuperAdmin controls for system-wide management
- ✅ Database schema with Row Level Security
- ✅ **Premium MooMoo orange theme with light/dark modes**
- ✅ **Glass morphism UI with AI-focused design**
- 🔄 AI agent integration (coming next)
- 🔄 MooMoo broker connection (Phase 2)

## 🏗️ Tech Stack

- **Frontend**: Next.js 16+ (App Router, TypeScript, Tailwind CSS v4)
- **UI Components**: shadcn/ui with custom MooMoo orange theme
- **Authentication**: Clerk (Google OAuth + JWT templates)
- **Database**: Supabase (PostgreSQL with RLS)
- **Styling**: Tailwind CSS v4, Lucide Icons, Glass morphism
- **Theme**: next-themes (light/dark mode support)
- **Deployment**: Vercel (recommended)

## 📋 Table of Contents

- [Documentation](#-documentation)
- [Quick Start](#-quick-start)
- [Design System](#-design-system)
- [Tech Stack](#️-tech-stack)
- [User Roles](#-user-roles)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Development](#-development)

**For detailed guides, see the [`Knowledge/`](./Knowledge) folder!**

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp env.template .env.local
# Edit .env.local with your Clerk and Supabase keys

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

**For complete setup instructions, see [Knowledge/001_SETUP.md](./Knowledge/001_SETUP.md)**

## 🎨 Design System

Atlas features a **premium MooMoo orange theme** with:
- 🧡 **MooMoo Orange** (`#FF6B00`) as primary color
- 🌓 **Beautiful light & dark modes**
- ✨ **Glass morphism effects**
- 🤖 **AI-focused design elements**
- 💎 **Premium fintech aesthetic**

**Component Showcase:** Visit `/showcase` to see all components in action!

**For complete design documentation, see [Knowledge/003_DESIGN_SYSTEM.md](./Knowledge/003_DESIGN_SYSTEM.md)**

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

**For detailed setup and configuration, see:**
- **[Knowledge/001_SETUP.md](./Knowledge/001_SETUP.md)** - Complete installation guide
- **[Knowledge/002_QUICK_START.md](./Knowledge/002_QUICK_START.md)** - Quick start guide

## 📁 Project Structure

```
atlas/
├── Knowledge/                   # 📚 Documentation folder
│   ├── 000_INDEX.md            # Documentation index
│   ├── 001_SETUP.md            # Setup guide
│   ├── 002_QUICK_START.md      # Quick start
│   ├── 003_DESIGN_SYSTEM.md    # Design system (★)
│   ├── 004_THEME_IMPLEMENTATION.md
│   ├── 005_THEME_UPDATES_V2.md
│   └── 006_PROJECT_SUMMARY.md
├── app/                        # Next.js App Router
│   ├── api/webhooks/clerk/    # Clerk webhook
│   ├── dashboard/             # Trader pages
│   ├── admin/                 # Admin pages
│   ├── superadmin/            # SuperAdmin pages
│   ├── showcase/              # Component showcase
│   ├── globals.css            # Tailwind v4 theme
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
├── src/
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   └── alert.tsx
│   │   ├── shared/            # Shared components
│   │   ├── theme-provider.tsx # Theme context
│   │   └── theme-toggle.tsx   # Light/dark toggle
│   └── lib/
│       ├── supabase.ts        # DB client (JWT)
│       ├── permissions.ts     # Role utilities
│       └── utils.ts           # Helpers
├── supabase/
│   ├── migrations/
│   │   └── 001_complete_schema_with_clerk_jwt.sql
│   └── README.md
├── proxy.ts                   # Clerk middleware
├── env.template
└── README.md                  # This file
```

## 👥 User Roles

Atlas has three role levels with increasing permissions:

### 🔵 Trader (Default)
- Default role assigned to all new users
- Access to personal dashboard
- Manage watchlists, view orders, adjust settings
- Cannot access admin functions

### 🟣 Admin
- All trader permissions
- View all users and their data
- Platform-wide analytics
- Monitor system health

### 🔴 SuperAdmin
- All admin permissions
- Promote/demote users
- Can switch between Trader/Admin/SuperAdmin views
- System-wide configuration (Phase 2+)

### How to Promote Users

Run these SQL commands in Supabase SQL Editor:

```sql
-- Promote to Admin
UPDATE profiles SET role = 'admin' WHERE clerk_id = 'user_xxxxx';

-- Promote to SuperAdmin
UPDATE profiles SET role = 'superadmin' WHERE clerk_id = 'user_xxxxx';

-- Demote to Trader
UPDATE profiles SET role = 'trader' WHERE clerk_id = 'user_xxxxx';
```

Get the `clerk_id` from:
- Admin Users page (visible in table)
- Clerk Dashboard > Users > click user > copy User ID

## ✨ Features

### Phase 1 (Current)

#### For Traders
- 📊 **Dashboard**: Portfolio overview, P&L tracking, quick stats
- 👀 **Watchlists**: Create and manage stock watchlists
- 📋 **Orders**: View order history with filters and status tracking
- 💼 **Positions**: Track current holdings and unrealized P&L
- ⚙️ **Settings**: Configure autonomy levels and risk parameters
  - Observer (Level 0): Watch only
  - Copilot (Level 1): Approve each trade
  - Guarded Auto (Level 2): Auto-trade with limits
  - Full Auto (Level 3): Fully autonomous

#### For Admins
- 👥 **User Management**: View all users, roles, and activity
- 📊 **Analytics**: Platform-wide metrics and insights
- 📈 **Order Monitoring**: See all orders across users
- 🎯 **Top Symbols**: Track most traded stocks

#### For SuperAdmins
- 🔄 **View Toggle**: Switch between Trader/Admin/SuperAdmin views
- 👑 **Admin Management**: Promote/demote users
- 🛠️ **System Config**: Global settings (Phase 2+)

### Coming in Phase 2-6
- 🤖 AI agent integration with real reasoning
- 📱 MooMoo broker connection (live trading)
- 📧 Email/SMS notifications
- 📊 Advanced charts and technical indicators
- 🔔 Real-time market data
- 📱 Mobile responsive improvements

## 🐛 Troubleshooting

**For troubleshooting guides, see:**
- **[Knowledge/001_SETUP.md](./Knowledge/001_SETUP.md)** - Setup issues
- **[Knowledge/002_QUICK_START.md](./Knowledge/002_QUICK_START.md)** - Common problems

## 🚢 Deployment

**For deployment instructions, see [Knowledge/001_SETUP.md](./Knowledge/001_SETUP.md)**

Quick steps:
1. Push to GitHub
2. Deploy to Vercel
3. Add environment variables
4. Update Clerk webhook URL

## 📝 Key Highlights

### ✨ Premium Design
- **MooMoo Orange Theme** - Professional fintech aesthetic
- **Glass Morphism UI** - Depth and sophistication
- **AI-Focused Elements** - Rotating glows, animations
- **Light & Dark Modes** - Both look stunning

### 🔒 Security
- Clerk JWT integration with Supabase RLS
- Row Level Security on all tables
- Role-based access control
- Auto-profile creation with race condition handling

### 🚀 Performance
- React Server Components by default
- Optimized database queries with indexes
- Tailwind CSS v4 for faster builds
- Next.js 16 with Turbopack

### 📚 Documentation
- **Complete guides** in `Knowledge/` folder
- **Component showcase** at `/showcase`
- **Design system reference** for developers

## 🤝 Contributing

This is a thesis project with a hard deadline. External contributions are not accepted at this time.

## 📄 License

Proprietary - All rights reserved for thesis purposes.

## 📚 Learn More

**Start here:**
1. **[Knowledge/000_INDEX.md](./Knowledge/000_INDEX.md)** - Documentation index
2. **[Knowledge/003_DESIGN_SYSTEM.md](./Knowledge/003_DESIGN_SYSTEM.md)** - Design system (must-read!)
3. Visit `/showcase` in your browser - See all components in action

**Useful links:**
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Clerk Docs](https://clerk.com/docs)
- [Supabase Docs](https://supabase.com/docs)

---

**Built with 🧡 for the April 12, 2025 deadline**

**MooMoo Orange Theme • Premium Fintech UI • AI-Powered Trading**
