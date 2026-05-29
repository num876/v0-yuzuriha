import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { getMexcPrices } from '@/lib/api-clients/mexc';

// Real PNL endpoint — calculates from actual trades in DB using live MEXC prices
export async function GET(request: NextRequest) {
  try {
    const db = readDb();
    const trades = db.trades || [];

    if (trades.length === 0) {
      return NextResponse.json({
        totalPnl: 0,
        pnlPercent: 0,
        openPositions: [],
        stats: {
          totalTrades: 0,
          winRate: 0,
          sharpeRatio: 0,
          maxDrawdown: 0,
        },
      });
    }

    // Get unique base symbols from trades
    const baseSymbols = [...new Set(
      trades.map(t => t.pair.split('-')[0].split('/')[0].toUpperCase())
    )];

    // Fetch current prices from MEXC
    const currentPrices = await getMexcPrices(baseSymbols);

    // Calculate PNL for each trade
    const openPositions = trades.map(trade => {
      const baseAsset = trade.pair.split('-')[0].split('/')[0].toUpperCase();
      const priceData = currentPrices[baseAsset];
      const currentPrice = priceData?.current || trade.price;
      const units = trade.size / trade.price;
      const isBuy = trade.side === 'buy';

      const pnl = isBuy
        ? (currentPrice - trade.price) * units
        : (trade.price - currentPrice) * units;

      return {
        pair: trade.pair,
        size: trade.size,
        entry: trade.price,
        current: currentPrice,
        pnl,
        side: trade.side,
      };
    });

    const totalPnl = openPositions.reduce((acc, pos) => acc + pos.pnl, 0);
    const totalSize = trades.reduce((acc, t) => acc + t.size, 0);
    const pnlPercent = totalSize > 0 ? (totalPnl / totalSize) * 100 : 0;

    const wins = openPositions.filter(p => p.pnl > 0).length;
    const winRate = openPositions.length > 0 ? wins / openPositions.length : 0;

    // Simple Sharpe approximation
    const returns = openPositions.map(p => p.pnl / p.size);
    const meanReturn = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
    const variance = returns.reduce((a, r) => a + Math.pow(r - meanReturn, 2), 0) / (returns.length || 1);
    const stdDev = Math.sqrt(variance) || 1;
    const sharpeRatio = meanReturn / stdDev;

    // Max drawdown from individual position losses
    const losses = openPositions.map(p => (p.pnl / p.size));
    const maxDrawdown = losses.length > 0 ? Math.min(0, ...losses) : 0;

    return NextResponse.json({
      totalPnl,
      pnlPercent,
      openPositions: openPositions.slice(0, 10), // Top 10
      stats: {
        totalTrades: trades.length,
        winRate,
        sharpeRatio: Number(sharpeRatio.toFixed(2)),
        maxDrawdown: Number(maxDrawdown.toFixed(4)),
      },
    });
  } catch (error) {
    console.error('[v0] PNL API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PNL' },
      { status: 500 }
    );
  }
}
