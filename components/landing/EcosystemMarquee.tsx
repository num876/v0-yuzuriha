'use client';

import React from 'react';
import { BarChart3, TrendingUp, Layers, Zap, Network, Cpu, Bell } from 'lucide-react';

const integrations = [
  { name: 'TradingView', icon: BarChart3, text: 'Custom Indicators & Webhooks' },
  { name: 'OKX', icon: TrendingUp, text: 'Spot & Futures Execution' },
  { name: 'Alpaca', icon: Layers, text: 'US Equities Exchange API' },
  { name: 'OANDA', icon: Zap, text: 'FX & CFD Routing' },
  { name: 'Cloudflare', icon: Network, text: 'Edge Worker Validation' },
  { name: 'Anthropic Claude', icon: Cpu, text: 'Pre-Trade Confidence Score' },
  { name: 'Telegram Alerts', icon: Bell, text: 'Instant Telemetry Sync' },
];

export function EcosystemMarquee() {
  const duplicatedList = [...integrations, ...integrations, ...integrations];

  return (
    <section className="py-16 relative overflow-hidden border-t border-b border-[#1e1e3a]/30" style={{ background: 'rgba(5, 5, 16, 0.4)' }}>
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      
      <div className="mx-auto max-w-6xl px-6 text-center mb-8 relative z-10">
        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#8b5cf6] mb-2">Platform Ecosystem</h2>
        <p className="text-2xl font-bold text-white font-display">Integrated with Industry-Leading Infrastructure</p>
      </div>

      <div className="flex overflow-hidden select-none relative w-full">
        {/* Soft edge blur overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-r from-[#050510] via-[#050510]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-l from-[#050510] via-[#050510]/80 to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee gap-6 flex">
          {duplicatedList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="flex items-center gap-3 px-5 py-4 rounded-xl border border-[#1e1e3a]/40 bg-[#0c0c1d]/80 transition-colors duration-300 hover:border-[#8b5cf6]/30 hover:bg-[#0c0c1d] group shrink-0"
              >
                <div 
                  className="p-2 rounded-lg transition-transform duration-300 group-hover:scale-105"
                  style={{ background: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.12)' }}
                >
                  <Icon className="h-4.5 w-4.5 text-[#8b5cf6]" />
                </div>
                <div>
                  <div className="font-mono font-bold text-xs text-white tracking-wide">{item.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{item.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
