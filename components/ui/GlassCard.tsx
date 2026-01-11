import React from "react";
import { View, ViewProps } from "react-native";

interface GlassCardProps extends ViewProps {
    intensity?: number;
    tint?: "light" | "dark" | "default";
    contentClassName?: string;
    borderRadius?: number;
}

/**
 * A "GlassCard" that now renders as a clean, solid card.
 * Usage of this component is maintained to avoid refactoring every import,
 * but the visual output is now a simple, solid container.
 */
export const GlassCard = ({
    children,
    className,
    contentClassName,
    borderRadius = 24, // Standard simplified radius
    style,
    ...props
}: GlassCardProps) => {
    return (
        <View
            className={`bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm ${className || ""}`}
            style={[{ borderRadius }, style]}
            {...props}
        >
            <View className={`flex-1 ${contentClassName || ""}`}>
                {children}
            </View>
        </View>
    );
};
