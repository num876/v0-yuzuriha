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
  'GOOGL': { current: 175.40, change24h: 1.20, changePercent24h: 0.68 },
  'META': { current: 475.20, change24h: 3.40, changePercent24h: 0.72 },
  'NFLX': { current: 610.15, change24h: -4.50, changePercent24h: -0.73 },
  'AMD': { current: 165.80, change24h: 2.10, changePercent24h: 1.28 },
  'INTC': { current: 30.25, change24h: -0.45, changePercent24h: -1.47 },
  'QCOM': { current: 180.50, change24h: 1.15, changePercent24h: 0.64 },
  'AVGO': { current: 1380.00, change24h: 15.20, changePercent24h: 1.11 },
  'ARM': { current: 115.40, change24h: -1.80, changePercent24h: -1.54 },
  'COIN': { current: 225.60, change24h: 8.40, changePercent24h: 3.87 },
  'MSTR': { current: 1620.00, change24h: 65.00, changePercent24h: 4.18 },
  'PLTR': { current: 22.45, change24h: 0.88, changePercent24h: 4.08 },
  'BABA': { current: 82.50, change24h: -0.65, changePercent24h: -0.78 },
  'TSM': { current: 145.20, change24h: 2.25, changePercent24h: 1.57 },
  'ASML': { current: 920.00, change24h: -8.50, changePercent24h: -0.92 },
  'SMCI': { current: 845.00, change24h: 22.40, changePercent24h: 2.72 },
  'ORCL': { current: 122.50, change24h: 0.95, changePercent24h: 0.78 },
  'IBM': { current: 185.20, change24h: -1.10, changePercent24h: -0.59 },
  'CRM': { current: 285.40, change24h: 1.85, changePercent24h: 0.65 },
  'UBER': { current: 72.30, change24h: 0.65, changePercent24h: 0.91 },
  'LYFT': { current: 16.45, change24h: -0.32, changePercent24h: -1.91 },
  'ABNB': { current: 148.50, change24h: 1.25, changePercent24h: 0.85 },
  'DIS': { current: 115.20, change24h: 0.85, changePercent24h: 0.74 },
  'V': { current: 275.40, change24h: 1.50, changePercent24h: 0.55 },
  'MA': { current: 460.80, change24h: 2.10, changePercent24h: 0.46 },
  'PYPL': { current: 62.40, change24h: -0.85, changePercent24h: -1.34 },
  'SQ': { current: 68.50, change24h: 1.15, changePercent24h: 1.71 },
  'HOOD': { current: 18.25, change24h: 0.55, changePercent24h: 3.11 },
  'JPM': { current: 195.40, change24h: 1.10, changePercent24h: 0.57 },
  'GS': { current: 425.60, change24h: 2.80, changePercent24h: 0.66 },
  'BAC': { current: 38.50, change24h: 0.25, changePercent24h: 0.65 },
  'WMT': { current: 60.25, change24h: 0.35, changePercent24h: 0.58 },
  'COST': { current: 730.00, change24h: 4.50, changePercent24h: 0.62 },
  'HD': { current: 355.20, change24h: -2.10, changePercent24h: -0.59 },
  'NKE': { current: 92.40, change24h: -0.85, changePercent24h: -0.91 },
  'SBUX': { current: 88.50, change24h: 0.45, changePercent24h: 0.51 },
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
