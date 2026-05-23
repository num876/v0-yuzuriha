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
  });

  const [newAsset, setNewAsset] = useState({ type: 'crypto', symbol: '', name: '', notes: '' });

  const handleAddAsset = () => {
    if (newAsset.symbol && newAsset.name) {
      setWatchlist({
        ...watchlist,
        [newAsset.type]: [
          ...watchlist[newAsset.type as 'crypto' | 'stocks'],
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
        <p className="text-sm text-muted-foreground">Manage your crypto and stock watchlists</p>
      </div>

      {/* Add Asset Form */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Add new asset</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={newAsset.type}
            onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
            className="rounded-md border border-border bg-card px-3 py-2"
          >
            <option value="crypto">Crypto</option>
            <option value="stocks">Stocks</option>
          </select>
          <Input
            placeholder="Symbol"
            value={newAsset.symbol}
            onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value })}
          />
          <Input
            placeholder="Name"
            value={newAsset.name}
            onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
          />
          <Input
            placeholder="Notes (optional)"
            value={newAsset.notes}
            onChange={(e) => setNewAsset({ ...newAsset, notes: e.target.value })}
            className="lg:col-span-1"
          />
          <Button onClick={handleAddAsset} className="gap-2">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Crypto Watchlist */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-secondary p-4">
          <h2 className="font-semibold">Cryptocurrencies</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Symbol</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Notes</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.crypto.map((asset) => (
                <tr key={asset.symbol} className="border-b border-border/50 hover:bg-secondary/50">
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
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-secondary p-4">
          <h2 className="font-semibold">Stocks</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Symbol</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Notes</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.stocks.map((asset) => (
                <tr key={asset.symbol} className="border-b border-border/50 hover:bg-secondary/50">
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
    </div>
  );
}
