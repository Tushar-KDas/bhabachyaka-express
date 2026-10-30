import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const bookings = await prisma.booking.findMany({
    include: {
      passengers: true,
      trip: {
        include: { route: true, bus: true },
      },
    },
  });
  console.log(`Found ${bookings.length} bookings:`);
  for (const b of bookings) {
    console.log(`- PNR: ${b.pnr} | Name: ${b.customerName} | Phone: ${b.customerPhone} | Status: ${b.status} | Seats: ${b.passengers.map(p => p.seatNumber).join(', ')}`);
  }
  await prisma.$disconnect();
}

main().catch(console.error);
