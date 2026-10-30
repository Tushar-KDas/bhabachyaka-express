'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, Search, ArrowRight, Sparkles, Compass, ShieldCheck, Bus, Tag, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Locale, formatBDT, toBengaliDigits } from '@/lib/i18n';
import { DISTRICTS, DIVISIONS, District } from '@/data/districts';

interface Props {
  locale: Locale;
}

export default function DistrictsExplorer({ locale }: Props) {
  const router = useRouter();
  const [selectedDivision, setSelectedDivision] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('Dhaka');
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter districts by division & search query
  const filteredDistricts = DISTRICTS.filter((d) => {
    const matchesDiv = selectedDivision === 'All' || d.divisionEn === selectedDivision;
    const cleanSearch = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !cleanSearch ||
      d.nameEn.toLowerCase().includes(cleanSearch) ||
      d.nameBn.includes(cleanSearch) ||
      d.landmarkEn.toLowerCase().includes(cleanSearch) ||
      d.landmarkBn.includes(cleanSearch);
    return matchesDiv && matchesSearch;
  });

  // Limit default view to only 4 destination options so homepage is not bloated
  const displayedDistricts = isExpanded ? filteredDistricts : filteredDistricts.slice(0, 4);

  const handleBookToDistrict = (destNameEn: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const q = new URLSearchParams({
      origin: selectedOrigin === destNameEn ? (destNameEn === 'Dhaka' ? 'Chattogram' : 'Dhaka') : selectedOrigin,
      destination: destNameEn,
      date: todayStr,
      passengers: '1',
    });
    router.push(`/${locale}/search?${q.toString()}`);
  };

  return (
    <section id="districts-explorer" className="py-16 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF6B00] text-xs font-black uppercase tracking-wider">
            <Compass className="w-4 h-4 text-[#FF6B00]" />
            <span>{locale === 'bn' ? 'সমগ্র বাংলাদেশ কানেক্টিভিটি' : 'Nationwide 64 Districts Network'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#0B1F3A] tracking-tight">
            {locale === 'bn'
              ? 'দেশের ৬৪ জেলা থেকে ৬৪ জেলার সরাসরি বাস সার্ভিস'
              : 'Direct Bus Service Across All 64 Districts of Bangladesh'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {locale === 'bn'
              ? 'যেকোনো একটি জেলা থেকে অন্য যেকোনো জেলায় সহজে ও নিরাপদে যাতায়াত করুন। দর্শনীয় স্থান, ভাড়ার তালিকা ও সরাসরি বাসের সময়সূচী এক ক্লিকেই।'
              : 'Seamlessly travel between any two districts in Bangladesh. Explore scenic landmarks, live fares, and guaranteed departures in one click.'}
          </p>
        </div>

        {/* Origin District Selector Bar */}
        <div className="bg-[#F6F8FB] rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B1F3A] text-white flex items-center justify-center font-black">
              <Bus className="w-5 h-5 text-[#FFB020]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase">
                {locale === 'bn' ? 'আপনার যাত্রার প্রারম্ভিক জেলা' : 'Your Departure District'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#0B1F3A]">
                  {locale === 'bn' ? 'যাত্রা শুরু করবেন:' : 'Starting From:'}
                </span>
                <select
                  value={selectedOrigin}
                  onChange={(e) => setSelectedOrigin(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-1 text-xs font-bold text-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d.id} value={d.nameEn}>
                      {locale === 'bn' ? `${d.nameBn} (${d.divisionBn})` : `${d.nameEn} (${d.divisionEn})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Search Input for Districts */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                locale === 'bn'
                  ? 'জেলা বা দর্শনীয় স্থান খুঁজুন (যেমন: সাজেক, কুয়াকাটা...)'
                  : 'Search district or landmark (e.g. Sajek, Kuakata...)'
              }
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
          </div>
        </div>

        {/* Division Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {DIVISIONS.map((div) => {
            const count = div.en === 'All' ? DISTRICTS.length : DISTRICTS.filter((d) => d.divisionEn === div.en).length;
            const isActive = selectedDivision === div.en;
            return (
              <button
                key={div.en}
                type="button"
                onClick={() => setSelectedDivision(div.en)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#0B1F3A] text-[#FFB020] shadow-md ring-1 ring-slate-800'
                    : 'bg-[#F6F8FB] hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{locale === 'bn' ? div.bn : div.en}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-[#FF6B00] text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {locale === 'bn' ? toBengaliDigits(count) : count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Districts Grid (Displays 4 destination cards initially, expands on Load More) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {displayedDistricts.map((district) => (
            <div
              key={district.id}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Photo & Badge */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <Image
                  src={district.image}
                  alt={district.nameEn}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Division Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-[#0B1F3A]/90 text-white text-[10px] font-bold backdrop-blur-sm border border-white/20">
                    {locale === 'bn' ? district.divisionBn : district.divisionEn} বিভাগ
                  </span>
                </div>

                {/* District Name on Image Bottom */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-black text-lg sm:text-xl drop-shadow">
                    {locale === 'bn' ? district.nameBn : district.nameEn}
                  </h3>
                  <span className="text-[11px] text-slate-200 font-semibold block drop-shadow">
                    {locale === 'bn' ? district.nameEn : district.nameBn}
                  </span>
                </div>
              </div>

              {/* Body: Landmark & Fare */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#FF6B00] font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>{locale === 'bn' ? 'দর্শনীয় আকর্ষণ' : 'Top Attraction'}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold line-clamp-2">
                    {locale === 'bn' ? district.landmarkBn : district.landmarkEn}
                  </p>
                  <div className="mt-2 text-[10px] text-slate-600 font-bold flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <MapPin className="w-3 h-3 text-[#FF6B00] shrink-0" />
                    <span className="truncate" title={locale === 'bn' ? district.counterNameBn : district.counterNameEn}>
                      {locale === 'bn' ? district.counterNameBn : district.counterNameEn}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">
                      {locale === 'bn' ? 'প্রারম্ভিক ভাড়া' : 'Starting From'}
                    </span>
                    <strong className="text-sm font-black text-[#0B1F3A]">
                      {formatBDT(district.startingFare, locale)}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBookToDistrict(district.nameEn)}
                    className="px-3.5 py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white rounded-xl text-xs font-black shadow transition-all flex items-center gap-1.5 cursor-pointer group-hover:scale-102"
                  >
                    <span>{locale === 'bn' ? 'বাস খুঁজুন' : 'Book Bus'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More / Show Less Button Container */}
        {filteredDistricts.length > 4 && (
          <div className="flex flex-col items-center justify-center pt-2 space-y-2.5">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-8 py-3.5 rounded-2xl bg-[#0B1F3A] hover:bg-[#FF6B00] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-orange-500/25 transition-all flex items-center gap-2.5 cursor-pointer group"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 text-[#FFB020] group-hover:text-white" />
                  <span>{locale === 'bn' ? 'কমিয়ে দেখুন (৪টি রাখুন)' : 'Show Less (Collapse to 4)'}</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4 text-[#FFB020] group-hover:text-white" />
                  <span>
                    {locale === 'bn'
                      ? `আরও জেলা দেখুন (বাকি ${toBengaliDigits(filteredDistricts.length - 4)}টি গন্তব্য)`
                      : `Load More Destinations (${filteredDistricts.length - 4} more)`}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#FFB020] group-hover:text-white" />
                </>
              )}
            </button>
            {!isExpanded && (
              <span className="text-[11px] text-slate-500 font-semibold">
                {locale === 'bn'
                  ? `মোট ${toBengaliDigits(filteredDistricts.length)}টি জেলার মধ্যে প্রথম ৪টি দেখানো হচ্ছে`
                  : `Showing 4 of ${filteredDistricts.length} districts`}
              </span>
            )}
          </div>
        )}

        {filteredDistricts.length === 0 && (
          <div className="text-center py-12 bg-[#F6F8FB] rounded-2xl border border-slate-200 space-y-2">
            <p className="text-xs font-bold text-slate-500">
              {locale === 'bn'
                ? `"${searchTerm}" এর সাথে কোনো জেলা পাওয়া যায়নি।`
                : `No districts found matching "${searchTerm}".`}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDivision('All');
              }}
              className="text-xs font-bold text-[#FF6B00] hover:underline"
            >
              {locale === 'bn' ? 'সবগুলো ৬৪ জেলা দেখুন' : 'View all 64 districts'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
