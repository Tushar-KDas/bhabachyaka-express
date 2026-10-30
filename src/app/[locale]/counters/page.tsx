import React from 'react';
import { Locale } from '@/lib/i18n';
import { getSiteConfig } from '@/lib/siteConfigServer';
import CountersClient from '@/components/CountersClient';

interface Props {
  params: { locale: string };
}

export default function CountersPage({ params }: Props) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;
  const siteConfig = getSiteConfig();
  const counters = siteConfig.counters || [];

  return <CountersClient customCounters={counters} locale={locale} />;
}
