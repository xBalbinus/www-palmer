import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, palmerApplications } from '@/lib/db/schema';
import { verifyApiKey, getApiKeyFromHeaders } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function PATCH(
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

    const body = await request.json();
    const { action, count } = body;

    // Verify user exists
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create palmer application
    let palmerApp = await db.select()
      .from(palmerApplications)
      .where(eq(palmerApplications.userId, userId))
      .limit(1);

    let currentCount = 0;
    let appId: number;

    if (palmerApp.length === 0) {
      // Create palmer application if it doesn't exist
      const [newApp] = await db.insert(palmerApplications).values({
        userId: userId,
        sessionCount: 0,
        updatedAt: new Date(),
      }).returning();
      appId = newApp.id;
      currentCount = newApp.sessionCount;
    } else {
      appId = palmerApp[0].id;
      currentCount = palmerApp[0].sessionCount;
    }

    let newCount: number;

    if (action === 'set' || action === 'update') {
      // Set to specific count
      if (typeof count !== 'number' || count < 0) {
        return NextResponse.json(
          { error: 'Count must be a non-negative number' },
          { status: 400 }
        );
      }
      newCount = count;
    } else if (action === 'increment' || action === 'plus') {
      // Increment by count (default 1)
      const increment = typeof count === 'number' ? count : 1;
      newCount = currentCount + increment;
    } else if (action === 'decrement' || action === 'minus') {
      // Decrement by count (default 1)
      const decrement = typeof count === 'number' ? count : 1;
      newCount = Math.max(0, currentCount - decrement);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "set", "increment", or "decrement"' },
        { status: 400 }
      );
    }

    // Update session count
    const [updated] = await db.update(palmerApplications)
      .set({
        sessionCount: newCount,
        updatedAt: new Date(),
      })
      .where(eq(palmerApplications.id, appId))
      .returning();

    return NextResponse.json({
      success: true,
      palmerApplication: updated,
      previousCount: currentCount,
      newCount: newCount,
    });
  } catch (error: any) {
    console.error('Error updating sessions:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

