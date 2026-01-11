import { GlassCard } from "@/components/ui/GlassCard";
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

        if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsLoading(true);
        setHasSearched(true);

        const searchResults = await searchBooks(query);
        setResults(searchResults);
        setIsLoading(false);
    }, [query]);

    const handleAddBook = useCallback(
        (volume: GoogleBookVolume) => {
            if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const book = mapGoogleBookToBook(volume);
            addBook(book);
        },
        [addBook]
    );

    const handleViewDetails = useCallback(
        (volumeId: string) => {
            if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/search-book/${volumeId}`);
        },
        [router]
    );

    const handleClose = () => {
        if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    const isBookInLibrary = (volumeId: string) => {
        return books.some((book) => book.id === volumeId);
    };

    return (
        <View className="flex-1 bg-black w-full h-full">
            {/* Header - Floating Glass */}
            <View
                className="absolute top-0 left-0 right-0 z-20 px-4 pb-4"
                style={{ paddingTop: insets.top + 10 }}
            >
                <View className="flex-row items-center gap-3">
                    {/* Search Bar Container */}
                    <GlassCard
                        intensity={23}
                        className="flex-1 h-14 rounded-2xl border-white/10 overflow-hidden"
                        contentClassName="flex-row items-center px-4 h-full w-full"
                    >
                        <Search size={20} color="#737373" strokeWidth={2} />
                        <TextInput
                            className="flex-1 ml-3 text-base text-white font-medium h-full"
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
                            style={{ fontFamily: 'Inter_500Medium' }}
                        />
                        {query.length > 0 && (
                            <Pressable onPress={() => setQuery("")} className="p-2">
                                <X size={18} color="#737373" />
                            </Pressable>
                        )}
                    </GlassCard>

                    {/* Scan Button - Glass Square */}
                    <Pressable
                        onPress={() => {
                            if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push("/scan" as Href);
                        }}
                        className="active:scale-95"
                    >
                        <GlassCard
                            intensity={23}
                            className="w-14 h-14 rounded-2xl border-white/10 items-center justify-center"
                            contentClassName="items-center justify-center h-full w-full"
                        >
                            <ScanBarcode size={24} color="#ffffff" strokeWidth={2} />
                        </GlassCard>
                    </Pressable>

                    {/* Cancel Text */}
                    <Pressable onPress={handleClose} className="px-2">
                        <Text className="text-sm font-bold text-white tracking-wide">Cancel</Text>
                    </Pressable>
                </View>
            </View>

            {/* Content Results */}
            <ScrollView
                className="flex-1 bg-black"
                contentContainerStyle={{
                    paddingTop: insets.top + 80, // Push content below floating header
                    paddingBottom: insets.bottom + 20,
                    paddingHorizontal: 16
                }}
                keyboardShouldPersistTaps="handled"
                indicatorStyle="white"
            >
                {isLoading && (
                    <View className="py-20 items-center">
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text className="text-neutral-500 mt-4 font-bold uppercase tracking-widest text-xs">Searching...</Text>
                    </View>
                )}

                {!isLoading && hasSearched && results.length === 0 && (
                    <View className="py-20 items-center px-8 opacity-50">
                        <BookOpen size={48} color="#525252" strokeWidth={1.5} />
                        <Text className="text-lg font-bold text-white mt-6">
                            No books found
                        </Text>
                        <Text className="text-neutral-500 text-center mt-2 font-medium">
                            Try searching for something else
                        </Text>
                    </View>
                )}

                {!isLoading && results.length > 0 && (
                    <View>
                        <Text className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-6 px-1">
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
                                    // Flat Swiss Card style: Neutral-900 bg, Sharp corners (rounded-sm), Border
                                    className="flex-row bg-neutral-900 rounded-sm p-4 mb-3 border border-neutral-800 active:bg-neutral-800"
                                >
                                    {/* Cover */}
                                    <View className="w-16 h-24 rounded-sm overflow-hidden bg-neutral-800 border border-white/5">
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
                                            <Text className="text-xs text-neutral-600 mt-2 font-bold uppercase tracking-wider">
                                                {volume.volumeInfo.pageCount} PGS
                                            </Text>
                                        ) : null}
                                    </View>

                                    {/* Add Button */}
                                    <View className="justify-center pl-2">
                                        {inLibrary ? (
                                            <View className="w-10 h-10 bg-green-900/20 rounded-lg items-center justify-center border border-green-900/50">
                                                <Check size={18} color="#22c55e" strokeWidth={3} />
                                            </View>
                                        ) : (
                                            <Pressable
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    handleAddBook(volume);
                                                }}
                                                className="w-10 h-10 bg-white rounded-lg items-center justify-center active:scale-90"
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
                    <View className="py-24 items-center px-8 opacity-30">
                        <Search size={64} color="#525252" strokeWidth={1} />
                        <Text className="text-xl font-bold text-white mt-8 tracking-tight">
                            Find Your Book
                        </Text>
                        <Text className="text-neutral-400 text-center mt-3 leading-relaxed">
                            Search the Google Books library {"\n"} by title, author, or ISBN
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
