'use client';

import React, { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string;
}

export function TradingViewChart({ symbol }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    // Create container element for script
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'tradingview_advanced_widget';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';
    containerRef.current.appendChild(widgetContainer);

    // Create script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;

    // Map selected symbol to TradingView symbol (e.g. BTC -> BINANCE:BTCUSDT)
    const tvSymbol = symbol === 'BTC' ? 'BINANCE:BTCUSDT'
                   : symbol === 'ETH' ? 'BINANCE:ETHUSDT'
                   : symbol === 'SOL' ? 'BINANCE:SOLUSDT'
                   : `BINANCE:${symbol}USDT`;

    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: '15',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      container_id: 'tradingview_advanced_widget'
    });

    containerRef.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="w-full h-[480px] rounded-xl overflow-hidden border border-[#1e1e3a]/50 bg-[#050510]">
      <div ref={containerRef} className="w-full h-full" style={{ height: '480px' }} />
    </div>
  );
}
