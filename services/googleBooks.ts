import { Book, GoogleBooksResponse, GoogleBookVolume } from '@/types/book';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

export async function searchBooks(query: string): Promise<GoogleBookVolume[]> {
    if (!query.trim()) return [];

    try {
        const response = await fetch(
            `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=20&printType=books`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }

        const data: GoogleBooksResponse = await response.json();
        return data.items || [];
    } catch (error) {
        console.error('Error searching books:', error);
        return [];
    }
}

export function mapGoogleBookToBook(volume: GoogleBookVolume): Omit<Book, 'addedAt'> {
    const { volumeInfo } = volume;

    // Get the best available cover URL and use HTTPS
    let coverUrl = volumeInfo.imageLinks?.thumbnail ||
        volumeInfo.imageLinks?.smallThumbnail ||
        '';

    // Replace HTTP with HTTPS for security
    if (coverUrl.startsWith('http://')) {
        coverUrl = coverUrl.replace('http://', 'https://');
    }

    return {
        id: volume.id,
        title: volumeInfo.title || 'Unknown Title',
        author: volumeInfo.authors?.join(', ') || 'Unknown Author',
        coverUrl,
        totalPages: volumeInfo.pageCount || 0,
        currentPage: 0,
        status: 'want-to-read',
    };
}
