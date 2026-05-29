'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/app/context/DashboardContext';
import { usePrices } from '@/app/context/PriceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PriceDisplay } from '@/components/yuzuriha/PriceDisplay';
import { 
  Home, Settings, TrendingUp, Bell, BarChart3, BookOpen, Layers, Plus, Search, X, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/context/AuthContext';
import { YuzurihaLogo } from '@/components/layout/YuzurihaLogo';

const navigationItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/alerts', icon: Bell, label: 'Alerts' },
  { href: '/dashboard/portfolio', icon: BarChart3, label: 'Portfolio' },
  { href: '/dashboard/news', icon: BookOpen, label: 'News' },
  { href: '/dashboard/history', icon: TrendingUp, label: 'Transaction History' },
  { href: '/dashboard/journal', icon: Layers, label: 'Journal' },
  { href: '/dashboard/watchlist', icon: Plus, label: 'Watchlist' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ className, isOpen = true, onClose }: SidebarProps) {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useDashboard();
  const { getPrice } = usePrices();
  const { signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/coins-search?q=${query}`);
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('[v0] Search error:', error);
    }
  };

  const handleAddToWatchlist = (symbol: string) => {
    addToWatchlist(symbol);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div
      className={cn(
        'flex flex-col border-r border-[#1e1e3a]/50',
        className
      )}
      style={{ background: 'rgba(8, 8, 24, 0.98)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e1e3a]/50 p-4">
        <YuzurihaLogo iconSize="h-5 w-5" textSize="text-base" />
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 border-b border-[#1e1e3a]/50">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 border-l-2 border-transparent px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-[#8b5cf6]/8',
                'data-[active]:border-[#8b5cf6] data-[active]:bg-[#8b5cf6]/10 data-[active]:text-[#8b5cf6]'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={async () => {
            await signOut();
            window.location.href = '/';
          }}
          className="w-full flex items-center gap-3 border-l-2 border-transparent px-4 py-3 text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-[#ef4444]/5 text-left cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </button>
      </nav>

      {/* Strong Signals Section */}
      <div className="flex flex-col border-b border-[#1e1e3a]/50 p-4 gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Active Trade Signals
          </h2>
          <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
        </div>
        <p className="text-[11px] text-muted-foreground leading-normal">
          No signals found. Waiting for new trading opportunities...
        </p>
      </div>

      {/* Correlation Warning Box */}
      <div className="p-4 border-b border-[#1e1e3a]/50">
        <div className="rounded-lg border border-[#f59e0b]/20 bg-[#f59e0b]/5 p-3 text-[11px] text-[#f59e0b] leading-normal flex items-start gap-2">
          <span className="font-semibold text-xs mt-0.5">⚠️</span>
          <span>
            Risk Warning: Your top assets often move together. Consider diversifying to lower your risk.
          </span>
        </div>
      </div>

      {/* Crypto Watchlist Section */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <div className="p-4 flex-1 flex flex-col gap-3 min-h-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Crypto Watchlist
            </h2>
            <div className="flex gap-1.5">
              <button className="text-muted-foreground hover:text-foreground">
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button className="text-muted-foreground hover:text-foreground">
                <span className="text-[10px]">📥</span>
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search symbol..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8 h-8 rounded-lg border border-[#1e1e3a]/50 bg-[#111128]/80 text-xs focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 outline-none"
            />
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 z-50 mt-1 max-h-32 overflow-y-auto rounded-md border border-[#1e1e3a]/50 bg-[#0c0c1d] shadow-lg">
                {searchResults.map((result) => (
                  <button
                    key={result.symbol}
                    onClick={() => handleAddToWatchlist(result.symbol)}
                    className="w-full px-3 py-1.5 text-left text-[11px] hover:bg-[#8b5cf6]/15 transition-colors"
                  >
                    {result.symbol} - {result.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Watchlist list */}
          <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
            {watchlist.map((symbol) => {
              const price = getPrice(symbol);
              return (
                <div
                  key={symbol}
                  className="flex items-center justify-between rounded-lg border border-[#1e1e3a]/30 bg-[#111128]/40 p-2 text-xs transition-all duration-200 hover:border-[#8b5cf6]/20 hover:bg-[#111128]/60"
                >
                  <div className="font-mono font-bold text-foreground">{symbol}</div>
                  <div className="flex items-center gap-2">
                    {price ? (
                      <span className="font-mono text-muted-foreground text-[11px]">
                        ${price.current.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground animate-pulse">...</span>
                    )}
                    <button
                      onClick={() => removeFromWatchlist(symbol)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
