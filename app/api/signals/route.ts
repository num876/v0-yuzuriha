import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { sendTelegramMessage } from '@/lib/api-clients/telegram';
import { isStockSymbol } from '@/lib/utils';
import { getMexcCurrentPrice } from '@/lib/api-clients/mexc';

// GET all signals
export async function GET(request: NextRequest) {
  try {
    const db = readDb();
    return NextResponse.json({
      signals: db.signals,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[v0] Signals GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signals' },
      { status: 500 }
    );
  }
}

// POST new signal (Ingestion from TradingView pipeline)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      pair,
      timeframe,
      type,
      confidence,
      price,
      reasoning = 'Technical indicator alignment',
      recommendation = 'execute',
      ticker, // TradingView webhook format might pass ticker instead of pair
      action, // TradingView action e.g. BUY_STRONG, SELL
    } = body;

    const db = readDb();

    // Map input fields from standard or TradingView webhook simulator format
    const cleanPair = (pair || ticker || 'BTC-USDT').replace('USDT', '-USDT');
    const cleanTimeframe = timeframe || '1h';
    let cleanType = type || 'buy';
    if (action) {
      cleanType = action.toLowerCase().includes('sell') ? 'sell' : 'buy';
    }
    const cleanConfidence = Number(confidence) || 75;

    // Fetch real price from MEXC if not provided
    let cleanPrice = Number(price) || 0;
    if (!cleanPrice) {
      const mexcPrice = await getMexcCurrentPrice(cleanPair);
      cleanPrice = mexcPrice || 0;
    }

    const newSignal = {
      id: `SIG${Date.now()}`,
      pair: cleanPair,
      timeframe: cleanTimeframe,
      type: cleanType as 'buy' | 'sell',
      confidence: cleanConfidence,
      price: cleanPrice,
      timestamp: new Date().toISOString(),
      strength: cleanConfidence >= 80 ? 'strong' : cleanConfidence >= 60 ? 'medium' : 'weak' as any,
      assetClass: isStockSymbol(cleanPair) ? 'stock' : 'crypto' as any,
      reasoning,
      status: 'pending' as any,
    };

    // Autopilot check
    const threshold = db.settings.autopilotThreshold;
    const isAutopilotQualified = cleanConfidence >= threshold && recommendation === 'execute';

    if (isAutopilotQualified) {
      newSignal.status = 'executed';
      
      let executedExchange = db.settings.isLiveTrading ? 'Live Exchange' : 'OKX Demo';
      let okxOrderId = undefined;
      let errorDetails = undefined;

      // Execute on OKX via Worker if crypto
      const isCrypto = newSignal.assetClass === 'crypto';
      if (isCrypto) {
        if (!db.settings.isLiveTrading) {
          try {
            const { OKXClient } = await import('@/lib/api-clients/okx');
            const client = new OKXClient();
            const instId = OKXClient.formatSymbol(cleanPair);

            let sz = "0.001";
            if (cleanPrice > 0) {
              const calculatedSize = 100 / cleanPrice; // Autopilot defaults to $100
              sz = Math.max(0.001, calculatedSize).toFixed(4);
            }

            const tradeResponse = await client.placeOrder({
              instId,
              side: cleanType as 'buy' | 'sell',
              sz,
              apiKey: db.settings.okxApiKey,
              secretKey: db.settings.okxSecretKey,
              passphrase: db.settings.okxPassphrase,
            });
            
            okxOrderId = tradeResponse?.orderId || `CF_WRK_${Date.now()}`;
            executedExchange = 'OKX Demo (Worker)';
          } catch (okxError: any) {
            console.error('[v0] Auto OKX Worker trade execution failed:', okxError);
            errorDetails = okxError.message;
            executedExchange = 'OKX Demo (Failed - Mocked)';
          }
        }
      }
      
      // Execute the trade (save to trades list)
      const newTrade = {
        id: `TRD${Date.now()}`,
        pair: cleanPair,
        side: cleanType as 'buy' | 'sell',
        size: 100, // Default trade size
        price: cleanPrice,
        timeframe: cleanTimeframe,
        exchange: executedExchange,
        confidence: cleanConfidence,
        reasoning: errorDetails ? `${reasoning} (API Error: ${errorDetails})` : reasoning,
        executedAt: new Date().toISOString(),
        status: 'executed',
        pnl: 0,
        pnlPercent: 0,
        okxOrderId,
      };
      
      db.trades.unshift(newTrade);

      // Telegram notification
      // Generate clean message
      const isStrongBuy = cleanConfidence >= 80 && cleanType === 'buy';
      let message = '';
      if (isStrongBuy) {
        message = `🔥 STRONG BUY SIGNAL\nPair: ${cleanPair}\nConfidence: ${cleanConfidence}%\nAuto-executed via Autopilot`;
      } else {
        message = `⚡️ TRADE EXECUTED\nPair: ${cleanPair}\nSide: ${cleanType.toUpperCase()}\nSize: $100\nPrice: $${cleanPrice.toLocaleString()}\nTimeframe: ${cleanTimeframe}\nExchange: ${newTrade.exchange}\nConfidence: ${cleanConfidence}%\nReasoning: ${reasoning}`;
      }

      // Check if bot token is configured in db settings
      const token = db.settings.telegramToken && db.settings.telegramToken !== 'bot_***' 
        ? db.settings.telegramToken 
        : process.env.TELEGRAM_BOT_TOKEN;
      const chatId = db.settings.telegramChatId && db.settings.telegramChatId !== 'YOUR_TELEGRAM_CHAT_ID_HERE'
        ? db.settings.telegramChatId
        : process.env.TELEGRAM_CHAT_ID;

      if (token && chatId && chatId !== 'YOUR_TELEGRAM_CHAT_ID_HERE') {
        try {
          const url = `https://api.telegram.org/bot${token}/sendMessage`;
          await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: 'HTML',
            }),
          });
        } catch (tgErr) {
          console.error('Failed to send Telegram message:', tgErr);
        }
      }
    } else {
      newSignal.status = 'skipped';
    }

    // Check pre-scheduled trades: "Pre-scheduled trades move from Waiting to Execute -> Active Signals when signal fires"
    const matchedScheduledIndex = db.scheduledTrades.findIndex(
      t => t.pair.toUpperCase() === cleanPair.toUpperCase() && t.side.toLowerCase() === cleanType.toLowerCase()
    );

    if (matchedScheduledIndex !== -1) {
      const scheduledTrade = db.scheduledTrades[matchedScheduledIndex];
      
      let executedExchange = scheduledTrade.exchange || (db.settings.isLiveTrading ? 'Live Exchange' : 'OKX Demo');
      let okxOrderId = undefined;
      let errorDetails = undefined;

      // Execute on OKX via Worker if crypto
      const isCrypto = scheduledTrade.assetClass === 'crypto';
      if (isCrypto && !db.settings.isLiveTrading) {
        try {
          const { OKXClient } = await import('@/lib/api-clients/okx');
          const client = new OKXClient();
          const instId = OKXClient.formatSymbol(scheduledTrade.pair);

          let sz = "0.001";
          if (cleanPrice > 0) {
            const calculatedSize = (Number(scheduledTrade.positionSize) || 100) / cleanPrice;
            sz = Math.max(0.001, calculatedSize).toFixed(4);
          }

          const tradeResponse = await client.placeOrder({
            instId,
            side: scheduledTrade.side as 'buy' | 'sell',
            sz,
            apiKey: db.settings.okxApiKey,
            secretKey: db.settings.okxSecretKey,
            passphrase: db.settings.okxPassphrase,
          });
          
          okxOrderId = tradeResponse?.orderId || `CF_WRK_${Date.now()}`;
          executedExchange = 'OKX Demo (Worker)';
        } catch (okxError: any) {
          console.error('[v0] Scheduled OKX Worker trade execution failed:', okxError);
          errorDetails = okxError.message;
          executedExchange = 'OKX Demo (Failed - Mocked)';
        }
      }

      // Execute the scheduled trade
      const newTrade = {
        id: `TRD_SCH_${Date.now()}`,
        pair: scheduledTrade.pair,
        side: scheduledTrade.side,
        size: scheduledTrade.positionSize,
        price: cleanPrice,
        timeframe: scheduledTrade.timeframe,
        exchange: executedExchange,
        confidence: cleanConfidence,
        reasoning: errorDetails ? `Scheduled trigger failed: ${errorDetails}` : `Executed via pre-scheduled trade trigger: ${scheduledTrade.framework}`,
        executedAt: new Date().toISOString(),
        status: 'executed',
        okxOrderId,
      };
      db.trades.unshift(newTrade);
      
      // Remove from scheduled trades
      db.scheduledTrades.splice(matchedScheduledIndex, 1);

      // Telegram notification for scheduled execution
      const message = `⚡️ TRADE EXECUTED\nPair: ${scheduledTrade.pair}\nSide: ${scheduledTrade.side.toUpperCase()}\nSize: $${scheduledTrade.positionSize}\nPrice: $${cleanPrice.toLocaleString()}\nTimeframe: ${scheduledTrade.timeframe}\nExchange: ${newTrade.exchange}\nConfidence: ${cleanConfidence}%\nReasoning: Pre-scheduled trade triggered via ${scheduledTrade.framework}`;
      
      const token = db.settings.telegramToken && db.settings.telegramToken !== 'bot_***' 
        ? db.settings.telegramToken 
        : process.env.TELEGRAM_BOT_TOKEN;
      const chatId = db.settings.telegramChatId && db.settings.telegramChatId !== 'YOUR_TELEGRAM_CHAT_ID_HERE'
        ? db.settings.telegramChatId
        : process.env.TELEGRAM_CHAT_ID;

      if (token && chatId && chatId !== 'YOUR_TELEGRAM_CHAT_ID_HERE') {
        try {
          const url = `https://api.telegram.org/bot${token}/sendMessage`;
          await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: 'HTML',
            }),
          });
        } catch (tgErr) {
          console.error('Failed to send Telegram message:', tgErr);
        }
      }
    }

    db.signals.unshift(newSignal);
    writeDb(db);

    return NextResponse.json({
      success: true,
      signal: newSignal,
    });
  } catch (error) {
    console.error('[v0] Signals POST API error:', error);
    return NextResponse.json(
      { error: 'Failed to ingest signal' },
      { status: 500 }
    );
  }
}
