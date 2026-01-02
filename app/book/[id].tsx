import { useBookStore } from "@/store/useBookStore";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BookOpen, ChevronLeft, Play, RefreshCw, Trash2 } from "lucide-react-native";
import { Dimensions, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const COVER_HEIGHT = SCREEN_HEIGHT * 0.6;

export default function BookDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const book = useBookStore((state) => state.getBookById(id || ""));
    const updateStatus = useBookStore((state) => state.updateStatus);
    const deleteBook = useBookStore((state) => state.deleteBook);

    if (!book) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <Text className="text-white text-lg">Book not found</Text>
            </View>
        );
    }

    const progress = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0;
    const pagesLeft = book.totalPages - book.currentPage;

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    const handleStartReading = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        updateStatus(book.id, "reading");
        router.push(`/session/${book.id}`);
    };

    const handleEditStatus = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // Toggle between statuses
        if (book.status === "finished") {
            updateStatus(book.id, "reading");
        } else {
            updateStatus(book.id, "finished");
        }
    };

    const handleDelete = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        deleteBook(book.id);
        router.back();
    };

    return (
        <View className="flex-1 bg-black">
            {/* Background Cover Image - Top 60% */}
            <View className="absolute top-0 left-0 right-0" style={{ height: COVER_HEIGHT }}>
                {book.coverUrl ? (
                    <Image
                        source={{ uri: book.coverUrl }}
                        style={{ width: SCREEN_WIDTH, height: COVER_HEIGHT }}
                        contentFit="cover"
                    />
                ) : (
                    <LinearGradient
                        colors={["#374151", "#111827", "#000000"]}
                        locations={[0, 0.5, 1]}
                        style={{ width: SCREEN_WIDTH, height: COVER_HEIGHT }}
                    />
                )}
                {/* Gradient overlay from transparent (middle) to black (bottom) */}
                <LinearGradient
                    colors={["transparent", "transparent", "rgba(0,0,0,0.8)", "#000000"]}
                    locations={[0, 0.3, 0.7, 1]}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                />
            </View>

            {/* Back Button - Floating with blur */}
            <View
                className="absolute z-10"
                style={{ top: insets.top + 8, left: 16 }}
            >
                <Pressable
                    onPress={handleBack}
                    className="overflow-hidden rounded-full active:scale-90"
                >
                    <BlurView
                        intensity={60}
                        tint="dark"
                        className="w-11 h-11 items-center justify-center"
                    >
                        <ChevronLeft size={24} color="#ffffff" />
                    </BlurView>
                </Pressable>
            </View>

            {/* Content over the gradient */}
            <View className="flex-1 justify-end">
                {/* Book Info - Over the gradient */}
                <View className="px-6 mb-4">
                    <Text className="text-4xl font-bold text-white mb-2">
                        {book.title}
                    </Text>
                    <Text className="text-sm font-semibold uppercase tracking-widest text-neutral-400 mb-6">
                        {book.author}
                    </Text>

                    {/* Stats Row */}
                    <View className="flex-row items-center mb-6">
                        <Text className="text-base font-semibold text-white">
                            {progress}% Complete
                        </Text>
                        <View className="w-1 h-1 bg-neutral-500 rounded-full mx-3" />
                        <Text className="text-base font-semibold text-neutral-400">
                            {pagesLeft} Pages Left
                        </Text>
                    </View>
                </View>

                {/* Bottom Sheet Style White Container */}
                <View className="bg-white rounded-t-3xl px-6 pt-6" style={{ paddingBottom: insets.bottom + 16 }}>
                    {/* Start Reading Session - Primary Black Button */}
                    <Pressable
                        onPress={handleStartReading}
                        className="bg-neutral-900 py-4 rounded-2xl flex-row items-center justify-center gap-3 active:scale-[0.98] shadow-xl shadow-black/20 mb-3"
                    >
                        <Play size={22} color="#ffffff" fill="#ffffff" />
                        <Text className="text-lg font-bold text-white">
                            Start Reading Session
                        </Text>
                    </Pressable>

                    {/* Edit Status - Secondary Gray Button */}
                    <Pressable
                        onPress={handleEditStatus}
                        className="bg-neutral-100 py-4 rounded-2xl flex-row items-center justify-center gap-3 active:scale-95 mb-4"
                    >
                        <RefreshCw size={20} color="#525252" />
                        <Text className="text-base font-semibold text-neutral-600">
                            {book.status === "finished" ? "Mark as Reading" : "Mark as Finished"}
                        </Text>
                    </Pressable>

                    {/* Delete Book - Small red text */}
                    <Pressable
                        onPress={handleDelete}
                        className="flex-row items-center justify-center gap-2 py-2 active:opacity-60"
                    >
                        <Trash2 size={16} color="#ef4444" />
                        <Text className="text-sm font-medium text-red-500">
                            Delete Book
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}
