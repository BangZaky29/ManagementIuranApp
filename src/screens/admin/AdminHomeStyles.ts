import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7F5' },

    // Header
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 16,
        paddingTop: Platform.OS === 'android' ? 48 : 16,
        backgroundColor: '#FFF',
    },
    greeting: { fontSize: 14, color: '#666' },
    userName: { fontSize: 22, fontWeight: 'bold', color: '#1B5E20' },
    logoutBtn: { padding: 10, backgroundColor: '#FFEBEE', borderRadius: 12 },

    // Stats
    statsRow: {
        flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 16,
    },
    statCard: {
        flex: 1, backgroundColor: '#FFF', borderRadius: 14, padding: 14,
        borderLeftWidth: 3, alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
            android: { elevation: 2 },
        }),
    },
    statNumber: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    statLabel: { fontSize: 11, color: '#888', marginTop: 2, fontWeight: '500' },

    // Panic Banner
    panicBanner: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#F44336', marginHorizontal: 16, marginTop: 16,
        padding: 16, borderRadius: 14,
    },
    panicBannerLeft: { flexDirection: 'row', alignItems: 'center' },
    panicBannerTitle: { fontSize: 15, fontWeight: 'bold', color: '#FFF' },
    panicBannerSubtitle: { fontSize: 11, color: '#FFCDD2', marginTop: 2 },

    // Sections
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12,
    },
    sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },
    seeAll: { fontSize: 13, fontWeight: '600', color: '#1B5E20' },

    // Quick Actions
    quickActionsRow: {
        flexDirection: 'row', gap: 12, paddingHorizontal: 16,
    },
    quickAction: {
        flex: 1, backgroundColor: '#FFF', borderRadius: 14, padding: 16,
        alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
            android: { elevation: 2 },
        }),
    },
    quickIcon: {
        width: 50, height: 50, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    },
    quickLabel: { fontSize: 13, fontWeight: '600', color: '#333' },
    badge: {
        position: 'absolute', top: -4, right: -4,
        backgroundColor: '#F44336', borderRadius: 10,
        minWidth: 18, height: 18,
        justifyContent: 'center', alignItems: 'center',
    },
    badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

    // Activity Cards
    activityCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#FFF', marginHorizontal: 16, marginBottom: 8,
        padding: 14, borderRadius: 14, borderLeftWidth: 3, borderLeftColor: '#F44336',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
            android: { elevation: 1 },
        }),
    },
    activityLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    activityAvatar: { width: 36, height: 36, borderRadius: 18 },
    avatarPlaceholder: { backgroundColor: '#FFCDD2', justifyContent: 'center', alignItems: 'center' },
    activityName: { fontSize: 14, fontWeight: '600', color: '#333' },
    activityLocation: { fontSize: 11, marginLeft: 3 },
    activityRight: { alignItems: 'flex-end', marginLeft: 8 },
    activityTime: { fontSize: 11, color: '#999' },

    // Empty State
    emptyActivity: {
        alignItems: 'center', paddingVertical: 30, marginHorizontal: 16,
        backgroundColor: '#FFF', borderRadius: 14,
    },
    emptyText: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 12 },
    emptySubtext: { fontSize: 12, color: '#999', marginTop: 4 },
});
