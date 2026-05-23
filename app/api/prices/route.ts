import { NextRequest, NextResponse } from 'next/server';
import { getPrices } from '@/lib/api-clients/coingecko';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbols = searchParams.get('symbols')?.split(',') || [];

    if (symbols.length === 0) {
      return NextResponse.json({
        error: 'No symbols provided',
      }, { status: 400 });
    }

    const prices = await getPrices(symbols);

    return NextResponse.json(prices, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    });
  } catch (error) {
    console.error('[v0] Prices API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}
