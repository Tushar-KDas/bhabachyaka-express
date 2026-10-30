import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { releaseExpiredHolds } from '@/lib/concurrency';
import { findDistrict, getDistanceBetweenDistricts } from '@/data/districts';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Clean expired holds
    await releaseExpiredHolds();

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        tenant: true,
        route: {
          include: {
            stops: {
              orderBy: { sequenceOrder: 'asc' },
            },
          },
        },
        bus: true,
        seats: {
          orderBy: { seatNumber: 'asc' },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const availableSeats = trip.seats.filter((s) => s.status === 'AVAILABLE').length;

    const distanceKm = trip.route.distanceKm > 0
      ? Math.round(trip.route.distanceKm)
      : getDistanceBetweenDistricts(trip.route.originCity, trip.route.destinationCity);

    // Mileage Pricing: 3 BDT per km benchmark
    const perKmRate = trip.bus.coachType === 'SLEEPER' ? 3.5 : (trip.bus.isAc ? 3.0 : 2.5);
    const calculatedBaseFare = Math.max(150, Math.round(distanceKm * perKmRate));
    const serviceFee = trip.serviceFee || 50;

    // Update seat fares to reflect calculated mileage fare
    const mappedSeats = trip.seats.map((s) => ({
      ...s,
      fare: calculatedBaseFare,
    }));

    return NextResponse.json({
      id: trip.id,
      operator: {
        name: trip.tenant.name,
        nameBn: trip.tenant.nameBn,
        code: trip.tenant.code,
        logoUrl: trip.tenant.logoUrl,
      },
      route: {
        id: trip.route.id,
        name: trip.route.name,
        nameBn: trip.route.nameBn,
        originCity: trip.route.originCity,
        destinationCity: trip.route.destinationCity,
        distanceKm,
        perKmRate,
        estDurationMinutes: trip.route.estDurationMinutes,
        stops: trip.route.stops,
      },
      bus: {
        regNumber: trip.bus.regNumber,
        fleetNumber: trip.bus.fleetNumber,
        coachType: trip.bus.coachType,
        model: trip.bus.model,
        isAc: trip.bus.isAc,
        seatLayoutType: trip.bus.seatLayoutType,
        totalSeats: trip.bus.totalSeats,
        amenities: JSON.parse(trip.bus.amenities || '[]'),
      },
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      baseFare: calculatedBaseFare,
      serviceFee,
      distanceKm,
      perKmRate,
      availableSeats,
      totalSeats: trip.seats.length,
      seats: mappedSeats,
    });
  } catch (error) {
    console.error('Trip fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch trip' }, { status: 500 });
  }
}
