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

    useEffect(() => {
        if (isRunning && timerSeconds > 0) {
            timerRef.current = setInterval(() => {
                setTimerSeconds((prev) => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        setElapsedSeconds(getElapsedSeconds());
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
            <View className="flex-1 bg-black items-center justify-center">
                <Text className="text-white text-lg font-bold">Book not found</Text>
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
                startedAt: sessionStartTimeRef.current || Date.now(),
                duration: elapsedSeconds,
                pagesRead: 0, // User can update page progress separately
            });
        }
        router.back();
    };

    const handlePlayPause = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (!isRunning && elapsedSeconds === 0) {
            // Starting fresh session
            sessionStartTimeRef.current = Date.now();
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
        addSession(book.id, {
            startedAt: sessionStartTimeRef.current || Date.now(),
            duration: elapsedSeconds,
            pagesRead: pagesRead,
        });

        updateProgress(book.id, newPage);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowCompletionModal(false);
        router.back();
    };

    return (
        <View
            className="flex-1 bg-black"
            style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4">
                <Pressable
                    onPress={handleBack}
                    className="w-12 h-12 bg-neutral-900 rounded-full items-center justify-center border border-neutral-800 active:scale-90"
                >
                    <ChevronLeft size={24} color="#ffffff" />
                </Pressable>

                <View className="bg-neutral-900 px-4 py-2 rounded-full border border-neutral-800">
                    <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                        Reading Session
                    </Text>
                </View>

                <Pressable
                    onPress={handleFinishSession}
                    className="bg-white px-6 py-3 rounded-full active:scale-95"
                >
                    <Text className="text-xs font-black uppercase tracking-wider text-black">Done</Text>
                </Pressable>
            </View>

            {/* Content */}
            <View className="flex-1 items-center justify-center px-8">
                {/* Book Cover (Small & Darkened) */}
                <View className="w-32 h-48 rounded-2xl overflow-hidden bg-neutral-900 mb-12 opacity-80">
                    {book.coverUrl ? (
                        <Image
                            source={{ uri: book.coverUrl }}
                            style={{ width: "100%", height: "100%" }}
                            contentFit="cover"
                        />
                    ) : (
                        <View className="w-full h-full bg-neutral-800 items-center justify-center">
                            <BookOpen size={32} color="#525252" />
                        </View>
                    )}
                </View>

                {/* Timer */}
                <View className="mb-16 items-center">
                    <Text
                        className="text-8xl font-black text-white tracking-tighter leading-none font-variant-numeric-tabular-nums"
                        style={{ fontFamily: 'Inter_900Black' }}
                    >
                        {formatTime(timerSeconds)}
                    </Text>
                    {elapsedSeconds > 0 && (
                        <Text className="text-neutral-500 font-medium mt-2 tracking-wide">
                            {formatTime(elapsedSeconds)} ELAPSED
                        </Text>
                    )}
                </View>

                {/* Controls */}
                <View className="flex-row items-center gap-8">
                    <Pressable
                        onPress={handleSubtractMinute}
                        className="w-16 h-16 bg-neutral-900 rounded-full items-center justify-center border border-neutral-800 active:scale-90"
                    >
                        <Minus size={24} color="#ffffff" strokeWidth={2.5} />
                    </Pressable>

                    <Pressable
                        onPress={handlePlayPause}
                        className="w-24 h-24 bg-white rounded-full items-center justify-center active:scale-95"
                    >
                        {isRunning ? (
                            <Pause size={36} color="#000000" fill="#000000" />
                        ) : (
                            <Play size={36} color="#000000" fill="#000000" style={{ marginLeft: 4 }} />
                        )}
                    </Pressable>

                    <Pressable
                        onPress={handleAddMinute}
                        className="w-16 h-16 bg-neutral-900 rounded-full items-center justify-center border border-neutral-800 active:scale-90"
                    >
                        <Plus size={24} color="#ffffff" strokeWidth={2.5} />
                    </Pressable>
                </View>
            </View>

            {/* Footer Book Info */}
            <View className="items-center pb-8 opacity-50">
                <Text className="text-sm font-bold text-white uppercase tracking-widest" numberOfLines={1}>
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
                    <View className="flex-1 bg-black/90 justify-center items-center px-6">
                        <View className="bg-neutral-900 w-full rounded-[32px] p-8 border border-neutral-800">
                            {/* Header */}
                            <View className="items-center mb-8">
                                <Text className="text-3xl font-black text-white text-center tracking-tighter mb-2" style={{ fontFamily: 'Inter_900Black' }}>
                                    Session Complete
                                </Text>
                                <Text className="text-neutral-400 text-center font-medium">
                                    You read for <Text className="text-white font-bold">{Math.round(elapsedSeconds / 60)} minutes</Text>.
                                </Text>
                            </View>

                            {/* Page Input */}
                            <View className="mb-8">
                                <Text className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4 text-center">
                                    Current Page
                                </Text>
                                <View className="flex-row items-center justify-center">
                                    <TextInput
                                        className="bg-black border border-neutral-800 rounded-2xl px-8 py-6 text-center text-4xl font-black text-white w-full"
                                        style={{ fontFamily: 'Inter_900Black' }}
                                        placeholder="0"
                                        placeholderTextColor="#333"
                                        keyboardType="number-pad"
                                        value={pageInput}
                                        onChangeText={(text) => {
                                            setPageInput(text);
                                            setInputError("");
                                        }}
                                        autoFocus
                                    />
                                </View>
                                <Text className="text-sm text-neutral-500 text-center mt-3 font-medium">
                                    / {book.totalPages} pages
                                </Text>
                                {inputError ? (
                                    <View className="bg-red-900/20 py-2 rounded-lg mt-3">
                                        <Text className="text-sm text-red-500 text-center font-bold">
                                            {inputError}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>

                            {/* Actions */}
                            <View className="gap-3">
                                <Pressable
                                    onPress={handleUpdateProgress}
                                    className="bg-white py-5 rounded-full items-center justify-center active:scale-[0.98]"
                                >
                                    <Text className="text-lg font-black text-black uppercase tracking-wide">
                                        Update Progress
                                    </Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => {
                                        setShowCompletionModal(false);
                                        router.back();
                                    }}
                                    className="py-4 items-center justify-center active:opacity-70"
                                >
                                    <Text className="text-base font-bold text-neutral-500">
                                        Discard Session
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
