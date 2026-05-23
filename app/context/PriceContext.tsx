'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface Price {
  symbol: string;
  current: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

interface PriceContextType {
  prices: Map<string, Price>;
  isConnected: boolean;
  subscribe: (symbols: string[]) => void;
  getPrice: (symbol: string) => Price | undefined;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

export function PriceProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<Map<string, Price>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [symbols, setSymbols] = useState<Set<string>>(new Set());

  const fetchPrices = useCallback(async () => {
    if (symbols.size === 0) return;

    try {
      const response = await fetch(
        `/api/prices?symbols=${Array.from(symbols).join(',')}`
      );
      const data = await response.json();
      
      setPrices(new Map(Object.entries(data)));
      setIsConnected(true);
    } catch (error) {
      console.error('[v0] Price fetch error:', error);
      setIsConnected(false);
    }
  }, [symbols]);

  useEffect(() => {
    if (symbols.size === 0) return;

    // Initial fetch
    fetchPrices();

    // Set up polling (5 seconds)
    const interval = setInterval(fetchPrices, 5000);

    return () => clearInterval(interval);
  }, [fetchPrices, symbols.size]);

  const subscribe = useCallback((newSymbols: string[]) => {
    setSymbols(new Set(newSymbols));
  }, []);

  const getPrice = useCallback((symbol: string): Price | undefined => {
    return prices.get(symbol.toUpperCase());
  }, [prices]);

  return (
    <PriceContext.Provider value={{ prices, isConnected, subscribe, getPrice }}>
      {children}
    </PriceContext.Provider>
  );
}

export function usePrices() {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error('usePrices must be used within PriceProvider');
  }
  return context;
}
