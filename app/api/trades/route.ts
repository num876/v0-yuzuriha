import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = readDb();
    return NextResponse.json({
      trades: db.trades,
      scheduledTrades: db.scheduledTrades,
    });
  } catch (error) {
    console.error('[v0] Trades GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, trade } = body;
    const db = readDb();

    if (action === 'schedule') {
      const scheduledTrade = {
        id: `SCH_${Date.now()}`,
        pair: trade.pair,
        side: trade.side,
        timeframe: trade.timeframe,
        positionSize: Number(trade.positionSize) || 100,
        createdAt: new Date().toISOString(),
        framework: trade.framework || 'Al Brooks',
        assetClass: trade.assetClass || 'crypto',
        exchange: trade.exchange || 'OKX Demo',
      };
      db.scheduledTrades.push(scheduledTrade);
      writeDb(db);
      return NextResponse.json({ success: true, scheduledTrade });
    }

    if (action === 'execute') {
      const newTrade = {
        id: `TRD_${Date.now()}`,
        pair: trade.pair,
        side: trade.side,
        size: Number(trade.positionSize) || 100,
        price: Number(trade.price) || 82410,
        timeframe: trade.timeframe,
        exchange: trade.exchange || 'OKX Demo',
        confidence: Number(trade.confidence) || 75,
        reasoning: trade.reasoning || 'Executed manually',
        executedAt: new Date().toISOString(),
        status: 'executed',
        pnl: 0,
        pnlPercent: 0,
      };
      db.trades.unshift(newTrade);
      writeDb(db);
      return NextResponse.json({ success: true, trade: newTrade });
    }

    if (action === 'delete_scheduled') {
      db.scheduledTrades = db.scheduledTrades.filter(t => t.id !== trade.id);
      writeDb(db);
      return NextResponse.json({ success: true });
    }

    if (action === 'clear_trades') {
      db.trades = [];
      writeDb(db);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[v0] Trades POST error:', error);
    return NextResponse.json({ error: 'Failed to process trade' }, { status: 500 });
  }
}
