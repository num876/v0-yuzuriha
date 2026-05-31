import { readDb, writeDb } from '../lib/db';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function updateKV() {
  try {
    const db = await readDb();
    console.log('Found existing DB, updating OKX keys...');
    db.settings.okxApiKey = '7ab93a5c-3582-419c-a9ac-1d17431181c2';
    db.settings.okxSecretKey = 'F29B5C22AA3DDD7136BA397308FF1A35';
    await writeDb(db);
    console.log('Successfully updated KV database!');
  } catch (err) {
    console.error('Failed to update KV database:', err);
  }
}

updateKV();
