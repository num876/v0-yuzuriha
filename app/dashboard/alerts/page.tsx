'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, TrendingDown, Filter, Download } from 'lucide-react';

export default function AlertsPage() {
  const signals = [
    {
      id: 1,
      time: '14:32:05',
      pair: 'BTC/USDT',
      type: 'buy',
      timeframe: '1h',
      confidence: 85,
      exchange: 'OKX Demo',
      status: 'pending',
    },
    {
      id: 2,
      time: '14:28:12',
      pair: 'ETH/USDT',
      type: 'sell',
      timeframe: '4h',
      confidence: 72,
      exchange: 'OKX Demo',
      status: 'executed',
    },
    {
      id: 3,
      time: '14:15:43',
      pair: 'SOL/USDT',
      type: 'buy',
      timeframe: '15m',
      confidence: 68,
      exchange: 'Alpaca',
      status: 'executed',
    },
    {
      id: 4,
      time: '14:02:17',
      pair: 'XRP/USDT',
      type: 'sell',
      timeframe: '1h',
      confidence: 61,
      exchange: 'OKX Demo',
      status: 'skipped',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alerts</h1>
          <p className="text-sm text-muted-foreground">Real-time signal monitoring</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Input placeholder="Search pair..." className="max-w-xs" />
        <select className="rounded-md border border-border bg-card px-3 py-2 text-sm">
          <option>All types</option>
          <option>Buy</option>
          <option>Sell</option>
        </select>
        <select className="rounded-md border border-border bg-card px-3 py-2 text-sm">
          <option>All exchanges</option>
          <option>OKX Demo</option>
          <option>Alpaca</option>
        </select>
      </div>

      {/* Signals Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Pair</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Type</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">TF</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Confidence</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Exchange</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {signals.map((signal) => (
                <tr key={signal.id} className="border-b border-border/50 hover:bg-secondary/50">
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{signal.time}</td>
                  <td className="py-3 px-4 font-mono font-semibold">{signal.pair}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${signal.type === 'buy' ? 'text-success' : 'text-destructive'}`}>
                      {signal.type === 'buy' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {signal.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-xs">{signal.timeframe}</td>
                  <td className="py-3 px-4 text-center font-semibold">{signal.confidence}%</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{signal.exchange}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                      signal.status === 'executed' ? 'bg-success/10 text-success' :
                      signal.status === 'pending' ? 'bg-warning/10 text-warning' :
                      'bg-muted/10 text-muted-foreground'
                    }`}>
                      {signal.status.charAt(0).toUpperCase() + signal.status.slice(1)}
                    </span>
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
