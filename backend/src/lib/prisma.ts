import path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const dbPath = path.resolve(__dirname, '../../prisma/dev.db');
const dbUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || `file:${dbPath}`;

const adapter = new PrismaLibSQL({
  url: dbUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const prisma = new PrismaClient({ adapter });
