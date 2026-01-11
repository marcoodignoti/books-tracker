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
            <View className="w-24 h-24 rounded-full bg-neutral-900 items-center justify-center mb-6">
                <BookOpen size={40} color="#a3a3a3" strokeWidth={1.5} />
            </View>
            <Text
                className="text-2xl font-black text-white text-center mb-2 tracking-tighter"
                style={{ fontFamily: 'Inter_900Black' }}
            >
                Library is Empty
            </Text>
            <Text className="text-base text-neutral-500 text-center mb-8 font-medium">
                Start building your collection by adding your first book
            </Text>
            <Pressable
                onPress={handleAddBook}
                className="bg-white px-8 py-4 rounded-full flex-row items-center gap-3 active:scale-95"
            >
                <Plus size={20} color="#000000" strokeWidth={2.5} />
                <Text className="text-black font-bold text-base uppercase tracking-wider">Add Book</Text>
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
                className="bg-neutral-900 rounded-[32px] overflow-hidden mx-4 mb-8 active:scale-[0.98]"
            >
                <View className="flex-row p-5">
                    <View className="w-32 h-48 rounded-2xl overflow-hidden bg-neutral-800">
                        {book.coverUrl ? (
                            <Image
                                source={{ uri: book.coverUrl }}
                                style={{ width: "100%", height: "100%" }}
                                contentFit="cover"
                            />
                        ) : (
                            <View className="w-full h-full items-center justify-center">
                                <BookOpen size={32} color="#525252" />
                            </View>
                        )}
                    </View>
                    <View className="flex-1 ml-5 justify-center">
                        <View className="bg-red-600 self-start px-2 py-1 rounded-md mb-3">
                            <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                                Reading Now
                            </Text>
                        </View>
                        <Text
                            className="text-2xl font-black text-white mb-1 leading-tight tracking-tighter"
                            numberOfLines={2}
                            style={{ fontFamily: 'Inter_900Black' }}
                        >
                            {book.title}
                        </Text>
                        <Text className="text-sm text-neutral-400 mb-6 font-medium" numberOfLines={1}>
                            {book.author}
                        </Text>
                        <View className="h-1 bg-neutral-800 rounded-full overflow-hidden mb-2">
                            <View
                                className="h-full bg-white rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </View>
                        <Text className="text-xs text-neutral-500 font-bold uppercase tracking-widest">
                            {Math.round(progress)}% Complete
                        </Text>
                    </View>
                </View>
            </Pressable>
        );
    }

    return (
        <Pressable
            onPress={handlePress}
            className="w-32 mr-4 active:scale-95"
        >
            <View className="w-32 h-48 rounded-xl overflow-hidden bg-neutral-900 mb-3">
                {book.coverUrl ? (
                    <Image
                        source={{ uri: book.coverUrl }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                    />
                ) : (
                    <View className="w-full h-full items-center justify-center">
                        <BookOpen size={24} color="#525252" />
                    </View>
                )}
            </View>
            <Text
                className="text-sm font-bold text-white mb-1 leading-tight"
                numberOfLines={2}
            >
                {book.title}
            </Text>
            <Text className="text-xs text-neutral-500 font-medium" numberOfLines={1}>
                {book.author}
            </Text>
        </Pressable>
    );
}

export default function LibraryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const books = useBookStore((state) => state.books);

    const currentlyReading = books.filter((b) => b.status === "reading");
    const wantToRead = books.filter((b) => b.status === "want-to-read");
    const finished = books.filter((b) => b.status === "finished");

    const handleAddBook = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/search");
    };

    if (books.length === 0) {
        return (
            <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
                <EmptyState />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {/* Header */}
                <View className="flex-row items-end justify-between px-6 pb-8 pt-4">
                    <Text
                        className="text-5xl font-black text-white tracking-tighter"
                        style={{ fontFamily: 'Inter_900Black' }}
                    >
                        Index.
                    </Text>
                    <Pressable
                        onPress={handleAddBook}
                        className="w-12 h-12 bg-white rounded-full items-center justify-center active:scale-90 mb-2"
                    >
                        <Plus size={24} color="#000000" strokeWidth={2.5} />
                    </Pressable>
                </View>

                {/* Currently Reading Hero */}
                {currentlyReading.length > 0 && (
                    <BookCard book={currentlyReading[0]} isHero />
                )}

                {/* Additional Currently Reading Books */}
                {currentlyReading.length > 1 && (
                    <View className="mb-8">
                        <Text className="text-xs font-bold uppercase tracking-widest text-neutral-500 px-6 mb-4">
                            Also Reading
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
                        >
                            {currentlyReading.slice(1).map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Want to Read Section */}
                {wantToRead.length > 0 && (
                    <View className="mb-8">
                        <Text className="text-xs font-bold uppercase tracking-widest text-neutral-500 px-6 mb-4">
                            Queue
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
                        >
                            {wantToRead.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Finished Section */}
                {finished.length > 0 && (
                    <View className="mb-8">
                        <Text className="text-xs font-bold uppercase tracking-widest text-neutral-500 px-6 mb-4">
                            Archive
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
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
