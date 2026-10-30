'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ArrowRightLeft, Calendar, Users, Search, AlertCircle, Bus, Tag, Building2, Sparkles } from 'lucide-react';
import { getDictionary, Locale, toBengaliDigits } from '@/lib/i18n';
import { DISTRICTS, DIVISIONS } from '@/data/districts';

interface Props {
  locale: Locale;
}

export default function HeroBookingForm({ locale }: Props) {
  const t = getDictionary(locale);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'BUS' | 'ROUTES' | 'HOTELS'>('BUS');

  const todayStr = new Date().toISOString().split('T')[0];

  const [origin, setOrigin] = useState('Dhaka');
  const [destination, setDestination] = useState('Chattogram');
  const [journeyDate, setJourneyDate] = useState(todayStr);
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [error, setError] = useState('');

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    setError('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) {
      setError(locale === 'bn' ? 'যাত্রার স্থান ও গন্তব্য নির্বাচন করুন।' : 'Please select both departure and destination.');
      return;
    }
    if (origin === destination) {
      setError(locale === 'bn' ? 'যাত্রার স্থান ও গন্তব্য একই হতে পারে না।' : 'Origin and destination cannot be identical.');
      return;
    }

    const query = new URLSearchParams({
      origin,
      destination,
      date: journeyDate,
      passengers: passengers.toString(),
    });

    if (returnDate) {
      query.set('returnDate', returnDate);
    }

    router.push(`/${locale}/search?${query.toString()}`);
  };

  // Quick popular destinations for 1-click select
  const popularHubs = [
    { en: 'Dhaka', bn: 'ঢাকা' },
    { en: 'Chattogram', bn: 'চট্টগ্রাম' },
    { en: "Cox's Bazar", bn: 'কক্সবাজার' },
    { en: 'Sylhet', bn: 'সিলেট' },
    { en: 'Rajshahi', bn: 'রাজশাহী' },
    { en: 'Khulna', bn: 'খুলনা' },
    { en: 'Barishal', bn: 'বরিশাল' },
    { en: 'Rangpur', bn: 'রংপুর' },
    { en: 'Bandarban', bn: 'বান্দরবান' },
    { en: 'Panchagarh', bn: 'পঞ্চগড়' },
  ];

  // Group all 64 districts by division
  const divisionList = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-7 border border-slate-100 relative z-20 w-full">
      {/* Top 3 Navigation Tabs (Matches Reference UI) */}
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
        <button
          type="button"
          onClick={() => setActiveTab('BUS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'BUS'
              ? 'bg-[#0B1F3A] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bus className="w-4 h-4 text-[#FFB020]" />
          <span>{locale === 'bn' ? '🚌 ৬৪ জেলার বাস টিকিট' : '🚌 64 Districts Ticket'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('ROUTES');
            const el = document.getElementById('districts-explorer');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ROUTES'
              ? 'bg-[#0B1F3A] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-[#FF6B00]" />
          <span>{locale === 'bn' ? '🗺️ সকল ৬৪ জেলা এক্সপ্লোরার' : '🗺️ 64 Districts Explorer'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HOTELS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'HOTELS'
              ? 'bg-[#0B1F3A] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{locale === 'bn' ? '🏨 হোটেল বুকিং' : 'Hotels'}</span>
        </button>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* First Row: Origin, Swap Button, Destination, Journey Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Origin (All 64 Districts) */}
          <div className="lg:col-span-4 relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {locale === 'bn' ? 'যাত্রার জেলা / স্থান (৬৪ জেলা)' : 'Leaving From (64 Districts)'}
            </label>
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 text-[#FF6B00] absolute left-3 pointer-events-none" />
              <select
                value={origin}
                onChange={(e) => {
                  setOrigin(e.target.value);
                  setError('');
                }}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all cursor-pointer"
              >
                {divisionList.map((divName) => {
                  const divDistricts = DISTRICTS.filter((d) => d.divisionEn === divName);
                  const divTitle = locale === 'bn' ? `${divDistricts[0]?.divisionBn} বিভাগ (${divDistricts.length} জেলা)` : `${divName} Division (${divDistricts.length} Districts)`;
                  return (
                    <optgroup key={divName} label={`--- ${divTitle} ---`}>
                      {divDistricts.map((d) => (
                        <option key={d.id} value={d.nameEn}>
                          {locale === 'bn' ? `${d.nameBn} (${d.nameEn})` : `${d.nameEn} (${d.nameBn})`}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="lg:col-span-1 flex justify-center -my-2 lg:my-0 lg:pt-5">
            <button
              type="button"
              onClick={handleSwap}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-[#FF6B00] hover:text-white text-slate-600 flex items-center justify-center border border-slate-200 shadow-sm transition-all transform hover:rotate-180 cursor-pointer"
              title={t.hero.swap}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Destination (All 64 Districts) */}
          <div className="lg:col-span-4 relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {locale === 'bn' ? 'গন্তব্য জেলা / স্থান (৬৪ জেলা)' : 'Going To (64 Districts)'}
            </label>
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 text-[#16A34A] absolute left-3 pointer-events-none" />
              <select
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setError('');
                }}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#16A34A] transition-all cursor-pointer"
              >
                {divisionList.map((divName) => {
                  const divDistricts = DISTRICTS.filter((d) => d.divisionEn === divName);
                  const divTitle = locale === 'bn' ? `${divDistricts[0]?.divisionBn} বিভাগ (${divDistricts.length} জেলা)` : `${divName} Division (${divDistricts.length} Districts)`;
                  return (
                    <optgroup key={divName} label={`--- ${divTitle} ---`}>
                      {divDistricts.map((d) => (
                        <option key={d.id} value={d.nameEn}>
                          {locale === 'bn' ? `${d.nameBn} (${d.nameEn})` : `${d.nameEn} (${d.nameBn})`}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Journey Date */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {locale === 'bn' ? 'যাত্রার তারিখ' : 'Journey Date'}
            </label>
            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 text-[#FF6B00] absolute left-3 pointer-events-none" />
              <input
                type="date"
                min={todayStr}
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>
          </div>
        </div>

        {/* Popular Districts Quick Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
          <span className="font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FF6B00]" />
            {locale === 'bn' ? 'জনপ্রিয় জেলা:' : 'Popular:'}
          </span>
          {popularHubs.map((hub) => (
            <button
              key={hub.en}
              type="button"
              onClick={() => {
                setDestination(hub.en);
                setError('');
              }}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                destination === hub.en
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              {locale === 'bn' ? hub.bn : hub.en}
            </button>
          ))}
        </div>

        {/* Second Row: Return Date (Optional), Passengers, and Search Buses Button */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
          {/* Return Date (Optional) */}
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {locale === 'bn' ? 'ফিরতি তারিখ (ঐচ্ছিক)' : 'Return Date (Optional)'}
            </label>
            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="date"
                min={journeyDate}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>
          </div>

          {/* Passengers */}
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {locale === 'bn' ? 'যাত্রী সংখ্যা' : 'Passengers'}
            </label>
            <div className="relative flex items-center">
              <Users className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {locale === 'bn' ? `${toBengaliDigits(num)} জন` : `${num} Passenger${num > 1 ? 's' : ''}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Buses Button (Vibrant Orange Button) */}
          <div className="sm:col-span-4">
            <button
              type="submit"
              className="w-full py-2.5 px-6 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer h-[42px]"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>{locale === 'bn' ? 'সার্চ বাস (৬৪ জেলা)' : 'Search All 64 Districts'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
