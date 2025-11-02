import { BookDto } from './book-dto';
import { CookiesBrowser } from '../stores/app-store';

export interface ScriptGenerationDto {
  books: BookDto[];
  filenameTemplate: string;
  cookiesBrowser: CookiesBrowser;
}

export interface ScriptGenerationResult {
  scriptContent: string;
}

