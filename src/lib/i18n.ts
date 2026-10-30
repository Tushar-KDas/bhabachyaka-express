import bnMessages from '../../messages/bn.json';
import enMessages from '../../messages/en.json';

export type Locale = 'bn' | 'en';

export const dictionaries = {
  bn: bnMessages,
  en: enMessages,
};

export function getDictionary(locale: Locale = 'bn') {
  return dictionaries[locale] || dictionaries.bn;
}

export function toBengaliDigits(input: string | number): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(input).replace(/[0-9]/g, (w) => bengaliDigits[+w]);
}

export function formatBDT(amount: number, locale: Locale = 'bn'): string {
  const formatted = Math.round(amount).toLocaleString('en-US');
  if (locale === 'bn') {
    return `৳ ${toBengaliDigits(formatted)}`;
  }
  return `৳ ${formatted}`;
}

export function formatTime(dateStr: string | Date, locale: Locale = 'bn'): string {
  const d = new Date(dateStr);
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? (locale === 'bn' ? 'অপরাহ্ন' : 'PM') : (locale === 'bn' ? 'পূর্বাহ্ন' : 'AM');
  const displayHours = hours % 12 || 12;
  const timeString = `${displayHours}:${minutes} ${ampm}`;
  return locale === 'bn' ? toBengaliDigits(timeString) : timeString;
}

export function formatDate(dateStr: string | Date, locale: Locale = 'bn'): string {
  const d = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formatted = d.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', options);
  return formatted;
}
