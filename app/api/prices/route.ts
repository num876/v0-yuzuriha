import { NextRequest, NextResponse } from 'next/server';
import { getMexcPrices } from '@/lib/api-clients/mexc';
import { getStockPrices, getCommodityPrices } from '@/lib/api-clients/twelvedata';
import { STOCK_SYMBOLS, COMMODITY_SYMBOLS } from '@/lib/utils';

// ─── Server-side cache for Twelve Data (stocks + commodities) ───
// Twelve Data free tier: 800 credits/day, 8 credits/min.
// Cache results for 30s to stay well within limits.
const TWELVE_DATA_CACHE_TTL_MS = 30_000; // 30 seconds

interface CacheEntry {
  data: Record<string, any>;
  timestamp: number;
}

let stockCache: CacheEntry | null = null;
let commodityCache: CacheEntry | null = null;

function isCacheValid(cache: CacheEntry | null): boolean {
  if (!cache) return false;
  return Date.now() - cache.timestamp < TWELVE_DATA_CACHE_TTL_MS;
}

async function getCachedStockPrices(symbols: string[]): Promise<Record<string, any>> {
  // Return cached data if still fresh
  if (isCacheValid(stockCache)) {
    // Filter cached data to only requested symbols
    const filtered: Record<string, any> = {};
    for (const s of symbols) {
      const key = s.toUpperCase();
      if (stockCache!.data[key]) {
        filtered[key] = stockCache!.data[key];
      }
    }
    // Only refetch if we're missing symbols from cache
    if (Object.keys(filtered).length === symbols.length) {
      return filtered;
    }
  }

  // Cache miss or expired — fetch fresh data
  const data = await getStockPrices(symbols);
  stockCache = { data, timestamp: Date.now() };
  return data;
}

async function getCachedCommodityPrices(symbols: string[]): Promise<Record<string, any>> {
  if (isCacheValid(commodityCache)) {
    const filtered: Record<string, any> = {};
    for (const s of symbols) {
      const key = s.toUpperCase();
      if (commodityCache!.data[key]) {
        filtered[key] = commodityCache!.data[key];
      }
    }
    if (Object.keys(filtered).length === symbols.length) {
      return filtered;
    }
  }

  const data = await getCommodityPrices(symbols);
  commodityCache = { data, timestamp: Date.now() };
  return data;
}

// ─── Route handler ───

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
    const stockSymbols = symbols.filter(s => STOCK_SYMBOLS.includes(s.toUpperCase()));
    const commoditySymbols = symbols.filter(s => COMMODITY_SYMBOLS.includes(s.toUpperCase()));
    const cryptoSymbols = symbols.filter(s => 
      !COMMODITY_SYMBOLS.includes(s.toUpperCase()) && 
      !STOCK_SYMBOLS.includes(s.toUpperCase())
    );

    // Fetch all asset classes in parallel
    // Crypto: MEXC (no rate limit concern, fresh every request)
    // Stocks + Commodities: Twelve Data (cached 30s to respect 8 credits/min limit)
    const [cryptoPrices, stockPricesData, commodityPricesData] = await Promise.all([
      cryptoSymbols.length > 0 ? getMexcPrices(cryptoSymbols) : {},
      stockSymbols.length > 0 ? getCachedStockPrices(stockSymbols) : {},
      commoditySymbols.length > 0 ? getCachedCommodityPrices(commoditySymbols) : {},
    ]);

    const allPrices: Record<string, any> = {
      ...cryptoPrices,
      ...stockPricesData,
      ...commodityPricesData,
    };

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
