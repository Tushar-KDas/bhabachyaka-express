'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Ticket,
  Clock,
  Calendar,
  Bus,
  MapPin,
  Printer,
  CheckCircle2,
  AlertCircle,
  Search,
  Phone,
  User,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { getDictionary, Locale, formatBDT, formatTime, formatDate, toBengaliDigits } from '@/lib/i18n';

interface Props {
  params: { locale: string };
}

export default function VerifyTicketPage({ params }: Props) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;
  const t = getDictionary(locale);
  const searchParams = useSearchParams();

  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const [error, setError] = useState('');

  // Check URL params on initial load (e.g. when QR code is scanned: ?pnr=BE9123456)
  useEffect(() => {
    const pnrParam = searchParams.get('pnr') || searchParams.get('query') || searchParams.get('phone');
    if (pnrParam) {
      setQueryInput(pnrParam);
      performLookup(pnrParam);
    }
  }, [searchParams]);

  const performLookup = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setTicketData(null);

    try {
      const res = await fetch(`/api/ticket/lookup?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.ticket) {
        setError(
          locale === 'bn'
            ? 'কোনো বৈধ টিকিট খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক PNR নম্বর বা মোবাইল নম্বর দিন।'
            : data.error || 'No valid ticket found with this PNR or Phone number.'
        );
      } else {
        setTicketData(data.ticket);
      }
    } catch {
      setError(
        locale === 'bn'
          ? 'সার্ভারে সংযোগ করতে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।'
          : 'Failed to verify ticket. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(queryInput);
  };

  return (
    <div className="bg-[#F6F8FB] min-h-screen py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Top Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{locale === 'bn' ? 'অফিশিয়াল টিকিট ভেরিফিকেশন' : 'Official Ticket Verification'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B1F3A]">
            {locale === 'bn' ? 'টিকিট ও বোর্ডিং গেট পাস যাচাই' : 'Verify Ticket & Boarding Pass'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            {locale === 'bn'
              ? 'টিকিটের কিউআর কোড স্ক্যান করে অথবা পিএনআর (PNR) / মোবাইল নম্বর দিয়ে টিকিটের সত্যতা যাচাই করুন।'
              : 'Scan the ticket QR code or search by PNR / Mobile number to verify authentic passenger and seat allocation.'}
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm max-w-xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">
              {locale === 'bn' ? 'PNR নম্বর অথবা মোবাইল নম্বর লিখুন:' : 'Enter PNR Reference or Mobile Number:'}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Ticket className="w-4 h-4 text-[#FF6B00] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder={locale === 'bn' ? 'যেমন: BE9123456 বা 01799887766' : 'e.g. BE9123456 or 01799887766'}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-[#0B1F3A] focus:bg-white focus:ring-2 focus:ring-[#FF6B00] outline-none transition-all uppercase"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 sm:px-6 py-3 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>{locale === 'bn' ? 'যাচাই করুন' : 'Verify'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Demo Suggestions */}
            <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-400">
              <span>{locale === 'bn' ? 'ডেমো চেক:' : 'Sample tests:'}</span>
              <button
                type="button"
                onClick={() => {
                  setQueryInput('BE9123456');
                  performLookup('BE9123456');
                }}
                className="font-mono text-[#0B1F3A] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded cursor-pointer font-bold"
              >
                BE9123456
              </button>
              <button
                type="button"
                onClick={() => {
                  setQueryInput('01799887766');
                  performLookup('01799887766');
                }}
                className="font-mono text-[#0B1F3A] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded cursor-pointer font-bold"
              >
                01799887766
              </button>
            </div>
          </form>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="max-w-xl mx-auto p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <p>{error}</p>
          </div>
        )}

        {/* VERIFIED TICKET CARD DISPLAY */}
        {ticketData && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 max-w-2xl mx-auto animate-fade-in relative overflow-hidden">
            {/* Top Verification Ribbon */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 p-4 px-6 sm:px-8 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">
                    {locale === 'bn' ? 'ভেরিফায়েড প্যাসেঞ্জার টিকিট' : 'Verified Passenger Ticket'}
                  </h3>
                  <span className="text-[11px] text-emerald-100 font-medium">
                    {locale === 'bn' ? 'অফিশিয়াল রেকর্ড পাওয়া গেছে ✓' : 'Authoritative Record Matched ✓'}
                  </span>
                </div>
              </div>

              <span className="font-mono text-xs font-black bg-white/20 px-3 py-1 rounded-xl">
                STATUS: {ticketData.status}
              </span>
            </div>

            {/* 4 PRIMARY FIELDS: PNR, PASSENGER NAME, PHONE, SEAT NUMBER */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {/* 1. PNR */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
                  {locale === 'bn' ? 'পিএনআর (PNR)' : 'PNR Code'}
                </span>
                <strong className="text-sm sm:text-base font-black text-[#0B1F3A] font-mono block">
                  {ticketData.pnr}
                </strong>
              </div>

              {/* 2. Passenger Name */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
                  {locale === 'bn' ? 'যাত্রীর নাম' : 'Passenger Name'}
                </span>
                <strong className="text-xs sm:text-sm font-black text-[#0B1F3A] block truncate" title={ticketData.customerName}>
                  {ticketData.leadPassengerName || ticketData.customerName}
                </strong>
              </div>

              {/* 3. Phone Number */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
                  {locale === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                </span>
                <strong className="text-xs sm:text-sm font-black text-[#0B1F3A] font-mono block">
                  {ticketData.customerPhone}
                </strong>
              </div>

              {/* 4. Seat Number */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
                  {locale === 'bn' ? 'বরাদ্দকৃত আসন' : 'Seat Number(s)'}
                </span>
                <strong className="text-sm sm:text-base font-black text-[#FF6B00] block">
                  {ticketData.seatNumbers}
                </strong>
              </div>
            </div>

            {/* Detailed Trip & Coach Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Route & Times */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {locale === 'bn' ? 'ভ্রমণ রুট ও সময়সূচী' : 'Route & Schedule'}
                </span>
                <h4 className="font-black text-sm text-[#0B1F3A]">
                  {locale === 'bn' ? ticketData.route.nameBn : ticketData.route.name}
                </h4>

                <div className="space-y-1 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>{formatDate(ticketData.trip.departureTime, locale)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>{formatTime(ticketData.trip.departureTime, locale)}</span>
                  </div>
                </div>
              </div>

              {/* Bus & Coach Info */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {locale === 'bn' ? 'বাস ও কোচ বিবরণ' : 'Bus & Coach Details'}
                </span>
                <h4 className="font-black text-sm text-[#0B1F3A]">
                  {ticketData.trip.bus.model}
                </h4>

                <div className="space-y-1 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Bus className="w-3.5 h-3.5 text-amber-500" />
                    <span>{ticketData.trip.bus.regNumber}</span>
                  </div>
                  <div className="text-amber-700 font-bold text-[11px]">
                    {ticketData.trip.bus.coachType.replace(/_/g, ' ')} {ticketData.trip.bus.isAc ? '(AC)' : '(Non-AC)'}
                  </div>
                </div>
              </div>
            </div>

            {/* Boarding and Dropping Stops */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    {locale === 'bn' ? 'বোর্ডিং কাউন্টার (যাত্রার স্থান)' : 'Boarding Terminal'}
                  </span>
                  <strong className="text-slate-800 font-bold">{ticketData.boardingStop}</strong>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2 border-t border-slate-200">
                <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    {locale === 'bn' ? 'ড্রপিং কাউন্টার (গন্তব্য)' : 'Destination Terminal'}
                  </span>
                  <strong className="text-slate-800 font-bold">{ticketData.droppingStop}</strong>
                </div>
              </div>
            </div>

            {/* Fare Summary & QR Code Box */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="space-y-1 text-left w-full sm:w-auto">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  {locale === 'bn' ? 'পরিশোধিত মোট ভাড়া' : 'Total Fare Paid'}
                </span>
                <strong className="text-2xl font-black text-[#0B1F3A] block">
                  {formatBDT(ticketData.payableAmount, locale)}
                </strong>
                <span className="text-[11px] text-emerald-600 font-bold block">
                  {locale === 'bn' ? 'সম্পূর্ণ পরিশোধিত (বিকাশ/অনলাইন)' : 'Fully Paid (Verified)'}
                </span>
              </div>

              {/* QR Code */}
              {ticketData.qrCodeDataUrl && (
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ticketData.qrCodeDataUrl}
                    alt="Ticket QR Verification"
                    className="w-20 h-20 rounded-xl"
                  />
                  <div className="text-[10px] text-slate-500 space-y-0.5 max-w-[120px]">
                    <span className="font-bold text-[#0B1F3A] block">QR Verified</span>
                    <p className="leading-tight">
                      {locale === 'bn' ? 'ক্যামেরা দিয়ে স্ক্যান করলে এই পাতাটি খুলবে।' : 'Scan with mobile camera to view.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <Link
                href={`/${locale}/booking/confirmation/${ticketData.pnr}`}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#0B1F3A] hover:bg-[#153B63] text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all text-center"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{locale === 'bn' ? 'অফিশিয়াল টিকিট প্রিন্ট করুন' : 'Print Official Ticket'}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
