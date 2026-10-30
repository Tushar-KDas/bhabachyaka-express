'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Filter,
  Clock,
  Bus,
  Wifi,
  BatteryCharging,
  Coffee,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShieldCheck,
  Calendar,
  MapPin,
  Check,
  ArrowRight,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Tv,
} from 'lucide-react';
import SeatMap from '@/components/SeatMap';
import { getDictionary, Locale, formatBDT, formatTime, formatDate, toBengaliDigits } from '@/lib/i18n';
import { findDistrict, getDistrictCounterOptions } from '@/data/districts';

interface Props {
  params: { locale: string };
}

export default function SearchPage({ params }: Props) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;
  const t = getDictionary(locale);
  const router = useRouter();
  const searchParams = useSearchParams();

  const originParam = searchParams.get('origin') || 'Dhaka';
  const destParam = searchParams.get('destination') || 'Chattogram';
  const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const passengersParam = searchParams.get('passengers') || '1';

  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [busTypeFilter, setBusTypeFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recommended');

  // Active expanded seat map
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [activeTripSeats, setActiveTripSeats] = useState<any[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isHolding, setIsHolding] = useState(false);
  const [selectedBoarding, setSelectedBoarding] = useState<string>('');
  const [selectedDropping, setSelectedDropping] = useState<string>('');

  const destinationDistrict = findDistrict(destParam);
  const originDistrict = findDistrict(originParam);

  useEffect(() => {
    fetchTrips();
  }, [originParam, destParam, busTypeFilter, timeFilter, sortBy]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        origin: originParam,
        destination: destParam,
        sortBy,
      });
      if (busTypeFilter) q.set('busType', busTypeFilter);
      if (timeFilter) q.set('timeSlot', timeFilter);

      const res = await fetch(`/api/trips/search?${q.toString()}`);
      const data = await res.json();
      const tripsList = data.trips || [];
      setTrips(tripsList);

      const tripParam = searchParams.get('trip');
      if (tripParam && tripsList.some((t: any) => t.id === tripParam)) {
        handleSelectSeatsToggle(tripParam);
      }
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSeatsToggle = async (tripId: string) => {
    if (activeTripId === tripId) {
      setActiveTripId(null);
      setSelectedSeats([]);
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('trip');
        window.history.replaceState(null, '', url.toString());
      } catch {}
      return;
    }

    setActiveTripId(tripId);
    setSelectedSeats([]);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('trip', tripId);
      window.history.replaceState(null, '', url.toString());
    } catch {}

    const targetTrip = trips.find((t) => t.id === tripId);
    if (targetTrip) {
      const bOpts = getDistrictCounterOptions(targetTrip.route.originCity, true);
      const dOpts = getDistrictCounterOptions(targetTrip.route.destinationCity, false);
      const firstB = locale === 'bn' ? bOpts[0].nameBn : bOpts[0].nameEn;
      const firstD = locale === 'bn' ? dOpts[0].nameBn : dOpts[0].nameEn;
      setSelectedBoarding(firstB);
      setSelectedDropping(firstD);
    }

    // Fetch live authoritative seats for this trip
    try {
      const res = await fetch(`/api/trips/${tripId}`);
      const data = await res.json();
      setActiveTripSeats(data.seats || []);
    } catch (err) {
      console.error('Failed to load trip seats:', err);
    }
  };

  const handleSeatToggle = (seatNumber: string) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const handleClearSeats = () => {
    setSelectedSeats([]);
  };

  const handleProceedToBooking = async (trip: any) => {
    if (selectedSeats.length === 0) return;
    setIsHolding(true);

    const holdToken = `hold-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    try {
      // 1. Hold seats on backend
      const res = await fetch(`/api/trips/${trip.id}/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seatNumbers: selectedSeats,
          holdToken,
        }),
      });

      const holdData = await res.json();
      if (!res.ok) {
        alert(holdData.error || 'Seat hold failed.');
        setIsHolding(false);
        return;
      }

      // 2. Redirect to passenger details with selected counters
      const q = new URLSearchParams({
        tripId: trip.id,
        seats: selectedSeats.join(','),
        holdToken,
        boardingStop: selectedBoarding,
        droppingStop: selectedDropping,
      });

      router.push(`/${locale}/booking/passengers?${q.toString()}`);
    } catch (err) {
      console.error('Hold error:', err);
      setIsHolding(false);
    }
  };

  // Client-side filtering for operator and max price
  const filteredTrips = trips.filter((trip) => {
    if (trip.baseFare > maxPrice) return false;
    if (selectedOperators.length > 0) {
      const opName = trip.operator.name;
      if (!selectedOperators.includes(opName)) return false;
    }
    return true;
  });

  const toggleOperator = (op: string) => {
    if (selectedOperators.includes(op)) {
      setSelectedOperators(selectedOperators.filter((o) => o !== op));
    } else {
      setSelectedOperators([...selectedOperators, op]);
    }
  };

  const clearAllFilters = () => {
    setBusTypeFilter('');
    setTimeFilter('');
    setMaxPrice(3000);
    setSelectedOperators([]);
  };

  const hasActiveFilters = busTypeFilter || timeFilter || maxPrice < 3000 || selectedOperators.length > 0;

  return (
    <div className="bg-[#F6F8FB] min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Search Route Header Banner (Reference Match) */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl text-[#0B1F3A]">{originParam}</span>
              <span className="text-[#FF6B00] font-black text-lg">➔</span>
              <span className="font-black text-lg sm:text-xl text-[#0B1F3A]">{destParam}</span>
            </div>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>{formatDate(dateParam, locale)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
              <span>👤 {locale === 'bn' ? `${toBengaliDigits(passengersParam)} জন যাত্রী` : `${passengersParam} Passenger`}</span>
            </div>
          </div>

          <button
            onClick={() => router.push(`/${locale}`)}
            className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-[#FF6B00] border border-orange-200 rounded-xl text-xs font-extrabold transition-all self-start md:self-auto cursor-pointer"
          >
            {locale === 'bn' ? '✏️ অনুসন্ধান পরিবর্তন করুন' : '✏️ Modify Search'}
          </button>
        </div>

        {/* Destination District Spotlight Card (with District Photo) */}
        {destinationDistrict && (
          <div className="bg-gradient-to-r from-[#0B1F3A] to-[#153B63] rounded-2xl overflow-hidden shadow-lg border border-slate-700 text-white p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-8 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF6B00] text-white text-[10px] font-black uppercase">
                  {locale === 'bn' ? `${destinationDistrict.divisionBn} বিভাগ` : `${destinationDistrict.divisionEn} Division`}
                </span>
                <span className="text-slate-300 text-xs font-semibold">
                  {locale === 'bn' ? '৬৪ জেলা এক্সপ্রেস সার্ভিস' : '64 Districts Express Network'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {locale === 'bn' ? `গন্তব্য জেলা: ${destinationDistrict.nameBn}` : `Destination: ${destinationDistrict.nameEn}`}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFB020] shrink-0" />
                <span>{locale === 'bn' ? destinationDistrict.landmarkBn : destinationDistrict.landmarkEn}</span>
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300">
                <span className="text-emerald-400 font-bold">
                  📍 {locale === 'bn' ? `প্রধান কাউন্টার: ${destinationDistrict.counterNameBn}` : `Terminal: ${destinationDistrict.counterNameEn}`}
                </span>
                <span>•</span>
                <span>✓ সরাসরি বিরতিহীন বাস সার্ভিস</span>
              </div>
            </div>
            <div className="md:col-span-4 relative h-36 rounded-xl overflow-hidden shadow-md border border-white/20">
              <Image
                src={destinationDistrict.image}
                alt={destinationDistrict.nameEn}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-2 left-2 right-2 text-center text-white text-[11px] font-bold">
                {locale === 'bn' ? `${destinationDistrict.nameBn} এর দর্শনীয় স্থান` : `${destinationDistrict.nameEn} Landmark`}
              </div>
            </div>
          </div>
        )}

        {/* Main Grid: Filters & Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Filters Sidebar (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-sm text-[#0B1F3A] uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#FF6B00]" />
                {t.search.filters}
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  {t.search.clearFilters}
                </button>
              )}
            </div>

            {/* Bus Type Filter */}
            <div className="space-y-2.5">
              <label className="text-xs font-black text-slate-700 block uppercase tracking-wider">
                {t.search.busType}
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setBusTypeFilter(busTypeFilter === 'AC' ? '' : 'AC')}
                  className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    busTypeFilter === 'AC'
                      ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t.search.ac}
                </button>
                <button
                  type="button"
                  onClick={() => setBusTypeFilter(busTypeFilter === 'NON_AC' ? '' : 'NON_AC')}
                  className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    busTypeFilter === 'NON_AC'
                      ? 'bg-[#0B1F3A] border-[#0B1F3A] text-white shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t.search.nonAc}
                </button>
              </div>
            </div>

            {/* Departure Time Slots */}
            <div className="space-y-2.5">
              <label className="text-xs font-black text-slate-700 block uppercase tracking-wider">
                {t.search.departureTime}
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'morning', label: t.search.morning, time: '06:00 AM - 12:00 PM' },
                  { id: 'afternoon', label: t.search.afternoon, time: '12:00 PM - 06:00 PM' },
                  { id: 'evening', label: t.search.evening, time: '06:00 PM - 11:59 PM' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTimeFilter(timeFilter === item.id ? '' : item.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      timeFilter === item.id
                        ? 'bg-orange-50 border-[#FF6B00] text-[#0B1F3A] font-bold shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="block font-bold">{item.label}</span>
                      <span className="text-[10px] text-slate-400">{item.time}</span>
                    </div>
                    {timeFilter === item.id && <Check className="w-4 h-4 text-[#FF6B00]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter Slider */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-black text-slate-700 uppercase tracking-wider">
                  {locale === 'bn' ? 'ভাড়া পরিসর' : 'Price Range'}
                </label>
                <span className="font-black text-[#FF6B00]">{formatBDT(maxPrice, locale)}</span>
              </div>
              <input
                type="range"
                min="500"
                max="3000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#FF6B00] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>{formatBDT(500, locale)}</span>
                <span>{formatBDT(3000, locale)}</span>
              </div>
            </div>

            {/* Operator Filter */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-black text-slate-700 block uppercase tracking-wider">
                {locale === 'bn' ? 'বাস অপারেটর' : 'Operators'}
              </label>
              <div className="space-y-2 text-xs">
                {['Bhabachyaka Express', 'Green Line Paribahan', 'Shohagh Elite'].map((op) => (
                  <label key={op} className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 font-medium">
                    <input
                      type="checkbox"
                      checked={selectedOperators.includes(op)}
                      onChange={() => toggleOperator(op)}
                      className="rounded text-[#FF6B00] focus:ring-[#FF6B00] accent-[#FF6B00] w-4 h-4"
                    />
                    <span>{op}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Trip Listings (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Sorting Pill Bar (Reference Match) */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-bold text-slate-500">
                {locale === 'bn'
                  ? `মোট ${toBengaliDigits(filteredTrips.length)}টি বাস পাওয়া গেছে`
                  : `${filteredTrips.length} Buses Available`}
              </span>

              {/* Sorting Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'recommended', labelBn: 'জনপ্রিয়', labelEn: 'Recommended' },
                  { id: 'lowestFare', labelBn: 'কম ভাড়া', labelEn: 'Lowest Fare' },
                  { id: 'earliestTime', labelBn: 'দ্রুত ছাড়বে', labelEn: 'Earliest' },
                  { id: 'shortestDuration', labelBn: 'কম সময়', labelEn: 'Fastest' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSortBy(item.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-[11px] ${
                      sortBy === item.id
                        ? 'bg-[#0B1F3A] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {locale === 'bn' ? item.labelBn : item.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-semibold text-slate-500">
                  {locale === 'bn' ? 'বাসের সময়সূচী লোড হচ্ছে...' : 'Loading departures and live seat inventory...'}
                </p>
              </div>
            ) : filteredTrips.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4">
                <Bus className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-base text-slate-700">{t.search.noTripsFound}</h4>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-[#FF6B00] text-white text-xs font-bold rounded-xl"
                >
                  {locale === 'bn' ? 'সব ফিল্টার ক্লিয়ার করুন' : 'Clear All Filters'}
                </button>
              </div>
            ) : (
              filteredTrips.map((trip) => {
                const isExpanded = activeTripId === trip.id;
                const hours = Math.floor(trip.route.estDurationMinutes / 60);
                const mins = trip.route.estDurationMinutes % 60;
                const durationFormatted =
                  locale === 'bn'
                    ? `${toBengaliDigits(hours)} ঘণ্টা ${mins > 0 ? `${toBengaliDigits(mins)} মিনিট` : ''}`
                    : `${hours}h ${mins > 0 ? `${mins}m` : ''}`;

                const originDistObj = findDistrict(trip.route.originCity);
                const destDistObj = findDistrict(trip.route.destinationCity);

                const departureCounter = locale === 'bn'
                  ? (trip.route.boardingCounter?.nameBn || originDistObj?.counterNameBn || `${trip.route.originCity} সেন্ট্রাল টার্মিনাল`)
                  : (trip.route.boardingCounter?.name || originDistObj?.counterNameEn || `${trip.route.originCity} Central Terminal`);

                const arrivalCounter = locale === 'bn'
                  ? (trip.route.droppingCounter?.nameBn || destDistObj?.counterNameBn || `${trip.route.destinationCity} প্রধান কাউন্টার`)
                  : (trip.route.droppingCounter?.name || destDistObj?.counterNameEn || `${trip.route.destinationCity} Main Counter`);

                return (
                  <div
                    key={trip.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Main Trip Card Header & Details */}
                    <div className="p-5 space-y-4">
                      {/* Top Row: Bus Thumbnail + Timings + Price */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                        {/* Bus Thumbnail & Operator (4 cols) */}
                        <div className="md:col-span-4 flex items-center gap-3.5">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-sm">
                            <Image
                              src={destinationDistrict?.image || "/images/buses/luxury-fleet.jpg"}
                              alt={trip.route.destinationCity}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-black text-sm text-[#0B1F3A]">
                                {locale === 'bn' ? trip.operator.nameBn : trip.operator.name}
                              </h4>
                              <span title="Verified Operator">
                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
                              {trip.bus.coachType.replace('_', ' ')} {trip.bus.isAc ? '(AC)' : '(Non-AC)'}
                            </span>
                            <div className="flex items-center gap-2.5 mt-2 text-slate-400">
                              {trip.bus.isAc && (
                                <span title="High Speed WiFi">
                                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                                </span>
                              )}
                              <span title="USB Charging Port">
                                <BatteryCharging className="w-3.5 h-3.5 text-blue-600" />
                              </span>
                              <span title="Mineral Water & Snacks">
                                <Coffee className="w-3.5 h-3.5 text-amber-600" />
                              </span>
                              <span title="HD TV Entertainment">
                                <Tv className="w-3.5 h-3.5 text-purple-600" />
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Timings & Duration (5 cols) */}
                        <div className="md:col-span-5 flex items-center justify-between gap-3 px-2 border-y md:border-y-0 md:border-x border-slate-100 py-3 md:py-0">
                          <div className="text-left">
                            <span className="block text-base sm:text-lg font-black text-[#0B1F3A]">
                              {formatTime(trip.departureTime, locale)}
                            </span>
                            <span className="text-xs font-bold text-slate-700 block">
                              {trip.route.originCity}
                            </span>
                          </div>

                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-slate-400 font-bold">{durationFormatted}</span>
                            <div className="w-20 sm:w-28 h-0.5 bg-slate-200 relative my-1.5">
                              <div className="w-2 h-2 rounded-full bg-[#FF6B00] absolute -top-[3px] left-1/2 -translate-x-1/2"></div>
                            </div>
                            <span className="text-[10px] text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {locale === 'bn' ? 'সরাসরি বিরতিহীন' : 'Express Highway'}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="block text-base sm:text-lg font-black text-[#0B1F3A]">
                              {formatTime(trip.arrivalTime, locale)}
                            </span>
                            <span className="text-xs font-bold text-slate-700 block">
                              {trip.route.destinationCity}
                            </span>
                          </div>
                        </div>

                        {/* Price & Seats Left (3 cols) */}
                        <div className="md:col-span-3 text-right flex flex-col items-end justify-center space-y-1.5">
                          <div>
                            <span className="text-xl sm:text-2xl font-black text-[#0B1F3A] block">
                              {formatBDT(trip.baseFare, locale)}
                            </span>
                            <span className="text-[10px] text-slate-600 block -mt-0.5 font-bold">
                              {locale === 'bn'
                                ? `📍 ${toBengaliDigits(trip.route?.distanceKm || trip.distanceKm || 250)} কি.মি. (৩ ৳/কিমি)`
                                : `📍 ${trip.route?.distanceKm || trip.distanceKm || 250} km (৳3/km)`}
                            </span>
                            <span className="text-[9px] text-slate-400 block font-semibold">
                              + {locale === 'bn' ? 'সার্ভিস চার্জ ৳৫০' : '৳50 Service Charge'}
                            </span>
                          </div>

                          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
                            {locale === 'bn'
                              ? `${toBengaliDigits(trip.availableSeats)}টি সিট খালি`
                              : `${trip.availableSeats} Seats Left`}
                          </span>
                        </div>
                      </div>

                      {/* Lower Action & Counter Strip: Counters on left, Select Seats Button on right */}
                      <div className="border-t border-slate-100 pt-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/70 -mx-5 -mb-5 p-4 sm:px-5">
                        {/* Boarding and Dropping Counters (Full Name, No Cutoff!) */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs w-full sm:w-auto">
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                            <span className="text-slate-400 text-[11px] font-bold">{locale === 'bn' ? 'বোর্ডিং:' : 'Boarding:'}</span>
                            <span className="font-bold text-[#0B1F3A]">{departureCounter}</span>
                          </div>

                          <span className="text-slate-300 hidden sm:inline font-bold">➔</span>

                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-[#FF6B00] shrink-0"></span>
                            <span className="text-slate-400 text-[11px] font-bold">{locale === 'bn' ? 'ড্রপিং:' : 'Dropping:'}</span>
                            <span className="font-bold text-[#0B1F3A]">{arrivalCounter}</span>
                          </div>
                        </div>

                        {/* Select Seats Button (Lowered down cleanly, plenty of breathing room) */}
                        <button
                          type="button"
                          onClick={() => handleSelectSeatsToggle(trip.id)}
                          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black shadow transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                            isExpanded
                              ? 'bg-slate-800 text-white hover:bg-slate-900'
                              : 'bg-[#FF6B00] hover:bg-[#E05E00] text-white hover:shadow-orange-500/25'
                          }`}
                        >
                          <span>{isExpanded ? (locale === 'bn' ? 'সিট বন্ধ করুন' : 'Close Seats') : t.search.selectSeat}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Seat Map Area */}
                    {isExpanded && (() => {
                      const bOpts = getDistrictCounterOptions(trip.route.originCity, true).map((c) => ({
                        id: c.id,
                        name: locale === 'bn' ? c.nameBn : c.nameEn,
                      }));
                      const dOpts = getDistrictCounterOptions(trip.route.destinationCity, false).map((c) => ({
                        id: c.id,
                        name: locale === 'bn' ? c.nameBn : c.nameEn,
                      }));

                      const activeBoarding = selectedBoarding || (locale === 'bn' ? bOpts[0]?.name : bOpts[0]?.name) || '';
                      const activeDropping = selectedDropping || (locale === 'bn' ? dOpts[0]?.name : dOpts[0]?.name) || '';

                      return (
                        <div className="border-t border-slate-200 bg-slate-50/50 p-4 sm:p-6 animate-fade-in">
                          <SeatMap
                            locale={locale}
                            seats={activeTripSeats}
                            layoutType={trip.bus.seatLayoutType}
                            baseFare={trip.baseFare}
                            serviceFee={trip.serviceFee}
                            distanceKm={trip.route?.distanceKm || trip.distanceKm}
                            selectedSeats={selectedSeats}
                            onSeatToggle={handleSeatToggle}
                            onClearSeats={handleClearSeats}
                            onProceed={() => handleProceedToBooking(trip)}
                            isLoading={isHolding}
                            boardingOptions={bOpts}
                            droppingOptions={dOpts}
                            selectedBoarding={activeBoarding}
                            selectedDropping={activeDropping}
                            onBoardingChange={(b) => setSelectedBoarding(b)}
                            onDroppingChange={(d) => setSelectedDropping(d)}
                          />
                        </div>
                      );
                    })()}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
