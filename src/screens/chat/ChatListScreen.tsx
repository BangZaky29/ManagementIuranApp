import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme as useAppTheme, useSecurityTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { CustomHeader } from '../../components/common/CustomHeader';
import { ChatSessionCard } from '../../components/chat/ChatSessionCard';
import { fetchChatSessions, subscribeToChatSessions, ChatSession } from '../../services/chat/chatService';

export default function ChatListScreen() {
    const router = useRouter();
    const { user, profile } = useAuth();
    const isSecurity = profile?.role === 'security';
    const appTheme = useAppTheme();
    const securityTheme = useSecurityTheme();
    const { colors, isDark } = isSecurity ? securityTheme : appTheme;

    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            loadSessions();
            const subscription = subscribeToChatSessions(user.id, () => {
                loadSessions(); // Reload on any changes
            });
            return () => {
                subscription.unsubscribe();
            };
        }
    }, [user?.id]);

    const loadSessions = async () => {
        if (!user?.id) return;
        try {
            const data = await fetchChatSessions(user.id);
            setSessions(data || []);
        } catch (error) {
            console.error('Error loading sessions', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: ChatSession }) => {
        // Determine the other participant
        const isParticipant1 = item.participant1_id === user?.id;
        const otherUser = isParticipant1 ? item.participant2 : item.participant1;

        // Formatting date
        const date = new Date(item.updated_at);
        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <ChatSessionCard
                name={otherUser?.full_name || 'User'}
                avatarUrl={otherUser?.avatar_url}
                lastMessage={item.last_message}
                time={timeString}
                colors={colors}
                onPress={() => router.push(`/chat/${item.id}?otherName=${encodeURIComponent(otherUser?.full_name || 'User')}&otherId=${otherUser?.id}&otherAvatar=${encodeURIComponent(otherUser?.avatar_url || '')}` as any)}
                isUnread={item.unread_count ? item.unread_count > 0 : false}
                unreadCount={item.unread_count} // Optional, but helps UI
            />
        );
    };

    return (
        <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
            <CustomHeader
                title="Pesan"
                onBack={() => router.back()}
                showBack={true}
                colors={colors}
            />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : sessions.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Belum ada pesan.</Text>
                </View>
            ) : (
                <FlatList
                    data={sessions}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                />
            )}

            {/* FAB to start new chat based on role */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/chat/new' as any)}
                activeOpacity={0.8}
            >
                <Ionicons name="chatbubble-ellipses" size={24} color={colors.textWhite} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    },
    listContainer: {
        paddingBottom: 80,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    }
});
