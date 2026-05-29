import axios from 'axios';

const MEXC_API = 'https://api.mexc.com/api/v3';

/**
 * Fetch 24hr ticker data for a single symbol from MEXC.
 * Public endpoint — no API key required.
 * @param symbol - Trading pair symbol e.g. "BTCUSDT"
 */
export async function getMexcTicker(symbol: string) {
  try {
    const response = await axios.get(`${MEXC_API}/ticker/24hr`, {
      params: { symbol },
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error(`[MEXC] Failed to fetch ticker for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch the latest price for a single symbol from MEXC.
 * Lighter weight than the full 24hr ticker.
 * @param symbol - Trading pair symbol e.g. "BTCUSDT"
 */
export async function getMexcPrice(symbol: string): Promise<number | null> {
  try {
    const response = await axios.get(`${MEXC_API}/ticker/price`, {
      params: { symbol },
      timeout: 5000,
    });
    return response.data?.price ? parseFloat(response.data.price) : null;
  } catch (error) {
    console.error(`[MEXC] Failed to fetch price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Map common crypto symbols to MEXC trading pair format.
 * MEXC uses e.g. "BTCUSDT" (no separator).
 */
function toMexcSymbol(symbol: string): string {
  const upper = symbol.toUpperCase().replace(/[-/]/g, '');
  // If it already ends with USDT, return as-is
  if (upper.endsWith('USDT')) return upper;
  return `${upper}USDT`;
}

/**
 * Fetch real-time prices for multiple crypto symbols from MEXC.
 * Uses the 24hr ticker endpoint for full market data.
 * @param symbols - Array of base symbols e.g. ["BTC", "ETH", "SOL"]
 * @returns Record of symbol -> price data in our standard format
 */
export async function getMexcPrices(symbols: string[]): Promise<Record<string, any>> {
  const prices: Record<string, any> = {};

  if (symbols.length === 0) return prices;

  try {
    // Fetch all tickers at once (single request, filter client-side)
    const response = await axios.get(`${MEXC_API}/ticker/24hr`, {
      timeout: 8000,
    });

    const allTickers = Array.isArray(response.data) ? response.data : [];

    // Build a lookup map from MEXC symbol -> ticker data
    const tickerMap = new Map<string, any>();
    for (const ticker of allTickers) {
      tickerMap.set(ticker.symbol, ticker);
    }

    // Map each requested symbol to its MEXC ticker
    for (const symbol of symbols) {
      const mexcSymbol = toMexcSymbol(symbol);
      const ticker = tickerMap.get(mexcSymbol);

      if (ticker) {
        const current = parseFloat(ticker.lastPrice) || 0;
        const openPrice = parseFloat(ticker.openPrice) || current;
        const change24h = current - openPrice;
        const changePercent24h = parseFloat(ticker.priceChangePercent) || 0;
        const high24h = parseFloat(ticker.highPrice) || current;
        const low24h = parseFloat(ticker.lowPrice) || current;
        const volume24h = parseFloat(ticker.quoteVolume) || 0;

        prices[symbol.toUpperCase()] = {
          symbol: symbol.toUpperCase(),
          current,
          change24h,
          changePercent24h,
          high24h,
          low24h,
          volume24h,
        };
      }
    }

    return prices;
  } catch (error) {
    console.error('[MEXC] Failed to fetch batch prices:', error);

    // Fallback: fetch individually for each symbol
    const results = await Promise.allSettled(
      symbols.map(async (symbol) => {
        const mexcSymbol = toMexcSymbol(symbol);
        const ticker = await getMexcTicker(mexcSymbol);

        if (ticker) {
          const current = parseFloat(ticker.lastPrice) || 0;
          const openPrice = parseFloat(ticker.openPrice) || current;

          prices[symbol.toUpperCase()] = {
            symbol: symbol.toUpperCase(),
            current,
            change24h: current - openPrice,
            changePercent24h: parseFloat(ticker.priceChangePercent) || 0,
            high24h: parseFloat(ticker.highPrice) || current,
            low24h: parseFloat(ticker.lowPrice) || current,
            volume24h: parseFloat(ticker.quoteVolume) || 0,
          };
        }
      })
    );

    return prices;
  }
}

/**
 * Fetch a single real-time price from MEXC for a trading pair.
 * Used as fallback when executing trades and no price is provided.
 * @param pair - Trading pair like "BTC-USDT" or "BTC"
 * @returns The current price, or null if unavailable
 */
export async function getMexcCurrentPrice(pair: string): Promise<number | null> {
  // Clean the pair: "BTC-USDT" -> "BTCUSDT", "BTC" -> "BTCUSDT"
  const baseSymbol = pair.split('-')[0].split('/')[0].toUpperCase();
  const mexcSymbol = toMexcSymbol(baseSymbol);
  return getMexcPrice(mexcSymbol);
}
