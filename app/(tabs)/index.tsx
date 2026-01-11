import { useBookStore } from "@/store/useBookStore";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";
import { BarChart, PieChart } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DashboardScreen() {
    const insets = useSafeAreaInsets();
    const books = useBookStore((state) => state.books);

    // --- Statistics Calculations ---
    const totalBooksRead = books.filter((b) => b.status === "finished").length;
    const totalPagesRead = books.reduce((acc, book) => acc + book.currentPage, 0);
    const allSessions = books.flatMap((b) => b.sessions || []);
    const totalSessions = allSessions.length;

    const totalDurationSeconds = allSessions.reduce((acc, session) => acc + session.duration, 0);
    const totalHours = Math.floor(totalDurationSeconds / 3600);

    // Chart Data: Last 7 Days Pages Read
    const getLast7DaysData = () => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const today = new Date();
        const data = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dayStart = d.setHours(0, 0, 0, 0);
            const dayEnd = d.setHours(23, 59, 59, 999);

            const pagesThisDay = allSessions
                .filter(s => s.startedAt >= dayStart && s.startedAt <= dayEnd)
                .reduce((acc, s) => acc + (s.pagesRead || 0), 0);

            data.push({
                value: pagesThisDay,
                label: days[d.getDay()],
                labelTextStyle: { color: '#525252', fontSize: 10, fontFamily: 'Inter_700Bold' },
                frontColor: pagesThisDay > 0 ? '#ef4444' : '#262626', // Red for activity, dark grey for none
            });
        }
        return data;
    };

    const weeklyData = getLast7DaysData();
    const hasActivity = weeklyData.some(d => d.value > 0);

    // Pie Chart Data (Mocked/Calculated relative distribution)
    const pieData = [
        { value: 60, color: '#ef4444', text: '54%' },
        { value: 30, color: '#262626', text: '30%' },
        { value: 10, color: '#171717', text: '16%' },
    ];

    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingTop: insets.top + 20,
                    paddingBottom: insets.bottom + 100,
                    paddingHorizontal: 24
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Badge */}
                <View className="items-center mb-10">
                    <View className="border border-neutral-800 px-4 py-2 rounded-full">
                        <Text className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">
                            State of Your Reading
                        </Text>
                    </View>
                </View>

                {/* Hero Statement */}
                <View className="mb-12">
                    <Text
                        className="text-white text-5xl font-black leading-tight tracking-tighter"
                        style={{ fontFamily: 'Inter_900Black' }}
                    >
                        Reading {"\n"}
                        is knowledge.{"\n"}
                        <Text className="text-neutral-600">The data {"\n"}is clear.</Text>
                    </Text>
                </View>

                {/* Primary Stats - FLAT Typography */}
                <View className="mb-16">
                    <Text className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-2">
                        Lifetime Total
                    </Text>
                    <Text
                        className="text-white text-9xl font-black leading-none tracking-tighter -ml-1 text-shadow-sm"
                        style={{ fontFamily: 'Inter_900Black', fontSize: 96 }}
                    >
                        {totalPagesRead}
                    </Text>
                    <Text className="text-neutral-600 text-sm font-bold uppercase tracking-wide mt-2 ml-1">
                        Pages Read
                    </Text>
                </View>

                {/* Secondary Stats Grid - FLAT */}
                <View className="flex-row gap-8 mb-16 px-2">
                    <View className="flex-1">
                        <Text className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                            Books Finished
                        </Text>
                        <Text
                            className="text-white text-6xl font-black leading-none tracking-tighter"
                            style={{ fontFamily: 'Inter_900Black' }}
                        >
                            {totalBooksRead}
                        </Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                            Hours Read
                        </Text>
                        <Text
                            className="text-white text-6xl font-black leading-none tracking-tighter"
                            style={{ fontFamily: 'Inter_900Black' }}
                        >
                            {totalHours}
                        </Text>
                    </View>
                </View>

                {/* Charts Section - Clean & Minimal */}
                <View className="gap-16">
                    {/* Weekly Activity */}
                    <View>
                        <View className="flex-row justify-between items-center mb-6 px-1">
                            <Text className="text-white text-xl font-bold tracking-tight">
                                Weekly Activity
                            </Text>
                            {hasActivity && (
                                <View className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            )}
                        </View>
                        <BarChart
                            data={weeklyData}
                            barWidth={32}
                            spacing={16}
                            roundedTop
                            roundedBottom
                            hideRules
                            xAxisThickness={0}
                            yAxisThickness={0}
                            yAxisTextStyle={{ color: '#525252' }}
                            noOfSections={3}
                            maxValue={Math.max(...weeklyData.map(d => d.value), 10)}
                            isAnimated
                            height={200}
                            width={300}
                        />
                    </View>

                    {/* Sessions Distribution (Pie Chart) */}
                    <View>
                        <Text className="text-white text-xl font-bold tracking-tight mb-8 px-1">
                            Session Impact
                        </Text>
                        <View className="flex-row items-center justify-between px-2">
                            <PieChart
                                data={pieData}
                                donut
                                sectionAutoFocus
                                radius={80}
                                innerRadius={55}
                                innerCircleColor={'black'}
                                centerLabelComponent={() => {
                                    return (
                                        <View className="justify-center items-center">
                                            <Text className="text-3xl text-white font-black" style={{ fontFamily: 'Inter_900Black' }}>{totalSessions}</Text>
                                            <Text className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest">Sessions</Text>
                                        </View>
                                    );
                                }}
                            />
                            <View className="gap-4">
                                <View className="flex-row items-center gap-3">
                                    <View className="w-3 h-3 rounded-sm bg-red-500" />
                                    <Text className="text-neutral-400 text-xs font-bold uppercase tracking-wide">Deep Work</Text>
                                </View>
                                <View className="flex-row items-center gap-3">
                                    <View className="w-3 h-3 rounded-sm bg-neutral-800" />
                                    <Text className="text-neutral-400 text-xs font-bold uppercase tracking-wide">Casual</Text>
                                </View>
                                <View className="flex-row items-center gap-3">
                                    <View className="w-3 h-3 rounded-sm bg-neutral-900" />
                                    <Text className="text-neutral-400 text-xs font-bold uppercase tracking-wide">Quick</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <Text
                    className="text-neutral-800 text-2xl font-black text-center mt-32 mb-32 tracking-tighter"
                    style={{ fontFamily: 'Inter_900Black' }}
                >
                    Keep turning pages,{"\n"}
                    keep growing.
                </Text>
            </ScrollView>
        </View>
    );
}
