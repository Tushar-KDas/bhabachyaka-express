import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    const defaultTenant = await prisma.tenant.findFirst({ where: { code: 'BHABACHYAKA' } });
    const tenantId = session?.tenantId || defaultTenant?.id;

    const routes = await prisma.route.findMany({
      where: { tenantId },
      include: {
        stops: {
          orderBy: { sequenceOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ routes });
  } catch (error) {
    console.error('Route list error:', error);
    return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const defaultTenant = await prisma.tenant.findFirst({ where: { code: 'BHABACHYAKA' } });
    const tenantId = session?.tenantId || defaultTenant?.id;

    const { name, nameBn, originCity, destinationCity, distanceKm = 250, estDurationMinutes = 360, stops = [] } = await request.json();

    if (!originCity || !destinationCity) {
      return NextResponse.json({ error: 'Origin and destination cities are required' }, { status: 400 });
    }

    const route = await prisma.route.create({
      data: {
        tenantId: tenantId!,
        name: name || `${originCity} to ${destinationCity}`,
        nameBn: nameBn || `${originCity} ➔ ${destinationCity}`,
        originCity,
        destinationCity,
        distanceKm: Number(distanceKm),
        estDurationMinutes: Number(estDurationMinutes),
        stops: {
          create: stops.length > 0 ? stops : [
            { stopName: `${originCity} Main Terminal`, stopNameBn: `${originCity} টার্মিনাল`, stopType: 'BOARDING', sequenceOrder: 1 },
            { stopName: `${destinationCity} Main Station`, stopNameBn: `${destinationCity} স্টেশন`, stopType: 'DROPPING', sequenceOrder: 2, timeOffsetMinutes: Number(estDurationMinutes) },
          ],
        },
      },
      include: { stops: true },
    });

    return NextResponse.json({ success: true, route });
  } catch (error) {
    console.error('Add route error:', error);
    return NextResponse.json({ error: 'Failed to add route' }, { status: 500 });
  }
}
