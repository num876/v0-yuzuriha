import axios from 'axios';

const TWELVE_DATA_API = 'https://api.twelvedata.com';

/**
 * Twelve Data quote response shape (relevant fields).
 */
interface TwelveDataQuote {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  open: string;
  high: string;
  low: string;
  close: string;
  previous_close: string;
  change: string;
  percent_change: string;
  volume: string;
  is_market_open: boolean;
}

/**
 * Map of commodity symbols to their Twelve Data symbol format.
 * Twelve Data uses forex-style pairs for metals and futures for oil.
 */
const COMMODITY_SYMBOL_MAP: Record<string, string> = {
  'XAUUSD': 'XAU/USD',
  'XAGUSD': 'XAG/USD',
  'USOIL': 'CL',       // Crude oil futures
  'GLD': 'GLD',         // Gold ETF (trades as stock)
};

/**
 * Fetch quotes for multiple symbols from Twelve Data.
 * Supports stocks, forex, commodities, and crypto.
 * Uses the /quote endpoint with comma-separated symbols.
 *
 * @param symbols - Array of symbols in Twelve Data format (e.g. ["AAPL", "MSFT", "XAU/USD"])
 * @returns Record of original symbol -> price data in our standard format
 */
export async function getTwelveDataQuotes(symbols: string[]): Promise<Record<string, any>> {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    console.error('[TwelveData] No API key configured (TWELVE_DATA_API_KEY)');
    return {};
  }

  if (symbols.length === 0) return {};

  const prices: Record<string, any> = {};

  try {
    // Twelve Data allows comma-separated symbols (up to 120 per request)
    const symbolString = symbols.join(',');

    const response = await axios.get(`${TWELVE_DATA_API}/quote`, {
      params: {
        symbol: symbolString,
        apikey: apiKey,
      },
      timeout: 10000,
    });

    const data = response.data;

    // If single symbol, response is the quote object directly
    // If multiple symbols, response is keyed by symbol
    if (symbols.length === 1) {
      const quote = data as TwelveDataQuote;
      if (quote && quote.close && !data.code) {
        const sym = symbols[0];
        prices[sym] = mapQuoteToPrice(sym, quote);
      }
    } else {
      // Multiple symbols: response is { "AAPL": {...}, "MSFT": {...}, ... }
      for (const [tdSymbol, quote] of Object.entries(data)) {
        const q = quote as TwelveDataQuote;
        if (q && q.close && !(quote as any).code) {
          prices[tdSymbol] = mapQuoteToPrice(tdSymbol, q);
        }
      }
    }

    return prices;
  } catch (error) {
    console.error('[TwelveData] Failed to fetch quotes:', error);
    return {};
  }
}

/**
 * Convert a Twelve Data quote response to our standard price format.
 */
function mapQuoteToPrice(symbol: string, quote: TwelveDataQuote) {
  const current = parseFloat(quote.close) || 0;
  const change24h = parseFloat(quote.change) || 0;
  const changePercent24h = parseFloat(quote.percent_change) || 0;
  const high24h = parseFloat(quote.high) || current;
  const low24h = parseFloat(quote.low) || current;
  const volume24h = parseFloat(quote.volume) || 0;

  return {
    symbol,
    current,
    change24h,
    changePercent24h,
    high24h,
    low24h,
    volume24h,
    isMarketOpen: quote.is_market_open ?? null,
    exchange: quote.exchange || '',
    name: quote.name || '',
  };
}

/**
 * Fetch stock prices from Twelve Data.
 * @param symbols - Array of stock tickers e.g. ["AAPL", "TSLA", "NVDA"]
 */
export async function getStockPrices(symbols: string[]): Promise<Record<string, any>> {
  return getTwelveDataQuotes(symbols);
}

/**
 * Fetch commodity prices from Twelve Data (gold, silver, oil).
 * Maps our internal symbols (XAUUSD, XAGUSD, USOIL) to Twelve Data format.
 * @param symbols - Array of commodity symbols e.g. ["XAUUSD", "XAGUSD", "USOIL"]
 */
export async function getCommodityPrices(symbols: string[]): Promise<Record<string, any>> {
  // Map internal symbols to Twelve Data symbols
  const tdSymbols = symbols
    .map(s => COMMODITY_SYMBOL_MAP[s.toUpperCase()])
    .filter(Boolean);

  if (tdSymbols.length === 0) return {};

  const tdPrices = await getTwelveDataQuotes(tdSymbols);

  // Map back from Twelve Data symbols to our internal symbols
  const prices: Record<string, any> = {};
  for (const [internalSymbol, tdSymbol] of Object.entries(COMMODITY_SYMBOL_MAP)) {
    if (symbols.map(s => s.toUpperCase()).includes(internalSymbol) && tdPrices[tdSymbol]) {
      prices[internalSymbol] = {
        ...tdPrices[tdSymbol],
        symbol: internalSymbol, // Use our internal symbol name
      };
    }
  }

  return prices;
}
