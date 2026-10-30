'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Phone,
  Clock,
  Search,
  Bus,
  ShieldCheck,
  Building2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Locale } from '@/lib/i18n';
import { CounterItem } from '@/lib/siteConfig';
import { DISTRICTS, DIVISIONS, getDistrictCounterOptions } from '@/data/districts';

interface Props {
  customCounters: CounterItem[];
  locale: Locale;
}

export default function CountersClient({ customCounters: initialCounters, locale }: Props) {
  const [customCounters, setCustomCounters] = useState<CounterItem[]>(initialCounters);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('All');

  React.useEffect(() => {
    fetch('/api/site-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.config?.counters) && data.config.counters.length > 0) {
          setCustomCounters(data.config.counters);
        }
      })
      .catch((err) => console.log('Using initial counters:', err));
  }, []);

  // Filter 64 districts
  const filteredDistricts = useMemo(() => {
    return DISTRICTS.filter((d) => {
      const matchesDivision =
        selectedDivision === 'All' || d.divisionEn.toLowerCase() === selectedDivision.toLowerCase();

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        d.nameEn.toLowerCase().includes(q) ||
        d.nameBn.includes(q) ||
        d.counterNameEn.toLowerCase().includes(q) ||
        d.counterNameBn.includes(q) ||
        d.divisionEn.toLowerCase().includes(q) ||
        d.divisionBn.includes(q);

      return matchesDivision && matchesSearch;
    });
  }, [searchQuery, selectedDivision]);

  // Filter custom counters
  const filteredCustomCounters = useMemo(() => {
    return (customCounters || []).filter((c) => {
      const matchesDivision =
        selectedDivision === 'All' ||
        (c.divisionEn && c.divisionEn.toLowerCase() === selectedDivision.toLowerCase());

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.nameEn.toLowerCase().includes(q) ||
        c.nameBn.includes(q) ||
        c.districtEn.toLowerCase().includes(q) ||
        c.districtBn.includes(q) ||
        c.addressEn.toLowerCase().includes(q) ||
        c.addressBn.includes(q);

      return matchesDivision && matchesSearch;
    });
  }, [customCounters, searchQuery, selectedDivision]);

  return (
    <div className="bg-[#F6F8FB] min-h-screen pb-16">
      {/* Hero Header */}
      <section className="relative bg-[#0B1F3A] text-white py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A] via-[#0E2648] to-[#153B63] opacity-95"></div>
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FFB020] text-xs font-bold shadow-sm">
            <Building2 className="w-4 h-4 text-[#FF6B00]" />
            <span>{locale === 'bn' ? 'সারাদেশে ৬৪ জেলার বিস্তৃত কাউন্টার নেটওয়ার্ক' : 'Nationwide 64-District Terminal Network'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            {locale === 'bn' ? 'ভ্যাবাচ্যাকা এক্সপ্রেস কাউন্টারসমূহ' : 'Official Bus Counters Directory'}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal">
            {locale === 'bn'
              ? 'বাংলাদেশের ৬৪ জেলার প্রতিটি সদরে আমাদের সুসজ্জিত কাউন্টার রয়েছে। আরামদায়ক ওয়েটিং লাউঞ্জ, লাগেজ লকার ও ২৪ ঘণ্টা টিকিট সেবা।'
              : 'Our official terminal counters across all 64 districts in Bangladesh. Enjoy air-conditioned waiting lounges, secure luggage, and 24/7 ticket assistance.'}
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto pt-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  locale === 'bn'
                    ? 'জেলা বা কাউন্টারের নাম লিখে খুঁজুন (যেমন: ঢাকা, দামপাড়া, সিলেট...)'
                    : 'Search by district or counter name (e.g. Dhaka, Dampara, Sylhet...)'
                }
                className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-800 placeholder-slate-400 rounded-2xl shadow-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-md"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
        {/* Division Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {DIVISIONS.map((div) => {
            const isSelected = selectedDivision === div.en;
            return (
              <button
                key={div.en}
                onClick={() => setSelectedDivision(div.en)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
                  isSelected
                    ? 'bg-[#0B1F3A] text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {locale === 'bn' ? div.bn : div.en}
              </button>
            );
          })}
        </div>

        {/* 1. Featured / Custom Terminal Counters (Curated in CMS) */}
        {filteredCustomCounters.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-lg font-black text-[#0B1F3A] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                <span>{locale === 'bn' ? 'প্রধান হাব ও সুপার কাউন্টারসমূহ' : 'Featured Hubs & Super Counters'}</span>
                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#FF6B00] text-[10px] font-black">
                  {filteredCustomCounters.length}
                </span>
              </h2>
              <span className="text-xs text-slate-400 font-semibold">
                {locale === 'bn' ? 'অ্যাডমিন প্যানেল থেকে সার্বক্ষণিক হালনাগাদকৃত' : 'Live updated from Admin CMS'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomCounters.map((counter) => (
                <div
                  key={counter.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Counter Image */}
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={counter.image}
                        alt={counter.nameEn}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        onError={(e: any) => {
                          e.target.src = '/images/hero/hero-bus.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/90 via-[#0B1F3A]/30 to-transparent"></div>

                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#0B1F3A] text-[10px] font-black uppercase tracking-wider shadow">
                          📍 {locale === 'bn' ? counter.districtBn : counter.districtEn}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="text-base font-black tracking-tight leading-snug">
                          {locale === 'bn' ? counter.nameBn : counter.nameEn}
                        </h3>
                        <p className="text-[11px] text-slate-200 font-medium truncate">
                          {locale === 'bn' ? counter.addressBn : counter.addressEn}
                        </p>
                      </div>
                    </div>

                    {/* Counter Details Body */}
                    <div className="p-4 space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2 text-slate-600">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <a href={`tel:${counter.phone}`} className="hover:underline truncate">
                            {counter.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end font-semibold text-[11px] text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate">{locale === 'bn' ? counter.hoursBn : counter.hoursEn}</span>
                        </div>
                      </div>

                      {/* Amenities */}
                      {counter.amenitiesBn && counter.amenitiesBn.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {(locale === 'bn' ? counter.amenitiesBn : counter.amenitiesEn).map((am, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold"
                            >
                              ✓ {am}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Book from this Counter Action */}
                  <div className="p-4 pt-0">
                    <Link
                      href={`/${locale}/search?origin=${encodeURIComponent(counter.districtEn)}`}
                      className="w-full py-2.5 px-4 bg-[#0B1F3A] hover:bg-[#FF6B00] text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <Bus className="w-3.5 h-3.5 text-[#FFB020] group-hover:text-white" />
                      <span>{locale === 'bn' ? 'এই কাউন্টার থেকে বাস খুঁজুন' : 'Book Bus From Here'}</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. All 64 Districts Terminal Directory */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 font-semibold gap-2 border-b border-slate-200 pb-3">
            <div>
              {locale === 'bn' ? (
                <span>
                  সারাদেশের মোট <strong className="text-[#0B1F3A] font-black">{filteredDistricts.length}</strong>টি জেলার সদর কাউন্টার তালিকা
                </span>
              ) : (
                <span>
                  Showing official counters across all <strong className="text-[#0B1F3A] font-black">{filteredDistricts.length}</strong> district headquarters
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {locale === 'bn' ? '২৪/৭ সাপোর্ট' : '24/7 Support'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-blue-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                {locale === 'bn' ? 'BRTA রেজিস্টার্ড কাউন্টার' : 'BRTA Registered Counters'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDistricts.map((district) => {
              const counterOptions = getDistrictCounterOptions(district.nameEn, true);

              return (
                <div
                  key={district.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* District Image Header */}
                    <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                      <Image
                        src={district.image}
                        alt={district.nameEn}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/90 via-[#0B1F3A]/40 to-transparent"></div>

                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#0B1F3A] text-[10px] font-black uppercase tracking-wider shadow">
                          {locale === 'bn' ? `${district.divisionBn} বিভাগ` : `${district.divisionEn} Division`}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="text-xl font-black tracking-tight">
                          {locale === 'bn' ? district.nameBn : district.nameEn}
                        </h3>
                        <p className="text-[11px] text-slate-200 font-medium line-clamp-1">
                          {locale === 'bn' ? district.landmarkBn : district.landmarkEn}
                        </p>
                      </div>
                    </div>

                    {/* Counter Details Body */}
                    <div className="p-4 space-y-3 text-xs">
                      {/* Primary Counter Name */}
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF6B00] flex items-center justify-center shrink-0 mt-0.5 border border-orange-200">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                            {locale === 'bn' ? 'প্রধান টার্মিনাল কাউন্টার' : 'Main Terminal Counter'}
                          </span>
                          <span className="font-black text-[#0B1F3A] text-sm block">
                            {locale === 'bn' ? district.counterNameBn : district.counterNameEn}
                          </span>
                        </div>
                      </div>

                      {/* Available Points / Sub-counters */}
                      {counterOptions.length > 1 && (
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            {locale === 'bn' ? 'পিকআপ ও ড্রপিং পয়েন্ট:' : 'Boarding & Dropping Points:'}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {counterOptions.slice(0, 3).map((opt) => (
                              <span
                                key={opt.id}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700"
                              >
                                📍 {locale === 'bn' ? opt.nameBn : opt.nameEn}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Contact & Hours */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <a href={`tel:${counterOptions[0]?.phone || '01710-123456'}`} className="hover:text-emerald-700 font-bold truncate">
                            {counterOptions[0]?.phone || '01710-123456'}
                          </a>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-600 justify-end">
                          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-semibold text-[11px]">
                            {locale === 'bn' ? '০৬:০০ AM - ১১:৩০ PM' : '06:00 AM - 11:30 PM'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Book from this Counter Action */}
                  <div className="p-4 pt-0">
                    <Link
                      href={`/${locale}/search?origin=${encodeURIComponent(district.nameEn)}`}
                      className="w-full py-2.5 px-4 bg-[#0B1F3A] hover:bg-[#FF6B00] text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <Bus className="w-3.5 h-3.5 text-[#FFB020] group-hover:text-white" />
                      <span>{locale === 'bn' ? 'এই কাউন্টার থেকে বাস খুঁজুন' : 'Book Bus From This Counter'}</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
