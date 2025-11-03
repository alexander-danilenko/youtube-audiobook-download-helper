import { z } from 'zod';

export const bookDtoSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  url: z
    .string()
    .min(1, 'URL is required')
    .refine(
      (url) => {
        const trimmed = url.trim();
        if (!trimmed) return false;
        const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
        return youtubePattern.test(trimmed);
      },
      { message: 'URL must be a valid YouTube URL' }
    ),
  title: z.string().min(1, 'Title is required').refine((val) => val.trim().length > 0, {
    message: 'Title cannot be empty',
  }),
  author: z.string().min(1, 'Author is required').refine((val) => val.trim().length > 0, {
    message: 'Author cannot be empty',
  }),
  narrator: z.string().optional(),
  series: z.string().optional(),
  seriesNumber: z.number().int().min(1, 'Series number must be at least 1'),
  year: z
    .number()
    .int()
    .min(1000, 'Year must be at least 1000')
    .max(9999, 'Year must be at most 9999')
    .optional(),
});

export type BookDto = z.infer<typeof bookDtoSchema>;

export const bookDtoArraySchema = z.array(bookDtoSchema);
