import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Clock,
  Bus,
  CheckCircle2,
  Award,
  Zap,
  MapPin,
  ChevronRight,
  Headphones,
  CalendarCheck,
  CreditCard,
  QrCode,
  Lock,
  Compass,
  ArrowRight,
  Sparkles,
  Check,
} from 'lucide-react';
import HeroBookingForm from '@/components/HeroBookingForm';
import DistrictsExplorer from '@/components/DistrictsExplorer';
import { getDictionary, Locale, formatBDT } from '@/lib/i18n';
import { getSiteConfig } from '@/lib/siteConfigServer';

interface Props {
  params: { locale: string };
}

export default function HomePage({ params }: Props) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;
  const t = getDictionary(locale);
  const siteConfig = getSiteConfig();

  // 5 Popular Routes (Matches Reference UI exactly)
  const popularRoutes = [
    {
      origin: 'Dhaka',
      destination: 'Chattogram',
      nameBn: 'ঢাকা ➔ চট্টগ্রাম',
      nameEn: 'Dhaka ➔ Chattogram',
      countersBn: 'গাবতলী / সায়েদাবাদ',
      countersEn: 'Gabtoli / Sayedabad',
      fare: 1200,
      image: '/images/destinations/dhaka-highway.jpg',
    },
    {
      origin: 'Dhaka',
      destination: "Cox's Bazar",
      nameBn: 'ঢাকা ➔ কক্সবাজার',
      nameEn: "Dhaka ➔ Cox's Bazar",
      countersBn: 'মেরিন ড্রাইভ এক্সপ্রেস',
      countersEn: 'Marine Drive Express',
      fare: 1500,
      image: '/images/destinations/coxs-bazar.jpg',
    },
    {
      origin: 'Dhaka',
      destination: 'Sylhet',
      nameBn: 'ঢাকা ➔ সিলেট',
      nameEn: 'Dhaka ➔ Sylhet',
      countersBn: 'চা বাগান হাইওয়ে',
      countersEn: 'Tea Gardens Route',
      fare: 800,
      image: '/images/destinations/sylhet.jpg',
    },
    {
      origin: 'Chattogram',
      destination: "Cox's Bazar",
      nameBn: 'চট্টগ্রাম ➔ কক্সবাজার',
      nameEn: "Chattogram ➔ Cox's Bazar",
      countersBn: 'দামপাড়া কাউন্টার',
      countersEn: 'Dampara Counter',
      fare: 500,
      image: '/images/destinations/coxs-bazar.jpg',
    },
    {
      origin: 'Dhaka',
      destination: 'Rajshahi',
      nameBn: 'ঢাকা ➔ রাজশাহী',
      nameEn: 'Dhaka ➔ Rajshahi',
      countersBn: 'মহাখালী / কল্যাণপুর',
      countersEn: 'Mohakhali / Kalyanpur',
      fare: 750,
      image: '/images/destinations/dhaka-highway.jpg',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F8FB]">
      {/* ==============================================================
          1. HERO SECTION (Cinematic Bus Highway Background + Centered Headline + Floating Form)
          ============================================================== */}
      <section className="relative text-white pt-16 pb-24 overflow-hidden flex flex-col justify-center">
        {/* Full Bleed Bus Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={siteConfig.hero.backgroundImageUrl || '/images/hero/hero-bus.jpg'}
            alt="Bhabachyaka Express Luxury Highway Coach"
            fill
            priority
            quality={95}
            className="object-cover object-center transform scale-105"
          />
          {/* Cinematic Navy Gradients for Perfect Legibility & High Contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1F3A]/90 via-[#0B1F3A]/80 to-[#0B1F3A]"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A]/95 via-[#0B1F3A]/60 to-[#0B1F3A]/95"></div>
          {/* Subtle Warm Amber Glow in corner */}
          <div className="absolute -top-24 right-1/4 w-96 h-96 bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
          {/* Centered Brand Headline & Tagline */}
          <div className="text-center max-w-3xl mx-auto space-y-3.5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FFB020] text-xs font-bold shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse"></span>
              <span>
                {locale === 'bn' ? siteConfig.hero.badgeTextBn : siteConfig.hero.badgeTextEn}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-lg">
              {locale === 'bn' ? (
                <>
                  {siteConfig.hero.headlineBn}{' '}
                  <span className="text-[#FFB020]">{siteConfig.hero.headlineHighlightBn}</span>
                </>
              ) : (
                <>
                  {siteConfig.hero.headlineEn}{' '}
                  <span className="text-[#FFB020]">{siteConfig.hero.headlineHighlightEn}</span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow">
              {locale === 'bn' ? siteConfig.hero.subheadlineBn : siteConfig.hero.subheadlineEn}
            </p>

            <div className="text-xs sm:text-sm font-extrabold text-[#FFB020] tracking-widest uppercase">
              {locale === 'bn' ? siteConfig.hero.taglineBn : siteConfig.hero.taglineEn}
            </div>
          </div>

          {/* Floating Search Form Card (Overlaps cleanly with reference styling) */}
          <div className="max-w-6xl mx-auto">
            <HeroBookingForm locale={locale} />
          </div>
        </div>
      </section>

      {/* ==============================================================
          2. TRUST BADGES STRIP (Matches 4 White Cards in Reference UI)
          ============================================================== */}
      <section className="py-6 -mt-8 relative z-30 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#0B1F3A]">
                {locale === 'bn' ? 'নিরাপদ ভ্রমণ' : 'Safe Travel'}
              </h3>
              <p className="text-[10px] text-slate-500">
                {locale === 'bn' ? 'বায়োমেট্রিক ও ভেরিফাইড চালক' : 'Verified drivers & fleet'}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#0B1F3A]">
                {locale === 'bn' ? 'সময়মত যাত্রা' : 'Punctual Trip'}
              </h3>
              <p className="text-[10px] text-slate-500">
                {locale === 'bn' ? 'গ্যারান্টিড অন-টাইম ট্রিপ' : 'Guaranteed departure'}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Bus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#0B1F3A]">
                {locale === 'bn' ? 'আধুনিক বাস' : 'Modern Fleet'}
              </h3>
              <p className="text-[10px] text-slate-500">
                {locale === 'bn' ? 'মাল্টি-এক্সেল ও এসি সুবিধা' : 'Multi-axle & AC comfort'}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#0B1F3A]">
                {locale === 'bn' ? 'সাশ্রয়ী ভাড়া' : 'Affordable Fare'}
              </h3>
              <p className="text-[10px] text-slate-500">
                {locale === 'bn' ? 'আকর্ষণীয় অফার ও ক্যাশব্যাক' : 'Best rate guarantee'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================
          3. POPULAR ROUTES (Matches Reference UI: 5 Scenic Destination Cards)
          ============================================================== */}
      <section id="routes" className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-[#0B1F3A] tracking-tight">
              {locale === 'bn' ? 'জনপ্রিয় রুটসমূহ' : 'Popular Routes'}
            </h2>
            <Link
              href={`/${locale}/search`}
              className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
            >
              <span>{locale === 'bn' ? 'সব রুট দেখুন' : 'View All'}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {popularRoutes.map((route, idx) => (
              <Link
                key={idx}
                href={`/${locale}/search?origin=${encodeURIComponent(route.origin)}&destination=${encodeURIComponent(route.destination)}`}
                className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                <div className="relative h-28 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={route.image}
                    alt={route.nameEn}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[#0B1F3A]/85 backdrop-blur-sm text-white text-[10px] font-bold rounded">
                    ৳ {route.fare}
                  </div>
                </div>

                <div className="p-3 space-y-1">
                  <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-[#FF6B00] transition-colors leading-tight">
                    {locale === 'bn' ? route.nameBn : route.nameEn}
                  </h3>
                  <p className="text-[10px] text-slate-500 truncate">
                    {locale === 'bn' ? route.countersBn : route.countersEn}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==============================================================
          3.5. 64 DISTRICTS DIRECT ROUTE SERVICE EXPLORER
          ============================================================== */}
      <DistrictsExplorer locale={locale} />

      {/* ==============================================================
          4. OUR SERVICES & WHY CHOOSE US (Matches Reference 2 Left Cards + 1 Right Box)
          ============================================================== */}
      <section id="services" className="py-10 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 2 Service Cards (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-xl font-black text-[#0B1F3A] tracking-tight">
                {locale === 'bn' ? 'আমাদের সেবাসমূহ' : 'Our Services'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Service 1: AC Bus Service */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-52 group">
                  <Image
                    src="/images/buses/luxury-fleet.jpg"
                    alt="AC Bus Service"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/90 via-[#0B1F3A]/40 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="px-2.5 py-0.5 bg-[#FF6B00] text-white text-[10px] font-extrabold rounded-md w-max mb-1">
                      {locale === 'bn' ? 'AC বাস সার্ভিস' : 'AC Bus Service'}
                    </span>
                    <h3 className="font-black text-sm text-white">
                      {locale === 'bn' ? 'অত্যন্ত আরামদায়ক ভ্রমণ' : 'Ultra Comfortable Travel'}
                    </h3>
                    <p className="text-[11px] text-slate-200">
                      {locale === 'bn' ? 'মাল্টি-এক্সেল স্ক্যানিয়া ও হুন্দাই লাক্সারি কোচ' : 'Scania Multi-Axle & Luxury Coaches'}
                    </p>
                  </div>
                </div>

                {/* Service 2: Non-AC Bus Service */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-52 group">
                  <Image
                    src="/images/hero/hero-bus.jpg"
                    alt="Non-AC Bus Service"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/90 via-[#0B1F3A]/40 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="px-2.5 py-0.5 bg-blue-600 text-white text-[10px] font-extrabold rounded-md w-max mb-1">
                      {locale === 'bn' ? 'নন-AC বাস সার্ভিস' : 'Non-AC Bus Service'}
                    </span>
                    <h3 className="font-black text-sm text-white">
                      {locale === 'bn' ? 'সাশ্রয়ী এবং নিরাপদ' : 'Affordable & Safe'}
                    </h3>
                    <p className="text-[11px] text-slate-200">
                      {locale === 'bn' ? 'নিয়মিত সময়ে সঠিক পৌঁছানোর নিশ্চয়তা' : 'Guaranteed punctual scheduled trips'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Why Choose Us (4 cols) */}
            <div className="lg:col-span-4 bg-[#F6F8FB] border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-base font-black text-[#0B1F3A]">
                  {locale === 'bn' ? 'কেন ভ্যাবাচ্যাকা এক্সপ্রেস?' : 'Why Choose Bhabachyaka Express?'}
                </h3>

                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{locale === 'bn' ? 'আরামদায়ক সিটিং ও ২৪/৭ এসি সুবিধা' : 'Comfortable seating & 24/7 climate control'}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{locale === 'bn' ? 'সময়ের সঠিক হিসাব ও নিরাপদ যাত্রা' : 'Strict punctuality & verified drivers'}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{locale === 'bn' ? 'অনলাইনে দ্রুত টিকিট বুকিং' : 'Instant hassle-free online reservation'}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{locale === 'bn' ? '২৪/৭ কাস্টমার সাপোর্ট' : 'Round-the-clock dedicated customer care'}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-5">
                <Link
                  href={`/${locale}/search`}
                  className="w-full py-2.5 px-4 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold rounded-xl shadow-md transition-all text-center block cursor-pointer"
                >
                  {locale === 'bn' ? 'আমাদের সেবাগুলো দেখুন' : 'View All Bus Services'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================
          5. HOW TO BOOK SECTION (Matches Reference 5 Connected Circles)
          ============================================================== */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-[#0B1F3A]">
              {locale === 'bn' ? 'কীভাবে বুক করবেন?' : 'How to Book?'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {locale === 'bn' ? 'সহজ ৫টি ধাপে আপনার টিকিট নিশ্চিত করুন' : 'Confirm your bus tickets in 5 simple steps'}
            </p>
          </div>

          <div className="relative">
            {/* Horizontal Line connecting steps on desktop */}
            <div className="hidden md:block absolute top-1/2 left-10 right-10 h-0.5 bg-blue-100 -translate-y-4 z-0"></div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 relative z-10">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#153B63] text-white font-black text-sm flex items-center justify-center mx-auto shadow-md border-4 border-white">
                  ১
                </div>
                <h4 className="text-xs font-bold text-[#0B1F3A]">
                  {locale === 'bn' ? 'রুট ও তারিখ নির্বাচন' : 'Choose Route'}
                </h4>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#153B63] text-white font-black text-sm flex items-center justify-center mx-auto shadow-md border-4 border-white">
                  ২
                </div>
                <h4 className="text-xs font-bold text-[#0B1F3A]">
                  {locale === 'bn' ? 'বাস ও আসন নির্বাচন' : 'Select Seat'}
                </h4>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#153B63] text-white font-black text-sm flex items-center justify-center mx-auto shadow-md border-4 border-white">
                  ৩
                </div>
                <h4 className="text-xs font-bold text-[#0B1F3A]">
                  {locale === 'bn' ? 'যাত্রীর তথ্য দিন' : 'Passenger Details'}
                </h4>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#153B63] text-white font-black text-sm flex items-center justify-center mx-auto shadow-md border-4 border-white">
                  ৪
                </div>
                <h4 className="text-xs font-bold text-[#0B1F3A]">
                  {locale === 'bn' ? 'পেমেন্ট করুন' : 'Make Payment'}
                </h4>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#FF6B00] text-white font-black text-sm flex items-center justify-center mx-auto shadow-md border-4 border-white">
                  ৫
                </div>
                <h4 className="text-xs font-bold text-[#0B1F3A]">
                  {locale === 'bn' ? 'টিকিট নিশ্চিত' : 'Ticket Issued'}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================
          6. PASSENGER AMENITIES (Matches Reference Icon Strip)
          ============================================================== */}
      <section className="py-8 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-[#0B1F3A]">
              {locale === 'bn' ? 'যাত্রীদের সুবিধা' : 'Passenger Amenities'}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-800">
              <Compass className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{locale === 'bn' ? 'লাইভ ট্র্যাকিং' : 'Live Tracking'}</span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-800">
              <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{locale === 'bn' ? 'অনলাইন বুকিং' : 'Online Booking'}</span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-800">
              <Bus className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{locale === 'bn' ? 'সিট সিলেকশন' : 'Seat Selection'}</span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-800">
              <QrCode className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{locale === 'bn' ? 'ই-টিকিট' : 'E-Ticket'}</span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-800">
              <Headphones className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{locale === 'bn' ? '২৪/৭ কাস্টমার সাপোর্ট' : '24/7 Support'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================
          7. PROMOTIONAL BOTTOM BANNER (Matches Reference Scenic Highway Card)
          ============================================================== */}
      <section id="offers" className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden shadow-xl min-h-[200px] flex items-center">
            <Image
              src="/images/promotions/expressway-promo.jpg"
              alt="Bangladesh Highway Bus Promo"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A]/90 via-[#0B1F3A]/75 to-transparent"></div>

            <div className="relative z-10 p-6 sm:p-10 max-w-xl text-white space-y-3">
              <h3 className="text-xl sm:text-2xl font-black leading-tight">
                {locale === 'bn' ? 'বাংলাদেশের সব পথে, আপনার সাথে' : 'With You on Every Route in Bangladesh'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-200">
                {locale === 'bn'
                  ? 'বাসের টিকিটে সেরা অফার পেতে এখনই অগ্রিম সিট বুক করুন।'
                  : 'Book early and enjoy exclusive discount fares across all highway routes.'}
              </p>
              <div className="pt-2">
                <Link
                  href={`/${locale}/search`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-black rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all cursor-pointer"
                >
                  <span>{locale === 'bn' ? 'টিকিট বুকিং' : 'Book Tickets Now'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
