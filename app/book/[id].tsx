import { useBookStore } from "@/store/useBookStore";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BookOpen, ChevronLeft, Play, Trash2 } from "lucide-react-native";
import { useState } from "react";
import {
    Dimensions,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function BookDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const book = useBookStore((state) => state.getBookById(id || ""));
    const updateProgress = useBookStore((state) => state.updateProgress);
    const updateStatus = useBookStore((state) => state.updateStatus);
    const deleteBook = useBookStore((state) => state.deleteBook);

    const [showPageInput, setShowPageInput] = useState(false);
    const [pageInput, setPageInput] = useState("");

    if (!book) {
        return (
            <View className="flex-1 bg-neutral-900 items-center justify-center">
                <Text className="text-white text-lg">Book not found</Text>
            </View>
        );
    }

    const progress = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0;

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    const handleStartReading = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        updateStatus(book.id, "reading");
        router.push(`/session/${book.id}`);
    };

    const handleUpdatePage = () => {
        const newPage = parseInt(pageInput, 10);
        if (!isNaN(newPage) && newPage >= 0 && newPage <= book.totalPages) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            updateProgress(book.id, newPage);
            setShowPageInput(false);
            setPageInput("");
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const handleDelete = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        deleteBook(book.id);
        router.back();
    };

    return (
        <View className="flex-1 bg-neutral-900">
            {/* Background Cover */}
            <View className="absolute inset-0">
                {book.coverUrl ? (
                    <Image
                        source={{ uri: book.coverUrl }}
                        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
                        contentFit="cover"
                        blurRadius={20}
                    />
                ) : (
                    <View className="w-full h-full bg-neutral-800" />
                )}
                <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.95)"]}
                    locations={[0, 0.4, 1]}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                />
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom + 20,
                }}
            >
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-4">
                    <Pressable
                        onPress={handleBack}
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center active:scale-90"
                    >
                        <ChevronLeft size={24} color="#ffffff" />
                    </Pressable>
                    <Pressable
                        onPress={handleDelete}
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center active:scale-90"
                    >
                        <Trash2 size={20} color="#ef4444" />
                    </Pressable>
                </View>

                {/* Cover */}
                <View className="items-center mt-8 mb-8">
                    <View className="w-48 h-72 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
                        {book.coverUrl ? (
                            <Image
                                source={{ uri: book.coverUrl }}
                                style={{ width: "100%", height: "100%" }}
                                contentFit="cover"
                            />
                        ) : (
                            <View className="w-full h-full bg-neutral-700 items-center justify-center">
                                <BookOpen size={48} color="#a3a3a3" />
                            </View>
                        )}
                    </View>
                </View>

                {/* Book Info */}
                <View className="px-6">
                    <Text className="text-3xl font-bold text-white text-center mb-2">
                        {book.title}
                    </Text>
                    <Text className="text-lg text-white/70 text-center mb-8">
                        {book.author}
                    </Text>

                    {/* Progress */}
                    <View className="bg-white/10 rounded-2xl p-4 mb-6">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-xs font-bold uppercase tracking-widest text-white/50">
                                Progress
                            </Text>
                            <Text className="text-sm font-semibold text-white">
                                {Math.round(progress)}%
                            </Text>
                        </View>
                        <View className="h-3 bg-white/20 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-white rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </View>
                        <Text className="text-sm text-white/50 text-center mt-2">
                            {book.currentPage} of {book.totalPages} pages
                        </Text>
                    </View>

                    {/* Update Page */}
                    {showPageInput ? (
                        <View className="bg-white/10 rounded-2xl p-4 mb-4">
                            <Text className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
                                Update Current Page
                            </Text>
                            <View className="flex-row items-center">
                                <TextInput
                                    className="flex-1 bg-white/20 rounded-xl px-4 py-3 text-white text-base"
                                    placeholder={`0 - ${book.totalPages}`}
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    keyboardType="number-pad"
                                    value={pageInput}
                                    onChangeText={setPageInput}
                                    autoFocus
                                />
                                <Pressable
                                    onPress={handleUpdatePage}
                                    className="ml-3 bg-white px-6 py-3 rounded-xl active:scale-95"
                                >
                                    <Text className="font-semibold text-neutral-900">Save</Text>
                                </Pressable>
                            </View>
                        </View>
                    ) : (
                        <Pressable
                            onPress={() => {
                                Haptics.selectionAsync();
                                setShowPageInput(true);
                            }}
                            className="bg-white/10 rounded-2xl p-4 mb-4 active:bg-white/15"
                        >
                            <Text className="text-base font-semibold text-white text-center">
                                Update Page Number
                            </Text>
                        </Pressable>
                    )}

                    {/* Start Session Button */}
                    <Pressable
                        onPress={handleStartReading}
                        className="bg-white rounded-2xl py-4 flex-row items-center justify-center gap-3 active:scale-[0.98] shadow-xl shadow-black/30"
                    >
                        <Play size={24} color="#171717" fill="#171717" />
                        <Text className="text-lg font-bold text-neutral-900">
                            Start Reading Session
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}
