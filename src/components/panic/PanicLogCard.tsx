import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { PanicLog } from '../../services/panic';
import { useTheme } from '../../contexts/ThemeContext';

interface PanicLogCardProps {
    log: PanicLog;
    onResolve?: (log: PanicLog) => void;
    showResolveButton?: boolean;
}

export const PanicLogCard: React.FC<PanicLogCardProps> = ({ log, onResolve, showResolveButton = true }) => {
    const { colors } = useTheme();
    const isResolved = !!log.resolved_at;
    const hasLocation = log.location && log.location.startsWith('http');

    const formatTime = (dateString: string) => {
        const d = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return 'Baru saja';
        if (minutes < 60) return `${minutes}m lalu`;
        if (hours < 24) return `${hours}j lalu`;
        return d.toLocaleDateString();
    };

    const openMaps = () => {
        if (hasLocation) {
            Linking.openURL(log.location!).catch(err => console.error("Couldn't load page", err));
        }
    };

    const accentColor = isResolved ? colors.status.selesai.text : colors.status.ditolak.text;

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.card, { borderLeftColor: accentColor }]}
            onPress={openMaps}
            disabled={!hasLocation}
        >
            <View style={styles.cardLeft}>
                <View style={styles.avatarWrapper}>
                    {log.profiles?.avatar_url ? (
                        <Image source={{ uri: log.profiles.avatar_url }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: isResolved ? colors.status.selesai.bg : colors.status.ditolak.bg }]}>
                            <Ionicons name="person" size={16} color={accentColor} />
                        </View>
                    )}
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <Text style={styles.userName} numberOfLines={1}>
                            {log.profiles?.full_name || 'Warga Anonim'}
                        </Text>
                        <View style={[styles.statusDot, { backgroundColor: accentColor }]} />
                    </View>

                    <Text style={styles.description} numberOfLines={1}>
                        {hasLocation ? '🚨 Darurat! Ketuk cek lokasi' : '🚨 Darurat! Lokasi tdk tersedia'}
                    </Text>

                    <View style={styles.footerRow}>
                        <Text style={styles.timeText}>{formatTime(log.created_at)}</Text>
                        {log.profiles?.rt_rw && (
                            <Text style={styles.dotSeparator}> • </Text>
                        )}
                        <Text style={styles.addressText}>{log.profiles?.rt_rw || ''}</Text>
                    </View>
                </View>
            </View>

            {showResolveButton && !isResolved && (
                <TouchableOpacity
                    style={[styles.resolveBtnSmall, { backgroundColor: colors.status.selesai.bg }]}
                    onPress={() => onResolve?.(log)}
                >
                    <Ionicons name="checkmark" size={16} color={colors.status.selesai.text} />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginBottom: 8,
        padding: 12,
        borderRadius: 14,
        borderLeftWidth: 3,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
            android: { elevation: 2 },
        }),
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarWrapper: {
        marginRight: 10,
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#F5F5F5',
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
    description: {
        fontSize: 12,
        color: '#666',
        marginTop: 1,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    timeText: {
        fontSize: 11,
        color: '#999',
    },
    dotSeparator: {
        fontSize: 11,
        color: '#999',
    },
    addressText: {
        fontSize: 11,
        color: '#999',
    },
    resolveBtnSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
});
