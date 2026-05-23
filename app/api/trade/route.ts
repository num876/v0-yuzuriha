import { NextRequest, NextResponse } from 'next/server';
import { OANDAClient } from '@/lib/api-clients/oanda';

// Mock trade execution - in production, this would call actual exchanges
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pair, side, size, price, timeframe, exchange, assetClass } = body;

    if (!pair || !side || !size || !price) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Handle OANDA trades for commodities
    if (exchange?.includes('OANDA')) {
      const oandaApiKey = process.env.OANDA_API_KEY;
      const oandaAccountId = process.env.OANDA_ACCOUNT_ID;
      const oandaEnvironment = (process.env.OANDA_ENVIRONMENT || 'practice') as 'practice' | 'live';

      if (!oandaApiKey || !oandaAccountId) {
        return NextResponse.json(
          { error: 'OANDA credentials not configured' },
          { status: 400 }
        );
      }

      try {
        const client = new OANDAClient(oandaApiKey, oandaAccountId, oandaEnvironment);

        // Map trading framework symbols to OANDA instruments
        const instrumentMap: Record<string, string> = {
          'XAUUSD': 'EUR_USD', // Gold as proxy (in real implementation, use actual CFD)
          'XAGUSD': 'GBP_USD', // Silver as proxy
          'USOIL': 'USD_JPY',  // Oil as proxy
        };

        const instrument = instrumentMap[pair] || pair;
        const units = side === 'buy' ? Math.abs(size) : -Math.abs(size);

        const tradeResponse = await client.executeTrade({
          instrument,
          units,
          side,
          type: 'market',
        });

        const tradeId = `TRD${Date.now()}`;

        return NextResponse.json({
          success: true,
          tradeId,
          pair,
          side,
          size,
          price,
          timeframe,
          exchange,
          assetClass,
          executedAt: new Date().toISOString(),
          status: 'executed',
          oandaOrderId: tradeResponse?.orderFillTransaction?.id,
        });
      } catch (oandaError) {
        console.error('[v0] OANDA trade error:', oandaError);
        return NextResponse.json(
          { error: 'Failed to execute OANDA trade' },
          { status: 500 }
        );
      }
    }

    // Mock execution for other exchanges
    const tradeId = `TRD${Date.now()}`;

    return NextResponse.json({
      success: true,
      tradeId,
      pair,
      side,
      size,
      price,
      timeframe,
      exchange: exchange || 'OKX Demo',
      assetClass,
      executedAt: new Date().toISOString(),
      status: 'executed',
    });
  } catch (error) {
    console.error('[v0] Trade API error:', error);
    return NextResponse.json(
      { error: 'Failed to execute trade' },
      { status: 500 }
    );
  }
}
