import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ 
      status: 'ok',
      message: 'Simple test endpoint works',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error',
      message: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
