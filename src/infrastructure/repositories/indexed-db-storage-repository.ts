import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { CookiesBrowser } from '@/application/stores';

interface AppStateDb extends DBSchema {
  'app-state': {
    key: string;
    value: {
      books: unknown[];
      filenameTemplate: string;
      cookiesBrowser: CookiesBrowser;
      columnWidths: Record<string, number>;
      collapsedBookIds?: string[];
    };
  };
}

const DB_NAME = 'audiobook-generator-db';
const DB_VERSION = 1;
const STORE_NAME = 'app-state';
const STATE_KEY = 'main-state';

export class IndexedDbStorageRepository {
  private db: IDBPDatabase<AppStateDb> | null = null;

  public async initialize(): Promise<void> {
    if (this.db) {
      return;
    }

    try {
      this.db = await openDB<AppStateDb>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        },
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw error;
    }
  }

  public async save(state: {
    books: unknown[];
    filenameTemplate: string;
    cookiesBrowser: CookiesBrowser;
    columnWidths: Record<string, number>;
    collapsedBookIds?: string[];
  }): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    try {
      await this.db.put(STORE_NAME, state, STATE_KEY);
    } catch (error) {
      console.error('Failed to save state to IndexedDB:', error);
      throw error;
    }
  }

  public async load(): Promise<{
    books: unknown[];
    filenameTemplate: string;
    cookiesBrowser?: CookiesBrowser;
    columnWidths: Record<string, number>;
    collapsedBookIds?: string[];
  } | null> {
    if (!this.db) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    try {
      const state = await this.db.get(STORE_NAME, STATE_KEY);
      return state || null;
    } catch (error) {
      console.error('Failed to load state from IndexedDB:', error);
      return null;
    }
  }

  public async clear(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    try {
      await this.db.delete(STORE_NAME, STATE_KEY);
    } catch (error) {
      console.error('Failed to clear state from IndexedDB:', error);
      throw error;
    }
  }
}

