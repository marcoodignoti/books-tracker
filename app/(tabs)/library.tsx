import { GlassCard } from "@/components/ui/GlassCard";
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
        if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/search");
    };

    return (
        <View className="flex-1 items-center justify-center px-6">
            <GlassCard
                intensity={40}
                className="w-full rounded-[32px] border-white/10 overflow-hidden"
                contentClassName="items-center py-12 px-8"
            >
                <View className="w-20 h-20 rounded-2xl bg-white/5 items-center justify-center mb-8 border border-white/10">
                    <BookOpen size={32} color="#737373" strokeWidth={1.5} />
                </View>
                <Text
                    className="text-3xl font-black text-white text-center mb-3 tracking-tighter"
                    style={{ fontFamily: 'Inter_900Black' }}
                >
                    Library is Empty
                </Text>
                <Text className="text-sm text-neutral-400 text-center mb-10 font-medium leading-relaxed px-4">
                    Start building your personal collection by adding your first book.
                </Text>

                <Pressable
                    onPress={handleAddBook}
                    className="active:scale-[0.98] w-full"
                >
                    <GlassCard
                        intensity={60}
                        className="w-full h-14 rounded-full border-white/20"
                        contentClassName="items-center justify-center flex-row gap-3 h-full w-full bg-white/10"
                    >
                        <Plus size={18} color="#ffffff" strokeWidth={3} />
                        <Text className="text-white font-black text-xs uppercase tracking-widest">
                            Add First Book
                        </Text>
                    </GlassCard>
                </Pressable>
            </GlassCard>
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
        if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
        router.push(`/book/${book.id}`);
    };

    const progress = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0;

    if (isHero) {
        return (
            <Pressable
                onPress={handlePress}
                className="mx-4 mb-8 active:scale-[0.98]"
            >
                <GlassCard
                    intensity={25}
                    className="rounded-[24px] border-white/10 overflow-hidden"
                    contentClassName="flex-row p-5"
                >
                    {/* Cover */}
                    <View className="w-32 h-48 rounded-sm overflow-hidden bg-neutral-900 shadow-2xl shadow-black border border-white/10">
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

                    {/* Info */}
                    <View className="flex-1 ml-5 justify-between py-1">
                        <View>
                            {/* Glass Badge */}
                            <GlassCard
                                intensity={40}
                                className="self-start rounded-full mb-3 border-white/10"
                                contentClassName="px-3 py-1 bg-white/5"
                            >
                                <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                                    Reading Now
                                </Text>
                            </GlassCard>

                            <Text
                                className="text-2xl font-black text-white mb-2 leading-tight tracking-tighter"
                                numberOfLines={3}
                                style={{ fontFamily: 'Inter_900Black' }}
                            >
                                {book.title}
                            </Text>
                            <Text className="text-sm text-neutral-400 font-medium" numberOfLines={1}>
                                {book.author}
                            </Text>
                        </View>

                        <View>
                            <View className="h-1 bg-neutral-800/50 rounded-full overflow-hidden mb-2">
                                <View
                                    className="h-full bg-white rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                            </View>
                            <Text className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                                {Math.round(progress)}% Complete
                            </Text>
                        </View>
                    </View>
                </GlassCard>
            </Pressable>
        );
    }

    return (
        <Pressable
            onPress={handlePress}
            className="w-32 mr-4 active:scale-95"
        >
            <View className="w-32 h-48 rounded-sm overflow-hidden bg-neutral-900 mb-3 shadow-lg shadow-black/50 border border-white/5">
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
                className="text-sm font-bold text-white mb-1 leading-tight tracking-tight"
                numberOfLines={2}
                style={{ fontFamily: 'Inter_700Bold' }}
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
        if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
                        Library
                    </Text>

                    {/* Add Button - Floating Glass Circle */}
                    <Pressable
                        onPress={handleAddBook}
                        className="active:scale-90 mb-2"
                    >
                        <GlassCard
                            intensity={40}
                            className="w-12 h-12 rounded-full border-white/20"
                            contentClassName="items-center justify-center h-full w-full bg-white/5"
                        >
                            <Plus size={24} color="#ffffff" strokeWidth={2.5} />
                        </GlassCard>
                    </Pressable>
                </View>

                {/* Currently Reading Hero */}
                {currentlyReading.length > 0 && (
                    <BookCard book={currentlyReading[0]} isHero />
                )}

                {/* Additional Currently Reading Books */}
                {currentlyReading.length > 1 && (
                    <View className="mb-10">
                        <Text className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 px-6 mb-4">
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
                    <View className="mb-10">
                        <Text className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 px-6 mb-4">
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
                    <View className="mb-10">
                        <Text className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 px-6 mb-4">
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

                <View style={{ height: insets.bottom + 100 }} />
            </ScrollView>
        </View>
    );
}
