import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  console.log('Testing DB connection speed...');
  const t0 = Date.now();
  await prisma.$connect();
  const tConnect = Date.now() - t0;
  console.log(`Connection established in: ${tConnect}ms`);

  const t1 = Date.now();
  const tripCount = await prisma.trip.count();
  const tQuery1 = Date.now() - t1;
  console.log(`Trip count query (${tripCount} trips) took: ${tQuery1}ms`);

  const t2 = Date.now();
  const trips = await prisma.trip.findMany({
    take: 5,
    include: { route: true, bus: true },
  });
  const tQuery2 = Date.now() - t2;
  console.log(`findMany 5 trips with relations took: ${tQuery2}ms`);

  await prisma.$disconnect();
}

test().catch(console.error);
