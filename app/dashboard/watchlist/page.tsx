'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState({
    crypto: [
      { symbol: 'BTC', name: 'Bitcoin', notes: 'Primary long position' },
      { symbol: 'ETH', name: 'Ethereum', notes: 'Secondary position' },
      { symbol: 'SOL', name: 'Solana', notes: '' },
    ],
    stocks: [
      { symbol: 'AAPL', name: 'Apple', notes: '' },
      { symbol: 'MSFT', name: 'Microsoft', notes: '' },
    ],
    commodities: [
      { symbol: 'XAUUSD', name: 'Gold', notes: 'DXY inversely correlated' },
    ],
  });

  const [newAsset, setNewAsset] = useState({ type: 'crypto', symbol: '', name: '', notes: '' });

  const handleAddAsset = () => {
    if (newAsset.symbol && newAsset.name) {
      setWatchlist({
        ...watchlist,
        [newAsset.type]: [
          ...watchlist[newAsset.type as 'crypto' | 'stocks' | 'commodities'],
          { symbol: newAsset.symbol.toUpperCase(), name: newAsset.name, notes: newAsset.notes },
        ],
      });
      setNewAsset({ type: 'crypto', symbol: '', name: '', notes: '' });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Watchlist</h1>
        <p className="text-sm text-muted-foreground">Manage your crypto, stock, and commodity watchlists</p>
      </div>

      {/* Add Asset Form */}
      <div className="glass-card">
        <h2 className="font-semibold">Add new asset</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={newAsset.type}
            onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
            className="rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2 text-sm focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 outline-none"
          >
            <option value="crypto">Crypto</option>
            <option value="stocks">Stocks</option>
            <option value="commodities">Commodities</option>
          </select>
          <Input
            placeholder="Symbol"
            value={newAsset.symbol}
            onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value })}
            className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-sm transition-all duration-200 focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none"
          />
          <Input
            placeholder="Name"
            value={newAsset.name}
            onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
            className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-sm transition-all duration-200 focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none"
          />
          <Input
            placeholder="Notes (optional)"
            value={newAsset.notes}
            onChange={(e) => setNewAsset({ ...newAsset, notes: e.target.value })}
            className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-sm transition-all duration-200 focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none lg:col-span-1"
          />
          <Button onClick={handleAddAsset} className="btn-glow text-white border-0 gap-2">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Crypto Watchlist */}
      <div className="glass-card !p-0 overflow-hidden">
        <div className="border-b border-[#1e1e3a]/50 bg-[#111128]/40 p-4">
          <h2 className="font-semibold">Cryptocurrencies</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#1e1e3a]/50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Symbol</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Notes</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.crypto.map((asset) => (
                <tr key={asset.symbol} className="border-b border-[#1e1e3a]/50 hover:bg-[#111128]/60 transition-all duration-200">
                  <td className="py-3 px-4 font-mono font-bold">{asset.symbol}</td>
                  <td className="py-3 px-4">{asset.name}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{asset.notes || '-'}</td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setWatchlist({
                          ...watchlist,
                          crypto: watchlist.crypto.filter(a => a.symbol !== asset.symbol),
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stocks Watchlist */}
      <div className="glass-card !p-0 overflow-hidden">
        <div className="border-b border-[#1e1e3a]/50 bg-[#111128]/40 p-4">
          <h2 className="font-semibold">Stocks</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#1e1e3a]/50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Symbol</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Notes</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.stocks.map((asset) => (
                <tr key={asset.symbol} className="border-b border-[#1e1e3a]/50 hover:bg-[#111128]/60 transition-all duration-200">
                  <td className="py-3 px-4 font-mono font-bold">{asset.symbol}</td>
                  <td className="py-3 px-4">{asset.name}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{asset.notes || '-'}</td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setWatchlist({
                          ...watchlist,
                          stocks: watchlist.stocks.filter(a => a.symbol !== asset.symbol),
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commodities Watchlist */}
      <div className="glass-card !p-0 overflow-hidden">
        <div className="border-b border-[#1e1e3a]/50 bg-[#111128]/40 p-4">
          <h2 className="font-semibold">Commodities</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#1e1e3a]/50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Symbol</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Notes</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.commodities.map((asset) => (
                <tr key={asset.symbol} className="border-b border-[#1e1e3a]/50 hover:bg-[#111128]/60 transition-all duration-200">
                  <td className="py-3 px-4 font-mono font-bold">{asset.symbol}</td>
                  <td className="py-3 px-4">{asset.name}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{asset.notes || '-'}</td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setWatchlist({
                          ...watchlist,
                          commodities: watchlist.commodities.filter(a => a.symbol !== asset.symbol),
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
