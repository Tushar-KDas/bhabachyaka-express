import React from 'react';
import { Locale } from '@/lib/i18n';
import { getSiteConfig } from '@/lib/siteConfigServer';
import PackagesClient from '@/components/PackagesClient';

interface Props {
  params: { locale: string };
}

export default function PackagesPage({ params }: Props) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;
  const siteConfig = getSiteConfig();
  const packages = siteConfig.packages || [];

  return <PackagesClient initialPackages={packages} locale={locale} />;
}
