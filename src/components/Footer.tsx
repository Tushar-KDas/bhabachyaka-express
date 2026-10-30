import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Github,
  Globe,
  Code2,
  ExternalLink,
} from 'lucide-react';
import { getDictionary, Locale } from '@/lib/i18n';

interface Props {
  locale: Locale;
}

export default function Footer({ locale }: Props) {
  const t = getDictionary(locale);

  return (
    <footer className="bg-[#0B1F3A] text-slate-300 border-t border-[#153B63] pt-12 pb-8 no-print mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow">
                <Image
                  src="/brand/bhabachyaka-express-logo.png"
                  alt="Bhabachyaka Express"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <span className="font-extrabold text-lg text-white">
                {locale === 'bn' ? 'ভ্যাবাচ্যাকা এক্সপ্রেস' : 'BHABACHYAKA EXPRESS'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {locale === 'bn'
                ? 'নিরাপদে পৌঁছে দেবে আপনার গন্তব্যে — আধুনিক বাস সেবা, দ্রুত সিট বুকিং ও বিশ্বস্ত ইন্টারসিটি এক্সপ্রেস পরিবহন।'
                : 'Your Journey, Our Responsibility. Safe, reliable, and comfortable intercity bus ticketing across Bangladesh.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#FFB020] font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{locale === 'bn' ? 'BRTA অনুমোদিত নিবন্ধিত প্ল্যাটফর্ম' : 'BRTA Approved Registered Operator'}</span>
            </div>
          </div>

          {/* Col 2: Quick Links (Matches Reference UI) */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
              {locale === 'bn' ? 'দ্রুত লিংক' : 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href={`/${locale}`} className="hover:text-[#FF6B00] transition-colors">
                  {locale === 'bn' ? 'হোমপেজ' : 'Home'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/search`} className="hover:text-[#FF6B00] transition-colors">
                  {locale === 'bn' ? 'বাস খুঁজুন' : 'Search Buses'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/counters`} className="hover:text-[#FF6B00] transition-colors">
                  {locale === 'bn' ? '৬৪ জেলার কাউন্টার' : '64 District Counters'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about`} className="hover:text-[#FF6B00] transition-colors">
                  {locale === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/packages`} className="hover:text-[#FF6B00] transition-colors">
                  {locale === 'bn' ? 'ট্যুর প্যাকেজসমূহ' : 'Tour Packages'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/offers`} className="hover:text-[#FF6B00] transition-colors">
                  {locale === 'bn' ? 'ডিসকাউন্ট ও অফার' : 'Offers & Promotions'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="hover:text-[#FF6B00] transition-colors">
                  {locale === 'bn' ? 'যোগাযোগ ও সাপোর্ট' : 'Contact & Support'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/manage-booking`} className="hover:text-[#FF6B00] transition-colors">
                  {locale === 'bn' ? 'আমার টিকিট ও PNR যাচাই' : 'Manage Booking & PNR'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Policies */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
              {locale === 'bn' ? 'আইনগত' : 'Legal & Policies'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href={`/${locale}/terms`} className="hover:text-[#FF6B00] transition-colors">
                  {locale === 'bn' ? 'ব্যবহারের শর্তাবলী' : 'Terms & Conditions'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="hover:text-[#FF6B00] transition-colors">
                  {locale === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/refund-policy`} className="hover:text-[#FF6B00] transition-colors">
                  {locale === 'bn' ? 'টিকিট বাতিল ও রিফান্ড পলিসি' : 'Refund & Cancellation Policy'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/login`} className="hover:text-[#FF6B00] transition-colors">
                  {locale === 'bn' ? 'কাউন্টার এজেন্ট লগইন' : 'Counter Agent Login'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/operator/dashboard`} className="hover:text-[#FF6B00] transition-colors">
                  {locale === 'bn' ? 'অপারেটর অ্যাডমিন প্যানেল' : 'Operator Portal'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Socials (Matches Reference UI) */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {locale === 'bn' ? 'যোগাযোগ' : 'Contact Us'}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span className="font-bold text-white">+880 1234 567890 (09612-889900)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span className="text-slate-300">support@bhabachyakaexpress.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                <span className="text-slate-300">
                  {locale === 'bn' ? 'গাবতলী / সায়েদাবাদ টার্মিনাল, ঢাকা, বাংলাদেশ' : 'Gabtoli / Sayedabad Terminal, Dhaka, Bangladesh'}
                </span>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://www.facebook.com/Shri.Tushar.K.Das/"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#1877F2] flex items-center justify-center text-white transition-all shadow-sm hover:scale-105"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/_tushar_kumar_das_/"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] flex items-center justify-center text-white transition-all shadow-sm hover:scale-105"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/tusharkumardas"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#0A66C2] flex items-center justify-center text-white transition-all shadow-sm hover:scale-105"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/Tushar-KDas"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-black flex items-center justify-center text-white transition-all shadow-sm hover:scale-105"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/_tushar_das_"
                target="_blank"
                rel="noopener noreferrer"
                title="Twitter / X"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-black flex items-center justify-center text-white transition-all shadow-sm hover:scale-105"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Payment Partner Pills & Copyright */}
        <div className="pt-6 border-t border-[#153B63] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span>{locale === 'bn' ? 'অনুমোদিত পেমেন্ট:' : 'Supported Payment:'}</span>
            <span className="px-2 py-0.5 bg-slate-800 rounded text-pink-400 font-bold border border-slate-700">bKash</span>
            <span className="px-2 py-0.5 bg-slate-800 rounded text-orange-400 font-bold border border-slate-700">Nagad</span>
            <span className="px-2 py-0.5 bg-slate-800 rounded text-blue-400 font-bold border border-slate-700">VISA / MasterCard</span>
            <span className="px-2 py-0.5 bg-slate-800 rounded text-emerald-400 font-bold border border-slate-700">Counter Cash</span>
          </div>

          <div>
            © 2026 Bhabachyaka Express. {locale === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
          </div>
        </div>

        {/* DEVELOPER SIGNATURE (Matches exact design from https://tushar-kumar-das.vercel.app/) */}
        <div className="mt-10 pt-8 border-t border-[#153B63]/80 flex flex-col items-center justify-center gap-4 text-center">
          <div className="text-sm font-medium text-slate-300">
            {locale === 'bn' ? 'ডেভেলপ করেছেন' : 'Developed by'}{' '}
            <a
              href="https://tushar-kumar-das.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#FF6B00] hover:text-orange-400 underline underline-offset-4 transition-colors"
            >
              Tushar Kumar Das
            </a>
          </div>

          {/* Social Profiles with Circular Buttons & Hover Scaled Shadows */}
          <div className="flex items-center justify-center gap-3">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/Shri.Tushar.K.Das/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook Profile"
              title="Facebook"
              className="w-10 h-10 rounded-full bg-[#08182D] border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] transition-all duration-200 shadow-sm hover:scale-110 cursor-pointer"
            >
              <Facebook className="w-4 h-4" />
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/_tushar_kumar_das_/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Profile"
              title="Instagram"
              className="w-10 h-10 rounded-full bg-[#08182D] border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:border-transparent transition-all duration-200 shadow-sm hover:scale-110 cursor-pointer"
            >
              <Instagram className="w-4 h-4" />
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/tusharkumardas"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              title="LinkedIn"
              className="w-10 h-10 rounded-full bg-[#08182D] border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#0A66C2] hover:border-[#0A66C2] transition-all duration-200 shadow-sm hover:scale-110 cursor-pointer"
            >
              <Linkedin className="w-4 h-4" />
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/Tushar-KDas"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              title="GitHub"
              className="w-10 h-10 rounded-full bg-[#08182D] border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-900 hover:border-slate-600 transition-all duration-200 shadow-sm hover:scale-110 cursor-pointer"
            >
              <Github className="w-4 h-4" />
            </a>

            {/* Twitter / X */}
            <a
              href="https://x.com/_tushar_das_"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter) Profile"
              title="X (Twitter)"
              className="w-10 h-10 rounded-full bg-[#08182D] border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-black hover:border-black transition-all duration-200 shadow-sm hover:scale-110 cursor-pointer"
            >
              <Twitter className="w-4 h-4" />
            </a>

            {/* Portfolio Website */}
            <a
              href="https://tushar-kumar-das.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Portfolio Website"
              title="Portfolio Website"
              className="w-10 h-10 rounded-full bg-[#08182D] border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#FF6B00] hover:border-[#FF6B00] transition-all duration-200 shadow-sm hover:scale-110 cursor-pointer"
            >
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
