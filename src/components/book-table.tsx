'use client';

import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { BookDto } from '@/application/dto';
import { EditableCell } from './editable-cell';
import { ThumbnailCell } from './thumbnail-cell';
import { CsvImportExport } from './csv-import-export';
import { YouTubeUrlCell } from './youtube-url-cell';
import { useBookTable } from '@/hooks/use-book-table';

interface BookTableProps {
  books: BookDto[];
  onBooksChange: (books: BookDto[]) => void;
  onThumbnailClick: (imageUrl: string) => void;
}

export function BookTable({ books, onBooksChange, onThumbnailClick }: BookTableProps) {
  const {
    cleanDialogOpen,
    handleAddRow,
    handleCleanClick,
    handleCleanConfirm,
    handleCleanCancel,
    handleBookChange,
    handleUrlChange,
    handleMetadataFetched,
    handleBookRemove,
  } = useBookTable({ books, onBooksChange });

  return (
    <Box sx={{ width: '100%', overflowX: 'auto', p: 2 }}>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Thumbnail</TableCell>
              <TableCell>YouTube URL</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Narrator</TableCell>
              <TableCell>Series</TableCell>
              <TableCell>Series #</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book.id}>
                <TableCell>
                  <ThumbnailCell videoUrl={book.url} onThumbnailClick={onThumbnailClick} />
                </TableCell>
                <TableCell>
                  <YouTubeUrlCell
                    value={book.url}
                    onChange={(value) => handleUrlChange(book.id, value)}
                    onMetadataFetched={(title, authorName) => handleMetadataFetched(book.id, title, authorName)}
                  />
                </TableCell>
                <TableCell>
                  <EditableCell value={book.title} onChange={(value) => handleBookChange({ ...book, title: value as string })} error={!book.title?.trim()} />
                </TableCell>
                <TableCell>
                  <EditableCell value={book.author} onChange={(value) => handleBookChange({ ...book, author: value as string })} error={!book.author?.trim()} />
                </TableCell>
                <TableCell>
                  <EditableCell value={book.narrator} onChange={(value) => handleBookChange({ ...book, narrator: value as string })} />
                </TableCell>
                <TableCell>
                  <EditableCell value={book.series} onChange={(value) => handleBookChange({ ...book, series: value as string })} />
                </TableCell>
                <TableCell>
                  <EditableCell value={book.seriesNumber} onChange={(value) => handleBookChange({ ...book, seriesNumber: value as number })} type="number" />
                </TableCell>
                <TableCell>
                  <EditableCell value={book.year} onChange={(value) => handleBookChange({ ...book, year: value as number })} type="number" />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleBookRemove(book.id)} color="error" aria-label="remove book">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1, width: '100%', maxWidth: 'none' }}>
        <CsvImportExport books={books} onBooksChange={onBooksChange} />
        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleCleanClick} disabled={books.length === 0}>
          Clean
        </Button>
        <Button variant="outlined" color="primary" startIcon={<AddIcon />} onClick={handleAddRow}>
          Add New Book
        </Button>
      </Box>

      <Dialog open={cleanDialogOpen} onClose={handleCleanCancel}>
        <DialogTitle>Clear Table</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to clear all books from the table? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCleanCancel}>Cancel</Button>
          <Button onClick={handleCleanConfirm} color="error" variant="contained">
            Clear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
