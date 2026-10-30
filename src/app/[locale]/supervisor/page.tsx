'use client';

import React, { useState, useEffect } from 'react';
import {
  Bus,
  User,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Coffee,
  Navigation,
  RefreshCw,
  Search,
  Check,
  Send,
} from 'lucide-react';
import { getDictionary, Locale, formatTime, formatDate, toBengaliDigits } from '@/lib/i18n';

interface Props {
  params: { locale: string };
}

export default function SupervisorPanelPage({ params }: Props) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;
  const t = getDictionary(locale);

  const [tripData, setTripData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [searchPassenger, setSearchPassenger] = useState('');

  // Status Update Form State
  const [status, setStatus] = useState('BOARDING');
  const [trafficStatus, setTrafficStatus] = useState('NORMAL');
  const [trafficNote, setTrafficNote] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [delayMinutes, setDelayMinutes] = useState('0');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusSuccessNotice, setStatusSuccessNotice] = useState('');

  // Restore trip selection on reload or refresh
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlTripId = params.get('tripId') || localStorage.getItem('bhabachyaka_supervisor_trip_id');
      if (urlTripId) setSelectedTripId(urlTripId);
    } catch {}
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      try {
        localStorage.setItem('bhabachyaka_supervisor_trip_id', selectedTripId);
        const url = new URL(window.location.href);
        url.searchParams.set('tripId', selectedTripId);
        window.history.replaceState(null, '', url.toString());
      } catch {}
    }
    loadSupervisorTrip(selectedTripId);
  }, [selectedTripId]);

  const loadSupervisorTrip = async (tripId = '') => {
    setLoading(true);
    try {
      const url = tripId ? `/api/supervisor/trip?tripId=${tripId}` : '/api/supervisor/trip';
      const res = await fetch(url);
      const data = await res.json();
      if (data.trip) {
        setTripData(data);
        setStatus(data.trip.status);
        setTrafficStatus(data.trip.trafficStatus || 'NORMAL');
        setTrafficNote(data.trip.trafficNote || '');
        setCurrentLocation(data.trip.currentLocation || '');
        setDelayMinutes(String(data.trip.delayMinutes || 0));
      }
    } catch (err) {
      console.error('Failed to load supervisor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTripStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripData?.trip?.id) return;

    setUpdatingStatus(true);
    setStatusSuccessNotice('');

    try {
      const res = await fetch('/api/supervisor/trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_STATUS',
          tripId: tripData.trip.id,
          status,
          trafficStatus,
          trafficNote,
          currentLocation,
          delayMinutes: Number(delayMinutes),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusSuccessNotice(locale === 'bn' ? 'রাস্তার অবস্থা ও লোকেশন সফলভাবে আপডেট করা হয়েছে!' : 'Trip traffic and location updated successfully!');
        setTimeout(() => setStatusSuccessNotice(''), 4000);
        loadSupervisorTrip(tripData.trip.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCheckInPassenger = async (ticketId: string) => {
    try {
      const res = await fetch('/api/supervisor/trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHECK_IN_PASSENGER',
          ticketId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        loadSupervisorTrip(tripData.trip.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const manifest = tripData?.manifest || [];
  const filteredManifest = manifest.filter((p: any) =>
    p.seatNumber.toLowerCase().includes(searchPassenger.toLowerCase()) ||
    p.passengerName.toLowerCase().includes(searchPassenger.toLowerCase()) ||
    p.passengerPhone.includes(searchPassenger)
  );

  return (
    <div className="bg-[#F6F8FB] min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header */}
        <div className="bg-[#0B1F3A] text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center shadow-lg">
              <Bus className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                  CREW PANEL
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-300">
                  {locale === 'bn' ? 'বাস ড্রাইভার ও সুপারভাইজার অ্যাপ' : 'Bus Driver & Supervisor Console'}
                </span>
              </div>
              <h1 className="text-2xl font-black mt-1">
                {locale === 'bn' ? 'অন-বোর্ড ট্রিপ ও যাত্রী চেকিং' : 'On-Board Trip & Passenger Check-In'}
              </h1>
            </div>
          </div>

          {/* Trip Selector */}
          {tripData?.allTrips && tripData.allTrips.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={selectedTripId || tripData?.trip?.id}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="bg-[#153B63] border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              >
                {tripData.allTrips.map((tItem: any) => (
                  <option key={tItem.id} value={tItem.id}>
                    {tItem.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => loadSupervisorTrip(selectedTripId)}
                className="p-2.5 bg-[#153B63] hover:bg-slate-700 text-slate-200 rounded-xl"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xs font-semibold text-slate-500">Loading trip crew manifest and highway status...</p>
          </div>
        ) : tripData?.trip ? (
          <div className="space-y-6">
            {/* 1. ASSIGNED TRIP INFO CARD */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {locale === 'bn' ? 'চলতি ট্রিপ' : 'Current Active Trip'}
                  </span>
                  <h2 className="text-xl font-black text-[#0B1F3A]">
                    {locale === 'bn' ? tripData.trip.routeBn : tripData.trip.route}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#0B1F3A] text-[#FFB020] font-black text-xs rounded-xl font-mono">
                    {tripData.trip.busReg}
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl">
                    {tripData.trip.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    {locale === 'bn' ? 'যাত্রার সময়' : 'Departure Time'}
                  </span>
                  <strong className="text-slate-900 block mt-0.5">
                    {formatTime(tripData.trip.departureTime, locale)}
                  </strong>
                  <span className="text-slate-500">{formatDate(tripData.trip.departureTime, locale)}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    {locale === 'bn' ? 'বাস চালক (Driver)' : 'Assigned Driver'}
                  </span>
                  <strong className="text-slate-900 block mt-0.5">{tripData.trip.driverName}</strong>
                  <span className="text-slate-500 font-mono">{tripData.trip.driverPhone}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    {locale === 'bn' ? 'সুপারভাইজার (Supervisor)' : 'Supervisor'}
                  </span>
                  <strong className="text-slate-900 block mt-0.5">{tripData.trip.supervisorName}</strong>
                  <span className="text-slate-500 font-mono">{tripData.trip.supervisorPhone}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    {locale === 'bn' ? 'বর্তমান অবস্থান' : 'Current Location'}
                  </span>
                  <strong className="text-[#FF6B00] block mt-0.5">{tripData.trip.currentLocation}</strong>
                  <span className="text-slate-500">{tripData.trip.trafficNote}</span>
                </div>
              </div>
            </div>

            {/* 2. ROAD TRAFFIC & LOCATION UPDATE CONTROLLER */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-[#0B1F3A] uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#FF6B00]" />
                <span>{locale === 'bn' ? 'রাস্তার জ্যাম, ট্রাফিক ও লোকেশন আপডেট' : 'Live Highway Traffic & Location Updater'}</span>
              </h3>

              {statusSuccessNotice && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{statusSuccessNotice}</span>
                </div>
              )}

              <form onSubmit={handleUpdateTripStatus} className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs items-end">
                {/* Trip Progress Status */}
                <div className="md:col-span-3">
                  <label className="font-bold text-slate-700 block mb-1">
                    {locale === 'bn' ? 'যাত্রার বর্তমান পর্যায়' : 'Trip Progress'}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#FF6B00]"
                  >
                    <option value="SCHEDULED">SCHEDULED (শিডিউল অনুযায়ী)</option>
                    <option value="BOARDING">BOARDING (যাত্রী উঠছে)</option>
                    <option value="DEPARTED">DEPARTED (টার্মিনাল ছেড়েছে)</option>
                    <option value="ON_HIGHWAY">ON_HIGHWAY (হাইওয়েতে রানিং)</option>
                    <option value="REST_BREAK">REST_BREAK (বিরতি / খাবার বিরতি)</option>
                    <option value="COMPLETED">COMPLETED (গন্তব্যে পৌঁছেছে)</option>
                  </select>
                </div>

                {/* Traffic Condition */}
                <div className="md:col-span-3">
                  <label className="font-bold text-slate-700 block mb-1">
                    {locale === 'bn' ? 'হাইওয়ে ট্রাফিক অবস্থা' : 'Highway Traffic'}
                  </label>
                  <select
                    value={trafficStatus}
                    onChange={(e) => setTrafficStatus(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#FF6B00]"
                  >
                    <option value="NORMAL">🟢 স্বাভাবিক গতি (Normal Traffic)</option>
                    <option value="MODERATE_JAM">🟡 মাঝারি জ্যাম (Moderate Traffic)</option>
                    <option value="SEVERE_JAM">🔴 তীব্র জ্যাম (Severe Jam)</option>
                    <option value="REST_BREAK">☕ খাবার বিরতি (Highway Rest Break)</option>
                  </select>
                </div>

                {/* Current Location */}
                <div className="md:col-span-3">
                  <label className="font-bold text-slate-700 block mb-1">
                    {locale === 'bn' ? 'বর্তমান লোকেশন / স্পট' : 'Current Landmark'}
                  </label>
                  <input
                    type="text"
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                    placeholder={locale === 'bn' ? 'যেমন: কাঁচপুর ব্রিজ / কুমিল্লা' : 'e.g. Comilla Food Village'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                {/* Submit Update Button */}
                <div className="md:col-span-3">
                  <button
                    type="submit"
                    disabled={updatingStatus}
                    className="w-full py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-black rounded-xl uppercase tracking-wider shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{updatingStatus ? (locale === 'bn' ? 'আপডেট হচ্ছে...' : 'Saving...') : (locale === 'bn' ? 'আপডেট পাঠান' : 'Update Status')}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 3. PASSENGER MANIFEST & CHECK-IN TABLE */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-4">
                <div>
                  <h3 className="font-extrabold text-sm text-[#0B1F3A] uppercase tracking-wider">
                    {locale === 'bn' ? 'যাত্রী ম্যানিফেস্ট ও চেকিং তালিকা' : 'Passenger Manifest & Check-In'}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="text-slate-600 font-bold">
                      {locale === 'bn'
                        ? `মোট বুকড যাত্রী: ${toBengaliDigits(tripData.stats.totalBookedPassengers)} জন`
                        : `Total Booked: ${tripData.stats.totalBookedPassengers}`}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">
                      {locale === 'bn'
                        ? `বাসে উঠেছেন: ${toBengaliDigits(tripData.stats.boardedCount)} জন`
                        : `Boarded: ${tripData.stats.boardedCount}`}
                    </span>
                    <span>•</span>
                    <span className="text-amber-700 font-bold">
                      {locale === 'bn'
                        ? `বাকি আছেন: ${toBengaliDigits(tripData.stats.remainingCount)} জন`
                        : `Remaining: ${tripData.stats.remainingCount}`}
                    </span>
                  </div>
                </div>

                {/* Search Box */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchPassenger}
                    onChange={(e) => setSearchPassenger(e.target.value)}
                    placeholder={locale === 'bn' ? 'সিট নম্বর বা নাম খুঁজুন...' : 'Search seat or name...'}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              {filteredManifest.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  {locale === 'bn' ? 'কোনো যাত্রী পাওয়া যায়নি।' : 'No passengers found in manifest.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="pb-3 font-bold">{locale === 'bn' ? 'সিট' : 'Seat'}</th>
                        <th className="pb-3 font-bold">{locale === 'bn' ? 'যাত্রীর নাম' : 'Passenger'}</th>
                        <th className="pb-3 font-bold">{locale === 'bn' ? 'মোবাইল' : 'Phone'}</th>
                        <th className="pb-3 font-bold">{locale === 'bn' ? 'বোর্ডিং কাউন্টার' : 'Boarding Point'}</th>
                        <th className="pb-3 font-bold">{locale === 'bn' ? 'ড্রপিং পয়েন্ট' : 'Dropping Point'}</th>
                        <th className="pb-3 font-bold text-right">{locale === 'bn' ? 'চেক-ইন স্ট্যাটাস' : 'Check-In Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredManifest.map((p: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5">
                            <span className="px-2.5 py-1 bg-[#FF6B00] text-white font-black rounded-lg text-xs">
                              {p.seatNumber}
                            </span>
                          </td>
                          <td className="py-3.5 font-bold text-slate-900">
                            {p.passengerName}
                          </td>
                          <td className="py-3.5 text-slate-600 font-mono">
                            {p.passengerPhone}
                          </td>
                          <td className="py-3.5 text-slate-700">{p.boardingStop || 'Main Counter'}</td>
                          <td className="py-3.5 text-slate-700">{p.droppingStop || 'Terminal'}</td>
                          <td className="py-3.5 text-right">
                            {p.isBoarded ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-black rounded-full border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{locale === 'bn' ? 'উঠেছেন (Boarded)' : 'Checked-In'}</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleCheckInPassenger(p.ticketId)}
                                className="px-3.5 py-1.5 bg-[#16A34A] hover:bg-emerald-700 text-white rounded-xl text-[11px] font-extrabold shadow-sm transition-all cursor-pointer"
                              >
                                {locale === 'bn' ? '✓ বোর্ডিং নিশ্চিত করুন' : 'Confirm Check-In'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <Bus className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-slate-700">
              {locale === 'bn' ? 'কোনো সক্রিয় ট্রিপ পাওয়া যায়নি।' : 'No active trips scheduled at this time.'}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
