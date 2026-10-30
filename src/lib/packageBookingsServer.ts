import fs from 'fs';
import path from 'path';

export interface PackageBooking {
  id: string;
  pnr: string;
  packageId: string;
  packageTitleBn: string;
  packageTitleEn: string;
  category: string;
  durationBn: string;
  durationEn: string;
  pricePerPerson: number;
  travelersCount: number;
  journeyDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  coachTypeBn?: string;
  coachTypeEn?: string;
  hotelBn?: string;
  hotelEn?: string;
  inclusionsBn?: string[];
  inclusionsEn?: string[];
  subtotal: number;
  couponCode?: string;
  discountAmount: number;
  serviceFee: number;
  totalAmount: number;
  paymentMethod: 'BKASH' | 'NAGAD' | 'CARD' | 'CASH';
  paymentStatus: 'PAID' | 'CONFIRMED' | 'PENDING';
  transactionId: string;
  bookingStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  // Bus Ticket & Boarding Pass Details
  busRouteBn?: string;
  busRouteEn?: string;
  busCoachTypeBn?: string;
  busCoachTypeEn?: string;
  busSeats?: string;
  boardingCounterBn?: string;
  boardingCounterEn?: string;
  droppingCounterBn?: string;
  droppingCounterEn?: string;
  departureTimeBn?: string;
  departureTimeEn?: string;
  reportingTimeBn?: string;
  reportingTimeEn?: string;
  qrCodeUrl?: string;
}

const FILE_PATH = path.join(process.cwd(), 'src', 'data', 'package-bookings.json');

const INITIAL_BOOKINGS: PackageBooking[] = [
  {
    id: 'pkg-book-001',
    pnr: 'PKG-COX-849201',
    packageId: 'coxs-bazar-marine',
    packageTitleBn: 'কক্সবাজার সমুদ্র সৈকত ও মেরিন ড্রাইভ ট্যুর',
    packageTitleEn: "Cox's Bazar Beach & Marine Drive Tour",
    category: 'BEACH',
    durationBn: '৩ রাত / ৪ দিন',
    durationEn: '3 Nights / 4 Days',
    pricePerPerson: 7500,
    travelersCount: 2,
    journeyDate: '2026-11-15',
    customerName: 'তানভীর আহমেদ',
    customerPhone: '01712-345678',
    customerEmail: 'tanvir@gmail.com',
    coachTypeBn: 'লাক্সারি এসি স্লিপার কোচ',
    coachTypeEn: 'Luxury AC Sleeper Coach',
    hotelBn: '৪-স্টার বিচসাইড হোটেল ও রিসোর্ট',
    hotelEn: '4-Star Beachside Hotel & Resort',
    inclusionsBn: [
      'ঢাকা-কক্সবাজার-ঢাকা রাউন্ডট্রিপ এসি স্লিপার বাস',
      '৪-স্টার হোটেলে ২ রাত এসি ডিলাক্স রুম',
      'প্রতিদিনের বুফে ব্রেকফাস্ট',
      'ইনানী বিচ ও হিমছড়ি খোলা জিপে সাইটসিয়িং',
    ],
    subtotal: 15000,
    couponCode: 'WELCOME100',
    discountAmount: 100,
    serviceFee: 100,
    totalAmount: 15000,
    paymentMethod: 'BKASH',
    paymentStatus: 'PAID',
    transactionId: 'BK-9X428L1',
    bookingStatus: 'CONFIRMED',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'pkg-book-002',
    pnr: 'PKG-SAJ-719302',
    packageId: 'sajek-valley-clouds',
    packageTitleBn: 'সাজেক ভ্যালি মেঘের দেশে অ্যাডভেঞ্চার',
    packageTitleEn: 'Sajek Valley Cloud Kingdom Adventure',
    category: 'HILLS',
    durationBn: '২ রাত / ৩ দিন',
    durationEn: '2 Nights / 3 Days',
    pricePerPerson: 6200,
    travelersCount: 3,
    journeyDate: '2026-11-20',
    customerName: 'মেহজাবিন চৌধুরী',
    customerPhone: '01819-876543',
    customerEmail: 'mehzabin@yahoo.com',
    coachTypeBn: 'বিজনেস ক্লাস ২x১ এসি কোচ',
    coachTypeEn: 'Business Class 2x1 AC Coach',
    hotelBn: 'কংলাক হিলভিউ কাঠের ইকো কটেজ',
    hotelEn: 'Konglak Hillview Wooden Eco Cottage',
    inclusionsBn: [
      'ঢাকা-খাগড়াছড়ি-ঢাকা বিজনেস ক্লাস বাস',
      'খাগড়াছড়ি থেকে সাজেক ফোর-হুইল চান্দের গাড়ি',
      'সাজেক ভ্যালিতে রিসোর্টে রাত যাপন',
    ],
    subtotal: 18600,
    couponCode: 'FAMILY4',
    discountAmount: 300,
    serviceFee: 150,
    totalAmount: 18450,
    paymentMethod: 'NAGAD',
    paymentStatus: 'PAID',
    transactionId: 'NG-41098X2',
    bookingStatus: 'CONFIRMED',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

export function getPackageBookings(): PackageBooking[] {
  try {
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading package bookings:', err);
  }
  return INITIAL_BOOKINGS;
}

export function savePackageBooking(booking: PackageBooking): boolean {
  try {
    const list = getPackageBookings();
    const existingIndex = list.findIndex((b) => b.id === booking.id || b.pnr === booking.pnr);
    if (existingIndex >= 0) {
      list[existingIndex] = booking;
    } else {
      list.unshift(booking);
    }

    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving package booking:', err);
    return false;
  }
}

export function updatePackageBookingStatus(idOrPnr: string, status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED', paymentStatus?: 'PAID' | 'CONFIRMED' | 'PENDING'): boolean {
  try {
    const list = getPackageBookings();
    const item = list.find((b) => b.id === idOrPnr || b.pnr === idOrPnr);
    if (!item) return false;

    item.bookingStatus = status;
    if (paymentStatus) item.paymentStatus = paymentStatus;

    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error updating booking status:', err);
    return false;
  }
}
