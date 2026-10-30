'use client';

import React, { useState } from 'react';
import { Search, Ticket, AlertCircle, ArrowRight, Printer, XCircle } from 'lucide-react';
import TicketPrint from '@/components/TicketPrint';
import { getDictionary, Locale, formatBDT, formatTime, formatDate } from '@/lib/i18n';

interface Props {
  params: { locale: string };
}

export default function ManageBookingPage({ params }: Props) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;
  const t = getDictionary(locale);

  const [pnrInput, setPnrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelNotice, setCancelNotice] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnrInput.trim()) return;

    setLoading(true);
    setError('');
    setCancelNotice('');
    setBookingData(null);

    try {
      const res = await fetch(`/api/bookings/${pnrInput.trim()}`);
      if (!res.ok) {
        setError(locale === 'bn' ? 'কোন বুকিং রেকর্ড খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক PNR দিন।' : 'No booking found. Please check your PNR reference.');
        return;
      }
      const data = await res.json();
      setBookingData(data);
    } catch {
      setError('Failed to look up booking.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm(locale === 'bn' ? 'আপনি কি নিশ্চিত যে এই টিকিটটি বাতিল করতে চান? (১০% সার্ভিস চার্জ প্রযোজ্য)' : 'Are you sure you want to cancel this booking? (10% policy fee applies)')) {
      return;
    }

    setCancelling(true);
    try {
      const res = await fetch('/api/customer/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pnr: bookingData.booking.pnr }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Cancellation failed');
      } else {
        setCancelNotice(
          locale === 'bn'
            ? `বুকিং সফলভাবে বাতিল করা হয়েছে। রিফান্ড পরিমাণ: ${formatBDT(data.refundAmount, locale)} অনুমোদিত হয়েছে।`
            : `Booking cancelled successfully. Refund of ${formatBDT(data.refundAmount, locale)} has been approved.`
        );
        // Refresh booking
        const refRes = await fetch(`/api/bookings/${bookingData.booking.pnr}`);
        const refData = await refRes.json();
        setBookingData(refData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-[#F6F8FB] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B1F3A]">
            {locale === 'bn' ? 'বুকিং ও টিকিট অনুসন্ধান (PNR Lookup)' : 'Manage Booking & E-Ticket'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {locale === 'bn'
              ? 'আপনার টিকেটের পিএনআর নম্বর দিয়ে টিকিটের স্ট্যাটাস দেখুন, পুনরায় প্রিন্ট করুন বা বাতিলের আবেদন করুন।'
              : 'Enter your booking PNR reference to view status, print E-Ticket or request cancellation.'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm max-w-xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Ticket className="w-4 h-4 text-[#FF6B00] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={pnrInput}
                onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
                placeholder={locale === 'bn' ? 'যেমন: BE9123456' : 'e.g. BE9123456'}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold uppercase tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#0B1F3A] hover:bg-[#153B63] text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{locale === 'bn' ? 'অনুসন্ধান' : 'Search'}</span>
            </button>
          </form>

          {/* Quick Demo PNR Suggestion */}
          <div className="mt-3 text-center text-[11px] text-slate-400">
            <span>{locale === 'bn' ? 'ডেমো পিএনআর ব্যবহার করে দেখুন: ' : 'Try demo PNR: '}</span>
            <button
              type="button"
              onClick={() => setPnrInput('BE9123456')}
              className="font-mono font-bold text-[#FF6B00] hover:underline"
            >
              BE9123456
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 text-center max-w-md mx-auto">
            {error}
          </div>
        )}

        {cancelNotice && (
          <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-300 text-center font-bold max-w-xl mx-auto">
            {cancelNotice}
          </div>
        )}

        {bookingData && (
          <div className="space-y-6 animate-fade-in">
            {/* Status & Cancel Action Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500">
                  {locale === 'bn' ? 'বর্তমান স্ট্যাটাস:' : 'Current Status:'}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    bookingData.booking.status === 'CONFIRMED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {bookingData.booking.status}
                </span>
              </div>

              {bookingData.booking.status === 'CONFIRMED' && (
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={handleCancelBooking}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>{locale === 'bn' ? 'টিকিট বাতিল ও রিফান্ড আবেদন' : 'Cancel Ticket & Request Refund'}</span>
                </button>
              )}
            </div>

            {/* Printable Ticket */}
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
        )}
      </div>
    </div>
  );
}
