'use client';

import { Button, Box } from '@mui/material';
import { BookDto } from '../application/dto/book-dto';
import { useScriptGenerator } from '../hooks/use-script-generator';

interface GenerateScriptButtonProps {
  books: BookDto[];
  filenameTemplate: string;
}

export function GenerateScriptButton({ books, filenameTemplate }: GenerateScriptButtonProps) {
  const { downloadScript } = useScriptGenerator();

  const handleClick = (): void => {
    const validBooks = books.filter(
      (book) => book.url && book.title && book.author && book.narrator
    );

    if (validBooks.length === 0) {
      alert('Please add at least one book with URL, title, author, and narrator.');
      return;
    }

    downloadScript(validBooks, filenameTemplate);
  };

  return (
    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
      <Button
        onClick={handleClick}
        variant="contained"
        color="success"
        size="large"
      >
        Generate & Download Script
      </Button>
    </Box>
  );
}

