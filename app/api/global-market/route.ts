import { NextResponse } from 'next/server';
import axios from 'axios';

// ─── Server-side cache ───
// Cache global market data for 60 seconds to respect API rate limits
const CACHE_TTL_MS = 60_000;

interface GlobalMarketData {
  btcDominance: number | null;
  totalMarketCap: number | null;
  fearGreedIndex: number | null;
  fearGreedLabel: string | null;
  dxy: number | null;
}

interface CacheEntry {
  data: GlobalMarketData;
  timestamp: number;
}

let cache: CacheEntry | null = null;

function isCacheValid(): boolean {
  if (!cache) return false;
  return Date.now() - cache.timestamp < CACHE_TTL_MS;
}

// ─── CoinGecko: BTC Dominance + Total Market Cap ───
async function fetchCoinGeckoGlobal(): Promise<{
  btcDominance: number | null;
  totalMarketCap: number | null;
}> {
  try {
    const apiKey = process.env.COINGECKO_API_KEY;
    const headers: Record<string, string> = {
      accept: 'application/json',
    };

    // Use demo API with key header if available, otherwise free endpoint
    let url = 'https://api.coingecko.com/api/v3/global';
    if (apiKey) {
      headers['x-cg-demo-key'] = apiKey;
    }

    const response = await axios.get(url, {
      headers,
      timeout: 8000,
    });

    const data = response.data?.data;
    if (!data) return { btcDominance: null, totalMarketCap: null };

    return {
      btcDominance: data.market_cap_percentage?.btc
        ? Math.round(data.market_cap_percentage.btc * 10) / 10
        : null,
      totalMarketCap: data.total_market_cap?.usd ?? null,
    };
  } catch (error) {
    console.error('[GlobalMarket] CoinGecko fetch error:', error);
    return { btcDominance: null, totalMarketCap: null };
  }
}

// ─── Alternative.me: Fear & Greed Index ───
async function fetchFearGreed(): Promise<{
  fearGreedIndex: number | null;
  fearGreedLabel: string | null;
}> {
  try {
    const response = await axios.get('https://api.alternative.me/fng/?limit=1', {
      timeout: 8000,
    });

    const entry = response.data?.data?.[0];
    if (!entry) return { fearGreedIndex: null, fearGreedLabel: null };

    return {
      fearGreedIndex: parseInt(entry.value, 10),
      fearGreedLabel: entry.value_classification || null,
    };
  } catch (error) {
    console.error('[GlobalMarket] Fear & Greed fetch error:', error);
    return { fearGreedIndex: null, fearGreedLabel: null };
  }
}

// ─── Twelve Data: DXY (US Dollar Index) ───
async function fetchDXY(): Promise<number | null> {
  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) {
      console.error('[GlobalMarket] No TWELVE_DATA_API_KEY configured');
      return null;
    }

    const response = await axios.get('https://api.twelvedata.com/quote', {
      params: {
        symbol: 'DXY',
        apikey: apiKey,
      },
      timeout: 8000,
    });

    const data = response.data;
    if (data?.code || !data?.close) return null;

    return parseFloat(data.close) || null;
  } catch (error) {
    console.error('[GlobalMarket] DXY fetch error:', error);
    return null;
  }
}

// ─── Route handler ───
export async function GET() {
  try {
    // Return cached data if still fresh
    if (isCacheValid() && cache) {
      return NextResponse.json(cache.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          'X-Cache': 'HIT',
        },
      });
    }

    // Fetch all sources in parallel
    const [coinGeckoData, fearGreedData, dxy] = await Promise.all([
      fetchCoinGeckoGlobal(),
      fetchFearGreed(),
      fetchDXY(),
    ]);

    const result: GlobalMarketData = {
      btcDominance: coinGeckoData.btcDominance,
      totalMarketCap: coinGeckoData.totalMarketCap,
      fearGreedIndex: fearGreedData.fearGreedIndex,
      fearGreedLabel: fearGreedData.fearGreedLabel,
      dxy,
    };

    // Update cache
    cache = { data: result, timestamp: Date.now() };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('[GlobalMarket] API error:', error);

    // Return stale cache if available during errors
    if (cache) {
      return NextResponse.json(cache.data, {
        headers: { 'X-Cache': 'STALE' },
      });
    }

    return NextResponse.json(
      {
        btcDominance: null,
        totalMarketCap: null,
        fearGreedIndex: null,
        fearGreedLabel: null,
        dxy: null,
      },
      { status: 500 }
    );
  }
}
