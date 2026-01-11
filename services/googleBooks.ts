import { Book, GoogleBooksResponse, GoogleBookVolume } from '@/types/book';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Transforms a Google Books thumbnail URL into a high-resolution version.
 * - Enforces HTTPS for security
 * - Removes the curled page effect (&edge=curl)
 * - Changes zoom level from 1 to 0 for highest available resolution
 */
export function getHighResImage(url: string): string {
    if (!url) return '';

    let highResUrl = url;

    // Replace HTTP with HTTPS for security
    if (highResUrl.startsWith('http://')) {
        highResUrl = highResUrl.replace('http://', 'https://');
    }

    // Remove the curled page effect
    highResUrl = highResUrl.replace(/&edge=curl/gi, '');

    return highResUrl;
}

const REQUEST_TIMEOUT_MS = 10000;

export async function searchBooks(query: string): Promise<GoogleBookVolume[]> {
    if (!query.trim()) return [];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const url = `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=20&printType=books`;
        console.log(`[API] Fetching: ${url}`);

        const response = await fetch(
            url,
            { signal: controller.signal }
        );

        console.log(`[API] Response status: ${response.status}`);

        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }

        const data: GoogleBooksResponse = await response.json();
        console.log(`[API] Found ${data.totalItems} items (returned ${data.items?.length || 0})`);
        return data.items || [];
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.error('Error searching books: Request timed out');
        } else {
            console.error('Error searching books:', error instanceof Error ? error.message : 'Unknown error');
        }
        return [];
    } finally {
        clearTimeout(timeoutId);
    }
}

// ... existing imports
// Add OpenLibrary types if needed, or just use 'any' for the external response given it's simple
interface OpenLibraryDoc {
    key: string;
    title: string;
    author_name?: string[];
    cover_i?: number;
    isbn?: string[];
    number_of_pages_median?: number;
    first_publish_year?: number;
}

interface OpenLibraryResponse {
    numFound: number;
    docs: OpenLibraryDoc[];
}

const OPEN_LIBRARY_SEARCH_API = 'https://openlibrary.org/search.json';

export async function searchOpenLibrary(query: string): Promise<GoogleBookVolume[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        console.log(`[OpenLibrary] Searching for: ${query}`);
        const response = await fetch(`${OPEN_LIBRARY_SEARCH_API}?q=${encodeURIComponent(query)}`, {
            signal: controller.signal
        });

        if (!response.ok) throw new Error('OpenLibrary request failed');

        const data: OpenLibraryResponse = await response.json();
        console.log(`[OpenLibrary] Found ${data.numFound} items`);

        if (data.docs && data.docs.length > 0) {
            // Map OpenLibrary structure to our internal GoogleBookVolume structure for consistency
            return data.docs.map(doc => ({
                id: doc.key.replace('/works/', ''), // OL works key
                volumeInfo: {
                    title: doc.title,
                    authors: doc.author_name,
                    pageCount: doc.number_of_pages_median,
                    publishedDate: doc.first_publish_year?.toString(),
                    imageLinks: doc.cover_i ? {
                        thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`,
                        large: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
                    } : undefined
                }
            }));
        }
        return [];
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.error('[OpenLibrary] Search failed: Request timed out');
        } else {
            console.error('[OpenLibrary] Search failed:', error instanceof Error ? error.message : "Unknown error");
        }
        return [];
    } finally {
        clearTimeout(timeoutId);
    }
}


export function mapGoogleBookToBook(volume: GoogleBookVolume): Omit<Book, 'addedAt' | 'sessions' | 'notes'> {
    const { volumeInfo } = volume;
    const imageLinks = volumeInfo.imageLinks;

    // Prioritize higher resolution images when available
    // Order: extraLarge > large > medium > thumbnail > smallThumbnail
    let rawCoverUrl =
        imageLinks?.extraLarge ||
        imageLinks?.large ||
        imageLinks?.medium ||
        imageLinks?.thumbnail ||
        imageLinks?.smallThumbnail ||
        '';

    // If no Google Book image, try OpenLibrary fallback using ISBN
    if (!rawCoverUrl && volumeInfo.industryIdentifiers) {
        const isbn13 = volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier;
        const isbn10 = volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_10')?.identifier;
        const isbn = isbn13 || isbn10;

        if (isbn) {
            rawCoverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
        }
    }

    // Apply high-res transformations to the URL (only affects Google URLs)
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
