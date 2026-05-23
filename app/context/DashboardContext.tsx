'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface Signal {
  id: string;
  pair: string;
  timeframe: string;
  type: 'buy' | 'sell';
  confidence: number;
  price: number;
  timestamp: Date;
  strength: 'strong' | 'medium' | 'weak';
}

export interface ActiveSignal extends Signal {
  positionSize: number;
  entryPrice: number;
  status: 'executing' | 'active' | 'completed';
  pnl?: number;
  pnlPercent?: number;
}

export interface ScheduledTrade {
  id: string;
  pair: string;
  side: 'buy' | 'sell';
  timeframe: string;
  positionSize: number;
  createdAt: Date;
  framework: string;
}

interface DashboardContextType {
  signals: Signal[];
  activeSignals: Map<string, ActiveSignal>;
  scheduledTrades: Map<string, ScheduledTrade>;
  watchlist: string[];
  addSignal: (signal: Signal) => void;
  addActiveSignal: (signal: ActiveSignal) => void;
  addScheduledTrade: (trade: ScheduledTrade) => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  getSignalsByPair: (pair: string) => Signal[];
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [activeSignals, setActiveSignals] = useState<Map<string, ActiveSignal>>(new Map());
  const [scheduledTrades, setScheduledTrades] = useState<Map<string, ScheduledTrade>>(new Map());
  const [watchlist, setWatchlist] = useState<string[]>(['BTC', 'ETH', 'SOL', 'XRP']);

  const addSignal = useCallback((signal: Signal) => {
    setSignals(prev => [signal, ...prev.slice(0, 49)]); // Keep last 50
  }, []);

  const addActiveSignal = useCallback((signal: ActiveSignal) => {
    setActiveSignals(prev => new Map(prev).set(signal.id, signal));
  }, []);

  const addScheduledTrade = useCallback((trade: ScheduledTrade) => {
    setScheduledTrades(prev => new Map(prev).set(trade.id, trade));
  }, []);

  const addToWatchlist = useCallback((symbol: string) => {
    setWatchlist(prev => 
      prev.includes(symbol) ? prev : [...prev, symbol]
    );
  }, []);

  const removeFromWatchlist = useCallback((symbol: string) => {
    setWatchlist(prev => prev.filter(s => s !== symbol));
  }, []);

  const getSignalsByPair = useCallback((pair: string): Signal[] => {
    return signals.filter(s => s.pair === pair);
  }, [signals]);

  return (
    <DashboardContext.Provider
      value={{
        signals,
        activeSignals,
        scheduledTrades,
        watchlist,
        addSignal,
        addActiveSignal,
        addScheduledTrade,
        addToWatchlist,
        removeFromWatchlist,
        getSignalsByPair,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}
