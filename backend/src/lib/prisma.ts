import path from 'path';
import { PrismaClient } from '@prisma/client';

const dbPath = path.resolve(__dirname, '../../prisma/dev.db');
const dbUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || `file:${dbPath}`;

let adapter: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaLibSQL } = require('@prisma/adapter-libsql');
  adapter = new PrismaLibSQL({
    url: dbUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
} catch (nodeAdapterError: any) {
  try {
    // Fallback for environments without native node bindings (e.g. Android Termux)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaLibSQL } = require('@prisma/adapter-libsql/dist/index-web.js');
    adapter = new PrismaLibSQL({
      url: dbUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  } catch (webAdapterError: any) {
    console.warn('[prisma] Warning: LibSQL adapter could not be initialized:', webAdapterError?.message || nodeAdapterError?.message);
  }
}

export const prisma = adapter ? new PrismaClient({ adapter }) : new PrismaClient();
