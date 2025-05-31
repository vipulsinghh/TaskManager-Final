import type {Metadata} from 'next';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from "@/components/ui/toaster";
import { Inter, Lato } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lato = Lato({ subsets: ['latin'], weight: ['400', '700', '900'], variable: '--font-lato' });

export const metadata: Metadata = {
  title: 'FinStack',
  description: 'Manage your tasks efficiently with FinStack',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lato.variable}`}>
      <head>
        {/* Google Fonts are now managed by next/font */}
      </head>
      <body className="font-inter antialiased">
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
