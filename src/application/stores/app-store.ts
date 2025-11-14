import { create } from 'zustand';
import { BookDto } from '@/application/dto';

export const DEFAULT_FILENAME_TEMPLATE = '$author - [$series - $series_num] - $title [$narrator].%(ext)s';

const DEFAULT_COLUMN_WIDTHS: Record<string, number> = {
  preview: 80,
  url: 200,
  title: 200,
  author: 150,
  narrator: 150,
  series: 150,
  seriesNumber: 80,
  year: 80,
  actions: 100,
};

export type CookiesBrowser = 'none' | 'brave' | 'chrome' | 'chromium' | 'edge' | 'firefox' | 'opera' | 'safari' | 'vivaldi' | 'whale';

export interface AppState {
  books: BookDto[];
  filenameTemplate: string;
  cookiesBrowser: CookiesBrowser;
  columnWidths: Record<string, number>;
  collapsedBookIds: Set<string>;
}

interface AppStore extends AppState {
  setBooks: (books: BookDto[]) => void;
  setFilenameTemplate: (template: string) => void;
  setCookiesBrowser: (browser: CookiesBrowser) => void;
  setColumnWidths: (widths: Record<string, number>) => void;
  setCollapsedBookIds: (collapsedBookIds: Set<string>) => void;
  toggleBookCollapsed: (bookId: string) => void;
  expandAllBooks: (bookIds: string[]) => void;
  collapseAllBooks: (bookIds: string[]) => void;
  cleanupCollapsedState: (existingBookIds: string[]) => void;
  reset: () => void;
}

const defaultState: AppState = {
  books: [
    {
      id: '1',
      url: '',
      title: '',
      author: '',
      narrator: '',
      series: '',
      seriesNumber: 1,
      year: undefined,
    },
  ],
  filenameTemplate: DEFAULT_FILENAME_TEMPLATE,
  cookiesBrowser: 'none',
  columnWidths: DEFAULT_COLUMN_WIDTHS,
  collapsedBookIds: new Set<string>(),
};

export const useAppStore = create<AppStore>((set) => ({
  ...defaultState,
  setBooks: (books: BookDto[]) => set({ books }),
  setFilenameTemplate: (filenameTemplate: string) => set({ filenameTemplate }),
  setCookiesBrowser: (cookiesBrowser: CookiesBrowser) => set({ cookiesBrowser }),
  setColumnWidths: (columnWidths: Record<string, number>) => set({ columnWidths }),
  setCollapsedBookIds: (collapsedBookIds: Set<string>) => set({ collapsedBookIds }),
  toggleBookCollapsed: (bookId: string) => set((state) => {
    const newCollapsed = new Set(state.collapsedBookIds);
    if (newCollapsed.has(bookId)) {
      newCollapsed.delete(bookId);
    } else {
      newCollapsed.add(bookId);
    }
    return { collapsedBookIds: newCollapsed };
  }),
  expandAllBooks: (bookIds: string[]) => set((state) => {
    const newCollapsed = new Set(state.collapsedBookIds);
    bookIds.forEach(id => newCollapsed.delete(id));
    return { collapsedBookIds: newCollapsed };
  }),
  collapseAllBooks: (bookIds: string[]) => set((state) => {
    const newCollapsed = new Set<string>(bookIds);
    return { collapsedBookIds: newCollapsed };
  }),
  cleanupCollapsedState: (existingBookIds: string[]) => set((state) => {
    const newCollapsed = new Set<string>();
    state.collapsedBookIds.forEach(id => {
      if (existingBookIds.includes(id)) {
        newCollapsed.add(id);
      }
    });
    return { collapsedBookIds: newCollapsed };
  }),
  reset: () => set(defaultState),
}));

