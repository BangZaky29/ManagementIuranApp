import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ThemeColors } from '../../theme/AppTheme';
import { Ionicons } from '@expo/vector-icons';

interface ChatSessionCardProps {
    name: string;
    avatarUrl?: string;
    lastMessage: string | null;
    time: string;
    onPress: () => void;
    colors: ThemeColors;
    isUnread?: boolean;
    unreadCount?: number;
}

export const ChatSessionCard: React.FC<ChatSessionCardProps> = ({
    name, avatarUrl, lastMessage, time, onPress, colors, isUnread, unreadCount
}) => {
    return (
        <TouchableOpacity
            style={[styles.container, { borderBottomColor: colors.border }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.avatarContainer}>
                {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, { backgroundColor: colors.surfaceSubtle, justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="person" size={24} color={colors.textSecondary} />
                    </View>
                )}
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Text style={[styles.nameText, { color: colors.textPrimary }]} numberOfLines={1}>
                        {name}
                    </Text>
                    <Text style={[styles.timeText, { color: isUnread ? colors.primary : colors.textSecondary }]}>
                        {time}
                    </Text>
                </View>
                <View style={styles.messageRow}>
                    <Text
                        style={[styles.lastMessageText, { color: colors.textSecondary, fontWeight: isUnread ? 'bold' : 'normal' }]}
                        numberOfLines={1}
                    >
                        {lastMessage || 'Memulai percakapan...'}
                    </Text>
                    {isUnread && (
                        <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                            {unreadCount && unreadCount > 0 ? (
                                <Text style={styles.unreadBadgeText}>
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </Text>
                            ) : null}
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    avatarContainer: {
        marginRight: 14,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    nameText: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    timeText: {
        fontSize: 12,
    },
    messageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessageText: {
        fontSize: 14,
        flex: 1,
        paddingRight: 8,
    },
    unreadBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    }
});
