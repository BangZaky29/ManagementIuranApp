import { StyleSheet, Platform, Dimensions } from 'react-native';
import { ThemeColors } from '../../theme/AppTheme';

const { width } = Dimensions.get('window');

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background }, // Light blue-gray for security

    // Header
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 16,
        backgroundColor: colors.surface,
        borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    greeting: { fontSize: 13, color: colors.textSecondary },
    userName: { fontSize: 20, fontWeight: '700', color: colors.primary }, // Security Blue
    profileBtn: {
        width: 44, height: 44, borderRadius: 22,
        overflow: 'hidden', backgroundColor: colors.primarySubtle,
        justifyContent: 'center', alignItems: 'center',
        padding: 0,
    },
    profileAvatar: { width: '100%', height: '100%', borderRadius: 22 },

    // Stats
    statsRow: {
        flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 16,
    },
    statCard: {
        flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 12,
        alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
            android: { elevation: 2 },
        }),
        borderWidth: 1, borderColor: colors.border,
    },
    statNumber: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary },
    statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2, fontWeight: '500' },

    // Panic Banner
    panicBanner: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: colors.danger, marginHorizontal: 16, marginTop: 16,
        padding: 16, borderRadius: 20,
        ...Platform.select({
            ios: { shadowColor: colors.danger, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12 },
            android: { elevation: 8 },
        }),
    },
    panicBannerLeft: { flexDirection: 'row', alignItems: 'center' },
    panicBannerTitle: { fontSize: 15, fontWeight: 'bold', color: colors.textWhite },
    panicBannerSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

    // Sections
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12,
    },
    sectionTitle: { fontSize: 17, fontWeight: 'bold', color: colors.textPrimary },
    seeAll: { fontSize: 13, fontWeight: '600', color: colors.primary },

    // Quick Actions
    quickActionsRow: {
        flexDirection: 'row', gap: 12, paddingHorizontal: 16,
    },
    quickAction: {
        flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 14,
        alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
            android: { elevation: 2 },
        }),
        borderWidth: 1, borderColor: colors.border,
    },
    quickIcon: {
        width: 50, height: 50, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    },
    quickLabel: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
    badge: {
        position: 'absolute', top: -4, right: -4,
        backgroundColor: colors.danger, borderRadius: 10,
        minWidth: 18, height: 18,
        justifyContent: 'center', alignItems: 'center',
    },
    badgeText: { color: colors.textWhite, fontSize: 10, fontWeight: 'bold' },
    badgeYellow: {
        backgroundColor: colors.warning,
    },
    badgeTextBlack: {
        color: '#000', fontSize: 10, fontWeight: 'bold'
    },

    // Activity Cards (Ringkasan Aktivitas)
    activityCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: colors.surface, marginHorizontal: 16, marginBottom: 8,
        padding: 12, borderRadius: 14, borderLeftWidth: 3, borderLeftColor: colors.danger,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
            android: { elevation: 2 },
        }),
    },
    activityLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    activityAvatar: { width: 36, height: 36, borderRadius: 18 },
    avatarPlaceholder: { backgroundColor: colors.dangerBg, justifyContent: 'center', alignItems: 'center' },
    activityName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
    activityLocation: { fontSize: 11, marginLeft: 3 },
    activityRight: { alignItems: 'flex-end', marginLeft: 8 },
    activityTime: { fontSize: 11, color: colors.textSecondary },

    // Empty State
    emptyActivity: {
        alignItems: 'center', paddingVertical: 30, marginHorizontal: 16,
        backgroundColor: colors.surface, borderRadius: 14,
    },
    emptyText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginTop: 12 },
    emptySubtext: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
    statusDot: {
        width: 8, height: 8, borderRadius: 4,
    },
    activityIconBox: {
        width: 36, height: 36, borderRadius: 18,
        justifyContent: 'center', alignItems: 'center',
    },
    activityDesc: {
        fontSize: 11, color: colors.textSecondary, marginTop: 2,
    },
});
