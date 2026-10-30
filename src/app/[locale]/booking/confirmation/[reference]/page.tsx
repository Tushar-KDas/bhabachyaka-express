'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Home, User, AlertCircle, PhoneCall } from 'lucide-react';
import TicketPrint from '@/components/TicketPrint';
import { getDictionary, Locale } from '@/lib/i18n';

interface Props {
  params: { locale: string; reference: string };
}

export default function ConfirmationPage({ params }: Props) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;
  const t = getDictionary(locale);
  const pnr = params.reference;

  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/bookings/${pnr}`)
      .then((res) => {
        if (!res.ok) throw new Error('Booking not found');
        return res.json();
      })
      .then((data) => {
        setBookingData(data);
      })
      .catch((err) => {
        console.error(err);
        setError('Booking details could not be retrieved.');
      })
      .finally(() => setLoading(false));
  }, [pnr]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-4 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs font-semibold text-slate-500">Generating digital boarding pass and QR verification...</p>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Booking Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'Please check your PNR reference.'}</p>
        <Link
          href={`/${locale}`}
          className="inline-block px-5 py-2.5 bg-[#0B1F3A] text-white rounded-xl text-xs font-bold"
        >
          {t.confirmation.backHome}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F8FB] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Success Header banner (hidden in print) */}
        <div className="no-print bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#0B1F3A]">
            {t.confirmation.successTitle}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            {t.confirmation.successSubtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs font-bold text-slate-500">{t.confirmation.pnrLabel}:</span>
            <span className="px-4 py-1.5 bg-[#0B1F3A] text-[#FFB020] font-black text-base rounded-xl font-mono tracking-wider shadow">
              {bookingData.booking.pnr}
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            {t.confirmation.smsNotification}
          </p>

          <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0B1F3A]"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t.confirmation.backHome}</span>
            </Link>
            <span>•</span>
            <Link
              href={`/${locale}/account`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:underline"
            >
              <User className="w-3.5 h-3.5" />
              <span>{locale === 'bn' ? 'আমার ড্যাশবোর্ড' : 'My Account'}</span>
            </Link>
          </div>
        </div>

        {/* Branded Printable E-Ticket component */}
        <TicketPrint
          locale={locale}
          data={{
            pnr: bookingData.booking.pnr,
            customerName: bookingData.booking.customerName,
            customerPhone: bookingData.booking.customerPhone,
            customerEmail: bookingData.booking.customerEmail,
            totalAmount: bookingData.booking.totalAmount,
            discountAmount: bookingData.booking.discountAmount,
            payableAmount: bookingData.booking.payableAmount,
            status: bookingData.booking.status,
            boardingStop: bookingData.booking.boardingStop,
            droppingStop: bookingData.booking.droppingStop,
            createdAt: bookingData.booking.createdAt,
            operator: bookingData.operator,
            trip: bookingData.trip,
            passengers: bookingData.passengers,
            tickets: bookingData.tickets,
            payments: bookingData.payments,
          }}
        />
      </div>
    </div>
  );
}
