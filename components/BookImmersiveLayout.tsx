import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BookOpen, ChevronLeft } from "lucide-react-native";
import { ReactNode } from "react";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const COVER_HEIGHT = SCREEN_HEIGHT * 0.6;

interface BookImmersiveLayoutProps {
    coverUrl?: string;
    title: string;
    author: string;
    statsContent?: ReactNode;
    children: ReactNode;
}

export function BookImmersiveLayout({
    coverUrl,
    title,
    author,
    statsContent,
    children,
}: BookImmersiveLayoutProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    return (
        <View className="flex-1 bg-black">
            {/* Background Cover Image */}
            <View className="absolute top-0 left-0 right-0" style={{ height: COVER_HEIGHT }}>
                {coverUrl ? (
                    <Image
                        source={{ uri: coverUrl }}
                        style={{ width: SCREEN_WIDTH, height: COVER_HEIGHT }}
                        contentFit="cover"
                    />
                ) : (
                    <LinearGradient
                        colors={["#374151", "#1f2937", "#111827"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ width: SCREEN_WIDTH, height: COVER_HEIGHT }}
                    />
                )}
                <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.9)", "#000000"]}
                    locations={[0, 0.4, 0.7, 1]}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                />
            </View>

            {/* Floating Back Button with Blur */}
            <View
                className="absolute z-10"
                style={{ top: insets.top + 8, left: 16 }}
            >
                <Pressable
                    onPress={handleBack}
                    className="overflow-hidden rounded-full active:scale-90"
                >
                    <BlurView
                        intensity={50}
                        tint="dark"
                        className="w-11 h-11 items-center justify-center"
                    >
                        <ChevronLeft size={24} color="#ffffff" />
                    </BlurView>
                </Pressable>
            </View>

            {/* Content Over Gradient */}
            <View className="flex-1 justify-end">
                {/* Book Info Section */}
                <View className="px-6 pb-6">
                    <Text className="text-4xl font-bold text-white mb-2" numberOfLines={3}>
                        {title}
                    </Text>
                    
                    <Text className="text-sm font-semibold uppercase tracking-widest text-neutral-400 mb-6">
                        {author}
                    </Text>

                    {statsContent && (
                        <View className="flex-row items-center gap-4 mb-6 flex-wrap">
                            {statsContent}
                        </View>
                    )}
                </View>

                {/* Bottom Sheet Style White Container */}
                <View
                    className="bg-white rounded-t-[32px] px-6 pt-6"
                    style={{
                        paddingBottom: insets.bottom + 16,
                        maxHeight: SCREEN_HEIGHT * 0.55,
                    }}
                >
                    <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                        {children}
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}
