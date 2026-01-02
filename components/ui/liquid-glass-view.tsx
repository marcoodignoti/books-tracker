import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import type React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";

/**
 * Props for LiquidGlassView component
 */
export interface LiquidGlassViewProps {
  /** Content to render inside the glass view */
  children: React.ReactNode;
  /** Additional styles for the container */
  style?: StyleProp<ViewStyle>;
  /** Blur intensity (0-100) - default: 25 */
  intensity?: number;
  /** Visual variant for different use cases */
  variant?: "default" | "light" | "dark" | "accent";
  /** Border radius for the glass container - default: 24 */
  borderRadius?: number;
  /** Whether to show animated shimmer effect on the border */
  animated?: boolean;
  /** Custom tint color for the glass */
  tintColor?: string;
}

/**
 * LiquidGlassView - A glassmorphism effect component for React Native
 *
 * Implements Apple's Liquid Glass design language for non-iOS 26 devices
 * using expo-blur and expo-linear-gradient.
 *
 * Features:
 * - Frosted glass blur effect
 * - Subtle gradient overlays for depth
 * - Animated shimmer border (optional)
 * - Multiple visual variants
 * - Customizable tint and intensity
 */
export function LiquidGlassView({
  children,
  style,
  intensity = 25,
  variant = "default",
  borderRadius = 24,
  animated = false,
  tintColor,
}: LiquidGlassViewProps) {
  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      shimmerProgress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000 }),
          withTiming(0, { duration: 2000 })
        ),
        -1, // infinite
        false
      );
    }
  }, [animated, shimmerProgress]);

  const animatedBorderStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.3 + shimmerProgress.value * 0.4,
    };
  });

  // Get gradient colors based on variant
  const getGradientColors = (): [string, string, string] => {
    if (tintColor) {
      return [
        `${tintColor}20`,
        `${tintColor}10`,
        `${tintColor}05`,
      ];
    }

    switch (variant) {
      case "light":
        return [
          "rgba(255, 255, 255, 0.25)",
          "rgba(255, 255, 255, 0.15)",
          "rgba(255, 255, 255, 0.05)",
        ];
      case "dark":
        return [
          "rgba(0, 0, 0, 0.25)",
          "rgba(0, 0, 0, 0.15)",
          "rgba(0, 0, 0, 0.05)",
        ];
      case "accent":
        return [
          "rgba(99, 102, 241, 0.2)",
          "rgba(139, 92, 246, 0.1)",
          "rgba(168, 85, 247, 0.05)",
        ];
      default:
        return [
          "rgba(255, 255, 255, 0.18)",
          "rgba(255, 255, 255, 0.08)",
          "rgba(255, 255, 255, 0.02)",
        ];
    }
  };

  // Get blur tint based on variant
  const getBlurTint = (): "light" | "dark" | "default" => {
    switch (variant) {
      case "light":
        return "light";
      case "dark":
        return "dark";
      default:
        return "default";
    }
  };

  // Get border colors for the highlight effect
  const getBorderGradient = (): [string, string, string, string] => {
    return [
      "rgba(255, 255, 255, 0.5)",
      "rgba(255, 255, 255, 0.2)",
      "rgba(255, 255, 255, 0.1)",
      "rgba(255, 255, 255, 0.05)",
    ];
  };

  return (
    <View
      style={[
        styles.container,
        {
          borderRadius,
          shadowColor: "#000",
          shadowOpacity: variant === "dark" ? 0.4 : 0.15,
        },
        style,
      ]}
    >
      {/* Blur layer */}
      <BlurView
        intensity={intensity}
        tint={getBlurTint()}
        style={[styles.blur, { borderRadius }]}
      >
        {/* Gradient overlay for glass effect */}
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { borderRadius }]}
        >
          {/* Inner content container */}
          <View style={styles.content}>{children}</View>
        </LinearGradient>
      </BlurView>

      {/* Border highlight effect */}
      <Animated.View
        style={[
          styles.borderContainer,
          { borderRadius },
          animated && animatedBorderStyle,
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={getBorderGradient()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.borderGradient, { borderRadius }]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowRadius: 16,
    elevation: 8,
  },
  blur: {
    flex: 1,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  borderContainer: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderColor: "transparent",
    opacity: 0.5,
  },
  borderGradient: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
});

export default LiquidGlassView;
