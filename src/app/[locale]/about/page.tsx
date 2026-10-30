import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Bus,
  Users,
  Clock,
  HeartHandshake,
  CheckCircle2,
  Navigation,
  Sparkles,
  ArrowRight,
  Headphones,
  MapPin,
} from 'lucide-react';
import { Locale } from '@/lib/i18n';
import { getSiteConfig } from '@/lib/siteConfigServer';

interface Props {
  params: { locale: string };
}

const ICON_MAP: Record<string, any> = {
  ShieldCheck,
  Clock,
  Bus,
  HeartHandshake,
  Award,
  Users,
  CheckCircle2,
  Sparkles,
};

export default function AboutPage({ params }: Props) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;
  const siteConfig = getSiteConfig();
  const { about } = siteConfig;
  const stats = about.stats || [];
  const pillars = about.pillars || [];
  const fleet = about.fleet || [];

  return (
    <div className="bg-[#F6F8FB] min-h-screen pb-16">
      {/* Hero Header */}
      <section className="relative bg-[#0B1F3A] text-white py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A] via-[#0E2648] to-[#153B63] opacity-95"></div>
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FFB020] text-xs font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-[#FF6B00]" />
            <span>{locale === 'bn' ? 'আমাদের ব্র্যান্ড পরিচিতি' : 'Official Brand Story'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {locale === 'bn' ? about.storyTitleBn : about.storyTitleEn}
          </h1>

          <p className="text-base sm:text-lg text-[#FFB020] font-bold max-w-2xl mx-auto tracking-wide">
            {locale === 'bn' ? about.storyTaglineBn : about.storyTaglineEn}
          </p>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            {locale === 'bn' ? about.storyDescBn : about.storyDescEn}
          </p>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <div
              key={s.id || idx}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center space-y-1 hover:shadow-md transition-shadow"
            >
              <span className="text-2xl sm:text-3xl font-black text-[#FF6B00] block">
                {locale === 'bn' ? s.valueBn : s.valueEn}
              </span>
              <span className="text-xs font-bold text-slate-600 block">
                {locale === 'bn' ? s.labelBn : s.labelEn}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 space-y-16">
        {/* Core Pillars */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B1F3A]">
              {locale === 'bn' ? 'আমাদের মূল অঙ্গীকার ও সেবাসমূহ' : 'Our Core Commitments & Standards'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {locale === 'bn'
                ? 'যাত্রীর প্রতিটি মুহূর্ত নিরাপদ ও স্বাচ্ছন্দ্যময় রাখাই আমাদের একমাত্র লক্ষ্য।'
                : 'Every element of our service is engineered to keep your journey serene, secure, and delightfully effortless.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((item, idx) => {
              const IconComponent = ICON_MAP[item.iconName] || ShieldCheck;
              return (
                <div
                  key={item.id || idx}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center shrink-0 border border-orange-200 shadow-xs">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-base text-[#0B1F3A]">
                      {locale === 'bn' ? item.titleBn : item.titleEn}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {locale === 'bn' ? item.descBn : item.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Fleet Showcase */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B1F3A]">
              {locale === 'bn' ? 'আমাদের আধুনিক বাস বহর (Fleet)' : 'Our Modern Coach Fleet'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {locale === 'bn'
                ? 'আন্তর্জাতিক মানের এসি ও স্লিপার কোচে উপভোগ করুন প্রিমিয়াম যাত্রা অভিজ্ঞতা।'
                : 'Experience European luxury coaches crafted for maximum ergonomics and silent highway cruising.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {fleet.map((coach, idx) => (
              <div
                key={coach.id || idx}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col"
              >
                <div className="relative h-48 w-full bg-slate-100">
                  <Image src={coach.image} alt={coach.nameEn} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/70 via-transparent to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h4 className="font-black text-sm">{locale === 'bn' ? coach.nameBn : coach.nameEn}</h4>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {locale === 'bn' ? coach.featuresBn : coach.featuresEn}
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {locale === 'bn' ? 'লাইভ জিপিএস ট্র্যাকিং' : 'Live GPS Enabled'}
                    </span>
                    <span className="text-[#FF6B00]">★ ৫.০ রেটিং</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Card */}
        <section className="bg-gradient-to-r from-[#0B1F3A] to-[#153B63] rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl border border-slate-700">
          <h3 className="text-2xl sm:text-3xl font-black">
            {locale === 'bn' ? 'আজই আপনার নিরাপদ যাত্রা শুরু করুন' : 'Begin Your Safe Journey Today'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            {locale === 'bn'
              ? 'বাংলাদেশের ৬৪ জেলার যেকোনো প্রান্তে টিকিট বুক করুন মাত্র ২ মিনিটে।'
              : 'Book your seat in just 2 minutes to any of Bangladesh’s 64 districts.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`/${locale}/search`}
              className="px-6 py-3 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Bus className="w-4 h-4" />
              <span>{locale === 'bn' ? 'অনলাইনে বাস টিকিট খুঁজুন' : 'Search & Book Buses'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/${locale}/counters`}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <span>{locale === 'bn' ? 'কাউন্টার তালিকা দেখুন' : 'View Counters Directory'}</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
