import { Book, BookStatus, Note, ReadingSession } from '@/types/book';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface BookStore {
    books: Book[];
    addBook: (book: Omit<Book, 'addedAt' | 'sessions' | 'notes'>) => void;
    updateBook: (id: string, updates: Partial<Pick<Book, 'title' | 'author' | 'totalPages' | 'coverUrl'>>) => void;
    updateProgress: (id: string, currentPage: number) => void;
    updateStatus: (id: string, status: BookStatus) => void;
    deleteBook: (id: string) => void;
    addSession: (bookId: string, session: Omit<ReadingSession, 'id'>) => void;
    addNote: (bookId: string, note: Omit<Note, 'id' | 'createdAt'>) => void;
    deleteNote: (bookId: string, noteId: string) => void;
    getBookById: (id: string) => Book | undefined;
    getCurrentlyReading: () => Book | undefined;
}

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const useBookStore = create<BookStore>()(
    persist(
        (set, get) => ({
            books: [],

            addBook: (book) => {
                set((state) => ({
                    books: [
                        ...state.books,
                        {
                            ...book,
                            addedAt: Date.now(),
                            sessions: [],
                            notes: [],
                        },
                    ],
                }));
            },

            updateBook: (id, updates) => {
                set((state) => ({
                    books: state.books.map((book) =>
                        book.id === id ? { ...book, ...updates } : book
                    ),
                }));
            },

            updateProgress: (id, currentPage) => {
                set((state) => ({
                    books: state.books.map((book) => {
                        if (book.id !== id) return book;

                        return {
                            ...book,
                            currentPage,
                            status: currentPage >= book.totalPages ? 'finished' : 'reading',
                        };
                    }),
                }));
            },

            updateStatus: (id, status) => {
                set((state) => ({
                    books: state.books.map((book) =>
                        book.id === id ? { ...book, status } : book
                    ),
                }));
            },

            deleteBook: (id) => {
                set((state) => ({
                    books: state.books.filter((book) => book.id !== id),
                }));
            },

            addSession: (bookId, session) => {
                set((state) => ({
                    books: state.books.map((book) =>
                        book.id === bookId
                            ? {
                                ...book,
                                sessions: [
                                    ...(book.sessions || []),
                                    { ...session, id: generateId() },
                                ],
                            }
                            : book
                    ),
                }));
            },

            addNote: (bookId, note) => {
                set((state) => ({
                    books: state.books.map((book) =>
                        book.id === bookId
                            ? {
                                ...book,
                                notes: [
                                    ...(book.notes || []),
                                    { ...note, id: generateId(), createdAt: Date.now() },
                                ],
                            }
                            : book
                    ),
                }));
            },

            deleteNote: (bookId, noteId) => {
                set((state) => ({
                    books: state.books.map((book) =>
                        book.id === bookId
                            ? {
                                ...book,
                                notes: (book.notes || []).filter((n) => n.id !== noteId),
                            }
                            : book
                    ),
                }));
            },

            getBookById: (id) => {
                return get().books.find((book) => book.id === id);
            },

            getCurrentlyReading: () => {
                return get().books.find((book) => book.status === 'reading');
            },
        }),
        {
            name: 'codex-book-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
