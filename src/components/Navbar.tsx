'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Globe, Menu, X, User, LogOut, Ticket, LayoutDashboard, Shield, Bus } from 'lucide-react';
import { getDictionary, Locale } from '@/lib/i18n';

interface Props {
  locale: Locale;
}

export default function Navbar({ locale }: Props) {
  const t = getDictionary(locale);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [siteConfig, setSiteConfig] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {});

    fetch('/api/site-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setSiteConfig(data.config);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const defaultItems = [
    { id: 'home', nameBn: 'হোম', nameEn: 'Home', href: '/', isActive: true },
    { id: 'search', nameBn: 'সার্চ বাস', nameEn: 'Search Buses', href: '/search', isActive: true },
    { id: 'verify-ticket', nameBn: 'টিকিট চেক', nameEn: 'Verify Ticket', href: '/verify-ticket', isActive: true },
    { id: 'counters', nameBn: 'কাউন্টারসমূহ', nameEn: 'Counters', href: '/counters', isActive: true },
    { id: 'about', nameBn: 'আমাদের সম্পর্কে', nameEn: 'About Us', href: '/about', isActive: true },
    { id: 'packages', nameBn: 'প্যাকেজসমূহ', nameEn: 'Packages', href: '/packages', isActive: true },
    { id: 'offers', nameBn: 'অফারসমূহ', nameEn: 'Offers', href: '/offers', isActive: true },
    { id: 'contact', nameBn: 'যোগাযোগ', nameEn: 'Contact', href: '/contact', isActive: true },
  ];

  const activeMenuItems = (siteConfig?.menuItems || defaultItems).filter((i: any) => i.isActive);

  const toggleLanguage = () => {
    const nextLocale = locale === 'bn' ? 'en' : 'bn';
    try {
      document.cookie = `bhabachyaka_locale=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
    const pathParts = pathname.split('/');
    if (pathParts.length > 1 && (pathParts[1] === 'bn' || pathParts[1] === 'en')) {
      pathParts[1] = nextLocale;
    } else {
      pathParts.splice(1, 0, nextLocale);
    }
    const newPath = pathParts.join('/') || `/${nextLocale}`;
    const queryString = searchParams.toString();
    const fullUrl = queryString ? `${newPath}?${queryString}` : newPath;
    router.push(fullUrl);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push(`/${locale}`);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-white text-slate-800 shadow-sm border-b border-slate-200 no-print">
      {/* Top Announcement Bar if enabled in CMS */}
      {siteConfig?.announcement?.enabled && (
        <div className="bg-gradient-to-r from-[#FF6B00] to-[#E05E00] text-white py-2 px-4 text-center text-xs font-bold shadow-xs flex items-center justify-center gap-2">
          <span>{locale === 'bn' ? siteConfig.announcement.textBn : siteConfig.announcement.textEn}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand (Matches Reference UI) */}
          <Link href={`/${locale}`} className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 p-1 shadow-sm flex items-center justify-center">
              <Image
                src="/brand/bhabachyaka-express-logo.png"
                alt="Bhabachyaka Express Logo"
                width={42}
                height={42}
                priority
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#0B1F3A] group-hover:text-[#FF6B00] transition-colors leading-tight">
                {locale === 'bn' ? 'ভ্যাবাচ্যাকা এক্সপ্রেস' : 'BHABACHYAKA EXPRESS'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium tracking-wide">
                {locale === 'bn' ? 'নিরাপদে পৌঁছে দেবে আপনার গন্তব্যে' : 'Your Journey, Our Responsibility.'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Dynamically rendered from SiteConfig / CMS) */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs font-semibold">
            {activeMenuItems.map((item: any) => {
              const fullHref = item.href.startsWith('/') ? `/${locale}${item.href === '/' ? '' : item.href}` : item.href;
              const isSelected =
                item.href === '/'
                  ? pathname === `/${locale}`
                  : pathname.startsWith(`/${locale}${item.href}`);

              return (
                <Link
                  key={item.id}
                  href={fullHref}
                  className={`transition-colors hover:text-[#FF6B00] ${
                    isSelected ? 'text-[#FF6B00] font-bold' : 'text-slate-700'
                  }`}
                >
                  {locale === 'bn' ? item.nameBn : item.nameEn}
                </Link>
              );
            })}

            {/* Quick role-specific pills when authenticated */}
            {user?.role === 'COUNTER_AGENT' && (
              <Link
                href={`/${locale}/counter/pos`}
                className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-full text-[11px] font-bold hover:bg-amber-100 transition-all"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>{locale === 'bn' ? 'কাউন্টার POS' : 'Counter POS'}</span>
              </Link>
            )}

            {(user?.role === 'OPERATOR_OWNER' || user?.role === 'TRANSPORT_MANAGER') && (
              <Link
                href={`/${locale}/operator/dashboard`}
                className="flex items-center gap-1.5 bg-indigo-50 text-indigo-800 border border-indigo-300 px-2.5 py-1 rounded-full text-[11px] font-bold hover:bg-indigo-100 transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{locale === 'bn' ? 'কোম্পানি অ্যাডমিন' : 'Operator ERP'}</span>
              </Link>
            )}

            {/* Super Admin Universal Multi-Panel Hub */}
            {user?.role === 'SUPER_ADMIN' && (
              <div className="flex items-center gap-1.5 bg-red-50/70 border border-red-200 p-1 rounded-full text-[11px] font-bold">
                <Link
                  href={`/${locale}/super-admin`}
                  className="flex items-center gap-1 bg-red-600 text-white px-2.5 py-0.5 rounded-full hover:bg-red-700 transition-colors shadow-2xs"
                  title="Super Admin Dashboard"
                >
                  <Shield className="w-3 h-3" />
                  <span>{locale === 'bn' ? 'সুপার অ্যাডমিন' : 'Super Admin'}</span>
                </Link>
                <Link
                  href={`/${locale}/operator/dashboard`}
                  className="flex items-center gap-1 bg-white text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full hover:bg-indigo-50 transition-colors"
                  title="Operator ERP"
                >
                  <LayoutDashboard className="w-3 h-3" />
                  <span>{locale === 'bn' ? 'কোম্পানি' : 'ERP'}</span>
                </Link>
                <Link
                  href={`/${locale}/counter/pos`}
                  className="flex items-center gap-1 bg-white text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full hover:bg-amber-50 transition-colors"
                  title="Counter POS"
                >
                  <Ticket className="w-3 h-3" />
                  <span>{locale === 'bn' ? 'POS' : 'POS'}</span>
                </Link>
              </div>
            )}

            {user?.role === 'BOARDING_STAFF' && (
              <Link
                href={`/${locale}/supervisor`}
                className="flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-300 px-2.5 py-1 rounded-full text-[11px] font-bold hover:bg-blue-100 transition-all"
              >
                <Bus className="w-3.5 h-3.5" />
                <span>{locale === 'bn' ? 'ড্রাইভার ও ক্রু' : 'Crew Console'}</span>
              </Link>
            )}
          </nav>

          {/* Right Actions: Language Switcher, Login, Register (Matches Reference UI) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher Pill */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all cursor-pointer"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>{locale === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={`/${locale}/account`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 border border-slate-200 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span className="max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title={t.nav.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href={`/${locale}/login`}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-[#FF6B00] text-xs font-bold text-slate-700 hover:text-[#FF6B00] transition-colors"
                >
                  {locale === 'bn' ? 'লগইন' : 'Login'}
                </Link>
                <Link
                  href={`/${locale}/register`}
                  className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-extrabold transition-all shadow-md hover:shadow-orange-500/20"
                >
                  {locale === 'bn' ? 'রেজিস্টার' : 'Register'}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 text-xs font-bold bg-slate-100 rounded border border-slate-200 text-[#FF6B00]"
            >
              {locale === 'bn' ? 'EN' : 'বাং'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:text-[#0B1F3A] hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          {activeMenuItems.map((item: any) => {
            const fullHref = item.href.startsWith('/') ? `/${locale}${item.href === '/' ? '' : item.href}` : item.href;
            return (
              <Link
                key={item.id}
                href={fullHref}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-slate-800 font-bold border-b border-slate-100"
              >
                {locale === 'bn' ? item.nameBn : item.nameEn}
              </Link>
            );
          })}
          <Link
            href={`/${locale}/manage-booking`}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-800 font-bold border-b border-slate-100"
          >
            {locale === 'bn' ? 'আমার টিকিট' : 'My Bookings'}
          </Link>

          {/* Role links */}
          {user?.role === 'COUNTER_AGENT' && (
            <Link
              href={`/${locale}/counter/pos`}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-amber-700 font-bold"
            >
              {locale === 'bn' ? '🏢 কাউন্টার POS' : 'Counter POS'}
            </Link>
          )}

          {(user?.role === 'OPERATOR_OWNER' || user?.role === 'TRANSPORT_MANAGER') && (
            <Link
              href={`/${locale}/operator/dashboard`}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-indigo-700 font-bold"
            >
              {locale === 'bn' ? '📊 কোম্পানি অ্যাডমিন (ERP)' : 'Operator ERP'}
            </Link>
          )}

          {user?.role === 'SUPER_ADMIN' && (
            <div className="space-y-1 bg-red-50/50 p-2.5 rounded-xl border border-red-200">
              <span className="text-[10px] font-black uppercase text-red-600 block px-1">
                {locale === 'bn' ? '👑 সুপার অ্যাডমিন সর্বজনীন হাব:' : '👑 Super Admin Universal Hub:'}
              </span>
              <Link
                href={`/${locale}/super-admin`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 px-2 text-xs text-red-700 font-bold hover:bg-red-100 rounded"
              >
                👑 সুপার অ্যাডমিন প্ল্যাটফর্ম
              </Link>
              <Link
                href={`/${locale}/operator/dashboard`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 px-2 text-xs text-indigo-700 font-bold hover:bg-indigo-100 rounded"
              >
                📊 কোম্পানি অ্যাডমিন (ERP)
              </Link>
              <Link
                href={`/${locale}/counter/pos`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 px-2 text-xs text-amber-700 font-bold hover:bg-amber-100 rounded"
              >
                🏢 কাউন্টার POS
              </Link>
              <Link
                href={`/${locale}/supervisor`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 px-2 text-xs text-blue-700 font-bold hover:bg-blue-100 rounded"
              >
                🚌 ড্রাইভার ও ক্রু প্যানেল
              </Link>
            </div>
          )}

          {user?.role === 'BOARDING_STAFF' && (
            <Link
              href={`/${locale}/supervisor`}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-blue-700 font-bold"
            >
              {locale === 'bn' ? '🚌 ড্রাইভার ও ক্রু প্যানেল' : 'Crew Panel'}
            </Link>
          )}

          {/* Auth in Mobile */}
          <div className="pt-2">
            {user ? (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <Link
                  href={`/${locale}/account`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-bold text-[#FF6B00]"
                >
                  👤 {user.name} ({locale === 'bn' ? 'আমার প্রোফাইল' : 'My Account'})
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  {t.nav.logout}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <Link
                  href={`/${locale}/login`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl border border-slate-300 text-slate-800 text-xs font-bold"
                >
                  {locale === 'bn' ? 'লগইন' : 'Login'}
                </Link>
                <Link
                  href={`/${locale}/register`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl bg-[#FF6B00] text-white text-xs font-bold"
                >
                  {locale === 'bn' ? 'রেজিস্টার' : 'Register'}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
