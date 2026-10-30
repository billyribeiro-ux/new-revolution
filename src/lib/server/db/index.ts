import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { DATABASE_URL } from '$app/env/private';

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const normalizedUrl = DATABASE_URL.replace('host:port/', 'localhost:5432/');
const client = postgres(normalizedUrl);

export const db = drizzle(client, { schema });
