import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DemoRoleSwitcher from '@/components/DemoRoleSwitcher';
import { Locale } from '@/lib/i18n';

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = (params.locale === 'en' ? 'en' : 'bn') as Locale;

  return (
    <>
      <Navbar locale={locale} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
      <DemoRoleSwitcher locale={locale} />
    </>
  );
}
