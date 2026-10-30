'use client';

import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Building2,
  Headphones,
} from 'lucide-react';
import { Locale } from '@/lib/i18n';
import { ContactConfig } from '@/lib/siteConfig';

interface Props {
  contact: ContactConfig;
  locale: Locale;
}

export default function ContactClient({ contact: initialContact, locale }: Props) {
  const [contact, setContact] = useState<ContactConfig>(initialContact);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'booking',
    message: '',
  });

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  React.useEffect(() => {
    fetch('/api/site-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config?.contact) {
          setContact(data.config.contact);
        }
      })
      .catch((err) => console.log('Using initial contact:', err));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      alert(locale === 'bn' ? 'সব প্রয়োজনীয় তথ্য পূরণ করুন।' : 'Please fill in all required fields.');
      return;
    }
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: 'booking',
        message: '',
      });
    }, 5000);
  };

  const faqs = contact.faqs || [];

  return (
    <div className="bg-[#F6F8FB] min-h-screen pb-16">
      {/* Hero Header */}
      <section className="relative bg-[#0B1F3A] text-white py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A] via-[#0E2648] to-[#153B63] opacity-95"></div>
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FFB020] text-xs font-bold shadow-sm">
            <Headphones className="w-4 h-4 text-[#FF6B00]" />
            <span>{locale === 'bn' ? '২৪ ঘণ্টা সার্বক্ষণিক যাত্রী সেবা' : '24/7 Passenger Help Desk'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {locale === 'bn' ? 'যোগাযোগ ও সাপোর্ট সেন্টার' : 'Contact & Support Center'}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            {locale === 'bn'
              ? 'টিকেট বুকিং, বাস সময়সূচী, রিফান্ড বা যেকোনো জরুরি অনুসন্ধানে আমাদের ডেডিকেটেড সাপোর্ট টিম সব সময় আপনার সেবায় প্রস্তুত।'
              : 'Our round-the-clock passenger desk is always standing by to help with bookings, cancellations, schedule updates, and customer feedback.'}
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {/* Hotlines Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center shrink-0 border border-orange-200 shadow-2xs">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {locale === 'bn' ? '২৪/৭ হেল্পলাইন' : '24/7 Hotline'}
              </span>
              <a href={`tel:${contact.hotline1}`} className="text-base font-black text-[#0B1F3A] hover:text-[#FF6B00] block">
                {contact.hotline1}
              </a>
              <a href={`tel:${contact.hotline2}`} className="text-xs font-semibold text-slate-600 hover:text-slate-900 block">
                {contact.hotline2}
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200 shadow-2xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {locale === 'bn' ? 'ইমেইল সহায়তা' : 'Email Desk'}
              </span>
              <a href={`mailto:${contact.email}`} className="text-xs font-bold text-[#0B1F3A] hover:text-[#FF6B00] block truncate">
                {contact.email}
              </a>
              <span className="text-[10px] text-slate-500 font-medium block">
                {locale === 'bn' ? '১ ঘণ্টার মধ্যে রেসপন্স' : 'Fast 1-hour response'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200 shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {locale === 'bn' ? 'প্রধান টার্মিনাল হাব' : 'Central Hub'}
              </span>
              <span className="text-xs font-black text-[#0B1F3A] block">
                {locale === 'bn' ? contact.headOfficeTitleBn : contact.headOfficeTitleEn}
              </span>
              <span className="text-[10px] text-slate-500 font-medium block line-clamp-1">
                {locale === 'bn' ? contact.headOfficeAddressBn : contact.headOfficeAddressEn}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200 shadow-2xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {locale === 'bn' ? 'চট্টগ্রাম আঞ্চলিক হাব' : 'Chattogram Hub'}
              </span>
              <span className="text-xs font-black text-[#0B1F3A] block">
                {locale === 'bn' ? contact.regionalOfficeTitleBn : contact.regionalOfficeTitleEn}
              </span>
              <span className="text-[10px] text-slate-500 font-medium block line-clamp-1">
                {locale === 'bn' ? contact.regionalOfficeAddressBn : contact.regionalOfficeAddressEn}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Form & Office Map Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inquiry / Feedback Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6B00] bg-orange-50 px-2.5 py-1 rounded-md">
                {locale === 'bn' ? 'বার্তা পাঠান' : 'Send a Message'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#0B1F3A] mt-2">
                {locale === 'bn' ? 'আমরা কীভাবে আপনাকে সাহায্য করতে পারি?' : 'How Can We Assist You Today?'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'bn'
                  ? 'নিচের ফর্মটি পূরণ করে পাঠান। আমাদের কাস্টমার কেয়ার টিম দ্রুত যোগাযোগ করবে।'
                  : 'Complete the form below and our operations desk will reach back out directly.'}
              </p>
            </div>

            {formSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3 text-emerald-800 animate-fade-in">
                <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-lg">
                  {locale === 'bn' ? 'ধন্যবাদ! আপনার বার্তা সফলভাবে পাঠানো হয়েছে।' : 'Message Sent Successfully!'}
                </h4>
                <p className="text-xs max-w-md mx-auto font-medium">
                  {locale === 'bn'
                    ? 'আমাদের একজন প্রতিনিধি খুব শীঘ্রই আপনার দেওয়া ফোন বা ইমেইলে যোগাযোগ করবেন।'
                    : 'A dedicated customer support officer will review your message and reach out promptly.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {locale === 'bn' ? 'আপনার নাম *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={locale === 'bn' ? 'মোহাম্মদ করিম' : 'John Doe'}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {locale === 'bn' ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {locale === 'bn' ? 'ইমেইল এড্রেস (ঐচ্ছিক)' : 'Email Address (Optional)'}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {locale === 'bn' ? 'অনুসন্ধানের বিষয় *' : 'Subject Category *'}
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    >
                      <option value="booking">
                        {locale === 'bn' ? 'টিকেট বুকিং সহায়তা' : 'Ticket Booking Help'}
                      </option>
                      <option value="refund">
                        {locale === 'bn' ? 'বাতিল ও রিফান্ড সংক্রান্ত' : 'Cancellation & Refund'}
                      </option>
                      <option value="delay">
                        {locale === 'bn' ? 'বাস শিডিউল ও বিলম্ব' : 'Bus Schedule & Delay'}
                      </option>
                      <option value="luggage">
                        {locale === 'bn' ? 'হারিয়ে যাওয়া লাগেজ' : 'Lost & Found Luggage'}
                      </option>
                      <option value="corporate">
                        {locale === 'bn' ? 'কর্পোরেট বাস রেন্টাল' : 'Corporate Coach Rental'}
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {locale === 'bn' ? 'আপনার বার্তা লিখুন *' : 'Your Detailed Message *'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={
                      locale === 'bn'
                        ? 'আপনার প্রশ্ন, পিএনআর নম্বর বা বিস্তারিত লিখুন...'
                        : 'Describe your query or provide your PNR details...'
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{locale === 'bn' ? 'বার্তা পাঠান' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>

          {/* FAQ Accordion (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="font-black text-base text-[#0B1F3A]">
                  {locale === 'bn' ? 'সাধারণ প্রশ্ন ও উত্তর (FAQ)' : 'Frequently Asked Questions'}
                </h3>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div
                      key={faq.id || index}
                      className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between gap-3 text-xs font-black text-[#0B1F3A]"
                      >
                        <span>{locale === 'bn' ? faq.qBn : faq.qEn}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#FF6B00] shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed font-medium border-t border-slate-100 animate-fade-in">
                          {locale === 'bn' ? faq.aBn : faq.aEn}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
