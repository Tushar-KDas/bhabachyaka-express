'use client';

import React, { useState } from 'react';
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Bus,
  User,
  ShieldCheck,
  Clock,
  MapPin,
} from 'lucide-react';
import { getDictionary, Locale, formatTime, formatDate } from '@/lib/i18n';

interface Props {
  params: { locale: string };
}

export default function BoardingStaffPage({ params }: Props) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;
  const t = getDictionary(locale);

  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketResult, setTicketResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async (confirmBoarding = false) => {
    if (!queryInput.trim()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/boarding/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryInput.trim(),
          confirmBoarding,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Verification failed');
        setTicketResult(null);
      } else {
        setTicketResult(data);
      }
    } catch {
      setErrorMsg('Failed to connect to verification server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F6F8FB] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-[#0B1F3A] text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#FFB020] uppercase tracking-wider block">
              {locale === 'bn' ? 'টার্মিনাল বোর্ডিং অফিসার' : 'Terminal Gate Verification'}
            </span>
            <h1 className="text-2xl font-black mt-1">{t.boarding.title}</h1>
            <p className="text-xs text-slate-300 mt-1">
              {locale === 'bn'
                ? 'যাত্রীর ই-টিকিটের কিউআর কোড স্ক্যান করুন বা পিএনআর দিয়ে তাৎক্ষণিক বোর্ডিং নিশ্চিত করুন।'
                : 'Scan passenger mobile QR code or enter PNR for instant contactless check-in.'}
            </p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl border border-white/20 text-center">
            <QrCode className="w-10 h-10 text-[#FF6B00] mx-auto" />
            <span className="text-[10px] text-slate-300 block mt-1 font-bold">DIGITAL GATEWAY</span>
          </div>
        </div>

        {/* Search & Verification Input Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify(false);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <QrCode className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value.toUpperCase())}
                placeholder={locale === 'bn' ? 'পিএনআর (যেমন: BE9123456) বা ভেরিফিকেশন কোড লিখুন' : 'Enter PNR (e.g. BE9123456) or Ticket QR String'}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#0B1F3A] hover:bg-[#153B63] text-white font-extrabold rounded-xl text-xs transition-all shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{locale === 'bn' ? 'যাচাই করুন' : 'Verify'}</span>
            </button>
          </form>

          {/* Quick Demo QR shortcut */}
          <div className="text-center text-xs text-slate-400">
            <span>{locale === 'bn' ? 'টেস্ট ভেরিফিকেশন কোড: ' : 'Test Verification PNR: '}</span>
            <button
              type="button"
              onClick={() => {
                setQueryInput('BE9123456');
              }}
              className="font-mono font-bold text-[#FF6B00] hover:underline"
            >
              BE9123456
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-200 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Verification Result Card */}
        {ticketResult && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fade-in">
            {/* Status Alert Banner */}
            {ticketResult.alreadyBoarded ? (
              <div className="p-4 bg-amber-50 text-amber-900 rounded-xl border border-amber-300 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-black text-sm">
                    {t.boarding.alreadyBoarded}
                  </strong>
                  <span className="text-xs text-amber-700">
                    {locale === 'bn' ? 'বোর্ডিং সময়:' : 'Boarded At:'}{' '}
                    {formatDate(ticketResult.boardedAt, locale)} {formatTime(ticketResult.boardedAt, locale)}
                  </span>
                </div>
              </div>
            ) : ticketResult.boardedNow ? (
              <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-300 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <strong className="block font-black text-sm">
                    {locale === 'bn' ? 'বোর্ডিং সফলভাবে সম্পন্ন হয়েছে!' : 'Boarding Confirmed Successfully!'}
                  </strong>
                  <span className="text-xs text-emerald-700">
                    {locale === 'bn' ? 'যাত্রী বাসে উঠতে পারেন।' : 'Passenger cleared to board coach.'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 text-blue-900 rounded-xl border border-blue-200 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-xs font-bold">{t.boarding.verified}</span>
              </div>
            )}

            {/* Ticket & Passenger Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-bold uppercase block text-[10px]">
                  {locale === 'bn' ? 'যাত্রীর নাম' : 'Passenger Name'}
                </span>
                <strong className="text-base text-slate-900 block mt-0.5">
                  {ticketResult.passengerName}
                </strong>
                <span className="text-slate-500">{ticketResult.passengerPhone}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-bold uppercase block text-[10px]">
                  {locale === 'bn' ? 'সিট নম্বর' : 'Seat Number'}
                </span>
                <strong className="text-2xl font-black text-[#FF6B00] block mt-0.5">
                  {ticketResult.seatNumber}
                </strong>
                <span className="text-slate-500 font-mono text-[11px]">{ticketResult.ticketNumber}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-bold uppercase block text-[10px]">
                  {locale === 'bn' ? 'যাত্রার রুট' : 'Route'}
                </span>
                <strong className="text-sm text-slate-900 block mt-0.5">
                  {ticketResult.route}
                </strong>
                <span className="text-slate-500">
                  {formatDate(ticketResult.departureTime, locale)} • {formatTime(ticketResult.departureTime, locale)}
                </span>
              </div>
            </div>

            {/* Action Confirm Boarding Button */}
            {!ticketResult.alreadyBoarded && !ticketResult.boardedNow && (
              <button
                type="button"
                disabled={loading}
                onClick={() => handleVerify(true)}
                className="w-full py-4 bg-[#16A34A] hover:bg-emerald-700 text-white font-black rounded-xl text-sm uppercase tracking-wider shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{t.boarding.markBoarded}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
