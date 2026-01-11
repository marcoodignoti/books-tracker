import { getHighResImage, mapGoogleBookToBook, searchBooks } from "@/services/googleBooks";
import { useBookStore } from "@/store/useBookStore";
import { GoogleBookVolume } from "@/types/book";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Href, useRouter } from "expo-router";
import { BookOpen, Check, Plus, ScanBarcode, Search, X } from "lucide-react-native";
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
        <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="flex-row items-center px-4 py-4 border-b border-neutral-900">
                <View className="flex-1 flex-row items-center bg-neutral-900 rounded-full px-5 py-4 border border-neutral-800">
                    <Search size={20} color="#737373" strokeWidth={2} />
                    <TextInput
                        className="flex-1 ml-3 text-base text-white font-medium"
                        placeholder="Search title, author, isbn..."
                        placeholderTextColor="#525252"
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                        autoFocus
                        autoCapitalize="none"
                        autoCorrect={false}
                        cursorColor="#ffffff"
                    />
                    {query.length > 0 && (
                        <Pressable onPress={() => setQuery("")}>
                            <X size={18} color="#737373" />
                        </Pressable>
                    )}
                </View>
                <Pressable
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push("/scan" as Href);
                    }}
                    className="ml-3 w-12 h-12 bg-white rounded-full items-center justify-center active:scale-90"
                >
                    <ScanBarcode size={20} color="#000000" strokeWidth={2.5} />
                </Pressable>
                <Pressable onPress={handleClose} className="ml-4">
                    <Text className="text-base font-bold text-neutral-400">Cancel</Text>
                </Pressable>
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                keyboardShouldPersistTaps="handled"
                indicatorStyle="white"
            >
                {isLoading && (
                    <View className="py-20 items-center">
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text className="text-neutral-500 mt-4 font-medium uppercase tracking-widest text-xs">Searching...</Text>
                    </View>
                )}

                {!isLoading && hasSearched && results.length === 0 && (
                    <View className="py-20 items-center px-8 opacity-50">
                        <BookOpen size={48} color="#525252" strokeWidth={1.5} />
                        <Text className="text-lg font-bold text-white mt-6">
                            No books found
                        </Text>
                        <Text className="text-neutral-500 text-center mt-2">
                            Try searching for something else
                        </Text>
                    </View>
                )}

                {!isLoading && results.length > 0 && (
                    <View className="px-4 py-6">
                        <Text className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-6 px-2">
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
                                    className="flex-row bg-neutral-900 rounded-2xl p-4 mb-3 border border-neutral-800 active:bg-neutral-800"
                                >
                                    {/* Cover */}
                                    <View className="w-16 h-24 rounded-lg overflow-hidden bg-neutral-800">
                                        {coverUrl ? (
                                            <Image
                                                source={{ uri: coverUrl }}
                                                style={{ width: "100%", height: "100%" }}
                                                contentFit="cover"
                                            />
                                        ) : (
                                            <View className="w-full h-full items-center justify-center">
                                                <BookOpen size={20} color="#525252" />
                                            </View>
                                        )}
                                    </View>

                                    {/* Info */}
                                    <View className="flex-1 ml-4 justify-center">
                                        <Text
                                            className="text-lg font-bold text-white leading-tight mb-1"
                                            numberOfLines={2}
                                            style={{ fontFamily: 'Inter_700Bold' }}
                                        >
                                            {volume.volumeInfo.title}
                                        </Text>
                                        <Text className="text-sm text-neutral-400 font-medium" numberOfLines={1}>
                                            {volume.volumeInfo.authors?.join(", ") || "Unknown Author"}
                                        </Text>
                                        {volume.volumeInfo.pageCount ? (
                                            <Text className="text-xs text-neutral-600 mt-2 font-bold uppercase">
                                                {volume.volumeInfo.pageCount} pgs
                                            </Text>
                                        ) : null}
                                    </View>

                                    {/* Add Button */}
                                    <View className="justify-center pl-2">
                                        {inLibrary ? (
                                            <View className="w-10 h-10 bg-green-900/20 rounded-full items-center justify-center border border-green-900/50">
                                                <Check size={18} color="#22c55e" strokeWidth={3} />
                                            </View>
                                        ) : (
                                            <Pressable
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    handleAddBook(volume);
                                                }}
                                                className="w-10 h-10 bg-white rounded-full items-center justify-center active:scale-90"
                                            >
                                                <Plus size={20} color="#000000" strokeWidth={3} />
                                            </Pressable>
                                        )}
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                )}

                {!isLoading && !hasSearched && (
                    <View className="py-20 items-center px-8 opacity-40">
                        <Search size={48} color="#525252" strokeWidth={1.5} />
                        <Text className="text-lg font-bold text-white mt-6">
                            Find Your Book
                        </Text>
                        <Text className="text-neutral-500 text-center mt-2">
                            Search by title, author, or ISBN
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
