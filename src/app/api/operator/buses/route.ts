import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    const defaultTenant = await prisma.tenant.findFirst({ where: { code: 'BHABACHYAKA' } });
    const tenantId = session?.tenantId || defaultTenant?.id;

    const buses = await prisma.bus.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ buses });
  } catch (error) {
    console.error('Bus list error:', error);
    return NextResponse.json({ error: 'Failed to fetch buses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const defaultTenant = await prisma.tenant.findFirst({ where: { code: 'BHABACHYAKA' } });
    const tenantId = session?.tenantId || defaultTenant?.id;

    const { regNumber, fleetNumber, coachType, model, totalSeats = 36, seatLayoutType = '2x2', isAc = true, amenities = [] } = await request.json();

    if (!regNumber || !model) {
      return NextResponse.json({ error: 'Registration number and model are required' }, { status: 400 });
    }

    const bus = await prisma.bus.create({
      data: {
        tenantId: tenantId!,
        regNumber,
        fleetNumber: fleetNumber || `BE-${Math.floor(100 + Math.random() * 900)}`,
        coachType: coachType || 'BUSINESS_CLASS',
        model,
        totalSeats: Number(totalSeats),
        seatLayoutType,
        isAc: Boolean(isAc),
        amenities: JSON.stringify(amenities.length > 0 ? amenities : ['WiFi', 'AC', 'Charging']),
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ success: true, bus });
  } catch (error) {
    console.error('Add bus error:', error);
    return NextResponse.json({ error: 'Failed to add bus' }, { status: 500 });
  }
}
