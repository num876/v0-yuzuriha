import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const source = request.headers.get("X-Internal-Source");
    const body = await request.json();

    if (source !== "dashboard") {
      console.warn("Rejected request", { source, body });
      return NextResponse.json({ error: "Forbidden source" }, { status: 403 });
    }

    console.log("Incoming request", { source, body });

    const { ticker, signal, size } = body;

    if (!ticker || !signal) {
      return NextResponse.json({ error: "Missing ticker or signal" }, { status: 400 });
    }

    const db = await readDb();

    const payload = {
      ticker,
      signal,
      size: size || 100,
      apiKey: db.settings.okxApiKey,
      secretKey: db.settings.okxSecretKey,
      passphrase: db.settings.okxPassphrase
    };

    console.log("Forwarding to worker", payload);

    const workerRes = await fetch('https://okx-trade-executor.okx-trader.workers.dev', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Webhook-Secret': process.env.WEBHOOK_SECRET || 'yuzuriha2025'
      },
      body: JSON.stringify(payload)
    });

    console.log("Worker status", workerRes.status);
    
    let workerData;
    try {
      workerData = await workerRes.json();
    } catch {
      workerData = await workerRes.text();
    }
    
    console.log("Worker response", workerData);

    if (!workerRes.ok) {
      return NextResponse.json({ error: "Worker failed", details: workerData }, { status: 500 });
    }

    // Save to ledger to keep the UI up-to-date
    if (workerData && workerData.success) {
      const pair = ticker.includes('USDT') ? ticker.replace('USDT', '-USDT') : ticker;
      db.trades.unshift({
        id: `TRD${Date.now()}`,
        pair,
        side: signal,
        positionSize: payload.size,
        entryPrice: 0,
        leverage: 1,
        status: 'Active',
        orderId: workerData.orderId || `CF_WRK_${Date.now()}`,
        timestamp: new Date().toISOString()
      });
      await writeDb(db);
    }

    return NextResponse.json({ success: true, data: workerData });
  } catch (error: any) {
    console.error("API error", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}
