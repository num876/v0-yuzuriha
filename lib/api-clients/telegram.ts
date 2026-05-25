export interface TelegramSendOptions {
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disableWebPagePreview?: boolean;
}

export async function sendTelegramMessage(
  text: string,
  options: TelegramSendOptions = {}
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Gracefully handle unconfigured credentials to prevent application crashes
  if (!token || token === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
    console.warn('[v0] Telegram Bot Token is not configured. Skipping notification.');
    return { success: false, error: 'Telegram Bot Token is not configured' };
  }

  if (!chatId || chatId === 'YOUR_TELEGRAM_CHAT_ID_HERE') {
    console.warn('[v0] Telegram Chat ID is not configured. Skipping notification.');
    return { success: false, error: 'Telegram Chat ID is not configured' };
  }

  const parseMode = options.parseMode || 'HTML';
  const disablePreview = options.disableWebPagePreview !== false; // Default true

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: parseMode,
        disable_web_page_preview: disablePreview,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      const errorMsg = data.description || `HTTP error ${response.status}`;
      console.error('[v0] Telegram API error:', errorMsg);
      return { success: false, error: errorMsg };
    }

    return {
      success: true,
      messageId: data.result?.message_id,
    };
  } catch (error) {
    console.error('[v0] Failed to send Telegram message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown network error',
    };
  }
}
