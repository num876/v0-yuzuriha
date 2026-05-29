'use client';

import { useDashboard } from '@/app/context/DashboardContext';
import { usePrices } from '@/app/context/PriceContext';
import { useEffect, useState } from 'react';
import { MetricStat } from '@/components/yuzuriha/MetricStat';
import { PriceDisplay } from '@/components/yuzuriha/PriceDisplay';
import { Button } from '@/components/ui/button';
import { Zap, Clock, ShieldAlert, CheckCircle, Trash2, Download } from 'lucide-react';
import { TradingViewChart } from '@/components/yuzuriha/TradingViewChart';
import { isStockSymbol } from '@/lib/utils';

export default function DashboardPage() {
  const { 
    watchlist, 
    activeSignals, 
    scheduledTrades, 
    addScheduledTrade, 
    deleteScheduledTrade,
    deleteTrade,
    addActiveSignal,
    clearTrades,
    settings
  } = useDashboard();
  const { subscribe, getPrice } = usePrices();

  // Selected Asset state
  const [selectedAsset, setSelectedAsset] = useState('BTC');

  // Input states
  const [buyTimeframe, setBuyTimeframe] = useState('15m');
  const [buySize, setBuySize] = useState('100');
  const [sellTimeframe, setSellTimeframe] = useState('1h');
  const [sellSize, setSellSize] = useState('100');
  const [selectedFramework, setSelectedFramework] = useState('Al Brooks');

  // Confirmation Modal state
  const [showLiveConfirm, setShowLiveConfirm] = useState(false);
  const [pendingTrade, setPendingTrade] = useState<any>(null);

  // Subscribe to watchlist prices
  useEffect(() => {
    subscribe(watchlist);
    if (watchlist.length > 0 && !watchlist.includes(selectedAsset)) {
      setSelectedAsset(watchlist[0]);
    }
  }, [watchlist, subscribe, selectedAsset]);

  const price = getPrice(selectedAsset);
  const currentPriceValue = price ? price.current : 0;

  // Handle Immediate Trade execution
  const handleExecuteTrade = (side: 'buy' | 'sell') => {
    const sizeVal = side === 'buy' ? Number(buySize) : Number(sellSize);
    const timeframeVal = side === 'buy' ? buyTimeframe : sellTimeframe;

    const tradePayload = {
      pair: `${selectedAsset}-USDT`,
      side,
      positionSize: sizeVal,
      price: currentPriceValue,
      timeframe: timeframeVal,
      exchange: settings.isLiveTrading ? 'Live Exchange' : 'OKX Demo',
      confidence: 85,
      reasoning: `Manual execution under ${selectedFramework} framework`,
      framework: selectedFramework,
      assetClass: isStockSymbol(selectedAsset) ? 'stock' : 'crypto',
    };

    if (settings.isLiveTrading) {
      setPendingTrade(tradePayload);
      setShowLiveConfirm(true);
    } else {
      addActiveSignal(tradePayload as any);
    }
  };

  // Handle Scheduled Trade
  const handleScheduleTrade = (side: 'buy' | 'sell') => {
    const sizeVal = side === 'buy' ? Number(buySize) : Number(sellSize);
    const timeframeVal = side === 'buy' ? buyTimeframe : sellTimeframe;

    addScheduledTrade({
      id: '',
      pair: `${selectedAsset}-USDT`,
      side,
      timeframe: timeframeVal,
      positionSize: sizeVal,
      createdAt: new Date().toISOString(),
      framework: selectedFramework,
      assetClass: isStockSymbol(selectedAsset) ? 'stock' : 'crypto',
      exchange: settings.isLiveTrading ? 'Live Exchange' : 'OKX Demo',
    });

    alert(`Pre-scheduled trade queued! Waiting for ${selectedAsset}-USDT ${timeframeVal} TradingView signal to trigger.`);
  };

  const confirmLiveTrade = () => {
    if (pendingTrade) {
      addActiveSignal(pendingTrade);
      setPendingTrade(null);
    }
    setShowLiveConfirm(false);
  };

  // Calculate stats
  const totalTrades = activeSignals.length;
  const winRate = totalTrades > 0 
    ? Math.round((activeSignals.filter(t => (t.pnl || 0) > 0).length / totalTrades) * 100) 
    : 0;
  const totalPnl = activeSignals.reduce((acc, t) => acc + (t.pnl || 0), 0);

  // Coinly CSV export
  const exportToCoinly = () => {
    if (activeSignals.length === 0) {
      alert('No trades available to export.');
      return;
    }

    const headers = [
      'Date',
      'Sent Amount',
      'Sent Currency',
      'Received Amount',
      'Received Currency',
      'Fee Amount',
      'Fee Currency',
      'Label',
      'Description',
      'TxHash',
      'Exchange'
    ];

    const rows = activeSignals.map(trade => {
      const isBuy = trade.side === 'buy';
      // Coinly format mapping:
      // For BUY: we send USDT (size), receive BTC (size/price)
      // For SELL: we send BTC (size/price), receive USDT (size)
      const baseAsset = trade.pair.split('-')[0];
      const quoteAsset = 'USDT';
      const sizeQuote = trade.size;
      const sizeBase = trade.size / (trade.price || 1);

      const sentAmount = isBuy ? sizeQuote : sizeBase;
      const sentCurrency = isBuy ? quoteAsset : baseAsset;
      const receivedAmount = isBuy ? sizeBase : sizeQuote;
      const receivedCurrency = isBuy ? baseAsset : quoteAsset;

      return [
        new Date(trade.executedAt).toISOString(),
        sentAmount.toFixed(6),
        sentCurrency,
        receivedAmount.toFixed(6),
        receivedCurrency,
        '0.00',
        quoteAsset,
        isBuy ? 'Buy' : 'Sell',
        `Yuzuriha automated execution under ${trade.timeframe} timeframe`,
        trade.id,
        trade.exchange
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `yuzuriha_coinly_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full overflow-auto bg-[#050510] pb-12">
      {/* Gradient divider for visual rhythm */}
      <div className="gradient-divider h-px" />

      {/* Confirmation Modal */}
      {showLiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card-lg max-w-md w-full p-6 border-red-500/40 bg-[#0d0d1e] shadow-[0_0_50px_rgba(239,68,68,0.25)] space-y-4 text-left">
            <div className="flex items-center gap-3 text-red-500">
              <ShieldAlert className="h-8 w-8 animate-bounce" />
              <h3 className="text-xl font-bold">Authorize Capital Deployment</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              WARNING: You are about to place a real order on your live exchange for **{pendingTrade?.pair}**. Real money will be spent. Proceed?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowLiveConfirm(false);
                  setPendingTrade(null);
                }}
                className="border-[#1e1e3a] text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmLiveTrade}
                className="bg-red-500 hover:bg-red-600 text-white font-bold"
              >
                Confirm Order
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* 2-Column Grid Layout */}
      <div className="grid h-full grid-cols-1 gap-6 p-6 lg:grid-cols-12">
        
        {/* LEFT COLUMN - Symbol Header, Live Chart, Forms (col-span-8) */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          
          {/* Asset Header */}
          <div className="glass-card-lg !p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <select 
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                    className="text-3xl font-bold font-mono tracking-tight text-white bg-transparent border-0 outline-none cursor-pointer focus:ring-0"
                  >
                    {watchlist.map(symbol => (
                      <option key={symbol} value={symbol} className="bg-[#0c0c1d] text-white text-base">
                        {symbol} / USDT
                      </option>
                    ))}
                  </select>
                  <span className="rounded border border-[#1e1e3a] bg-[#111128]/50 px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                    {isStockSymbol(selectedAsset) ? 'Stock' : 'Crypto'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Real-time pricing feed synchronized client-side (5s updates)
                </p>
              </div>

              <div className="flex items-center gap-6 ml-auto">
                <div className="text-right">
                  {price ? (
                    <PriceDisplay
                      price={price.current}
                      change24h={price.change24h}
                      changePercent24h={price.changePercent24h}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground animate-pulse">
                      Loading price...
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => handleExecuteTrade('buy')}
                    className="bg-[#22c55e] hover:bg-[#22c55e]/90 text-white font-bold px-4 py-2 rounded-lg text-sm transition-all shadow-[0_0_12px_rgba(34,197,94,0.2)] border-0"
                  >
                    Buy Now
                  </Button>
                  <Button 
                    onClick={() => handleExecuteTrade('sell')}
                    className="bg-[#ef4444] hover:bg-[#ef4444]/90 text-white font-bold px-4 py-2 rounded-lg text-sm transition-all shadow-[0_0_12px_rgba(239,68,68,0.2)] border-0"
                  >
                    Sell Now
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Live TradingView Chart */}
          <TradingViewChart symbol={selectedAsset} />

          {/* Claude AI Analysis Card */}
          <div className="glass-card !border-[#8b5cf6]/20 hover:!border-[#8b5cf6]/40 animate-glow flex gap-4">
            <div className="rounded-lg p-2 bg-[#8b5cf6]/10 text-[#8b5cf6] h-fit">
              <Zap className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1 text-white">
                Claude AI analysis ({selectedFramework})
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ANALYSIS METADATA: High confidence buy momentum detected on {selectedAsset} indicators. Moving average crossovers show bullish alignment under {selectedFramework}. Strategy recommendation: execute trades at or above autopilot threshold ({settings.autopilotThreshold}%).
              </p>
            </div>
          </div>

          {/* Framework Selector Bar */}
          <div className="glass-card flex items-center justify-between gap-4 p-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trading Framework:</span>
            <select 
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              className="rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2 text-xs text-white focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 outline-none"
            >
              <option>Al Brooks</option>
              <option>ICT/Smart Money Concepts</option>
              <option>Wyckoff Method</option>
              <option>Elliott Wave</option>
            </select>
          </div>

          {/* Buy/Sell Timeframes Forms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buy Settings */}
            <div className="glass-card flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Buy Timeframe
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                    Timeframe
                  </label>
                  <select 
                    value={buyTimeframe}
                    onChange={(e) => setBuyTimeframe(e.target.value)}
                    className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-xs text-white focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none cursor-pointer"
                  >
                    <option value="1m">1m</option>
                    <option value="3m">3m</option>
                    <option value="5m">5m</option>
                    <option value="15m">15m</option>
                    <option value="30m">30m</option>
                    <option value="1h">1h</option>
                    <option value="2h">2h</option>
                    <option value="4h">4h</option>
                    <option value="12h">12h</option>
                    <option value="1d">1d</option>
                    <option value="3d">3d</option>
                    <option value="1w">1w</option>
                    <option value="1M">1M</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                    Order Size ($)
                  </label>
                  <input
                    type="number"
                    value={buySize}
                    onChange={(e) => setBuySize(e.target.value)}
                    className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-xs text-white focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleExecuteTrade('buy')}
                    className="flex-1 btn-glow-green text-white border-0 py-2.5 rounded-xl font-bold text-xs"
                  >
                    Execute Buy
                  </Button>
                  <Button 
                    onClick={() => handleScheduleTrade('buy')}
                    className="bg-transparent border border-[#1e1e3a] hover:bg-white/5 text-white py-2.5 rounded-xl font-bold text-xs flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3" /> Schedule
                  </Button>
                </div>
              </div>
            </div>

            {/* Sell Settings */}
            <div className="glass-card flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Sell Timeframe (Can Differ)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                    Timeframe
                  </label>
                  <select 
                    value={sellTimeframe}
                    onChange={(e) => setSellTimeframe(e.target.value)}
                    className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-xs text-white focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none cursor-pointer"
                  >
                    <option value="1m">1m</option>
                    <option value="3m">3m</option>
                    <option value="5m">5m</option>
                    <option value="15m">15m</option>
                    <option value="30m">30m</option>
                    <option value="1h">1h</option>
                    <option value="2h">2h</option>
                    <option value="4h">4h</option>
                    <option value="12h">12h</option>
                    <option value="1d">1d</option>
                    <option value="3d">3d</option>
                    <option value="1w">1w</option>
                    <option value="1M">1M</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                    Order Size ($)
                  </label>
                  <input
                    type="number"
                    value={sellSize}
                    onChange={(e) => setSellSize(e.target.value)}
                    className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-xs text-white focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleExecuteTrade('sell')}
                    className="flex-1 bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] text-white border-0 py-2.5 rounded-xl font-bold text-xs transition-all duration-300"
                  >
                    Execute Sell
                  </Button>
                  <Button 
                    onClick={() => handleScheduleTrade('sell')}
                    className="bg-transparent border border-[#1e1e3a] hover:bg-white/5 text-white py-2.5 rounded-xl font-bold text-xs flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3" /> Schedule
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Signals, Executions, Stats, Alerts (col-span-4) */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          
          <div className="glass-card max-h-[250px] overflow-y-auto">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Upcoming Trades (Waiting to Execute)
            </h2>
            {scheduledTrades.length === 0 ? (
              <p className="text-xs text-muted-foreground italic leading-normal">
                Trades waiting for their conditions to be met
              </p>
            ) : (
              <div className="space-y-2">
                {scheduledTrades.map((trade) => (
                  <div key={trade.id} className="rounded-xl border border-[#1e1e3a]/40 bg-[#111128]/30 p-3 text-xs flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-white">{trade.pair}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${trade.side === 'buy' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>
                          {trade.side.toUpperCase()}
                        </span>
                        <button 
                          onClick={() => deleteScheduledTrade(trade.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-[11px]">
                      <span>Timeframe: {trade.timeframe}</span>
                      <span>Target: ${trade.positionSize}</span>
                    </div>
                    <div className="text-[10px] text-[#8b5cf6] font-semibold">
                      Trigger Framework: {trade.framework}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card max-h-[300px] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Recent Executed Trades
              </h2>
              {activeSignals.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportToCoinly}
                  className="h-7 text-[10px] border-[#1e1e3a] hover:bg-white/5 flex items-center gap-1 text-white"
                >
                  <Download className="h-3 w-3" /> Coinly Export
                </Button>
              )}
            </div>
            {activeSignals.length === 0 ? (
              <p className="text-xs text-muted-foreground italic leading-normal">
                Zero active market signals detected.
              </p>
            ) : (
              <div className="space-y-2">
                {activeSignals.map((trade) => (
                  <div key={trade.id} className="rounded-xl border border-[#1e1e3a]/40 bg-[#111128]/30 p-3 text-xs flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-white">{trade.pair}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${trade.side === 'buy' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>
                          {trade.side.toUpperCase()}
                        </span>
                        <button 
                          onClick={() => deleteTrade(trade.id)}
                          title="Cancel Signal"
                          className="text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-[11px]">
                      <span>Price: ${(trade.price || 0).toLocaleString()}</span>
                      <span>Size: ${trade.size}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] pt-1 border-t border-[#1e1e3a]/20">
                      <span className="text-muted-foreground">{new Date(trade.executedAt).toLocaleTimeString()}</span>
                      <span className="text-[#06b6d4] font-mono">{trade.exchange}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Performance Stats */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Portfolio Performance Statistics
              </h2>
              <button 
                onClick={() => {
                  if (window.confirm('Reset all PnL stats to zero? Your executed trades will NOT be removed.')) {
                    clearTrades();
                  }
                }}
                className="text-[10px] text-muted-foreground hover:text-cyan-400 font-semibold flex items-center gap-1 transition-colors"
                title="Resets PnL counters to zero. Trades are preserved."
              >
                📊 Reset Stats
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MetricStat
                label="Total PNL Today"
                value={totalPnl >= 0 ? `+$${totalPnl.toFixed(2)}` : `-$${Math.abs(totalPnl).toFixed(2)}`}
                change={totalPnl}
                isPositive={totalPnl >= 0}
              />
              <MetricStat
                label="Win rate"
                value={`${winRate}%`}
                change={0}
                isPositive={true}
              />
              <MetricStat
                label="Active signals"
                value={activeSignals.length}
              />
              <MetricStat
                label="Total trades"
                value={totalTrades}
              />
            </div>
          </div>

          {/* Notifications Feed */}
          <div className="glass-card">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Notifications Feed
            </h2>
            <div className="space-y-3">
              <div className="rounded-xl border border-[#1e1e3a]/40 bg-[#111128]/30 p-3 text-xs text-muted-foreground">
                <div className="font-semibold text-foreground mb-1 text-[11px]">LARGE-VALUE FLOW</div>
                10,000 ETH ($34.8M) transferred from unknown wallet to OKX
              </div>
              <div className="rounded-xl border border-[#1e1e3a]/40 bg-[#111128]/30 p-3 text-xs text-muted-foreground">
                <div className="font-semibold text-foreground mb-1 text-[11px]">COUNTERPARTY WATCH</div>
                Wintermute deposited $12M of SOL to Binance
              </div>
              <div className="rounded-xl border border-[#1e1e3a]/40 bg-[#111128]/30 p-3 text-xs text-muted-foreground">
                <div className="font-semibold text-foreground mb-1 text-[11px]">EXTERNAL TELEMETRY</div>
                BTC breakout above $67k confirmed on 1h
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
