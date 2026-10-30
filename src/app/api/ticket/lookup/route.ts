import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateQRCodeDataUrl } from '@/lib/ticket';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('query') || searchParams.get('pnr') || searchParams.get('phone') || '').trim();

    if (!query) {
      return NextResponse.json({ error: 'Please enter a PNR or mobile number' }, { status: 400 });
    }

    // Clean query
    const cleanPhone = query.replace(/[^0-9]/g, '');
    const isPhoneNumber = cleanPhone.length >= 10 && (query.startsWith('01') || query.startsWith('+8801') || /^\d+$/.test(query));
    const upperPnr = query.toUpperCase();

    // Query DB by PNR or Phone
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { pnr: upperPnr },
          { customerPhone: cleanPhone },
          { customerPhone: query },
          {
            passengers: {
              some: {
                passengerPhone: cleanPhone,
              },
            },
          },
        ],
      },
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
      orderBy: { createdAt: 'desc' },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'No ticket found with this PNR or Mobile Number.' },
        { status: 404 }
      );
    }

    // Get Base App URL for authoritative QR Code URL
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (request.headers.get('host') ? `http://${request.headers.get('host')}` : 'http://localhost:3000');
    
    // Verification URL that opens when the QR Code is scanned
    const verifyUrl = `${appUrl}/bn/verify-ticket?pnr=${encodeURIComponent(booking.pnr)}`;
    const qrCodeDataUrl = await generateQRCodeDataUrl(verifyUrl);

    // Format seat numbers & passenger names
    const seatNumbers = booking.passengers.map((p) => p.seatNumber).join(', ');
    const leadPassengerName = booking.passengers[0]?.passengerName || booking.customerName;

    return NextResponse.json({
      success: true,
      ticket: {
        id: booking.id,
        pnr: booking.pnr,
        customerName: booking.customerName,
        leadPassengerName,
        customerPhone: booking.customerPhone,
        seatNumbers: seatNumbers || 'A1',
        passengers: booking.passengers.map((p) => ({
          seatNumber: p.seatNumber,
          passengerName: p.passengerName,
          passengerPhone: p.passengerPhone || booking.customerPhone,
          fare: p.fare,
        })),
        status: booking.status,
        payableAmount: booking.payableAmount,
        totalAmount: booking.totalAmount,
        discountAmount: booking.discountAmount,
        boardingStop: booking.boardingStop || 'সেন্ট্রাল বাস টার্মিনাল',
        droppingStop: booking.droppingStop || 'প্রধান বাস কাউন্টার',
        createdAt: booking.createdAt,
        route: {
          name: booking.trip.route.name,
          nameBn: booking.trip.route.nameBn,
          originCity: booking.trip.route.originCity,
          destinationCity: booking.trip.route.destinationCity,
        },
        trip: {
          departureTime: booking.trip.departureTime,
          arrivalTime: booking.trip.arrivalTime,
          driverName: booking.trip.driverName,
          driverPhone: booking.trip.driverPhone,
          bus: {
            regNumber: booking.trip.bus.regNumber,
            model: booking.trip.bus.model,
            coachType: booking.trip.bus.coachType,
            isAc: booking.trip.bus.isAc,
          },
        },
        operator: {
          name: booking.tenant.name,
          nameBn: booking.tenant.nameBn,
        },
        verifyUrl,
        qrCodeDataUrl,
      },
    });
  } catch (error) {
    console.error('Ticket lookup error:', error);
    return NextResponse.json({ error: 'Failed to look up ticket' }, { status: 500 });
  }
}
