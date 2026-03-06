import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
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
import { fetchChatMessages, sendMessage, uploadChatAttachment, subscribeToChatRoom, sendTypingStatus, markMessagesAsRead, ChatMessage } from '../../services/chat/chatService';

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

    const loadMessages = async () => {
        if (!sessionId) return;
        try {
            const data = await fetchChatMessages(sessionId);
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

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            handleUploadAttachment(result.assets[0].uri, 'image/jpeg', 'jpg');
        }
    };

    const handlePickDocument = async () => {
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
                message={item.message}
                isOwnMessage={isOwnMessage}
                time={timeString}
                senderName={!isOwnMessage ? decodeURIComponent(otherName || 'User') : undefined}
                status={msgStatus}
                colors={colors}
            />
        );
    };

    return (
        <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
            <CustomHeader
                title={decodeURIComponent(otherName || 'Chat')}
                showAvatar={true}
                avatarUrl={otherAvatar ? decodeURIComponent(otherAvatar) : null}
                onBack={() => router.back()}
                showBack={true}
                colors={colors}
            />

            {otherIsTyping && (
                <View style={[styles.typingContainer, { backgroundColor: colors.surfaceSubtle }]}>
                    <Text style={[styles.typingText, { color: colors.primary }]}>
                        {decodeURIComponent(otherName || 'User')} sedang mengetik...
                    </Text>
                </View>
            )}

            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
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
                        <TouchableOpacity style={styles.iconButton} onPress={handlePickImage} disabled={isUploading}>
                            <Ionicons name="camera-outline" size={24} color={isUploading ? colors.textSecondary : colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={handlePickDocument} disabled={isUploading}>
                            <Ionicons name="document-attach-outline" size={24} color={isUploading ? colors.textSecondary : colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={[styles.input, {
                            color: colors.textPrimary,
                            backgroundColor: colors.surfaceSubtle,
                            borderColor: colors.border
                        }]}
                        placeholder="Ketik pesan..."
                        placeholderTextColor={colors.textSecondary}
                        value={inputText}
                        onChangeText={handleTextChange}
                        multiline
                        maxLength={500}
                    />
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
            </KeyboardAvoidingView>

            <CustomAlertModal
                visible={alertVisible}
                title="Informasi"
                message="Fitur kirim gambar/dokumen masih dalam tahap pengembangan."
                type="info"
                buttons={[{ text: 'Mengerti', onPress: () => setAlertVisible(false) }]}
                onClose={() => setAlertVisible(false)}
            />
        </SafeAreaView>
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
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        borderWidth: StyleSheet.hairlineWidth,
        fontSize: 15,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        marginBottom: Platform.OS === 'android' ? 3 : 0,
    }
});
