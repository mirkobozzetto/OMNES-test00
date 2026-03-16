#!/bin/sh
set -e

cd /app/packages/backend

echo "Running migrations..."
npx prisma migrate deploy

echo "Checking if seed is needed..."
STUDENT_COUNT=$(npx tsx -e "
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });
prisma.student.count().then(c => { console.log(c); prisma.\$disconnect(); });
" 2>/dev/null || echo "0")

if [ "$STUDENT_COUNT" = "0" ]; then
  echo "Seeding 2000 students..."
  npx tsx prisma/seed.ts
else
  echo "Database already has $STUDENT_COUNT students, skipping seed."
fi

echo "Starting server..."
exec npx tsx src/index.ts
