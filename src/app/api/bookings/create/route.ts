import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePNR, generateVerificationCode, generateQRCodeDataUrl } from '@/lib/ticket';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const {
      tripId,
      seatNumbers,
      passengers,
      customerName,
      customerPhone,
      customerEmail,
      boardingStop,
      droppingStop,
      couponCode,
      discountAmount = 0,
      paymentMethod = 'BKASH',
      bookingChannel = 'ONLINE',
      counterId,
      holdToken,
    } = body;

    if (!tripId || !seatNumbers || seatNumbers.length === 0 || !customerName || !customerPhone) {
      return NextResponse.json({ error: 'Missing required booking details' }, { status: 400 });
    }

    // 1. Authoritative Trip retrieval
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { tenant: true },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // 2. Concurrency Check: Verify seats inside a transaction
    const now = new Date();
    const seats = await prisma.tripSeat.findMany({
      where: {
        tripId,
        seatNumber: { in: seatNumbers },
      },
    });

    for (const seat of seats) {
      if (seat.status === 'BOOKED' || seat.status === 'BLOCKED') {
        return NextResponse.json(
          { error: `Seat ${seat.seatNumber} is no longer available. Please choose another seat.` },
          { status: 409 }
        );
      }
      if (seat.status === 'HELD' && seat.heldByToken && seat.heldByToken !== holdToken && seat.heldUntil && seat.heldUntil > now) {
        return NextResponse.json(
          { error: `Seat ${seat.seatNumber} is temporarily held by another person.` },
          { status: 409 }
        );
      }
    }

    // 3. Authoritative Price calculation on server
    const baseFareTotal = seats.reduce((sum, s) => sum + s.fare, 0);
    const serviceFeeTotal = trip.serviceFee * seats.length;
    const discount = Math.min(baseFareTotal + serviceFeeTotal, Math.max(0, Number(discountAmount || 0)));
    const payableAmount = Math.max(0, baseFareTotal + serviceFeeTotal - discount);

    const pnr = generatePNR();
    const trxRef = `TRX-${paymentMethod}-${Date.now().toString().slice(-8)}`;

    // 4. Atomic Execution via Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create Booking
      const booking = await tx.booking.create({
        data: {
          tenantId: trip.tenantId,
          pnr,
          tripId: trip.id,
          userId: session?.id,
          customerName,
          customerPhone,
          customerEmail,
          totalAmount: baseFareTotal,
          discountAmount: discount,
          payableAmount,
          status: 'CONFIRMED',
          bookingChannel: bookingChannel === 'COUNTER' ? 'COUNTER' : 'ONLINE',
          counterId: counterId || null,
          agentId: bookingChannel === 'COUNTER' ? session?.id : null,
          boardingStop: boardingStop || 'Main Counter',
          droppingStop: droppingStop || 'Destination Terminal',
        },
      });

      // Create Passenger Records
      for (let i = 0; i < seatNumbers.length; i++) {
        const seatNo = seatNumbers[i];
        const pInfo = (passengers && passengers[i]) || {
          passengerName: customerName,
          passengerPhone: customerPhone,
          gender: 'MALE',
          age: 30,
        };

        const seatObj = seats.find((s) => s.seatNumber === seatNo);
        const fare = seatObj ? seatObj.fare : trip.baseFare;

        await tx.bookingPassenger.create({
          data: {
            bookingId: booking.id,
            seatNumber: seatNo,
            passengerName: pInfo.passengerName || customerName,
            passengerPhone: pInfo.passengerPhone || customerPhone,
            gender: pInfo.gender || 'MALE',
            age: pInfo.age ? Number(pInfo.age) : 30,
            fare,
          },
        });

        // Create Ticket
        const verificationCode = generateVerificationCode(seatNo);
        const qrPayload = JSON.stringify({
          pnr,
          ticket: `TKT-${pnr}-${i + 1}`,
          seat: seatNo,
          operator: trip.tenant.name,
          date: trip.departureTime,
          verify: verificationCode,
        });

        await tx.ticket.create({
          data: {
            bookingId: booking.id,
            ticketNumber: `TKT-${pnr}-${i + 1}`,
            pnr,
            seatNumber: seatNo,
            qrCodeData: qrPayload,
            verificationCode,
            status: 'ISSUED',
          },
        });

        // Mark TripSeat as BOOKED
        await tx.tripSeat.update({
          where: {
            tripId_seatNumber: {
              tripId,
              seatNumber: seatNo,
            },
          },
          data: {
            status: 'BOOKED',
            heldUntil: null,
            heldByToken: null,
          },
        });
      }

      // Record Payment
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          tenantId: trip.tenantId,
          transactionRef: trxRef,
          amount: payableAmount,
          currency: 'BDT',
          paymentMethod,
          status: 'SUCCESS',
          isDemo: paymentMethod !== 'CASH',
          gatewayResponse: JSON.stringify({
            status: 'SUCCESS',
            paymentMethod,
            trxRef,
            couponCode: couponCode || null,
            discountAmount: discount,
            amount: payableAmount,
            message: paymentMethod === 'CASH' ? 'Collected in Cash at Counter' : 'Simulated Demo Payment Verified',
          }),
        },
      });

      // If Counter Cash sale, update active CashShift if exists
      if (bookingChannel === 'COUNTER' && paymentMethod === 'CASH' && session?.id) {
        const activeShift = await tx.cashShift.findFirst({
          where: {
            agentId: session.id,
            status: 'OPEN',
          },
        });

        if (activeShift) {
          await tx.cashShift.update({
            where: { id: activeShift.id },
            data: {
              cashCollected: { increment: payableAmount },
              expectedClosingBalance: { increment: payableAmount },
            },
          });

          await tx.cashTransaction.create({
            data: {
              shiftId: activeShift.id,
              type: 'TICKET_SALE',
              amount: payableAmount,
              description: `Counter Cash ticket sale: PNR ${pnr} (${seatNumbers.join(', ')})`,
              referenceId: booking.id,
            },
          });
        }
      }

      // Clean hold records
      await tx.seatHold.deleteMany({
        where: {
          tripId,
          seatNumber: { in: seatNumbers },
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          tenantId: trip.tenantId,
          userId: session?.id,
          action: 'CREATE_BOOKING',
          entityType: 'BOOKING',
          entityId: booking.id,
          details: JSON.stringify({ pnr, seats: seatNumbers, amount: payableAmount, paymentMethod }),
        },
      });

      return { booking, payment };
    });

    return NextResponse.json({
      success: true,
      pnr: result.booking.pnr,
      bookingId: result.booking.id,
      amount: payableAmount,
      seats: seatNumbers,
      paymentMethod,
      transactionRef: trxRef,
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
