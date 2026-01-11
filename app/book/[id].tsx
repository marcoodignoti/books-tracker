import { useBookStore } from "@/store/useBookStore";
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
    View
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
    const updateBook = useBookStore((state) => state.updateBook);
    const deleteBook = useBookStore((state) => state.deleteBook);
    const addNote = useBookStore((state) => state.addNote);
    const deleteNote = useBookStore((state) => state.deleteNote);

    const [showStatusOptions, setShowStatusOptions] = useState(false);
    // Modal states for edit/notes would go here (omitted for brevity in styling pass, assuming components exist or simple alerts for now)
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editAuthor, setEditAuthor] = useState("");
    const [editPages, setEditPages] = useState("");


    if (!book) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <Text className="text-white text-lg font-bold">Book not found</Text>
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
                        colors={["#171717", "#000000"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={{ width: SCREEN_WIDTH, height: COVER_HEIGHT }}
                    />
                )}
                {/* Gradient overlay: transparent to black */}
                <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.5)", "#000000"]}
                    locations={[0, 0.6, 1]}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                />
            </View>

            {/* Floating Back Button */}
            <View
                className="absolute z-10"
                style={{ top: insets.top + 8, left: 16 }}
            >
                <Pressable
                    onPress={handleBack}
                    className="w-12 h-12 bg-white/10 rounded-full items-center justify-center active:scale-90 border border-white/20"
                >
                    <ChevronLeft size={24} color="#ffffff" />
                </Pressable>
            </View>

            {/* Content Over Gradient */}
            <View className="flex-1 justify-end">
                {/* Book Info Section */}
                <View className="px-6 pb-8">
                    {/* Status Badge */}
                    <View className="bg-red-600 self-start px-3 py-1 rounded-sm mb-4">
                        <Text className="text-white text-xs font-bold uppercase tracking-widest">
                            {book.status.replace(/-/g, " ")}
                        </Text>
                    </View>

                    {/* Title */}
                    <Text
                        className="text-5xl font-black text-white mb-2 leading-tight tracking-tighter"
                        numberOfLines={3}
                        style={{ fontFamily: 'Inter_900Black' }}
                    >
                        {book.title}
                    </Text>

                    {/* Author */}
                    <Text className="text-lg font-medium text-neutral-400 mb-8 tracking-wide">
                        {book.author}
                    </Text>

                    {/* Stats Row */}
                    <View className="flex-row items-center gap-4 mb-4">
                        <View className="flex-1 bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
                            <Text className="text-xs text-neutral-500 font-bold uppercase tracking-widest mb-1">
                                Progress
                            </Text>
                            <Text className="text-xl font-bold text-white tracking-tight">
                                {Math.round(progress)}%
                            </Text>
                        </View>
                        <View className="flex-1 bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
                            <Text className="text-xs text-neutral-500 font-bold uppercase tracking-widest mb-1">
                                Left
                            </Text>
                            <Text className="text-xl font-bold text-white tracking-tight">
                                {pagesLeft} pgs
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Sheet Style Scrollable Container */}
                <View className="bg-neutral-900 rounded-t-[32px] px-6 pt-8 border-t border-neutral-800" style={{ paddingBottom: insets.bottom + 16, maxHeight: SCREEN_HEIGHT * 0.55 }}>
                    <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                        {/* Status Options (when expanded) */}
                        {showStatusOptions && (
                            <View className="mb-8">
                                <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
                                    Change Status
                                </Text>
                                <View className="flex-row gap-2">
                                    <Pressable
                                        onPress={() => handleSetStatus("want-to-read")}
                                        className={`flex-1 py-4 rounded-xl items-center border ${book.status === "want-to-read" ? "bg-white border-white" : "bg-transparent border-neutral-700"} active:scale-95`}
                                    >
                                        <Text className={`text-xs font-bold uppercase tracking-wider ${book.status === "want-to-read" ? "text-black" : "text-neutral-400"}`}>
                                            Queue
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => handleSetStatus("reading")}
                                        className={`flex-1 py-4 rounded-xl items-center border ${book.status === "reading" ? "bg-white border-white" : "bg-transparent border-neutral-700"} active:scale-95`}
                                    >
                                        <Text className={`text-xs font-bold uppercase tracking-wider ${book.status === "reading" ? "text-black" : "text-neutral-400"}`}>
                                            Reading
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => handleSetStatus("finished")}
                                        className={`flex-1 py-4 rounded-xl items-center border ${book.status === "finished" ? "bg-white border-white" : "bg-transparent border-neutral-700"} active:scale-95`}
                                    >
                                        <Text className={`text-xs font-bold uppercase tracking-wider ${book.status === "finished" ? "text-black" : "text-neutral-400"}`}>
                                            Done
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}

                        {/* Reading History Section */}
                        <View className="mb-6">
                            <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
                                Recent Sessions
                            </Text>
                            {sortedSessions.length > 0 ? (
                                <View>
                                    {sortedSessions.slice(0, 5).map((session, index) => (
                                        <View
                                            key={session.id}
                                            className={`py-4 flex-row justify-between items-center ${index < Math.min(sortedSessions.length, 5) - 1 ? 'border-b border-neutral-800' : ''}`}
                                        >
                                            <View>
                                                <Text className="text-white font-bold text-sm mb-1">
                                                    {formatSessionDate(session.date)}
                                                </Text>
                                                <Text className="text-neutral-500 text-xs">
                                                    Page {session.startPage} → {session.endPage}
                                                </Text>
                                            </View>
                                            <View className="bg-neutral-800 px-3 py-1 rounded-full">
                                                <Text className="text-white text-xs font-semibold">
                                                    {formatDuration(session.durationSeconds)}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View className="bg-neutral-800 p-4 rounded-xl">
                                    <Text className="text-neutral-400 text-sm text-center">
                                        No reading sessions recorded yet.
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Primary Action - Start Reading Session */}
                        <Pressable
                            onPress={handleStartReading}
                            className="bg-white py-5 rounded-full flex-row items-center justify-center gap-3 active:scale-[0.98] mb-3"
                        >
                            <Play size={22} color="#000000" fill="#000000" />
                            <Text className="text-lg font-black text-black uppercase tracking-wide">
                                Start Session
                            </Text>
                        </Pressable>

                        {/* Secondary Action - Edit Status */}
                        <Pressable
                            onPress={handleEditStatus}
                            className="bg-neutral-800 py-5 rounded-full flex-row items-center justify-center gap-3 active:scale-[0.98] mb-8 border border-neutral-700"
                        >
                            <Settings size={20} color="#a3a3a3" />
                            <Text className="text-base font-bold text-neutral-300 uppercase tracking-wide">
                                Options
                            </Text>
                        </Pressable>

                        {/* Delete Book Action (Minimal) */}
                        <Pressable
                            onPress={handleDelete}
                            className="flex-row items-center justify-center gap-2 py-4 mb-8"
                        >
                            <Trash2 size={16} color="#404040" />
                            <Text className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                                Remove from Library
                            </Text>
                        </Pressable>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}
