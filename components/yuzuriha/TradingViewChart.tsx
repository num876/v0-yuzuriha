'use client';

import React from 'react';

interface TradingViewChartProps {
  symbol: string;
}

export function TradingViewChart({ symbol }: TradingViewChartProps) {
  // Map selected symbol to TradingView symbol format (e.g. BTC -> BINANCE:BTCUSDT, AAPL -> NASDAQ:AAPL)
  const isStock = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN'].includes(symbol.toUpperCase());
  const tvSymbol = isStock 
    ? `NASDAQ:${symbol.toUpperCase()}` 
    : `BINANCE:${symbol.toUpperCase()}${symbol.toUpperCase().endsWith('USDT') ? '' : 'USDT'}`;

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden border border-[#1e1e3a]/50 bg-[#050510]">
      <iframe
        src={`https://s.tradingview.com/embed-widget/advanced-chart/?symbol=${tvSymbol}&theme=dark&interval=1H&hide_side_toolbar=false`}
        width="100%"
        height="500"
        frameBorder="0"
        allowTransparency={true}
        scrolling="no"
      />
    </div>
  );
}
