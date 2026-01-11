import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { BookOpen, LayoutTemplate } from "lucide-react-native";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    const { width } = Dimensions.get('window');

    // Reference Dimensions
    const PILL_WIDTH = 220;
    const PILL_HEIGHT = 64;
    const PILL_RADIUS = 32;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: "absolute",
                    bottom: (Platform.OS === 'ios' ? insets.bottom : 0) + 20, // Float above home indicator
                    // Robust Centering Strategy:
                    marginLeft: 80, // Half of PILL_WIDTH (220)
                    width: PILL_WIDTH,
                    height: PILL_HEIGHT,
                    borderRadius: PILL_RADIUS,
                    backgroundColor: "transparent",
                    borderTopWidth: 0,
                    elevation: 0,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.3,
                    shadowRadius: 20,
                    paddingBottom: 0,
                    paddingTop: 0,
                    borderWidth: 0,
                },
                tabBarBackground: () => (
                    <View style={{
                        flex: 1,
                        borderRadius: PILL_RADIUS,
                        overflow: 'hidden',
                        backgroundColor: 'rgba(23,23,23,0.85)',
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.15)',
                    }}>
                        <BlurView
                            intensity={23}
                            tint="systemThickMaterialDark"
                            style={StyleSheet.absoluteFill}
                        />
                    </View>
                ),
                tabBarActiveTintColor: "#ffffff",
                tabBarInactiveTintColor: "#525252",
                tabBarShowLabel: false,
                tabBarItemStyle: {
                    height: PILL_HEIGHT,
                    paddingVertical: 13,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: PILL_RADIUS,
                }
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={{
                            width: 64,
                            height: 50,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: focused ? 'rgba(255,255,255,0.1)' : 'transparent',
                            borderRadius: 25,
                            // Micro-adjustment: if icons feel visually high, we can add a tiny marginTop here?
                            // But technically justifyContent: center should work.
                            // Let's rely on flex centering first.
                        }}>
                            <LayoutTemplate size={24} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="library"
                options={{
                    title: "Library",
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={{
                            width: 64,
                            height: 50,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: focused ? 'rgba(255,255,255,0.1)' : 'transparent',
                            borderRadius: 25,
                        }}>
                            <BookOpen size={24} color={color} />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}
