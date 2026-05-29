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
    okxApiKey: 'f0403f48-7972-4006-9ed9-c4ebce8489b9',
    okxSecretKey: '317B6D017BADB1A103990416E9A08C06',
    okxPassphrase: 'passphrase_***',
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
