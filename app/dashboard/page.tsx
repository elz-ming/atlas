import { getUserProfile } from '@/lib/permissions';
import { getUserOrders, getUserPositions } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatCurrency, formatDateTime, getOrderStatusColor, toTitleCase, getAutonomyLevelLabel } from '@/lib/utils';
import { EmptyState, EmptyIcon } from '@/components/shared/EmptyState';
import { DollarSign, TrendingUp, FileText, Clock, Brain, Zap, Target, Activity } from 'lucide-react';

export default async function DashboardPage() {
  const profile = await getUserProfile();
  
  if (!profile) {
    return null; // Layout will handle redirect
  }

  // Fetch recent orders and positions
  const orders = await getUserOrders(profile.id, { limit: 5 });
  const positions = await getUserPositions(profile.id, 'paper');
  const pendingOrders = orders.filter(o => o.status === 'proposed');

  // Mock data for portfolio
  const portfolioValue = 50000;
  const todayPnL = 234.50;
  const todayPnLPercent = 0.47;

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-8">
      {/* Welcome Header with Gradient */}
      <div className="relative">
        <h1 className="text-4xl font-bold gradient-orange">
          Welcome back, {profile.full_name || 'Trader'}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">{currentDate}</p>
      </div>

      {/* Premium Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Portfolio Value Card */}
        <div className="stat-card group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
          <p className="text-3xl font-bold">{formatCurrency(portfolioValue)}</p>
        </div>

        {/* Today's P&L Card */}
        <div className="stat-card group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-profit/10 rounded-xl group-hover:bg-profit/20 transition-colors">
              <TrendingUp className="w-6 h-6 text-profit" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Today&apos;s P&L</p>
          <p className="text-3xl font-bold text-profit">{formatCurrency(todayPnL, true)}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-profit" />
            <span className="text-sm text-profit font-medium">{todayPnLPercent}%</span>
          </div>
        </div>

        {/* Open Positions Card */}
        <div className="stat-card group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors">
              <FileText className="w-6 h-6 text-accent" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Open Positions</p>
          <p className="text-3xl font-bold">{positions.length}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {positions.length === 0 ? 'No positions yet' : 'Active holdings'}
          </p>
        </div>

        {/* Pending Approvals Card */}
        <div className="stat-card group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-500/10 rounded-xl group-hover:bg-orange-200 dark:group-hover:bg-orange-500/20 transition-colors">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            {pendingOrders.length > 0 && (
              <Badge variant="live" className="animate-pulse-orange">
                {pendingOrders.length}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">Pending Approvals</p>
          <p className="text-3xl font-bold">{pendingOrders.length}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {pendingOrders.length === 0 ? 'All caught up' : 'Awaiting review'}
          </p>
        </div>
      </div>

      {/* Premium Quick Actions */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/watchlist">
            <Button variant="glow" size="lg" className="gap-2">
              <Target className="w-4 h-4" />
              Create Watchlist
            </Button>
          </Link>
          <Link href="/dashboard/orders">
            <Button variant="outline" size="lg" className="gap-2">
              <Activity className="w-4 h-4" />
              View All Orders
            </Button>
          </Link>
          <Link href="/dashboard/settings">
            <Button variant="outline" size="lg" className="gap-2">
              <Zap className="w-4 h-4" />
              Adjust Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity - Premium */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          {orders.length === 0 ? (
            <EmptyState
              icon={<EmptyIcon />}
              title="No trading activity yet"
              description="Start by creating a watchlist to track stocks!"
            />
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/50 hover:glow-orange transition-all cursor-pointer group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-terminal font-bold text-lg group-hover:text-primary transition-colors">
                        {order.symbol}
                      </span>
                      <Badge
                        variant={order.side === 'buy' || order.side === 'cover' ? 'profit' : 'loss'}
                      >
                        {toTitleCase(order.side)}
                      </Badge>
                      <Badge className={getOrderStatusColor(order.status)}>
                        {toTitleCase(order.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.quantity} shares • {formatDateTime(order.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <Link href="/dashboard/orders">
                <Button variant="ghost" size="sm" className="w-full mt-2 hover:bg-primary/10 hover:text-primary">
                  View All Orders →
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* AI Agent Status - Premium */}
        <div className="glass-card p-6 rounded-2xl ai-glow border-2 border-primary/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">AI Agent Status</h3>
            <Badge variant="live" className="gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-orange" />
              Active
            </Badge>
          </div>
          
          <div className="space-y-6">
            {/* Current Mode */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current Mode</p>
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <Brain className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {getAutonomyLevelLabel(1)} Mode
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Agent proposes trades, you approve each one
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Status */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                <Activity className="w-5 h-5 text-primary animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Monitoring Markets</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Last check: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-card rounded-lg border border-border text-center">
                  <p className="text-2xl font-bold text-primary">23</p>
                  <p className="text-xs text-muted-foreground mt-1">Proposals Today</p>
                </div>
                <div className="p-3 bg-card rounded-lg border border-border text-center">
                  <p className="text-2xl font-bold text-profit">78%</p>
                  <p className="text-xs text-muted-foreground mt-1">Success Rate</p>
                </div>
              </div>
            </div>

            {/* Tip */}
            <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20">
              <div className="flex gap-2">
                <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Tip
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Adjust your autonomy level in Settings to give the agent more or less control
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

