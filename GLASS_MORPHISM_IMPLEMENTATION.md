# Glassmorphism Implementation Guide

## Core Principles used in the App

1.  **Component**: `GlassCard.tsx`
    *   Wraps content in `expo-blur`'s `BlurView`.
    *   Uses a translucent background color `rgba(23, 23, 23, 0.4)` to darken the background while keeping content legible.
    *   Adds a subtle 1px border `rgba(255, 255, 255, 0.1)` to define edges without heavy lines.
    *   Uses `overflow: hidden` to ensure blur stays within rounded corners.

2.  **Visual Language**:
    *   **Dark Mode**: Optimized for dark backgrounds (`bg-black` or `bg-neutral-950`).
    *   **Typography**: High-contrast, Neo-Grotesque (`Inter_900Black` for headers) to cut through the blur.
    *   **Depth**: Usage of subtle gradients and shadows to lift elements.

3.  **Usage Example**:

```tsx
<GlassCard className="p-6">
    <Text className="text-white font-bold">Hello Glass</Text>
</GlassCard>
```

## Performance Considerations

*   `BlurView` can be expensive on Android.
*   The `GlassCard` component is designed with a fallback in mind (the translucent background color works even if blur fails or is disabled).
