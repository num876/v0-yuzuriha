import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');
const KV_KEY = 'yuzuriha_db_v1';

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
  okxSecretKey?: string;
  okxPassphrase?: string;
  alpacaApiKey: string;
  alpacaSecretKey?: string;
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
  okxOrderId?: string;
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
  signals: [],
  trades: [],
  scheduledTrades: [],
  settings: {
    autopilotThreshold: 70,
    okxApiKey: '677e76fb-3a66-47ab-8b0a-f6edc49708ad',
    okxSecretKey: '750FF5FAF55F00F44526E8CDF354988B',
    okxPassphrase: 'Yuzuriha2025_',
    alpacaApiKey: 'pk_test_***',
    alpacaSecretKey: 'sk_test_***',
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

function getRedisClient() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  // Fallback for Vercel KV if they used the older integration
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  }
  return null;
}

export async function readDb(): Promise<DatabaseSchema> {
  try {
    const redis = getRedisClient();
    
    // Attempt to read from Cloud Redis first
    if (redis) {
      const data = await redis.get<DatabaseSchema>(KV_KEY);
      if (data) return data;
      
      // If DB is empty but configured, initialize it
      await redis.set(KV_KEY, defaultDb);
      return defaultDb;
    }

    // Fallback to local filesystem (Local Development)
    ensureDirectoryExistence(DB_FILE);
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
      return defaultDb;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read DB:', error);
    return defaultDb;
  }
}

export async function writeDb(db: DatabaseSchema): Promise<void> {
  try {
    const redis = getRedisClient();

    // Attempt to write to Cloud Redis
    if (redis) {
      await redis.set(KV_KEY, db);
      return;
    }

    // Fallback to local filesystem
    ensureDirectoryExistence(DB_FILE);
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write DB:', error);
  }
}
