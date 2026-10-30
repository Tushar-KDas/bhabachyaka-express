import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find agent's counter assignment
    const assignment = await prisma.staffAssignment.findFirst({
      where: { userId: session.id },
      include: { counter: true },
    });

    // Find active open shift
    const activeShift = await prisma.cashShift.findFirst({
      where: {
        agentId: session.id,
        status: 'OPEN',
      },
      include: {
        counter: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    const fallbackCounter = await prisma.counter.findFirst();

    return NextResponse.json({
      counter: assignment?.counter || activeShift?.counter || fallbackCounter || null,
      activeShift,
    });
  } catch (error) {
    console.error('Counter shift status error:', error);
    return NextResponse.json({ error: 'Failed to retrieve counter shift' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, counterId, openingBalance = 0, actualClosingBalance = 0, notes } = await request.json();

    if (action === 'OPEN') {
      // Check if already open
      const existing = await prisma.cashShift.findFirst({
        where: { agentId: session.id, status: 'OPEN' },
      });

      if (existing) {
        return NextResponse.json({ error: 'You already have an open shift.' }, { status: 400 });
      }

      let targetCounterId = counterId;
      if (!targetCounterId) {
        const assign = await prisma.staffAssignment.findFirst({
          where: { userId: session.id },
        });
        targetCounterId = assign?.counterId;
      }

      if (!targetCounterId) {
        // Fallback to first counter of tenant
        const firstCounter = await prisma.counter.findFirst({
          where: { tenantId: session.tenantId || undefined },
        });
        targetCounterId = firstCounter?.id;
      }

      const tenantId = session.tenantId || (await prisma.counter.findUnique({ where: { id: targetCounterId } }))?.tenantId;

      const newShift = await prisma.cashShift.create({
        data: {
          tenantId: tenantId!,
          counterId: targetCounterId!,
          agentId: session.id,
          openingBalance: Number(openingBalance),
          cashCollected: 0.0,
          expectedClosingBalance: Number(openingBalance),
          status: 'OPEN',
          notes: notes || 'Shift opened.',
        },
      });

      return NextResponse.json({ success: true, shift: newShift });
    }

    if (action === 'CLOSE') {
      const activeShift = await prisma.cashShift.findFirst({
        where: { agentId: session.id, status: 'OPEN' },
      });

      if (!activeShift) {
        return NextResponse.json({ error: 'No active open shift found to close.' }, { status: 404 });
      }

      const expected = activeShift.expectedClosingBalance;
      const actual = Number(actualClosingBalance);
      const diff = actual - expected;

      const closedShift = await prisma.cashShift.update({
        where: { id: activeShift.id },
        data: {
          closedAt: new Date(),
          actualClosingBalance: actual,
          difference: diff,
          status: 'CLOSED',
          notes: notes ? `${activeShift.notes || ''}\nClosing Note: ${notes}` : activeShift.notes,
        },
      });

      return NextResponse.json({ success: true, shift: closedShift });
    }

    return NextResponse.json({ error: 'Invalid shift action' }, { status: 400 });
  } catch (error) {
    console.error('Counter shift action error:', error);
    return NextResponse.json({ error: 'Failed to process shift action' }, { status: 500 });
  }
}
