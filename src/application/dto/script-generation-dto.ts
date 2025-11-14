import { BookDto } from './book-dto';
import { CookiesBrowser } from '@/application/stores';

export interface ScriptGenerationDto {
  books: BookDto[];
  filenameTemplate: string;
  cookiesBrowser: CookiesBrowser;
}

export interface ScriptGenerationResult {
  scriptContent: string;
}

