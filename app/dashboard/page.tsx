'use client';

import { useDashboard } from '@/app/context/DashboardContext';
import { usePrices } from '@/app/context/PriceContext';
import { useEffect } from 'react';
import { MetricStat } from '@/components/yuzuriha/MetricStat';
import { SignalStrengthBar } from '@/components/yuzuriha/SignalStrengthBar';
import { PriceDisplay } from '@/components/yuzuriha/PriceDisplay';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, TrendingUp, TrendingDown } from 'lucide-react';

export default function DashboardPage() {
  const { watchlist } = useDashboard();
  const { subscribe, getPrice } = usePrices();

  // Subscribe to watchlist prices
  useEffect(() => {
    subscribe(watchlist);
  }, [watchlist, subscribe]);

  const selectedAsset = watchlist[0] || 'BTC';
  const price = getPrice(selectedAsset);

  // Mock stats
  const stats = {
    totalPnl: 2847.50,
    pnlPercent: 12.4,
    winRate: 68.5,
    trades: 21,
    signals: 156,
    activeSignals: 5,
  };

  return (
    <div className="h-full overflow-auto">
      {/* Gradient divider for visual rhythm */}
      <div className="gradient-divider h-px" />
      
      {/* 3-Column Grid Layout */}
      <div className="grid h-full grid-cols-1 gap-6 p-6 lg:grid-cols-12">
        {/* LEFT COLUMN - Strong Signals & Watchlist */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          {/* Strong Signals */}
          <div className="glass-card">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Strong signals
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/10 backdrop-blur-sm p-3 transition-all duration-200 ease-in-out hover:bg-success/20 hover:border-success/50">
                <div>
                  <div className="text-sm font-semibold">BTC/USDT</div>
                  <div className="text-xs text-muted-foreground">1h timeframe</div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-xs font-bold text-success">85%</span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 backdrop-blur-sm p-3 transition-all duration-200 ease-in-out hover:bg-destructive/20 hover:border-destructive/50">
                <div>
                  <div className="text-sm font-semibold">ETH/USDT</div>
                  <div className="text-xs text-muted-foreground">4h timeframe</div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span className="text-xs font-bold text-destructive">72%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Watch list */}
          <div className="glass-card">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Prices
            </h2>
            <div className="space-y-3">
              {watchlist.slice(0, 5).map((symbol) => {
                const p = getPrice(symbol);
                return (
                  <div
                    key={symbol}
                    className="flex items-start justify-between rounded-lg border border-border bg-secondary p-2 cursor-pointer hover:bg-secondary/80 transition-colors"
                  >
                    <div>
                      <div className="font-mono text-sm font-bold">{symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        ${p?.current.toFixed(2) || '---'}
                      </div>
                    </div>
                    <div className={`text-xs font-semibold ${p?.changePercent24h ?? 0 >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {p?.changePercent24h ?? 0 >= 0 ? '+' : ''}{p?.changePercent24h?.toFixed(2) || '0.00'}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN - Trading Interface */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* Asset Header */}
          <div className="glass-card-lg">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{selectedAsset}</h1>
                <p className="text-xs text-muted-foreground">Live price from CoinGecko</p>
              </div>
              <div className="text-right">
                {price ? (
                  <PriceDisplay
                    price={price.current}
                    change24h={price.current * (price.changePercent24h / 100)}
                    changePercent24h={price.changePercent24h}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground animate-pulse">
                    Loading price...
                  </div>
                )}
              </div>
            </div>

            {/* Signal Strength */}
            <div className="mb-6">
              <SignalStrengthBar confidence={85} label="TradingView signal" />
            </div>

            {/* Buy/Sell Tabs */}
            <Tabs defaultValue="buy" className="mb-6">
              <TabsList className="grid w-full grid-cols-2 bg-secondary/50 backdrop-blur-sm">
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell">Sell</TabsTrigger>
              </TabsList>

              <TabsContent value="buy" className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-medium mb-2 text-muted-foreground">
                    Timeframe
                  </label>
                  <select className="w-full rounded-md border border-border/50 bg-secondary/50 backdrop-blur-sm px-3 py-2 text-sm transition-all duration-200 ease-in-out hover:border-accent/50">
                    <option>1m</option>
                    <option>5m</option>
                    <option>15m</option>
                    <option selected>1h</option>
                    <option>4h</option>
                    <option>1d</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-2 text-muted-foreground">
                    Position size
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    defaultValue="1.0"
                    className="w-full rounded-md border border-border/50 bg-secondary/50 backdrop-blur-sm px-3 py-2 text-sm transition-all duration-200 ease-in-out hover:border-accent/50"
                  />
                </div>
                <Button className="w-full gap-2 bg-success hover:bg-success/90 btn-particle-hover">
                  <Zap className="h-4 w-4" />
                  Pre-schedule buy
                </Button>
              </TabsContent>

              <TabsContent value="sell" className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-medium mb-2 text-muted-foreground">
                    Timeframe
                  </label>
                  <select className="w-full rounded-md border border-border/50 bg-secondary/50 backdrop-blur-sm px-3 py-2 text-sm transition-all duration-200 ease-in-out hover:border-accent/50">
                    <option>1m</option>
                    <option>5m</option>
                    <option>15m</option>
                    <option selected>1h</option>
                    <option>4h</option>
                    <option>1d</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-2 text-muted-foreground">
                    Position size
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    defaultValue="1.0"
                    className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm"
                  />
                </div>
                <Button className="w-full gap-2 bg-destructive hover:bg-destructive/90">
                  <Zap className="h-4 w-4" />
                  Pre-schedule sell
                </Button>
              </TabsContent>
            </Tabs>

            {/* Claude Analysis */}
            <div className="glass-card border-accent/20 hover:border-accent/40">
              <h3 className="mb-2 text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                Claude AI analysis
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Strong bullish momentum on the 1h timeframe. Multiple confluence factors: price above key moving average, RSI in overbought territory with potential rejection. Recommend awaiting pullback to support zone before entering. Confidence: 78%.
              </p>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="glass-card-lg h-64 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                TradingView chart embed
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Configure in settings
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Active Signals & Stats */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          {/* Active Signals */}
          <div className="glass-card">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Waiting to execute
            </h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/10 backdrop-blur-sm p-3 transition-all duration-200 ease-in-out hover:bg-success/20">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">SOL/USDT</div>
                  <div className="text-xs text-muted-foreground">Buy • 1.5 SOL</div>
                </div>
                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs hover:bg-success/30">
                  Execute
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 backdrop-blur-sm p-3 transition-all duration-200 ease-in-out hover:bg-destructive/20">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">XRP/USDT</div>
                  <div className="text-xs text-muted-foreground">Sell • 50 XRP</div>
                </div>
                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs hover:bg-destructive/30">
                  Execute
                </Button>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="space-y-3">
            <MetricStat
              label="Total PNL"
              value={`$${stats.totalPnl.toLocaleString()}`}
              change={stats.pnlPercent}
              isPositive={true}
            />
            <MetricStat
              label="Win rate"
              value={`${stats.winRate}%`}
              change={2.3}
              isPositive={true}
            />
            <MetricStat
              label="Closed trades"
              value={stats.trades}
            />
            <MetricStat
              label="Total signals"
              value={stats.signals}
            />
            <MetricStat
              label="Active signals"
              value={stats.activeSignals}
            />
          </div>

          {/* Market Overview */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Market overview
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">BTC dominance</span>
                <span className="font-semibold">45.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Fear & Greed</span>
                <span className="font-semibold">67 (Greedy)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">24h volume</span>
                <span className="font-semibold">$89.2B</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
