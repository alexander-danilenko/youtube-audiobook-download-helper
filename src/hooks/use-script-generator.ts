import { useCallback } from 'react';
import { container } from '../infrastructure/di/container';
import { GenerateShellScriptUseCase } from '../application/use-cases/generate-shell-script-use-case';
import { BookDto } from '../application/dto/book-dto';

import { CookiesBrowser } from '../application/stores/app-store';

export function useScriptGenerator() {
  const generateScript = useCallback((books: BookDto[], filenameTemplate: string, cookiesBrowser: CookiesBrowser): string => {
    const useCase = container.resolve(GenerateShellScriptUseCase);
    const result = useCase.execute({ books, filenameTemplate, cookiesBrowser });
    return result.scriptContent;
  }, []);

  const downloadScript = useCallback((books: BookDto[], filenameTemplate: string, cookiesBrowser: CookiesBrowser) => {
    const scriptContent = generateScript(books, filenameTemplate, cookiesBrowser);
    const blob = new Blob([scriptContent], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'download-audiobooks.sh';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generateScript]);

  const copyDownloadString = useCallback(async (books: BookDto[], filenameTemplate: string, cookiesBrowser: CookiesBrowser): Promise<void> => {
    const useCase = container.resolve(GenerateShellScriptUseCase);
    const downloadString = useCase.executeDownloadString({ books, filenameTemplate, cookiesBrowser });
    
    try {
      await navigator.clipboard.writeText(downloadString);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = downloadString;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }, []);

  return {
    generateScript,
    downloadScript,
    copyDownloadString,
  };
}

