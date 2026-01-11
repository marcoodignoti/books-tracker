export type BookStatus = 'want-to-read' | 'reading' | 'finished';

export interface ReadingSession {
  id: string;
  startedAt: number;
  duration: number;
  pagesRead: number;
}

export interface Note {
  id: string;
  content: string;
  page?: number;
  createdAt: number;
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
  notes: Note[];
}

export interface GoogleBookVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    pageCount?: number;
    description?: string;
    categories?: string[];
    publisher?: string;
    publishedDate?: string;
    averageRating?: number;
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
