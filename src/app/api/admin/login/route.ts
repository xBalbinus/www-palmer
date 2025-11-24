import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminApiKey } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    if (await verifyAdminApiKey(apiKey)) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Error in login:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

