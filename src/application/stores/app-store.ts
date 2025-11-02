import { create } from 'zustand';
import { BookDto } from '../dto/book-dto';

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

export interface AppState {
  books: BookDto[];
  filenameTemplate: string;
  columnWidths: Record<string, number>;
}

interface AppStore extends AppState {
  setBooks: (books: BookDto[]) => void;
  setFilenameTemplate: (template: string) => void;
  setColumnWidths: (widths: Record<string, number>) => void;
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
  columnWidths: DEFAULT_COLUMN_WIDTHS,
};

export const useAppStore = create<AppStore>((set) => ({
  ...defaultState,
  setBooks: (books: BookDto[]) => set({ books }),
  setFilenameTemplate: (filenameTemplate: string) => set({ filenameTemplate }),
  setColumnWidths: (columnWidths: Record<string, number>) => set({ columnWidths }),
  reset: () => set(defaultState),
}));

