'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, TrendingDown, Download } from 'lucide-react';

export default function PortfolioPage() {
  const mockPnlData = [
    { date: '2024-01-01', pnl: 500 },
    { date: '2024-01-02', pnl: 750 },
    { date: '2024-01-03', pnl: 850 },
    { date: '2024-01-04', pnl: 600 },
    { date: '2024-01-05', pnl: 2847.50 },
  ];

  const positions = [
    {
      pair: 'BTC/USDT',
      size: 0.5,
      entry: 42150,
      current: 45230,
      pnl: 1540,
      pnlPercent: 7.3,
    },
    {
      pair: 'ETH/USDT',
      size: 5.0,
      entry: 2240,
      current: 2450,
      pnl: 1050,
      pnlPercent: 9.4,
    },
    {
      pair: 'SOL/USDT',
      size: 25.0,
      entry: 98.5,
      current: 105.2,
      pnl: 167.5,
      pnlPercent: 6.8,
    },
  ];

  const stats = [
    { label: 'Total PNL', value: '$2,847.50', change: '+12.4%', isPositive: true },
    { label: 'Win rate', value: '68.5%', change: '+2.3%', isPositive: true },
    { label: 'Sharpe ratio', value: '1.84', change: '+0.12', isPositive: true },
    { label: 'Max drawdown', value: '-8.2%', change: '-1.5%', isPositive: false },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <p className="text-sm text-muted-foreground">Live PNL tracking and performance analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">{stat.label}</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className={`text-sm font-semibold ${stat.isPositive ? 'text-success' : 'text-destructive'}`}>
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold">PNL chart</h2>
        <div className="h-64 flex items-center justify-center bg-secondary rounded-lg">
          <p className="text-sm text-muted-foreground">Recharts PNL chart</p>
        </div>
      </div>

      {/* Open Positions */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Open positions</h2>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Pair</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Size</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Entry</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Current</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">PNL</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Change</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => (
                <tr key={pos.pair} className="border-b border-border/50 hover:bg-secondary/50">
                  <td className="py-3 px-2 font-mono text-sm font-semibold">{pos.pair}</td>
                  <td className="py-3 px-2 text-right">{pos.size}</td>
                  <td className="py-3 px-2 text-right">${pos.entry.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right">${pos.current.toFixed(2)}</td>
                  <td className={`py-3 px-2 text-right font-semibold ${pos.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ${pos.pnl.toFixed(2)}
                  </td>
                  <td className={`py-3 px-2 text-right font-semibold ${pos.pnlPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
