import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// For migrations
export const migrationClient = postgres(connectionString, { max: 1 });

// For general use
export const db = drizzle(postgres(connectionString), { schema });
