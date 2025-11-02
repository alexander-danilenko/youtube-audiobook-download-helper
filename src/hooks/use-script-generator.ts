import { useCallback } from 'react';
import { container } from '../infrastructure/di/container';
import { GenerateShellScriptUseCase } from '../application/use-cases/generate-shell-script-use-case';
import { BookDto } from '../application/dto/book-dto';

export function useScriptGenerator() {
  const generateScript = useCallback((books: BookDto[], filenameTemplate: string): string => {
    const useCase = container.resolve(GenerateShellScriptUseCase);
    const result = useCase.execute({ books, filenameTemplate });
    return result.scriptContent;
  }, []);

  const downloadScript = useCallback((books: BookDto[], filenameTemplate: string) => {
    const scriptContent = generateScript(books, filenameTemplate);
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

  return {
    generateScript,
    downloadScript,
  };
}

