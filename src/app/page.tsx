'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Detect language from browser or localStorage
    let detectedLang = 'en';

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('app-language');
      if (stored === 'en' || stored === 'uk') {
        detectedLang = stored;
      } else {
        // Try to detect from browser
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'uk') {
          detectedLang = 'uk';
        }
      }
    }

    // Redirect to appropriate language URL
    router.replace(`/${detectedLang}`);
  }, [router]);

  // Show nothing while redirecting
  return null;
}

