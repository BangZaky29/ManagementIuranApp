import React, { useEffect, useState, useRef } from 'react';
import { View, FlatList, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme as useAppTheme, useSecurityTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { CustomHeader } from '../../components/common/CustomHeader';
import { CustomAlertModal } from '../../components/common/CustomAlertModal';
import { ChatBubble } from '../../components/chat/ChatBubble';
import { fetchChatMessages, sendMessage, subscribeToChatMessages, markMessagesAsRead, ChatMessage } from '../../services/chat/chatService';

export default function ChatRoomScreen() {
    const router = useRouter();
    const { id: sessionId, otherName, otherId } = useLocalSearchParams<{ id: string, otherName: string, otherId: string }>();

    const { user, profile } = useAuth();
    const isSecurity = profile?.role === 'security';
    const appTheme = useAppTheme();
    const securityTheme = useSecurityTheme();
    const { colors, isDark } = isSecurity ? securityTheme : appTheme;

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [alertVisible, setAlertVisible] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (sessionId && user?.id) {
            loadMessages();
            markMessagesAsRead(sessionId, user.id);

            const subscription = subscribeToChatMessages(sessionId, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setMessages(prev => [payload.new as ChatMessage, ...prev]);
                    if (payload.new.sender_id !== user.id) {
                        markMessagesAsRead(sessionId, user.id);
                    }
                } else if (payload.eventType === 'UPDATE') {
                    setMessages(prev => prev.map(msg => msg.id === payload.new.id ? payload.new as ChatMessage : msg));
                }
            });

            return () => {
                subscription.unsubscribe();
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

    const handleSend = async () => {
        if (!inputText.trim() || !sessionId || !user?.id) return;

        const textToSend = inputText.trim();
        setInputText('');

        try {
            await sendMessage(sessionId, user.id, textToSend);
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    const handleFeatureNotReady = () => {
        setAlertVisible(true);
    };

    const renderItem = ({ item }: { item: ChatMessage }) => {
        const isOwnMessage = item.sender_id === user?.id;
        const date = new Date(item.created_at);
        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <ChatBubble
                message={item.message}
                isOwnMessage={isOwnMessage}
                time={timeString}
                senderName={!isOwnMessage ? decodeURIComponent(otherName || 'User') : undefined}
                colors={colors}
            />
        );
    };

    return (
        <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
            <CustomHeader
                title={decodeURIComponent(otherName || 'Chat')}
                onBack={() => router.back()}
                showBack={true}
                colors={colors}
            />

            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    inverted
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />

                <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    <View style={styles.attachmentIcons}>
                        <TouchableOpacity style={styles.iconButton} onPress={handleFeatureNotReady}>
                            <Ionicons name="camera-outline" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={handleFeatureNotReady}>
                            <Ionicons name="document-attach-outline" size={24} color={colors.textSecondary} />
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
                        onChangeText={setInputText}
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
