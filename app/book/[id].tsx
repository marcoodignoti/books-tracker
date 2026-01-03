import { useBookStore } from "@/store/useBookStore";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Play, Settings, Trash2 } from "lucide-react-native";
import { useState } from "react";
import {
    Alert,
    Dimensions,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
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

    const [showStatusOptions, setShowStatusOptions] = useState(false);

    if (!book) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <Text className="text-white text-lg">Book not found</Text>
            </View>
        );
    }

    const progress = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0;
    const pagesLeft = book.totalPages - book.currentPage;

    // Format session date for display (e.g., "Jan 02")
    const formatSessionDate = (isoDate: string): string => {
        const date = new Date(isoDate);
        return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    };

    // Format session duration in minutes
    const formatDuration = (seconds: number): string => {
        const mins = Math.round(seconds / 60);
        return `${mins} min${mins !== 1 ? 's' : ''}`;
    };

    // Get sessions sorted by date (most recent first)
    const sortedSessions = [...(book.sessions || [])].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    const handleStartReading = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (book.status !== "reading") {
            updateStatus(book.id, "reading");
        }
        router.push(`/session/${book.id}`);
    };

    const handleEditStatus = () => {
        Haptics.selectionAsync();
        setShowStatusOptions(!showStatusOptions);
    };

    const handleSetStatus = (status: "want-to-read" | "reading" | "finished") => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        updateStatus(book.id, status);
        setShowStatusOptions(false);
    };

    const handleDelete = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Alert.alert(
            "Delete Book",
            `Are you sure you want to remove "${book.title}" from your library?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteBook(book.id);
                        router.back();
                    },
                },
            ]
        );
    };

    return (
        <View className="flex-1 bg-black">
            {/* Background Cover Image */}
            <View className="absolute top-0 left-0 right-0" style={{ height: COVER_HEIGHT }}>
                {book.coverUrl ? (
                    <Image
                        source={{ uri: book.coverUrl }}
                        style={{ width: SCREEN_WIDTH, height: COVER_HEIGHT }}
                        contentFit="cover"
                    />
                ) : (
                    // Dark abstract gradient fallback for missing covers
                    <LinearGradient
                        colors={["#374151", "#1f2937", "#111827"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ width: SCREEN_WIDTH, height: COVER_HEIGHT }}
                    />
                )}
                {/* Gradient overlay: transparent to black */}
                <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.9)", "#000000"]}
                    locations={[0, 0.4, 0.7, 1]}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                />
            </View>

            {/* Floating Back Button with Blur */}
            <View
                className="absolute z-10"
                style={{ top: insets.top + 8, left: 16 }}
            >
                <Pressable
                    onPress={handleBack}
                    className="overflow-hidden rounded-full active:scale-90"
                >
                    <BlurView
                        intensity={50}
                        tint="dark"
                        className="w-11 h-11 items-center justify-center"
                    >
                        <ChevronLeft size={24} color="#ffffff" />
                    </BlurView>
                </Pressable>
            </View>

            {/* Content Over Gradient */}
            <View className="flex-1 justify-end">
                {/* Book Info Section */}
                <View className="px-6 pb-6">
                    {/* Title */}
                    <Text className="text-4xl font-bold text-white mb-2" numberOfLines={3}>
                        {book.title}
                    </Text>
                    
                    {/* Author */}
                    <Text className="text-sm font-semibold uppercase tracking-widest text-neutral-400 mb-6">
                        {book.author}
                    </Text>

                    {/* Stats Row */}
                    <View className="flex-row items-center gap-4 mb-6">
                        <View className="bg-white/10 px-4 py-2 rounded-full">
                            <Text className="text-base font-semibold text-white">
                                {Math.round(progress)}% Complete
                            </Text>
                        </View>
                        <View className="bg-white/10 px-4 py-2 rounded-full">
                            <Text className="text-base font-semibold text-white">
                                {pagesLeft} Pages Left
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Sheet Style White Container */}
                <View className="bg-white rounded-t-[32px] px-6 pt-6" style={{ paddingBottom: insets.bottom + 16, maxHeight: SCREEN_HEIGHT * 0.55 }}>
                    <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                        {/* Status Options (when expanded) */}
                        {showStatusOptions && (
                            <View className="mb-4">
                                <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
                                    Set Status
                                </Text>
                                <View className="flex-row gap-2">
                                    <Pressable
                                        onPress={() => handleSetStatus("want-to-read")}
                                        className={`flex-1 py-3 rounded-xl items-center ${book.status === "want-to-read" ? "bg-neutral-900" : "bg-neutral-100"} active:scale-95`}
                                    >
                                        <Text className={`text-sm font-semibold ${book.status === "want-to-read" ? "text-white" : "text-neutral-700"}`}>
                                            Want to Read
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => handleSetStatus("reading")}
                                        className={`flex-1 py-3 rounded-xl items-center ${book.status === "reading" ? "bg-neutral-900" : "bg-neutral-100"} active:scale-95`}
                                    >
                                        <Text className={`text-sm font-semibold ${book.status === "reading" ? "text-white" : "text-neutral-700"}`}>
                                            Reading
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => handleSetStatus("finished")}
                                        className={`flex-1 py-3 rounded-xl items-center ${book.status === "finished" ? "bg-neutral-900" : "bg-neutral-100"} active:scale-95`}
                                    >
                                        <Text className={`text-sm font-semibold ${book.status === "finished" ? "text-white" : "text-neutral-700"}`}>
                                            Finished
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}

                        {/* Reading History Section */}
                        <View className="mb-4">
                            <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
                                Reading History
                            </Text>
                            {sortedSessions.length > 0 ? (
                                <View>
                                    {sortedSessions.slice(0, 5).map((session, index) => (
                                        <View
                                            key={session.id}
                                            className={`py-3 ${index < Math.min(sortedSessions.length, 5) - 1 ? 'border-b border-neutral-100' : ''}`}
                                        >
                                            <Text className="text-sm text-neutral-600">
                                                {formatSessionDate(session.date)} • {formatDuration(session.durationSeconds)} • Page {session.startPage} → {session.endPage}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text className="text-sm text-neutral-400 py-3">
                                    No sessions yet. Start reading!
                                </Text>
                            )}
                        </View>

                        {/* Primary Action - Start Reading Session */}
                        <Pressable
                            onPress={handleStartReading}
                            className="bg-neutral-900 py-4 rounded-2xl flex-row items-center justify-center gap-3 active:scale-[0.98] shadow-lg shadow-black/20 mb-3"
                        >
                            <Play size={22} color="#ffffff" fill="#ffffff" />
                            <Text className="text-lg font-bold text-white">
                                Start Reading Session
                            </Text>
                        </Pressable>

                        {/* Secondary Action - Edit Status */}
                        <Pressable
                            onPress={handleEditStatus}
                            className="bg-neutral-100 py-4 rounded-2xl flex-row items-center justify-center gap-3 active:scale-[0.98] mb-4"
                        >
                            <Settings size={20} color="#525252" />
                            <Text className="text-base font-semibold text-neutral-600">
                                Edit Status
                            </Text>
                        </Pressable>

                        {/* Delete Book */}
                        <Pressable
                            onPress={handleDelete}
                            className="flex-row items-center justify-center gap-2 py-2 active:opacity-70"
                        >
                            <Trash2 size={16} color="#ef4444" />
                            <Text className="text-sm font-medium text-red-500">
                                Delete Book
                            </Text>
                        </Pressable>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}
