'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

export default function NewsPage() {
  const news = [
    {
      id: 1,
      title: 'Bitcoin reaches new ATH amid positive macroeconomic data',
      source: 'CoinTelegraph',
      sentiment: 'positive',
      date: '2 hours ago',
      asset: 'BTC',
    },
    {
      id: 2,
      title: 'Ethereum upgrades face delays in development',
      source: 'The Block',
      sentiment: 'negative',
      date: '4 hours ago',
      asset: 'ETH',
    },
    {
      id: 3,
      title: 'Solana ecosystem projects receive new funding',
      source: 'Crypto Briefing',
      sentiment: 'positive',
      date: '6 hours ago',
      asset: 'SOL',
    },
    {
      id: 4,
      title: 'Regulatory uncertainty impacts altcoin trading',
      source: 'Reuters',
      sentiment: 'neutral',
      date: '8 hours ago',
      asset: 'ETH',
    },
  ];

  const sentimentConfig = {
    positive: { bg: 'bg-success/10 border border-success/20 shadow-[0_0_8px_rgba(46,216,163,0.15)]', text: 'text-success', label: 'Positive' },
    negative: { bg: 'bg-destructive/10 border border-destructive/20 shadow-[0_0_8px_rgba(239,68,68,0.15)]', text: 'text-destructive', label: 'Negative' },
    neutral: { bg: 'bg-muted/10 border border-muted/20', text: 'text-muted-foreground', label: 'Neutral' },
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">News</h1>
          <p className="text-sm text-muted-foreground">Asset-specific news with sentiment analysis</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Input placeholder="Search news..." className="max-w-xs w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-sm transition-all duration-200 focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none" />
        <select className="rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2 text-sm focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 outline-none">
          <option>All assets</option>
          <option>BTC</option>
          <option>ETH</option>
          <option>SOL</option>
        </select>
      </div>

      {/* News List */}
      <div className="space-y-3">
        {news.map((item) => {
          const sentiment = sentimentConfig[item.sentiment as keyof typeof sentimentConfig];
          return (
            <div key={item.id} className="glass-card card-hover-lift glow-border hover:!border-[#8b5cf6]/30 cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold leading-snug mb-2">{item.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-mono text-sm font-bold">{item.asset}</span>
                  <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${sentiment.bg} ${sentiment.text}`}>
                    {sentiment.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
