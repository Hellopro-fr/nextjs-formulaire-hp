import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import { GoogleTagManager, GoogleTagManagerNoScript } from '@/components/analytics';
import { Hotjar } from '@/components/analytics';
import { QueryProvider, AnalyticsProvider, ThemeProvider } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Trouvez votre fournisseur - Demande de devis',
  description: 'Plateforme de mise en relation avec des fournisseurs de ponts élévateurs. Trouvez le fournisseur adapté à vos besoins.',
  openGraph: {
    title: 'Trouvez votre fournisseur - Demande de devis',
    description: 'Plateforme de mise en relation avec des fournisseurs de ponts élévateurs.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const hotjarId = process.env.NEXT_PUBLIC_HOTJAR_ID;
  const hotjarSv = process.env.NEXT_PUBLIC_HOTJAR_SV || '6';

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {gtmId && gtmId !== 'GTM-XXXXXXX' && <GoogleTagManager gtmId={gtmId} />}
      </head>
      <body className={inter.className}>
        {gtmId && gtmId !== 'GTM-XXXXXXX' && <GoogleTagManagerNoScript gtmId={gtmId} />}

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AnalyticsProvider>
              {children}
              <Toaster />
              <Sonner />
            </AnalyticsProvider>
          </QueryProvider>
        </ThemeProvider>

        {/* Google Analytics 4 */}
        {gaId && gaId !== 'G-XXXXXXXXXX' && <GoogleAnalytics gaId={gaId} />}

        {/* Hotjar */}
        {hotjarId && hotjarId !== '1234567' && (
          <Hotjar hjid={hotjarId} hjsv={hotjarSv} />
        )}
      </body>
    </html>
  );
}
