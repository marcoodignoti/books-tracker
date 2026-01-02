import { mapGoogleBookToBook, searchBooks } from "@/services/googleBooks";
import { useBookStore } from "@/store/useBookStore";
import { Book, GoogleBookVolume } from "@/types/book";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { BookOpen, Check, ChevronRight, Search, X } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PreviewBook = Omit<Book, 'addedAt' | 'sessions'>;

export default function SearchScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<GoogleBookVolume[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedBook, setSelectedBook] = useState<PreviewBook | null>(null);
    const [selectedVolume, setSelectedVolume] = useState<GoogleBookVolume | null>(null);

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

    const handleSelectBook = useCallback((volume: GoogleBookVolume) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const book = mapGoogleBookToBook(volume);
        setSelectedBook(book);
        setSelectedVolume(volume);
    }, []);

    const handleCloseModal = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedBook(null);
        setSelectedVolume(null);
    }, []);

    const handleAddFromModal = useCallback(() => {
        if (selectedVolume) {
            handleAddBook(selectedVolume);
            setSelectedBook(null);
            setSelectedVolume(null);
            router.back();
        }
    }, [selectedVolume, handleAddBook, router]);

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
                <Pressable onPress={handleClose} className="ml-3">
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
                            const coverUrl = volume.volumeInfo.imageLinks?.thumbnail?.replace(
                                "http://",
                                "https://"
                            );

                            return (
                                <Pressable
                                    key={volume.id}
                                    onPress={() => handleSelectBook(volume)}
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

                                    {/* Status/Chevron */}
                                    <View className="justify-center ml-2">
                                        {inLibrary ? (
                                            <View className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center">
                                                <Check size={20} color="#22c55e" strokeWidth={2.5} />
                                            </View>
                                        ) : (
                                            <ChevronRight size={20} color="#a3a3a3" strokeWidth={2} />
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

            {/* Book Preview Modal */}
            <Modal
                visible={selectedBook !== null}
                transparent
                animationType="slide"
                onRequestClose={handleCloseModal}
            >
                <View className="flex-1 justify-end">
                    {/* Backdrop with blur */}
                    <Pressable
                        className="absolute inset-0 bg-black/50"
                        onPress={handleCloseModal}
                    >
                        <BlurView intensity={10} className="flex-1" />
                    </Pressable>

                    {/* Modal Content - Bottom Sheet Style */}
                    {selectedBook && (
                        <View
                            className="bg-white rounded-t-3xl p-6"
                            style={{ 
                                maxHeight: Dimensions.get('window').height * 0.75,
                                paddingBottom: insets.bottom + 24 
                            }}
                        >
                            {/* Header */}
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                                    Book Preview
                                </Text>
                                <Pressable
                                    onPress={handleCloseModal}
                                    className="w-8 h-8 bg-neutral-100 rounded-full items-center justify-center"
                                >
                                    <X size={16} color="#737373" strokeWidth={2.5} />
                                </Pressable>
                            </View>

                            {/* Scrollable Content */}
                            <ScrollView 
                                showsVerticalScrollIndicator={true}
                                contentContainerStyle={{ flexGrow: 1 }}
                            >
                                {/* Book Info */}
                                <View className="flex-row mb-4">
                                    {/* Cover */}
                                    <View className="w-24 h-36 rounded-xl overflow-hidden shadow-xl shadow-black/20">
                                        {selectedBook.coverUrl ? (
                                            <Image
                                                source={{ uri: selectedBook.coverUrl }}
                                                style={{ width: "100%", height: "100%" }}
                                                contentFit="cover"
                                            />
                                        ) : (
                                            <View className="w-full h-full bg-neutral-200 items-center justify-center">
                                                <BookOpen size={32} color="#a3a3a3" />
                                            </View>
                                        )}
                                    </View>

                                    {/* Details */}
                                    <View className="flex-1 ml-4 justify-center">
                                        <Text className="text-lg font-bold text-neutral-900" numberOfLines={3}>
                                            {selectedBook.title}
                                        </Text>
                                        <Text className="text-sm text-neutral-500 mt-1" numberOfLines={1}>
                                            {selectedBook.author}
                                        </Text>
                                        {selectedVolume?.volumeInfo.publishedDate && (
                                            <Text className="text-xs text-neutral-400 mt-1">
                                                {selectedVolume.volumeInfo.publishedDate.substring(0, 4)}
                                            </Text>
                                        )}
                                        {/* Page Count Badge */}
                                        {selectedBook.totalPages > 0 && (
                                            <View className="flex-row mt-3">
                                                <View className="bg-neutral-100 rounded-full px-3 py-1">
                                                    <Text className="text-xs font-medium text-neutral-600">
                                                        {selectedBook.totalPages} pages
                                                    </Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* Description */}
                                <View className="mb-6">
                                    <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
                                        Description
                                    </Text>
                                    <Text className="text-sm text-neutral-600 leading-5">
                                        {selectedBook.description || "No description available."}
                                    </Text>
                                </View>
                            </ScrollView>

                            {/* Actions */}
                            {isBookInLibrary(selectedBook.id) ? (
                                <View className="bg-neutral-100 rounded-xl py-4 items-center">
                                    <View className="flex-row items-center">
                                        <Check size={20} color="#22c55e" strokeWidth={2.5} />
                                        <Text className="text-base font-semibold text-neutral-600 ml-2">
                                            Already in Library
                                        </Text>
                                    </View>
                                </View>
                            ) : (
                                <Pressable
                                    onPress={handleAddFromModal}
                                    className="bg-neutral-900 rounded-xl py-4 items-center active:bg-neutral-800"
                                >
                                    <Text className="text-base font-semibold text-white">
                                        Add to Library
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                    )}
                </View>
            </Modal>
        </View>
    );
}
