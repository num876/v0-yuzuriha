import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getMexcCurrentPrice } from '@/lib/api-clients/mexc';

export async function GET(request: NextRequest) {
  try {
    const db = await readDb();
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
    const db = await readDb();

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
      await writeDb(db);
      return NextResponse.json({ success: true, scheduledTrade });
    }

    if (action === 'execute') {
      // Fetch real price from MEXC if no price provided or price is the old hardcoded fallback
      let realPrice = Number(trade.price) || 0;
      if (!realPrice || realPrice === 82410) {
        const mexcPrice = await getMexcCurrentPrice(trade.pair || 'BTC-USDT');
        if (mexcPrice) {
          realPrice = mexcPrice;
        }
      }

      let executedExchange = trade.exchange || 'OKX Demo';
      let okxOrderId = undefined;
      let errorDetails = undefined;

      // Execute on OKX via Cloudflare Worker if crypto
      const isCrypto = trade.assetClass === 'crypto' || !trade.assetClass; // Default to crypto if unknown
      if (isCrypto) {
        try {
          const { OKXClient } = await import('@/lib/api-clients/okx');
          const client = new OKXClient();
          const instId = OKXClient.formatSymbol(trade.pair || 'BTC-USDT');

          let sz = "0.001"; // Fallback minimum
          if (trade.side === 'buy') {
            sz = String(Number(trade.positionSize) || 100);
          } else if (realPrice > 0) {
            const calculatedSize = (Number(trade.positionSize) || 100) / realPrice;
            sz = Math.max(0.001, calculatedSize).toFixed(4);
          }

          const tradeResponse = await client.placeOrder({
            instId,
            side: trade.side as 'buy' | 'sell',
            sz,
            apiKey: db.settings.okxApiKey,
            secretKey: db.settings.okxSecretKey,
            passphrase: db.settings.okxPassphrase,
          });
          
          okxOrderId = tradeResponse?.orderId || `CF_WRK_${Date.now()}`;
          executedExchange = 'OKX Demo (Worker)';
        } catch (okxError: any) {
          console.error('[v0] OKX Worker trade execution failed:', okxError);
          errorDetails = okxError.message;
          executedExchange = 'OKX Demo (Failed - Mocked)';
        }
      }

      const newTrade = {
        id: `TRD_${Date.now()}`,
        pair: trade.pair,
        side: trade.side,
        size: Number(trade.positionSize) || 100,
        price: realPrice,
        timeframe: trade.timeframe,
        exchange: executedExchange,
        confidence: Number(trade.confidence) || 75,
        reasoning: trade.reasoning || (errorDetails ? `Execution failed: ${errorDetails}` : 'Executed manually'),
        executedAt: new Date().toISOString(),
        status: 'executed',
        pnl: 0,
        pnlPercent: 0,
        okxOrderId,
      };
      db.trades.unshift(newTrade);
      await writeDb(db);
      return NextResponse.json({ success: true, trade: newTrade });
    }

    if (action === 'delete_scheduled') {
      db.scheduledTrades = db.scheduledTrades.filter(t => t.id !== trade.id);
      await writeDb(db);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_trade') {
      db.trades = db.trades.filter(t => t.id !== trade.id);
      await writeDb(db);
      return NextResponse.json({ success: true });
    }

    if (action === 'clear_trades') {
      // IMPORTANT: Only reset PnL stats — NEVER remove trades.
      // Active signals / executed trades must persist.
      db.trades = db.trades.map(t => ({
        ...t,
        pnl: 0,
        pnlPercent: 0,
      }));
      await writeDb(db);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[v0] Trades POST error:', error);
    return NextResponse.json({ error: 'Failed to process trade' }, { status: 500 });
  }
}
