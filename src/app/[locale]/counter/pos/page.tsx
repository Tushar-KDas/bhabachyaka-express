'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Terminal,
  User,
  Clock,
  Printer,
  Search,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  RefreshCw,
  LogOut,
  ChevronRight,
  CreditCard,
  Banknote,
  QrCode,
  X,
  ArrowLeftRight,
  MapPin,
  Filter,
  Sparkles,
} from 'lucide-react';
import SeatMap from '@/components/SeatMap';
import TicketPrint from '@/components/TicketPrint';
import { getDictionary, Locale, formatBDT, formatTime, formatDate, toBengaliDigits } from '@/lib/i18n';
import { DISTRICTS, getDistrictCounterOptions, findDistrict } from '@/data/districts';

interface Props {
  params: { locale: string };
}

export default function CounterPosPage({ params }: Props) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;
  const t = getDictionary(locale);

  // Agent & Shift
  const [agentUser, setAgentUser] = useState<any>(null);
  const [shiftData, setShiftData] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [tripSeats, setTripSeats] = useState<any[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // District to District POS Search State
  const [originDistrict, setOriginDistrict] = useState('Dhaka');
  const [destDistrict, setDestDistrict] = useState('Chattogram');
  const [journeyDate, setJourneyDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [searchFilterQuery, setSearchFilterQuery] = useState('');
  const [isSearchingDistrict, setIsSearchingDistrict] = useState(false);
  const [boardingOptions, setBoardingOptions] = useState<any[]>([]);
  const [droppingOptions, setDroppingOptions] = useState<any[]>([]);

  // Passenger Form
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [boardingStop, setBoardingStop] = useState('');
  const [droppingStop, setDroppingStop] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BKASH' | 'NAGAD' | 'CARD'>('CASH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState<any>(null);
  const [errorNotice, setErrorNotice] = useState('');

  // Shift Modal
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftModalAction, setShiftModalAction] = useState<'OPEN' | 'CLOSE'>('OPEN');
  const [shiftCashAmount, setShiftCashAmount] = useState('2000');
  const [shiftNotes, setShiftNotes] = useState('');

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlOrigin = params.get('origin') || localStorage.getItem('bhabachyaka_pos_origin');
      const urlDest = params.get('dest') || localStorage.getItem('bhabachyaka_pos_dest');
      if (urlOrigin) setOriginDistrict(urlOrigin);
      if (urlDest) setDestDistrict(urlDest);
    } catch {}
    loadPosState();
  }, []);

  const loadPosState = async () => {
    setLoading(true);
    try {
      // 1. Load logged-in user
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.authenticated) {
        setAgentUser(meData.user);
      }

      // 2. Load Shift status
      const shiftRes = await fetch('/api/counter/shift');
      const sData = await shiftRes.json();
      setShiftData(sData.activeShift);

      // 3. Load Scheduled Trips
      const tripsRes = await fetch('/api/trips/search?sortBy=earliestTime');
      const tripsData = await tripsRes.json();
      const list = tripsData.trips || [];
      setTrips(list);

      if (list.length > 0) {
        let targetTrip = list[0];
        try {
          const params = new URLSearchParams(window.location.search);
          const tripIdParam = params.get('tripId') || localStorage.getItem('bhabachyaka_pos_trip_id');
          if (tripIdParam) {
            const found = list.find((t: any) => t.id === tripIdParam);
            if (found) targetTrip = found;
          }
        } catch {}
        selectTrip(targetTrip);
      }
    } catch (err) {
      console.error('POS Load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchDistrictTrips = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearchingDistrict(true);
    setErrorNotice('');
    try {
      try {
        localStorage.setItem('bhabachyaka_pos_origin', originDistrict);
        localStorage.setItem('bhabachyaka_pos_dest', destDistrict);
        const url = new URL(window.location.href);
        url.searchParams.set('origin', originDistrict);
        url.searchParams.set('dest', destDistrict);
        window.history.replaceState(null, '', url.toString());
      } catch {}

      const q = new URLSearchParams({
        origin: originDistrict,
        destination: destDistrict,
        date: journeyDate,
        sortBy: 'earliestTime',
      });

      const res = await fetch(`/api/trips/search?${q.toString()}`);
      const data = await res.json();
      const list = data.trips || [];
      setTrips(list);

      if (list.length > 0) {
        let targetTrip = list[0];
        try {
          const params = new URLSearchParams(window.location.search);
          const tripIdParam = params.get('tripId') || localStorage.getItem('bhabachyaka_pos_trip_id');
          if (tripIdParam) {
            const found = list.find((t: any) => t.id === tripIdParam);
            if (found) targetTrip = found;
          }
        } catch {}
        selectTrip(targetTrip);
      } else {
        setSelectedTrip(null);
        setTripSeats([]);
        setSelectedSeats([]);
      }
    } catch (err) {
      console.error('POS District search error:', err);
      setErrorNotice('Failed to find trips between selected districts.');
    } finally {
      setIsSearchingDistrict(false);
    }
  };

  const handleSwapDistricts = () => {
    const temp = originDistrict;
    setOriginDistrict(destDistrict);
    setDestDistrict(temp);
  };

  const selectTrip = async (trip: any) => {
    setSelectedTrip(trip);
    setSelectedSeats([]);
    setErrorNotice('');

    try {
      localStorage.setItem('bhabachyaka_pos_trip_id', trip.id);
      const url = new URL(window.location.href);
      url.searchParams.set('tripId', trip.id);
      window.history.replaceState(null, '', url.toString());
    } catch {}

    // Load authentic counter options for this route
    const bOpts = getDistrictCounterOptions(trip.route.originCity, true);
    const dOpts = getDistrictCounterOptions(trip.route.destinationCity, false);
    setBoardingOptions(bOpts);
    setDroppingOptions(dOpts);

    const defaultB = locale === 'bn' ? bOpts[0]?.nameBn : bOpts[0]?.nameEn;
    const defaultD = locale === 'bn' ? dOpts[0]?.nameBn : dOpts[0]?.nameEn;
    setBoardingStop(defaultB || trip.route.originCity);
    setDroppingStop(defaultD || trip.route.destinationCity);

    try {
      const res = await fetch(`/api/trips/${trip.id}`);
      const data = await res.json();
      setTripSeats(data.seats || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeatToggle = (seatNo: string) => {
    if (selectedSeats.includes(seatNo)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNo));
    } else {
      setSelectedSeats([...selectedSeats, seatNo]);
    }
  };

  const handleIssueTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSeats.length === 0) {
      setErrorNotice(locale === 'bn' ? 'অনুগ্রহ করে অন্তত একটি সিট নির্বাচন করুন।' : 'Please select at least one seat.');
      return;
    }
    if (!passengerName.trim() || !passengerPhone.trim()) {
      setErrorNotice(locale === 'bn' ? 'যাত্রীর নাম এবং মোবাইল নম্বর আবশ্যক।' : 'Passenger name and phone are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorNotice('');

    try {
      const payload = {
        tripId: selectedTrip.id,
        seatNumbers: selectedSeats,
        customerName: passengerName,
        customerPhone: passengerPhone,
        boardingStop,
        droppingStop,
        paymentMethod,
        bookingChannel: 'COUNTER',
        counterId: shiftData?.counterId,
        passengers: selectedSeats.map((s) => ({
          seatNumber: s,
          passengerName,
          passengerPhone,
          gender: 'MALE',
          age: 30,
        })),
      };

      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorNotice(data.error || 'Failed to issue ticket.');
        setIsSubmitting(false);
        return;
      }

      // Fetch confirmed booking for print modal
      const bRes = await fetch(`/api/bookings/${data.pnr}`);
      const bData = await bRes.json();
      setSuccessBooking(bData);

      // Refresh shift & trip seats
      loadPosState();
      setSelectedSeats([]);
      setPassengerName('');
      setPassengerPhone('');
    } catch (err) {
      console.error('POS ticket issue error:', err);
      setErrorNotice('Network or server error while issuing ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/counter/shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: shiftModalAction,
          openingBalance: shiftModalAction === 'OPEN' ? Number(shiftCashAmount) : 0,
          actualClosingBalance: shiftModalAction === 'CLOSE' ? Number(shiftCashAmount) : 0,
          notes: shiftNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Shift action failed');
      } else {
        setIsShiftModalOpen(false);
        loadPosState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const seatsCount = selectedSeats.length;
  const baseTotal = seatsCount * (selectedTrip?.baseFare || 0);
  const serviceTotal = seatsCount * 50;
  const grandTotal = baseTotal + serviceTotal;

  return (
    <div className="bg-[#061324] text-slate-100 min-h-screen flex flex-col font-sans">
      {/* 1. TOP POS HEADER */}
      <header className="bg-[#0B1F3A] border-b border-[#153B63] px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow">
            <Image
              src="/brand/bhabachyaka-express-logo.png"
              alt="Logo"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="font-black text-sm sm:text-base text-white tracking-tight flex items-center gap-2">
              <span>{locale === 'bn' ? 'ভ্যাবাচ্যাকা এক্সপ্রেস — কাউন্টার POS' : 'BHABACHYAKA EXPRESS — COUNTER POS'}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                ONLINE
              </span>
            </h1>
            <div className="text-[11px] text-slate-300 flex items-center gap-2">
              <span>{locale === 'bn' ? 'টার্মিনাল:' : 'Terminal:'} {agentUser?.counterAssignments?.[0]?.counter?.nameBn || agentUser?.counterAssignments?.[0]?.counter?.name || (locale === 'bn' ? 'সেন্ট্রাল কাউন্টার' : 'Central Terminal')}</span>
              <span>•</span>
              <span>{locale === 'bn' ? 'ক্যাশিয়ার:' : 'Cashier:'} {agentUser?.name || 'মোঃ রায়াত খান'}</span>
            </div>
          </div>
        </div>

        {/* Shift Cash & Control */}
        <div className="flex items-center gap-3">
          <div className="bg-[#153B63] px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400 text-[10px] block font-bold uppercase">
              {locale === 'bn' ? 'শিফট কালেকশন' : 'Shift Collection'}
            </span>
            <strong className="text-sm text-[#FFB020] font-black">
              {formatBDT(shiftData?.expectedClosingBalance || 8450, locale)}
            </strong>
          </div>

          {shiftData ? (
            <button
              onClick={() => {
                setShiftModalAction('CLOSE');
                setShiftCashAmount((shiftData.expectedClosingBalance || 0).toString());
                setIsShiftModalOpen(true);
              }}
              className="px-3.5 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow"
            >
              {t.pos.closeShift}
            </button>
          ) : (
            <button
              onClick={() => {
                setShiftModalAction('OPEN');
                setShiftCashAmount('2000');
                setIsShiftModalOpen(true);
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow"
            >
              {t.pos.openShift}
            </button>
          )}

          <button
            onClick={loadPosState}
            className="p-2 bg-[#153B63] hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. THREE COLUMN POS WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 items-start">
        {/* Left Column: Scheduled Departures List & District Search (3.5 Cols) */}
        <div className="lg:col-span-4 xl:col-span-3 bg-[#0B1F3A] rounded-2xl border border-[#153B63] p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#153B63]">
            <h3 className="font-extrabold text-xs text-[#FFB020] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#FF6B00]" />
              <span>{locale === 'bn' ? 'জেলা টু জেলা ট্রিপ সার্চ' : 'District-to-District Search'}</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400">
              {trips.length} {locale === 'bn' ? 'টি বাস' : 'buses'}
            </span>
          </div>

          {/* District Search Box */}
          <form onSubmit={handleSearchDistrictTrips} className="bg-[#061324] p-3 rounded-xl border border-slate-800 space-y-2.5 text-xs">
            {/* Origin & Destination with Swap */}
            <div className="space-y-1.5">
              <div className="relative">
                <label className="text-[10px] text-slate-400 font-bold block mb-0.5">
                  {locale === 'bn' ? 'যাত্রা শুরু (Leaving From):' : 'Leaving From:'}
                </label>
                <select
                  value={originDistrict}
                  onChange={(e) => setOriginDistrict(e.target.value)}
                  className="w-full bg-[#0B1F3A] border border-slate-700 text-white font-bold rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#FF6B00]"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d.id} value={d.nameEn}>
                      {locale === 'bn' ? `${d.nameBn} (${d.divisionBn})` : `${d.nameEn} (${d.divisionEn})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-1 relative z-10">
                <button
                  type="button"
                  onClick={handleSwapDistricts}
                  className="p-1 bg-[#153B63] hover:bg-[#FF6B00] text-slate-200 hover:text-white rounded-full border border-slate-600 transition-colors cursor-pointer"
                  title="Swap Districts"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                </button>
              </div>

              <div className="relative">
                <label className="text-[10px] text-slate-400 font-bold block mb-0.5">
                  {locale === 'bn' ? 'গন্তব্য জেলা (Going To):' : 'Going To:'}
                </label>
                <select
                  value={destDistrict}
                  onChange={(e) => setDestDistrict(e.target.value)}
                  className="w-full bg-[#0B1F3A] border border-slate-700 text-white font-bold rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#FF6B00]"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d.id} value={d.nameEn}>
                      {locale === 'bn' ? `${d.nameBn} (${d.divisionBn})` : `${d.nameEn} (${d.divisionEn})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Picker */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-0.5">
                {locale === 'bn' ? 'যাত্রার তারিখ:' : 'Journey Date:'}
              </label>
              <input
                type="date"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full bg-[#0B1F3A] border border-slate-700 text-white font-bold rounded-lg px-2.5 py-1.5 text-xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={isSearchingDistrict}
                className="flex-1 py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-black rounded-lg text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSearchingDistrict ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>{locale === 'bn' ? 'ট্রিপ খুঁজুন' : 'Search'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={loadPosState}
                className="py-2 px-3 bg-[#153B63] hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                title="Show All Today"
              >
                {locale === 'bn' ? 'সব ট্রিপ' : 'All'}
              </button>
            </div>
          </form>

          {/* Quick Keyword Filter Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchFilterQuery}
              onChange={(e) => setSearchFilterQuery(e.target.value)}
              placeholder={locale === 'bn' ? 'সময় বা বাসের ধরন ফিল্টার...' : 'Filter time or coach...'}
              className="w-full bg-[#061324] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
            />
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-380px)] pr-1">
            {trips
              .filter((trip) => {
                if (!searchFilterQuery.trim()) return true;
                const q = searchFilterQuery.toLowerCase();
                const routeName = (trip.route?.name || '').toLowerCase();
                const routeNameBn = trip.route?.nameBn || '';
                const coach = (trip.bus?.coachType || '').toLowerCase();
                const time = formatTime(trip.departureTime, 'en').toLowerCase();
                return routeName.includes(q) || routeNameBn.includes(q) || coach.includes(q) || time.includes(q);
              })
              .map((trip) => {
              const isSelected = selectedTrip?.id === trip.id;
              return (
                <div
                  key={trip.id}
                  onClick={() => selectTrip(trip)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#153B63] border-[#FF6B00] shadow-md ring-1 ring-[#FF6B00]'
                      : 'bg-[#061324] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-xs text-white">
                      {formatTime(trip.departureTime, locale)}
                    </span>
                    <span className="text-xs font-black text-[#FFB020]">
                      {formatBDT(trip.baseFare, locale)}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-200 truncate">
                    {locale === 'bn' ? trip.route.nameBn : trip.route.name}
                  </div>

                  <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400">
                    <span>{trip.bus.coachType.replace('_', ' ')}</span>
                    <span className="text-emerald-400 font-bold">
                      {locale === 'bn'
                        ? `${toBengaliDigits(trip.availableSeats)} সিট খালি`
                        : `${trip.availableSeats} left`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column: Interactive Seat Map (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0B1F3A] rounded-2xl border border-[#153B63] p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#153B63]">
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
                {selectedTrip?.route?.name || 'Interactive Seat Selection'}
              </h3>
              <span className="text-[10px] text-slate-400">
                {selectedTrip?.bus?.model} ({selectedTrip?.bus?.coachType})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#FF6B00]">
                {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'No seat chosen'}
              </span>
            </div>
          </div>

          {/* Seat Map component styled for dark POS */}
          <div className="bg-white rounded-2xl p-4 text-[#172033]">
            <SeatMap
              locale={locale}
              seats={tripSeats}
              layoutType={selectedTrip?.bus?.seatLayoutType}
              baseFare={selectedTrip?.baseFare || 1200}
              serviceFee={50}
              selectedSeats={selectedSeats}
              onSeatToggle={handleSeatToggle}
              maxSeats={6}
            />
          </div>
        </div>

        {/* Right Column: Instant Passenger Booking & Cash Entry (4 Cols) */}
        <div className="lg:col-span-4 bg-[#0B1F3A] rounded-2xl border border-[#153B63] p-5 space-y-5">
          <h3 className="font-extrabold text-xs text-[#FFB020] uppercase tracking-wider pb-2 border-b border-[#153B63]">
            {t.pos.quickSell}
          </h3>

          {errorNotice && (
            <div className="p-3 bg-red-950/80 text-red-200 border border-red-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorNotice}</span>
            </div>
          )}

          <form onSubmit={handleIssueTicket} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-bold block mb-1">
                {t.pos.passengerName} *
              </label>
              <input
                type="text"
                required
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder={locale === 'bn' ? 'যাত্রীর নাম লিখুন' : 'Passenger Full Name'}
                className="w-full px-3.5 py-2.5 bg-[#061324] border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">
                {t.pos.phone} *
              </label>
              <input
                type="tel"
                required
                value={passengerPhone}
                onChange={(e) => setPassengerPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-3.5 py-2.5 bg-[#061324] border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {t.passenger.boardingPoint} *
                </label>
                <select
                  value={boardingStop}
                  onChange={(e) => setBoardingStop(e.target.value)}
                  className="w-full px-2.5 py-2 bg-[#061324] border border-slate-700 rounded-lg text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {boardingOptions.map((opt) => (
                    <option key={opt.id} value={locale === 'bn' ? opt.nameBn : opt.nameEn}>
                      📍 {locale === 'bn' ? opt.nameBn : opt.nameEn}
                    </option>
                  ))}
                  {boardingOptions.length === 0 && (
                    <option value={boardingStop || 'Main Counter'}>📍 {boardingStop || 'Main Counter'}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {t.passenger.droppingPoint} *
                </label>
                <select
                  value={droppingStop}
                  onChange={(e) => setDroppingStop(e.target.value)}
                  className="w-full px-2.5 py-2 bg-[#061324] border border-slate-700 rounded-lg text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                >
                  {droppingOptions.map((opt) => (
                    <option key={opt.id} value={locale === 'bn' ? opt.nameBn : opt.nameEn}>
                      🏁 {locale === 'bn' ? opt.nameBn : opt.nameEn}
                    </option>
                  ))}
                  {droppingOptions.length === 0 && (
                    <option value={droppingStop || 'Terminal'}>🏁 {droppingStop || 'Terminal'}</option>
                  )}
                </select>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-slate-300 font-bold block mb-1.5">
                {locale === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Payment Mode'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2 px-3 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'CASH'
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow'
                      : 'bg-[#061324] border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>{locale === 'bn' ? 'কাউন্টার নগদ' : 'Cash'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('BKASH')}
                  className={`py-2 px-3 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'BKASH'
                      ? 'bg-pink-600 border-pink-500 text-white shadow'
                      : 'bg-[#061324] border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>bKash MFS</span>
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="pt-3 border-t border-slate-800 space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span>{locale === 'bn' ? 'সিট সংখ্যা:' : 'Seats Count:'}</span>
                <strong className="text-white">{seatsCount}</strong>
              </div>
              <div className="flex justify-between">
                <span>{locale === 'bn' ? 'সিট নম্বর:' : 'Seats:'}</span>
                <strong className="text-[#FF6B00]">{selectedSeats.join(', ') || '-'}</strong>
              </div>
              <div className="flex justify-between">
                <span>{locale === 'bn' ? 'ভাড়া ও ফি:' : 'Total Amount:'}</span>
                <span>{formatBDT(grandTotal, locale)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-700 font-black text-sm text-white">
                <span>{locale === 'bn' ? 'নগদ গ্রহণ:' : 'Collect Amount:'}</span>
                <span className="text-base text-[#FFB020]">{formatBDT(grandTotal, locale)}</span>
              </div>
            </div>

            {/* Big Action Issue Ticket Button */}
            <button
              type="submit"
              disabled={isSubmitting || selectedSeats.length === 0}
              className="w-full py-4 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-black rounded-xl text-sm uppercase tracking-wider shadow-lg hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" />
              <span>{isSubmitting ? (locale === 'bn' ? 'ইস্যু করা হচ্ছে...' : 'Processing...') : t.pos.issueTicket}</span>
            </button>
          </form>
        </div>
      </div>

      {/* 3. PRINT TICKET SUCCESS MODAL */}
      {successBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 text-slate-900 relative shadow-2xl">
            <button
              onClick={() => setSuccessBooking(null)}
              className="no-print absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="no-print mb-4 pb-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-[#0B1F3A] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>{locale === 'bn' ? 'টিকিট সফলভাবে প্রিন্টের জন্য প্রস্তুত!' : 'Ticket Issued Successfully!'}</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  PNR: {successBooking.booking.pnr}
                </span>
              </div>
            </div>

            <TicketPrint locale={locale} data={successBooking} />
          </div>
        </div>
      )}

      {/* 4. SHIFT RECONCILIATION MODAL */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0B1F3A] border border-[#153B63] rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-[#153B63]">
              <h3 className="font-bold text-sm text-[#FFB020] uppercase tracking-wider">
                {shiftModalAction === 'OPEN' ? t.pos.openShift : t.pos.closeShift}
              </h3>
              <button
                onClick={() => setIsShiftModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleShiftSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {shiftModalAction === 'OPEN'
                    ? (locale === 'bn' ? 'প্রারম্ভিক ক্যাশ ব্যালেন্স (৳)' : 'Opening Cash Balance (BDT)')
                    : (locale === 'bn' ? 'প্রকৃত ক্যাশ গণনার পরিমাণ (৳)' : 'Actual Closing Cash Balance (BDT)')}
                </label>
                <input
                  type="number"
                  required
                  value={shiftCashAmount}
                  onChange={(e) => setShiftCashAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#061324] border border-slate-700 rounded-xl text-white font-bold text-base focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              {shiftModalAction === 'CLOSE' && shiftData && (
                <div className="p-3 bg-[#153B63] rounded-xl border border-slate-700 space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>{locale === 'bn' ? 'প্রত্যাশিত ব্যালেন্স:' : 'Expected Balance:'}</span>
                    <strong className="text-white">{formatBDT(shiftData.expectedClosingBalance || 0, locale)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>{locale === 'bn' ? 'পার্থক্য (Difference):' : 'Difference:'}</span>
                    <strong className="text-emerald-400">
                      {formatBDT(Number(shiftCashAmount) - (shiftData.expectedClosingBalance || 0), locale)}
                    </strong>
                  </div>
                </div>
              )}

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {locale === 'bn' ? 'মন্তব্য বা শিফট নোট' : 'Shift Notes'}
                </label>
                <textarea
                  rows={2}
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  placeholder={locale === 'bn' ? 'নোট লিখুন...' : 'Enter closing remarks...'}
                  className="w-full px-3 py-2 bg-[#061324] border border-slate-700 rounded-xl text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-extrabold rounded-xl uppercase tracking-wider shadow"
              >
                {shiftModalAction === 'OPEN'
                  ? (locale === 'bn' ? 'শিফট শুরু নিশ্চিত করুন' : 'Confirm Open Shift')
                  : (locale === 'bn' ? 'শিফট ক্লোজ ও অ্যাডমিনকে ক্যাশ রিপোর্ট পাঠান' : 'Close Shift & Send Cash Report to Admin')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
