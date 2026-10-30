'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Menu,
  Layout,
  Bell,
  Sliders,
  Image as ImageIcon,
  Building2,
  Info,
  Package,
  Tag,
  PhoneCall,
  MapPin,
  Clock,
  Bus,
  ShieldCheck,
  Check,
  X,
  HelpCircle,
  Award,
  Users,
} from 'lucide-react';
import { Locale } from '@/lib/i18n';
import {
  SiteConfig,
  MenuItem,
  CounterItem,
  AboutConfig,
  AboutStat,
  AboutFleetCoach,
  AboutPillar,
  TourPackage,
  OfferItem,
  FAQItem,
  ContactConfig,
  DEFAULT_SITE_CONFIG,
} from '@/lib/siteConfig';
import { DISTRICTS } from '@/data/districts';

interface Props {
  locale: Locale;
}

type TabType = 'counters' | 'about' | 'packages' | 'offers' | 'contact' | 'hero' | 'menu' | 'announcement';

export default function SiteEditorCMS({ locale }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('counters');

  // Restore CMS active tab on reload or refresh
  useEffect(() => {
    try {
      const validTabs: TabType[] = ['counters', 'about', 'packages', 'offers', 'contact', 'hero', 'menu', 'announcement'];
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('cms_tab') as TabType | null;
      if (urlTab && validTabs.includes(urlTab)) {
        setActiveTab(urlTab);
      } else {
        const storedTab = localStorage.getItem('bhabachyaka_cms_tab') as TabType | null;
        if (storedTab && validTabs.includes(storedTab)) {
          setActiveTab(storedTab);
          const url = new URL(window.location.href);
          url.searchParams.set('cms_tab', storedTab);
          window.history.replaceState(null, '', url.toString());
        }
      }
    } catch {}
  }, []);

  const handleCmsTabChange = (tab: TabType) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('bhabachyaka_cms_tab', tab);
      const url = new URL(window.location.href);
      url.searchParams.set('cms_tab', tab);
      window.history.replaceState(null, '', url.toString());
    } catch {}
  };
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  // Editing Modals / States
  const [editingCounter, setEditingCounter] = useState<CounterItem | null>(null);
  const [isAddingCounter, setIsAddingCounter] = useState(false);

  const [editingPackage, setEditingPackage] = useState<TourPackage | null>(null);
  const [isAddingPackage, setIsAddingPackage] = useState(false);

  const [editingOffer, setEditingOffer] = useState<OfferItem | null>(null);
  const [isAddingOffer, setIsAddingOffer] = useState(false);

  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [isAddingFaq, setIsAddingFaq] = useState(false);

  const [editingFleet, setEditingFleet] = useState<AboutFleetCoach | null>(null);
  const [isAddingFleet, setIsAddingFleet] = useState(false);

  // New Menu Item inputs
  const [newItemNameBn, setNewItemNameBn] = useState('');
  const [newItemNameEn, setNewItemNameEn] = useState('');
  const [newItemHref, setNewItemHref] = useState('');

  // Image Presets for quick selection
  const imagePresets = [
    { label: 'হিরো বাস (Hero Bus)', path: '/images/hero/hero-bus.jpg' },
    { label: 'লাক্সারি ফ্লিট (Luxury Fleet)', path: '/images/buses/luxury-fleet.jpg' },
    { label: 'কক্সবাজার সমুদ্র (Cox’s Bazar)', path: '/images/destinations/coxs-bazar.jpg' },
    { label: 'ঢাকা হাইওয়ে (Dhaka Highway)', path: '/images/destinations/dhaka-highway.jpg' },
    { label: 'সিলেট চা বাগান (Sylhet)', path: '/images/destinations/sylhet.jpg' },
    { label: 'এক্সপ্রেসওয়ে ব্যানার (Promo)', path: '/images/promotions/expressway-promo.jpg' },
    { label: 'হিরো ব্যানার (Banner)', path: '/images/hero/banner.jpg' },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/site-settings');
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorNotice('');
    setSuccessNotice('');

    try {
      const res = await fetch('/api/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setSuccessNotice(
          locale === 'bn'
            ? '✅ ওয়েবসাইট, মেনুবার, কাউন্টার, অফার ও প্যাকেজের সকল তথ্য সফলভাবে সংরক্ষিত হয়েছে!'
            : '✅ Site settings, counters, offers, packages & details saved successfully!'
        );
        setTimeout(() => setSuccessNotice(''), 5000);
      } else {
        setErrorNotice(data.error || 'Failed to save settings');
      }
    } catch {
      setErrorNotice('Network error while saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        locale === 'bn'
          ? 'আপনি কি নিশ্চিত যে সম্পূর্ণ ওয়েবসাইট সেটিংস ডিফল্টে রিসেট করতে চান?'
          : 'Are you sure you want to reset all site settings to factory defaults?'
      )
    ) {
      return;
    }

    try {
      const res = await fetch('/api/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET' }),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setSuccessNotice(locale === 'bn' ? 'ডিফল্ট সেটিংসে সফলভাবে ফিরিয়ে আনা হয়েছে।' : 'Reset to default successfully.');
        setTimeout(() => setSuccessNotice(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------------------------
  // COUNTERS HANDLERS
  // ----------------------------------------------------------------------
  const handleSaveCounter = (counter: CounterItem) => {
    setConfig((prev) => {
      const exists = prev.counters.some((c) => c.id === counter.id);
      if (exists) {
        return {
          ...prev,
          counters: prev.counters.map((c) => (c.id === counter.id ? counter : c)),
        };
      } else {
        return {
          ...prev,
          counters: [counter, ...prev.counters],
        };
      }
    });
    setEditingCounter(null);
    setIsAddingCounter(false);
  };

  const handleDeleteCounter = (id: string) => {
    if (!confirm(locale === 'bn' ? 'এই কাউন্টারটি মুছে ফেলতে চান?' : 'Delete this counter?')) return;
    setConfig((prev) => ({
      ...prev,
      counters: prev.counters.filter((c) => c.id !== id),
    }));
  };

  // ----------------------------------------------------------------------
  // PACKAGES HANDLERS
  // ----------------------------------------------------------------------
  const handleSavePackage = (pkg: TourPackage) => {
    setConfig((prev) => {
      const exists = prev.packages.some((p) => p.id === pkg.id);
      if (exists) {
        return {
          ...prev,
          packages: prev.packages.map((p) => (p.id === pkg.id ? pkg : p)),
        };
      } else {
        return {
          ...prev,
          packages: [pkg, ...prev.packages],
        };
      }
    });
    setEditingPackage(null);
    setIsAddingPackage(false);
  };

  const handleDeletePackage = (id: string) => {
    if (!confirm(locale === 'bn' ? 'এই ট্যুর প্যাকেজটি মুছে ফেলতে চান?' : 'Delete this tour package?')) return;
    setConfig((prev) => ({
      ...prev,
      packages: prev.packages.filter((p) => p.id !== id),
    }));
  };

  // ----------------------------------------------------------------------
  // OFFERS HANDLERS
  // ----------------------------------------------------------------------
  const handleSaveOffer = (offer: OfferItem) => {
    setConfig((prev) => {
      const exists = prev.offers.some((o) => o.id === offer.id);
      if (exists) {
        return {
          ...prev,
          offers: prev.offers.map((o) => (o.id === offer.id ? offer : o)),
        };
      } else {
        return {
          ...prev,
          offers: [offer, ...prev.offers],
        };
      }
    });
    setEditingOffer(null);
    setIsAddingOffer(false);
  };

  const handleDeleteOffer = (id: string) => {
    if (!confirm(locale === 'bn' ? 'এই অফারটি মুছে ফেলতে চান?' : 'Delete this offer code?')) return;
    setConfig((prev) => ({
      ...prev,
      offers: prev.offers.filter((o) => o.id !== id),
    }));
  };

  // ----------------------------------------------------------------------
  // FAQS HANDLERS
  // ----------------------------------------------------------------------
  const handleSaveFaq = (faq: FAQItem) => {
    setConfig((prev) => {
      const exists = prev.contact.faqs.some((f) => f.id === faq.id);
      const newFaqs = exists
        ? prev.contact.faqs.map((f) => (f.id === faq.id ? faq : f))
        : [...prev.contact.faqs, faq];
      return {
        ...prev,
        contact: {
          ...prev.contact,
          faqs: newFaqs,
        },
      };
    });
    setEditingFaq(null);
    setIsAddingFaq(false);
  };

  const handleDeleteFaq = (id: string) => {
    if (!confirm(locale === 'bn' ? 'এই প্রশ্ন ও উত্তর মুছে ফেলতে চান?' : 'Delete this FAQ item?')) return;
    setConfig((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        faqs: prev.contact.faqs.filter((f) => f.id !== id),
      },
    }));
  };

  // ----------------------------------------------------------------------
  // FLEET COACHES HANDLERS
  // ----------------------------------------------------------------------
  const handleSaveFleet = (coach: AboutFleetCoach) => {
    setConfig((prev) => {
      const exists = prev.about.fleet.some((c) => c.id === coach.id);
      const newFleet = exists
        ? prev.about.fleet.map((c) => (c.id === coach.id ? coach : c))
        : [...prev.about.fleet, coach];
      return {
        ...prev,
        about: {
          ...prev.about,
          fleet: newFleet,
        },
      };
    });
    setEditingFleet(null);
    setIsAddingFleet(false);
  };

  const handleDeleteFleet = (id: string) => {
    if (!confirm(locale === 'bn' ? 'এই কোচটি মুছে ফেলতে চান?' : 'Delete this coach?')) return;
    setConfig((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        fleet: prev.about.fleet.filter((c) => c.id !== id),
      },
    }));
  };

  // ----------------------------------------------------------------------
  // MENU ITEMS HANDLERS
  // ----------------------------------------------------------------------
  const handleToggleMenuItem = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      ),
    }));
  };

  const handleUpdateMenuItem = (id: string, field: 'nameBn' | 'nameEn' | 'href', value: string) => {
    setConfig((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleDeleteCustomItem = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      menuItems: prev.menuItems.filter((item) => item.id !== id),
    }));
  };

  const handleAddCustomMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemNameBn.trim() || !newItemNameEn.trim() || !newItemHref.trim()) {
      alert(locale === 'bn' ? 'সবগুলো ঘর পূরণ করুন।' : 'Please fill in all fields.');
      return;
    }

    const newItem: MenuItem = {
      id: `custom-${Date.now()}`,
      nameBn: newItemNameBn.trim(),
      nameEn: newItemNameEn.trim(),
      href: newItemHref.trim().startsWith('/') ? newItemHref.trim() : `/${newItemHref.trim()}`,
      isActive: true,
      isCustom: true,
    };

    setConfig((prev) => ({
      ...prev,
      menuItems: [...prev.menuItems, newItem],
    }));

    setNewItemNameBn('');
    setNewItemNameEn('');
    setNewItemHref('');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <div className="animate-spin w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-sm font-bold text-slate-500">
          {locale === 'bn' ? 'ওয়েবসাইট CMS সেটিংস লোড হচ্ছে...' : 'Loading CMS configurations...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Save Actions Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-50 text-[#FF6B00] border border-orange-200">
              <Sliders className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-[#0B1F3A]">
              {locale === 'bn' ? 'ওয়েবসাইট ও মেনুবার পূর্ণাঙ্গ CMS এডিটর' : 'Website & Navbar Complete CMS Editor'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {locale === 'bn'
              ? 'কাউন্টার, আমাদের সম্পর্কে, ট্যুর প্যাকেজ, ডিসকাউন্ট অফার, যোগাযোগ, হিরো ব্যানার এবং মেনুবারের সকল তথ্য ও ছবি এডিট করুন।'
              : 'Customize terminal counters, About Us story/fleet, tour packages, discount coupons, contacts, hero banner, and navbar.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            type="button"
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>{locale === 'bn' ? 'রিসেট ডিফল্ট' : 'Reset Defaults'}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            type="button"
            className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? (locale === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (locale === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes')}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}
      {errorNotice && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-3 animate-fade-in shadow-2xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Main CMS Tab Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'counters', labelBn: '🏢 কাউন্টারসমূহ (Counters)', labelEn: '🏢 Terminal Counters', count: config.counters.length },
          { id: 'about', labelBn: '📖 আমাদের সম্পর্কে (About Us)', labelEn: '📖 About & Fleet', count: config.about.fleet.length },
          { id: 'packages', labelBn: '🎒 ট্যুর প্যাকেজ (Packages)', labelEn: '🎒 Tour Packages', count: config.packages.length },
          { id: 'offers', labelBn: '🏷️ অফার ও ডিসকাউন্ট (Offers)', labelEn: '🏷️ Promo Offers', count: config.offers.length },
          { id: 'contact', labelBn: '📞 যোগাযোগ ও FAQ (Contact)', labelEn: '📞 Contact & FAQs', count: config.contact.faqs.length },
          { id: 'hero', labelBn: '🎯 হোম হিরো (Hero Banner)', labelEn: '🎯 Hero Banner' },
          { id: 'menu', labelBn: '🧭 মেনুবার (Navbar)', labelEn: '🧭 Navbar Links', count: config.menuItems.length },
          { id: 'announcement', labelBn: '📢 ঘোষণা বার (Announcement)', labelEn: '📢 Announcement' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleCmsTabChange(tab.id as TabType)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
                isActive
                  ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 shadow-2xs'
              }`}
            >
              <span>{locale === 'bn' ? tab.labelBn : tab.labelEn}</span>
              {typeof tab.count === 'number' && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-[#FF6B00] text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ====================================================================== */}
      {/* 1. COUNTERS TAB                                                        */}
      {/* ====================================================================== */}
      {activeTab === 'counters' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-[#0B1F3A] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#FF6B00]" />
                <span>{locale === 'bn' ? 'কাউন্টার ডিরেক্টরি ব্যবস্থাপনা' : 'Terminal Counters Directory'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'bn'
                  ? 'কাউন্টারের ছবি, ঠিকানা, ফোন নম্বর, অপারেটিং সময় ও সুবিধাসমূহ এডিট করুন বা নতুন কাউন্টার যোগ করুন।'
                  : 'Manage counter pictures, addresses, hotline numbers, operational hours, and passenger amenities.'}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCounter({
                  id: `counter-${Date.now()}`,
                  nameBn: '',
                  nameEn: '',
                  districtBn: 'ঢাকা',
                  districtEn: 'Dhaka',
                  divisionBn: 'ঢাকা',
                  divisionEn: 'Dhaka',
                  addressBn: '',
                  addressEn: '',
                  phone: '01710-000000',
                  hoursBn: 'সকাল ০৬:০০ - রাত ১১:০০',
                  hoursEn: '06:00 AM - 11:00 PM',
                  image: '/images/destinations/dhaka-highway.jpg',
                  amenitiesBn: ['এসি ওয়েটিং রুম', 'ফ্রি ওয়াইফাই', 'লাগেজ লকার'],
                  amenitiesEn: ['AC Waiting Lounge', 'Free Wi-Fi', 'Luggage Locker'],
                  isFeatured: true,
                });
                setIsAddingCounter(true);
              }}
              className="px-4 py-2.5 bg-[#0B1F3A] hover:bg-[#FF6B00] text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{locale === 'bn' ? 'নতুন কাউন্টার যোগ করুন' : 'Add New Counter'}</span>
            </button>
          </div>

          {/* Counters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.counters.map((counter) => (
              <div
                key={counter.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={counter.image}
                      alt={counter.nameEn}
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.target.src = '/images/hero/hero-bus.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[10px] font-black text-[#0B1F3A]">
                        📍 {counter.districtBn} ({counter.districtEn})
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <h4 className="text-sm font-black truncate">{counter.nameBn}</h4>
                      <p className="text-[11px] text-slate-200 truncate">{counter.nameEn}</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-[#FF6B00] shrink-0 mt-0.5" />
                      <span className="line-clamp-2 text-[11px]">{counter.addressBn || counter.addressEn}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <span className="flex items-center gap-1 text-emerald-700 font-bold">
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                        {counter.phone}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        {counter.hoursBn}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {counter.amenitiesBn.slice(0, 3).map((a, i) => (
                        <span key={i} className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          ✓ {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingCounter({ ...counter });
                      setIsAddingCounter(false);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{locale === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCounter(counter.id)}
                    className="px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{locale === 'bn' ? 'মুছুন' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Counter Edit Modal */}
          {editingCounter && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8 border border-slate-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-black text-[#0B1F3A] flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#FF6B00]" />
                    <span>
                      {isAddingCounter
                        ? locale === 'bn'
                          ? 'নতুন কাউন্টার যোগ করুন'
                          : 'Add New Counter'
                        : locale === 'bn'
                        ? 'কাউন্টার তথ্য সম্পাদনা'
                        : 'Edit Counter Information'}
                    </span>
                  </h3>
                  <button
                    onClick={() => setEditingCounter(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">কাউন্টারের নাম (বাংলা) *</label>
                      <input
                        type="text"
                        value={editingCounter.nameBn}
                        onChange={(e) => setEditingCounter({ ...editingCounter, nameBn: e.target.value })}
                        placeholder="যেমন: সায়েদাবাদ কেন্দ্রীয় টার্মিনাল কাউন্টার"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Counter Name (English) *</label>
                      <input
                        type="text"
                        value={editingCounter.nameEn}
                        onChange={(e) => setEditingCounter({ ...editingCounter, nameEn: e.target.value })}
                        placeholder="e.g. Sayedabad Central Terminal Counter"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">জেলা (District) *</label>
                      <select
                        value={editingCounter.districtEn}
                        onChange={(e) => {
                          const dist = DISTRICTS.find((d) => d.nameEn === e.target.value);
                          setEditingCounter({
                            ...editingCounter,
                            districtEn: e.target.value,
                            districtBn: dist ? dist.nameBn : editingCounter.districtBn,
                            divisionEn: dist ? dist.divisionEn : editingCounter.divisionEn,
                            divisionBn: dist ? dist.divisionBn : editingCounter.divisionBn,
                          });
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        {DISTRICTS.map((d) => (
                          <option key={d.id} value={d.nameEn}>
                            {d.nameBn} ({d.nameEn}) - {d.divisionBn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">হটলাইন / মোবাইল নম্বর *</label>
                      <input
                        type="text"
                        value={editingCounter.phone}
                        onChange={(e) => setEditingCounter({ ...editingCounter, phone: e.target.value })}
                        placeholder="01710-123456"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Image URL & Preset Selection */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">কাউন্টারের ছবি (Image URL) *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingCounter.image}
                        onChange={(e) => setEditingCounter({ ...editingCounter, image: e.target.value })}
                        placeholder="/images/destinations/dhaka-highway.jpg or https://..."
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                      />
                    </div>
                    {/* Quick Preset Selector */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      <span className="text-[10px] text-slate-400 font-bold">ছবির প্রিসেট:</span>
                      {imagePresets.map((preset) => (
                        <button
                          key={preset.path}
                          type="button"
                          onClick={() => setEditingCounter({ ...editingCounter, image: preset.path })}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-all cursor-pointer ${
                            editingCounter.image === preset.path
                              ? 'bg-[#FF6B00] text-white border-[#FF6B00]'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    {/* Preview */}
                    {editingCounter.image && (
                      <div className="mt-2 h-24 w-40 relative rounded-xl overflow-hidden border border-slate-200">
                        <img
                          src={editingCounter.image}
                          alt="preview"
                          className="w-full h-full object-cover"
                          onError={(e: any) => {
                            e.target.src = '/images/hero/hero-bus.jpg';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">ঠিকানা (বাংলা) *</label>
                      <textarea
                        rows={2}
                        value={editingCounter.addressBn}
                        onChange={(e) => setEditingCounter({ ...editingCounter, addressBn: e.target.value })}
                        placeholder="কাউন্টার নং ১২-১৪, সায়েদাবাদ টার্মিনাল, ঢাকা"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Address (English) *</label>
                      <textarea
                        rows={2}
                        value={editingCounter.addressEn}
                        onChange={(e) => setEditingCounter({ ...editingCounter, addressEn: e.target.value })}
                        placeholder="Counter 12-14, Sayedabad Terminal, Dhaka"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">অপারেটিং সময় (বাংলা)</label>
                      <input
                        type="text"
                        value={editingCounter.hoursBn}
                        onChange={(e) => setEditingCounter({ ...editingCounter, hoursBn: e.target.value })}
                        placeholder="সকাল ০৬:০০ - রাত ১১:০০"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Operating Hours (English)</label>
                      <input
                        type="text"
                        value={editingCounter.hoursEn}
                        onChange={(e) => setEditingCounter({ ...editingCounter, hoursEn: e.target.value })}
                        placeholder="06:00 AM - 11:00 PM"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      সুবিধাসমূহ / Amenities (কমা দিয়ে আলাদা করুন)
                    </label>
                    <input
                      type="text"
                      value={editingCounter.amenitiesBn.join(', ')}
                      onChange={(e) =>
                        setEditingCounter({
                          ...editingCounter,
                          amenitiesBn: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          amenitiesEn: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      placeholder="এসি ওয়েটিং রুম, ফ্রি ওয়াইফাই, লাগেজ লকার, পার্সেল সার্ভিস"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingCounter(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                  >
                    {locale === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveCounter(editingCounter)}
                    className="px-5 py-2 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-xl text-xs font-black shadow"
                  >
                    {locale === 'bn' ? 'সম্পন্ন করুন' : 'Done'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================== */}
      {/* 2. ABOUT US TAB                                                        */}
      {/* ====================================================================== */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          {/* Brand Story & Mission */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-[#0B1F3A] flex items-center gap-2">
              <Info className="w-5 h-5 text-[#FF6B00]" />
              <span>{locale === 'bn' ? 'ব্র্যান্ড স্টোরি ও পরিচিতি' : 'Brand Story & Mission'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 font-bold mb-1">হেডলাইন (বাংলা)</label>
                <input
                  type="text"
                  value={config.about.storyTitleBn}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      about: { ...config.about, storyTitleBn: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Headline (English)</label>
                <input
                  type="text"
                  value={config.about.storyTitleEn}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      about: { ...config.about, storyTitleEn: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ট্যাগলাইন (বাংলা)</label>
                <input
                  type="text"
                  value={config.about.storyTaglineBn}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      about: { ...config.about, storyTaglineBn: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Tagline (English)</label>
                <input
                  type="text"
                  value={config.about.storyTaglineEn}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      about: { ...config.about, storyTaglineEn: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">বিস্তারিত বিবরণ (বাংলা)</label>
                <textarea
                  rows={3}
                  value={config.about.storyDescBn}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      about: { ...config.about, storyDescBn: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Detailed Description (English)</label>
                <textarea
                  rows={3}
                  value={config.about.storyDescEn}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      about: { ...config.about, storyDescEn: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Key Stats Counter Bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-[#0B1F3A] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#FF6B00]" />
              <span>{locale === 'bn' ? '৪টি মূল পরিসংখ্যান ও মাইলফলক (Stats)' : '4 Key Metric Milestones (Stats)'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {config.about.stats.map((stat, idx) => (
                <div key={stat.id || idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div>
                    <label className="block text-slate-500 font-bold mb-0.5 text-[10px]">মান (বাংলা)</label>
                    <input
                      type="text"
                      value={stat.valueBn}
                      onChange={(e) => {
                        const newStats = [...config.about.stats];
                        newStats[idx].valueBn = e.target.value;
                        setConfig({ ...config, about: { ...config.about, stats: newStats } });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-0.5 text-[10px]">Value (English)</label>
                    <input
                      type="text"
                      value={stat.valueEn}
                      onChange={(e) => {
                        const newStats = [...config.about.stats];
                        newStats[idx].valueEn = e.target.value;
                        setConfig({ ...config, about: { ...config.about, stats: newStats } });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-0.5 text-[10px]">লেবেল (বাংলা)</label>
                    <input
                      type="text"
                      value={stat.labelBn}
                      onChange={(e) => {
                        const newStats = [...config.about.stats];
                        newStats[idx].labelBn = e.target.value;
                        setConfig({ ...config, about: { ...config.about, stats: newStats } });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-0.5 text-[10px]">Label (English)</label>
                    <input
                      type="text"
                      value={stat.labelEn}
                      onChange={(e) => {
                        const newStats = [...config.about.stats];
                        newStats[idx].labelEn = e.target.value;
                        setConfig({ ...config, about: { ...config.about, stats: newStats } });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Luxury Fleet Showcase */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#0B1F3A] flex items-center gap-2">
                  <Bus className="w-5 h-5 text-[#FF6B00]" />
                  <span>{locale === 'bn' ? 'বিলাসবহুল বাস ফ্লিট শোকেস' : 'Luxury Fleet Showcase'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {locale === 'bn' ? 'যাত্রীদের জন্য প্রদর্শিত বাসসমূহের ছবি ও সুবিধাসমূহ।' : 'Coach models, pictures, and features displayed to passengers.'}
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingFleet({
                    id: `coach-${Date.now()}`,
                    nameBn: '',
                    nameEn: '',
                    featuresBn: '',
                    featuresEn: '',
                    image: '/images/buses/luxury-fleet.jpg',
                  });
                  setIsAddingFleet(true);
                }}
                className="px-4 py-2 bg-[#0B1F3A] hover:bg-[#FF6B00] text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{locale === 'bn' ? 'কোচ যোগ করুন' : 'Add Coach'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {config.about.fleet.map((coach) => (
                <div key={coach.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative h-40 w-full bg-slate-200">
                      <img
                        src={coach.image}
                        alt={coach.nameEn}
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                          e.target.src = '/images/hero/hero-bus.jpg';
                        }}
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-black text-sm text-[#0B1F3A]">{coach.nameBn}</h4>
                      <p className="text-xs text-slate-500 font-semibold">{coach.nameEn}</p>
                      <p className="text-[11px] text-slate-600 font-medium line-clamp-2">{coach.featuresBn}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingFleet({ ...coach });
                        setIsAddingFleet(false);
                      }}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3 text-blue-600" />
                      <span>{locale === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteFleet(coach.id)}
                      className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{locale === 'bn' ? 'মুছুন' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Coach Edit Modal */}
            {editingFleet && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-black text-[#0B1F3A]">
                      {isAddingFleet ? (locale === 'bn' ? 'নতুন কোচ যোগ করুন' : 'Add Coach') : (locale === 'bn' ? 'কোচ তথ্য সম্পাদনা' : 'Edit Coach')}
                    </h3>
                    <button onClick={() => setEditingFleet(null)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs font-semibold">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">কোচের নাম (বাংলা) *</label>
                      <input
                        type="text"
                        value={editingFleet.nameBn}
                        onChange={(e) => setEditingFleet({ ...editingFleet, nameBn: e.target.value })}
                        placeholder="যেমন: বিজনেস ক্লাস এসি (Business Class 2x1)"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Coach Name (English) *</label>
                      <input
                        type="text"
                        value={editingFleet.nameEn}
                        onChange={(e) => setEditingFleet({ ...editingFleet, nameEn: e.target.value })}
                        placeholder="e.g. Business Class 2x1 AC"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">ছবির লিঙ্ক (Image URL) *</label>
                      <input
                        type="text"
                        value={editingFleet.image}
                        onChange={(e) => setEditingFleet({ ...editingFleet, image: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                      />
                      {/* Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        {imagePresets.map((preset) => (
                          <button
                            key={preset.path}
                            type="button"
                            onClick={() => setEditingFleet({ ...editingFleet, image: preset.path })}
                            className="text-[10px] px-2 py-0.5 rounded border bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">ফিচার বিবরণ (বাংলা)</label>
                      <textarea
                        rows={2}
                        value={editingFleet.featuresBn}
                        onChange={(e) => setEditingFleet({ ...editingFleet, featuresBn: e.target.value })}
                        placeholder="প্রশস্ত লেগস্পেস, এরগনোমিক লেদার সিট, ওয়াইফাই..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Features (English)</label>
                      <textarea
                        rows={2}
                        value={editingFleet.featuresEn}
                        onChange={(e) => setEditingFleet({ ...editingFleet, featuresEn: e.target.value })}
                        placeholder="Extra-wide legroom, USB chargers, Wi-Fi..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button onClick={() => setEditingFleet(null)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold">
                      {locale === 'bn' ? 'বাতিল' : 'Cancel'}
                    </button>
                    <button
                      onClick={() => handleSaveFleet(editingFleet)}
                      className="px-5 py-2 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-xl text-xs font-black shadow"
                    >
                      {locale === 'bn' ? 'সম্পন্ন করুন' : 'Done'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 3. PACKAGES TAB                                                        */}
      {/* ====================================================================== */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-[#0B1F3A] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#FF6B00]" />
                <span>{locale === 'bn' ? 'ট্যুর ও হলিডে প্যাকেজ ব্যবস্থাপনা' : 'Tour & Holiday Packages Management'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'bn'
                  ? 'প্যাকেজের ছবি, মূল্য, সময়কাল, হোটেল ও অন্তর্ভুক্ত সুবিধাসমূহ এডিট করুন বা নতুন ট্যুর যোগ করুন।'
                  : 'Manage tour titles, photos, pricing, coach type, hotels, inclusions, and departure dates.'}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingPackage({
                  id: `pkg-${Date.now()}`,
                  category: 'BEACH',
                  titleBn: '',
                  titleEn: '',
                  durationBn: '২ রাত / ৩ দিন',
                  durationEn: '2 Nights / 3 Days',
                  price: 6500,
                  image: '/images/destinations/coxs-bazar.jpg',
                  coachTypeBn: 'লাক্সারি এসি বাস',
                  coachTypeEn: 'Luxury AC Coach',
                  hotelBn: '৩-স্টার হোটেল',
                  hotelEn: '3-Star Hotel',
                  inclusionsBn: ['রাউন্ডট্রিপ বাস টিকিট', 'হোটেল রুম', 'কমপ্লিমেন্টারি ব্রেকফাস্ট'],
                  inclusionsEn: ['Roundtrip Bus Tickets', 'Hotel Accommodation', 'Complimentary Breakfast'],
                  departuresBn: 'প্রতি বৃহস্পতি ও রবিবার',
                  departuresEn: 'Every Thursday & Sunday',
                  isPopular: false,
                });
                setIsAddingPackage(true);
              }}
              className="px-4 py-2.5 bg-[#0B1F3A] hover:bg-[#FF6B00] text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{locale === 'bn' ? 'নতুন প্যাকেজ যোগ করুন' : 'Add New Package'}</span>
            </button>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={pkg.image}
                      alt={pkg.titleEn}
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.target.src = '/images/destinations/coxs-bazar.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/95 text-[10px] font-black text-[#0B1F3A] shadow-xs">
                        🏷️ {pkg.category}
                      </span>
                      {pkg.isPopular && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FF6B00] text-[10px] font-black text-white shadow-xs">
                          ★ Popular
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-400 text-xs font-black">
                        ৳{pkg.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="text-sm font-black line-clamp-1">{pkg.titleBn}</h4>
                      <p className="text-[11px] text-slate-200 line-clamp-1">{pkg.titleEn}</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600 text-[11px] font-bold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        {pkg.durationBn}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-700">
                        <Bus className="w-3.5 h-3.5 text-emerald-600" />
                        {pkg.coachTypeBn}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">হোটেল / রিসোর্ট:</span>
                      <p className="text-xs font-bold text-[#0B1F3A] truncate">{pkg.hotelBn}</p>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-600">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">অন্তর্ভুক্ত সুবিধাসমূহ:</span>
                      {pkg.inclusionsBn.slice(0, 2).map((inc, i) => (
                        <div key={i} className="flex items-start gap-1 truncate">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="truncate">{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingPackage({ ...pkg });
                      setIsAddingPackage(false);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{locale === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{locale === 'bn' ? 'মুছুন' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Package Edit Modal */}
          {editingPackage && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8 border border-slate-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-black text-[#0B1F3A] flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#FF6B00]" />
                    <span>
                      {isAddingPackage
                        ? locale === 'bn'
                          ? 'নতুন ট্যুর প্যাকেজ যোগ করুন'
                          : 'Add New Tour Package'
                        : locale === 'bn'
                        ? 'ট্যুর প্যাকেজ সম্পাদনা'
                        : 'Edit Tour Package'}
                    </span>
                  </h3>
                  <button
                    onClick={() => setEditingPackage(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">প্যাকেজ টাইটেল (বাংলা) *</label>
                      <input
                        type="text"
                        value={editingPackage.titleBn}
                        onChange={(e) => setEditingPackage({ ...editingPackage, titleBn: e.target.value })}
                        placeholder="কক্সবাজার সমুদ্র সৈকত ও মেরিন ড্রাইভ ট্যুর"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Package Title (English) *</label>
                      <input
                        type="text"
                        value={editingPackage.titleEn}
                        onChange={(e) => setEditingPackage({ ...editingPackage, titleEn: e.target.value })}
                        placeholder="Cox's Bazar Beach & Marine Drive Tour"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">ক্যাটাগরি *</label>
                      <select
                        value={editingPackage.category}
                        onChange={(e) => setEditingPackage({ ...editingPackage, category: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <option value="BEACH">BEACH (সমুদ্র সৈকত)</option>
                        <option value="HILLS">HILLS (পাহাড় ও মেঘ)</option>
                        <option value="FOREST">FOREST (বন ও প্রকৃতি)</option>
                        <option value="HERITAGE">HERITAGE (ঐতিহাসিক)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">প্যাকেজ মূল্য (BDT) *</label>
                      <input
                        type="number"
                        value={editingPackage.price}
                        onChange={(e) => setEditingPackage({ ...editingPackage, price: Number(e.target.value) })}
                        placeholder="7500"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">পপুলার ট্যুর ব্যাজ?</label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id="pkgPopular"
                          checked={editingPackage.isPopular}
                          onChange={(e) => setEditingPackage({ ...editingPackage, isPopular: e.target.checked })}
                          className="w-4 h-4 text-[#FF6B00] rounded"
                        />
                        <label htmlFor="pkgPopular" className="text-slate-700 font-bold">
                          ফিচার্ড / পপুলার ট্যুর
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Photo selection */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">কভার ছবির লিঙ্ক (Cover Image URL) *</label>
                    <input
                      type="text"
                      value={editingPackage.image}
                      onChange={(e) => setEditingPackage({ ...editingPackage, image: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      <span className="text-[10px] text-slate-400 font-bold">ছবির প্রিসেট:</span>
                      {imagePresets.map((preset) => (
                        <button
                          key={preset.path}
                          type="button"
                          onClick={() => setEditingPackage({ ...editingPackage, image: preset.path })}
                          className="text-[10px] px-2 py-0.5 rounded border bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">সময়কাল (বাংলা) *</label>
                      <input
                        type="text"
                        value={editingPackage.durationBn}
                        onChange={(e) => setEditingPackage({ ...editingPackage, durationBn: e.target.value })}
                        placeholder="৩ রাত / ৪ দিন"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Duration (English) *</label>
                      <input
                        type="text"
                        value={editingPackage.durationEn}
                        onChange={(e) => setEditingPackage({ ...editingPackage, durationEn: e.target.value })}
                        placeholder="3 Nights / 4 Days"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">কোচ টাইপ (বাংলা)</label>
                      <input
                        type="text"
                        value={editingPackage.coachTypeBn}
                        onChange={(e) => setEditingPackage({ ...editingPackage, coachTypeBn: e.target.value })}
                        placeholder="লাক্সারি এসি স্লিপার কোচ"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Coach Type (English)</label>
                      <input
                        type="text"
                        value={editingPackage.coachTypeEn}
                        onChange={(e) => setEditingPackage({ ...editingPackage, coachTypeEn: e.target.value })}
                        placeholder="Luxury AC Sleeper Coach"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">হোটেল / রিসোর্ট (বাংলা)</label>
                      <input
                        type="text"
                        value={editingPackage.hotelBn}
                        onChange={(e) => setEditingPackage({ ...editingPackage, hotelBn: e.target.value })}
                        placeholder="৪-স্টার বিচসাইড হোটেল ও রিসোর্ট"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Hotel / Resort (English)</label>
                      <input
                        type="text"
                        value={editingPackage.hotelEn}
                        onChange={(e) => setEditingPackage({ ...editingPackage, hotelEn: e.target.value })}
                        placeholder="4-Star Beachside Hotel & Resort"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      ট্যুর সুবিধাসমূহ (বাংলা) - প্রতিটি লাইনে একটি করে সুবিধা লিখুন
                    </label>
                    <textarea
                      rows={4}
                      value={editingPackage.inclusionsBn.join('\n')}
                      onChange={(e) =>
                        setEditingPackage({
                          ...editingPackage,
                          inclusionsBn: e.target.value.split('\n').filter((s) => s.trim().length > 0),
                        })
                      }
                      placeholder="ঢাকা-কক্সবাজার রাউন্ডট্রিপ বাস&#10;৪-স্টার হোটেল রুম&#10;প্রতিদিনের বুফে ব্রেকফাস্ট"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Inclusions (English) - One per line
                    </label>
                    <textarea
                      rows={4}
                      value={editingPackage.inclusionsEn.join('\n')}
                      onChange={(e) =>
                        setEditingPackage({
                          ...editingPackage,
                          inclusionsEn: e.target.value.split('\n').filter((s) => s.trim().length > 0),
                        })
                      }
                      placeholder="Round-trip AC Bus Tickets&#10;4-Star Deluxe Hotel Stay&#10;Complimentary Buffet Breakfast"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingPackage(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                  >
                    {locale === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSavePackage(editingPackage)}
                    className="px-5 py-2 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-xl text-xs font-black shadow"
                  >
                    {locale === 'bn' ? 'সম্পন্ন করুন' : 'Done'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================== */}
      {/* 4. OFFERS TAB                                                          */}
      {/* ====================================================================== */}
      {activeTab === 'offers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-[#0B1F3A] flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#FF6B00]" />
                <span>{locale === 'bn' ? 'অফার ও প্রোমো কোড ব্যবস্থাপনা' : 'Special Offers & Promo Codes'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'bn'
                  ? 'কুপন কোড, ডিসকাউন্ট অ্যামাউন্ট, ব্যানার রঙ ও সক্রিয়/নিষ্ক্রিয় স্ট্যাটাস পরিচালনা করুন।'
                  : 'Manage coupon codes, discount amounts, expiration validity, and activate/deactivate.'}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingOffer({
                  id: `offer-${Date.now()}`,
                  code: 'EID2026',
                  badgeBn: 'উৎসব স্পেশাল',
                  badgeEn: 'Festival Special',
                  discountBn: '১৫% নগদ ছাড়',
                  discountEn: '15% Instant Discount',
                  descBn: 'অনলাইন টিকিট বুকিংয়ে উপভোগ করুন সরাসরি ১৫% নগদ ছাড়।',
                  descEn: 'Enjoy 15% instant cashback on all online tickets.',
                  minSpendBn: 'যেকোনো রুটে প্রযোজ্য',
                  minSpendEn: 'Valid on all routes',
                  validityBn: 'মেয়াদ: ৩১ ডিসেম্বর ২০২৬',
                  validityEn: 'Valid until 31 Dec 2026',
                  color: 'from-orange-500 to-amber-500',
                  isActive: true,
                });
                setIsAddingOffer(true);
              }}
              className="px-4 py-2.5 bg-[#0B1F3A] hover:bg-[#FF6B00] text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{locale === 'bn' ? 'নতুন প্রোমো কোড যোগ করুন' : 'Add New Promo Code'}</span>
            </button>
          </div>

          {/* Offers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.offers.map((offer) => (
              <div
                key={offer.id || offer.code}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className={`bg-gradient-to-r ${offer.color} p-5 text-white space-y-1 relative`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                        {offer.badgeBn}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          offer.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {offer.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <h4 className="text-xl font-black">{offer.discountBn}</h4>
                    <p className="text-[11px] text-white/90">{offer.discountEn}</p>
                  </div>

                  <div className="p-5 space-y-3 text-xs">
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">কুপন কোড:</span>
                        <span className="font-mono text-base font-black text-[#0B1F3A] tracking-wider">{offer.code}</span>
                      </div>
                    </div>

                    <p className="text-slate-600 font-medium text-[11px] line-clamp-2">{offer.descBn}</p>

                    <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-semibold space-y-1">
                      <div>{offer.minSpendBn}</div>
                      <div className="text-slate-500 font-bold">{offer.validityBn}</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const updated = config.offers.map((o) => (o.code === offer.code ? { ...o, isActive: !o.isActive } : o));
                      setConfig({ ...config, offers: updated });
                    }}
                    className={`text-[11px] font-bold flex items-center gap-1 ${
                      offer.isActive ? 'text-amber-700 hover:text-amber-900' : 'text-emerald-700 hover:text-emerald-900'
                    }`}
                  >
                    {offer.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{offer.isActive ? (locale === 'bn' ? 'নিষ্ক্রিয় করুন' : 'Deactivate') : (locale === 'bn' ? 'সক্রিয় করুন' : 'Activate')}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingOffer({ ...offer });
                        setIsAddingOffer(false);
                      }}
                      className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{locale === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteOffer(offer.id || offer.code)}
                      className="px-3 py-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-lg flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Offer Edit Modal */}
          {editingOffer && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-[#0B1F3A] flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#FF6B00]" />
                    <span>
                      {isAddingOffer
                        ? locale === 'bn'
                          ? 'নতুন প্রোমো অফার তৈরি'
                          : 'Create Promo Offer'
                        : locale === 'bn'
                        ? 'প্রোমো অফার সম্পাদনা'
                        : 'Edit Promo Offer'}
                    </span>
                  </h3>
                  <button onClick={() => setEditingOffer(null)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                <div className="space-y-3 text-xs font-semibold">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">প্রোমো কোড *</label>
                      <input
                        type="text"
                        value={editingOffer.code}
                        onChange={(e) => setEditingOffer({ ...editingOffer, code: e.target.value.toUpperCase().trim() })}
                        placeholder="WELCOME100"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-black"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">রঙের থিম (Gradient)</label>
                      <select
                        value={editingOffer.color}
                        onChange={(e) => setEditingOffer({ ...editingOffer, color: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <option value="from-orange-500 to-amber-500">কমলা / অ্যাম্বার (Orange/Amber)</option>
                        <option value="from-pink-600 to-rose-500">গোলাপী / বিকাশ (Pink/bKash)</option>
                        <option value="from-amber-600 to-orange-600">নগদ অ্যাম্বার (Nagad)</option>
                        <option value="from-blue-600 to-indigo-600">নীল / ইন্ডিগো (Blue/Indigo)</option>
                        <option value="from-emerald-600 to-teal-600">সবুজ / টিল (Green/Emerald)</option>
                        <option value="from-purple-600 to-violet-600">পার্পল / ভায়োলেট (Purple)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">ছাড়ের পরিমাণ (বাংলা) *</label>
                      <input
                        type="text"
                        value={editingOffer.discountBn}
                        onChange={(e) => setEditingOffer({ ...editingOffer, discountBn: e.target.value })}
                        placeholder="ফ্ল্যাট ১০০ টাকা ছাড়"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Discount (English) *</label>
                      <input
                        type="text"
                        value={editingOffer.discountEn}
                        onChange={(e) => setEditingOffer({ ...editingOffer, discountEn: e.target.value })}
                        placeholder="Flat ৳100 Discount"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">ব্যাজ টেক্সট (বাংলা)</label>
                      <input
                        type="text"
                        value={editingOffer.badgeBn}
                        onChange={(e) => setEditingOffer({ ...editingOffer, badgeBn: e.target.value })}
                        placeholder="নতুন যাত্রীদের জন্য"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Badge (English)</label>
                      <input
                        type="text"
                        value={editingOffer.badgeEn}
                        onChange={(e) => setEditingOffer({ ...editingOffer, badgeEn: e.target.value })}
                        placeholder="First-time Travelers"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">বিবরণ (বাংলা)</label>
                    <textarea
                      rows={2}
                      value={editingOffer.descBn}
                      onChange={(e) => setEditingOffer({ ...editingOffer, descBn: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">মেয়াদ (বাংলা)</label>
                      <input
                        type="text"
                        value={editingOffer.validityBn}
                        onChange={(e) => setEditingOffer({ ...editingOffer, validityBn: e.target.value })}
                        placeholder="মেয়াদ: ৩১ ডিসেম্বর ২০২৬"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">সক্রিয় স্ট্যাটাস</label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id="offerActive"
                          checked={editingOffer.isActive}
                          onChange={(e) => setEditingOffer({ ...editingOffer, isActive: e.target.checked })}
                          className="w-4 h-4 text-[#FF6B00] rounded"
                        />
                        <label htmlFor="offerActive" className="text-slate-700 font-bold">
                          ওয়েবসাইটে সরাসরি প্রদর্শন করুন
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button onClick={() => setEditingOffer(null)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold">
                    {locale === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    onClick={() => handleSaveOffer(editingOffer)}
                    className="px-5 py-2 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-xl text-xs font-black shadow"
                  >
                    {locale === 'bn' ? 'সম্পন্ন করুন' : 'Done'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================== */}
      {/* 5. CONTACT & FAQ TAB                                                   */}
      {/* ====================================================================== */}
      {activeTab === 'contact' && (
        <div className="space-y-6">
          {/* Support Phone Hotlines */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-[#0B1F3A] flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-[#FF6B00]" />
              <span>{locale === 'bn' ? '২৪/৭ সাপোর্ট হটলাইন ও যোগাযোগ নম্বর' : '24/7 Support Hotlines & Desk'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 font-bold mb-1">প্রধান ২৪/৭ হটলাইন (Primary Hotline) *</label>
                <input
                  type="text"
                  value={config.contact.hotline1}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      contact: { ...config.contact, hotline1: e.target.value },
                    })
                  }
                  placeholder="16420"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">বিকল্প মোবাইল নম্বর (Secondary Phone)</label>
                <input
                  type="text"
                  value={config.contact.hotline2}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      contact: { ...config.contact, hotline2: e.target.value },
                    })
                  }
                  placeholder="01711-000000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">হোয়াটসঅ্যাপ সাপোর্ট (WhatsApp)</label>
                <input
                  type="text"
                  value={config.contact.whatsapp}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      contact: { ...config.contact, whatsapp: e.target.value },
                    })
                  }
                  placeholder="+8801711000000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">সাপোর্ট ইমেইল (Support Email) *</label>
                <input
                  type="email"
                  value={config.contact.email}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      contact: { ...config.contact, email: e.target.value },
                    })
                  }
                  placeholder="support@bhabachyaka.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">অফিস সময় (বাংলা)</label>
                <input
                  type="text"
                  value={config.contact.officeHoursBn}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      contact: { ...config.contact, officeHoursBn: e.target.value },
                    })
                  }
                  placeholder="২৪ ঘণ্টা সার্বক্ষণিক সেবা (৭ দিনই খোলা)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Office Hours (English)</label>
                <input
                  type="text"
                  value={config.contact.officeHoursEn}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      contact: { ...config.contact, officeHoursEn: e.target.value },
                    })
                  }
                  placeholder="24/7 Round the Clock Service"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Offices Addresses */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-[#0B1F3A] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#FF6B00]" />
              <span>{locale === 'bn' ? 'প্রধান ও আঞ্চলিক কার্যালয়ের ঠিকানা' : 'Office Headquarters Addresses'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-black text-[#0B1F3A] block">🏢 কেন্দ্রীয় প্রধান টার্মিনাল হাব</span>
                <div>
                  <label className="block text-slate-500 font-bold mb-0.5 text-[10px]">টাইটেল (বাংলা)</label>
                  <input
                    type="text"
                    value={config.contact.headOfficeTitleBn}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        contact: { ...config.contact, headOfficeTitleBn: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-0.5 text-[10px]">ঠিকানা (বাংলা)</label>
                  <textarea
                    rows={2}
                    value={config.contact.headOfficeAddressBn}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        contact: { ...config.contact, headOfficeAddressBn: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-black text-[#0B1F3A] block">🏢 চট্টগ্রাম আঞ্চলিক হাব</span>
                <div>
                  <label className="block text-slate-500 font-bold mb-0.5 text-[10px]">টাইটেল (বাংলা)</label>
                  <input
                    type="text"
                    value={config.contact.regionalOfficeTitleBn}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        contact: { ...config.contact, regionalOfficeTitleBn: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-0.5 text-[10px]">ঠিকানা (বাংলা)</label>
                  <textarea
                    rows={2}
                    value={config.contact.regionalOfficeAddressBn}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        contact: { ...config.contact, regionalOfficeAddressBn: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FAQs Manager */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#0B1F3A] flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#FF6B00]" />
                  <span>{locale === 'bn' ? 'সাধারণ জিজ্ঞাসা (FAQ) ব্যবস্থাপনা' : 'Frequently Asked Questions (FAQ)'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {locale === 'bn'
                    ? 'যাত্রীদের সচরাচর প্রশ্নের উত্তর যোগ, সম্পাদনা বা বাতিল করুন।'
                    : 'Manage questions and answers displayed on the public contact page.'}
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingFaq({
                    id: `faq-${Date.now()}`,
                    qBn: '',
                    qEn: '',
                    aBn: '',
                    aEn: '',
                  });
                  setIsAddingFaq(true);
                }}
                className="px-4 py-2 bg-[#0B1F3A] hover:bg-[#FF6B00] text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{locale === 'bn' ? 'নতুন FAQ যোগ করুন' : 'Add FAQ'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {config.contact.faqs.map((faq, idx) => (
                <div key={faq.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-[#FF6B00] uppercase">প্রশ্ন #{idx + 1}</span>
                      <h4 className="text-sm font-black text-[#0B1F3A]">{faq.qBn}</h4>
                      <p className="text-xs text-slate-500 font-semibold">{faq.qEn}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingFaq({ ...faq });
                          setIsAddingFaq(false);
                        }}
                        className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3 text-blue-600" />
                        <span>{locale === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="px-3 py-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-lg flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-normal pt-2 border-t border-slate-200/60 leading-relaxed">
                    {faq.aBn}
                  </p>
                </div>
              ))}
            </div>

            {/* FAQ Edit Modal */}
            {editingFaq && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-black text-[#0B1F3A]">
                      {isAddingFaq ? (locale === 'bn' ? 'নতুন FAQ যোগ করুন' : 'Add FAQ') : (locale === 'bn' ? 'FAQ সম্পাদনা' : 'Edit FAQ')}
                    </h3>
                    <button onClick={() => setEditingFaq(null)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs font-semibold">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">প্রশ্ন (বাংলা) *</label>
                      <input
                        type="text"
                        value={editingFaq.qBn}
                        onChange={(e) => setEditingFaq({ ...editingFaq, qBn: e.target.value })}
                        placeholder="অনলাইনে কেনা টিকিট কিভাবে বাতিল করব?"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Question (English) *</label>
                      <input
                        type="text"
                        value={editingFaq.qEn}
                        onChange={(e) => setEditingFaq({ ...editingFaq, qEn: e.target.value })}
                        placeholder="How can I cancel my ticket online?"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">উত্তর (বাংলা) *</label>
                      <textarea
                        rows={3}
                        value={editingFaq.aBn}
                        onChange={(e) => setEditingFaq({ ...editingFaq, aBn: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Answer (English) *</label>
                      <textarea
                        rows={3}
                        value={editingFaq.aEn}
                        onChange={(e) => setEditingFaq({ ...editingFaq, aEn: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button onClick={() => setEditingFaq(null)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold">
                      {locale === 'bn' ? 'বাতিল' : 'Cancel'}
                    </button>
                    <button
                      onClick={() => handleSaveFaq(editingFaq)}
                      className="px-5 py-2 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-xl text-xs font-black shadow"
                    >
                      {locale === 'bn' ? 'সম্পন্ন করুন' : 'Done'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 6. HERO BANNER TAB                                                     */}
      {/* ====================================================================== */}
      {activeTab === 'hero' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-black text-[#0B1F3A] flex items-center gap-2">
              <Layout className="w-5 h-5 text-[#FF6B00]" />
              <span>{locale === 'bn' ? 'হোমপেজ হিরো ব্যানার কাস্টমাইজেশন' : 'Homepage Hero Banner Customization'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {locale === 'bn'
                ? 'হোমপেজের মূল ব্যানার ছবি, হেডলাইন, সাবহেডলাইন ও ট্যাগলাইন পরিবর্তন করুন।'
                : 'Configure hero headline, background bus photo, taglines, and welcome badges.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-semibold">
            {/* Bengali Headline */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">হেডলাইন (বাংলা)</label>
              <input
                type="text"
                value={config.hero.headlineBn}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, headlineBn: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">হাইলাইট শব্দ (বাংলা, কমলা রঙ)</label>
              <input
                type="text"
                value={config.hero.headlineHighlightBn}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, headlineHighlightBn: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {/* English Headline */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Headline (English)</label>
              <input
                type="text"
                value={config.hero.headlineEn}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, headlineEn: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Highlight Word (English, Orange)</label>
              <input
                type="text"
                value={config.hero.headlineHighlightEn}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, headlineHighlightEn: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Subheadline */}
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">সাবহেডলাইন (বাংলা)</label>
              <input
                type="text"
                value={config.hero.subheadlineBn}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, subheadlineBn: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Subheadline (English)</label>
              <input
                type="text"
                value={config.hero.subheadlineEn}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, subheadlineEn: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Background Bus Image */}
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">হিরো ব্যানার বাসের ছবি (Background Bus Image URL)</label>
              <input
                type="text"
                value={config.hero.backgroundImageUrl}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, backgroundImageUrl: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
              />
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                <span className="text-[10px] text-slate-400 font-bold">ছবির প্রিসেট:</span>
                {imagePresets.map((preset) => (
                  <button
                    key={preset.path}
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, backgroundImageUrl: preset.path },
                      })
                    }
                    className="text-[10px] px-2 py-0.5 rounded border bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 7. MENU BAR TAB                                                        */}
      {/* ====================================================================== */}
      {activeTab === 'menu' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-black text-[#0B1F3A] flex items-center gap-2">
              <Menu className="w-5 h-5 text-[#FF6B00]" />
              <span>{locale === 'bn' ? 'মেনুবার লিংক ব্যবস্থাপনা' : 'Navbar Menu Links'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {locale === 'bn'
                ? 'ন্যাভবারের যেকোনো আইটেম চালু বা বন্ধ করুন, নাম ও রাউট পরিবর্তন করুন অথবা নতুন মেনু যোগ করুন।'
                : 'Toggle navbar links on/off, rename titles, or add custom navigation links.'}
            </p>
          </div>

          <div className="space-y-3">
            {config.menuItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  item.isActive ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleMenuItem(item.id)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      item.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-200 text-slate-400 border-slate-300'
                    }`}
                  >
                    {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={item.nameBn}
                      onChange={(e) => handleUpdateMenuItem(item.id, 'nameBn', e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      placeholder="মেনু নাম (বাংলা)"
                    />
                    <input
                      type="text"
                      value={item.nameEn}
                      onChange={(e) => handleUpdateMenuItem(item.id, 'nameEn', e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      placeholder="Menu Name (English)"
                    />
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) => handleUpdateMenuItem(item.id, 'href', e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-600"
                      placeholder="/route"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {item.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomItem(item.id)}
                      className="p-2 text-red-500 hover:text-red-700 bg-white border border-red-200 rounded-xl cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Custom Menu Item Form */}
          <form onSubmit={handleAddCustomMenuItem} className="pt-4 border-t border-slate-200 space-y-3">
            <span className="text-xs font-black text-[#0B1F3A] flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#FF6B00]" />
              <span>{locale === 'bn' ? 'নতুন কাস্টম মেনু যোগ করুন' : 'Add Custom Navbar Item'}</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <input
                type="text"
                value={newItemNameBn}
                onChange={(e) => setNewItemNameBn(e.target.value)}
                placeholder="নাম (বাংলা)"
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                value={newItemNameEn}
                onChange={(e) => setNewItemNameEn(e.target.value)}
                placeholder="Name (English)"
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                value={newItemHref}
                onChange={(e) => setNewItemHref(e.target.value)}
                placeholder="/custom-page"
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#0B1F3A] hover:bg-[#FF6B00] text-white font-black rounded-xl transition-all cursor-pointer shadow-sm"
              >
                {locale === 'bn' ? '+ যোগ করুন' : '+ Add Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 8. ANNOUNCEMENT TAB                                                    */}
      {/* ====================================================================== */}
      {activeTab === 'announcement' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-black text-[#0B1F3A] flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#FF6B00]" />
              <span>{locale === 'bn' ? 'টপ এনাউন্সমেন্ট নোটিশ বার' : 'Top Announcement Notice Bar'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {locale === 'bn'
                ? 'ওয়েবসাইটের একেবারে উপরে চলমান নোটিশ বা স্পেশাল ডিসকাউন্ট অ্যালার্ট।'
                : 'Top ticker banner for special festival discounts, seat booking advisories, or live notices.'}
            </p>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <input
                type="checkbox"
                id="annToggle"
                checked={config.announcement.enabled}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    announcement: { ...config.announcement, enabled: e.target.checked },
                  })
                }
                className="w-4 h-4 text-[#FF6B00] rounded"
              />
              <label htmlFor="annToggle" className="text-slate-800 font-bold cursor-pointer">
                {locale === 'bn' ? 'ওয়েবসাইটে এই এনাউন্সমেন্ট বার চালু রাখুন' : 'Enable Top Announcement Banner'}
              </label>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">নোটিশ টেক্সট (বাংলা)</label>
              <textarea
                rows={2}
                value={config.announcement.textBn}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    announcement: { ...config.announcement, textBn: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Notice Text (English)</label>
              <textarea
                rows={2}
                value={config.announcement.textEn}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    announcement: { ...config.announcement, textEn: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
