import { NextRequest, NextResponse } from 'next/server';
import { analyzeTradeSignalWithOpenAI } from '@/lib/api-clients/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      pair,
      price,
      signal,
      timeframe,
      rsi,
      macd,
      ema,
      volume,
      newsSentiment,
      whaleData,
      dxy,
      spy,
      trend4h,
      framework,
    } = body;

    // Validate required fields
    if (!pair || price === undefined || !signal || !timeframe || !framework) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const analysis = await analyzeTradeSignalWithOpenAI({
      pair,
      price: Number(price),
      signal,
      timeframe,
      rsi,
      macd,
      ema,
      volume,
      newsSentiment,
      whaleData,
      dxy,
      spy,
      trend4h,
      framework,
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('[v0] OpenAI API route error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze trade signal' },
      { status: 500 }
    );
  }
}
