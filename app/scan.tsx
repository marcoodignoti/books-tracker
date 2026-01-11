import { GlassCard } from "@/components/ui/GlassCard";
import { mapGoogleBookToBook, searchBooks } from "@/services/googleBooks";
import { useBookStore } from "@/store/useBookStore";
import { GoogleBookVolume } from "@/types/book";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { BookOpen, Check, ChevronLeft, Plus, X, Zap, ZapOff } from "lucide-react-native";
import { useCallback, useState } from "react";
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
    const [result, setResult] = useState<GoogleBookVolume | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [torchEnabled, setTorchEnabled] = useState(false);

    const { books, addBook } = useBookStore();

    const handleBack = () => {
        if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    const handleBarCodeScanned = useCallback(async ({ data }: { data: string }) => {
        if (scanned || isLoading) return;

        setScanned(true);
        setIsLoading(true);
        setError(null);
        if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            const results = await searchBooks(`isbn:${data}`);
            if (results.length > 0) {
                setResult(results[0]);
            } else {
                setError(`No book found for ISBN: ${data}`);
            }
        } catch {
            setError("Failed to search for book");
        } finally {
            setIsLoading(false);
        }
    }, [scanned, isLoading]);

    const handleAddBook = useCallback(() => {
        if (!result) return;
        if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const book = mapGoogleBookToBook(result);
        addBook(book);
        router.back();
    }, [result, addBook, router]);

    const handleScanAgain = () => {
        setScanned(false);
        setResult(null);
        setError(null);
    };

    const toggleTorch = () => {
        if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
        setTorchEnabled((prev) => !prev);
    };

    const isBookInLibrary = result ? books.some((book) => book.id === result.id) : false;

    if (!permission) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
                <View className="flex-row items-center px-4 py-4">
                    <Pressable
                        onPress={handleBack}
                        className="w-12 h-12 bg-neutral-900 rounded-full items-center justify-center active:scale-90"
                    >
                        <ChevronLeft size={24} color="#ffffff" />
                    </Pressable>
                </View>
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-white text-3xl font-black text-center mb-4 tracking-tighter" style={{ fontFamily: 'Inter_900Black' }}>
                        Camera Access
                    </Text>
                    <Text className="text-neutral-400 text-center mb-10 font-medium">
                        To scan barcodes, we need permission to use your camera.
                    </Text>
                    <Pressable
                        onPress={requestPermission}
                        className="bg-white px-8 py-5 rounded-full active:scale-95"
                    >
                        <Text className="text-black font-bold text-lg uppercase tracking-wide">Grant Permission</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <CameraView
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
                }}
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

            {/* Scan Guide */}
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

            {/* Loading State */}
            {isLoading && (
                <View className="absolute inset-0 bg-black/80 items-center justify-center">
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text className="text-white mt-4 font-bold uppercase tracking-widest text-xs">Accessing Database...</Text>
                </View>
            )}

            {/* Result Panel - Glass Sheet sliding from bottom */}
            {(result || error) && !isLoading && (
                <View className="absolute inset-0 z-30 justify-end bg-black/60">
                    <GlassCard
                        intensity={90}
                        tint="dark"
                        className="rounded-t-[32px] border-t border-white/20 overflow-hidden"
                        contentClassName="p-8 pb-12"
                        borderRadius={0}
                    >
                        {error ? (
                            <>
                                <View className="items-center mb-8">
                                    <View className="w-16 h-16 bg-red-500/10 rounded-full items-center justify-center mb-6 border border-red-500/20">
                                        <X size={32} color="#ef4444" />
                                    </View>
                                    <Text className="text-white text-lg font-bold text-center mb-2">
                                        Not Found
                                    </Text>
                                    <Text className="text-neutral-400 text-center text-sm px-4">
                                        {error}
                                    </Text>
                                </View>
                                <Pressable
                                    onPress={handleScanAgain}
                                    className="bg-white rounded-full py-5 items-center active:scale-[0.98]"
                                >
                                    <Text className="text-sm font-black text-black uppercase tracking-widest">Scan Again</Text>
                                </Pressable>
                            </>
                        ) : result && (
                            <>
                                <View className="flex-row mb-8">
                                    <View className="w-28 h-40 rounded-sm overflow-hidden bg-neutral-800 shadow-2xl shadow-black border border-white/10">
                                        {result.volumeInfo.imageLinks?.thumbnail ? (
                                            <Image
                                                source={{ uri: result.volumeInfo.imageLinks.thumbnail.replace("http://", "https://") }}
                                                style={{ width: "100%", height: "100%" }}
                                                contentFit="cover"
                                            />
                                        ) : (
                                            <View className="w-full h-full bg-neutral-800 items-center justify-center">
                                                <BookOpen size={24} color="#525252" />
                                            </View>
                                        )}
                                    </View>
                                    <View className="flex-1 ml-6 justify-center">
                                        <View className="bg-white/10 self-start px-3 py-1 rounded-full mb-3 border border-white/10">
                                            <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                                                Found Book
                                            </Text>
                                        </View>
                                        <Text
                                            className="text-2xl font-black text-white leading-tight mb-2 tracking-tighter"
                                            numberOfLines={2}
                                            style={{ fontFamily: 'Inter_900Black' }}
                                        >
                                            {result.volumeInfo.title}
                                        </Text>
                                        <Text className="text-neutral-400 font-medium text-sm" numberOfLines={1}>
                                            {result.volumeInfo.authors?.join(", ") || "Unknown Author"}
                                        </Text>
                                        {result.volumeInfo.pageCount && (
                                            <Text className="text-neutral-500 text-xs mt-2 font-bold uppercase tracking-widest">
                                                {result.volumeInfo.pageCount} pages
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                <View className="flex-row gap-4">
                                    <Pressable
                                        onPress={handleScanAgain}
                                        className="flex-1 bg-white/10 rounded-full py-4 items-center active:scale-[0.98] border border-white/10"
                                    >
                                        <Text className="text-xs font-bold text-white uppercase tracking-widest">Retry</Text>
                                    </Pressable>

                                    {isBookInLibrary ? (
                                        <View className="flex-[2] bg-green-500/20 rounded-full py-4 flex-row items-center justify-center gap-2 border border-green-500/30">
                                            <Check size={16} color="#4ade80" strokeWidth={3} />
                                            <Text className="text-xs font-bold text-green-400 uppercase tracking-widest">In Library</Text>
                                        </View>
                                    ) : (
                                        <Pressable
                                            onPress={handleAddBook}
                                            className="flex-[2] bg-white rounded-full py-4 flex-row items-center justify-center gap-2 active:scale-[0.98]"
                                        >
                                            <Plus size={18} color="#000000" strokeWidth={3} />
                                            <Text className="text-xs font-black text-black uppercase tracking-widest">Add to Library</Text>
                                        </Pressable>
                                    )}
                                </View>
                            </>
                        )}
                    </GlassCard>
                </View>
            )}
        </View>
    );
}
