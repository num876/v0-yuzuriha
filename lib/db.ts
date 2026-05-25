import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

// Ensure data directory exists
function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

interface Settings {
  autopilotThreshold: number;
  okxApiKey: string;
  alpacaApiKey: string;
  oandaApiKey: string;
  oandaAccountId: string;
  oandaEnvironment: string;
  telegramToken: string;
  telegramChatId: string;
  framework: string;
  notificationEmail: string;
  isLiveTrading: boolean;
  mexcApiKey?: string;
  mexcSecretKey?: string;
}

interface Signal {
  id: string;
  pair: string;
  timeframe: string;
  type: 'buy' | 'sell';
  confidence: number;
  price: number;
  timestamp: string;
  strength: 'strong' | 'medium' | 'weak';
  assetClass: 'crypto' | 'stock' | 'commodity';
  reasoning?: string;
  status?: 'pending' | 'executed' | 'skipped';
}

interface Trade {
  id: string;
  pair: string;
  side: 'buy' | 'sell';
  size: number;
  price: number;
  timeframe: string;
  exchange: string;
  confidence: number;
  reasoning: string;
  executedAt: string;
  status: string;
  pnl?: number;
  pnlPercent?: number;
}

interface ScheduledTrade {
  id: string;
  pair: string;
  side: 'buy' | 'sell';
  timeframe: string;
  positionSize: number;
  createdAt: string;
  framework: string;
  assetClass: 'crypto' | 'stock' | 'commodity';
  exchange?: string;
}

interface DatabaseSchema {
  signals: Signal[];
  trades: Trade[];
  scheduledTrades: ScheduledTrade[];
  settings: Settings;
}

const defaultDb: DatabaseSchema = {
  signals: [
    {
      id: 'SIG001',
      pair: 'BTC-USDT',
      timeframe: '1h',
      type: 'buy',
      confidence: 85,
      price: 82410,
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      strength: 'strong',
      assetClass: 'crypto',
      reasoning: 'RSI oversold, 4h trend bullish',
      status: 'executed',
    },
    {
      id: 'SIG002',
      pair: 'ETH-USDT',
      timeframe: '4h',
      type: 'sell',
      confidence: 72,
      price: 3410,
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      strength: 'strong',
      assetClass: 'crypto',
      reasoning: 'Double top pattern, EMA cross bearish',
      status: 'executed',
    },
  ],
  trades: [
    {
      id: 'TRD001',
      pair: 'BTC-USDT',
      side: 'buy',
      size: 100,
      price: 82410,
      timeframe: '1h',
      exchange: 'OKX Demo',
      confidence: 85,
      reasoning: 'RSI oversold, 4h trend bullish',
      executedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      status: 'executed',
      pnl: 2.4,
      pnlPercent: 2.4,
    },
  ],
  scheduledTrades: [],
  settings: {
    autopilotThreshold: 70,
    okxApiKey: 'pk_test_***',
    alpacaApiKey: 'pk_test_***',
    oandaApiKey: 'Bearer token_***',
    oandaAccountId: 'account_***',
    oandaEnvironment: 'practice',
    telegramToken: 'bot_***',
    telegramChatId: 'YOUR_TELEGRAM_CHAT_ID_HERE',
    framework: 'Al Brooks',
    notificationEmail: 'user@example.com',
    isLiveTrading: false,
    mexcApiKey: 'mexc_api_***',
    mexcSecretKey: 'mexc_secret_***',
  },
};

export function readDb(): DatabaseSchema {
  try {
    ensureDirectoryExistence(DB_FILE);
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
      return defaultDb;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read local DB file:', error);
    return defaultDb;
  }
}

export function writeDb(db: DatabaseSchema) {
  try {
    ensureDirectoryExistence(DB_FILE);
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write local DB file:', error);
  }
}
