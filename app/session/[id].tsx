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
    Plus,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
    Dimensions,
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

    const book = useBookStore((state) => state.getBookById(id || ""));
    const updateProgress = useBookStore((state) => state.updateProgress);

    const [timerSeconds, setTimerSeconds] = useState(DEFAULT_TIMER_MINUTES * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [pageInput, setPageInput] = useState("");
    const [inputError, setInputError] = useState("");
    const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const sessionStartTimeRef = useRef<number | null>(null);

    // Calculate elapsed time from session start
    const getElapsedSeconds = (): number => {
        return sessionStartTimeRef.current 
            ? Math.round((Date.now() - sessionStartTimeRef.current) / 1000)
            : 0;
    };

    useEffect(() => {
        if (isRunning && timerSeconds > 0) {
            timerRef.current = setInterval(() => {
                setTimerSeconds((prev) => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        setSessionElapsedSeconds(getElapsedSeconds());
                        // Show completion modal when timer reaches 0
                        setPageInput(book?.currentPage?.toString() || "0");
                        setShowCompletionModal(true);
                        return 0;
                    }
                    return prev - 1;
                });
                setElapsedSeconds((prev) => prev + 1);
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRunning, timerSeconds, book?.currentPage]);

    if (!book) {
        return (
            <View className="flex-1 bg-neutral-50 items-center justify-center">
                <Text className="text-neutral-900 text-lg">Book not found</Text>
            </View>
        );
    }

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        // Save session if any time was spent reading
        if (elapsedSeconds > 0 && book) {
            addSession(book.id, {
                startedAt: sessionStartRef.current,
                duration: elapsedSeconds,
                pagesRead: 0, // User can update page progress separately
            });
        }
        router.back();
    };

    const handleSelectAtmosphere = (atm: Atmosphere) => {
        Haptics.selectionAsync();
        setSelectedAtmosphere(atm);
    };

    const handleStartSession = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setPhase("timer");
        setIsRunning(true);
        sessionStartTimeRef.current = Date.now();
    };

    const handlePlayPause = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (!isRunning && elapsedSeconds === 0) {
            // Starting fresh session
            sessionStartRef.current = Date.now();
        }
        setIsRunning(!isRunning);
    };

    const handleAddMinute = () => {
        Haptics.selectionAsync();
        setTimerSeconds((prev) => prev + 60);
    };

    const handleSubtractMinute = () => {
        Haptics.selectionAsync();
        setTimerSeconds((prev) => Math.max(60, prev - 60));
    };

    const handleFinishSession = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setIsRunning(false);
        setSessionElapsedSeconds(getElapsedSeconds());
        // Pre-fill with current page and show modal
        setPageInput(book?.currentPage?.toString() || "0");
        setShowCompletionModal(true);
    };

    const handleUpdateProgress = () => {
        if (!book) return;

        const newPage = parseInt(pageInput, 10);

        if (isNaN(newPage) || newPage < 0) {
            setInputError("Please enter a valid page number");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        if (newPage > book.totalPages) {
            setInputError(`Page cannot exceed ${book.totalPages}`);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        // Calculate pages read (minimum 0 to avoid negative values for backward navigation)
        const pagesRead = Math.max(0, newPage - book.currentPage);

        // Update progress in store with session data
        updateProgress(book.id, newPage, {
            durationSeconds: sessionElapsedSeconds,
            startPage: book.currentPage,
            endPage: newPage,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowCompletionModal(false);
        router.back();
    };

    return (
        <View
            className="flex-1 bg-neutral-50"
            style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4">
                <Pressable
                    onPress={handleBack}
                    className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-md shadow-black/5 active:scale-90"
                >
                    <ChevronLeft size={24} color="#171717" />
                </Pressable>
                <View className="items-center">
                    <Text className="text-lg font-semibold text-neutral-900">
                        Reading Session
                    </Text>
                    {elapsedSeconds > 0 && (
                        <Text className="text-xs text-neutral-500">
                            {formatTime(elapsedSeconds)} elapsed
                        </Text>
                    )}
                </View>
                <Pressable
                    onPress={handleFinishSession}
                    className="bg-neutral-900 px-4 py-2 rounded-full active:scale-95"
                >
                    <Text className="text-sm font-semibold text-white">Done</Text>
                </Pressable>
            </View>

            {/* Content */}
            <View className="flex-1 items-center justify-center px-8">
                {/* Book Cover */}
                <View className="w-40 h-60 rounded-3xl overflow-hidden shadow-2xl shadow-black/20 mb-10">
                    {book.coverUrl ? (
                        <Image
                            source={{ uri: book.coverUrl }}
                            style={{ width: "100%", height: "100%" }}
                            contentFit="cover"
                        />
                    ) : (
                        <View className="w-full h-full bg-neutral-200 items-center justify-center">
                            <BookOpen size={40} color="#a3a3a3" />
                        </View>
                    )}
                </View>

                {/* Timer */}
                <Text className="text-6xl font-light text-neutral-900 tracking-tight mb-8 font-mono">
                    {formatTime(timerSeconds)}
                </Text>

                {/* Controls */}
                <View className="flex-row items-center gap-6">
                    <Pressable
                        onPress={handleSubtractMinute}
                        className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-lg shadow-black/10 active:scale-90"
                    >
                        <Minus size={24} color="#171717" strokeWidth={2} />
                    </Pressable>

                    <Pressable
                        onPress={handlePlayPause}
                        className="w-20 h-20 bg-neutral-900 rounded-full items-center justify-center shadow-xl shadow-black/30 active:scale-90"
                    >
                        {isRunning ? (
                            <Pause size={32} color="#ffffff" fill="#ffffff" />
                        ) : (
                            <Play size={32} color="#ffffff" fill="#ffffff" style={{ marginLeft: 4 }} />
                        )}
                    </Pressable>

                    <Pressable
                        onPress={handleAddMinute}
                        className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-lg shadow-black/10 active:scale-90"
                    >
                        <Plus size={24} color="#171717" strokeWidth={2} />
                    </Pressable>
                </View>
            </View>

            {/* Book Info */}
            <View className="items-center pb-8">
                <Text className="text-sm text-neutral-500" numberOfLines={1}>
                    Reading
                </Text>
                <Text className="text-base font-semibold text-neutral-900" numberOfLines={1}>
                    {book.title}
                </Text>
            </View>

            {/* Session Complete Modal */}
            <Modal
                visible={showCompletionModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCompletionModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    <View className="flex-1 bg-black/50 justify-center items-center px-6">
                        <View className="bg-white w-full rounded-3xl p-6 shadow-2xl">
                            {/* Title */}
                            <Text className="text-2xl font-bold text-neutral-900 text-center mb-2">
                                Session Complete
                            </Text>
                            <Text className="text-base text-neutral-500 text-center mb-6">
                                You read for {Math.round(sessionElapsedSeconds / 60)} minutes.
                            </Text>

                            {/* Page Input */}
                            <View className="mb-6">
                                <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3 text-center">
                                    What page are you on now?
                                </Text>
                                <TextInput
                                    className="bg-neutral-100 rounded-2xl px-6 py-4 text-center text-3xl font-bold text-neutral-900"
                                    placeholder="0"
                                    placeholderTextColor="#a3a3a3"
                                    keyboardType="number-pad"
                                    value={pageInput}
                                    onChangeText={(text) => {
                                        setPageInput(text);
                                        setInputError("");
                                    }}
                                    autoFocus
                                />
                                <Text className="text-sm text-neutral-400 text-center mt-2">
                                    of {book.totalPages} pages
                                </Text>
                                {inputError ? (
                                    <Text className="text-sm text-red-500 text-center mt-2">
                                        {inputError}
                                    </Text>
                                ) : null}
                            </View>

                            {/* Update Button */}
                            <Pressable
                                onPress={handleUpdateProgress}
                                className="bg-neutral-900 py-4 rounded-full items-center justify-center active:scale-[0.98] shadow-lg shadow-black/20"
                            >
                                <Text className="text-lg font-bold text-white">
                                    Update Progress
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
