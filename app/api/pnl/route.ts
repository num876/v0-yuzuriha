import { NextRequest, NextResponse } from 'next/server';

// Mock PNL endpoint
export async function GET(request: NextRequest) {
  try {
    const mockPnl = {
      totalPnl: 2847.5,
      pnlPercent: 12.4,
      openPositions: [
        { pair: 'BTC/USDT', size: 0.5, entry: 42150, current: 45230, pnl: 1540 },
        { pair: 'ETH/USDT', size: 5, entry: 2240, current: 2450, pnl: 1050 },
      ],
      stats: {
        totalTrades: 21,
        winRate: 0.685,
        sharpeRatio: 1.84,
        maxDrawdown: -0.082,
      },
    };

    return NextResponse.json(mockPnl);
  } catch (error) {
    console.error('[v0] PNL API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PNL' },
      { status: 500 }
    );
  }
}
