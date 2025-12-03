import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, {
  ssl: "require",
  max: 10,
});

export const db = drizzle(client, { schema });

export * from "./schema";
export { eq, and, or, desc, asc, sql } from "drizzle-orm";

