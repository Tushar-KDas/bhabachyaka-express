import { NextResponse } from 'next/server';
import { getPackageBookings, savePackageBooking, updatePackageBookingStatus, PackageBooking } from '@/lib/packageBookingsServer';
import { generateQRCodeDataUrl } from '@/lib/ticket';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pnr = searchParams.get('pnr');

    const bookings = getPackageBookings();
    if (pnr) {
      const single = bookings.find((b) => b.pnr.toLowerCase() === pnr.toLowerCase());
      if (!single) {
        return NextResponse.json({ error: 'Package booking not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, booking: single });
    }

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error('Package bookings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch package bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      packageId,
      packageTitleBn,
      packageTitleEn,
      category = 'BEACH',
      durationBn,
      durationEn,
      pricePerPerson,
      travelersCount = 1,
      journeyDate,
      customerName,
      customerPhone,
      customerEmail,
      coachTypeBn,
      coachTypeEn,
      hotelBn,
      hotelEn,
      inclusionsBn,
      inclusionsEn,
      couponCode,
      discountAmount = 0,
      paymentMethod = 'BKASH',
    } = body;

    if (!packageTitleBn || !customerName || !customerPhone || !pricePerPerson) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 });
    }

    const subtotal = Number(pricePerPerson) * Number(travelersCount);
    const serviceFee = 50 * Number(travelersCount);
    const totalAmount = Math.max(0, subtotal - Number(discountAmount) + serviceFee);

    // Generate unique Voucher PNR
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const pnr = `PKG-${randomSuffix}`;

    // Assigned seats and bus route
    const seatsList = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2'].slice(0, Math.min(6, Number(travelersCount))).join(', ');
    const busRouteBn = category === 'BEACH'
      ? 'ঢাকা ➔ কক্সবাজার মেরিন ড্রাইভ (সরাসরি বিরতিহীন এক্সপ্রেস)'
      : category === 'HILLS'
      ? 'ঢাকা ➔ খাগড়াছড়ি ও সাজেক ভ্যালি এক্সপ্রেস'
      : category === 'FOREST'
      ? 'ঢাকা ➔ শ্রীমঙ্গল ও সিলেট চা বাগান এক্সপ্রেস'
      : 'ঢাকা ➔ আন্তঃজেলা এক্সপ্রেসওয়ে রুট';

    const busRouteEn = category === 'BEACH'
      ? "Dhaka ➔ Cox's Bazar Marine Drive (Direct Express)"
      : category === 'HILLS'
      ? 'Dhaka ➔ Khagrachhari & Sajek Valley Express'
      : category === 'FOREST'
      ? 'Dhaka ➔ Sreemangal & Sylhet Tea Garden Express'
      : 'Dhaka ➔ Intercity Expressway Route';

    // Generate scannable QR Code data URL
    const qrPayload = JSON.stringify({
      pnr,
      type: 'BHABACHYAKA_TOUR_VOUCHER_BUS_TICKET',
      passenger: customerName,
      phone: customerPhone,
      travelers: Number(travelersCount),
      seats: seatsList,
      date: journeyDate,
      totalAmount,
      status: 'VERIFIED_PAID',
    });
    const qrCodeUrl = await generateQRCodeDataUrl(qrPayload);

    const newBooking: PackageBooking = {
      id: `pkg-book-${Date.now()}`,
      pnr,
      packageId,
      packageTitleBn,
      packageTitleEn: packageTitleEn || packageTitleBn,
      category,
      durationBn: durationBn || '৩ রাত / ৪ দিন',
      durationEn: durationEn || '3 Nights / 4 Days',
      pricePerPerson: Number(pricePerPerson),
      travelersCount: Number(travelersCount),
      journeyDate: journeyDate || new Date().toISOString().split('T')[0],
      customerName,
      customerPhone,
      customerEmail,
      coachTypeBn: coachTypeBn || 'লাক্সারি এসি স্লিপার কোচ',
      coachTypeEn: coachTypeEn || 'Luxury AC Sleeper Coach',
      hotelBn,
      hotelEn,
      inclusionsBn,
      inclusionsEn,
      subtotal,
      couponCode: couponCode || undefined,
      discountAmount: Number(discountAmount),
      serviceFee,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'CASH' ? 'CONFIRMED' : 'PAID',
      transactionId: `${paymentMethod.slice(0, 2)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      bookingStatus: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      // Bus Ticket Allotment
      busRouteBn,
      busRouteEn,
      busCoachTypeBn: coachTypeBn || 'লাক্সারি এসি স্লিপার কোচ',
      busCoachTypeEn: coachTypeEn || 'Luxury AC Sleeper Coach',
      busSeats: seatsList,
      boardingCounterBn: 'সায়েদাবাদ / আরামবাগ সেন্ট্রাল ভিআইপি টার্মিনাল',
      boardingCounterEn: 'Sayedabad / Arambagh Central VIP Terminal',
      droppingCounterBn: hotelBn || 'পর্যটন মোড় প্রধান কাউন্টার',
      droppingCounterEn: hotelEn || 'Tourist Mor Main Counter',
      departureTimeBn: 'রাত ১০:৩০ মিনিট',
      departureTimeEn: '10:30 PM',
      reportingTimeBn: 'রাত ১০:০০ মিনিট (ছাড়ার ৩০ মিনিট পূর্বে)',
      reportingTimeEn: '10:00 PM (30 mins before departure)',
      qrCodeUrl,
    };

    const saved = savePackageBooking(newBooking);
    if (!saved) {
      return NextResponse.json({ error: 'Failed to save booking to storage' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Package booked successfully!',
      booking: newBooking,
      pnr: newBooking.pnr,
    });
  } catch (error) {
    console.error('Package book error:', error);
    return NextResponse.json({ error: 'Failed to process package booking' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { idOrPnr, bookingStatus, paymentStatus } = body;

    if (!idOrPnr) {
      return NextResponse.json({ error: 'idOrPnr required' }, { status: 400 });
    }

    const updated = updatePackageBookingStatus(idOrPnr, bookingStatus || 'CONFIRMED', paymentStatus);
    if (!updated) {
      return NextResponse.json({ error: 'Booking not found or could not be updated' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Package status update error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
