import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { getDictionary, Locale } from '@/lib/i18n';

interface Props {
  params: { locale: string };
}

export default function TermsPage({ params }: Props) {
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
              {locale === 'bn' ? 'ব্যবহারের শর্তাবলী' : 'Terms & Conditions'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B1F3A] mt-1">
              {locale === 'bn' ? 'ভ্যাবাচ্যাকা এক্সপ্রেস সেবা নীতিমালা' : 'Terms of Service'}
            </h1>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <p>
              {locale === 'bn'
                ? 'ভ্যাবাচ্যাকা এক্সপ্রেস ওয়েবসাইট ও কাউন্টার POS ব্যবহারের মাধ্যমে সকল গ্রাহক ও এজেন্ট এই শর্তাবলী মেনে নিতে সম্মত হচ্ছেন।'
                : 'By accessing Bhabachyaka Express online booking portal and Counter POS systems, passengers and agents agree to the following terms and guidelines.'}
            </p>
            <h3 className="font-extrabold text-sm sm:text-base text-[#0B1F3A] pt-2">
              {locale === 'bn' ? '১. টিকিট ও বোর্ডিং' : '1. Ticketing & Boarding'}
            </h3>
            <p>
              {locale === 'bn'
                ? 'অনলাইন ই-টিকিট বা মুদ্রিত টিকিট যাত্রার পূর্বে বোর্ডিং কর্মকর্তাকে প্রদর্শন করতে হবে। যাত্রীকে নির্ধারিত যাত্রার অন্তত ২০ মিনিট পূর্বে সংশ্লিষ্ট কাউন্টারে উপস্থিত থাকতে হবে।'
                : 'Passengers must present their digital QR ticket or printed voucher at least 20 minutes prior to departure.'}
            </p>
            <h3 className="font-extrabold text-sm sm:text-base text-[#0B1F3A] pt-2">
              {locale === 'bn' ? '২. নিষিদ্ধ পণ্য ও নিরাপত্তা' : '2. Prohibited Goods & Conduct'}
            </h3>
            <p>
              {locale === 'bn'
                ? 'কোনো প্রকার দাহ্য পদার্থ, বিস্ফোরক, মাদকদ্রব্য বা অস্ত্র বহন সম্পূর্ণ নিষিদ্ধ। কোচের ভেতরে ধূমপান কঠোরভাবে নিষিদ্ধ।'
                : 'Carrying hazardous materials, contraband, explosives, or illegal substances is strictly forbidden. Coaches are 100% non-smoking.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
