export interface MenuItem {
  id: string;
  nameBn: string;
  nameEn: string;
  href: string;
  isActive: boolean;
  isCustom?: boolean;
}

export interface HeroConfig {
  headlineBn: string;
  headlineHighlightBn: string;
  headlineEn: string;
  headlineHighlightEn: string;
  subheadlineBn: string;
  subheadlineEn: string;
  taglineBn: string;
  taglineEn: string;
  badgeTextBn: string;
  badgeTextEn: string;
  backgroundImageUrl: string;
}

export interface AnnouncementConfig {
  enabled: boolean;
  textBn: string;
  textEn: string;
}

// 1. COUNTER CMS ITEM
export interface CounterItem {
  id: string;
  nameBn: string;
  nameEn: string;
  districtBn: string;
  districtEn: string;
  divisionBn: string;
  divisionEn: string;
  addressBn: string;
  addressEn: string;
  phone: string;
  hoursBn: string;
  hoursEn: string;
  image: string;
  amenitiesBn: string[];
  amenitiesEn: string[];
  isFeatured?: boolean;
}

// 2. ABOUT US CMS CONFIG
export interface AboutStat {
  id: string;
  valueBn: string;
  valueEn: string;
  labelBn: string;
  labelEn: string;
}

export interface AboutFleetCoach {
  id: string;
  nameBn: string;
  nameEn: string;
  featuresBn: string;
  featuresEn: string;
  image: string;
}

export interface AboutPillar {
  id: string;
  iconName: string;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
}

export interface AboutConfig {
  storyTitleBn: string;
  storyTitleEn: string;
  storyTaglineBn: string;
  storyTaglineEn: string;
  storyDescBn: string;
  storyDescEn: string;
  storyImage: string;
  stats: AboutStat[];
  pillars: AboutPillar[];
  fleet: AboutFleetCoach[];
}

// 3. PACKAGES CMS CONFIG
export interface TourPackage {
  id: string;
  category: 'ALL' | 'BEACH' | 'HILLS' | 'FOREST' | 'HERITAGE';
  titleBn: string;
  titleEn: string;
  durationBn: string;
  durationEn: string;
  price: number;
  image: string;
  coachTypeBn: string;
  coachTypeEn: string;
  hotelBn: string;
  hotelEn: string;
  inclusionsBn: string[];
  inclusionsEn: string[];
  departuresBn: string;
  departuresEn: string;
  isPopular?: boolean;
}

// 4. OFFERS CMS CONFIG
export interface OfferItem {
  id: string;
  code: string;
  badgeBn: string;
  badgeEn: string;
  discountBn: string;
  discountEn: string;
  descBn: string;
  descEn: string;
  minSpendBn: string;
  minSpendEn: string;
  validityBn: string;
  validityEn: string;
  color: string;
  isActive: boolean;
}

// 5. CONTACT CMS CONFIG
export interface FAQItem {
  id: string;
  qBn: string;
  qEn: string;
  aBn: string;
  aEn: string;
}

export interface ContactConfig {
  hotline1: string;
  hotline2: string;
  emergencyPhone: string;
  email: string;
  whatsapp: string;
  headOfficeTitleBn: string;
  headOfficeTitleEn: string;
  headOfficeAddressBn: string;
  headOfficeAddressEn: string;
  regionalOfficeTitleBn: string;
  regionalOfficeTitleEn: string;
  regionalOfficeAddressBn: string;
  regionalOfficeAddressEn: string;
  officeHoursBn: string;
  officeHoursEn: string;
  faqs: FAQItem[];
}

// FULL SITE CONFIG INTERFACE
export interface SiteConfig {
  hero: HeroConfig;
  menuItems: MenuItem[];
  announcement: AnnouncementConfig;
  counters: CounterItem[];
  about: AboutConfig;
  packages: TourPackage[];
  offers: OfferItem[];
  contact: ContactConfig;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  hero: {
    headlineBn: 'নিরাপদে পৌঁছে দেবে',
    headlineHighlightBn: 'আপনার গন্তব্যে',
    headlineEn: 'Safe Journeys to',
    headlineHighlightEn: 'Your Destination',
    subheadlineBn: 'সারা বাংলাদেশের যেকোনো প্রান্তে এখন আরও সহজে, আরও আরামে লাইভ সিট বুকিং করুন।',
    subheadlineEn: 'Book bus tickets easily and travel comfortably to any destination across Bangladesh.',
    taglineBn: 'Your Journey, Our Responsibility.',
    taglineEn: 'Your Journey, Our Responsibility.',
    badgeTextBn: '🇧🇩 বাংলাদেশের ৬৪ জেলার বিশ্বস্ত বাস নেটওয়ার্ক',
    badgeTextEn: '🇧🇩 Nationwide 64 Districts Intercity Bus Network',
    backgroundImageUrl: '/images/hero/hero-bus.jpg',
  },
  menuItems: [
    { id: 'home', nameBn: 'হোম', nameEn: 'Home', href: '/', isActive: true, isCustom: false },
    { id: 'search', nameBn: 'সার্চ বাস', nameEn: 'Search Buses', href: '/search', isActive: true, isCustom: false },
    { id: 'counters', nameBn: 'কাউন্টারসমূহ', nameEn: 'Counters', href: '/counters', isActive: true, isCustom: false },
    { id: 'about', nameBn: 'আমাদের সম্পর্কে', nameEn: 'About Us', href: '/about', isActive: true, isCustom: false },
    { id: 'packages', nameBn: 'প্যাকেজসমূহ', nameEn: 'Packages', href: '/packages', isActive: true, isCustom: false },
    { id: 'offers', nameBn: 'অফারসমূহ', nameEn: 'Offers', href: '/offers', isActive: true, isCustom: false },
    { id: 'contact', nameBn: 'যোগাযোগ', nameEn: 'Contact', href: '/contact', isActive: true, isCustom: false },
  ],
  announcement: {
    enabled: true,
    textBn: '📢 ঈদ ও উৎসবের স্পেশাল আগাম টিকিট বুকিং এখন শুরু হয়েছে! অগ্রিম বুকিংয়ে পান ১০% ছাড়।',
    textEn: '📢 Early bird advance festival ticketing is now active! Enjoy 10% off on all online bookings.',
  },

  // DEFAULT COUNTERS
  counters: [
    {
      id: 'dhaka-sayedabad',
      nameBn: 'সায়েদাবাদ কেন্দ্রীয় টার্মিনাল কাউন্টার',
      nameEn: 'Sayedabad Central Terminal Counter',
      districtBn: 'ঢাকা',
      districtEn: 'Dhaka',
      divisionBn: 'ঢাকা',
      divisionEn: 'Dhaka',
      addressBn: 'কাউন্টার নং ১২-১৪, সায়েদাবাদ বাস টার্মিনাল, ঢাকা-১২০৪',
      addressEn: 'Counter 12-14, Sayedabad Bus Terminal, Dhaka-1204',
      phone: '01710-123456',
      hoursBn: '২৪ ঘণ্টা খোলা',
      hoursEn: '24/7 Service',
      image: '/images/destinations/dhaka-highway.jpg',
      amenitiesBn: ['এসি ওয়েটিং রুম', 'ফ্রি ওয়াইফাই', 'লাগেজ লকার', 'পার্সেল বুকিং', 'নামাজ ঘর'],
      amenitiesEn: ['AC Waiting Lounge', 'Free Wi-Fi', 'Luggage Locker', 'Parcel Desk', 'Prayer Room'],
      isFeatured: true,
    },
    {
      id: 'dhaka-gabtoli',
      nameBn: 'গাবতলী ইন্টারসিটি টার্মিনাল কাউন্টার',
      nameEn: 'Gabtoli Intercity Terminal Counter',
      districtBn: 'ঢাকা',
      districtEn: 'Dhaka',
      divisionBn: 'ঢাকা',
      divisionEn: 'Dhaka',
      addressBn: 'গেট নং ২, গাবতলী আন্তঃজেলা বাস টার্মিনাল, মিরপুর, ঢাকা',
      addressEn: 'Gate No. 2, Gabtoli Interdistrict Terminal, Mirpur, Dhaka',
      phone: '01710-123457',
      hoursBn: 'সকাল ০৫:০০ - রাত ১২:০০',
      hoursEn: '05:00 AM - 12:00 Midnight',
      image: '/images/hero/hero-bus.jpg',
      amenitiesBn: ['এসি ওয়েটিং রুম', 'লাগেজ সেবা', 'টিকিট রি-ইস্যু', 'পার্সেল সার্ভিস'],
      amenitiesEn: ['AC Waiting Room', 'Luggage Service', 'Ticket Reissue', 'Parcel Desk'],
      isFeatured: true,
    },
    {
      id: 'chattogram-dampara',
      nameBn: 'চট্টগ্রাম দামপাড়া প্রধান টার্মিনাল কাউন্টার',
      nameEn: 'Chattogram Dampara Main Terminal Counter',
      districtBn: 'চট্টগ্রাম',
      districtEn: 'Chattogram',
      divisionBn: 'চট্টগ্রাম',
      divisionEn: 'Chattogram',
      addressBn: 'ওয়াসা মোড়, দামপাড়া পুলিশ লাইন সংলগ্ন, এম এম আলী রোড, চট্টগ্রাম',
      addressEn: 'WASA Mor, Opp. Police Line, Dampara, M.M. Ali Road, Chattogram',
      phone: '01710-123458',
      hoursBn: '২৪ ঘণ্টা খোলা',
      hoursEn: '24/7 Service',
      image: '/images/buses/luxury-fleet.jpg',
      amenitiesBn: ['ভিআইপি লাউঞ্জ', 'সুপারফাস্ট ওয়াইফাই', 'রিসাইকেল বার্থ', 'ওয়াশরুম'],
      amenitiesEn: ['VIP Lounge', 'High-Speed Wi-Fi', 'Reclining Seats', 'Restrooms'],
      isFeatured: true,
    },
    {
      id: 'coxs-bazar-jhautala',
      nameBn: 'কক্সবাজার ঝাউতলা প্রধান কাউন্টার',
      nameEn: 'Cox’s Bazar Jhautala Main Counter',
      districtBn: 'কক্সবাজার',
      districtEn: "Cox's Bazar",
      divisionBn: 'চট্টগ্রাম',
      divisionEn: 'Chattogram',
      addressBn: 'ঝাউতলা প্রধান সড়ক, হোটেল মোটেল জোন সংযোগ রোড, কক্সবাজার',
      addressEn: 'Jhautala Main Road, Connecting Hotel-Motel Zone, Cox’s Bazar',
      phone: '01710-123459',
      hoursBn: 'সকাল ০৬:০০ - রাত ০১:০০',
      hoursEn: '06:00 AM - 01:00 AM',
      image: '/images/destinations/coxs-bazar.jpg',
      amenitiesBn: ['বিচ লাউঞ্জ', 'পর্যটন হেল্প ডেস্ক', 'শাওয়ার রুম', 'লাগেজ স্টোরেজ'],
      amenitiesEn: ['Beachside Lounge', 'Tourist Info Desk', 'Shower Facility', 'Luggage Storage'],
      isFeatured: true,
    },
    {
      id: 'sylhet-kadamtali',
      nameBn: 'সিলেট কদমতলী কেন্দ্রীয় বাস টার্মিনাল কাউন্টার',
      nameEn: 'Sylhet Kadamtali Central Terminal Counter',
      districtBn: 'সিলেট',
      districtEn: 'Sylhet',
      divisionBn: 'সিলেট',
      divisionEn: 'Sylhet',
      addressBn: 'কদমতলী বাস টার্মিনাল কমপ্লেক্স, দক্ষিণ সুরমা, সিলেট-৩১০০',
      addressEn: 'Kadamtali Terminal Complex, South Surma, Sylhet-3100',
      phone: '01710-123460',
      hoursBn: 'সকাল ০৫:৩০ - রাত ১১:৩০',
      hoursEn: '05:30 AM - 11:30 PM',
      image: '/images/destinations/sylhet.jpg',
      amenitiesBn: ['এসি ওয়েটিং রুম', 'চা ও কফি কর্নার', 'ফ্রি ওয়াইফাই', 'পার্সেল সার্ভিস'],
      amenitiesEn: ['AC Waiting Room', 'Tea & Coffee Corner', 'Free Wi-Fi', 'Parcel Express'],
      isFeatured: true,
    },
    {
      id: 'rajshahi-shiroil',
      nameBn: 'রাজশাহী শিরোইল বাস টার্মিনাল কাউন্টার',
      nameEn: 'Rajshahi Shiroil Terminal Counter',
      districtBn: 'রাজশাহী',
      districtEn: 'Rajshahi',
      divisionBn: 'রাজশাহী',
      divisionEn: 'Rajshahi',
      addressBn: 'শিরোইল বাস টার্মিনাল, রেলওয়ে স্টেশনের বিপরীতে, রাজশাহী',
      addressEn: 'Shiroil Bus Terminal, Opp. Railway Station, Rajshahi',
      phone: '01710-123461',
      hoursBn: 'সকাল ০৬:০০ - রাত ১১:০০',
      hoursEn: '06:00 AM - 11:00 PM',
      image: '/images/hero/banner.jpg',
      amenitiesBn: ['শীতাতপ নিয়ন্ত্রিত লাউঞ্জ', 'মোবাইল চার্জিং বুথ', 'লাগেজ রুম'],
      amenitiesEn: ['Air Conditioned Lounge', 'Mobile Charging Booths', 'Luggage Locker'],
      isFeatured: true,
    },
    {
      id: 'khulna-sonadanga',
      nameBn: 'খুলনা সোনাডাঙ্গা কেন্দ্রীয় বাস টার্মিনাল কাউন্টার',
      nameEn: 'Khulna Sonadanga Central Terminal Counter',
      districtBn: 'খুলনা',
      districtEn: 'Khulna',
      divisionBn: 'খুলনা',
      divisionEn: 'Khulna',
      addressBn: 'সোনাডাঙ্গা বাস টার্মিনাল রোড, খুলনা সদর, খুলনা',
      addressEn: 'Sonadanga Bus Terminal Road, Khulna Sadar, Khulna',
      phone: '01710-123462',
      hoursBn: 'সকাল ০৫:৩০ - রাত ১১:৪৫',
      hoursEn: '05:30 AM - 11:45 PM',
      image: '/images/destinations/dhaka-highway.jpg',
      amenitiesBn: ['এসি ওয়েটিং হল', 'ফ্রি হাইস্পিড ওয়াইফাই', 'পার্সেল সার্ভিস'],
      amenitiesEn: ['AC Waiting Hall', 'Free Wi-Fi', 'Parcel Express'],
      isFeatured: true,
    },
    {
      id: 'barishal-nathullabad',
      nameBn: 'বরিশাল নথুল্লাবাদ কেন্দ্রীয় টার্মিনাল কাউন্টার',
      nameEn: 'Barishal Nathullabad Central Terminal Counter',
      districtBn: 'বরিশাল',
      districtEn: 'Barishal',
      divisionBn: 'বরিশাল',
      divisionEn: 'Barishal',
      addressBn: 'নথুল্লাবাদ কেন্দ্রীয় বাস টার্মিনাল, বরিশাল',
      addressEn: 'Nathullabad Central Bus Terminal, Barishal',
      phone: '01710-123463',
      hoursBn: 'সকাল ০৬:০০ - রাত ১১:৩০',
      hoursEn: '06:00 AM - 11:30 PM',
      image: '/images/buses/luxury-fleet.jpg',
      amenitiesBn: ['পদ্মা এক্সপ্রেস লাউঞ্জ', 'এসি হল', 'লাগেজ লকার'],
      amenitiesEn: ['Padma Express Lounge', 'AC Hall', 'Luggage Locker'],
      isFeatured: true,
    },
    {
      id: 'rangpur-kamarpara',
      nameBn: 'রংপুর কামারপাড়া ঢাকা বাস স্ট্যান্ড কাউন্টার',
      nameEn: 'Rangpur Kamarpara Dhaka Bus Stand Counter',
      districtBn: 'রংপুর',
      districtEn: 'Rangpur',
      divisionBn: 'রংপুর',
      divisionEn: 'Rangpur',
      addressBn: 'কামারপাড়া ঢাকা কোচ স্ট্যান্ড, গ্র্যান্ড ট্রাঙ্ক রোড, রংপুর',
      addressEn: 'Kamarpara Dhaka Coach Stand, Grand Trunk Road, Rangpur',
      phone: '01710-123464',
      hoursBn: 'সকাল ০৬:০০ - রাত ১১:০০',
      hoursEn: '06:00 AM - 11:00 PM',
      image: '/images/hero/hero-bus.jpg',
      amenitiesBn: ['এসি ওয়েটিং রুম', 'মোবাইল চার্জিং পয়েন্ট', 'লাগেজ সার্ভিস'],
      amenitiesEn: ['AC Waiting Room', 'Charging Stations', 'Luggage Assistance'],
      isFeatured: true,
    },
    {
      id: 'bogura-charmatha',
      nameBn: 'বগুড়া চারমাথা কেন্দ্রীয় বাস টার্মিনাল কাউন্টার',
      nameEn: 'Bogura Charmatha Central Terminal Counter',
      districtBn: 'বগুড়া',
      districtEn: 'Bogura',
      divisionBn: 'রাজশাহী',
      divisionEn: 'Rajshahi',
      addressBn: 'চারমাথা কেন্দ্রীয় বাস টার্মিনাল, রংপুর রোড, বগুড়া',
      addressEn: 'Charmatha Central Bus Terminal, Rangpur Road, Bogura',
      phone: '01710-123465',
      hoursBn: '২৪ ঘণ্টা খোলা',
      hoursEn: '24/7 Service',
      image: '/images/destinations/dhaka-highway.jpg',
      amenitiesBn: ['হাইওয়ে ট্রানজিট লাউঞ্জ', 'এসি ওয়েটিং রুম', 'স্ন্যাকস কর্নার'],
      amenitiesEn: ['Highway Transit Lounge', 'AC Waiting Room', 'Snack Counter'],
      isFeatured: true,
    },
    {
      id: 'bandarban-main',
      nameBn: 'বান্দরবান প্রধান বাস টার্মিনাল কাউন্টার',
      nameEn: 'Bandarban Main Bus Terminal Counter',
      districtBn: 'বান্দরবান',
      districtEn: 'Bandarban',
      divisionBn: 'চট্টগ্রাম',
      divisionEn: 'Chattogram',
      addressBn: 'হিলভিউ মোড়, প্রধান বাস টার্মিনাল, বান্দরবান সদর',
      addressEn: 'Hillview Mor, Main Bus Terminal, Bandarban Sadar',
      phone: '01710-123466',
      hoursBn: 'সকাল ০৬:০০ - রাত ১০:০০',
      hoursEn: '06:00 AM - 10:00 PM',
      image: '/images/destinations/sylhet.jpg',
      amenitiesBn: ['পাহাড়ি ভ্রমণ ডেস্ক', 'চান্দের গাড়ি কো-অর্ডিনেশন', 'লাগেজ স্টোরেজ'],
      amenitiesEn: ['Mountain Tour Desk', '4x4 Chander Gari Desk', 'Luggage Hold'],
      isFeatured: true,
    },
  ],

  // DEFAULT ABOUT US
  about: {
    storyTitleBn: 'ভ্যাবাচ্যাকা এক্সপ্রেস সম্পর্কে',
    storyTitleEn: 'About Bhabachyaka Express',
    storyTaglineBn: 'নিরাপদে পৌঁছে দেবে আপনার গন্তব্যে',
    storyTaglineEn: 'Your Journey, Our Responsibility.',
    storyDescBn:
      'ভ্যাবাচ্যাকা এক্সপ্রেস বাংলাদেশের পরিবহন খাতে এক নতুন দিগন্ত উন্মোচন করেছে। আধুনিক প্রযুক্তি, ইউরোপিয়ান স্ট্যান্ডার্ড লাক্সারি বাস এবং ৬৪ জেলার বিস্তৃত কাউন্টার নেটওয়ার্কের মাধ্যমে আমরা দেশের প্রতিটি যাত্রীর জন্য নিরাপদ, আরামদায়ক ও নির্ভরযোগ্য যাতায়াত নিশ্চিত করি। আমাদের লক্ষ্য প্রতিটি ভ্রমণকে করে তোলা আনন্দময় ও নির্ঝঞ্ঝাট।',
    storyDescEn:
      'Bhabachyaka Express is setting a new benchmark in Bangladesh’s intercity transit. With state-of-the-art European coaches, advanced online e-ticketing, and an expansive 64-district terminal network, we ensure every passenger experiences safety, punctuality, and true Bangladeshi hospitality.',
    storyImage: '/images/hero/hero-bus.jpg',
    stats: [
      { id: 'stat-1', valueBn: '৬৪', valueEn: '64', labelBn: 'জেলায় বিস্তৃত নেটওয়ার্ক', labelEn: 'Districts Connected' },
      { id: 'stat-2', valueBn: '২৫০+', valueEn: '250+', labelBn: 'আধুনিক এসি ও স্লিপার বাস', labelEn: 'Modern Luxury Buses' },
      { id: 'stat-3', valueBn: '১,২০০+', valueEn: '1,200+', labelBn: 'দৈনিক নিয়মিত ট্রিপ', labelEn: 'Daily Scheduled Trips' },
      { id: 'stat-4', valueBn: '৫০ লক্ষ+', valueEn: '5M+', labelBn: 'সন্তুষ্ট যাত্রী', labelEn: 'Satisfied Passengers' },
    ],
    pillars: [
      {
        id: 'pillar-1',
        iconName: 'ShieldCheck',
        titleBn: 'সর্বোচ্চ নিরাপত্তা ও জিপিএস ট্র্যাকিং',
        titleEn: 'Ultimate Safety & GPS Tracking',
        descBn: 'আমাদের প্রতিটি বাসে সার্বক্ষণিক স্যাটেলাইট জিপিএস মনিটরিং ও স্পিড গভর্নর সংযুক্ত রয়েছে। চালকদের স্বাস্থ্য ও বায়োমেট্রিক নজরদারি নিশ্চিত করা হয়।',
        descEn: 'Every coach is monitored 24/7 via satellite GPS and speed limiters. Rigorous driver health and biometric background checks.',
      },
      {
        id: 'pillar-2',
        iconName: 'Clock',
        titleBn: 'নির্ধারিত সময়ে যাত্রা (Punctual Departures)',
        titleEn: 'Guaranteed On-Time Departures',
        descBn: '৯৯.৪% অন-টাইম ডিপারচার রেকর্ড নিয়ে আমরা সর্বদা যাত্রীর মূল্যবান সময়কে সর্বোচ্চ অগ্রাধিকার দিই।',
        descEn: 'With a 99.4% on-time record, we value your time and ensure departure on the exact scheduled minute.',
      },
      {
        id: 'pillar-3',
        iconName: 'Bus',
        titleBn: 'ইউরোপিয়ান স্ট্যান্ডার্ড বিলাসবহুল কোচ',
        titleEn: 'European Standard Luxury Fleet',
        descBn: 'স্ক্যানিয়া, ভলভো, হুন্ডাই ও হিনো আরএম২ এয়ার সাসপেনশন বাস। বিজনেস ক্লাস ২x১ রিক্লাইনিং ও আরামদায়ক এসি স্লিপার বার্থ।',
        descEn: 'Scania, Volvo, Hyundai, and Hino RM2 air suspension coaches. Business Class 2x1 recliners and cozy sleeper berths.',
      },
      {
        id: 'pillar-4',
        iconName: 'HeartHandshake',
        titleBn: '২৪/৭ গ্রাহক সহায়তা ও স্বচ্ছ রিফান্ড',
        titleEn: '24/7 Dedicated Support & Easy Refunds',
        descBn: 'যেকোনো প্রয়োজনে আমাদের নিবেদিত সাপোর্ট টিম দিন-রাত পাশে আছে। টিকিট বাতিলের দ্রুত ও সম্পূর্ণ স্বচ্ছ অনলাইন রিফান্ড পলিসি।',
        descEn: 'Our round-the-clock helpline is always ready to assist. Instant ticket cancellation and transparent online refund process.',
      },
    ],
    fleet: [
      {
        id: 'fleet-1',
        nameBn: 'বিজনেস ক্লাস এসি (Business Class 2x1)',
        nameEn: 'Business Class 2x1 AC',
        featuresBn: 'প্রশস্ত লেগস্পেস, এরগনোমিক লেদার সিট, পার্সোনাল ইউএসবি চার্জিং পোর্ট ও ওয়াইফাই।',
        featuresEn: 'Extra-wide legroom, ergonomic leather recliners, personal USB chargers & high-speed Wi-Fi.',
        image: '/images/buses/luxury-fleet.jpg',
      },
      {
        id: 'fleet-2',
        nameBn: 'লক্সারি স্লিপার কোচ (Luxury Sleeper Coach)',
        nameEn: 'Luxury AC Sleeper Coach',
        featuresBn: 'সম্পূর্ণ ফ্ল্যাট স্লিপার বার্থ, প্রাইভেসি কার্টেইন, নরম কম্বল ও দীর্ঘ রাতের আরামদায়ক ঘুম।',
        featuresEn: 'Full-flat sleeping berths, privacy curtains, fresh linens, and tranquil overnight journeys.',
        image: '/images/hero/hero-bus.jpg',
      },
      {
        id: 'fleet-3',
        nameBn: 'এক্সিকিউটিভ এক্সপ্রেস (Executive AC 2x2)',
        nameEn: 'Executive AC 2x2 Coach',
        featuresBn: 'স্মুথ এয়ার সাসপেনশন, চিল্ড এসি, বিনোদন স্ক্রিন ও সরাসরি বিরতিহীন হাইওয়ে সার্ভিস।',
        featuresEn: 'Smooth air suspension, chilled climate control, entertainment displays, and nonstop highway speed.',
        image: '/images/destinations/dhaka-highway.jpg',
      },
    ],
  },

  // DEFAULT TOUR PACKAGES
  packages: [
    {
      id: 'coxs-bazar-marine',
      category: 'BEACH',
      titleBn: 'কক্সবাজার সমুদ্র সৈকত ও মেরিন ড্রাইভ ট্যুর',
      titleEn: "Cox's Bazar Beach & Marine Drive Tour",
      durationBn: '৩ রাত / ৪ দিন',
      durationEn: '3 Nights / 4 Days',
      price: 7500,
      image: '/images/destinations/coxs-bazar.jpg',
      coachTypeBn: 'লাক্সারি এসি স্লিপার কোচ',
      coachTypeEn: 'Luxury AC Sleeper Coach',
      hotelBn: '৪-স্টার বিচসাইড হোটেল ও রিসোর্ট',
      hotelEn: '4-Star Beachside Hotel & Resort',
      inclusionsBn: [
        'ঢাকা-কক্সবাজার-ঢাকা রাউন্ডট্রিপ এসি স্লিপার বাস',
        '৪-স্টার হোটেলে ২ রাত এসি ডিলাক্স রুম',
        'প্রতিদিনের বুফে ব্রেকফাস্ট',
        'ইনানী বিচ ও হিমছড়ি খোলা জিপে সাইটসিয়িং',
        '২৪/৭ নিবেদিত ট্যুর গাইড সহায়তা',
      ],
      inclusionsEn: [
        'Round-trip AC Sleeper Coach (Dhaka-Cox-Dhaka)',
        '2 Nights 4-Star Deluxe Beach Hotel Stay',
        'Daily Complimentary Buffet Breakfast',
        'Inani Beach & Himchari Open 4x4 Jeep Ride',
        '24/7 Dedicated Tour Manager Assistance',
      ],
      departuresBn: 'প্রতি বৃহস্পতি ও রবিবার রাত ১০:০০ টায়',
      departuresEn: 'Every Thursday & Sunday at 10:00 PM',
      isPopular: true,
    },
    {
      id: 'sajek-valley-clouds',
      category: 'HILLS',
      titleBn: 'সাজেক ভ্যালি মেঘের দেশে অ্যাডভেঞ্চার',
      titleEn: 'Sajek Valley Cloud Kingdom Adventure',
      durationBn: '২ রাত / ৩ দিন',
      durationEn: '2 Nights / 3 Days',
      price: 6200,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
      coachTypeBn: 'বিজনেস ক্লাস ২x১ এসি কোচ',
      coachTypeEn: 'Business Class 2x1 AC Coach',
      hotelBn: 'কংলাক হিলভিউ কাঠের ইকো কটেজ',
      hotelEn: 'Konglak Hillview Wooden Eco Cottage',
      inclusionsBn: [
        'ঢাকা-খাগড়াছড়ি-ঢাকা বিজনেস ক্লাস বাস',
        'খাগড়াছড়ি থেকে সাজেক ফোর-হুইল চান্দের গাড়ি',
        'সাজেক ভ্যালিতে রিসোর্টে রাত যাপন',
        'কংলাক পাড়া, রুইলুই পাড়া ও হ্যালিপ্যাড সূর্যাস্ত',
        'আলুটিলা রহস্যময় গুহা ও রিছাং ঝরনা পরিদর্শণ',
      ],
      inclusionsEn: [
        'Round-trip Business Class AC Coach (Dhaka-Khagrachhari)',
        '4x4 Reserve Chander Gari Mountain Transfer',
        'Overnight Stay at Premium Sajek Valley Resort',
        'Konglak Para, Ruilui Para & Helipad Sunset Sightseeing',
        'Alutila Mysterious Cave & Risang Waterfall Trek',
      ],
      departuresBn: 'প্রতি বুধবার ও শুক্রবার রাত ১১:০০ টায়',
      departuresEn: 'Every Wednesday & Friday at 11:00 PM',
      isPopular: true,
    },
    {
      id: 'sreemangal-tea-retreat',
      category: 'FOREST',
      titleBn: 'শ্রীমঙ্গল চা বাগান ও লাউয়াছড়া ইকো ট্যুর',
      titleEn: 'Sreemangal Tea Gardens & Forest Retreat',
      durationBn: '২ রাত / ৩ দিন',
      durationEn: '2 Nights / 3 Days',
      price: 5500,
      image: '/images/destinations/sylhet.jpg',
      coachTypeBn: 'এক্সিকিউটিভ এসি এক্সপ্রেস',
      coachTypeEn: 'Executive AC Express Coach',
      hotelBn: 'চা বাগান ঘেরা প্রিমিয়াম ইকো রিসোর্ট',
      hotelEn: 'Tea Estate Surrounded Eco Resort',
      inclusionsBn: [
        'ঢাকা-শ্রীমঙ্গল-ঢাকা শীতাতপ নিয়ন্ত্রিত এক্সপ্রেস বাস',
        'টি এস্টেট রিসোর্টে বিলাসবহুল সুইট রুম',
        'লাউয়াছড়া রেইনফরেস্ট ট্র্যাকিং ও উলুক দর্শন',
        'মাধবপুর লেক ও পদ্মফুলের জলাশয় ভ্রমণ',
        'নীলকণ্ঠ কেবিনের ঐতিহাসিক ৭ লেয়ার চা টেস্ট',
      ],
      inclusionsEn: [
        'Round-trip AC Express Bus (Dhaka-Sreemangal)',
        'Luxury Boutique Eco Resort Accommodation',
        'Lawachara National Rainforest Jungle Trek',
        'Madhobpur Lotus Lake & Water Lily Basin Tour',
        'Original Nilkantha 7-Layer Colored Tea Tasting',
      ],
      departuresBn: 'প্রতি বৃহস্পতি ও শনিবার সকাল ০৮:০০ টায়',
      departuresEn: 'Every Thursday & Saturday at 08:00 AM',
      isPopular: false,
    },
    {
      id: 'sundarbans-safari',
      category: 'FOREST',
      titleBn: 'সুন্দরবন ম্যানগ্রোভ ওয়াইল্ডলাইফ সাফারি',
      titleEn: 'Sundarbans Mangrove Wildlife Safari',
      durationBn: '৩ রাত / ৪ দিন',
      durationEn: '3 Nights / 4 Days',
      price: 11500,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      coachTypeBn: 'ঢাকা-খুলনা বিজনেস ক্লাস এসি বাস',
      coachTypeEn: 'Dhaka-Khulna Business Class AC Coach',
      hotelBn: 'লাক্সারি ক্রুজ ভেসেল (সার্বক্ষণিক এসি কেবিন)',
      hotelEn: 'Luxury Cruise Vessel (Air Conditioned Cabin)',
      inclusionsBn: [
        'ঢাকা-খুলনা-ঢাকা বিজনেস ক্লাস বাস টিকেট',
        'সম্পূর্ণ ৩ দিন ৪ রাত লাক্সারি জাহাজে থাকা ও ৩ বেলা বুফে খাবার',
        'কটকা অভয়ারণ্য, জামতলা বিচ ও টাইগার পয়েন্ট সাফারি',
        'বন বিভাগের প্রবেশ ফি ও সশস্ত্র বনরক্ষী নিরাপত্তা',
        'ছোট কাঠের ট্রলারে খাল ক্রুজিং ও ডলফিন ওয়াচিং',
      ],
      inclusionsEn: [
        'Round-trip Business Class Bus (Dhaka-Khulna-Dhaka)',
        'Full 3 Days On-board Luxury Cruise with All Gourmet Meals',
        'Kotka Wildlife Sanctuary, Jamtola Beach & Tiger Point Trek',
        'Forest Dept Entry Permits & Armed Security Guards',
        'Small Wooden Boat Silent Canal Safari & Dolphin Watching',
      ],
      departuresBn: 'প্রতি শুক্রবার সকাল ০৭:০০ টায়',
      departuresEn: 'Every Friday at 07:00 AM',
      isPopular: true,
    },
    {
      id: 'kuakata-sunrise-sunset',
      category: 'BEACH',
      titleBn: 'কুয়াকাটা সূর্যোদয় ও সূর্যাস্ত প্যাকেজ',
      titleEn: 'Kuakata Sunrise & Sunset Expedition',
      durationBn: '২ রাত / ৩ দিন',
      durationEn: '2 Nights / 3 Days',
      price: 5800,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      coachTypeBn: 'পদ্মা সেতু ভায়া কুয়াকাটা সরাসরি এসি বাস',
      coachTypeEn: 'Direct AC Coach via Padma Bridge',
      hotelBn: 'সৈকত সংলগ্ন ৩-স্টার ডিলাক্স হোটেল',
      hotelEn: 'Beachfront 3-Star Deluxe Hotel',
      inclusionsBn: [
        'ঢাকা-কুয়াকাটা-ঢাকা ননস্টপ এসি বাস টিকিট (পদ্মা সেতু রুট)',
        '২ রাত বিচে অবস্থিত হোটেলের ডিলাক্স এসি রুমে থাকা',
        'গঙ্গামতি সংরক্ষিত বন ও লাল কাঁকড়া বিচ পরিদর্শন',
        'মিশ্রিপাড়া বৌদ্ধ মন্দির ও রাখাইন পল্লী পরিদর্শন',
        'একই স্থান থেকে সূর্যোদয় ও সূর্যাস্ত উপভোগের সুব্যবস্থা',
      ],
      inclusionsEn: [
        'Round-trip Nonstop AC Bus via Padma Bridge Expressway',
        '2 Nights Deluxe Beach Hotel Accommodation',
        'Gangamati Forest & Red Crab Island Excursion',
        'Mishripara Buddhist Temple & Rakhine Village Cultural Tour',
        'Uninterrupted Panoramic Views of Both Sunrise & Sunset',
      ],
      departuresBn: 'প্রতি বৃহস্পতি ও রবিবার রাত ০৯:৩০ টায়',
      departuresEn: 'Every Thursday & Sunday at 09:30 PM',
      isPopular: false,
    },
    {
      id: 'sylhet-sadapathor-ratargul',
      category: 'HILLS',
      titleBn: 'সিলেট রাতারগুল ও সাদাপাথর নেচার প্যাকেজ',
      titleEn: 'Sylhet Ratargul, Jaflong & Sada Pathor',
      durationBn: '২ রাত / ৩ দিন',
      durationEn: '2 Nights / 3 Days',
      price: 5900,
      image: '/images/destinations/sylhet.jpg',
      coachTypeBn: 'লাক্সারি এসি কোচ সার্ভিস',
      coachTypeEn: 'Luxury AC Coach Service',
      hotelBn: 'সিলেট শহরের কেন্দ্রস্থলে ৩-স্টার হোটেল',
      hotelEn: '3-Star Hotel in Downtown Sylhet',
      inclusionsBn: [
        'ঢাকা-সিলেট-ঢাকা শীতাতপ নিয়ন্ত্রিত এক্সপ্রেস বাস',
        '২ রাত এসি প্রিমিয়ার রুম ও কমপ্লিমেন্টারি ব্রেকফাস্ট',
        'রাতারগুল সোয়াম্প ফরেস্টে কাঠের নৌকায় ভ্রমণ',
        'ভোলাগঞ্জ সাদাপাথর ও স্বচ্ছ নীল নদীর জলরাশি পরিদর্শন',
        'ঐতিহাসিক শাহজালাল (রহ:) মাজার জিয়ারত ও মণিপুরী পাড়া',
      ],
      inclusionsEn: [
        'Round-trip AC Express Bus (Dhaka-Sylhet-Dhaka)',
        '2 Nights Hotel Stay with Complimentary Breakfast',
        'Ratargul Swamp Forest Wooden Boat Tour',
        'Bholaganj Sada Pathor White Stones & Crystal Water',
        'Hazrat Shahjalal (R) Mazar & Manipuri Heritage Village',
      ],
      departuresBn: 'প্রতি বৃহস্পতিবার রাত ১১:০০ টায়',
      departuresEn: 'Every Thursday at 11:00 PM',
      isPopular: false,
    },
  ],

  // DEFAULT OFFERS
  offers: [
    {
      id: 'offer-welcome',
      code: 'WELCOME100',
      badgeBn: 'নতুন যাত্রীদের জন্য',
      badgeEn: 'First-time Travelers',
      discountBn: 'ফ্ল্যাট ১০০ টাকা ছাড়',
      discountEn: 'Flat ৳100 Discount',
      descBn: 'ভ্যাবাচ্যাকা এক্সপ্রেসের ওয়েবসাইটে প্রথমবার টিকিট বুকিং করলেই উপভোগ করুন ফ্ল্যাট ১০০ টাকা নগদ ছাড়।',
      descEn: 'Enjoy a flat ৳100 instant discount on your first-ever online bus booking across any route in Bangladesh.',
      minSpendBn: 'যেকোনো রুটের জন্য প্রযোজ্য',
      minSpendEn: 'Valid on all routes',
      validityBn: 'মেয়াদ: ৩১ ডিসেম্বর ২০২৬ পর্যন্ত',
      validityEn: 'Valid until 31 Dec 2026',
      color: 'from-orange-500 to-amber-500',
      isActive: true,
    },
    {
      id: 'offer-bkash',
      code: 'BKASH20',
      badgeBn: 'বিকাশ ক্যাশব্যাক অফার',
      badgeEn: 'bKash Cashback Special',
      discountBn: '২০% ক্যাশব্যাক (সর্বোচ্চ ১৫০ টাকা)',
      discountEn: '20% Cashback (Up to ৳150)',
      descBn: 'টিকিট চেকআউটে বিকাশ গেটওয়ে দিয়ে পেমেন্ট সম্পন্ন করলে পেয়ে যান ২০% পর্যন্ত সরাসরি ক্যাশব্যাক।',
      descEn: 'Pay effortlessly using your bKash digital wallet and receive 20% instant cashback up to ৳150.',
      minSpendBn: 'ন্যূনতম টিকিট মূল্য ৫০০ টাকা',
      minSpendEn: 'Min. booking ৳500',
      validityBn: 'মেয়াদ: প্রতিদিনের প্রথম ১০০ বুকিংয়ে',
      validityEn: 'Valid for first 100 daily bookings',
      color: 'from-pink-600 to-rose-500',
      isActive: true,
    },
    {
      id: 'offer-nagad',
      code: 'NAGAD15',
      badgeBn: 'নগদ স্পেশাল সেভিংস',
      badgeEn: 'Nagad Instant Savings',
      discountBn: '১৫% ইনস্ট্যান্ট ডিসকাউন্ট',
      discountEn: '15% Instant Discount',
      descBn: 'নগদ অনলাইন পেমেন্টে যেকোনো এসি ও স্লিপার কোচে ১৫% পর্যন্ত সরাসরি ছাড় উপভোগ করুন।',
      descEn: 'Get 15% instant savings when checking out with Nagad e-payment gateway on AC & Sleeper buses.',
      minSpendBn: 'সরাসরি চেকআউটে সমন্বয়কৃত',
      minSpendEn: 'Auto-applied at checkout',
      validityBn: 'মেয়াদ: চলতি মাসজুড়ে সক্রিয়',
      validityEn: 'Valid throughout the month',
      color: 'from-amber-600 to-orange-600',
      isActive: true,
    },
    {
      id: 'offer-roundtrip',
      code: 'ROUNDTRIP10',
      badgeBn: 'যাওয়া-আসা রিটার্ন বোনাস',
      badgeEn: 'Roundtrip Journey Bonus',
      discountBn: '১০% অতিরিক্ত ছাড়',
      discountEn: 'Extra 10% Off Roundtrip',
      descBn: 'একসাথে ফিরতি (Return) টিকিট বুকিং করলেই ফিরতি টিকিটের মূল্যে পেয়ে যান অতিরিক্ত ১০% ছাড়।',
      descEn: 'Book your onward and return journeys together to receive an extra 10% discount on the return fare.',
      minSpendBn: 'রিটার্ন জার্নি অন্তর্ভুক্ত থাকতে হবে',
      minSpendEn: 'Must include return ticket',
      validityBn: 'মেয়াদ: সারা বছর প্রযোজ্য',
      validityEn: 'Valid year-round',
      color: 'from-blue-600 to-indigo-600',
      isActive: true,
    },
    {
      id: 'offer-student',
      code: 'STUDENT50',
      badgeBn: 'শিক্ষার্থী কনসেশন',
      badgeEn: 'Student Concession',
      discountBn: '৫০ টাকা কনসেশন ডিসকাউন্ট',
      discountEn: '৳50 Student Concession',
      descBn: 'বৈধ স্টুডেন্ট আইডি কার্ডধারী শিক্ষার্থীরা প্রতিটি টিকিটে ৫০ টাকা বিশেষ ছাড় পাবেন।',
      descEn: 'Students with valid educational institution ID get an instant ৳50 deduction per ticket.',
      minSpendBn: 'বাসে ওঠার সময় আইডি কার্ড প্রদর্শনীয়',
      minSpendEn: 'Valid Student ID required at boarding',
      validityBn: 'মেয়াদ: নিয়মিত প্রযোজ্য',
      validityEn: 'Active year-round',
      color: 'from-emerald-600 to-teal-600',
      isActive: true,
    },
    {
      id: 'offer-family',
      code: 'FAMILY4',
      badgeBn: 'ফ্যামিলি ও গ্রুপ সেভার',
      badgeEn: 'Family & Group Saver',
      discountBn: '৩০০ টাকা ফ্ল্যাট ডিসকাউন্ট',
      discountEn: 'Flat ৳300 Off on 4 Seats',
      descBn: 'পরিবার বা বন্ধুদের সাথে একসাথে ৪টি সিট কাটলেই সরাসরি ৩০০ টাকা সেভিংস।',
      descEn: 'Traveling with family or close friends? Book 4 seats in a single trip and save ৳300 instantly.',
      minSpendBn: 'এক ট্রিপে ন্যূনতম ৪টি সিট বুকিং',
      minSpendEn: 'Min. 4 seats in a single trip',
      validityBn: 'মেয়াদ: ৩১ ডিসেম্বর ২০২৬',
      validityEn: 'Valid until 31 Dec 2026',
      color: 'from-purple-600 to-violet-600',
      isActive: true,
    },
  ],

  // DEFAULT CONTACT & FAQS
  contact: {
    hotline1: '16420',
    hotline2: '01711-000000',
    emergencyPhone: '01999-888777',
    email: 'support@bhabachyaka.com',
    whatsapp: '+8801711000000',
    headOfficeTitleBn: 'প্রধান কেন্দ্রীয় টার্মিনাল ও প্রধান কার্যালয়',
    headOfficeTitleEn: 'Central Hub & Head Office',
    headOfficeAddressBn: 'সায়েদাবাদ আন্তঃজেলা বাস টার্মিনাল কমপ্লেক্স, ঢাকা-১২০৪, বাংলাদেশ',
    headOfficeAddressEn: 'Sayedabad Intercity Bus Terminal Complex, Dhaka-1204, Bangladesh',
    regionalOfficeTitleBn: 'চট্টগ্রাম আঞ্চলিক প্রধান কার্যালয়',
    regionalOfficeTitleEn: 'Chattogram Regional Headquarters',
    regionalOfficeAddressBn: 'দামপাড়া কাউন্টার, ওয়াসা মোড়, চট্টগ্রাম',
    regionalOfficeAddressEn: 'Dampara Counter, WASA Mor, Chattogram',
    officeHoursBn: '২৪ ঘণ্টা সার্বক্ষণিক সেবা (সপ্তাহের ৭ দিনই খোলা)',
    officeHoursEn: '24/7 Round the Clock Service (Open 7 Days a Week)',
    faqs: [
      {
        id: 'faq-1',
        qBn: 'অনলাইনে কেনা টিকিট কিভাবে বাতিল করব ও রিফান্ড পাব?',
        qEn: 'How can I cancel my ticket and claim a refund?',
        aBn: 'আমাদের ওয়েবসাইটের "আমার টিকিট" (Manage Booking) পেজে গিয়ে আপনার PNR এবং মোবাইল নম্বর দিয়ে লগইন করুন। বাসের ছাড়ার নির্ধারিত সময়ের ন্যূনতম ৪ ঘণ্টা আগে "Cancel Ticket" বাটনে ক্লিক করলেই স্বয়ংক্রিয়ভাবে আপনার রিফান্ড আবেদন গৃহীত হবে।',
        aEn: 'Navigate to "Manage Booking" on our website with your PNR and mobile number. Click "Cancel Ticket" at least 4 hours before scheduled departure to initiate an automatic digital refund.',
      },
      {
        id: 'faq-2',
        qBn: 'সিট নির্বাচন করার পর কতক্ষণ সিট হোল্ড থাকে?',
        qEn: 'How long does a held seat remain reserved?',
        aBn: 'অনলাইনে পছন্দের সিট সিলেক্ট করে পরবর্তী ধাপে গেলে সিটটি সর্বোচ্চ ১০ মিনিটের জন্য অন্য সবার জন্য ব্লক থাকে, যাতে আপনি নির্বিঘ্নে বিকাশ বা নগদে পেমেন্ট সম্পন্ন করতে পারেন।',
        aEn: 'Once selected, seats are held exclusively for 10 minutes to allow you ample time to enter passenger names and finish payment via bKash or Nagad.',
      },
      {
        id: 'faq-3',
        qBn: 'যাত্রার সময় বাসের লাইভ লোকেশন কিভাবে ট্র্যাক করব?',
        qEn: 'How can I track the live location of my bus?',
        aBn: 'যাত্রার নির্ধারিত সময়ের ৩০ মিনিট আগে আপনার মোবাইলে পাঠানো এসএমএস-এ লাইভ ট্র্যাকিং লিংক থাকবে। এছাড়া "Manage Booking" পেজে পিএনআর ইনপুট দিয়েও লাইভ বাস লোকেশন দেখা যাবে।',
        aEn: 'A live tracking link is sent via SMS 30 minutes prior to scheduled departure. You can also view real-time location via Manage Booking using your PNR.',
      },
      {
        id: 'faq-4',
        qBn: 'প্রতি যাত্রীর জন্য সর্বোচ্চ কত কেজি লাগেজ বহন অনুমোদিত?',
        qEn: 'What is the standard baggage allowance per passenger?',
        aBn: 'প্রতিজন যাত্রী অনায়াসে সর্বোচ্চ ২০ কেজি পর্যন্ত লাগেজ বাসের লাগেজ বক্সে বিনামূল্যে বহন করতে পারবেন। অতিরিক্ত ভারী মালামালের ক্ষেত্রে কাউন্টারে সাধারণ পার্সেল চার্জ প্রযোজ্য হতে পারে।',
        aEn: 'Each passenger is entitled to up to 20 kg of luggage free of charge in the coach cargo hold. Excess bulky cargo may incur standard parcel tariffs at terminal counters.',
      },
    ],
  },
};
