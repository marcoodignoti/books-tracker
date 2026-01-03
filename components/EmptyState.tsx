import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { BookOpen, Plus } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

export function EmptyState() {
    const router = useRouter();

    const handleAddBook = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/search");
    };

    return (
        <View className="flex-1 items-center justify-center px-8">
            <View className="w-24 h-24 rounded-full bg-neutral-100 items-center justify-center mb-6">
                <BookOpen size={40} color="#a3a3a3" strokeWidth={1.5} />
            </View>
            <Text className="text-2xl font-bold text-neutral-900 text-center mb-2">
                Your Library is Empty
            </Text>
            <Text className="text-base text-neutral-500 text-center mb-8">
                Start building your collection by adding your first book
            </Text>
            <Pressable
                onPress={handleAddBook}
                className="bg-neutral-900 px-8 py-4 rounded-2xl flex-row items-center gap-3 shadow-xl shadow-black/20 active:scale-95"
            >
                <Plus size={20} color="#ffffff" strokeWidth={2.5} />
                <Text className="text-white font-semibold text-base">Add Your First Book</Text>
            </Pressable>
        </View>
    );
}
