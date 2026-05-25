'use client';

import React, { useEffect, useRef } from 'react';

interface Candlestick {
  x: number;
  open: number;
  high: number;
  low: number;
  close: number;
  color: string;
}

interface FloatingTick {
  x: number;
  y: number;
  symbol: string;
  change: string;
  isPositive: boolean;
  vy: number;
  vx: number;
  alpha: number;
  scale: number;
}

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Grid details
    const gridSpacingX = 80;
    const gridSpacingY = 65;

    // Candlestick variables
    const candles: Candlestick[] = [];
    const candleWidth = 12;
    const candleGap = 16;
    let lastPrice = 300; // base price index
    const chartYCenter = height * 0.55;
    const chartHeightRange = height * 0.25;

    // Tickers
    const floatingTicks: FloatingTick[] = [];
    const symbols = ['BTC', 'ETH', 'SOL', 'AVAX', 'LINK', 'APT', 'SUI', 'NEAR'];
    const tickCount = 10;

    // Mouse coordinates for crosshairs
    const mouse = { x: -9999, y: -9999 };

    // Initialize candlesticks across the width
    const totalInitialCandles = Math.ceil(width / (candleWidth + candleGap)) + 2;
    let currentX = width;

    const generateNextPrice = (prevPrice: number) => {
      const volatility = 0.08;
      const drift = 0.005; // slight upward drift
      const changePercent = (Math.random() - 0.5 + drift) * volatility;
      let newPrice = prevPrice * (1 + changePercent);
      // clamp to range
      if (newPrice < 100) newPrice = 110;
      if (newPrice > 500) newPrice = 480;
      return newPrice;
    };

    // Pre-populate candles from left to right
    for (let i = totalInitialCandles; i >= 0; i--) {
      const openPrice = lastPrice;
      const closePrice = generateNextPrice(openPrice);
      const isUp = closePrice >= openPrice;
      const highPrice = Math.max(openPrice, closePrice) + Math.random() * 8;
      const lowPrice = Math.min(openPrice, closePrice) - Math.random() * 8;

      candles.push({
        x: currentX - i * (candleWidth + candleGap),
        open: openPrice,
        high: highPrice,
        low: lowPrice,
        close: closePrice,
        color: isUp ? '#22c55e' : '#ef4444',
      });
      lastPrice = closePrice;
    }

    // Spawn initial floating ticks
    const spawnTick = (index: number): FloatingTick => {
      const isPositive = Math.random() > 0.35;
      const percent = (Math.random() * 4 + 0.1).toFixed(2);
      return {
        x: Math.random() * width,
        y: height - Math.random() * (height * 0.4), // Spawn in lower half
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        change: `${isPositive ? '+' : '-'}${percent}%`,
        isPositive,
        vy: Math.random() * 0.4 + 0.15,
        vx: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.5 + 0.2,
        scale: Math.random() * 0.2 + 0.9,
      };
    };

    for (let i = 0; i < tickCount; i++) {
      floatingTicks.push(spawnTick(i));
    }

    const handleResize = () => {
      if (!canvas || !ctx) return;
      const newDpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * newDpr;
      canvas.height = height * newDpr;
      ctx.scale(newDpr, newDpr);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout | number;

    const handleScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 150);
    };

    // Visibility observer — pause canvas when scrolled off-screen
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animationFrameId) {
          animationFrameId = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.01 }
    );
    visibilityObserver.observe(container);

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Animation Loop
    const animate = () => {
      if (!isVisible) {
        animationFrameId = 0;
        return;
      }

      if (isScrolling) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // 2. Update and draw candlesticks
      const scrollSpeed = 0.25; // scroll left
      
      // Move existing candles
      candles.forEach((c) => {
        c.x -= scrollSpeed;
      });

      // Remove candles that went offscreen left
      if (candles.length > 0 && candles[0].x < -50) {
        candles.shift();
      }

      // Append new candle on right edge when last one moves enough
      const lastCandle = candles[candles.length - 1];
      if (lastCandle && lastCandle.x < width + candleGap) {
        const openPrice = lastCandle.close;
        const closePrice = generateNextPrice(openPrice);
        const isUp = closePrice >= openPrice;
        const highPrice = Math.max(openPrice, closePrice) + Math.random() * 10;
        const lowPrice = Math.min(openPrice, closePrice) - Math.random() * 10;

        candles.push({
          x: lastCandle.x + candleWidth + candleGap,
          open: openPrice,
          high: highPrice,
          low: lowPrice,
          close: closePrice,
          color: isUp ? '#22c55e' : '#ef4444',
        });
      }

      // Render Candlesticks (with low opacity for background subtle texture)
      candles.forEach((c) => {
        // Map abstract prices to canvas Y range
        const mapY = (price: number) => {
          // Normalize prices (100 to 500) to Y bounds
          const normalized = (price - 100) / 400;
          return chartYCenter + (0.5 - normalized) * chartHeightRange;
        };

        const yOpen = mapY(c.open);
        const yClose = mapY(c.close);
        const yHigh = mapY(c.high);
        const yLow = mapY(c.low);

        ctx.strokeStyle = c.color === '#22c55e' ? 'rgba(34, 197, 94, 0.22)' : 'rgba(239, 68, 68, 0.22)';
        ctx.lineWidth = 1;

        // Draw Wick
        ctx.beginPath();
        ctx.moveTo(c.x + candleWidth / 2, yHigh);
        ctx.lineTo(c.x + candleWidth / 2, yLow);
        ctx.stroke();

        // Draw Body
        ctx.fillStyle = c.color === '#22c55e' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)';
        ctx.strokeStyle = c.color === '#22c55e' ? 'rgba(34, 197, 94, 0.28)' : 'rgba(239, 68, 68, 0.28)';
        ctx.lineWidth = 1.2;
        
        const top = Math.min(yOpen, yClose);
        const bodyHeight = Math.max(Math.abs(yOpen - yClose), 1.5);

        ctx.beginPath();
        ctx.rect(c.x, top, candleWidth, bodyHeight);
        ctx.fill();
        ctx.stroke();
      });

      // Render Area Trendline connecting close prices
      if (candles.length > 1) {
        ctx.beginPath();
        
        // Define paths
        const mapY = (price: number) => {
          const normalized = (price - 100) / 400;
          return chartYCenter + (0.5 - normalized) * chartHeightRange;
        };

        ctx.moveTo(candles[0].x + candleWidth / 2, mapY(candles[0].close));
        for (let i = 1; i < candles.length; i++) {
          ctx.lineTo(candles[i].x + candleWidth / 2, mapY(candles[i].close));
        }

        // Stroke line with a soft cyan/purple gradient
        const lineGrad = ctx.createLinearGradient(0, 0, width, 0);
        lineGrad.addColorStop(0, 'rgba(139, 92, 246, 0.25)'); // purple glow
        lineGrad.addColorStop(1, 'rgba(6, 182, 212, 0.25)');  // cyan glow
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Fill area under line
        ctx.lineTo(candles[candles.length - 1].x + candleWidth / 2, height);
        ctx.lineTo(candles[0].x + candleWidth / 2, height);
        ctx.closePath();

        const fillGrad = ctx.createLinearGradient(0, chartYCenter - chartHeightRange, 0, height);
        fillGrad.addColorStop(0, 'rgba(139, 92, 246, 0.008)');
        fillGrad.addColorStop(1, 'rgba(5, 5, 16, 0)');
        ctx.fillStyle = fillGrad;
        ctx.fill();
      }

      // 3. Render Floating Ticks
      floatingTicks.forEach((t, index) => {
        t.y -= t.vy;
        t.x += t.vx;
        t.alpha -= 0.0006; // slow fade

        if (t.y < -50 || t.alpha <= 0) {
          floatingTicks[index] = spawnTick(index);
          return;
        }

        ctx.save();
        ctx.globalAlpha = t.alpha;
        ctx.font = `650 ${10 * t.scale}px monospace`;

        // Render symbol
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillText(t.symbol, t.x, t.y);

        // Render change percentage (green/red)
        const textWidth = ctx.measureText(t.symbol).width;
        ctx.fillStyle = t.isPositive ? 'rgba(34, 197, 94, 0.45)' : 'rgba(239, 68, 68, 0.45)';
        ctx.fillText(t.change, t.x + textWidth + 6, t.y);

        ctx.restore();
      });

      // 4. Render interactive mouse-tracking crosshair lines & price axes
      if (mouse.x !== -9999 && mouse.y !== -9999) {
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([4, 4]); // dashed lines

        // Horizontal crosshair line
        ctx.beginPath();
        ctx.moveTo(0, mouse.y);
        ctx.lineTo(width, mouse.y);
        ctx.stroke();

        // Vertical crosshair line
        ctx.beginPath();
        ctx.moveTo(mouse.x, 0);
        ctx.lineTo(mouse.x, height);
        ctx.stroke();

        ctx.setLineDash([]); // Reset line dash

        // Draw coordinate price badge on Y axis (right side)
        const badgeYVal = Math.round((height - mouse.y) * 148 + 3200);
        const yBadgeText = `$${badgeYVal.toLocaleString()}`;
        ctx.font = '9px monospace';
        const yBadgeWidth = ctx.measureText(yBadgeText).width + 8;
        
        ctx.fillStyle = 'rgba(12, 12, 29, 0.9)';
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.rect(width - yBadgeWidth - 6, mouse.y - 8, yBadgeWidth, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#a5b4fc';
        ctx.fillText(yBadgeText, width - yBadgeWidth - 2, mouse.y + 3);

        // Draw crosshair cursor center node
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
      visibilityObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Soft Ambient glowing blobs — GPU-promoted with contain for isolation */}
      <div className="absolute top-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full opacity-[0.09] blur-[130px]" style={{ background: '#8b5cf6', transform: 'translateZ(0)', contain: 'strict' }} />
      <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[130px]" style={{ background: '#06b6d4', transform: 'translateZ(0)', contain: 'strict' }} />
      <div className="absolute top-[35%] left-[25%] w-[400px] h-[400px] rounded-full opacity-[0.04] blur-[110px]" style={{ background: '#10b981', transform: 'translateZ(0)', contain: 'strict' }} />
      
      {/* Faint Grid Overlay layer */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" style={{ transform: 'translateZ(0)' }} />

      {/* Live Trading-Themed HTML5 Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
}
