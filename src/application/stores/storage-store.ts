import { useEffect, useRef, useState } from 'react';
import { useAppStore, AppState } from './app-store';
import { IndexedDbStorageRepository } from '../../infrastructure/repositories/indexed-db-storage-repository';

const storageRepo = new IndexedDbStorageRepository();
const DEBOUNCE_MS = 500;

export function usePersistStore(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);
  const isInitialized = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const books = useAppStore((state) => state.books);
  const filenameTemplate = useAppStore((state) => state.filenameTemplate);
  const cookiesBrowser = useAppStore((state) => state.cookiesBrowser);
  const columnWidths = useAppStore((state) => state.columnWidths);

  // Initialize and load from IndexedDB on mount
  useEffect(() => {
    const loadState = async (): Promise<void> => {
      if (isInitialized.current) {
        return;
      }

      try {
        await storageRepo.initialize();
        const savedState = await storageRepo.load();

        if (savedState) {
          useAppStore.setState({
            books: savedState.books as AppState['books'],
            filenameTemplate: savedState.filenameTemplate,
            cookiesBrowser: savedState.cookiesBrowser || 'none',
            columnWidths: savedState.columnWidths,
          });
        }
      } catch (error) {
        console.error('Failed to load state from IndexedDB:', error);
      } finally {
        isInitialized.current = true;
        setIsHydrated(true);
      }
    };

    loadState();
  }, []);

  // Save to IndexedDB when state changes (debounced)
  useEffect(() => {
    if (!isInitialized.current) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await storageRepo.save({
          books,
          filenameTemplate,
          cookiesBrowser,
          columnWidths,
        });
      } catch (error) {
        console.error('Failed to save state to IndexedDB:', error);
      } finally {
        saveTimeoutRef.current = null;
      }
    }, DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [books, filenameTemplate, cookiesBrowser, columnWidths]);

  return isHydrated;
}

