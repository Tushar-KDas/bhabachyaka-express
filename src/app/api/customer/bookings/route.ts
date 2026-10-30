import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    const whereClause: any = {};
    if (session?.id) {
      whereClause.OR = [
        { userId: session.id },
        { customerPhone: session.phone || undefined },
      ];
    } else if (phone) {
      whereClause.customerPhone = phone;
    } else {
      // Default to demo customer bookings
      whereClause.customerPhone = '01799887766';
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        trip: {
          include: {
            route: true,
            bus: true,
          },
        },
        passengers: true,
        tickets: true,
        payments: true,
        refunds: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Customer bookings error:', error);
    return NextResponse.json({ error: 'Failed to fetch customer bookings' }, { status: 500 });
  }
}
