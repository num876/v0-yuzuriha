import { NextRequest, NextResponse } from 'next/server';
import { analyzeTradeSignal } from '@/lib/api-clients/anthropic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      pair,
      signal,
      price,
      timeframe,
      framework,
      technicalIndicators,
      newsSentiment,
      assetClass = 'crypto',
    } = body;

    if (!pair || !signal || !price || !timeframe || !framework) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const analysis = await analyzeTradeSignal(
      pair,
      signal,
      price,
      timeframe,
      framework,
      technicalIndicators,
      newsSentiment,
      assetClass as 'crypto' | 'stock' | 'commodity'
    );

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('[v0] Claude API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze trade signal' },
      { status: 500 }
    );
  }
}
