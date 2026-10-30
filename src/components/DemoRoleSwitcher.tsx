'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldCheck, UserCheck, Terminal, Users, User, ChevronDown, Check } from 'lucide-react';

interface Props {
  locale: 'bn' | 'en';
}

export default function DemoRoleSwitcher({ locale }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const switchRole = async (role: string, targetPath: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/demo-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setIsOpen(false);
        router.push(`/${locale}${targetPath}`);
        router.refresh();
      }
    } catch (err) {
      console.error('Role switch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      role: 'SUPER_ADMIN',
      label: locale === 'bn' ? '১. সুপার অ্যাডমিন (Software Owner)' : '1. Super Admin (Software Owner)',
      path: '/super-admin',
      icon: ShieldCheck,
      color: 'bg-red-600',
    },
    {
      role: 'OPERATOR_OWNER',
      label: locale === 'bn' ? '২. কোম্পানি অ্যাডমিন (Bus Owner ERP)' : '2. Company Admin (Bus Owner)',
      path: '/operator/dashboard',
      icon: UserCheck,
      color: 'bg-indigo-600',
    },
    {
      role: 'COUNTER_AGENT',
      label: locale === 'bn' ? '৩. কাউন্টার ম্যানেজার / এজেন্ট' : '3. Counter Manager / Agent',
      path: '/counter/pos',
      icon: Terminal,
      color: 'bg-amber-500',
    },
    {
      role: 'BOARDING_STAFF',
      label: locale === 'bn' ? '৪. ড্রাইভার / সুপারভাইজার প্যানেল' : '4. Driver / Supervisor App',
      path: '/supervisor',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      role: 'CUSTOMER',
      label: locale === 'bn' ? '৫. সাধারণ যাত্রী (Customer Portal)' : '5. Customer (Passenger Portal)',
      path: '/account',
      icon: User,
      color: 'bg-emerald-500',
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 no-print">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-[#0B1F3A] text-white px-3.5 py-2 rounded-full shadow-lg border border-slate-700 hover:bg-[#153B63] transition-all text-xs font-medium cursor-pointer"
          title="Instant Role & Demo Switcher"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] animate-pulse"></span>
          <span>{locale === 'bn' ? 'টেস্ট রোল সুইচ:' : 'Role Switcher:'}</span>
          <span className="text-[#FFB020] font-semibold">{currentUser?.role || 'Guest'}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {isOpen && (
          <div className="absolute bottom-12 right-0 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-sm z-50 animate-fade-in">
            <div className="bg-[#0B1F3A] text-white p-3 flex justify-between items-center">
              <div>
                <div className="font-bold text-xs text-[#FFB020]">
                  {locale === 'bn' ? 'তাৎক্ষণিক ভূমিকা পরিবর্তন' : 'Instant Role Switcher'}
                </div>
                <div className="text-[11px] text-slate-300">
                  {locale === 'bn' ? 'যেকোনো ভূমিকা এক ক্লিকে পরীক্ষা করুন' : 'One-click switch for review & demo'}
                </div>
              </div>
            </div>

            <div className="p-2 space-y-1">
              {roles.map((r) => {
                const Icon = r.icon;
                const isCurrent = currentUser?.role === r.role;
                return (
                  <button
                    key={r.role}
                    disabled={loading}
                    onClick={() => switchRole(r.role, r.path)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                      isCurrent
                        ? 'bg-blue-50 text-[#0B1F3A] font-semibold border border-blue-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-white ${r.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs">{r.label}</span>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
