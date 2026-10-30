'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Tag,
  Copy,
  Check,
  Gift,
  Sparkles,
  ArrowRight,
  Bus,
  AlertCircle,
} from 'lucide-react';
import { Locale } from '@/lib/i18n';
import { OfferItem } from '@/lib/siteConfig';

interface Props {
  initialOffers: OfferItem[];
  locale: Locale;
}

export default function OffersClient({ initialOffers, locale }: Props) {
  const [offers, setOffers] = useState<OfferItem[]>(initialOffers);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/site-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.config?.offers) && data.config.offers.length > 0) {
          setOffers(data.config.offers);
        }
      })
      .catch((err) => console.log('Using initial offers:', err));
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const activeOffers = offers.filter((o) => o.isActive !== false);

  return (
    <div className="bg-[#F6F8FB] min-h-screen pb-16">
      {/* Hero Header */}
      <section className="relative bg-[#0B1F3A] text-white py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A] via-[#0E2648] to-[#153B63] opacity-95"></div>
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FFB020] text-xs font-bold shadow-sm">
            <Gift className="w-4 h-4 text-[#FF6B00]" />
            <span>{locale === 'bn' ? 'অফিসিয়াল ডিসকাউন্ট ও প্রোমো কোড' : 'Official Discounts & Promo Codes'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {locale === 'bn' ? 'স্পেশাল ডিসকাউন্ট ও অফারসমূহ' : 'Special Offers & Promo Codes'}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            {locale === 'bn'
              ? 'ভ্যাবাচ্যাকা এক্সপ্রেসের প্রোমো কোডগুলো কপি করে চেকআউটের সময় ব্যবহার করুন এবং সাশ্রয়ী মূল্যে নিরাপদ ভ্রমণ উপভোগ করুন।'
              : 'Copy any of our verified promo codes and apply them at checkout to travel comfortably across Bangladesh at unbeatable fares.'}
          </p>
        </div>
      </section>

      {/* Offers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeOffers.map((offer) => {
            const isCopied = copiedCode === offer.code;

            return (
              <div
                key={offer.id || offer.code}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Top Gradient Banner */}
                  <div className={`bg-gradient-to-r ${offer.color} p-5 text-white space-y-1 relative`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                        {locale === 'bn' ? offer.badgeBn : offer.badgeEn}
                      </span>
                      <Sparkles className="w-4 h-4 opacity-80" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight pt-1">
                      {locale === 'bn' ? offer.discountBn : offer.discountEn}
                    </h3>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4 text-xs">
                    <p className="text-slate-600 font-medium leading-relaxed">
                      {locale === 'bn' ? offer.descBn : offer.descEn}
                    </p>

                    <div className="space-y-1 text-[11px] text-slate-500 font-semibold border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <span>•</span>
                        <span>{locale === 'bn' ? offer.minSpendBn : offer.minSpendEn}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <span>•</span>
                        <span>{locale === 'bn' ? offer.validityBn : offer.validityEn}</span>
                      </div>
                    </div>

                    {/* Copy Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          {locale === 'bn' ? 'প্রোমো কোড:' : 'Promo Code:'}
                        </span>
                        <span className="font-mono text-base font-black tracking-widest text-[#0B1F3A]">
                          {offer.code}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(offer.code)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{locale === 'bn' ? 'কপি হয়েছে!' : 'Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{locale === 'bn' ? 'কপি কোড' : 'Copy'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Apply & Book CTA */}
                <div className="p-5 pt-0">
                  <Link
                    href={`/${locale}/search`}
                    className="w-full py-2.5 bg-[#0B1F3A] hover:bg-[#FF6B00] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-sm"
                  >
                    <Bus className="w-3.5 h-3.5 text-[#FFB020] group-hover:text-white" />
                    <span>{locale === 'bn' ? 'টিকিট কাটতে ব্যবহার করুন' : 'Apply & Book Bus'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* How to Use / Terms Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#0B1F3A]">
            <AlertCircle className="w-5 h-5 text-[#FF6B00]" />
            <h3 className="font-black text-base">
              {locale === 'bn' ? 'প্রোমো কোড ব্যবহারের নিয়মাবলী ও শর্তাবলি' : 'Terms & Conditions of Offers'}
            </h3>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 font-medium">
            <li className="flex items-start gap-2">
              <span className="text-[#FF6B00] font-black">•</span>
              <span>{locale === 'bn' ? 'প্রতিটি বুকিংয়ে সর্বোচ্চ একটি প্রোমো কোড ব্যবহার করা যাবে।' : 'Only one promo code may be redeemed per booking transaction.'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF6B00] font-black">•</span>
              <span>{locale === 'bn' ? 'ক্যাশব্যাক অফারগুলো সরাসরি বিকাশ বা নগদের নিয়মাবলি অনুযায়ী প্রদত্ত হবে।' : 'Cashback incentives are credited via relevant gateway partner rules.'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF6B00] font-black">•</span>
              <span>{locale === 'bn' ? 'টিকিট বাতিল করা হলে ডিসকাউন্টের অর্থ বাদে অবশিষ্ট অংশ রিফান্ড করা হবে।' : 'In case of cancellation, refunds are computed on the net payable fare.'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF6B00] font-black">•</span>
              <span>{locale === 'bn' ? 'ভ্যাবাচ্যাকা এক্সপ্রেস কর্তৃপক্ষ পূর্ব নোটিশ ছাড়া যেকোনো অফার পরিবর্তনের অধিকার সংরক্ষণ করে।' : 'Management reserves the right to modify or conclude promotions.'}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
