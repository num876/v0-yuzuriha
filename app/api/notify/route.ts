import { NextRequest, NextResponse } from 'next/server';

// Mock notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, message, channel = 'telegram' } = body;

    console.log(`[v0] Notification (${channel}):`, message);

    return NextResponse.json({
      success: true,
      message: 'Notification queued',
      channel,
    });
  } catch (error) {
    console.error('[v0] Notification API error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
