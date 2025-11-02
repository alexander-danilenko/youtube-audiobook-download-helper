export interface BookDto {
  id: string;
  url: string;
  title: string;
  author: string;
  narrator: string;
  series?: string;
  seriesNumber: number;
  year?: number;
}
