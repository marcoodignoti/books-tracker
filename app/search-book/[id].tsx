import { getHighResImage, mapGoogleBookToBook } from "@/services/googleBooks";
import { useBookStore } from "@/store/useBookStore";
import { GoogleBookVolume } from "@/types/book";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BookOpen, Check, ChevronLeft, Plus, Star } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const COVER_HEIGHT = SCREEN_HEIGHT * 0.6;

export default function SearchBookPreviewScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

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
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

                try {
                    const response = await fetch(
                        `https://www.googleapis.com/books/v1/volumes/${id}`,
                        { signal: controller.signal }
                    );

                    if (!response.ok) {
                        throw new Error("Failed to fetch book details");
                    }

                    const data: GoogleBookVolume = await response.json();
                    setBookData(data);
                } finally {
                    clearTimeout(timeoutId);
                }
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    setError("Request timed out");
                    console.error("Error fetching book details: Request timed out");
                } else {
                    setError("Failed to load book details");
                    console.error("Error fetching book details:", err instanceof Error ? err.message : "Unknown error");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookDetails();
    }, [id]);

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

    // Helper function to strip HTML tags and decode entities from description
    const stripHtml = (html: string) => {
        // Remove HTML tags
        let text = html.replace(/<[^>]*>/g, "");
        // Decode common HTML entities
        text = text
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, " ");
        return text;
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

    // Get high-res cover image
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
        <View className="flex-1 bg-black">
            {/* Background Cover Image */}
            <View className="absolute top-0 left-0 right-0" style={{ height: COVER_HEIGHT }}>
                {coverUrl ? (
                    <Image
                        source={{ uri: coverUrl }}
                        style={{ width: SCREEN_WIDTH, height: COVER_HEIGHT }}
                        contentFit="cover"
                    />
                ) : (
                    // Dark abstract gradient fallback for missing covers
                    <LinearGradient
                        colors={["#374151", "#1f2937", "#111827"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ width: SCREEN_WIDTH, height: COVER_HEIGHT }}
                    />
                )}
                {/* Gradient overlay: transparent to black */}
                <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.9)", "#000000"]}
                    locations={[0, 0.4, 0.7, 1]}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                />
            </View>

            {/* Floating Back Button with Blur */}
            <View
                className="absolute z-10"
                style={{ top: insets.top + 8, left: 16 }}
            >
                <Pressable
                    onPress={handleBack}
                    className="overflow-hidden rounded-full active:scale-90"
                >
                    <BlurView
                        intensity={50}
                        tint="dark"
                        className="w-11 h-11 items-center justify-center"
                    >
                        <ChevronLeft size={24} color="#ffffff" />
                    </BlurView>
                </Pressable>
            </View>

            {/* Content Over Gradient */}
            <View className="flex-1 justify-end">
                {/* Book Info Section */}
                <View className="px-6 pb-6">
                    {/* Title */}
                    <Text className="text-4xl font-bold text-white mb-2" numberOfLines={3}>
                        {volumeInfo.title}
                    </Text>

                    {/* Author */}
                    <Text className="text-sm font-semibold uppercase tracking-widest text-neutral-400 mb-6">
                        {volumeInfo.authors?.join(", ") || "Unknown Author"}
                    </Text>

                    {/* Stats Row */}
                    <View className="flex-row items-center gap-4 mb-6 flex-wrap">
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
                    </View>
                </View>

                {/* Bottom Sheet Style White Container */}
                <View
                    className="bg-white rounded-t-[32px] px-6 pt-6"
                    style={{
                        paddingBottom: insets.bottom + 16,
                        maxHeight: SCREEN_HEIGHT * 0.55,
                    }}
                >
                    <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                        {/* Description */}
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

                        {/* Publisher & Publication Date */}
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

                        {/* Add to Library Button or Already in Library */}
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
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}
