import dotenv from 'dotenv';
import path from 'path';

// Load .env before PrismaClient (imports in index.ts are hoisted above dotenv.config())
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
});

export default prisma;
