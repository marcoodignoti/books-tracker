import { useBookStore } from "@/store/useBookStore";
import { Book } from "@/types/book";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { BookOpen, Plus } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function EmptyState() {
    const router = useRouter();

    const handleAddBook = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/search");
    };

    return (
        <View className="flex-1 items-center justify-center px-8">
            <View className="w-24 h-24 rounded-full bg-neutral-100 items-center justify-center mb-6">
                <BookOpen size={40} color="#a3a3a3" strokeWidth={1.5} />
            </View>
            <Text className="text-2xl font-bold text-neutral-900 text-center mb-2">
                Your Library is Empty
            </Text>
            <Text className="text-base text-neutral-500 text-center mb-8">
                Start building your collection by adding your first book
            </Text>
            <Pressable
                onPress={handleAddBook}
                className="bg-neutral-900 px-8 py-4 rounded-2xl flex-row items-center gap-3 shadow-xl shadow-black/20 active:scale-95"
            >
                <Plus size={20} color="#ffffff" strokeWidth={2.5} />
                <Text className="text-white font-semibold text-base">Add Your First Book</Text>
            </Pressable>
        </View>
    );
}

interface BookCardProps {
    book: Book;
    isHero?: boolean;
}

function BookCard({ book, isHero }: BookCardProps) {
    const router = useRouter();

    const handlePress = () => {
        Haptics.selectionAsync();
        router.push(`/book/${book.id}`);
    };

    const progress = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0;

    if (isHero) {
        return (
            <Pressable
                onPress={handlePress}
                className="bg-white rounded-3xl shadow-2xl shadow-black/15 overflow-hidden mx-4 mb-6 active:scale-[0.98]"
            >
                <View className="flex-row p-4">
                    <View className="w-32 h-48 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
                        {book.coverUrl ? (
                            <Image
                                source={{ uri: book.coverUrl }}
                                style={{ width: "100%", height: "100%" }}
                                contentFit="cover"
                            />
                        ) : (
                            <View className="w-full h-full bg-neutral-200 items-center justify-center">
                                <BookOpen size={32} color="#a3a3a3" />
                            </View>
                        )}
                    </View>
                    <View className="flex-1 ml-4 justify-center">
                        <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">
                            Currently Reading
                        </Text>
                        <Text className="text-xl font-bold text-neutral-900 mb-1" numberOfLines={2}>
                            {book.title}
                        </Text>
                        <Text className="text-sm text-neutral-500 mb-4" numberOfLines={1}>
                            {book.author}
                        </Text>
                        <View className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-neutral-900 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </View>
                        <Text className="text-xs text-neutral-400 mt-2">
                            {book.currentPage} of {book.totalPages} pages
                        </Text>
                    </View>
                </View>
            </Pressable>
        );
    }

    return (
        <Pressable
            onPress={handlePress}
            className="w-28 mr-4 active:scale-95"
        >
            <View className="w-28 h-40 rounded-2xl overflow-hidden shadow-xl shadow-black/10 mb-2">
                {book.coverUrl ? (
                    <Image
                        source={{ uri: book.coverUrl }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                    />
                ) : (
                    <View className="w-full h-full bg-neutral-200 items-center justify-center">
                        <BookOpen size={24} color="#a3a3a3" />
                    </View>
                )}
            </View>
            <Text className="text-sm font-semibold text-neutral-900" numberOfLines={1}>
                {book.title}
            </Text>
            <Text className="text-xs text-neutral-500" numberOfLines={1}>
                {book.author}
            </Text>
        </Pressable>
    );
}

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const books = useBookStore((state) => state.books);

    const currentlyReading = books.find((b) => b.status === "reading");
    const wantToRead = books.filter((b) => b.status === "want-to-read");
    const finished = books.filter((b) => b.status === "finished");

    const handleAddBook = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/search");
    };

    if (books.length === 0) {
        return (
            <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
                <EmptyState />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-4">
                    <Text className="text-3xl font-bold tracking-tight text-neutral-900">
                        Your Library
                    </Text>
                    <Pressable
                        onPress={handleAddBook}
                        className="w-12 h-12 bg-neutral-900 rounded-full items-center justify-center shadow-lg shadow-black/20 active:scale-90"
                    >
                        <Plus size={24} color="#ffffff" strokeWidth={2.5} />
                    </Pressable>
                </View>

                {/* Currently Reading Hero */}
                {currentlyReading && (
                    <BookCard book={currentlyReading} isHero />
                )}

                {/* Want to Read Section */}
                {wantToRead.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 px-4 mb-3">
                            Want to Read
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
                        >
                            {wantToRead.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Finished Section */}
                {finished.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 px-4 mb-3">
                            Finished
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
                        >
                            {finished.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={{ height: insets.bottom + 20 }} />
            </ScrollView>
        </View>
    );
}
