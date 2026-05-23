import { NextRequest, NextResponse } from 'next/server';

// Mock signals endpoint - would query Foundry Ontology in production
export async function GET(request: NextRequest) {
  try {
    const mockSignals = [
      {
        id: 'SIG001',
        pair: 'BTC/USDT',
        timeframe: '1h',
        type: 'buy',
        confidence: 85,
        price: 43250,
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        strength: 'strong',
      },
      {
        id: 'SIG002',
        pair: 'ETH/USDT',
        timeframe: '4h',
        type: 'sell',
        confidence: 72,
        price: 2340,
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        strength: 'strong',
      },
    ];

    return NextResponse.json({
      signals: mockSignals,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[v0] Signals API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pair, timeframe, type, confidence, price } = body;

    const signal = {
      id: `SIG${Date.now()}`,
      pair,
      timeframe,
      type,
      confidence,
      price,
      timestamp: new Date().toISOString(),
      strength: confidence >= 75 ? 'strong' : confidence >= 50 ? 'medium' : 'weak',
    };

    return NextResponse.json({
      success: true,
      signal,
    });
  } catch (error) {
    console.error('[v0] Signals API error:', error);
    return NextResponse.json(
      { error: 'Failed to create signal' },
      { status: 500 }
    );
  }
}
