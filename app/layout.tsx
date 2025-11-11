import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Azalea11 - Web Proxy',
  description: 'A modern, friendly web proxy application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

