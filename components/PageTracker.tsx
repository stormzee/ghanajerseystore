'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * PageTracker fires a lightweight POST to /api/track whenever the visitor
 * navigates to a new page.  It is mounted once in the root layout so all
 * pages are covered automatically.
 */
export default function PageTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    // Build the full path including search params if available
    const path =
      typeof window !== 'undefined'
        ? window.location.pathname + window.location.search
        : pathname;

    // Use sendBeacon when available for non-blocking fire-and-forget tracking
    const payload = JSON.stringify({ path });
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }));
    } else {
      void fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      });
    }
  }, [pathname]);

  return null;
}
