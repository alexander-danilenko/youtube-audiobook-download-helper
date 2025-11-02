'use client';

import { useState, useCallback } from 'react';
import { container } from '../infrastructure/di/container';
import { FetchYouTubeMetadataUseCase } from '../application/use-cases/fetch-youtube-metadata-use-case';

export interface UseYouTubeMetadataResult {
  isLoading: boolean;
  error: string | null;
  fetchMetadata: (url: string) => Promise<{ title: string; authorName: string } | null>;
}

export function useYouTubeMetadata(): UseYouTubeMetadataResult {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = useCallback(async (url: string): Promise<{ title: string; authorName: string } | null> => {
    if (!url || url.trim().length === 0) {
      return null;
    }

    console.log('useYouTubeMetadata: Starting fetch for URL:', url);
    setIsLoading(true);
    setError(null);

    try {
      console.log('useYouTubeMetadata: Resolving FetchYouTubeMetadataUseCase...');
      const useCase = container.resolve(FetchYouTubeMetadataUseCase);
      console.log('useYouTubeMetadata: Use case resolved, executing...');
      const result = await useCase.execute(url);
      console.log('useYouTubeMetadata: Result received:', result);
      setIsLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch YouTube metadata';
      console.error('YouTube metadata fetch error:', errorMessage, err);
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, []);

  return {
    isLoading,
    error,
    fetchMetadata,
  };
}

