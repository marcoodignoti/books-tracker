import { GlassCard } from "@/components/ui/GlassCard";
import { useBookStore } from "@/store/useBookStore";
import { BookStatus } from "@/types/book";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Play, Plus, Trash2 } from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const COVER_HEIGHT = SCREEN_HEIGHT * 0.55;

export default function BookDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const book = useBookStore((state) => state.getBookById(id || ""));
    const updateStatus = useBookStore((state) => state.updateStatus);
    const deleteBook = useBookStore((state) => state.deleteBook);
    const updateBook = useBookStore((state) => state.updateBook);
    const addNote = useBookStore((state) => state.addNote);
    const deleteNote = useBookStore((state) => state.deleteNote);

    const [showStatusOptions, setShowStatusOptions] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editAuthor, setEditAuthor] = useState("");
    const [editTotalPages, setEditTotalPages] = useState("");

    const [isNoteModalVisible, setNoteModalVisible] = useState(false);
    const [noteContent, setNoteContent] = useState("");
    const [notePage, setNotePage] = useState("");

    if (!book) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="text-white mt-4 font-bold">Loading Book...</Text>
            </View>
        );
    }

    const progress = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0;
    const pagesLeft = book.totalPages - book.currentPage;

    // --- Actions ---

    const handleBack = () => {
        if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    const handleStartReading = () => {
        if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push(`/session/${book.id}`);
    };

    const handleSetStatus = (status: BookStatus) => {
        if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
        updateStatus(book.id, status);
        setShowStatusOptions(false);
    };

    const handleDelete = () => {
        if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
            "Delete Book",
            "Are you sure you want to remove this book from your library?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteBook(book.id);
                        router.back();
                    },
                },
            ]
        );
    };

    // --- Edit Modal ---
    const openEditModal = () => {
        setEditTitle(book.title);
        setEditAuthor(book.author);
        setEditTotalPages(book.totalPages.toString());
        setEditModalVisible(true);
    };

    const saveEdit = () => {
        updateBook(book.id, {
            title: editTitle,
            author: editAuthor,
            totalPages: parseInt(editTotalPages) || 0,
        });
        setEditModalVisible(false);
        if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    // --- Notes ---
    const handleAddNote = () => {
        if (!noteContent.trim()) return;
        addNote(book.id, noteContent, notePage ? parseInt(notePage) : undefined);
        setNoteContent("");
        setNotePage("");
        setNoteModalVisible(false);
        if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const handleDeleteNote = (noteId: string) => {
        if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
        deleteNote(book.id, noteId);
    };

    return (
        <View className="flex-1 bg-black relative">

            {/* --- Background Cover --- */}
            <View className="absolute top-0 left-0 right-0 z-0" style={{ height: COVER_HEIGHT }}>
                {book.coverUrl ? (
                    <Image
                        source={{ uri: book.coverUrl }}
                        style={{ width: SCREEN_WIDTH, height: COVER_HEIGHT }}
                        contentFit="cover"
                        transition={500}
                    />
                ) : (
                    <LinearGradient
                        colors={["#262626", "#171717", "#000000"]}
                        style={{ flex: 1 }}
                    />
                )}
                <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.2)", "#000000"]}
                    locations={[0, 0.4, 1]}
                    style={{ position: "absolute", inset: 0 }}
                />
            </View>

            {/* --- Navbar --- */}
            <View
                className="absolute z-50 flex-row justify-between w-full px-4"
                style={{ top: insets.top + 10 }}
            >
                <Pressable onPress={handleBack} className="active:scale-90">
                    <GlassCard intensity={40} className="w-12 h-12 rounded-full items-center justify-center border-white/10">
                        <ChevronLeft size={24} color="white" />
                    </GlassCard>
                </Pressable>

                <Pressable onPress={openEditModal} className="active:scale-90">
                    <GlassCard intensity={40} className="px-4 h-12 rounded-full items-center justify-center border-white/10">
                        <Text className="text-white text-xs font-bold uppercase tracking-widest">Edit</Text>
                    </GlassCard>
                </Pressable>
            </View>

            {/* --- Content Scroll --- */}
            <ScrollView
                className="flex-1 z-10"
                contentContainerStyle={{ paddingTop: COVER_HEIGHT - 100, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="px-6">
                    {/* Floating Title Card */}
                    <GlassCard
                        intensity={60}
                        className="rounded-[32px] border-white/10 mb-6 overflow-hidden"
                        contentClassName="p-6"
                    >
                        {/* Status Badge */}
                        <Pressable
                            onPress={() => setShowStatusOptions(!showStatusOptions)}
                            className="self-start mb-4"
                        >
                            <GlassCard intensity={40} className="rounded-full border-white/10" contentClassName="px-3 py-1 bg-white/10">
                                <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                                    {book.status.replace(/-/g, " ")}
                                </Text>
                            </GlassCard>
                        </Pressable>

                        {/* Status Selector */}
                        {showStatusOptions && (
                            <View className="flex-row gap-2 mb-4">
                                {(["want-to-read", "reading", "finished"] as BookStatus[]).map((s) => (
                                    <Pressable
                                        key={s}
                                        onPress={() => handleSetStatus(s)}
                                        className={`px-3 py-2 rounded-lg border ${book.status === s ? "bg-white border-white" : "bg-transparent border-white/20"}`}
                                    >
                                        <Text className={`text-[10px] font-bold uppercase ${book.status === s ? "text-black" : "text-white"}`}>
                                            {s.replace(/-/g, " ")}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}

                        <Text
                            className="text-4xl font-black text-white leading-tight mb-2 tracking-tighter"
                            style={{ fontFamily: 'Inter_900Black' }}
                        >
                            {book.title}
                        </Text>
                        <Text className="text-lg text-neutral-400 font-medium mb-6">
                            {book.author}
                        </Text>

                        {/* Progress Bar */}
                        <View className="mb-2">
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Progress</Text>
                                <Text className="text-xs text-white font-bold uppercase tracking-widest">{Math.round(progress)}%</Text>
                            </View>
                            <View className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                <View
                                    className="h-full bg-white rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                            </View>
                            <Text className="text-[10px] text-neutral-500 mt-2 text-right">
                                {book.currentPage} / {book.totalPages} pages
                            </Text>
                        </View>

                        {/* Main Action Button */}
                        <Pressable
                            onPress={handleStartReading}
                            className="mt-4 active:scale-[0.98]"
                        >
                            <View className="bg-white rounded-2xl h-14 flex-row items-center justify-center gap-3">
                                <Play size={20} color="black" fill="black" />
                                <Text className="text-black text-sm font-black uppercase tracking-widest">Start Session</Text>
                            </View>
                        </Pressable>
                    </GlassCard>

                    {/* Stats Row */}
                    <View className="flex-row gap-4 mb-6">
                        <GlassCard intensity={20} className="flex-1 rounded-2xl p-4 border-white/5 items-center">
                            <Text className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-1">Left</Text>
                            <Text className="text-white text-xl font-black">{pagesLeft}</Text>
                            <Text className="text-neutral-400 text-[10px]">pages</Text>
                        </GlassCard>
                        <GlassCard intensity={20} className="flex-1 rounded-2xl p-4 border-white/5 items-center">
                            <Text className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-1">Sessions</Text>
                            <Text className="text-white text-xl font-black">{book.sessions?.length || 0}</Text>
                            <Text className="text-neutral-400 text-[10px]">total</Text>
                        </GlassCard>
                        <GlassCard intensity={20} className="flex-1 rounded-2xl p-4 border-white/5 items-center">
                            <Text className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-1">Time</Text>
                            <Text className="text-white text-xl font-black">
                                {Math.round((book.sessions?.reduce((acc, s) => acc + s.duration, 0) || 0) / 60)}
                            </Text>
                            <Text className="text-neutral-400 text-[10px]">mins</Text>
                        </GlassCard>
                    </View>

                    {/* Notes Section */}
                    <View className="mb-8">
                        <View className="flex-row justify-between items-center mb-4 px-2">
                            <Text className="text-white text-lg font-bold tracking-tight">Notes & Quotes</Text>
                            <Pressable
                                onPress={() => {
                                    if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
                                    setNoteModalVisible(true)
                                }}
                                className="bg-neutral-800 w-8 h-8 rounded-full items-center justify-center"
                            >
                                <Plus size={16} color="white" />
                            </Pressable>
                        </View>

                        {(!book.notes || book.notes.length === 0) ? (
                            <View className="items-center py-8 opacity-40">
                                <Text className="text-neutral-500">No notes yet.</Text>
                            </View>
                        ) : (
                            book.notes.slice().reverse().map((note) => (
                                <GlassCard
                                    key={note.id}
                                    intensity={15}
                                    className="mb-3 rounded-xl border-white/5"
                                    contentClassName="p-4"
                                >
                                    <View className="flex-row justify-between mb-2">
                                        {note.page && (
                                            <View className="bg-white/10 px-2 py-1 rounded">
                                                <Text className="text-[10px] text-white font-bold uppercase">Page {note.page}</Text>
                                            </View>
                                        )}
                                        <Pressable onPress={() => handleDeleteNote(note.id)} hitSlop={10}>
                                            <Trash2 size={14} color="#525252" />
                                        </Pressable>
                                    </View>
                                    <Text className="text-neutral-300 font-medium leading-relaxed">{note.content}</Text>
                                    <Text className="text-neutral-600 text-[10px] mt-2 text-right">
                                        {new Date(note.createdAt).toLocaleDateString()}
                                    </Text>
                                </GlassCard>
                            ))
                        )}
                    </View>

                    {/* Delete Button */}
                    <Pressable
                        onPress={handleDelete}
                        className="self-center mb-20 px-6 py-3 rounded-full bg-red-500/10 border border-red-500/20 active:bg-red-500/20"
                    >
                        <Text className="text-red-500 font-bold text-xs uppercase tracking-widest">Delete Book</Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Note Modal */}
            <Modal
                transparent
                visible={isNoteModalVisible}
                animationType="fade"
                onRequestClose={() => setNoteModalVisible(false)}
            >
                <View className="flex-1 bg-black/80 items-center justify-center px-6">
                    <GlassCard intensity={80} className="w-full rounded-3xl border-white/10" contentClassName="p-6">
                        <Text className="text-white font-bold text-xl mb-6 text-center">Add Note</Text>
                        <TextInput
                            className="bg-neutral-900/50 text-white p-4 rounded-xl mb-3 h-32 text-base"
                            placeholder="Write your thought or quote..."
                            placeholderTextColor="#525252"
                            multiline
                            textAlignVertical="top"
                            value={noteContent}
                            onChangeText={setNoteContent}
                            autoFocus
                        />
                        <TextInput
                            className="bg-neutral-900/50 text-white p-4 rounded-xl mb-6"
                            placeholder="Page number (optional)"
                            placeholderTextColor="#525252"
                            keyboardType="numeric"
                            value={notePage}
                            onChangeText={setNotePage}
                        />
                        <View className="flex-row gap-4">
                            <Pressable
                                onPress={() => setNoteModalVisible(false)}
                                className="flex-1 py-4 bg-neutral-800 rounded-xl items-center"
                            >
                                <Text className="text-white font-bold">Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleAddBook}
                                className="flex-1 py-4 bg-white rounded-xl items-center"
                            >
                                <Text className="text-black font-bold">Save Note</Text>
                            </Pressable>
                        </View>
                    </GlassCard>
                </View>
            </Modal>

            {/* Edit Modal (Similar structure if needed, or reused) */}
            {/* Keeping it simple for now, but ensure Edit functionality mocks exist above */}
        </View>
    );
}
