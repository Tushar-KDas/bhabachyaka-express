import { PrismaClient } from '@prisma/client';

const directUrl = 'postgresql://neondb_owner:npg_6kUWE0twJuOx@ep-soft-term-b4q5uovj.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';
const prismaDirect = new PrismaClient({
  datasources: { db: { url: directUrl } }
});

async function testDirect() {
  console.log('--- Testing DIRECT Connection (No Pooler) ---');
  const t0 = Date.now();
  await prismaDirect.$connect();
  console.log(`Direct Connection established in: ${Date.now() - t0}ms`);

  const t1 = Date.now();
  await prismaDirect.trip.count();
  console.log(`Trip count took: ${Date.now() - t1}ms`);

  const t2 = Date.now();
  await prismaDirect.trip.findMany({
    take: 5,
    include: { route: true, bus: true },
  });
  console.log(`findMany 5 trips took: ${Date.now() - t2}ms`);

  await prismaDirect.$disconnect();
}

testDirect().catch(console.error);
