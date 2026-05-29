'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Trash2 } from 'lucide-react';
import { useDashboard } from '@/app/context/DashboardContext';

export default function HistoryPage() {
  const { activeSignals: trades } = useDashboard();

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
        <Input placeholder="Search pair..." className="max-w-xs w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-sm transition-all duration-200 focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none" />
        <select className="rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2 text-sm focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 outline-none">
          <option>All types</option>
          <option>Buy</option>
          <option>Sell</option>
        </select>
        <select className="rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2 text-sm focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 outline-none">
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
      <div className="glass-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#1e1e3a]/50 bg-[#111128]/40">
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
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground text-sm">
                    No trade history found.
                  </td>
                </tr>
              ) : (
                trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-[#1e1e3a]/50 hover:bg-[#111128]/60 transition-all duration-200">
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{trade.id}</td>
                    <td className="py-3 px-4 font-mono font-semibold">{trade.pair}</td>
                    <td className={`py-3 px-4 text-center text-xs font-semibold ${trade.side === 'buy' ? 'text-success' : 'text-destructive'}`}>
                      {trade.side.toUpperCase()}
                    </td>
                    <td className="py-3 px-4 text-right">{trade.size}</td>
                    <td className="py-3 px-4 text-right">${trade.price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center text-xs">{trade.timeframe}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${(trade.pnl || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                      <div>${(trade.pnl || 0).toFixed(2)}</div>
                      <div className="text-xs">{(trade.pnlPercent || 0) >= 0 ? '+' : ''}{(trade.pnlPercent || 0).toFixed(1)}%</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{new Date(trade.executedAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
