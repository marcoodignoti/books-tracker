export type BookStatus = 'want-to-read' | 'reading' | 'finished';

export interface ReadingSession {
  id: string;
<<<<<<< HEAD
  startedAt: number;
  duration: number;
  pagesRead: number;
}

export interface Note {
  id: string;
  content: string;
  page?: number;
  createdAt: number;
=======
  date: string; // ISO string
  durationSeconds: number;
  startPage: number;
  endPage: number;
>>>>>>> 8bd8634b81be9b801a5c6b6165f81fd79095edac
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
<<<<<<< HEAD
  notes: Note[];
=======
>>>>>>> 8bd8634b81be9b801a5c6b6165f81fd79095edac
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
