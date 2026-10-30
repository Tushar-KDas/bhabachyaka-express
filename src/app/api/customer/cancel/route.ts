import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const { pnr, reason = 'Customer requested cancellation' } = await request.json();

    if (!pnr) {
      return NextResponse.json({ error: 'PNR is required' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { pnr: pnr.toUpperCase().trim() },
      include: {
        trip: true,
        passengers: true,
        payments: true,
        tickets: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json({ error: 'This booking has already been cancelled' }, { status: 400 });
    }

    // Cancellation policy: 10% penalty fee, 90% refund
    const penaltyFee = Math.round(booking.payableAmount * 0.1);
    const refundAmount = booking.payableAmount - penaltyFee;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Booking status
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED' },
      });

      // 2. Update Tickets status
      await tx.ticket.updateMany({
        where: { bookingId: booking.id },
        data: { status: 'CANCELLED' },
      });

      // 3. Release Seats back to AVAILABLE
      const seatNumbers = booking.passengers.map((p) => p.seatNumber);
      await tx.tripSeat.updateMany({
        where: {
          tripId: booking.tripId,
          seatNumber: { in: seatNumbers },
        },
        data: {
          status: 'AVAILABLE',
          heldUntil: null,
          heldByToken: null,
        },
      });

      // 4. Create Refund record
      const refund = await tx.refund.create({
        data: {
          bookingId: booking.id,
          paymentId: booking.payments[0]?.id || null,
          amount: refundAmount,
          penaltyFee,
          reason,
          status: 'APPROVED',
          approvedByUserId: session?.id || 'SYSTEM_AUTO_POLICY',
          processedAt: new Date(),
        },
      });

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          tenantId: booking.tenantId,
          userId: session?.id,
          action: 'CANCEL_BOOKING',
          entityType: 'BOOKING',
          entityId: booking.id,
          details: JSON.stringify({ pnr, refundAmount, penaltyFee, reason }),
        },
      });

      return { updatedBooking, refund };
    });

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully. Refund approved.',
      refundAmount,
      penaltyFee,
      pnr: booking.pnr,
    });
  } catch (error) {
    console.error('Cancellation error:', error);
    return NextResponse.json({ error: 'Failed to process cancellation' }, { status: 500 });
  }
}
