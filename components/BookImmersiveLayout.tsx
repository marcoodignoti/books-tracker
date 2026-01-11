import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { ReactNode, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const COVER_HEIGHT = SCREEN_HEIGHT * 0.6;

interface BookImmersiveLayoutProps {
    coverUrl?: string;
    title: string;
    author: string;
    statsContent?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
}

export function BookImmersiveLayout({
    coverUrl,
    title,
    author,
    statsContent,
    footer,
    children,
}: BookImmersiveLayoutProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [imageError, setImageError] = useState(false);

    return (
        <View className="flex-1 bg-black">
            {/* Background Cover Image */}
            <View className="absolute top-0 left-0 right-0" style={{ height: COVER_HEIGHT }}>
                {(coverUrl && !imageError) ? (
                    <Image
                        source={{ uri: coverUrl }}
                        style={{ width: SCREEN_WIDTH, height: COVER_HEIGHT }}
                        contentFit="cover"
                        transition={300}
                        cachePolicy="memory-disk"
                        priority="high"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <LinearGradient
                        colors={isDark ? ["#374151", "#1f2937", "#111827"] : ["#cbd5e1", "#94a3b8", "#64748b"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ width: SCREEN_WIDTH, height: COVER_HEIGHT }}
                    />
                )}
                {/* Gradient Overlay - Stronger for readability */}
                <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.95)", "#000000"]}
                    locations={[0, 0.5, 0.8, 1]}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                />
            </View>



            {/* Content Over Gradient */}
            <View className="flex-1 justify-end">
                {/* Book Info Section - Text matches the dark overlay */}
                <View className="px-6 pb-8">
                    <Text
                        className="text-4xl font-bold text-white mb-2 shadow-sm"
                        numberOfLines={3}
                        style={{ textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}
                    >
                        {title}
                    </Text>

                    <Text
                        className="text-sm font-semibold uppercase tracking-widest text-neutral-200 mb-6 shadow-sm"
                        style={{ textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}
                    >
                        {author}
                    </Text>

                    {statsContent && (
                        <View className="flex-row items-center gap-3 mb-2 flex-wrap">
                            {/* Pass custom style via children or standard wrapper? 
                                The children are rendered by the parent. 
                                We might need to ensure the parent passes readable pills. 
                                Since `statsContent` is just a node, we rely on the parent to style the pills. 
                                However, we can wrap them here to ensure alignment.
                            */}
                            {statsContent}
                        </View>
                    )}
                </View>

                {/* Bottom Sheet Style Container - Fixed Height for consistency */}
                <View
                    className="bg-white dark:bg-neutral-900 rounded-t-[32px] px-6 pt-6"
                    style={{
                        height: SCREEN_HEIGHT * 0.55, // Fixed 55% height
                        paddingBottom: 34, // Safe area padding
                    }}
                >
                    <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                        {children}
                    </ScrollView>

                    {/* Footer - Fixed at bottom of sheet */}
                    {footer && (
                        <View className="pt-4">
                            {footer}
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}
