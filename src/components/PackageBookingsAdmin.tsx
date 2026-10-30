'use client';

import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Eye,
  RefreshCw,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Tag,
  CreditCard,
  Building,
  Bus,
  Sparkles,
  Download,
} from 'lucide-react';
import { Locale, formatBDT, formatDate, toBengaliDigits } from '@/lib/i18n';
import type { PackageBooking } from '@/lib/packageBookingsServer';

interface Props {
  locale: Locale;
}

export default function PackageBookingsAdmin({ locale }: Props) {
  const [bookings, setBookings] = useState<PackageBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'CONFIRMED' | 'PENDING'>('ALL');
  const [selectedVoucher, setSelectedVoucher] = useState<PackageBooking | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/packages/book');
      const data = await res.json();
      if (data.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Failed to fetch package bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (idOrPnr: string, newBookingStatus: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED', newPaymentStatus?: 'PAID' | 'CONFIRMED' | 'PENDING') => {
    setStatusUpdating(idOrPnr);
    try {
      const res = await fetch('/api/packages/book', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idOrPnr,
          bookingStatus: newBookingStatus,
          paymentStatus: newPaymentStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotice(locale === 'bn' ? `স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে (${newBookingStatus})` : `Status updated successfully (${newBookingStatus})`);
        setTimeout(() => setNotice(null), 3500);
        await fetchBookings();
      } else {
        alert(data.error || 'Failed to update');
      }
    } catch (err) {
      alert('Error updating status');
    } finally {
      setStatusUpdating(null);
    }
  };

  const handlePrintAdminVoucher = () => {
    const el = document.getElementById('printable-admin-voucher');
    if (!el) {
      window.print();
      return;
    }

    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        window.print();
        return;
      }

      const headStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map((node) => node.outerHTML)
        .join('\n');

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Bhabachyaka Tour Voucher & Bus Ticket - ${selectedVoucher?.pnr || 'VOUCHER'}</title>
            ${headStyles}
            <style>
              @page {
                size: A4 portrait;
                margin: 6mm 8mm;
              }
              body {
                background: white !important;
                color: #0b1f3a !important;
                margin: 0 !important;
                padding: 12px !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              #printable-admin-voucher {
                visibility: visible !important;
                display: block !important;
                border: 2px solid #0b1f3a !important;
                border-radius: 12px !important;
                padding: 20px !important;
                background: #fcfbf8 !important;
                box-shadow: none !important;
                width: 100% !important;
                box-sizing: border-box !important;
              }
              #printable-admin-voucher * {
                visibility: visible !important;
              }
              .no-print {
                display: none !important;
              }
            </style>
          </head>
          <body>
            <div id="printable-admin-voucher" class="print-ticket-area printable-voucher">
              ${el.innerHTML}
            </div>
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch {}
        }, 2000);
      }, 400);
    } catch (err) {
      console.error('Iframe print error, falling back to window.print():', err);
      window.print();
    }
  };

  // Filtered List
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.pnr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerPhone.includes(searchTerm) ||
      b.packageTitleBn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.packageTitleEn.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.bookingStatus === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || b.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Analytics
  const totalRevenue = bookings.reduce((sum, b) => b.bookingStatus !== 'CANCELLED' ? sum + b.totalAmount : sum, 0);
  const totalTravelers = bookings.reduce((sum, b) => b.bookingStatus !== 'CANCELLED' ? sum + b.travelersCount : sum, 0);
  const confirmedCount = bookings.filter((b) => b.bookingStatus === 'CONFIRMED').length;

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-emerald-500 hover:text-emerald-700 text-sm">✕</button>
        </div>
      )}

      {/* Header & KPI Summary */}
      <div className="bg-gradient-to-r from-[#0B1F3A] to-[#153B63] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-bold mb-2">
              <Ticket className="w-3.5 h-3.5" />
              <span>{locale === 'bn' ? 'ট্যুর ও হলিডে প্যাকেজ পোর্টাল' : 'Tour Packages Admin Portal'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {locale === 'bn' ? '🎒 প্যাকেজ বুকিং ও ভাউচার ম্যানেজমেন্ট' : '🎒 Package Bookings & Travel Vouchers'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              {locale === 'bn'
                ? 'অনলাইন ও অফলাইনে বুক করা সকল হলিডে প্যাকেজ, পেমেন্ট ও অফিশিয়াল ট্রাভেল ভাউচার নিয়ন্ত্রণ করুন'
                : 'Manage all tour package reservations, instant MFS payments, and printable travel vouchers'}
            </p>
          </div>

          <button
            onClick={fetchBookings}
            disabled={loading}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{locale === 'bn' ? 'রিফ্রেশ ডাটা' : 'Refresh Data'}</span>
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 relative z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
              {locale === 'bn' ? 'মোট প্যাকেজ বুকিং' : 'Total Bookings'}
            </span>
            <span className="text-2xl font-black text-white mt-1 block">
              {locale === 'bn' ? toBengaliDigits(bookings.length) : bookings.length}
            </span>
            <span className="text-[10px] text-orange-300 font-semibold mt-0.5 block">
              {locale === 'bn' ? 'সকল প্যাকেজ ট্রিপ' : 'Across all tour plans'}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
              {locale === 'bn' ? 'মোট রাজস্ব সংগ্রহ' : 'Total Revenue'}
            </span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {formatBDT(totalRevenue, locale)}
            </span>
            <span className="text-[10px] text-emerald-200 font-semibold mt-0.5 block">
              {locale === 'bn' ? 'নিশ্চিত আয়' : 'Confirmed earnings'}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
              {locale === 'bn' ? 'মোট ভ্রমণকারী' : 'Total Travelers'}
            </span>
            <span className="text-2xl font-black text-amber-300 mt-1 block">
              {locale === 'bn' ? toBengaliDigits(totalTravelers) : totalTravelers} {locale === 'bn' ? 'জন' : 'pax'}
            </span>
            <span className="text-[10px] text-amber-200 font-semibold mt-0.5 block">
              {locale === 'bn' ? 'ভ্রমণরত পর্যটক' : 'Tour passengers'}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
              {locale === 'bn' ? 'সক্রিয় ও অনুমোদিত' : 'Active Confirmed'}
            </span>
            <span className="text-2xl font-black text-sky-300 mt-1 block">
              {locale === 'bn' ? toBengaliDigits(confirmedCount) : confirmedCount}
            </span>
            <span className="text-[10px] text-sky-200 font-semibold mt-0.5 block">
              {locale === 'bn' ? 'যাত্রার প্রস্তুতি সম্পন্ন' : 'Ready for travel'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={locale === 'bn' ? 'PNR, পর্যটকের নাম, মোবাইল বা প্যাকেজের নাম দিয়ে খুঁজুন...' : 'Search by PNR, customer name, mobile or tour package...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] text-xs font-semibold text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">{locale === 'bn' ? 'সকল বুকিং স্ট্যাটাস' : 'All Booking Status'}</option>
              <option value="CONFIRMED">{locale === 'bn' ? 'নিশ্চিত (Confirmed)' : 'Confirmed'}</option>
              <option value="COMPLETED">{locale === 'bn' ? 'সম্পন্ন (Completed)' : 'Completed'}</option>
              <option value="CANCELLED">{locale === 'bn' ? 'বাতিল (Cancelled)' : 'Cancelled'}</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold">
            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">{locale === 'bn' ? 'সকল পেমেন্ট' : 'All Payments'}</option>
              <option value="PAID">{locale === 'bn' ? 'পরিশোধিত (Paid)' : 'Paid'}</option>
              <option value="CONFIRMED">{locale === 'bn' ? 'কাউন্টার ক্যাশ' : 'Cash on Counter'}</option>
              <option value="PENDING">{locale === 'bn' ? 'বকেয়া (Pending)' : 'Pending'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#FF6B00]" />
            <span>{locale === 'bn' ? 'প্যাকেজ বুকিং লোড হচ্ছে...' : 'Loading package bookings...'}</span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold text-xs space-y-2">
            <Ticket className="w-8 h-8 mx-auto text-slate-300" />
            <p>{locale === 'bn' ? 'কোন প্যাকেজ বুকিং পাওয়া যায়নি' : 'No package bookings found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">{locale === 'bn' ? 'PNR ও তারিখ' : 'PNR & Date'}</th>
                  <th className="py-3.5 px-4">{locale === 'bn' ? 'ট্যুর প্যাকেজ' : 'Package'}</th>
                  <th className="py-3.5 px-4">{locale === 'bn' ? 'পর্যটক ও যোগাযোগ' : 'Customer'}</th>
                  <th className="py-3.5 px-4 text-center">{locale === 'bn' ? 'ভ্রমণকারী' : 'Travelers'}</th>
                  <th className="py-3.5 px-4">{locale === 'bn' ? 'মোট মূল্য ও কুপন' : 'Fare & Discount'}</th>
                  <th className="py-3.5 px-4 text-center">{locale === 'bn' ? 'পেমেন্ট' : 'Payment'}</th>
                  <th className="py-3.5 px-4 text-center">{locale === 'bn' ? 'বুকিং অবস্থা' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-right">{locale === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* PNR & Journey Date */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-black text-slate-900 flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>{b.pnr}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(b.journeyDate, locale)}</span>
                      </div>
                    </td>

                    {/* Package Info */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block max-w-xs truncate" title={locale === 'bn' ? b.packageTitleBn : b.packageTitleEn}>
                        {locale === 'bn' ? b.packageTitleBn : b.packageTitleEn}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold">
                          {locale === 'bn' ? b.durationBn : b.durationEn}
                        </span>
                        {b.hotelBn && (
                          <span className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">
                            🏨 {locale === 'bn' ? b.hotelBn : b.hotelEn}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{b.customerName}</span>
                      <div className="text-[11px] text-slate-600 font-semibold flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{b.customerPhone}</span>
                      </div>
                      {b.customerEmail && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {b.customerEmail}
                        </div>
                      )}
                    </td>

                    {/* Travelers */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 font-black text-slate-800">
                        {locale === 'bn' ? toBengaliDigits(b.travelersCount) : b.travelersCount} {locale === 'bn' ? 'জন' : 'pax'}
                      </span>
                    </td>

                    {/* Fare & Discount */}
                    <td className="py-3.5 px-4">
                      <span className="font-black text-slate-900 text-sm block">
                        {formatBDT(b.totalAmount, locale)}
                      </span>
                      {b.couponCode && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold mt-0.5">
                          <Tag className="w-2.5 h-2.5" />
                          <span>{b.couponCode} (-{formatBDT(b.discountAmount, locale)})</span>
                        </span>
                      )}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        b.paymentStatus === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : b.paymentStatus === 'CONFIRMED'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {b.paymentMethod} • {b.paymentStatus}
                      </span>
                      <span className="block text-[9px] font-mono text-slate-400 mt-0.5">
                        {b.transactionId}
                      </span>
                    </td>

                    {/* Booking Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        b.bookingStatus === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.bookingStatus === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {b.bookingStatus === 'CONFIRMED' ? (locale === 'bn' ? 'অনুমোদিত' : 'CONFIRMED') :
                         b.bookingStatus === 'COMPLETED' ? (locale === 'bn' ? 'সম্পন্ন' : 'COMPLETED') :
                         (locale === 'bn' ? 'বাতিল' : 'CANCELLED')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedVoucher(b)}
                          className="px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#FF6B00] font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                          title={locale === 'bn' ? 'ভাউচার দেখুন ও প্রিন্ট করুন' : 'View Voucher & Print'}
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{locale === 'bn' ? 'ভাউচার' : 'Voucher'}</span>
                        </button>

                        {/* Status Change Dropdown */}
                        <select
                          disabled={statusUpdating === b.pnr}
                          value={b.bookingStatus}
                          onChange={(e) => handleStatusChange(b.pnr, e.target.value as any)}
                          className="text-[11px] font-bold border border-slate-200 rounded-lg py-1 px-1.5 bg-white text-slate-700 focus:outline-none cursor-pointer"
                        >
                          <option value="CONFIRMED">{locale === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}</option>
                          <option value="COMPLETED">{locale === 'bn' ? 'সম্পন্ন করুন' : 'Complete'}</option>
                          <option value="CANCELLED">{locale === 'bn' ? 'বাতিল করুন' : 'Cancel'}</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Official Voucher Printable Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto modal-admin-print">
          {/* Print CSS Injection */}
          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-admin-voucher,
              #printable-admin-voucher * {
                visibility: visible !important;
              }
              #printable-admin-voucher {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 100vw !important;
                max-width: 100vw !important;
                margin: 0 !important;
                padding: 16px !important;
                background: white !important;
                color: #0b1f3a !important;
                z-index: 9999999 !important;
                box-shadow: none !important;
                border: 2px solid #0b1f3a !important;
                border-radius: 12px !important;
                overflow: visible !important;
              }
              .modal-admin-print {
                background: transparent !important;
                position: static !important;
                padding: 0 !important;
                inset: auto !important;
                overflow: visible !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-6 max-h-[92vh] overflow-y-auto printable-modal-wrapper">
            {/* Modal Header Actions (Hidden in Print) */}
            <div className="no-print bg-slate-900 text-white p-4 px-6 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-orange-400">
                {locale === 'bn' ? 'অফিশিয়াল ট্যুর প্যাকেজ ভাউচার ও বাস টিকিট প্রিভিউ' : 'Official Travel Voucher & Bus Boarding Pass'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintAdminVoucher}
                  className="px-4 py-2 bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{locale === 'bn' ? 'ভাউচার ও টিকিট প্রিন্ট করুন' : 'Print Voucher & Ticket'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedVoucher(null)}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Voucher & Bus Ticket Paper */}
            <div id="printable-admin-voucher" className="print-ticket-area printable-voucher p-6 sm:p-7 space-y-5 bg-[#FCFBF8] text-slate-800">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-800 pb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B1F3A] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
                    ভ
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[#0B1F3A] leading-tight">
                      {locale === 'bn' ? 'ভ্যাবাচ্যাকা হলিডেজ ও ট্যুরিজম' : 'BHABACHYAKA HOLIDAYS & TOURS'}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold">
                      {locale === 'bn' ? 'নিবন্ধিত আন্তঃজেলা লাক্সারি ট্রাভেল ও বাস সার্ভিস' : 'Govt. Approved Luxury Tour & Coach Operator'}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                    {locale === 'bn' ? 'ভাউচার নম্বর (PNR)' : 'BOOKING PNR'}
                  </span>
                  <span className="font-mono text-xl font-black text-[#FF6B00] tracking-wider block">
                    {selectedVoucher.pnr}
                  </span>
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold uppercase mt-0.5">
                    ✓ {selectedVoucher.bookingStatus} • {selectedVoucher.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Package Banner */}
              <div className="bg-[#0B1F3A] text-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[9px] font-black text-orange-400 uppercase tracking-wider block">
                    {selectedVoucher.category} TOUR PACKAGE
                  </span>
                  <h4 className="text-sm sm:text-base font-black text-white">
                    {locale === 'bn' ? selectedVoucher.packageTitleBn : selectedVoucher.packageTitleEn}
                  </h4>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    {locale === 'bn' ? selectedVoucher.durationBn : selectedVoucher.durationEn}
                  </p>
                </div>
                <div className="sm:text-right bg-white/10 p-2 rounded-xl border border-white/10 shrink-0">
                  <span className="text-[9px] text-slate-300 uppercase block font-semibold">
                    {locale === 'bn' ? 'যাত্রার তারিখ' : 'Journey Date'}
                  </span>
                  <span className="text-sm font-black text-amber-300 block">
                    {formatDate(selectedVoucher.journeyDate, locale)}
                  </span>
                  <span className="text-[10px] text-slate-200">👥 {selectedVoucher.travelersCount} জন পর্যটক</span>
                </div>
              </div>

              {/* Passenger & Hotel Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    {locale === 'bn' ? 'প্রধান পর্যটক তথ্য' : 'Lead Traveler Information'}
                  </span>
                  <p className="font-black text-slate-900 text-sm">{selectedVoucher.customerName}</p>
                  <p className="text-slate-600 font-medium">📞 {selectedVoucher.customerPhone}</p>
                  {selectedVoucher.customerEmail && <p className="text-slate-500 text-[11px]">✉️ {selectedVoucher.customerEmail}</p>}
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    {locale === 'bn' ? 'হোটেল ও পরিবহন তথ্য' : 'Hotel & Transport Details'}
                  </span>
                  <p className="font-bold text-slate-900 truncate">
                    🏨 {locale === 'bn' ? (selectedVoucher.hotelBn || '৪-স্টার প্রিমিয়াম রিসোর্ট') : (selectedVoucher.hotelEn || '4-Star Premium Resort')}
                  </p>
                  <p className="text-slate-600 font-medium">
                    🚌 {locale === 'bn' ? (selectedVoucher.coachTypeBn || 'লাক্সারি এসি কোচ') : (selectedVoucher.coachTypeEn || 'Luxury AC Coach')}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    💳 {selectedVoucher.paymentMethod} (Trx: {selectedVoucher.transactionId})
                  </p>
                </div>
              </div>

              {/* PART 2: 🚌 INTERCITY LUXURY BUS TICKET & BOARDING PASS */}
              <div className="border-t-2 border-dashed border-slate-400 pt-3.5 relative">
                <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-orange-200 gap-1.5">
                    <div className="flex items-center gap-2">
                      <Bus className="w-4 h-4 text-[#FF6B00]" />
                      <span className="font-black text-xs text-[#0B1F3A] uppercase tracking-wide">
                        {locale === 'bn' ? 'ভ্যাবাচ্যাকা এক্সপ্রেস — প্যাসেঞ্জার বোর্ডিং পাস' : 'INTERCITY BUS BOARDING PASS'}
                      </span>
                    </div>
                    <span className="text-[10px] text-orange-800 font-black px-2 py-0.5 rounded bg-orange-100">
                      {selectedVoucher.coachTypeBn || 'লাক্সারি এসি স্লিপার কোচ (Scania Multi-Axle K410)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-lg border border-orange-200">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">রুট:</span>
                      <strong className="text-xs font-black text-[#0B1F3A] block truncate">
                        {selectedVoucher.busRouteBn || 'ঢাকা ➔ কক্সবাজার / সাজেক (সরাসরি)'}
                      </strong>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-orange-200">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">সিট নম্বর:</span>
                      <span className="text-sm font-black text-[#FF6B00] block">
                        {selectedVoucher.busSeats || 'A1, A2'}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-orange-200">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">বোর্ডিং পয়েন্ট:</span>
                      <strong className="text-xs font-bold text-slate-800 block truncate">
                        {selectedVoucher.boardingCounterBn || 'সায়েদাবাদ সেন্ট্রাল টার্মিনাল'}
                      </strong>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-orange-200">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">ছাড়ার সময়:</span>
                      <strong className="text-xs font-black text-emerald-700 block">
                        {selectedVoucher.departureTimeBn || 'রাত ১০:৩০ মিনিট'}
                      </strong>
                    </div>
                  </div>

                  {/* QR Code Bar */}
                  <div className="bg-white p-2.5 rounded-xl border border-orange-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {selectedVoucher.qrCodeUrl ? (
                        <img
                          src={selectedVoucher.qrCodeUrl}
                          alt="Voucher QR Code"
                          className="w-16 h-16 object-contain border border-slate-200 rounded p-0.5 bg-white shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center font-mono text-[9px] text-slate-400 shrink-0">
                          QR CODE
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] text-emerald-700 font-black block">
                          ✓ অফিশিয়াল ডিজিটাল QR ভেরিফাইড
                        </span>
                        <span className="font-mono text-xs font-black text-slate-900 block mt-0.5 tracking-wider">
                          * {selectedVoucher.pnr}-TKT *
                        </span>
                      </div>
                    </div>

                    <div className="font-mono text-[10px] bg-slate-900 text-white px-3 py-1.5 rounded-lg shrink-0">
                      GATE PASS # {selectedVoucher.pnr}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Bill Breakdown */}
              <div className="border-t-2 border-dashed border-slate-300 pt-3">
                <div className="space-y-1.5 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between font-medium">
                    <span>{locale === 'bn' ? 'প্যাকেজ মূল্য' : 'Base Package Fare'} ({formatBDT(selectedVoucher.pricePerPerson, locale)} × {selectedVoucher.travelersCount}):</span>
                    <span>{formatBDT(selectedVoucher.subtotal, locale)}</span>
                  </div>

                  {selectedVoucher.couponCode && (
                    <div className="flex justify-between font-bold text-emerald-600">
                      <span>🏷️ {locale === 'bn' ? 'প্রোমো ডিসকাউন্ট' : 'Promo Discount'} ({selectedVoucher.couponCode}):</span>
                      <span>-{formatBDT(selectedVoucher.discountAmount, locale)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-medium">
                    <span>{locale === 'bn' ? 'ট্যুরিজম সার্ভিস চার্জ' : 'Tourism Service Fee'}:</span>
                    <span>{formatBDT(selectedVoucher.serviceFee, locale)}</span>
                  </div>

                  <div className="flex justify-between font-black text-sm text-[#0B1F3A] pt-2 border-t border-slate-200">
                    <span>{locale === 'bn' ? 'সর্বমোট পরিশোধিত' : 'Grand Total Paid'}:</span>
                    <span className="text-[#FF6B00] text-base">{formatBDT(selectedVoucher.totalAmount, locale)}</span>
                  </div>
                </div>
              </div>

              {/* Barcode & Footer Instructions */}
              <div className="text-center pt-2 border-t border-slate-200">
                <p className="text-[10px] text-slate-500 font-medium">
                  {locale === 'bn'
                    ? 'যাত্রার দিন নির্ধারিত বাস কাউন্টারে এই ভাউচার বা ডিজিটাল কপি দেখিয়ে বোর্ডিং পাস গ্রহণ করুন। হেল্পলাইন: ০৯৬১১-২২৩৩৪৪'
                    : 'Please show this printed voucher or digital copy at the boarding counter on the journey date. Hotline: 09611-223344'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
