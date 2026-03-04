import { StyleSheet, Platform } from 'react-native';
import { ThemeColors } from '../../../../src/theme/AppTheme'; // Fixing import path slightly if needed, assuming the correct typing

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background }, // Softer modern background

    // Header
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 12 : 24, paddingBottom: 20,
        backgroundColor: colors.surface,
        borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    greeting: { fontSize: 13, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
    userName: { fontSize: 24, fontWeight: '800', color: colors.primary, marginTop: 2 },
    menuBtn: {
        padding: 10,
        backgroundColor: colors.primarySubtle,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.primary + '20',
    },

    // Stats Grid
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    statCard: {
        width: '48%',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 15,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
            android: { elevation: 2 },
        }),
    },
    statIconContainer: {
        width: 32, height: 32, borderRadius: 8,
        justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    },
    statNumber: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
    statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4, fontWeight: '500' },

    // Alert Banners (Action Needed)
    bannerContainer: {
        paddingHorizontal: 20, marginTop: 20, gap: 10,
    },
    actionBanner: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16, borderRadius: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6 },
            android: { elevation: 3 },
        }),
    },
    actionBannerLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
    actionIconBox: {
        width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2,
    },
    actionBannerTitle: { fontSize: 15, fontWeight: '700', color: '#FFF' },
    actionBannerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4, lineHeight: 16, paddingRight: 10 },

    // Sections
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 32, paddingBottom: 16,
    },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
    seeAll: { fontSize: 13, fontWeight: '600', color: colors.primary },

    // Premium Activity Cards (Log Aktifitas)
    activityCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.surface, marginHorizontal: 20, marginBottom: 12,
        padding: 16, borderRadius: 16,
        borderWidth: 1, borderColor: colors.border,
    },
    activityIconBox: {
        width: 46, height: 46, borderRadius: 23,
        justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    activityContent: { flex: 1 },
    activityHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
    activityTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, flex: 1, marginRight: 8 },
    activityTime: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },
    activityDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
    activityUserRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    activityAvatar: { width: 16, height: 16, borderRadius: 8, marginRight: 6, backgroundColor: colors.border },
    activityUserName: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },

    // Empty State
    emptyActivity: {
        alignItems: 'center', paddingVertical: 40, marginHorizontal: 20,
        backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
        borderStyle: 'dashed',
    },
    emptyText: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginTop: 16 },
    emptySubtext: { fontSize: 13, color: colors.textSecondary, marginTop: 6, textAlign: 'center', paddingHorizontal: 20 },
});
