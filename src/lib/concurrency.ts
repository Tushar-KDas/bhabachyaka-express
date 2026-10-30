import { prisma } from './prisma';

export const HOLD_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Release all expired seat holds across the database
 */
export async function releaseExpiredHolds() {
  const now = new Date();

  // Find all expired holds
  const expiredHolds = await prisma.seatHold.findMany({
    where: {
      expiresAt: { lt: now },
    },
  });

  if (expiredHolds.length === 0) return 0;

  for (const hold of expiredHolds) {
    // Revert seat to AVAILABLE if it is currently HELD
    await prisma.tripSeat.updateMany({
      where: {
        tripId: hold.tripId,
        seatNumber: hold.seatNumber,
        status: 'HELD',
      },
      data: {
        status: 'AVAILABLE',
        heldUntil: null,
        heldByToken: null,
      },
    });
  }

  // Delete the expired hold records
  const deleted = await prisma.seatHold.deleteMany({
    where: {
      expiresAt: { lt: now },
    },
  });

  return deleted.count;
}

/**
 * Attempt to hold seats for a booking session
 */
export async function holdSeats(
  tripId: string,
  seatNumbers: string[],
  holdToken: string,
  sessionId?: string
): Promise<{ success: boolean; error?: string; heldSeats?: string[] }> {
  // First release expired holds
  await releaseExpiredHolds();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + HOLD_DURATION_MS);

  // Retrieve current status of requested seats
  const seats = await prisma.tripSeat.findMany({
    where: {
      tripId,
      seatNumber: { in: seatNumbers },
    },
  });

  if (seats.length !== seatNumbers.length) {
    return { success: false, error: 'One or more selected seats do not exist on this coach.' };
  }

  for (const seat of seats) {
    if (seat.status === 'BOOKED' || seat.status === 'BLOCKED') {
      return { success: false, error: `Seat ${seat.seatNumber} has already been reserved.` };
    }
    if (seat.status === 'HELD' && seat.heldByToken !== holdToken && seat.heldUntil && seat.heldUntil > now) {
      return { success: false, error: `Seat ${seat.seatNumber} is currently held by another customer.` };
    }
  }

  // Update trip seats to HELD
  await prisma.$transaction(async (tx) => {
    for (const seatNo of seatNumbers) {
      await tx.tripSeat.update({
        where: {
          tripId_seatNumber: {
            tripId,
            seatNumber: seatNo,
          },
        },
        data: {
          status: 'HELD',
          heldUntil: expiresAt,
          heldByToken: holdToken,
        },
      });

      await tx.seatHold.upsert({
        where: {
          tripId_seatNumber: {
            tripId,
            seatNumber: seatNo,
          },
        },
        create: {
          tripId,
          seatNumber: seatNo,
          holdToken,
          expiresAt,
          customerSessionId: sessionId,
        },
        update: {
          holdToken,
          expiresAt,
          customerSessionId: sessionId,
        },
      });
    }
  });

  return { success: true, heldSeats: seatNumbers };
}
