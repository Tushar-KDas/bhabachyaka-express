import React from 'react';
import { Locale } from '@/lib/i18n';
import { getSiteConfig } from '@/lib/siteConfigServer';
import ContactClient from '@/components/ContactClient';

interface Props {
  params: { locale: string };
}

export default function ContactPage({ params }: Props) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;
  const siteConfig = getSiteConfig();
  const contact = siteConfig.contact;

  return <ContactClient contact={contact} locale={locale} />;
}
