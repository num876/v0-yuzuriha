'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { STOCK_SYMBOLS } from '@/lib/utils';


export interface Signal {
  id: string;
  pair: string;
  timeframe: string;
  type: 'buy' | 'sell';
  confidence: number;
  price: number;
  timestamp: Date | string;
  strength: 'strong' | 'medium' | 'weak';
  assetClass?: 'crypto' | 'stock' | 'commodity';
  reasoning?: string;
  status?: 'pending' | 'executed' | 'skipped';
}

export interface ActiveSignal {
  id: string;
  pair: string;
  side: 'buy' | 'sell';
  size: number;
  price: number;
  timeframe: string;
  exchange: string;
  confidence: number;
  reasoning: string;
  executedAt: string;
  status: string;
  pnl?: number;
  pnlPercent?: number;
}

export interface ScheduledTrade {
  id: string;
  pair: string;
  side: 'buy' | 'sell';
  timeframe: string;
  positionSize: number;
  createdAt: Date | string;
  framework: string;
  assetClass?: 'crypto' | 'stock' | 'commodity';
  exchange?: string;
}

export interface Settings {
  autopilotThreshold: number;
  okxApiKey: string;
  okxSecretKey?: string;
  okxPassphrase?: string;
  alpacaApiKey: string;
  alpacaSecretKey?: string;
  oandaApiKey: string;
  oandaAccountId: string;
  oandaEnvironment: string;
  telegramToken: string;
  telegramChatId: string;
  framework: string;
  notificationEmail: string;
  isLiveTrading: boolean;
  mexcApiKey?: string;
  mexcSecretKey?: string;
}

interface DashboardContextType {
  signals: Signal[];
  activeSignals: ActiveSignal[];
  scheduledTrades: ScheduledTrade[];
  watchlist: string[];
  settings: Settings;
  loading: boolean;
  addSignal: (signal: Signal) => Promise<void>;
  addActiveSignal: (signal: ActiveSignal) => Promise<void>;
  addScheduledTrade: (trade: ScheduledTrade) => Promise<void>;
  deleteScheduledTrade: (id: string) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  getSignalsByPair: (pair: string) => Signal[];
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  refreshData: () => Promise<void>;
  clearTrades: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Default Watchlist assets (Crypto + Stocks combined)
const DEFAULT_WATCHLIST = [
  // Cryptocurrencies (22 assets)
  'BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'LINK', 'AVAX', 'MATIC', 'DOT',
  'NEAR', 'SUI', 'PEPE', 'ICP', 'OP', 'ARB', 'RENDER', 'FET', 'IMX', 'STX', 'AAVE', 'INJ',
  // Stocks (40 assets)
  ...STOCK_SYMBOLS
];

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [activeSignals, setActiveSignals] = useState<ActiveSignal[]>([]);
  const [scheduledTrades, setScheduledTrades] = useState<ScheduledTrade[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_WATCHLIST);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>({
    autopilotThreshold: 70,
    okxApiKey: 'f0403f48-7972-4006-9ed9-c4ebce8489b9',
    okxSecretKey: '317B6D017BADB1A103990416E9A08C06',
    okxPassphrase: 'passphrase_***',
    alpacaApiKey: 'pk_test_***',
    alpacaSecretKey: 'sk_test_***',
    oandaApiKey: 'Bearer token_***',
    oandaAccountId: 'account_***',
    oandaEnvironment: 'practice',
    telegramToken: 'bot_***',
    telegramChatId: 'YOUR_TELEGRAM_CHAT_ID_HERE',
    framework: 'Al Brooks',
    notificationEmail: 'user@example.com',
    isLiveTrading: false,
    mexcApiKey: 'mexc_key_***',
    mexcSecretKey: 'mexc_secret_***',
  });

  // Client-side initial cache load
  useEffect(() => {
    try {
      const cachedSignals = localStorage.getItem('yuzuriha_signals');
      const cachedActive = localStorage.getItem('yuzuriha_active_signals');
      const cachedScheduled = localStorage.getItem('yuzuriha_scheduled_trades');

      if (cachedSignals) setSignals(JSON.parse(cachedSignals));
      if (cachedActive) setActiveSignals(JSON.parse(cachedActive));
      if (cachedScheduled) setScheduledTrades(JSON.parse(cachedScheduled));
    } catch (e) {
      console.error('Failed to load local storage cache:', e);
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      // Get settings
      const settingsRes = await fetch('/api/settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }

      // Get signals
      const signalsRes = await fetch('/api/signals');
      if (signalsRes.ok) {
        const signalsData = await signalsRes.json();
        setSignals(signalsData.signals || []);
        localStorage.setItem('yuzuriha_signals', JSON.stringify(signalsData.signals || []));
      }

      // Get trades and scheduled trades
      const tradesRes = await fetch('/api/trades');
      if (tradesRes.ok) {
        const tradesData = await tradesRes.json();
        setActiveSignals(tradesData.trades || []);
        setScheduledTrades(tradesData.scheduledTrades || []);
        localStorage.setItem('yuzuriha_active_signals', JSON.stringify(tradesData.trades || []));
        localStorage.setItem('yuzuriha_scheduled_trades', JSON.stringify(tradesData.scheduledTrades || []));
      }
    } catch (error) {
      console.error('[v0] Dashboard data sync error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll for updates (TradingView pipeline is server-side, so poll client-side)
  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [refreshData]);

  const addSignal = useCallback(async (signal: Signal) => {
    try {
      const res = await fetch('/api/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signal),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Failed to add signal:', error);
    }
  }, [refreshData]);

  const addActiveSignal = useCallback(async (signal: ActiveSignal) => {
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute',
          trade: signal,
        }),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Failed to execute trade:', error);
    }
  }, [refreshData]);

  const addScheduledTrade = useCallback(async (trade: ScheduledTrade) => {
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'schedule',
          trade,
        }),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Failed to schedule trade:', error);
    }
  }, [refreshData]);

  const deleteScheduledTrade = useCallback(async (id: string) => {
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_scheduled',
          trade: { id },
        }),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Failed to delete scheduled trade:', error);
    }
  }, [refreshData]);

  const deleteTrade = useCallback(async (id: string) => {
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_trade',
          trade: { id },
        }),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Failed to delete trade:', error);
    }
  }, [refreshData]);

  const clearTrades = useCallback(async () => {
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clear_trades',
        }),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Failed to clear trades:', error);
    }
  }, [refreshData]);

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  }, []);

  const addToWatchlist = useCallback((symbol: string) => {
    setWatchlist(prev => 
      prev.includes(symbol.toUpperCase()) ? prev : [...prev, symbol.toUpperCase()]
    );
  }, []);

  const removeFromWatchlist = useCallback((symbol: string) => {
    setWatchlist(prev => prev.filter(s => s !== symbol.toUpperCase()));
  }, []);

  const getSignalsByPair = useCallback((pair: string): Signal[] => {
    return signals.filter(s => s.pair.toUpperCase() === pair.toUpperCase());
  }, [signals]);

  return (
    <DashboardContext.Provider
      value={{
        signals,
        activeSignals,
        scheduledTrades,
        watchlist,
        settings,
        loading,
        addSignal,
        addActiveSignal,
        addScheduledTrade,
        deleteScheduledTrade,
        deleteTrade,
        addToWatchlist,
        removeFromWatchlist,
        getSignalsByPair,
        updateSettings,
        refreshData,
        clearTrades,
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
