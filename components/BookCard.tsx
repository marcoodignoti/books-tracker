import { Book } from "@/types/book";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { BookOpen } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface BookCardProps {
    book: Book;
    isHero?: boolean;
}

export function BookCard({ book, isHero }: BookCardProps) {
    const router = useRouter();

    const handlePress = () => {
        Haptics.selectionAsync();
        router.push(`/book/${book.id}`);
    };

    const progress = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0;

    if (isHero) {
        return (
            <Pressable
                onPress={handlePress}
                className="bg-white rounded-3xl shadow-2xl shadow-black/15 overflow-hidden mx-4 mb-6 active:scale-[0.98]"
            >
                <View className="flex-row p-4">
                    <View className="w-32 h-48 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
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
                    <View className="flex-1 ml-4 justify-center">
                        <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">
                            Currently Reading
                        </Text>
                        <Text className="text-xl font-bold text-neutral-900 mb-1" numberOfLines={2}>
                            {book.title}
                        </Text>
                        <Text className="text-sm text-neutral-500 mb-4" numberOfLines={1}>
                            {book.author}
                        </Text>
                        <View className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-neutral-900 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </View>
                        <Text className="text-xs text-neutral-400 mt-2">
                            {book.currentPage} of {book.totalPages} pages
                        </Text>
                    </View>
                </View>
            </Pressable>
        );
    }

    return (
        <Pressable
            onPress={handlePress}
            className="w-28 mr-4 active:scale-95"
        >
            <View className="w-28 h-40 rounded-2xl overflow-hidden shadow-xl shadow-black/10 mb-2">
                {book.coverUrl ? (
                    <Image
                        source={{ uri: book.coverUrl }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                    />
                ) : (
                    <View className="w-full h-full bg-neutral-200 items-center justify-center">
                        <BookOpen size={24} color="#a3a3a3" />
                    </View>
                )}
            </View>
            <Text className="text-sm font-semibold text-neutral-900" numberOfLines={1}>
                {book.title}
            </Text>
            <Text className="text-xs text-neutral-500" numberOfLines={1}>
                {book.author}
            </Text>
        </Pressable>
    );
}
