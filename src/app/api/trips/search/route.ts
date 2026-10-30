import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { releaseExpiredHolds } from '@/lib/concurrency';
import { ensureDistrictRouteTrips } from '@/lib/routeGenerator';
import { findDistrict, getDistanceBetweenDistricts } from '@/data/districts';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin') || '';
    const destination = searchParams.get('destination') || '';
    const dateStr = searchParams.get('date');
    const busType = searchParams.get('busType');
    const timeSlot = searchParams.get('timeSlot');
    const sortBy = searchParams.get('sortBy') || 'recommended';

    // Release any expired holds in the background without blocking the search response
    releaseExpiredHolds().catch(() => {});

    // Check if origin and destination match known districts in English or Bengali
    const originDist = findDistrict(origin);
    const destDist = findDistrict(destination);

    // Build Prisma query filters with an explicit AND array to guarantee origin and destination do not overwrite each other
    const andFilters: any[] = [
      { status: { in: ['SCHEDULED', 'BOARDING', 'ON_HIGHWAY'] } },
    ];

    if (origin) {
      const originMatch: any[] = [
        { originCity: { contains: origin, mode: 'insensitive' } },
      ];
      if (originDist) {
        originMatch.push({ originCity: { contains: originDist.nameEn, mode: 'insensitive' } });
        originMatch.push({ originCity: { contains: originDist.nameBn } });
      }
      andFilters.push({
        route: {
          OR: originMatch,
        },
      });
    }

    if (destination) {
      const destMatch: any[] = [
        { destinationCity: { contains: destination, mode: 'insensitive' } },
      ];
      if (destDist) {
        destMatch.push({ destinationCity: { contains: destDist.nameEn, mode: 'insensitive' } });
        destMatch.push({ destinationCity: { contains: destDist.nameBn } });
      }
      andFilters.push({
        route: {
          OR: destMatch,
        },
      });
    }

    if (busType) {
      if (busType === 'AC') {
        andFilters.push({ bus: { isAc: true } });
      } else if (busType === 'NON_AC') {
        andFilters.push({ bus: { isAc: false } });
      } else {
        andFilters.push({ bus: { coachType: busType } });
      }
    }

    if (dateStr) {
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        const startOfDay = new Date(parsedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(parsedDate);
        endOfDay.setHours(23, 59, 59, 999);
        andFilters.push({
          departureTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
        });
      }
    }

    let trips = await prisma.trip.findMany({
      where: {
        AND: andFilters,
      },
      include: {
        route: {
          include: {
            stops: {
              orderBy: { sequenceOrder: 'asc' },
            },
          },
        },
        bus: true,
        tenant: true,
        seats: true,
      },
      orderBy: { departureTime: 'asc' },
    });

    // If no trips found and specific origin & destination requested, dynamically ensure 64-district routes!
    if (trips.length === 0 && origin && destination && origin.toLowerCase().trim() !== destination.toLowerCase().trim()) {
      const generatedTrips = await ensureDistrictRouteTrips(origin, destination, dateStr || undefined);
      if (generatedTrips && generatedTrips.length > 0) {
        trips = generatedTrips;
        if (busType) {
          if (busType === 'AC') {
            trips = trips.filter((t) => t.bus.isAc);
          } else if (busType === 'NON_AC') {
            trips = trips.filter((t) => !t.bus.isAc);
          } else {
            trips = trips.filter((t) => t.bus.coachType === busType);
          }
        }
      }
    }

    // Transform and calculate available seat counts
    let results = trips.map((t) => {
      const availableSeats = t.seats.filter((s) => s.status === 'AVAILABLE').length;
      const bookedSeats = t.seats.filter((s) => s.status === 'BOOKED').length;
      const totalSeats = t.seats.length || t.bus.totalSeats;

      const originDistObj = findDistrict(t.route.originCity);
      const destDistObj = findDistrict(t.route.destinationCity);

      const boardingStop = t.route.stops?.find((s) => s.stopType === 'BOARDING');
      const droppingStop = t.route.stops?.find((s) => s.stopType === 'DROPPING');

      const boardingCounter = {
        name: originDistObj?.counterNameEn || boardingStop?.stopName || `${t.route.originCity} Central Terminal`,
        nameBn: originDistObj?.counterNameBn || boardingStop?.stopNameBn || `${originDistObj?.nameBn || t.route.originCity} সেন্ট্রাল টার্মিনাল`,
      };

      const droppingCounter = {
        name: destDistObj?.counterNameEn || droppingStop?.stopName || `${t.route.destinationCity} Main Counter`,
        nameBn: destDistObj?.counterNameBn || droppingStop?.stopNameBn || `${destDistObj?.nameBn || t.route.destinationCity} প্রধান কাউন্টার`,
      };

      const distanceKm = t.route.distanceKm > 0
        ? Math.round(t.route.distanceKm)
        : getDistanceBetweenDistricts(t.route.originCity, t.route.destinationCity);

      // Mileage Pricing: 3 BDT per km benchmark
      const perKmRate = t.bus.coachType === 'SLEEPER' ? 3.5 : (t.bus.isAc ? 3.0 : 2.5);
      const mileageFare = Math.max(150, Math.round(distanceKm * perKmRate));
      const baseFare = mileageFare;
      const serviceFee = t.serviceFee || 50;

      return {
        id: t.id,
        operator: {
          name: t.tenant.name,
          nameBn: t.tenant.nameBn,
          code: t.tenant.code,
          logoUrl: t.tenant.logoUrl,
        },
        route: {
          name: t.route.name,
          nameBn: t.route.nameBn,
          originCity: t.route.originCity,
          destinationCity: t.route.destinationCity,
          distanceKm,
          perKmRate,
          estDurationMinutes: t.route.estDurationMinutes,
          stops: t.route.stops,
          boardingCounter,
          droppingCounter,
        },
        bus: {
          regNumber: t.bus.regNumber,
          fleetNumber: t.bus.fleetNumber,
          coachType: t.bus.coachType,
          model: t.bus.model,
          isAc: t.bus.isAc,
          seatLayoutType: t.bus.seatLayoutType,
          amenities: JSON.parse(t.bus.amenities || '[]'),
        },
        departureTime: t.departureTime,
        arrivalTime: t.arrivalTime,
        baseFare,
        serviceFee,
        distanceKm,
        perKmRate,
        availableSeats,
        bookedSeats,
        totalSeats,
        driverName: t.driverName,
      };
    });

    // Time slot filter if provided
    if (timeSlot) {
      results = results.filter((r) => {
        const hour = new Date(r.departureTime).getHours();
        if (timeSlot === 'morning') return hour >= 6 && hour < 12;
        if (timeSlot === 'afternoon') return hour >= 12 && hour < 18;
        if (timeSlot === 'evening') return hour >= 18 || hour < 6;
        return true;
      });
    }

    // Sorting
    if (sortBy === 'lowestFare') {
      results.sort((a, b) => a.baseFare - b.baseFare);
    } else if (sortBy === 'earliestTime') {
      results.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
    } else if (sortBy === 'shortestDuration') {
      results.sort((a, b) => a.route.estDurationMinutes - b.route.estDurationMinutes);
    }

    return NextResponse.json({
      count: results.length,
      trips: results,
    });
  } catch (error) {
    console.error('Trip search error:', error);
    return NextResponse.json({ error: 'Failed to search trips' }, { status: 500 });
  }
}
