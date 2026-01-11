import { Tabs } from "expo-router";
import { BookOpen, Home } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Platform } from "react-native";

export default function TabLayout() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    borderTopWidth: 0,
                    elevation: 0,
                    backgroundColor: isDark ? "#000000" : "#ffffff", // Solid background for debug/reliability
                    height: Platform.OS === 'ios' ? 85 : 60,
                    paddingTop: 10,
                },
                // Remove tabBarBackground momentarily to guarantee native rendering isn't obstructed
                tabBarActiveTintColor: isDark ? "#ffffff" : "#000000",
                tabBarInactiveTintColor: isDark ? "#737373" : "#a3a3a3",
                tabBarShowLabel: true, // Standard tabs usually have labels
                tabBarLabelStyle: {
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 10,
                    marginBottom: 5,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color, focused }) => (
                        <Home size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                    ),
                }}
            />
            <Tabs.Screen
                name="library"
                options={{
                    title: "Library",
                    tabBarIcon: ({ color, focused }) => (
                        <BookOpen size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                    ),
                }}
            />
        </Tabs>
    );
}
