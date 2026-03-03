import React, { useEffect, useRef } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Animated,
    Dimensions, Platform, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.75;

interface MenuItem {
    key: string;
    label: string;
    icon: string;
    route: string;
    badge?: number;
}

interface AdminSidebarProps {
    visible: boolean;
    onClose: () => void;
    pendingPayments?: number;
    pendingReports?: number;
    processingReports?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
    visible, onClose, pendingPayments = 0,
    pendingReports = 0, processingReports = 0,
}) => {
    const router = useRouter();
    const { user, profile, signOut } = useAuth();
    const { colors } = useTheme();
    const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 200,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateX, {
                    toValue: -SIDEBAR_WIDTH,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const menuItems: MenuItem[] = [
        { key: 'users', label: 'Kelola User', icon: 'people-outline', route: '/admin/users' },
        { key: 'news', label: 'Kelola Berita', icon: 'newspaper-outline', route: '/admin/news-management' },
        { key: 'banners', label: 'Kelola Iklan', icon: 'images-outline', route: '/admin/banners' },
        { key: 'laporan', label: 'Laporan Warga', icon: 'document-text-outline', route: '/admin/laporan' },
        { key: 'iuran', label: 'Management Iuran', icon: 'wallet-outline', route: '/admin/iuran-management' },
    ];

    const handleNavigation = (route: string) => {
        onClose();
        setTimeout(() => {
            router.push(route as any);
        }, 250);
    };

    const handleLogout = async () => {
        onClose();
        await signOut();
        router.replace('/login');
    };

    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            {/* Backdrop */}
            <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFillObject}
                    activeOpacity={1}
                    onPress={onClose}
                />
            </Animated.View>

            {/* Sidebar */}
            {/* Sidebar */}
            <Animated.View style={[styles.sidebar, { transform: [{ translateX }] }]}>
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    <View style={styles.avatarContainer}>
                        {profile?.avatar_url ? (
                            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Ionicons name="person" size={28} color="#FFF" />
                            </View>
                        )}
                    </View>
                    <Text style={styles.profileName} numberOfLines={1}>
                        {user?.user_metadata?.full_name || profile?.full_name || 'Admin'}
                    </Text>
                    <Text style={styles.profileRole}>Administrator</Text>
                </View>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.key}
                            style={styles.menuItem}
                            onPress={() => handleNavigation(item.route)}
                            activeOpacity={0.6}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name={item.icon as any} size={22} color="#1B5E20" />
                            </View>
                            <Text style={styles.menuLabel}>{item.label}</Text>

                            {item.key === 'laporan' && (
                                <View style={{ flexDirection: 'row', gap: 4, marginLeft: 8 }}>
                                    {pendingReports > 0 && (
                                        <View style={[styles.menuBadge, { backgroundColor: colors.status.menunggu.bg }]}>
                                            <Text style={[styles.menuBadgeText, { color: colors.status.menunggu.text }]}>{pendingReports}</Text>
                                        </View>
                                    )}
                                    {processingReports > 0 && (
                                        <View style={[styles.menuBadge, { backgroundColor: colors.status.diproses.bg }]}>
                                            <Text style={[styles.menuBadgeText, { color: colors.status.diproses.text }]}>{processingReports}</Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {item.key === 'iuran' && pendingPayments > 0 && (
                                <View style={[styles.menuBadge, { backgroundColor: colors.status.pending.bg }]}>
                                    <Text style={[styles.menuBadgeText, { color: colors.status.pending.text }]}>{pendingPayments}</Text>
                                </View>
                            )}
                            <Ionicons name="chevron-forward" size={18} color="#999" style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Bottom: Logout */}
                <View style={styles.bottomSection}>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={22} color="#C62828" />
                        <Text style={styles.logoutText}>Keluar</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: -100,
        zIndex: 99999,
        elevation: 99999,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sidebar: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: SIDEBAR_WIDTH,
        backgroundColor: '#FFF',
        paddingTop: Platform.OS === 'android' ? 48 : 60,
        borderTopRightRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 20,
    },
    profileSection: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 0,
        right: 24,
        padding: 6,
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
        zIndex: 10,
    },
    avatarContainer: {
        marginBottom: 12,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    avatarPlaceholder: {
        backgroundColor: '#2E7D32',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1B5E20',
    },
    profileRole: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    menuSection: {
        paddingTop: 12,
        flex: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    menuLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    menuBadge: {
        backgroundColor: '#F44336',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        paddingHorizontal: 6,
    },
    menuBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    bottomSection: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 12,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#C62828',
    },
});
