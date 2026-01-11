import { BookCard } from "@/components/BookCard";
import { EmptyState } from "@/components/EmptyState";
import { useBookStore } from "@/store/useBookStore";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const books = useBookStore((state) => state.books);

    const currentlyReading = books.filter((b) => b.status === "reading");
    const wantToRead = books.filter((b) => b.status === "want-to-read");
    const finished = books.filter((b) => b.status === "finished");

    const handleAddBook = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/search");
    };

    if (books.length === 0) {
        return (
            <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
                <EmptyState />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-4">
                    <Text className="text-3xl font-bold tracking-tight text-neutral-900">
                        Your Library
                    </Text>
                    <Pressable
                        onPress={handleAddBook}
                        className="w-12 h-12 bg-neutral-900 rounded-full items-center justify-center shadow-lg shadow-black/20 active:scale-90"
                    >
                        <Plus size={24} color="#ffffff" strokeWidth={2.5} />
                    </Pressable>
                </View>

                {/* Currently Reading Hero */}
                {currentlyReading.length > 0 && (
                    <BookCard book={currentlyReading[0]} isHero />
                )}

                {/* Additional Currently Reading Books (if more than one) */}
                {currentlyReading.length > 1 && (
                    <View className="mb-6">
                        <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 px-4 mb-3">
                            Also Reading
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
                        >
                            {currentlyReading.slice(1).map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Want to Read Section */}
                {wantToRead.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 px-4 mb-3">
                            Want to Read
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
                        >
                            {wantToRead.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Finished Section */}
                {finished.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 px-4 mb-3">
                            Finished
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
                        >
                            {finished.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={{ height: insets.bottom + 20 }} />
            </ScrollView>
        </View>
    );
}
