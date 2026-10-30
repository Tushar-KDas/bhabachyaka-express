'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Lock,
  AlertCircle,
  ArrowLeft,
  Tag,
  Gift,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { getDictionary, Locale, formatBDT, formatTime, formatDate, toBengaliDigits } from '@/lib/i18n';
import type { OfferItem } from '@/lib/siteConfig';

interface Props {
  params: { locale: string };
}

export default function CheckoutPage({ params }: Props) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;
  const t = getDictionary(locale);
  const router = useRouter();

  const [bookingDraft, setBookingDraft] = useState<any>(null);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'BKASH' | 'NAGAD' | 'CARD' | 'CASH'>('BKASH');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');

  // Offers & Promo Code States
  const [availableOffers, setAvailableOffers] = useState<OfferItem[]>([]);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<OfferItem | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponError, setCouponError] = useState('');
  const [showOffersDropdown, setShowOffersDropdown] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('be_booking_draft');
    if (!raw) {
      router.push(`/${locale}/search`);
      return;
    }

    try {
      const draft = JSON.parse(raw);
      setBookingDraft(draft);

      // 1. Fetch trip details
      fetch(`/api/trips/${draft.tripId}`)
        .then((res) => res.json())
        .then((tData) => setTrip(tData))
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));

      // 2. Fetch live promotional offers from siteConfig
      fetch('/api/site-settings')
        .then((res) => res.json())
        .then((site) => {
          if (site?.offers && Array.isArray(site.offers)) {
            setAvailableOffers(site.offers.filter((o: OfferItem) => o.isActive !== false));
          }
        })
        .catch((e) => console.error('Failed to load offers:', e));
    } catch {
      router.push(`/${locale}/search`);
    }
  }, [locale, router]);

  const seatsCount = bookingDraft?.seatNumbers?.length || 1;
  const baseFarePerSeat = trip?.baseFare || 750;
  const baseTotal = seatsCount * baseFarePerSeat;
  const serviceTotal = seatsCount * (trip?.serviceFee || 50);
  const grandTotal = Math.max(0, baseTotal + serviceTotal - couponDiscount);
  const distanceKm = trip?.route?.distanceKm || trip?.distanceKm || 250;

  // Apply Coupon Logic
  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    setCouponError('');
    setCouponSuccess('');

    if (!code) {
      setCouponError(locale === 'bn' ? 'অনুগ্রহ করে কুপন কোড লিখুন।' : 'Please enter a coupon code.');
      return;
    }

    // Match code from site offers
    const found = availableOffers.find((o) => o.code.toUpperCase() === code);

    // Calculate discount amount
    let discount = 0;
    if (code === 'WELCOME100') {
      discount = 100;
    } else if (code === 'BKASH20') {
      discount = Math.min(150, Math.round(baseTotal * 0.20));
    } else if (code === 'NAGAD15') {
      discount = Math.min(120, Math.round(baseTotal * 0.15));
    } else if (code === 'ROUNDTRIP10') {
      discount = Math.min(200, Math.round(baseTotal * 0.10));
    } else if (code === 'STUDENT50') {
      discount = 50;
    } else if (code === 'FAMILY4') {
      discount = Math.min(300, Math.round(baseTotal * 0.10));
    } else if (found) {
      // Custom promo
      discount = 100;
    } else {
      setCouponError(
        locale === 'bn'
          ? `"${code}" কুপনটি পাওয়া যায়নি বা মেয়াদোত্তীর্ণ। মেন্যুবারের 'অফার' অপশন থেকে সক্রিয় কোড সংগ্রহ করুন।`
          : `Invalid coupon "${code}". Please check the Offers page for active promo codes.`
      );
      return;
    }

    setAppliedCoupon(found || {
      id: code,
      code,
      badgeBn: 'বিশেষ ছাড়',
      badgeEn: 'Special Offer',
      discountBn: `৳${discount} ছাড়`,
      discountEn: `৳${discount} Off`,
      descBn: 'অনলাইন টিকিট বুকিংয়ে বিশেষ ছাড়',
      descEn: 'Special discount on online booking',
      minSpendBn: 'প্রযোজ্য',
      minSpendEn: 'Valid',
      validityBn: 'সক্রিয়',
      validityEn: 'Active',
      color: 'from-orange-500 to-amber-500',
      isActive: true,
    });
    setCouponDiscount(discount);
    setCouponInput(code);
    setCouponSuccess(
      locale === 'bn'
        ? `অভিনন্দন! কুপন ${code} সফলভাবে প্রয়োগ হয়েছে। আপনি পেয়েছেন ${formatBDT(discount, locale)} ছাড়!`
        : `Success! Coupon ${code} applied. You saved ${formatBDT(discount, locale)}!`
    );
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponInput('');
    setCouponSuccess('');
    setCouponError('');
  };

  const handlePay = async () => {
    if (!agreeTerms) {
      setError(locale === 'bn' ? 'অনুগ্রহ করে শর্তাবলীতে সম্মতি জানান।' : 'Please agree to the Terms of Service.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        tripId: bookingDraft.tripId,
        seatNumbers: bookingDraft.seatNumbers,
        passengers: bookingDraft.passengers,
        customerName: bookingDraft.customerName,
        customerPhone: bookingDraft.customerPhone,
        customerEmail: bookingDraft.customerEmail,
        boardingStop: bookingDraft.boardingStop,
        droppingStop: bookingDraft.droppingStop,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        discountAmount: couponDiscount,
        paymentMethod,
        bookingChannel: 'ONLINE',
        holdToken: bookingDraft.holdToken,
      };

      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Payment or booking creation failed.');
        setSubmitting(false);
        return;
      }

      // Success! Clear draft and redirect to confirmation
      sessionStorage.removeItem('be_booking_draft');
      router.push(`/${locale}/booking/confirmation/${data.pnr}`);
    } catch (err) {
      console.error('Checkout error:', err);
      setError('An error occurred during payment processing.');
      setSubmitting(false);
    }
  };

  if (loading || !bookingDraft) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs font-semibold text-slate-500">Preparing payment checkout...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F8FB] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0B1F3A] mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{locale === 'bn' ? 'যাত্রীর তথ্যে ফিরে যান' : 'Back to Passenger Details'}</span>
          </button>
          <h1 className="text-2xl font-black text-[#0B1F3A]">{t.payment.title}</h1>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Payment Method Selector: 7 cols */}
          <div className="md:col-span-7 space-y-5">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-[#0B1F3A] uppercase tracking-wider pb-2 border-b border-slate-100">
                {t.payment.selectMethod}
              </h3>

              <div className="space-y-3">
                {/* bKash */}
                <label
                  onClick={() => setPaymentMethod('BKASH')}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'BKASH'
                      ? 'border-pink-600 bg-pink-50/50 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-pink-600 text-white font-black text-xs flex items-center justify-center">
                      bK
                    </span>
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">{t.payment.bkash}</span>
                      <span className="text-[11px] text-slate-500">
                        {locale === 'bn' ? 'ইনস্ট্যান্ট মোবাইল রিচার্জ ও ওয়ালেট' : 'Instant MFS Checkout'}
                      </span>
                    </div>
                  </div>
                  {paymentMethod === 'BKASH' && <CheckCircle2 className="w-5 h-5 text-pink-600" />}
                </label>

                {/* Nagad */}
                <label
                  onClick={() => setPaymentMethod('NAGAD')}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'NAGAD'
                      ? 'border-orange-600 bg-orange-50/50 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#FF6B00] text-white font-black text-xs flex items-center justify-center">
                      নগদ
                    </span>
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">{t.payment.nagad}</span>
                      <span className="text-[11px] text-slate-500">
                        {locale === 'bn' ? 'ডাক বিভাগের ডিজিটাল লেনদেন' : 'Post Office Digital Wallet'}
                      </span>
                    </div>
                  </div>
                  {paymentMethod === 'NAGAD' && <CheckCircle2 className="w-5 h-5 text-[#FF6B00]" />}
                </label>

                {/* Card / Banking */}
                <label
                  onClick={() => setPaymentMethod('CARD')}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'CARD'
                      ? 'border-blue-700 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">{t.payment.card}</span>
                      <span className="text-[11px] text-slate-500">VISA, Mastercard, Internet Banking</span>
                    </div>
                  </div>
                  {paymentMethod === 'CARD' && <CheckCircle2 className="w-5 h-5 text-blue-700" />}
                </label>
              </div>

              {/* Demo Mode Notice */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>{locale === 'bn' ? 'নিরাপদ গেটওয়ে:' : 'Sandbox Secure:'} </strong>
                  {t.payment.demoNotice}
                </p>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-[#FF6B00] rounded border-slate-300 focus:ring-[#FF6B00]"
              />
              <label htmlFor="terms" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                {t.payment.termsAgree}
              </label>
            </div>
          </div>

          {/* Right Summary & Coupon Box: 5 cols */}
          <div className="md:col-span-5 space-y-5">
            {/* 1. APPLY COUPON CODE SECTION (Connected to Offers CMS) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#FF6B00]" />
                  <span className="font-extrabold text-xs text-[#0B1F3A] uppercase tracking-wider">
                    {locale === 'bn' ? 'কুপন কোড প্রয়োগ করুন' : 'Apply Coupon Code'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowOffersDropdown(!showOffersDropdown)}
                  className="text-[11px] font-bold text-[#FF6B00] hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>{locale === 'bn' ? 'অফারসমূহ' : 'Offers'}</span>
                  {showOffersDropdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Coupon Input Box */}
              {!appliedCoupon ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={locale === 'bn' ? 'যেমন: WELCOME100, BKASH20' : 'e.g. WELCOME100, BKASH20'}
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    className="px-4 py-2 bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    {locale === 'bn' ? 'প্রয়োগ' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-black text-emerald-950 font-mono">{appliedCoupon.code}</span>
                      <span className="block text-[11px] text-emerald-700 font-semibold">
                        -{formatBDT(couponDiscount, locale)} {locale === 'bn' ? 'ছাড় যুক্ত হয়েছে' : 'discount applied'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-red-500 hover:text-red-700 font-bold text-xs cursor-pointer ml-2"
                  >
                    {locale === 'bn' ? 'বাতিল' : 'Remove'}
                  </button>
                </div>
              )}

              {/* Feedback Alerts */}
              {couponSuccess && (
                <p className="text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  {couponSuccess}
                </p>
              )}
              {couponError && (
                <p className="text-[11px] font-bold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                  {couponError}
                </p>
              )}

              {/* Quick Offer Pills / Carousel */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {locale === 'bn' ? '💡 অফার পেজ থেকে জনপ্রিয় কুপনসমূহ:' : '💡 Popular active coupons:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {availableOffers.slice(0, 4).map((offer) => (
                    <button
                      key={offer.id}
                      type="button"
                      onClick={() => handleApplyCoupon(offer.code)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-orange-50 hover:border-orange-300 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 hover:text-orange-900 transition-colors flex items-center gap-1 cursor-pointer font-mono"
                    >
                      <span>🏷️ {offer.code}</span>
                      <span className="text-[9px] text-emerald-600 font-sans">
                        ({locale === 'bn' ? offer.discountBn : offer.discountEn})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Expanded Offers Drawer */}
              {showOffersDropdown && (
                <div className="pt-2 border-t border-slate-100 space-y-2 animate-in fade-in">
                  <span className="text-[11px] font-extrabold text-[#0B1F3A] block">
                    {locale === 'bn' ? 'সকল সক্রিয় অফার তালিকা' : 'All Active Promo Offers'}
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {availableOffers.map((offer) => (
                      <div
                        key={offer.id}
                        onClick={() => handleApplyCoupon(offer.code)}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-orange-400 bg-slate-50/70 hover:bg-orange-50/50 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-xs text-[#FF6B00]">{offer.code}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 font-bold">
                              {locale === 'bn' ? offer.badgeBn : offer.badgeEn}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                            {locale === 'bn' ? offer.descBn : offer.descEn}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 whitespace-nowrap ml-2">
                          {locale === 'bn' ? offer.discountBn : offer.discountEn}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. ORDER SUMMARY CARD WITH MILEAGE-BASED BREAKDOWN */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-[#0B1F3A] uppercase tracking-wider pb-2 border-b border-slate-100">
                {t.payment.summary}
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    {locale === 'bn' ? 'যাত্রী' : 'Lead Passenger'}
                  </span>
                  <strong className="text-slate-900">{bookingDraft.customerName}</strong>
                  <span className="block text-slate-500">{bookingDraft.customerPhone}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    {locale === 'bn' ? 'রুট ও বাস' : 'Route & Bus'}
                  </span>
                  <strong className="text-slate-800">
                    {locale === 'bn' ? trip?.route?.nameBn : trip?.route?.name}
                  </strong>
                  <span className="block text-slate-500">
                    {trip?.bus?.model} ({trip?.bus?.isAc ? 'AC' : 'Non-AC'})
                  </span>
                </div>

                {/* Mileage Transparent Price Banner */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>{locale === 'bn' ? 'মহাসড়ক দূরত্ব হিসাব:' : 'Highway Mileage Rate:'}</span>
                    </span>
                    <span className="text-[#FF6B00] font-black">
                      {locale === 'bn' ? `${toBengaliDigits(distanceKm)} কি.মি. × ৩ টাকা` : `${distanceKm} km @ ৳3/km`}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {locale === 'bn'
                      ? 'বাংলাদেশ সড়ক ও জনপথ হাইওয়ে দূরত্ব অনুযায়ী প্রতি কিমি ৩ টাকা হারে নির্ধারিত।'
                      : 'Calculated at 3 BDT per kilometer based on national highway road distance.'}
                  </p>
                </div>

                {/* Financial Breakdown */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>{locale === 'bn' ? 'সিট নম্বর:' : 'Seat Numbers:'}</span>
                    <strong className="text-[#FF6B00] font-black">{bookingDraft.seatNumbers.join(', ')}</strong>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>
                      {locale === 'bn' ? 'সিট ভাড়া' : 'Base Fare'} ({seatsCount} × {formatBDT(baseFarePerSeat, locale)}):
                    </span>
                    <span className="font-bold text-slate-900">{formatBDT(baseTotal, locale)}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>
                      {locale === 'bn' ? 'সার্ভিস ফি' : 'Service Fee'} ({seatsCount} × ৳৫০):
                    </span>
                    <span className="font-bold text-slate-900">{formatBDT(serviceTotal, locale)}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>🏷️ {locale === 'bn' ? 'কুপন ছাড়' : 'Promo Discount'} ({appliedCoupon?.code}):</span>
                      <span>-{formatBDT(couponDiscount, locale)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 font-black text-sm text-[#0B1F3A]">
                    <span>{locale === 'bn' ? 'সর্বমোট পরিশোধ:' : 'Total Amount:'}</span>
                    <span className="text-xl text-[#FF6B00] font-black">{formatBDT(grandTotal, locale)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={handlePay}
                className="w-full py-4 bg-[#16A34A] hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{submitting ? (locale === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Processing...') : t.payment.confirmAndPay}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
