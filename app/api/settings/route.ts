import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = readDb();
    return NextResponse.json(db.settings);
  } catch (error) {
    console.error('[v0] Settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = readDb();
    
    db.settings = {
      ...db.settings,
      ...body,
    };
    
    writeDb(db);
    return NextResponse.json({ success: true, settings: db.settings });
  } catch (error) {
    console.error('[v0] Settings POST error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
