import { BookImmersiveLayout } from "@/components/BookImmersiveLayout";
import { useBookStore } from "@/store/useBookStore";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Play, Settings, Trash2 } from "lucide-react-native";
import { useState } from "react";
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const COVER_HEIGHT = SCREEN_HEIGHT * 0.6;

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

    const book = useBookStore((state) => state.getBookById(id || ""));
    const updateStatus = useBookStore((state) => state.updateStatus);
    const updateBook = useBookStore((state) => state.updateBook);
    const deleteBook = useBookStore((state) => state.deleteBook);
    const addNote = useBookStore((state) => state.addNote);
    const deleteNote = useBookStore((state) => state.deleteNote);

    const [showStatusOptions, setShowStatusOptions] = useState(false);

    if (!book) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <Text className="text-white text-lg">Book not found</Text>
            </View>
        );
    }

    const progress = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0;
    const pagesLeft = book.totalPages - book.currentPage;

    const formatSessionDate = (isoDate: string): string => {
        const date = new Date(isoDate);
        return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.round(seconds / 60);
        return `${mins} min${mins !== 1 ? 's' : ''}`;
    };

    const sortedSessions = [...(book.sessions || [])].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

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
        if (book.status !== "reading") {
            updateStatus(book.id, "reading");
        }
        router.push(`/session/${book.id}`);
    };

    const handleEditStatus = () => {
        Haptics.selectionAsync();
        setShowStatusOptions(!showStatusOptions);
    };

    const handleSetStatus = (status: "want-to-read" | "reading" | "finished") => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        updateStatus(book.id, status);
        setShowStatusOptions(false);
    };

    const handleDelete = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Alert.alert(
            "Delete Book",
            `Are you sure you want to remove "${book.title}" from your library?`,
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
        <BookImmersiveLayout
            coverUrl={book.coverUrl}
            title={book.title}
            author={book.author}
            statsContent={
                <>
                    <View className="bg-white/10 px-4 py-2 rounded-full">
                        <Text className="text-base font-semibold text-white">
                            {Math.round(progress)}% Complete
                        </Text>
                    </View>
                    <View className="bg-white/10 px-4 py-2 rounded-full">
                        <Text className="text-base font-semibold text-white">
                            {pagesLeft} Pages Left
                        </Text>
                    </View>
                </>
            }
        >
            {showStatusOptions && (
                <View className="mb-4">
                    <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
                        Set Status
                    </Text>
                    <View className="flex-row gap-2">
                        <Pressable
                            onPress={() => handleSetStatus("want-to-read")}
                            className={`flex-1 py-3 rounded-xl items-center ${book.status === "want-to-read" ? "bg-neutral-900" : "bg-neutral-100"} active:scale-95`}
                        >
                            <Text className={`text-sm font-semibold ${book.status === "want-to-read" ? "text-white" : "text-neutral-700"}`}>
                                Want to Read
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => handleSetStatus("reading")}
                            className={`flex-1 py-3 rounded-xl items-center ${book.status === "reading" ? "bg-neutral-900" : "bg-neutral-100"} active:scale-95`}
                        >
                            <Text className={`text-sm font-semibold ${book.status === "reading" ? "text-white" : "text-neutral-700"}`}>
                                Reading
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => handleSetStatus("finished")}
                            className={`flex-1 py-3 rounded-xl items-center ${book.status === "finished" ? "bg-neutral-900" : "bg-neutral-100"} active:scale-95`}
                        >
                            <Text className={`text-sm font-semibold ${book.status === "finished" ? "text-white" : "text-neutral-700"}`}>
                                Finished
                            </Text>
                        </Pressable>
                    </View>
                </View>
            )}

            <View className="mb-4">
                <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
                    Reading History
                </Text>
                {sortedSessions.length > 0 ? (
                    <View>
                        {sortedSessions.slice(0, 5).map((session, index) => (
                            <View
                                key={session.id}
                                className={`py-3 ${index < Math.min(sortedSessions.length, 5) - 1 ? 'border-b border-neutral-100' : ''}`}
                            >
                                <Text className="text-sm text-neutral-600">
                                    {formatSessionDate(session.date)} • {formatDuration(session.durationSeconds)} • Page {session.startPage} → {session.endPage}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text className="text-sm text-neutral-400 py-3">
                        No sessions yet. Start reading!
                    </Text>
                )}
            </View>

            <Pressable
                onPress={handleStartReading}
                className="bg-neutral-900 py-4 rounded-2xl flex-row items-center justify-center gap-3 active:scale-[0.98] shadow-lg shadow-black/20 mb-3"
            >
                <Play size={22} color="#ffffff" fill="#ffffff" />
                <Text className="text-lg font-bold text-white">
                    Start Reading Session
                </Text>
            </Pressable>

            <Pressable
                onPress={handleEditStatus}
                className="bg-neutral-100 py-4 rounded-2xl flex-row items-center justify-center gap-3 active:scale-[0.98] mb-4"
            >
                <Settings size={20} color="#525252" />
                <Text className="text-base font-semibold text-neutral-600">
                    Edit Status
                </Text>
            </Pressable>

            <Pressable
                onPress={handleDelete}
                className="flex-row items-center justify-center gap-2 py-2 active:opacity-70"
            >
                <Trash2 size={16} color="#ef4444" />
                <Text className="text-sm font-medium text-red-500">
                    Delete Book
                </Text>
            </Pressable>
        </BookImmersiveLayout>
    );
}
