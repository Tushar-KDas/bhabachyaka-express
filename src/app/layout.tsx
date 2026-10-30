import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ভ্যাবাচ্যাকা এক্সপ্রেস | Bhabachyaka Express - বাস টিকিট বুকিং ও ট্রান্সপোর্ট ইআরপি',
  description: 'বাংলাদেশের সর্বাধুনিক ক্লাউড-বেজড বাস টিকিট বুকিং, কাউন্টার POS এবং ট্রান্সপোর্ট ফ্লিট ম্যানেজমেন্ট প্ল্যাটফর্ম।',
  icons: {
    icon: '/brand/bhabachyaka-express-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body className="min-h-screen flex flex-col bg-[#F6F8FB] text-[#172033] antialiased">
        {children}
      </body>
    </html>
  );
}
