import { Tabs } from "expo-router";
import { BookOpen, LayoutTemplate } from "lucide-react-native";
import { Platform } from "react-native";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: "#000000",
                    borderTopColor: "#333333",
                    height: Platform.OS === 'ios' ? 88 : 60,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: "#ffffff",
                tabBarInactiveTintColor: "#666666",
                tabBarLabelStyle: {
                    fontWeight: "600",
                    fontSize: 10,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color, size }) => (
                        <LayoutTemplate size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="library"
                options={{
                    title: "Library",
                    tabBarIcon: ({ color, size }) => (
                        <BookOpen size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
