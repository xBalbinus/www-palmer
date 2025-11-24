import { db } from './index';
import { adminUsers } from './schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function initDatabase() {
  try {
    // Check if Palmer admin user exists, if not create it
    const existingPalmer = await db.select().from(adminUsers).where(eq(adminUsers.name, 'Palmer')).limit(1);
    
    if (existingPalmer.length === 0) {
      // Generate API key
      const apiKey = crypto.randomBytes(32).toString('hex');
      
      await db.insert(adminUsers).values({
        name: 'Palmer',
        email: 'palmer@admin.local',
        apiKey: apiKey,
      });

      console.log('✅ Palmer admin user created with API key:', apiKey);
      console.log('⚠️  Please save this API key securely!');
      
      return apiKey;
    }

    return null;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
