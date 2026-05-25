'use client';

import { useDashboard } from '@/app/context/DashboardContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, TrendingDown, Filter, RotateCw } from 'lucide-react';
import { useState } from 'react';

export default function AlertsPage() {
  const { signals, refreshData } = useDashboard();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All types');
  const [filterStrength, setFilterStrength] = useState('All strengths');

  // Filter signals
  const filteredSignals = signals.filter(signal => {
    const matchesSearch = signal.pair.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All types' || 
      (filterType === 'Buy' && signal.type === 'buy') || 
      (filterType === 'Sell' && signal.type === 'sell');
    const matchesStrength = filterStrength === 'All strengths' || 
      signal.strength === filterStrength.toLowerCase();
    
    return matchesSearch && matchesType && matchesStrength;
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alerts</h1>
          <p className="text-sm text-muted-foreground">Real-time TradingView pipeline signal monitoring</p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshData} className="gap-2 text-white border-[#1e1e3a]">
          <RotateCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Input 
          placeholder="Search pair..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-sm transition-all duration-200 focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none" 
        />
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2 text-sm focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 outline-none text-white"
        >
          <option>All types</option>
          <option>Buy</option>
          <option>Sell</option>
        </select>
        <select 
          value={filterStrength}
          onChange={(e) => setFilterStrength(e.target.value)}
          className="rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2 text-sm focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 outline-none text-white"
        >
          <option>All strengths</option>
          <option>Strong</option>
          <option>Medium</option>
          <option>Weak</option>
        </select>
      </div>

      {/* Signals Table */}
      <div className="glass-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#1e1e3a]/50 bg-[#111128]/40">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Pair</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Type</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">TF</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Confidence</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Strength</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Reasoning</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSignals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    No signals found. Awaiting automated Webhook signals from the TradingView pipeline.
                  </td>
                </tr>
              ) : (
                filteredSignals.map((signal) => (
                  <tr key={signal.id} className="border-b border-[#1e1e3a]/50 hover:bg-[#111128]/60 transition-all duration-200">
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                      {new Date(signal.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold">{signal.pair}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${signal.type === 'buy' ? 'text-success' : 'text-destructive'}`}>
                        {signal.type === 'buy' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {signal.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-xs">{signal.timeframe}</td>
                    <td className="py-3 px-4 text-center font-semibold">{signal.confidence}%</td>
                    <td className="py-3 px-4 text-center capitalize text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        signal.strength === 'strong' ? 'bg-[#22c55e]/10 text-success' :
                        signal.strength === 'medium' ? 'bg-warning/10 text-warning' :
                        'bg-muted/10 text-muted-foreground'
                      }`}>
                        {signal.strength}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground max-w-xs truncate" title={signal.reasoning}>
                      {signal.reasoning || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                        signal.status === 'executed' ? 'bg-success/10 text-success border border-success/20 shadow-[0_0_8px_rgba(46,216,163,0.15)]' :
                        signal.status === 'pending' ? 'bg-warning/10 text-warning border border-warning/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]' :
                        'bg-muted/10 text-muted-foreground border border-muted/20'
                      }`}>
                        {signal.status ? signal.status.charAt(0).toUpperCase() + signal.status.slice(1) : 'Pending'}
                      </span>
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
