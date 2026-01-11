import { BlurView } from "expo-blur";
import { View, ViewProps } from "react-native";

interface GlassCardProps extends ViewProps {
    intensity?: number;
    tint?: "light" | "dark" | "default" | "prominent" | "systemThinMaterial" | "systemMaterial" | "systemThickMaterial" | "systemChromeMaterial" | "systemUltraThinMaterial" | "systemThinMaterialLight" | "systemMaterialLight" | "systemThickMaterialLight" | "systemChromeMaterialLight" | "systemUltraThinMaterialLight" | "systemThinMaterialDark" | "systemMaterialDark" | "systemThickMaterialDark" | "systemChromeMaterialDark" | "systemUltraThinMaterialDark";
    borderRadius?: number;
    contentClassName?: string;
}

export function GlassCard({
    children,
    style,
    intensity = 50,
    tint = "dark",
    className = "",
    borderRadius = 24, // keeping it rounded-2xl by default
    contentClassName = "p-6 h-full w-full",
    ...props
}: GlassCardProps) {
    // On Android, BlurView support can be tricky or performance heavy.
    // We can use a translucent background as a sturdy fallback or enhancement.

    return (
        <View
            style={[
                {
                    borderRadius: borderRadius,
                    overflow: "hidden",
                    backgroundColor: "rgba(23, 23, 23, 0.4)", // neutral-900 with opacity
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderWidth: 1,
                },
                style,
            ]}
            className={className}
            {...props}
        >
            <BlurView
                intensity={intensity}
                tint={tint}
                style={{ flex: 1 }}
            >
                <View className={contentClassName}>
                    {children}
                </View>
            </BlurView>
        </View>
    );
}
