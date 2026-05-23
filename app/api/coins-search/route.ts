import { NextRequest, NextResponse } from 'next/server';
import { searchCoins } from '@/lib/api-clients/coingecko';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 1) {
      return NextResponse.json({
        results: [],
      });
    }

    const coins = await searchCoins(query);

    return NextResponse.json({
      results: coins.slice(0, 10).map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        thumb: coin.thumb,
      })),
    });
  } catch (error) {
    console.error('[v0] Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search coins' },
      { status: 500 }
    );
  }
}
