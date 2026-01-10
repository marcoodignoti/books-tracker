import { useBookStore } from "@/store/useBookStore";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BookOpen, ChevronLeft, Clock, Edit3, Play, Plus, Trash2, TrendingUp, X } from "lucide-react-native";
import { useState } from "react";
import {
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
}

export default function BookDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const book = useBookStore((state) => state.getBookById(id || ""));
    const updateProgress = useBookStore((state) => state.updateProgress);
    const updateStatus = useBookStore((state) => state.updateStatus);
    const updateBook = useBookStore((state) => state.updateBook);
    const deleteBook = useBookStore((state) => state.deleteBook);
    const addNote = useBookStore((state) => state.addNote);
    const deleteNote = useBookStore((state) => state.deleteNote);

    const [showPageInput, setShowPageInput] = useState(false);
    const [pageInput, setPageInput] = useState("");
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [noteContent, setNoteContent] = useState("");
    const [notePage, setNotePage] = useState("");
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editAuthor, setEditAuthor] = useState("");
    const [editPages, setEditPages] = useState("");

    if (!book) {
        return (
            <View className="flex-1 bg-neutral-900 items-center justify-center">
                <Text className="text-white text-lg">Book not found</Text>
            </View>
        );
    }

    const progress = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0;

    // Calculate statistics
    const sessions = book.sessions || [];
    const notes = book.notes || [];
    const totalReadingTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalPagesRead = sessions.reduce((sum, s) => sum + s.pagesRead, 0);
    const avgPagesPerHour = totalReadingTime > 0
        ? Math.round((totalPagesRead / totalReadingTime) * 3600)
        : 0;
    const pagesRemaining = book.totalPages - book.currentPage;
    const estimatedTimeRemaining = avgPagesPerHour > 0
        ? Math.round((pagesRemaining / avgPagesPerHour) * 3600)
        : 0;

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    const handleStartReading = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        updateStatus(book.id, "reading");
        router.push(`/session/${book.id}`);
    };

    const handleUpdatePage = () => {
        const newPage = parseInt(pageInput, 10);
        if (!isNaN(newPage) && newPage >= 0 && newPage <= book.totalPages) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            updateProgress(book.id, newPage);
            setShowPageInput(false);
            setPageInput("");
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const handleDelete = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        deleteBook(book.id);
        router.back();
    };

    const handleAddNote = () => {
        if (!noteContent.trim()) return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const page = notePage ? parseInt(notePage, 10) : undefined;
        addNote(book.id, { content: noteContent.trim(), page });
        setNoteContent("");
        setNotePage("");
        setShowNoteModal(false);
    };

    const handleDeleteNote = (noteId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        deleteNote(book.id, noteId);
    };

    const handleOpenEditModal = () => {
        setEditTitle(book.title);
        setEditAuthor(book.author);
        setEditPages(book.totalPages.toString());
        setShowEditModal(true);
    };

    const handleSaveEdit = () => {
        const pages = parseInt(editPages, 10);
        if (editTitle.trim() && editAuthor.trim() && !isNaN(pages) && pages > 0) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            updateBook(book.id, {
                title: editTitle.trim(),
                author: editAuthor.trim(),
                totalPages: pages,
            });
            setShowEditModal(false);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    return (
        <View className="flex-1 bg-neutral-900">
            {/* Background Cover */}
            <View className="absolute inset-0">
                {book.coverUrl ? (
                    <Image
                        source={{ uri: book.coverUrl }}
                        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
                        contentFit="cover"
                        blurRadius={20}
                    />
                ) : (
                    <View className="w-full h-full bg-neutral-800" />
                )}
                <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.95)"]}
                    locations={[0, 0.4, 1]}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                />
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom + 20,
                }}
            >
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-4">
                    <Pressable
                        onPress={handleBack}
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center active:scale-90"
                    >
                        <ChevronLeft size={24} color="#ffffff" />
                    </Pressable>
                    <View className="flex-row gap-2">
                        <Pressable
                            onPress={handleOpenEditModal}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center active:scale-90"
                        >
                            <Edit3 size={18} color="#ffffff" />
                        </Pressable>
                        <Pressable
                            onPress={handleDelete}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center active:scale-90"
                        >
                            <Trash2 size={20} color="#ef4444" />
                        </Pressable>
                    </View>
                </View>

                {/* Cover */}
                <View className="items-center mt-8 mb-8">
                    <View className="w-48 h-72 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
                        {book.coverUrl ? (
                            <Image
                                source={{ uri: book.coverUrl }}
                                style={{ width: "100%", height: "100%" }}
                                contentFit="cover"
                            />
                        ) : (
                            <View className="w-full h-full bg-neutral-700 items-center justify-center">
                                <BookOpen size={48} color="#a3a3a3" />
                            </View>
                        )}
                    </View>
                </View>

                {/* Book Info */}
                <View className="px-6">
                    <Text className="text-3xl font-bold text-white text-center mb-2">
                        {book.title}
                    </Text>
                    <Text className="text-lg text-white/70 text-center mb-8">
                        {book.author}
                    </Text>

                    {/* Progress */}
                    <View className="bg-white/10 rounded-2xl p-4 mb-4">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-xs font-bold uppercase tracking-widest text-white/50">
                                Progress
                            </Text>
                            <Text className="text-sm font-semibold text-white">
                                {Math.round(progress)}%
                            </Text>
                        </View>
                        <View className="h-3 bg-white/20 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-white rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </View>
                        <Text className="text-sm text-white/50 text-center mt-2">
                            {book.currentPage} of {book.totalPages} pages
                        </Text>
                    </View>

                    {/* Statistics */}
                    {sessions.length > 0 && (
                        <View className="bg-white/10 rounded-2xl p-4 mb-4">
                            <Text className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
                                Reading Stats
                            </Text>
                            <View className="flex-row gap-3">
                                <View className="flex-1 bg-white/10 rounded-xl p-3 items-center">
                                    <Clock size={18} color="#a3a3a3" />
                                    <Text className="text-lg font-bold text-white mt-1">
                                        {formatDuration(totalReadingTime)}
                                    </Text>
                                    <Text className="text-xs text-white/50">Total Time</Text>
                                </View>
                                <View className="flex-1 bg-white/10 rounded-xl p-3 items-center">
                                    <TrendingUp size={18} color="#a3a3a3" />
                                    <Text className="text-lg font-bold text-white mt-1">
                                        {sessions.length}
                                    </Text>
                                    <Text className="text-xs text-white/50">Sessions</Text>
                                </View>
                                {estimatedTimeRemaining > 0 && (
                                    <View className="flex-1 bg-white/10 rounded-xl p-3 items-center">
                                        <BookOpen size={18} color="#a3a3a3" />
                                        <Text className="text-lg font-bold text-white mt-1">
                                            {formatDuration(estimatedTimeRemaining)}
                                        </Text>
                                        <Text className="text-xs text-white/50">To Finish</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Update Page */}
                    {showPageInput ? (
                        <View className="bg-white/10 rounded-2xl p-4 mb-4">
                            <Text className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
                                Update Current Page
                            </Text>
                            <View className="flex-row items-center">
                                <TextInput
                                    className="flex-1 bg-white/20 rounded-xl px-4 py-3 text-white text-base"
                                    placeholder={`0 - ${book.totalPages}`}
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    keyboardType="number-pad"
                                    value={pageInput}
                                    onChangeText={setPageInput}
                                    autoFocus
                                />
                                <Pressable
                                    onPress={handleUpdatePage}
                                    className="ml-3 bg-white px-6 py-3 rounded-xl active:scale-95"
                                >
                                    <Text className="font-semibold text-neutral-900">Save</Text>
                                </Pressable>
                            </View>
                        </View>
                    ) : (
                        <Pressable
                            onPress={() => {
                                Haptics.selectionAsync();
                                setShowPageInput(true);
                            }}
                            className="bg-white/10 rounded-2xl p-4 mb-4 active:bg-white/15"
                        >
                            <Text className="text-base font-semibold text-white text-center">
                                Update Page Number
                            </Text>
                        </Pressable>
                    )}

                    {/* Notes Section */}
                    <View className="bg-white/10 rounded-2xl p-4 mb-4">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-xs font-bold uppercase tracking-widest text-white/50">
                                Notes & Quotes
                            </Text>
                            <Pressable
                                onPress={() => setShowNoteModal(true)}
                                className="w-8 h-8 bg-white/20 rounded-full items-center justify-center active:scale-90"
                            >
                                <Plus size={18} color="#ffffff" />
                            </Pressable>
                        </View>

                        {notes.length === 0 ? (
                            <Text className="text-white/50 text-center py-4">
                                No notes yet. Add your first note!
                            </Text>
                        ) : (
                            <View className="gap-2">
                                {notes.map((note) => (
                                    <View key={note.id} className="bg-white/10 rounded-xl p-3">
                                        <Text className="text-white text-sm mb-2">{note.content}</Text>
                                        <View className="flex-row items-center justify-between">
                                            {note.page && (
                                                <Text className="text-xs text-white/50">Page {note.page}</Text>
                                            )}
                                            <Pressable
                                                onPress={() => handleDeleteNote(note.id)}
                                                className="px-2 py-1 active:opacity-50"
                                            >
                                                <Trash2 size={14} color="#ef4444" />
                                            </Pressable>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Start Session Button */}
                    <Pressable
                        onPress={handleStartReading}
                        className="bg-white rounded-2xl py-4 flex-row items-center justify-center gap-3 active:scale-[0.98] shadow-xl shadow-black/30"
                    >
                        <Play size={24} color="#171717" fill="#171717" />
                        <Text className="text-lg font-bold text-neutral-900">
                            Start Reading Session
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Add Note Modal */}
            <Modal visible={showNoteModal} transparent animationType="slide">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    <View className="flex-1 bg-black/50 justify-end">
                        <View className="bg-neutral-900 rounded-t-3xl p-6" style={{ paddingBottom: insets.bottom + 16 }}>
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-xl font-bold text-white">Add Note</Text>
                                <Pressable onPress={() => setShowNoteModal(false)}>
                                    <X size={24} color="#ffffff" />
                                </Pressable>
                            </View>
                            <TextInput
                                className="bg-white/10 rounded-xl px-4 py-3 text-white text-base mb-3"
                                placeholder="Your note or quote..."
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                multiline
                                numberOfLines={4}
                                value={noteContent}
                                onChangeText={setNoteContent}
                                style={{ minHeight: 100, textAlignVertical: 'top' }}
                            />
                            <TextInput
                                className="bg-white/10 rounded-xl px-4 py-3 text-white text-base mb-4"
                                placeholder="Page number (optional)"
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                keyboardType="number-pad"
                                value={notePage}
                                onChangeText={setNotePage}
                            />
                            <Pressable
                                onPress={handleAddNote}
                                className="bg-white rounded-xl py-3 items-center active:scale-[0.98]"
                            >
                                <Text className="text-lg font-bold text-neutral-900">Save Note</Text>
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Edit Book Modal */}
            <Modal visible={showEditModal} transparent animationType="slide">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    <View className="flex-1 bg-black/50 justify-end">
                        <View className="bg-neutral-900 rounded-t-3xl p-6" style={{ paddingBottom: insets.bottom + 16 }}>
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-xl font-bold text-white">Edit Book</Text>
                                <Pressable onPress={() => setShowEditModal(false)}>
                                    <X size={24} color="#ffffff" />
                                </Pressable>
                            </View>
                            <Text className="text-xs text-white/50 mb-1 ml-1">Title</Text>
                            <TextInput
                                className="bg-white/10 rounded-xl px-4 py-3 text-white text-base mb-3"
                                placeholder="Book title"
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                value={editTitle}
                                onChangeText={setEditTitle}
                            />
                            <Text className="text-xs text-white/50 mb-1 ml-1">Author</Text>
                            <TextInput
                                className="bg-white/10 rounded-xl px-4 py-3 text-white text-base mb-3"
                                placeholder="Author name"
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                value={editAuthor}
                                onChangeText={setEditAuthor}
                            />
                            <Text className="text-xs text-white/50 mb-1 ml-1">Total Pages</Text>
                            <TextInput
                                className="bg-white/10 rounded-xl px-4 py-3 text-white text-base mb-4"
                                placeholder="Number of pages"
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                keyboardType="number-pad"
                                value={editPages}
                                onChangeText={setEditPages}
                            />
                            <Pressable
                                onPress={handleSaveEdit}
                                className="bg-white rounded-xl py-3 items-center active:scale-[0.98]"
                            >
                                <Text className="text-lg font-bold text-neutral-900">Save Changes</Text>
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
