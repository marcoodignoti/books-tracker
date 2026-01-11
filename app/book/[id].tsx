import { BookImmersiveLayout } from "@/components/BookImmersiveLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { useBookStore } from "@/store/useBookStore";
import { BookStatus } from "@/types/book";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Play, Plus, Trash2 } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    Pressable,
    Text,
    TextInput,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const COVER_HEIGHT = SCREEN_HEIGHT * 0.55;

export default function BookDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

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
            <View className="flex-1 bg-white dark:bg-black items-center justify-center">
                <ActivityIndicator size="large" color={isDark ? "#ffffff" : "#000000"} />
                <Text className="text-black dark:text-white mt-4 font-bold">Loading Book...</Text>
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
        addNote(book.id, {
            content: noteContent,
            page: notePage ? parseInt(notePage) : undefined
        });
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
        <View className="flex-1 bg-white dark:bg-black relative">

            {/* --- Navbar (Back & Edit) --- */}
            <View
                className="absolute z-50 flex-row justify-between w-full px-4"
                style={{ top: 44 }}
            >
                <Pressable onPress={handleBack} className="active:scale-90">
                    <GlassCard
                        intensity={23}
                        className="w-12 h-12 rounded-full border-black/10 dark:border-white/10"
                        contentClassName="items-center justify-center"
                    >
                        <ChevronLeft size={24} color={isDark ? "white" : "black"} />
                    </GlassCard>
                </Pressable>

                <Pressable onPress={openEditModal} className="active:scale-90">
                    <GlassCard
                        intensity={23}
                        className="px-5 h-12 rounded-full border-black/10 dark:border-white/10"
                        contentClassName="items-center justify-center"
                    >
                        <Text className="text-black dark:text-white text-sm font-bold uppercase tracking-wide">Edit</Text>
                    </GlassCard>
                </Pressable>
            </View>

            <BookImmersiveLayout
                coverUrl={book.coverUrl}
                title={book.title}
                author={book.author}
                statsContent={
                    <>
                        {/* Status Pill (Interactive) */}
                        <Pressable onPress={() => setShowStatusOptions(!showStatusOptions)}>
                            <View className="bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
                                <Text className="text-xs font-bold text-white uppercase tracking-wider">
                                    {book.status.replace(/-/g, " ")}
                                </Text>
                            </View>
                        </Pressable>

                        {/* Page Count */}
                        {book.totalPages > 0 && (
                            <View className="bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
                                <Text className="text-xs font-bold text-white uppercase tracking-wider">
                                    {book.totalPages} Pages
                                </Text>
                            </View>
                        )}
                    </>
                }
                footer={
                    <Pressable
                        onPress={handleStartReading}
                        className="active:scale-[0.98]"
                    >
                        <View className="bg-black dark:bg-white rounded-2xl h-14 flex-row items-center justify-center gap-3 shadow-md shadow-black/20">
                            <Play size={20} color={isDark ? "black" : "white"} fill={isDark ? "black" : "white"} />
                            <Text className="text-white dark:text-black text-sm font-bold uppercase tracking-wide">Start Session</Text>
                        </View>
                    </Pressable>
                }
            >
                {/* Status Options Dropdown (if visible, show here or in modal? visual hierarchy...) 
                    In correct flow, status options might be better as a modal or a section here.
                    Let's render them here if toggled.
                */}
                {showStatusOptions && (
                    <View className="flex-row gap-2 mb-6 flex-wrap justify-center">
                        {(["want-to-read", "reading", "finished"] as BookStatus[]).map((s) => (
                            <Pressable
                                key={s}
                                onPress={() => handleSetStatus(s)}
                                className={`px-4 py-2 rounded-lg border ${book.status === s ? (isDark ? "bg-white border-white" : "bg-black border-black") : "bg-transparent border-black/10 dark:border-white/10"}`}
                            >
                                <Text className={`text-[10px] font-bold uppercase ${book.status === s ? (isDark ? "text-black" : "text-white") : "text-black dark:text-white"}`}>
                                    {s.replace(/-/g, " ")}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                )}

                {/* Progress Section */}
                <View className="mb-8 mt-2">
                    <View className="flex-row justify-between mb-2 px-1">
                        <Text className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wide">Progress</Text>
                        <Text className="text-xs text-black dark:text-white font-bold uppercase tracking-wide">{Math.round(progress)}%</Text>
                    </View>
                    <View className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                        <View
                            className="h-full bg-black dark:bg-white rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </View>
                    <Text className="text-[10px] text-neutral-500 mt-2 text-right font-medium">
                        {book.currentPage} / {book.totalPages} pages
                    </Text>
                </View>

                {/* Stats Grid */}
                <View className="flex-row gap-4 mb-8">
                    <GlassCard intensity={10} className="flex-1 rounded-2xl p-4 items-center border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-white/5">
                        <Text className="text-neutral-500 text-[10px] font-bold uppercase tracking-wide mb-1">Left</Text>
                        <Text className="text-black dark:text-white text-xl font-bold">{pagesLeft}</Text>
                        <Text className="text-neutral-400 text-[10px]">pages</Text>
                    </GlassCard>
                    <GlassCard intensity={10} className="flex-1 rounded-2xl p-4 items-center border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-white/5">
                        <Text className="text-neutral-500 text-[10px] font-bold uppercase tracking-wide mb-1">Sessions</Text>
                        <Text className="text-black dark:text-white text-xl font-bold">{book.sessions?.length || 0}</Text>
                        <Text className="text-neutral-400 text-[10px]">total</Text>
                    </GlassCard>
                    <GlassCard intensity={10} className="flex-1 rounded-2xl p-4 items-center border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-white/5">
                        <Text className="text-neutral-500 text-[10px] font-bold uppercase tracking-wide mb-1">Time</Text>
                        <Text className="text-black dark:text-white text-xl font-bold">
                            {Math.round((book.sessions?.reduce((acc, s) => acc + s.duration, 0) || 0) / 60)}
                        </Text>
                        <Text className="text-neutral-400 text-[10px]">mins</Text>
                    </GlassCard>
                </View>

                {/* Notes Section */}
                <View className="mb-8">
                    <View className="flex-row justify-between items-center mb-4 px-1">
                        <Text className="text-black dark:text-white text-base font-bold">Notes & Quotes</Text>
                        <Pressable
                            onPress={() => {
                                if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
                                setNoteModalVisible(true)
                            }}
                            className="bg-neutral-100 dark:bg-neutral-800 w-8 h-8 rounded-full items-center justify-center border border-black/5 dark:border-white/5 active:bg-neutral-200"
                        >
                            <Plus size={16} color={isDark ? "white" : "black"} />
                        </Pressable>
                    </View>

                    {(!book.notes || book.notes.length === 0) ? (
                        <View className="items-center py-6 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
                            <Text className="text-neutral-400 font-medium text-xs">No notes yet</Text>
                        </View>
                    ) : (
                        book.notes.slice().reverse().map((note) => (
                            <View
                                key={note.id}
                                className="mb-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 p-5 border border-black/5 dark:border-white/5"
                            >
                                <View className="flex-row justify-between mb-2">
                                    {note.page && (
                                        <View className="bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                                            <Text className="text-[10px] text-black dark:text-white font-bold uppercase">Page {note.page}</Text>
                                        </View>
                                    )}
                                    <Pressable onPress={() => handleDeleteNote(note.id)} hitSlop={10}>
                                        <Trash2 size={14} color="#a3a3a3" />
                                    </Pressable>
                                </View>
                                <Text className="text-black dark:text-neutral-300 font-medium leading-relaxed my-1">{note.content}</Text>
                                <Text className="text-neutral-400 text-[10px] mt-2 text-right">
                                    {new Date(note.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Delete Button */}
                <Pressable
                    onPress={handleDelete}
                    className="self-center mb-8 px-6 py-3 rounded-full bg-red-500/5 border border-red-500/10 active:bg-red-500/10"
                >
                    <Text className="text-red-500 font-bold text-xs uppercase tracking-widest">Delete Book</Text>
                </Pressable>

            </BookImmersiveLayout>

            {/* Note Modal */}
            <Modal
                transparent
                visible={isNoteModalVisible}
                animationType="fade"
                onRequestClose={() => setNoteModalVisible(false)}
            >
                <View className="flex-1 bg-black/40 items-center justify-center px-6">
                    <View className="w-full bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-xl border border-black/5 dark:border-white/10">
                        <Text className="text-black dark:text-white font-bold text-xl mb-6 text-center">Add Note</Text>
                        <TextInput
                            className="bg-neutral-100 dark:bg-black/50 text-black dark:text-white p-4 rounded-xl mb-3 h-32 text-base"
                            placeholder="Write your thought or quote..."
                            placeholderTextColor="#a3a3a3"
                            multiline
                            textAlignVertical="top"
                            value={noteContent}
                            onChangeText={setNoteContent}
                            autoFocus
                        />
                        <TextInput
                            className="bg-neutral-100 dark:bg-black/50 text-black dark:text-white p-4 rounded-xl mb-6"
                            placeholder="Page number (optional)"
                            placeholderTextColor="#a3a3a3"
                            keyboardType="numeric"
                            value={notePage}
                            onChangeText={setNotePage}
                        />
                        <View className="flex-row gap-4">
                            <Pressable
                                onPress={() => setNoteModalVisible(false)}
                                className="flex-1 py-4 bg-neutral-200 dark:bg-neutral-800 rounded-xl items-center"
                            >
                                <Text className="text-black dark:text-white font-bold">Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleAddNote}
                                className="flex-1 py-4 bg-black dark:bg-white rounded-xl items-center"
                            >
                                <Text className="text-white dark:text-black font-bold">Save Note</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Modal */}
            <Modal
                transparent
                visible={isEditModalVisible}
                animationType="fade"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View className="flex-1 bg-black/40 items-center justify-center px-6">
                    <View className="w-full bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-xl border border-black/5 dark:border-white/10">
                        <Text className="text-black dark:text-white font-bold text-xl mb-6 text-center">Edit Book</Text>

                        <View className="w-full gap-4 mb-6">
                            <View>
                                <Text className="text-neutral-500 dark:text-neutral-400 text-xs font-bold uppercase mb-2">Title</Text>
                                <TextInput
                                    className="bg-neutral-100 dark:bg-black/50 text-black dark:text-white p-4 rounded-xl text-base"
                                    value={editTitle}
                                    onChangeText={setEditTitle}
                                />
                            </View>
                            <View>
                                <Text className="text-neutral-500 dark:text-neutral-400 text-xs font-bold uppercase mb-2">Author</Text>
                                <TextInput
                                    className="bg-neutral-100 dark:bg-black/50 text-black dark:text-white p-4 rounded-xl text-base"
                                    value={editAuthor}
                                    onChangeText={setEditAuthor}
                                />
                            </View>
                            <View>
                                <Text className="text-neutral-500 dark:text-neutral-400 text-xs font-bold uppercase mb-2">Total Pages</Text>
                                <TextInput
                                    className="bg-neutral-100 dark:bg-black/50 text-black dark:text-white p-4 rounded-xl text-base"
                                    value={editTotalPages}
                                    onChangeText={setEditTotalPages}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View className="flex-row gap-4">
                            <Pressable
                                onPress={() => setEditModalVisible(false)}
                                className="flex-1 py-4 bg-neutral-200 dark:bg-neutral-800 rounded-xl items-center"
                            >
                                <Text className="text-black dark:text-white font-bold">Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={saveEdit}
                                className="flex-1 py-4 bg-black dark:bg-white rounded-xl items-center"
                            >
                                <Text className="text-white dark:text-black font-bold">Save Changes</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );

}
