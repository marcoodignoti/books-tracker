import { useBookStore } from "@/store/useBookStore";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    BookOpen,
    Check,
    ChevronLeft,
    Cloud,
    Coffee,
    Minus,
    Pause,
    Play,
    Plus,
    VolumeX,
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Atmosphere = "rain" | "coffee" | "mute";

interface AtmosphereOption {
    id: Atmosphere;
    label: string;
    icon: React.ReactNode;
}

const ATMOSPHERE_OPTIONS: AtmosphereOption[] = [
    { id: "rain", label: "Rain", icon: <Cloud size={28} color="#171717" /> },
    { id: "coffee", label: "Café", icon: <Coffee size={28} color="#171717" /> },
    { id: "mute", label: "Silence", icon: <VolumeX size={28} color="#171717" /> },
];

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

    const [phase, setPhase] = useState<"setup" | "timer">("setup");
    const [selectedAtmosphere, setSelectedAtmosphere] = useState<Atmosphere>("mute");
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

    // Setup Phase - Atmosphere Selection
    if (phase === "setup") {
        return (
            <View
                className="flex-1 bg-white"
                style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
            >
                {/* Header */}
                <View className="flex-row items-center px-4 py-4">
                    <Pressable
                        onPress={handleBack}
                        className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center active:scale-90"
                    >
                        <ChevronLeft size={24} color="#171717" />
                    </Pressable>
                    <Text className="flex-1 text-center text-lg font-semibold text-neutral-900 mr-10">
                        Session Setup
                    </Text>
                </View>

                {/* Book Preview */}
                <View className="items-center py-8">
                    <View className="w-32 h-48 rounded-2xl overflow-hidden shadow-xl shadow-black/15">
                        {book.coverUrl ? (
                            <Image
                                source={{ uri: book.coverUrl }}
                                style={{ width: "100%", height: "100%" }}
                                contentFit="cover"
                            />
                        ) : (
                            <View className="w-full h-full bg-neutral-200 items-center justify-center">
                                <BookOpen size={32} color="#a3a3a3" />
                            </View>
                        )}
                    </View>
                    <Text
                        className="text-lg font-semibold text-neutral-900 mt-4 text-center px-8"
                        numberOfLines={2}
                    >
                        {book.title}
                    </Text>
                </View>

                {/* Atmosphere Selection */}
                <View className="px-4 flex-1">
                    <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
                        Choose Your Atmosphere
                    </Text>

                    <View className="flex-row gap-3">
                        {ATMOSPHERE_OPTIONS.map((option) => {
                            const isSelected = selectedAtmosphere === option.id;
                            return (
                                <Pressable
                                    key={option.id}
                                    onPress={() => handleSelectAtmosphere(option.id)}
                                    className={`flex-1 aspect-square rounded-3xl items-center justify-center ${isSelected
                                        ? "bg-white border-2 border-neutral-900"
                                        : "bg-neutral-100 border-2 border-transparent"
                                        } active:scale-95`}
                                >
                                    <View className="items-center">
                                        {option.icon}
                                        <Text className="text-sm font-semibold text-neutral-900 mt-2">
                                            {option.label}
                                        </Text>
                                        {isSelected && (
                                            <View className="absolute -top-1 -right-1 w-6 h-6 bg-neutral-900 rounded-full items-center justify-center">
                                                <Check size={14} color="#ffffff" strokeWidth={3} />
                                            </View>
                                        )}
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Start Button */}
                <View className="px-4 pb-4">
                    <Pressable
                        onPress={handleStartSession}
                        className="bg-neutral-900 py-4 rounded-2xl flex-row items-center justify-center gap-3 active:scale-[0.98] shadow-xl shadow-black/20"
                    >
                        <Play size={24} color="#ffffff" fill="#ffffff" />
                        <Text className="text-lg font-bold text-white">Begin Session</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    // Timer Phase
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
                <View className="bg-white px-3 py-1.5 rounded-full shadow-md shadow-black/5">
                    <Text className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                        {ATMOSPHERE_OPTIONS.find((a) => a.id === selectedAtmosphere)?.label}
                    </Text>
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
