import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Modal, Image, TouchableWithoutFeedback, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme as useAppTheme, useSecurityTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { CustomHeader } from '../../components/common/CustomHeader';
import { CustomAlertModal } from '../../components/common/CustomAlertModal';
import { ChatBubble } from '../../components/chat/ChatBubble';
import { fetchChatMessages, sendMessage, uploadChatAttachment, subscribeToChatRoom, sendTypingStatus, markMessagesAsRead, deleteMessages, editMessage, getParticipantInfo, ChatMessage } from '../../services/chat/chatService';

export default function ChatRoomScreen() {
    const router = useRouter();
    const { id: sessionId, otherName, otherId, otherAvatar } = useLocalSearchParams<{ id: string, otherName: string, otherId: string, otherAvatar: string }>();

    const { user, profile } = useAuth();
    const isSecurity = profile?.role === 'security';
    const appTheme = useAppTheme();
    const securityTheme = useSecurityTheme();
    const { colors, isDark } = isSecurity ? securityTheme : appTheme;
    const insets = useSafeAreaInsets();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [alertVisible, setAlertVisible] = useState(false);
    const [otherIsTyping, setOtherIsTyping] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // V6 States
    const [selectedMessages, setSelectedMessages] = useState<ChatMessage[]>([]);
    const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [otherParticipantInfo, setOtherParticipantInfo] = useState<any>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const flatListRef = useRef<FlatList>(null);
    const channelRef = useRef<any>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const myTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (sessionId && user?.id) {
            loadMessages();
            markMessagesAsRead(sessionId, user.id);

            const channel = subscribeToChatRoom(
                sessionId,
                (payload: any) => {
                    if (payload.eventType === 'INSERT') {
                        const newMsg = payload.new as ChatMessage;
                        if (newMsg.sender_id === user.id) return; // Skip own realtime updates to avoid dupes

                        setMessages(prev => {
                            if (prev.some(m => m.id === newMsg.id)) return prev;
                            return [newMsg, ...prev];
                        });
                        markMessagesAsRead(sessionId, user.id);
                    } else if (payload.eventType === 'UPDATE') {
                        const newMsg = payload.new as ChatMessage;
                        setMessages(prev => prev.map(msg => msg.id === newMsg.id ? newMsg : msg));
                    } else if (payload.eventType === 'DELETE') {
                        const oldMsg = payload.old as ChatMessage;
                        setMessages(prev => prev.filter(msg => msg.id !== oldMsg.id));
                    }
                },
                (payload) => {
                    if (payload.userId !== user.id) {
                        setOtherIsTyping(payload.isTyping);
                        if (payload.isTyping) {
                            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                            typingTimeoutRef.current = setTimeout(() => {
                                setOtherIsTyping(false);
                            }, 5000); // 5s fallback clear
                        }
                    }
                }
            );

            channelRef.current = channel;

            return () => {
                channel.unsubscribe();
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                if (myTypingTimeoutRef.current) clearTimeout(myTypingTimeoutRef.current);
            };
        }
    }, [sessionId, user?.id]);

    useEffect(() => {
        if (otherId) {
            getParticipantInfo(otherId as string).then(info => {
                if (info) setOtherParticipantInfo(info);
            });
        }
    }, [otherId]);

    const getFormattedSenderName = () => {
        const defaultName = decodeURIComponent(otherName || 'User');
        if (!otherParticipantInfo) return defaultName;

        const role = otherParticipantInfo.role;
        const complexName = otherParticipantInfo.housing_complexes?.name || '';

        if (role === 'admin') {
            return `${defaultName}  ADMIN | ${complexName}`.trim();
        } else if (role === 'security') {
            return `(${defaultName} | securiti)`.toUpperCase();
        } else {
            return `${defaultName}  WARGA | ${complexName}`.trim();
        }
    };

    const loadMessages = async () => {
        if (!sessionId || !user?.id) return;
        try {
            const data = await fetchChatMessages(sessionId, user.id);
            // Backend returns ascending. For inverted FlatList, we need descending.
            setMessages(data ? data.reverse() : []);
        } catch (error) {
            console.error('Error fetching messages', error);
        }
    };

    const handleTextChange = (text: string) => {
        setInputText(text);
        if (!sessionId || !user?.id) return;

        sendTypingStatus(channelRef.current, user.id, true);

        if (myTypingTimeoutRef.current) clearTimeout(myTypingTimeoutRef.current);
        myTypingTimeoutRef.current = setTimeout(() => {
            sendTypingStatus(channelRef.current, user.id, false);
        }, 2000);
    };

    const handleSend = async () => {
        if (!inputText.trim() || !sessionId || !user?.id) return;

        const textToSend = inputText.trim();
        setInputText('');

        sendTypingStatus(channelRef.current, user.id, false);
        if (myTypingTimeoutRef.current) clearTimeout(myTypingTimeoutRef.current);

        // Edit Mode
        if (editingMessage) {
            try {
                // Optimistic visual update
                setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, message: textToSend, is_edited: true } : m));
                await editMessage(editingMessage.id, textToSend);
            } catch (error) {
                console.error('Failed to edit message', error);
            } finally {
                setEditingMessage(null);
            }
            return;
        }

        // 🟢 OPTIMISTIC UI: Add immediately
        const tempMsg: ChatMessage = {
            id: `temp-${Date.now()}`,
            session_id: sessionId,
            sender_id: user.id,
            message: textToSend,
            is_read: false,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [tempMsg, ...prev]);

        try {
            const sentMsg = await sendMessage(sessionId, user.id, textToSend);
            // Replace temporary message with actual DB record
            setMessages(prev => prev.map(m => m.id === tempMsg.id ? sentMsg : m));
        } catch (error) {
            console.error('Failed to send message', error);
            // Optionally remove the temp message or mark as failed
        }
    };

    const handleCapturePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Akses kamera dibutuhkan!');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: 'images',
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            handleUploadAttachment(result.assets[0].uri, 'image/jpeg', 'jpg');
        }
    };

    const handlePickImage = async () => {
        setShowAttachMenu(false);
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            handleUploadAttachment(result.assets[0].uri, 'image/jpeg', 'jpg');
        }
    };

    const handlePickDocument = async () => {
        setShowAttachMenu(false);
        const result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const ext = asset.name.split('.').pop() || 'tmp';
            handleUploadAttachment(asset.uri, asset.mimeType || 'application/octet-stream', ext, asset.name);
        }
    };

    const handleUploadAttachment = async (uri: string, mimeType: string, ext: string, fileName?: string) => {
        if (!sessionId || !user?.id) return;
        setIsUploading(true);
        try {
            const tempId = `temp-upload-${Date.now()}`;
            const msgPrefix = fileName ? `[DOCUMENT]${tempId}|Mengunggah...` : `[IMAGE]${uri}`;

            // Send optimistically
            const tempMsg: ChatMessage = {
                id: tempId,
                session_id: sessionId,
                sender_id: user.id,
                message: msgPrefix,
                is_read: false,
                created_at: new Date().toISOString()
            };
            setMessages(prev => [tempMsg, ...prev]);

            const url = await uploadChatAttachment(uri, sessionId, ext, mimeType);
            const actualMsgContent = fileName ? `[DOCUMENT]${url}|${fileName}` : `[IMAGE]${url}`;

            const sentMsg = await sendMessage(sessionId, user.id, actualMsgContent);
            setMessages(prev => prev.map(m => m.id === tempId ? sentMsg : m));
        } catch (error) {
            console.error('Failed to upload attachment', error);
            alert('Gagal mengunggah file.');
            // Remove temp loading message
            setMessages(prev => prev.filter(m => !m.id.startsWith('temp-upload-')));
        } finally {
            setIsUploading(false);
        }
    };

    // V6 SELECTION & ACTION LOGIC
    const handleLongPress = (id: string, message: string, isOwn: boolean) => {
        const msgObj = messages.find(m => m.id === id);
        if (msgObj) {
            setSelectedMessages(prev => prev.includes(msgObj) ? prev.filter(m => m.id !== id) : [...prev, msgObj]);
        }
    };

    const handleBubblePress = (id: string) => {
        if (selectedMessages.length > 0) {
            const msgObj = messages.find(m => m.id === id);
            if (msgObj) {
                setSelectedMessages(prev => prev.includes(msgObj) ? prev.filter(m => m.id !== id) : [...prev, msgObj]);
            }
        }
    };

    const initiateEdit = () => {
        if (selectedMessages.length === 1) {
            setEditingMessage(selectedMessages[0]);
            setInputText(selectedMessages[0].message);
            setSelectedMessages([]);
        }
    };

    const confirmDelete = () => {
        setShowDeleteModal(true);
    };

    const executeDelete = async (type: 'me' | 'everyone') => {
        if (!user?.id) return;
        const idsToDelete = selectedMessages.map(m => m.id);
        try {
            await deleteMessages(idsToDelete, type, user.id);
            if (type === 'me') {
                setMessages(prev => prev.filter(m => !idsToDelete.includes(m.id)));
            }
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Gagal menghapus pesan.');
        } finally {
            setSelectedMessages([]);
        }
    };

    const isSelectionMode = selectedMessages.length > 0;
    const canEdit = selectedMessages.length === 1 &&
        selectedMessages[0].sender_id === user?.id &&
        !selectedMessages[0].message.startsWith('[IMAGE]') &&
        !selectedMessages[0].message.startsWith('[DOCUMENT]');

    const renderItem = ({ item }: { item: ChatMessage }) => {
        const isOwnMessage = item.sender_id === user?.id;
        const date = new Date(item.created_at);
        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let msgStatus: 'sending' | 'sent' | 'read' | undefined;
        if (isOwnMessage) {
            if (item.id.startsWith('temp-')) {
                msgStatus = 'sending';
            } else if (item.is_read) {
                msgStatus = 'read';
            } else {
                msgStatus = 'sent';
            }
        }

        return (
            <ChatBubble
                id={item.id}
                message={item.message}
                isOwnMessage={isOwnMessage}
                time={timeString}
                senderName={!isOwnMessage ? getFormattedSenderName() : undefined}
                status={msgStatus}
                onImagePress={(url) => setSelectedImage(url)}
                onLongPress={handleLongPress}
                onPress={handleBubblePress}
                isSelected={selectedMessages.some(m => m.id === item.id)}
                isSelectionMode={isSelectionMode}
                isEdited={item.is_edited}
                colors={colors}
            />
        );
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            keyboardVerticalOffset={0}
        >
            <SafeAreaView edges={['top']} style={styles.container}>
                {isSelectionMode ? (
                    <View style={[styles.selectionHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                        <TouchableOpacity onPress={() => setSelectedMessages([])} style={styles.selectionIconButton}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={[styles.selectionCount, { color: colors.textPrimary }]}>
                            {selectedMessages.length} Terpilih
                        </Text>
                        <View style={{ flexDirection: 'row' }}>
                            {canEdit && (
                                <TouchableOpacity onPress={initiateEdit} style={styles.selectionIconButton}>
                                    <Ionicons name="pencil" size={24} color={colors.primary} />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={confirmDelete} style={styles.selectionIconButton}>
                                <Ionicons name="trash" size={24} color={colors.danger} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <CustomHeader
                        title={decodeURIComponent(otherName || 'Chat')}
                        showAvatar={true}
                        avatarUrl={otherAvatar ? decodeURIComponent(otherAvatar) : null}
                        onBack={() => router.back()}
                        showBack={true}
                        colors={colors}
                    />
                )}

                {otherIsTyping && (
                    <View style={[styles.typingContainer, { backgroundColor: colors.surfaceSubtle }]}>
                        <Text style={[styles.typingText, { color: colors.primary }]}>
                            {decodeURIComponent(otherName || 'User')} sedang mengetik...
                        </Text>
                    </View>
                )}

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    inverted
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                />

                <View style={[
                    styles.inputContainer,
                    {
                        backgroundColor: colors.surface,
                        borderTopColor: colors.border,
                        paddingBottom: Platform.OS === 'ios' ? 24 : 12
                    }
                ]}>
                    <View style={styles.attachmentIcons}>
                        <TouchableOpacity style={styles.iconButton} onPress={handleCapturePhoto} disabled={isUploading}>
                            <Ionicons name="camera" size={24} color={isUploading ? colors.textSecondary : colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={() => setShowAttachMenu(!showAttachMenu)} disabled={isUploading}>
                            <Ionicons name="attach" size={24} color={isUploading ? colors.textSecondary : colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {showAttachMenu && (
                        <View style={[styles.attachMenuContainer, { backgroundColor: colors.surfaceSubtle, shadowColor: colors.textPrimary }]}>
                            <TouchableOpacity style={styles.attachMenuItem} onPress={handlePickImage}>
                                <View style={[styles.attachMenuIcon, { backgroundColor: '#E1BEE7' }]}>
                                    <Ionicons name="image" size={24} color="#8E24AA" />
                                </View>
                                <Text style={[styles.attachMenuText, { color: colors.textPrimary }]}>Galeri</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.attachMenuItem} onPress={handlePickDocument}>
                                <View style={[styles.attachMenuIcon, { backgroundColor: '#BBDEFB' }]}>
                                    <Ionicons name="document-text" size={24} color="#1976D2" />
                                </View>
                                <Text style={[styles.attachMenuText, { color: colors.textPrimary }]}>Dokumen</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.inputWrapper}>
                        {editingMessage && (
                            <View style={[styles.editingHighlight, { backgroundColor: colors.primary + '20' }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, color: colors.primary, fontWeight: 'bold' }}>Mengedit Pesan</Text>
                                    <Text style={{ fontSize: 12, color: colors.textSecondary }} numberOfLines={1}>{editingMessage.message}</Text>
                                </View>
                                <TouchableOpacity onPress={() => { setEditingMessage(null); setInputText(''); }}>
                                    <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        )}
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    color: colors.textPrimary,
                                    backgroundColor: colors.surfaceSubtle,
                                    borderColor: colors.border,
                                    borderTopLeftRadius: editingMessage ? 0 : 20,
                                    borderTopRightRadius: editingMessage ? 0 : 20,
                                }
                            ]}
                            placeholder={editingMessage ? "Edit pesan..." : "Ketik pesan..."}
                            placeholderTextColor={colors.textSecondary}
                            value={inputText}
                            onChangeText={handleTextChange}
                            multiline
                            maxLength={500}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.sendButton, {
                            backgroundColor: inputText.trim() ? colors.primary : colors.surfaceSubtle
                        }]}
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                    >
                        <Ionicons
                            name="send"
                            size={20}
                            color={inputText.trim() ? colors.textWhite : colors.textSecondary}
                            style={{ marginLeft: 4 }}
                        />
                    </TouchableOpacity>
                </View>

                <CustomAlertModal
                    visible={showDeleteModal}
                    title="Hapus Pesan"
                    message="Pilih metode penghapusan pesan"
                    type="warning"
                    buttons={[
                        { text: "Batal", style: 'cancel', onPress: () => setShowDeleteModal(false) },
                        {
                            text: "Hapus Untuk Saya",
                            style: 'destructive',
                            onPress: () => {
                                setShowDeleteModal(false);
                                executeDelete('me');
                            }
                        },
                        ...(!selectedMessages.some(m => m.sender_id !== user?.id) ? [{
                            text: "Hapus Semua",
                            style: 'destructive' as const,
                            onPress: () => {
                                setShowDeleteModal(false);
                                executeDelete('everyone');
                            }
                        }] : [])
                    ]}
                    onClose={() => setShowDeleteModal(false)}
                />

                <CustomAlertModal
                    visible={alertVisible}
                    title="Informasi"
                    message="Fitur kirim gambar/dokumen masih dalam tahap pengembangan."
                    type="info"
                    buttons={[{ text: 'Mengerti', onPress: () => setAlertVisible(false) }]}
                    onClose={() => setAlertVisible(false)}
                />

                <Modal visible={!!selectedImage} transparent={true} animationType="fade" onRequestClose={() => setSelectedImage(null)}>
                    <View style={styles.modalBackground}>
                        <TouchableOpacity style={styles.closeModalButton} onPress={() => setSelectedImage(null)}>
                            <Ionicons name="close" size={32} color="#FFFFFF" />
                        </TouchableOpacity>
                        {selectedImage && (
                            <TouchableWithoutFeedback onPress={() => setSelectedImage(null)}>
                                <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
                            </TouchableWithoutFeedback>
                        )}
                    </View>
                </Modal>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    typingContainer: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(0,0,0,0.05)'
    },
    typingText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    keyboardAvoid: {
        flex: 1,
    },
    listContent: {
        paddingVertical: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        alignItems: 'flex-end',
    },
    attachmentIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
        marginBottom: Platform.OS === 'android' ? 6 : 4,
    },
    iconButton: {
        padding: 6,
    },
    input: {
        minHeight: 40,
        maxHeight: 120,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        borderWidth: StyleSheet.hairlineWidth,
        fontSize: 15,
        borderRadius: 20
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        marginBottom: Platform.OS === 'android' ? 3 : 0,
    },
    selectionHeader: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    selectionIconButton: {
        padding: 8,
    },
    selectionCount: {
        flex: 1,
        marginLeft: 8,
        fontSize: 18,
        fontWeight: 'bold',
    },
    inputWrapper: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    editingHighlight: {
        flexDirection: 'row',
        padding: 8,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        alignItems: 'center',
    },
    attachMenuContainer: {
        position: 'absolute',
        bottom: 70,
        left: 10,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        gap: 20,
        elevation: 4,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 50,
    },
    attachMenuItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    attachMenuIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    attachMenuText: {
        fontSize: 12,
        fontWeight: '500',
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeModalButton: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 10,
        padding: 8,
    },
    fullScreenImage: {
        width: '100%',
        height: '100%',
    }
});
