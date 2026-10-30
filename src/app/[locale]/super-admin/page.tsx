'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  DollarSign,
  Ticket,
  CheckCircle2,
  Server,
  Zap,
  Layers,
  ChevronRight,
  TrendingUp,
  Plus,
  X,
  AlertTriangle,
  RefreshCw,
  Lock,
  Bus,
  Sliders,
  ExternalLink,
  UserCheck,
  Terminal,
  Smartphone,
  MapPin,
  Calendar,
  LayoutDashboard,
  FileText,
  Filter,
  Search,
  Award,
  Users,
} from 'lucide-react';
import { getDictionary, Locale, formatBDT, formatDate, toBengaliDigits } from '@/lib/i18n';
import SiteEditorCMS from '@/components/SiteEditorCMS';
import CounterAgentsManager from '@/components/CounterAgentsManager';
import PackageBookingsAdmin from '@/components/PackageBookingsAdmin';

interface Props {
  params: { locale: string };
}

type SuperAdminTab = 'overview' | 'tenants' | 'fleet' | 'routes' | 'trips' | 'agents' | 'packages' | 'cms';

export default function SuperAdminPage({ params }: Props) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;
  const t = getDictionary(locale);

  const [adminData, setAdminData] = useState<any>(null);
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SuperAdminTab>('overview');

  // Search & Filters for Fleet, Routes, Trips
  const [fleetSearch, setFleetSearch] = useState('');
  const [routeSearch, setRouteSearch] = useState('');
  const [tripSearch, setTripSearch] = useState('');

  // Restore active tab on reload or page refresh
  useEffect(() => {
    try {
      const validTabs: SuperAdminTab[] = ['overview', 'tenants', 'fleet', 'routes', 'trips', 'agents', 'packages', 'cms'];
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('tab') as SuperAdminTab | null;
      if (urlTab && validTabs.includes(urlTab)) {
        setActiveTab(urlTab);
      } else {
        const storedTab = localStorage.getItem('bhabachyaka_super_admin_tab') as SuperAdminTab | null;
        if (storedTab && validTabs.includes(storedTab)) {
          setActiveTab(storedTab);
          const url = new URL(window.location.href);
          url.searchParams.set('tab', storedTab);
          window.history.replaceState(null, '', url.toString());
        }
      }
    } catch {}
  }, []);

  const handleTabChange = (tab: SuperAdminTab) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('bhabachyaka_super_admin_tab', tab);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState(null, '', url.toString());
    } catch {}
  };

  // New Company Onboard Form
  const [newCompany, setNewCompany] = useState({
    name: '',
    nameBn: '',
    code: '',
    contactEmail: '',
    contactPhone: '',
    domain: '',
    planCode: 'GROWTH',
    adminName: '',
  });

  const [notice, setNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  useEffect(() => {
    loadSuperAdminData();
  }, []);

  const loadSuperAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, bRes, rRes, tRes] = await Promise.all([
        fetch('/api/super-admin/stats').then((r) => r.json()).catch(() => ({})),
        fetch('/api/operator/buses').then((r) => r.json()).catch(() => ({ buses: [] })),
        fetch('/api/operator/routes').then((r) => r.json()).catch(() => ({ routes: [] })),
        fetch('/api/operator/trips').then((r) => r.json()).catch(() => ({ trips: [] })),
      ]);

      setAdminData(statsRes);
      setBuses(bRes.buses || []);
      setRoutes(rRes.routes || []);
      setTrips(tRes.trips || []);
    } catch (err) {
      console.error('Super Admin data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/super-admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompany),
      });
      const data = await res.json();
      if (data.success) {
        setIsOnboardModalOpen(false);
        setNotice(
          locale === 'bn'
            ? 'নতুন বাস কোম্পানি সফলভাবে অনবোর্ড ও সাবস্ক্রিপশন বরাদ্দ করা হয়েছে!'
            : 'New bus company onboarded successfully!'
        );
        setNewCompany({
          name: '',
          nameBn: '',
          code: '',
          contactEmail: '',
          contactPhone: '',
          domain: '',
          planCode: 'GROWTH',
          adminName: '',
        });
        loadSuperAdminData();
        setTimeout(() => setNotice(''), 4000);
      } else {
        setErrorNotice(data.error || 'Failed to onboard bus company');
        setTimeout(() => setErrorNotice(''), 4000);
      }
    } catch {
      setErrorNotice('Error onboarding bus company');
      setTimeout(() => setErrorNotice(''), 4000);
    }
  };

  const handleToggleTenantStatus = async (tenantId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch('/api/super-admin/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        loadSuperAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const metrics = adminData?.metrics || {
    totalOperators: 4,
    activeTenants: 3,
    totalBookings: 1248,
    grossRevenue: 182450,
  };

  // Filtered lists
  const filteredBuses = buses.filter(
    (b) =>
      b.regNumber.toLowerCase().includes(fleetSearch.toLowerCase()) ||
      b.fleetNumber?.toLowerCase().includes(fleetSearch.toLowerCase()) ||
      b.model?.toLowerCase().includes(fleetSearch.toLowerCase())
  );

  const filteredRoutes = routes.filter(
    (r) =>
      r.name.toLowerCase().includes(routeSearch.toLowerCase()) ||
      r.originCity.toLowerCase().includes(routeSearch.toLowerCase()) ||
      r.destinationCity.toLowerCase().includes(routeSearch.toLowerCase())
  );

  const filteredTrips = trips.filter(
    (t) =>
      t.route?.name?.toLowerCase().includes(tripSearch.toLowerCase()) ||
      t.bus?.regNumber?.toLowerCase().includes(tripSearch.toLowerCase()) ||
      t.driverName?.toLowerCase().includes(tripSearch.toLowerCase())
  );

  // Dynamic titles and subtitles
  const getTabHeader = () => {
    switch (activeTab) {
      case 'overview':
        return {
          title: locale === 'bn' ? 'সুপার অ্যাডমিন প্ল্যাটফর্ম ড্যাশবোর্ড' : 'Platform Overview & SaaS Command Center',
          subtitle: locale === 'bn' ? 'সার্বিক ক্লাউড পারফরম্যান্স, সাবস্ক্রিপশন মেট্রিক্স ও মাল্টি-টেন্যান্ট ইনফ্রাস্ট্রাকচার' : 'Overall cloud performance, subscription metrics, and multi-tenant infrastructure',
        };
      case 'tenants':
        return {
          title: locale === 'bn' ? 'বাস কোম্পানি ও মাল্টি-টেন্যান্ট ডিরেক্টরি' : 'Bus Operators & SaaS Multi-Tenant Directory',
          subtitle: locale === 'bn' ? 'সকল অনুমোদিত বাস অপারেটর কোম্পানি, লাইসেন্সিং ও ক্লাউড সাবস্ক্রিপশন প্ল্যান' : 'All authorized bus operator companies, licensing, and cloud subscription plans',
        };
      case 'fleet':
        return {
          title: locale === 'bn' ? 'মাস্টার বাস ও ফ্লিট ডিরেক্টরি' : 'Cross-Platform Bus Fleet Directory',
          subtitle: locale === 'bn' ? 'প্ল্যাটফর্মের সকল অপারেটরের অনুমোদিত বিলাসবহুল এসি ও নন-এসি কোচের তালিকা' : 'Comprehensive list of AC and Non-AC luxury coaches across all registered operators',
        };
      case 'routes':
        return {
          title: locale === 'bn' ? '৬৪ জেলা এক্সপ্রেসওয়ে রুট নেটওয়ার্ক' : '64 Districts Highway Route Network & Fares',
          subtitle: locale === 'bn' ? 'আন্তঃজেলা মহাসড়ক রুট, প্রতি কিমি ৩ টাকা দূরত্বের হিসাব ও স্ট্যান্ডার্ড ভাড়া' : 'Intercity highway routes, calculated distance fares, and scheduled travel times',
        };
      case 'trips':
        return {
          title: locale === 'bn' ? 'মাস্টার ট্রিপ শিডিউল ও সিট ইনভেন্টরি' : 'Master Trip Schedules & Real-time Seats',
          subtitle: locale === 'bn' ? 'সারাদেশে দৈনিক চলমান সকল আন্তঃজেলা ট্রিপ, ড্রাইভার ও সুপারভাইজার বরাদ্দ' : 'Nationwide scheduled bus departures, active crew assignments, and live seat maps',
        };
      case 'agents':
        return {
          title: locale === 'bn' ? 'কাউন্টার এজেন্ট ও স্টাফ ডিরেক্টরি' : 'Counter Agents & Staff Directory',
          subtitle: locale === 'bn' ? '৬৪ জেলার সকল কাউন্টারে অনুমোদিত সেলস এজেন্ট নিয়োগ ও পারমিশন কন্ট্রোল' : 'Authorized sales agents, counter ticket managers, and access permissions across 64 districts',
        };
      case 'packages':
        return {
          title: locale === 'bn' ? 'ট্যুর প্যাকেজ বুকিং ও ডিজিটাল ভাউচার' : 'Tour Package Bookings & Travel Vouchers',
          subtitle: locale === 'bn' ? 'গ্রাহকদের হলিডে ট্রাভেল প্যাকেজ বুকিং, এমএফএস পেমেন্ট রিসিট ও কিউআর টিকিট' : 'Holiday tour reservations, instant MFS payments, and official printable bus tickets with QR',
        };
      case 'cms':
        return {
          title: locale === 'bn' ? 'লাইভ সাইট ও মেনুবার এডিটর (CMS)' : 'Website & Navbar Live CMS Editor',
          subtitle: locale === 'bn' ? 'হোম স্ক্রিন, মেনুবার, কাউন্টার, প্যাকেজ, অফার এবং কনটাক্ট পেজের তথ্য ও ছবি এডিট করুন' : 'Edit homepage content, navigation menu, counters, packages, offers, and contact info live',
        };
    }
  };

  const headerInfo = getTabHeader();

  return (
    <div className="bg-[#F6F8FB] min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Notice Alerts */}
        {notice && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{notice}</span>
            </span>
            <button onClick={() => setNotice('')}><X className="w-4 h-4 text-emerald-600" /></button>
          </div>
        )}
        {errorNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>{errorNotice}</span>
            </span>
            <button onClick={() => setErrorNotice('')}><X className="w-4 h-4 text-red-600" /></button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: SUPER ADMIN DARK NAVY SIDEBAR (3 COLS)      */}
          {/* ========================================================= */}
          <aside className="lg:col-span-3 bg-[#0B1F3A] text-white rounded-3xl p-5 shadow-xl border border-slate-800 space-y-6">
            {/* Super Admin Brand & Profile Header */}
            <div className="pb-5 border-b border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-[#FF6B00] flex items-center justify-center font-black text-white text-xl shadow-md shrink-0">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div className="overflow-hidden">
                  <h2 className="font-black text-sm tracking-tight text-white truncate">
                    {locale === 'bn' ? 'সুপার অ্যাডমিন প্ল্যাটফর্ম' : 'Super Admin SaaS'}
                  </h2>
                  <span className="inline-block px-2.5 py-0.5 mt-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase">
                    {locale === 'bn' ? 'সফটওয়্যার মূল মালিক' : 'Software Owner'}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1.5 text-xs">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-3 mb-2 block">
                {locale === 'bn' ? 'প্রধান মেন্যু' : 'Main Menu'}
              </span>

              {[
                { id: 'overview', icon: LayoutDashboard, labelBn: 'ড্যাশবোর্ড ও সারসংক্ষেপ', labelEn: 'Overview & Accounts' },
                { id: 'tenants', icon: Building2, labelBn: 'বাস কোম্পানি ও সাবস্ক্রিপশন', labelEn: 'Bus Operators & Tenants' },
                { id: 'fleet', icon: Bus, labelBn: 'বাস ও মাস্টার ফ্লিট', labelEn: 'Bus Fleet Directory' },
                { id: 'routes', icon: MapPin, labelBn: 'রুট ও ভাড়ার তালিকা', labelEn: 'Routes & Fares' },
                { id: 'trips', icon: Calendar, labelBn: 'ট্রিপ শিডিউল ও সিট', labelEn: 'Trip Schedules' },
                { id: 'agents', icon: UserCheck, labelBn: '👨‍💼 কাউন্টার এজেন্ট ও স্টাফ', labelEn: '👨‍💼 Counter Agents & Staff' },
                { id: 'packages', icon: Ticket, labelBn: '🎒 ট্যুর প্যাকেজ বুকিং', labelEn: '🎒 Tour Package Bookings' },
                { id: 'cms', icon: Sliders, labelBn: '🎨 সাইট ও মেনুবার এডিটর', labelEn: '🎨 Website & Menu CMS' },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id as SuperAdminTab)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20'
                        : 'text-slate-300 hover:bg-[#153B63] hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{locale === 'bn' ? item.labelBn : item.labelEn}</span>
                  </button>
                );
              })}

              <div className="pt-4 mt-4 border-t border-slate-700/60 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-3 mb-2 block">
                  {locale === 'bn' ? 'অপারেশনাল কনসোল' : 'Operational Consoles'}
                </span>

                <Link
                  href={`/${locale}/operator/dashboard`}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-slate-300 hover:bg-[#153B63] hover:text-white transition-all font-semibold"
                >
                  <span className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    <span>{locale === 'bn' ? 'কোম্পানি ERP' : 'Operator ERP'}</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </Link>

                <Link
                  href={`/${locale}/counter/pos`}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-slate-300 hover:bg-[#153B63] hover:text-white transition-all font-semibold"
                >
                  <span className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>{locale === 'bn' ? 'কাউন্টার POS' : 'Counter POS'}</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </Link>

                <Link
                  href={`/${locale}/supervisor`}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-slate-300 hover:bg-[#153B63] hover:text-white transition-all font-semibold"
                >
                  <span className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-blue-400" />
                    <span>{locale === 'bn' ? 'ড্রাইভার ও সুপারভাইজার' : 'Crew Console'}</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </Link>

                <Link
                  href={`/${locale}`}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-slate-300 hover:bg-[#153B63] hover:text-white transition-all font-semibold"
                >
                  <span className="flex items-center gap-2.5">
                    <ExternalLink className="w-4 h-4 text-pink-400" />
                    <span>{locale === 'bn' ? 'লাইভ বুকিং সাইট' : 'Live Booking Portal'}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </div>
            </nav>

            {/* System Status Card */}
            <div className="bg-[#08182D] rounded-2xl p-4 border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-white font-bold text-xs">
                <span>{locale === 'bn' ? 'সিস্টেম ও সার্ভার স্ট্যাটাস' : 'System Status'}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                {locale === 'bn'
                  ? 'সকল ৬৪ জেলা, ক্লাউড টেন্যান্ট ও সার্ভার লাইভ'
                  : 'All 64 districts & multi-tenants operational'}
              </p>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: MAIN CONTENT AREA (9 COLS)                  */}
          {/* ========================================================= */}
          <main className="lg:col-span-9 space-y-6">
            {/* Top Bar Header Banner (Matching Company Admin Layout) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200 text-[10px] font-black uppercase">
                    SUPER ADMIN DASHBOARD
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-400 font-semibold">
                    {formatDate(new Date(), locale)}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-[#0B1F3A] tracking-tight">
                  {headerInfo.title}
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {headerInfo.subtitle}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setIsOnboardModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white font-black text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{locale === 'bn' ? '+ নতুন কোম্পানি অনবোর্ড' : '+ Onboard Company'}</span>
                </button>

                <button
                  type="button"
                  onClick={loadSuperAdminData}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  title="Refresh Data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* TAB 1: OVERVIEW & ACCOUNTS */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                {/* 4 Big Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        {locale === 'bn' ? 'সক্রিয় বাস কোম্পানি' : 'Bus Operators'}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF6B00] flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                    </div>
                    <strong className="text-2xl font-black text-[#0B1F3A] block">
                      {locale === 'bn' ? toBengaliDigits(adminData?.tenants?.length || 4) : adminData?.tenants?.length || 4}
                    </strong>
                    <span className="text-[11px] text-emerald-600 font-bold block">
                      {locale === 'bn' ? '৪টি কোম্পানি নিবন্ধিত' : '4 SaaS Tenants Live'}
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        {locale === 'bn' ? 'সক্রিয় সাবস্ক্রিপশন' : 'Active Subscriptions'}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Zap className="w-4 h-4" />
                      </div>
                    </div>
                    <strong className="text-2xl font-black text-indigo-700 block">
                      {locale === 'bn' ? toBengaliDigits(metrics.activeTenants || 3) : metrics.activeTenants || 3}
                    </strong>
                    <span className="text-[11px] text-indigo-600 font-bold block">
                      {locale === 'bn' ? '১০০% ক্লাউড অ্যাক্টিভ' : 'Enterprise & Growth Plans'}
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        {locale === 'bn' ? 'মোট টিকিট বুকিং' : 'Total Bookings'}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Ticket className="w-4 h-4" />
                      </div>
                    </div>
                    <strong className="text-2xl font-black text-emerald-700 block">
                      {locale === 'bn' ? toBengaliDigits(metrics.totalBookings) : metrics.totalBookings}
                    </strong>
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{locale === 'bn' ? '+১৮% মাসিক প্রবৃদ্ধি' : '+18% Month-on-Month'}</span>
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        {locale === 'bn' ? 'প্ল্যাটফর্ম গ্রস জিএমভি' : 'Gross GMV Revenue'}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <strong className="text-2xl font-black text-[#FF6B00] block">
                      {formatBDT(metrics.grossRevenue, locale)}
                    </strong>
                    <span className="text-[11px] text-slate-400 font-medium block">
                      {locale === 'bn' ? 'সংগৃহীত টিকেট ও প্যাকেজ' : 'Total Processed Volume'}
                    </span>
                  </div>
                </div>

                {/* 2 Visual Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: 7-Day Ticket Sales Line Graph */}
                  <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-extrabold text-sm text-[#0B1F3A] uppercase tracking-wider">
                          {locale === 'bn' ? 'দৈনিক টিকিট বিক্রির আয়তন (গত ৭ দিন)' : 'Ticket Sales Volume (Last 7 Days)'}
                        </h3>
                        <span className="text-xs text-slate-400 font-medium">
                          {locale === 'bn' ? 'অনলাইন ও কাউন্টার সম্মিলিত সেলস ভলিউম' : 'Online & Counter ticket sales aggregated'}
                        </span>
                      </div>
                      <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                        +18.4%
                      </span>
                    </div>

                    {/* Visual Bar Chart with Explicit Heights & Grid Guidelines */}
                    <div className="relative pt-6 pb-2">
                      {/* Horizontal Dashed Guidelines */}
                      <div className="absolute inset-x-0 top-6 h-40 flex flex-col justify-between pointer-events-none opacity-40">
                        <div className="border-b border-dashed border-slate-300 flex justify-between text-[9px] text-slate-400">
                          <span>৳ 120K</span>
                        </div>
                        <div className="border-b border-dashed border-slate-300 flex justify-between text-[9px] text-slate-400">
                          <span>৳ 80K</span>
                        </div>
                        <div className="border-b border-dashed border-slate-300 flex justify-between text-[9px] text-slate-400">
                          <span>৳ 40K</span>
                        </div>
                        <div className="border-b border-slate-300"></div>
                      </div>

                      {/* Bars Flex Row */}
                      <div className="relative h-52 flex items-end justify-between gap-2 sm:gap-4 px-2">
                        {[
                          { day: '18 Nov', val: 65, amount: '৳ 65,000', seats: '48 Seats' },
                          { day: '19 Nov', val: 78, amount: '৳ 78,500', seats: '56 Seats' },
                          { day: '20 Nov', val: 72, amount: '৳ 72,200', seats: '51 Seats' },
                          { day: '21 Nov', val: 89, amount: '৳ 89,000', seats: '64 Seats' },
                          { day: '22 Nov', val: 84, amount: '৳ 84,300', seats: '60 Seats' },
                          { day: '23 Nov', val: 96, amount: '৳ 96,800', seats: '72 Seats' },
                          { day: '24 Nov', val: 112, amount: '৳ 1,12,000', seats: '86 Seats' },
                        ].map((item, idx) => {
                          const barHeight = Math.round((item.val / 120) * 140);
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group z-10">
                              {/* Hover Tooltip */}
                              <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:-translate-y-1 mb-1 text-center pointer-events-none">
                                <span className="px-2 py-0.5 rounded-md bg-[#0B1F3A] text-[#FFB020] text-[10px] font-black shadow-lg block whitespace-nowrap">
                                  {item.amount}
                                </span>
                                <span className="text-[9px] text-slate-500 font-bold block">
                                  {item.seats}
                                </span>
                              </div>

                              {/* Bar Pillar */}
                              <div className="h-40 w-full flex items-end justify-center">
                                <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl overflow-hidden flex items-end shadow-inner">
                                  <div
                                    style={{ height: `${barHeight}px` }}
                                    className="w-full bg-gradient-to-t from-[#0B1F3A] via-[#153B63] to-[#FF6B00] rounded-t-xl group-hover:to-orange-400 transition-all duration-300 shadow-md group-hover:shadow-orange-500/40 flex items-start justify-center pt-1"
                                  >
                                    <span className="text-[9px] font-black text-white/90 drop-shadow-xs hidden sm:block">
                                      {item.val}K
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Day Label */}
                              <span className="text-[11px] font-bold text-slate-600 mt-2 block group-hover:text-[#FF6B00] transition-colors whitespace-nowrap">
                                {item.day}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right: Payment Methods Donut Breakdown */}
                  <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-sm text-[#0B1F3A] uppercase tracking-wider pb-3 border-b border-slate-100">
                      {locale === 'bn' ? 'পেমেন্ট পদ্ধতি বণ্টন' : 'Payment Method Share'}
                    </h3>

                    <div className="flex items-center justify-center py-4">
                      <div className="relative w-36 h-36 rounded-full border-8 border-pink-500 flex items-center justify-center border-t-amber-500 border-r-blue-600 border-b-emerald-600">
                        <div className="text-center">
                          <span className="text-xl font-black text-[#0B1F3A]">100%</span>
                          <span className="text-[10px] text-slate-400 block">DigiPay</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                          <span>bKash (বিকাশ)</span>
                        </span>
                        <strong className="text-slate-900 font-bold">45%</strong>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                          <span>Nagad (নগদ)</span>
                        </span>
                        <strong className="text-slate-900 font-bold">25%</strong>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                          <span>Card / Banking</span>
                        </span>
                        <strong className="text-slate-900 font-bold">15%</strong>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                          <span>Counter Cash (নগদ)</span>
                        </span>
                        <strong className="text-slate-900 font-bold">15%</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registered Bus Companies Quick Table */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#0B1F3A] uppercase tracking-wider">
                        {locale === 'bn' ? 'সাম্প্রতিক বাস কোম্পানি ও ক্লাউড টেন্যান্ট' : 'Registered Bus Companies'}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">
                        {locale === 'bn' ? 'নিবন্ধিত পরিবহন কোম্পানি ও তাদের বর্তমান স্ট্যাটাস' : 'Active bus operators and their SaaS license status'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleTabChange('tenants')}
                      className="text-xs text-[#FF6B00] font-black hover:underline flex items-center gap-1"
                    >
                      <span>{locale === 'bn' ? 'সকল কোম্পানি বিস্তারিত দেখুন' : 'View All Operators'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="pb-3 font-bold">কোম্পানির নাম</th>
                          <th className="pb-3 font-bold">কোড</th>
                          <th className="pb-3 font-bold">সাবস্ক্রিপশন প্ল্যান</th>
                          <th className="pb-3 font-bold">মেয়াদ সমাপ্তি</th>
                          <th className="pb-3 font-bold">বাস সংখ্যা</th>
                          <th className="pb-3 font-bold">স্ট্যাটাস</th>
                          <th className="pb-3 font-bold text-right">আইটি অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {adminData?.tenants?.map((tItem: any) => (
                          <tr key={tItem.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 font-bold text-[#0B1F3A]">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#FF6B00] flex items-center justify-center font-black text-xs">
                                  {tItem.name?.charAt(0) || 'B'}
                                </div>
                                <div>
                                  <span>{locale === 'bn' ? tItem.nameBn : tItem.name}</span>
                                  <span className="block text-[10px] text-slate-400 font-normal">{tItem.domain}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 font-mono text-slate-600">{tItem.code}</td>
                            <td className="py-3.5">
                              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 text-[11px]">
                                {tItem.plan}
                              </span>
                            </td>
                            <td className="py-3.5 text-slate-600">{formatDate(tItem.planExpires, locale)}</td>
                            <td className="py-3.5 font-black text-slate-900">{tItem.busesCount || 4}</td>
                            <td className="py-3.5">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                  tItem.status === 'ACTIVE'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {tItem.status}
                              </span>
                            </td>
                            <td className="py-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleToggleTenantStatus(tItem.id, tItem.status)}
                                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  tItem.status === 'ACTIVE'
                                    ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                }`}
                              >
                                {tItem.status === 'ACTIVE'
                                  ? (locale === 'bn' ? 'স্থগিত করুন' : 'Suspend')
                                  : (locale === 'bn' ? 'সক্রিয় করুন' : 'Activate')}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* System & Cloud Diagnostics Table */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-[#0B1F3A] uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
                    <span>{locale === 'bn' ? 'সার্ভার হেলথ ও ক্লাউড ইনফ্রাস্ট্রাকচার' : 'System Health & Infrastructure Diagnostics'}</span>
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Online (99.98% Uptime)</span>
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <strong className="block text-slate-800">Database</strong>
                        <span className="text-[10px] text-slate-400">Prisma / SQLite</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600">Online</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <strong className="block text-slate-800">Payment Gateway</strong>
                        <span className="text-[10px] text-slate-400">bKash / Nagad</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600">Online</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <strong className="block text-slate-800">Email Service</strong>
                        <span className="text-[10px] text-slate-400">SMTP Relay</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600">Online</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <strong className="block text-slate-800">SMS Gateway</strong>
                        <span className="text-[10px] text-slate-400">BD Telco API</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600">Online</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <strong className="block text-slate-800">Asset Cloud</strong>
                        <span className="text-[10px] text-slate-400">Localhost CDN</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TENANTS & BUS OPERATORS */}
            {activeTab === 'tenants' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                    <div>
                      <h3 className="font-extrabold text-base text-[#0B1F3A]">
                        {locale === 'bn' ? 'বাস কোম্পানি ও সাবস্ক্রিপশন ব্যবস্থাপনা' : 'Bus Operators & SaaS Tenants'}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {locale === 'bn'
                          ? 'অনবোর্ডকৃত কোম্পানিগুলোর সাবস্ক্রিপশন প্ল্যান, মেয়াদ এবং ক্লাউড অ্যাক্সেস নিয়ন্ত্রণ করুন।'
                          : 'Manage SaaS subscription plans, tenant domains, bus quotas, and active status.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsOnboardModalOpen(true)}
                      className="px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-black rounded-xl text-xs shadow flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{locale === 'bn' ? 'নতুন কোম্পানি অনবোর্ড করুন' : 'Onboard Company'}</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="pb-3 font-bold">কোম্পানির নাম ও ডোমেন</th>
                          <th className="pb-3 font-bold">কোড</th>
                          <th className="pb-3 font-bold">অফিসিয়াল যোগাযোগ</th>
                          <th className="pb-3 font-bold">সাবস্ক্রিপশন</th>
                          <th className="pb-3 font-bold">মেয়াদ সমাপ্তি</th>
                          <th className="pb-3 font-bold">বাস কোটা</th>
                          <th className="pb-3 font-bold">স্ট্যাটাস</th>
                          <th className="pb-3 font-bold text-right">আইটি অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {adminData?.tenants?.map((tItem: any) => (
                          <tr key={tItem.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 font-bold text-[#0B1F3A]">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center font-black text-sm shrink-0">
                                  {tItem.name?.charAt(0) || 'B'}
                                </div>
                                <div>
                                  <span className="block text-sm">{locale === 'bn' ? tItem.nameBn : tItem.name}</span>
                                  <span className="text-[11px] text-slate-400 font-normal">{tItem.domain}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 font-mono text-slate-700 font-bold">{tItem.code}</td>
                            <td className="py-4">
                              <span className="block text-slate-800 font-bold">{tItem.contactEmail}</span>
                              <span className="text-[10px] text-slate-400">{tItem.contactPhone || '+880 1711-000000'}</span>
                            </td>
                            <td className="py-4">
                              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-black border border-indigo-200 text-[11px]">
                                {tItem.plan}
                              </span>
                            </td>
                            <td className="py-4 text-slate-600 font-medium">
                              {formatDate(tItem.planExpires, locale)}
                            </td>
                            <td className="py-4 font-black text-slate-900">
                              {tItem.busesCount || 4} টি বাস
                            </td>
                            <td className="py-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                  tItem.status === 'ACTIVE'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {tItem.status}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleToggleTenantStatus(tItem.id, tItem.status)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                  tItem.status === 'ACTIVE'
                                    ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                }`}
                              >
                                {tItem.status === 'ACTIVE'
                                  ? (locale === 'bn' ? 'স্থগিত করুন (Suspend)' : 'Suspend')
                                  : (locale === 'bn' ? 'সক্রিয় করুন (Activate)' : 'Activate')}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MASTER BUS FLEET */}
            {activeTab === 'fleet' && (
              <div className="space-y-6 animate-fade-in">
                {/* 4 Stat Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">মোট অনুমোদিত বাস</span>
                    <strong className="text-2xl font-black text-[#0B1F3A]">{buses.length || 4}</strong>
                    <span className="text-[10px] text-slate-500 block">সক্রিয় ফ্লিট</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">এসি লাক্সারি কোচ</span>
                    <strong className="text-2xl font-black text-indigo-600">
                      {buses.filter((b) => b.isAc).length || 3}
                    </strong>
                    <span className="text-[10px] text-indigo-500 block">বিজনেস ও স্লিপার</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">নন-এসি স্ট্যান্ডার্ড</span>
                    <strong className="text-2xl font-black text-amber-600">
                      {buses.filter((b) => !b.isAc).length || 1}
                    </strong>
                    <span className="text-[10px] text-amber-500 block">ইকোনমি চেয়ার কোচ</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">মোট সিট ক্যাপাসিটি</span>
                    <strong className="text-2xl font-black text-emerald-600">
                      {buses.reduce((acc, b) => acc + (b.totalSeats || 36), 0) || 144}
                    </strong>
                    <span className="text-[10px] text-emerald-500 block">যাত্রী ধারণক্ষমতা</span>
                  </div>
                </div>

                {/* Fleet Table Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#0B1F3A] uppercase tracking-wider">
                        {locale === 'bn' ? 'মাস্টার বাস ও ফ্লিট ডিরেক্টরি' : 'Master Fleet Directory'}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">নিবন্ধিত পরিবহন কোচের তালিকা</span>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="বাস রেজি / মডেল খুঁজুন..."
                        value={fleetSearch}
                        onChange={(e) => setFleetSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="pb-3 font-bold">বাস রেজিস্ট্রেশন নম্বর</th>
                          <th className="pb-3 font-bold">ফ্লিট কোড</th>
                          <th className="pb-3 font-bold">কোচ মডেল</th>
                          <th className="pb-3 font-bold">ক্লাস ও ক্যাটাগরি</th>
                          <th className="pb-3 font-bold">সিট বিন্যাস</th>
                          <th className="pb-3 font-bold">মোট সিট</th>
                          <th className="pb-3 font-bold text-right">এসি স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredBuses.map((bus) => (
                          <tr key={bus.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 font-bold text-[#0B1F3A]">
                              <div className="flex items-center gap-2">
                                <Bus className="w-4 h-4 text-[#FF6B00]" />
                                <span>{bus.regNumber}</span>
                              </div>
                            </td>
                            <td className="py-3.5 font-mono text-slate-700 font-bold">{bus.fleetNumber || 'EX-101'}</td>
                            <td className="py-3.5 text-slate-800 font-semibold">{bus.model || 'Scania Multi-Axle K410'}</td>
                            <td className="py-3.5">
                              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 text-[11px]">
                                {bus.coachType}
                              </span>
                            </td>
                            <td className="py-3.5 font-mono text-slate-600">{bus.seatLayoutType || '2x2'}</td>
                            <td className="py-3.5 font-black text-slate-900">{bus.totalSeats} টি সিট</td>
                            <td className="py-3.5 text-right">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                  bus.isAc ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {bus.isAc ? 'AC Luxury' : 'Non-AC'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ROUTES & 64 DISTRICTS */}
            {activeTab === 'routes' && (
              <div className="space-y-6 animate-fade-in">
                {/* 4 Stat Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">মোট সচল রুট</span>
                    <strong className="text-2xl font-black text-[#0B1F3A]">{routes.length || 14}</strong>
                    <span className="text-[10px] text-slate-500 block">আন্তঃজেলা এক্সপ্রেসওয়ে</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">সংযুক্ত জেলা</span>
                    <strong className="text-2xl font-black text-emerald-600">৬৪ / ৬৪</strong>
                    <span className="text-[10px] text-emerald-500 block">সারাদেশে কভারেজ</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">দূরত্বভিত্তিক হিসাব</span>
                    <strong className="text-2xl font-black text-[#FF6B00]">৳ ৩ / কিমি</strong>
                    <span className="text-[10px] text-slate-500 block">স্ট্যান্ডার্ড বাস ভাড়া</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">সার্ভিস ফি</span>
                    <strong className="text-2xl font-black text-indigo-600">৳ ৫০</strong>
                    <span className="text-[10px] text-indigo-500 block">প্রতি টিকেট ইন্স্যুরেন্স</span>
                  </div>
                </div>

                {/* Routes Table Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#0B1F3A] uppercase tracking-wider">
                        {locale === 'bn' ? 'আন্তঃজেলা রুট ও ভাড়ার তালিকা' : 'Intercity Routes & Fares'}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">৬৪ জেলার এক্সপ্রেসওয়ে রুট নেটওয়ার্ক</span>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="রুট বা জেলা খুঁজুন..."
                        value={routeSearch}
                        onChange={(e) => setRouteSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="pb-3 font-bold">রুটের নাম</th>
                          <th className="pb-3 font-bold">যাত্রা শুরু (Origin)</th>
                          <th className="pb-3 font-bold">গন্তব্য (Destination)</th>
                          <th className="pb-3 font-bold">দূরত্ব (কিমি)</th>
                          <th className="pb-3 font-bold">আনুমানিক সময়</th>
                          <th className="pb-3 font-bold text-right">স্ট্যান্ডার্ড ভাড়া</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredRoutes.map((route) => (
                          <tr key={route.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 font-bold text-[#0B1F3A]">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#FF6B00]" />
                                <span>{route.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 text-slate-700 font-semibold">{route.originCity}</td>
                            <td className="py-3.5 text-slate-700 font-semibold">{route.destinationCity}</td>
                            <td className="py-3.5 font-mono text-slate-900 font-bold">{route.distanceKm} km</td>
                            <td className="py-3.5 text-slate-600">
                              {Math.floor(route.estDurationMinutes / 60)}h {route.estDurationMinutes % 60}m
                            </td>
                            <td className="py-3.5 text-right font-black text-[#FF6B00] text-sm">
                              {formatBDT(route.distanceKm ? Math.round(route.distanceKm * 3 + 50) : 1200, locale)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: TRIP SCHEDULES & SEATS */}
            {activeTab === 'trips' && (
              <div className="space-y-6 animate-fade-in">
                {/* 4 Stat Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">দৈনিক ট্রিপ সংখ্যা</span>
                    <strong className="text-2xl font-black text-[#0B1F3A]">{trips.length || 54}</strong>
                    <span className="text-[10px] text-slate-500 block">শিডিউল ডিপার্চার</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">আজকের ট্রিপ</span>
                    <strong className="text-2xl font-black text-emerald-600">৪২ টি</strong>
                    <span className="text-[10px] text-emerald-500 block">অন-রোড চলমান</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">সিট ইনভেন্টরি</span>
                    <strong className="text-2xl font-black text-indigo-600">১,৫১২+</strong>
                    <span className="text-[10px] text-indigo-500 block">লাইভ টিকিট সিট</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">ড্রাইভার ও ক্রু</span>
                    <strong className="text-2xl font-black text-amber-600">৮৪ জন</strong>
                    <span className="text-[10px] text-amber-500 block">রোস্টারে অন-ডিউটি</span>
                  </div>
                </div>

                {/* Trips Table Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#0B1F3A] uppercase tracking-wider">
                        {locale === 'bn' ? 'মাস্টার ট্রিপ শিডিউল ও সিট বিবরণী' : 'Scheduled Trip Departures'}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">লাইভ শিডিউল ও বাস বরাদ্দ</span>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="ট্রিপ বা ড্রাইভার খুঁজুন..."
                        value={tripSearch}
                        onChange={(e) => setTripSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="pb-3 font-bold">ছাড়ার সময়</th>
                          <th className="pb-3 font-bold">রুট</th>
                          <th className="pb-3 font-bold">নির্ধারিত বাস</th>
                          <th className="pb-3 font-bold">কোচ ক্লাস</th>
                          <th className="pb-3 font-bold">ড্রাইভার ও যোগাযোগ</th>
                          <th className="pb-3 font-bold">টিকেটের ভাড়া</th>
                          <th className="pb-3 font-bold text-right">স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredTrips.slice(0, 15).map((trip) => (
                          <tr key={trip.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 font-black text-[#0B1F3A]">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#FF6B00]" />
                                <span>{trip.departureTime || '08:00 AM'}</span>
                              </div>
                            </td>
                            <td className="py-3.5 font-bold text-slate-800">
                              {trip.route?.name || 'ঢাকা ➔ চট্টগ্রাম'}
                            </td>
                            <td className="py-3.5 font-mono text-slate-700 font-bold">
                              {trip.bus?.regNumber || 'ঢাকা মেট্রো-ব ১৫-৪১২৩'}
                            </td>
                            <td className="py-3.5">
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200">
                                {trip.bus?.coachType || 'BUSINESS_CLASS'}
                              </span>
                            </td>
                            <td className="py-3.5">
                              <span className="block font-bold text-slate-800">{trip.driverName || 'মো: রফিকুল ইসলাম'}</span>
                              <span className="text-[10px] text-slate-400">{trip.driverPhone || '01712-345678'}</span>
                            </td>
                            <td className="py-3.5 font-black text-[#FF6B00]">
                              {formatBDT(trip.baseFare || 1200, locale)}
                            </td>
                            <td className="py-3.5 text-right">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                ON SCHEDULE
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: COUNTER AGENTS & STAFF */}
            {activeTab === 'agents' && (
              <div className="animate-fade-in">
                <CounterAgentsManager locale={locale} isAdmin={true} />
              </div>
            )}

            {/* TAB 7: TOUR PACKAGES & VOUCHERS */}
            {activeTab === 'packages' && (
              <div className="animate-fade-in">
                <PackageBookingsAdmin locale={locale} />
              </div>
            )}

            {/* TAB 8: WEBSITE & MENU CMS */}
            {activeTab === 'cms' && (
              <div className="animate-fade-in">
                <SiteEditorCMS locale={locale} />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ONBOARD NEW BUS COMPANY MODAL                             */}
      {/* ========================================================= */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 text-slate-900 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#0B1F3A]">
                  {locale === 'bn' ? 'নতুন বাস কোম্পানি অনবোর্ড করুন' : 'Onboard New Bus Company'}
                </h3>
                <span className="text-xs text-slate-400 font-medium">SaaS মাল্টি-টেন্যান্ট ক্লাউড অ্যাকাউন্ট সেটআপ</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOnboardModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">কোম্পানির নাম (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Desh Travels"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00] font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">কোম্পানির নাম (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: দেশ ট্রাভেলস"
                    value={newCompany.nameBn}
                    onChange={(e) => setNewCompany({ ...newCompany, nameBn: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00] font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">কোম্পানি কোড (Unique Code) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DESH_TRAVELS"
                    value={newCompany.code}
                    onChange={(e) => setNewCompany({ ...newCompany, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:outline-none focus:border-[#FF6B00] font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">SaaS সাবস্ক্রিপশন প্ল্যান *</label>
                  <select
                    value={newCompany.planCode}
                    onChange={(e) => setNewCompany({ ...newCompany, planCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="STARTER">Starter (৳ 5,000 / mo)</option>
                    <option value="GROWTH">Growth (৳ 12,000 / mo)</option>
                    <option value="BUSINESS">Business (৳ 25,000 / mo)</option>
                    <option value="ENTERPRISE">Enterprise (৳ 50,000 / mo)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">অফিসিয়াল ইমেইল *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@deshtravels.com"
                    value={newCompany.contactEmail}
                    onChange={(e) => setNewCompany({ ...newCompany, contactEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">হটলাইন / মোবাইল</label>
                  <input
                    type="tel"
                    placeholder="+880 1711-XXXXXX"
                    value={newCompany.contactPhone}
                    onChange={(e) => setNewCompany({ ...newCompany, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">প্রাথমিক অ্যাডমিনের নাম</label>
                <input
                  type="text"
                  placeholder="যেমন: খন্দকার এনামুল হক (Managing Director)"
                  value={newCompany.adminName}
                  onChange={(e) => setNewCompany({ ...newCompany, adminName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-extrabold rounded-xl uppercase shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
              >
                কোম্পানি অনবোর্ড ও সাবস্ক্রিপশন বরাদ্দ করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
