import { db } from './db';
import { users, adminUsers } from './db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function verifyApiKey(apiKey: string | null): Promise<boolean> {
  if (!apiKey) return false;
  
  // Check both users and admin_users tables
  const user = await db.select().from(users).where(eq(users.apiKey, apiKey)).limit(1);
  if (user.length > 0) return true;
  
  const admin = await db.select().from(adminUsers).where(eq(adminUsers.apiKey, apiKey)).limit(1);
  return admin.length > 0;
}

export async function getUserByApiKey(apiKey: string | null) {
  if (!apiKey) return null;
  
  const user = await db.select().from(users).where(eq(users.apiKey, apiKey)).limit(1);
  if (user.length > 0) return user[0];
  
  return null;
}

export async function getApiKeyFromHeaders(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get('x-api-key') || headersList.get('authorization')?.replace('Bearer ', '') || null;
}

// Verify API key for admin login (checks users table)
export async function verifyAdminApiKey(apiKey: string | null): Promise<boolean> {
  if (!apiKey) return false;
  
  // Check users table for API key
  const user = await db.select().from(users).where(eq(users.apiKey, apiKey)).limit(1);
  return user.length > 0;
}

