import { NextRequest, NextResponse } from 'next/server';

// This route specifically handles the Foundry webhook format: { ticker, signal }
// It forwards the payload to our existing robust /api/signals endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticker, signal } = body;

    if (!ticker || !signal) {
      return NextResponse.json(
        { error: 'Missing required fields: ticker and signal' },
        { status: 400 }
      );
    }

    // Forward to our internal signals API to ensure it hits the DB, dashboard, and Cloudflare Worker
    const baseUrl = request.nextUrl.origin;
    const internalRes = await fetch(`${baseUrl}/api/signals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pair: ticker,
        type: signal.toLowerCase(),
        confidence: 100, // External signals from Foundry are treated as high confidence to trigger execution
        recommendation: 'execute',
        reasoning: 'Automated signal from Foundry integration',
      }),
    });

    const data = await internalRes.json();

    if (!internalRes.ok) {
      return NextResponse.json(
        { error: 'Failed to process signal internally', details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Signal received and forwarded to execution engine',
      data,
    });
  } catch (error: any) {
    console.error('[v0] /api/signal Webhook Error:', error.message);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
