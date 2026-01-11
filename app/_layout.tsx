import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogBox } from "react-native";
import "../global.css";

// Suppress specific warnings
LogBox.ignoreLogs([
  "SafeAreaView has been deprecated",
]);

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#ffffff" },
        }}
      >
        <Stack.Screen name="index" />
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
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
