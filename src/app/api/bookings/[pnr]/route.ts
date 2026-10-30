import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateQRCodeDataUrl } from '@/lib/ticket';

export async function GET(request: Request, { params }: { params: { pnr: string } }) {
  try {
    const { pnr } = params;

    const booking = await prisma.booking.findUnique({
      where: { pnr: pnr.toUpperCase().trim() },
      include: {
        tenant: true,
        trip: {
          include: {
            bus: true,
            route: true,
          },
        },
        passengers: true,
        tickets: true,
        payments: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found with this PNR' }, { status: 404 });
    }

    // Attach QR Code data URLs to tickets
    const ticketsWithQr = await Promise.all(
      booking.tickets.map(async (t) => {
        const qrUrl = await generateQRCodeDataUrl(t.qrCodeData);
        return {
          ...t,
          qrCodeUrl: qrUrl,
        };
      })
    );

    return NextResponse.json({
      booking: {
        id: booking.id,
        pnr: booking.pnr,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerEmail: booking.customerEmail,
        totalAmount: booking.totalAmount,
        discountAmount: booking.discountAmount,
        payableAmount: booking.payableAmount,
        status: booking.status,
        bookingChannel: bookingChannelLabel(booking.bookingChannel),
        boardingStop: booking.boardingStop,
        droppingStop: booking.droppingStop,
        createdAt: booking.createdAt,
      },
      operator: {
        name: booking.tenant.name,
        nameBn: booking.tenant.nameBn,
        code: booking.tenant.code,
        logoUrl: booking.tenant.logoUrl,
        contactPhone: booking.tenant.contactPhone,
      },
      trip: {
        id: booking.trip.id,
        departureTime: booking.trip.departureTime,
        arrivalTime: booking.trip.arrivalTime,
        driverName: booking.trip.driverName,
        driverPhone: booking.trip.driverPhone,
        supervisorName: booking.trip.supervisorName,
        supervisorPhone: booking.trip.supervisorPhone,
        route: {
          name: booking.trip.route.name,
          nameBn: booking.trip.route.nameBn,
          originCity: booking.trip.route.originCity,
          destinationCity: booking.trip.route.destinationCity,
        },
        bus: {
          regNumber: booking.trip.bus.regNumber,
          fleetNumber: booking.trip.bus.fleetNumber,
          coachType: booking.trip.bus.coachType,
          model: booking.trip.bus.model,
          isAc: booking.trip.bus.isAc,
        },
      },
      passengers: booking.passengers,
      tickets: ticketsWithQr,
      payments: booking.payments,
    });
  } catch (error) {
    console.error('Booking lookup error:', error);
    return NextResponse.json({ error: 'Failed to look up booking' }, { status: 500 });
  }
}

function bookingChannelLabel(channel: string) {
  if (channel === 'COUNTER') return 'Counter POS';
  if (channel === 'PHONE') return 'Phone Reservation';
  return 'Online Booking';
}
