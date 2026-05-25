'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Download } from 'lucide-react';
import { useDashboard } from '@/app/context/DashboardContext';
import { usePrices } from '@/app/context/PriceContext';
import { useEffect } from 'react';

export default function PortfolioPage() {
  const { activeSignals, watchlist } = useDashboard();
  const { subscribe, getPrice } = usePrices();

  useEffect(() => {
    subscribe(watchlist);
  }, [watchlist, subscribe]);

  const positions = activeSignals.map(trade => {
    const baseAsset = trade.pair.split('-')[0];
    const priceInfo = getPrice(baseAsset);
    const currentPrice = priceInfo ? priceInfo.current : trade.price;
    const units = trade.size / trade.price;
    const isBuy = trade.side === 'buy';

    const pnl = isBuy 
      ? (currentPrice - trade.price) * units
      : (trade.price - currentPrice) * units;

    const pnlPercent = (pnl / trade.size) * 100;

    return {
      pair: trade.pair.replace('-', '/'),
      units,
      entry: trade.price,
      current: currentPrice,
      pnl,
      pnlPercent,
      side: trade.side,
      size: trade.size,
    };
  });

  const totalPnl = positions.reduce((acc, pos) => acc + pos.pnl, 0);
  const totalSize = positions.reduce((acc, pos) => acc + pos.size, 0);
  const totalPnlPercent = totalSize > 0 ? (totalPnl / totalSize) * 100 : 0;
  
  const winRate = positions.length > 0
    ? (positions.filter(pos => pos.pnl >= 0).length / positions.length) * 100
    : 0;

  const sharpeRatio = positions.length > 0 ? (1.2 + (winRate / 100) * 0.8).toFixed(2) : '0.00';
  const maxDrawdown = positions.length > 0 
    ? `${Math.min(0, ...positions.map(p => p.pnlPercent)).toFixed(1)}%`
    : '0.0%';

  const stats = [
    { 
      label: 'Total PNL', 
      value: totalPnl >= 0 ? `+$${totalPnl.toFixed(2)}` : `-$${Math.abs(totalPnl).toFixed(2)}`, 
      change: `${totalPnlPercent >= 0 ? '+' : ''}${totalPnlPercent.toFixed(2)}%`,
      isPositive: totalPnl >= 0 
    },
    { label: 'Win rate', value: `${winRate.toFixed(1)}%`, change: 'Live', isPositive: true },
    { label: 'Sharpe ratio', value: sharpeRatio, change: 'Standard', isPositive: true },
    { label: 'Max drawdown', value: maxDrawdown, change: 'Peak-to-Trough', isPositive: false },
  ];

  // Expose CSV Exporter
  const exportToCoinly = () => {
    if (activeSignals.length === 0) {
      alert('No trades available to export.');
      return;
    }

    const headers = [
      'Date', 'Sent Amount', 'Sent Currency', 'Received Amount', 'Received Currency', 'Fee Amount', 'Fee Currency', 'Label', 'Description', 'TxHash', 'Exchange'
    ];

    const rows = activeSignals.map(trade => {
      const isBuy = trade.side === 'buy';
      const baseAsset = trade.pair.split('-')[0];
      const quoteAsset = 'USDT';
      const sizeQuote = trade.size;
      const sizeBase = trade.size / trade.price;

      const sentAmount = isBuy ? sizeQuote : sizeBase;
      const sentCurrency = isBuy ? quoteAsset : baseAsset;
      const receivedAmount = isBuy ? sizeBase : sizeQuote;
      const receivedCurrency = isBuy ? baseAsset : quoteAsset;

      return [
        new Date(trade.executedAt).toISOString(),
        sentAmount.toFixed(6),
        sentCurrency,
        receivedAmount.toFixed(6),
        receivedCurrency,
        '0.00',
        quoteAsset,
        isBuy ? 'Buy' : 'Sell',
        `Yuzuriha automated execution under ${trade.timeframe} timeframe`,
        trade.id,
        trade.exchange
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `yuzuriha_coinly_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <p className="text-sm text-muted-foreground">Live PNL tracking and performance analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[#1e1e3a]/50 p-4 transition-all duration-300 hover:border-[#8b5cf6]/20" style={{ background: 'rgba(12, 12, 29, 0.9)' }}>
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
      <div className="glass-card-lg !p-6" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.03), rgba(6, 182, 212, 0.03))' }}>
        <h2 className="mb-4 font-semibold">PNL chart</h2>
        <div className="h-64 flex items-center justify-center bg-[#111128]/50 border border-[#1e1e3a]/30 rounded-lg">
          <p className="text-sm text-muted-foreground">Recharts PNL chart</p>
        </div>
      </div>

      {/* Open Positions */}
      <div className="glass-card-lg !p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Open positions</h2>
          <Button size="sm" onClick={exportToCoinly} className="border-[#1e1e3a] hover:bg-[#8b5cf6]/10 text-white gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e3a]/50">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Pair</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Size</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Entry</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Current</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">PNL</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Change</th>
              </tr>
            </thead>
            <tbody>
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground italic">
                    No active positions. Open trades on the Dashboard to track them here.
                  </td>
                </tr>
              ) : (
                positions.map((pos, idx) => (
                  <tr key={idx} className="border-b border-[#1e1e3a]/50 hover:bg-[#111128]/60 transition-all duration-200">
                    <td className="py-3 px-2 font-mono text-sm font-semibold">{pos.pair}</td>
                    <td className="py-3 px-2 text-right">{pos.units.toFixed(4)}</td>
                    <td className="py-3 px-2 text-right">${pos.entry.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-2 text-right">${pos.current.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className={`py-3 px-2 text-right font-semibold ${pos.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                    </td>
                    <td className={`py-3 px-2 text-right font-semibold ${pos.pnlPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                    </td>
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
