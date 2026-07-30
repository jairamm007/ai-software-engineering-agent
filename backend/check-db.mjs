import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 20 });
const p = new PrismaClient({ adapter });

try {
  await p.$connect();
  console.log('connected');
  const tables = await p.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
  console.log('tables:', tables);
} catch(e) {
  console.log('error:', e.message);
} finally {
  await p.$disconnect();
}
