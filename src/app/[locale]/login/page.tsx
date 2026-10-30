'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { getDictionary, Locale } from '@/lib/i18n';

interface Props {
  params: { locale: string };
}

export default function LoginPage({ params }: Props) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;
  const t = getDictionary(locale);
  const router = useRouter();

  const [email, setEmail] = useState('customer@bhabachyaka.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Role-based redirection
      const role = data.user.role;
      if (role === 'SUPER_ADMIN') router.push(`/${locale}/super-admin`);
      else if (role === 'COUNTER_AGENT') router.push(`/${locale}/counter/pos`);
      else if (role === 'OPERATOR_OWNER' || role === 'TRANSPORT_MANAGER') router.push(`/${locale}/operator/dashboard`);
      else if (role === 'BOARDING_STAFF') router.push(`/${locale}/supervisor`);
      else router.push(`/${locale}/account`);

      router.refresh();
    } catch {
      setError('An error occurred during login');
      setLoading(false);
    }
  };

  const quickFill = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="bg-[#F6F8FB] min-h-screen py-16 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#0B1F3A] p-2 flex items-center justify-center mx-auto shadow-md">
            <Image
              src="/brand/bhabachyaka-express-logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <h1 className="font-black text-2xl text-[#0B1F3A]">
            {t.nav.login}
          </h1>
          <p className="text-xs text-slate-500">
            {locale === 'bn' ? 'ভ্যাবাচ্যাকা এক্সপ্রেস একাউন্টে প্রবেশ করুন' : 'Sign in to your Bhabachyaka Express account'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {locale === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {locale === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? (locale === 'bn' ? 'লগইন হচ্ছে...' : 'Signing in...') : t.nav.login}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials for Reviewers */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider text-center">
            {locale === 'bn' ? 'ডেমো অ্যাকাউন্ট দ্রুত পূরণ করুন (Demo Quick Login):' : 'Demo Quick Login (All 5 Roles):'}
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => quickFill('superadmin@bhabachyaka.com')}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold text-left truncate transition-colors"
              title="superadmin@bhabachyaka.com"
            >
              👑 {locale === 'bn' ? 'সুপার অ্যাডমিন' : 'Super Admin'}
            </button>
            <button
              type="button"
              onClick={() => quickFill('owner@bhabachyaka.com')}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold text-left truncate transition-colors"
              title="owner@bhabachyaka.com"
            >
              📊 {locale === 'bn' ? 'কোম্পানি অ্যাডমিন' : 'Company Admin'}
            </button>
            <button
              type="button"
              onClick={() => quickFill('counter@bhabachyaka.com')}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold text-left truncate transition-colors"
              title="counter@bhabachyaka.com"
            >
              🏢 {locale === 'bn' ? 'কাউন্টার এজেন্ট' : 'Counter Agent'}
            </button>
            <button
              type="button"
              onClick={() => quickFill('boarding@bhabachyaka.com')}
              className="p-2 bg-orange-50/70 hover:bg-orange-100/70 border border-orange-200/80 rounded-lg text-[#0B1F3A] font-semibold text-left truncate transition-colors"
              title="boarding@bhabachyaka.com"
            >
              🚌 {locale === 'bn' ? 'ড্রাইভার / ক্রু (Crew)' : 'Driver / Crew'}
            </button>
            <button
              type="button"
              onClick={() => quickFill('customer@bhabachyaka.com')}
              className="col-span-2 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold text-center truncate transition-colors"
              title="customer@bhabachyaka.com"
            >
              👤 {locale === 'bn' ? 'সাধারণ যাত্রী (Customer)' : 'Customer / Passenger'}
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          <span>{locale === 'bn' ? 'নতুন ব্যবহারকারী? ' : 'Don’t have an account? '}</span>
          <Link href={`/${locale}/register`} className="font-bold text-[#FF6B00] hover:underline">
            {t.nav.register}
          </Link>
        </div>
      </div>
    </div>
  );
}
