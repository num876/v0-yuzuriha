import { NextRequest, NextResponse } from 'next/server';
import { getPrices } from '@/lib/api-clients/coingecko';
import { getMetalsPrices } from '@/lib/api-clients/metals';

// Commodity symbols that need special handling
const COMMODITY_SYMBOLS = ['XAUUSD', 'XAGUSD', 'USOIL', 'GLD'];

// Stock base prices for live updates
const STOCK_BASE_PRICES: Record<string, { current: number; change24h: number; changePercent24h: number }> = {
  'AAPL': { current: 189.84, change24h: 1.25, changePercent24h: 0.66 },
  'TSLA': { current: 178.46, change24h: -3.42, changePercent24h: -1.88 },
  'NVDA': { current: 948.79, change24h: 14.50, changePercent24h: 1.55 },
  'MSFT': { current: 430.32, change24h: 2.10, changePercent24h: 0.49 },
  'AMZN': { current: 185.50, change24h: 0.85, changePercent24h: 0.46 },
};

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
    const stocksSymbols = symbols.filter(s => Object.keys(STOCK_BASE_PRICES).includes(s.toUpperCase()));
    const commoditySymbols = symbols.filter(s => COMMODITY_SYMBOLS.includes(s.toUpperCase()));
    const cryptoSymbols = symbols.filter(s => 
      !COMMODITY_SYMBOLS.includes(s.toUpperCase()) && 
      !Object.keys(STOCK_BASE_PRICES).includes(s.toUpperCase())
    );

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

    // Add Stock prices with live simulation (flutters slightly around base prices)
    if (stocksSymbols.length > 0) {
      stocksSymbols.forEach(symbol => {
        const base = STOCK_BASE_PRICES[symbol.toUpperCase()];
        if (base) {
          // Generate small random flutter (e.g. -0.05% to +0.05%)
          const drift = (Math.random() - 0.5) * 0.001;
          const current = base.current * (1 + drift);
          
          allPrices[symbol.toUpperCase()] = {
            symbol: symbol.toUpperCase(),
            current,
            change24h: base.change24h + (current - base.current),
            changePercent24h: base.changePercent24h + (drift * 100),
            high24h: current * 1.02,
            low24h: current * 0.98,
            volume24h: 15000000 + Math.floor(Math.random() * 5000000),
          };
        }
      });
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
