import './globals.css';

import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'East Falls Football Club',
  description:
    'Player portal for East Falls FC.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
