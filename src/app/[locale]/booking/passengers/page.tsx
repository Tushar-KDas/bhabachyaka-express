'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Phone, Mail, MapPin, ArrowRight, ShieldCheck, Bus, Calendar, Clock } from 'lucide-react';
import { getDictionary, Locale, formatBDT, formatTime, formatDate } from '@/lib/i18n';
import { findDistrict } from '@/data/districts';

interface Props {
  params: { locale: string };
}

export default function PassengersPage({ params }: Props) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;
  const t = getDictionary(locale);
  const router = useRouter();
  const searchParams = useSearchParams();

  const tripId = searchParams.get('tripId') || '';
  const seatsParam = searchParams.get('seats') || '';
  const holdToken = searchParams.get('holdToken') || '';
  const boardingParam = searchParams.get('boardingStop') || '';
  const droppingParam = searchParams.get('droppingStop') || '';

  const seatNumbers = seatsParam ? seatsParam.split(',') : [];

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [boardingStop, setBoardingStop] = useState(boardingParam);
  const [droppingStop, setDroppingStop] = useState(droppingParam);

  // Per-passenger state
  const [passengers, setPassengers] = useState<Array<{ name: string; gender: string; age: number }>>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tripId) {
      router.push(`/${locale}/search`);
      return;
    }

    fetch(`/api/trips/${tripId}`)
      .then((res) => res.json())
      .then((data) => {
        setTrip(data);
        const originDistObj = findDistrict(data.route?.originCity);
        const destDistObj = findDistrict(data.route?.destinationCity);

        if (boardingParam) {
          setBoardingStop(boardingParam);
        } else if (data.route?.stops && data.route.stops.length > 0) {
          const boardings = data.route.stops.filter((s: any) => s.stopType === 'BOARDING' || s.stopType === 'BOTH');
          if (boardings.length > 0) setBoardingStop(boardings[0].stopName);
          else if (originDistObj) setBoardingStop(originDistObj.counterNameEn);
        } else if (originDistObj) {
          setBoardingStop(originDistObj.counterNameEn);
        }

        if (droppingParam) {
          setDroppingStop(droppingParam);
        } else if (data.route?.stops && data.route.stops.length > 0) {
          const droppings = data.route.stops.filter((s: any) => s.stopType === 'DROPPING' || s.stopType === 'BOTH');
          if (droppings.length > 0) setDroppingStop(droppings[droppings.length - 1].stopName);
          else if (destDistObj) setDroppingStop(destDistObj.counterNameEn);
        } else if (destDistObj) {
          setDroppingStop(destDistObj.counterNameEn);
        }

        // Initialize passenger objects
        setPassengers(
          seatNumbers.map(() => ({
            name: '',
            gender: 'MALE',
            age: 30,
          }))
        );
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    // Also auto-fill if user is logged in
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCustomerName(data.user.name);
          setCustomerPhone(data.user.phone || '');
          setCustomerEmail(data.user.email || '');
        }
      })
      .catch(() => {});
  }, [tripId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setError(locale === 'bn' ? 'যাত্রীর নাম এবং মোবাইল নম্বর আবশ্যক।' : 'Customer name and phone number are required.');
      return;
    }

    if (!boardingStop || !droppingStop) {
      setError(locale === 'bn' ? 'বোর্ডিং এবং ড্রপিং পয়েন্ট নির্বাচন করুন।' : 'Please select boarding and dropping points.');
      return;
    }

    // Prepare booking payload
    const bookingDraft = {
      tripId,
      seatNumbers,
      holdToken,
      customerName,
      customerPhone,
      customerEmail,
      boardingStop,
      droppingStop,
      passengers: seatNumbers.map((seatNo, idx) => ({
        seatNumber: seatNo,
        passengerName: passengers[idx]?.name?.trim() || customerName,
        passengerPhone: customerPhone,
        gender: passengers[idx]?.gender || 'MALE',
        age: passengers[idx]?.age || 30,
      })),
    };

    // Save in sessionStorage and route to checkout
    sessionStorage.setItem('be_booking_draft', JSON.stringify(bookingDraft));
    router.push(`/${locale}/booking/checkout`);
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs font-semibold text-slate-500">Loading trip information...</p>
      </div>
    );
  }

  const baseTotal = seatNumbers.length * (trip?.baseFare || 0);
  const serviceTotal = seatNumbers.length * (trip?.serviceFee || 50);
  const totalPayable = baseTotal + serviceTotal;

  return (
    <div className="bg-[#F6F8FB] min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A]">{t.passenger.title}</h1>
          <p className="text-xs text-slate-500 mt-1">{t.passenger.subtitle}</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: 8 cols */}
          <div className="lg:col-span-8 space-y-6">
            {/* Primary Contact Info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-[#0B1F3A] uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                <User className="w-4 h-4 text-[#FF6B00]" />
                <span>{locale === 'bn' ? 'প্রধান যোগাযোগকারী' : 'Primary Contact Information'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {t.passenger.fullName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={locale === 'bn' ? 'যেমন: মোঃ আল আমিন' : 'e.g. Md. Al Amin'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {t.passenger.phone} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    {t.passenger.email}
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
            </div>

            {/* Boarding and Dropping Points */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-[#0B1F3A] uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#16A34A]" />
                <span>{locale === 'bn' ? 'বোর্ডিং ও ড্রপিং কাউন্টার' : 'Boarding & Dropping Counters'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {t.passenger.boardingPoint} *
                  </label>
                  <select
                    value={boardingStop}
                    onChange={(e) => setBoardingStop(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  >
                    {boardingStop &&
                      !trip?.route?.stops?.some(
                        (s: any) => s.stopName === boardingStop || s.stopNameBn === boardingStop
                      ) && <option value={boardingStop}>📍 {boardingStop}</option>}
                    {trip?.route?.stops
                      ?.filter((s: any) => s.stopType === 'BOARDING' || s.stopType === 'BOTH')
                      .map((stop: any) => (
                        <option key={stop.id} value={locale === 'bn' ? stop.stopNameBn : stop.stopName}>
                          📍 {locale === 'bn' ? stop.stopNameBn : stop.stopName}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {t.passenger.droppingPoint} *
                  </label>
                  <select
                    value={droppingStop}
                    onChange={(e) => setDroppingStop(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  >
                    {droppingStop &&
                      !trip?.route?.stops?.some(
                        (s: any) => s.stopName === droppingStop || s.stopNameBn === droppingStop
                      ) && <option value={droppingStop}>🏁 {droppingStop}</option>}
                    {trip?.route?.stops
                      ?.filter((s: any) => s.stopType === 'DROPPING' || s.stopType === 'BOTH')
                      .map((stop: any) => (
                        <option key={stop.id} value={locale === 'bn' ? stop.stopNameBn : stop.stopName}>
                          🏁 {locale === 'bn' ? stop.stopNameBn : stop.stopName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Individual Seat Passenger Details */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-[#0B1F3A] uppercase tracking-wider pb-2 border-b border-slate-100">
                {locale === 'bn' ? 'যাত্রী বিবরণী (সিট অনুযায়ী)' : 'Passenger Details (Per Seat)'}
              </h3>

              <div className="space-y-3">
                {seatNumbers.map((seatNo, idx) => (
                  <div
                    key={seatNo}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs"
                  >
                    <div className="sm:col-span-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-[#FF6B00] text-white font-black rounded-lg text-xs">
                        {seatNo}
                      </span>
                      <span className="font-bold text-slate-700">
                        {locale === 'bn' ? `যাত্রী ${idx + 1}` : `Passenger ${idx + 1}`}
                      </span>
                    </div>

                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        placeholder={customerName || (locale === 'bn' ? 'যাত্রীর নাম' : 'Passenger Name')}
                        value={passengers[idx]?.name || ''}
                        onChange={(e) => {
                          const updated = [...passengers];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          setPassengers(updated);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium"
                      />
                    </div>

                    <div className="sm:col-span-4 flex items-center gap-2">
                      <select
                        value={passengers[idx]?.gender || 'MALE'}
                        onChange={(e) => {
                          const updated = [...passengers];
                          updated[idx] = { ...updated[idx], gender: e.target.value };
                          setPassengers(updated);
                        }}
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold"
                      >
                        <option value="MALE">{t.passenger.male}</option>
                        <option value="FEMALE">{t.passenger.female}</option>
                        <option value="OTHER">{t.passenger.other}</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Summary: 4 cols */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5 sticky top-28">
            <h3 className="font-extrabold text-sm text-[#0B1F3A] uppercase tracking-wider pb-2 border-b border-slate-100">
              {locale === 'bn' ? 'ভ্রমণ বিবরণী' : 'Trip Summary'}
            </h3>

            {trip && (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    {locale === 'bn' ? 'অপারেটর' : 'Operator'}
                  </span>
                  <strong className="text-slate-900 text-sm">
                    {locale === 'bn' ? trip.operator.nameBn : trip.operator.name}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    {locale === 'bn' ? 'রুট' : 'Route'}
                  </span>
                  <strong className="text-slate-800">
                    {locale === 'bn' ? trip.route.nameBn : trip.route.name}
                  </strong>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">
                      {locale === 'bn' ? 'যাত্রার সময়' : 'Departure'}
                    </span>
                    <strong className="text-slate-900">{formatTime(trip.departureTime, locale)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">
                      {locale === 'bn' ? 'তারিখ' : 'Date'}
                    </span>
                    <strong className="text-slate-900">{formatDate(trip.departureTime, locale)}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>
                      {locale === 'bn' ? 'নির্বাচিত সিট:' : 'Selected Seats:'} ({seatNumbers.length})
                    </span>
                    <strong className="text-slate-900">{seatNumbers.join(', ')}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{locale === 'bn' ? 'মূল ভাড়া:' : 'Base Fare:'}</span>
                    <strong className="text-slate-900">{formatBDT(baseTotal, locale)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{locale === 'bn' ? 'সার্ভিস চার্জ:' : 'Service Fee:'}</span>
                    <strong className="text-slate-900">{formatBDT(serviceTotal, locale)}</strong>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-black text-sm text-[#0B1F3A]">
                    <span>{locale === 'bn' ? 'সর্বমোট প্রদেয়:' : 'Total Payable:'}</span>
                    <span className="text-base text-[#FF6B00]">{formatBDT(totalPayable, locale)}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t.passenger.proceedToPay}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
