import { useMemo } from 'react';
import { YoutubeUrl } from '../domain/value-objects/youtube-url';

export function useThumbnail(url: string) {
  const thumbnailUrl = useMemo(() => {
    if (!url) {
      return null;
    }

    try {
      const youtubeUrl = YoutubeUrl.create(url);
      const videoId = youtubeUrl.extractVideoId();
      if (!videoId) {
        return null;
      }
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    } catch {
      return null;
    }
  }, [url]);

  const fullSizeThumbnailUrl = useMemo(() => {
    if (!url) {
      return null;
    }

    try {
      const youtubeUrl = YoutubeUrl.create(url);
      const videoId = youtubeUrl.extractVideoId();
      if (!videoId) {
        return null;
      }
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    } catch {
      return null;
    }
  }, [url]);

  return {
    thumbnailUrl,
    fullSizeThumbnailUrl,
  };
}

