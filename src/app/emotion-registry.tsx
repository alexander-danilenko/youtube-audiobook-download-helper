'use client';

import { useServerInsertedHTML } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import type { EmotionCache } from '@emotion/cache';

type RegistryProps = {
  children: ReactNode;
};

// This ensures that Emotion styles are inserted in the correct order
// and prevents hydration mismatches
export default function EmotionRegistry({ children }: RegistryProps) {
  const [cache] = useState<EmotionCache>(() => {
    const emotionCache = createCache({
      key: 'mui',
      prepend: true,
    });
    return emotionCache;
  });

  useServerInsertedHTML(() => {
    const names = Object.keys(cache.inserted);
    if (names.length === 0) {
      return null;
    }
    const styles = Object.values(cache.inserted).join(' ');
    return (
      <style
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}

