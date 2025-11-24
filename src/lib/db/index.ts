import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Parse DATABASE_URL to add SSL if needed
const databaseUrl = process.env.DATABASE_URL;
const url = new URL(databaseUrl);

// Disable prefetch as it is not supported for "Transaction" pool mode
// Enable SSL for Render.com PostgreSQL
const client = postgres(databaseUrl, { 
  prepare: false,
  ssl: { rejectUnauthorized: false } // Render.com requires SSL
});

export const db = drizzle(client, { schema });
