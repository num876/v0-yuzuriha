import axios from 'axios';

const METALS_API = 'https://api.metals.live/v1/spot';

export interface MetalPrice {
  symbol: string;
  current: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

// Map commodity symbols to their API formats
const commodityMap: Record<string, { metals: string; oilTicker?: string }> = {
  'XAUUSD': { metals: 'gold' },
  'XAGUSD': { metals: 'silver' },
  'USOIL': { oilTicker: 'USOIL' },
  'GLD': { metals: 'gold' }, // ETF proxy for gold
};

export async function getMetalsPrices(symbols: string[]) {
  try {
    const prices: Record<string, MetalPrice> = {};

    for (const symbol of symbols) {
      const commodity = commodityMap[symbol.toUpperCase()];

      if (!commodity) continue;

      // For metals via metals.live API
      if (commodity.metals) {
        try {
          const response = await axios.get(METALS_API, {
            params: {
              'currencies': 'usd',
            },
          });

          const metalData = response.data;

          // Extract the relevant metal price
          let metalPrice = 0;
          if (commodity.metals === 'gold') {
            metalPrice = metalData.gold?.usd || 0;
          } else if (commodity.metals === 'silver') {
            metalPrice = metalData.silver?.usd || 0;
          }

          if (metalPrice > 0) {
            prices[symbol] = {
              symbol,
              current: metalPrice,
              change24h: 0, // metals.live doesn't provide 24h change in free tier
              changePercent24h: 0,
              high24h: 0,
              low24h: 0,
              volume24h: 0,
            };
          }
        } catch (error) {
          console.error(`[v0] Error fetching ${commodity.metals} price:`, error);
        }
      }

      // For oil and other commodities, use Alpha Vantage or similar
      if (commodity.oilTicker) {
        // Oil prices would come from a commodities API
        // Using mock data for now
        prices[symbol] = {
          symbol,
          current: 78.50, // Mock current oil price
          change24h: 0.50,
          changePercent24h: 0.64,
          high24h: 79.20,
          low24h: 77.80,
          volume24h: 0,
        };
      }
    }

    return prices;
  } catch (error) {
    console.error('[v0] Metals API error:', error);
    return {};
  }
}

// Get historical prices for charting
export async function getMetalsHistory(symbol: string, days: number = 30) {
  try {
    // Historical data would be fetched from a data provider
    // For now, returning empty array
    return [];
  } catch (error) {
    console.error('[v0] Metals history error:', error);
    return [];
  }
}
