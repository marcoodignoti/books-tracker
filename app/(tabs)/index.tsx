import { useBookStore } from "@/store/useBookStore";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DashboardScreen() {
    const insets = useSafeAreaInsets();
    const books = useBookStore((state) => state.books);

    // Calculate Stats
    const totalBooksRead = books.filter((b) => b.status === "finished").length;
    const totalPagesRead = books.reduce((acc, book) => acc + book.currentPage, 0);
    const totalSessions = books.reduce((acc, book) => {
        return acc + (book.sessions?.length || 0);
    }, 0);

    // Total Duration in Minutes
    const totalDurationSeconds = books.reduce((acc, book) => {
        const bookSessionTime = book.sessions?.reduce((sAcc, session) => sAcc + session.duration, 0) || 0;
        return acc + bookSessionTime;
    }, 0);
    const totalHours = Math.floor(totalDurationSeconds / 3600);

    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingTop: insets.top + 20,
                    paddingBottom: insets.bottom + 20,
                    paddingHorizontal: 24
                }}
            >
                {/* Header Badge */}
                <View className="items-center mb-12">
                    <View className="bg-neutral-800 px-4 py-2 rounded-full">
                        <Text className="text-neutral-400 text-xs font-bold uppercase tracking-widest">
                            State of Your Reading
                        </Text>
                    </View>
                </View>

                {/* Hero Statement */}
                <View className="mb-16">
                    <Text
                        className="text-white text-5xl font-black leading-tight tracking-tighter"
                        style={{ fontFamily: 'Inter_900Black' }}
                    >
                        Reading {"\n"}
                        is knowledge.{"\n"}
                        <Text className="text-neutral-500">The data {"\n"}is clear.</Text>
                    </Text>
                </View>

                {/* Stats Grid */}
                <View className="gap-8">
                    {/* Primary Stat: Pages */}
                    <View className="bg-red-600 p-8 rounded-[48px] justify-center h-80">
                        <Text
                            className="text-black text-[120px] font-black leading-none tracking-tighter"
                            style={{ fontFamily: 'Inter_900Black' }}
                        >
                            {totalPagesRead}
                        </Text>
                        <Text className="text-black/60 text-xl font-bold uppercase tracking-widest mt-2">
                            Pages Read
                        </Text>
                    </View>

                    <View className="flex-row gap-4">
                        {/* Secondary Stat: Books */}
                        <View className="flex-1 bg-neutral-900 p-6 rounded-[32px] h-64 justify-between">
                            <Text className="text-neutral-500 text-xs font-bold uppercase tracking-widest">
                                Books Finished
                            </Text>
                            <Text
                                className="text-white text-8xl font-black leading-none tracking-tighter"
                                style={{ fontFamily: 'Inter_900Black' }}
                            >
                                {totalBooksRead}
                            </Text>
                        </View>

                        {/* Secondary Stat: Hours */}
                        <View className="flex-1 bg-white p-6 rounded-[32px] h-64 justify-between">
                            <Text className="text-neutral-500 text-xs font-bold uppercase tracking-widest">
                                Hours Read
                            </Text>
                            <View>
                                <Text
                                    className="text-black text-8xl font-black leading-none tracking-tighter"
                                    style={{ fontFamily: 'Inter_900Black' }}
                                >
                                    {totalHours}
                                </Text>
                                <Text className="text-black text-xl font-bold">
                                    hrs
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Tertiary Stat: Sessions */}
                    <View className="bg-neutral-900 p-8 rounded-[40px] flex-row items-center justify-between">
                        <View>
                            <Text className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-1">
                                Total Sessions
                            </Text>
                            <Text className="text-white text-4xl font-black tracking-tighter">
                                {totalSessions} sessions
                            </Text>
                        </View>
                        <View className="w-16 h-16 bg-neutral-800 rounded-full items-center justify-center">
                            <Text className="text-2xl">🔥</Text>
                        </View>
                    </View>
                </View>

                {/* Footer Quote */}
                <Text
                    className="text-neutral-600 text-3xl font-black text-center mt-24 mb-12 tracking-tighter"
                    style={{ fontFamily: 'Inter_900Black' }}
                >
                    Keep turning pages,{"\n"}
                    keep growing.
                </Text>

            </ScrollView>
        </View>
    );
}
