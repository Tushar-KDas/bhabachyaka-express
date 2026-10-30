import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { getDictionary, Locale } from '@/lib/i18n';

interface Props {
  params: { locale: string };
}

export default function RefundPolicyPage({ params }: Props) {
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
              {locale === 'bn' ? 'অফিসিয়াল নীতিমালা' : 'Official Guidelines'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B1F3A] mt-1">
              {locale === 'bn' ? 'টিকেট বাতিলকরণ ও রিফান্ড নীতিমালা' : 'Cancellation & Refund Policy'}
            </h1>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <p>
              {locale === 'bn'
                ? 'ভ্যাবাচ্যাকা এক্সপ্রেস (Bhabachyaka Express) যাত্রীদের স্বচ্ছ ও নিরাপদ যাত্রীসেবা প্রদানে অঙ্গীকারবদ্ধ। কোনো অনাকাঙ্ক্ষিত কারণে যাত্রা বাতিল করতে হলে নিচের নীতিমালা প্রযোজ্য হবে:'
                : 'Bhabachyaka Express is committed to transparent, fair, and seamless service. In case of unexpected changes or cancellation, the following terms govern refunds:'}
            </p>

            <h3 className="font-extrabold text-sm sm:text-base text-[#0B1F3A] pt-2">
              {locale === 'bn' ? '১. বাতিলকরণ সময়সীমা ও কর্তন' : '1. Cancellation Timeline & Fees'}
            </h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                {locale === 'bn'
                  ? 'যাত্রার নির্ধারিত সময়ের ১২ ঘণ্টা পূর্বে বাতিল করলে: মূল ভাড়ার ১০% সার্ভিস চার্জ কর্তন করে অবশিষ্ট ৯০% রিফান্ড করা হবে।'
                  : 'More than 12 hours prior to departure: 10% policy cancellation fee deducted, 90% refunded.'}
              </li>
              <li>
                {locale === 'bn'
                  ? 'যাত্রার ৬ থেকে ১২ ঘণ্টার মধ্যে বাতিল করলে: মূল ভাড়ার ২৫% কর্তন সাপেক্ষে ৭৫% রিফান্ড করা হবে।'
                  : 'Between 6 and 12 hours prior to departure: 25% cancellation fee, 75% refunded.'}
              </li>
              <li>
                {locale === 'bn'
                  ? 'যাত্রার ৬ ঘণ্টার কম সময়ে অথবা বাস ছেড়ে যাওয়ার পর কোনো টিকিট বাতিল বা রিফান্ড প্রযোজ্য হবে না।'
                  : 'Less than 6 hours prior to departure or after coach departure: Non-refundable.'}
              </li>
            </ul>

            <h3 className="font-extrabold text-sm sm:text-base text-[#0B1F3A] pt-2">
              {locale === 'bn' ? '২. রিফান্ডের মাধ্যম' : '2. Refund Disbursement'}
            </h3>
            <p>
              {locale === 'bn'
                ? 'অনলাইনে বিকাশ বা নগদে পরিশোধিত টিকিট বাতিল অনুমোদিত হলে সংশ্লিষ্ট মোবাইল একাউন্টে আগামী ৩ থেকে ৫ কর্মদিবসের মধ্যে অর্থ ফেরত দেওয়া হবে। কাউন্টারে নগদ পরিশোধিত টিকেটের ক্ষেত্রে সংশ্লিষ্ট শাখায় মূল টিকিট জমা দিয়ে তাৎক্ষণিক নগদ রিফান্ড গ্রহণ করা যাবে।'
                : 'For online payments via bKash, Nagad or cards, approved refunds are returned to the source payment method within 3 to 5 business days. For counter cash purchases, cash refund is disbursed at the issuing terminal upon ticket surrender.'}
            </p>

            <h3 className="font-extrabold text-sm sm:text-base text-[#0B1F3A] pt-2">
              {locale === 'bn' ? '৩. সহায়তা ও যোগাযোগ' : '3. Support Assistance'}
            </h3>
            <p>
              {locale === 'bn'
                ? 'যেকোনো জিজ্ঞাসা বা জরুরি সহায়তায় আমাদের ২৪/৭ হেল্পলাইনে যোগাযোগ করুন: ০৯৬১২-৮৮৯৯০০ অথবা ইমেইল করুন support@bhabachyaka.com'
                : 'For urgent assistance, contact our 24/7 Helpline: 09612-889900 or email support@bhabachyaka.com'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
