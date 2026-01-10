export type BookStatus = 'want-to-read' | 'reading' | 'finished';

export interface ReadingSession {
  id: string;
  startedAt: number;      // timestamp when session started
  duration: number;       // duration in seconds
  pagesRead: number;      // pages read during this session
}

export interface Note {
  id: string;
  content: string;
  page?: number;          // optional page reference
  createdAt: number;      // timestamp
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
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
}

export interface GoogleBooksResponse {
  items?: GoogleBookVolume[];
  totalItems: number;
}
