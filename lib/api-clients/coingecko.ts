import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Map common symbols to CoinGecko IDs
const symbolToId: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'LINK': 'chainlink',
  'AVAX': 'avalanche-2',
  'MATIC': 'matic-network',
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'ATOM': 'cosmos',
  'NEAR': 'near',
  'FIL': 'filecoin',
  'STETH': 'staked-ether',
};

export async function getPrices(symbols: string[]) {
  try {
    // Convert symbols to CoinGecko IDs
    const ids = symbols
      .map(s => symbolToId[s.toUpperCase()] || s.toLowerCase())
      .filter(Boolean);

    if (ids.length === 0) {
      return {};
    }

    const response = await axios.get(`${COINGECKO_API}/simple/price`, {
      params: {
        ids: ids.join(','),
        vs_currencies: 'usd',
        include_market_cap: 'true',
        include_24hr_vol: 'true',
        include_24hr_change: 'true',
        include_last_updated_at: 'true',
      },
    });

    // Transform response to our format
    const prices: Record<string, any> = {};
    
    Object.entries(response.data).forEach(([id, data]: [string, any]) => {
      // Find the original symbol
      const symbol = Object.entries(symbolToId).find(
        ([_, coinId]) => coinId === id
      )?.[0] || id.toUpperCase();

      prices[symbol] = {
        symbol,
        current: data.usd || 0,
        changePercent24h: data.usd_24h_change || 0,
        volume24h: data.usd_24h_vol || 0,
        marketCap: data.usd_market_cap || 0,
      };
    });

    return prices;
  } catch (error) {
    console.error('[v0] CoinGecko API error:', error);
    return {};
  }
}

export async function searchCoins(query: string) {
  try {
    const response = await axios.get(`${COINGECKO_API}/search`, {
      params: { query },
    });

    return response.data.coins || [];
  } catch (error) {
    console.error('[v0] CoinGecko search error:', error);
    return [];
  }
}
