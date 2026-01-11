import { GlassCard } from "@/components/ui/GlassCard";
import { useBookStore } from "@/store/useBookStore";
import { Book } from "@/types/book";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { BookOpen, Plus } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function EmptyState() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleAddBook = () => {
        if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/search");
    };

    return (
        <View className="flex-1 items-center justify-center px-6">
            <GlassCard
                intensity={40}
                className="w-full rounded-[32px] border-black/10 dark:border-white/10 overflow-hidden"
                contentClassName="items-center py-12 px-8"
            >
                <View className="w-20 h-20 rounded-full bg-black/5 dark:bg-white/5 items-center justify-center mb-8 border border-black/10 dark:border-white/10">
                    <BookOpen size={32} color={isDark ? "#737373" : "#525252"} strokeWidth={1.5} />
                </View>
                <Text
                    className="text-2xl font-bold text-black dark:text-white text-center mb-3"
                    style={{ fontFamily: 'Inter_700Bold' }}
                >
                    Library is Empty
                </Text>
                <Text className="text-sm text-neutral-500 dark:text-neutral-400 text-center mb-10 font-medium leading-relaxed px-4">
                    Start building your personal collection by adding your first book.
                </Text>

                <Pressable
                    onPress={handleAddBook}
                    className="active:scale-[0.98] w-full"
                >
                    <GlassCard
                        intensity={60}
                        className="w-full h-14 rounded-full border-black/20 dark:border-white/20"
                        contentClassName="items-center justify-center flex-row gap-3 h-full w-full bg-black/5 dark:bg-white/10"
                    >
                        <Plus size={18} color={isDark ? "#ffffff" : "#000000"} strokeWidth={2.5} />
                        <Text className="text-black dark:text-white font-bold text-xs uppercase tracking-wide">
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
    className?: string;
    style?: any;
}

function BookCard({ book, isHero, className, style }: BookCardProps) {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handlePress = () => {
        if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
        router.push(`/book/${book.id}`);
    };

    const progress = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0;

    if (isHero) {
        return (
            <Pressable
                onPress={handlePress}
                className={`active:scale-[0.98] ${className || "mx-4 mb-8"}`} // Allow override of default margins
                style={style}
            >
                <GlassCard
                    intensity={25}
                    className="rounded-[24px] border-black/5 dark:border-white/10 overflow-hidden"
                    contentClassName="flex-row p-5"
                >
                    {/* Cover - Rounded */}
                    <View className="w-28 h-40 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 shadow-md shadow-black border border-black/5 dark:border-white/5">
                        {book.coverUrl ? (
                            <Image
                                source={{ uri: book.coverUrl }}
                                style={{ width: "100%", height: "100%" }}
                                contentFit="cover"
                            />
                        ) : (
                            <View className="w-full h-full items-center justify-center">
                                <BookOpen size={32} color={isDark ? "#525252" : "#a3a3a3"} />
                            </View>
                        )}
                    </View>

                    {/* Info */}
                    <View className="flex-1 ml-5 justify-between py-1">
                        <View>
                            {/* Badge - Softer */}
                            <View className="self-start rounded-full mb-3 bg-black/5 dark:bg-white/10 px-3 py-1">
                                <Text className="text-black dark:text-white text-[10px] font-semibold uppercase tracking-wide">
                                    Reading Now
                                </Text>
                            </View>

                            <Text
                                className="text-lg font-bold text-black dark:text-white mb-2 leading-tight"
                                numberOfLines={2}
                                style={{ fontFamily: 'Inter_700Bold' }}
                            >
                                {book.title}
                            </Text>
                            <Text className="text-sm text-neutral-500 dark:text-neutral-400 font-medium" numberOfLines={1}>
                                {book.author}
                            </Text>
                        </View>

                        <View>
                            <View className="h-1 bg-neutral-200 dark:bg-neutral-700/50 rounded-full overflow-hidden mb-2">
                                <View
                                    className="h-full bg-black dark:bg-white rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                            </View>
                            <Text className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wide">
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
            className="w-[30%] active:scale-95"
        >
            <View className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 mb-3 shadow-sm shadow-black/20 border border-black/5 dark:border-white/5">
                {book.coverUrl ? (
                    <Image
                        source={{ uri: book.coverUrl }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                    />
                ) : (
                    <View className="w-full h-full items-center justify-center">
                        <BookOpen size={24} color={isDark ? "#525252" : "#a3a3a3"} />
                    </View>
                )}
            </View>
            <Text
                className="text-sm font-bold text-black dark:text-white mb-1 leading-tight"
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
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const currentlyReading = books.filter((b) => b.status === "reading");
    const wantToRead = books.filter((b) => b.status === "want-to-read");
    const finished = books.filter((b) => b.status === "finished");

    const handleAddBook = () => {
        if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/search");
    };

    if (books.length === 0) {
        return (
            <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: insets.top }}>
                <EmptyState />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: insets.top }}>
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {/* Header */}
                <View className="flex-row items-end justify-between px-6 pb-8 pt-4">
                    <Text
                        className="text-4xl font-bold text-black dark:text-white"
                        style={{ fontFamily: 'Inter_700Bold' }}
                    >
                        Library
                    </Text>

                    {/* Add Button - Floating Glass Circle */}
                    <Pressable
                        onPress={handleAddBook}
                        className="active:scale-90 mb-1"
                    >
                        <View className="w-10 h-10 rounded-full border border-black/10 dark:border-white/20 items-center justify-center">
                            <Plus size={22} color={isDark ? "#ffffff" : "#000000"} strokeWidth={3} />
                        </View>
                    </Pressable>
                </View>

                {/* Currently Reading Carousel */}
                {currentlyReading.length > 0 && (
                    <View className="mb-10">
                        <Text className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 px-6 mb-4">
                            Reading Now
                        </Text>
                        <ScrollView
                            horizontal
                            decelerationRate="fast"
                            snapToInterval={Dimensions.get('window').width - 48 + 16} // Card Width + Gap
                            snapToAlignment="center"
                            showsHorizontalScrollIndicator={false}
                            className="w-full"
                            contentContainerStyle={{ paddingHorizontal: 24 }} // Center first/last item
                        >
                            {currentlyReading.map((book, index) => (
                                <View key={book.id} style={{ width: Dimensions.get('window').width - 48, marginRight: 16 }}>
                                    <BookCard
                                        book={book}
                                        isHero
                                        className="mb-4" // Remove horizontal margins from card itself, handled by wrapper
                                    />
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Want to Read Section - Grid */}
                {wantToRead.length > 0 && (
                    <View className="mb-8">
                        <Text className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 px-6 mb-4">
                            Queue ({wantToRead.length})
                        </Text>
                        <View className="flex-row flex-wrap px-6 gap-x-4 gap-y-6">
                            {wantToRead.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </View>
                    </View>
                )}

                {/* Finished Section - Grid */}
                {finished.length > 0 && (
                    <View className="mb-10">
                        <Text className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 px-6 mb-4">
                            Archive ({finished.length})
                        </Text>
                        <View className="flex-row flex-wrap px-6 gap-x-4 gap-y-6">
                            {finished.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </View>
                    </View>
                )}

                <View style={{ height: insets.bottom + 100 }} />
            </ScrollView>
        </View>
    );
}
