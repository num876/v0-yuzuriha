import axios from 'axios';

const OANDA_API_BASE = 'https://api-fxpractice.oanda.com'; // Practice environment

interface OANDAPriceData {
  instrument: string;
  bid: number;
  ask: number;
  time: string;
}

interface OANDATradeRequest {
  instrument: string;
  units: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop';
  priceBound?: number;
}

interface OANDATradeResponse {
  id: string;
  instrument: string;
  initialUnits: number;
  currentUnits: number;
  realizedPL: number;
  unrealizedPL: number;
  marginUsed: number;
  averageClosePrice: number;
  closingTime?: string;
  financing: number;
  dividendAdjustment: number;
  openTime: string;
  tradeOpenedID?: number;
  takeProfitOrderID?: number;
  stopLossOrderID?: number;
  trailingStopLossOrderID?: number;
  state: string;
}

export class OANDAClient {
  private apiKey: string;
  private accountId: string;
  private baseUrl: string;

  constructor(apiKey: string, accountId: string, environment: 'practice' | 'live' = 'practice') {
    this.apiKey = apiKey;
    this.accountId = accountId;
    this.baseUrl = environment === 'live'
      ? 'https://api-fxtrade.oanda.com'
      : 'https://api-fxpractice.oanda.com';
  }

  async getPrice(instrument: string): Promise<OANDAPriceData | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v3/accounts/${this.accountId}/pricing`,
        {
          params: { instruments: instrument },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept-Datetime-Format': 'UNIX',
          },
        }
      );

      if (response.data.prices && response.data.prices.length > 0) {
        const priceData = response.data.prices[0];
        return {
          instrument: priceData.instrument,
          bid: parseFloat(priceData.bids[0].price),
          ask: parseFloat(priceData.asks[0].price),
          time: priceData.time,
        };
      }

      return null;
    } catch (error) {
      console.error('[v0] OANDA get price error:', error);
      return null;
    }
  }

  async getPrices(instruments: string[]): Promise<Record<string, OANDAPriceData>> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v3/accounts/${this.accountId}/pricing`,
        {
          params: { instruments: instruments.join(',') },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept-Datetime-Format': 'UNIX',
          },
        }
      );

      const prices: Record<string, OANDAPriceData> = {};

      if (response.data.prices) {
        response.data.prices.forEach((priceData: any) => {
          prices[priceData.instrument] = {
            instrument: priceData.instrument,
            bid: parseFloat(priceData.bids[0].price),
            ask: parseFloat(priceData.asks[0].price),
            time: priceData.time,
          };
        });
      }

      return prices;
    } catch (error) {
      console.error('[v0] OANDA get prices error:', error);
      return {};
    }
  }

  async executeTrade(trade: OANDATradeRequest): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v3/accounts/${this.accountId}/trades`,
        {
          orders: [
            {
              instrument: trade.instrument,
              units: trade.side === 'buy' ? Math.abs(trade.units) : -Math.abs(trade.units),
              type: trade.type || 'market',
              priceBound: trade.priceBound,
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('[v0] OANDA trade execution error:', error);
      throw error;
    }
  }

  async closeTrade(tradeId: string): Promise<any> {
    try {
      const response = await axios.put(
        `${this.baseUrl}/v3/accounts/${this.accountId}/trades/${tradeId}/close`,
        { units: 'ALL' },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('[v0] OANDA trade close error:', error);
      throw error;
    }
  }

  async getOpenTrades(): Promise<OANDATradeResponse[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v3/accounts/${this.accountId}/openTrades`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.trades || [];
    } catch (error) {
      console.error('[v0] OANDA get open trades error:', error);
      return [];
    }
  }

  async getAccountBalance(): Promise<number | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v3/accounts/${this.accountId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.account?.balance ? parseFloat(response.data.account.balance) : null;
    } catch (error) {
      console.error('[v0] OANDA get balance error:', error);
      return null;
    }
  }
}
