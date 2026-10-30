import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    const defaultTenant = await prisma.tenant.findFirst({ where: { code: 'BHABACHYAKA' } });
    const tenantId = session?.tenantId || defaultTenant?.id;

    const trips = await prisma.trip.findMany({
      where: { tenantId },
      include: {
        route: true,
        bus: true,
        seats: true,
      },
      orderBy: { departureTime: 'asc' },
    });

    return NextResponse.json({
      trips: trips.map((t) => ({
        id: t.id,
        route: t.route.name,
        routeBn: t.route.nameBn,
        busModel: t.bus.model,
        busReg: t.bus.regNumber,
        coachType: t.bus.coachType,
        departureTime: t.departureTime,
        arrivalTime: t.arrivalTime,
        baseFare: t.baseFare,
        driverName: t.driverName,
        supervisorName: t.supervisorName,
        status: t.status,
        trafficStatus: t.trafficStatus,
        trafficNote: t.trafficNote,
        currentLocation: t.currentLocation,
        availableSeats: t.seats.filter((s) => s.status === 'AVAILABLE').length,
        totalSeats: t.seats.length,
      })),
    });
  } catch (error) {
    console.error('Trip list error:', error);
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const defaultTenant = await prisma.tenant.findFirst({ where: { code: 'BHABACHYAKA' } });
    const tenantId = session?.tenantId || defaultTenant?.id;

    const { routeId, busId, departureTime, baseFare = 1200, driverName, driverPhone, supervisorName, supervisorPhone } = await request.json();

    if (!routeId || !busId || !departureTime) {
      return NextResponse.json({ error: 'Route, Bus, and Departure time are required' }, { status: 400 });
    }

    const bus = await prisma.bus.findUnique({ where: { id: busId } });
    const route = await prisma.route.findUnique({ where: { id: routeId } });
    if (!bus || !route) {
      return NextResponse.json({ error: 'Bus or Route not found' }, { status: 404 });
    }

    const depDate = new Date(departureTime);
    const arrDate = new Date(depDate.getTime() + (route.estDurationMinutes || 360) * 60 * 1000);

    const trip = await prisma.trip.create({
      data: {
        tenantId: tenantId!,
        routeId,
        busId,
        departureTime: depDate,
        arrivalTime: arrDate,
        baseFare: Number(baseFare),
        driverName: driverName || 'মোঃ রফিকুল ইসলাম',
        driverPhone: driverPhone || '01811-002244',
        supervisorName: supervisorName || 'মোঃ জহিরুল হক',
        supervisorPhone: supervisorPhone || '01811-556677',
        status: 'SCHEDULED',
        trafficStatus: 'NORMAL',
        trafficNote: 'Scheduled on time departure',
        currentLocation: route.originCity,
      },
    });

    // Auto-generate seats for this trip (2x2 or 2x1)
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const cols = bus.seatLayoutType === '2x1' ? [1, 2, 3] : [1, 2, 3, 4];
    const seatsToInsert = [];

    for (const r of rows) {
      for (const c of cols) {
        seatsToInsert.push({
          tripId: trip.id,
          seatNumber: `${r}${c}`,
          seatClass: r === 'A' || r === 'B' ? 'VIP' : 'STANDARD',
          fare: Number(baseFare),
          status: 'AVAILABLE',
        });
      }
    }

    await prisma.tripSeat.createMany({
      data: seatsToInsert,
    });

    return NextResponse.json({ success: true, trip });
  } catch (error) {
    console.error('Create trip error:', error);
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
  }
}
