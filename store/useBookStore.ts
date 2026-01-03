import { Book, BookStatus, ReadingSession } from '@/types/book';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SessionData {
    durationSeconds: number;
    pagesRead: number;
}

interface BookStore {
    books: Book[];
    addBook: (book: Omit<Book, 'addedAt' | 'sessions'>) => void;
    updateProgress: (id: string, currentPage: number, sessionData?: SessionData) => void;
    updateStatus: (id: string, status: BookStatus) => void;
    deleteBook: (id: string) => void;
    getBookById: (id: string) => Book | undefined;
    getCurrentlyReading: () => Book | undefined;
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
                        },
                    ],
                }));
            },

            updateProgress: (id, currentPage, sessionData) => {
                set((state) => ({
                    books: state.books.map((book) => {
                        if (book.id !== id) return book;
                        
                        const updatedBook: Book = {
                            ...book,
                            currentPage,
                            status: currentPage >= book.totalPages ? 'finished' : 'reading',
                        };
                        
                        // Add session if session data is provided
                        if (sessionData) {
                            const newSession: ReadingSession = {
                                id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                                date: new Date().toISOString(),
                                durationSeconds: sessionData.durationSeconds,
                                pagesRead: sessionData.pagesRead,
                            };
                            updatedBook.sessions = [...(book.sessions || []), newSession];
                        }
                        
                        return updatedBook;
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
