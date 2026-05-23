import { NextRequest, NextResponse } from 'next/server';
import { getNews } from '@/lib/api-clients/newsapi';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const asset = searchParams.get('asset') || 'Bitcoin';

    const news = await getNews(asset);

    return NextResponse.json({
      asset,
      news,
    });
  } catch (error) {
    console.error('[v0] News API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
