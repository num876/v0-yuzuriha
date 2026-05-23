import { NextRequest, NextResponse } from 'next/server';
import { getPrices } from '@/lib/api-clients/coingecko';
import { getMetalsPrices } from '@/lib/api-clients/metals';

// Commodity symbols that need special handling
const COMMODITY_SYMBOLS = ['XAUUSD', 'XAGUSD', 'USOIL', 'GLD'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbols = searchParams.get('symbols')?.split(',') || [];

    if (symbols.length === 0) {
      return NextResponse.json({
        error: 'No symbols provided',
      }, { status: 400 });
    }

    // Separate symbols by asset class
    const cryptoSymbols = symbols.filter(s => !COMMODITY_SYMBOLS.includes(s.toUpperCase()));
    const commoditySymbols = symbols.filter(s => COMMODITY_SYMBOLS.includes(s.toUpperCase()));

    let allPrices: Record<string, any> = {};

    // Fetch crypto prices
    if (cryptoSymbols.length > 0) {
      const cryptoPrices = await getPrices(cryptoSymbols);
      allPrices = { ...allPrices, ...cryptoPrices };
    }

    // Fetch commodity prices
    if (commoditySymbols.length > 0) {
      const commodityPrices = await getMetalsPrices(commoditySymbols);
      allPrices = { ...allPrices, ...commodityPrices };
    }

    return NextResponse.json(allPrices, {
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
