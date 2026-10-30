import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { getDictionary, Locale } from '@/lib/i18n';

interface Props {
  params: { locale: string };
}

export default function PrivacyPage({ params }: Props) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;
  const t = getDictionary(locale);

  return (
    <div className="bg-[#F6F8FB] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0B1F3A]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.confirmation.backHome}</span>
        </Link>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider block">
              {locale === 'bn' ? 'তথ্য সুরক্ষা' : 'Data Privacy'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B1F3A] mt-1">
              {locale === 'bn' ? 'গোপনীয়তা ও তথ্য নিরাপত্তা নীতি' : 'Privacy & Security Policy'}
            </h1>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <p>
              {locale === 'bn'
                ? 'ভ্যাবাচ্যাকা এক্সপ্রেস যাত্রীদের ব্যক্তিগত তথ্যের সর্বোচ্চ গোপনীয়তা ও নিরাপত্তা নিশ্চিত করে। কোনো আর্থিক সংবেদনশীল পিন, ওটিপি বা পাসওয়ার্ড আমাদের সার্ভারে সংরক্ষিত হয় না।'
                : 'Bhabachyaka Express ensures bank-grade confidentiality and data protection for all passenger and operator information. MFS PINs, card security numbers, and OTPs are never stored.'}
            </p>
            <h3 className="font-extrabold text-sm sm:text-base text-[#0B1F3A] pt-2">
              {locale === 'bn' ? 'সংগৃহীত তথ্যের ব্যবহার' : 'Use of Collected Information'}
            </h3>
            <p>
              {locale === 'bn'
                ? 'মোবাইল নম্বর ও নাম কেবলমাত্র টিকিট নিশ্চিতকরণ, এসএমএস নোটিফিকেশন ও জরুরি যাত্রা পরিবর্তন সংক্রান্ত তথ্যের জন্য ব্যবহৃত হয়।'
                : 'Phone numbers and passenger names are exclusively used for reservation verification, SMS travel notices, and emergency schedule updates.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
