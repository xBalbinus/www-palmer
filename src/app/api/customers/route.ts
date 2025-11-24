import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, palmerApplications } from '@/lib/db/schema';
import { verifyApiKey, getApiKeyFromHeaders } from '@/lib/auth';
import { initDatabase } from '@/lib/db/init';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Initialize database on first import
if (typeof window === 'undefined') {
  initDatabase().catch(console.error);
}

export async function POST(request: NextRequest) {
  try {
    // No API key required for registration - this is a public endpoint
    const body = await request.json();
    const { name, email, phone } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate API key for the new user
    const apiKey = crypto.randomBytes(32).toString('hex');

    // Create user with API key
    const [newUser] = await db.insert(users).values({
      name,
      email,
      phone: phone || null,
      apiKey: apiKey,
      updatedAt: new Date(),
    }).returning();

    // Create palmer application entry
    const [palmerApp] = await db.insert(palmerApplications).values({
      userId: newUser.id,
      sessionCount: 0,
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
      apiKey: apiKey, // Return the API key
      palmerApplication: palmerApp,
      message: 'User created successfully. Save your API key - you will need it to access the admin panel.',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = await getApiKeyFromHeaders();
    if (!await verifyApiKey(apiKey)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      sessionCount: palmerApplications.sessionCount,
      palmerAppId: palmerApplications.id,
    })
      .from(users)
      .leftJoin(palmerApplications, eq(users.id, palmerApplications.userId));

    return NextResponse.json({ customers: allUsers });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

