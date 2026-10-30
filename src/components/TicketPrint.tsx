'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Printer,
  ShieldCheck,
  FileText,
  User,
  Bus,
  Building,
} from 'lucide-react';
import { Locale, formatBDT, formatDate, formatTime } from '@/lib/i18n';
import { findDistrict } from '@/data/districts';

export interface TicketData {
  pnr?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  totalAmount?: number;
  discountAmount?: number;
  payableAmount?: number;
  status?: string;
  bookingChannel?: string;
  boardingStop?: string;
  droppingStop?: string;
  createdAt?: string | Date;
  operator?: {
    name?: string;
    nameBn?: string;
    contactPhone?: string;
  };
  trip?: {
    departureTime?: string | Date;
    driverName?: string;
    driverPhone?: string;
    route?: {
      name?: string;
      nameBn?: string;
      originCity?: string;
      destinationCity?: string;
    };
    bus?: {
      regNumber?: string;
      model?: string;
      coachType?: string;
      isAc?: boolean;
    };
  };
  passengers?: Array<{
    seatNumber: string;
    passengerName: string;
    fare: number;
  }>;
  tickets?: Array<{
    ticketNumber: string;
    seatNumber: string;
    qrCodeUrl?: string;
    verificationCode: string;
  }>;
  payments?: Array<{
    paymentMethod: string;
    transactionRef: string;
    status: string;
  }>;
  booking?: any;
}

interface Props {
  locale: Locale;
  data: TicketData;
}

export default function TicketPrint({ locale, data }: Props) {
  const [format, setFormat] = useState<'A4' | '80mm' | '58mm'>('A4');
  const [selectedCopy, setSelectedCopy] = useState<'ALL' | 'CUSTOMER' | 'SUPERVISOR' | 'COUNTER'>('ALL');

  const handlePrint = () => {
    window.print();
  };

  // Safe data extraction
  const b = data.booking || data;
  const pnr = b.pnr || data.pnr || 'BENCRRA8D';
  const customerName = b.customerName || data.customerName || 'Tushar Kumar Das';
  const customerPhone = b.customerPhone || data.customerPhone || '01575679377';
  const discountAmount = Number(b.discountAmount ?? data.discountAmount ?? 0);
  const totalAmount = Number(b.totalAmount ?? data.totalAmount ?? 1200);
  const payableAmount = Number(b.payableAmount ?? data.payableAmount ?? 1250);
  const serviceFee = 50 * (data.passengers?.length || 1);
  const originCityStr = data.trip?.route?.originCity || b.trip?.route?.originCity || 'Dhaka';
  const destCityStr = data.trip?.route?.destinationCity || b.trip?.route?.destinationCity || 'Chattogram';
  const originDistObj = findDistrict(originCityStr);
  const destDistObj = findDistrict(destCityStr);

  const boardingStop = b.boardingStop || data.boardingStop || originDistObj?.counterNameBn || 'সেন্ট্রাল বাস টার্মিনাল';
  const droppingStop = b.droppingStop || data.droppingStop || destDistObj?.counterNameBn || 'প্রধান বাস কাউন্টার';
  const createdAt = b.createdAt || data.createdAt || new Date();

  const trip = {
    departureTime: data.trip?.departureTime || new Date(Date.now() + 24 * 60 * 60 * 1000),
    driverName: data.trip?.driverName || 'মোঃ শফিকুল ইসলাম',
    driverPhone: data.trip?.driverPhone || '01811-001122',
    route: {
      name: data.trip?.route?.name || 'Dhaka to Chattogram',
      nameBn: data.trip?.route?.nameBn || 'ঢাকা - চট্টগ্রাম',
      originCity: data.trip?.route?.originCity || 'Dhaka',
      destinationCity: data.trip?.route?.destinationCity || 'Chattogram',
    },
    bus: {
      regNumber: data.trip?.bus?.regNumber || 'ঢাকা মেট্রো-ব ১৪-৮৮৯৯',
      model: data.trip?.bus?.model || 'Scania Multi-Axle K410',
      coachType: data.trip?.bus?.coachType || 'BUSINESS_CLASS',
      isAc: data.trip?.bus?.isAc ?? true,
    },
  };

  const passengers = data.passengers && data.passengers.length > 0
    ? data.passengers
    : [{ seatNumber: 'E1', passengerName: customerName, fare: totalAmount }];

  const tickets = data.tickets && data.tickets.length > 0
    ? data.tickets
    : [{ ticketNumber: 'TKT-01', seatNumber: 'E1', verificationCode: 'VER-E1-2034' }];

  const payments = data.payments && data.payments.length > 0
    ? data.payments
    : [{ paymentMethod: 'BKASH', transactionRef: 'TRX-BKASH-86780999', status: 'COMPLETED' }];

  const paymentMethod = payments[0]?.paymentMethod || 'BKASH';
  const trxRef = payments[0]?.transactionRef || 'TRX-BKASH-86780999';
  const qrCodeUrl = tickets[0]?.qrCodeUrl;
  const verificationCode = tickets[0]?.verificationCode || 'VER-E1-2034';
  const seatsList = passengers.map((p) => p.seatNumber).join(', ');
  const coachLabel = trip.bus.coachType.replace(/_/g, ' ') + (trip.bus.isAc ? ' (AC)' : ' (Non-AC)');

  return (
    <div className="space-y-6">
      {/* 1. TOP CONTROLS BAR (Hidden in print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Format selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {locale === 'bn' ? 'প্রিন্ট ফরম্যাট:' : 'Print Format:'}
            </span>
            <button
              type="button"
              onClick={() => setFormat('A4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                format === 'A4'
                  ? 'bg-[#0B1F3A] text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              A4 Voucher (৩ পেজ)
            </button>
            <button
              type="button"
              onClick={() => setFormat('80mm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                format === '80mm'
                  ? 'bg-[#0B1F3A] text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              80mm Thermal POS
            </button>
            <button
              type="button"
              onClick={() => setFormat('58mm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                format === '58mm'
                  ? 'bg-[#0B1F3A] text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              58mm Thermal Mini
            </button>
          </div>

          {/* Print button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>
              {locale === 'bn'
                ? selectedCopy === 'ALL'
                  ? '৩টি A4 পেজে ফুল সাইজ প্রিন্ট করুন (Print 3 A4 Pages)'
                  : '১টি A4 পেজ প্রিন্ট করুন'
                : selectedCopy === 'ALL'
                ? 'Print 3 A4 Pages (Full Size)'
                : 'Print 1 A4 Page'}
            </span>
          </button>
        </div>

        {/* Copy Selector */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {locale === 'bn' ? 'কপি নির্বাচন:' : 'Select Copy:'}
            </span>
            <button
              type="button"
              onClick={() => setSelectedCopy('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCopy === 'ALL'
                  ? 'bg-[#FF6B00] text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{locale === 'bn' ? '📑 ৩টি কপিই (৩টি A4 পাতায় ফুল সাইজ)' : '📑 All 3 Copies (3 A4 Pages)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCopy('CUSTOMER')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                selectedCopy === 'CUSTOMER'
                  ? 'bg-[#0B1F3A] text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{locale === 'bn' ? '১. কাস্টমার কপি' : '1. Customer Copy'}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCopy('SUPERVISOR')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                selectedCopy === 'SUPERVISOR'
                  ? 'bg-[#0B1F3A] text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>{locale === 'bn' ? '২. সুপারভাইজার কপি' : '2. Supervisor Copy'}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCopy('COUNTER')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                selectedCopy === 'COUNTER'
                  ? 'bg-[#0B1F3A] text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>{locale === 'bn' ? '৩. কাউন্টার কপি' : '3. Counter Copy'}</span>
            </button>
          </div>

          <div className="text-[11px] font-semibold text-slate-500">
            {selectedCopy === 'ALL' && (
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                ✓ {locale === 'bn' ? 'প্রতিটি কপি আলাদা আলাদা A4 পেজে সম্পূর্ণ ফুল সাইজে প্রিন্ট হবে' : 'Each copy prints in full size on its own A4 page'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. PRINT TICKET AREA */}
      <div className="print-ticket-area flex flex-col items-center justify-center space-y-8 print:space-y-0">
        {format === 'A4' ? (
          /* ==============================================================
             A4 FULL-SIZE FORMAT (EACH COPY PRINTS FULL SIZE ON A4 PAGE)
             ============================================================== */
          <div className="w-full max-w-3xl space-y-8 print:space-y-0">
            {/* ----------------- COPY 1: CUSTOMER COPY (A4 PAGE 1) ----------------- */}
            {(selectedCopy === 'ALL' || selectedCopy === 'CUSTOMER') && (
              <div className="a4-single-copy bg-white border border-slate-300 rounded-2xl p-7 shadow-sm print:border-none print:shadow-none print:p-0">
                {/* Top Bar */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-dashed border-slate-300">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full">
                    <User className="w-3.5 h-3.5" />
                    <span>1. CUSTOMER COPY (PASSENGER VOUCHER)</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    To be retained by passenger
                  </span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3.5 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
                      <Image
                        src="/brand/bhabachyaka-express-logo.png"
                        alt="Logo"
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h1 className="font-extrabold text-2xl text-[#0B1F3A] tracking-tight">
                        BHABACHYAKA EXPRESS
                      </h1>
                      <p className="text-xs text-slate-600 font-medium">
                        E-Ticket / Travel Voucher
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-black text-xs rounded-full border border-emerald-300 mb-1">
                      ✓ CONFIRMED & PAID
                    </span>
                    <div className="text-xs font-mono text-slate-600">
                      PNR: <strong className="text-slate-900 text-sm">{pnr}</strong>
                    </div>
                  </div>
                </div>

                {/* 2-Column Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pb-4 mb-4 border-b border-dashed border-slate-300">
                  {/* Left: 8 cols */}
                  <div className="md:col-span-8 space-y-3">
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">
                          PASSENGER NAME
                        </span>
                        <strong className="text-sm text-slate-900 block truncate">{customerName}</strong>
                        <span className="block text-slate-600">{customerPhone}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">
                          ASSIGNED SEAT(S)
                        </span>
                        <strong className="text-base text-[#FF6B00] font-black">{seatsList}</strong>
                        <span className="block text-slate-600 text-[11px] truncate">{coachLabel}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">
                          ROUTE
                        </span>
                        <strong className="text-sm text-slate-900 block truncate">{trip.route.name}</strong>
                        <span className="block text-slate-600">Bus Reg: {trip.bus.regNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">
                          DEPARTURE DATE & TIME
                        </span>
                        <strong className="text-sm text-slate-900 block">
                          {formatDate(trip.departureTime, 'en')}
                        </strong>
                        <span className="block text-emerald-700 font-bold">
                          {formatTime(trip.departureTime, 'en')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">
                          BOARDING POINT
                        </span>
                        <strong className="text-slate-800 block truncate">{boardingStop}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">
                          DROPPING POINT
                        </span>
                        <strong className="text-slate-800 block truncate">{droppingStop}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Right: 4 cols QR */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Code" className="w-28 h-28 object-contain shadow-sm mb-1.5" />
                    ) : (
                      <div className="w-28 h-28 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-400">
                        QR Code
                      </div>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono leading-none">{verificationCode}</span>
                    <span className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Officially Verified
                    </span>
                  </div>
                </div>

                {/* Financial Bar */}
                <div className="py-3 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div>
                      <span className="text-slate-500">Payment Method: </span>
                      <strong className="text-slate-900">{paymentMethod} ({trxRef})</strong>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Issued at: {formatDate(createdAt, 'en')}
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span className="text-slate-600 mr-3">Seat Fare: ৳ {totalAmount}</span>
                    <span className="text-slate-600 mr-3">Service Fee: ৳ {serviceFee}</span>
                    {discountAmount > 0 && (
                      <span className="text-emerald-700 font-bold mr-3">Coupon Discount: -৳ {discountAmount}</span>
                    )}
                    <span className="text-base font-extrabold text-[#0B1F3A]">
                      Total Paid: <span className="text-[#FF6B00]">৳ {payableAmount}</span>
                    </span>
                  </div>
                </div>

                {/* Footer Notice */}
                <div className="pt-3 text-[10px] text-slate-500 space-y-1">
                  <p className="leading-relaxed">
                    <strong>Notice:</strong> Please report to the boarding counter at least 20 minutes prior to departure. Smoking and carrying prohibited items are strictly forbidden.
                  </p>
                  <div className="flex justify-between items-center text-[9px] text-slate-400 pt-1">
                    <span>Helpline: 09612-889900</span>
                    <span>ভ্যাবাচ্যাকা এক্সপ্রেস — নিরাপদে পৌঁছে দেবে আপনার গন্তব্যে...</span>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- COPY 2: SUPERVISOR COPY (A4 PAGE 2) ----------------- */}
            {(selectedCopy === 'ALL' || selectedCopy === 'SUPERVISOR') && (
              <div className="a4-single-copy bg-white border border-indigo-200 rounded-2xl p-7 shadow-sm print:border-none print:shadow-none print:p-0">
                {/* Top Bar */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-dashed border-indigo-200">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-900 font-extrabold text-xs rounded-full">
                    <Bus className="w-3.5 h-3.5" />
                    <span>2. SUPERVISOR COPY (BUS GATE PASS)</span>
                  </div>
                  <span className="text-xs text-indigo-700 font-bold">
                    Hand over to bus conductor upon boarding
                  </span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-indigo-900 pb-3.5 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 p-1 flex items-center justify-center border border-indigo-200 shadow-sm shrink-0">
                      <Image
                        src="/brand/bhabachyaka-express-logo.png"
                        alt="Logo"
                        width={42}
                        height={42}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-xl text-[#0B1F3A] leading-tight">
                        BHABACHYAKA EXPRESS — SUPERVISOR COPY
                      </h2>
                      <p className="text-xs text-indigo-700 font-bold">
                        Passenger Boarding & Gate Pass
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-indigo-600 text-white font-black text-xs rounded-full shadow-sm mb-1">
                      GATE PASS
                    </span>
                    <div className="text-xs font-mono text-slate-600">
                      PNR: <strong className="text-slate-900 text-sm">{pnr}</strong>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pb-4 mb-4 border-b border-dashed border-slate-300">
                  {/* Left: 8 cols */}
                  <div className="md:col-span-8 space-y-3">
                    <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-orange-700 block">
                          PASSENGER NAME & PHONE
                        </span>
                        <strong className="text-sm text-slate-900 block truncate">{customerName}</strong>
                        <span className="text-xs text-slate-600">{customerPhone}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-orange-700 block">
                          ASSIGNED SEAT
                        </span>
                        <span className="text-2xl font-black text-[#FF6B00]">{seatsList}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-500 font-semibold block uppercase text-[10px]">
                          ROUTE & BUS
                        </span>
                        <strong className="text-slate-900 block truncate text-sm">{trip.route.name}</strong>
                        <span className="block text-slate-600">{trip.bus.regNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block uppercase text-[10px]">
                          DEPARTURE TIME
                        </span>
                        <strong className="text-slate-900 block text-sm">{formatDate(trip.departureTime, 'en')}</strong>
                        <span className="block text-indigo-700 font-bold">{formatTime(trip.departureTime, 'en')}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 font-semibold block uppercase text-[10px]">
                          BOARDING STOP
                        </span>
                        <strong className="text-slate-800 block truncate">{boardingStop}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block uppercase text-[10px]">
                          DROPPING STOP
                        </span>
                        <strong className="text-slate-800 block truncate">{droppingStop}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Right: 4 cols QR */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-indigo-50/50 rounded-xl border border-indigo-200 text-center">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Code" className="w-28 h-28 object-contain shadow-sm mb-1.5" />
                    ) : (
                      <div className="w-28 h-28 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-400">
                        QR Code
                      </div>
                    )}
                    <span className="text-[10px] text-slate-600 font-mono leading-none">{verificationCode}</span>
                    <span className="text-[10px] text-indigo-800 font-bold mt-1">
                      Gate Check-in Scan Code
                    </span>
                  </div>
                </div>

                {/* Actions & Signatures */}
                <div className="pt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs items-center">
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <input type="checkbox" className="w-4 h-4 rounded text-indigo-600" />
                    <span className="font-bold text-slate-700">Passenger Boarded</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] block font-semibold">
                      Luggage Token No:
                    </span>
                    <span className="font-mono text-slate-800 font-bold">____________________</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] block font-semibold">
                      Supervisor Signature:
                    </span>
                    <span className="font-mono text-slate-800 font-bold">____________________</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 text-[9px] text-slate-400 flex justify-between">
                  <span>* এই কপিটি বাস সুপারভাইজার যাত্রী ওঠার সময় সংগ্রহ করবেন এবং ট্রিপ শেষে টার্মিনালে জমা দেবেন।</span>
                  <span>Hotline: 09612-889900</span>
                </div>
              </div>
            )}

            {/* ----------------- COPY 3: COUNTER COPY (A4 PAGE 3) ----------------- */}
            {(selectedCopy === 'ALL' || selectedCopy === 'COUNTER') && (
              <div className="a4-single-copy bg-white border border-amber-300 rounded-2xl p-7 shadow-sm print:border-none print:shadow-none print:p-0">
                {/* Top Bar */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-dashed border-amber-300">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 font-extrabold text-xs rounded-full">
                    <Building className="w-3.5 h-3.5" />
                    <span>3. COUNTER & ACCOUNTS COPY (OFFICE RECORD)</span>
                  </div>
                  <span className="text-xs text-amber-800 font-bold">
                    For counter audit & cash settlement
                  </span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-amber-900 pb-3.5 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 p-1 flex items-center justify-center border border-amber-200 shadow-sm shrink-0">
                      <Image
                        src="/brand/bhabachyaka-express-logo.png"
                        alt="Logo"
                        width={42}
                        height={42}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-xl text-[#0B1F3A] leading-tight">
                        BHABACHYAKA EXPRESS — COUNTER COPY
                      </h2>
                      <p className="text-xs text-amber-800 font-bold">
                        Daily Cash & Audit Settlement Slip
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-amber-600 text-white font-black text-xs rounded-full shadow-sm mb-1">
                      OFFICE RECORD
                    </span>
                    <div className="text-xs font-mono text-slate-600">
                      PNR: <strong className="text-slate-900 text-sm">{pnr}</strong>
                    </div>
                  </div>
                </div>

                {/* Audit Grid (2 Columns) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-3.5 mb-3.5 border-b border-dashed border-slate-300 text-xs">
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Passenger:</span>
                      <strong className="text-slate-900">{customerName} ({customerPhone})</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Seat(s):</span>
                      <strong className="text-[#FF6B00] font-black text-sm">{seatsList}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Route & Bus:</span>
                      <span className="text-slate-800 truncate">{trip.route.name} ({trip.bus.regNumber})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Departure:</span>
                      <span className="text-slate-800">{formatDate(trip.departureTime, 'en')} {formatTime(trip.departureTime, 'en')}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 bg-amber-50/50 p-3 rounded-xl border border-amber-200">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-semibold">Counter:</span>
                      <strong className="text-slate-900 truncate">{boardingStop}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-semibold">Issued At:</span>
                      <span className="text-slate-800">{formatDate(createdAt, 'en')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-semibold">Payment Method:</span>
                      <strong className="text-emerald-700">{paymentMethod} ({trxRef})</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-semibold">Ver Code:</span>
                      <span className="font-mono text-slate-800">{verificationCode}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Audit Summary */}
                <div className="py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-600 mr-4">Base Fare: ৳ {totalAmount}</span>
                    <span className="text-slate-600 mr-4">Counter Fee: ৳ {serviceFee}</span>
                    {discountAmount > 0 && (
                      <span className="text-emerald-700 font-bold">Discount: -৳ {discountAmount}</span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 uppercase font-bold mr-2">
                      TOTAL CASH COLLECTED:
                    </span>
                    <span className="text-lg font-black text-[#0B1F3A]">৳ {payableAmount}</span>
                  </div>
                </div>

                {/* Signatures & Stamps */}
                <div>
                  <div className="pt-3 grid grid-cols-2 gap-8 text-xs">
                    <div className="border-t border-slate-400 pt-1 text-center text-slate-600">
                      <span className="font-bold">Counter Cashier Signature</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">মোঃ রায়াত খান (আরামবাগ কাউন্টার)</span>
                    </div>
                    <div className="border-t border-slate-400 pt-1 text-center text-slate-600">
                      <span className="font-bold">Counter Stamp & Audit</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">ভ্যাবাচ্যাকা এক্সপ্রেস কাউন্টার</span>
                    </div>
                  </div>

                  <div className="pt-3 text-[9px] text-slate-400 text-center">
                    * এই কপিটি কাউন্টার ক্যাশিয়ার দৈনিক ক্যাশ রেজিস্টার ও শিফট সেটেলমেন্টের জন্য সংরক্ষণ করবেন।
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ==============================================================
             THERMAL POS FORMAT (80mm & 58mm)
             ============================================================== */
          <div
            className={`bg-white p-4 border border-dashed border-slate-400 font-mono text-slate-900 text-xs shadow-sm print:border-none print:shadow-none space-y-6 ${
              format === '58mm' ? 'w-[58mm] max-w-[240px] text-[11px]' : 'w-[80mm] max-w-[320px]'
            }`}
          >
            {/* THERMAL COPY 1: CUSTOMER */}
            {(selectedCopy === 'ALL' || selectedCopy === 'CUSTOMER') && (
              <div className="space-y-2">
                <div className="text-center pb-2 border-b border-dashed border-slate-400 space-y-1">
                  <div className="font-extrabold text-sm uppercase">BHABACHYAKA EXPRESS</div>
                  <div className="text-[10px]">ভ্যাবাচ্যাকা এক্সপ্রেস</div>
                  <div className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold inline-block rounded">
                    [ 1. CUSTOMER COPY / যাত্রী কপি ]
                  </div>
                  <div className="text-[9px]">Hotline: 09612-889900</div>
                </div>

                <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>PNR:</span>
                    <strong className="text-xs">{pnr}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>PASSENGER:</span>
                    <strong>{customerName.slice(0, 16)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>PHONE:</span>
                    <span>{customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SEAT(S):</span>
                    <strong className="text-sm font-black">{seatsList}</strong>
                  </div>
                </div>

                <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[10px]">
                  <div><strong>ROUTE:</strong> {trip.route.originCity} - {trip.route.destinationCity}</div>
                  <div><strong>DATE:</strong> {formatDate(trip.departureTime, 'en')}</div>
                  <div><strong>TIME:</strong> {formatTime(trip.departureTime, 'en')}</div>
                  <div><strong>BOARDING:</strong> {boardingStop}</div>
                  <div><strong>BUS REG:</strong> {trip.bus.regNumber}</div>
                </div>

                <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                  <div className="flex justify-between"><span>FARE:</span><span>৳ {totalAmount}</span></div>
                  <div className="flex justify-between"><span>FEE:</span><span>৳ {serviceFee}</span></div>
                  <div className="flex justify-between font-black text-sm">
                    <span>TOTAL:</span><span>৳ {payableAmount}</span>
                  </div>
                  <div className="text-[9px] text-right">PAID VIA {paymentMethod}</div>
                </div>

                {qrCodeUrl && (
                  <div className="py-2 flex flex-col items-center justify-center">
                    <img src={qrCodeUrl} alt="QR" className="w-24 h-24 object-contain" />
                    <span className="text-[9px] mt-1">{verificationCode}</span>
                  </div>
                )}

                <div className="text-center pt-1 text-[9px] text-slate-500">
                  <div>*** SAFE JOURNEY ***</div>
                  <div>Arrive 20 mins prior.</div>
                </div>
              </div>
            )}

            {/* CUT LINE 1 */}
            {selectedCopy === 'ALL' && (
              <div className="text-center py-2 border-t-2 border-b-2 border-dashed border-slate-600 text-[10px] font-bold">
                ✂ - - - CUT HERE (কাস্টমার কপি) - - - ✂
              </div>
            )}

            {/* THERMAL COPY 2: SUPERVISOR */}
            {(selectedCopy === 'ALL' || selectedCopy === 'SUPERVISOR') && (
              <div className="space-y-2 pt-2">
                <div className="text-center pb-2 border-b border-dashed border-slate-400 space-y-1">
                  <div className="font-extrabold text-sm uppercase">BHABACHYAKA EXPRESS</div>
                  <div className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold inline-block rounded">
                    [ 2. SUPERVISOR COPY / বাস গেট পাস ]
                  </div>
                </div>

                <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                  <div className="flex justify-between font-black text-sm">
                    <span>SEAT(S):</span>
                    <span className="text-base">{seatsList}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PNR:</span>
                    <strong>{pnr}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>NAME:</span>
                    <span>{customerName.slice(0, 16)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PHONE:</span>
                    <span>{customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ROUTE:</span>
                    <span>{trip.route.originCity}-{trip.route.destinationCity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TIME:</span>
                    <span>{formatTime(trip.departureTime, 'en')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BOARDING:</span>
                    <span>{boardingStop}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BUS:</span>
                    <span>{trip.bus.regNumber}</span>
                  </div>
                </div>

                {qrCodeUrl && (
                  <div className="py-1 flex flex-col items-center justify-center">
                    <img src={qrCodeUrl} alt="QR" className="w-20 h-20 object-contain" />
                    <span className="text-[9px] mt-0.5">{verificationCode}</span>
                  </div>
                )}

                <div className="pt-2 text-[10px] space-y-1">
                  <div>[ ] Passenger Boarded</div>
                  <div>Luggage Tag: ________________</div>
                  <div>Supervisor Sign: ____________</div>
                </div>
              </div>
            )}

            {/* CUT LINE 2 */}
            {selectedCopy === 'ALL' && (
              <div className="text-center py-2 border-t-2 border-b-2 border-dashed border-slate-600 text-[10px] font-bold">
                ✂ - - - CUT HERE (সুপারভাইজার কপি) - - - ✂
              </div>
            )}

            {/* THERMAL COPY 3: COUNTER */}
            {(selectedCopy === 'ALL' || selectedCopy === 'COUNTER') && (
              <div className="space-y-2 pt-2">
                <div className="text-center pb-2 border-b border-dashed border-slate-400 space-y-1">
                  <div className="font-extrabold text-sm uppercase">BHABACHYAKA EXPRESS</div>
                  <div className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold inline-block rounded">
                    [ 3. COUNTER COPY / অফিস রেকর্ড ]
                  </div>
                </div>

                <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>PNR:</span>
                    <strong className="text-xs">{pnr}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>SEAT:</span>
                    <strong>{seatsList}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>PASSENGER:</span>
                    <span>{customerName.slice(0, 16)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DATE/TIME:</span>
                    <span>{formatDate(trip.departureTime, 'en')} {formatTime(trip.departureTime, 'en')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ROUTE:</span>
                    <span>{trip.route.originCity}-{trip.route.destinationCity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PAY METHOD:</span>
                    <span>{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm">
                    <span>COLLECTED:</span>
                    <span>৳ {payableAmount}</span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] space-y-2">
                  <div>Cashier: ____________________</div>
                  <div>Seal: _______________________</div>
                  <div className="text-center text-[9px] text-slate-500">*** END OF 3-COPY RECEIPT ***</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
