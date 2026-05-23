'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/app/context/DashboardContext';
import { usePrices } from '@/app/context/PriceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PriceDisplay } from '@/components/yuzuriha/PriceDisplay';
import { 
  Home, Settings, TrendingUp, Bell, BarChart3, BookOpen, Layers, Plus, Search, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/alerts', icon: Bell, label: 'Alerts' },
  { href: '/dashboard/portfolio', icon: BarChart3, label: 'Portfolio' },
  { href: '/dashboard/news', icon: BookOpen, label: 'News' },
  { href: '/dashboard/history', icon: TrendingUp, label: 'History' },
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
    <div className={cn(
      'flex flex-col border-r border-border bg-card',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <h1 className="text-lg font-bold">Yuzuriha</h1>
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
      <nav className="flex-1 border-b border-border">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 border-l-2 border-transparent px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary',
                'data-[active]:border-accent data-[active]:bg-accent/5'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Watchlist Section */}
      <div className="flex flex-col border-b border-border">
        <div className="p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Watchlist
          </h2>

          {/* Search */}
          <div className="mb-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Add asset..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="max-h-32 overflow-y-auto rounded-md border border-border bg-secondary">
                {searchResults.map((result) => (
                  <button
                    key={result.symbol}
                    onClick={() => handleAddToWatchlist(result.symbol)}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-accent/20 transition-colors"
                  >
                    {result.symbol} - {result.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Watchlist Items */}
          <div className="space-y-2">
            {watchlist.map((symbol) => {
              const price = getPrice(symbol);
              return (
                <div
                  key={symbol}
                  className="flex items-start justify-between rounded-md border border-border bg-secondary p-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm font-bold">{symbol}</div>
                    {price ? (
                      <div className="text-xs text-muted-foreground">
                        ${price.current.toFixed(2)}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground animate-pulse">
                        Loading...
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromWatchlist(symbol)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
