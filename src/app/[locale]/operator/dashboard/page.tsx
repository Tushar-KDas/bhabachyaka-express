'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Bus,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  TrendingUp,
  Plus,
  X,
  CreditCard,
  Briefcase,
  UserCheck,
  Building2,
  BarChart3,
  LogOut,
  Smartphone,
  ExternalLink,
  Sliders,
  Ticket,
} from 'lucide-react';
import { getDictionary, Locale, formatBDT, formatTime, formatDate, toBengaliDigits } from '@/lib/i18n';
import SiteEditorCMS from '@/components/SiteEditorCMS';
import CounterAgentsManager from '@/components/CounterAgentsManager';
import PackageBookingsAdmin from '@/components/PackageBookingsAdmin';

interface Props {
  params: { locale: string };
}

export default function OperatorDashboardPage({ params }: Props) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;
  const t = getDictionary(locale);

  type OperatorTab = 'overview' | 'fleet' | 'routes' | 'trips' | 'staff' | 'packages' | 'cms';
  const [activeTab, setActiveTab] = useState<OperatorTab>('overview');

  // Restore and keep active tab on reload or page refresh
  useEffect(() => {
    try {
      const validTabs: OperatorTab[] = ['overview', 'fleet', 'routes', 'trips', 'staff', 'packages', 'cms'];
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('tab') as OperatorTab | null;
      if (urlTab && validTabs.includes(urlTab)) {
        setActiveTab(urlTab);
      } else {
        const storedTab = localStorage.getItem('bhabachyaka_operator_tab') as OperatorTab | null;
        if (storedTab && validTabs.includes(storedTab)) {
          setActiveTab(storedTab);
          const url = new URL(window.location.href);
          url.searchParams.set('tab', storedTab);
          window.history.replaceState(null, '', url.toString());
        }
      }
    } catch {}
  }, []);

  const handleTabChange = (tab: OperatorTab) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('bhabachyaka_operator_tab', tab);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState(null, '', url.toString());
    } catch {}
  };
  const [statsData, setStatsData] = useState<any>(null);
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [counters, setCounters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isBusModalOpen, setIsBusModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  // Form States
  const [newBus, setNewBus] = useState({
    regNumber: '',
    fleetNumber: '',
    coachType: 'BUSINESS_CLASS',
    model: '',
    totalSeats: 36,
    seatLayoutType: '2x2',
    isAc: true,
  });
  const [newRoute, setNewRoute] = useState({
    name: '',
    originCity: 'Dhaka',
    destinationCity: 'Chattogram',
    distanceKm: 250,
    estDurationMinutes: 345,
  });
  const [newTrip, setNewTrip] = useState({
    routeId: '',
    busId: '',
    departureTime: '',
    baseFare: 1200,
    driverName: '',
    driverPhone: '',
    supervisorName: '',
    supervisorPhone: '',
  });
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'COUNTER_AGENT',
    password: 'password123',
    counterId: '',
  });

  const [successNotice, setSuccessNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  useEffect(() => {
    loadAllOperatorData();
  }, []);

  const loadAllOperatorData = async () => {
    setLoading(true);
    try {
      const [sRes, bRes, rRes, tRes, stRes] = await Promise.all([
        fetch('/api/operator/stats').then((r) => r.json()),
        fetch('/api/operator/buses').then((r) => r.json()),
        fetch('/api/operator/routes').then((r) => r.json()),
        fetch('/api/operator/trips').then((r) => r.json()),
        fetch('/api/operator/staff').then((r) => r.json()),
      ]);

      setStatsData(sRes);
      setBuses(bRes.buses || []);
      setRoutes(rRes.routes || []);
      setTrips(tRes.trips || []);
      setStaffList(stRes.staff || []);
      setCounters(stRes.counters || []);

      if (rRes.routes?.length > 0 && bRes.buses?.length > 0) {
        setNewTrip((prev) => ({
          ...prev,
          routeId: rRes.routes[0].id,
          busId: bRes.buses[0].id,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/operator/buses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBus),
      });
      const data = await res.json();
      if (data.success) {
        setIsBusModalOpen(false);
        setSuccessNotice(locale === 'bn' ? 'নতুন বাস সফলভাবে ফ্লিটে যুক্ত হয়েছে!' : 'New bus added to fleet successfully!');
        loadAllOperatorData();
      } else {
        setErrorNotice(data.error || 'Failed to add bus');
      }
    } catch {
      setErrorNotice('Error adding bus');
    }
  };

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/operator/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoute),
      });
      const data = await res.json();
      if (data.success) {
        setIsRouteModalOpen(false);
        setSuccessNotice(locale === 'bn' ? 'নতুন রুট সফলভাবে তৈরি হয়েছে!' : 'New route created successfully!');
        loadAllOperatorData();
      } else {
        setErrorNotice(data.error || 'Failed to add route');
      }
    } catch {
      setErrorNotice('Error adding route');
    }
  };

  const handleAddTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/operator/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrip),
      });
      const data = await res.json();
      if (data.success) {
        setIsTripModalOpen(false);
        setSuccessNotice(locale === 'bn' ? 'নতুন ট্রিপ ও সিট ইনভেন্টরি সফলভাবে শিডিউল হয়েছে!' : 'Trip scheduled and seat inventory generated!');
        loadAllOperatorData();
      } else {
        setErrorNotice(data.error || 'Failed to schedule trip');
      }
    } catch {
      setErrorNotice('Error scheduling trip');
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/operator/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff),
      });
      const data = await res.json();
      if (data.success) {
        setIsStaffModalOpen(false);
        setSuccessNotice(locale === 'bn' ? 'কর্মচারীর আইডি সফলভাবে তৈরি হয়েছে!' : 'Staff account created successfully!');
        loadAllOperatorData();
      } else {
        setErrorNotice(data.error || 'Failed to create staff account');
      }
    } catch {
      setErrorNotice('Error creating staff account');
    }
  };

  const metrics = statsData?.metrics || {
    todayBookings: 42,
    todaySales: 58420,
    activeBuses: 4,
    occupancyRate: 84,
  };

  return (
    <div className="bg-[#F6F8FB] min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Operator Dark Navy Sidebar (3 Cols on desktop) */}
          <aside className="lg:col-span-3 bg-[#0B1F3A] text-white rounded-3xl p-5 shadow-xl border border-slate-800 space-y-6">
            {/* Operator Brand & Profile Header */}
            <div className="pb-5 border-b border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-amber-500 flex items-center justify-center font-black text-white text-xl shadow-md">
                  ভ
                </div>
                <div>
                  <h2 className="font-black text-sm tracking-tight text-white">
                    {locale === 'bn' ? 'ভ্যাবাচ্যাকা এক্সপ্রেস' : 'Bhabachyaka Express'}
                  </h2>
                  <span className="inline-block px-2 py-0.5 mt-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    {locale === 'bn' ? 'কোম্পানি অ্যাডমিন' : 'Operator ERP'}
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
                { id: 'fleet', icon: Bus, labelBn: 'বাস ও ফ্লিট ব্যবস্থাপনা', labelEn: 'Bus Fleet' },
                { id: 'routes', icon: MapPin, labelBn: 'রুট ও ভাড়ার তালিকা', labelEn: 'Routes & Fares' },
                { id: 'trips', icon: Calendar, labelBn: 'ট্রিপ শিডিউল ও সিট', labelEn: 'Trip Schedules' },
                { id: 'staff', icon: Users, labelBn: '👨‍💼 কাউন্টার এজেন্ট ও স্টাফ', labelEn: '👨‍💼 Counter Agents & Staff' },
                { id: 'packages', icon: Ticket, labelBn: '🎒 ট্যুর প্যাকেজ বুকিং', labelEn: '🎒 Tour Package Bookings' },
                { id: 'cms', icon: Sliders, labelBn: '🎨 সাইট ও মেনুবার এডিটর', labelEn: '🎨 Website & Menu CMS' },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id as any)}
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
                  {locale === 'bn' ? 'দ্রুত একসেস' : 'Operational Consoles'}
                </span>

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
                  href={`/${locale}/super-admin`}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-slate-300 hover:bg-[#153B63] hover:text-white transition-all font-semibold"
                >
                  <span className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>{locale === 'bn' ? 'সুপার অ্যাডমিন' : 'Super Admin'}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </div>
            </nav>

            {/* Operator Quick Status Widget */}
            <div className="p-3.5 rounded-2xl bg-[#153B63]/60 border border-slate-700/40 text-[11px] space-y-1 text-slate-300">
              <div className="flex items-center justify-between text-white font-bold">
                <span>{locale === 'bn' ? 'সিস্টেম স্ট্যাটাস' : 'System Status'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-slate-400 text-[10px]">
                {locale === 'bn' ? 'সবগুলো কাউন্টার ও বাস ট্র্যাকিং সক্রিয়' : 'All terminals & GPS tracking live'}
              </p>
            </div>
          </aside>

          {/* Right Column: Main Content Area (9 Cols) */}
          <main className="lg:col-span-9 space-y-6">
            {/* Top Bar Header Banner */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-orange-50 text-[#FF6B00] border border-orange-200 text-[10px] font-black uppercase">
                    ERP DASHBOARD
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 font-semibold">{formatDate(new Date(), locale)}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-[#0B1F3A]">
                  {activeTab === 'overview' && (locale === 'bn' ? 'ড্যাশবোর্ড - আজকের সারসংক্ষেপ' : 'Dashboard - Daily Overview')}
                  {activeTab === 'fleet' && (locale === 'bn' ? 'বাস ও ফ্লিট ব্যবস্থাপনা' : 'Bus Fleet Inventory')}
                  {activeTab === 'routes' && (locale === 'bn' ? 'রুট ও ভাড়ার তালিকা' : 'Routes & Fares')}
                  {activeTab === 'trips' && (locale === 'bn' ? 'ট্রিপ শিডিউল ও সিট ইনভেন্টরি' : 'Scheduled Departures')}
                  {activeTab === 'staff' && (locale === 'bn' ? 'কর্মচারী ও স্টাফ আইডি' : 'Staff & Crew Directory')}
                </h1>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsTripModalOpen(true)}
                  className="px-3.5 py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{locale === 'bn' ? 'ট্রিপ শিডিউল' : 'New Trip'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsBusModalOpen(true)}
                  className="px-3.5 py-2 bg-[#0B1F3A] hover:bg-[#153B63] text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{locale === 'bn' ? 'নতুন বাস' : 'Add Bus'}</span>
                </button>
              </div>
            </div>

            {successNotice && (
              <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{successNotice}</span>
              </div>
            )}

            {errorNotice && (
              <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{errorNotice}</span>
              </div>
            )}

            {/* TAB 1: ACCOUNTS & OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                {/* 4 KPI Metric Cards (Reference Match) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.operator.todayBookings}</span>
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                    </div>
                    <strong className="text-2xl font-black text-[#0B1F3A] block">
                      {locale === 'bn' ? toBengaliDigits(metrics.todayBookings) : metrics.todayBookings}
                    </strong>
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+14% vs গতকাল</span>
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.operator.todaySales}</span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <strong className="text-2xl font-black text-[#16A34A] block">
                      {formatBDT(metrics.todaySales, locale)}
                    </strong>
                    <span className="text-[11px] text-slate-400 font-semibold">কাউন্টার ও অনলাইন মিলিয়ে</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.operator.occupancy}</span>
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                    </div>
                    <strong className="text-2xl font-black text-[#0B1F3A] block">
                      {locale === 'bn' ? `${toBengaliDigits(metrics.occupancyRate)}%` : `${metrics.occupancyRate}%`}
                    </strong>
                    <span className="text-[11px] text-emerald-600 font-bold">সন্তোষজনক অকুপেন্সি</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.operator.activeBuses}</span>
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Bus className="w-4 h-4" />
                      </div>
                    </div>
                    <strong className="text-2xl font-black text-[#0B1F3A] block">
                      {locale === 'bn' ? toBengaliDigits(buses.length || 4) : buses.length || 4}
                    </strong>
                    <span className="text-[11px] text-slate-400 font-semibold">অন-রোড সক্রিয় বাস</span>
                  </div>
                </div>

                {/* Income & Expense Accounting Ledger */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-black text-sm text-[#0B1F3A] uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#FF6B00]" />
                      <span>{locale === 'bn' ? 'কোম্পানির দৈনিক আয়-ব্যয় হিসাব (Accounting Ledger)' : 'Daily Income & Expense Ledger'}</span>
                    </h3>
                    <span className="text-xs font-semibold text-slate-400">{formatDate(new Date(), locale)}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                      <span className="text-slate-600 font-bold block">মোট টিকিট বিক্রি আয় (Gross Revenue)</span>
                      <strong className="text-xl font-black text-emerald-700 block">
                        {formatBDT(metrics.todaySales, locale)}
                      </strong>
                      <span className="text-[11px] text-slate-500">অনলাইন ও কাউন্টার টিকিট সংগ্রহ</span>
                    </div>

                    <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-1">
                      <span className="text-slate-600 font-bold block">অনুমোদিত খরচ ও জ্বালানি (Fuel & Expenses)</span>
                      <strong className="text-xl font-black text-red-600 block">
                        {formatBDT(12500, locale)}
                      </strong>
                      <span className="text-[11px] text-slate-500">হাইওয়ে টোল, ফুয়েল ও স্টাফ অ্যালাউন্স</span>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-1">
                      <span className="text-slate-600 font-bold block">কোম্পানির নিট ক্যাশ স্থিতি (Net Balance)</span>
                      <strong className="text-xl font-black text-blue-700 block">
                        {formatBDT(metrics.todaySales - 12500, locale)}
                      </strong>
                      <span className="text-[11px] text-emerald-600 font-bold">লাভজনক ব্যালেন্স</span>
                    </div>
                  </div>
                </div>

                {/* 2 Visual Charts: Sales Trend & Payment Share (Reference Match) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: 7-Day Ticket Sales Volume Bar/Line Chart */}
                  <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <div>
                        <h4 className="font-black text-sm text-[#0B1F3A] uppercase tracking-wider">
                          {locale === 'bn' ? 'সাপ্তাহিক টিকিট বিক্রয় ট্রেন্ড' : 'Weekly Sales Trend'}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium">গত ৭ দিনের বুকিং গ্রাফ</span>
                      </div>
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        +18.4% বৃদ্ধি
                      </span>
                    </div>

                    <div className="h-52 w-full flex flex-col justify-end pt-4">
                      <div className="flex-1 flex items-end justify-between gap-3 px-2">
                        {[
                          { day: 'শনি', val: 52, amount: '৳ ৫২K' },
                          { day: 'রবি', val: 68, amount: '৳ ৬৮K' },
                          { day: 'সোম', val: 60, amount: '৳ ৬০K' },
                          { day: 'মঙ্গল', val: 75, amount: '৳ ৭৫K' },
                          { day: 'বুধ', val: 70, amount: '৳ ৭০K' },
                          { day: 'বৃহঃ', val: 88, amount: '৳ ৮৮K' },
                          { day: 'শুক্র', val: 95, amount: '৳ ৯৫K' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                            <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.amount}
                            </span>
                            <div
                              style={{ height: `${(item.val / 100) * 100}%` }}
                              className="w-full max-w-[36px] bg-gradient-to-t from-[#0B1F3A] to-[#FF6B00] rounded-t-lg group-hover:to-orange-400 transition-all shadow-sm"
                            ></div>
                            <span className="text-[10px] font-bold text-slate-500">{item.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Payment Method Breakdown Donut */}
                  <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="pb-3 border-b border-slate-100">
                      <h4 className="font-black text-sm text-[#0B1F3A] uppercase tracking-wider">
                        {locale === 'bn' ? 'পেমেন্ট মেথড বণ্টন' : 'Payment Breakdown'}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-medium">আজকের সংগৃহীত আয়ের অনুপাত</span>
                    </div>

                    <div className="space-y-3 pt-2 text-xs">
                      {[
                        { name: 'bKash (বিকাশ)', pct: 45, color: 'bg-pink-600', text: 'text-pink-600' },
                        { name: 'Nagad (নগদ)', pct: 30, color: 'bg-orange-500', text: 'text-orange-500' },
                        { name: 'কাউন্টার ক্যাশ (Counter Cash)', pct: 15, color: 'bg-emerald-600', text: 'text-emerald-600' },
                        { name: 'Visa / MasterCard', pct: 10, color: 'bg-blue-600', text: 'text-blue-600' },
                      ].map((p, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className="text-slate-700">{p.name}</span>
                            <span className={p.text}>{p.pct}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.pct}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Bookings Table */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-black text-sm text-[#0B1F3A] uppercase tracking-wider">
                      {locale === 'bn' ? 'সাম্প্রতিক বুকিং লেনদেন' : 'Recent Bookings'}
                    </h3>
                    <span className="text-xs font-semibold text-slate-400">
                      {statsData?.recentBookings?.length || 0} টি সাম্প্রতিক লেনদেন
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="pb-3 font-bold">PNR</th>
                          <th className="pb-3 font-bold">যাত্রী</th>
                          <th className="pb-3 font-bold">রুট</th>
                          <th className="pb-3 font-bold">সিট</th>
                          <th className="pb-3 font-bold">ভাড়া</th>
                          <th className="pb-3 font-bold">স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {statsData?.recentBookings?.map((b: any) => (
                          <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 font-mono font-bold text-[#FF6B00]">{b.pnr}</td>
                            <td className="py-3.5">
                              <span className="font-bold text-slate-900 block">{b.customerName}</span>
                              <span className="text-[11px] text-slate-400">{b.customerPhone}</span>
                            </td>
                            <td className="py-3.5 text-slate-700">{b.route}</td>
                            <td className="py-3.5 font-black text-slate-900">{b.seats}</td>
                            <td className="py-3.5 font-bold text-slate-900">{formatBDT(b.amount, locale)}</td>
                            <td className="py-3.5">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                {b.status}
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

            {/* TAB 2: BUS & FLEET */}
            {activeTab === 'fleet' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                  <div>
                    <h3 className="font-black text-sm text-[#0B1F3A] uppercase tracking-wider">
                      {locale === 'bn' ? 'কোম্পানির বাস ও ফ্লিট তালিকা' : 'Company Bus Fleet'}
                    </h3>
                    <span className="text-xs text-slate-400 font-semibold">{buses.length} টি সক্রিয় কোচ</span>
                  </div>
                  <button
                    onClick={() => setIsBusModalOpen(true)}
                    className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-extrabold rounded-xl text-xs shadow flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{locale === 'bn' ? '+ নতুন বাস যুক্ত করুন' : '+ Add New Bus'}</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="pb-3 font-bold">বাস রেজিস্ট্রেশন নম্বর</th>
                        <th className="pb-3 font-bold">ফ্লিট কোড</th>
                        <th className="pb-3 font-bold">কোচ মডেল</th>
                        <th className="pb-3 font-bold">সিট সংখ্যা</th>
                        <th className="pb-3 font-bold">লেআউট</th>
                        <th className="pb-3 font-bold">টাইপ</th>
                        <th className="pb-3 font-bold">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {buses.map((bus) => (
                        <tr key={bus.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 font-bold text-slate-900">{bus.regNumber}</td>
                          <td className="py-3.5 font-mono text-slate-600">{bus.fleetNumber}</td>
                          <td className="py-3.5 font-medium text-slate-800">{bus.model}</td>
                          <td className="py-3.5 font-bold">{bus.totalSeats} সিট</td>
                          <td className="py-3.5 text-slate-600">{bus.seatLayoutType}</td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${bus.isAc ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'}`}>
                              {bus.isAc ? 'AC Coach' : 'Non-AC'}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {bus.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: ROUTES & FARES */}
            {activeTab === 'routes' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                  <div>
                    <h3 className="font-black text-sm text-[#0B1F3A] uppercase tracking-wider">
                      {locale === 'bn' ? 'রুট ও ভাড়ার তালিকা' : 'Routes & Fares'}
                    </h3>
                    <span className="text-xs text-slate-400 font-semibold">{routes.length} টি অনুমোদিত রুট</span>
                  </div>
                  <button
                    onClick={() => setIsRouteModalOpen(true)}
                    className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-extrabold rounded-xl text-xs shadow flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{locale === 'bn' ? '+ নতুন রুট যুক্ত করুন' : '+ Add New Route'}</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="pb-3 font-bold">রুটের নাম</th>
                        <th className="pb-3 font-bold">উৎস ও গন্তব্য</th>
                        <th className="pb-3 font-bold">দূরত্ব (কিমি)</th>
                        <th className="pb-3 font-bold">আনুমানিক সময়</th>
                        <th className="pb-3 font-bold">স্টপ সংখ্যা</th>
                        <th className="pb-3 font-bold">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {routes.map((route) => (
                        <tr key={route.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 font-bold text-slate-900">{locale === 'bn' ? route.nameBn : route.name}</td>
                          <td className="py-3.5 text-slate-700">{route.originCity} ➔ {route.destinationCity}</td>
                          <td className="py-3.5 font-mono">{route.distanceKm} km</td>
                          <td className="py-3.5 text-slate-600">{Math.floor(route.estDurationMinutes / 60)}h {route.estDurationMinutes % 60}m</td>
                          <td className="py-3.5 font-bold text-[#FF6B00]">{route.stops?.length || 2} টি স্টপ</td>
                          <td className="py-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {route.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: TRIP SCHEDULES */}
            {activeTab === 'trips' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                  <div>
                    <h3 className="font-black text-sm text-[#0B1F3A] uppercase tracking-wider">
                      {locale === 'bn' ? 'ট্রিপ শিডিউল ও টিকিট ইনভেন্টরি' : 'Scheduled Departures & Seats'}
                    </h3>
                    <span className="text-xs text-slate-400 font-semibold">{trips.length} টি নির্ধারিত ট্রিপ</span>
                  </div>
                  <button
                    onClick={() => setIsTripModalOpen(true)}
                    className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-extrabold rounded-xl text-xs shadow flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{locale === 'bn' ? '+ নতুন ট্রিপ শিডিউল করুন' : '+ Schedule New Trip'}</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="pb-3 font-bold">যাত্রার সময়</th>
                        <th className="pb-3 font-bold">রুট</th>
                        <th className="pb-3 font-bold">বাস</th>
                        <th className="pb-3 font-bold">ভাড়া</th>
                        <th className="pb-3 font-bold">ড্রাইভার ও সুপারভাইজার</th>
                        <th className="pb-3 font-bold">খালি সিট</th>
                        <th className="pb-3 font-bold">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {trips.map((trip) => (
                        <tr key={trip.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 font-bold text-[#0B1F3A]">
                            {formatTime(trip.departureTime, locale)}
                            <span className="block text-[10px] text-slate-400">{formatDate(trip.departureTime, locale)}</span>
                          </td>
                          <td className="py-3.5 font-bold">{locale === 'bn' ? trip.routeBn : trip.route}</td>
                          <td className="py-3.5 text-slate-600 font-mono text-[11px]">{trip.busReg}</td>
                          <td className="py-3.5 font-black text-slate-900">{formatBDT(trip.baseFare, locale)}</td>
                          <td className="py-3.5 text-slate-600">
                            <span className="block font-medium">{trip.driverName}</span>
                            <span className="block text-[10px] text-slate-400">{trip.supervisorName}</span>
                          </td>
                          <td className="py-3.5">
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-black rounded-lg border border-emerald-200">
                              {trip.availableSeats} সিট বাকি
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              {trip.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: STAFF & COUNTER AGENTS MANAGEMENT */}
            {activeTab === 'staff' && (
              <div className="space-y-6">
                <CounterAgentsManager locale={locale} isAdmin={false} />
              </div>
            )}

            {/* TAB 6: PACKAGE BOOKINGS */}
            {activeTab === 'packages' && (
              <div className="space-y-6">
                <PackageBookingsAdmin locale={locale} />
              </div>
            )}

            {/* CMS Tab: Home Screen & Menu Editor */}
            {activeTab === 'cms' && (
              <div className="space-y-6">
                <SiteEditorCMS locale={locale} />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MODAL 1: ADD BUS */}
      {isBusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-slate-900 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-[#0B1F3A]">নতুন বাস যুক্ত করুন (Add Bus)</h3>
              <button onClick={() => setIsBusModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddBus} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">বাস রেজিস্ট্রেশন নম্বর *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ঢাকা মেট্রো-ব ১৪-৯৯১১"
                  value={newBus.regNumber}
                  onChange={(e) => setNewBus({ ...newBus, regNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">কোচ মডেল ও ব্র্যান্ড *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: Scania Multi-Axle K410"
                  value={newBus.model}
                  onChange={(e) => setNewBus({ ...newBus, model: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">মোট সিট</label>
                  <input
                    type="number"
                    value={newBus.totalSeats}
                    onChange={(e) => setNewBus({ ...newBus, totalSeats: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">সিট লেআউট</label>
                  <select
                    value={newBus.seatLayoutType}
                    onChange={(e) => setNewBus({ ...newBus, seatLayoutType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="2x2">2x2 Standard</option>
                    <option value="2x1">2x1 Royal Sleeper</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isAc"
                  checked={newBus.isAc}
                  onChange={(e) => setNewBus({ ...newBus, isAc: e.target.checked })}
                  className="w-4 h-4 text-[#FF6B00]"
                />
                <label htmlFor="isAc" className="font-bold text-slate-700">এসি কোচ (Air Conditioned)</label>
              </div>
              <button type="submit" className="w-full py-3 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-extrabold rounded-xl uppercase">
                বাস যুক্ত করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD ROUTE */}
      {isRouteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-slate-900 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-[#0B1F3A]">নতুন রুট যুক্ত করুন (Add Route)</h3>
              <button onClick={() => setIsRouteModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddRoute} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">যাত্রার স্থান (Origin) *</label>
                  <input
                    type="text"
                    required
                    value={newRoute.originCity}
                    onChange={(e) => setNewRoute({ ...newRoute, originCity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">গন্তব্য স্থান (Destination) *</label>
                  <input
                    type="text"
                    required
                    value={newRoute.destinationCity}
                    onChange={(e) => setNewRoute({ ...newRoute, destinationCity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">দূরত্ব (কিলোমিটার)</label>
                  <input
                    type="number"
                    value={newRoute.distanceKm}
                    onChange={(e) => setNewRoute({ ...newRoute, distanceKm: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">সময় (মিনিট)</label>
                  <input
                    type="number"
                    value={newRoute.estDurationMinutes}
                    onChange={(e) => setNewRoute({ ...newRoute, estDurationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-extrabold rounded-xl uppercase">
                রুট যুক্ত করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD TRIP */}
      {isTripModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-slate-900 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-[#0B1F3A]">নতুন ট্রিপ শিডিউল করুন (Create Trip)</h3>
              <button onClick={() => setIsTripModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddTrip} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">রুট নির্বাচন করুন *</label>
                <select
                  value={newTrip.routeId}
                  onChange={(e) => setNewTrip({ ...newTrip, routeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>{r.nameBn || r.name} ({r.originCity} ➔ {r.destinationCity})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">বাস নির্ধারণ করুন *</label>
                <select
                  value={newTrip.busId}
                  onChange={(e) => setNewTrip({ ...newTrip, busId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>{b.regNumber} - {b.model} ({b.isAc ? 'AC' : 'Non-AC'})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ছাড়ার তারিখ ও সময় *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newTrip.departureTime}
                    onChange={(e) => setNewTrip({ ...newTrip, departureTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">সিট প্রতি বেস ভাড়া (টাকা) *</label>
                  <input
                    type="number"
                    required
                    value={newTrip.baseFare}
                    onChange={(e) => setNewTrip({ ...newTrip, baseFare: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ড্রাইভার</label>
                  <input
                    type="text"
                    placeholder="মোঃ রফিকুল ইসলাম"
                    value={newTrip.driverName}
                    onChange={(e) => setNewTrip({ ...newTrip, driverName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">সুপারভাইজার</label>
                  <input
                    type="text"
                    placeholder="মোঃ জহিরুল হক"
                    value={newTrip.supervisorName}
                    onChange={(e) => setNewTrip({ ...newTrip, supervisorName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-extrabold rounded-xl uppercase">
                ট্রিপ শিডিউল করুন ও সিট জেনারেট করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD STAFF */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-slate-900 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-[#0B1F3A]">নতুন কর্মচারী আইডি তৈরি (Add Employee)</h3>
              <button onClick={() => setIsStaffModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">কর্মচারীর পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ আল আমিন"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">লগইন ইমেইল *</label>
                <input
                  type="email"
                  required
                  placeholder="agent@bhabachyaka.com"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">মোবাইল নম্বর</label>
                  <input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ভূমিকা / রোল *</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="COUNTER_AGENT">কাউন্টার বুকিং এজেন্ট</option>
                    <option value="BOARDING_STAFF">বাস ড্রাইভার / সুপারভাইজার</option>
                    <option value="COUNTER_MANAGER">কাউন্টার ম্যানেজার</option>
                    <option value="TRANSPORT_MANAGER">ট্রান্সপোর্ট ম্যানেজার</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">কাউন্টার নির্ধারণ (ঐচ্ছিক)</label>
                <select
                  value={newStaff.counterId}
                  onChange={(e) => setNewStaff({ ...newStaff, counterId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="">হেড অফিস / যেকোনো কাউন্টার</option>
                  {counters.map((c) => (
                    <option key={c.id} value={c.id}>{c.nameBn || c.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full py-3 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-extrabold rounded-xl uppercase">
                আইডি তৈরি করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
