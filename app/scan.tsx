import { mapGoogleBookToBook, searchBooks } from "@/services/googleBooks";
import { useBookStore } from "@/store/useBookStore";
import { GoogleBookVolume } from "@/types/book";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { BookOpen, Check, ChevronLeft, Plus, X } from "lucide-react-native";
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

    const isBookInLibrary = result ? books.some((book) => book.id === result.id) : false;

    // Permission handling
    if (!permission) {
        return (
            <View className="flex-1 bg-neutral-900 items-center justify-center">
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 bg-neutral-900" style={{ paddingTop: insets.top }}>
                <View className="flex-row items-center px-4 py-4">
                    <Pressable
                        onPress={handleBack}
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center active:scale-90"
                    >
                        <ChevronLeft size={24} color="#ffffff" />
                    </Pressable>
                </View>
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-white text-xl font-bold text-center mb-4">
                        Camera Permission Required
                    </Text>
                    <Text className="text-white/70 text-center mb-8">
                        We need camera access to scan book barcodes
                    </Text>
                    <Pressable
                        onPress={requestPermission}
                        className="bg-white px-8 py-4 rounded-2xl active:scale-95"
                    >
                        <Text className="text-neutral-900 font-bold text-lg">Grant Permission</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-neutral-900">
            {/* Camera View */}
            <CameraView
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />

            {/* Header Overlay */}
            <View
                className="absolute top-0 left-0 right-0 px-4 py-4"
                style={{ paddingTop: insets.top }}
            >
                <View className="flex-row items-center justify-between">
                    <Pressable
                        onPress={handleBack}
                        className="w-10 h-10 bg-black/50 rounded-full items-center justify-center active:scale-90"
                    >
                        <ChevronLeft size={24} color="#ffffff" />
                    </Pressable>
                    <Text className="text-white text-lg font-semibold">Scan ISBN</Text>
                    <View className="w-10" />
                </View>
            </View>

            {/* Scan Guide */}
            {!scanned && !isLoading && (
                <View className="absolute inset-0 items-center justify-center">
                    <View className="w-64 h-32 border-2 border-white/50 rounded-2xl" />
                    <Text className="text-white/70 mt-4 text-center">
                        Position the barcode inside the frame
                    </Text>
                </View>
            )}

            {/* Loading State */}
            {isLoading && (
                <View className="absolute inset-0 bg-black/70 items-center justify-center">
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text className="text-white mt-4">Searching...</Text>
                </View>
            )}

            {/* Result Panel */}
            {(result || error) && !isLoading && (
                <View
                    className="absolute bottom-0 left-0 right-0 bg-neutral-900 rounded-t-3xl p-6"
                    style={{ paddingBottom: insets.bottom + 16 }}
                >
                    {error ? (
                        <>
                            <View className="items-center mb-4">
                                <View className="w-16 h-16 bg-red-500/20 rounded-full items-center justify-center mb-3">
                                    <X size={32} color="#ef4444" />
                                </View>
                                <Text className="text-white text-lg font-semibold text-center">
                                    {error}
                                </Text>
                            </View>
                            <Pressable
                                onPress={handleScanAgain}
                                className="bg-white rounded-2xl py-4 items-center active:scale-[0.98]"
                            >
                                <Text className="text-lg font-bold text-neutral-900">Scan Again</Text>
                            </Pressable>
                        </>
                    ) : result && (
                        <>
                            <View className="flex-row mb-4">
                                <View className="w-20 h-28 rounded-xl overflow-hidden shadow-lg shadow-black/20">
                                    {result.volumeInfo.imageLinks?.thumbnail ? (
                                        <Image
                                            source={{ uri: result.volumeInfo.imageLinks.thumbnail.replace("http://", "https://") }}
                                            style={{ width: "100%", height: "100%" }}
                                            contentFit="cover"
                                        />
                                    ) : (
                                        <View className="w-full h-full bg-neutral-700 items-center justify-center">
                                            <BookOpen size={24} color="#a3a3a3" />
                                        </View>
                                    )}
                                </View>
                                <View className="flex-1 ml-4 justify-center">
                                    <Text className="text-white text-lg font-bold" numberOfLines={2}>
                                        {result.volumeInfo.title}
                                    </Text>
                                    <Text className="text-white/70" numberOfLines={1}>
                                        {result.volumeInfo.authors?.join(", ") || "Unknown Author"}
                                    </Text>
                                    {result.volumeInfo.pageCount && (
                                        <Text className="text-white/50 text-sm mt-1">
                                            {result.volumeInfo.pageCount} pages
                                        </Text>
                                    )}
                                </View>
                            </View>

                            <View className="flex-row gap-3">
                                <Pressable
                                    onPress={handleScanAgain}
                                    className="flex-1 bg-white/20 rounded-2xl py-4 items-center active:scale-[0.98]"
                                >
                                    <Text className="text-lg font-semibold text-white">Scan Again</Text>
                                </Pressable>
                                {isBookInLibrary ? (
                                    <View className="flex-1 bg-green-500/20 rounded-2xl py-4 flex-row items-center justify-center gap-2">
                                        <Check size={20} color="#22c55e" />
                                        <Text className="text-lg font-semibold text-green-500">In Library</Text>
                                    </View>
                                ) : (
                                    <Pressable
                                        onPress={handleAddBook}
                                        className="flex-1 bg-white rounded-2xl py-4 flex-row items-center justify-center gap-2 active:scale-[0.98]"
                                    >
                                        <Plus size={20} color="#171717" />
                                        <Text className="text-lg font-bold text-neutral-900">Add</Text>
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
