'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NewsPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('All assets');
  const [loading, setLoading] = useState(true);

  const fetchNews = async (query: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/news?asset=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.news || []);
      }
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = selectedAsset === 'All assets' ? 'Crypto' : selectedAsset;
    fetchNews(query);
  }, [selectedAsset]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchNews(searchQuery);
    }
  };

  const sentimentConfig = {
    positive: { bg: 'bg-success/10 border border-success/20 shadow-[0_0_8px_rgba(46,216,163,0.15)]', text: 'text-success', label: 'Positive' },
    negative: { bg: 'bg-destructive/10 border border-destructive/20 shadow-[0_0_8px_rgba(239,68,68,0.15)]', text: 'text-destructive', label: 'Negative' },
    neutral: { bg: 'bg-muted/10 border border-muted/20', text: 'text-muted-foreground', label: 'Neutral' },
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">News</h1>
          <p className="text-sm text-muted-foreground">Asset-specific news with sentiment analysis</p>
        </div>
      </div>

      {/* Filter and Search Form */}
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-2 items-center">
        <Input 
          placeholder="Search news & press Enter..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-sm transition-all duration-200 focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none text-white" 
        />
        <select 
          value={selectedAsset}
          onChange={(e) => setSelectedAsset(e.target.value)}
          className="rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2 text-sm focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 outline-none text-white cursor-pointer"
        >
          <option value="All assets">All Assets (Crypto)</option>
          <option value="BTC">BTC / Bitcoin</option>
          <option value="ETH">ETH / Ethereum</option>
          <option value="SOL">SOL / Solana</option>
          <option value="AAPL">AAPL (Apple)</option>
          <option value="TSLA">TSLA (Tesla)</option>
          <option value="NVDA">NVDA (NVIDIA)</option>
        </select>
        <Button type="submit" className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-4 py-2 rounded-xl text-sm border-0 cursor-pointer">
          Search
        </Button>
      </form>

      {/* Loading & News List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="h-8 w-8 rounded-full border-2 border-t-[#8b5cf6] border-[#1e1e3a] animate-spin" />
          <p className="text-xs text-muted-foreground animate-pulse">Fetching latest telemetry and sentiment feeds...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="glass-card-lg text-center py-12 text-muted-foreground italic">
          No news articles found for "{searchQuery || selectedAsset}". Please try another query.
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((item, idx) => {
            const sentiment = sentimentConfig[item.sentiment as keyof typeof sentimentConfig] || sentimentConfig.neutral;
            return (
              <a 
                key={idx} 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="glass-card card-hover-lift glow-border hover:!border-[#8b5cf6]/30 block cursor-pointer transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                  {item.image && (
                    <div className="sm:w-36 h-24 shrink-0 rounded-lg overflow-hidden bg-muted/20 border border-[#1e1e3a]/30">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-semibold text-white leading-snug mb-1 text-sm sm:text-base line-clamp-2">{item.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-auto pt-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-semibold text-white">{item.source?.name || 'News Source'}</span>
                        <span>•</span>
                        <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${sentiment.bg} ${sentiment.text}`}>
                        {sentiment.label}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
