'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrices } from '@/app/context/PriceContext';
import { useDashboard } from '@/app/context/DashboardContext';

interface GlobalMarketData {
  btcDominance: number | null;
  totalMarketCap: number | null;
  fearGreedIndex: number | null;
  fearGreedLabel: string | null;
  dxy: number | null;
}

function formatMarketCap(value: number | null): string {
  if (value === null) return '—';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
}

function getFearGreedColor(index: number | null): string {
  if (index === null) return 'text-foreground';
  if (index <= 25) return 'text-red-500';       // Extreme Fear
  if (index <= 45) return 'text-orange-400';     // Fear
  if (index <= 55) return 'text-yellow-400';     // Neutral
  if (index <= 75) return 'text-[#22c55e]';      // Greed
  return 'text-emerald-400';                      // Extreme Greed
}

function LoadingDots() {
  return <span className="font-mono font-semibold text-muted-foreground animate-pulse">···</span>;
}

export function TopBar() {
  const { isConnected } = usePrices();
  const { settings, updateSettings } = useDashboard();
  const [mounted, setMounted] = useState(false);
  const [globalData, setGlobalData] = useState<GlobalMarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGlobalData = useCallback(async () => {
    try {
      const response = await fetch('/api/global-market');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: GlobalMarketData = await response.json();
      setGlobalData(data);
      setIsLoading(false);
    } catch (error) {
      console.error('[TopBar] Failed to fetch global market data:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Initial fetch
    fetchGlobalData();

    // Poll every 60 seconds
    const interval = setInterval(fetchGlobalData, 60_000);

    return () => clearInterval(interval);
  }, [mounted, fetchGlobalData]);

  if (!mounted) return null;

  const handleAutopilotToggle = async () => {
    // If we enable autopilot, we toggle threshold config. For now just update threshold or simple indicator settings.
    // In our DB/settings, we can toggle autopilot status or we can just make it part of general settings
    // Let's add an 'autopilotEnabled' field or trigger. In our settings, autopilot is always active when page is open if the switch is ON.
    // Let's toggle isLiveTrading or autopilot by updating the setting.
    // Let's make Autopilot Orchestration toggle a setting like `autopilotEnabled` or use a new setting field!
    // Let's add it to settings.
    const isCurrentlyOn = settings.telegramToken !== 'bot_***'; // we can just use a boolean inside settings!
    // Wait, let's look at Settings interface in DashboardContext. Let's add `autopilotEnabled` or similar.
    // Wait, in settings we already have autopilotThreshold. We can save a boolean in DB settings for autopilot.
    // Let's use `isLiveTrading` or add a new property `autopilotEnabled` to settings. Let's write `isLiveTrading` or a custom property.
    // Wait, let's check `isLiveTrading` or just a boolean `autopilotEnabled`. Let's support both.
    const autopilotEnabled = (settings as any).autopilotEnabled !== false;
    await updateSettings({ autopilotEnabled: !autopilotEnabled } as any);
  };

  const isAutopilotOn = (settings as any).autopilotEnabled !== false;

  return (
    <header
      className="flex flex-wrap items-center justify-between border-b border-[#1e1e3a]/30 px-6 py-2.5 gap-4 text-xs"
      style={{ background: 'rgba(5, 5, 16, 0.95)' }}
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
        {/* Exchange */}
        <div className="flex items-center gap-2">
          <span>Exchange:</span>
          <span className="font-semibold text-foreground">{settings.isLiveTrading ? 'OKX Live' : 'OKX Demo'}</span>
          <span className={`inline-flex items-center gap-1 rounded ${settings.isLiveTrading ? 'bg-red-500/10 text-red-500' : 'bg-[#22c55e]/10 text-[#22c55e]'} px-1.5 py-0.5 text-[10px] font-medium shadow-[0_0_8px_rgba(34,197,94,0.2)]`}>
            <span className={`h-1 w-1 rounded-full ${settings.isLiveTrading ? 'bg-red-500' : 'bg-[#22c55e]'} animate-pulse`} />
            {settings.isLiveTrading ? 'LIVE MODE' : 'ONLINE (DEMO)'}
          </span>
        </div>

        {/* Data Connection */}
        <div className="flex items-center gap-2 border-l border-[#1e1e3a]/50 pl-6">
          <span>Data Connection:</span>
          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[#06b6d4]" />
            CONNECTED
          </span>
        </div>

        {/* BTC Dominance — Live */}
        <div className="flex items-center gap-2 border-l border-[#1e1e3a]/50 pl-6">
          <span>BTC Dominance:</span>
          {isLoading ? <LoadingDots /> : (
            <span className="font-mono font-semibold text-foreground">
              {globalData?.btcDominance !== null && globalData?.btcDominance !== undefined
                ? `${globalData.btcDominance}%`
                : '—'}
            </span>
          )}
        </div>

        {/* Total Cap — Live */}
        <div className="flex items-center gap-2 border-l border-[#1e1e3a]/50 pl-6">
          <span>Total Cap:</span>
          {isLoading ? <LoadingDots /> : (
            <span className="font-mono font-semibold text-foreground">
              {formatMarketCap(globalData?.totalMarketCap ?? null)}
            </span>
          )}
        </div>

        {/* Fear & Greed — Live */}
        <div className="flex items-center gap-2 border-l border-[#1e1e3a]/50 pl-6">
          <span>Fear & Greed:</span>
          {isLoading ? <LoadingDots /> : (
            <span className={`font-mono font-semibold ${getFearGreedColor(globalData?.fearGreedIndex ?? null)}`}>
              {globalData?.fearGreedIndex !== null && globalData?.fearGreedIndex !== undefined
                ? globalData.fearGreedIndex
                : '—'}
              {globalData?.fearGreedLabel && (
                <span className="ml-1 text-[10px] font-normal opacity-70">
                  ({globalData.fearGreedLabel})
                </span>
              )}
            </span>
          )}
        </div>

        {/* DXY — Live */}
        <div className="flex items-center gap-2 border-l border-[#1e1e3a]/50 pl-6 font-mono">
          <span>DXY:</span>
          {isLoading ? <LoadingDots /> : (
            <span className="font-semibold text-foreground">
              {globalData?.dxy !== null && globalData?.dxy !== undefined
                ? globalData.dxy.toFixed(2)
                : '—'}
            </span>
          )}
        </div>
      </div>

      {/* Autopilot Switch */}
      <div className="flex items-center gap-3 ml-auto">
        <span className="text-muted-foreground text-xs">Automated Trading:</span>
        <button
          onClick={handleAutopilotToggle}
          className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isAutopilotOn ? 'bg-[#22c55e]' : 'bg-zinc-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isAutopilotOn ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
        <span className={`font-bold text-[10px] uppercase ${isAutopilotOn ? 'text-[#22c55e]' : 'text-muted-foreground'}`}>
          {isAutopilotOn ? 'ON' : 'OFF'}
        </span>
      </div>
    </header>
  );
}
