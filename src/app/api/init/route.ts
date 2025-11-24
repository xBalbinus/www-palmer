import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db/init';

// This endpoint initializes the database and creates Palmer admin user
// Call this once to set up the database
// Note: Use POST /api/admin/api-key to generate/regenerate API keys
export async function GET() {
  try {
    const apiKey = await initDatabase();
    return NextResponse.json({
      success: true,
      message: 'Database initialized',
      palmerApiKey: apiKey || 'Palmer admin user already exists. Use POST /api/admin/api-key to generate a new key.',
      note: 'To generate or regenerate Palmer\'s API key, use POST /api/admin/api-key',
    });
  } catch (error: any) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize database' },
      { status: 500 }
    );
  }
}

