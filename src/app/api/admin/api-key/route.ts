import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    // Get Palmer's API key
    const palmer = await db.select()
      .from(adminUsers)
      .where(eq(adminUsers.name, 'Palmer'))
      .limit(1);

    if (palmer.length === 0) {
      return NextResponse.json(
        { error: 'Palmer admin user not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ apiKey: palmer[0].apiKey });
  } catch (error: any) {
    console.error('Error fetching API key:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Generate a new API key for Palmer
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    // Check if Palmer exists
    const palmer = await db.select()
      .from(adminUsers)
      .where(eq(adminUsers.name, 'Palmer'))
      .limit(1);

    if (palmer.length === 0) {
      // Create Palmer admin user if it doesn't exist
      const [newPalmer] = await db.insert(adminUsers).values({
        name: 'Palmer',
        email: 'palmer@admin.local',
        apiKey: apiKey,
      }).returning();

      return NextResponse.json({ 
        success: true,
        apiKey: apiKey,
        message: 'Palmer admin user created with new API key'
      });
    } else {
      // Update existing Palmer with new API key
      const [updated] = await db.update(adminUsers)
        .set({ apiKey: apiKey })
        .where(eq(adminUsers.name, 'Palmer'))
        .returning();

      return NextResponse.json({ 
        success: true,
        apiKey: apiKey,
        message: 'API key regenerated for Palmer'
      });
    }
  } catch (error: any) {
    console.error('Error generating API key:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

