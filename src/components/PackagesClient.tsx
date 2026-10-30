'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  Bus,
  Tag,
  Users,
  X,
  CreditCard,
  ShieldCheck,
  Printer,
  QrCode,
  FileText,
  Percent,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Locale, formatBDT, formatDate } from '@/lib/i18n';
import { TourPackage, OfferItem } from '@/lib/siteConfig';
import { PackageBooking } from '@/lib/packageBookingsServer';

interface Props {
  initialPackages: TourPackage[];
  locale: Locale;
}

export default function PackagesClient({ initialPackages, locale }: Props) {
  const [packages, setPackages] = useState<TourPackage[]>(initialPackages);
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlCat = params.get('category');
      const validCats = ['ALL', 'BEACH', 'HILLS', 'FOREST'];
      if (urlCat && validCats.includes(urlCat)) {
        setActiveCategory(urlCat);
      } else {
        const storedCat = localStorage.getItem('bhabachyaka_packages_cat');
        if (storedCat && validCats.includes(storedCat)) {
          setActiveCategory(storedCat);
        }
      }
    } catch {}
  }, []);

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    try {
      localStorage.setItem('bhabachyaka_packages_cat', catId);
      const url = new URL(window.location.href);
      if (catId === 'ALL') {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', catId);
      }
      window.history.replaceState(null, '', url.toString());
    } catch {}
  };
  const [availableOffers, setAvailableOffers] = useState<OfferItem[]>([]);

  // Selected package for booking modal
  const [selectedPackage, setSelectedPackage] = useState<TourPackage | null>(null);

  // Form states
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [travelersCount, setTravelersCount] = useState('2');
  const [journeyDate, setJourneyDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<OfferItem | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'BKASH' | 'NAGAD' | 'CARD' | 'CASH'>('BKASH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Confirmed booking voucher
  const [confirmedBooking, setConfirmedBooking] = useState<PackageBooking | null>(null);

  useEffect(() => {
    fetch('/api/site-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          if (Array.isArray(data.config.packages) && data.config.packages.length > 0) {
            setPackages(data.config.packages);
          }
          if (Array.isArray(data.config.offers)) {
            setAvailableOffers(data.config.offers.filter((o: OfferItem) => o.isActive !== false));
          }
        }
      })
      .catch((err) => console.log('Using initial packages:', err));
  }, []);

  const categories = [
    { id: 'ALL', nameBn: 'সব প্যাকেজ', nameEn: 'All Packages' },
    { id: 'BEACH', nameBn: 'সমুদ্র সৈকত', nameEn: 'Beaches & Oceans' },
    { id: 'HILLS', nameBn: 'পাহাড় ও মেঘ', nameEn: 'Hills & Clouds' },
    { id: 'FOREST', nameBn: 'বন ও প্রকৃতি', nameEn: 'Nature & Rainforests' },
  ];

  const filteredPackages = packages.filter(
    (pkg) => activeCategory === 'ALL' || pkg.category === activeCategory
  );

  // Price calculations
  const count = Number(travelersCount) || 1;
  const subtotal = selectedPackage ? selectedPackage.price * count : 0;
  const serviceFee = 50 * count;
  const grandTotal = Math.max(0, subtotal - couponDiscount + serviceFee);

  // Apply Coupon Logic
  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    setCouponError('');
    setCouponSuccess('');

    if (!code) {
      setCouponError(locale === 'bn' ? 'কুপন কোড লিখুন।' : 'Enter a promo code.');
      return;
    }

    const offer = availableOffers.find((o) => o.code.toUpperCase() === code);
    if (!offer) {
      setCouponError(locale === 'bn' ? 'অকার্যকর প্রোমো কোড।' : 'Invalid promo code.');
      setAppliedCoupon(null);
      setCouponDiscount(0);
      return;
    }

    // Calculate discount based on code
    let discount = 100;
    if (offer.code === 'WELCOME100') {
      discount = 100;
    } else if (offer.code === 'BKASH20') {
      discount = Math.min(150, Math.round(subtotal * 0.2));
    } else if (offer.code === 'NAGAD15') {
      discount = Math.round(subtotal * 0.15);
    } else if (offer.code === 'ROUNDTRIP10') {
      discount = Math.round(subtotal * 0.1);
    } else if (offer.code === 'STUDENT50') {
      discount = 50 * count;
    } else if (offer.code === 'FAMILY4') {
      discount = count >= 4 ? 300 : 150;
    } else {
      discount = 100;
    }

    setAppliedCoupon(offer);
    setCouponDiscount(discount);
    setCouponInput(offer.code);
    setCouponSuccess(
      locale === 'bn'
        ? `✅ "${offer.code}" প্রোমো কোড সফলভাবে যুক্ত হয়েছে! (৳${discount} ছাড়)`
        : `✅ Promo code "${offer.code}" applied! (৳${discount} Off)`
    );
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponInput('');
    setCouponSuccess('');
    setCouponError('');
  };

  // Submit Package Booking & Payment
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;

    if (!passengerName.trim() || !passengerPhone.trim()) {
      setErrorMessage(locale === 'bn' ? 'আপনার নাম ও মোবাইল নম্বর পূরণ করুন।' : 'Please enter your name and phone number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        packageId: selectedPackage.id,
        packageTitleBn: selectedPackage.titleBn,
        packageTitleEn: selectedPackage.titleEn,
        category: selectedPackage.category,
        durationBn: selectedPackage.durationBn,
        durationEn: selectedPackage.durationEn,
        pricePerPerson: selectedPackage.price,
        travelersCount: count,
        journeyDate,
        customerName: passengerName.trim(),
        customerPhone: passengerPhone.trim(),
        customerEmail: passengerEmail.trim(),
        coachTypeBn: selectedPackage.coachTypeBn,
        coachTypeEn: selectedPackage.coachTypeEn,
        hotelBn: selectedPackage.hotelBn,
        hotelEn: selectedPackage.hotelEn,
        inclusionsBn: selectedPackage.inclusionsBn,
        inclusionsEn: selectedPackage.inclusionsEn,
        couponCode: appliedCoupon?.code,
        discountAmount: couponDiscount,
        paymentMethod,
      };

      const res = await fetch('/api/packages/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.booking) {
        setConfirmedBooking(data.booking);
      } else {
        setErrorMessage(data.error || 'Failed to complete package booking');
      }
    } catch {
      setErrorMessage('Network error while booking package');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBookingModal = () => {
    setSelectedPackage(null);
    setConfirmedBooking(null);
    setPassengerName('');
    setPassengerPhone('');
    setPassengerEmail('');
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponInput('');
    setErrorMessage('');
    setCouponSuccess('');
    setCouponError('');
  };

  const handlePrintVoucher = () => {
    const el = document.getElementById('printable-tour-voucher');
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
            <title>Bhabachyaka Tour Voucher & Bus Ticket - ${confirmedBooking?.pnr || 'VOUCHER'}</title>
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
              #printable-tour-voucher {
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
              #printable-tour-voucher * {
                visibility: visible !important;
              }
              .no-print {
                display: none !important;
              }
            </style>
          </head>
          <body>
            <div id="printable-tour-voucher" class="print-ticket-area printable-voucher">
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

  return (
    <div className="bg-[#F6F8FB] min-h-screen pb-16">
      {/* Hero Header */}
      <section className="relative bg-[#0B1F3A] text-white py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A] via-[#0E2648] to-[#153B63] opacity-95"></div>
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FFB020] text-xs font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-[#FF6B00]" />
            <span>{locale === 'bn' ? 'ভ্যাবাচ্যাকা হলিডেজ ও ট্যুর প্যাকেজ' : 'Bhabachyaka Holiday Packages'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {locale === 'bn' ? 'এক্সক্লুসিভ ট্যুর ও ভ্রমণ প্যাকেজসমূহ' : 'Curated Tour & Holiday Packages'}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            {locale === 'bn'
              ? 'লাক্সারি বাসের আরাম, প্রিমিয়াম হোটেল বুকিং ও দক্ষ গাইড সার্ভিসের সম্পূর্ণ আয়োজন। সাথে আকর্ষণীয় প্রোমো কোডে ডিসকাউন্ট উপভোগ করুন।'
              : 'Seamless all-inclusive holiday packages featuring round-trip luxury coaches, hand-picked boutique resorts, and instant promo code discounts.'}
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Category Pills */}
        <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs ${
                activeCategory === cat.id
                  ? 'bg-[#0B1F3A] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {locale === 'bn' ? cat.nameBn : cat.nameEn}
            </button>
          ))}
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Photo Header */}
                <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={pkg.image}
                    alt={pkg.titleEn}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    onError={(e: any) => {
                      e.target.src = '/images/destinations/coxs-bazar.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/90 via-[#0B1F3A]/30 to-transparent"></div>

                  <div className="absolute top-3.5 left-3.5">
                    <span className="px-3 py-1 rounded-full bg-[#0B1F3A]/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider border border-white/20">
                      {locale === 'bn' ? pkg.durationBn : pkg.durationEn}
                    </span>
                  </div>

                  <div className="absolute top-3.5 right-3.5">
                    <span className="px-3 py-1 rounded-full bg-[#FF6B00] text-white text-xs font-black shadow-md">
                      {formatBDT(pkg.price, locale)}
                      <span className="text-[10px] font-normal"> / {locale === 'bn' ? 'জন' : 'person'}</span>
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-lg font-black tracking-tight leading-snug">
                      {locale === 'bn' ? pkg.titleBn : pkg.titleEn}
                    </h3>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-5 space-y-4 text-xs">
                  {/* Highlights Strip */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] font-semibold text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Bus className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                      <span className="truncate">{locale === 'bn' ? pkg.coachTypeBn : pkg.coachTypeEn}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{locale === 'bn' ? pkg.hotelBn : pkg.hotelEn}</span>
                    </div>
                  </div>

                  {/* Inclusions List */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                      {locale === 'bn' ? 'প্যাকেজে যা যা থাকছে:' : 'Package Inclusions:'}
                    </span>
                    <ul className="space-y-1.5">
                      {(locale === 'bn' ? pkg.inclusionsBn : pkg.inclusionsEn).map((inc, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-600 font-medium leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Departure Schedule */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                    <span>{locale === 'bn' ? pkg.departuresBn : pkg.departuresEn}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPackage(pkg);
                    setConfirmedBooking(null);
                    setErrorMessage('');
                  }}
                  className="w-full py-3 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-orange-500/25"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{locale === 'bn' ? 'প্যাকেজটি বুক ও পেমেন্ট করুন' : 'Book & Pay Package'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* PACKAGE BOOKING & PAYMENT MODAL / OFFICIAL TICKET VOUCHER            */}
      {/* ==================================================================== */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-fade-in modal-backdrop-print">
          {/* Print CSS Injection */}
          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-tour-voucher,
              #printable-tour-voucher * {
                visibility: visible !important;
              }
              #printable-tour-voucher {
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
              .modal-backdrop-print {
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

          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-5 shadow-2xl border border-slate-200 relative my-6 max-h-[92vh] overflow-y-auto printable-modal-wrapper">
            {/* Close Button (Hidden in Print) */}
            <button
              onClick={resetBookingModal}
              className="no-print absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* IF CONFIRMED: SHOW OFFICIAL HOLIDAY TOUR TICKET & VOUCHER WITH INTEGRATED BUS TICKET & QR CODE */}
            {confirmedBooking ? (
              <div className="space-y-5 animate-fade-in text-slate-800">
                {/* Modal Top Success Banner (Hidden in Print) */}
                <div className="no-print text-center space-y-1.5 border-b border-slate-100 pb-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-1 shadow-inner">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] uppercase tracking-wider">
                    {locale === 'bn' ? '🎉 বুকিং ও পেমেন্ট সফলভাবে সম্পন্ন হয়েছে' : '🎉 Booking & Payment Confirmed'}
                  </span>
                  <h3 className="text-xl font-black text-[#0B1F3A]">
                    {locale === 'bn' ? 'অফিশিয়াল ট্যুর প্যাকেজ ভাউচার ও বাস টিকিট' : 'Official Holiday Voucher & Bus Boarding Pass'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {locale === 'bn'
                      ? 'নিচের ভাউচার ও বাস টিকিটটি সংরক্ষণ করুন অথবা এক ক্লিকেই প্রিন্ট করে নিন।'
                      : 'Please save or print your official travel voucher and intercity bus boarding pass below.'}
                  </p>
                </div>

                {/* THE OFFICIAL PRINTABLE TICKET & VOUCHER CONTAINER */}
                <div id="printable-tour-voucher" className="print-ticket-area printable-voucher bg-[#FCFBF8] rounded-2xl border-2 border-slate-800 p-5 sm:p-6 space-y-5 text-xs text-slate-800">
                  {/* Brand & PNR Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-slate-800 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0B1F3A] text-white flex items-center justify-center font-black text-xl shadow-sm shrink-0">
                        ভ
                      </div>
                      <div>
                        <h2 className="font-black text-base text-[#0B1F3A] tracking-tight leading-tight">
                          {locale === 'bn' ? 'ভ্যাবাচ্যাকা হলিডেজ ও পরিবহন এক্সপ্রেস' : 'BHABACHYAKA HOLIDAYS & TRANSPORT'}
                        </h2>
                        <span className="text-[10px] text-slate-500 font-bold block">
                          {locale === 'bn' ? 'সরকারি নিবন্ধিত আন্তঃজেলা লাক্সারি বাস ও ট্যুর অপারেটর' : 'Govt. Approved Luxury Coach & Tour Operator'}
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                        VOUCHER / PNR NO.
                      </span>
                      <strong className="font-mono text-xl sm:text-2xl font-black text-[#FF6B00] tracking-wider block">
                        {confirmedBooking.pnr}
                      </strong>
                      <span className="inline-block px-2 py-0.5 mt-0.5 rounded bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider">
                        ✓ {confirmedBooking.paymentStatus} • {confirmedBooking.paymentMethod}
                      </span>
                    </div>
                  </div>

                  {/* PART 1: HOLIDAY TOUR & HOTEL STAY VOUCHER */}
                  <div className="space-y-3">
                    <div className="bg-[#0B1F3A] text-white p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-black text-[#FFB020] uppercase tracking-wider block">
                          {confirmedBooking.category} HOLIDAY TOUR PACKAGE
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-white">
                          {confirmedBooking.packageTitleBn}
                        </h4>
                        <span className="text-[11px] text-slate-300 font-medium">
                          {confirmedBooking.durationBn}
                        </span>
                      </div>
                      <div className="sm:text-right bg-white/10 p-2 rounded-lg border border-white/10 shrink-0">
                        <span className="text-[9px] text-slate-300 uppercase block font-semibold">ভ্রমণের তারিখ:</span>
                        <strong className="text-xs font-black text-amber-300 block">{confirmedBooking.journeyDate}</strong>
                        <span className="text-[10px] text-slate-200">👥 {confirmedBooking.travelersCount} জন পর্যটক</span>
                      </div>
                    </div>

                    {/* Passenger & Hotel Stay Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] uppercase font-black text-slate-400 block">
                          প্রধান পর্যটক তথ্য (Lead Traveler)
                        </span>
                        <strong className="text-sm font-black text-slate-900 block">{confirmedBooking.customerName}</strong>
                        <span className="text-slate-600 font-bold block">📞 {confirmedBooking.customerPhone}</span>
                        {confirmedBooking.customerEmail && (
                          <span className="text-slate-500 text-[11px] block">✉️ {confirmedBooking.customerEmail}</span>
                        )}
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] uppercase font-black text-slate-400 block">
                          হোটেল ও রিসোর্ট আবাসন (Hotel Stay)
                        </span>
                        <strong className="text-xs font-black text-slate-900 block truncate">
                          🏨 {confirmedBooking.hotelBn || '৪-স্টার বিচসাইড হোটেল ও রিসোর্ট'}
                        </strong>
                        <span className="text-slate-600 text-[11px] block">
                          ✓ কমপ্লিমেন্টারি বুফে ব্রেকফাস্ট ও সাইটসিয়িং অন্তর্ভুক্ত
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          ট্রানজেকশন আইডি: {confirmedBooking.transactionId}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PART 2: 🚌 INTERCITY LUXURY BUS TICKET & BOARDING PASS */}
                  <div className="border-t-2 border-dashed border-slate-400 pt-4 relative">
                    {/* Perforated Scissor Icon Marker */}
                    <div className="absolute -top-3 left-4 bg-[#FCFBF8] px-2 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <span>✂️</span>
                      <span className="uppercase font-bold tracking-wider">আন্তঃজেলা এক্সপ্রেস বাস টিকিট ও বোর্ডিং পাস</span>
                    </div>

                    <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-3.5 space-y-3 mt-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-orange-200 gap-2">
                        <div className="flex items-center gap-2">
                          <Bus className="w-4 h-4 text-[#FF6B00]" />
                          <span className="font-black text-xs text-[#0B1F3A] uppercase tracking-wide">
                            {locale === 'bn' ? 'ভ্যাবাচ্যাকা এক্সপ্রেস — প্যাসেঞ্জার বোর্ডিং পাস' : 'PASSENGER BUS BOARDING PASS'}
                          </span>
                        </div>
                        <span className="text-[10px] text-orange-800 font-black px-2 py-0.5 rounded bg-orange-100">
                          {confirmedBooking.coachTypeBn || 'লাক্সারি এসি স্লিপার কোচ (Scania Multi-Axle K410)'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="bg-white p-2.5 rounded-lg border border-orange-200">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">যাত্রা রুট:</span>
                          <strong className="text-xs font-black text-[#0B1F3A] block truncate">
                            {confirmedBooking.busRouteBn || 'ঢাকা ➔ কক্সবাজার (সরাসরি বিরতিহীন)'}
                          </strong>
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-orange-200">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">বরাদ্দকৃত সিট নম্বর:</span>
                          <span className="text-base font-black text-[#FF6B00] block">
                            {confirmedBooking.busSeats || 'A1, A2'}
                          </span>
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-orange-200">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">বোর্ডিং টার্মিনাল:</span>
                          <strong className="text-xs font-bold text-slate-800 block truncate">
                            {confirmedBooking.boardingCounterBn || 'সায়েদাবাদ / আরামবাগ সেন্ট্রাল কাউন্টার'}
                          </strong>
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-orange-200">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">ছাড়ার সময়:</span>
                          <strong className="text-xs font-black text-emerald-700 block">
                            {confirmedBooking.departureTimeBn || 'রাত ১০:৩০ মিনিট'}
                          </strong>
                          <span className="text-[9px] text-slate-500 block">রিপোর্টিং: রাত ১০:০০</span>
                        </div>
                      </div>

                      {/* QR Code & Barcode Section */}
                      <div className="bg-white p-3 rounded-xl border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {confirmedBooking.qrCodeUrl ? (
                            <img
                              src={confirmedBooking.qrCodeUrl}
                              alt="Voucher QR Code"
                              className="w-20 h-20 sm:w-22 sm:h-22 object-contain border border-slate-200 rounded-lg p-1 bg-white shadow-xs shrink-0"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center font-mono text-[10px] text-slate-400 shrink-0">
                              QR CODE
                            </div>
                          )}

                          <div>
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>অফিশিয়াল ডিজিটাল QR ভেরিফাইড</span>
                            </span>
                            <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                              বাসে ওঠার সময় বা কাউন্টারে এই টিকিট বা ডিজিটাল QR কোড প্রদর্শন করে সিট নিশ্চিত করুন।
                            </p>
                            <span className="font-mono text-xs font-black text-slate-900 block mt-1 tracking-widest">
                              * {confirmedBooking.pnr}-TKT *
                            </span>
                          </div>
                        </div>

                        <div className="text-center sm:text-right shrink-0">
                          <div className="font-mono text-[10px] bg-slate-900 text-white px-3 py-1.5 rounded-lg">
                            GATE PASS # {confirmedBooking.pnr}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PART 3: PAYMENT & FINANCIAL STATEMENT */}
                  <div className="border-t border-slate-200 pt-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                      <div className="flex justify-between">
                        <span>প্যাকেজ ও বাস সাবটোটাল ({confirmedBooking.travelersCount} জন):</span>
                        <strong className="font-bold">{formatBDT(confirmedBooking.subtotal, locale)}</strong>
                      </div>

                      {confirmedBooking.discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>🏷️ কুপন ছাড় ({confirmedBooking.couponCode}):</span>
                          <span>- {formatBDT(confirmedBooking.discountAmount, locale)}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span>সার্ভিস ফি ও ট্রাভেল ইন্স্যুরেন্স:</span>
                        <strong className="font-bold">{formatBDT(confirmedBooking.serviceFee, locale)}</strong>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-black text-sm text-[#0B1F3A]">
                        <span>সর্বমোট পরিশোধিত অর্থ ({confirmedBooking.paymentMethod}):</span>
                        <span className="text-base text-[#FF6B00] font-black">{formatBDT(confirmedBooking.totalAmount, locale)}</span>
                      </div>
                    </div>
                  </div>

                  {/* PART 4: FOOTER NOTICE & 24/7 HELPLINE */}
                  <div className="border-t border-slate-200 pt-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500">
                    <p className="text-center sm:text-left">
                      <strong>জরুরী নির্দেশিকা:</strong> যাত্রার দিন নির্ধারিত ছাড়ার অন্তত ৩০ মিনিট পূর্বে বোর্ডিং কাউন্টারে উপস্থিত থাকুন।
                    </p>
                    <div className="font-bold text-[#0B1F3A] shrink-0 text-center sm:text-right">
                      📞 ২৪/৭ কাস্টমার সাপোর্ট: ০৯৬১২-৮৮৯৯০০
                    </div>
                  </div>
                </div>

                {/* MODAL BOTTOM ACTION BUTTONS (Hidden in Print) */}
                <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetBookingModal}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer text-center"
                  >
                    {locale === 'bn' ? 'বন্ধ করুন' : 'Close'}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintVoucher}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#FF6B00] text-white font-black text-xs shadow-lg hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-[#FFB020]" />
                    <span>{locale === 'bn' ? 'ট্যুর ও বাস টিকিট প্রিন্ট করুন' : 'Print Tour Ticket / Voucher'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* BOOKING & PAYMENT FORM */
              <form onSubmit={handleBookingSubmit} className="space-y-5 text-xs font-semibold">
                {/* Package Spotlight Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-black text-[#FF6B00] uppercase tracking-wider bg-orange-50 px-2.5 py-1 rounded-md">
                      {selectedPackage.category} • {selectedPackage.durationBn}
                    </span>
                    <h3 className="text-lg font-black text-[#0B1F3A] mt-2">
                      {selectedPackage.titleBn}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      জনপ্রতি মূল্য: <strong className="text-[#FF6B00] font-black">{formatBDT(selectedPackage.price, locale)}</strong>
                    </p>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Step 1: Traveler Details */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black uppercase text-[#0B1F3A] block">
                    ১. যাত্রীর তথ্য ও ভ্রমণের তারিখ (Traveler Details)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">আপনার পূর্ণ নাম *</label>
                      <input
                        type="text"
                        required
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        placeholder="যেমন: মোঃ আল আমিন"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">মোবাইল নম্বর *</label>
                      <input
                        type="tel"
                        required
                        value={passengerPhone}
                        onChange={(e) => setPassengerPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">ভ্রমণের তারিখ *</label>
                      <input
                        type="date"
                        required
                        value={journeyDate}
                        onChange={(e) => setJourneyDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">যাত্রী সংখ্যা *</label>
                      <select
                        value={travelersCount}
                        onChange={(e) => {
                          setTravelersCount(e.target.value);
                          if (appliedCoupon) {
                            setTimeout(() => handleApplyCoupon(appliedCoupon.code), 50);
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      >
                        <option value="1">১ জন (1 Person)</option>
                        <option value="2">২ জন (2 Persons)</option>
                        <option value="3">৩ জন (3 Persons)</option>
                        <option value="4">৪ জন (Family 4)</option>
                        <option value="5">৫ জন (Group 5)</option>
                        <option value="6">৬+ জন (Group 6+)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Step 2: Apply Promo Code / Coupon (User's Requirement) */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-[#0B1F3A] flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>২. প্রোমো কোড ও ডিসকাউন্ট অফার (Apply Promo Code)</span>
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="যেমন: WELCOME100 বা BKASH20"
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-black"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="px-4 py-2 bg-[#0B1F3A] hover:bg-[#FF6B00] text-white font-black rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      {locale === 'bn' ? 'প্রয়োগ করুন' : 'Apply'}
                    </button>
                    {appliedCoupon && (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-xl font-bold border border-red-200 cursor-pointer"
                      >
                        বাতিল
                      </button>
                    )}
                  </div>

                  {couponSuccess && (
                    <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg flex items-center gap-1.5 border border-emerald-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{couponSuccess}</span>
                    </div>
                  )}
                  {couponError && (
                    <div className="text-[11px] font-bold text-red-600 bg-red-50 p-2 rounded-lg flex items-center gap-1.5 border border-red-200">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      <span>{couponError}</span>
                    </div>
                  )}

                  {/* Quick available coupons picker */}
                  {availableOffers.length > 0 && !appliedCoupon && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold block">
                        💡 মেনুবারের অফারসমূহ থেকে এক ক্লিকে প্রোমো কোড বেছে নিন:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {availableOffers.slice(0, 4).map((offer) => (
                          <button
                            key={offer.id || offer.code}
                            type="button"
                            onClick={() => handleApplyCoupon(offer.code)}
                            className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#FF6B00] border border-orange-200 transition-all cursor-pointer"
                          >
                            🏷️ {offer.code} ({locale === 'bn' ? offer.badgeBn : offer.badgeEn})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 3: Payment Method Selector */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-black uppercase text-[#0B1F3A] block">
                    ৩. পেমেন্ট মাধ্যম নির্বাচন করুন (Payment Gateway)
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* bKash */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('BKASH')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'BKASH'
                          ? 'border-pink-600 bg-pink-50 text-pink-700 shadow-sm ring-2 ring-pink-500'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-md bg-pink-600 text-white font-black text-[10px] flex items-center justify-center mx-auto mb-1">
                        bK
                      </span>
                      <span className="font-bold text-xs block">বিকাশ (bKash)</span>
                    </button>

                    {/* Nagad */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('NAGAD')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'NAGAD'
                          ? 'border-[#FF6B00] bg-orange-50 text-[#FF6B00] shadow-sm ring-2 ring-orange-500'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-md bg-[#FF6B00] text-white font-black text-[10px] flex items-center justify-center mx-auto mb-1">
                        নগদ
                      </span>
                      <span className="font-bold text-xs block">নগদ (Nagad)</span>
                    </button>

                    {/* Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CARD')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'CARD'
                          ? 'border-blue-700 bg-blue-50 text-blue-700 shadow-sm ring-2 ring-blue-500'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1 text-blue-700" />
                      <span className="font-bold text-xs block">কার্ড / নেটব্যাংকিং</span>
                    </button>

                    {/* Cash Counter */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CASH')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'CASH'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm ring-2 ring-emerald-500'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <MapPin className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                      <span className="font-bold text-xs block">কাউন্টারে ক্যাশ</span>
                    </button>
                  </div>
                </div>

                {/* Price Breakdown Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between text-slate-600 text-xs">
                    <span>প্যাকেজ সাবটোটাল ({count} জন):</span>
                    <span className="font-bold">{formatBDT(subtotal, locale)}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 text-xs font-bold">
                      <span>প্রোমো কোড ছাড় ({appliedCoupon?.code}):</span>
                      <span>- {formatBDT(couponDiscount, locale)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600 text-xs">
                    <span>সার্ভিস ও গাইড চার্জ (৳৫০/জন):</span>
                    <span>{formatBDT(serviceFee, locale)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-black text-sm text-[#0B1F3A]">
                    <span>সর্বমোট পরিশোধের পরিমাণ:</span>
                    <span className="text-lg text-[#FF6B00]">{formatBDT(grandTotal, locale)}</span>
                  </div>
                </div>

                {/* Final Submit Button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetBookingModal}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                  >
                    {locale === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-[#16A34A] hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? (locale === 'bn' ? 'পেমেন্ট সম্পন্ন হচ্ছে...' : 'Processing...')
                        : (locale === 'bn' ? 'পেমেন্ট সম্পন্ন ও ভাউচার সংগ্রহ করুন' : 'Confirm & Generate Tour Ticket')}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
