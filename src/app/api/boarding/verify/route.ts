import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const { query, confirmBoarding = false } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'PNR or Ticket verification code is required' }, { status: 400 });
    }

    let parsedQuery = query.trim();
    // In case query is raw JSON from QR code
    if (parsedQuery.startsWith('{')) {
      try {
        const qrJson = JSON.parse(parsedQuery);
        parsedQuery = qrJson.ticket || qrJson.pnr || parsedQuery;
      } catch {
        // ignore JSON parse error
      }
    }

    // Lookup ticket by ticketNumber, pnr, or verificationCode
    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [
          { ticketNumber: parsedQuery },
          { pnr: parsedQuery.toUpperCase() },
          { verificationCode: parsedQuery },
        ],
      },
      include: {
        booking: {
          include: {
            trip: {
              include: {
                route: true,
                bus: true,
              },
            },
            passengers: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({
        valid: false,
        error: 'No valid ticket found matching this code or PNR.',
      }, { status: 404 });
    }

    const passenger = ticket.booking.passengers.find((p) => p.seatNumber === ticket.seatNumber) || ticket.booking.passengers[0];

    // Check if already boarded
    if (ticket.status === 'BOARDED') {
      return NextResponse.json({
        valid: true,
        alreadyBoarded: true,
        ticketNumber: ticket.ticketNumber,
        pnr: ticket.pnr,
        seatNumber: ticket.seatNumber,
        passengerName: passenger?.passengerName || ticket.booking.customerName,
        passengerPhone: passenger?.passengerPhone || ticket.booking.customerPhone,
        route: ticket.booking.trip.route.name,
        bus: ticket.booking.trip.bus.regNumber,
        departureTime: ticket.booking.trip.departureTime,
        boardedAt: ticket.boardedAt,
        message: 'WARNING: Ticket already scanned and passenger boarded!',
      });
    }

    if (ticket.status === 'CANCELLED') {
      return NextResponse.json({
        valid: false,
        error: 'This ticket was CANCELLED. Boarding prohibited.',
      }, { status: 400 });
    }

    // If confirmBoarding requested, update ticket to BOARDED
    if (confirmBoarding) {
      const updatedTicket = await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: 'BOARDED',
          boardedAt: new Date(),
          boardedByStaffId: session?.id || 'STAFF-OFFICER',
        },
      });

      return NextResponse.json({
        valid: true,
        alreadyBoarded: false,
        boardedNow: true,
        ticketNumber: updatedTicket.ticketNumber,
        pnr: updatedTicket.pnr,
        seatNumber: updatedTicket.seatNumber,
        passengerName: passenger?.passengerName || ticket.booking.customerName,
        passengerPhone: passenger?.passengerPhone || ticket.booking.customerPhone,
        route: ticket.booking.trip.route.name,
        departureTime: ticket.booking.trip.departureTime,
        boardedAt: updatedTicket.boardedAt,
        message: 'Boarding confirmed successfully!',
      });
    }

    // Just verifying
    return NextResponse.json({
      valid: true,
      alreadyBoarded: false,
      ticketNumber: ticket.ticketNumber,
      pnr: ticket.pnr,
      seatNumber: ticket.seatNumber,
      passengerName: passenger?.passengerName || ticket.booking.customerName,
      passengerPhone: passenger?.passengerPhone || ticket.booking.customerPhone,
      route: ticket.booking.trip.route.name,
      bus: ticket.booking.trip.bus.regNumber,
      departureTime: ticket.booking.trip.departureTime,
      boardingStop: ticket.booking.boardingStop,
      droppingStop: ticket.booking.droppingStop,
    });
  } catch (error) {
    console.error('Boarding verification error:', error);
    return NextResponse.json({ error: 'Failed to verify ticket' }, { status: 500 });
  }
}
