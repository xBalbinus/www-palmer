import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, palmerApplications } from '@/lib/db/schema';
import { verifyApiKey, getApiKeyFromHeaders } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify API key
    const apiKey = await getApiKeyFromHeaders();
    if (!await verifyApiKey(apiKey)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const palmerApp = await db.select()
      .from(palmerApplications)
      .where(eq(palmerApplications.userId, userId))
      .limit(1);

    return NextResponse.json({
      user: user[0],
      palmerApplication: palmerApp[0] || null,
    });
  } catch (error: any) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

