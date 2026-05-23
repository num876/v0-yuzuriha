'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Trash2 } from 'lucide-react';

export default function HistoryPage() {
  const trades = [
    {
      id: 'TRD001',
      pair: 'BTC/USDT',
      type: 'buy',
      size: 0.5,
      price: 43200,
      pnl: 1540,
      pnlPercent: 7.3,
      timeframe: '1h',
      date: '2024-01-05 14:32',
      exchange: 'OKX Demo',
    },
    {
      id: 'TRD002',
      pair: 'ETH/USDT',
      type: 'sell',
      size: 5.0,
      price: 2310,
      pnl: 1050,
      pnlPercent: 9.4,
      timeframe: '4h',
      date: '2024-01-05 12:15',
      exchange: 'OKX Demo',
    },
    {
      id: 'TRD003',
      pair: 'SOL/USDT',
      type: 'buy',
      size: 25.0,
      price: 98.5,
      pnl: 167.5,
      pnlPercent: 6.8,
      timeframe: '1h',
      date: '2024-01-04 09:22',
      exchange: 'Alpaca',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">History</h1>
          <p className="text-sm text-muted-foreground">Complete trade history and performance</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
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
          <option>All timeframes</option>
          <option>1m</option>
          <option>5m</option>
          <option>15m</option>
          <option>1h</option>
          <option>4h</option>
          <option>1d</option>
        </select>
      </div>

      {/* Trades Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Pair</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Type</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Size</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Price</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">TF</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">PNL</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id} className="border-b border-border/50 hover:bg-secondary/50">
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{trade.id}</td>
                  <td className="py-3 px-4 font-mono font-semibold">{trade.pair}</td>
                  <td className={`py-3 px-4 text-center text-xs font-semibold ${trade.type === 'buy' ? 'text-success' : 'text-destructive'}`}>
                    {trade.type.toUpperCase()}
                  </td>
                  <td className="py-3 px-4 text-right">{trade.size}</td>
                  <td className="py-3 px-4 text-right">${trade.price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center text-xs">{trade.timeframe}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${trade.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    <div>${trade.pnl.toFixed(2)}</div>
                    <div className="text-xs">{trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(1)}%</div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{trade.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
