'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  User,
  Ticket,
  Calendar,
  Clock,
  Printer,
  XCircle,
  ShieldCheck,
  MapPin,
  ChevronRight,
  Headphones,
  Award,
  CreditCard,
  Bell,
  Settings,
  History,
  QrCode,
  Bus,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Star,
  Tag,
  Gift,
  AlertCircle,
  Lock,
  Phone,
  Mail,
  FileText,
  Sparkles,
  Search,
  ThumbsUp,
} from 'lucide-react';
import { getDictionary, Locale, formatBDT, formatTime, formatDate, toBengaliDigits } from '@/lib/i18n';

interface Props {
  params: { locale: string };
}

type CustomerTab = 'bookings' | 'history' | 'notifications' | 'profile';

interface PastTripRecord {
  id: string;
  pnr: string;
  routeName: string;
  routeNameBn: string;
  departureTime: string;
  busReg: string;
  busModel: string;
  busModelBn: string;
  coachType: string;
  coachTypeBn: string;
  seats: string[];
  boardingPoint: string;
  dropPoint: string;
  fare: number;
  status: 'COMPLETED' | 'CANCELLED';
  distanceKm: number;
  rating?: number;
}

interface NotificationItem {
  id: string;
  type: 'booking' | 'reward' | 'route' | 'offer';
  titleBn: string;
  titleEn: string;
  messageBn: string;
  messageEn: string;
  timeBn: string;
  timeEn: string;
  read: boolean;
  link?: string;
  pnr?: string;
}

export default function AccountPage({ params }: Props) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;
  const t = getDictionary(locale);

  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCustomerTab, setActiveCustomerTab] = useState<CustomerTab>('bookings');

  // History tab state & filter
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [selectedReceiptTrip, setSelectedReceiptTrip] = useState<PastTripRecord | null>(null);
  const [ratingTrip, setRatingTrip] = useState<PastTripRecord | null>(null);
  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [ratingSuccessMsg, setRatingSuccessMsg] = useState<string>('');

  // Notifications state
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      type: 'booking',
      titleBn: 'বুকিং নিশ্চিত হয়েছে (কনফার্মড)',
      titleEn: 'Booking Confirmed',
      messageBn: 'আপনার ঢাকা ➔ চট্টগ্রাম বাসের টিকিট নিশ্চিত হয়েছে (PNR: BE9MGFREQ)। নির্ধারিত সময়ের ৩০ মিনিট পূর্বে কাউন্টারে রিপোর্ট করুন।',
      messageEn: 'Your bus ticket for Dhaka to Chattogram is confirmed (PNR: BE9MGFREQ). Please report to counter 30 mins before departure.',
      timeBn: '২ ঘণ্টা আগে',
      timeEn: '2 hours ago',
      read: false,
      pnr: 'BE9MGFREQ',
      link: `/${locale}/booking/confirmation/BE9MGFREQ`,
    },
    {
      id: 'notif-2',
      type: 'reward',
      titleBn: '🎉 ২৫০ রিওয়ার্ড পয়েন্ট যোগ হয়েছে!',
      titleEn: '250 Reward Points Added!',
      messageBn: 'আপনার সফল অনলাইন ট্রাভেলের জন্য অ্যাকাউন্টে ২৫০ লয়্যালটি পয়েন্ট যুক্ত করা হয়েছে। পরবর্তী ট্রিপে এই পয়েন্ট রূপান্তর করে ছাড় পাবেন।',
      messageEn: '250 loyalty reward points added to your passenger account. Redeem them on your next trip for instant discounts.',
      timeBn: '১ দিন আগে',
      timeEn: '1 day ago',
      read: false,
    },
    {
      id: 'notif-3',
      type: 'route',
      titleBn: '🚨 পদ্মা সেতু এক্সপ্রেসওয়ে নতুন হাই-কমফোর্ট রুট চালু',
      titleEn: 'New High-Comfort Route via Padma Expressway',
      messageBn: 'ঢাকা থেকে বরিশাল ও কুয়াকাটা রুটে আমাদের নতুন প্রিমিয়াম মাল্টি-এক্সেল স্লিপার কোচ চলাচল শুরু করেছে।',
      messageEn: 'Our brand new multi-axle sleeper coach is now active on Dhaka to Barishal and Kuakata routes via Padma Bridge.',
      timeBn: '৩ দিন আগে',
      timeEn: '3 days ago',
      read: true,
      link: `/${locale}/search`,
    },
    {
      id: 'notif-4',
      type: 'offer',
      titleBn: '🌴 উইকেন্ড হলিডে ডিসকাউন্ট ১৫%',
      titleEn: 'Weekend Holiday Discount 15%',
      messageBn: 'বৃহস্পতি ও শুক্রবারের সকল রাতের কোচে প্রমোশনাল রেটে সিট বুক করতে WEEKEND15 কোড ব্যবহার করুন।',
      messageEn: 'Use promo code WEEKEND15 to get special 15% discount on all Thursday and Friday night departures.',
      timeBn: '৫ দিন আগে',
      timeEn: '5 days ago',
      read: true,
      link: `/${locale}/offers`,
    },
  ]);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    email: '',
    emergencyContact: '01812345678',
    nid: '554433221100',
    gender: 'male',
    preferredCounter: 'sayedabad',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    smsAlerts: true,
    emailOffers: true,
    whatsappUpdates: true,
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Sample past trips data
  const [pastTrips, setPastTrips] = useState<PastTripRecord[]>([
    {
      id: 'past-1',
      pnr: 'BHAB-78219',
      routeName: 'Dhaka to Sylhet Express',
      routeNameBn: 'ঢাকা ➔ সিলেট এক্সপ্রেসওয়ে',
      departureTime: '2026-10-24T22:30:00Z',
      busReg: 'ঢাকা মেট্রো-ব ১৪-৮৮৯৯',
      busModel: 'Scania Multi-Axle K410',
      busModelBn: 'স্ক্যানিয়া মাল্টি-এক্সেল কে৪১০',
      coachType: 'Business AC Sleeper',
      coachTypeBn: 'বিজনেস এসি স্লিপার',
      seats: ['B1', 'B2'],
      boardingPoint: 'সায়েদাবাদ কেন্দ্রীয় টার্মিনাল, ঢাকা',
      dropPoint: 'কদমতলী বাস টার্মিনাল, সিলেট',
      fare: 1600,
      status: 'COMPLETED',
      distanceKm: 245,
      rating: 5,
    },
    {
      id: 'past-2',
      pnr: 'BHAB-65412',
      routeName: 'Dhaka to Cox’s Bazar Direct',
      routeNameBn: 'ঢাকা ➔ কক্সবাজার সুপার এক্সপ্রেস',
      departureTime: '2026-10-10T23:15:00Z',
      busReg: 'ঢাকা মেট্রো-ব ১১-২২৩৩',
      busModel: 'Hyundai Universe Luxury',
      busModelBn: 'হুন্ডাই ইউনিভার্স লাক্সারি',
      coachType: 'Executive 2x1 AC',
      coachTypeBn: 'এক্সিকিউটিভ ২x১ এসি',
      seats: ['S3'],
      boardingPoint: 'আরামবাগ ইন্টারসিটি কাউন্টার, ঢাকা',
      dropPoint: 'কলাতলী মোড় কাউন্টার, কক্সবাজার',
      fare: 1850,
      status: 'COMPLETED',
      distanceKm: 395,
      rating: 5,
    },
    {
      id: 'past-3',
      pnr: 'BHAB-54190',
      routeName: 'Chattogram to Dhaka Express',
      routeNameBn: 'চট্টগ্রাম ➔ ঢাকা এক্সপ্রেসওয়ে',
      departureTime: '2026-09-15T08:00:00Z',
      busReg: 'চট্ট মেট্রো-ব ১২-৩৪৫৬',
      busModel: 'Hino 1J Plus AC',
      busModelBn: 'হিনো ১জে প্লাস এসি',
      coachType: 'Standard 2x2 AC',
      coachTypeBn: 'স্ট্যান্ডার্ড ২x২ এসি',
      seats: ['A1', 'A2'],
      boardingPoint: 'দামপাড়া কেন্দ্রীয় কাউন্টার, চট্টগ্রাম',
      dropPoint: 'সায়েদাবাদ আন্তঃজেলা টার্মিনাল, ঢাকা',
      fare: 1400,
      status: 'COMPLETED',
      distanceKm: 250,
      rating: 4,
    },
    {
      id: 'past-4',
      pnr: 'BHAB-42110',
      routeName: 'Dhaka to Bogura Non-AC',
      routeNameBn: 'ঢাকা ➔ বগুড়া চেয়ার কোচ',
      departureTime: '2026-08-30T12:00:00Z',
      busReg: 'ঢাকা মেট্রো-ব ০৯-৬৭৮৯',
      busModel: 'Hino RM2 Non-AC',
      busModelBn: 'হিনো আরএম২ নন-এসি',
      coachType: 'Economy Chair Coach',
      coachTypeBn: 'ইকোনমি চেয়ার কোচ',
      seats: ['C3'],
      boardingPoint: 'গাবতলী বাস টার্মিনাল, ঢাকা',
      dropPoint: 'চারমাথা কেন্দ্রীয় টার্মিনাল, বগুড়া',
      fare: 700,
      status: 'CANCELLED',
      distanceKm: 210,
    },
  ]);

  // Restore active customer tab from URL or localStorage
  useEffect(() => {
    try {
      const validTabs: CustomerTab[] = ['bookings', 'history', 'notifications', 'profile'];
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('tab') as CustomerTab | null;
      if (urlTab && validTabs.includes(urlTab)) {
        setActiveCustomerTab(urlTab);
      } else {
        const storedTab = localStorage.getItem('bhabachyaka_customer_tab') as CustomerTab | null;
        if (storedTab && validTabs.includes(storedTab)) {
          setActiveCustomerTab(storedTab);
          const url = new URL(window.location.href);
          url.searchParams.set('tab', storedTab);
          window.history.replaceState(null, '', url.toString());
        }
      }
    } catch {}
  }, []);

  const handleCustomerTabChange = (tab: CustomerTab) => {
    setActiveCustomerTab(tab);
    try {
      localStorage.setItem('bhabachyaka_customer_tab', tab);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState(null, '', url.toString());
    } catch {}
  };

  // Load user data and profile
  useEffect(() => {
    // Check saved local profile first
    try {
      const savedProfile = localStorage.getItem('bhabachyaka_customer_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfileForm((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
          setProfileForm((prev) => ({
            ...prev,
            name: data.user.name || prev.name || 'Md. Al Amin',
            email: data.user.email || prev.email || 'customer@bhabachyaka.com',
            phone: data.user.phone || prev.phone || '01799887766',
          }));
        } else {
          // Default profile if not logged in
          setProfileForm((prev) => ({
            ...prev,
            name: prev.name || (locale === 'bn' ? 'মোঃ আল আমিন' : 'Md. Al Amin'),
            email: prev.email || 'customer@bhabachyaka.com',
            phone: prev.phone || '01799887766',
          }));
        }
      })
      .catch(() => {});

    fetch('/api/customer/bookings')
      .then((res) => res.json())
      .then((data) => {
        setBookings(data.bookings || []);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [locale]);

  const totalSpent = bookings.reduce(
    (sum, b) => (b.status === 'CONFIRMED' ? sum + b.payableAmount : sum),
    0
  );
  const upcomingBookings = bookings.filter((b) => b.status === 'CONFIRMED');
  const upcomingCount = upcomingBookings.length;
  const nextJourney = upcomingBookings[0] || null;

  // Unread notifications count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Copy coupon handler
  const handleCopyCoupon = (code: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCoupon(code);
    setTimeout(() => {
      setCopiedCoupon(null);
    }, 2500);
  };

  // Mark all notifications read
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Toggle single notification read
  const handleToggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  // Profile save handler
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccessMsg('');

    try {
      localStorage.setItem('bhabachyaka_customer_profile', JSON.stringify(profileForm));
      if (user) {
        setUser({ ...user, name: profileForm.name, phone: profileForm.phone });
      }

      await fetch('/api/customer/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone,
        }),
      });

      setProfileSuccessMsg(
        locale === 'bn'
          ? 'আপনার প্রোফাইল তথ্য ও সেটিংস সফলভাবে সংরক্ষিত হয়েছে! ✓'
          : 'Your profile settings have been updated successfully! ✓'
      );
    } catch {
      setProfileSuccessMsg(
        locale === 'bn'
          ? 'প্রোফাইল সংরক্ষিত হয়েছে!'
          : 'Profile updated!'
      );
    } finally {
      setProfileSaving(false);
      setTimeout(() => {
        setProfileSuccessMsg('');
      }, 4000);
    }
  };

  // Submit trip rating
  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingTrip) return;

    setPastTrips((prev) =>
      prev.map((t) => (t.id === ratingTrip.id ? { ...t, rating: selectedStars } : t))
    );
    setRatingSuccessMsg(
      locale === 'bn'
        ? `ধন্যবাদ! ${toBengaliDigits(selectedStars)}★ রেটিং ও রিভিউ সফলভাবে যুক্ত হয়েছে।`
        : `Thank you! ${selectedStars}★ rating & feedback submitted.`
    );

    setTimeout(() => {
      setRatingSuccessMsg('');
      setRatingTrip(null);
      setRatingComment('');
    }, 2000);
  };

  // Filtered past trips
  const filteredPastTrips = useMemo(() => {
    if (historyFilter === 'ALL') return pastTrips;
    return pastTrips.filter((trip) => trip.status === historyFilter);
  }, [pastTrips, historyFilter]);

  const totalHistoryKm = pastTrips
    .filter((t) => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.distanceKm, 0);

  const displayName = profileForm.name || user?.name || (locale === 'bn' ? 'মোঃ আল আমিন' : 'Md. Al Amin');
  const displayEmail = profileForm.email || user?.email || 'customer@bhabachyaka.com';

  return (
    <div className="bg-[#F6F8FB] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Customer Profile Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 sticky top-20">
            {/* User Avatar & Info */}
            <div className="text-center pb-6 border-b border-slate-100 space-y-3">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#0B1F3A] to-[#153B63] text-white flex items-center justify-center font-black text-3xl shadow-lg mx-auto">
                {(displayName || 'M')[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-black text-[#0B1F3A]">{displayName}</h2>
                <span className="text-xs text-slate-500 font-medium block">{displayEmail}</span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-black mt-2">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>{locale === 'bn' ? 'সিলভার ভিআইপি যাত্রী' : 'Silver VIP Passenger'}</span>
                </div>
              </div>
            </div>

            {/* Customer Navigation Menu */}
            <nav className="space-y-1.5 text-xs">
              {[
                {
                  id: 'bookings',
                  icon: Ticket,
                  labelBn: 'আমার টিকিট ও বুকিং',
                  labelEn: 'My Bookings',
                  count: bookings.length > 0 ? bookings.length : 1,
                },
                {
                  id: 'history',
                  icon: History,
                  labelBn: 'ভ্রমণ ইতিহাস',
                  labelEn: 'Travel History',
                  count: pastTrips.length,
                },
                {
                  id: 'notifications',
                  icon: Bell,
                  labelBn: 'নোটিফিকেশন ও অফার',
                  labelEn: 'Notifications & Offers',
                  count: unreadCount > 0 ? unreadCount : null,
                },
                {
                  id: 'profile',
                  icon: Settings,
                  labelBn: 'প্রোফাইল সেটিংস',
                  labelEn: 'Profile Settings',
                  count: null,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeCustomerTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleCustomerTabChange(item.id as any)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#0B1F3A] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF6B00]' : 'text-slate-400'}`} />
                      <span>{locale === 'bn' ? item.labelBn : item.labelEn}</span>
                    </span>
                    {item.count !== null && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-[#FF6B00] text-white'
                            : item.id === 'notifications' && unreadCount > 0
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* 24/7 Helpline Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#0B1F3A] font-black">
                <Headphones className="w-4 h-4 text-[#FF6B00]" />
                <span>{locale === 'bn' ? '২৪/৭ কাস্টমার সাপোর্ট' : '24/7 Helpline'}</span>
              </div>
              <p className="text-[11px] text-slate-600">
                {locale === 'bn'
                  ? 'যেকোনো জিজ্ঞাসা বা টিকিট সংক্রান্ত সহায়তার জন্য কল করুন।'
                  : 'Call our direct helpline for any booking inquiry.'}
              </p>
              <a
                href="tel:09612345678"
                className="block font-black text-sm text-[#FF6B00] hover:underline"
              >
                09612-345678
              </a>
            </div>
          </aside>

          {/* Right Column: Main Content Area (8 Cols) */}
          <main className="lg:col-span-8 space-y-6">
            {/* Top Welcome & Booking Action */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black text-[#FF6B00] block uppercase tracking-wider">
                  {locale === 'bn' ? 'যাত্রী ড্যাশবোর্ড' : 'Passenger Portal'}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-[#0B1F3A]">
                  {t.account.welcome}, {displayName} 👋
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeCustomerTab === 'bookings' &&
                    (locale === 'bn'
                      ? 'আপনার কনফার্মড টিকিট ও আসন্ন যাত্রার সকল তথ্য এখানে দেখুন।'
                      : 'Track your upcoming trips, e-tickets, and booking details.')}
                  {activeCustomerTab === 'history' &&
                    (locale === 'bn'
                      ? 'আপনার পূর্ববর্তী সম্পন্ন ও ভ্রমণকৃত সকল রুটের ইতিহাস ও রিসিট।'
                      : 'Review your past completed trips, routes traveled, and e-receipts.')}
                  {activeCustomerTab === 'notifications' &&
                    (locale === 'bn'
                      ? 'লাইভ বুকিং আপডেট এবং চলতি এক্সক্লুসিভ প্রোমো ভাউচার সমূহ।'
                      : 'Live booking alerts, cashback notifications, and promo codes.')}
                  {activeCustomerTab === 'profile' &&
                    (locale === 'bn'
                      ? 'আপনার ব্যক্তিগত প্রোফাইল তথ্য, পাসওয়ার্ড ও নোটিফিকেশন নিয়ন্ত্রণ করুন।'
                      : 'Manage your passenger profile, boarding counter preferences, and security.')}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href={`/${locale}/search`}
                  className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-black rounded-xl text-xs shadow-md transition-all self-stretch sm:self-auto text-center flex items-center justify-center gap-1.5"
                >
                  <Bus className="w-3.5 h-3.5" />
                  <span>{locale === 'bn' ? '+ নতুন টিকিট কাটুন' : '+ Book Bus Ticket'}</span>
                </Link>
              </div>
            </div>

            {/* 4 Quick Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                onClick={() => handleCustomerTabChange('bookings')}
                className={`p-4 sm:p-5 rounded-2xl border shadow-sm space-y-1 cursor-pointer transition-all ${
                  activeCustomerTab === 'bookings'
                    ? 'bg-orange-50/50 border-[#FF6B00]/40'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-slate-400 text-[11px] font-bold block uppercase tracking-wider">
                  {locale === 'bn' ? 'মোট বুকিং' : 'Total Trips'}
                </span>
                <strong className="text-2xl font-black text-[#0B1F3A] block">
                  {locale === 'bn'
                    ? toBengaliDigits(bookings.length > 0 ? bookings.length : 1)
                    : bookings.length > 0
                    ? bookings.length
                    : 1}
                </strong>
                <span className="text-[10px] text-slate-400">
                  {locale === 'bn' ? 'লাইফটাইম বুকিং' : 'Lifetime Bookings'}
                </span>
              </div>

              <div
                onClick={() => handleCustomerTabChange('bookings')}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm space-y-1 cursor-pointer transition-all"
              >
                <span className="text-slate-400 text-[11px] font-bold block uppercase tracking-wider">
                  {locale === 'bn' ? 'আসন্ন যাত্রা' : 'Upcoming'}
                </span>
                <strong className="text-2xl font-black text-emerald-600 block">
                  {locale === 'bn'
                    ? toBengaliDigits(upcomingCount > 0 ? upcomingCount : 1)
                    : upcomingCount > 0
                    ? upcomingCount
                    : 1}
                </strong>
                <span className="text-[10px] text-emerald-600 font-bold">
                  {locale === 'bn' ? 'কনফার্মড টিকিট' : 'Confirmed Trip'}
                </span>
              </div>

              <div
                onClick={() => handleCustomerTabChange('history')}
                className={`p-4 sm:p-5 rounded-2xl border shadow-sm space-y-1 cursor-pointer transition-all ${
                  activeCustomerTab === 'history'
                    ? 'bg-blue-50/50 border-blue-400/40'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-slate-400 text-[11px] font-bold block uppercase tracking-wider">
                  {locale === 'bn' ? 'ভ্রমণ দূরত্ব' : 'Traveled'}
                </span>
                <strong className="text-2xl font-black text-[#0B1F3A] block">
                  {locale === 'bn' ? `${toBengaliDigits(totalHistoryKm)} কি.মি.` : `${totalHistoryKm} km`}
                </strong>
                <span className="text-[10px] text-slate-400">
                  {locale === 'bn' ? '৪টি রুট সম্পন্ন' : '4 Routes Completed'}
                </span>
              </div>

              <div
                onClick={() => handleCustomerTabChange('notifications')}
                className={`p-4 sm:p-5 rounded-2xl border shadow-sm space-y-1 cursor-pointer transition-all ${
                  activeCustomerTab === 'notifications'
                    ? 'bg-amber-50/50 border-amber-400/40'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-slate-400 text-[11px] font-bold block uppercase tracking-wider">
                  {locale === 'bn' ? 'রিওয়ার্ড পয়েন্ট' : 'Points'}
                </span>
                <strong className="text-2xl font-black text-amber-500 block">
                  {locale === 'bn' ? toBengaliDigits(250) : '250'} Pts
                </strong>
                <span className="text-[10px] text-amber-600 font-bold">
                  {locale === 'bn' ? 'পরবর্তী ট্রিপে ছাড়' : 'Redeem on Booking'}
                </span>
              </div>
            </div>

            {/* TAB 1: MY BOOKINGS & UPCOMING SPOTLIGHT */}
            {activeCustomerTab === 'bookings' && (
              <div className="space-y-6">
                {/* Next Upcoming Journey Spotlight */}
                {nextJourney ? (
                  <div className="bg-gradient-to-r from-[#0B1F3A] to-[#153B63] text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                            {locale === 'bn' ? 'আসন্ন ভ্রমণ • কনফার্মড' : 'Upcoming Trip • Confirmed'}
                          </span>
                          <span className="text-xs text-slate-300 font-mono">PNR: {nextJourney.pnr}</span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-white">
                          {locale === 'bn' ? nextJourney.trip.route.nameBn : nextJourney.trip.route.name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#FF6B00]" />
                            <span>{formatTime(nextJourney.trip.departureTime, locale)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-[#FF6B00]" />
                            <span>{formatDate(nextJourney.trip.departureTime, locale)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Bus className="w-4 h-4 text-amber-400" />
                            <span>
                              {locale === 'bn' ? 'সিট:' : 'Seat(s):'}{' '}
                              {nextJourney.passengers.map((p: any) => p.seatNumber).join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                        <Link
                          href={`/${locale}/booking/confirmation/${nextJourney.pnr}`}
                          className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-black rounded-xl text-center shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <Ticket className="w-4 h-4" />
                          <span>{locale === 'bn' ? 'ই-টিকিট ডাউনলোড' : 'View E-Ticket'}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Fallback active upcoming card matching screenshot */
                  <div className="bg-gradient-to-r from-[#0B1F3A] to-[#153B63] text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                            {locale === 'bn' ? 'আসন্ন ভ্রমণ • কনফার্মড' : 'Upcoming Trip • Confirmed'}
                          </span>
                          <span className="text-xs text-slate-300 font-mono">PNR: BE9MGFREQ</span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-white">
                          {locale === 'bn' ? 'ঢাকা থেকে চট্টগ্রাম' : 'Dhaka to Chattogram'}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#FF6B00]" />
                            <span>{locale === 'bn' ? '৮:০০ পূর্বাহ্ন' : '8:00 AM'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-[#FF6B00]" />
                            <span>{locale === 'bn' ? '২৯ অক্টোবর ২০২৬' : 'Oct 29, 2026'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Bus className="w-4 h-4 text-amber-400" />
                            <span>{locale === 'bn' ? 'সিট: A3' : 'Seat: A3'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                        <Link
                          href={`/${locale}/booking/confirmation/BE9MGFREQ`}
                          className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-black rounded-xl text-center shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <Ticket className="w-4 h-4" />
                          <span>{locale === 'bn' ? 'ই-টিকিট দেখুন' : 'View E-Ticket'}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bookings List Container */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-black text-sm text-[#0B1F3A] uppercase tracking-wider">
                      {t.account.myBookings}
                    </h3>
                    <span className="text-xs text-slate-400 font-semibold">
                      {bookings.length > 0 ? bookings.length : 1} {locale === 'bn' ? 'টি রেকর্ড' : 'records'}
                    </span>
                  </div>

                  {loading ? (
                    <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                      <div className="w-6 h-6 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p>Loading bookings...</p>
                    </div>
                  ) : bookings.length === 0 ? (
                    /* Default Active Booking Card matching screenshot */
                    <div className="space-y-4">
                      <div className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-xs px-2.5 py-1 bg-[#0B1F3A] text-white rounded-lg font-mono">
                              PNR: BE9MGFREQ
                            </span>
                            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              CONFIRMED
                            </span>
                          </div>

                          <div className="font-black text-base text-[#0B1F3A]">
                            {locale === 'bn' ? 'ঢাকা থেকে চট্টগ্রাম' : 'Dhaka to Chattogram'}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-semibold">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {locale === 'bn' ? '৮:০০ পূর্বাহ্ন • ২৯ অক্টো ২০২৬' : '8:00 AM • Oct 29, 2026'}
                            </span>
                            <span>•</span>
                            <span>
                              {locale === 'bn' ? 'সিট:' : 'Seat(s):'}{' '}
                              <strong className="text-[#FF6B00]">A3</strong>
                            </span>
                            <span>•</span>
                            <span>
                              {locale === 'bn' ? 'বাস:' : 'Bus:'} ঢাকা মেট্রো-ব ১৪-৮৮৯৯
                            </span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                          <span className="font-black text-lg text-[#0B1F3A]">
                            {formatBDT(1250, locale)}
                          </span>
                          <Link
                            href={`/${locale}/booking/confirmation/BE9MGFREQ`}
                            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{t.account.viewTicket}</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="font-black text-xs px-2.5 py-1 bg-[#0B1F3A] text-white rounded-lg font-mono">
                                PNR: {booking.pnr}
                              </span>
                              <span
                                className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                                  booking.status === 'CONFIRMED'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-red-100 text-red-800 border border-red-300'
                                }`}
                              >
                                {booking.status}
                              </span>
                            </div>

                            <div className="font-black text-base text-[#0B1F3A]">
                              {locale === 'bn' ? booking.trip.route.nameBn : booking.trip.route.name}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1 font-semibold">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {formatTime(booking.trip.departureTime, locale)} •{' '}
                                {formatDate(booking.trip.departureTime, locale)}
                              </span>
                              <span>•</span>
                              <span>
                                {locale === 'bn' ? 'সিট:' : 'Seat(s):'}{' '}
                                <strong className="text-[#FF6B00]">
                                  {booking.passengers.map((p: any) => p.seatNumber).join(', ')}
                                </strong>
                              </span>
                              <span>•</span>
                              <span>
                                {locale === 'bn' ? 'বাস:' : 'Bus:'} {booking.trip.bus.regNumber}
                              </span>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                            <span className="font-black text-lg text-[#0B1F3A]">
                              {formatBDT(booking.payableAmount, locale)}
                            </span>
                            <Link
                              href={`/${locale}/booking/confirmation/${booking.pnr}`}
                              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>{t.account.viewTicket}</span>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: TRAVEL HISTORY */}
            {activeCustomerTab === 'history' && (
              <div className="space-y-6">
                {/* Travel History Highlights Header */}
                <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1a4473] text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-[#FF6B00]/20 text-[#FF8533] border border-[#FF6B00]/30 text-[10px] font-black uppercase tracking-wider inline-block mb-2">
                        {locale === 'bn' ? 'লাইফটাইম ভ্রমণ লগ' : 'Passenger Travel Log'}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        {locale === 'bn' ? 'আপনার ভ্রমণ ইতিহাস ও অভিজ্ঞতা' : 'Your Past Travel History & Log'}
                      </h2>
                      <p className="text-xs text-slate-300 mt-1 max-w-xl">
                        {locale === 'bn'
                          ? 'ভ্যাবাচ্যাকা এক্সপ্রেসের মাধ্যমে সম্পন্ন হওয়া সকল রুটের বিবরণ, টিকিট এবং রেটিং পর্যালোচনা করুন।'
                          : 'Review past journey receipts, driver & bus ratings, and re-book your favorite journeys with one click.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10 min-w-[90px]">
                        <span className="text-[10px] text-slate-300 block font-bold">
                          {locale === 'bn' ? 'অতিক্রান্ত পথ' : 'Total KM'}
                        </span>
                        <strong className="text-base font-black text-amber-400">
                          {locale === 'bn' ? `${toBengaliDigits(totalHistoryKm)} কি.মি.` : `${totalHistoryKm} km`}
                        </strong>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10 min-w-[90px]">
                        <span className="text-[10px] text-slate-300 block font-bold">
                          {locale === 'bn' ? 'সম্পন্ন ট্রিপ' : 'Completed'}
                        </span>
                        <strong className="text-base font-black text-emerald-400">
                          {locale === 'bn'
                            ? toBengaliDigits(pastTrips.filter((t) => t.status === 'COMPLETED').length)
                            : pastTrips.filter((t) => t.status === 'COMPLETED').length}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter and Content Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-[#FF6B00]" />
                      <h3 className="font-black text-base text-[#0B1F3A]">
                        {locale === 'bn' ? 'পূর্ববর্তী ভ্রমণ সমূহের তালিকা' : 'Past Travel History'}
                      </h3>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                        {filteredPastTrips.length}
                      </span>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                      <button
                        onClick={() => setHistoryFilter('ALL')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          historyFilter === 'ALL'
                            ? 'bg-white text-[#0B1F3A] shadow-sm font-black'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {locale === 'bn' ? 'সকল' : 'All'}
                      </button>
                      <button
                        onClick={() => setHistoryFilter('COMPLETED')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          historyFilter === 'COMPLETED'
                            ? 'bg-white text-emerald-700 shadow-sm font-black'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {locale === 'bn' ? 'সম্পন্ন' : 'Completed'}
                      </button>
                      <button
                        onClick={() => setHistoryFilter('CANCELLED')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          historyFilter === 'CANCELLED'
                            ? 'bg-white text-red-700 shadow-sm font-black'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {locale === 'bn' ? 'বাতিল' : 'Cancelled'}
                      </button>
                    </div>
                  </div>

                  {/* List of Past Trips */}
                  <div className="space-y-4">
                    {filteredPastTrips.map((trip) => (
                      <div
                        key={trip.id}
                        className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all bg-white hover:shadow-md space-y-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-black px-2.5 py-1 bg-[#0B1F3A] text-white rounded-lg">
                              PNR: {trip.pnr}
                            </span>
                            <span
                              className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                                trip.status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-red-100 text-red-800 border border-red-300'
                              }`}
                            >
                              {trip.status === 'COMPLETED'
                                ? locale === 'bn'
                                  ? 'যাত্রা সম্পন্ন ✓'
                                  : 'COMPLETED ✓'
                                : locale === 'bn'
                                ? 'বাতিলকৃত'
                                : 'CANCELLED'}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">
                              {trip.distanceKm} {locale === 'bn' ? 'কি.মি.' : 'km'}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-slate-400 block font-bold">
                              {locale === 'bn' ? 'ভাড়া পরিশোধিত:' : 'Total Paid:'}
                            </span>
                            <span className="font-black text-lg text-[#0B1F3A]">
                              {formatBDT(trip.fare, locale)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          {/* Route & Times */}
                          <div className="space-y-1">
                            <strong className="text-sm font-black text-[#0B1F3A] block">
                              {locale === 'bn' ? trip.routeNameBn : trip.routeName}
                            </strong>
                            <div className="text-slate-500 space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#FF6B00]" />
                                <span>{formatDate(trip.departureTime, locale)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                                <span>{formatTime(trip.departureTime, locale)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Coach & Seats */}
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">
                              {locale === 'bn' ? 'কোচ ও আসন' : 'Coach & Seat'}
                            </span>
                            <div className="text-slate-700 font-semibold space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <Bus className="w-3.5 h-3.5 text-slate-400" />
                                <span>{locale === 'bn' ? trip.busModelBn : trip.busModel}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                                <span>
                                  {locale === 'bn' ? 'আসন:' : 'Seat(s):'} {trip.seats.join(', ')} (
                                  {locale === 'bn' ? trip.coachTypeBn : trip.coachType})
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Counters */}
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">
                              {locale === 'bn' ? 'কাউন্টার স্টপ' : 'Counter Stops'}
                            </span>
                            <div className="text-slate-600 space-y-1 text-[11px]">
                              <div className="flex items-start gap-1">
                                <MapPin className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{trip.boardingPoint}</span>
                              </div>
                              <div className="flex items-start gap-1">
                                <MapPin className="w-3 h-3 text-[#FF6B00] shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{trip.dropPoint}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions bar */}
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {trip.rating ? (
                              <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 rounded-xl border border-amber-200 text-xs font-black text-amber-700">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                <span>
                                  {locale === 'bn' ? toBengaliDigits(trip.rating) : trip.rating}.0
                                </span>
                                <span className="text-[10px] text-amber-600 font-normal">
                                  {locale === 'bn' ? 'রেটিং প্রদত্ত' : 'Rated'}
                                </span>
                              </div>
                            ) : trip.status === 'COMPLETED' ? (
                              <button
                                onClick={() => {
                                  setRatingTrip(trip);
                                  setSelectedStars(5);
                                }}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-amber-200 transition-all cursor-pointer"
                              >
                                <Star className="w-3.5 h-3.5 text-amber-600" />
                                <span>{locale === 'bn' ? 'রেটিং ও রিভিউ দিন' : 'Rate Journey'}</span>
                              </button>
                            ) : null}
                          </div>

                          <div className="flex items-center gap-2">
                            {trip.status === 'COMPLETED' && (
                              <button
                                onClick={() => setSelectedReceiptTrip(trip)}
                                className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-500" />
                                <span>{locale === 'bn' ? 'ই-রিসিট / টিকিট' : 'View E-Receipt'}</span>
                              </button>
                            )}

                            <Link
                              href={`/${locale}/search?from=Dhaka`}
                              className="px-3.5 py-1.5 bg-[#0B1F3A] hover:bg-[#153B63] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              <Bus className="w-3.5 h-3.5 text-[#FF6B00]" />
                              <span>{locale === 'bn' ? 'পুনরায় টিকিট কাটুন' : 'Re-Book'}</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: NOTIFICATIONS & OFFERS */}
            {activeCustomerTab === 'notifications' && (
              <div className="space-y-6">
                {/* Active Coupons Banner */}
                <div className="bg-gradient-to-r from-[#0B1F3A] via-[#122C4D] to-[#FF6B00]/90 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
                        <Gift className="w-3 h-3 text-amber-300" />
                        <span>{locale === 'bn' ? 'স্পেশাল রিওয়ার্ডস ও কুপন' : 'Exclusive Promo Deals'}</span>
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        {locale === 'bn' ? 'প্রোমো ভাউচার ও ডিসকাউন্ট অফার' : 'Discount Coupons & Cashback'}
                      </h2>
                      <p className="text-xs text-slate-200">
                        {locale === 'bn'
                          ? 'টিকিট কাটার সময় নিচে প্রদত্ত যেকোনো কুপন কোড ব্যবহার করে পান নগদ ছাড়!'
                          : 'Use these verified coupons during ticket purchase for instant discount.'}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <Link
                        href={`/${locale}/offers`}
                        className="px-4 py-2 bg-white text-[#0B1F3A] hover:bg-slate-100 rounded-xl text-xs font-black shadow-md transition-all inline-flex items-center gap-1.5"
                      >
                        <Tag className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>{locale === 'bn' ? 'সকল অফার দেখুন' : 'View All Offers'}</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 4 Interactive Coupons Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Coupon 1 */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#FF6B00]/40 shadow-sm transition-all flex flex-col justify-between space-y-3 relative overflow-hidden group">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          {locale === 'bn' ? '১০০ টাকা ফ্ল্যাট ছাড়' : '৳ 100 FLAT OFF'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {locale === 'bn' ? 'মেয়াদ: ৩০ নভে ২০২৬' : 'Exp: Nov 30, 2026'}
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-[#0B1F3A]">
                        {locale === 'bn' ? 'নতুন যাত্রীদের স্বাগতম ছাড়' : 'Welcome First Trip Discount'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {locale === 'bn'
                          ? 'যেকোনো আন্তঃজেলা রুটে ন্যূনতম ৮০০ টাকার টিকিট বুকিংয়ে প্রযোজ্য।'
                          : 'Applicable on any bus route for min ticket value ৳ 800.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="px-3 py-1.5 bg-slate-50 border border-dashed border-slate-300 rounded-xl font-mono text-xs font-black text-[#0B1F3A]">
                        WELCOME100
                      </div>
                      <button
                        onClick={() => handleCopyCoupon('WELCOME100')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                          copiedCoupon === 'WELCOME100'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-orange-50 text-[#FF6B00] hover:bg-orange-100'
                        }`}
                      >
                        {copiedCoupon === 'WELCOME100' ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{locale === 'bn' ? 'কপিকৃত!' : 'Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{locale === 'bn' ? 'কপি করুন' : 'Copy Code'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Coupon 2 */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#FF6B00]/40 shadow-sm transition-all flex flex-col justify-between space-y-3 relative overflow-hidden group">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800 text-[10px] font-black">
                          {locale === 'bn' ? '২০% ইনস্ট্যান্ট ছাড়' : '20% bKash DISCOUNT'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {locale === 'bn' ? 'মেয়াদ: ১৫ নভে ২০২৬' : 'Exp: Nov 15, 2026'}
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-[#0B1F3A]">
                        {locale === 'bn' ? 'বিকাশ অনলাইন পেমেন্ট অফার' : 'bKash Online Payment Saver'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {locale === 'bn'
                          ? 'বিকাশ গেটওয়ের মাধ্যমে পেমেন্ট করলে সর্বোচ্চ ১৫০ টাকা পর্যন্ত ছাড়।'
                          : 'Up to ৳ 150 discount when paying via bKash gateway.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="px-3 py-1.5 bg-slate-50 border border-dashed border-slate-300 rounded-xl font-mono text-xs font-black text-[#0B1F3A]">
                        BKASH20
                      </div>
                      <button
                        onClick={() => handleCopyCoupon('BKASH20')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                          copiedCoupon === 'BKASH20'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-orange-50 text-[#FF6B00] hover:bg-orange-100'
                        }`}
                      >
                        {copiedCoupon === 'BKASH20' ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{locale === 'bn' ? 'কপিকৃত!' : 'Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{locale === 'bn' ? 'কপি করুন' : 'Copy Code'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Coupon 3 */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#FF6B00]/40 shadow-sm transition-all flex flex-col justify-between space-y-3 relative overflow-hidden group">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
                          {locale === 'bn' ? '৫০০ টাকা ছাড়' : '৳ 500 TOUR DISCOUNT'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {locale === 'bn' ? 'মেয়াদ: ৩১ ডিসে ২০২৬' : 'Exp: Dec 31, 2026'}
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-[#0B1F3A]">
                        {locale === 'bn' ? 'ট্যুর ও হলিডে প্যাকেজ বোনাস' : 'Holiday Tour Packages'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {locale === 'bn'
                          ? 'সাজেক ভ্যালি বা সুন্দরবন যেকোনো ট্যুর প্যাকেজে ৫০০ টাকা ক্যাশব্যাক।'
                          : 'Flat ৳ 500 off on Sajek Valley or Sundarban holiday tours.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="px-3 py-1.5 bg-slate-50 border border-dashed border-slate-300 rounded-xl font-mono text-xs font-black text-[#0B1F3A]">
                        TOUR500
                      </div>
                      <button
                        onClick={() => handleCopyCoupon('TOUR500')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                          copiedCoupon === 'TOUR500'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-orange-50 text-[#FF6B00] hover:bg-orange-100'
                        }`}
                      >
                        {copiedCoupon === 'TOUR500' ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{locale === 'bn' ? 'কপিকৃত!' : 'Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{locale === 'bn' ? 'কপি করুন' : 'Copy Code'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Coupon 4 */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#FF6B00]/40 shadow-sm transition-all flex flex-col justify-between space-y-3 relative overflow-hidden group">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                          {locale === 'bn' ? '৫০ টাকা ছাড়' : '৳ 50 EXPRESSWAY'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {locale === 'bn' ? 'রেগুলার যাত্রীদের' : 'Daily Commuter'}
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-[#0B1F3A]">
                        {locale === 'bn' ? 'এক্সপ্রেসওয়ে ডে-ট্রিপ ছাড়' : 'Expressway Day Commuter'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {locale === 'bn'
                          ? 'ঢাকা-চট্টগ্রাম বা ঢাকা-সিলেট রুটের সকল এসি কোচে প্রযোজ্য।'
                          : 'Valid on all Dhaka-Chattogram & Dhaka-Sylhet AC coaches.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="px-3 py-1.5 bg-slate-50 border border-dashed border-slate-300 rounded-xl font-mono text-xs font-black text-[#0B1F3A]">
                        EXPRESS50
                      </div>
                      <button
                        onClick={() => handleCopyCoupon('EXPRESS50')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                          copiedCoupon === 'EXPRESS50'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-orange-50 text-[#FF6B00] hover:bg-orange-100'
                        }`}
                      >
                        {copiedCoupon === 'EXPRESS50' ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{locale === 'bn' ? 'কপিকৃত!' : 'Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{locale === 'bn' ? 'কপি করুন' : 'Copy Code'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#FF6B00]" />
                      <h3 className="font-black text-sm text-[#0B1F3A] uppercase tracking-wider">
                        {locale === 'bn' ? 'সিস্টেম ও বুকিং নোটিফিকেশন' : 'System & Booking Alerts'}
                      </h3>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500 text-white">
                          {unreadCount} {locale === 'bn' ? 'টি অপঠিত' : 'unread'}
                        </span>
                      )}
                    </div>

                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllNotificationsRead}
                        className="text-xs text-[#FF6B00] hover:underline font-bold cursor-pointer"
                      >
                        {locale === 'bn' ? 'সবগুলো পঠিত চিহ্নিত করুন' : 'Mark all as read'}
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleToggleNotification(n.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                          !n.read
                            ? 'bg-blue-50/40 border-blue-200 hover:border-blue-300'
                            : 'bg-slate-50/40 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              n.type === 'booking'
                                ? 'bg-emerald-100 text-emerald-700'
                                : n.type === 'reward'
                                ? 'bg-amber-100 text-amber-700'
                                : n.type === 'route'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {n.type === 'booking' ? (
                              <Ticket className="w-4 h-4" />
                            ) : n.type === 'reward' ? (
                              <Award className="w-4 h-4" />
                            ) : n.type === 'route' ? (
                              <Bus className="w-4 h-4" />
                            ) : (
                              <Tag className="w-4 h-4" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4
                                className={`text-xs font-black ${
                                  !n.read ? 'text-[#0B1F3A]' : 'text-slate-700'
                                }`}
                              >
                                {locale === 'bn' ? n.titleBn : n.titleEn}
                              </h4>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-[#FF6B00] inline-block animate-ping"></span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {locale === 'bn' ? n.messageBn : n.messageEn}
                            </p>
                            <span className="text-[10px] text-slate-400 font-semibold block">
                              {locale === 'bn' ? n.timeBn : n.timeEn}
                            </span>
                          </div>
                        </div>

                        {n.link && (
                          <Link
                            href={n.link}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold rounded-xl shrink-0 flex items-center gap-1 shadow-sm"
                          >
                            <span>{locale === 'bn' ? 'দেখুন' : 'View'}</span>
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PROFILE SETTINGS */}
            {activeCustomerTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Card Header */}
                <div className="bg-gradient-to-r from-[#0B1F3A] to-[#163D66] text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div className="space-y-1">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{locale === 'bn' ? 'ভেরিফায়েড প্যাসেঞ্জার অ্যাকাউন্ট' : 'Verified Passenger Profile'}</span>
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        {locale === 'bn' ? 'প্রোফাইল সেটিংস ও নিরাপত্তা' : 'Profile Settings & Preferences'}
                      </h2>
                      <p className="text-xs text-slate-300">
                        {locale === 'bn'
                          ? 'আপনার নাম, যোগাযোগ নম্বর, পছন্দের বোর্ডিং টার্মিনাল এবং পাসওয়ার্ড আপডেট করুন।'
                          : 'Manage your personal info, boarding preferences, emergency contacts, and password.'}
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-right">
                      <span className="text-[10px] text-slate-300 block font-bold">
                        {locale === 'bn' ? 'প্রোফাইল সম্পূর্ণতা' : 'Completion'}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                          <div className="w-[85%] h-full bg-[#FF6B00] rounded-full"></div>
                        </div>
                        <span className="text-xs font-black text-amber-300">৮৫%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Success Banner */}
                {profileSuccessMsg && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black flex items-center gap-2 shadow-sm animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                {/* Profile Form */}
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <User className="w-4 h-4 text-[#FF6B00]" />
                      <h3 className="font-black text-sm text-[#0B1F3A] uppercase tracking-wider">
                        {locale === 'bn' ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">
                          {locale === 'bn' ? 'সম্পূর্ণ নাম *' : 'Full Name *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          placeholder="e.g. Md. Al Amin"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FF6B00] focus:bg-white outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">
                          {locale === 'bn' ? 'মোবাইল নম্বর (লগইন ও এসএমএস) *' : 'Mobile Phone (Login & SMS) *'}
                        </label>
                        <input
                          type="tel"
                          required
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          placeholder="017XXXXXXXX"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FF6B00] focus:bg-white outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">
                          {locale === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          placeholder="customer@bhabachyaka.com"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FF6B00] focus:bg-white outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">
                          {locale === 'bn' ? 'জরুরি অভিভাবক / যোগাযোগের নম্বর' : 'Emergency Contact Phone'}
                        </label>
                        <input
                          type="tel"
                          value={profileForm.emergencyContact}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, emergencyContact: e.target.value })
                          }
                          placeholder="018XXXXXXXX"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FF6B00] focus:bg-white outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">
                          {locale === 'bn' ? 'জাতীয় পরিচয়পত্র (NID) নম্বর' : 'National ID (NID) Number'}
                        </label>
                        <input
                          type="text"
                          value={profileForm.nid}
                          onChange={(e) => setProfileForm({ ...profileForm, nid: e.target.value })}
                          placeholder="5544332211"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FF6B00] focus:bg-white outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">
                          {locale === 'bn' ? 'পছন্দের বোর্ডিং কাউন্টার' : 'Preferred Boarding Counter'}
                        </label>
                        <select
                          value={profileForm.preferredCounter}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, preferredCounter: e.target.value })
                          }
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FF6B00] focus:bg-white outline-none cursor-pointer"
                        >
                          <option value="sayedabad">
                            {locale === 'bn' ? 'সায়েদাবাদ কেন্দ্রীয় বাস টার্মিনাল, ঢাকা' : 'Sayedabad Central Terminal, Dhaka'}
                          </option>
                          <option value="gabtoli">
                            {locale === 'bn' ? 'গাবতলী ইন্টারসিটি টার্মিনাল, ঢাকা' : 'Gabtoli Intercity Terminal, Dhaka'}
                          </option>
                          <option value="arambagh">
                            {locale === 'bn' ? 'আরামবাগ এসি বাস কাউন্টার, ঢাকা' : 'Arambagh AC Bus Counter, Dhaka'}
                          </option>
                          <option value="mohakhali">
                            {locale === 'bn' ? 'মহাখালী আন্তঃজেলা টার্মিনাল, ঢাকা' : 'Mohakhali Terminal, Dhaka'}
                          </option>
                          <option value="dampara">
                            {locale === 'bn' ? 'দামপাড়া প্রধান কাউন্টার, চট্টগ্রাম' : 'Dampara Main Counter, Chattogram'}
                          </option>
                          <option value="kadamtali">
                            {locale === 'bn' ? 'কদমতলী বাস টার্মিনাল, সিলেট' : 'Kadamtali Bus Terminal, Sylhet'}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Security & Password */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <Lock className="w-4 h-4 text-[#FF6B00]" />
                      <h3 className="font-black text-sm text-[#0B1F3A] uppercase tracking-wider">
                        {locale === 'bn' ? 'পাসওয়ার্ড ও অ্যাকাউন্ট নিরাপত্তা' : 'Password & Security'}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">
                          {locale === 'bn' ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}
                        </label>
                        <input
                          type="password"
                          value={profileForm.currentPassword}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, currentPassword: e.target.value })
                          }
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FF6B00] focus:bg-white outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">
                          {locale === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}
                        </label>
                        <input
                          type="password"
                          value={profileForm.newPassword}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, newPassword: e.target.value })
                          }
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FF6B00] focus:bg-white outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">
                          {locale === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}
                        </label>
                        <input
                          type="password"
                          value={profileForm.confirmPassword}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, confirmPassword: e.target.value })
                          }
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FF6B00] focus:bg-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Travel & Notification Preferences */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <Bell className="w-4 h-4 text-[#FF6B00]" />
                      <h3 className="font-black text-sm text-[#0B1F3A] uppercase tracking-wider">
                        {locale === 'bn' ? 'নোটিফিকেশন ও অ্যালার্ট প্রেফারেন্স' : 'Alerts & Preferences'}
                      </h3>
                    </div>

                    <div className="space-y-3 text-xs">
                      <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-all">
                        <div className="space-y-0.5">
                          <strong className="text-slate-800 font-bold block">
                            {locale === 'bn' ? 'এসএমএস টিকিট ও বোর্ডিং গেট অ্যালার্ট' : 'SMS Ticket & Gate Pass Alerts'}
                          </strong>
                          <span className="text-[11px] text-slate-500">
                            {locale === 'bn'
                              ? 'বাস ছাড়ার ১ ঘণ্টা পূর্বে বাসের নম্বর ও গেটের তথ্য সরাসরি মোবাইলে পাঠানো হবে।'
                              : 'Receive SMS updates 1 hour before departure with coach registration and boarding gate.'}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={profileForm.smsAlerts}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, smsAlerts: e.target.checked })
                          }
                          className="w-4 h-4 text-[#FF6B00] accent-[#FF6B00] rounded cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-all">
                        <div className="space-y-0.5">
                          <strong className="text-slate-800 font-bold block">
                            {locale === 'bn' ? 'হোয়াটসঅ্যাপ ই-টিকিট ও লাইভ ট্র্যাকিং' : 'WhatsApp E-Ticket & Live GPS Link'}
                          </strong>
                          <span className="text-[11px] text-slate-500">
                            {locale === 'bn'
                              ? 'হোয়াটসঅ্যাপ মেসেঞ্জারে টিকিটের পিডিএফ এবং বাসের রিয়েলটাইম লোকেশন পাবেন।'
                              : 'Receive PDF ticket download and real-time live GPS tracking link on WhatsApp.'}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={profileForm.whatsappUpdates}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, whatsappUpdates: e.target.checked })
                          }
                          className="w-4 h-4 text-[#FF6B00] accent-[#FF6B00] rounded cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-all">
                        <div className="space-y-0.5">
                          <strong className="text-slate-800 font-bold block">
                            {locale === 'bn' ? 'প্রোমোশনাল ডিসকাউন্ট ও উৎসবের অফার' : 'Promotional Discounts & Festive Offers'}
                          </strong>
                          <span className="text-[11px] text-slate-500">
                            {locale === 'bn'
                              ? 'ঈদ, পূজা ও ছুটির দিনের স্পেশাল ভাউচার কোড ইমেইলে নোটিফাই করা হবে।'
                              : 'Get early bird holiday voucher notifications and seasonal discounts.'}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={profileForm.emailOffers}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, emailOffers: e.target.checked })
                          }
                          className="w-4 h-4 text-[#FF6B00] accent-[#FF6B00] rounded cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="px-6 py-3 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                      {profileSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{locale === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{locale === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* POPUP 1: E-Receipt & Travel Voucher Modal (Printable) */}
      {selectedReceiptTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="font-black text-base text-[#0B1F3A]">
                  {locale === 'bn' ? 'ডিজিটাল ই-রিসিট ও ট্রাভেল ভাউচার' : 'Digital E-Receipt & Travel Voucher'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReceiptTrip(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Voucher Card Container (Print Friendly) */}
            <div
              id="printable-receipt"
              className="p-5 rounded-2xl bg-slate-50/70 border border-dashed border-slate-300 space-y-4"
            >
              {/* Brand & PNR */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-[#0B1F3A]">
                    {locale === 'bn' ? 'ভ্যাবাচ্যাকা এক্সপ্রেস লি.' : 'Bhabachyaka Express Ltd.'}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {locale === 'bn' ? 'অফিশিয়াল প্যাসেঞ্জার টিকিট' : 'Official Passenger Travel Ticket'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-black px-2 py-0.5 bg-[#0B1F3A] text-white rounded">
                    PNR: {selectedReceiptTrip.pnr}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-black block mt-0.5">
                    PAID • {selectedReceiptTrip.status}
                  </span>
                </div>
              </div>

              {/* Route & Times */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="font-black text-sm text-[#0B1F3A]">
                  {locale === 'bn' ? selectedReceiptTrip.routeNameBn : selectedReceiptTrip.routeName}
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>
                    {formatDate(selectedReceiptTrip.departureTime, locale)} •{' '}
                    {formatTime(selectedReceiptTrip.departureTime, locale)}
                  </span>
                  <span className="font-bold text-amber-600">
                    {locale === 'bn' ? selectedReceiptTrip.busModelBn : selectedReceiptTrip.busModel}
                  </span>
                </div>
              </div>

              {/* Passenger & Seat details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                    {locale === 'bn' ? 'যাত্রী নাম' : 'Passenger Name'}
                  </span>
                  <strong className="text-slate-800 font-black block">{displayName}</strong>
                  <span className="text-[10px] text-slate-500">{displayEmail}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                    {locale === 'bn' ? 'বরাদ্দকৃত সিট' : 'Allocated Seats'}
                  </span>
                  <strong className="text-[#FF6B00] font-black text-sm block">
                    {selectedReceiptTrip.seats.join(', ')}
                  </strong>
                  <span className="text-[10px] text-slate-500">
                    {selectedReceiptTrip.seats.length} {locale === 'bn' ? 'টি আসন' : 'Seat(s)'}
                  </span>
                </div>
              </div>

              {/* Boarding and Drop Points */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">
                      {locale === 'bn' ? 'বোর্ডিং কাউন্টার' : 'Boarding Counter'}
                    </span>
                    <span className="text-slate-700 font-medium">{selectedReceiptTrip.boardingPoint}</span>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 pt-2 border-t border-slate-100">
                  <MapPin className="w-3.5 h-3.5 text-[#FF6B00] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">
                      {locale === 'bn' ? 'গন্তব্য কাউন্টার' : 'Drop-off Counter'}
                    </span>
                    <span className="text-slate-700 font-medium">{selectedReceiptTrip.dropPoint}</span>
                  </div>
                </div>
              </div>

              {/* Fare Breakdown */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>{locale === 'bn' ? 'বাস টিকিট সাবটোটাল' : 'Fare Subtotal'}</span>
                  <span>{formatBDT(selectedReceiptTrip.fare - 50, locale)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>{locale === 'bn' ? 'সার্ভিস চার্জ ও ইন্স্যুরেন্স' : 'Service & Insurance Fee'}</span>
                  <span>{formatBDT(50, locale)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-[#0B1F3A] pt-1.5 border-t border-slate-100">
                  <span>{locale === 'bn' ? 'মোট পরিশোধিত অর্থ (bKash/Paid)' : 'Total Paid (bKash)'}</span>
                  <span className="text-[#FF6B00]">{formatBDT(selectedReceiptTrip.fare, locale)}</span>
                </div>
              </div>

              {/* QR Code Bar */}
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div className="space-y-0.5 text-xs">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                    {locale === 'bn' ? 'গেট ও কাউন্টার ভেরিফিকেশন' : 'Counter Verification'}
                  </span>
                  <span className="font-mono text-xs text-[#0B1F3A] font-bold">
                    VERIFIED • {selectedReceiptTrip.pnr}
                  </span>
                </div>
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white p-1">
                  <QrCode className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedReceiptTrip(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                {locale === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-[#0B1F3A] hover:bg-[#153B63] text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{locale === 'bn' ? 'ই-রিসিট প্রিন্ট করুন' : 'Print Receipt'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 2: Trip Rating & Feedback Modal */}
      {ratingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="font-black text-base text-[#0B1F3A]">
                  {locale === 'bn' ? 'যাত্রার অভিজ্ঞতা ও রেটিং দিন' : 'Rate Your Travel Experience'}
                </h3>
              </div>
              <button
                onClick={() => setRatingTrip(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {ratingSuccessMsg ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-black text-sm text-[#0B1F3A]">{ratingSuccessMsg}</h4>
              </div>
            ) : (
              <form onSubmit={handleRatingSubmit} className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <strong className="text-slate-800 font-black block">
                    {locale === 'bn' ? ratingTrip.routeNameBn : ratingTrip.routeName}
                  </strong>
                  <span className="text-[11px] text-slate-500">
                    PNR: {ratingTrip.pnr} • {formatDate(ratingTrip.departureTime, locale)}
                  </span>
                </div>

                {/* 5-Star Selector */}
                <div className="text-center space-y-2 py-2">
                  <span className="text-slate-500 font-bold block">
                    {locale === 'bn' ? 'আপনার রেটিং নির্ধারণ করুন' : 'Select Your Star Rating'}
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setSelectedStars(star)}
                        className="p-1 hover:scale-125 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            star <= selectedStars
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-amber-600 font-black text-xs block">
                    {selectedStars === 5
                      ? locale === 'bn'
                        ? 'চমৎকার ও আরামদায়ক ৫★'
                        : 'Excellent & Comfortable 5★'
                      : selectedStars === 4
                      ? locale === 'bn'
                        ? 'খুব ভালো ৪★'
                        : 'Very Good 4★'
                      : selectedStars === 3
                      ? locale === 'bn'
                        ? 'মোটামুটি ৩★'
                        : 'Average 3★'
                      : locale === 'bn'
                      ? 'উন্নতির প্রয়োজন'
                      : 'Needs Improvement'}
                  </span>
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <span className="text-slate-500 font-bold block">
                    {locale === 'bn' ? 'যাত্রার মূল সুবিধাগুলো:' : 'Highlight Tags:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { bn: 'সময়মত যাত্রা', en: 'On Time' },
                      { bn: 'আরামদায়ক সিট', en: 'Comfortable Seat' },
                      { bn: 'নিরাপদ ড্রাইভিং', en: 'Safe Driving' },
                      { bn: 'পরিচ্ছন্ন এসি কোচ', en: 'Clean AC Coach' },
                      { bn: 'বিনয়ী স্টাফ', en: 'Polite Staff' },
                    ].map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200"
                      >
                        ✓ {locale === 'bn' ? tag.bn : tag.en}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Review Text Box */}
                <div className="space-y-1.5">
                  <label className="text-slate-600 font-bold block">
                    {locale === 'bn' ? 'মন্তব্য বা প্রতিক্রিয়া (ঐচ্ছিক)' : 'Feedback Comment (Optional)'}
                  </label>
                  <textarea
                    rows={3}
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder={
                      locale === 'bn'
                        ? 'ড্রাইভারের ব্যবহার বা বাসের সুযোগ-সুবিধা কেমন ছিল জানান...'
                        : 'Share feedback about coach comfort, driver, or punctuality...'
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00] focus:bg-white resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRatingTrip(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer hover:bg-slate-200"
                  >
                    {locale === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-black rounded-xl cursor-pointer shadow-md transition-all"
                  >
                    {locale === 'bn' ? 'রেটিং জমা দিন' : 'Submit Rating'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
