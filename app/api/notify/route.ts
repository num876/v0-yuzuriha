import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/api-clients/telegram';
import { readDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, message, channel = 'telegram' } = body;

    const db = await readDb();

    let notificationText = message;

    if (type === 'daily_summary') {
      // Calculate real stats from database
      const totalTrades = db.trades.length;
      const wins = db.trades.filter(t => (t.pnl || 0) >= 0).length;
      const losses = totalTrades - wins;
      const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
      
      const totalPnlPercent = db.trades.reduce((acc, t) => acc + (t.pnlPercent || 0), 0);
      const sign = totalPnlPercent >= 0 ? '+' : '';

      // Find best trade
      let bestTradeStr = 'N/A';
      if (db.trades.length > 0) {
        const bestTrade = [...db.trades].sort((a, b) => (b.pnlPercent || 0) - (a.pnlPercent || 0))[0];
        if (bestTrade) {
          bestTradeStr = `${bestTrade.pair.split('-')[0]} ${bestTrade.pnlPercent >= 0 ? '+' : ''}${bestTrade.pnlPercent.toFixed(1)}%`;
        }
      }

      notificationText = `📊 Yuzuriha Daily Summary\nPNL today: ${sign}${totalPnlPercent.toFixed(1)}%\nTrades: ${totalTrades} (${wins} wins, ${losses} losses)\nWin rate: ${winRate}%\nBest trade: ${bestTradeStr}\nActive signals: ${db.signals.length}`;
    }

    if (!notificationText) {
      return NextResponse.json(
        { error: 'Missing notification message or valid type' },
        { status: 400 }
      );
    }

    console.log(`[v0] Notification (${channel}):`, notificationText);

    // Get Telegram configurations
    const token = db.settings.telegramToken && db.settings.telegramToken !== 'bot_***' 
      ? db.settings.telegramToken 
      : process.env.TELEGRAM_BOT_TOKEN;
    const chatId = db.settings.telegramChatId && db.settings.telegramChatId !== 'YOUR_TELEGRAM_CHAT_ID_HERE'
      ? db.settings.telegramChatId
      : process.env.TELEGRAM_CHAT_ID;

    let telegramResult = { success: false, error: 'Telegram Bot Token or Chat ID is not configured' };

    if (channel === 'telegram' && token && chatId && chatId !== 'YOUR_TELEGRAM_CHAT_ID_HERE') {
      try {
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: notificationText,
            parse_mode: 'HTML',
          }),
        });
        const data = await res.json();
        telegramResult = { success: res.ok && data.ok, error: data.description };
      } catch (tgErr: any) {
        telegramResult = { success: false, error: tgErr.message };
      }
    }

    return NextResponse.json({
      success: true,
      message: telegramResult.success ? 'Notification sent to Telegram' : 'Notification logged locally',
      channel,
      telegram: telegramResult,
      text: notificationText,
    });
  } catch (error) {
    console.error('[v0] Notification API error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
