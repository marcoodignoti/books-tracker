export type BookStatus = 'want-to-read' | 'reading' | 'finished';

export interface ReadingSession {
  id: string;
  date: string; // ISO string
  durationSeconds: number;
  pagesRead: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  totalPages: number;
  currentPage: number;
  status: BookStatus;
  addedAt: number;
  sessions: ReadingSession[];
}

export interface GoogleBookVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    pageCount?: number;
    imageLinks?: {
      extraLarge?: string;
      large?: string;
      medium?: string;
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
}

export interface GoogleBooksResponse {
  items?: GoogleBookVolume[];
  totalItems: number;
}
