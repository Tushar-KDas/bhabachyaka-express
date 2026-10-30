import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive Bhabachyaka Express database seed...');

  // Clean existing data in reverse order of dependencies
  await prisma.auditLog.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.cashTransaction.deleteMany({});
  await prisma.cashShift.deleteMany({});
  await prisma.settlement.deleteMany({});
  await prisma.refund.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.bookingPassenger.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.seatHold.deleteMany({});
  await prisma.tripSeat.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.routeStop.deleteMany({});
  await prisma.route.deleteMany({});
  await prisma.bus.deleteMany({});
  await prisma.staffAssignment.deleteMany({});
  await prisma.counter.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.subscriptionPlan.deleteMany({});
  await prisma.tenant.deleteMany({});

  console.log('🧹 Cleaned existing tables.');

  // 1. Subscription Plans
  const starterPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Starter Plan',
      nameBn: 'স্টার্টার প্ল্যান',
      code: 'STARTER',
      priceMonthly: 5000,
      priceYearly: 50000,
      maxBuses: 5,
      maxRoutes: 2,
      maxCounters: 2,
      maxStaff: 10,
      features: JSON.stringify(['Basic Ticketing', 'Counter POS', 'Daily Reports', 'Standard Email Support']),
    },
  });

  const growthPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Growth Plan',
      nameBn: 'গ্রোথ প্ল্যান',
      code: 'GROWTH',
      priceMonthly: 12000,
      priceYearly: 120000,
      maxBuses: 20,
      maxRoutes: 10,
      maxCounters: 8,
      maxStaff: 30,
      features: JSON.stringify(['Multi-Counter POS', 'Online Booking Widget', 'Cash Reconciliation', 'SMS Gateway', '24/7 Phone Support']),
    },
  });

  const businessPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Business Enterprise',
      nameBn: 'বিজনেস এন্টারপ্রাইজ',
      code: 'BUSINESS',
      priceMonthly: 25000,
      priceYearly: 250000,
      maxBuses: 60,
      maxRoutes: 30,
      maxCounters: 25,
      maxStaff: 120,
      features: JSON.stringify(['Full ERP Suite', 'Unlimited Online Booking', 'Fleet GPS Tracking', 'Custom Domain', 'Automated Bank Settlements', 'Priority VIP SLA']),
    },
  });

  // 2. Tenants / Transport Operators
  const bhabachyakaTenant = await prisma.tenant.create({
    data: {
      name: 'Bhabachyaka Express',
      nameBn: 'ভ্যাবাচ্যাকা এক্সপ্রেস',
      code: 'BHABACHYAKA',
      domain: 'bhabachyaka.com',
      logoUrl: '/brand/bhabachyaka-express-logo.png',
      contactPhone: '+880 1711-223344',
      contactEmail: 'contact@bhabachyaka.com',
      address: 'Suite 401, Transport Tower, Gabtoli Inter-District Terminal, Dhaka',
      status: 'ACTIVE',
    },
  });

  const greenLineTenant = await prisma.tenant.create({
    data: {
      name: 'Green Line Paribahan',
      nameBn: 'গ্রীন লাইন পরিবহন',
      code: 'GREEN_LINE',
      domain: 'greenline.com',
      contactPhone: '+880 1713-123456',
      contactEmail: 'info@greenline.com',
      address: 'Rajarbagh, Dhaka',
      status: 'ACTIVE',
    },
  });

  const shohaghTenant = await prisma.tenant.create({
    data: {
      name: 'Shohagh Paribahan',
      nameBn: 'সোহাগ পরিবহন',
      code: 'SHOHAGH',
      domain: 'shohagh.com',
      contactPhone: '+880 1711-987654',
      contactEmail: 'support@shohagh.com',
      address: 'Panthapath, Dhaka',
      status: 'ACTIVE',
    },
  });

  // Assign Subscriptions
  await prisma.subscription.create({
    data: {
      tenantId: bhabachyakaTenant.id,
      planId: businessPlan.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      renewalType: 'AUTO',
    },
  });

  // 3. User Accounts
  const defaultPassword = await bcrypt.hash('password123', 10);

  const superAdmin = await prisma.user.create({
    data: {
      name: 'Super Admin - Bhabachyaka SaaS',
      email: 'superadmin@bhabachyaka.com',
      phone: '+880 1700-000001',
      passwordHash: defaultPassword,
      role: 'SUPER_ADMIN',
    },
  });

  const operatorOwner = await prisma.user.create({
    data: {
      tenantId: bhabachyakaTenant.id,
      name: 'মোঃ তানভীর হাসান (Operator Owner)',
      email: 'owner@bhabachyaka.com',
      phone: '+880 1711-223344',
      passwordHash: defaultPassword,
      role: 'OPERATOR_OWNER',
    },
  });

  const transportManager = await prisma.user.create({
    data: {
      tenantId: bhabachyakaTenant.id,
      name: 'কাজী রফিকুল ইসলাম (Transport Manager)',
      email: 'manager@bhabachyaka.com',
      phone: '+880 1712-334455',
      passwordHash: defaultPassword,
      role: 'TRANSPORT_MANAGER',
    },
  });

  const counterAgent = await prisma.user.create({
    data: {
      tenantId: bhabachyakaTenant.id,
      name: 'মোঃ রায়াত খান (Counter Cashier)',
      email: 'counter@bhabachyaka.com',
      phone: '+880 1713-445566',
      passwordHash: defaultPassword,
      role: 'COUNTER_AGENT',
    },
  });

  const boardingStaff = await prisma.user.create({
    data: {
      tenantId: bhabachyakaTenant.id,
      name: 'শফিকুল ইসলাম (Boarding Officer)',
      email: 'boarding@bhabachyaka.com',
      phone: '+880 1714-556677',
      passwordHash: defaultPassword,
      role: 'BOARDING_STAFF',
    },
  });

  const accountant = await prisma.user.create({
    data: {
      tenantId: bhabachyakaTenant.id,
      name: 'নাজমুল হুদা (Head of Accounts)',
      email: 'accountant@bhabachyaka.com',
      phone: '+880 1715-667788',
      passwordHash: defaultPassword,
      role: 'ACCOUNTANT',
    },
  });

  const demoCustomer = await prisma.user.create({
    data: {
      name: 'মোঃ আল আমিন (Customer)',
      email: 'customer@bhabachyaka.com',
      phone: '01799887766',
      passwordHash: defaultPassword,
      role: 'CUSTOMER',
    },
  });

  // 4. Counters
  const gabtoliCounter = await prisma.counter.create({
    data: {
      tenantId: bhabachyakaTenant.id,
      name: 'Gabtoli Central Counter',
      nameBn: 'গাবতলী সেন্ট্রাল কাউন্টার',
      code: 'DH-GAB-01',
      city: 'Dhaka',
      location: 'Counter 14, Gabtoli Bus Terminal, Dhaka',
      phone: '+880 1711-223301',
    },
  });

  const arambaghCounter = await prisma.counter.create({
    data: {
      tenantId: bhabachyakaTenant.id,
      name: 'Arambagh VIP Counter',
      nameBn: 'আরামবাগ ভিআইপি কাউন্টার',
      code: 'DH-ARM-02',
      city: 'Dhaka',
      location: '12 Arambagh Culvert Road, Motijheel, Dhaka',
      phone: '+880 1711-223302',
    },
  });

  const damparaCounter = await prisma.counter.create({
    data: {
      tenantId: bhabachyakaTenant.id,
      name: 'Dampara Main Counter',
      nameBn: 'দামপাড়া মেইন কাউন্টার',
      code: 'CTG-DAM-01',
      city: 'Chattogram',
      location: 'Dampara Bus Stand, Chattogram',
      phone: '+880 1711-223303',
    },
  });

  const kolatoliCounter = await prisma.counter.create({
    data: {
      tenantId: bhabachyakaTenant.id,
      name: 'Kolatoli Beach Counter',
      nameBn: 'কলাতলী বিচ কাউন্টার',
      code: 'CXB-KOL-01',
      city: "Cox's Bazar",
      location: 'Hotel Motel Zone, Kolatoli Point, Cox’s Bazar',
      phone: '+880 1711-223304',
    },
  });

  // Staff counter assignment
  await prisma.staffAssignment.create({
    data: {
      userId: counterAgent.id,
      counterId: arambaghCounter.id,
      role: 'COUNTER_AGENT',
    },
  });

  // 5. Buses
  const bus1 = await prisma.bus.create({
    data: {
      tenantId: bhabachyakaTenant.id,
      regNumber: 'ঢাকা মেট্রো-ব ১৪-৮৮৯৯',
      fleetNumber: 'BE-101',
      coachType: 'BUSINESS_CLASS',
      model: 'Scania Multi-Axle K410',
      totalSeats: 36,
      seatLayoutType: '2x2',
      isAc: true,
      amenities: JSON.stringify(['WiFi', 'Charging Port', 'Mineral Water', 'Air Conditioned', 'Blanket', 'Emergency Exit']),
      status: 'ACTIVE',
    },
  });

  const bus2 = await prisma.bus.create({
    data: {
      tenantId: bhabachyakaTenant.id,
      regNumber: 'ঢাকা মেট্রো-ব ১৫-২২৩৩',
      fleetNumber: 'BE-102',
      coachType: 'SLEEPER',
      model: 'Hyundai Universe Royal Sleeper',
      totalSeats: 28,
      seatLayoutType: '2x1',
      isAc: true,
      amenities: JSON.stringify(['Bedding', 'Reading Lamp', 'Snacks', 'WiFi', 'Charging Port', 'AC']),
      status: 'ACTIVE',
    },
  });

  const bus3 = await prisma.bus.create({
    data: {
      tenantId: bhabachyakaTenant.id,
      regNumber: 'ঢাকা মেট্রো-ব ১১-৪৪৫৫',
      fleetNumber: 'BE-103',
      coachType: 'STANDARD_AC',
      model: 'Hino 1J Plus AC Coach',
      totalSeats: 40,
      seatLayoutType: '2x2',
      isAc: true,
      amenities: JSON.stringify(['Air Conditioned', 'Charging Port', 'Water']),
      status: 'ACTIVE',
    },
  });

  const bus4 = await prisma.bus.create({
    data: {
      tenantId: bhabachyakaTenant.id,
      regNumber: 'ঢাকা মেট্রো-ব ০৯-৭৭১১',
      fleetNumber: 'BE-104',
      coachType: 'STANDARD_NON_AC',
      model: 'Ashok Leyland 1616',
      totalSeats: 40,
      seatLayoutType: '2x2',
      isAc: false,
      amenities: JSON.stringify(['First Aid', 'Emergency Exit', 'Luggage Compartment']),
      status: 'ACTIVE',
    },
  });

  // 6. Routes & Stops
  const routeDhakaCtg = await prisma.route.create({
    data: {
      tenantId: bhabachyakaTenant.id,
      name: 'Dhaka to Chattogram',
      nameBn: 'ঢাকা ➔ চট্টগ্রাম',
      originCity: 'Dhaka',
      destinationCity: 'Chattogram',
      distanceKm: 245.0,
      estDurationMinutes: 345, // 5 hours 45 mins
    },
  });

  await prisma.routeStop.createMany({
    data: [
      { routeId: routeDhakaCtg.id, stopName: 'Arambagh Counter', stopNameBn: 'আরামবাগ কাউন্টার', stopType: 'BOARDING', sequenceOrder: 1, timeOffsetMinutes: 0 },
      { routeId: routeDhakaCtg.id, stopName: 'Sayedabad Terminal', stopNameBn: 'সায়েদাবাদ টার্মিনাল', stopType: 'BOARDING', sequenceOrder: 2, timeOffsetMinutes: 25 },
      { routeId: routeDhakaCtg.id, stopName: 'Signboard / Narayanganj', stopNameBn: 'সাইনবোর্ড', stopType: 'BOARDING', sequenceOrder: 3, timeOffsetMinutes: 50 },
      { routeId: routeDhakaCtg.id, stopName: 'Comilla Highway Rest Area', stopNameBn: 'কুমিল্লা হাইওয়ে বিরতি', stopType: 'BOTH', sequenceOrder: 4, timeOffsetMinutes: 160 },
      { routeId: routeDhakaCtg.id, stopName: 'Feni Bypass', stopNameBn: 'ফেনী বাইপাস', stopType: 'DROPPING', sequenceOrder: 5, timeOffsetMinutes: 250 },
      { routeId: routeDhakaCtg.id, stopName: 'Dampara Main Station', stopNameBn: 'দামপাড়া মেইন স্টেশন', stopType: 'DROPPING', sequenceOrder: 6, timeOffsetMinutes: 345 },
    ],
  });

  const routeDhakaCxb = await prisma.route.create({
    data: {
      tenantId: bhabachyakaTenant.id,
      name: "Dhaka to Cox's Bazar",
      nameBn: 'ঢাকা ➔ কক্সবাজার',
      originCity: 'Dhaka',
      destinationCity: "Cox's Bazar",
      distanceKm: 395.0,
      estDurationMinutes: 570, // 9.5 hours
    },
  });

  await prisma.routeStop.createMany({
    data: [
      { routeId: routeDhakaCxb.id, stopName: 'Gabtoli Central', stopNameBn: 'গাবতলী সেন্ট্রাল', stopType: 'BOARDING', sequenceOrder: 1, timeOffsetMinutes: 0 },
      { routeId: routeDhakaCxb.id, stopName: 'Arambagh VIP Counter', stopNameBn: 'আরামবাগ ভিআইপি কাউন্টার', stopType: 'BOARDING', sequenceOrder: 2, timeOffsetMinutes: 45 },
      { routeId: routeDhakaCxb.id, stopName: 'Chittagong Bypass', stopNameBn: 'চট্টগ্রাম বাইপাস', stopType: 'BOTH', sequenceOrder: 3, timeOffsetMinutes: 360 },
      { routeId: routeDhakaCxb.id, stopName: 'Chakaria Station', stopNameBn: 'চকরিয়া স্টেশন', stopType: 'DROPPING', sequenceOrder: 4, timeOffsetMinutes: 480 },
      { routeId: routeDhakaCxb.id, stopName: 'Kolatoli Beach Point', stopNameBn: 'কলাতলী বিচ পয়েন্ট', stopType: 'DROPPING', sequenceOrder: 5, timeOffsetMinutes: 570 },
    ],
  });

  const routeDhakaSyl = await prisma.route.create({
    data: {
      tenantId: bhabachyakaTenant.id,
      name: 'Dhaka to Sylhet',
      nameBn: 'ঢাকা ➔ সিলেট',
      originCity: 'Dhaka',
      destinationCity: 'Sylhet',
      distanceKm: 238.0,
      estDurationMinutes: 360,
    },
  });

  await prisma.routeStop.createMany({
    data: [
      { routeId: routeDhakaSyl.id, stopName: 'Sayedabad', stopNameBn: 'সায়েদাবাদ', stopType: 'BOARDING', sequenceOrder: 1, timeOffsetMinutes: 0 },
      { routeId: routeDhakaSyl.id, stopName: 'Narsingdi Bypass', stopNameBn: 'নরসিংদী বাইপাস', stopType: 'BOARDING', sequenceOrder: 2, timeOffsetMinutes: 60 },
      { routeId: routeDhakaSyl.id, stopName: 'Brahmanbaria', stopNameBn: 'ব্রাহ্মণবাড়িয়া', stopType: 'DROPPING', sequenceOrder: 3, timeOffsetMinutes: 150 },
      { routeId: routeDhakaSyl.id, stopName: 'Kadamtoli Terminal, Sylhet', stopNameBn: 'কদমতলী টার্মিনাল, সিলেট', stopType: 'DROPPING', sequenceOrder: 4, timeOffsetMinutes: 360 },
    ],
  });

  // 7. Trips & Inventory Generation helper
  const now = new Date();
  const createTripDate = (daysAhead, hour, minute) => {
    const d = new Date(now);
    d.setDate(d.getDate() + daysAhead);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  const tripsData = [
    // Today's trips
    {
      route: routeDhakaCtg,
      bus: bus1,
      departure: createTripDate(0, 8, 0), // 08:00 AM
      arrival: createTripDate(0, 13, 45),
      fare: 1200,
      driver: 'মোঃ শফিকুল ইসলাম',
      driverPhone: '01811-001122',
      supervisor: 'মোঃ আবুল কাশেম',
      supervisorPhone: '01811-334455',
    },
    {
      route: routeDhakaCtg,
      bus: bus2,
      departure: createTripDate(0, 14, 30), // 02:30 PM
      arrival: createTripDate(0, 20, 15),
      fare: 1450,
      driver: 'মোঃ জামাল উদ্দিন',
      driverPhone: '01811-223344',
      supervisor: 'মোঃ নজরুল ইসলাম',
      supervisorPhone: '01811-445566',
    },
    {
      route: routeDhakaCtg,
      bus: bus1,
      departure: createTripDate(0, 20, 0), // 08:00 PM (Matches reference UI!)
      arrival: createTripDate(1, 1, 45),
      fare: 1200,
      driver: 'আলমগীর হোসেন',
      driverPhone: '01811-556677',
      supervisor: 'জাহাঙ্গীর আলম',
      supervisorPhone: '01811-667788',
    },
    {
      route: routeDhakaCtg,
      bus: bus4,
      departure: createTripDate(0, 22, 15), // 10:15 PM Non-AC
      arrival: createTripDate(1, 4, 45),
      fare: 900,
      driver: 'রফিক আহমেদ',
      driverPhone: '01811-778899',
      supervisor: 'সোহেল রানা',
      supervisorPhone: '01811-889900',
    },
    // Tomorrow's trips
    {
      route: routeDhakaCtg,
      bus: bus1,
      departure: createTripDate(1, 8, 0),
      arrival: createTripDate(1, 13, 45),
      fare: 1200,
      driver: 'মোঃ শফিকুল ইসলাম',
      driverPhone: '01811-001122',
      supervisor: 'মোঃ আবুল কাশেম',
      supervisorPhone: '01811-334455',
    },
    {
      route: routeDhakaCtg,
      bus: bus2,
      departure: createTripDate(1, 20, 0),
      arrival: createTripDate(2, 1, 45),
      fare: 1450,
      driver: 'আলমগীর হোসেন',
      driverPhone: '01811-556677',
      supervisor: 'জাহাঙ্গীর আলম',
      supervisorPhone: '01811-667788',
    },
    // Cox's Bazar trips
    {
      route: routeDhakaCxb,
      bus: bus2,
      departure: createTripDate(0, 21, 30),
      arrival: createTripDate(1, 7, 0),
      fare: 1800,
      driver: 'সুলতান মাহমুদ',
      driverPhone: '01812-112233',
      supervisor: 'ফরহাদ রেজা',
      supervisorPhone: '01812-334455',
    },
    {
      route: routeDhakaCxb,
      bus: bus1,
      departure: createTripDate(1, 22, 0),
      arrival: createTripDate(2, 7, 30),
      fare: 1600,
      driver: 'মোস্তাফিজুর রহমান',
      driverPhone: '01812-445566',
      supervisor: 'আরিফুল ইসলাম',
      supervisorPhone: '01812-667788',
    },
    // Sylhet trips
    {
      route: routeDhakaSyl,
      bus: bus3,
      departure: createTripDate(0, 15, 0),
      arrival: createTripDate(0, 21, 0),
      fare: 950,
      driver: 'বশির আহমেদ',
      driverPhone: '01813-112233',
      supervisor: 'কামাল হোসেন',
      supervisorPhone: '01813-223344',
    },
    {
      route: routeDhakaSyl,
      bus: bus1,
      departure: createTripDate(1, 9, 30),
      arrival: createTripDate(1, 15, 30),
      fare: 1100,
      driver: 'সাদ্দাম হোসেন',
      driverPhone: '01813-334455',
      supervisor: 'মহিউদ্দিন',
      supervisorPhone: '01813-445566',
    },
  ];

  const createdTrips = [];

  for (const t of tripsData) {
    const trip = await prisma.trip.create({
      data: {
        tenantId: bhabachyakaTenant.id,
        routeId: t.route.id,
        busId: t.bus.id,
        departureTime: t.departure,
        arrivalTime: t.arrival,
        baseFare: t.fare,
        serviceFee: 50.0,
        driverName: t.driver,
        driverPhone: t.driverPhone,
        supervisorName: t.supervisor,
        supervisorPhone: t.supervisorPhone,
        status: 'SCHEDULED',
      },
    });

    createdTrips.push(trip);

    // Generate Seats for 2x2 or 2x1
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const cols = t.bus.seatLayoutType === '2x1' ? [1, 2, 3] : [1, 2, 3, 4];
    const seatsToInsert = [];

    // Pre-book a few seats for realism (e.g. A4, B2, C1)
    const bookedSeedSeats = ['A4', 'B1', 'B2', 'D4'];
    const heldSeedSeats = ['C3'];

    for (const r of rows) {
      for (const c of cols) {
        const seatNo = `${r}${c}`;
        let status = 'AVAILABLE';
        if (bookedSeedSeats.includes(seatNo)) status = 'BOOKED';
        else if (heldSeedSeats.includes(seatNo)) status = 'HELD';

        seatsToInsert.push({
          tripId: trip.id,
          seatNumber: seatNo,
          seatClass: r === 'A' || r === 'B' ? 'VIP' : 'STANDARD',
          fare: t.fare,
          status,
          heldUntil: status === 'HELD' ? new Date(Date.now() + 10 * 60 * 1000) : null,
          heldByToken: status === 'HELD' ? 'demo-seed-hold-token' : null,
        });
      }
    }

    await prisma.tripSeat.createMany({
      data: seatsToInsert,
    });
  }

  console.log(`✅ Created ${createdTrips.length} Trips with full authoritative seat inventories.`);

  // 8. Create a Confirmed Demo Booking (PNR: BE9123456 - exactly matches the reference UI!)
  const referenceTrip = createdTrips[2]; // Today's 08:00 PM trip
  const booking1 = await prisma.booking.create({
    data: {
      tenantId: bhabachyakaTenant.id,
      pnr: 'BE9123456',
      tripId: referenceTrip.id,
      userId: demoCustomer.id,
      customerName: 'মোঃ আল আমিন',
      customerPhone: '01799887766',
      customerEmail: 'customer@bhabachyaka.com',
      totalAmount: 2400.0,
      discountAmount: 0.0,
      payableAmount: 2500.0, // 2400 + 100 service fee for 2 seats
      status: 'CONFIRMED',
      bookingChannel: 'ONLINE',
      boardingStop: 'Arambagh Counter',
      droppingStop: 'Dampara Main Station',
    },
  });

  // Passengers
  await prisma.bookingPassenger.createMany({
    data: [
      {
        bookingId: booking1.id,
        seatNumber: 'A2',
        passengerName: 'মোঃ আল আমিন',
        passengerPhone: '01799887766',
        gender: 'MALE',
        age: 32,
        fare: 1200.0,
      },
      {
        bookingId: booking1.id,
        seatNumber: 'A3',
        passengerName: 'রাবেয়া সুলতানা',
        passengerPhone: '01799887766',
        gender: 'FEMALE',
        age: 28,
        fare: 1200.0,
      },
    ],
  });

  // Mark seats as booked
  await prisma.tripSeat.updateMany({
    where: {
      tripId: referenceTrip.id,
      seatNumber: { in: ['A2', 'A3'] },
    },
    data: {
      status: 'BOOKED',
    },
  });

  // Tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      bookingId: booking1.id,
      ticketNumber: 'TKT-BE-9123456-1',
      pnr: 'BE9123456',
      seatNumber: 'A2',
      qrCodeData: JSON.stringify({ pnr: 'BE9123456', seat: 'A2', verify: 'VALID-V98761' }),
      verificationCode: 'VER-A2-9123',
      status: 'ISSUED',
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      bookingId: booking1.id,
      ticketNumber: 'TKT-BE-9123456-2',
      pnr: 'BE9123456',
      seatNumber: 'A3',
      qrCodeData: JSON.stringify({ pnr: 'BE9123456', seat: 'A3', verify: 'VALID-V98762' }),
      verificationCode: 'VER-A3-9124',
      status: 'ISSUED',
    },
  });

  // Payment
  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      tenantId: bhabachyakaTenant.id,
      transactionRef: 'TRX-BKASH-88992211',
      amount: 2500.0,
      currency: 'BDT',
      paymentMethod: 'BKASH',
      status: 'SUCCESS',
      isDemo: true,
      gatewayResponse: JSON.stringify({ provider: 'bKash', status: 'COMPLETED', trxId: 'TRX-BKASH-88992211' }),
    },
  });

  // 9. Active Cash Shift for Counter Agent (মোঃ রায়াত খান)
  const activeShift = await prisma.cashShift.create({
    data: {
      tenantId: bhabachyakaTenant.id,
      counterId: arambaghCounter.id,
      agentId: counterAgent.id,
      openedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      openingBalance: 2000.0,
      cashCollected: 6450.0,
      cashRefunded: 0.0,
      authorizedExpenses: 0.0,
      cashTransferred: 0.0,
      expectedClosingBalance: 8450.0, // Matches counter summary in reference UI (৳ 8,450)
      status: 'OPEN',
      notes: 'Morning shift opening at Arambagh counter.',
    },
  });

  await prisma.cashTransaction.create({
    data: {
      shiftId: activeShift.id,
      type: 'TICKET_SALE',
      amount: 6450.0,
      description: 'Counter Cash ticket sales (5 tickets)',
    },
  });

  // 10. Support Ticket & Audit Logs
  await prisma.supportTicket.create({
    data: {
      tenantId: bhabachyakaTenant.id,
      name: 'সুলতান আহমেদ',
      email: 'sultan@gmail.com',
      phone: '01911-223344',
      subject: 'Online Seat Reschedule Request',
      message: 'Can I reschedule my journey date from tomorrow evening to next Friday?',
      priority: 'MEDIUM',
      status: 'OPEN',
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: bhabachyakaTenant.id,
      userId: counterAgent.id,
      action: 'COUNTER_TICKET_ISSUE',
      entityType: 'BOOKING',
      entityId: booking1.id,
      details: JSON.stringify({ pnr: 'BE9123456', seats: ['A2', 'A3'], total: 2500 }),
    },
  });

  console.log('🎉 Seed completed successfully!');
  console.log('---------------------------------------------------------');
  console.log('Demo Credentials:');
  console.log('Super Admin:       superadmin@bhabachyaka.com / password123');
  console.log('Operator Owner:    owner@bhabachyaka.com      / password123');
  console.log('Transport Manager: manager@bhabachyaka.com    / password123');
  console.log('Counter Agent:     counter@bhabachyaka.com    / password123');
  console.log('Boarding Staff:    boarding@bhabachyaka.com   / password123');
  console.log('Customer:          customer@bhabachyaka.com   / password123');
  console.log('---------------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
