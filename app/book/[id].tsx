<<<<<<< HEAD
import { GlassCard } from "@/components/ui/GlassCard";
=======
import { BookImmersiveLayout } from "@/components/BookImmersiveLayout";
>>>>>>> 8bd8634b81be9b801a5c6b6165f81fd79095edac
import { useBookStore } from "@/store/useBookStore";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
<<<<<<< HEAD
import { ChevronLeft, Play, Trash2 } from "lucide-react-native";
=======
import { Play, Settings, Trash2 } from "lucide-react-native";
>>>>>>> 8bd8634b81be9b801a5c6b6165f81fd79095edac
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

export default function BookDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const book = useBookStore((state) => state.getBookById(id || ""));
    const updateStatus = useBookStore((state) => state.updateStatus);
    const deleteBook = useBookStore((state) => state.deleteBook);

    const [showStatusOptions, setShowStatusOptions] = useState(false);

    if (!book) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <Text className="text-white text-lg font-bold">Book not found</Text>
            </View>
        );
    }

    const progress = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0;
    const pagesLeft = book.totalPages - book.currentPage;

<<<<<<< HEAD
    // Format session date
    const formatSessionDate = (dateInput: number | string): string => {
        try {
            const date = new Date(dateInput);
            if (isNaN(date.getTime())) return "Unknown Date";
            return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
        } catch {
            return "Unknown Date";
        }
=======
    const formatSessionDate = (isoDate: string): string => {
        const date = new Date(isoDate);
        return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
>>>>>>> 8bd8634b81be9b801a5c6b6165f81fd79095edac
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.round(seconds / 60);
        return `${mins} min${mins !== 1 ? 's' : ''}`;
    };

    const sortedSessions = [...(book.sessions || [])].sort(
        (a, b) => b.startedAt - a.startedAt
    );

    const handleBack = () => {
        if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    const handleStartReading = () => {
        if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (book.status !== "reading") {
            updateStatus(book.id, "reading");
        }
        router.push(`/session/${book.id}`);
    };

    const handleEditStatus = () => {
        if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
        setShowStatusOptions(!showStatusOptions);
    };

    const handleSetStatus = (status: "want-to-read" | "reading" | "finished") => {
        if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        updateStatus(book.id, status);
        setShowStatusOptions(false);
    };

    const handleDelete = () => {
        if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
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
<<<<<<< HEAD
        <View className="flex-1 bg-black relative">

            {/* --- LAYER 1: Z-INDEX 0 (Centered Background Image) --- */}
            <View className="absolute inset-0 items-center justify-center z-0 bg-black">
                {/* Darkened background to make image pop less but look elegant */}
                <View className="absolute inset-0 bg-neutral-900" />

                {book.coverUrl ? (
                    <Image
                        source={{ uri: book.coverUrl }}
                        style={{ width: SCREEN_WIDTH * 1, height: SCREEN_WIDTH * 2, borderRadius: 0, opacity: 0.9 }}
                        contentFit="cover"
                        transition={500}
                    />
                ) : (
                    <View style={{ width: SCREEN_WIDTH * 0.75, height: SCREEN_WIDTH * 1.15, borderRadius: 12 }} className="bg-neutral-800 items-center justify-center">
                        <Text className="text-neutral-600 font-bold">No Cover</Text>
                    </View>
                )}
                {/* Overlay to dim it slightly for text on top if needed, though Layer 2 handles content bg */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={{ position: 'absolute', inset: 0 }}
                />
            </View>


            {/* --- LAYER 2: Z-INDEX 10 (Scrollable Content) --- */}
            {/* ScrollView covers entire screen but has transparent top padding to show image */}
            <ScrollView
                className="flex-1 z-10"
                contentContainerStyle={{
                    paddingTop: SCREEN_HEIGHT * 0.55, // Push content down to reveal centered image initially

                }}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
            >
                {/* Content Wrapper - Black background effectively "slides up" over the image */}
                <View className="bg-black/90 px-6 pt-10 pb-20 rounded-t-[40px] min-h-screen border-t border-white/10 shadow-2xl shadow-black">
                    {/* Status Badge */}
                    <View className="bg-white/10 self-start px-3 py-1 mb-6 border border-white/10 rounded-full">
                        <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                            {book.status.replace(/-/g, " ")}
                        </Text>
                    </View>

                    {/* Title */}
                    <Text
                        className="text-4xl font-black text-white mb-2 leading-tight tracking-tighter"
                        style={{ fontFamily: 'Inter_900Black' }}
                    >
                        {book.title}
                    </Text>

                    {/* Author */}
                    <Text className="text-lg font-medium text-neutral-400 mb-10 tracking-wide">
                        {book.author}
                    </Text>

                    {/* Stats Grid */}
                    <View className="flex-row gap-8 mb-12 border-t border-neutral-800 pt-8">
                        <View>
                            <Text className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                                Progress
                            </Text>
                            <Text className="text-4xl font-black text-white tracking-tighter" style={{ fontFamily: 'Inter_900Black' }}>
                                {Math.round(progress)}%
                            </Text>
                        </View>
                        <View>
                            <Text className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                                Remaining
                            </Text>
                            <Text className="text-4xl font-black text-white tracking-tighter" style={{ fontFamily: 'Inter_900Black' }}>
                                {pagesLeft} <Text className="text-lg text-neutral-600 font-bold">pgs</Text>
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="gap-4 mb-12">
                        {/* Secondary Action - Flat/Outline */}
                        <Pressable
                            onPress={handleEditStatus}
                            className="bg-neutral-900 h-[60px] items-center justify-center active:scale-[0.99] border border-neutral-800 rounded-xl"
                        >
                            <Text className="text-neutral-400 text-sm font-bold uppercase tracking-wider">
                                {showStatusOptions ? "Close Options" : "Update Status"}
                            </Text>
                        </Pressable>

                        {/* Expandable Status Options */}
                        {showStatusOptions && (
                            <View className="flex-row gap-2 mt-2">
                                <Pressable
                                    onPress={() => handleSetStatus("want-to-read")}
                                    className={`flex-1 py-4 items-center border rounded-lg ${book.status === "want-to-read" ? "bg-white border-white" : "bg-neutral-900 border-neutral-800"}`}
                                >
                                    <Text className={`text-[10px] font-bold uppercase tracking-wider ${book.status === "want-to-read" ? "text-black" : "text-neutral-500"}`}>
                                        Queue
                                    </Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => handleSetStatus("reading")}
                                    className={`flex-1 py-4 items-center border rounded-lg ${book.status === "reading" ? "bg-white border-white" : "bg-neutral-900 border-neutral-800"}`}
                                >
                                    <Text className={`text-[10px] font-bold uppercase tracking-wider ${book.status === "reading" ? "text-black" : "text-neutral-500"}`}>
                                        Reading
                                    </Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => handleSetStatus("finished")}
                                    className={`flex-1 py-4 items-center border rounded-lg ${book.status === "finished" ? "bg-white border-white" : "bg-neutral-900 border-neutral-800"}`}
                                >
                                    <Text className={`text-[10px] font-bold uppercase tracking-wider ${book.status === "finished" ? "text-black" : "text-neutral-500"}`}>
                                        Done
                                    </Text>
                                </Pressable>
                            </View>
                        )}
                    </View>

                    {/* Reading History */}
                    <View className="mb-12">
                        <Text className="text-white text-xl font-bold tracking-tight mb-6">
                            Recent History
                        </Text>
                        {sortedSessions.length > 0 ? (
                            <View className="border-t border-neutral-900">
                                {sortedSessions.slice(0, 5).map((session) => (
                                    <View
                                        key={session.id}
                                        className="py-5 flex-row justify-between items-center border-b border-neutral-900"
                                    >
                                        <View>
                                            <Text className="text-white font-bold text-base mb-1">
                                                {formatSessionDate(session.startedAt)}
                                            </Text>
                                            <Text className="text-neutral-500 text-xs font-medium uppercase tracking-wide">
                                                {session.pagesRead} pages read
                                            </Text>
                                        </View>
                                        <View className="bg-neutral-900 px-3 py-1.5 rounded-sm">
                                            <Text className="text-neutral-300 text-xs font-bold font-mono">
                                                {formatDuration(session.duration)}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View className="bg-neutral-900 py-8 items-center justify-center border border-neutral-800 border-dashed rounded-xl">
                                <Text className="text-neutral-500 text-xs uppercase tracking-wide">
                                    No sessions recorded yet
                                </Text>
                            </View>
                        )}
                    </View>

                    <Pressable
                        onPress={handleDelete}
                        className="flex-row items-center justify-center gap-2 py-4 opacity-50 active:opacity-100"
                    >
                        <Trash2 size={14} color="#525252" />
                        <Text className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                            Remove Book
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>


            {/* --- LAYER 3: Z-INDEX 20 (Floating Glass Elements & Gradients) --- */}

            {/* Header Blur Gradient */}
            <LinearGradient
                colors={['rgba(0,0,0,1)', 'transparent']} // Stronger black at top
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 120, // Taller fade
                    zIndex: 20
                }}
                pointerEvents="none"
            />

            {/* Floating Back Button */}
            <View
                className="absolute z-30"
                style={{ top: insets.top + 10, left: 20 }}
            >
                <Pressable
                    onPress={handleBack}
                    className="active:scale-90"
                >
                    <GlassCard
                        intensity={23}
                        className="w-12 h-12 rounded-full border-white/20"
                        contentClassName="items-center justify-center h-full w-full"
                    >
                        <ChevronLeft size={24} color="#ffffff" />
                    </GlassCard>
                </Pressable>
            </View>

            {/* Footer Blur Gradient */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,1)']}
                locations={[0, 0.6]}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 140,
                    zIndex: 20
                }}
                pointerEvents="none"
            />

            {/* Floating Glass Pill - Start Reading */}
            {/* Centered at bottom or sticky? User said "glass pills floating element". Typically strictly bottom for thumb access. */}
            <View className="absolute bottom-10 left-0 right-0 items-center z-30">
                <Pressable onPress={handleStartReading} className="active:scale-[0.98] transition-transform shadow-2xl shadow-black">
                    <GlassCard
                        intensity={23}
                        className="w-[280px] h-[72px] rounded-full border-white/20 overflow-hidden"
                        contentClassName="flex-row items-center justify-center gap-3 h-full w-full"
                    >
                        <Play size={24} color="#ffffff" fill="#ffffff" />
                        <Text className="text-white text-lg font-bold uppercase tracking-wide">
                            Start Session
                        </Text>
                    </GlassCard>
                </Pressable>
            </View>

        </View>
=======
        <BookImmersiveLayout
            coverUrl={book.coverUrl}
            title={book.title}
            author={book.author}
            statsContent={
                <>
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
                </>
            }
        >
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

            <Pressable
                onPress={handleStartReading}
                className="bg-neutral-900 py-4 rounded-2xl flex-row items-center justify-center gap-3 active:scale-[0.98] shadow-lg shadow-black/20 mb-3"
            >
                <Play size={22} color="#ffffff" fill="#ffffff" />
                <Text className="text-lg font-bold text-white">
                    Start Reading Session
                </Text>
            </Pressable>

            <Pressable
                onPress={handleEditStatus}
                className="bg-neutral-100 py-4 rounded-2xl flex-row items-center justify-center gap-3 active:scale-[0.98] mb-4"
            >
                <Settings size={20} color="#525252" />
                <Text className="text-base font-semibold text-neutral-600">
                    Edit Status
                </Text>
            </Pressable>

            <Pressable
                onPress={handleDelete}
                className="flex-row items-center justify-center gap-2 py-2 active:opacity-70"
            >
                <Trash2 size={16} color="#ef4444" />
                <Text className="text-sm font-medium text-red-500">
                    Delete Book
                </Text>
            </Pressable>
        </BookImmersiveLayout>
>>>>>>> 8bd8634b81be9b801a5c6b6165f81fd79095edac
    );
}
