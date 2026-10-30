'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Ticket,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Bus,
  MapPin,
  Printer,
  ShieldCheck,
  User,
  Phone,
  QrCode,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Locale, formatBDT, formatDate, formatTime } from '@/lib/i18n';

interface Props {
  locale: Locale;
}

export default function TicketCheckerClient({ locale }: Props) {
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleLookup = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = (customQuery !== undefined ? customQuery : queryInput).trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setTicketData(null);

    try {
      const res = await fetch(`/api/ticket/lookup?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok || !data.ticket) {
        setError(
          locale === 'bn'
            ? 'কোনো টিকিট পাওয়া যায়নি। অনুগ্রহ করে সঠিক PNR নম্বর বা মোবাইল নম্বর দিন।'
            : data.error || 'No booking record found. Please verify PNR or mobile number.'
        );
      } else {
        setTicketData(data.ticket);
      }
    } catch {
      setError(
        locale === 'bn'
          ? 'সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।'
          : 'Failed to connect to verification server. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="check-ticket" className="py-8 relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{locale === 'bn' ? 'অনলাইন টিকিট অনুসন্ধান ও যাচাই' : 'Instant Ticket Verification'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0B1F3A]">
              {locale === 'bn' ? 'PNR অথবা মোবাইল নম্বর দিয়ে টিকিট চেক করুন' : 'Check Ticket by PNR or Mobile Number'}
            </h2>
            <p className="text-xs text-slate-500">
              {locale === 'bn'
                ? 'যেকোনো সময় আপনার বুকিং স্ট্যাটাস, সিট নম্বর এবং যাত্রীর বিবরণ অনলাইনে যাচাই করুন।'
                : 'Instantly check your booking status, seat allocation, and passenger information.'}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Link
              href={`/${locale}/verify-ticket`}
              className="text-xs font-bold text-[#FF6B00] hover:text-[#E05E00] flex items-center gap-1 hover:underline"
            >
              <span>{locale === 'bn' ? 'কিউআর কোড স্ক্যানার পেজ' : 'Dedicated QR Scanner'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Search Input Box */}
        <form onSubmit={(e) => handleLookup(e)} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Ticket className="w-5 h-5 text-[#FF6B00] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder={
                  locale === 'bn'
                    ? 'PNR নম্বর (যেমন: BE9123456) অথবা মোবাইল নম্বর (যেমন: 01799887766) লিখুন...'
                    : 'Enter PNR reference (e.g. BE9123456) or Mobile Phone (e.g. 01799887766)...'
                }
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-[#0B1F3A] focus:bg-white focus:ring-2 focus:ring-[#FF6B00] outline-none transition-all uppercase placeholder:normal-case"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 sm:px-8 py-3.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{locale === 'bn' ? 'যাচাই হচ্ছে...' : 'Verifying...'}</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>{locale === 'bn' ? 'টিকিট চেক করুন' : 'Check Ticket'}</span>
                </>
              )}
            </button>
          </div>

          {/* Sample quick search helpers */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
            <span className="font-semibold text-[11px] text-slate-400">
              {locale === 'bn' ? 'ডেমো পরীক্ষা করুন:' : 'Quick Demo Tests:'}
            </span>
            <button
              type="button"
              onClick={() => {
                setQueryInput('BE9123456');
                handleLookup(undefined, 'BE9123456');
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] font-mono text-[11px] font-bold rounded-lg transition-all cursor-pointer"
            >
              PNR: BE9123456
            </button>
            <button
              type="button"
              onClick={() => {
                setQueryInput('01799887766');
                handleLookup(undefined, '01799887766');
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] font-mono text-[11px] font-bold rounded-lg transition-all cursor-pointer"
            >
              মোবাইল: 01799887766
            </button>
          </div>
        </form>

        {/* Error Notice */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2.5 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* RESULT CARD - MATCHES USER REQUIREMENTS */}
        {ticketData && (
          <div className="mt-4 p-5 sm:p-7 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-inner space-y-5 animate-fade-in">
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#0B1F3A]">
                    {locale === 'bn' ? 'অফিশিয়াল ভেরিফায়েড টিকিট রেকর্ড পাওয়া গেছে' : 'Official Verified Ticket Record Found'}
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    {locale === 'bn' ? 'ভ্যাবাচ্যাকা এক্সপ্রেস সেন্ট্রাল ডাটাবেস ভেরিফায়েড' : 'Verified by Bhabachyaka Central Database'}
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black font-mono self-start sm:self-auto">
                STATUS: {ticketData.status} (PAID)
              </span>
            </div>

            {/* 4 PRIMARY MANDATORY FIELDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              {/* Field 1: PNR */}
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {locale === 'bn' ? '১. পিএনআর (PNR)' : '1. PNR Reference'}
                </span>
                <strong className="text-base font-black text-[#0B1F3A] font-mono block">
                  {ticketData.pnr}
                </strong>
              </div>

              {/* Field 2: Passenger Name */}
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {locale === 'bn' ? '২. যাত্রীর নাম' : '2. Passenger Name'}
                </span>
                <strong className="text-sm font-black text-[#0B1F3A] block truncate" title={ticketData.customerName}>
                  {ticketData.leadPassengerName || ticketData.customerName}
                </strong>
              </div>

              {/* Field 3: Phone Number */}
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {locale === 'bn' ? '৩. মোবাইল নম্বর' : '3. Phone Number'}
                </span>
                <strong className="text-sm font-black text-[#0B1F3A] font-mono block">
                  {ticketData.customerPhone}
                </strong>
              </div>

              {/* Field 4: Seat Number */}
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {locale === 'bn' ? '৪. আসন নম্বর (Seats)' : '4. Seat Number(s)'}
                </span>
                <strong className="text-base font-black text-[#FF6B00] block">
                  {ticketData.seatNumbers}
                </strong>
              </div>
            </div>

            {/* Route & Coach Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Route */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {locale === 'bn' ? 'ভ্রমণ রুট' : 'Journey Route'}
                </span>
                <strong className="text-xs font-black text-[#0B1F3A] block">
                  {locale === 'bn' ? ticketData.route.nameBn : ticketData.route.name}
                </strong>
                <span className="text-[10px] text-slate-500">
                  {ticketData.route.originCity} ➔ {ticketData.route.destinationCity}
                </span>
              </div>

              {/* Schedule */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {locale === 'bn' ? 'যাত্রার তারিখ ও সময়' : 'Departure Schedule'}
                </span>
                <strong className="text-xs font-black text-[#0B1F3A] block">
                  {formatDate(ticketData.trip.departureTime, locale)}
                </strong>
                <span className="text-[11px] text-[#FF6B00] font-bold block">
                  {formatTime(ticketData.trip.departureTime, locale)}
                </span>
              </div>

              {/* Bus details */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {locale === 'bn' ? 'বাস ও কোচ টাইপ' : 'Assigned Coach'}
                </span>
                <strong className="text-xs font-black text-[#0B1F3A] block">
                  {ticketData.trip.bus.model}
                </strong>
                <span className="text-[10px] text-slate-500 font-medium block">
                  {ticketData.trip.bus.regNumber} ({ticketData.trip.bus.coachType})
                </span>
              </div>
            </div>

            {/* QR Code and Verification Scan Link */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-black text-sm text-[#0B1F3A]">
                  <QrCode className="w-4 h-4 text-[#FF6B00]" />
                  <span>{locale === 'bn' ? 'অফিশিয়াল ডিজিটাল কিউআর কোড (QR Verified)' : 'Official Digital QR Code'}</span>
                </div>
                <p className="text-[11px] text-slate-500 max-w-md">
                  {locale === 'bn'
                    ? 'যেকোনো মোবাইল ক্যামেরা দিয়ে এই QR কোডটি স্ক্যান করলেই সরাসরি আমাদের ওয়েবসাইটে এই টিকিটের পূর্ণাঙ্গ বিবরণ ও স্ট্যাটাস প্রদর্শিত হবে।'
                    : 'Scanning this QR code with any mobile camera immediately opens the verified boarding pass in browser.'}
                </p>
                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  URL: {ticketData.verifyUrl}
                </div>
              </div>

              {ticketData.qrCodeDataUrl && (
                <div className="shrink-0 text-center bg-slate-50 p-2 rounded-2xl border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ticketData.qrCodeDataUrl}
                    alt="Ticket QR Code"
                    className="w-24 h-24 rounded-xl mx-auto"
                  />
                  <span className="text-[9px] font-bold text-slate-400 block mt-1 uppercase">
                    Scan to Open Live
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-500 font-semibold">
                {locale === 'bn' ? 'মোট পরিশোধিত ভাড়া:' : 'Total Paid Fare:'}{' '}
                <strong className="text-base font-black text-[#0B1F3A]">
                  {formatBDT(ticketData.payableAmount, locale)}
                </strong>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setTicketData(null);
                    setQueryInput('');
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  {locale === 'bn' ? 'নতুন অনুসন্ধান' : 'Clear'}
                </button>
                <Link
                  href={`/${locale}/booking/confirmation/${ticketData.pnr}`}
                  className="flex-1 sm:flex-none px-5 py-2 bg-[#0B1F3A] hover:bg-[#153B63] text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{locale === 'bn' ? 'টিকিট প্রিন্ট ও ভাউচার দেখুন' : 'Print E-Ticket'}</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
