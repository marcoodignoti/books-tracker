import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
  useFonts,
} from "@expo-google-fonts/inter";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, LogBox, View, useColorScheme } from "react-native";
import "../global.css";

// Suppress specific warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args.length > 0 && typeof args[0] === 'string' && args[0].includes('SafeAreaView has been deprecated')) {
    return;
  }
  originalWarn(...args);
};

LogBox.ignoreLogs([
  "SafeAreaView has been deprecated",
  "Warning: SafeAreaView has been deprecated",
]);

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
  });



  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <ThemeProvider value={systemColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View className="flex-1 bg-white dark:bg-black">
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" }, // Let the View background show through
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="search"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="search-book/[id]"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="book/[id]"
            options={{
              animation: "fade",
            }}
          />
          <Stack.Screen
            name="session/[id]"
            options={{
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="scan"
            options={{
              presentation: "modal",
              animation: "fade",
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </View>
    </ThemeProvider>
  );
}
