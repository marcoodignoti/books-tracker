import { getHighResImage, mapGoogleBookToBook, searchBooks } from "@/services/googleBooks";
import { useBookStore } from "@/store/useBookStore";
import { GoogleBookVolume } from "@/types/book";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { BookOpen, Check, ChevronRight, Plus, Search, X } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SearchScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<GoogleBookVolume[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const { books, addBook } = useBookStore();

    const handleSearch = useCallback(async () => {
        if (!query.trim()) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsLoading(true);
        setHasSearched(true);

        const searchResults = await searchBooks(query);
        setResults(searchResults);
        setIsLoading(false);
    }, [query]);

    const handleAddBook = useCallback(
        (volume: GoogleBookVolume) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const book = mapGoogleBookToBook(volume);
            addBook(book);
        },
        [addBook]
    );

    const handleViewDetails = useCallback(
        (volumeId: string) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/search-book/${volumeId}`);
        },
        [router]
    );

    const handleClose = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    const isBookInLibrary = (volumeId: string) => {
        return books.some((book) => book.id === volumeId);
    };

    return (
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-neutral-100">
                <View className="flex-1 flex-row items-center bg-neutral-100 rounded-xl px-4 py-3">
                    <Search size={20} color="#a3a3a3" strokeWidth={2} />
                    <TextInput
                        className="flex-1 ml-3 text-base text-neutral-900"
                        placeholder="Search for books..."
                        placeholderTextColor="#a3a3a3"
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                        autoFocus
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {query.length > 0 && (
                        <Pressable onPress={() => setQuery("")}>
                            <X size={18} color="#a3a3a3" />
                        </Pressable>
                    )}
                </View>
                <Pressable
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push("/scan" as Href);
                    }}
                    className="ml-2 w-10 h-10 bg-neutral-900 rounded-xl items-center justify-center active:scale-90"
                >
                    <ScanLine size={20} color="#ffffff" />
                </Pressable>
                <Pressable onPress={handleClose} className="ml-2">
                    <Text className="text-base font-semibold text-neutral-900">Cancel</Text>
                </Pressable>
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                keyboardShouldPersistTaps="handled"
            >
                {isLoading && (
                    <View className="py-12 items-center">
                        <ActivityIndicator size="large" color="#171717" />
                        <Text className="text-neutral-500 mt-3">Searching books...</Text>
                    </View>
                )}

                {!isLoading && hasSearched && results.length === 0 && (
                    <View className="py-12 items-center px-8">
                        <BookOpen size={48} color="#d4d4d4" strokeWidth={1.5} />
                        <Text className="text-lg font-semibold text-neutral-900 mt-4">
                            No books found
                        </Text>
                        <Text className="text-neutral-500 text-center mt-1">
                            Try a different search term
                        </Text>
                    </View>
                )}

                {!isLoading && results.length > 0 && (
                    <View className="px-4 py-4">
                        <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
                            {results.length} Results
                        </Text>

                        {results.map((volume) => {
                            const inLibrary = isBookInLibrary(volume.id);
                            const rawCoverUrl = volume.volumeInfo.imageLinks?.thumbnail || "";
                            const coverUrl = getHighResImage(rawCoverUrl);

                            return (
                                <Pressable
                                    key={volume.id}
                                    onPress={() => handleViewDetails(volume.id)}
                                    className="flex-row bg-white rounded-2xl p-3 mb-3 border border-neutral-100 active:bg-neutral-50"
                                >
                                    {/* Cover */}
                                    <View className="w-16 h-24 rounded-xl overflow-hidden shadow-lg shadow-black/10">
                                        {coverUrl ? (
                                            <Image
                                                source={{ uri: coverUrl }}
                                                style={{ width: "100%", height: "100%" }}
                                                contentFit="cover"
                                            />
                                        ) : (
                                            <View className="w-full h-full bg-neutral-200 items-center justify-center">
                                                <BookOpen size={20} color="#a3a3a3" />
                                            </View>
                                        )}
                                    </View>

                                    {/* Info */}
                                    <View className="flex-1 ml-3 justify-center">
                                        <Text
                                            className="text-base font-semibold text-neutral-900"
                                            numberOfLines={2}
                                        >
                                            {volume.volumeInfo.title}
                                        </Text>
                                        <Text className="text-sm text-neutral-500" numberOfLines={1}>
                                            {volume.volumeInfo.authors?.join(", ") || "Unknown Author"}
                                        </Text>
                                        {volume.volumeInfo.pageCount ? (
                                            <Text className="text-xs text-neutral-400 mt-1">
                                                {volume.volumeInfo.pageCount} pages
                                            </Text>
                                        ) : null}
                                    </View>

                                    {/* ChevronRight Icon */}
                                    <View className="justify-center ml-2 mr-2">
                                        <ChevronRight size={20} color="#a3a3a3" strokeWidth={2} />
                                    </View>

                                    {/* Add Button */}
                                    <View className="justify-center">
                                        {inLibrary ? (
                                            <View className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center">
                                                <Check size={20} color="#22c55e" strokeWidth={2.5} />
                                            </View>
                                        ) : (
                                            <Pressable
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    handleAddBook(volume);
                                                }}
                                                className="w-10 h-10 bg-neutral-900 rounded-full items-center justify-center active:scale-90"
                                            >
                                                <Plus size={20} color="#ffffff" strokeWidth={2.5} />
                                            </Pressable>
                                        )}
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                )}

                {!isLoading && !hasSearched && (
                    <View className="py-12 items-center px-8">
                        <Search size={48} color="#d4d4d4" strokeWidth={1.5} />
                        <Text className="text-lg font-semibold text-neutral-900 mt-4">
                            Find Your Next Read
                        </Text>
                        <Text className="text-neutral-500 text-center mt-1">
                            Search by title, author, or ISBN
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
