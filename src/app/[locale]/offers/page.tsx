import React from 'react';
import { Locale } from '@/lib/i18n';
import { getSiteConfig } from '@/lib/siteConfigServer';
import OffersClient from '@/components/OffersClient';

interface Props {
  params: { locale: string };
}

export default function OffersPage({ params }: Props) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;
  const siteConfig = getSiteConfig();
  const offers = siteConfig.offers || [];

  return <OffersClient initialOffers={offers} locale={locale} />;
}
