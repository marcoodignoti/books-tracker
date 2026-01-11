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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    const handleBarCodeScanned = useCallback(async ({ data }: { data: string }) => {
        if (scanned || isLoading) return;

        setScanned(true);
        setIsLoading(true);
        setError(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            // Search by ISBN
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
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
        Haptics.selectionAsync();
        setTorchEnabled((prev) => !prev);
    };

    const isBookInLibrary = result ? books.some((book) => book.id === result.id) : false;

    // Permission handling
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
                        To scan barcodes, we need permission to access your camera.
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
            {/* Camera View */}
            <CameraView
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
                }}
                enableTorch={torchEnabled}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />

            {/* Header Overlay */}
            <View
                className="absolute top-0 left-0 right-0 px-6 py-6"
                style={{ paddingTop: insets.top + 10 }}
            >
                <View className="flex-row items-center justify-between">
                    <Pressable
                        onPress={handleBack}
                        className="w-12 h-12 bg-black/60 rounded-full items-center justify-center backdrop-blur-md active:scale-90 border border-white/10"
                    >
                        <ChevronLeft size={24} color="#ffffff" />
                    </Pressable>

                    <View className="bg-black/60 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                        <Text className="text-white text-xs font-bold uppercase tracking-widest">Scan ISBN</Text>
                    </View>

                    <Pressable
                        onPress={toggleTorch}
                        className="w-12 h-12 bg-black/60 rounded-full items-center justify-center backdrop-blur-md active:scale-90 border border-white/10"
                    >
                        {torchEnabled ? (
                            <Zap size={20} color="#fbbf24" fill="#fbbf24" />
                        ) : (
                            <ZapOff size={20} color="#ffffff" />
                        )}
                    </Pressable>
                </View>
            </View>

            {/* Scan Guide */}
            {!scanned && !isLoading && (
                <View className="absolute inset-0 items-center justify-center pointer-events-none">
                    <View className="w-72 h-40 border-2 border-white/30 rounded-3xl" />
                    <View className="bg-black/60 px-4 py-2 rounded-full mt-6 backdrop-blur-md">
                        <Text className="text-white/80 text-xs font-bold uppercase tracking-widest">
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

            {/* Result Panel */}
            {(result || error) && !isLoading && (
                <View
                    className="absolute bottom-0 left-0 right-0 bg-neutral-900 rounded-t-[32px] p-8 border-t border-neutral-800"
                    style={{ paddingBottom: insets.bottom + 20 }}
                >
                    {error ? (
                        <>
                            <View className="items-center mb-6">
                                <View className="w-16 h-16 bg-red-900/20 rounded-full items-center justify-center mb-4 border border-red-900/50">
                                    <X size={32} color="#ef4444" />
                                </View>
                                <Text className="text-white text-lg font-bold text-center">
                                    {error}
                                </Text>
                            </View>
                            <Pressable
                                onPress={handleScanAgain}
                                className="bg-white rounded-full py-5 items-center active:scale-[0.98]"
                            >
                                <Text className="text-lg font-black text-black uppercase tracking-wide">Scan Again</Text>
                            </Pressable>
                        </>
                    ) : result && (
                        <>
                            <View className="flex-row mb-8">
                                <View className="w-24 h-36 rounded-xl overflow-hidden bg-neutral-800 shadow-xl shadow-black/50">
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
                                <View className="flex-1 ml-5 justify-center">
                                    <View className="bg-white self-start px-2 py-1 rounded-md mb-2">
                                        <Text className="text-black text-[10px] font-bold uppercase tracking-widest">
                                            Found
                                        </Text>
                                    </View>
                                    <Text className="text-2xl font-black text-white leading-tight mb-2 tracking-tight" numberOfLines={2}>
                                        {result.volumeInfo.title}
                                    </Text>
                                    <Text className="text-neutral-400 font-medium" numberOfLines={1}>
                                        {result.volumeInfo.authors?.join(", ") || "Unknown Author"}
                                    </Text>
                                    {result.volumeInfo.pageCount && (
                                        <Text className="text-neutral-600 text-xs mt-1 font-bold uppercase tracking-widest">
                                            {result.volumeInfo.pageCount} pages
                                        </Text>
                                    )}
                                </View>
                            </View>

                            <View className="flex-row gap-4">
                                <Pressable
                                    onPress={handleScanAgain}
                                    className="flex-1 bg-neutral-800 rounded-full py-4 items-center active:scale-[0.98] border border-neutral-700"
                                >
                                    <Text className="text-sm font-bold text-white uppercase tracking-wide">Retry</Text>
                                </Pressable>
                                {isBookInLibrary ? (
                                    <View className="flex-1 bg-green-900/30 rounded-full py-4 flex-row items-center justify-center gap-2 border border-green-900/50">
                                        <Check size={18} color="#22c55e" strokeWidth={3} />
                                        <Text className="text-sm font-bold text-green-500 uppercase tracking-wide">In Library</Text>
                                    </View>
                                ) : (
                                    <Pressable
                                        onPress={handleAddBook}
                                        className="flex-[2] bg-white rounded-full py-4 flex-row items-center justify-center gap-2 active:scale-[0.98]"
                                    >
                                        <Plus size={20} color="#000000" strokeWidth={3} />
                                        <Text className="text-lg font-black text-black uppercase tracking-wide">Add Book</Text>
                                    </Pressable>
                                )}
                            </View>
                        </>
                    )}
                </View>
            )}
        </View>
    );
}
