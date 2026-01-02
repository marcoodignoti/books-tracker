import type React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { LiquidGlassView, type LiquidGlassViewProps } from "./liquid-glass-view";

/**
 * Props for LiquidGlassCard component
 */
export interface LiquidGlassCardProps
  extends Omit<LiquidGlassViewProps, "children"> {
  /** Content to render inside the card */
  children: React.ReactNode;
  /** Padding inside the card - default: 16 */
  padding?: number;
  /** Gap between card elements when using with flex layouts */
  gap?: number;
}

/**
 * LiquidGlassCard - A pre-styled card component with liquid glass effect
 *
 * A convenience wrapper around LiquidGlassView with card-specific defaults
 * and padding options. Useful for content cards, panels, and floating elements.
 */
export function LiquidGlassCard({
  children,
  padding = 16,
  gap,
  style,
  ...props
}: LiquidGlassCardProps) {
  return (
    <LiquidGlassView style={[styles.card, style]} {...props}>
      <View style={[styles.cardContent, { padding, gap }]}>{children}</View>
    </LiquidGlassView>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 40,
  },
  cardContent: {
    flex: 1,
  },
});

export default LiquidGlassCard;
