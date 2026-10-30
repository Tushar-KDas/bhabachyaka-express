'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { getDictionary, Locale } from '@/lib/i18n';

interface Props {
  params: { locale: string };
}

export default function RegisterPage({ params }: Props) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;
  const t = getDictionary(locale);
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      router.push(`/${locale}/account`);
      router.refresh();
    } catch {
      setError('An error occurred during registration');
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F6F8FB] min-h-screen py-16 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl max-w-md w-full space-y-6">
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
            {t.nav.register}
          </h1>
          <p className="text-xs text-slate-500">
            {locale === 'bn' ? 'নতুন অ্যাকাউন্ট তৈরি করে সহজেই টিকিট বুক করুন' : 'Create an account for faster booking and rewards'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {t.passenger.fullName} *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={locale === 'bn' ? 'আপনার নাম' : 'Your full name'}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {locale === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {t.passenger.phone} *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {locale === 'bn' ? 'পাসওয়ার্ড' : 'Password'} *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? (locale === 'bn' ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating...') : t.nav.register}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          <span>{locale === 'bn' ? 'ইতিমধ্যেই অ্যাকাউন্ট আছে? ' : 'Already have an account? '}</span>
          <Link href={`/${locale}/login`} className="font-bold text-[#FF6B00] hover:underline">
            {t.nav.login}
          </Link>
        </div>
      </div>
    </div>
  );
}
