import { useBookStore } from "@/store/useBookStore";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    BookOpen,
    ChevronLeft,
    Minus,
    Pause,
    Play,
    Plus
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useEffect, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DEFAULT_TIMER_MINUTES = 25;

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function SessionScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const book = useBookStore((state) => state.getBookById(id || ""));
    const updateProgress = useBookStore((state) => state.updateProgress);
    const addSession = useBookStore((state) => state.addSession);

    const [timerSeconds, setTimerSeconds] = useState(DEFAULT_TIMER_MINUTES * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [pageInput, setPageInput] = useState("");
    const [inputError, setInputError] = useState("");
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const sessionStartTimeRef = useRef<number | null>(null);

    // Calculate elapsed time from session start
    const getElapsedSeconds = (): number => {
        return sessionStartTimeRef.current
            ? Math.round((Date.now() - sessionStartTimeRef.current) / 1000)
            : 0;
    };

    // Monitor timer completion separate from the interval tick to avoid side-effects in setState
    useEffect(() => {
        if (timerSeconds === 0 && isRunning) {
            setIsRunning(false);
            if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setElapsedSeconds(getElapsedSeconds());
            setPageInput(book?.currentPage?.toString() || "0");
            setShowCompletionModal(true);
        }
    }, [timerSeconds, isRunning, book?.currentPage]);

    useEffect(() => {
        if (isRunning && timerSeconds > 0) {
            timerRef.current = setInterval(() => {
                setTimerSeconds((prev) => Math.max(0, prev - 1));
                setElapsedSeconds((prev) => prev + 1);
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRunning, timerSeconds]);

    if (!book) {
        return (
            <View className="flex-1 bg-white dark:bg-black items-center justify-center">
                <Text className="text-black dark:text-white text-lg font-bold">Book not found</Text>
            </View>
        );
    }

    const handleBack = () => {
        if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        // Save session if any time was spent reading
        if (elapsedSeconds > 0 && book) {
            addSession(book.id, {
                startedAt: sessionStartTimeRef.current || Date.now(),
                duration: elapsedSeconds,
                pagesRead: 0, // User can update page progress separately
            });
        }
        router.back();
    };

    const handlePlayPause = () => {
        if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (!isRunning && elapsedSeconds === 0) {
            // Starting fresh session
            sessionStartTimeRef.current = Date.now();
        }
        setIsRunning(!isRunning);
    };

    const handleAddMinute = () => {
        if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
        setTimerSeconds((prev) => prev + 60);
    };

    const handleSubtractMinute = () => {
        if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
        setTimerSeconds((prev) => Math.max(60, prev - 60));
    };

    const handleFinishSession = () => {
        if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setIsRunning(false);
        setElapsedSeconds(getElapsedSeconds());
        // Pre-fill with current page and show modal
        setPageInput(book?.currentPage?.toString() || "0");
        setShowCompletionModal(true);
    };

    const handleUpdateProgress = () => {
        if (!book) return;

        const newPage = parseInt(pageInput, 10);

        if (isNaN(newPage) || newPage < 0) {
            setInputError("Please enter a valid page number");
            if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        if (newPage > book.totalPages) {
            setInputError(`Page cannot exceed ${book.totalPages}`);
            if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        // Calculate pages read (minimum 0 to avoid negative values for backward navigation)
        const pagesRead = Math.max(0, newPage - book.currentPage);

        // Update progress in store with session data
        addSession(book.id, {
            startedAt: sessionStartTimeRef.current || Date.now(),
            duration: elapsedSeconds,
            pagesRead: pagesRead,
        });

        updateProgress(book.id, newPage);
        if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowCompletionModal(false);
        router.back();
    };

    return (
        <View
            className="flex-1 bg-white dark:bg-black"
            style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 z-20">
                {/* Back Button - Clean Circle */}
                <Pressable onPress={handleBack} className="active:scale-90">
                    <View className="w-12 h-12 rounded-full border border-black/10 dark:border-white/10 items-center justify-center bg-white dark:bg-black">
                        <ChevronLeft size={24} color={isDark ? "#ffffff" : "#000000"} />
                    </View>
                </Pressable>

                {/* Title Pill - Clean */}
                <View className="bg-neutral-100 dark:bg-neutral-900 px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-800">
                    <Text className="text-[10px] font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                        Reading Session
                    </Text>
                </View>

                {/* Done Pill - Clean */}
                <Pressable onPress={handleFinishSession} className="active:scale-95">
                    <View className="px-6 h-10 rounded-full border border-black/10 dark:border-white/10 items-center justify-center bg-white dark:bg-black">
                        <Text className="text-xs font-bold uppercase tracking-wide text-black dark:text-white">Done</Text>
                    </View>
                </Pressable>
            </View>

            {/* Content */}
            <View className="flex-1 items-center justify-center px-8">
                {/* Book Cover (Clean & Shadows) */}
                <View className="w-32 h-48 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-900 mb-16 opacity-80 border border-black/5 dark:border-white/5 shadow-xl shadow-black/20">
                    {book.coverUrl ? (
                        <Image
                            source={{ uri: book.coverUrl }}
                            style={{ width: "100%", height: "100%" }}
                            contentFit="cover"
                        />
                    ) : (
                        <View className="w-full h-full bg-neutral-200 dark:bg-neutral-800 items-center justify-center">
                            <BookOpen size={32} color={isDark ? "#525252" : "#a3a3a3"} />
                        </View>
                    )}
                </View>

                {/* Timer - Clean Type */}
                <View className="mb-20 items-center">
                    <Text
                        className="text-7xl font-bold text-black dark:text-white tracking-tight leading-none font-variant-numeric-tabular-nums"
                        style={{ fontFamily: 'Inter_700Bold' }}
                    >
                        {formatTime(timerSeconds)}
                    </Text>
                    {elapsedSeconds > 0 && (
                        <View className="mt-4 px-3 py-1 bg-neutral-100 dark:bg-neutral-900 rounded-full">
                            <Text className="text-neutral-500 font-bold text-xs tracking-wide uppercase">
                                {formatTime(elapsedSeconds)} Elapsed
                            </Text>
                        </View>
                    )}
                </View>

                {/* Controls - Clean Clean Circles */}
                <View className="flex-row items-center gap-10">
                    {/* Subtract Time */}
                    <Pressable
                        onPress={handleSubtractMinute}
                        className="w-16 h-16 bg-neutral-100 dark:bg-neutral-900 rounded-full items-center justify-center border border-neutral-200 dark:border-neutral-800 active:scale-90"
                    >
                        <Minus size={24} color={isDark ? "#737373" : "#525252"} strokeWidth={2.5} />
                    </Pressable>

                    {/* Play/Pause - Big Circle */}
                    <Pressable onPress={handlePlayPause} className="active:scale-95 shadow-xl shadow-black/20">
                        <View className="w-24 h-24 rounded-full border border-black/10 dark:border-white/10 items-center justify-center bg-black dark:bg-white">
                            {isRunning ? (
                                <Pause size={36} color={isDark ? "#000000" : "#ffffff"} fill={isDark ? "#000000" : "#ffffff"} />
                            ) : (
                                <Play size={36} color={isDark ? "#000000" : "#ffffff"} fill={isDark ? "#000000" : "#ffffff"} style={{ marginLeft: 4 }} />
                            )}
                        </View>
                    </Pressable>

                    {/* Add Time */}
                    <Pressable
                        onPress={handleAddMinute}
                        className="w-16 h-16 bg-neutral-100 dark:bg-neutral-900 rounded-full items-center justify-center border border-neutral-200 dark:border-neutral-800 active:scale-90"
                    >
                        <Plus size={24} color={isDark ? "#737373" : "#525252"} strokeWidth={2.5} />
                    </Pressable>
                </View>
            </View>

            {/* Footer Book Info */}
            <View className="items-center pb-8 opacity-40">
                <Text className="text-xs font-bold text-black dark:text-white uppercase tracking-wide" numberOfLines={1}>
                    {book.title}
                </Text>
            </View>

            {/* Session Complete Modal - Clean */}
            <Modal
                visible={showCompletionModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCompletionModal(false)}
            >
                <View className="flex-1 bg-black/60 justify-center items-center px-6">
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        className="w-full"
                    >
                        <View className="w-full bg-white dark:bg-neutral-900 rounded-3xl p-8 items-center shadow-xl border border-black/5 dark:border-white/10">

                            {/* Header */}
                            <View className="items-center mb-8">
                                <Text
                                    className="text-2xl font-bold text-black dark:text-white text-center mb-2"
                                    style={{ fontFamily: 'Inter_700Bold' }}
                                >
                                    Session Complete
                                </Text>
                                <Text className="text-neutral-600 dark:text-neutral-400 text-center font-medium">
                                    You read for <Text className="text-black dark:text-white font-bold">{Math.round(elapsedSeconds / 60)} minutes</Text>.
                                </Text>
                            </View>

                            {/* Page Input */}
                            <View className="mb-8 w-full">
                                <Text className="text-[10px] font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-4 text-center">
                                    Current Page
                                </Text>
                                <View className="flex-row items-center justify-center">
                                    <TextInput
                                        className="bg-neutral-100 dark:bg-black/50 border border-black/5 dark:border-white/10 rounded-2xl px-8 py-6 text-center text-4xl font-bold text-black dark:text-white w-full"
                                        style={{ fontFamily: 'Inter_700Bold' }}
                                        placeholder="0"
                                        placeholderTextColor={isDark ? "#525252" : "#a3a3a3"}
                                        keyboardType="number-pad"
                                        value={pageInput}
                                        onChangeText={(text) => {
                                            setPageInput(text);
                                            setInputError("");
                                        }}
                                        autoFocus
                                    />
                                </View>
                                <Text className="text-xs text-neutral-500 text-center mt-3 font-bold uppercase tracking-wide">
                                    / {book.totalPages} pages
                                </Text>
                                {inputError ? (
                                    <View className="bg-red-500/10 py-2 rounded-lg mt-3 border border-red-500/20">
                                        <Text className="text-xs text-red-500 text-center font-bold uppercase tracking-wide">
                                            {inputError}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>

                            {/* Actions */}
                            <View className="gap-4 w-full">
                                <Pressable
                                    onPress={handleUpdateProgress}
                                    className="active:scale-[0.98]"
                                >
                                    <View className="w-full h-14 rounded-full bg-black dark:bg-white items-center justify-center shadow-lg shadow-black/20">
                                        <Text className="text-sm font-bold text-white dark:text-black uppercase tracking-wide">
                                            Update Progress
                                        </Text>
                                    </View>
                                </Pressable>

                                <Pressable
                                    onPress={() => {
                                        setShowCompletionModal(false);
                                        router.back();
                                    }}
                                    className="py-4 items-center justify-center active:opacity-70"
                                >
                                    <Text className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                                        Discard Session
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}
