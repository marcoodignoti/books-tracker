import { BookImmersiveLayout } from "@/components/BookImmersiveLayout";
import { getHighResImage, mapGoogleBookToBook } from "@/services/googleBooks";
import { useBookStore } from "@/store/useBookStore";
import { GoogleBookVolume } from "@/types/book";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BookOpen, Check, Plus, Star } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export default function SearchBookPreviewScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [bookData, setBookData] = useState<GoogleBookVolume | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { books, addBook } = useBookStore();

    useEffect(() => {
        const fetchBookDetails = async () => {
            if (!id || typeof id !== "string" || id.trim() === "") {
                setError("Invalid book ID");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const response = await fetch(
                    `https://www.googleapis.com/books/v1/volumes/${id}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch book details");
                }

                const data: GoogleBookVolume = await response.json();
                setBookData(data);
            } catch (err) {
                setError("Failed to load book details");
                console.error("Error fetching book details:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookDetails();
    }, [id]);

    const stripHtml = (html: string) => {
        let text = html.replace(/<[^>]*>/g, "");
        text = text
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, " ");
        return text;
    };

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    const handleAddBook = () => {
        if (!bookData) return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const book = mapGoogleBookToBook(bookData);
        addBook(book);
    };

    const isBookInLibrary = () => {
        return books.some((book) => book.id === id);
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="text-white text-base mt-4">Loading book details...</Text>
            </View>
        );
    }

    if (error || !bookData) {
        return (
            <View className="flex-1 bg-black items-center justify-center px-8">
                <BookOpen size={48} color="#ffffff" strokeWidth={1.5} />
                <Text className="text-white text-lg font-semibold mt-4">
                    {error || "Book not found"}
                </Text>
                <Pressable
                    onPress={handleBack}
                    className="mt-6 bg-white px-6 py-3 rounded-full"
                >
                    <Text className="text-black font-semibold">Go Back</Text>
                </Pressable>
            </View>
        );
    }

    const { volumeInfo } = bookData;
    const imageLinks = volumeInfo.imageLinks;

    const rawCoverUrl =
        imageLinks?.extraLarge ||
        imageLinks?.large ||
        imageLinks?.medium ||
        imageLinks?.thumbnail ||
        imageLinks?.smallThumbnail ||
        "";

    const coverUrl = getHighResImage(rawCoverUrl);
    const inLibrary = isBookInLibrary();

    return (
        <BookImmersiveLayout
            coverUrl={coverUrl}
            title={volumeInfo.title}
            author={volumeInfo.authors?.join(", ") || "Unknown Author"}
            statsContent={
                <>
                    {volumeInfo.pageCount && (
                        <View className="bg-white/10 px-4 py-2 rounded-full">
                            <Text className="text-base font-semibold text-white">
                                {volumeInfo.pageCount} Pages
                            </Text>
                        </View>
                    )}
                    {volumeInfo.averageRating && (
                        <View className="bg-white/10 px-4 py-2 rounded-full flex-row items-center gap-1">
                            <Star size={16} color="#ffffff" fill="#ffffff" />
                            <Text className="text-base font-semibold text-white">
                                {volumeInfo.averageRating.toFixed(1)}
                            </Text>
                        </View>
                    )}
                    {volumeInfo.categories && volumeInfo.categories.length > 0 && (
                        <View className="bg-white/10 px-4 py-2 rounded-full">
                            <Text className="text-base font-semibold text-white">
                                {volumeInfo.categories[0]}
                            </Text>
                        </View>
                    )}
                </>
            }
        >
            {volumeInfo.description && (
                <View className="mb-4">
                    <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
                        Description
                    </Text>
                    <Text className="text-base text-neutral-700 leading-6">
                        {stripHtml(volumeInfo.description)}
                    </Text>
                </View>
            )}

            {(volumeInfo.publisher || volumeInfo.publishedDate) && (
                <View className="mb-4">
                    <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
                        Publication Details
                    </Text>
                    {volumeInfo.publisher && (
                        <Text className="text-base text-neutral-700 mb-1">
                            <Text className="font-semibold">Publisher:</Text>{" "}
                            {volumeInfo.publisher}
                        </Text>
                    )}
                    {volumeInfo.publishedDate && (
                        <Text className="text-base text-neutral-700">
                            <Text className="font-semibold">Published:</Text>{" "}
                            {volumeInfo.publishedDate}
                        </Text>
                    )}
                </View>
            )}

            {inLibrary ? (
                <View className="bg-neutral-100 py-4 rounded-2xl flex-row items-center justify-center gap-3 mb-4">
                    <Check size={22} color="#22c55e" strokeWidth={2.5} />
                    <Text className="text-lg font-bold text-neutral-600">
                        Already in Library
                    </Text>
                </View>
            ) : (
                <Pressable
                    onPress={handleAddBook}
                    className="bg-neutral-900 py-4 rounded-2xl flex-row items-center justify-center gap-3 active:scale-[0.98] shadow-lg shadow-black/20 mb-4"
                >
                    <Plus size={22} color="#ffffff" strokeWidth={2.5} />
                    <Text className="text-lg font-bold text-white">
                        Add to Library
                    </Text>
                </Pressable>
            )}
        </BookImmersiveLayout>
    );
}
