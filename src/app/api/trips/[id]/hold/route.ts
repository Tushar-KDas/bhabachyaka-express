import { NextResponse } from 'next/server';
import { holdSeats } from '@/lib/concurrency';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: tripId } = params;
    const { seatNumbers, holdToken, sessionId } = await request.json();

    if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return NextResponse.json({ error: 'Seat numbers are required' }, { status: 400 });
    }

    if (!holdToken) {
      return NextResponse.json({ error: 'Hold token is required' }, { status: 400 });
    }

    const result = await holdSeats(tripId, seatNumbers, holdToken, sessionId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      heldSeats: result.heldSeats,
      expiresInMinutes: 10,
    });
  } catch (error) {
    console.error('Seat hold error:', error);
    return NextResponse.json({ error: 'Failed to hold seats' }, { status: 500 });
  }
}
