import { StyleSheet, Platform } from 'react-native';
import { ThemeColors } from '../../../theme/AppTheme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    // Header Area
    header: {
        backgroundColor: colors.surface, paddingHorizontal: 20, paddingBottom: 16,
        paddingTop: Platform.OS === 'android' ? 48 : 16,
        borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginTop: 8 },
    subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
    addButton: {
        backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6,
        marginBottom: 8
    },
    addButtonText: { color: colors.textWhite, fontWeight: 'bold', fontSize: 13 },

    // List
    listContainer: { padding: 16, paddingBottom: 100 },

    // Card
    card: {
        backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12,
        borderLeftWidth: 4, borderLeftColor: colors.primary,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
            android: { elevation: 2 },
        }),
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    guestName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    guestTypeBadge: {
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 4, alignSelf: 'flex-start'
    },
    guestTypeText: { fontSize: 11, fontWeight: 'bold', color: colors.textWhite, textTransform: 'uppercase' },

    pinContainer: {
        alignItems: 'center', backgroundColor: colors.primarySubtle, paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 12, borderWidth: 1, borderColor: colors.primary
    },
    pinLabel: { fontSize: 10, color: colors.primary, fontWeight: 'bold', marginBottom: 2 },
    pinValue: { fontSize: 18, color: colors.primary, fontWeight: '900', letterSpacing: 2 },

    detailsRow: { flexDirection: 'row', marginTop: 16, backgroundColor: colors.surfaceSubtle, padding: 12, borderRadius: 12 },
    detailCol: { flex: 1 },
    detailLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 2 },
    detailValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },

    timelineRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
    timelineItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    timelineText: { fontSize: 11, color: colors.textSecondary },

    // Empty State
    emptyContainer: { alignItems: 'center', paddingTop: 60 },
    emptyTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginTop: 16 },
    emptySubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },

    // Modal
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        maxHeight: '90%',
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 20 },

    inputGroup: { marginBottom: 16 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
    input: {
        backgroundColor: colors.surfaceSubtle, borderRadius: 12, padding: 14,
        fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border
    },

    typeSelector: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    typeBtn: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: colors.surfaceSubtle, borderWidth: 1, borderColor: colors.border
    },
    typeBtnActive: { backgroundColor: colors.primarySubtle, borderColor: colors.primary },
    typeText: { fontSize: 13, color: colors.textSecondary, textTransform: 'capitalize' },
    typeTextActive: { color: colors.primary, fontWeight: 'bold' },

    submitBtn: {
        backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12,
        alignItems: 'center', marginTop: 8
    },
    submitBtnText: { color: colors.textWhite, fontSize: 16, fontWeight: 'bold' },
    cancelBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
    cancelBtnText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' }
});
