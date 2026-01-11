import { GlassCard } from "@/components/ui/GlassCard";
import { searchBooks, searchOpenLibrary } from "@/services/googleBooks";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ChevronLeft, X, Zap, ZapOff } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScanScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [torchEnabled, setTorchEnabled] = useState(false);
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Lock to prevent multiple rapid scans before state updates
    const isScanningLock = useRef(false);

    const handleBack = () => {
        if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    const handleBarCodeScanned = useCallback(async ({ data, type }: { data: string; type?: string }) => {
        if (isScanningLock.current || scanned || isLoading) return;

        // Immediately lock
        isScanningLock.current = true;

        console.log(`[Scanner] Scanned code: ${data} (Type: ${type})`);
        setScanned(true);
        setIsLoading(true);
        setError(null);
        if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            // First try strict ISBN search
            console.log(`[Scanner] Attempting strict ISBN search for: isbn:${data}`);
            let results = await searchBooks(`isbn:${data}`);

            // Fallback 1: Google Books generic search
            if (results.length === 0) {
                console.log("[Scanner] ISBN search failed, retrying with raw data...");
                results = await searchBooks(data);
            }

            // Fallback 2: OpenLibrary
            if (results.length === 0) {
                console.log("[Scanner] Google Books failed, attempting OpenLibrary fallback...");
                results = await searchOpenLibrary(data);
            }

            console.log(`[Scanner] Search completed. Found ${results.length} results.`);

            if (results.length > 0) {
                if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                // Direct navigation to details
                router.push(`/search-book/${results[0].id}`);
            } else {
                if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                setError(`No book found for code: ${data}`);
            }
        } catch (err) {
            console.error("[Scanner] Error during search:", err instanceof Error ? err.message : "Unknown error");
            setError("Failed to search for book");
        } finally {
            setIsLoading(false);
            // NOTE: We do NOT unlock here if successful, because we want to stay "scanned" 
            // until the user presses "Scan Again" or leaves.
            // However, if there was an error, we stay locked until "Scan Again" (Retry) is pressed.
            // If we navigated away, the component might unmount.
        }
    }, [scanned, isLoading, router]);

    const handleScanAgain = () => {
        if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setScanned(false);
        setError(null);
        // Release the lock
        setTimeout(() => {
            isScanningLock.current = false;
        }, 100); // Small delay to prevent double firing on press release
    };

    const toggleTorch = () => {
        if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
        setTorchEnabled((prev) => !prev);
    };

    if (!permission) {
        return (
            <View className="flex-1 bg-white dark:bg-black items-center justify-center">
                <ActivityIndicator size="large" color={isDark ? "#ffffff" : "#000000"} />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: insets.top }}>
                <View className="flex-row items-center px-4 py-4">
                    <Pressable
                        onPress={handleBack}
                        className="w-12 h-12 bg-neutral-100 dark:bg-neutral-900 rounded-full items-center justify-center active:scale-90"
                    >
                        <ChevronLeft size={24} color={isDark ? "#ffffff" : "#000000"} />
                    </Pressable>
                </View>
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-black dark:text-white text-3xl font-bold text-center mb-4" style={{ fontFamily: 'Inter_700Bold' }}>
                        Camera Access
                    </Text>
                    <Text className="text-neutral-500 dark:text-neutral-400 text-center mb-10 font-medium">
                        To scan barcodes, we need permission to use your camera.
                    </Text>
                    <Pressable
                        onPress={requestPermission}
                        className="bg-black dark:bg-white px-8 py-5 rounded-full active:scale-95"
                    >
                        <Text className="text-white dark:text-black font-bold text-lg uppercase tracking-wide">Grant Permission</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            {/* Camera View - Always render but control scanning via prop */}
            <CameraView
                style={{ flex: 1 }}
                facing="back"
                enableTorch={torchEnabled}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />

            {/* Header Overlay - Floating Glass Pill */}
            <View
                className="absolute top-0 left-0 right-0 z-20 items-center"
                style={{ paddingTop: insets.top + 10 }}
            >
                <GlassCard
                    intensity={40}
                    className="flex-row items-center justify-between px-2 h-16 w-[90%] rounded-full border-white/20"
                    contentClassName="flex-row items-center justify-between w-full h-full px-2"
                >
                    <Pressable
                        onPress={handleBack}
                        className="w-12 h-12 rounded-full items-center justify-center active:bg-white/10"
                    >
                        <ChevronLeft size={24} color="#ffffff" />
                    </Pressable>

                    <Text className="text-white text-xs font-bold uppercase tracking-widest">
                        Scan ISBN
                    </Text>

                    <Pressable
                        onPress={toggleTorch}
                        className="w-12 h-12 rounded-full items-center justify-center active:bg-white/10"
                    >
                        {torchEnabled ? (
                            <Zap size={20} color="#fbbf24" fill="#fbbf24" />
                        ) : (
                            <ZapOff size={20} color="#ffffff" />
                        )}
                    </Pressable>
                </GlassCard>
            </View>

            {/* Scan Guide (Only when active and not loading) */}
            {!scanned && !isLoading && (
                <View className="absolute inset-0 items-center justify-center pointer-events-none mb-20">
                    <View className="w-72 h-44 border border-white/30 rounded-3xl bg-white/5" />
                    <View className="bg-black/40 px-4 py-2 rounded-full mt-6 backdrop-blur-md border border-white/10">
                        <Text className="text-white/90 text-[10px] font-bold uppercase tracking-widest">
                            Align Barcode
                        </Text>
                    </View>
                </View>
            )}

            {/* Loading Overlay */}
            {isLoading && (
                <View className="absolute inset-0 bg-black/80 items-center justify-center z-30">
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text className="text-white mt-4 font-bold uppercase tracking-widest text-xs">Searching Database...</Text>
                </View>
            )}

            {/* Scan Again Overlay (When returning from details) */}
            {scanned && !isLoading && !error && (
                <View className="absolute inset-0 bg-black/60 items-center justify-center z-40">
                    <Pressable
                        onPress={handleScanAgain}
                        className="bg-white/20 backdrop-blur-md px-8 py-6 rounded-full border border-white/30 active:scale-95"
                    >
                        <Text className="text-white font-black uppercase tracking-widest text-sm">Tap to Scan Again</Text>
                    </Pressable>
                </View>
            )}

            {/* Error Overlay */}
            {error && !isLoading && (
                <View className="absolute inset-0 bg-black/80 items-center justify-center z-50 px-8">
                    <View className="w-20 h-20 bg-red-500/20 rounded-full items-center justify-center mb-6 border border-red-500/30">
                        <X size={40} color="#ef4444" />
                    </View>
                    <Text className="text-white text-xl font-bold text-center mb-2">
                        Not Found
                    </Text>
                    <Text className="text-neutral-400 text-center text-sm mb-8">
                        {error}
                    </Text>
                    <Pressable
                        onPress={handleScanAgain}
                        className="bg-white px-10 py-4 rounded-full active:scale-95"
                    >
                        <Text className="text-black font-black uppercase tracking-widest text-sm">Try Again</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}
