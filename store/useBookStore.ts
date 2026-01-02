import { Book, BookStatus } from '@/types/book';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface BookStore {
    books: Book[];
    addBook: (book: Omit<Book, 'addedAt'>) => void;
    updateProgress: (id: string, currentPage: number) => void;
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
                        },
                    ],
                }));
            },

            updateProgress: (id, currentPage) => {
                set((state) => ({
                    books: state.books.map((book) =>
                        book.id === id
                            ? {
                                ...book,
                                currentPage,
                                status: currentPage >= book.totalPages ? 'finished' : 'reading',
                            }
                            : book
                    ),
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
