'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, type ReactNode } from 'react';
import { trackPageView } from '@/lib/analytics/ga4';
import { hotjarStateChange } from '@/lib/analytics/hotjar';

function AnalyticsTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    // Track page view in GA4
    trackPageView(url);

    // Notify Hotjar of SPA navigation
    hotjarStateChange(url);
  }, [pathname, searchParams]);

  return null;
}

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTrackerInner />
      </Suspense>
      {children}
    </>
  );
}
