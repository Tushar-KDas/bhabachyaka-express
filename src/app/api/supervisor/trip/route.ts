import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');

    let trip;
    if (tripId) {
      trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          route: true,
          bus: true,
          bookings: {
            where: { status: 'CONFIRMED' },
            include: {
              passengers: true,
              tickets: true,
            },
          },
        },
      });
    } else {
      // Return first scheduled / active trip
      trip = await prisma.trip.findFirst({
        where: {
          status: { in: ['SCHEDULED', 'BOARDING', 'DEPARTED', 'ON_HIGHWAY', 'REST_BREAK'] },
        },
        include: {
          route: true,
          bus: true,
          bookings: {
            where: { status: 'CONFIRMED' },
            include: {
              passengers: true,
              tickets: true,
            },
          },
        },
        orderBy: { departureTime: 'asc' },
      });
    }

    if (!trip) {
      return NextResponse.json({ error: 'No active trip found' }, { status: 404 });
    }

    // Build passenger check-in manifest
    const manifest: any[] = [];
    let boardedCount = 0;

    for (const b of trip.bookings) {
      for (const p of b.passengers) {
        const ticket = b.tickets.find((t) => t.seatNumber === p.seatNumber);
        const isBoarded = ticket?.status === 'BOARDED';
        if (isBoarded) boardedCount++;

        manifest.push({
          ticketId: ticket?.id,
          ticketNumber: ticket?.ticketNumber,
          pnr: b.pnr,
          seatNumber: p.seatNumber,
          passengerName: p.passengerName,
          passengerPhone: p.passengerPhone || b.customerPhone,
          gender: p.gender,
          boardingStop: b.boardingStop,
          droppingStop: b.droppingStop,
          isBoarded,
          boardedAt: ticket?.boardedAt,
        });
      }
    }

    manifest.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));

    // Also get all available scheduled trips for selector
    const allTrips = await prisma.trip.findMany({
      include: { route: true, bus: true },
      orderBy: { departureTime: 'asc' },
      take: 10,
    });

    return NextResponse.json({
      trip: {
        id: trip.id,
        route: trip.route.name,
        routeBn: trip.route.nameBn,
        originCity: trip.route.originCity,
        destinationCity: trip.route.destinationCity,
        busReg: trip.bus.regNumber,
        busModel: trip.bus.model,
        coachType: trip.bus.coachType,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        driverName: trip.driverName,
        driverPhone: trip.driverPhone,
        supervisorName: trip.supervisorName,
        supervisorPhone: trip.supervisorPhone,
        status: trip.status,
        trafficStatus: trip.trafficStatus || 'NORMAL',
        trafficNote: trip.trafficNote || 'Highway conditions are normal.',
        currentLocation: trip.currentLocation || trip.route.originCity,
        delayMinutes: trip.delayMinutes || 0,
      },
      stats: {
        totalBookedPassengers: manifest.length,
        boardedCount,
        remainingCount: manifest.length - boardedCount,
      },
      manifest,
      allTrips: allTrips.map((t) => ({
        id: t.id,
        label: `${t.route.name} (${new Date(t.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}) - ${t.bus.regNumber}`,
      })),
    });
  } catch (error) {
    console.error('Supervisor trip error:', error);
    return NextResponse.json({ error: 'Failed to fetch supervisor trip' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { action, tripId, ticketId, status, trafficStatus, trafficNote, currentLocation, delayMinutes } = body;

    if (action === 'CHECK_IN_PASSENGER') {
      if (!ticketId) {
        return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
      }

      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          status: 'BOARDED',
          boardedAt: new Date(),
          boardedByStaffId: session?.id || 'SUPERVISOR',
        },
      });

      return NextResponse.json({ success: true, ticket: updatedTicket });
    }

    if (action === 'UPDATE_STATUS') {
      if (!tripId) {
        return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (trafficStatus) updateData.trafficStatus = trafficStatus;
      if (trafficNote !== undefined) updateData.trafficNote = trafficNote;
      if (currentLocation !== undefined) updateData.currentLocation = currentLocation;
      if (delayMinutes !== undefined) updateData.delayMinutes = Number(delayMinutes);

      const updatedTrip = await prisma.trip.update({
        where: { id: tripId },
        data: updateData,
      });

      return NextResponse.json({ success: true, trip: updatedTrip });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Supervisor action error:', error);
    return NextResponse.json({ error: 'Failed to process supervisor action' }, { status: 500 });
  }
}
