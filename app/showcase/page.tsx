import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, TradingCard } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  Zap,
  Shield,
  Target
} from "lucide-react";

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-orange bg-clip-text text-transparent mb-2">
              Atlas Design System
            </h1>
            <p className="text-muted-foreground">MooMoo Orange Theme Component Showcase</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Buttons Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default</Button>
            <Button variant="glow">Glow (CTA)</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="profit">Profit / Buy</Button>
            <Button variant="loss">Loss / Sell</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon"><Zap className="h-4 w-4" /></Button>
          </div>
        </section>

        {/* Badges Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Badges</h2>
          <div className="flex flex-wrap gap-4">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="profit">Profit</Badge>
            <Badge variant="loss">Loss</Badge>
            <Badge variant="pending">Pending</Badge>
            <Badge variant="filled">Filled</Badge>
            <Badge variant="rejected">Rejected</Badge>
            <Badge variant="paper">Paper Trading</Badge>
            <Badge variant="live">LIVE Trading</Badge>
          </div>
        </section>

        {/* Alerts Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Alerts</h2>
          
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              This is a default informational alert message.
            </AlertDescription>
          </Alert>

          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Trade Proposal</AlertTitle>
            <AlertDescription>
              AI agent proposes buying 100 shares of AAPL at $178.50. Review and approve.
            </AlertDescription>
          </Alert>

          <Alert variant="profit">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Trade Executed Successfully</AlertTitle>
            <AlertDescription>
              Your order for 50 shares of TSLA has been filled at $245.20. +$1,234.50 profit.
            </AlertDescription>
          </Alert>

          <Alert variant="loss">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Stop Loss Triggered</AlertTitle>
            <AlertDescription>
              Position closed: NVDA - 25 shares sold at $489.00. Loss: -$567.25
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to execute trade. Insufficient funds in account.
            </AlertDescription>
          </Alert>

          <Alert variant="info">
            <Info className="h-4 w-4" />
            <AlertTitle>Market Update</AlertTitle>
            <AlertDescription>
              Markets are currently closed. Orders will be queued for next trading session.
            </AlertDescription>
          </Alert>
        </section>

        {/* Cards Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Cards</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Standard Card */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Value</CardTitle>
                <CardDescription>Total account balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$50,247.82</div>
                <div className="text-sm text-profit flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4" />
                  +2.3% ($1,127.50)
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Details</Button>
              </CardFooter>
            </Card>

            {/* Trading Card with Glow */}
            <TradingCard>
              <CardHeader>
                <CardTitle>Active Positions</CardTitle>
                <CardDescription>Currently open trades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12</div>
                <div className="text-sm text-muted-foreground mt-2">
                  Total value: $38,450.00
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="glow" className="w-full">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Positions
                </Button>
              </CardFooter>
            </TradingCard>

            {/* Trading Card with Stats */}
            <TradingCard>
              <CardHeader>
                <CardTitle>Today&apos;s P&L</CardTitle>
                <CardDescription>Profit & Loss</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-profit">+$2,847.50</div>
                <div className="text-sm text-muted-foreground mt-2">
                  8 wins • 2 losses
                </div>
              </CardContent>
              <CardFooter>
                <Badge variant="profit">Profitable Day</Badge>
              </CardFooter>
            </TradingCard>

            {/* AI Agent Card */}
            <Card className="border-primary/50 glow-orange">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI Agent Status</CardTitle>
                  <Badge variant="live">Active</Badge>
                </div>
                <CardDescription>Autonomous trading mode</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mode</span>
                    <span className="font-medium">Guarded Auto</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Proposals Today</span>
                    <span className="font-medium">23</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className="font-medium text-profit">78%</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Shield className="mr-2 h-4 w-4" />
                  Configure
                </Button>
                <Button variant="glow" size="sm" className="flex-1">
                  <Target className="mr-2 h-4 w-4" />
                  Review
                </Button>
              </CardFooter>
            </Card>

            {/* Risk Management Card */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Exposure</CardTitle>
                <CardDescription>Current portfolio risk</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Risk Level</span>
                      <span className="font-medium text-primary">Moderate</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full w-[45%] bg-primary rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max Drawdown</span>
                    <span className="font-medium">-3.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sharpe Ratio</span>
                    <span className="font-medium">1.45</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Watchlist Card */}
            <TradingCard>
              <CardHeader>
                <CardTitle>Top Watchlist</CardTitle>
                <CardDescription>Most active symbols</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-terminal font-bold">AAPL</span>
                    <div className="text-right">
                      <div className="font-medium">$178.25</div>
                      <div className="text-xs text-profit">+1.2%</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-terminal font-bold">TSLA</span>
                    <div className="text-right">
                      <div className="font-medium">$245.80</div>
                      <div className="text-xs text-loss">-0.8%</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-terminal font-bold">NVDA</span>
                    <div className="text-right">
                      <div className="font-medium">$495.30</div>
                      <div className="text-xs text-profit">+2.4%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full">
                  View All Symbols
                </Button>
              </CardFooter>
            </TradingCard>
          </div>
        </section>

        {/* Typography & Utilities */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Typography & Utilities</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Trading Prices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="font-terminal text-lg">
                AAPL: <span className="text-profit">$178.25 ▲</span>
              </div>
              <div className="font-terminal text-lg">
                TSLA: <span className="text-loss">$245.80 ▼</span>
              </div>
              <div className="price-up p-2 rounded">
                Price increased animation
              </div>
              <div className="price-down p-2 rounded">
                Price decreased animation
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Glass Effect</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="glass p-4 rounded-lg">
                  Glass morphism background
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orange Gradient</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="gradient-orange p-4 rounded-lg text-white font-semibold">
                  Orange gradient background
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

