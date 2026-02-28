import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { formatDateTimeSafe } from '../utils/dateUtils';
import { PanicLog } from '../services/panicService';

interface PanicLogCardProps {
    log: PanicLog;
    onResolve?: (log: PanicLog) => void;
    showResolveButton?: boolean;
}

export const PanicLogCard: React.FC<PanicLogCardProps> = ({ log, onResolve, showResolveButton = true }) => {
    const isResolved = !!log.resolved_at;
    const hasLocation = log.location && log.location.startsWith('http');

    const formatTime = (dateString: string) => {
        const d = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return 'Baru saja';
        if (minutes < 60) return `${minutes} menit lalu`;
        if (hours < 24) return `${hours} jam lalu`;
        return formatDateTimeSafe(d);
    };

    const openMaps = () => {
        if (hasLocation) {
            Linking.openURL(log.location!).catch(err => console.error("Couldn't load page", err));
        }
    };

    return (
        <View style={[
            styles.card,
            { borderLeftColor: isResolved ? '#4CAF50' : '#F44336' }
        ]}>
            {/* Header Area */}
            <View style={styles.header}>
                <View style={styles.userContainer}>
                    {log.profiles?.avatar_url ? (
                        <Image source={{ uri: log.profiles.avatar_url }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Ionicons name="person" size={20} color="#F44336" />
                        </View>
                    )}
                    <View style={styles.nameContainer}>
                        <Text style={styles.userName}>{log.profiles?.full_name || 'Warga Anonim'}</Text>
                        <Text style={styles.userAddress}>
                            RT/RW: {log.profiles?.rt_rw || '-'}
                        </Text>
                    </View>
                </View>
                <View style={styles.statusContainer}>
                    <View style={[styles.badge, { backgroundColor: isResolved ? '#E8F5E9' : '#FFEBEE' }]}>
                        {!isResolved && <View style={styles.pulseDot} />}
                        <Text style={[styles.badgeText, { color: isResolved ? '#2E7D32' : '#C62828' }]}>
                            {isResolved ? 'SELESAI' : 'AKTIF'}
                        </Text>
                    </View>
                    <Text style={styles.timeText}>{formatTime(log.created_at)}</Text>
                </View>
            </View>

            {/* Info Content */}
            <View style={styles.content}>
                <TouchableOpacity
                    style={[styles.locationBox, hasLocation && styles.locationBoxActive]}
                    onPress={openMaps}
                    disabled={!hasLocation}
                >
                    <View style={styles.locationIconBox}>
                        <Ionicons name="location" size={18} color={hasLocation ? '#1976D2' : '#999'} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.locationTitle, { color: hasLocation ? '#1976D2' : '#666' }]}>
                            {hasLocation ? 'Lokasi GPS Terdeteksi' : 'Lokasi Tidak Tersedia'}
                        </Text>
                        <Text style={styles.locationSubtitle} numberOfLines={1}>
                            {hasLocation ? 'Ketuk untuk buka di Google Maps' : 'Koordinat tidak dikirim oleh perangkat'}
                        </Text>
                    </View>
                    {hasLocation && <Ionicons name="chevron-forward" size={16} color="#1976D2" />}
                </TouchableOpacity>
            </View>

            {/* Actions */}
            {!isResolved && showResolveButton && (
                <TouchableOpacity
                    style={styles.resolveButton}
                    onPress={() => onResolve?.(log)}
                >
                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                    <Text style={styles.resolveButtonText}>Tandai Selesai ditangani</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 5,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
            android: { elevation: 4 },
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F5F5F5',
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
    },
    nameContainer: {
        marginLeft: 12,
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    userAddress: {
        fontSize: 12,
        color: '#777',
        marginTop: 2,
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        marginBottom: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#F44336',
        marginRight: 6,
    },
    timeText: {
        fontSize: 11,
        color: '#999',
    },
    content: {
        marginTop: 16,
    },
    locationBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    locationBoxActive: {
        backgroundColor: '#E3F2FD',
        borderColor: '#BBDEFB',
    },
    locationIconBox: {
        marginRight: 12,
    },
    locationTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    locationSubtitle: {
        fontSize: 11,
        color: '#888',
        marginTop: 2,
    },
    resolveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2E7D32',
        padding: 14,
        borderRadius: 12,
        marginTop: 16,
        gap: 8,
    },
    resolveButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
});
