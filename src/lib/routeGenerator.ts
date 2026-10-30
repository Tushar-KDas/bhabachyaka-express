import { prisma } from '@/lib/prisma';
import { findDistrict, getDistanceBetweenDistricts, getDurationMinutes, District } from '@/data/districts';

export async function ensureDistrictRouteTrips(originInput: string, destInput: string, requestedDate?: string) {
  try {
    const originDistrict = findDistrict(originInput);
    const destDistrict = findDistrict(destInput);

    if (!originDistrict || !destDistrict || originDistrict.id === destDistrict.id) {
      return [];
    }

    // 1. Get primary operator tenant
    let tenant = await prisma.tenant.findFirst({
      where: { code: 'BHABACHYAKA' },
    });
    if (!tenant) {
      tenant = await prisma.tenant.findFirst();
    }
    if (!tenant) return [];

    // 2. Get fleet buses
    let buses = await prisma.bus.findMany({
      where: { tenantId: tenant.id, status: 'ACTIVE' },
    });
    if (buses.length === 0) {
      buses = await prisma.bus.findMany({ where: { status: 'ACTIVE' } });
    }
    if (buses.length === 0) return [];

    // 3. Find or Create Route
    let route = await prisma.route.findFirst({
      where: {
        tenantId: tenant.id,
        OR: [
          {
            originCity: { in: [originDistrict.nameEn, originDistrict.nameBn] },
            destinationCity: { in: [destDistrict.nameEn, destDistrict.nameBn] },
          },
          {
            name: `${originDistrict.nameEn} to ${destDistrict.nameEn}`,
          },
        ],
      },
      include: {
        stops: true,
      },
    });

    const distanceKm = getDistanceBetweenDistricts(originDistrict.nameEn, destDistrict.nameEn);
    const durationMinutes = getDurationMinutes(distanceKm);

    if (!route) {
      route = await prisma.route.create({
        data: {
          tenantId: tenant.id,
          name: `${originDistrict.nameEn} to ${destDistrict.nameEn}`,
          nameBn: `${originDistrict.nameBn} ➔ ${destDistrict.nameBn}`,
          originCity: originDistrict.nameEn,
          destinationCity: destDistrict.nameEn,
          distanceKm,
          estDurationMinutes: durationMinutes,
          isActive: true,
        },
        include: { stops: true },
      });

      // Add stops with district-specific official counters
      await prisma.routeStop.createMany({
        data: [
          {
            routeId: route.id,
            stopName: originDistrict.counterNameEn,
            stopNameBn: originDistrict.counterNameBn,
            stopType: 'BOARDING',
            sequenceOrder: 1,
            timeOffsetMinutes: 0,
          },
          {
            routeId: route.id,
            stopName: 'Highway Refreshment Point',
            stopNameBn: 'হাইওয়ে বিরতি রেস্তোরাঁ',
            stopType: 'BOTH',
            sequenceOrder: 2,
            timeOffsetMinutes: Math.round(durationMinutes / 2),
          },
          {
            routeId: route.id,
            stopName: destDistrict.counterNameEn,
            stopNameBn: destDistrict.counterNameBn,
            stopType: 'DROPPING',
            sequenceOrder: 3,
            timeOffsetMinutes: durationMinutes,
          },
        ],
      });
    }

    // 4. Check if trips already exist for this route on the target date
    const targetDate = requestedDate ? new Date(requestedDate) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingTrips = await prisma.trip.findMany({
      where: {
        routeId: route.id,
        departureTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        route: { include: { stops: true } },
        bus: true,
        tenant: true,
        seats: true,
      },
    });

    if (existingTrips.length > 0) {
      return existingTrips;
    }

    // 5. Generate 4 scheduled departures for this date
    // Calculate realistic bus fare based on distance:
    // Base rate: ৳3 per kilometer based on district-to-district road distance
    // Plus ৳50 service charge
    const rawAcFare = Math.max(150, Math.round(distanceKm * 3.0));
    const rawSleeperFare = Math.max(200, Math.round(distanceKm * 3.5));
    const rawNonAcFare = Math.max(120, Math.round(distanceKm * 2.5));

    const departureSlots = [
      {
        hours: 7,
        minutes: 30,
        bus: buses[0 % buses.length],
        fare: rawAcFare,
        driver: 'মোঃ রফিকুল ইসলাম',
        supervisor: 'মোঃ আবুল কাশেম',
      },
      {
        hours: 13,
        minutes: 45,
        bus: buses[1 % buses.length],
        fare: rawSleeperFare,
        driver: 'মোঃ জামাল উদ্দিন',
        supervisor: 'মোঃ নজরুল ইসলাম',
      },
      {
        hours: 19,
        minutes: 30,
        bus: buses[2 % buses.length],
        fare: rawAcFare,
        driver: 'আলমগীর হোসেন',
        supervisor: 'জাহাঙ্গীর আলম',
      },
      {
        hours: 22,
        minutes: 15,
        bus: buses[3 % buses.length],
        fare: rawNonAcFare,
        driver: 'রফিক আহমেদ',
        supervisor: 'সোহেল রানা',
      },
    ];

    const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

    for (const slot of departureSlots) {
      const depTime = new Date(startOfDay);
      depTime.setHours(slot.hours, slot.minutes, 0, 0);

      const arrTime = new Date(depTime.getTime() + durationMinutes * 60 * 1000);

      const newTrip = await prisma.trip.create({
        data: {
          tenantId: tenant.id,
          routeId: route.id,
          busId: slot.bus.id,
          departureTime: depTime,
          arrivalTime: arrTime,
          baseFare: slot.fare,
          serviceFee: 50,
          status: 'SCHEDULED',
          driverName: slot.driver,
          driverPhone: '01811-223344',
          supervisorName: slot.supervisor,
          supervisorPhone: '01811-556677',
          trafficStatus: 'NORMAL',
          trafficNote: 'হাইওয়ে ট্রাফিক স্বাভাবিক ও সুন্দরবন এক্সপ্রেসওয়ে সচল।',
          currentLocation: `${originDistrict.nameEn} Counter`,
        },
      });

      // Generate 36 standard seats
      const seatsData: any[] = [];
      const totalRows = slot.bus.totalSeats === 28 ? 9 : 9;
      const seatsPerRow = slot.bus.seatLayoutType === '2x1' ? 3 : 4;

      for (let r = 0; r < totalRows; r++) {
        const letter = seatLetters[r];
        for (let num = 1; num <= seatsPerRow; num++) {
          seatsData.push({
            tripId: newTrip.id,
            seatNumber: `${letter}${num}`,
            seatClass: r === 0 ? 'VIP' : 'STANDARD',
            fare: slot.fare,
            status: 'AVAILABLE',
          });
        }
      }

      await prisma.tripSeat.createMany({
        data: seatsData,
      });
    }

    // Return the newly generated trips
    return await prisma.trip.findMany({
      where: {
        routeId: route.id,
        departureTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        route: { include: { stops: true } },
        bus: true,
        tenant: true,
        seats: true,
      },
      orderBy: { departureTime: 'asc' },
    });
  } catch (err) {
    console.error('ensureDistrictRouteTrips error:', err);
    return [];
  }
}
