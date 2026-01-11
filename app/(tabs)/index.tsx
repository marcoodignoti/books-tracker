import { GlassCard } from "@/components/ui/GlassCard";
import { useBookStore } from "@/store/useBookStore";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { ScrollView, Text, View } from "react-native";
import { BarChart, PieChart } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DashboardScreen() {
    const insets = useSafeAreaInsets();
    const books = useBookStore((state) => state.books);
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

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
                // Revert to softer font weight
                labelTextStyle: { color: isDark ? '#a3a3a3' : '#737373', fontSize: 10, fontFamily: 'Inter_600SemiBold' },
                frontColor: pagesThisDay > 0 ? '#ef4444' : (isDark ? '#262626' : '#e5e5e5'),
            });
        }
        return data;
    };

    const weeklyData = getLast7DaysData();
    const hasActivity = weeklyData.some(d => d.value > 0);

    // Pie Chart Data
    const pieData = [
        { value: 60, color: '#ef4444', text: '54%' },
        { value: 30, color: isDark ? '#262626' : '#d4d4d4', text: '30%' },
        { value: 10, color: isDark ? '#171717' : '#a3a3a3', text: '16%' },
    ];

    return (
        <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: insets.top }}>
            <StatusBar style={isDark ? "light" : "dark"} />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 100,
                    paddingHorizontal: 0, // Reset horizontal padding to allow full-width cards with margins
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Standard Header (Matches Library) */}
                <View className="flex-row items-end justify-between px-6 pb-8 pt-4">
                    <Text
                        className="text-4xl font-bold text-black dark:text-white"
                        style={{ fontFamily: 'Inter_700Bold' }}
                    >
                        Dashboard
                    </Text>
                </View>

                {/* Hero Stats Card */}
                <View className="px-6 mb-8">
                    <GlassCard
                        intensity={30}
                        className="rounded-[32px] overflow-hidden border-black/5 dark:border-white/10"
                        contentClassName="p-8 items-center"
                    >
                        <Text className="text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                            Lifetime Pages
                        </Text>
                        <Text
                            className="text-black dark:text-white text-7xl font-black leading-none mb-1"
                            style={{ fontFamily: 'Inter_700Bold' }}
                        >
                            {totalPagesRead.toLocaleString()}
                        </Text>

                        <View className="flex-row gap-12 mt-8 w-full justify-center">
                            <View className="items-center">
                                <Text
                                    className="text-black dark:text-white text-3xl font-bold leading-none"
                                    style={{ fontFamily: 'Inter_700Bold' }}
                                >
                                    {totalBooksRead}
                                </Text>
                                <Text className="text-neutral-400 text-[10px] font-bold uppercase tracking-wide mt-2">
                                    Books
                                </Text>
                            </View>
                            <View className="w-[1px] h-12 bg-black/5 dark:bg-white/10" />
                            <View className="items-center">
                                <Text
                                    className="text-black dark:text-white text-3xl font-bold leading-none"
                                    style={{ fontFamily: 'Inter_700Bold' }}
                                >
                                    {totalHours}
                                </Text>
                                <Text className="text-neutral-400 text-[10px] font-bold uppercase tracking-wide mt-2">
                                    Hours
                                </Text>
                            </View>
                        </View>
                    </GlassCard>
                </View>

                {/* Charts Grid */}
                <View className="px-6 gap-6">
                    {/* Weekly Activity */}
                    <GlassCard
                        intensity={20}
                        className="rounded-[32px] overflow-hidden border-black/5 dark:border-white/5"
                        contentClassName="p-6"
                    >
                        <View className="flex-row justify-between items-center mb-6 px-1">
                            <Text className="text-black dark:text-white text-lg font-bold">
                                Weekly Activity
                            </Text>
                        </View>
                        <BarChart
                            data={weeklyData}
                            barWidth={28}
                            spacing={20}
                            roundedTop
                            roundedBottom
                            hideRules
                            xAxisThickness={0}
                            yAxisThickness={0}
                            yAxisTextStyle={{ color: isDark ? '#525252' : '#a3a3a3', fontSize: 10, fontWeight: '600' }}
                            noOfSections={3}
                            maxValue={Math.max(...weeklyData.map(d => d.value), 10)}
                            isAnimated
                            height={180}
                            width={280} // Explicit width to fit in card
                        // Use explicit props for bar styling if necessary, but data handles frontColor
                        />
                    </GlassCard>

                    {/* Sessions Distribution */}
                    <GlassCard
                        intensity={20}
                        className="rounded-[32px] overflow-hidden border-black/5 dark:border-white/5"
                        contentClassName="p-6"
                    >
                        <Text className="text-black dark:text-white text-lg font-bold mb-8 px-1">
                            Session Impact
                        </Text>
                        <View className="flex-row items-center justify-between">
                            <PieChart
                                data={pieData}
                                donut
                                sectionAutoFocus
                                radius={70}
                                innerRadius={50}
                                innerCircleColor={'transparent'} // Transparent inner circle for glass effect
                                centerLabelComponent={() => {
                                    return (
                                        <View className="justify-center items-center">
                                            <Text className="text-3xl text-black dark:text-white font-black" style={{ fontFamily: 'Inter_700Bold' }}>{totalSessions}</Text>
                                        </View>
                                    );
                                }}
                            />
                            <View className="gap-4 mr-2">
                                <View className="flex-row items-center gap-3">
                                    <View className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                                    <Text className="text-neutral-600 dark:text-neutral-400 text-xs font-bold">Deep Work</Text>
                                </View>
                                <View className="flex-row items-center gap-3">
                                    <View className="w-3 h-3 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                                    <Text className="text-neutral-600 dark:text-neutral-400 text-xs font-bold">Casual</Text>
                                </View>
                                <View className="flex-row items-center gap-3">
                                    <View className="w-3 h-3 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                                    <Text className="text-neutral-600 dark:text-neutral-400 text-xs font-bold">Quick</Text>
                                </View>
                            </View>
                        </View>
                    </GlassCard>
                </View>

                {/* Footer */}
                <Text
                    className="text-neutral-400 dark:text-neutral-600 text-base font-semibold text-center mt-12 mb-8 tracking-wide"
                // Removed extra bold font face for a slightly softer finish
                >
                    Keep turning pages.
                </Text>
            </ScrollView>
        </View>
    );
}
