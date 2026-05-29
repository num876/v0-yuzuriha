import axios from 'axios';

const WORKER_URL = "https://okx-trade-executor.okx-trader.workers.dev";
const WEBHOOK_SECRET = process.env.OKX_WEBHOOK_SECRET || "yuzuriha2025";

export class OKXClient {
  public async placeOrder(params: {
    instId: string; // e.g. BTC-USDT
    side: 'buy' | 'sell';
    ordType?: 'market' | 'limit';
    sz?: string; // Size
    px?: string; // Price (if limit)
  }) {
    // The Cloudflare worker expects { ticker: 'BTCUSDT', signal: 'buy' }
    // Clean up the instrument ID by removing dashes
    const ticker = params.instId.replace('-', '').replace('_', '').toUpperCase();
    
    try {
      const response = await axios.post(WORKER_URL, 
        { 
          ticker, 
          signal: params.side.toLowerCase() 
        }, 
        { 
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': WEBHOOK_SECRET
          } 
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Unknown Cloudflare Worker Error');
      }

      return response.data;
    } catch (error: any) {
      console.error('[OKX Worker] API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Helper method to format standard pairs (BTC-USDT) to OKX instId format
  // The worker just wants BTCUSDT without dashes, but we'll leave this to be safe 
  // and handle it inside placeOrder
  public static formatSymbol(symbol: string): string {
    return symbol.toUpperCase().replace('/', '-').replace('_', '-');
  }
}
