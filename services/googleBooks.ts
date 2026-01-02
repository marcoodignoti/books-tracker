import { Book, GoogleBooksResponse, GoogleBookVolume } from '@/types/book';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Transforms a Google Books thumbnail URL into a high-resolution version.
 * - Enforces HTTPS for security
 * - Removes the curled page effect (&edge=curl)
 * - Changes zoom level from 1 to 0 for highest available resolution
 */
function getHighResImage(url: string): string {
    if (!url) return '';

    let highResUrl = url;

    // Replace HTTP with HTTPS for security
    if (highResUrl.startsWith('http://')) {
        highResUrl = highResUrl.replace('http://', 'https://');
    }

    // Remove the curled page effect
    highResUrl = highResUrl.replace(/&edge=curl/gi, '');

    // Change zoom=1 to zoom=0 for highest available resolution
    highResUrl = highResUrl.replace(/&zoom=1/gi, '&zoom=0');

    return highResUrl;
}

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

export function mapGoogleBookToBook(volume: GoogleBookVolume): Omit<Book, 'addedAt' | 'sessions'> {
    const { volumeInfo } = volume;
    const imageLinks = volumeInfo.imageLinks;

    // Prioritize higher resolution images when available
    // Order: extraLarge > large > medium > thumbnail > smallThumbnail
    const rawCoverUrl =
        imageLinks?.extraLarge ||
        imageLinks?.large ||
        imageLinks?.medium ||
        imageLinks?.thumbnail ||
        imageLinks?.smallThumbnail ||
        '';

    // Apply high-res transformations to the URL
    const coverUrl = getHighResImage(rawCoverUrl);

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
